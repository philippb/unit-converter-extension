const { processNode } = require('../src/content.js');

describe('Comma Thousands Parsing and Formatting', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('parses comma-separated pounds and formats kg correctly', () => {
        document.body.textContent = '1,278 lb';
        processNode(document.body);
        expect(document.body.textContent).toBe('1,278 lb (579.69 kg)');
    });

    test('parses comma-separated inches symbol', () => {
        document.body.textContent = 'Length: 1,000"';
        processNode(document.body);
        expect(document.body.textContent).toBe('Length: 1,000" (25.4 m)');
    });

    test('parses comma-separated feet word form', () => {
        document.body.textContent = 'The wall is 1,234 feet long';
        processNode(document.body);
        expect(document.body.textContent).toBe('The wall is 1,234 feet (376.12 m) long');
    });

    test('parses comma-separated miles and outputs km with commas', () => {
        document.body.textContent = 'Trip: 1,000 miles';
        processNode(document.body);
        expect(document.body.textContent).toBe('Trip: 1,000 miles (1,609.34 km)');
    });

    test('parses comma-separated gallons and outputs liters with commas', () => {
        document.body.textContent = 'Capacity 1,000 gallons';
        processNode(document.body);
        expect(document.body.textContent).toBe('Capacity 1,000 gallons (3,785.41 L)');
    });

    // Note: miles ranges are not yet merged; left as future enhancement

    test('outputs thousands with commas for large kg results', () => {
        document.body.textContent = '10,000 lb';
        processNode(document.body);
        expect(document.body.textContent).toBe('10,000 lb (4,535.92 kg)');
    });
});
