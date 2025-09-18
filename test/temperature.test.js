const { processNode } = require('../src/content.js');

describe('Temperature Conversion', () => {
    test('converts trailing oven temperature “400°F” in provided HTML', () => {
        document.body.innerHTML = `
            <p class="has-text-align-left">Peel, core and slice the apples. In a large mixing bowl, gently toss the apple slices, granulated sugar, light brown sugar, flour, cinnamon, nutmeg, lemon zest and lemon juice until well combined and set aside. Place the oven rack in the center position and preheat your oven to 400°F.</p>
        `;

        processNode(document.body);

        const p = document.querySelector('p.has-text-align-left');
        const text = p.textContent;

        // Ensure the original Fahrenheit value remains
        expect(text).toContain('400°F');

        // Assert a Celsius conversion is appended in parentheses at the end.
        // Accept common rounding variants (e.g., 204°C, 204.4°C, 204.44°C, 205°C).
        expect(text).toMatch(/400°F\s*\(\s*\d+(?:\.\d{1,2})?\s*°\s*C\s*\)\.$/);
    });

    test('handles common Fahrenheit variants', () => {
        const cases = [
            { input: 'Preheat oven to 400 F', re: /400\s*F\s*\(\s*\d+(?:\.\d{1,2})?°C\)/i },
            { input: 'Preheat oven to 400° F', re: /400°\s*F\s*\(\s*\d+(?:\.\d{1,2})?°C\)/i },
            {
                input: 'Preheat oven to 375 Fahrenheit',
                re: /375\s*Fahrenheit\s*\(\s*\d+(?:\.\d{1,2})?°C\)/i,
            },
        ];

        const { convertTemperatureText } = require('../src/content.js');
        cases.forEach(({ input, re }) => {
            const out = convertTemperatureText(input);
            expect(out).toMatch(re);
        });
    });

    test('does not convert Celsius values', () => {
        const { convertTemperatureText } = require('../src/content.js');

        const cases = ['Bake at 200°C', 'Simmer at 100 C', 'Low heat 30 deg C'];

        cases.forEach((input) => {
            const out = convertTemperatureText(input);
            expect(out).toBe(input);
        });
    });

    test('leaves apartment numbers ending in c unchanged', () => {
        document.body.textContent = '188 Minna St Apt 22c, San Francisco, CA 94105';
        processNode(document.body);
        expect(document.body.textContent).toBe('188 Minna St Apt 22c, San Francisco, CA 94105');
    });

    describe('Celsius formatting rules', () => {
        test('>= 100°C prints no decimals', () => {
            document.body.textContent = 'Preheat to 450°F'; // ~232.22°C
            processNode(document.body);
            expect(document.body.textContent).toMatch(/450°F \(232°C\)/);
        });

        test('>= 5°C and < 100°C prints 1 decimal', () => {
            document.body.textContent = 'Keep warm at 77°F'; // 25°C
            processNode(document.body);
            expect(document.body.textContent).toMatch(/77°F \(25\.0°C\)/);
        });

        test('< 5°C prints 2 decimals', () => {
            document.body.textContent = 'Chill to 40°F'; // 4.44°C
            processNode(document.body);
            expect(document.body.textContent).toMatch(/40°F \(4\.44°C\)/);
        });

        test('exactly 5°C uses 1 decimal', () => {
            document.body.textContent = 'Hold at 41°F'; // 5°C
            processNode(document.body);
            expect(document.body.textContent).toMatch(/41°F \(5\.0°C\)/);
        });
    });
});
