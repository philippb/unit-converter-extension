const { convertText, processNode } = require('../../src/content.js');

describe('Code Context Skipping', () => {
    const codeSnippets = [
        ['<code>6" code</code>', '<code>6" code</code>'],
        ['<pre>6 ft 3 in</pre>', '<pre>6 ft 3 in</pre>'],
        ['<kbd>press ENTER 8 ft</kbd>', '<kbd>press ENTER 8 ft</kbd>'],
        ['<samp>output: 6×9"</samp>', '<samp>output: 6×9"</samp>'],
        ['<var>const size = 6" * 9"</var>', '<var>const size = 6" * 9"</var>'],
        ['<code><span>6" nested</span></code>', '<code><span>6" nested</span></code>'],
        ['<pre class="hljs"><code>12 inches</code></pre>', '<pre class="hljs"><code>12 inches</code></pre>'],
        ['<span class="cm-string">6 ft</span>', '<span class="cm-string">6 ft</span>'],
    ];

    beforeEach(() => {
        document.body.innerHTML = '';
    });

    for (const [input, expected] of codeSnippets) {
        test(`does not convert measurements inside ${input}`, () => {
            document.body.innerHTML = `<div>${input}</div>`;
            processNode(document.body);
            expect(document.body.innerHTML).toContain(expected);
        });
    }

    test('converts text outside code blocks', () => {
        document.body.innerHTML =
            '<p>Code block: <code>6" should stay</code> outside feet 5 in</p>';
        processNode(document.body);
        expect(document.body.textContent).toContain('feet 5 in (');
    });
});

describe('Quote Exclusion', () => {
    const quotedInputs = [
        ['The "top 30" actions to unify', 'The "top 30" actions to unify'],
        ['"zip": "94110"', '"zip": "94110"'],
        ['"apn": "4210-040"', '"apn": "4210-040"'],
        ['The "section 22" was reviewed', 'The "section 22" was reviewed'],
        ["The 'top 30' actions to unify", "The 'top 30' actions to unify"],
    ];

    for (const [input, expected] of quotedInputs) {
        test(`does not convert quoted numbers in: ${input}`, () => {
            expect(convertText(input)).toBe(expected);
        });
    }

    test('still converts actual measurements inside quotes when they are measurements', () => {
        expect(convertText("Board is 6\" wide")).toContain('6" (');
        expect(convertText("It's 5' tall")).toContain("5' ");
    });
});
