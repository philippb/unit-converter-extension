/**
 * Test for Issue #6: Fix errors while doing react development
 *
 * Issue: The word "in" after a currency amount (e.g., "$2,400 in") is being
 * incorrectly converted to metric units (inches -> meters).
 *
 * Example:
 * - Input: "Saved $2,400 in the first year alone..."
 * - Current (buggy): "Saved $2,400 in (60.96 m) the first year alone..."
 * - Expected: "Saved $2,400 in the first year alone..." (no conversion)
 *
 * The issue occurs because "in" is treated as "inches" even when it appears
 * after a currency amount where it's clearly being used as a preposition.
 */

const { processNode } = require('../../../src/content.js');

describe('Issue #6: Currency context should prevent "in" conversion', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('Currency symbol followed by "in"', () => {
        test('should not convert "in" after dollar amounts', () => {
            const testCases = [
                {
                    input: 'Saved $2,400 in the first year alone',
                    expected: 'Saved $2,400 in the first year alone',
                    description: 'Original issue example',
                },
                {
                    input: 'Earned $50,000 in revenue',
                    expected: 'Earned $50,000 in revenue',
                    description: 'Large dollar amount',
                },
                {
                    input: 'Made $100 in profit',
                    expected: 'Made $100 in profit',
                    description: 'Small dollar amount',
                },
                {
                    input: 'Costs $5.99 in stores',
                    expected: 'Costs $5.99 in stores',
                    description: 'Dollar amount with cents',
                },
            ];

            testCases.forEach(({ input, expected, description }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });

        test('should not convert "in" after other currency symbols', () => {
            const testCases = [
                {
                    input: 'Saved €2,400 in the first year',
                    expected: 'Saved €2,400 in the first year',
                    description: 'Euro symbol',
                },
                {
                    input: 'Made £1,000 in sales',
                    expected: 'Made £1,000 in sales',
                    description: 'Pound symbol',
                },
                {
                    input: 'Earned ¥10,000 in bonuses',
                    expected: 'Earned ¥10,000 in bonuses',
                    description: 'Yen symbol',
                },
            ];

            testCases.forEach(({ input, expected, description }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });

        test('should not convert "in" after currency words', () => {
            const testCases = [
                {
                    input: 'Saved 2,400 USD in revenue',
                    expected: 'Saved 2,400 USD in revenue',
                    description: 'USD currency code',
                },
                {
                    input: 'Made 1000 CAD in profit',
                    expected: 'Made 1000 CAD in profit',
                    description: 'CAD currency code',
                },
                {
                    input: 'Earned 500 EUR in bonuses',
                    expected: 'Earned 500 EUR in bonuses',
                    description: 'EUR currency code',
                },
            ];

            testCases.forEach(({ input, expected, description }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Valid inch conversions should still work', () => {
        test('should still convert legitimate inch measurements', () => {
            const testCases = [
                {
                    input: 'The pipe is 2 in diameter',
                    expected: 'The pipe is 2 in (5.08 cm) diameter',
                    description: 'Measurement context',
                },
                {
                    input: 'Board is 12 inches wide',
                    expected: 'Board is 12 inches (30.48 cm) wide',
                    description: 'Full word "inches"',
                },
                {
                    input: 'Height of 6 ft 2 in',
                    expected: 'Height of 6 ft 2 in (1.88 m)',
                    description: 'Feet and inches combo',
                },
            ];

            testCases.forEach(({ input, expected, description }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Edge cases with mixed content', () => {
        test('should handle text with both currency and measurements', () => {
            // This sentence has both a currency context AND a measurement
            // Only the measurement should be converted
            document.body.textContent = 'Saved $2,400 in revenue with a 5 inch margin';
            processNode(document.body);
            expect(document.body.textContent).toBe(
                'Saved $2,400 in revenue with a 5 inch (12.7 cm) margin'
            );
        });

        test('should handle currency amount without "in" word', () => {
            // Just to ensure we're not breaking normal currency handling
            document.body.textContent = 'Costs $5.99 at the store';
            processNode(document.body);
            expect(document.body.textContent).toBe('Costs $5.99 at the store');
        });
    });
});
