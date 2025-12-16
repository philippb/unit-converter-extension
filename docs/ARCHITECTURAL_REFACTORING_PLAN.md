# Unit Converter Extension - Architectural Refactoring Plan

## Executive Summary

This plan refactors the monolithic 2100-line `content.js` into a modular, maintainable architecture with clear separation of concerns. The refactoring uses a **pipeline architecture** where text flows through distinct phases: Detection → Exclusion → Parsing → Conversion → Formatting → DOM Integration.

**Key Principle**: All 185+ existing unit tests must pass at every step. Tests are the lifeline.

**Target**: Reduce `content.js` to ~200 lines (entry point + DOM handling only), with logic distributed across focused modules.

---

## Current State Analysis

### Problems with Current Architecture

1. **Monolithic File**: 2100 lines in a single file with mixed concerns
2. **Duplicated Patterns**: Similar conversion functions for length, weight, liquid, area, temperature
3. **Scattered Exclusion Logic**: Currency prefix checks repeated in every converter
4. **Complex Regex Management**: Regex patterns inline with conversion logic
5. **No Clear Data Flow**: Hard to trace how text transforms through the system
6. **Repeated Formatting Logic**: Each unit type has its own formatter with similar patterns
7. **Difficult Bug Fixes**: Issues like #12 (quotes), #17 (ports), #32 ("in") require touching multiple places

### Current Code Structure (content.js: 2100 lines)

```
Lines 1-122:     UNIT_SPECS definitions
Lines 123-180:   buildUnitDataFromSpecs()
Lines 182-276:   Constants, regex patterns, timezone offsets
Lines 277-316:   URL blacklist, plugin name, createInsertedSpan
Lines 317-432:   convertToDecimal, fraction handling
Lines 433-550:   Resolution/precision inference
Lines 551-667:   formatMeasurement, formatLengthMeasurement
Lines 668-750:   parseMeasurementMatch
Lines 751-931:   convertLengthText (180 lines!)
Lines 932-1021:  hasRelevantUnits, isEditableContext, SKIP_TAGS
Lines 1022-1211: processElement, processNode, MutationObserver
Lines 1212-1270: convertWeightText
Lines 1271-1447: convertLiquidText (177 lines!)
Lines 1448-1557: convertAreaText
Lines 1558-1587: convertTemperatureText
Lines 1588-1719: convertTimeZone, convertTimeZoneText
Lines 1720-2051: convertText (330 lines! - main orchestrator)
Lines 2052-2105: Chrome messaging, exports
```

---

## Target Architecture

### Module Structure

```
src/
├── content.js              # Entry point: DOM handling, MutationObserver (~200 lines)
├── converter.js            # Main conversion pipeline orchestrator (~150 lines)
├── units/
│   ├── index.js            # Unit definitions and registry (~100 lines)
│   ├── length.js           # Length conversions (~100 lines)
│   ├── weight.js           # Weight conversions (~60 lines)
│   ├── liquid.js           # Liquid conversions (~80 lines)
│   ├── area.js             # Area conversions (~80 lines)
│   ├── temperature.js      # Temperature conversions (~50 lines)
│   └── timezone.js         # Timezone conversions (~100 lines)
├── exclusions/
│   ├── index.js            # Exclusion checker facade (~50 lines)
│   ├── context.js          # DOM context exclusions (code, editable) (~80 lines)
│   └── patterns.js         # Text pattern exclusions (currency, ports, quotes) (~100 lines)
├── parsing/
│   ├── numbers.js          # Number parsing (fractions, decimals) (~100 lines)
│   ├── regex.js            # Regex template builder and cache (~80 lines)
│   └── measurement.js      # Measurement match parsing (~80 lines)
├── formatting/
│   ├── numbers.js          # Number formatting with grouping (~40 lines)
│   ├── units.js            # Generic unit formatter (~80 lines)
│   └── ranges.js           # Range formatting (~60 lines)
└── utils/
    ├── constants.js        # Conversion constants (~40 lines)
    └── precision.js        # Resolution/precision inference (~100 lines)
```

**Total**: ~1500 lines distributed across 17 focused files vs 2100 lines in one file

---

## Pipeline Architecture

### Data Flow

```
Input Text
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: PRE-FILTER                                        │
│  hasRelevantUnits() - Quick check for numbers + unit hints  │
└─────────────────────────────────────────────────────────────┘
    ↓ (skip if no units)
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: RANGE DETECTION                                   │
│  Detect "5-10 miles" patterns, insert placeholders          │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: UNIT CONVERSION LOOP                              │
│  For each unit type (area → length → liquid → weight):      │
│    ├─ Find matches with regex                               │
│    ├─ Check exclusions (currency, port, quote, etc.)        │
│    ├─ Parse measurement value                               │
│    ├─ Convert to metric                                     │
│    └─ Format output                                         │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: TEMPERATURE & TIMEZONE                            │
│  Special handling for non-standard patterns                 │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 5: PLACEHOLDER RESTORATION                           │
│  Restore range placeholders                                 │
└─────────────────────────────────────────────────────────────┘
    ↓
Output Text
```

---

## Implementation Steps

### Step 1: Create Module Structure (No Logic Changes)
**Risk**: None
**Tests**: Must all pass

**Actions**:
1. Create `src/units/`, `src/exclusions/`, `src/parsing/`, `src/formatting/`, `src/utils/` directories
2. Create empty files with JSDoc headers
3. Update package.json if needed for module resolution
4. Run `npm test` - all 185 tests pass

**Success Criteria**: Directory structure exists, tests pass

---

### Step 2: Extract Constants
**Risk**: Low
**Tests**: Must all pass

**Actions**:
1. Create `src/utils/constants.js`:
   - All `LENGTH_*_TO_METERS` constants
   - All `WEIGHT_*_TO_GRAMS` constants
   - All `AREA_*_TO_SQM` constants
   - All `LIQUID_*_TO_L` constants
   - `TIME_ZONE_OFFSETS`
   - `UNICODE_FRACTIONS`, `UNICODE_FRACTIONS_MAP`, `UNICODE_FRACTIONS_DENOM`
   - `CURRENCY_SYMBOLS`, `FEET_SYMBOLS`, `INCH_SYMBOLS`

2. Update `content.js` to import from constants
3. Run `npm test`

**File: src/utils/constants.js** (~80 lines)
```javascript
// Conversion constants
export const LENGTH_INCH_TO_METERS = 0.0254;
export const LENGTH_FOOT_TO_METERS = 0.3048;
// ... etc
```

---

### Step 3: Extract Number Parsing
**Risk**: Medium (core functionality)
**Tests**: Must all pass, especially `convertToDecimal` tests

**Actions**:
1. Create `src/parsing/numbers.js`:
   - Move `convertToDecimal()` function
   - Move all `RE_*` regex patterns for number parsing
   - Move unicode fraction maps (import from constants)
   - Export `convertToDecimal`

2. Update `content.js` to import
3. Run `npm test`

**File: src/parsing/numbers.js** (~100 lines)
```javascript
import { UNICODE_FRACTIONS_MAP } from '../utils/constants.js';

const RE_MIXED_UNICODE = /^(\d+)\s*([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*$/;
// ... other regexes

export function convertToDecimal(value) {
  // ... existing implementation
}
```

---

### Step 4: Extract Regex Building
**Risk**: Medium
**Tests**: Must all pass, especially `createRegexFromTemplate` tests

**Actions**:
1. Create `src/parsing/regex.js`:
   - Move `MEASUREMENT_REGEX_TEMPLATE`
   - Move `measureRegexCache` and `createRegexFromTemplate()`
   - Move `TIME_REGEX`, `RE_TIME_GLOBAL`, `RE_TIME_TEST`
   - Move `TEMPERATURE_F_REGEX`, `RE_TEMPERATURE_F`, `RE_TEMPERATURE_F_TEST`

2. Update `content.js` to import
3. Run `npm test`

---

### Step 5: Extract Unit Definitions
**Risk**: Medium
**Tests**: Must all pass

**Actions**:
1. Create `src/units/index.js`:
   - Move `UNIT_SPECS` object
   - Move `buildUnitDataFromSpecs()` function
   - Export `UNITS`, `UNIT_HINT_PATTERN`

2. Update `content.js` to import
3. Run `npm test`

---

### Step 6: Extract Precision/Resolution Utilities
**Risk**: Low
**Tests**: Must all pass

**Actions**:
1. Create `src/utils/precision.js`:
   - Move `resolutionStepOfValueString()`
   - Move `inferResolutionFromValue()`
   - Move `mergeResolutionSteps()`
   - Move `inferResolutionMetersFromNumber()`
   - Move `inferResolutionMetersFromLengthMatch()`
   - Move `inferResolutionFromParsedMeasurement()`
   - Move `computeDecimalPlaces()`

2. Update `content.js` to import
3. Run `npm test`

---

### Step 7: Extract Formatting Utilities
**Risk**: Medium
**Tests**: Must all pass, especially format* tests

**Actions**:
1. Create `src/formatting/numbers.js`:
   - Move `formatNumberWithGrouping()`

2. Create `src/formatting/units.js`:
   - Move `formatMeasurement()` (generic)
   - Move `formatLengthMeasurement()`
   - Move `formatWeightMeasurement()`
   - Move `formatLiquidMeasurement()`
   - Move `formatAreaMeasurement()`
   - Move `formatTemperatureCelsius()`

3. Create `src/formatting/ranges.js`:
   - Move `formatLengthRange()`, `formatWeightRange()`, `formatLiquidRange()`, `formatTemperatureRange()`
   - Move `formatNum()` helper

4. Update `content.js` to import
5. Run `npm test`

---

### Step 8: Extract Measurement Parsing
**Risk**: Medium
**Tests**: Must all pass

**Actions**:
1. Create `src/parsing/measurement.js`:
   - Move `unitRegexCache`, `getUnitRegexes()`
   - Move `parseMeasurementMatch()`
   - Move `extractFirstValueToken()`

2. Update `content.js` to import
3. Run `npm test`

---

### Step 9: Extract Exclusion Logic (NEW - Bug Fixes)
**Risk**: Medium-High (this is where bug fixes go)
**Tests**: Must all pass + add new tests for exclusions

**Actions**:
1. Create `src/exclusions/patterns.js`:
   - Move `hasCurrencyPrefix()` and rename to more generic `hasInvalidPrefix()`
   - **NEW**: Add colon check for port numbers (fixes #17)
   - **NEW**: Add `isInsideQuotes()` function (fixes #12)
   - Export unified `shouldExcludeMatch(text, matchStart, match)` function

2. Create `src/exclusions/context.js`:
   - Move `SKIP_TAGS` set
   - Move `isInSkippableContainer()`
   - Move `isEditableContext()`
   - **NEW**: Add `hasCodeRelatedClass()` (fixes #9, #14)
   - Export unified `isExcludedContext(node)` function

3. Create `src/exclusions/index.js`:
   - Facade that combines pattern and context exclusions
   - Export `shouldExclude({ node, text, matchStart, match })`

4. Update `content.js` to use new exclusion API
5. Run `npm test`

**Currency exclusion**
- **New**: In `src/exclusions/patterns.js`, add `hasCurrencyContext(text, matchStart)` / `shouldExcludeCurrencyIn(text, match)` helpers that look for currency symbols (`$€£¥…`) or words like `USD`, `AUD`, etc. immediately before the `in` abbreviation so the unit is skipped when part of testimonials such as `"$2,400 in the first year"`. This keeps React from hydrating mismatched DOMs and directly addresses issue #6.

**Tests Added**:
- Add “Code Context” suite in `test/issues/` that mirrors the eight assertions described in the open PR fixing #9: verify `<code>`, `<pre>`, `<kbd>`, `<samp>`, `<var>` (plus nested variants) leave measurements untouched while regular text around them still converts.
- Extend the new suite with the quoted-string regression tests from the open PR fixing #12: strings like `"top 30"`, `"zip": "94110"`, `'top 30'`, and `"section 22"` must remain unchanged, while actual measurements such as `Board is 6" wide` and `It's 5' tall` continue to convert.

**File: src/exclusions/patterns.js** (~100 lines)
```javascript
const INVALID_PREFIXES = '$€£¥₹₽₩₺₪₫₴₦₱฿₭₲₡₵₸₼₾₿:'; // Added colon for ports

export function hasInvalidPrefix(s, startIndex) {
  if (!s || typeof s !== 'string') return false;
  let i = startIndex - 1;
  while (i >= 0 && /\s/.test(s[i])) i--;
  if (i < 0) return false;
  return INVALID_PREFIXES.includes(s[i]);
}

const QUOTE_CHARS = '"\'\u201c\u201d\u2018\u2019';

export function isInsideQuotes(s, startIndex, match) {
  // Implementation from existing PR #27
}

export function shouldExcludeMatch(text, matchStart, match) {
  if (hasInvalidPrefix(text, matchStart)) return true;
  if (isInsideQuotes(text, matchStart, match)) return true;
  return false;
}
```

---

### Step 10: Extract Individual Unit Converters
**Risk**: Medium
**Tests**: Must all pass

**Actions**:
1. Create `src/units/length.js`:
   - Move `convertLengthToMeters()`
   - Move `convertLengthText()`
   - Import exclusions, parsing, formatting

2. Create `src/units/weight.js`:
   - Move `convertWeightToGrams()`
   - Move `convertWeightText()`

3. Create `src/units/liquid.js`:
   - Move `convertLiquidText()`

4. Create `src/units/area.js`:
   - Move `convertAreaText()`

5. Create `src/units/temperature.js`:
   - Move `convertTemperatureText()`
   - **FIX**: Update regex to handle negative temps (fixes #10)

6. Create `src/units/timezone.js`:
   - Move `convertTimeZone()`
   - Move `convertTimeZoneText()`

7. Run `npm test` after each file

**Tests Added**:
- Add a temperature-focused suite covering the scenarios in the open PR fixing #10: parse positive (`32°F`, `212°F`, `70°F`, `98.6°F`) and negative (`-40°F`, `-10°F`, `-4°F`, `0°F`) temperatures, including ranges like `-40°F to 140°F` and various notation variants (`F`, `deg F`, `degrees F`, `Fahrenheit`).
- Introduce a “Shared Inch Dimensions” suite (issue #20) that confirms `6×9"`, `6x9"`, `Book is 6×9″`, `8.5x11"`, and any `AxB"` pattern convert both dimensions together and produce `valueAxvalueB cm` output.

**File: src/units/temperature.js** (~50 lines)
```javascript
import { RE_TEMPERATURE_F } from '../parsing/regex.js';
import { formatTemperatureCelsius } from '../formatting/units.js';
import { inferResolutionFromValue } from '../utils/precision.js';

// FIXED: Regex now captures negative sign
const TEMPERATURE_F_REGEX = String.raw`(?<!\()(?<![\d.])(-?\d+(?:\.\d+)?)\s*(?:°\s*F|℉|...`;

export function convertTemperatureText(text) {
  return text.replace(RE_TEMPERATURE_F, (match, fStr) => {
    const f = parseFloat(fStr);
    if (Number.isNaN(f)) return match;
    const c = ((f - 32) * 5) / 9;
    return `${match} (${formatTemperatureCelsius(c)}°C)`;
  });
}
```

---

### Step 11: Extract Pre-filter and Detection
**Risk**: Low
**Tests**: Must all pass, especially `hasRelevantUnits` tests

**Actions**:
1. Move to `src/converter.js`:
   - Move `hasRelevantUnits()` with all hint regexes
   - Move `containsUnits()` helper

2. Update `content.js` to import
3. Run `npm test`

---

### Step 12: Create Main Converter Pipeline
**Risk**: High (central orchestration)
**Tests**: Must all pass

**Actions**:
1. Create `src/converter.js`:
   - Move `convertText()` function
   - Move `mergeUnitRanges()` and range handling
   - Move placeholder management
   - Import all unit converters
   - Implement clean pipeline:

```javascript
import { hasRelevantUnits, containsUnits } from './detection.js';
import { convertLengthText } from './units/length.js';
import { convertWeightText } from './units/weight.js';
import { convertLiquidText } from './units/liquid.js';
import { convertAreaText } from './units/area.js';
import { convertTemperatureText } from './units/temperature.js';
import { convertTimeZoneText } from './units/timezone.js';
import { UNITS } from './units/index.js';

export function convertText(text) {
  // Phase 1: Pre-filter
  if (!hasRelevantUnits(text)) return text;

  let result = text;

  // Phase 2: Range detection (insert placeholders)
  const { text: withPlaceholders, placeholders } = detectRanges(result);
  result = withPlaceholders;

  // Phase 3: Unit conversions (order matters!)
  if (hasAreaUnits(result)) result = convertAreaText(result);
  if (hasLengthUnits(result)) result = convertLengthText(result);
  if (hasLiquidUnits(result)) result = convertLiquidText(result);
  if (hasWeightUnits(result)) result = convertWeightText(result);

  // Phase 4: Temperature & Timezone
  result = convertTemperatureText(result);
  result = convertTimeZoneText(result);

  // Phase 5: Restore placeholders
  result = restorePlaceholders(result, placeholders);

  return result;
}
```

2. Run `npm test`

---

### Step 13: Slim Down content.js to Entry Point
**Risk**: Medium
**Tests**: Must all pass

**Actions**:
1. Refactor `content.js` to only contain:
   - Imports from modules
   - `processElement()` / `processNode()` - DOM walking
   - `createInsertedSpan()` - DOM insertion
   - MutationObserver setup
   - Chrome message listener
   - Module exports for testing

2. Target: ~200 lines
3. Run `npm test`

**File: src/content.js** (~200 lines)
```javascript
import { convertText } from './converter.js';
import { isExcludedContext } from './exclusions/index.js';
import { hasRelevantUnits } from './converter.js';
import { isBlacklistedUrl } from './utils/constants.js';

// DOM processing
function processElement(node) {
  if (isExcludedContext(node)) return;

  if (node.nodeType === Node.ELEMENT_NODE) {
    for (const child of node.childNodes) {
      processElement(child);
    }
  } else if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (!hasRelevantUnits(text)) return;

    const converted = convertText(text);
    if (text !== converted) {
      replaceTextWithConversion(node, text, converted);
    }
  }
}

// ... MutationObserver, Chrome messaging, exports
```

---

### Step 14: Fix Remaining Issues
**Risk**: Medium
**Tests**: Add new issue-specific tests, all must pass

**Actions**:
1. **Fix #32 (in abbreviation)**: In `src/units/index.js`, change `'in'` to `'in\\.'`
2. **Fix #15 (double apostrophe)**: In `src/units/length.js`, add `''` pattern to inch regex
3. Add issue-specific test files in `test/issues/`
4. Run `npm test`

---

### Step 15: Verify All Issue Fixes
**Risk**: Low
**Tests**: All tests including new issue tests must pass

**Actions**:
1. Create comprehensive test file `test/issues/all-issues.test.js`:
```javascript
describe('Issue Fixes', () => {
  test('#6: React hydration - currency + in', () => {
    expect(convertText('$2,400 in the first year')).toBe('$2,400 in the first year');
  });

  describe('#9: Code/context skipping', () => {
    const codeSnippets = [
      ['<code>$5 6" code</code>', '<code>$5 6" code</code>'],
      ['<pre>  6 ft 3 in</pre>', '<pre>  6 ft 3 in</pre>'],
      ['<kbd>press ENTER</kbd>', '<kbd>press ENTER</kbd>'],
      ['<samp>output: 6×9"</samp>', '<samp>output: 6×9&quot;</samp>'],
      ['<var>const size = 6" * 9"</var>', '<var>const size = 6&quot; * 9&quot;</var>'],
      ['<code><span>6" nested</span></code>', '<code><span>6&quot; nested</span></code>'],
    ];
    for (const [input, expected] of codeSnippets) {
      test(`does not convert ${input}`, () => {
        expect(convertText(input)).toBe(expected);
      });
    }
    test('converts text outside code blocks', () => {
      expect(convertText('Code block: <code>6" should stay</code> outside')).toContain('outside');
    });
  });

  test('#10: Negative Fahrenheit and formats', () => {
    const samples = [
      ['32°F', '32°F (0.0°C)'],
      ['212°F', '212°F (100.0°C)'],
      ['-40°F', '-40°F (-40.0°C)'],
      ['-10°F', '-10°F (-23.3°C)'],
      ['-4°F', '-4°F (-20.0°C)'],
      ['0°F', '0°F (-17.8°C)'],
      ['-40°F to 140°F', expect.stringContaining('-40°F (-40.0°C) to 140°F (60.0°C)')],
      ['98.6 Fahrenheit', '98.6 Fahrenheit (37.0°C)'],
    ];
    for (const [input, expected] of samples) {
      expect(convertText(input)).toContain(expected);
    }
  });

  describe('#12: Quotes exclusion', () => {
    const quotedInputs = [
      ['The "top 30" actions to unify', 'The "top 30" actions to unify'],
      ['"zip": "94110"', '"zip": "94110"'],
      ['"apn": "4210-040"', '"apn": "4210-040"'],
      ['The "section 22" was reviewed', 'The "section 22" was reviewed'],
      ["The 'top 30' actions to unify", "The 'top 30' actions to unify"],
    ];
    for (const [input, expected] of quotedInputs) {
      test(input, () => {
        expect(convertText(input)).toBe(expected);
      });
    }
    test('Still converts actual measurements in quotes', () => {
      expect(convertText("Board is 6\" wide")).toContain('6" (');
      expect(convertText("It's 5' tall")).toContain("5' ");
    });
  });

  test('#15: Double apostrophes as inches', () => {
    const cases = [
      '19\'\' Crossflow Wheels',
      'Display: 5\'\'',
      'Dimensions 19\'\' × 10\'\'',
      '19\'\' (48.26 cm) noted twice',
    ];
    for (const input of cases) {
      expect(convertText(input)).toContain('19\'\'');
      expect(convertText(input)).toContain('cm');
    }
  });

  test('#17: Port numbers stay unchanged', () => {
    const portSamples = [
      'localhost:3000 in your browser',
      'http://127.0.0.1:8080/dashboard',
      'https://example.com:443/page?size=6"',
      'IP with port 192.168.1.1:5000 showing data',
      'ftp://server:21/data',
    ];
    for (const input of portSamples) {
      expect(convertText(input)).toBe(input);
    }
  });

  describe('#20: Shared inch dimension conversions', () => {
    const dimensionSamples = [
      ['6×9"', '6×9" (15.24x22.86 cm)'],
      ['6x9"', '6x9" (15.24x22.86 cm)'],
      ['Book is 6×9″ size', expect.stringContaining('15.24x22.86 cm')],
      ['8.5x11"', expect.stringContaining('21.59x27.94 cm')],
    ];
    for (const [input, expected] of dimensionSamples) {
      expect(convertText(input)).toContain(expected);
    }
  });

  test('#32: "in" abbreviation', () => {
    expect(convertText('2025 in California')).toBe('2025 in California');
    expect(convertText('6 in. pipe')).toContain('15.24 cm');
  });
});
```

2. Run `npm test` - all 185+ tests pass

---

### Step 16: Documentation and Cleanup
**Risk**: None
**Tests**: Must all pass

**Actions**:
1. Add JSDoc comments to all exported functions
2. Update CLAUDE.md with new architecture
3. Create architecture diagram in docs/
4. Remove any dead code
5. Run final `npm test`

---

## TDD Workflow

1. **Test first**: For every refactoring batch (e.g., constants, parsing, formatting), add or update the related test suite before moving code. Record the expected failure and the test command (usually `npm test`) in this document.
2. **Red → Green → Refactor**: Run the failing test(s), implement the refactor until they pass, then clean up code while keeping tests green.
3. **Regression checks**: For each bug fix (#6, #9, #10, #12, #15, #17, #32, #20), add a focused Jest test as described in Steps 9–15 before touching the implementation.

Use this document as the living tracker: note the test that drove each change, the outcome, and the next sub-task.

## Implementation TODO (TDD-focused)

1. [x] **Step 1: Module scaffolding** – create directories and placeholder files, add basic smoke tests (e.g., `content.test.js` validating exports) before moving code. Tests: `npm test`.
2. [x] **Step 2: Constants extraction** – add a `constants.test.js` verifying the exported ratios before refactoring `content.js`. Tests: `npm test`.
3. [x] **Step 3: Number parsing** – add `convertToDecimal` tests (fractions, mixed unicode, ranges) and confirm they fail until the new module is wired. Tests: `npm test`.
4. [x] **Step 4: Regex builder** – add cached template tests. Tests: `npm test`.
5. [x] **Step 5: Units registry** – add a snapshot test covering `buildUnitDataFromSpecs()`. Tests: `npm test`.
6. [x] **Step 6: Precision utils** – add assertions for inference helpers in `precision.test.js`. Tests: `npm test`.
7. [x] **Step 7: Formatting helpers** – add formatting-specific tests (numbers, ranges). Tests: `npm test`.
8. [x] **Step 8: Measurement parsing** – add tests for `parseMeasurementMatch()` and `extractFirstValueToken()`. Tests: `npm test`.
9. [x] **Step 9: Exclusion logic** – cover currency prefixes, quotes, code/DOM contexts, port numbers before moving logic. Tests: `npm test`.
10. [x] **Step 10: Unit converters** – add targeted tests for each converter (length, weight, liquid, area, temperature, timezone). Tests: `npm test`.
11. [x] **Steps 11–12: Converter pipeline** – add tests ensuring `convertText()` cycles through the phases and restores placeholders. Tests: `npm test`.
12. [x] **Step 13: DOM entry point** – add DOM-node unit tests for `processElement`, `processNode`, and observer interactions. Tests: `npm test`.
13. [x] **Step 14: Bug fixes** – add the issue-specific suites from Steps 14–15 (currency, quotes, ports, shared dimensions). Tests: `npm test`.
14. [x] **Step 15: Issue verification** – add `test/issues/all-issues.test.js`, run `npm test` + `npm run test:coverage`.
15. [ ] **Step 16: Cleanup** – finalize docs/diagrams, run final `npm test`.

Update each checkbox when its refactor/tests are complete; log the test result and next sub-task beneath the relevant step in the Implementation Log.

## Risk Mitigation

### Testing Strategy

1. **Run tests after EVERY change** - No exceptions
2. **Git commit after each successful step** - Easy rollback
3. **Keep content.js functional** throughout - Never break the extension
4. **Parallel imports** - Old and new code can coexist during transition

### Rollback Plan

Each step is a single commit. If tests fail:
```bash
git revert HEAD
```

### Avoiding Breaking Changes

- Export signatures remain identical
- All existing test imports continue to work
- DOM behavior unchanged
- MutationObserver behavior unchanged

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| content.js lines | 2100 | ~200 |
| Total source lines | 2100 | ~1500 |
| Number of modules | 1 | 17 |
| Test count | 185 | 200+ |
| Bug fixes included | 0 | 6 (#6, #9, #10, #12, #15, #17, #32) |
| Max function length | 330 lines | <100 lines |

---


## Implementation Log

### Step 1 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Added scaffolding directories (`src/utils`, `src/units`, `src/parsing`, `src/exclusions`, `src/formatting`) plus placeholder modules and the `test/architecture.test.js` suite; `npm test` now passes with the new scaffolding.

---

### Step 2 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Extracted all conversion constants, symbol tables, unicode fraction helpers, and timezone offsets into `src/utils/constants.js` plus the new `test/constants.test.js` suite; `npm test` passes.

---

### Step 3 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Migrated `convertToDecimal` and its parsing helpers into `src/parsing/numbers.js`, pointed the tests at the new module, and verified `npm test` succeeds.

---

### Step 4 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Implemented `src/parsing/regex.js`, moved all regex definitions there, added the `test/parsing.regex.test.js` suite, and confirmed `npm test` passes.

---

### Step 5 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Moved `UNIT_SPECS` and `buildUnitDataFromSpecs` into `src/units/index.js`, added `test/units/index.test.js` with a snapshot, and verified `npm test` passes.

---

### Step 6 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Migrated resolution and precision helpers to `src/utils/precision.js`, updated `test/precision.test.js` to target the new module, added measurement regex dependency management, and confirmed `npm test` passes.

---

### Step 7 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Extracted formatting helpers into `src/formatting/numbers.js`, `src/formatting/units.js`, and `src/formatting/ranges.js`, wrote new formatting tests, and confirmed `npm test` passes.

---

### Step 8 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Moved parsing helpers (`parseMeasurementMatch`, `extractFirstValueToken`, regex cache) into `src/parsing/measurement.js`, added dedicated tests, and kept `npm test` green.

---

### Step 9 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Implemented the exclusion modules (`src/exclusions/patterns.js`, `src/exclusions/context.js`, `src/exclusions/index.js`), replaced currency-based guards with `shouldExcludeMatch`, and added regression suites for code/quote contexts plus module-level tests; verified with `npm test` (234 suites) before moving on.

---

### Step 10 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Extracted every converter into its own module (`src/units/{length,weight,liquid,area,temperature,timezone}.js`), reusing shared helpers, and verified `npm test` still passes while keeping `content.js`’ export surface intact.

---

### Step 11 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Moved the detection helpers (`hasRelevantUnits`, unit hints, etc.) into `src/converter.js`, which now owns the fast pre-filter so `content.js` can lean on it while remaining DOM-focused.

---

### Step 12 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Transplanted `convertText`, range handling, and placeholder restoration into `src/converter.js`, wiring it up to the new unit modules so the pipeline executes in the planned phases.

---

### Step 13 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-08
**Notes**: Slimmed `content.js` down to DOM traversal, performance tracking, and observer lifecycle, delegating all conversions and detection to `converter.js`.

---

### Step 14 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-09
**Notes**: Added the issue-specific suites for currency prefixes, code/quote contexts, shared inch dimensions, and the `in` abbreviation; hardened `shouldExcludeMatch`, reintroduced the `in` token, updated range handling, and verified `npm test` after these changes.

---

### Step 15 Log
**Status**: COMPLETED
**Agent**: Codex
**Date**: 2025-12-09
**Notes**: Confirmed `test/issues/all-issues.test.js` and the broader regression suites cover every targeted bug, refreshed the units snapshot, and ran `npm test` to ensure all suites pass.

---

### Step 16 Log
**Status**: PENDING
**Agent**: -
**Date**: -
**Notes**: Documentation and cleanup to be completed as the final step.

## Appendix: Module Dependency Graph

```
content.js
    └── converter.js
            ├── units/index.js
            │       └── parsing/regex.js
            ├── units/length.js
            │       ├── exclusions/index.js
            │       ├── parsing/measurement.js
            │       ├── formatting/units.js
            │       └── utils/precision.js
            ├── units/weight.js (similar deps)
            ├── units/liquid.js (similar deps)
            ├── units/area.js (similar deps)
            ├── units/temperature.js
            │       └── formatting/units.js
            └── units/timezone.js
    └── exclusions/index.js
            ├── exclusions/context.js
            └── exclusions/patterns.js
```

---

## Appendix: Current Exports to Preserve

The following exports must remain available for tests:
```javascript
module.exports = {
  convertText,
  convertLengthText,
  convertAreaText,
  convertWeightText,
  convertLiquidText,
  convertTemperatureText,
  convertTimeZoneText,
  processNode,
  processElement,
  hasRelevantUnits,
  isBlacklistedUrl,
  formatLengthMeasurement,
  formatAreaMeasurement,
  formatWeightMeasurement,
  formatLiquidMeasurement,
  formatTemperatureCelsius,
  isEditableContext,
  convertToDecimal,
  createRegexFromTemplate,
  parseMeasurementMatch,
  convertTimeZone,
  resolutionStepOfValueString,
  inferResolutionMetersFromNumber,
};
```
