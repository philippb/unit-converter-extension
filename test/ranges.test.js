const { convertText } = require('../src/content.js');

describe('Range Conversion - Current Behavior', () => {
    // These tests describe desired behavior for ranges.
    // They will likely FAIL until range support is implemented.

    describe('Length Ranges', () => {
        test('0.1-10 miles (issue #18)', () => {
            const input = '0.1-10 miles';
            const expected = '0.1-10 miles (0.16–16.09 km)';
            expect(convertText(input)).toBe(expected);
        });

        test('5–8 inches (en dash)', () => {
            const input = 'The board is 5–8 inches long';
            const expected = 'The board is 5–8 inches (12.7–20.32 cm) long';
            expect(convertText(input)).toBe(expected);
        });

        test('5-8 inches (hyphen)', () => {
            const input = 'Allow 5-8 inches of clearance';
            const expected = 'Allow 5-8 inches (12.7–20.32 cm) of clearance';
            expect(convertText(input)).toBe(expected);
        });

        test('5 in – 8 in (spaced units)', () => {
            const input = 'Cut to 5 in – 8 in';
            const expected = 'Cut to 5 in – 8 in (12.7–20.32 cm)';
            expect(convertText(input)).toBe(expected);
        });

        test('Composite: 5 ft 6 in–6 ft 2 in', () => {
            const input = 'Height range 5 ft 6 in–6 ft 2 in';
            const expected = 'Height range 5 ft 6 in–6 ft 2 in (1.68–1.88 m)';
            expect(convertText(input)).toBe(expected);
        });
    });

    describe('Weight Ranges', () => {
        test('2-3 lbs', () => {
            const input = 'Package weight 2-3 lbs';
            const expected = 'Package weight 2-3 lbs (0.91–1.36 kg)';
            expect(convertText(input)).toBe(expected);
        });
    });

    describe('Liquid Ranges', () => {
        test('0.5 to 1 cup', () => {
            const input = 'Add 0.5 to 1 cup of milk';
            const expected = 'Add 0.5 to 1 cup (118.29–236.59 ml) of milk';
            expect(convertText(input)).toBe(expected);
        });
    });
});
