const { isExcludedContext, hasCodeRelatedClass } = require('../../src/exclusions/context.js');

describe('Exclusion context helpers', () => {
    test('detects code tags and skips nested text nodes', () => {
        document.body.innerHTML = '<pre><code>6 ft</code></pre>';
        const codeNode = document.querySelector('code');
        expect(isExcludedContext(codeNode)).toBe(true);

        const textNode = codeNode.firstChild;
        expect(isExcludedContext(textNode)).toBe(true);
    });

    test('allows conversions in regular text areas', () => {
        document.body.innerHTML = '<p>6 ft</p>';
        const textNode = document.querySelector('p').firstChild;
        expect(isExcludedContext(textNode)).toBe(false);
    });

    test('recognizes code-related classes', () => {
        expect(hasCodeRelatedClass('hljs')).toBe(true);
        expect(hasCodeRelatedClass('language-js')).toBe(true);
        expect(hasCodeRelatedClass('foo bar')).toBe(false);
    });
});
