// Ensure we can import helpers without triggering auto-run
describe('Length symbols: inches and feet', () => {
    test('converts 12" inches to metric', () => {
        jest.resetModules();
        const originalWindow = global.window;
        // eslint-disable-next-line no-undef
        delete global.window;
        // eslint-disable-next-line global-require
        const { processNode } = require('../src/content.js');
        // eslint-disable-next-line no-undef
        global.window = originalWindow;

        document.body.innerHTML =
            'On a lightly floured surface, roll the second disc of pie dough into a 12" circle that is ⅛" thick. Place the crust over the apple pie filling';
        processNode(document.body);

        const out = document.body.textContent;
        expect(out).toContain('12" (30.48 cm)');
    });

    test('converts ⅛" inches to metric (mm)', () => {
        jest.resetModules();
        const originalWindow = global.window;
        // eslint-disable-next-line no-undef
        delete global.window;
        // eslint-disable-next-line global-require
        const { processNode } = require('../src/content.js');
        // eslint-disable-next-line no-undef
        global.window = originalWindow;

        document.body.innerHTML = 'Slice dough about ⅛" thick for best results';
        processNode(document.body);

        const out = document.body.textContent;
        // Note: floating rounding yields 3.17 here
        expect(out).toContain('⅛" (3.17 mm)');
    });
});
