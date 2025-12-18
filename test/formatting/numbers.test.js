const { formatNumberWithGrouping } = require('../../src/formatting/numbers.js');

describe('Number formatting helpers', () => {
    test('adds comma separators and formats decimals', () => {
        expect(formatNumberWithGrouping(12345.6, 2)).toBe('12,345.6');
        expect(formatNumberWithGrouping(1000, 0)).toBe('1,000');
        expect(formatNumberWithGrouping(1234.5678, 3)).toBe('1,234.568');
    });
});
