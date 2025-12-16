const { CURRENCY_SYMBOLS } = require('../utils/constants.js');

const INVALID_PREFIXES = `${CURRENCY_SYMBOLS}:`;
const CURRENCY_WORDS = [
    'USD',
    'CAD',
    'AUD',
    'EUR',
    'GBP',
    'JPY',
    'CHF',
    'CNY',
    'INR',
    'BRL',
    'MXN',
    'ZAR',
    'SGD',
    'HKD',
    'DKK',
    'SEK',
    'NOK',
    'TRY',
    'RUB',
    'AED',
    'SAR',
];
const CURRENCY_WORD_SET = new Set(CURRENCY_WORDS);
const INCH_ABBREVIATION_RE = /\bin\.?\b/i;
const FOOT_TERMS_PATTERN = /\b(?:ft|feet|foot)\b/i;
const STANDALONE_IN_PATTERN = /^\s*\d[\d\s,\.\/]*\s*in\.?\s*$/i;
const QUOTE_PAIRS = [
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '“', close: '”' },
    { open: '‘', close: '’' },
];

function hasInvalidPrefix(text, startIndex) {
    if (!text || typeof text !== 'string') return false;
    let i = startIndex - 1;
    while (i >= 0) {
        if (/\s/.test(text[i])) {
            return false;
        }
        const ch = text[i];
        if (ch === ':') return true;
        if (INVALID_PREFIXES.includes(ch)) return true;
        i -= 1;
    }
    return false;
}

function hasPortContext(text, startIndex) {
    if (!text || typeof text !== 'string') return false;
    const prefix = text.slice(0, startIndex);
    const portPattern = /:\d+\s*$/;
    return portPattern.test(prefix);
}

function hasCurrencyContext(text, startIndex) {
    if (!text || typeof text !== 'string') return false;
    const slice = text.slice(0, startIndex).trimEnd();
    if (!slice) return false;
    const tokens = slice.split(/\s+/);
    const candidate = tokens[tokens.length - 1];
    if (!candidate) return false;
    const normalized = candidate.replace(/[^A-Za-z]/g, '').toUpperCase();
    return CURRENCY_WORD_SET.has(normalized);
}

function isInchAbbreviation(match) {
    if (!match || typeof match !== 'string') return false;
    return INCH_ABBREVIATION_RE.test(match);
}

function shouldExcludeCurrencyIn(text, matchStart, match) {
    if (!isInchAbbreviation(match)) return false;
    return hasCurrencyContext(text, matchStart);
}

function hasCapitalizedWordAfter(text, matchStart, match) {
    if (!text || typeof text !== 'string') return false;
    let index = matchStart + (match ? match.length : 0);
    while (index < text.length && /\s/.test(text[index])) {
        index += 1;
    }
    if (index >= text.length) return false;
    const ch = text[index];
    return ch === ch.toUpperCase() && ch !== ch.toLowerCase();
}

function isStandaloneInMatch(match) {
    if (!match || typeof match !== 'string') return false;
    const trimmed = match.trim();
    if (!STANDALONE_IN_PATTERN.test(trimmed)) return false;
    return !FOOT_TERMS_PATTERN.test(trimmed);
}

function shouldExcludePrepositionIn(text, matchStart, match) {
    if (!isStandaloneInMatch(match)) return false;
    return hasCapitalizedWordAfter(text, matchStart, match);
}

function isWordChar(ch) {
    return ch ? /\w/.test(ch) : false;
}

function isInsideQuotes(text, matchStart, match) {
    if (!text || typeof text !== 'string') return false;
    const matchEnd = matchStart + (match ? match.length : 0);
    for (const { open, close } of QUOTE_PAIRS) {
        let searchIndex = -1;
        while ((searchIndex = text.indexOf(open, searchIndex + 1)) !== -1) {
            if (searchIndex >= matchStart) {
                break;
            }
            if (isWordChar(text[searchIndex - 1])) {
                continue;
            }
            let closeIndex = searchIndex;
            while ((closeIndex = text.indexOf(close, closeIndex + 1)) !== -1) {
                if (isWordChar(text[closeIndex + 1])) {
                    continue;
                }
                if (matchStart >= searchIndex && matchEnd <= closeIndex + 1) {
                    return true;
                }
                if (closeIndex + 1 >= matchEnd) {
                    break;
                }
            }
        }
    }
    return false;
}

function shouldExcludeMatch({ text, matchStart, match }) {
    if (hasInvalidPrefix(text, matchStart)) return true;
    if (isInsideQuotes(text, matchStart, match)) return true;
    if (shouldExcludeCurrencyIn(text, matchStart, match)) return true;
    if (hasPortContext(text, matchStart)) return true;
    if (shouldExcludePrepositionIn(text, matchStart, match)) return true;
    return false;
}

module.exports = {
    hasInvalidPrefix,
    hasCurrencyContext,
    isInchAbbreviation,
    isInsideQuotes,
    shouldExcludeCurrencyIn,
    shouldExcludeMatch,
};
