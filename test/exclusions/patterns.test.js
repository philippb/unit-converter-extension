const {
    hasInvalidPrefix,
    isInsideQuotes,
    shouldExcludeMatch,
    shouldExcludeCurrencyIn,
} = require('../../src/exclusions/patterns.js');

describe('Exclusion pattern helpers', () => {
    test('detects colon before match (ports)', () => {
        const text = 'localhost:3000 in your browser';
        const matchStart = text.indexOf('3000');
        expect(hasInvalidPrefix(text, matchStart)).toBe(true);
        expect(shouldExcludeMatch({ text, matchStart, match: '3000 in' })).toBe(true);
    });

    test('detects currency words before inch abbreviation', () => {
        const text = 'USD in the first year';
        const matchStart = text.indexOf('in');
        expect(shouldExcludeCurrencyIn(text, matchStart, 'in')).toBe(true);
        expect(shouldExcludeMatch({ text, matchStart, match: 'in' })).toBe(true);
    });

    test('allows conversion when no currency context', () => {
        const text = '6 in pipe';
        const matchStart = text.indexOf('in');
        expect(shouldExcludeMatch({ text, matchStart, match: '6 in' })).toBe(false);
    });

    test('skips standalone inches before proper nouns', () => {
        const text = '2025 in California';
        const matchStart = text.indexOf('2025 in');
        expect(shouldExcludeMatch({ text, matchStart, match: '2025 in' })).toBe(true);
    });

    test('skips numbers inside quoted strings', () => {
        const text = 'The "top 30" actions';
        const matchStart = text.indexOf('30');
        expect(isInsideQuotes(text, matchStart, '30')).toBe(true);
        expect(shouldExcludeMatch({ text, matchStart, match: '30' })).toBe(true);
    });

    test('does not treat apostrophes inside words as quotes', () => {
        const text = "It's 5' tall";
        const matchStart = text.indexOf("5'");
        expect(isInsideQuotes(text, matchStart, "5'")).toBe(false);
        expect(shouldExcludeMatch({ text, matchStart, match: "5'" })).toBe(false);
    });
});
