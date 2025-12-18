const { UNICODE_FRACTIONS_MAP, UNICODE_FRACTIONS_DENOM } = require('../utils/constants.js');

const RE_MIXED_UNICODE = /^(\d+)\s*([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*$/;
const RE_DECIMAL_NUM = /^\d*\.\d+\s*$/;
const RE_WHOLE_NUM = /^\d+\s*$/;
const RE_SIMPLE_FRACTION = /^(\d+)\/(\d+)\s*$/;
const RE_MIXED_FRACTION = /^(\d+)\s+(\d+)\/(\d+)\s*$/;
const RE_HYPHENATED_MIXED_FRACTION = /^(\d+)-(\d+)\/(\d+)\s*$/;

/**
 * Converts a string representation of a number (including mixed numbers, hyphenated mixed fractions, and unicode fractions) to a decimal value
 * @param {string} value - The string to convert
 * @returns {number}
 */
function convertToDecimal(value) {
    if (!value || typeof value !== 'string') {
        return NaN;
    }

    const trimmed = String(value).trim().replace(/,/g, '');
    if (Object.prototype.hasOwnProperty.call(UNICODE_FRACTIONS_MAP, trimmed)) {
        return UNICODE_FRACTIONS_MAP[trimmed];
    }

    const mixedUnicodeMatch = trimmed.match(RE_MIXED_UNICODE);
    if (mixedUnicodeMatch) {
        const wholeNumber = parseInt(mixedUnicodeMatch[1], 10);
        const fraction = UNICODE_FRACTIONS_MAP[mixedUnicodeMatch[2]];
        return Number.isNaN(fraction) ? NaN : wholeNumber + fraction;
    }

    if (RE_DECIMAL_NUM.test(trimmed)) {
        return parseFloat(trimmed);
    }

    if (RE_WHOLE_NUM.test(trimmed)) {
        return parseInt(trimmed, 10);
    }

    const fractionMatch = trimmed.match(RE_SIMPLE_FRACTION);
    if (fractionMatch) {
        return parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);
    }

    const hyphenatedMixedMatch = trimmed.match(RE_HYPHENATED_MIXED_FRACTION);
    if (hyphenatedMixedMatch) {
        const wholeNumber = parseInt(hyphenatedMixedMatch[1], 10);
        const numerator = parseInt(hyphenatedMixedMatch[2], 10);
        const denominator = parseInt(hyphenatedMixedMatch[3], 10);
        return wholeNumber + numerator / denominator;
    }

    const mixedMatch = trimmed.match(RE_MIXED_FRACTION);
    if (mixedMatch) {
        const wholeNumber = parseInt(mixedMatch[1], 10);
        const numerator = parseInt(mixedMatch[2], 10);
        const denominator = parseInt(mixedMatch[3], 10);
        return wholeNumber + numerator / denominator;
    }

    return NaN;
}

module.exports = {
    convertToDecimal,
};
