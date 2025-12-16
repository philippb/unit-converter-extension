/**
 * Test for GitHub Issue #10: Bug with negative degree F
 * https://github.com/user/repo/issues/10
 *
 * Problem: Converting negative degree Fahrenheit doesn't take the `-` sign into account.
 *
 * Actual result:
 *   -40°F (4.44°C) to 140° F (60.0°C)
 *
 * Expected:
 *   -40°F (-40°C) to 140° F (60.0°C)
 */

const { processNode, convertTemperatureText } = require('../../../src/content.js');

describe('Issue #10: Negative Fahrenheit Temperature Conversion', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('converts -40°F correctly to -40°C', () => {
        document.body.textContent = '-40°F';
        processNode(document.body);

        const text = document.body.textContent;

        // Should contain the original value
        expect(text).toContain('-40°F');

        // Should convert to approximately -40°C (the exact point where F and C are equal)
        // Accept variations in decimal formatting
        expect(text).toMatch(/-40°F\s*\(\s*-40(?:\.\d{1,2})?\s*°\s*C\s*\)/);
    });

    test('handles negative Fahrenheit in a range (issue example)', () => {
        document.body.textContent = '-40°F to 140° F';
        processNode(document.body);

        const text = document.body.textContent;

        // Should contain both original values
        expect(text).toContain('-40°F');
        expect(text).toContain('140° F');

        // Should convert -40°F to approximately -40°C
        expect(text).toMatch(/-40°F\s*\(\s*-40(?:\.\d{1,2})?\s*°\s*C\s*\)/);

        // Should convert 140°F to 60°C
        expect(text).toMatch(/140°\s*F\s*\(\s*60(?:\.\d{1,2})?\s*°\s*C\s*\)/);
    });

    test('converts other negative Fahrenheit values correctly', () => {
        const testCases = [
            { input: '-20°F', expectedCelsius: -28.89 },
            { input: '-10°F', expectedCelsius: -23.33 },
            { input: '-5°F', expectedCelsius: -20.56 },
            { input: '-1°F', expectedCelsius: -18.33 },
        ];

        testCases.forEach(({ input, expectedCelsius }) => {
            document.body.textContent = input;
            processNode(document.body);

            const text = document.body.textContent;

            // Should contain the original negative value
            expect(text).toContain(input);

            // Should have a negative Celsius conversion
            expect(text).toMatch(
                new RegExp(
                    `${input.replace(/[°()]/g, '\\$&')}\\s*\\(\\s*-\\d+(?:\\.\\d{1,2})?\\s*°\\s*C\\s*\\)`
                )
            );

            // Verify the conversion is approximately correct (within 0.5 degrees)
            const celsiusMatch = text.match(/-(\d+(?:\.\d+)?)\s*°\s*C/);
            if (celsiusMatch) {
                const actualCelsius = -parseFloat(celsiusMatch[1]);
                expect(Math.abs(actualCelsius - expectedCelsius)).toBeLessThan(0.5);
            }
        });
    });

    test('converts negative Fahrenheit with direct convertTemperatureText function', () => {
        const result = convertTemperatureText('-40°F to 140° F');

        // Should convert -40°F to -40°C
        expect(result).toMatch(/-40°F\s*\(\s*-40(?:\.\d{1,2})?\s*°\s*C\s*\)/);

        // Should convert 140°F to 60°C
        expect(result).toMatch(/140°\s*F\s*\(\s*60(?:\.\d{1,2})?\s*°\s*C\s*\)/);
    });

    test('handles negative Fahrenheit in various formats', () => {
        const formats = ['-40 F', '-40° F', '-40°F', '-40 degrees F', '-40 Fahrenheit'];

        formats.forEach((format) => {
            const result = convertTemperatureText(format);

            // All should convert to negative Celsius
            expect(result).toMatch(/-40.*\(\s*-40(?:\.\d{1,2})?\s*°C\s*\)/);
        });
    });

    test('does not confuse negative with positive temperatures', () => {
        document.body.textContent = 'Range from -10°F to 10°F';
        processNode(document.body);

        const text = document.body.textContent;

        // -10°F should convert to negative Celsius (approximately -23.33°C)
        const negativeMatch = text.match(/-10°F\s*\(\s*(-?\d+(?:\.\d{1,2})?)\s*°\s*C\s*\)/);
        expect(negativeMatch).toBeTruthy();
        if (negativeMatch) {
            const negativeCelsius = parseFloat(negativeMatch[1]);
            expect(negativeCelsius).toBeLessThan(0);
            expect(Math.abs(negativeCelsius - -23.33)).toBeLessThan(0.5);
        }

        // 10°F should convert to negative Celsius (approximately -12.22°C)
        const positiveMatch = text.match(/\s10°F\s*\(\s*(-?\d+(?:\.\d{1,2})?)\s*°\s*C\s*\)/);
        expect(positiveMatch).toBeTruthy();
        if (positiveMatch) {
            const positiveCelsius = parseFloat(positiveMatch[1]);
            expect(positiveCelsius).toBeLessThan(0);
            expect(Math.abs(positiveCelsius - -12.22)).toBeLessThan(0.5);
        }
    });
});
