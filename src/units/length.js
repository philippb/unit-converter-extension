const { UNITS } = require('./index.js');
const {
    LENGTH_INCH_TO_METERS,
    LENGTH_FOOT_TO_METERS,
    LENGTH_YARD_TO_METERS,
    LENGTH_MILE_TO_METERS,
    UNICODE_FRACTIONS,
    FEET_SYMBOLS,
    INCH_SYMBOLS,
} = require('../utils/constants.js');
const { convertToDecimal } = require('../parsing/numbers.js');
const { createRegexFromTemplate } = require('../parsing/regex.js');
const { parseMeasurementMatch, extractFirstValueToken } = require('../parsing/measurement.js');
const {
    inferResolutionMetersFromNumber,
    inferResolutionMetersFromLengthMatch,
} = require('../utils/precision.js');
const { formatLengthMeasurement } = require('../formatting/units.js');
const { shouldExcludeMatch } = require('../exclusions/patterns.js');
const { buildInsertedParenthetical } = require('../utils/insertMarkers.js');
const DOUBLE_APOSTROPHE_TOKENS = ["''", '’’'];

const INCH_SYMBOL_CHARS = INCH_SYMBOLS.split('');
const FEET_SYMBOL_CHARS = FEET_SYMBOLS.split('');

const VALUE_PART = String.raw`(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)-\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+)\s+\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+)[${UNICODE_FRACTIONS}]?|[${UNICODE_FRACTIONS}])`;
const INCH_SYMBOL_TOKEN = String.raw`(?:''|’’|[${INCH_SYMBOLS}])`;

const DIMENSION_REGEX = new RegExp(
    String.raw`(${VALUE_PART})\s*${INCH_SYMBOL_TOKEN}?\s*[x×]\s*(${VALUE_PART})\s*${INCH_SYMBOL_TOKEN}(?!\s*\()`,
    'giu'
);
const INCHES_SYMBOL_REGEX = new RegExp(
    String.raw`(${VALUE_PART})\s*${INCH_SYMBOL_TOKEN}(?!\s*\()`,
    'giu'
);
const FEET_SYMBOL_REGEX = new RegExp(
    String.raw`(${VALUE_PART})\s*[${FEET_SYMBOLS}](?!['\u2019])(?!\s*\()(?!s)`,
    'giu'
);

function containsDoubleApostrophes(text) {
    return DOUBLE_APOSTROPHE_TOKENS.some((token) => text.includes(token));
}

function normalizeDoubleApostrophes(value) {
    return String(value).replace(/\u2019\u2019/g, "''");
}

function shouldSkipMatch(match, offset, source) {
    return shouldExcludeMatch({ text: source, matchStart: offset, match });
}

function convertLengthToMeters(feet = 0, inches = 0, miles = 0, yards = 0) {
    return (
        miles * LENGTH_MILE_TO_METERS +
        yards * LENGTH_YARD_TO_METERS +
        feet * LENGTH_FOOT_TO_METERS +
        inches * LENGTH_INCH_TO_METERS
    );
}

function convertLengthText(text, options = {}) {
    let converted = text;

    if (
        INCH_SYMBOL_CHARS.some((sym) => converted.includes(sym)) ||
        containsDoubleApostrophes(converted)
    ) {
        converted = converted.replace(DIMENSION_REGEX, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const value1 = args[1];
            const value2 = args[2];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;

            const raw1 = String(value1);
            const raw2 = String(value2);
            const inches1 = convertToDecimal(raw1);
            const inches2 = convertToDecimal(raw2);

            if (Number.isNaN(inches1) || Number.isNaN(inches2)) return match;

            const meters1 = convertLengthToMeters(0, inches1, 0);
            const meters2 = convertLengthToMeters(0, inches2, 0);
            const resolutionMeters1 = inferResolutionMetersFromNumber(raw1, 'in');
            const resolutionMeters2 = inferResolutionMetersFromNumber(raw2, 'in');

            const formatted1 = formatLengthMeasurement(meters1, {
                resolutionMeters: resolutionMeters1,
            });
            const formatted2 = formatLengthMeasurement(meters2, {
                resolutionMeters: resolutionMeters2,
            });

            const numericPart1 = formatted1.replace(/\s*(cm|mm|m|km)\s*$/i, '');
            const normalizedMatch = normalizeDoubleApostrophes(match);

            const formatted = `${numericPart1}x${formatted2}`;
            return `${normalizedMatch} ${buildInsertedParenthetical(formatted, options)}`;
        });
    }

    if (
        INCH_SYMBOL_CHARS.some((sym) => converted.includes(sym)) ||
        containsDoubleApostrophes(converted)
    ) {
        converted = converted.replace(INCHES_SYMBOL_REGEX, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const value = args[1];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;
            const raw = String(value);
            const inches = convertToDecimal(raw);
            if (Number.isNaN(inches)) return match;
            const meters = convertLengthToMeters(0, inches, 0);
            const resolutionMeters = inferResolutionMetersFromNumber(raw, 'in');
            const normalizedMatch = normalizeDoubleApostrophes(match);
            const formatted = formatLengthMeasurement(meters, { resolutionMeters });
            return `${normalizedMatch} ${buildInsertedParenthetical(formatted, options)}`;
        });
    }

    if (FEET_SYMBOL_CHARS.some((sym) => converted.includes(sym))) {
        converted = converted.replace(FEET_SYMBOL_REGEX, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const value = args[1];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;
            const raw = String(value);
            const feet = convertToDecimal(raw);
            if (Number.isNaN(feet)) return match;
            const meters = convertLengthToMeters(feet, 0, 0);
            const resolutionMeters = inferResolutionMetersFromNumber(raw, 'ft');
            const formatted = formatLengthMeasurement(meters, { resolutionMeters });
            return `${match} ${buildInsertedParenthetical(formatted, options)}`;
        });
    }

    const lowerLen = converted.toLowerCase();
    if (
        lowerLen.includes('ft') ||
        lowerLen.includes('foot') ||
        lowerLen.includes('feet') ||
        lowerLen.includes(' in') ||
        lowerLen.includes('inch')
    ) {
        const feetInchesRegex = createRegexFromTemplate(
            UNITS.LENGTH.FEET_INCHES.PRIMARY,
            UNITS.LENGTH.FEET_INCHES.SECONDARY
        );

        converted = converted.replace(feetInchesRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;
            if (s) {
                const after = s.slice(offset + match.length, offset + match.length + 3);
                if (/^\s*(?:\^\s*2|²)/.test(after)) return match;
            }
            const parsed = parseMeasurementMatch(match, UNITS.LENGTH.FEET_INCHES);
            const meters = convertLengthToMeters(parsed.primary.value, parsed.secondary.value);
            if (meters === 0) return match;
            const resolutionMeters = inferResolutionMetersFromLengthMatch(
                match,
                UNITS.LENGTH.FEET_INCHES
            );
            const formatted = formatLengthMeasurement(meters, { resolutionMeters });
            return `${match} ${buildInsertedParenthetical(formatted, options)}`;
        });
    }

    if (lowerLen.includes(' mi') || lowerLen.includes('mile')) {
        const milesRegex = createRegexFromTemplate(UNITS.LENGTH.MILES.PRIMARY, '');

        converted = converted.replace(milesRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;
            if (s) {
                const after = s.slice(offset + match.length, offset + match.length + 3);
                if (/^\s*(?:\^\s*2|²)/.test(after)) return match;
            }
            const parsed = parseMeasurementMatch(match, UNITS.LENGTH.MILES);
            const meters = convertLengthToMeters(0, 0, parsed.primary.value);
            if (meters === 0) return match;
            const resolutionMeters = inferResolutionMetersFromNumber(
                extractFirstValueToken(match),
                'mi'
            );
            const formatted = formatLengthMeasurement(meters, { resolutionMeters });
            return `${match} ${buildInsertedParenthetical(formatted, options)}`;
        });
    }

    if (lowerLen.includes(' yd') || lowerLen.includes('yard')) {
        const yardsRegex = createRegexFromTemplate(UNITS.LENGTH.YARDS.PRIMARY, '');

        converted = converted.replace(yardsRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;
            if (s) {
                const after = s.slice(offset + match.length, offset + match.length + 3);
                if (/^\s*(?:\^\s*2|²)/.test(after)) return match;
            }
            const parsed = parseMeasurementMatch(match, UNITS.LENGTH.YARDS);
            const meters = convertLengthToMeters(0, 0, 0, parsed.primary.value);
            if (meters === 0) return match;
            const resolutionMeters = inferResolutionMetersFromNumber(
                extractFirstValueToken(match),
                'yd'
            );
            const formatted = formatLengthMeasurement(meters, { resolutionMeters });
            return `${match} ${buildInsertedParenthetical(formatted, options)}`;
        });
    }

    return converted;
}

module.exports = {
    convertLengthToMeters,
    convertLengthText,
};
