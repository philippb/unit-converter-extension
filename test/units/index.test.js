const { UNIT_SPECS, buildUnitDataFromSpecs, UNITS, UNIT_HINT_PATTERN } = require('../../src/units/index.js');

describe('Units registry', () => {
    test('buildUnitDataFromSpecs returns metadata that matches the module exports', () => {
        const result = buildUnitDataFromSpecs(UNIT_SPECS);
        expect(result).toEqual({ UNITS, UNIT_HINT_PATTERN });
        expect(result.UNITS.LENGTH).toBeDefined();
        expect(result.UNIT_HINT_PATTERN).toBeTruthy();
    });

    test('unit registry structure matches snapshot', () => {
        expect({ UNITS, UNIT_HINT_PATTERN }).toMatchSnapshot();
    });
});
