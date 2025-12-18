const { formatNumberWithGrouping } = require('./numbers.js');
const { computeDecimalPlaces } = require('../utils/precision.js');

function formatMeasurement(baseValue, options) {
    const { resolutionBase, units } = options;
    if (!(units && units.length)) return '';
    const lastIndex = units.length - 1;
    for (let i = 0; i < units.length; i++) {
        const config = units[i];
        const { threshold, scale, label } = config;
        const matches = Math.abs(baseValue) >= threshold || i === lastIndex;
        if (!matches) continue;
        const valueInUnit = baseValue * scale;
        const decimals = computeDecimalPlaces({
            valueInUnit,
            resolutionBase,
            unitScale: scale,
            minDecimals: config.minDecimals,
            maxDecimals: config.maxDecimals,
            magnitudeCaps: config.magnitudeCaps,
            allowResolution: config.allowResolution !== false,
        });
        return `${formatNumberWithGrouping(valueInUnit, decimals)} ${label}`;
    }
    return '';
}

function formatLengthMeasurement(meters, options = {}) {
    const { resolutionMeters } = options;
    if (meters === 0) return '0 cm';

    return formatMeasurement(meters, {
        resolutionBase: resolutionMeters,
        units: [
            {
                threshold: 1000,
                scale: 1 / 1000,
                label: 'km',
                minDecimals: 0,
                maxDecimals: 2,
                magnitudeCaps: [
                    { threshold: 1000, decimals: 0 },
                    { threshold: 100, decimals: 1 },
                    { threshold: 0, decimals: 2 },
                ],
                allowResolution: false,
            },
            {
                threshold: 1,
                scale: 1,
                label: 'm',
                minDecimals: 2,
                maxDecimals: 3,
            },
            {
                threshold: 0.01,
                scale: 100,
                label: 'cm',
                minDecimals: 2,
                maxDecimals: 3,
            },
            {
                threshold: 0,
                scale: 1000,
                label: 'mm',
                minDecimals: 2,
                maxDecimals: 3,
            },
        ],
    });
}

function formatWeightMeasurement(grams, options = {}) {
    const { resolutionGrams } = options;
    if (grams === 0) return '0 g';

    return formatMeasurement(grams, {
        resolutionBase: resolutionGrams,
        units: [
            {
                threshold: 900,
                scale: 1 / 1000,
                label: 'kg',
                minDecimals: 2,
                maxDecimals: 4,
            },
            {
                threshold: 0,
                scale: 1,
                label: 'g',
                minDecimals: 2,
                maxDecimals: 4,
            },
        ],
    });
}

function formatLiquidMeasurement(liters, options = {}) {
    const { resolutionLiters } = options;
    if (liters === 0) return '0 ml';

    return formatMeasurement(liters, {
        resolutionBase: resolutionLiters,
        units: [
            {
                threshold: 0.25,
                scale: 1,
                label: 'L',
                minDecimals: 2,
                maxDecimals: 4,
            },
            {
                threshold: 0,
                scale: 1000,
                label: 'ml',
                minDecimals: 2,
                maxDecimals: 4,
            },
        ],
    });
}

function formatAreaMeasurement(squareMeters, options = {}) {
    const { resolutionSquareMeters } = options;
    if (squareMeters === 0) return '0 m²';

    return formatMeasurement(squareMeters, {
        resolutionBase: resolutionSquareMeters,
        units: [
            {
                threshold: 1_000_000,
                scale: 1 / 1_000_000,
                label: 'km²',
                minDecimals: 0,
                maxDecimals: 3,
                magnitudeCaps: [
                    { threshold: 1000, decimals: 0 },
                    { threshold: 10, decimals: 1 },
                    { threshold: 0, decimals: 2 },
                ],
                allowResolution: false,
            },
            {
                threshold: 10_000,
                scale: 1 / 10_000,
                label: 'ha',
                minDecimals: 2,
                maxDecimals: 4,
            },
            {
                threshold: 0,
                scale: 1,
                label: 'm²',
                minDecimals: 2,
                maxDecimals: 3,
            },
        ],
    });
}

function formatTemperatureCelsius(celsius, options = {}) {
    const { resolutionCelsius } = options;
    const decimals = computeDecimalPlaces({
        valueInUnit: celsius,
        resolutionBase: resolutionCelsius,
        unitScale: 1,
        minDecimals: 2,
        maxDecimals: 4,
        magnitudeCaps: [
            { threshold: 100, decimals: 0 },
            { threshold: 5, decimals: 1 },
            { threshold: 0, decimals: 2 },
        ],
    });
    return celsius.toFixed(decimals);
}

module.exports = {
    formatMeasurement,
    formatLengthMeasurement,
    formatWeightMeasurement,
    formatLiquidMeasurement,
    formatAreaMeasurement,
    formatTemperatureCelsius,
};
