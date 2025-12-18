const { WEIGHT_OUNCE_TO_GRAMS, WEIGHT_POUND_TO_GRAMS } = require('../utils/constants.js');
const { createRegexFromTemplate } = require('../parsing/regex.js');
const { parseMeasurementMatch } = require('../parsing/measurement.js');
const { inferResolutionFromParsedMeasurement } = require('../utils/precision.js');
const { formatWeightMeasurement } = require('../formatting/units.js');
const { shouldExcludeMatch } = require('../exclusions/patterns.js');
const { UNITS } = require('./index.js');
const { buildInsertedParenthetical } = require('../utils/insertMarkers.js');

function shouldSkipMatch(match, offset, source) {
    return shouldExcludeMatch({ text: source, matchStart: offset, match });
}

function convertWeightToGrams(pounds = 0, ounces = 0) {
    return pounds * WEIGHT_POUND_TO_GRAMS + ounces * WEIGHT_OUNCE_TO_GRAMS;
}

function convertWeightText(text, options = {}) {
    let converted = text;
    const lower = converted.toLowerCase();
    if (
        lower.includes('lb') ||
        lower.includes('pound') ||
        lower.includes('oz') ||
        lower.includes('ounce')
    ) {
        const weightRegex = createRegexFromTemplate(UNITS.WEIGHT.PRIMARY, UNITS.WEIGHT.SECONDARY);
        converted = converted.replace(weightRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.WEIGHT);
            const grams = convertWeightToGrams(parsed.primary.value, parsed.secondary.value);
            if (grams === 0) return match;
            const resolutionGrams = inferResolutionFromParsedMeasurement(parsed, {
                primary: WEIGHT_POUND_TO_GRAMS,
                secondary: WEIGHT_OUNCE_TO_GRAMS,
            });
            const formatted = formatWeightMeasurement(grams, { resolutionGrams });
            return `${match} ${buildInsertedParenthetical(formatted, options)}`;
        });
    }
    return converted;
}

module.exports = {
    convertWeightToGrams,
    convertWeightText,
};
