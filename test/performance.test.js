const fs = require('fs');
const path = require('path');
// No direct jsdom import; use Jest's jsdom environment APIs only.
const { performance } = require('perf_hooks');

describe('Performance: recipe.html parsing', () => {
    test('measures processNode duration on recipe.html', () => {
        // Ensure module side-effects (initial run + observer) do not trigger.
        // Temporarily hide window during module evaluation to skip auto-run.
        jest.resetModules();
        const originalWindow = global.window;
        // eslint-disable-next-line no-undef
        delete global.window;
        // eslint-disable-next-line global-require
        const { processNode } = require('../src/content.js');
        // eslint-disable-next-line no-undef
        global.window = originalWindow;

        // Load the sample HTML and inject only the body content into jsdom
        const htmlPath = path.join(__dirname, 'content', 'recipe.html');
        const html = fs.readFileSync(htmlPath, 'utf8');
        // Prefer DOMParser if available to avoid extra dependencies
        let bodyHtml = '';
        if (typeof DOMParser !== 'undefined') {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            bodyHtml = doc && doc.body ? doc.body.innerHTML : html;
        } else {
            // Fallback: crude extraction
            const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            bodyHtml = match ? match[1] : html;
        }
        // Strip scripts and styles to avoid jsdom console noise and focus on content parsing
        bodyHtml = bodyHtml
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '');
        document.body.innerHTML = bodyHtml;

        // Measure parsing duration
        const start = performance.now();
        processNode(document.body);
        const durationMs = performance.now() - start;

        // Basic sanity check and report the timing
        expect(durationMs).toBeGreaterThan(0);
        // eslint-disable-next-line no-console
        console.log(`processNode on recipe.html: ${durationMs.toFixed(2)} ms`);
    });
});
