/**
 * Test for Issue #15: Convert inch correct on Tesla page
 *
 * Tesla product page shows inches like:
 * <span>19'' Crossflow Wheels</span>
 *
 * The extension currently translates this as feet instead of inches.
 * The double apostrophe (two single quotes) should be recognized as an inch symbol,
 * not as feet.
 */

const { processNode } = require('../../../src/content.js');

describe('Issue #15: Double apostrophe inch symbol on Tesla page', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('converts double apostrophe (two single quotes) as inches, not feet', () => {
        document.body.innerHTML = "<span>19'' Crossflow Wheels</span>";
        const span = document.body.querySelector('span');

        processNode(span);

        // 19 inches should convert to 48.26 cm
        // Should NOT convert as 19 feet (which would be 5.79 m)
        expect(span.textContent).toBe("19'' (48.26 cm) Crossflow Wheels");
    });

    test('handles double apostrophe in various contexts', () => {
        const testCases = [
            {
                input: "19'' Crossflow Wheels",
                expected: "19'' (48.26 cm) Crossflow Wheels",
                description: 'Tesla wheel example',
            },
            {
                input: "Screen size: 24''",
                expected: "Screen size: 24'' (60.96 cm)",
                description: 'Display measurement',
            },
            {
                input: "Pipe diameter 3.5''",
                expected: "Pipe diameter 3.5'' (8.89 cm)",
                description: 'Decimal measurement',
            },
            {
                input: "1/2'' bolt",
                expected: "1/2'' (1.27 cm) bolt",
                description: 'Fractional measurement',
            },
        ];

        testCases.forEach(({ input, expected, description }) => {
            document.body.innerHTML = `<div>${input}</div>`;
            const div = document.body.querySelector('div');

            processNode(div);

            expect(div.textContent).toBe(expected);
        });
    });

    test('does not confuse double apostrophe with single apostrophe for feet', () => {
        // Single apostrophe should still work for feet
        document.body.innerHTML = "<div>6' tall</div>";
        const div = document.body.querySelector('div');

        processNode(div);

        // 6 feet = 1.83 m
        expect(div.textContent).toBe("6' (1.83 m) tall");
    });

    test('handles mixed feet and inches with symbols correctly', () => {
        // Test that 6'2" gets converted separately (this is the current behavior)
        // The extension doesn't currently combine mixed symbol measurements
        document.body.innerHTML = '<div>6\'2"</div>';
        const div = document.body.querySelector('div');

        processNode(div);

        // Currently converts 6' and 2" separately
        expect(div.textContent).toContain('1.83 m'); // 6 feet
        expect(div.textContent).toContain('5.08 cm'); // 2 inches
    });
});
