const {
    parseMeasurementMatch,
    extractFirstValueToken,
} = require('../../src/parsing/measurement.js');
const { UNITS } = require('../../src/units/index.js');

describe('Measurement parsing module', () => {
    test('parseMeasurementMatch extracts primary and secondary tokens', () => {
        const result = parseMeasurementMatch('5 ft 6 in', UNITS.LENGTH.FEET_INCHES);
        expect(result.primary.value).toBeCloseTo(5);
        expect(result.secondary.value).toBeCloseTo(6);
    });

    test('extractFirstValueToken returns first numeric token', () => {
        expect(extractFirstValueToken('Convert 12.5 miles')).toBe('12.5');
        expect(extractFirstValueToken('Range 2 1/2 ft')).toBe('2 1/2');
    });
});
