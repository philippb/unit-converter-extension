const { processNode } = require('../src/content.js');

describe('Currency-prefixed amounts should not trigger unit conversion', () => {
    test('does not convert "$22 in July" (inch preposition false positive)', () => {
        document.body.innerHTML = '<p>Price: $22 in July</p>';
        const root = document.querySelector('p');
        processNode(root);
        expect(root.textContent).toBe('Price: $22 in July');
    });

    test('does not convert other currency symbols like € and £', () => {
        document.body.innerHTML = '<div>Deal: €19 in stock — Save £5 in taxes</div>';
        const root = document.querySelector('div');
        processNode(root);
        expect(root.textContent).toBe('Deal: €19 in stock — Save £5 in taxes');
    });
    test('still converts valid measurements without currency prefix', () => {
        document.body.innerHTML = '<p>Size: 22 in monitor</p>';
        const root = document.querySelector('p');
        processNode(root);
        expect(root.textContent).toMatch(/Size: 22 in \(55\.88 cm\) monitor/);
    });
});
