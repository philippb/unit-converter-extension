const { convertText } = require('../src/content.js');

describe('Area Conversion (Square Feet)', () => {
    test('converts common square-foot variants to m²', () => {
        const cases = [
            {
                input: 'The lot is 170 sq ft in size',
                expected: 'The lot is 170 sq ft (15.79 m²) in size',
            },
            {
                input: 'Area: 200 square feet total',
                expected: 'Area: 200 square feet (18.58 m²) total',
            },
            {
                input: 'Panel area is 12 ft²',
                expected: 'Panel area is 12 ft² (1.11 m²)',
            },
            {
                input: 'Balcony is 85 sq. ft.',
                expected: 'Balcony is 85 sq. ft. (7.9 m²)',
            },
            {
                input: 'Storage is 350 sqft',
                expected: 'Storage is 350 sqft (32.52 m²)',
            },
            {
                input: 'Porch measures 60 ft^2',
                expected: 'Porch measures 60 ft^2 (5.57 m²)',
            },
            {
                input: 'Sign area 25 ft2',
                expected: 'Sign area 25 ft2 (2.32 m²)',
            },
            {
                input: 'Carpet covers 9 sq feet',
                expected: 'Carpet covers 9 sq feet (0.84 m²)',
            },
            {
                input: 'Tile is 1 sq foot',
                expected: 'Tile is 1 sq foot (0.09 m²)',
            },
            {
                input: 'Office is 1,000 sq ft',
                expected: 'Office is 1,000 sq ft (92.9 m²)',
            },
            {
                input: 'Sample is 1½ sq ft',
                expected: 'Sample is 1½ sq ft (0.14 m²)',
            },
        ];

        for (const { input, expected } of cases) {
            expect(convertText(input)).toBe(expected);
        }
    });
});

describe('Area Conversion (Square Inches)', () => {
    test('converts common square-inch variants to m²', () => {
        const cases = [
            {
                input: 'Tile area is 144 sq in',
                expected: 'Tile area is 144 sq in (0.09 m²)',
            },
            {
                input: 'Panel is 200 square inches',
                expected: 'Panel is 200 square inches (0.13 m²)',
            },
            {
                input: 'Label size 12 in²',
                expected: 'Label size 12 in² (0.01 m²)',
            },
            {
                input: 'Sample patch 36 sq. in',
                expected: 'Sample patch 36 sq. in (0.02 m²)',
            },
        ];

        for (const { input, expected } of cases) {
            expect(convertText(input)).toBe(expected);
        }
    });
});

describe('Area Conversion (Square Yards)', () => {
    test('converts common square-yard variants to m²', () => {
        const cases = [
            {
                input: 'The field is 2 sq yd',
                expected: 'The field is 2 sq yd (1.67 m²)',
            },
            {
                input: 'Rug size: 1 square yard',
                expected: 'Rug size: 1 square yard (0.84 m²)',
            },
            {
                input: 'Plot 3 yd²',
                expected: 'Plot 3 yd² (2.51 m²)',
            },
        ];

        for (const { input, expected } of cases) {
            expect(convertText(input)).toBe(expected);
        }
    });
});

describe('Area Conversion (Square Miles)', () => {
    test('converts common square-mile variants to m²', () => {
        const cases = [
            {
                input: 'Park covers 1 sq mi',
                expected: 'Park covers 1 sq mi (2.59 km²)',
            },
            {
                input: 'Reserve area 2 square miles',
                expected: 'Reserve area 2 square miles (5.18 km²)',
            },
            {
                input: 'Lake 0.5 mi²',
                expected: 'Lake 0.5 mi² (1.29 km²)',
            },
        ];

        for (const { input, expected } of cases) {
            expect(convertText(input)).toBe(expected);
        }
    });
});
