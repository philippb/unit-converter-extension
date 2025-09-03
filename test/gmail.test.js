describe('Gmail time conversion', () => {
    const gmailHtml = `
    <div class="gs">
      <div class="gE iv gt">
        <table class="cf gJ"><tbody>
          <tr class="acZ">
            <td class="gF gK"></td>
            <td class="gH bAk">
              <div class="gK">
                <span id=":27b" class="g3" title="Sep 3, 2025, 10:57 AM" alt="Sep 3, 2025, 10:57 AM" role="gridcell" tabindex="-1">10:57 AM (0 minutes ago)</span>
              </div>
            </td>
          </tr>
          <tr class="acZ xD">
            <td colspan="3">
              <table class="cf adz"><tbody><tr><td class="ady"></td></tr></tbody></table>
            </td>
          </tr>
        </tbody></table>
      </div>
      <div id=":27a">
        <div id=":277" class="ii gt">
          <div id=":278" class="a3s aiL ">
            <div dir="ltr"><div dir="ltr">12 pm EST<div class="yj6qo"></div></div></div>
          </div>
        </div>
      </div>
    </div>`;

    test('blacklist allows mail.google.com but blocks www.google.com', async () => {
        jest.resetModules();
        const { isBlacklistedUrl } = require('../src/content.js');
        expect(isBlacklistedUrl('https://www.google.com/search?q=test')).toBe(true);
        expect(isBlacklistedUrl('https://mail.google.com/mail/u/0/#inbox')).toBe(false);
    });

    test('converts times in Gmail message body (12 pm EST -> 9 am PST)', async () => {
        jest.resetModules();
        document.body.innerHTML = gmailHtml;

        // Requiring the content script should process the page immediately (not blacklisted)
        require('../src/content.js');

        // Find the element that contains "12 pm EST"
        const messageBody = document.querySelector('.a3s.aiL');
        expect(messageBody).toBeTruthy();
        const textNode = [...messageBody.querySelectorAll('div[dir="ltr"]')]
            .map((n) => n)
            .find((n) => n.textContent.includes('12 pm EST'));
        expect(textNode).toBeTruthy();

        // The converter wraps inserted conversions in a span.mic-inserted
        const inserted = messageBody.querySelector('span.mic-inserted');
        expect(inserted).toBeTruthy();
        expect(inserted.textContent.trim()).toBe('(9 am PST)');
    });
});
