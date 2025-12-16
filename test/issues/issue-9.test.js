const { processNode } = require('../../src/content.js');

describe('Issue #9: Exclude content in <code>', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('Inline code elements', () => {
        test('should not convert measurements inside <code> tags', () => {
            document.body.innerHTML = '<p>when we have <code>6 feet</code> in side code</p>';
            const codeElement = document.body.querySelector('code');
            const originalText = codeElement.textContent;

            processNode(document.body);

            // Content inside <code> should remain unchanged
            expect(codeElement.textContent).toBe(originalText);
            expect(codeElement.textContent).toBe('6 feet');
            expect(codeElement.textContent).not.toContain('(');
        });

        test('should not convert measurements with apostrophe symbol in <code> tags', () => {
            document.body.innerHTML = "<p>when we have <code>6'</code> in side code</p>";
            const codeElement = document.body.querySelector('code');
            const originalText = codeElement.textContent;

            processNode(document.body);

            expect(codeElement.textContent).toBe(originalText);
            expect(codeElement.textContent).toBe("6'");
            expect(codeElement.textContent).not.toContain('(');
        });

        test('should not convert measurements with inches in <code> tags', () => {
            document.body.innerHTML = '<p>when we have <code>12 inches</code> in side code</p>';
            const codeElement = document.body.querySelector('code');
            const originalText = codeElement.textContent;

            processNode(document.body);

            expect(codeElement.textContent).toBe(originalText);
            expect(codeElement.textContent).toBe('12 inches');
            expect(codeElement.textContent).not.toContain('(');
        });
    });

    describe('Pre-formatted code blocks', () => {
        test('should not convert measurements inside <pre> tags', () => {
            document.body.innerHTML = `<pre>let test = "12 feet"</pre>`;
            const preElement = document.body.querySelector('pre');
            const originalText = preElement.textContent;

            processNode(document.body);

            expect(preElement.textContent).toBe(originalText);
            expect(preElement.textContent).toBe('let test = "12 feet"');
            expect(preElement.textContent).not.toContain('(');
        });

        test('should not convert measurements inside <pre><code> tags', () => {
            document.body.innerHTML = `<pre><code>let test = "12 feet"</code></pre>`;
            const codeElement = document.body.querySelector('code');
            const originalText = codeElement.textContent;

            processNode(document.body);

            expect(codeElement.textContent).toBe(originalText);
            expect(codeElement.textContent).toBe('let test = "12 feet"');
            expect(codeElement.textContent).not.toContain('(');
        });

        test('should not convert multiple measurements in code block', () => {
            const codeContent = `function example() {
    let height = "6 feet";
    let width = "12 inches";
    let weight = "10 pounds";
}`;
            document.body.innerHTML = `<pre><code>${codeContent}</code></pre>`;
            const codeElement = document.body.querySelector('code');
            const originalText = codeElement.textContent;

            processNode(document.body);

            expect(codeElement.textContent).toBe(originalText);
            expect(codeElement.textContent).toContain('6 feet');
            expect(codeElement.textContent).toContain('12 inches');
            expect(codeElement.textContent).toContain('10 pounds');
            // None should be converted
            expect(codeElement.textContent).not.toContain('(1.83 m)');
            expect(codeElement.textContent).not.toContain('(30.48 cm)');
            expect(codeElement.textContent).not.toContain('(4.54 kg)');
        });
    });

    describe('Mixed content - code and regular text', () => {
        test('should convert measurements outside code but not inside', () => {
            document.body.innerHTML =
                '<p>The room is 10 feet wide, but in code we have <code>6 feet</code> here.</p>';
            const paragraph = document.body.querySelector('p');
            const codeElement = paragraph.querySelector('code');

            processNode(document.body);

            // Regular text should be converted
            expect(paragraph.textContent).toContain('10 feet (3.05 m)');

            // Code content should NOT be converted
            expect(codeElement.textContent).toBe('6 feet');
            expect(codeElement.textContent).not.toContain('(');
        });

        test('should handle multiple code snippets in same paragraph', () => {
            document.body.innerHTML =
                '<p>Use <code>12 inches</code> or <code>1 foot</code> in your code, but the actual size is 5 feet.</p>';

            const paragraph = document.body.querySelector('p');
            const codeElements = paragraph.querySelectorAll('code');

            processNode(document.body);

            // Code elements should remain unchanged
            expect(codeElements[0].textContent).toBe('12 inches');
            expect(codeElements[1].textContent).toBe('1 foot');

            // Regular text should be converted
            expect(paragraph.textContent).toContain('5 feet (1.52 m)');
        });
    });

    describe('Other code-related tags from SKIP_TAGS', () => {
        test('should not convert measurements inside <kbd> tags', () => {
            document.body.innerHTML = '<p>Press <kbd>6 feet</kbd> to continue</p>';
            const kbdElement = document.body.querySelector('kbd');

            processNode(document.body);

            expect(kbdElement.textContent).toBe('6 feet');
            expect(kbdElement.textContent).not.toContain('(');
        });

        test('should not convert measurements inside <samp> tags', () => {
            document.body.innerHTML = '<p>Output: <samp>12 inches</samp></p>';
            const sampElement = document.body.querySelector('samp');

            processNode(document.body);

            expect(sampElement.textContent).toBe('12 inches');
            expect(sampElement.textContent).not.toContain('(');
        });

        test('should not convert measurements inside <var> tags', () => {
            document.body.innerHTML = '<p>The variable <var>height = 5 feet</var> is used</p>';
            const varElement = document.body.querySelector('var');

            processNode(document.body);

            expect(varElement.textContent).toBe('height = 5 feet');
            expect(varElement.textContent).not.toContain('(');
        });
    });

    describe('Nested code structures', () => {
        test('should not convert in deeply nested code structures', () => {
            document.body.innerHTML = `
                <div>
                    <article>
                        <pre><code><span class="keyword">let</span> distance = <span class="string">"12 feet"</span></code></pre>
                    </article>
                </div>
            `;

            const codeElement = document.body.querySelector('code');
            const originalText = codeElement.textContent;

            processNode(document.body);

            expect(codeElement.textContent).toBe(originalText);
            expect(codeElement.textContent).toContain('12 feet');
            expect(codeElement.textContent).not.toContain('(');
        });
    });

    describe('Code with class-based detection', () => {
        test('should not convert in elements with hljs class', () => {
            document.body.innerHTML = '<div class="hljs"><code>let height = 6 feet;</code></div>';
            const codeElement = document.body.querySelector('code');

            processNode(document.body);

            expect(codeElement.textContent).toBe('let height = 6 feet;');
            expect(codeElement.textContent).not.toContain('(');
        });

        test('should not convert in elements with highlight class', () => {
            document.body.innerHTML =
                '<div class="highlight"><pre>distance = 12 inches</pre></div>';
            const preElement = document.body.querySelector('pre');

            processNode(document.body);

            expect(preElement.textContent).toBe('distance = 12 inches');
            expect(preElement.textContent).not.toContain('(');
        });

        test('should not convert in elements with language- prefix class', () => {
            document.body.innerHTML =
                '<code class="language-javascript">const weight = "10 pounds";</code>';
            const codeElement = document.body.querySelector('code');

            processNode(document.body);

            expect(codeElement.textContent).toBe('const weight = "10 pounds";');
            expect(codeElement.textContent).not.toContain('(');
        });

        test('should not convert in elements with prism class', () => {
            document.body.innerHTML = '<pre class="prism"><code>height: 5 feet</code></pre>';
            const codeElement = document.body.querySelector('code');

            processNode(document.body);

            expect(codeElement.textContent).toBe('height: 5 feet');
            expect(codeElement.textContent).not.toContain('(');
        });
    });
});
