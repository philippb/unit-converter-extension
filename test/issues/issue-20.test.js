/**
 * Test for Issue #20: "6x9" should be translated as AxB cm"
 *
 * Issue description:
 * When the input is `AxB"` for inches, the expected output should be `(AxB cm)`
 *
 * Example:
 * - Input: "6×9″"
 * - Actual (before fix): "6×9″ (22.86 cm)"
 * - Expected: "6×9″ (15.24x22.86 cm)"
 *
 * The issue is that when dimensions are specified with a shared inch symbol (e.g., 6×9"),
 * both dimensions should be converted individually and shown as "valueAxvalueB cm"
 */

const { convertText } = require('../../src/converter.js');

describe('Issue #20: Shared inch dimension conversions (AxB")', () => {
    test('converts 6×9" to show both dimensions', () => {
        const input = '6×9"';
        const result = convertText(input);

        // Should contain the conversion with both dimensions
        expect(result).toContain('15.24x22.86 cm');
        // Should preserve the original format
        expect(result).toContain('6×9"');
        // Full expected output
        expect(result).toBe('6×9" (15.24x22.86 cm)');
    });

    test('converts 6x9" (lowercase x) to show both dimensions', () => {
        const input = '6x9"';
        const result = convertText(input);

        expect(result).toContain('15.24x22.86 cm');
        expect(result).toBe('6x9" (15.24x22.86 cm)');
    });

    test('converts dimensions in context (matches issue description scenario)', () => {
        // The original issue showed: "o generate 6×9″ (22.86 cm), data-driven p"
        // where only the second dimension was converted
        // Testing the text WITHOUT pre-existing conversion to verify fix
        const input = 'o generate 6×9″, data-driven p';
        const result = convertText(input);

        // Should convert both dimensions, not just one
        expect(result).toContain('15.24x22.86 cm');
        expect(result).toContain('6×9″ (15.24x22.86 cm)');
    });

    test('converts Book is 6×9″ size', () => {
        const input = 'Book is 6×9″ size';
        const result = convertText(input);

        expect(result).toContain('15.24x22.86 cm');
        expect(result).toBe('Book is 6×9″ (15.24x22.86 cm) size');
    });

    test('converts 8.5x11" (standard letter size)', () => {
        const input = '8.5x11"';
        const result = convertText(input);

        expect(result).toContain('21.59x27.94 cm');
        expect(result).toBe('8.5x11" (21.59x27.94 cm)');
    });

    test('converts 12×18" dimensions', () => {
        const input = '12×18"';
        const result = convertText(input);

        expect(result).toContain('30.48x45.72 cm');
        expect(result).toBe('12×18" (30.48x45.72 cm)');
    });

    test('converts fractional dimensions like 4.5x6"', () => {
        const input = '4.5x6"';
        const result = convertText(input);

        expect(result).toContain('11.43x15.24 cm');
        expect(result).toBe('4.5x6" (11.43x15.24 cm)');
    });

    test('converts dimensions with both values being fractions', () => {
        const input = '2.5×3.5″';
        const result = convertText(input);

        expect(result).toContain('6.35x8.89 cm');
        expect(result).toBe('2.5×3.5″ (6.35x8.89 cm)');
    });

    test('handles dimensions in a sentence', () => {
        const input = 'The photo measures 5x7" and looks great.';
        const result = convertText(input);

        expect(result).toContain('12.7x17.78 cm');
        expect(result).toContain('5x7" (12.7x17.78 cm)');
    });
});
