const {
    LIQUID_GALLON_TO_L,
    LIQUID_QUART_TO_L,
    LIQUID_PINT_TO_L,
    LIQUID_CUP_TO_L,
    LIQUID_FLOZ_TO_L,
    LIQUID_TBSP_TO_L,
    LIQUID_TSP_TO_L,
} = require('../utils/constants.js');
const { createRegexFromTemplate } = require('../parsing/regex.js');
const { parseMeasurementMatch } = require('../parsing/measurement.js');
const { inferResolutionFromParsedMeasurement } = require('../utils/precision.js');
const { formatLiquidMeasurement } = require('../formatting/units.js');
const { shouldExcludeMatch } = require('../exclusions/patterns.js');
const { UNITS } = require('./index.js');

function shouldSkipMatch(match, offset, source) {
    return shouldExcludeMatch({ text: source, matchStart: offset, match });
}

function convertLiquidText(text) {
    let converted = text;
    const lower = converted.toLowerCase();

    if (
        lower.includes('gal') ||
        lower.includes('gallon') ||
        lower.includes('quart') ||
        lower.includes('qt')
    ) {
        const gallonsQuartsRegex = createRegexFromTemplate(
            UNITS.LIQUID.GALLONS_QUARTS.PRIMARY,
            UNITS.LIQUID.GALLONS_QUARTS.SECONDARY
        );

        converted = converted.replace(gallonsQuartsRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.GALLONS_QUARTS);
            const liters =
                parsed.primary.value * LIQUID_GALLON_TO_L +
                parsed.secondary.value * LIQUID_QUART_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
                primary: LIQUID_GALLON_TO_L,
                secondary: LIQUID_QUART_TO_L,
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
        });
    }

    if (lower.includes('cup') || lower.includes('fl oz') || lower.includes('fluid')) {
        const cupsFluidOuncesRegex = createRegexFromTemplate(
            UNITS.LIQUID.CUPS_FLOZ.PRIMARY,
            UNITS.LIQUID.CUPS_FLOZ.SECONDARY
        );

        converted = converted.replace(cupsFluidOuncesRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.CUPS_FLOZ);
            const liters =
                parsed.primary.value * LIQUID_CUP_TO_L + parsed.secondary.value * LIQUID_FLOZ_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
                primary: LIQUID_CUP_TO_L,
                secondary: LIQUID_FLOZ_TO_L,
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
        });
    }

    if (
        lower.includes('tbsp') ||
        lower.includes('tablespoon') ||
        lower.includes('tsp') ||
        lower.includes('teaspoon')
    ) {
        const tablespoonsTeaspoonsRegex = createRegexFromTemplate(
            UNITS.LIQUID.TBSP_TSP.PRIMARY,
            UNITS.LIQUID.TBSP_TSP.SECONDARY
        );

        converted = converted.replace(tablespoonsTeaspoonsRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.TBSP_TSP);
            const liters =
                parsed.primary.value * LIQUID_TBSP_TO_L + parsed.secondary.value * LIQUID_TSP_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
                primary: LIQUID_TBSP_TO_L,
                secondary: LIQUID_TSP_TO_L,
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
        });
    }

    if (lower.includes('gal') || lower.includes('gallon')) {
        const gallonsRegex = createRegexFromTemplate(UNITS.LIQUID.GALLONS.PRIMARY, '');

        converted = converted.replace(gallonsRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.GALLONS);
            const liters = parsed.primary.value * LIQUID_GALLON_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
                primary: LIQUID_GALLON_TO_L,
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
        });
    }

    if (lower.includes('quart') || lower.includes('qt')) {
        const quartsRegex = createRegexFromTemplate(UNITS.LIQUID.QUARTS.PRIMARY, '');

        converted = converted.replace(quartsRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.QUARTS);
            const liters = parsed.primary.value * LIQUID_QUART_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
                primary: LIQUID_QUART_TO_L,
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
        });
    }

    if (lower.includes('pint')) {
        const pintsRegex = createRegexFromTemplate(UNITS.LIQUID.PINTS.PRIMARY, '');

        converted = converted.replace(pintsRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.PINTS);
            const liters = parsed.primary.value * LIQUID_PINT_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
                primary: LIQUID_PINT_TO_L,
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
        });
    }

    return converted;
}

module.exports = {
    convertLiquidText,
};
