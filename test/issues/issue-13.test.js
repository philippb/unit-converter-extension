const { convertText, processNode } = require('../../src/content.js');

describe('Issue #13: AWG wire gauge support', () => {
    describe('Basic AWG conversions', () => {
        const awgSamples = [
            ['10 AWG wire', '10 AWG (2.588 mm) wire'],
            ['12 AWG wire', '12 AWG (2.053 mm) wire'],
            ['14 AWG wire', '14 AWG (1.628 mm) wire'],
            ['16 AWG wire', '16 AWG (1.291 mm) wire'],
        ];

        for (const [input, expected] of awgSamples) {
            test(`converts ${input}`, () => {
                expect(convertText(input)).toBe(expected);
            });
        }
    });

    describe('AWG in different contexts', () => {
        test('converts AWG in technical description', () => {
            const input = 'Use 12 AWG copper wire for this circuit';
            const output = convertText(input);
            expect(output).toContain('12 AWG (2.053 mm)');
        });

        test('converts AWG in product specifications', () => {
            const input = 'Wire gauge: 14 AWG';
            const output = convertText(input);
            expect(output).toContain('14 AWG (1.628 mm)');
        });

        test('converts AWG with hyphenated format', () => {
            const input = '16-AWG wire recommended';
            const output = convertText(input);
            expect(output).toContain('16-AWG (1.291 mm)');
        });
    });

    describe('Multiple AWG values', () => {
        test('converts multiple AWG values in same text', () => {
            const input = 'Available in 10 AWG, 12 AWG, and 14 AWG sizes';
            const output = convertText(input);
            expect(output).toContain('10 AWG (2.588 mm)');
            expect(output).toContain('12 AWG (2.053 mm)');
            expect(output).toContain('14 AWG (1.628 mm)');
        });
    });

    describe('AWG case variations', () => {
        test('converts lowercase awg', () => {
            const input = '12 awg wire';
            const output = convertText(input);
            expect(output).toContain('12 awg (2.053 mm)');
        });

        test('converts mixed case Awg', () => {
            const input = '14 Awg wire';
            const output = convertText(input);
            expect(output).toContain('14 Awg (1.628 mm)');
        });
    });

    describe('Edge cases', () => {
        test('does not convert AWG without number', () => {
            const input = 'AWG is a wire gauge standard';
            expect(convertText(input)).toBe(input);
        });

        test('converts AWG in DOM context', () => {
            document.body.innerHTML = '<p>Cable: 12 AWG solid copper</p>';
            const root = document.querySelector('p');
            processNode(root);
            expect(document.body.textContent).toContain('12 AWG (2.053 mm)');
        });
    });
});
