const { UNICODE_FRACTIONS } = require('../utils/constants.js');

const MEASUREMENT_REGEX_TEMPLATE = String.raw`\b(?:(?:(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)-\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))+[ \t\f\v]+(?![\r\n])(?:{{UNIT_BIG}})[ \t\f\v]+(?![\r\n])(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)-\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))+[ \t\f\v]+(?![\r\n])(?:{{UNIT_SMALL}}))|(?:(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)-\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))[ \t\f\v]+(?:{{UNIT_COMBINED}})(?![ \t\f\v]+(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)-\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))[ \t\f\v]+(?:{{UNIT_COMBINED}}))))(?=\b|\W|$)(?!\s*\(.*\))`;

const measureRegexCache = new Map();
function createRegexFromTemplate(unitBig, unitSmall = '') {
    const key = `${unitBig}__${unitSmall}`;
    const cached = measureRegexCache.get(key);
    if (cached) return cached;
    const combined = unitSmall && unitSmall.length > 0 ? `${unitBig}|${unitSmall}` : unitBig;
    let regexStr = MEASUREMENT_REGEX_TEMPLATE.replace('{{UNIT_BIG}}', unitBig || '')
        .replace('{{UNIT_SMALL}}', unitSmall || '')
        .replaceAll('{{UNIT_COMBINED}}', combined || '');

    const compiled = new RegExp(regexStr, 'giu');
    measureRegexCache.set(key, compiled);
    return compiled;
}

const TIME_REGEX = String.raw`\b(?:(?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\s*(?:am|pm)|(?:2[0-3]|[01]?[0-9])(?::[0-5][0-9])(?::[0-5][0-9])?)(?:\s+)(?:(?:EST|CST|MST|PST|EDT|CDT|MDT|PDT)|(?:GMT|UTC)(?:\s*[+-]\s*\d+(?::[0-5][0-9])?)?)\b(?!\s*\(.*\))`;
const RE_TIME_GLOBAL = new RegExp(TIME_REGEX, 'gi');
const RE_TIME_TEST = new RegExp(TIME_REGEX, 'i');

const TEMPERATURE_F_REGEX = String.raw`(?<!\()(?<![\d.])(-?\d+(?:\.\d+)?)\s*(?:°\s*F|℉|F\b|deg\s*F|degree\s*F|degrees\s*F|degrees?\s*Fahrenheit|Fahrenheit)\b(?!\s*\()`;
const RE_TEMPERATURE_F = new RegExp(TEMPERATURE_F_REGEX, 'gi');
const RE_TEMPERATURE_F_TEST = new RegExp(TEMPERATURE_F_REGEX, 'i');

module.exports = {
    MEASUREMENT_REGEX_TEMPLATE,
    createRegexFromTemplate,
    TIME_REGEX,
    RE_TIME_GLOBAL,
    RE_TIME_TEST,
    TEMPERATURE_F_REGEX,
    RE_TEMPERATURE_F,
    RE_TEMPERATURE_F_TEST,
};
