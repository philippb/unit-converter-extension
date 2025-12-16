# Unit Converter Extension - Architectural Refactoring Plan

## Executive Summary

This document outlines a comprehensive refactoring plan to fix multiple open issues. Each step is executed sequentially by a sub-agent, with learnings captured back into this document for subsequent agents.

**Verified against main branch**: 2025-12-08 (commit 5171c7a)
**Implementation branch**: `refactor/fix-all-issues`

---

## Execution Model

### Branch Strategy
```
main
  └── refactor/fix-all-issues  ← All work happens here
        ├── Step 1 commit
        ├── Step 2 commit
        ├── ...
        └── Step 11 commit → PR to main
```

### Sub-Agent Workflow
Each step is executed by a sub-agent that:
1. Reads this plan and the Implementation Log (below)
2. Executes the defined task
3. Updates the Implementation Log with:
   - Status (completed/failed/blocked)
   - Actual changes made (files, line numbers)
   - Test results
   - Learnings and gotchas for future agents
4. Commits changes with descriptive message
5. Returns summary to orchestrator

### Inter-Agent Communication
The **Implementation Log** section at the bottom of this document serves as the shared memory between agents. Each agent MUST read previous entries before starting and MUST update it after completing.

---

## Current State Analysis

### Issues Verified on Main Branch

| Issue | Description | Current Behavior | Status |
|-------|-------------|------------------|--------|
| #6 | React hydration errors | `$2,400 in` → `$2,400 in (60.96 m)` | **BROKEN** |
| #9 | Code tags exclusion | Need to test with DOM | **OPEN** |
| #10 | Negative Fahrenheit | `-40°F` → `-40°F (4.44°C)` wrong! | **BROKEN** |
| #12 | Quotes exclusion | `"top 30"` → `"top 30" (76.2 cm)` | **BROKEN** |
| #14 | CodeMirror exclusion | Related to #9 | **OPEN** |
| #15 | Double apostrophe | `19''` → `19' (5.79 m)'` wrong! | **BROKEN** |
| #17 | Port numbers | `localhost:3000 in` → converts "in" | **BROKEN** |
| #20 | Dimensions | `6x9"` → `6x9" (15.24x22.86 cm)` | **FIXED ✓** |
| #32 | "in" abbreviation | `2025 in California` → converts | **BROKEN** |
| #31, #33 | Timezone issues | TBD | **OPEN** (out of scope) |

### Open PRs Reference

| PR | Issue | Status | Useful Code |
|----|-------|--------|-------------|
| #23 | #20 | Close (fixed) | N/A |
| #25 | #17 | Reference | `(?<!:)` lookbehind pattern |
| #26 | #15 | Reference | `''` regex pattern |
| #27 | #12 | Reference | `isInsideQuotes()` logic |
| #29 | #10 | Reference | `-?` in temperature regex |
| #30 | #9 | Reference | Class patterns for code detection |

---

## Sequential Execution Steps

### Step 1: Setup Branch and Test Infrastructure
**Agent Task**: Create implementation branch and test files for all issues

**Input**: Clean main branch
**Output**: Branch `refactor/fix-all-issues` with test infrastructure

**Actions**:
1. Create and checkout branch `refactor/fix-all-issues` from main
2. Create directory `test/issues/`
3. Create test files (all with `test.skip`):
   - `test/issues/issue-006-react-hydration.test.js`
   - `test/issues/issue-009-code-tags.test.js`
   - `test/issues/issue-010-negative-fahrenheit.test.js`
   - `test/issues/issue-012-quotes.test.js`
   - `test/issues/issue-014-codemirror.test.js`
   - `test/issues/issue-015-double-apostrophe.test.js`
   - `test/issues/issue-017-port-numbers.test.js`
   - `test/issues/issue-032-in-abbreviation.test.js`
4. Run `npm test` to verify all pass (skipped tests don't fail)
5. Commit: "Add test infrastructure for issue fixes"

**Success Criteria**:
- Branch exists
- All test files created
- `npm test` passes (184 passed, 1 skipped + new skipped)

**Test File Template**:
```javascript
// test/issues/issue-XXX-description.test.js
const { convertText } = require('../../src/content.js');

describe('Issue #XXX: Description', () => {
    test.skip('test case 1', () => {
        // Test implementation
    });
});
```

---

### Step 2: Close PR #23 and Issue #20
**Agent Task**: Close already-fixed PR and issue via GitHub CLI

**Input**: Step 1 completed
**Output**: PR #23 closed, Issue #20 closed

**Actions**:
1. Close PR #23: `gh pr close 23 --comment "Fixed on main in commit ab94519. Closing as part of refactor/fix-all-issues cleanup."`
2. Close Issue #20: `gh issue close 20 --comment "Fixed in commit ab94519. Verified working: 6x9\" → 6x9\" (15.24x22.86 cm)"`
3. Update Implementation Log

**Success Criteria**:
- PR #23 state is "closed"
- Issue #20 state is "closed"

---

### Step 3: Fix Issue #10 - Negative Fahrenheit
**Agent Task**: Fix negative temperature conversion

**Input**: Step 2 completed
**Output**: Negative Fahrenheit converts correctly

**Problem**: `-40°F` → `-40°F (4.44°C)` instead of `-40°F (-40.0°C)`
**Root Cause**: Temperature regex doesn't capture negative sign

**Actions**:
1. Read current `TEMPERATURE_F_REGEX` in `src/content.js` (around line 182)
2. Modify regex to capture optional negative sign: `(\d+` → `(-?\d+`
3. Update `test/issues/issue-010-negative-fahrenheit.test.js`:
   - Remove `test.skip` → `test`
   - Verify test cases pass
4. Run `npm test` to verify no regressions
5. Commit: "Fix negative Fahrenheit conversion (issue #10)"

**Code Change**:
```javascript
// Before (line 182)
const TEMPERATURE_F_REGEX = String.raw`(?<!\()(?<![\d.])\b(\d+(?:\.\d+)?)\s*(?:°\s*F|℉|F\b|deg\s*F|degree\s*F|degrees\s*F|degrees?\s*Fahrenheit|Fahrenheit)\b(?!\s*\()`;

// After
const TEMPERATURE_F_REGEX = String.raw`(?<!\()(?<![\d.])(-?\d+(?:\.\d+)?)\s*(?:°\s*F|℉|F\b|deg\s*F|degree\s*F|degrees\s*F|degrees?\s*Fahrenheit|Fahrenheit)\b(?!\s*\()`;
```

**Test Cases**:
```javascript
test('converts negative Fahrenheit correctly', () => {
    expect(convertTemperatureText('-40°F')).toBe('-40°F (-40.0°C)');
    expect(convertTemperatureText('-10°F')).toContain('(-23.3°C)');
    expect(convertTemperatureText('-4°F')).toContain('(-20.0°C)');
});

test('still converts positive temperatures', () => {
    expect(convertTemperatureText('32°F')).toBe('32°F (0.00°C)');
    expect(convertTemperatureText('212°F')).toBe('212°F (100°C)');
});
```

**Success Criteria**:
- `-40°F` → `-40°F (-40.0°C)`
- All existing tests pass
- New issue tests pass

**Reference**: PR #29 has the exact fix

---

### Step 4: Fix Issue #15 - Double Apostrophe
**Agent Task**: Support `''` (two apostrophes) as inch symbol

**Input**: Step 3 completed
**Output**: `19''` converts as inches, not feet

**Problem**: `19''` → `19' (5.79 m)'` (parsed as feet + stray apostrophe)
**Root Cause**: Inch regex doesn't recognize `''` as valid inch symbol

**Actions**:
1. Find `inchesSymbolRegex` in `convertLengthText()` (around line 763)
2. Add `''` as valid inch pattern before other symbols
3. Update `test/issues/issue-015-double-apostrophe.test.js`
4. Run `npm test`
5. Commit: "Fix double apostrophe as inches (issue #15)"

**Code Change**:
```javascript
// Before
const inchesSymbolRegex = new RegExp(
    String.raw`(${VALUE_PART})\s*[${INCH_SYMBOLS}](?!\s*\()`,
    'giu'
);

// After - add '' before character class
const inchesSymbolRegex = new RegExp(
    String.raw`(${VALUE_PART})\s*(?:''|[${INCH_SYMBOLS}])(?!\s*\()`,
    'giu'
);
```

**Test Cases**:
```javascript
test('converts double apostrophe as inches', () => {
    expect(convertText("19'' Crossflow Wheels")).toBe("19'' (48.26 cm) Crossflow Wheels");
    expect(convertText("20'' rims")).toContain('(50.8 cm)');
});

test('still converts regular inch symbols', () => {
    expect(convertText('19" wheels')).toContain('(48.26 cm)');
});
```

**Success Criteria**:
- `19''` → `19'' (48.26 cm)`
- Regular inch symbols still work
- All tests pass

**Reference**: PR #26 has similar fix

---

### Step 5: Fix Issue #17 - Port Numbers
**Agent Task**: Don't convert numbers after colons (port numbers)

**Input**: Step 4 completed
**Output**: `localhost:3000` unchanged

**Problem**: `localhost:3000 in` → `localhost:3000 in (76.2 m)`
**Root Cause**: No check for colon prefix before numbers

**Actions**:
1. Find `hasCurrencyPrefix()` function (around line 199)
2. Rename to `hasInvalidPrefix()` and add `:` to checked characters
3. OR add `(?<!:)` lookbehind to `MEASUREMENT_REGEX_TEMPLATE`
4. Update `test/issues/issue-017-port-numbers.test.js`
5. Run `npm test`
6. Commit: "Fix port numbers being converted (issue #17)"

**Recommended Approach** (simpler - just add colon check):
```javascript
// Rename and extend hasCurrencyPrefix
const INVALID_PREFIXES = '$€£¥₹₽₩₺₪₫₴₦₱฿₭₲₡₵₸₼₾₿:';

function hasInvalidPrefix(s, startIndex) {
    if (!s || typeof s !== 'string') return false;
    let i = startIndex - 1;
    while (i >= 0 && /\s/.test(s[i])) i--;
    if (i < 0) return false;
    const ch = s[i];
    return INVALID_PREFIXES.includes(ch);
}
```

**Test Cases**:
```javascript
test('does not convert port numbers', () => {
    expect(convertText('localhost:3000')).toBe('localhost:3000');
    expect(convertText('localhost:3000 in development')).toBe('localhost:3000 in development');
    expect(convertText('192.168.1.1:8080')).toBe('192.168.1.1:8080');
});

test('still converts valid measurements', () => {
    expect(convertText('3000 ft cable')).toContain('(914.4 m)');
});
```

**Success Criteria**:
- `localhost:3000` → unchanged
- Currency prefix still works
- All tests pass

**Reference**: PR #25 uses regex lookbehind approach

---

### Step 6: Fix Issue #12 - Quotes
**Agent Task**: Don't convert numbers inside quoted strings

**Input**: Step 5 completed
**Output**: `"top 30"` unchanged

**Problem**: `"top 30"` → `"top 30" (76.2 cm)`
**Root Cause**: No detection of quoted string context

**Actions**:
1. Add `isInsideQuotes()` function to `src/content.js`
2. Call it in inch/foot symbol conversion (where quote chars are involved)
3. Update `test/issues/issue-012-quotes.test.js`
4. Run `npm test`
5. Commit: "Fix quoted strings being converted (issue #12)"

**Code to Add**:
```javascript
// Quote characters for detection
const QUOTE_CHARS = '"\'\u201c\u201d\u2018\u2019';

/**
 * Check if a match ending with a quote is inside a quoted string
 * @param {string} s - The full string
 * @param {number} startIndex - Start of the match
 * @param {string} match - The matched text
 * @returns {boolean} - True if inside quotes (not a measurement)
 */
function isInsideQuotes(s, startIndex, match) {
    if (!s || typeof s !== 'string') return false;

    const lastChar = match[match.length - 1];
    // Only check for matches ending with quote-like characters
    if (!QUOTE_CHARS.includes(lastChar)) return false;

    // Search backwards for opening quote
    for (let i = startIndex - 1; i >= 0; i--) {
        const char = s[i];
        if (QUOTE_CHARS.includes(char)) {
            // Check context before opening quote
            if (i === 0 || /[\s:,{\[\(]/.test(s[i - 1])) {
                // Verify it's not a number (which would indicate measurement like 6")
                if (i > 0 && /\d/.test(s[i - 1])) {
                    return false; // Number before quote = measurement
                }
                return true; // Likely a quoted string
            }
        }
    }
    return false;
}
```

**Integration Points** (add check in these replace callbacks):
- `inchesSymbolRegex` replacement
- `feetSymbolRegex` replacement

```javascript
// In replacement callback, add:
if (s && isInsideQuotes(s, offset, match)) return match;
```

**Test Cases**:
```javascript
test('does not convert numbers in quotes', () => {
    expect(convertText('The "top 30" actions')).toBe('The "top 30" actions');
    expect(convertText('"zip": "94110"')).toBe('"zip": "94110"');
});

test('still converts actual inch measurements', () => {
    expect(convertText('Board is 30" wide')).toContain('(76.2 cm)');
    expect(convertText('Cut the 6" board')).toContain('(15.24 cm)');
});
```

**Success Criteria**:
- `"top 30"` → unchanged
- `30" wide` → still converts
- All tests pass

**Reference**: PR #27 has full implementation

---

### Step 7: Fix Issues #9, #14 - Code Tags
**Agent Task**: Don't convert content in code-related elements

**Input**: Step 6 completed
**Output**: Code in `<pre>`, `.hljs`, `.cm-*` unchanged

**Problem**: Content in syntax-highlighted code gets converted
**Root Cause**: Only tag names checked, not CSS classes

**Actions**:
1. Add `hasCodeRelatedClass()` function
2. Update `isInSkippableContainer()` to check classes
3. Add KBD, SAMP, VAR to SKIP_TAGS
4. Update test files for #9 and #14
5. Run `npm test`
6. Commit: "Fix code tags and syntax highlighting (issues #9, #14)"

**Code to Add**:
```javascript
// Code-related class patterns
const CODE_CLASS_PATTERNS = [
    'hljs', 'highlight', 'prism', 'prettyprint', 'syntax',
    'blob-code', 's-code-block', 'code-example', 'md-code-block'
];
const CODE_CLASS_PREFIXES = ['language-', 'lang-', 'cm-', 'CodeMirror'];

function hasCodeRelatedClass(classList) {
    if (!classList) return false;
    for (const cls of classList) {
        if (CODE_CLASS_PATTERNS.includes(cls)) return true;
        if (CODE_CLASS_PREFIXES.some(prefix => cls.startsWith(prefix))) return true;
    }
    return false;
}

// Update SKIP_TAGS
const SKIP_TAGS = new Set([
    'CODE', 'SCRIPT', 'STYLE', 'PRE', 'KBD', 'SAMP', 'VAR',
    'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'HEAD', 'TITLE',
]);

// Update isInSkippableContainer
function isInSkippableContainer(node) {
    let current = node && node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
    while (current) {
        if (current.tagName && SKIP_TAGS.has(current.tagName)) return true;
        if (current.classList && hasCodeRelatedClass(current.classList)) return true;
        current = current.parentNode;
    }
    return false;
}
```

**Test Cases** (require DOM - use processNode):
```javascript
test('does not convert inside <code> tags', () => {
    document.body.innerHTML = '<p>Size: <code>6 feet</code></p>';
    processNode(document.body);
    expect(document.querySelector('code').textContent).toBe('6 feet');
});

test('does not convert inside highlight.js blocks', () => {
    document.body.innerHTML = '<pre class="hljs"><code>12 inches</code></pre>';
    processNode(document.body);
    expect(document.body.textContent).toBe('12 inches');
});

test('does not convert inside CodeMirror', () => {
    document.body.innerHTML = '<span class="cm-string">6 ft</span>';
    processNode(document.body);
    expect(document.body.textContent).toBe('6 ft');
});
```

**Success Criteria**:
- `<code>6 feet</code>` → unchanged
- `.hljs` content → unchanged
- `.cm-*` content → unchanged
- Normal text still converts
- All tests pass

**Reference**: PR #30 has class patterns

---

### Step 8: Fix Issue #32 - "in" Abbreviation
**Agent Task**: Require period for "in" abbreviation (`in.` not `in`)

**Input**: Step 7 completed
**Output**: `2025 in California` unchanged, `6 in. pipe` converts

**Problem**: Common word "in" matches as inches
**Root Cause**: `in` in UNIT_SPECS matches too broadly

**⚠️ BREAKING CHANGE**: This changes existing behavior. Some existing tests may need updating.

**Actions**:
1. Modify `UNIT_SPECS.LENGTH.FEET_INCHES.SECONDARY` (line 8)
2. Change `'in'` to `'in\\.'` (require period)
3. Update `test/issues/issue-032-in-abbreviation.test.js`
4. Find and update any existing tests that use `X in` pattern
5. Run `npm test` - fix any failures
6. Commit: "Require period for 'in' abbreviation (issue #32)"

**Code Change**:
```javascript
// Before (line 6-9)
FEET_INCHES: {
    PRIMARY: ["'", '′', '\u2019', 'feet', 'foot', 'ft'],
    SECONDARY: ['"', '″', '\u201D', 'inches', 'inch', 'in'],
},

// After
FEET_INCHES: {
    PRIMARY: ["'", '′', '\u2019', 'feet', 'foot', 'ft'],
    SECONDARY: ['"', '″', '\u201D', 'inches', 'inch', 'in\\.'],
},
```

**Test Cases**:
```javascript
test('does not convert "in" without period', () => {
    expect(convertText('In May 2025 in California')).toBe('In May 2025 in California');
    expect(convertText('$2,400 in the first year')).toBe('$2,400 in the first year');
});

test('converts "in." with period', () => {
    expect(convertText('The pipe is 6 in. long')).toContain('(15.24 cm)');
    expect(convertText('Cut 12 in. boards')).toContain('(30.48 cm)');
});

test('still converts "inch" and "inches"', () => {
    expect(convertText('12 inches wide')).toContain('(30.48 cm)');
    expect(convertText('1 inch thick')).toContain('(2.54 cm)');
});

test('still converts inch symbols', () => {
    expect(convertText('12" wide')).toContain('(30.48 cm)');
});
```

**Existing Tests to Update**:
Search for tests using patterns like:
- `X in` without period
- `in ` as unit

Update them to use `X in.` or `X inches` instead.

**Success Criteria**:
- `2025 in California` → unchanged
- `6 in. pipe` → converts
- `12 inches` → still converts
- All tests pass (after updates)

**Note**: Document which existing tests were modified in Implementation Log.

---

### Step 9: Verify Issue #6 - React Hydration
**Agent Task**: Verify React hydration issue is fixed by previous changes

**Input**: Step 8 completed
**Output**: React hydration test cases pass

**Problem**: Extension modifies SSR HTML causing hydration mismatch
**Expected Fix**: Issues #12, #17, #32 combined should fix this

**Actions**:
1. Update `test/issues/issue-006-react-hydration.test.js`
2. Test the specific patterns from the issue
3. Run `npm test`
4. Commit: "Verify React hydration fix (issue #6)"

**Test Cases** (from the issue):
```javascript
test('does not convert currency followed by "in"', () => {
    // This was the actual React hydration error case
    expect(convertText('Saved $2,400 in the first year alone'))
        .toBe('Saved $2,400 in the first year alone');
});

test('does not convert "in" after numbers in text', () => {
    expect(convertText('roughly 32% of customers in California'))
        .toBe('roughly 32% of customers in California');
});
```

**Success Criteria**:
- All React hydration test cases pass
- No false positives on currency + "in" patterns
- Issue #6 can be closed

---

### Step 10: Optional - Extract Modules (Refactoring)
**Agent Task**: Extract code into separate modules for maintainability

**Input**: Step 9 completed
**Output**: Cleaner code structure (optional)

**Note**: This step is optional and should only be done if time permits and all tests pass. Skip if any issues remain.

**Proposed Structure**:
```
src/
├── content.js          # Main entry (slimmed)
├── exclusions.js       # isInsideQuotes, hasCodeRelatedClass, hasInvalidPrefix
└── utils/
    ├── parsing.js      # convertToDecimal, fraction parsing
    └── formatting.js   # format*Measurement functions
```

**Actions**:
1. Create new files with extracted functions
2. Update imports in content.js
3. Ensure exports for testing still work
4. Run `npm test`
5. Commit: "Extract utility modules for maintainability"

**Success Criteria**:
- All tests pass
- Code is more modular
- No functionality change

---

### Step 11: Cleanup and Documentation
**Agent Task**: Final cleanup, close PRs, update docs

**Input**: Step 9 or 10 completed
**Output**: All PRs closed, issues closed, ready for merge

**Actions**:
1. Close remaining PRs with comments:
   - PR #25: "Superseded by refactor/fix-all-issues"
   - PR #26: "Superseded by refactor/fix-all-issues"
   - PR #27: "Superseded by refactor/fix-all-issues"
   - PR #29: "Superseded by refactor/fix-all-issues"
   - PR #30: "Superseded by refactor/fix-all-issues"
2. Verify all issue test files have `test` not `test.skip`
3. Run final `npm test` - all must pass
4. Update this Implementation Log with final status
5. Commit: "Final cleanup for refactor/fix-all-issues"
6. Create PR to main: `gh pr create --title "Fix issues #6, #9, #10, #12, #14, #15, #17, #32" --body "..."`

**PR Description Template**:
```markdown
## Summary
Comprehensive fix for multiple unit conversion issues.

## Issues Fixed
- #6 - React hydration errors
- #9 - Code tags exclusion
- #10 - Negative Fahrenheit
- #12 - Quotes exclusion
- #14 - CodeMirror exclusion
- #15 - Double apostrophe
- #17 - Port numbers
- #32 - "in" abbreviation

## Breaking Changes
- `in` no longer matches as inches; use `in.` or `inches`

## Test Plan
- All 184+ tests pass
- New issue-specific tests added in test/issues/
```

**Success Criteria**:
- All PRs closed
- All issues have passing tests
- PR to main created
- Ready for review

---

## Implementation Log

> **Instructions for Sub-Agents**:
> - Read ALL previous entries before starting your step
> - After completing your step, add a new entry below
> - Be specific about file paths, line numbers, and any surprises
> - If you deviate from the plan, explain why

---

### Step 1 Log
**Status**: NOT STARTED
**Agent**: -
**Date**: -

**Changes Made**:
- (to be filled by agent)

**Test Results**:
- (to be filled by agent)

**Learnings/Gotchas**:
- (to be filled by agent)

---

### Step 2 Log
**Status**: NOT STARTED
**Agent**: -
**Date**: -

**Changes Made**:
- (to be filled by agent)

**Learnings/Gotchas**:
- (to be filled by agent)

---

### Step 3 Log
**Status**: NOT STARTED
**Agent**: -
**Date**: -

**Changes Made**:
- (to be filled by agent)

**Test Results**:
- (to be filled by agent)

**Learnings/Gotchas**:
- (to be filled by agent)

---

### Step 4 Log
**Status**: NOT STARTED
**Agent**: -
**Date**: -

**Changes Made**:
- (to be filled by agent)

**Test Results**:
- (to be filled by agent)

**Learnings/Gotchas**:
- (to be filled by agent)

---

### Step 5 Log
**Status**: NOT STARTED
**Agent**: -
**Date**: -

**Changes Made**:
- (to be filled by agent)

**Test Results**:
- (to be filled by agent)

**Learnings/Gotchas**:
- (to be filled by agent)

---

### Step 6 Log
**Status**: NOT STARTED
**Agent**: -
**Date**: -

**Changes Made**:
- (to be filled by agent)

**Test Results**:
- (to be filled by agent)

**Learnings/Gotchas**:
- (to be filled by agent)

---

### Step 7 Log
**Status**: NOT STARTED
**Agent**: -
**Date**: -

**Changes Made**:
- (to be filled by agent)

**Test Results**:
- (to be filled by agent)

**Learnings/Gotchas**:
- (to be filled by agent)

---

### Step 8 Log
**Status**: NOT STARTED
**Agent**: -
**Date**: -

**Changes Made**:
- (to be filled by agent)

**Existing Tests Modified**:
- (to be filled by agent - list any tests changed due to breaking change)

**Test Results**:
- (to be filled by agent)

**Learnings/Gotchas**:
- (to be filled by agent)

---

### Step 9 Log
**Status**: NOT STARTED
**Agent**: -
**Date**: -

**Changes Made**:
- (to be filled by agent)

**Test Results**:
- (to be filled by agent)

**Learnings/Gotchas**:
- (to be filled by agent)

---

### Step 10 Log
**Status**: NOT STARTED (optional)
**Agent**: -
**Date**: -

**Changes Made**:
- (to be filled by agent)

**Test Results**:
- (to be filled by agent)

**Learnings/Gotchas**:
- (to be filled by agent)

---

### Step 11 Log
**Status**: NOT STARTED
**Agent**: -
**Date**: -

**PRs Closed**:
- (to be filled by agent)

**Issues Closeable**:
- (to be filled by agent)

**Final Test Results**:
- (to be filled by agent)

**PR to Main**:
- (to be filled by agent - PR number/URL)

---

## Success Metrics

After all steps complete:

| Issue | Before | After | Status |
|-------|--------|-------|--------|
| #10 | `-40°F (4.44°C)` | `-40°F (-40.0°C)` | ⬜ |
| #15 | `19' (5.79 m)'` | `19'' (48.26 cm)` | ⬜ |
| #17 | `localhost:3000 in (76.2 m)` | `localhost:3000` | ⬜ |
| #12 | `"top 30" (76.2 cm)` | `"top 30"` | ⬜ |
| #32 | `2025 in (51.43 m)` | `2025 in` | ⬜ |
| #6 | React hydration errors | No errors | ⬜ |
| #9/#14 | Code converted | Code unchanged | ⬜ |

Legend: ⬜ = Not done, ✅ = Done, ❌ = Failed
