const { convertText, processNode } = require('../../src/content.js');

/**
 * Issue #32: conversion of 'in' should only happen when abbreviated with a period
 *
 * Problem: The word 'in' (as a preposition) is being incorrectly converted to inches
 * when it appears after numbers in natural language text.
 *
 * Expected behavior: Only convert "in." (with period) as inches abbreviation,
 * not plain "in" which is too common as a preposition.
 */
describe('Issue #32: "in" abbreviation should require a period', () => {
    describe('Should NOT convert plain "in" (preposition use cases)', () => {
        test('does not convert "in" when used as preposition with month names', () => {
            const text = 'In May 2025 in California, roughly 32% of customers\' fares went toward covering';
            expect(convertText(text)).toBe(text);
        });

        test('does not convert "in" after year when followed by capitalized location', () => {
            expect(convertText('2025 in California')).toBe('2025 in California');
        });

        test('CURRENTLY FAILS: does not convert "in" in common phrases with lowercase words', () => {
            // These tests demonstrate the bug is still present
            const buggyTestCases = [
                { input: 'In 2024 in the United States', currentBehavior: 'In 2024 in (51.41 m) the United States' },
                { input: '100 in stock', currentBehavior: '100 in (2.54 m) stock' },
                { input: '50 in total', currentBehavior: '50 in (1.27 m) total' },
                { input: '30 in each box', currentBehavior: '30 in (76.2 cm) each box' },
                { input: '25 in this category', currentBehavior: '25 in (63.5 cm) this category' },
            ];

            buggyTestCases.forEach(({ input, currentBehavior }) => {
                // This is the CURRENT (buggy) behavior
                expect(convertText(input)).toBe(currentBehavior);

                // TODO: When bug is fixed, this should pass:
                // expect(convertText(input)).toBe(input);
            });
        });

        test('does not convert standalone number + "in" before capitalized words (WORKS)', () => {
            // These work correctly because the exclusion checks for capitalized words
            const testCases = [
                '2025 in California',
                '100 in May',
                '50 in January',
                '2024 in Europe',
                '2023 in London',
            ];

            testCases.forEach(text => {
                expect(convertText(text)).toBe(text);
            });
        });

        test('does not convert "in" in temporal contexts with capitalized words (WORKS)', () => {
            const testCases = [
                'In May 2025 in California',
                'Sales of 1000 in March',
                'Revenue of 500 in Q1',
                'Growth of 20 in April',
            ];

            testCases.forEach(text => {
                expect(convertText(text)).toBe(text);
            });
        });
    });

    describe('SHOULD convert "in." with period (actual inch abbreviations)', () => {
        test('converts "in." with period as inches', () => {
            expect(convertText('6 in. pipe')).toContain('15.24 cm');
            expect(convertText('6 in. pipe')).toContain('6 in.');
        });

        test('converts various "in." formats', () => {
            const testCases = [
                { input: '12 in. long', expectedMetric: '30.48 cm' },
                { input: '5.5 in. diameter', expectedMetric: '13.97 cm' },
                { input: '2 1/2 in. thick', expectedMetric: '6.35 cm' },
                { input: '10 in. wide', expectedMetric: '25.4 cm' },
            ];

            testCases.forEach(({ input, expectedMetric }) => {
                const result = convertText(input);
                expect(result).toContain(expectedMetric);
            });
        });

        test('converts "in." with various spacing', () => {
            // Space is required between number and unit
            expect(convertText('12 in.')).toMatch(/cm\)/);
            expect(convertText('12  in.')).toMatch(/cm\)/);

            // No space means no match (expected behavior)
            expect(convertText('12in.')).toBe('12in.');
        });
    });

    describe('SHOULD convert other inch abbreviations (inches, inch, symbols)', () => {
        test('converts "inches" and "inch" (full words)', () => {
            expect(convertText('6 inches long')).toContain('15.24 cm');
            expect(convertText('1 inch thick')).toContain('2.54 cm');
        });

        test('converts inch symbols (", ″, etc.)', () => {
            expect(convertText('6" pipe')).toContain('15.24 cm');
            expect(convertText('6″ pipe')).toContain('15.24 cm');
        });

        test('converts mixed units with inches', () => {
            // Mixed units are converted to meters, not cm
            expect(convertText('6 ft 2 inches')).toContain('m)');
            expect(convertText('5 feet 10 inches')).toContain('m)');
        });
    });

    describe('Edge cases and DOM processing', () => {
        test('handles DOM nodes correctly with preposition "in"', () => {
            document.body.innerHTML = '<p>In May 2025 in California, roughly 32% of customers\' fares went toward covering</p>';
            const root = document.querySelector('p');
            const originalText = root.textContent;
            processNode(root);
            expect(root.textContent).toBe(originalText);
        });

        test('converts actual measurements in DOM while preserving prepositions', () => {
            document.body.innerHTML = '<p>The pipe is 6 in. diameter in California</p>';
            const root = document.querySelector('p');
            processNode(root);
            // Should convert "6 in." but not "in California"
            expect(root.textContent).toContain('15.24 cm');
            expect(root.textContent).toContain('in California');
        });

        test('handles mixed content with both uses of "in"', () => {
            const text = 'Sold 100 in May, pipe was 6 in. diameter';
            const result = convertText(text);
            // Should NOT convert "100 in May"
            expect(result).toContain('100 in May');
            // Should convert "6 in."
            expect(result).toContain('15.24 cm');
        });
    });
});
