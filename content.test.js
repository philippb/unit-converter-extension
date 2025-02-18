const { processNode } = require('./content.js');

describe('Unit Conversion Tests', () => {
    // Load the content script before each test
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('Inch Conversions', () => {
        test('converts whole inches', () => {
            document.body.textContent = 'The table is 5 inches wide';
            processNode(document.body);
            expect(document.body.textContent).toBe('The table is 5 inches (12.70 cm) wide');
        });

        test('converts decimal inches', () => {
            document.body.textContent = 'A gap of 0.5 inches';
            processNode(document.body);
            expect(document.body.textContent).toBe('A gap of 0.5 inches (1.27 cm)');
        });

        test('converts common fractions', () => {
            const fractions = [
                { input: '1/2 inch', expected: '1/2 inch (1.27 cm)' },
                { input: '1/4 inch', expected: '1/4 inch (0.64 cm)' },
                { input: '3/4 inch', expected: '3/4 inch (1.91 cm)' },
                { input: '1/8 inch', expected: '1/8 inch (0.32 cm)' },
                { input: '3/8 inch', expected: '3/8 inch (0.95 cm)' },
            ];

            fractions.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });

        test('converts mixed numbers', () => {
            const mixedNumbers = [
                { input: '2 1/2 inches', expected: '2 1/2 inches (6.35 cm)' },
                { input: '1 3/4 inches', expected: '1 3/4 inches (4.45 cm)' },
                { input: '3 1/8 inches', expected: '3 1/8 inches (7.94 cm)' },
            ];

            mixedNumbers.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Feet Conversions', () => {
        test('converts whole feet', () => {
            document.body.textContent = 'The ceiling is 8 feet high';
            processNode(document.body);
            expect(document.body.textContent).toBe('The ceiling is 8 feet (2.44 m) high');
        });

        test('converts decimal feet', () => {
            document.body.textContent = 'A length of 5.5 ft';
            processNode(document.body);
            expect(document.body.textContent).toBe('A length of 5.5 ft (1.68 m)');
        });

        test('handles different feet notations', () => {
            const notations = [
                { input: '6 feet', expected: '6 feet (1.83 m)' },
                { input: '6 ft', expected: '6 ft (1.83 m)' },
                { input: '6 foot', expected: '6 foot (1.83 m)' },
            ];

            notations.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Complex Measurements', () => {
        test('handles multiple measurements in the same text', () => {
            const complexCases = [
                {
                    input: 'The room is 10 feet long and 8 inches wide',
                    expected: 'The room is 10 feet (3.05 m) long and 8 inches (20.32 cm) wide',
                },
                {
                    input: 'A board 6 feet 5 1/2 inches long',
                    expected: 'A board 6 feet 5 1/2 inches (1.9685 m) long',
                },
                {
                    input: 'Clearance: 6ft 2in minimum',
                    expected: 'Clearance: 6ft 2in (1.8796 m) minimum',
                },
            ];

            complexCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Edge Cases', () => {
        test('handles zero measurements', () => {
            document.body.textContent = '0 inches from the wall';
            processNode(document.body);
            expect(document.body.textContent).toBe('0 inches (0.00 cm) from the wall');
        });

        test('handles measurements with spaces', () => {
            const spaceCases = [
                { input: '5    inches', expected: '5    inches (12.70 cm)' },
                { input: '2   1/2   inches', expected: '2   1/2   inches (6.35 cm)' },
            ];

            spaceCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });

        test('handles text without measurements', () => {
            document.body.textContent = 'This text has no measurements';
            processNode(document.body);
            expect(document.body.textContent).toBe('This text has no measurements');
        });

        test('ignores vague measurements without numbers', () => {
            const vagueDescriptions = [
                {
                    input: 'These are often buried a few inches underground',
                    expected: 'These are often buried a few inches underground',
                },
                {
                    input: 'Move it several feet to the left',
                    expected: 'Move it several feet to the left',
                },
                {
                    input: 'The cable is many inches too short',
                    expected: 'The cable is many inches too short',
                },
                {
                    input: 'It was mere inches away',
                    expected: 'It was mere inches away',
                },
            ];

            vagueDescriptions.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('MutationObserver', () => {
        test('converts measurements in dynamically added content', (done) => {
            const newElement = document.createElement('div');
            newElement.textContent = 'New content: 6 inches tall';

            document.body.appendChild(newElement);

            setTimeout(() => {
                expect(newElement.textContent).toBe('New content: 6 inches (15.24 cm) tall');
                done();
            }, 0);
        });
    });
});
