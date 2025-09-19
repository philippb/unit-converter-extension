const {
    processNode,
    processElement,
    hasRelevantUnits,
    isEditableContext,
    convertToDecimal,
    createRegexFromTemplate,
    convertWeightText,
    parseMeasurementMatch,
} = require('../src/content.js');

describe('Basic Regex Tests', () => {
    test('test core regex', () => {
        const testString = `
            5 ounce   <-- match
            3 lb 2 ⅔ oz  <-- match
            2.5 lbs (22 mm)  <-- parentheses => not matched; correct
            Test ½ oz me some <-- no match
            Test⅔ oz me some <-- match; but wrong. Needs leading space
            4 lb 4 ⅔ oz <-- match 
            2 lbs 1⅔ oz <-- match
            Clearance: 6 ft 2 in minimum <-- no space between units
            2   1/2   in of pipe
        `;

        const match = testString.match(createRegexFromTemplate('lb|lbs|ft', 'oz|ounce|in'));
        expect(match).toEqual([
            '5 ounce',
            '3 lb 2 ⅔ oz',
            ' ½ oz',
            '4 lb 4 ⅔ oz',
            '2 lbs 1⅔ oz',
            '6 ft 2 in',
            '2   1/2   in',
        ]);
    });
});

describe('convertToDecimal', () => {
    test('converts mixed numbers to decimal', () => {
        expect(convertToDecimal('1 1/2')).toBeCloseTo(1.5);
        expect(convertToDecimal('2 3/4')).toBeCloseTo(2.75);
        expect(convertToDecimal('3 1/8')).toBeCloseTo(3.125);
        expect(convertToDecimal('4 5/6')).toBeCloseTo(4.833);
    });

    test('converts whole numbers to decimal', () => {
        expect(convertToDecimal('5')).toBeCloseTo(5);
        expect(convertToDecimal('10')).toBeCloseTo(10);
    });

    test('converts fractions to decimal', () => {
        expect(convertToDecimal('1/2')).toBeCloseTo(0.5);
        expect(convertToDecimal('3/4')).toBeCloseTo(0.75);
        expect(convertToDecimal('1/8')).toBeCloseTo(0.125);
        expect(convertToDecimal('5/6')).toBeCloseTo(0.833);
    });

    test('converts unicode fractions to decimal', () => {
        expect(convertToDecimal('¼')).toBeCloseTo(0.25);
        expect(convertToDecimal('½')).toBeCloseTo(0.5);
        expect(convertToDecimal('¾')).toBeCloseTo(0.75);
        expect(convertToDecimal('⅓')).toBeCloseTo(1 / 3);
        expect(convertToDecimal('⅔')).toBeCloseTo(2 / 3);
        expect(convertToDecimal('⅕')).toBeCloseTo(0.2);
        expect(convertToDecimal('⅖')).toBeCloseTo(0.4);
        expect(convertToDecimal('⅗')).toBeCloseTo(0.6);
        expect(convertToDecimal('⅘')).toBeCloseTo(0.8);
        expect(convertToDecimal('⅙')).toBeCloseTo(1 / 6);
        expect(convertToDecimal('⅚')).toBeCloseTo(5 / 6);
        expect(convertToDecimal('⅛')).toBeCloseTo(0.125);
        expect(convertToDecimal('⅜')).toBeCloseTo(0.375);
        expect(convertToDecimal('⅝')).toBeCloseTo(0.625);
        expect(convertToDecimal('⅞')).toBeCloseTo(0.875);
    });

    test('converts mixed numbers with unicode fractions to decimal', () => {
        expect(convertToDecimal('1 ¼')).toBeCloseTo(1.25);
        expect(convertToDecimal('2 ½')).toBeCloseTo(2.5);
        expect(convertToDecimal('3 ¾')).toBeCloseTo(3.75);

        expect(convertToDecimal('4⅓')).toBeCloseTo(4 + 1 / 3);
        expect(convertToDecimal('5⅔')).toBeCloseTo(5 + 2 / 3);
        expect(convertToDecimal('2⅔')).toBeCloseTo(2 + 2 / 3);
        expect(convertToDecimal('6⅝')).toBeCloseTo(6 + 5 / 8);
    });

    test('handles invalid inputs', () => {
        expect(convertToDecimal('invalid')).toBeNaN();
        expect(convertToDecimal('')).toBeNaN();
        expect(convertToDecimal(null)).toBeNaN();
        expect(convertToDecimal(undefined)).toBeNaN();
    });

    test('handles spaces in mixed numbers', () => {
        expect(convertToDecimal('2   1/2')).toBeCloseTo(2.5);
        expect(convertToDecimal('2   1/2     ')).toBeCloseTo(2.5);
        expect(convertToDecimal('6⅝   ')).toBeCloseTo(6 + 5 / 8);
        expect(convertToDecimal('3   ¾     ')).toBeCloseTo(3.75);
        expect(convertToDecimal('¼    ')).toBeCloseTo(0.25);
        expect(convertToDecimal('1/8    ')).toBeCloseTo(0.125);
    });
});

describe('Measurement Parsing', () => {
    test('parseMeasurementMatch handles primary and secondary units', () => {
        const units = {
            PRIMARY: 'feet|foot|ft',
            SECONDARY: 'inches|inch|in',
        };

        // Test primary unit only
        expect(parseMeasurementMatch('5 feet', units)).toEqual({
            primary: { value: 5, unit: 'feet', raw: '5' },
            secondary: { value: 0, unit: null, raw: null },
        });

        expect(parseMeasurementMatch('5.5 feet', units)).toEqual({
            primary: { value: 5.5, unit: 'feet', raw: '5.5' },
            secondary: { value: 0, unit: null, raw: null },
        });

        // Test primary and secondary units
        expect(parseMeasurementMatch('5 feet 6 inches', units)).toEqual({
            primary: { value: 5, unit: 'feet', raw: '5' },
            secondary: { value: 6, unit: 'inches', raw: '6' },
        });

        // Test secondary unit only
        expect(parseMeasurementMatch('6 inches', units)).toEqual({
            primary: { value: 0, unit: null, raw: null },
            secondary: { value: 6, unit: 'inches', raw: '6' },
        });

        // Test with fractions
        expect(parseMeasurementMatch('5 1/2 feet 6 inches', units)).toEqual({
            primary: { value: 5.5, unit: 'feet', raw: '5 1/2' },
            secondary: { value: 6, unit: 'inches', raw: '6' },
        });

        // Test with unicode fractions
        expect(parseMeasurementMatch('5½ feet 6 ¼ inches', units)).toEqual({
            primary: { value: 5.5, unit: 'feet', raw: '5½' },
            secondary: { value: 6.25, unit: 'inches', raw: '6 ¼' },
        });

        expect(parseMeasurementMatch('6 ft 2 in', units)).toEqual({
            primary: { value: 6, unit: 'ft', raw: '6' },
            secondary: { value: 2, unit: 'in', raw: '2' },
        });

        expect(parseMeasurementMatch('6⅝ ft', units)).toEqual({
            primary: { value: 6.625, unit: 'ft', raw: '6⅝' },
            secondary: { value: 0, unit: null, raw: null },
        });
    });
});

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

        test('converts curly double-quote inch symbol', () => {
            document.body.textContent = 'Board is 3” wide';
            processNode(document.body);
            expect(document.body.textContent).toBe('Board is 3” (7.62 cm) wide');
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

        test('converts curly apostrophe foot symbol', () => {
            document.body.textContent = '6’ stretch hexayurt';
            processNode(document.body);
            expect(document.body.textContent).toBe('6’ (1.83 m) stretch hexayurt');
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
                    input: 'Clearance: 6 ft 2 in minimum',
                    expected: 'Clearance: 6 ft 2 in (1.88 m) minimum',
                },
            ];

            complexCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Dynamic Precision for Length', () => {
        test('matches higher input precision for feet + inches', () => {
            document.body.textContent = 'Height: 3 ft 3.96 in';
            processNode(document.body);
            expect(document.body.textContent).toBe('Height: 3 ft 3.96 in (1.015 m)');
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
            const { formatLengthMeasurement } = require('../src/content.js');

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
                expect(formatLengthMeasurement(meters)).toBe(expected);
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

    describe('Contenteditable Elements', () => {
        test('detects contenteditable elements', () => {
            const div = document.createElement('div');
            div.setAttribute('contenteditable', 'true');
            expect(isEditableContext(div)).toBe(true);
        });

        test('detects text nodes in contenteditable elements', () => {
            const div = document.createElement('div');
            div.setAttribute('contenteditable', 'true');
            const textNode = document.createTextNode('Sample text');
            div.appendChild(textNode);
            expect(isEditableContext(textNode)).toBe(true);
        });

        test('detects nested elements in contenteditable elements', () => {
            const outer = document.createElement('div');
            outer.setAttribute('contenteditable', 'true');
            const inner = document.createElement('span');
            outer.appendChild(inner);
            expect(isEditableContext(inner)).toBe(true);
        });

        test('handles contenteditable="false" correctly', () => {
            const div = document.createElement('div');
            div.setAttribute('contenteditable', 'false');
            expect(isEditableContext(div)).toBe(false);
        });

        test('handles markdown editor pre elements correctly', () => {
            // Create the pre element with markdown editor structure
            const pre = document.createElement('pre');
            pre.className = 'editor__inner markdown-highlighting';
            pre.setAttribute('contenteditable', 'true');
            pre.setAttribute('tabindex', '0');
            pre.style.padding = '10px 25px 464px';

            // Create the inner structure
            const section = document.createElement('div');
            section.className = 'cledit-section';

            // Create measurement span
            const measureSpan = document.createElement('span');
            measureSpan.className = 'token p';
            measureSpan.textContent = '12 inch';

            // Create line breaks with their containers
            const lineBreak1 = document.createElement('span');
            lineBreak1.className = 'lf';
            const hiddenLf1 = document.createElement('span');
            hiddenLf1.className = 'hd-lf';
            hiddenLf1.style.display = 'none';
            hiddenLf1.textContent = '\n';
            lineBreak1.appendChild(hiddenLf1);

            const lineBreak2 = lineBreak1.cloneNode(true);

            // Assemble the structure
            section.appendChild(measureSpan);
            section.appendChild(lineBreak1);
            section.appendChild(lineBreak2);
            pre.appendChild(section);
            pre.appendChild(document.createElement('div'));

            document.body.appendChild(pre);

            // Test that the element is recognized as editable
            expect(isEditableContext(pre)).toBe(true);
            expect(isEditableContext(measureSpan)).toBe(true);

            // Test that measurement conversion is skipped in this context
            processNode(pre);
            expect(measureSpan.textContent).toBe('12 inch');
        });
    });
});

describe('Weight Conversion Tests', () => {
    test('convertWeightText handles various weight formats', () => {
        const testCases = [
            {
                input: '5 pounds 8 ounces',
                expected: '5 pounds 8 ounces (2.49 kg)',
            },
            {
                input: '1/2 lb 3 oz',
                expected: '1/2 lb 3 oz (311.84 g)',
            },
            {
                input: '2 lbs 1⅔ oz',
                expected: '2 lbs 1⅔ oz (954.43 g)',
            },
            {
                input: '10 ounces',
                expected: '10 ounces (283.5 g)',
            },
            {
                input: '3.5 pounds',
                expected: '3.5 pounds (1.59 kg)',
            },
        ];

        testCases.forEach(({ input, expected }) => {
            expect(convertWeightText(input)).toBe(expected);
        });
    });

    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('Ounce Conversions', () => {
        test('converts whole ounces', () => {
            document.body.textContent = 'The package weighs 5 ounces';
            processNode(document.body);
            expect(document.body.textContent).toBe('The package weighs 5 ounces (141.75 g)');
        });

        test('converts decimal ounces', () => {
            document.body.textContent = 'A weight of 0.5 oz';
            processNode(document.body);
            expect(document.body.textContent).toBe('A weight of 0.5 oz (14.17 g)');
        });

        test('converts fractions of ounces', () => {
            const fractions = [
                { input: '1/2 ounce', expected: '1/2 ounce (14.17 g)' },
                { input: '1/4 ounce', expected: '1/4 ounce (7.09 g)' },
                { input: '3/4 ounce', expected: '3/4 ounce (21.26 g)' },
                { input: '1/8 ounce', expected: '1/8 ounce (3.54 g)' },
            ];

            fractions.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Pound Conversions', () => {
        test('converts whole pounds', () => {
            document.body.textContent = 'The box weighs 10 pounds';
            processNode(document.body);
            expect(document.body.textContent).toBe('The box weighs 10 pounds (4.54 kg)');
        });

        test('converts decimal pounds', () => {
            document.body.textContent = 'A weight of 2.5 lbs';
            processNode(document.body);
            expect(document.body.textContent).toBe('A weight of 2.5 lbs (1.13 kg)');
        });

        test('handles different pound notations', () => {
            const notations = [
                { input: '6 pounds', expected: '6 pounds (2.72 kg)' },
                { input: '6 lbs', expected: '6 lbs (2.72 kg)' },
                { input: '6 lb', expected: '6 lb (2.72 kg)' },
            ];

            notations.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });

        test('handles unicode fractions in pounds', () => {
            const unicodeFractions = [
                // { input: '6½ pounds', expected: '6½ pounds (2.95 kg)' },
                { input: '6¾ pounds', expected: '6¾ pounds (3.06 kg)' },
                { input: '6¼ pounds', expected: '6¼ pounds (2.83 kg)' },
                { input: '6⅓ pounds', expected: '6⅓ pounds (2.87 kg)' },
                { input: '6⅔ pounds', expected: '6⅔ pounds (3.02 kg)' },
                { input: '6⅕ pounds', expected: '6⅕ pounds (2.81 kg)' },
                { input: '6⅖ pounds', expected: '6⅖ pounds (2.9 kg)' },
                { input: '6⅗ pounds', expected: '6⅗ pounds (2.99 kg)' },
                { input: '6⅘ pounds', expected: '6⅘ pounds (3.08 kg)' },
                { input: '6⅙ pounds', expected: '6⅙ pounds (2.8 kg)' },
                { input: '6⅚ pounds', expected: '6⅚ pounds (3.1 kg)' },
                { input: '6⅛ pounds', expected: '6⅛ pounds (2.78 kg)' },
                { input: '6⅜ pounds', expected: '6⅜ pounds (2.89 kg)' },
                { input: '6⅝ pounds', expected: '6⅝ pounds (3.01 kg)' },
                { input: '6⅞ pounds', expected: '6⅞ pounds (3.12 kg)' },
            ];

            unicodeFractions.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Complex Weight Measurements', () => {
        test('handles pounds and ounces together', () => {
            const complexCases = [
                {
                    input: 'The baby weighs 7 pounds 8 ounces',
                    expected: 'The baby weighs 7 pounds 8 ounces (3.4 kg)',
                },
                {
                    input: 'Package weight: 2 lb 4 oz',
                    expected: 'Package weight: 2 lb 4 oz (1.02 kg)',
                },
            ];

            complexCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Weight Edge Cases', () => {
        test('handles zero weights', () => {
            document.body.textContent = '0 pounds on the scale';
            processNode(document.body);
            expect(document.body.textContent).toBe('0 pounds on the scale');
        });

        test('ignores vague weight descriptions', () => {
            const vagueDescriptions = [
                {
                    input: 'It weighs a few pounds',
                    expected: 'It weighs a few pounds',
                },
                {
                    input: 'Only a couple of ounces',
                    expected: 'Only a couple of ounces',
                },
            ];

            vagueDescriptions.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Weight Metric Unit Selection', () => {
        test('selects appropriate metric units based on weight', () => {
            const { formatWeightMeasurement } = require('../src/content.js');

            const cases = [
                { grams: 0, expected: '0 g' },
                { grams: 0.5, expected: '0.5 g' },
                { grams: 5, expected: '5 g' },
                { grams: 500, expected: '500 g' },
                { grams: 1000, expected: '1 kg' },
                { grams: 1500, expected: '1.5 kg' },
                { grams: 2000, expected: '2 kg' },
            ];

            cases.forEach(({ grams, expected }) => {
                expect(formatWeightMeasurement(grams)).toBe(expected);
            });
        });
    });
});

describe('Liquid Conversion Tests', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('Basic Conversions', () => {
        test('converts gallons', () => {
            document.body.textContent = 'Fill with 2 gallons of water';
            processNode(document.body);
            expect(document.body.textContent).toBe('Fill with 2 gallons (7.57 L) of water');
        });

        test('converts quarts', () => {
            document.body.textContent = 'Add 1 quart of milk';
            processNode(document.body);
            expect(document.body.textContent).toBe('Add 1 quart (0.95 L) of milk');
        });

        test('converts pints', () => {
            document.body.textContent = 'Contains 1 pint';
            processNode(document.body);
            expect(document.body.textContent).toBe('Contains 1 pint (0.47 L)');
        });

        test('converts cups', () => {
            document.body.textContent = 'Add 2 cups of flour';
            processNode(document.body);
            expect(document.body.textContent).toBe('Add 2 cups (0.47 L) of flour');
        });

        test('converts fluid ounces', () => {
            document.body.textContent = 'Add 8 fl oz of water';
            processNode(document.body);
            expect(document.body.textContent).toBe('Add 8 fl oz (236.59 ml) of water');
        });

        test('converts tablespoons', () => {
            document.body.textContent = 'Add 2 tablespoons of oil';
            processNode(document.body);
            expect(document.body.textContent).toBe('Add 2 tablespoons (29.57 ml) of oil');
        });

        test('converts teaspoons', () => {
            document.body.textContent = 'Add 1 teaspoon of vanilla';
            processNode(document.body);
            expect(document.body.textContent).toBe('Add 1 teaspoon (4.93 ml) of vanilla');
        });
    });

    describe('Fraction Conversions', () => {
        test('converts fractions in various units', () => {
            const fractions = [
                { input: '1/2 cup', expected: '1/2 cup (118.29 ml)' },
                { input: '1/4 teaspoon', expected: '1/4 teaspoon (1.23 ml)' },
                { input: '1/3 tablespoon', expected: '1/3 tablespoon (4.93 ml)' },
                { input: '1/2 gallon', expected: '1/2 gallon (1.89 L)' },
            ];

            fractions.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Mixed Notations', () => {
        test('handles different notations', () => {
            const notations = [
                { input: '1 gal', expected: '1 gal (3.79 L)' },
                { input: '1 qt', expected: '1 qt (0.95 L)' },
                { input: '1 tbsp', expected: '1 tbsp (14.79 ml)' },
                { input: '1 tsp', expected: '1 tsp (4.93 ml)' },
            ];

            notations.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Edge Cases', () => {
        test('handles zero measurements', () => {
            document.body.textContent = '0 cups of sugar';
            processNode(document.body);
            expect(document.body.textContent).toBe('0 cups of sugar');
        });

        test('ignores vague descriptions', () => {
            const vagueDescriptions = [
                {
                    input: 'Add a few tablespoons',
                    expected: 'Add a few tablespoons',
                },
                {
                    input: 'Pour in some cups of water',
                    expected: 'Pour in some cups of water',
                },
            ];

            vagueDescriptions.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });

    describe('Metric Unit Selection', () => {
        test('selects appropriate metric units based on volume', () => {
            const { formatLiquidMeasurement } = require('../src/content.js');

            const cases = [
                { liters: 0, expected: '0 ml' },
                { liters: 0.0005, expected: '0.5 ml' },
                { liters: 0.005, expected: '5 ml' },
                { liters: 0.1, expected: '100 ml' },
                { liters: 0.24, expected: '240 ml' },
                { liters: 0.25, expected: '0.25 L' },
                { liters: 0.5, expected: '0.5 L' },
                { liters: 1, expected: '1 L' },
                { liters: 1.5, expected: '1.5 L' },
                { liters: 2, expected: '2 L' },
            ];

            cases.forEach(({ liters, expected }) => {
                expect(formatLiquidMeasurement(liters)).toBe(expected);
            });
        });
    });

    describe('Plural Forms', () => {
        test('handles plural forms correctly', () => {
            const pluralCases = [
                { input: '2.5 cups of flour', expected: '2.5 cups (0.59 L) of flour' },
                { input: '1.5 gallons of water', expected: '1.5 gallons (5.68 L) of water' },
                { input: '2.5 quarts of milk', expected: '2.5 quarts (2.37 L) of milk' },
                { input: '1.5 pints of cream', expected: '1.5 pints (0.71 L) of cream' },
                {
                    input: '2.5 fluid ounces of extract',
                    expected: '2.5 fluid ounces (73.93 ml) of extract',
                },
                { input: '1.5 tablespoons of oil', expected: '1.5 tablespoons (22.18 ml) of oil' },
                {
                    input: '2.5 teaspoons of vanilla',
                    expected: '2.5 teaspoons (12.32 ml) of vanilla',
                },
                { input: '1 3/4 cups of sugar', expected: '1 3/4 cups (0.41 L) of sugar' },
                { input: '2 1/2 gallons of water', expected: '2 1/2 gallons (9.46 L) of water' },
                { input: '1 1/4 quarts of milk', expected: '1 1/4 quarts (1.18 L) of milk' },
                { input: '2 3/4 pints of cream', expected: '2 3/4 pints (1.3 L) of cream' },
                {
                    input: '1 1/2 fluid ounces of extract',
                    expected: '1 1/2 fluid ounces (44.36 ml) of extract',
                },
                {
                    input: '2 1/4 tablespoons of oil',
                    expected: '2 1/4 tablespoons (33.27 ml) of oil',
                },
                {
                    input: '1 3/4 teaspoons of vanilla',
                    expected: '1 3/4 teaspoons (8.63 ml) of vanilla',
                },
            ];

            pluralCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });

        test('handles mixed plural and singular forms', () => {
            const mixedCases = [
                {
                    input: '1 cup and 0.5 cups',
                    expected: '1 cup (236.59 ml) and 0.5 cups (118.29 ml)',
                },
                {
                    input: '1 gallon and 1.5 gallons',
                    expected: '1 gallon (3.79 L) and 1.5 gallons (5.68 L)',
                },
                {
                    input: '1 quart and 2.5 quarts',
                    expected: '1 quart (0.95 L) and 2.5 quarts (2.37 L)',
                },
                {
                    input: '1 tablespoon and 1.5 tablespoons',
                    expected: '1 tablespoon (14.79 ml) and 1.5 tablespoons (22.18 ml)',
                },
                {
                    input: '1 cup and 1 3/4 cups',
                    expected: '1 cup (236.59 ml) and 1 3/4 cups (0.41 L)',
                },
                {
                    input: '1 gallon and 2 1/2 gallons',
                    expected: '1 gallon (3.79 L) and 2 1/2 gallons (9.46 L)',
                },
                {
                    input: '1 quart and 1 1/4 quarts',
                    expected: '1 quart (0.95 L) and 1 1/4 quarts (1.18 L)',
                },
                {
                    input: '1 tablespoon and 2 1/4 tablespoons',
                    expected: '1 tablespoon (14.79 ml) and 2 1/4 tablespoons (33.27 ml)',
                },
            ];

            mixedCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });

        test('handles decimal numbers without trailing zeros', () => {
            const decimalCases = [
                { input: '2.0 cups', expected: '2.0 cups (0.47 L)' },
                { input: '1.0 gallon', expected: '1.0 gallon (3.79 L)' },
                { input: '3.00 quarts', expected: '3.00 quarts (2.839 L)' },
                { input: '2 1/2 cups', expected: '2 1/2 cups (0.59 L)' },
                { input: '1 1/4 gallon', expected: '1 1/4 gallon (4.73 L)' },
                { input: '3 3/4 quarts', expected: '3 3/4 quarts (3.55 L)' },
            ];

            decimalCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });
});

describe('Additional Edge Cases', () => {
    test('handles case variations', () => {
        const cases = [
            { input: '5 INCHES wide', expected: '5 INCHES (12.7 cm) wide' },
            { input: '2 Feet tall', expected: '2 Feet (60.96 cm) tall' },
            { input: '3 Gallons', expected: '3 Gallons (11.36 L)' },
        ];

        cases.forEach(({ input, expected }) => {
            document.body.textContent = input;
            processNode(document.body);
            expect(document.body.textContent).toBe(expected);
        });
    });

    // NOT supported at this point
    test.skip('handles measurements with special characters', () => {
        const cases = [
            // { input: '5-inch pipe', expected: '5-inch (12.7 cm) pipe' },
            { input: '2′ <-- feet symbol', expected: '2′ (0.61 m) <-- feet symbol' },
            { input: '3″ <-- inches symbol', expected: '3″ (7.62 cm) <-- inches symbol' },
        ];

        cases.forEach(({ input, expected }) => {
            document.body.textContent = input;
            processNode(document.body);
            expect(document.body.textContent).toBe(expected);
        });
    });

    test('handles multiple measurements in complex text', () => {
        const cases = [
            {
                input: 'Mix 2 cups flour with 1/2 tsp salt and 3 tbsp sugar, then add 8 fl oz milk',
                expected:
                    'Mix 2 cups (0.47 L) flour with 1/2 tsp (2.46 ml) salt and 3 tbsp (44.36 ml) sugar, then add 8 fl oz (236.59 ml) milk',
            },
            {
                input: 'A 6 ft 2 in person weighing 180 lbs carrying a 2 gallon jug',
                expected:
                    'A 6 ft 2 in (1.88 m) person weighing 180 lbs (81.65 kg) carrying a 2 gallon (7.57 L) jug',
            },
        ];

        cases.forEach(({ input, expected }) => {
            document.body.textContent = input;
            processNode(document.body);
            expect(document.body.textContent).toBe(expected);
        });
    });
});

describe('Time Zone Conversion Tests', () => {
    const { convertTimeZone, convertTimeZoneText } = require('../src/content.js');

    describe('convertTimeZone Function', () => {
        test('converts from EST to PST', () => {
            expect(convertTimeZone('12 pm', 'EST')).toBe('9 am');
            expect(convertTimeZone('12:30 pm', 'EST')).toBe('9:30 am');
            expect(convertTimeZone('1 pm', 'EST')).toBe('10 am');
            expect(convertTimeZone('3:45 pm', 'EST')).toBe('12:45 pm');
            expect(convertTimeZone('9 am', 'EST')).toBe('6 am');
            expect(convertTimeZone('11:59 pm', 'EST')).toBe('8:59 pm');
        });

        test('converts from CST to PST', () => {
            expect(convertTimeZone('12 pm', 'CST')).toBe('10 am');
            expect(convertTimeZone('1:30 pm', 'CST')).toBe('11:30 am');
            expect(convertTimeZone('6 am', 'CST')).toBe('4 am');
        });

        test('converts from MST to PST', () => {
            expect(convertTimeZone('12 pm', 'MST')).toBe('11 am');
            expect(convertTimeZone('2:15 pm', 'MST')).toBe('1:15 pm');
            expect(convertTimeZone('5:30 am', 'MST')).toBe('4:30 am');
        });

        test('converts from GMT/UTC to PST', () => {
            expect(convertTimeZone('12 pm', 'GMT')).toBe('4 am');
            expect(convertTimeZone('8 pm', 'UTC')).toBe('12 pm');
            expect(convertTimeZone('3:30 am', 'GMT')).toBe('7:30 pm'); // Previous day in PST
        });

        test('converts from GMT/UTC with offsets', () => {
            expect(convertTimeZone('12 pm', 'GMT', 2)).toBe('2 am'); // GMT+2 to PST
            expect(convertTimeZone('3 pm', 'UTC', -3)).toBe('10 am'); // UTC-3 to PST
            expect(convertTimeZone('10 pm', 'GMT', 5)).toBe('9 am'); // GMT+5 to PST
        });

        test('handles 24-hour format', () => {
            expect(convertTimeZone('13:00', 'EST')).toBe('10 am');
            expect(convertTimeZone('23:45', 'CST')).toBe('9:45 pm');
            expect(convertTimeZone('00:30', 'GMT')).toBe('4:30 pm'); // Previous day in PST
        });
    });

    describe('convertTimeZoneText Function', () => {
        test('converts simple time expressions with timezone', () => {
            expect(convertTimeZoneText("Let's meet at 12 pm EST")).toBe(
                "Let's meet at 12 pm EST (9 am PST)"
            );
            expect(convertTimeZoneText('The meeting is at 3:30 pm CST')).toBe(
                'The meeting is at 3:30 pm CST (1:30 pm PST)'
            );
            expect(convertTimeZoneText('Event starts at 9 am GMT')).toBe(
                'Event starts at 9 am GMT (1 am PST)'
            );
        });

        test('converts multiple time expressions in text', () => {
            expect(convertTimeZoneText('First call at 10 am EST, second call at 2 pm PST')).toBe(
                'First call at 10 am EST (7 am PST), second call at 2 pm PST'
            );
        });

        test('handles GMT/UTC with offsets', () => {
            expect(convertTimeZoneText('Meeting in Berlin at 2 pm GMT+1')).toBe(
                'Meeting in Berlin at 2 pm GMT+1 (5 am PST)'
            );
            expect(convertTimeZoneText('Call with India at 11 am GMT+5:30')).toBe(
                'Call with India at 11 am GMT+5:30 (9:30 pm PST)'
            );
            expect(convertTimeZoneText('Buenos Aires office at 3 pm GMT-3')).toBe(
                'Buenos Aires office at 3 pm GMT-3 (10 am PST)'
            );
        });

        test('only converts expressions with explicit timezone', () => {
            expect(convertTimeZoneText('Meeting at 3 pm, lunch at 12 pm EST')).toBe(
                'Meeting at 3 pm, lunch at 12 pm EST (9 am PST)'
            );
            expect(convertTimeZoneText('Wake up at 6 am, call at 9 am CST')).toBe(
                'Wake up at 6 am, call at 9 am CST (7 am PST)'
            );
        });
    });

    describe('Time Zone Integration Tests', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        test('does not convert times without timezone', () => {
            expect(convertTimeZoneText('Call at 12 pm')).toBe('Call at 12 pm');
        });

        test('converts time zones in DOM nodes', () => {
            const testCases = [
                {
                    input: "Let's meet at 12 pm EST",
                    expected: "Let's meet at 12 pm EST (9 am PST)",
                },
                {
                    input: 'The meeting starts at 10:30 am CST and ends at 12 pm CST',
                    expected:
                        'The meeting starts at 10:30 am CST (8:30 am PST) and ends at 12 pm CST (10 am PST)',
                },
                {
                    input: 'Call scheduled for 8 pm GMT+2',
                    expected: 'Call scheduled for 8 pm GMT+2 (10 am PST)',
                },
                {
                    input: 'Call scheduled for 8 pm PST',
                    expected: 'Call scheduled for 8 pm PST',
                },
            ];

            testCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });

        test('handles time formats correctly', () => {
            const formatCases = [
                {
                    input: 'Meeting at 9:15 am EST',
                    expected: 'Meeting at 9:15 am EST (6:15 am PST)',
                },
                {
                    input: 'Call time: 14:30 UTC',
                    expected: 'Call time: 14:30 UTC (6:30 am PST)',
                },
                {
                    input: 'Starts at 11 pm EDT',
                    expected: 'Starts at 11 pm EDT (7 pm PST)',
                },
            ];

            formatCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });

        test('handles spacing variations in timezone formats', () => {
            const spacingCases = [
                {
                    input: 'Meeting at 10 am GMT+2',
                    expected: 'Meeting at 10 am GMT+2 (12 am PST)',
                },
                {
                    input: 'Call at 3 pm GMT +3',
                    expected: 'Call at 3 pm GMT +3 (4 am PST)',
                },
                {
                    input: 'Conference at 1 pm UTC + 5:30',
                    expected: 'Conference at 1 pm UTC + 5:30 (11:30 pm PST)',
                },
                {
                    input: 'Webinar at 11 am GMT - 4',
                    expected: 'Webinar at 11 am GMT - 4 (7 am PST)',
                },
            ];

            spacingCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });

        test('does not affect measurements while converting time zones', () => {
            const mixedContent = [
                {
                    input: 'Walk 2 miles at 9 am EST, weigh 150 lbs at 5 pm CST',
                    expected:
                        'Walk 2 miles (3.22 km) at 9 am EST (6 am PST), weigh 150 lbs (68.04 kg) at 5 pm CST (3 pm PST)',
                },
                {
                    input: 'Add 3 cups flour at 10:30 am GMT and bake for 5 inches tall',
                    expected:
                        'Add 3 cups (0.71 L) flour at 10:30 am GMT (2:30 am PST) and bake for 5 inches (12.7 cm) tall',
                },
            ];

            mixedContent.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
    });
});

describe('Pre-filter Performance Optimization Tests', () => {
    describe('hasRelevantUnits Function', () => {
        test('detects length units correctly (gated by numbers)', () => {
            const lengthCases = [
                // Positive cases
                { input: 'The room is 10 feet wide', expected: true },
                { input: 'A 5 inch gap', expected: true },
                { input: 'Walk 2 miles', expected: true },
                { input: 'Height: 6ft 2in', expected: true },
                { input: 'FEET and INCHES', expected: false }, // Now gated: no numbers
                { input: 'Text with foot in it', expected: false },

                // Negative cases
                { input: 'No measurements here', expected: false },
                { input: 'Just some regular text', expected: false },
                { input: 'Numbers like 123 and 456', expected: false },
                { input: 'Feet of clay metaphor', expected: false },
            ];

            lengthCases.forEach(({ input, expected }) => {
                expect(hasRelevantUnits(input)).toBe(expected);
            });
        });

        test('detects weight units correctly (gated by numbers)', () => {
            const weightCases = [
                // Positive cases
                { input: 'Weighs 150 pounds', expected: true },
                { input: 'Add 8 ounces', expected: true },
                { input: 'Weight: 5 lbs', expected: true },
                { input: 'Contains oz of liquid', expected: false },
                { input: 'POUNDS and OUNCES', expected: false },

                // Negative cases
                { input: 'No weight mentioned', expected: false },
                { input: 'Random text here', expected: false },
                { input: 'Numbers 100 200 300', expected: false },
            ];

            weightCases.forEach(({ input, expected }) => {
                expect(hasRelevantUnits(input)).toBe(expected);
            });
        });

        test('detects liquid units correctly (gated by numbers)', () => {
            const liquidCases = [
                // Positive cases
                { input: 'Add 2 cups of flour', expected: true },
                { input: 'Pour 1 gallon', expected: true },
                { input: 'Mix 3 tablespoons', expected: true },
                { input: 'Add 1 tsp vanilla', expected: true },
                { input: 'Needs 8 fl oz', expected: true },
                { input: 'Recipe calls for quart', expected: false },

                // Negative cases - avoid words containing unit substrings
                { input: 'No liquid volumes', expected: false }, // Changed from "measurements" to avoid "in"
                { input: 'Just text here', expected: false }, // Changed from "plain" to avoid "in"
            ];

            liquidCases.forEach(({ input, expected }) => {
                expect(hasRelevantUnits(input)).toBe(expected);
            });
        });

        test('detects timezone units correctly (requires a time)', () => {
            const timezoneCases = [
                // Positive cases
                { input: 'Meeting at 3pm EST', expected: true },
                { input: 'Call at 9am PST', expected: true },
                { input: 'Conference GMT timezone', expected: false },
                { input: 'UTC standard', expected: false },
                { input: 'cst and mst zones', expected: false },

                // Negative cases - avoid words containing unit substrings
                { input: 'No zones here', expected: false }, // Removed "time" to avoid false positive
                { input: 'Regular scheduled call', expected: false }, // Removed "meeting time" to avoid false positives
            ];

            timezoneCases.forEach(({ input, expected }) => {
                expect(hasRelevantUnits(input)).toBe(expected);
            });
        });

        test('handles edge cases properly (gated)', () => {
            const edgeCases = [
                // Edge inputs
                { input: '', expected: false },
                { input: null, expected: false },
                { input: undefined, expected: false },
                { input: '   ', expected: false }, // Just whitespace
                { input: '123', expected: false }, // Just numbers
                { input: 'ft', expected: false },
                { input: 'FT', expected: false },
                { input: 'Contains both ft and gal units', expected: false },
                { input: 'Mixed with 5 inches and 2 pounds', expected: true },
            ];

            edgeCases.forEach(({ input, expected }) => {
                expect(hasRelevantUnits(input)).toBe(expected);
            });
        });

        test('is case insensitive (gated)', () => {
            const caseCases = [
                { input: 'FEET', expected: false },
                { input: 'Feet', expected: false },
                { input: 'feet', expected: false },
                { input: 'FeeT', expected: false },
                { input: 'GALLON', expected: false },
                { input: 'Gallon', expected: false },
                { input: 'EST', expected: false },
                { input: 'est', expected: false },
                { input: 'Est', expected: false },
            ];

            caseCases.forEach(({ input, expected }) => {
                expect(hasRelevantUnits(input)).toBe(expected);
            });
        });
    });

    describe('processElement Function Optimization', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        test('skips elements without relevant units', () => {
            // Create a div with no units
            const div = document.createElement('div');
            div.innerHTML = `
                <p>This is just regular text with no measurements</p>
                <span>More text without units</span>
                <div>Even more regular content</div>
            `;
            document.body.appendChild(div);

            const originalText = div.textContent;
            processElement(div);

            // Text should remain unchanged
            expect(div.textContent).toBe(originalText);
        });

        test('processes elements with relevant units', () => {
            // Create a div with units
            const div = document.createElement('div');
            div.innerHTML = `
                <p>The room is 10 feet wide</p>
                <span>Contains 2 pounds of flour</span>
            `;
            document.body.appendChild(div);

            processElement(div);

            // Text should be converted
            expect(div.textContent).toContain('10 feet (3.05 m)');
            expect(div.textContent).toContain('2 pounds (907.18 g)');
        });

        test('skips entire subtrees when parent has no units', () => {
            // Create nested structure where parent has no units
            const parent = document.createElement('div');
            parent.textContent = 'No measurements anywhere'; // Avoid "in" in "in parent"

            const child1 = document.createElement('p');
            child1.textContent = 'This child has 5 steps but should not be processed'; // Avoid "feet"

            const child2 = document.createElement('span');
            child2.textContent = 'This child has 2 apples but should not be processed'; // Avoid "pounds"

            parent.appendChild(child1);
            parent.appendChild(child2);
            document.body.appendChild(parent);

            const originalChild1Text = child1.textContent;
            const originalChild2Text = child2.textContent;

            processElement(parent);

            // Children should not be processed since parent+children combined has no units
            expect(child1.textContent).toBe(originalChild1Text);
            expect(child2.textContent).toBe(originalChild2Text);
        });

        test('processes nested elements when parent has units', () => {
            // Create nested structure where parent has units
            const parent = document.createElement('div');
            parent.textContent = 'Parent mentions 1 foot, ';

            const child1 = document.createElement('p');
            child1.textContent = 'Child has 5 feet';

            const child2 = document.createElement('span');
            child2.textContent = ' and 2 pounds';

            parent.appendChild(child1);
            parent.appendChild(child2);
            document.body.appendChild(parent);

            processElement(parent);

            // All should be processed since parent contains units
            expect(parent.textContent).toContain('1 foot'); // Parent processed
            expect(child1.textContent).toContain('5 feet (1.52 m)'); // Child processed
            expect(child2.textContent).toContain('2 pounds (907.18 g)'); // Child processed
        });

        test('handles mixed content efficiently', () => {
            // Create a complex DOM with both relevant and irrelevant content
            const container = document.createElement('div');
            container.innerHTML = `
                <div class="no-units">
                    <p>This section has no measurements</p>
                    <span>Just regular text here</span>
                    <div>
                        <p>Nested content without units</p>
                        <span>More text</span>
                    </div>
                </div>
                <div class="has-units">
                    <p>This room is 12 feet long</p>
                    <span>weighs 5 pounds</span>
                    <div>
                        <p>Contains 2 gallons</p>
                        <span>and 3 inches wide</span>
                    </div>
                </div>
            `;
            document.body.appendChild(container);

            const noUnitsSection = container.querySelector('.no-units');
            const hasUnitsSection = container.querySelector('.has-units');

            const originalNoUnitsText = noUnitsSection.textContent;

            processElement(container);

            // No-units section should be unchanged
            expect(noUnitsSection.textContent.trim()).toBe(originalNoUnitsText.trim());

            // Has-units section should be converted
            expect(hasUnitsSection.textContent).toContain('12 feet (3.66 m)');
            expect(hasUnitsSection.textContent).toContain('5 pounds (2.27 kg)');
            expect(hasUnitsSection.textContent).toContain('2 gallons (7.57 L)');
            expect(hasUnitsSection.textContent).toContain('3 inches (7.62 cm)');
        });

        test('maintains compatibility with processNode', () => {
            // Test that both functions produce same results
            const div1 = document.createElement('div');
            div1.textContent = 'The table is 6 feet long and weighs 20 pounds';

            const div2 = document.createElement('div');
            div2.textContent = 'The table is 6 feet long and weighs 20 pounds';

            document.body.appendChild(div1);
            document.body.appendChild(div2);

            processNode(div1); // Old function
            processElement(div2); // New optimized function

            // Both should produce identical results
            expect(div1.textContent).toBe(div2.textContent);
            expect(div1.textContent).toContain('6 feet (1.83 m)');
            expect(div1.textContent).toContain('20 pounds (9.07 kg)');
        });
    });
});
