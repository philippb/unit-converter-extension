const {
    resolutionStepOfValueString,
    inferResolutionMetersFromNumber,
    inferResolutionMetersFromLengthMatch,
} = require('../src/content.js');

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
});
