const { convertText, processNode } = require('../../src/content.js');

describe('Issue Fixes', () => {
    test('#6: React hydration - currency + in', () => {
        expect(convertText('$2,400 in the first year')).toBe('$2,400 in the first year');
    });

    test('#9: Code/context skipping', () => {
        const codeSnippets = [
            ['<code>6" code</code>', '<code>6" code</code>'],
            ['<pre>  6 ft 3 in</pre>', '<pre>  6 ft 3 in</pre>'],
            ['<kbd>press ENTER 6 ft</kbd>', '<kbd>press ENTER 6 ft</kbd>'],
            ['<samp>output: 6×9"</samp>', '<samp>output: 6×9"</samp>'],
            ['<var>const size = 6" * 9"</var>', '<var>const size = 6" * 9"</var>'],
            ['<code><span>6" nested</span></code>', '<code><span>6" nested</span></code>'],
        ];

        for (const [input, expected] of codeSnippets) {
            document.body.innerHTML = `<div>${input}</div>`;
            const root = document.querySelector('div');
            processNode(root);
            expect(document.body.innerHTML).toContain(expected);
        }
        document.body.innerHTML =
            '<p>Code block: <code>6" should stay</code> outside feet 5 in</p>';
        const root = document.querySelector('p');
        require('../../src/content.js').processNode(root);
        expect(document.body.textContent).toContain('feet 5 in (');
    });

    test('#10: Negative Fahrenheit and formats', () => {
        const samples = [
            ['32°F', '32°F (0.00°C)'],
            ['212°F', '212°F (100°C)'],
            ['-40°F', '-40°F (-40.0°C)'],
            ['-10°F', '-10°F (-23.3°C)'],
            ['-4°F', '-4°F (-20.0°C)'],
            ['0°F', '0°F (-17.8°C)'],
            ['-40°F to 140°F', expect.stringContaining('-40°F (-40.0°C) to 140°F (60.0°C)')],
            ['98.6 Fahrenheit', '98.6 Fahrenheit (37.0°C)'],
        ];
        for (const [input, expected] of samples) {
            const output = convertText(input);
            if (expected && typeof expected.asymmetricMatch === 'function') {
                expect(output).toEqual(expected);
            } else {
                expect(output).toContain(expected);
            }
        }
    });

    describe('#12: Quotes exclusion', () => {
        const quotedInputs = [
            ['The "top 30" actions to unify', 'The "top 30" actions to unify'],
            ['"zip": "94110"', '"zip": "94110"'],
            ['"apn": "4210-040"', '"apn": "4210-040"'],
            ['The "section 22" was reviewed', 'The "section 22" was reviewed'],
            ["The 'top 30' actions to unify", "The 'top 30' actions to unify"],
        ];

        for (const [input, expected] of quotedInputs) {
            test(`does not convert quoted numbers in: ${input}`, () => {
                expect(convertText(input)).toBe(expected);
            });
        }

        test('still converts actual measurements in quotes', () => {
            expect(convertText('Board is 6" wide')).toContain('6" (');
            expect(convertText("It's 5' tall")).toContain("5' ");
        });
    });

    test('#15: Double apostrophes as inches', () => {
        const cases = [
            ['19\'\' Crossflow Wheels', ['(48.26 cm)']],
            ['Display: 5\'\'', ['(12.7 cm)']],
            ['Dimensions 19\'\' × 10\'\'', ['(48.26 cm)', '25.4 cm']],
        ];

        for (const [input, expectedValues] of cases) {
            const output = convertText(input);
            for (const expected of expectedValues) {
                expect(output).toContain(expected);
            }
        }
    });

    test('#17: Port numbers stay unchanged', () => {
        const portSamples = [
            'localhost:3000 in your browser',
            'http://127.0.0.1:8080/dashboard',
            'IP with port 192.168.1.1:5000 showing data',
            'ftp://server:21/data',
        ];
        for (const input of portSamples) {
            expect(convertText(input)).toBe(input);
        }
    });

    describe('#20: Shared inch dimension conversions', () => {
        const dimensionSamples = [
            ['6×9"', '6×9" (15.24x22.86 cm)'],
            ['6x9"', '6x9" (15.24x22.86 cm)'],
            ['Book is 6×9″ size', expect.stringContaining('15.24x22.86 cm')],
            ['8.5x11"', expect.stringContaining('21.59x27.94 cm')],
        ];

        for (const [input, expected] of dimensionSamples) {
            const result = convertText(input);
            if (expected && typeof expected.asymmetricMatch === 'function') {
                expect(result).toEqual(expected);
            } else {
                expect(result).toContain(expected);
            }
        }
    });

    test('#32: "in" abbreviation', () => {
        expect(convertText('2025 in California')).toBe('2025 in California');
        expect(convertText('6 in. pipe')).toContain('15.24 cm');
    });
});
