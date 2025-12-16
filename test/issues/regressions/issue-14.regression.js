/**
 * Test for GitHub Issue #14: "don't convert in code"
 *
 * Issue: Content inside CodeMirror code editors is being converted when it shouldn't be.
 * Examples from the issue:
 * - "address": "1111 York St, Warren, AR 71671" (1.82 km) - incorrectly converted
 * - "fips": "05011" (127.28 m) - incorrectly converted
 * - "apn": "737-00089-000" (0 cm) - incorrectly converted
 * - "zip": "71671" (1.82 km) - incorrectly converted
 */

const { processNode } = require('../../../src/content.js');

describe("GitHub Issue #14 - Don't convert in code (CodeMirror)", () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('CodeMirror elements', () => {
        test('does not convert measurements in elements with cm- prefix classes', () => {
            // CodeMirror uses cm- prefixed classes for its tokens
            const codeElement = document.createElement('div');
            codeElement.className = 'CodeMirror';

            const line = document.createElement('pre');
            line.className = 'CodeMirror-line';

            const token = document.createElement('span');
            token.className = 'cm-string';
            token.textContent = '"1111 York St"';

            line.appendChild(token);
            codeElement.appendChild(line);
            document.body.appendChild(codeElement);

            processNode(codeElement);

            // Should NOT be converted
            expect(token.textContent).toBe('"1111 York St"');
            expect(token.textContent).not.toContain('km');
            expect(token.textContent).not.toContain('m)');
        });

        test('does not convert zip code "71671" in CodeMirror', () => {
            const codeElement = document.createElement('div');
            codeElement.className = 'CodeMirror';

            const span = document.createElement('span');
            span.className = 'cm-string';
            span.textContent = '"zip": "71671"';

            codeElement.appendChild(span);
            document.body.appendChild(codeElement);

            processNode(codeElement);

            // Should NOT be converted
            expect(span.textContent).toBe('"zip": "71671"');
            expect(span.textContent).not.toContain('km');
        });

        test('does not convert FIPS code "05011" in CodeMirror', () => {
            const codeElement = document.createElement('div');
            codeElement.className = 'CodeMirror';

            const span = document.createElement('span');
            span.className = 'cm-number';
            span.textContent = '"fips": "05011"';

            codeElement.appendChild(span);
            document.body.appendChild(codeElement);

            processNode(codeElement);

            // Should NOT be converted
            expect(span.textContent).toBe('"fips": "05011"');
            expect(span.textContent).not.toContain('m)');
        });

        test('does not convert APN "737-00089-000" in CodeMirror', () => {
            const codeElement = document.createElement('div');
            codeElement.className = 'CodeMirror';

            const span = document.createElement('span');
            span.className = 'cm-string';
            span.textContent = '"apn": "737-00089-000"';

            codeElement.appendChild(span);
            document.body.appendChild(codeElement);

            processNode(codeElement);

            // Should NOT be converted
            expect(span.textContent).toBe('"apn": "737-00089-000"');
            expect(span.textContent).not.toContain('cm');
        });

        test('does not convert full JSON address object in CodeMirror', () => {
            const codeElement = document.createElement('div');
            codeElement.className = 'CodeMirror';

            const jsonText = `{
  "address": "1111 York St, Warren, AR 71671",
  "fips": "05011",
  "apn": "737-00089-000",
  "zip": "71671"
}`;

            codeElement.textContent = jsonText;
            document.body.appendChild(codeElement);

            const originalText = codeElement.textContent;
            processNode(codeElement);

            // Should NOT be converted - text should remain unchanged
            expect(codeElement.textContent).toBe(originalText);
            expect(codeElement.textContent).not.toContain('km');
            expect(codeElement.textContent).not.toContain('m)');
            expect(codeElement.textContent).not.toContain('cm');
        });

        test('does not convert in nested CodeMirror structure', () => {
            // Simulate realistic CodeMirror DOM structure
            const container = document.createElement('div');
            container.className = 'CodeMirror cm-s-default';

            const lines = document.createElement('div');
            lines.className = 'CodeMirror-lines';

            const line1 = document.createElement('pre');
            line1.className = 'CodeMirror-line';
            const token1 = document.createElement('span');
            token1.className = 'cm-string';
            token1.textContent = '"address": "1111 York St"';
            line1.appendChild(token1);

            const line2 = document.createElement('pre');
            line2.className = 'CodeMirror-line';
            const token2 = document.createElement('span');
            token2.className = 'cm-string';
            token2.textContent = '"zip": "71671"';
            line2.appendChild(token2);

            lines.appendChild(line1);
            lines.appendChild(line2);
            container.appendChild(lines);
            document.body.appendChild(container);

            processNode(container);

            // Neither line should be converted
            expect(token1.textContent).toBe('"address": "1111 York St"');
            expect(token1.textContent).not.toContain('km');

            expect(token2.textContent).toBe('"zip": "71671"');
            expect(token2.textContent).not.toContain('km');
        });

        test('does not convert measurements in CodeMirror-code class', () => {
            const codeElement = document.createElement('div');
            codeElement.className = 'CodeMirror-code';
            codeElement.textContent = 'const distance = 1111; // 1111 feet';

            document.body.appendChild(codeElement);

            const originalText = codeElement.textContent;
            processNode(codeElement);

            // Should NOT be converted
            expect(codeElement.textContent).toBe(originalText);
            expect(codeElement.textContent).not.toContain('m)');
        });
    });

    describe('Regular code elements (non-CodeMirror)', () => {
        test('does not convert in <code> tags', () => {
            const code = document.createElement('code');
            code.textContent = 'const height = 1111;';
            document.body.appendChild(code);

            processNode(code);

            expect(code.textContent).toBe('const height = 1111;');
            expect(code.textContent).not.toContain('m)');
        });

        test('does not convert in <pre> tags', () => {
            const pre = document.createElement('pre');
            pre.textContent = 'address: 1111 York St';
            document.body.appendChild(pre);

            processNode(pre);

            expect(pre.textContent).toBe('address: 1111 York St');
            expect(pre.textContent).not.toContain('km');
        });

        test('does not convert in elements with hljs class', () => {
            const div = document.createElement('div');
            div.className = 'hljs';
            div.textContent = 'const distance = 1111 feet;';
            document.body.appendChild(div);

            processNode(div);

            expect(div.textContent).toBe('const distance = 1111 feet;');
            expect(div.textContent).not.toContain('m)');
        });

        test('does not convert in elements with language- prefix classes', () => {
            const div = document.createElement('div');
            div.className = 'language-javascript';
            div.textContent = 'const height = 5 feet;';
            document.body.appendChild(div);

            processNode(div);

            expect(div.textContent).toBe('const height = 5 feet;');
            expect(div.textContent).not.toContain('m)');
        });
    });

    describe('Regular text (should convert)', () => {
        test('converts measurements in normal text', () => {
            const p = document.createElement('p');
            p.textContent = 'The building is located at 1111 York St and is 5 feet tall.';
            document.body.appendChild(p);

            processNode(p);

            // This SHOULD be converted since it's normal text
            expect(p.textContent).toContain('5 feet');
            expect(p.textContent).toContain('m)');
        });

        test('converts zip codes in normal text if they look like measurements', () => {
            // Note: zip code 71671 by itself might not be converted without context
            const p = document.createElement('p');
            p.textContent = 'The distance is 71671 feet.';
            document.body.appendChild(p);

            processNode(p);

            // This SHOULD be converted since it's normal text with a unit
            expect(p.textContent).toContain('71671 feet');
            expect(p.textContent).toContain('km');
        });
    });

    describe('Edge cases - Mixed content', () => {
        test('converts in normal text but not in inline code', () => {
            const container = document.createElement('div');

            const p = document.createElement('p');
            p.textContent = 'The room is ';

            const code = document.createElement('code');
            code.textContent = '10 feet';

            const span = document.createElement('span');
            span.textContent = ' wide, which equals 10 feet.';

            container.appendChild(p);
            container.appendChild(code);
            container.appendChild(span);
            document.body.appendChild(container);

            processNode(container);

            // Code should NOT be converted
            expect(code.textContent).toBe('10 feet');
            expect(code.textContent).not.toContain('m)');

            // Normal text SHOULD be converted
            expect(span.textContent).toContain('10 feet');
            expect(span.textContent).toContain('m)');
        });
    });
});
