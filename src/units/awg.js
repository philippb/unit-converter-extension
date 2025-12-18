const { LENGTH_INCH_TO_METERS } = require('../utils/constants.js');
const { formatLengthMeasurement } = require('../formatting/units.js');
const { shouldExcludeMatch } = require('../exclusions/patterns.js');
const { buildInsertedParenthetical } = require('../utils/insertMarkers.js');

const AWG_REGEX = /(\d{1,3}(?:\.\d+)?)(?:\s*-\s*)?\s*AWG\b/gi;
const AWG_RESOLUTION_METERS = 0.000001;

function convertAwgToMeters(gaugeValue) {
    const gauge = Number(gaugeValue);
    if (!Number.isFinite(gauge)) return NaN;
    const diameterInInches = 0.005 * Math.pow(92, (36 - gauge) / 39);
    return diameterInInches * LENGTH_INCH_TO_METERS;
}

function convertAwgText(text, options = {}) {
    if (!text || typeof text !== 'string') return text;
    if (!/awg/i.test(text)) return text;
    AWG_REGEX.lastIndex = 0;

    return text.replace(AWG_REGEX, function () {
        const args = Array.from(arguments);
        const match = args[0];
        const value = args[1];
        const offset = args[args.length - 2];
        const source = args[args.length - 1];

        if (shouldExcludeMatch({ text: source, matchStart: offset, match })) {
            return match;
        }

        const meters = convertAwgToMeters(value);
        if (Number.isNaN(meters)) return match;

        const formatted = formatLengthMeasurement(meters, {
            resolutionMeters: AWG_RESOLUTION_METERS,
        });
        return `${match} ${buildInsertedParenthetical(formatted, options)}`;
    });
}

module.exports = {
    convertAwgText,
    convertAwgToMeters,
};
