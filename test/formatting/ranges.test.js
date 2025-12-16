const {
    formatLengthRange,
    formatWeightRange,
    formatLiquidRange,
    formatTemperatureRange,
} = require('../../src/formatting/ranges.js');

describe('Range formatting helpers', () => {
    test('length range promotes to km when above 1000m', () => {
        expect(formatLengthRange(1500, 2500)).toBe('1.5–2.5 km');
        expect(formatLengthRange(5, 8)).toBe('5–8 m');
        expect(formatLengthRange(0.05, 0.15)).toBe('5–15 cm');
    });

    test('weight range uses kg when both values >= 1000g', () => {
        expect(formatWeightRange(1500, 2500)).toBe('1.5–2.5 kg');
        expect(formatWeightRange(500, 800)).toBe('500–800 g');
    });

    test('liquid range switches between L and ml', () => {
        expect(formatLiquidRange(1.5, 2.25)).toBe('1.5–2.25 L');
        expect(formatLiquidRange(0.25, 0.75)).toBe('250–750 ml');
    });

    test('temperature range rounds to integers', () => {
        expect(formatTemperatureRange(-10.4, 5.6)).toBe('-10–6');
    });
});
