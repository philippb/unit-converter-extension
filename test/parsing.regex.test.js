const {
    createRegexFromTemplate,
    MEASUREMENT_REGEX_TEMPLATE,
    TIME_REGEX,
    RE_TIME_GLOBAL,
    RE_TIME_TEST,
    TEMPERATURE_F_REGEX,
    RE_TEMPERATURE_F,
    RE_TEMPERATURE_F_TEST,
} = require('../src/parsing/regex.js');

describe('Regex builder module', () => {
    test('exports the measurement template and can build a regex', () => {
        expect(MEASUREMENT_REGEX_TEMPLATE).toBeTruthy();
        const inchesRegex = createRegexFromTemplate('ft|feet', 'inch|inches');
        expect(inchesRegex.test('12 inches')).toBe(true);
        inchesRegex.lastIndex = 0;
        expect(inchesRegex.test('10 feet 5 inches')).toBe(true);
    });

    test('caches compiled regexes', () => {
        const first = createRegexFromTemplate('mile');
        const second = createRegexFromTemplate('mile');
        expect(first).toBe(second);
    });

    test('time regex exports match timezone strings', () => {
        expect(RE_TIME_GLOBAL.test('5:30 pm PST')).toBe(true);
        expect(RE_TIME_TEST.test('11am EDT')).toBe(true);
        const timeLiteral = new RegExp(TIME_REGEX, 'i');
        expect(timeLiteral.test('6:00 UTC')).toBe(true);
    });

    test('temperature regex targets Fahrenheit values', () => {
        expect(RE_TEMPERATURE_F.test('32°F')).toBe(true);
        expect(RE_TEMPERATURE_F_TEST.test('212 Fahrenheit')).toBe(true);
        expect(TEMPERATURE_F_REGEX).toContain('Fahrenheit');
    });
});
