const { convertText } = require('../src/content.js');

describe('Area Conversion (Acres)', () => {
    test('converts singular/plural acres to metric area', () => {
        const cases = [
            {
                input: 'Lot size is 1 acre',
                expected: 'Lot size is 1 acre (4,046.86 m²)',
            },
            {
                input: 'The farm spans 2 acres',
                expected: 'The farm spans 2 acres (8,093.71 m²)',
            },
            {
                input: 'Ranch covers 100 acres',
                expected: 'Ranch covers 100 acres (40.47 ha)',
            },
            {
                input: 'Plot is 0.5 acre',
                expected: 'Plot is 0.5 acre (2,023.43 m²)',
            },
            {
                input: 'The park is 776,000 acres',
                expected: 'The park is 776,000 acres (3,140 km²)',
            },
            {
                input: 'The reserve spans 776,000.5 acres',
                expected: 'The reserve spans 776,000.5 acres (3,140 km²)',
            },
        ];
        for (const { input, expected } of cases) {
            expect(convertText(input)).toBe(expected);
        }
    });
});
