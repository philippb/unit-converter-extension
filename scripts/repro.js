const { JSDOM } = require('jsdom');
const content = require('../src/content.js');
const dom = new JSDOM(`<!doctype html><body></body>`);
const { window } = dom;
const { document } = window;
global.window = window;
global.document = document;
global.Node = window.Node;

const input = 'Walk 2 miles at 9 am EST, weigh 150 lbs at 5 pm CST';
document.body.textContent = input;
content.processNode(document.body);
process.stdout.write('TEXT: ' + document.body.textContent + '\n');
process.stdout.write('HTML: ' + document.body.innerHTML + '\n');
