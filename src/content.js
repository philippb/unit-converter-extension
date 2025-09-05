// const regex = /\b(?:(?:(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:ounce|oz|mi|pounds|lbs|lb|ft|in)[ \t\f\v]+(?![\r\n])(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:ounce|oz|mi|pounds|lbs|lb|ft|in))|(?:(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:ounce|oz|mi|pounds|lbs|lb|ft|in)(?![ \t\f\v]+(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:ounce|oz|mi|pounds|lbs|lb|ft|in))))\b(?!\s*\(.*\))/giu;

// Define unit patterns
const UNITS = {
    LENGTH: {
        FEET_INCHES: {
            PRIMARY: "'|′|feet|foot|ft",
            SECONDARY: '"|″|inches|inch|in',
        },
        MILES: {
            PRIMARY: 'miles|mile|mi',
        },
    },
    AREA: {
        // Square feet support: e.g., "170 sq ft", "200 square feet", "12 ft²", "sq. ft."
        SQ_FEET: {
            // Accept common variants with or without periods and with superscript 2
            // - square feet/foot
            // - sq ft / sq. ft / sqft
            // - ft^2 / ft2 / ft²
            PRIMARY:
                'square\\s+feet|square\\s+foot|sq\\.?\\s*ft\\.?|sq\\.?\\s*feet|sq\\.?\\s*foot|sq\\.?\\s*ft|sqft|ft\\s*(?:\\^?2|²)|ft2',
        },
        SQ_INCHES: {
            PRIMARY:
                'square\\s+inches|square\\s+inch|sq\\.?\\s*in\\.?|sq\\.?\\s*inch(?:es)?|sq\\.?\\s*in|in\\s*(?:\\^?2|²)|in2',
        },
        SQ_YARDS: {
            PRIMARY:
                'square\\s+yards|square\\s+yard|sq\\.?\\s*yd\\.?|sq\\.?\\s*yard(?:s)?|sq\\.?\\s*yd|yd\\s*(?:\\^?2|²)|yd2',
        },
        SQ_MILES: {
            PRIMARY:
                'square\\s+miles|square\\s+mile|sq\\.?\\s*mi\\.?|sq\\.?\\s*mile(?:s)?|sq\\.?\\s*mi|mi\\s*(?:\\^?2|²)|mi2',
        },
        ACRES: {
            PRIMARY: 'acre(?:s)?',
        },
    },
    WEIGHT: {
        PRIMARY: 'pounds|pound|lbs|lb',
        SECONDARY: 'ounces|ounce|oz',
    },
    LIQUID: {
        GALLONS_QUARTS: {
            PRIMARY: 'gallons|gallon|gal',
            SECONDARY: 'quarts|quart|qt',
        },
        CUPS_FLOZ: {
            PRIMARY: 'cups|cup|c',
            SECONDARY: 'fluid\\s+ounces|fluid\\s+ounce|fl\\.?\\s*oz',
        },
        TBSP_TSP: {
            PRIMARY: 'tablespoons|tablespoon|tbsp|tbs|tb',
            SECONDARY: 'teaspoons|teaspoon|tsp|ts',
        },
        // Keep individual units for standalone measurements
        GALLONS: {
            PRIMARY: 'gallons|gallon|gal',
        },
        QUARTS: {
            PRIMARY: 'quarts|quart|qt',
        },
        PINTS: {
            PRIMARY: 'pints|pint|pt',
        },
        CUPS: {
            PRIMARY: 'cups|cup|c',
        },
        FLOZ: {
            PRIMARY: 'fluid\\s+ounces|fluid\\s+ounce|fl\\.?\\s*oz',
        },
        TBSP: {
            PRIMARY: 'tablespoons|tablespoon|tbsp|tbs|tb',
        },
        TSP: {
            PRIMARY: 'teaspoons|teaspoon|tsp|ts',
        },
    },
    // Time zone patterns
    TIME_ZONE: {
        // Standard abbreviations
        ABBREVIATIONS: {
            // US Time Zones
            EST: 'EST', // Eastern Standard Time (UTC-5)
            CST: 'CST', // Central Standard Time (UTC-6)
            MST: 'MST', // Mountain Standard Time (UTC-7)
            PST: 'PST', // Pacific Standard Time (UTC-8)
            EDT: 'EDT', // Eastern Daylight Time (UTC-4)
            CDT: 'CDT', // Central Daylight Time (UTC-5)
            MDT: 'MDT', // Mountain Daylight Time (UTC-6)
            PDT: 'PDT', // Pacific Daylight Time (UTC-7)
            // Other common abbreviations
            GMT: 'GMT', // Greenwich Mean Time (UTC+0)
            UTC: 'UTC', // Coordinated Universal Time (UTC+0)
        },
        // GMT/UTC offset format
        OFFSET: 'GMT|UTC',
    },
};

const TEMPERATURE_F_REGEX = String.raw`(?<!\()(?<![\d.])\b(\d+(?:\.\d+)?)\s*(?:°\s*F|℉|F\b|deg\s*F|degree\s*F|degrees\s*F|degrees?\s*Fahrenheit|Fahrenheit)\b(?!\s*\()`;
const TEMPERATURE_C_REGEX = String.raw`(?<!\()(?<![\d.])\b(\d+(?:\.\d+)?)\s*(?:°\s*C|℃|C\b|deg\s*C|degree\s*C|degrees\s*C|degrees?\s*Celsius|Celsius)\b(?!\s*\()`;

// Precompiled temperature regexes
const RE_TEMPERATURE_F = new RegExp(TEMPERATURE_F_REGEX, 'gi');
const RE_TEMPERATURE_C = new RegExp(TEMPERATURE_C_REGEX, 'gi');
const RE_TEMPERATURE_F_TEST = new RegExp(TEMPERATURE_F_REGEX, 'i');
const RE_TEMPERATURE_C_TEST = new RegExp(TEMPERATURE_C_REGEX, 'i');
// @ai:keep
const UNICODE_FRACTIONS = '½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒';
// Precompute unicode fraction map once
const UNICODE_FRACTIONS_MAP = {
    '½': 0.5,
    '¼': 0.25,
    '¾': 0.75,
    '⅓': 1 / 3,
    '⅔': 2 / 3,
    '⅕': 0.2,
    '⅖': 0.4,
    '⅗': 0.6,
    '⅘': 0.8,
    '⅙': 1 / 6,
    '⅚': 5 / 6,
    '⅛': 0.125,
    '⅜': 0.375,
    '⅝': 0.625,
    '⅞': 0.875,
    '⅐': 1 / 7,
    '⅑': 1 / 9,
    '⅒': 0.1,
};
// Denominator map for unicode vulgar fractions (used to infer resolution)
const UNICODE_FRACTIONS_DENOM = {
    '½': 2,
    '¼': 4,
    '¾': 4,
    '⅓': 3,
    '⅔': 3,
    '⅕': 5,
    '⅖': 5,
    '⅗': 5,
    '⅘': 5,
    '⅙': 6,
    '⅚': 6,
    '⅛': 8,
    '⅜': 8,
    '⅝': 8,
    '⅞': 8,
    '⅐': 7,
    '⅑': 9,
    '⅒': 10,
};
// Updated to support comma thousand separators in numbers (e.g., 1,234 or 1,234.56)
const MEASUREMENT_REGEX_TEMPLATE = String.raw`\b(?:(?:(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))+[ \t\f\v]+(?![\r\n])(?:{{UNIT_BIG}})[ \t\f\v]+(?![\r\n])(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))+[ \t\f\v]+(?![\r\n])(?:{{UNIT_SMALL}}))|(?:(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))[ \t\f\v]+(?:{{UNIT_COMBINED}})(?![ \t\f\v]+(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))[ \t\f\v]+(?:{{UNIT_COMBINED}}))))(?=\b|\W|$)(?!\s*\(.*\))`;

// New regex pattern for time with timezone
const TIME_REGEX = String.raw`\b(?:(?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\s*(?:am|pm)|(?:2[0-3]|[01]?[0-9])(?::[0-5][0-9])(?::[0-5][0-9])?)(?:\s+)(?:(?:EST|CST|MST|PST|EDT|CDT|MDT|PDT)|(?:GMT|UTC)(?:\s*[+-]\s*\d+(?::[0-5][0-9])?)?)\b(?!\s*\(.*\))`;

// Precompiled time regexes
const RE_TIME_GLOBAL = new RegExp(TIME_REGEX, 'gi');
const RE_TIME_TEST = new RegExp(TIME_REGEX, 'i');
// NOTE: quote length hint regex is compiled inline where used to avoid unused var lint

// Offset hours from UTC for common timezones (ignoring daylight saving time)
const TIME_ZONE_OFFSETS = {
    EST: -5, // Eastern Standard Time
    CST: -6, // Central Standard Time
    MST: -7, // Mountain Standard Time
    PST: -8, // Pacific Standard Time
    EDT: -4, // Eastern Daylight Time
    CDT: -5, // Central Daylight Time
    MDT: -6, // Mountain Daylight Time
    PDT: -7, // Pacific Daylight Time
    GMT: 0, // Greenwich Mean Time
    UTC: 0, // Coordinated Universal Time
};

// Target timezone for conversion (PST = UTC-8)
const TARGET_TIMEZONE = 'PST';
const TARGET_TIMEZONE_OFFSET = -8;

// Fast unit detection keywords for pre-filtering
const UNIT_KEYWORDS = [
    // Length units
    'ft',
    'feet',
    'foot',
    'in',
    'inch',
    'inches',
    '"',
    "'",
    '″',
    '′',
    'mi',
    'mile',
    'miles',
    // Weight units
    'lb',
    'lbs',
    'pound',
    'pounds',
    'oz',
    'ounce',
    'ounces',
    // Liquid units
    'gal',
    'gallon',
    'gallons',
    'qt',
    'quart',
    'quarts',
    'pt',
    'pint',
    'pints',
    'cup',
    'cups',
    'fl oz',
    'fluid ounce',
    'fluid ounces',
    'tbsp',
    'tablespoon',
    'tablespoons',
    'tsp',
    'teaspoon',
    'teaspoons',
    'tbs',
    'tb',
    // Area units
    'sq ft',
    'sq. ft',
    'square foot',
    'square feet',
    'sqft',
    'ft²',
    'ft^2',
    'sq in',
    'sq. in',
    'square inch',
    'square inches',
    'in²',
    'in^2',
    'sq yd',
    'sq. yd',
    'square yard',
    'square yards',
    'yd²',
    'yd^2',
    'sq mi',
    'sq. mi',
    'square mile',
    'square miles',
    'mi²',
    'mi^2',
    // Acres
    'acre',
    'acres',
    // Time zone abbreviations
    'est',
    'cst',
    'mst',
    'pst',
    'edt',
    'cdt',
    'mdt',
    'pdt',
    'gmt',
    'utc',
    // Temperature
    '°f',
    '℉',
    'fahrenheit',
    '°c',
    '℃',
    'celsius',
];

// URL blacklist - domains where the extension should not run
// Block most Google properties but allow Gmail (mail.google.*)
const URL_BLACKLIST = [
    /^https?:\/\/(?!mail\.)[^/]*\.google\./, // e.g., www.google.com, docs.google.com, etc. (but not mail.google.com)
];

function isBlacklistedUrl(url) {
    return URL_BLACKLIST.some((pattern) => pattern.test(url));
}

// Safe getter for the extension name (used in tooltip)
function getPluginName() {
    try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
            const manifest = chrome.runtime.getManifest();
            if (manifest && manifest.name) return manifest.name;
        }
    } catch (_) {
        // ignore
    }
    return 'Imperial to Metric';
}

// Helper to style inserted conversions with underline + tooltip
function createInsertedSpan(text, doc) {
    const d = doc || (typeof document !== 'undefined' ? document : null);
    const span = d
        ? d.createElement('span')
        : { style: {}, set textContent(t) {}, set title(t) {}, set className(c) {} };
    span.className = 'mic-inserted';
    // Inline styles to avoid relying on site CSS
    span.style.textDecorationLine = 'underline';
    span.style.textDecorationStyle = 'dotted';
    // Match underline color to surrounding text color
    span.style.textDecorationColor = 'currentColor';
    span.title = `Inserted by ${getPluginName()} extension`;
    span.textContent = text;
    return span;
}

/**
 * Converts a string representation of a number (including mixed numbers, fractions, and unicode fractions) to a decimal value
 * @param {string} value - The string to convert
 * @returns {number} - The decimal value, or NaN if the input is invalid
 *
 * @ai:ignore-start
 */
// Precompiled numeric regexes
const RE_MIXED_UNICODE = /^(\d+)\s*([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*$/;
const RE_DECIMAL_NUM = /^\d*\.\d+\s*$/;
const RE_WHOLE_NUM = /^\d+\s*$/;
const RE_SIMPLE_FRACTION = /^(\d+)\/(\d+)\s*$/;
const RE_MIXED_FRACTION = /^(\d+)\s+(\d+)\/(\d+)\s*$/;

function convertToDecimal(value) {
    if (!value || typeof value !== 'string') {
        return NaN;
    }

    // Check if it's a single unicode fraction
    // Normalize by removing comma thousands separators so 1,234.56 parses correctly
    const trimmed = String(value).trim().replace(/,/g, '');
    if (Object.prototype.hasOwnProperty.call(UNICODE_FRACTIONS_MAP, trimmed)) {
        return UNICODE_FRACTIONS_MAP[trimmed];
    }

    // Check for mixed number with unicode fraction (e.g., "1 ½" or "1½")
    const mixedUnicodeMatch = trimmed.match(RE_MIXED_UNICODE);
    if (mixedUnicodeMatch) {
        const wholeNumber = parseInt(mixedUnicodeMatch[1], 10);
        const fraction = UNICODE_FRACTIONS_MAP[mixedUnicodeMatch[2]];
        return wholeNumber + fraction;
    }

    // Check if it's a decimal number
    if (RE_DECIMAL_NUM.test(trimmed)) {
        return parseFloat(trimmed);
    }

    // Check if it's a simple whole number
    if (RE_WHOLE_NUM.test(trimmed)) {
        return parseInt(trimmed, 10);
    }

    // Check if it's a simple fraction (e.g., "1/2")
    const fractionMatch = trimmed.match(RE_SIMPLE_FRACTION);
    if (fractionMatch) {
        return parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);
    }

    // Check for mixed number (e.g., "1 1/2")
    const mixedMatch = trimmed.match(RE_MIXED_FRACTION);
    if (mixedMatch) {
        const wholeNumber = parseInt(mixedMatch[1], 10);
        const numerator = parseInt(mixedMatch[2], 10);
        const denominator = parseInt(mixedMatch[3], 10);
        return wholeNumber + numerator / denominator;
    }

    return NaN;
}

// Memoize compiled measurement regexes by unit pattern pair
const measureRegexCache = new Map();
function createRegexFromTemplate(unitBig, unitSmall = '') {
    const key = `${unitBig}__${unitSmall}`;
    const cached = measureRegexCache.get(key);
    if (cached) return cached;
    // Replace placeholders in template with actual unit patterns
    let regexStr = MEASUREMENT_REGEX_TEMPLATE.replace('{{UNIT_BIG}}', unitBig || '')
        .replace('{{UNIT_SMALL}}', unitSmall || '')
        .replaceAll('{{UNIT_COMBINED}}', `${unitBig}|${unitSmall}` || '');

    const compiled = new RegExp(regexStr, 'giu');
    measureRegexCache.set(key, compiled);
    return compiled;
}

// Conversion constants to meters
const LENGTH_INCH_TO_METERS = 0.0254;
const LENGTH_FOOT_TO_METERS = 0.3048;
const LENGTH_MILE_TO_METERS = 1609.344; // 1 mile = 1609.344 meters
const LENGTH_YARD_TO_METERS = 0.9144;

// Add these constants at the top with the other conversion constants
const WEIGHT_OUNCE_TO_GRAMS = 28.3495;
const WEIGHT_POUND_TO_GRAMS = 453.592;

// Area conversions
const AREA_SQFT_TO_SQM = LENGTH_FOOT_TO_METERS * LENGTH_FOOT_TO_METERS; // ft² -> m²
const AREA_SQIN_TO_SQM = LENGTH_INCH_TO_METERS * LENGTH_INCH_TO_METERS; // in² -> m²
const AREA_SQYD_TO_SQM = LENGTH_YARD_TO_METERS * LENGTH_YARD_TO_METERS; // yd² -> m²
const AREA_SQMI_TO_SQM = LENGTH_MILE_TO_METERS * LENGTH_MILE_TO_METERS; // mi² -> m²
const AREA_ACRE_TO_SQM = 4046.8564224; // acre -> m²

// Update the constants to use liters
const LIQUID_GALLON_TO_L = 3.78541;
const LIQUID_QUART_TO_L = 0.946353;
const LIQUID_PINT_TO_L = 0.473176;
const LIQUID_CUP_TO_L = 0.236588;
const LIQUID_FLOZ_TO_L = 0.0295735;
const LIQUID_TBSP_TO_L = 0.0147868;
const LIQUID_TSP_TO_L = 0.00492892;
/* @ai:ignore-end */

function convertLengthToMeters(feet = 0, inches = 0, miles = 0) {
    return (
        miles * LENGTH_MILE_TO_METERS +
        feet * LENGTH_FOOT_TO_METERS +
        inches * LENGTH_INCH_TO_METERS
    );
}

// Infer numeric resolution (step) from a raw number string and convert to meters by unit
// E.g., '3.96' in inches -> step 0.01 in -> meters = 0.01 * 0.0254
function inferResolutionMetersFromNumber(raw, unit) {
    const step = resolutionStepOfValueString(String(raw));
    if (!(step > 0)) return undefined;
    switch (unit) {
        case 'in':
            return step * LENGTH_INCH_TO_METERS;
        case 'ft':
            return step * LENGTH_FOOT_TO_METERS;
        case 'mi':
            return step * LENGTH_MILE_TO_METERS;
        default:
            return undefined;
    }
}

// Determine the minimal increment present in a numeric token string
// Supports decimals, vulgar fractions, and a/b fractions (with optional leading whole number)
function resolutionStepOfValueString(s) {
    if (!s) return undefined;
    const str = String(s).trim();
    // If explicit fraction present like '3 1/8' or '1/8'
    const slashMatch = str.match(/(\d+)\s*\/\s*(\d+)/);
    let denom = slashMatch ? parseInt(slashMatch[2], 10) : undefined;
    // Vulgar (unicode) fraction present
    let unicodeDenom;
    for (const ch of str) {
        if (UNICODE_FRACTIONS_DENOM[ch]) {
            unicodeDenom = unicodeDenom
                ? Math.max(unicodeDenom, UNICODE_FRACTIONS_DENOM[ch])
                : UNICODE_FRACTIONS_DENOM[ch];
        }
    }
    if (unicodeDenom) {
        // If both forms appear, use the finer denominator (max denominator => smaller step)
        denom = denom ? Math.max(denom, unicodeDenom) : unicodeDenom;
    }
    if (denom && denom > 0) {
        return 1 / denom;
    }
    // Decimal digits
    const dot = str.indexOf('.');
    if (dot >= 0) {
        const dec = str.slice(dot + 1).replace(/\D/g, '');
        if (dec.length > 0) return Math.pow(10, -dec.length);
    }
    // Integer fallback
    return 1;
}

// Extract the first numeric token from a mixed match string (used for single-unit cases)
function extractFirstValueToken(s) {
    const unicode = UNICODE_FRACTIONS;
    const re = new RegExp(
        String.raw`(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${unicode}]|[${unicode}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))`,
        'u'
    );
    const m = String(s).match(re);
    return m ? m[0] : '';
}

// For combined feet+inches matches, infer the smallest step and convert to meters
function inferResolutionMetersFromLengthMatch(match, units) {
    try {
        const unitPattern = new RegExp(`(${units.PRIMARY}|${units.SECONDARY})`, 'i');
        const parts = match
            .trim()
            .split(unitPattern)
            .map((p) => p.trim())
            .filter(Boolean);
        const { primary: rePrimary, secondary: reSecondary } = getUnitRegexes(units);
        const steps = [];
        if (parts.length >= 2) {
            const val1 = parts[0];
            const unit1 = parts[1].toLowerCase();
            const step1 = resolutionStepOfValueString(val1);
            if (step1 && step1 > 0) {
                if (rePrimary.test(unit1)) steps.push(step1 * LENGTH_FOOT_TO_METERS);
                else if (reSecondary.test(unit1)) steps.push(step1 * LENGTH_INCH_TO_METERS);
            }
        }
        if (parts.length >= 4) {
            const val2 = parts[2];
            const unit2 = parts[3].toLowerCase();
            const step2 = resolutionStepOfValueString(val2);
            if (step2 && step2 > 0) {
                if (reSecondary.test(unit2)) steps.push(step2 * LENGTH_INCH_TO_METERS);
                else if (rePrimary.test(unit2)) steps.push(step2 * LENGTH_FOOT_TO_METERS);
            }
        }
        if (steps.length === 0) return undefined;
        return Math.min(...steps);
    } catch (_) {
        return undefined;
    }
}

function formatLengthMeasurement(meters, options = {}) {
    const { resolutionMeters } = options;

    function chooseDecimals(unitScale) {
        // Default: keep current UX baseline of 2 decimals; only increase when needed
        let decimals = 2;
        if (typeof resolutionMeters === 'number' && resolutionMeters > 0) {
            const stepInUnit = resolutionMeters * unitScale; // convert resolution to the output unit
            // Determine decimals so that decimal place is not coarser than the step
            // d = ceil(-log10(step)); clamp to [0, 3], baseline at least 2
            const raw = Math.ceil(-Math.log10(stepInUnit));
            decimals = Math.max(2, Math.min(3, isFinite(raw) ? raw : 2));
        }
        return decimals;
    }

    function formatNumber(num, decimals) {
        const s = num.toFixed(decimals).replace(/\.?0+$/, '');
        const [intPart, frac] = s.split('.');
        const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return frac ? `${intWithCommas}.${frac}` : intWithCommas;
    }

    if (meters === 0) return '0 cm';
    // Format based on size
    if (meters >= 1000) {
        // kilometers
        const d = chooseDecimals(1 / 1000); // 1 m -> 0.001 km
        return `${formatNumber(meters / 1000, d)} km`;
    } else if (meters >= 1) {
        // meters
        const d = chooseDecimals(1); // 1 m -> 1 m
        return `${formatNumber(meters, d)} m`;
    } else if (meters >= 0.01) {
        // centimeters
        const d = chooseDecimals(100); // 1 m -> 100 cm
        return `${formatNumber(meters * 100, d)} cm`;
    } else {
        // millimeters
        const d = chooseDecimals(1000); // 1 m -> 1000 mm
        return `${formatNumber(meters * 1000, d)} mm`;
    }
}

/**
 * Parses a measurement string containing one or two measurements with units
 * @param {string} match - The matched string (e.g., "5 ft 6 in" or "3 lbs" or "2 ½ oz")
 * @param {Object} units - Object containing primary and secondary unit patterns
 * @returns {Object} - Contains values and units found
 */
// Cache compiled primary/secondary unit matchers per units object
const unitRegexCache = new WeakMap();
function getUnitRegexes(units) {
    let pair = unitRegexCache.get(units);
    if (!pair) {
        const primary = new RegExp(`^(${units.PRIMARY})$`, 'i');
        const secondary = new RegExp(`^(${units.SECONDARY})$`, 'i');
        pair = { primary, secondary };
        unitRegexCache.set(units, pair);
    }
    return pair;
}

function parseMeasurementMatch(match, units) {
    // Split on units while preserving them
    const unitPattern = new RegExp(`(${units.PRIMARY}|${units.SECONDARY})`, 'i');
    const parts = match
        .trim()
        .split(unitPattern)
        .map((p) => p.trim())
        .filter(Boolean);

    // Initialize return values
    let primaryValue = 0,
        secondaryValue = 0;
    let primaryUnit = null,
        secondaryUnit = null;

    if (parts.length >= 2) {
        const firstValue = convertToDecimal(parts[0]);
        const firstUnit = parts[1].toLowerCase();
        const { primary: rePrimary, secondary: reSecondary } = getUnitRegexes(units);
        if (rePrimary.test(firstUnit)) {
            primaryValue = firstValue;
            primaryUnit = firstUnit;

            // Check for secondary measurement
            if (parts.length >= 4) {
                const secondValue = convertToDecimal(parts[2]);
                const secondUnit = parts[3].toLowerCase();
                if (reSecondary.test(secondUnit)) {
                    secondaryValue = secondValue;
                    secondaryUnit = secondUnit;
                }
            }
        } else if (reSecondary.test(firstUnit)) {
            // Handle case where only secondary unit is present
            secondaryValue = firstValue;
            secondaryUnit = firstUnit;
        }
    }

    return {
        primary: { value: primaryValue, unit: primaryUnit },
        secondary: { value: secondaryValue, unit: secondaryUnit },
    };
}

function convertLengthText(text) {
    let converted = text;
    // Handle standalone inch/foot symbols like 12" or 5'
    const VALUE_PART = String.raw`(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)\s+\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+)[${UNICODE_FRACTIONS}]?|[${UNICODE_FRACTIONS}])`;
    const inchesSymbolRegex = new RegExp(String.raw`(${VALUE_PART})\s*(?:"|″)(?!\s*\()`, 'giu');
    const feetSymbolRegex = new RegExp(String.raw`(${VALUE_PART})\s*(?:'|′)(?!\s*\()`, 'giu');

    if (converted.includes('"') || converted.includes('″')) {
        converted = converted.replace(inchesSymbolRegex, function (match, value) {
            const raw = String(value);
            const inches = convertToDecimal(raw);
            if (Number.isNaN(inches)) return match;
            const meters = convertLengthToMeters(0, inches, 0);
            const resolutionMeters = inferResolutionMetersFromNumber(raw, 'in');
            return `${match} (${formatLengthMeasurement(meters, { resolutionMeters })})`;
        });
    }

    if (converted.includes("'") || converted.includes('′')) {
        converted = converted.replace(feetSymbolRegex, function (match, value) {
            const raw = String(value);
            const feet = convertToDecimal(raw);
            if (Number.isNaN(feet)) return match;
            const meters = convertLengthToMeters(feet, 0, 0);
            const resolutionMeters = inferResolutionMetersFromNumber(raw, 'ft');
            return `${match} (${formatLengthMeasurement(meters, { resolutionMeters })})`;
        });
    }
    // Convert feet-inches combinations (only if likely present)
    const lowerLen = converted.toLowerCase();
    if (
        lowerLen.includes('ft') ||
        lowerLen.includes('foot') ||
        lowerLen.includes('feet') ||
        lowerLen.includes(' in') ||
        lowerLen.includes('inch')
    ) {
        const feetInchesRegex = createRegexFromTemplate(
            UNITS.LENGTH.FEET_INCHES.PRIMARY,
            UNITS.LENGTH.FEET_INCHES.SECONDARY
        );

        converted = converted.replace(feetInchesRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            // Do not treat as linear length if immediately followed by a squared marker (ft², ft^2)
            if (s) {
                const after = s.slice(offset + match.length, offset + match.length + 3);
                if (/^\s*(?:\^\s*2|²)/.test(after)) return match;
            }
            const parsed = parseMeasurementMatch(match, UNITS.LENGTH.FEET_INCHES);
            const meters = convertLengthToMeters(parsed.primary.value, parsed.secondary.value);
            if (meters === 0) return match;
            const resolutionMeters = inferResolutionMetersFromLengthMatch(
                match,
                UNITS.LENGTH.FEET_INCHES
            );
            return `${match} (${formatLengthMeasurement(meters, { resolutionMeters })})`;
        });
    }

    // Convert standalone miles (only if likely present)
    if (lowerLen.includes(' mi') || lowerLen.includes('mile')) {
        const milesRegex = createRegexFromTemplate(UNITS.LENGTH.MILES.PRIMARY, '');

        converted = converted.replace(milesRegex, function () {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            // Skip if squared marker immediately follows (mi², mi^2)
            if (s) {
                const after = s.slice(offset + match.length, offset + match.length + 3);
                if (/^\s*(?:\^\s*2|²)/.test(after)) return match;
            }
            const parsed = parseMeasurementMatch(match, UNITS.LENGTH.MILES);
            const meters = convertLengthToMeters(0, 0, parsed.primary.value);
            if (meters === 0) return match;
            const resolutionMeters = inferResolutionMetersFromNumber(
                extractFirstValueToken(match),
                'mi'
            );
            return `${match} (${formatLengthMeasurement(meters, { resolutionMeters })})`;
        });
    }

    return converted;
}

/**
 * Fast pre-filter to check if text contains any relevant units
 * This avoids expensive regex operations on irrelevant text
 * @param {string} text - The text to check
 * @returns {boolean} - True if text might contain convertible units
 */
function hasRelevantUnits(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }

    const lowerText = text.toLowerCase();

    // Fast string search - much faster than regex
    return UNIT_KEYWORDS.some((unit) => lowerText.includes(unit));
}

function isEditableContext(node) {
    // Walk up the DOM tree to find if we're in an editable context
    let current = node;
    while (current) {
        // Check for form elements
        if (current.tagName === 'INPUT' || current.tagName === 'TEXTAREA') {
            return true;
        }
        // Check for contenteditable elements
        if (current.getAttribute && current.getAttribute('contenteditable') === 'true') {
            return true;
        }
        current = current.parentNode;
    }
    return false;
}

/**
 * Optimized processing that skips entire element subtrees without relevant units
 * @param {Node} node - The DOM node to process
 */
function processElement(node) {
    // Skip processing if we're in an editable context
    if (isEditableContext(node)) {
        return;
    }

    // For element nodes, check entire textContent first to skip whole subtree if no units
    if (node.nodeType === Node.ELEMENT_NODE) {
        // Quick check: if element has no text content with units, skip entire subtree
        if (!hasRelevantUnits(node.textContent)) {
            return;
        }

        // If element might have units, process its children
        for (const childNode of node.childNodes) {
            processElement(childNode);
        }
    } else if (node.nodeType === Node.TEXT_NODE) {
        const originalText = node.textContent;

        // Fast pre-filter: only process text that might contain relevant units
        // Skip if the next significant sibling (ignoring whitespace-only text nodes)
        // is one of our inserted spans. This prevents double-processing the same
        // text node content after we've already added a following "(… )" span.
        let ns = node.nextSibling;
        while (ns && ns.nodeType === Node.TEXT_NODE && /^\s*$/.test(ns.textContent)) {
            ns = ns.nextSibling;
        }
        if (
            ns &&
            ns.nodeType === Node.ELEMENT_NODE &&
            ns.classList &&
            ns.classList.contains('mic-inserted')
        ) {
            return;
        }

        if (hasRelevantUnits(originalText)) {
            const newText = convertText(originalText);
            if (originalText !== newText) {
                // Build a fragment that preserves original text and wraps inserted
                // conversions like " (12.7 cm)" in a styled span.
                const doc =
                    (node && node.ownerDocument) ||
                    (typeof document !== 'undefined' ? document : null);
                const frag = doc ? doc.createDocumentFragment() : null;
                let i = 0; // index in originalText
                let j = 0; // index in newText
                let buffer = '';

                const isWhitespace = (ch) => /\s/.test(ch || '');

                while (j < newText.length) {
                    if (i < originalText.length && originalText[i] === newText[j]) {
                        buffer += newText[j];
                        i += 1;
                        j += 1;
                        continue;
                    }

                    // Mismatch indicates inserted conversion. We expect optional whitespace then "(… )".
                    if (
                        newText[j] === '(' ||
                        (isWhitespace(newText[j]) && newText[j + 1] === '(')
                    ) {
                        // Flush buffered matching text
                        if (buffer && frag && doc) {
                            frag.appendChild(doc.createTextNode(buffer));
                            buffer = '';
                        }

                        // If there is leading whitespace before '(', append it as plain text
                        while (isWhitespace(newText[j]) && newText[j + 1] === '(') {
                            if (frag && doc) frag.appendChild(doc.createTextNode(newText[j]));
                            j += 1;
                        }

                        // Now newText[j] should be '('
                        if (newText[j] !== '(') {
                            // Not our pattern; fallback
                            buffer += newText[j];
                            j += 1;
                            continue;
                        }

                        // Find the end of the inserted parenthetical
                        const closeIdx = newText.indexOf(')', j + 1);
                        if (closeIdx === -1) {
                            // Fallback: no closing paren; append the rest as text
                            buffer += newText.slice(j);
                            break;
                        }
                        const insertedText = newText.slice(j, closeIdx + 1);
                        if (frag) {
                            frag.appendChild(createInsertedSpan(insertedText, doc));
                        }
                        // Advance j past the inserted text; i stays the same
                        j = closeIdx + 1;
                        continue;
                    }

                    // Fallback: if not a recognized insertion, move forward conservatively
                    buffer += newText[j];
                    j += 1;
                }

                if (buffer && frag && doc) {
                    frag.appendChild(doc.createTextNode(buffer));
                }
                if (frag) {
                    node.replaceWith(frag);
                } else {
                    // Extremely defensive fallback for non-browser contexts
                    node.textContent = newText;
                }
            }
        }
    }
}

// Keep old function name for compatibility but use optimized version
function processNode(node) {
    processElement(node);
}

// Performance tracking
let performanceData = {
    lastRunTime: 0,
    totalConversions: 0,
    startTime: Date.now(),
    pageLoadTime: Date.now(),
    lastConversionTime: null,
};

// Only run the browser-specific code if we're in a browser environment
if (typeof window !== 'undefined' && !isBlacklistedUrl(window.location.href)) {
    // Initial conversion with timing
    const startTime = performance.now();

    processNode(document.body);
    const endTime = performance.now();
    performanceData.lastRunTime = Math.round((endTime - startTime) * 100) / 100;
    performanceData.lastConversionTime = Date.now();

    // Watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
        const mutationStartTime = performance.now();
        let conversionsInMutation = 0;

        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Use optimized processing for new nodes
                    processElement(node);
                    conversionsInMutation++;
                } else if (node.nodeType === Node.TEXT_NODE) {
                    // Handle text nodes directly added using the same logic
                    processElement(node);
                    conversionsInMutation++;
                }
            }
        }

        const mutationEndTime = performance.now();
        if (conversionsInMutation > 0) {
            performanceData.lastRunTime +=
                Math.round((mutationEndTime - mutationStartTime) * 100) / 100;
            performanceData.totalConversions += conversionsInMutation;
            performanceData.lastConversionTime = Date.now();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

// Add these new functions
function convertWeightToGrams(pounds = 0, ounces = 0) {
    return pounds * WEIGHT_POUND_TO_GRAMS + ounces * WEIGHT_OUNCE_TO_GRAMS;
}

function formatWeightMeasurement(grams) {
    function formatNumber(num) {
        const s = num.toFixed(2).replace(/\.?0+$/, '');
        const [intPart, frac] = s.split('.');
        const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return frac ? `${intWithCommas}.${frac}` : intWithCommas;
    }

    if (grams === 0) return '0 g';
    if (grams >= 1000) {
        return `${formatNumber(grams / 1000)} kg`;
    } else {
        return `${formatNumber(grams)} g`;
    }
}

function convertWeightText(text) {
    let converted = text;
    const lower = converted.toLowerCase();
    if (
        lower.includes('lb') ||
        lower.includes('pound') ||
        lower.includes('oz') ||
        lower.includes('ounce')
    ) {
        const weightRegex = createRegexFromTemplate(UNITS.WEIGHT.PRIMARY, UNITS.WEIGHT.SECONDARY);
        converted = converted.replace(weightRegex, function (match) {
            const parsed = parseMeasurementMatch(match, UNITS.WEIGHT);
            const grams = convertWeightToGrams(parsed.primary.value, parsed.secondary.value);
            return grams === 0 ? match : `${match} (${formatWeightMeasurement(grams)})`;
        });
    }
    return converted;
}

function formatLiquidMeasurement(liters) {
    function formatNumber(num) {
        // Round to 2 decimals, trim zeros, add commas
        const rounded = Math.round(num * 100) / 100;
        const s = rounded.toFixed(2).replace(/\.?0+$/, '');
        const [intPart, frac] = s.split('.');
        const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return frac ? `${intWithCommas}.${frac}` : intWithCommas;
    }

    if (liters === 0) return '0 ml';
    if (liters >= 0.25) {
        return `${formatNumber(liters)} L`;
    } else {
        return `${formatNumber(liters * 1000)} ml`;
    }
}

function convertLiquidText(text) {
    let converted = text;
    const lower = converted.toLowerCase();

    // Convert gallons-quarts combinations
    if (
        lower.includes('gal') ||
        lower.includes('gallon') ||
        lower.includes('quart') ||
        lower.includes('qt')
    ) {
        const gallonsQuartsRegex = createRegexFromTemplate(
            UNITS.LIQUID.GALLONS_QUARTS.PRIMARY,
            UNITS.LIQUID.GALLONS_QUARTS.SECONDARY
        );

        converted = converted.replace(gallonsQuartsRegex, function (match) {
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.GALLONS_QUARTS);
            const liters =
                parsed.primary.value * LIQUID_GALLON_TO_L +
                parsed.secondary.value * LIQUID_QUART_TO_L;
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        });
    }

    if (lower.includes('cup') || lower.includes('fl oz') || lower.includes('fluid')) {
        const cupsFluidOuncesRegex = createRegexFromTemplate(
            UNITS.LIQUID.CUPS_FLOZ.PRIMARY,
            UNITS.LIQUID.CUPS_FLOZ.SECONDARY
        );

        converted = converted.replace(cupsFluidOuncesRegex, function (match) {
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.CUPS_FLOZ);
            const liters =
                parsed.primary.value * LIQUID_CUP_TO_L + parsed.secondary.value * LIQUID_FLOZ_TO_L;
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        });
    }

    if (
        lower.includes('tbsp') ||
        lower.includes('tablespoon') ||
        lower.includes('tsp') ||
        lower.includes('teaspoon')
    ) {
        const tablespoonsTeaspoonsRegex = createRegexFromTemplate(
            UNITS.LIQUID.TBSP_TSP.PRIMARY,
            UNITS.LIQUID.TBSP_TSP.SECONDARY
        );

        converted = converted.replace(tablespoonsTeaspoonsRegex, function (match) {
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.TBSP_TSP);
            const liters =
                parsed.primary.value * LIQUID_TBSP_TO_L + parsed.secondary.value * LIQUID_TSP_TO_L;
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        });
    }

    // Convert standalone gallons
    if (lower.includes('gal') || lower.includes('gallon')) {
        const gallonsRegex = createRegexFromTemplate(UNITS.LIQUID.GALLONS.PRIMARY, '');

        converted = converted.replace(gallonsRegex, function (match) {
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.GALLONS);
            const liters = parsed.primary.value * LIQUID_GALLON_TO_L;
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        });
    }

    // Convert standalone quarts
    if (lower.includes('quart') || lower.includes('qt')) {
        const quartsRegex = createRegexFromTemplate(UNITS.LIQUID.QUARTS.PRIMARY, '');

        converted = converted.replace(quartsRegex, function (match) {
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.QUARTS);
            const liters = parsed.primary.value * LIQUID_QUART_TO_L;
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        });
    }

    // Convert standalone pints
    if (lower.includes('pint')) {
        const pintsRegex = createRegexFromTemplate(UNITS.LIQUID.PINTS.PRIMARY, '');

        converted = converted.replace(pintsRegex, function (match) {
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.PINTS);
            const liters = parsed.primary.value * LIQUID_PINT_TO_L;
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        });
    }

    return converted;
}

function formatAreaMeasurement(squareMeters) {
    function formatNumber(num) {
        const s = (Math.round(num * 100) / 100).toFixed(2).replace(/\.?0+$/, '');
        const [intPart, frac] = s.split('.');
        const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return frac ? `${intWithCommas}.${frac}` : intWithCommas;
    }

    // Unit selection:
    // - m² for < 1 ha (10,000 m²)
    // - ha for [1, 100) ha (10,000–1,000,000 m²)
    // - km² for >= 100 ha (>= 1,000,000 m²)
    if (squareMeters >= 1_000_000) {
        const km2 = squareMeters / 1_000_000;
        return `${formatNumber(km2)} km²`;
    }
    if (squareMeters >= 10_000) {
        const hectares = squareMeters / 10_000;
        return `${formatNumber(hectares)} ha`;
    }
    return `${formatNumber(squareMeters)} m²`;
}

function convertAreaText(text) {
    let converted = text;
    const lower = converted.toLowerCase();

    // Only proceed if likely area tokens exist
    if (
        lower.includes('sq ') ||
        lower.includes('sq.') ||
        lower.includes('square ') ||
        lower.includes('sqft') ||
        lower.includes(' ft2') ||
        lower.includes('ft^2') ||
        lower.includes('ft²') ||
        lower.includes(' in2') ||
        lower.includes('in^2') ||
        lower.includes('in²') ||
        lower.includes(' yd2') ||
        lower.includes('yd^2') ||
        lower.includes('yd²') ||
        lower.includes(' mi2') ||
        lower.includes('mi^2') ||
        lower.includes('mi²') ||
        lower.includes('acre')
    ) {
        const VALUE_PART = String.raw`(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)\s+\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+)[${UNICODE_FRACTIONS}]?|[${UNICODE_FRACTIONS}])`;

        const groups = [
            {
                units: String.raw`(?:sq\.?\s*ft\.?|sq\.?\s*feet|sq\.?\s*foot|square\s+feet|square\s+foot|sqft|ft\s*(?:\^\s*2|²|2))`,
                factor: AREA_SQFT_TO_SQM,
            },
            {
                units: String.raw`(?:sq\.?\s*in\.?|sq\.?\s*inch(?:es)?|square\s+inch(?:es)?|in\s*(?:\^\s*2|²|2))`,
                factor: AREA_SQIN_TO_SQM,
            },
            {
                units: String.raw`(?:sq\.?\s*yd\.?|sq\.?\s*yard(?:s)?|square\s+yard(?:s)?|yd\s*(?:\^\s*2|²|2))`,
                factor: AREA_SQYD_TO_SQM,
            },
            {
                units: String.raw`(?:sq\.?\s*mi\.?|sq\.?\s*mile(?:s)?|square\s+mile(?:s)?|mi\s*(?:\^\s*2|²|2))`,
                factor: AREA_SQMI_TO_SQM,
            },
            {
                units: String.raw`(?:acre(?:s)?)`,
                factor: AREA_ACRE_TO_SQM,
            },
        ];

        for (const { units, factor } of groups) {
            const areaRegex = new RegExp(String.raw`\b(${VALUE_PART})\s*${units}(?!\s*\()`, 'giu');
            converted = converted.replace(areaRegex, function (match, value) {
                const n = convertToDecimal(String(value));
                if (Number.isNaN(n)) return match;
                const sqm = n * factor;
                return `${match} (${formatAreaMeasurement(sqm)})`;
            });
        }
    }

    return converted;
}

function formatTemperatureCelsius(celsius) {
    const abs = Math.abs(celsius);
    const decimals = abs >= 100 ? 0 : abs >= 5 ? 1 : 2;
    return celsius.toFixed(decimals);
}

function convertTemperatureText(text) {
    // Fahrenheit to Celsius
    let out = text.replace(RE_TEMPERATURE_F, (match, fStr) => {
        const f = parseFloat(fStr);
        if (Number.isNaN(f)) return match;
        const c = ((f - 32) * 5) / 9;
        return `${match} (${formatTemperatureCelsius(c)}°C)`;
    });

    // Celsius to Fahrenheit
    out = out.replace(RE_TEMPERATURE_C, (match, cStr) => {
        const c = parseFloat(cStr);
        if (Number.isNaN(c)) return match;
        const f = c * (9 / 5) + 32;
        const fStr = (() => {
            const s = f.toFixed(2);
            return s.replace(/\.?0+$/, '');
        })();
        return `${match} (${fStr}°F)`;
    });

    return out;
}

/**
 * Converts a time from one timezone to another
 * @param {string} timeStr - Time string (e.g., "12:30 pm")
 * @param {string} sourceTimezone - Source timezone abbreviation
 * @param {number} sourceOffset - Optional offset for GMT/UTC formats
 * @returns {string} - Time in target timezone
 */
function convertTimeZone(timeStr, sourceTimezone, sourceOffset = null) {
    // Parse the time string
    let hours = 0;
    let minutes = 0;
    let isPM = false;

    // Check for AM/PM format
    const ampmMatch = timeStr.match(/(\d+)(?::(\d+))?(?::(\d+))?\s*(am|pm)/i);
    if (ampmMatch) {
        hours = parseInt(ampmMatch[1], 10);
        minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
        isPM = ampmMatch[4].toLowerCase() === 'pm';

        // Convert to 24-hour format
        if (isPM && hours < 12) {
            hours += 12;
        } else if (!isPM && hours === 12) {
            hours = 0;
        }
    } else {
        // 24-hour format
        const timeMatch = timeStr.match(/(\d+)(?::(\d+))?(?::(\d+))?/);
        if (timeMatch) {
            hours = parseInt(timeMatch[1], 10);
            minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        }
    }

    // Get source timezone offset
    let tzOffset = 0;
    if (sourceOffset !== null) {
        tzOffset = sourceOffset;
    } else if (TIME_ZONE_OFFSETS[sourceTimezone]) {
        tzOffset = TIME_ZONE_OFFSETS[sourceTimezone];
    }

    // Convert to UTC
    const sourceMinutesFromUTC = hours * 60 + minutes - tzOffset * 60;

    // Convert to target timezone
    const targetMinutesFromUTC = sourceMinutesFromUTC + TARGET_TIMEZONE_OFFSET * 60;

    // Calculate hours and minutes in target timezone
    let targetHours = Math.floor(targetMinutesFromUTC / 60);
    // Handle day wrapping
    while (targetHours < 0) targetHours += 24;
    targetHours = targetHours % 24;

    // Calculate minutes, ensuring they're positive
    let targetMinutes = targetMinutesFromUTC % 60;
    if (targetMinutes < 0) targetMinutes += 60;

    // Format the result in 12-hour format
    let targetAmPm = 'am';
    if (targetHours >= 12) {
        targetAmPm = 'pm';
        if (targetHours > 12) {
            targetHours -= 12;
        }
    } else if (targetHours === 0) {
        targetHours = 12;
    }

    // Format minutes with leading zero if needed
    const formattedMinutes = targetMinutes.toString().padStart(2, '0');

    // Return formatted time
    return `${targetHours}${formattedMinutes > 0 && formattedMinutes !== '00' ? `:${formattedMinutes}` : ''} ${targetAmPm}`;
}

/**
 * Converts timezone expressions in text
 * @param {string} text - The input text
 * @returns {string} - Text with converted timezones
 */
function convertTimeZoneText(text) {
    let converted = text;

    // Create regex for matching time expressions with timezone
    const timeRegex = RE_TIME_GLOBAL;

    // Replace all time expressions
    converted = converted.replace(timeRegex, function (match) {
        // Extract the time and timezone parts from the match
        const timeAndTzParts = match.match(
            /^(.*?)(\s+)((?:EST|CST|MST|PST|EDT|CDT|MDT|PDT)|(?:GMT|UTC)(?:\s*[+-]\s*\d+(?::[0-5][0-9])?)?)$/
        );

        if (!timeAndTzParts) return match;

        const time = timeAndTzParts[1];
        const timezoneWithMaybeOffset = timeAndTzParts[3];

        // Extract timezone abbreviation and potential offset
        const tzParts = timezoneWithMaybeOffset.match(
            /^(EST|CST|MST|PST|EDT|CDT|MDT|PDT|GMT|UTC)(?:\s*([+-])\s*(\d+)(?::(\d+))?)?$/i
        );

        if (!tzParts) return match;

        const tz = tzParts[1].toUpperCase();

        // Don't convert if the timezone is already PST
        if (tz === TARGET_TIMEZONE) {
            return match;
        }

        let offset = null;

        // Handle GMT/UTC offsets
        if (tzParts[2] && tzParts[3]) {
            const sign = tzParts[2] === '+' ? 1 : -1;
            const hours = parseInt(tzParts[3], 10);
            const minutes = tzParts[4] ? parseInt(tzParts[4], 10) / 60 : 0;
            offset = sign * (hours + minutes);
        }

        // Convert to target timezone
        const convertedTime = convertTimeZone(time, tz, offset);
        return `${match} (${convertedTime} ${TARGET_TIMEZONE})`;
    });

    return converted;
}

// Update the main convertText function to handle time zones
function convertText(text) {
    let converted = text;

    // Fast path: if there are no digits or unicode fractions, skip entirely
    const FAST_NUMBER_HINT = new RegExp(String.raw`[0-9${UNICODE_FRACTIONS}]`);
    if (!FAST_NUMBER_HINT.test(converted)) {
        return converted;
    }

    // Pre-pass: merge ranges by looking around existing matches.
    // We insert placeholders for detected ranges, run normal conversions,
    // then restore placeholders so inner tokens won't be double-converted.
    const RANGE_SEP_RE = /^(?:\s*)(?:-|–|—|to|through|thru)(?:\s*)$/i;
    const VALUE_TAIL_RE = new RegExp(
        String.raw`(${`(?:\\d{1,3}(?:,\\d{3})+|\\d+)\\.\\d+|(?:\\d{1,3}(?:,\\d{3})+|\\d+)\\s+\\d+\\/\\d+|\\d+\\/\\d+|(?:\\d{1,3}(?:,\\d{3})+|\\d+)[${UNICODE_FRACTIONS}]?|[${UNICODE_FRACTIONS}]`})\s*(?:-|–|—|to|through|thru)\s*$`,
        'iu'
    );

    const placeholders = [];
    const addPlaceholder = (replacement) => {
        const token = `[[RANGE::${placeholders.length}::]]`;
        placeholders.push({ token, replacement });
        return token;
    };

    function formatNum(n) {
        const s = n.toFixed(2).replace(/\.?0+$/, '');
        const [intPart, frac] = s.split('.');
        const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return frac ? `${intWithCommas}.${frac}` : intWithCommas;
    }

    function formatLengthRange(m1, m2) {
        const a = Math.min(m1, m2);
        const b = Math.max(m1, m2);
        if (b >= 1000) return `${formatNum(a / 1000)}–${formatNum(b / 1000)} km`;
        if (b >= 1) return `${formatNum(a)}–${formatNum(b)} m`;
        if (b >= 0.01) return `${formatNum(a * 100)}–${formatNum(b * 100)} cm`;
        return `${formatNum(a * 1000)}–${formatNum(b * 1000)} mm`;
    }

    function formatWeightRange(g1, g2) {
        const a = Math.min(g1, g2);
        const b = Math.max(g1, g2);
        if (b >= 1000) return `${formatNum(a / 1000)}–${formatNum(b / 1000)} kg`;
        return `${formatNum(a)}–${formatNum(b)} g`;
    }

    function formatLiquidRange(l1, l2) {
        const a = Math.min(l1, l2);
        const b = Math.max(l1, l2);
        if (b >= 0.25) return `${formatNum(a)}–${formatNum(b)} L`;
        return `${formatNum(a * 1000)}–${formatNum(b * 1000)} ml`;
    }

    function applyReplacements(original, replacements) {
        if (replacements.length === 0) return original;
        const sorted = [...replacements].sort((x, y) => x.start - y.start);
        let out = '';
        let pos = 0;
        for (const r of sorted) {
            if (r.start < pos) continue; // skip overlaps
            out += original.slice(pos, r.start) + r.token;
            pos = r.end;
        }
        out += original.slice(pos);
        return out;
    }

    // Merge ranges for length (feet/inches combos and repeated units, plus suffix-style)
    function mergeLengthRanges(s) {
        const replacements = [];
        const fiRe = createRegexFromTemplate(
            UNITS.LENGTH.FEET_INCHES.PRIMARY,
            UNITS.LENGTH.FEET_INCHES.SECONDARY
        );
        const re = new RegExp(fiRe.source, 'giu');
        const matches = [];
        let m;
        while ((m = re.exec(s)) !== null) {
            matches.push({ start: m.index, end: re.lastIndex, text: m[0] });
        }
        for (let i = 0; i < matches.length; i++) {
            const curr = matches[i];
            // 1) repeated-unit range: prev match + sep + curr match
            if (i > 0) {
                const prev = matches[i - 1];
                const between = s.slice(prev.end, curr.start);
                if (RANGE_SEP_RE.test(between)) {
                    const leftParsed = parseMeasurementMatch(prev.text, UNITS.LENGTH.FEET_INCHES);
                    const rightParsed = parseMeasurementMatch(curr.text, UNITS.LENGTH.FEET_INCHES);
                    const m1 = convertLengthToMeters(
                        leftParsed.primary.value,
                        leftParsed.secondary.value
                    );
                    const m2 = convertLengthToMeters(
                        rightParsed.primary.value,
                        rightParsed.secondary.value
                    );
                    const formatted = formatLengthRange(m1, m2);
                    const token = addPlaceholder(`${s.slice(prev.start, curr.end)} (${formatted})`);
                    replacements.push({ start: prev.start, end: curr.end, token });
                    continue;
                }
            }
            // 2) suffix-style: number + sep + curr (unit on right only)
            const leftSlice = s.slice(Math.max(0, curr.start - 50), curr.start);
            const tail = leftSlice.match(VALUE_TAIL_RE);
            if (tail) {
                const tailStart = curr.start - tail[0].length;
                const rightParsed = parseMeasurementMatch(curr.text, UNITS.LENGTH.FEET_INCHES);
                // Only handle if right side is a single unit (feet OR inches)
                const useInches = rightParsed.secondary.unit && !rightParsed.primary.unit;
                const useFeet = rightParsed.primary.unit && !rightParsed.secondary.unit;
                if (useInches || useFeet) {
                    const leftValue = convertToDecimal(String(tail[1]));
                    if (!Number.isNaN(leftValue)) {
                        const m1 = useInches
                            ? convertLengthToMeters(0, leftValue)
                            : convertLengthToMeters(leftValue, 0);
                        const m2 = useInches
                            ? convertLengthToMeters(0, rightParsed.secondary.value)
                            : convertLengthToMeters(rightParsed.primary.value, 0);
                        const formatted = formatLengthRange(m1, m2);
                        const token = addPlaceholder(
                            `${s.slice(tailStart, curr.end)} (${formatted})`
                        );
                        replacements.push({ start: tailStart, end: curr.end, token });
                    }
                }
            }
        }
        return applyReplacements(s, replacements);
    }

    // Merge ranges for weight (lbs/oz)
    function mergeWeightRanges(s) {
        const replacements = [];
        const wRe = createRegexFromTemplate(UNITS.WEIGHT.PRIMARY, UNITS.WEIGHT.SECONDARY);
        const re = new RegExp(wRe.source, 'giu');
        const matches = [];
        let m;
        while ((m = re.exec(s)) !== null) {
            matches.push({ start: m.index, end: re.lastIndex, text: m[0] });
        }
        for (let i = 0; i < matches.length; i++) {
            const curr = matches[i];
            // repeated-unit
            if (i > 0) {
                const prev = matches[i - 1];
                const between = s.slice(prev.end, curr.start);
                if (RANGE_SEP_RE.test(between)) {
                    const leftParsed = parseMeasurementMatch(prev.text, UNITS.WEIGHT);
                    const rightParsed = parseMeasurementMatch(curr.text, UNITS.WEIGHT);
                    const g1 = convertWeightToGrams(
                        leftParsed.primary.value,
                        leftParsed.secondary.value
                    );
                    const g2 = convertWeightToGrams(
                        rightParsed.primary.value,
                        rightParsed.secondary.value
                    );
                    const formatted = formatWeightRange(g1, g2);
                    const token = addPlaceholder(`${s.slice(prev.start, curr.end)} (${formatted})`);
                    replacements.push({ start: prev.start, end: curr.end, token });
                    continue;
                }
            }
            // suffix-style number + sep + curr (assume unit from right primary OR secondary only)
            const leftSlice = s.slice(Math.max(0, curr.start - 50), curr.start);
            const tail = leftSlice.match(VALUE_TAIL_RE);
            if (tail) {
                const tailStart = curr.start - tail[0].length;
                const rightParsed = parseMeasurementMatch(curr.text, UNITS.WEIGHT);
                const usePounds = rightParsed.primary.unit && !rightParsed.secondary.unit;
                const useOunces = rightParsed.secondary.unit && !rightParsed.primary.unit;
                if (usePounds || useOunces) {
                    const leftValue = convertToDecimal(String(tail[1]));
                    if (!Number.isNaN(leftValue)) {
                        const g1 = usePounds
                            ? convertWeightToGrams(leftValue, 0)
                            : convertWeightToGrams(0, leftValue);
                        const g2 = usePounds
                            ? convertWeightToGrams(rightParsed.primary.value, 0)
                            : convertWeightToGrams(0, rightParsed.secondary.value);
                        const formatted = formatWeightRange(g1, g2);
                        const token = addPlaceholder(
                            `${s.slice(tailStart, curr.end)} (${formatted})`
                        );
                        replacements.push({ start: tailStart, end: curr.end, token });
                    }
                }
            }
        }
        return applyReplacements(s, replacements);
    }

    // Merge ranges for liquids (simple standalone units like cups)
    function mergeLiquidRanges(s) {
        // Specialized handling for cups suffix-style ranges like "0.5 to 1 cup"
        const VALUE = String.raw`(?:\d+\.\d+|\d+\s+\d+\/\d+|\d+\/\d+|[${UNICODE_FRACTIONS}]|\d+[${UNICODE_FRACTIONS}]?|\d+)`;
        const cupsSuffix = new RegExp(
            String.raw`\b(${VALUE})\s*(?:-|–|—|to|through|thru)\s*(${VALUE})\s+(?:${UNITS.LIQUID.CUPS.PRIMARY})\b`,
            'giu'
        );
        return s.replace(cupsSuffix, (m, v1, v2) => {
            const n1 = convertToDecimal(String(v1));
            const n2 = convertToDecimal(String(v2));
            if (Number.isNaN(n1) || Number.isNaN(n2)) return m;
            const l1 = n1 * LIQUID_CUP_TO_L;
            const l2 = n2 * LIQUID_CUP_TO_L;
            const formatted = formatLiquidRange(l1, l2);
            return addPlaceholder(`${m} (${formatted})`);
        });
    }

    // Perform merges prior to standard conversions
    converted = mergeLengthRanges(converted);
    converted = mergeLiquidRanges(converted);
    converted = mergeWeightRanges(converted);

    // Helper function to check if text contains any units from a unit group
    const unitGroupRegexCache = new WeakMap();
    const getUnitGroupRegex = (unitPatterns) => {
        let compiled = unitGroupRegexCache.get(unitPatterns);
        if (compiled) return compiled;
        const unitString = Object.values(unitPatterns).reduce((acc, pattern) => {
            if (typeof pattern === 'string') {
                return acc ? `${acc}|${pattern}` : pattern;
            }
            const subPatterns = Object.values(pattern)
                .map((p) => {
                    if (typeof p === 'string') return p;
                    return Object.values(p).join('|');
                })
                .join('|');
            return acc ? `${acc}|${subPatterns}` : subPatterns;
        }, '');
        compiled = new RegExp(`\\b(?:${unitString})\\b`, 'i');
        unitGroupRegexCache.set(unitPatterns, compiled);
        return compiled;
    };

    const containsUnits = (text, unitPatterns) => {
        return getUnitGroupRegex(unitPatterns).test(text);
    };

    // Route to appropriate conversion function based on unit type
    // Length detection: also handle quote-based symbols (e.g., 12" or 5')
    const quoteLengthHint = new RegExp(
        String.raw`(?:\d|[${UNICODE_FRACTIONS}])\s*(?:"|″|'|′)`,
        'i'
    ).test(converted);
    // Area hint: avoid relying on word boundaries for tokens like 'ft²'
    const areaHint = new RegExp(
        String.raw`(?:sq\.?\s*ft|sq\.?\s*feet|sq\.?\s*foot|square\s+feet|square\s+foot|sqft|ft\s*(?:\^?2|²)|ft2|sq\.?\s*in|sq\.?\s*inch(?:es)?|square\s+inch(?:es)?|in\s*(?:\^?2|²)|in2|sq\.?\s*yd|sq\.?\s*yard(?:s)?|square\s+yard(?:s)?|yd\s*(?:\^?2|²)|yd2|sq\.?\s*mi|sq\.?\s*mile(?:s)?|square\s+mile(?:s)?|mi\s*(?:\^?2|²)|mi2|acre(?:s)?)`,
        'i'
    );
    if (areaHint.test(converted)) {
        converted = convertAreaText(converted);
    }
    if (quoteLengthHint || containsUnits(converted, UNITS.LENGTH)) {
        converted = convertLengthText(converted);
    }
    if (containsUnits(converted, UNITS.LIQUID)) {
        // needs to come before weight, since it will otherwise match "fl oz"
        converted = convertLiquidText(converted);
    }
    if (containsUnits(converted, UNITS.WEIGHT)) {
        converted = convertWeightText(converted);
    }

    // Restore placeholders (prevents inner tokens from being re-converted)
    for (const { token, replacement } of placeholders) {
        converted = converted.replaceAll(token, replacement);
    }

    // Temperature (Fahrenheit/Celsius)
    if (RE_TEMPERATURE_F_TEST.test(converted) || RE_TEMPERATURE_C_TEST.test(converted)) {
        converted = convertTemperatureText(converted);
    }

    // Check for time zone expressions
    const hasTimeZone = RE_TIME_TEST.test(converted);
    if (hasTimeZone) {
        converted = convertTimeZoneText(converted);
    }

    return converted;
}

// Add message listener for popup communication
if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'ping') {
            sendResponse({
                status: 'active',
                performance: {
                    lastRunTime: performanceData.lastRunTime,
                    totalConversions: performanceData.totalConversions,
                    uptime: Date.now() - performanceData.startTime,
                    pageLoadTime: performanceData.pageLoadTime,
                    lastConversionTime: performanceData.lastConversionTime,
                    hasRunOnThisPage: performanceData.lastConversionTime !== null,
                },
            });
        }
        return true;
    });
}

// Make functions available for testing
if (typeof exports !== 'undefined') {
    Object.assign(exports, {
        convertText,
        convertLengthText,
        convertAreaText,
        convertWeightText,
        convertLiquidText,
        convertTemperatureText,
        convertTimeZoneText,
        processNode,
        processElement,
        hasRelevantUnits,
        isBlacklistedUrl,
        formatLengthMeasurement,
        formatAreaMeasurement,
        formatWeightMeasurement,
        formatLiquidMeasurement,
        formatTemperatureCelsius,
        isEditableContext,
        convertToDecimal,
        createRegexFromTemplate,
        parseMeasurementMatch,
        convertTimeZone,
        // Precision helpers for testing
        resolutionStepOfValueString,
        inferResolutionMetersFromNumber,
        inferResolutionMetersFromLengthMatch,
        extractFirstValueToken,
    });
}
