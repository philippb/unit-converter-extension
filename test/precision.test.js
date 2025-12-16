const {
    resolutionStepOfValueString,
    inferResolutionMetersFromNumber,
    inferResolutionMetersFromLengthMatch,
    inferResolutionFromValue,
    mergeResolutionSteps,
    computeDecimalPlaces,
    inferResolutionFromParsedMeasurement,
} = require('../src/utils/precision.js');
const { LENGTH_INCH_TO_METERS, LENGTH_FOOT_TO_METERS } = require('../src/utils/constants.js');

describe('Precision inference helpers', () => {
    test('resolutionStepOfValueString handles decimals, fractions, and unicode', () => {
        expect(resolutionStepOfValueString('3.960')).toBeCloseTo(0.001);
        expect(resolutionStepOfValueString('1/8')).toBeCloseTo(0.125);
        expect(resolutionStepOfValueString('6⅝')).toBeCloseTo(0.125); // unicode fraction in token
        expect(resolutionStepOfValueString('123')).toBeCloseTo(1);
    });

    test('inferResolutionMetersFromLengthMatch picks finest component step', () => {
        const units = {
            PRIMARY: "'|′|feet|foot|ft",
            SECONDARY: '"|″|inches|inch|in',
        };
        const m = inferResolutionMetersFromLengthMatch('3.0 ft 3.9 in', units);
        // 0.1 in -> 0.1 * 0.0254 = 0.00254 m (finer than 0.1 ft)
        expect(m).toBeCloseTo(0.00254, 6);
    });

    test('inferResolutionFromValue multiplies step by scale', () => {
        const result = inferResolutionFromValue('1/2', LENGTH_INCH_TO_METERS);
        expect(result).toBeCloseTo(0.5 * LENGTH_INCH_TO_METERS);
        const merged = mergeResolutionSteps([0.2, 0.05, 0]);
        expect(merged).toBeCloseTo(0.05);
    });

    test('computeDecimalPlaces increases precision when resolution demands it', () => {
        const decimals = computeDecimalPlaces({
            valueInUnit: 123,
            resolutionBase: 0.1,
            unitScale: 1,
            minDecimals: 0,
            maxDecimals: 4,
        });
        expect(decimals).toBeGreaterThanOrEqual(1);
    });

    test('inferResolutionFromParsedMeasurement merges primary and secondary scales', () => {
        const parsed = {
            primary: { raw: '5' },
            secondary: { raw: '6' },
        };
        const resolution = inferResolutionFromParsedMeasurement(parsed, {
            primary: LENGTH_FOOT_TO_METERS,
            secondary: LENGTH_INCH_TO_METERS,
        });
        expect(resolution).toBeCloseTo(LENGTH_INCH_TO_METERS);
    });
});
