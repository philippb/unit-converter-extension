const { processNode, isEditableContext } = require('./content.js');

describe('Unit Conversion Tests', () => {
    // Load the content script before each test
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('Inch Conversions', () => {
        test('converts whole inches', () => {
            document.body.textContent = 'The table is 5 inches wide';
            processNode(document.body);
            expect(document.body.textContent).toBe('The table is 5 inches (12.7 cm) wide');
        });

        test('converts decimal inches', () => {
            document.body.textContent = 'A gap of 0.5 inches';
            processNode(document.body);
            expect(document.body.textContent).toBe('A gap of 0.5 inches (1.27 cm)');
        });

        test('converts common fractions', () => {
            const fractions = [
                { input: '1/2 inch', expected: '1/2 inch (1.27 cm)' },
                { input: '1/4 inch', expected: '1/4 inch (6.35 mm)' },
                { input: '3/4 inch', expected: '3/4 inch (1.9 cm)' },
                { input: '1/8 inch', expected: '1/8 inch (3.17 mm)' },
                { input: '3/8 inch', expected: '3/8 inch (9.52 mm)' },
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
                { input: '1 3/4 inches', expected: '1 3/4 inches (4.44 cm)' },
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
                    expected: 'A board 6 feet 5 1/2 inches (1.97 m) long',
                },
                {
                    input: 'Clearance: 6ft 2in minimum',
                    expected: 'Clearance: 6ft 2in (1.88 m) minimum',
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
            expect(document.body.textContent).toBe('0 inches from the wall');
        });

        test('handles measurements with spaces', () => {
            const spaceCases = [
                { input: '5    inches', expected: '5    inches (12.7 cm)' },
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

    describe('Metric Unit Selection', () => {
        test('selects appropriate metric units based on size', () => {
            const { formatMetricMeasurement } = require('./content.js');

            const cases = [
                { meters: 0, expected: '0 cm' },
                { meters: 0.005, expected: '5 mm' }, // 5mm
                { meters: 0.05, expected: '5 cm' }, // 5cm
                { meters: 0.5, expected: '50 cm' }, // 50cm
                { meters: 1.5, expected: '1.5 m' }, // 1.5m
                { meters: 100, expected: '100 m' }, // 100m
                { meters: 1500, expected: '1.5 km' }, // 1.5km
            ];

            cases.forEach(({ meters, expected }) => {
                expect(formatMetricMeasurement(meters)).toBe(expected);
            });
        });

        test('handles real-world measurements appropriately', () => {
            const complexCases = [
                {
                    input: 'The room is 1000 feet long',
                    expected: 'The room is 1000 feet (304.8 m) long',
                },
                {
                    input: 'A hair is 0.001 inches thick',
                    expected: 'A hair is 0.001 inches (0.03 mm) thick',
                },
                {
                    input: 'The road is 2 miles long',
                    expected: 'The road is 2 miles (3.22 km) long',
                },
            ];

            complexCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Form Field Handling', () => {
        test('ignores text in input fields', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = 'Distance: 5 inches';
            document.body.appendChild(input);

            processNode(input);
            expect(input.value).toBe('Distance: 5 inches');
        });

        test('ignores text in textareas', () => {
            const textarea = document.createElement('textarea');
            textarea.value = 'The room is 10 feet wide';
            document.body.appendChild(textarea);

            processNode(textarea);
            expect(textarea.value).toBe('The room is 10 feet wide');
        });

        test('processes text in regular divs', () => {
            const div = document.createElement('div');
            div.textContent = 'The ceiling is 8 feet high';
            document.body.appendChild(div);

            processNode(div);
            expect(div.textContent).toBe('The ceiling is 8 feet (2.44 m) high');
        });
    });
});

describe('Editable Context Detection', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('Form Elements', () => {
        test('detects input elements', () => {
            const input = document.createElement('input');
            expect(isEditableContext(input)).toBe(true);
        });

        test('detects textarea elements', () => {
            const textarea = document.createElement('textarea');
            expect(isEditableContext(textarea)).toBe(true);
        });

        test('detects text nodes in input elements', () => {
            const input = document.createElement('input');
            const textNode = document.createTextNode('Sample text');
            input.appendChild(textNode);
            expect(isEditableContext(textNode)).toBe(true);
        });

        test('detects text nodes in textarea elements', () => {
            const textarea = document.createElement('textarea');
            const textNode = document.createTextNode('Sample text');
            textarea.appendChild(textNode);
            expect(isEditableContext(textNode)).toBe(true);
        });
    });

    describe('Non-Editable Elements', () => {
        test('regular divs are not editable', () => {
            const div = document.createElement('div');
            expect(isEditableContext(div)).toBe(false);
        });

        test('text nodes in regular divs are not editable', () => {
            const div = document.createElement('div');
            const textNode = document.createTextNode('Sample text');
            div.appendChild(textNode);
            expect(isEditableContext(textNode)).toBe(false);
        });

        test('spans are not editable', () => {
            const span = document.createElement('span');
            expect(isEditableContext(span)).toBe(false);
        });
    });
});
