const {
    AREA_SQFT_TO_SQM,
    AREA_SQIN_TO_SQM,
    AREA_SQYD_TO_SQM,
    AREA_SQMI_TO_SQM,
    AREA_ACRE_TO_SQM,
    UNICODE_FRACTIONS,
} = require('../utils/constants.js');
const { convertToDecimal } = require('../parsing/numbers.js');
const { formatAreaMeasurement } = require('../formatting/units.js');
const { inferResolutionFromValue } = require('../utils/precision.js');
const { shouldExcludeMatch } = require('../exclusions/patterns.js');
const { buildInsertedParenthetical } = require('../utils/insertMarkers.js');

function shouldSkipMatch(match, offset, source) {
    return shouldExcludeMatch({ text: source, matchStart: offset, match });
}

function convertAreaText(text, options = {}) {
    let converted = text;
    const lower = converted.toLowerCase();

    if (
        lower.includes('sq ') ||
        lower.includes('sq.') ||
        lower.includes('square ') ||
        lower.includes('sqft') ||
        lower.includes(' ft2') ||
        lower.includes('ft^2') ||
        lower.includes('ft²') ||
        lower.includes(' in2') ||
        lower.includes('in^2') ||
        lower.includes('in²') ||
        lower.includes(' yd2') ||
        lower.includes('yd^2') ||
        lower.includes('yd²') ||
        lower.includes(' mi2') ||
        lower.includes('mi^2') ||
        lower.includes('mi²') ||
        lower.includes('acre')
    ) {
        const VALUE_PART = String.raw`(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)\s+\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+)[${UNICODE_FRACTIONS}]?|[${UNICODE_FRACTIONS}])`;

        const groups = [
            {
                units: String.raw`(?:sq\.?\s*ft\.?|sq\.?\s*feet|sq\.?\s*foot|square\s+feet|square\s+foot|sqft|ft\s*(?:\^\s*2|²|2))`,
                factor: AREA_SQFT_TO_SQM,
            },
            {
                units: String.raw`(?:sq\.?\s*in\.?|sq\.?\s*inch(?:es)?|square\s+inch(?:es)?|in\s*(?:\^\s*2|²|2))`,
                factor: AREA_SQIN_TO_SQM,
            },
            {
                units: String.raw`(?:sq\.?\s*yd\.?|sq\.?\s*yard(?:s)?|square\s+yard(?:s)?|yd\s*(?:\^\s*2|²|2))`,
                factor: AREA_SQYD_TO_SQM,
            },
            {
                units: String.raw`(?:sq\.?\s*mi\.?|sq\.?\s*mile(?:s)?|square\s+mile(?:s)?|mi\s*(?:\^\s*2|²|2))`,
                factor: AREA_SQMI_TO_SQM,
            },
            {
                units: String.raw`(?:acre(?:s)?)`,
                factor: AREA_ACRE_TO_SQM,
            },
        ];

        for (const { units, factor } of groups) {
            const areaRegex = new RegExp(String.raw`\b(${VALUE_PART})\s*${units}(?!\s*\()`, 'giu');
            converted = converted.replace(areaRegex, function () {
                const args = Array.from(arguments);
                const match = args[0];
                const value = args[1];
                const offset = args[args.length - 2];
                const source = args[args.length - 1];
                if (shouldSkipMatch(match, offset, source)) return match;
                const raw = String(value);
                const n = convertToDecimal(raw);
                if (Number.isNaN(n)) return match;
                const sqm = n * factor;
                const resolutionSquareMeters = inferResolutionFromValue(raw, factor);
                const formatted = formatAreaMeasurement(sqm, { resolutionSquareMeters });
                return `${match} ${buildInsertedParenthetical(formatted, options)}`;
            });
        }
    }

    return converted;
}

module.exports = {
    convertAreaText,
};
