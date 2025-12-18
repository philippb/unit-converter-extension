describe('Architecture scaffolding', () => {
    test('constants module exists', () => {
        const constants = require('../src/utils/constants.js');
        expect(constants).toBeDefined();
    });

    test('units module exists', () => {
        const units = require('../src/units/index.js');
        expect(units).toBeDefined();
    });

    test('parsing module exists', () => {
        const parsing = require('../src/parsing/numbers.js');
        expect(parsing.convertToDecimal).toBeDefined();
    });
});
