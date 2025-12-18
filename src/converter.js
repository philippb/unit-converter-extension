const { UNITS, UNIT_HINT_PATTERN } = require('./units/index.js');
const { convertLengthToMeters } = require('./units/length.js');
const { convertWeightToGrams } = require('./units/weight.js');
const { convertLengthText } = require('./units/length.js');
const { convertWeightText } = require('./units/weight.js');
const { convertLiquidText } = require('./units/liquid.js');
const { convertAreaText } = require('./units/area.js');
const { convertTemperatureText } = require('./units/temperature.js');
const { convertTimeZoneText } = require('./units/timezone.js');
const { convertAwgText } = require('./units/awg.js');
const {
    LIQUID_GALLON_TO_L,
    LIQUID_QUART_TO_L,
    LIQUID_PINT_TO_L,
    LIQUID_CUP_TO_L,
    LIQUID_FLOZ_TO_L,
    LIQUID_TBSP_TO_L,
    LIQUID_TSP_TO_L,
    UNICODE_FRACTIONS,
    INCH_SYMBOLS,
    FEET_SYMBOLS,
} = require('./utils/constants.js');
const { convertToDecimal } = require('./parsing/numbers.js');
const { parseMeasurementMatch, extractFirstValueToken } = require('./parsing/measurement.js');
const {
    createRegexFromTemplate,
    RE_TEMPERATURE_F,
    RE_TEMPERATURE_F_TEST,
    RE_TIME_GLOBAL,
    RE_TIME_TEST,
} = require('./parsing/regex.js');
const {
    formatLengthRange,
    formatWeightRange,
    formatLiquidRange,
    formatTemperatureRange,
} = require('./formatting/ranges.js');

const FAST_NUMBER_HINT = new RegExp(String.raw`[0-9${UNICODE_FRACTIONS}]`, 'u');
const RANGE_SEP_RE = /^(?:\s*)(?:-|–|—|to|through|thru)(?:\s*)$/i;
const RANGE_PRESENCE_RE = /(?:-|–|—|\bto\b|\bthrough\b|\bthru\b)/i;
const VALUE_TAIL_RE = new RegExp(
    String.raw`(${`(?:\\d{1,3}(?:,\\d{3})+|\\d+)\\.\\d+|(?:\\d{1,3}(?:,\\d{3})+|\\d+)\\s+\\d+\\/\\d+|\\d+\\/\\d+|(?:\\d{1,3}(?:,\\d{3})+|\\d+)[${UNICODE_FRACTIONS}]?|[${UNICODE_FRACTIONS}]`})\s*(?:-|–|—|to|through|thru)\s*$`,
    'iu'
);

const QUOTE_LENGTH_HINT_RE = new RegExp(
    String.raw`(?:\d|[${UNICODE_FRACTIONS}])\s*[${INCH_SYMBOLS}${FEET_SYMBOLS}]`,
    'iu'
);

// Area hint: avoid relying on word boundaries for tokens like 'ft²'
const AREA_HINT_RE = new RegExp(
    String.raw`(?:sq\.?\s*ft|sq\.?\s*feet|sq\.?\s*foot|square\s+feet|square\s+foot|sqft|ft\s*(?:\^?2|²)|ft2|sq\.?\s*in|sq\.?\s*inch(?:es)?|square\s+inch(?:es)?|in\s*(?:\^?2|²)|in2|sq\.?\s*yd|sq\.?\s*yard(?:s)?|square\s+yard(?:s)?|yd\s*(?:\^?2|²)|yd2|sq\.?\s*mi|sq\.?\s*mile(?:s)?|square\s+mile(?:s)?|mi\s*(?:\^?2|²)|mi2|acre(?:s)?)`,
    'iu'
);

const TEMP_RANGE_RE = new RegExp(
    String.raw`(\d+(?:\.\d+)?)\s*(?:-|–|—|to|through|thru)\s*(\d+(?:\.\d+)?)\s*(?:°\s*F|℉|F\b|deg\s*F|degree\s*F|degrees\s*F|degrees?\s*Fahrenheit|Fahrenheit)\b(?!\s*\()`,
    'giu'
);

const AWG_HINT_RE = /awg/i;

function buildUnitGroupRegex(unitPatterns) {
    const patterns = new Set();
    const stack = [unitPatterns];

    while (stack.length > 0) {
        const current = stack.pop();
        if (!current) continue;

        if (typeof current === 'string') {
            patterns.add(current);
            continue;
        }

        if (Array.isArray(current)) {
            for (const value of current) stack.push(value);
            continue;
        }

        if (typeof current === 'object') {
            for (const value of Object.values(current)) {
                stack.push(value);
            }
        }
    }

    // Conservative boundaries: only avoid word-characters around the unit token.
    const unitString = Array.from(patterns).filter(Boolean).join('|');
    return new RegExp(`(?<!\\w)(?:${unitString})(?!\\w)`, 'iu');
}

const LENGTH_UNIT_GROUP_RE = buildUnitGroupRegex(UNITS.LENGTH);
const LIQUID_UNIT_GROUP_RE = buildUnitGroupRegex(UNITS.LIQUID);
const WEIGHT_UNIT_GROUP_RE = buildUnitGroupRegex(UNITS.WEIGHT);

function applyReplacements(original, replacements) {
    if (replacements.length === 0) return original;
    const sorted = [...replacements].sort((x, y) => x.start - y.start);
    let out = '';
    let pos = 0;
    for (const r of sorted) {
        if (r.start < pos) continue; // skip overlaps
        out += original.slice(pos, r.start) + r.token;
        pos = r.end;
    }
    out += original.slice(pos);
    return out;
}

/**
 * Generic range merger that handles all unit types.
 * Expects a cached (global) regex; resets `lastIndex` before scanning.
 */
function mergeUnitRanges(s, config) {
    const { unitSpec, regex, converter, formatter, addPlaceholder } = config;
    const replacements = [];

    regex.lastIndex = 0;

    // Find all matches
    const matches = [];
    let m;
    while ((m = regex.exec(s)) !== null) {
        matches.push({ start: m.index, end: regex.lastIndex, text: m[0] });
    }

    // Process matches for ranges
    for (let i = 0; i < matches.length; i++) {
        const curr = matches[i];

        // 1) Repeated-unit range: "5 mi - 10 mi"
        if (i > 0) {
            const prev = matches[i - 1];
            const between = s.slice(prev.end, curr.start);
            if (RANGE_SEP_RE.test(between)) {
                const leftParsed = parseMeasurementMatch(prev.text, unitSpec);
                const rightParsed = parseMeasurementMatch(curr.text, unitSpec);
                const val1 = converter(leftParsed);
                const val2 = converter(rightParsed);
                const formatted = formatter(val1, val2);
                const token = addPlaceholder(`${s.slice(prev.start, curr.end)} (${formatted})`);
                replacements.push({ start: prev.start, end: curr.end, token });
                continue;
            }
        }

        // 2) Suffix-style range: "5-10 miles" (unit only on right)
        const leftSlice = s.slice(Math.max(0, curr.start - 50), curr.start);
        const tail = leftSlice.match(VALUE_TAIL_RE);
        if (tail) {
            const tailStart = curr.start - tail[0].length;
            const rightParsed = parseMeasurementMatch(curr.text, unitSpec);

            // For single-unit specs (PRIMARY only) or when right side has only one unit
            const hasPrimary = rightParsed.primary.unit;
            const hasSecondary = rightParsed.secondary.unit;
            const isSingleUnit = (hasPrimary && !hasSecondary) || (!hasPrimary && hasSecondary);

            if (isSingleUnit) {
                const leftValue = convertToDecimal(String(tail[1]));
                if (!Number.isNaN(leftValue)) {
                    // Create left parsed object with same unit as right
                    const leftParsed = {
                        primary: hasPrimary
                            ? { value: leftValue, unit: rightParsed.primary.unit }
                            : { value: 0, unit: null },
                        secondary: hasSecondary
                            ? { value: leftValue, unit: rightParsed.secondary.unit }
                            : { value: 0, unit: null },
                    };
                    const val1 = converter(leftParsed);
                    const val2 = converter(rightParsed);
                    const formatted = formatter(val1, val2);
                    const token = addPlaceholder(`${s.slice(tailStart, curr.end)} (${formatted})`);
                    replacements.push({ start: tailStart, end: curr.end, token });
                }
            }
        }
    }

    return applyReplacements(s, replacements);
}

const RANGE_REGEXES = {
    feetInches: createRegexFromTemplate(
        UNITS.LENGTH.FEET_INCHES.PRIMARY,
        UNITS.LENGTH.FEET_INCHES.SECONDARY
    ),
    miles: createRegexFromTemplate(UNITS.LENGTH.MILES.PRIMARY, ''),
    yards: createRegexFromTemplate(UNITS.LENGTH.YARDS.PRIMARY, ''),
    weight: createRegexFromTemplate(UNITS.WEIGHT.PRIMARY, UNITS.WEIGHT.SECONDARY),
    cups: createRegexFromTemplate(UNITS.LIQUID.CUPS.PRIMARY, ''),
    gallons: createRegexFromTemplate(UNITS.LIQUID.GALLONS.PRIMARY, ''),
    quarts: createRegexFromTemplate(UNITS.LIQUID.QUARTS.PRIMARY, ''),
    pints: createRegexFromTemplate(UNITS.LIQUID.PINTS.PRIMARY, ''),
    floz: createRegexFromTemplate(UNITS.LIQUID.FLOZ.PRIMARY, ''),
    tbsp: createRegexFromTemplate(UNITS.LIQUID.TBSP.PRIMARY, ''),
    tsp: createRegexFromTemplate(UNITS.LIQUID.TSP.PRIMARY, ''),
};

const LENGTH_CONVERTERS = {
    feetInches: (parsed) => convertLengthToMeters(parsed.primary.value, parsed.secondary.value),
    miles: (parsed) => convertLengthToMeters(0, 0, parsed.primary.value),
    yards: (parsed) => convertLengthToMeters(0, 0, 0, parsed.primary.value),
};

const WEIGHT_CONVERTER = (parsed) =>
    convertWeightToGrams(parsed.primary.value, parsed.secondary.value);

const LIQUID_CONVERTERS = {
    cups: (parsed) => parsed.primary.value * LIQUID_CUP_TO_L,
    gallons: (parsed) => parsed.primary.value * LIQUID_GALLON_TO_L,
    quarts: (parsed) => parsed.primary.value * LIQUID_QUART_TO_L,
    pints: (parsed) => parsed.primary.value * LIQUID_PINT_TO_L,
    floz: (parsed) => parsed.primary.value * LIQUID_FLOZ_TO_L,
    tbsp: (parsed) => parsed.primary.value * LIQUID_TBSP_TO_L,
    tsp: (parsed) => parsed.primary.value * LIQUID_TSP_TO_L,
};

/**
 * Fast pre-filter to check if text contains any relevant units
 * This avoids expensive regex operations on irrelevant text
 * @param {string} text - The text to check
 * @returns {boolean} - True if text might contain convertible units
 */
// Lightweight numeric + unit hint to gate scanning for all units (abbrev + spelled-out)
const FAST_NUMBER_HINT_GLOBAL = new RegExp(String.raw`[0-9${UNICODE_FRACTIONS}]`, 'u');
const UNIT_HINT_GROUP = new RegExp(`(?:${UNIT_HINT_PATTERN})`, 'iu');
const NUM_TOKEN_GROUP = (function () {
    const unicode = UNICODE_FRACTIONS;
    // decimal | mixed a b/c | simple a/b | unicode fraction | integer with thousands
    const num = String.raw`(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)\s+\d+\/\d+|\d+\/\d+|[${unicode}]|(?:\d{1,3}(?:,\d{3})+|\d+)`;
    return new RegExp(num, 'u');
})();
const RE_UNIT_NUM_HINT = (function () {
    const num = NUM_TOKEN_GROUP.source;
    const unit = UNIT_HINT_GROUP.source;
    return new RegExp(`(?:${num})\\s*(?:${unit})|(?:${unit})\\s*(?:${num})`, 'iu');
})();
const RE_INCH_SYMBOL_HINT = new RegExp(
    String.raw`(?:${NUM_TOKEN_GROUP.source})\s*[${INCH_SYMBOLS}]`,
    'u'
);

function hasRelevantUnits(text) {
    if (!text || typeof text !== 'string') return false;

    // Quick exits: no digits or unicode fractions, and no temperature/time matches
    if (!FAST_NUMBER_HINT_GLOBAL.test(text)) {
        // Temps and times always include digits in our patterns; keep checks anyway
        if (RE_TEMPERATURE_F_TEST.test(text)) return true;
        if (RE_TIME_TEST.test(text)) return true;
        return false;
    }

    // Gate all units (abbr + words) on numeric proximity
    if (RE_UNIT_NUM_HINT.test(text)) return true;

    // Handle inch symbol forms like 12" or ⅛"
    if (RE_INCH_SYMBOL_HINT.test(text)) return true;

    // Also allow clear temperature/time matches
    if (RE_TEMPERATURE_F_TEST.test(text)) return true;
    if (RE_TIME_TEST.test(text)) return true;

    return false;
}

// Update the main convertText function to handle time zones
function convertText(text) {
    let converted = text;

    // Fast path: if there are no digits or unicode fractions, skip entirely
    if (!FAST_NUMBER_HINT.test(converted)) {
        return converted;
    }

    // Pre-pass: merge ranges by looking around existing matches.
    // We insert placeholders for detected ranges, run normal conversions,
    // then restore placeholders so inner tokens won't be double-converted.
    const placeholders = [];
    const addPlaceholder = (replacement) => {
        const token = `[[RANGE::${placeholders.length}::]]`;
        placeholders.push({ token, replacement });
        return token;
    };

    // Route to appropriate conversion function based on unit type
    // Length detection: also handle quote-based symbols (e.g., 12" or 5')
    const quoteLengthHint = QUOTE_LENGTH_HINT_RE.test(converted) || converted.includes("''");
    const hasLengthUnits = quoteLengthHint || LENGTH_UNIT_GROUP_RE.test(converted);
    const hasLiquidUnits = LIQUID_UNIT_GROUP_RE.test(converted);
    const hasWeightUnits = WEIGHT_UNIT_GROUP_RE.test(converted);

    // Perform merges prior to standard conversions (only when relevant)
    if (RANGE_PRESENCE_RE.test(converted)) {
        if (hasLengthUnits) {
            converted = mergeUnitRanges(converted, {
                unitSpec: UNITS.LENGTH.FEET_INCHES,
                regex: RANGE_REGEXES.feetInches,
                converter: LENGTH_CONVERTERS.feetInches,
                formatter: formatLengthRange,
                addPlaceholder,
            });
            converted = mergeUnitRanges(converted, {
                unitSpec: UNITS.LENGTH.MILES,
                regex: RANGE_REGEXES.miles,
                converter: LENGTH_CONVERTERS.miles,
                formatter: formatLengthRange,
                addPlaceholder,
            });
            converted = mergeUnitRanges(converted, {
                unitSpec: UNITS.LENGTH.YARDS,
                regex: RANGE_REGEXES.yards,
                converter: LENGTH_CONVERTERS.yards,
                formatter: formatLengthRange,
                addPlaceholder,
            });
        }

        if (hasWeightUnits) {
            converted = mergeUnitRanges(converted, {
                unitSpec: UNITS.WEIGHT,
                regex: RANGE_REGEXES.weight,
                converter: WEIGHT_CONVERTER,
                formatter: formatWeightRange,
                addPlaceholder,
            });
        }

        if (hasLiquidUnits) {
            converted = mergeUnitRanges(converted, {
                unitSpec: UNITS.LIQUID.CUPS,
                regex: RANGE_REGEXES.cups,
                converter: LIQUID_CONVERTERS.cups,
                formatter: formatLiquidRange,
                addPlaceholder,
            });
            converted = mergeUnitRanges(converted, {
                unitSpec: UNITS.LIQUID.GALLONS,
                regex: RANGE_REGEXES.gallons,
                converter: LIQUID_CONVERTERS.gallons,
                formatter: formatLiquidRange,
                addPlaceholder,
            });
            converted = mergeUnitRanges(converted, {
                unitSpec: UNITS.LIQUID.QUARTS,
                regex: RANGE_REGEXES.quarts,
                converter: LIQUID_CONVERTERS.quarts,
                formatter: formatLiquidRange,
                addPlaceholder,
            });
            converted = mergeUnitRanges(converted, {
                unitSpec: UNITS.LIQUID.PINTS,
                regex: RANGE_REGEXES.pints,
                converter: LIQUID_CONVERTERS.pints,
                formatter: formatLiquidRange,
                addPlaceholder,
            });
            converted = mergeUnitRanges(converted, {
                unitSpec: UNITS.LIQUID.FLOZ,
                regex: RANGE_REGEXES.floz,
                converter: LIQUID_CONVERTERS.floz,
                formatter: formatLiquidRange,
                addPlaceholder,
            });
            converted = mergeUnitRanges(converted, {
                unitSpec: UNITS.LIQUID.TBSP,
                regex: RANGE_REGEXES.tbsp,
                converter: LIQUID_CONVERTERS.tbsp,
                formatter: formatLiquidRange,
                addPlaceholder,
            });
            converted = mergeUnitRanges(converted, {
                unitSpec: UNITS.LIQUID.TSP,
                regex: RANGE_REGEXES.tsp,
                converter: LIQUID_CONVERTERS.tsp,
                formatter: formatLiquidRange,
                addPlaceholder,
            });
        }
    }

    if (AREA_HINT_RE.test(converted)) {
        converted = convertAreaText(converted);
    }
    if (hasLengthUnits) {
        converted = convertLengthText(converted);
    }
    if (hasLiquidUnits) {
        // needs to come before weight, since it will otherwise match "fl oz"
        converted = convertLiquidText(converted);
    }
    if (hasWeightUnits) {
        converted = convertWeightText(converted);
    }

    if (AWG_HINT_RE.test(converted)) {
        converted = convertAwgText(converted);
    }

    // Temperature ranges (Fahrenheit) - handle before individual conversions
    if (RE_TEMPERATURE_F_TEST.test(converted)) {
        // Handle temperature ranges like "350-400°F" or "70 to 80 degrees F"
        converted = converted.replace(TEMP_RANGE_RE, (match, f1Str, f2Str) => {
            const f1 = parseFloat(f1Str);
            const f2 = parseFloat(f2Str);
            if (Number.isNaN(f1) || Number.isNaN(f2)) return match;
            const c1 = ((f1 - 32) * 5) / 9;
            const c2 = ((f2 - 32) * 5) / 9;
            const formatted = formatTemperatureRange(c1, c2);
            return addPlaceholder(`${match} (${formatted}°C)`);
        });

        // Then convert individual temperatures
        converted = convertTemperatureText(converted);
    }

    // Restore placeholders (prevents inner tokens from being re-converted)
    for (const { token, replacement } of placeholders) {
        converted = converted.replaceAll(token, replacement);
    }

    // Check for time zone expressions
    const hasTimeZone = RE_TIME_TEST.test(converted);
    if (hasTimeZone) {
        converted = convertTimeZoneText(converted);
    }

    return converted;
}

module.exports = { convertText, hasRelevantUnits };
