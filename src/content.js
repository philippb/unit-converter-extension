// const regex = /\b(?:(?:(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:ounce|oz|mi|pounds|lbs|lb|ft|in)[ \t\f\v]+(?![\r\n])(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:ounce|oz|mi|pounds|lbs|lb|ft|in))|(?:(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:ounce|oz|mi|pounds|lbs|lb|ft|in)(?![ \t\f\v]+(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:ounce|oz|mi|pounds|lbs|lb|ft|in))))\b(?!\s*\(.*\))/giu;

// Define unit patterns
const UNITS = {
    LENGTH: {
        FEET_INCHES: {
            PRIMARY: '′|feet|foot|ft',
            SECONDARY: '″|inches|inch|in',
        },
        MILES: {
            PRIMARY: 'miles|mile|mi',
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
    TIME: {
        TIMEZONE: {
            PRIMARY: 'EST|CST|MST|PST|EDT|CDT|MDT|PDT|GMT[-+]\\d+|UTC[-+]\\d+',
        },
    },
};

// @ai:keep
const UNICODE_FRACTIONS = '½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒';
const MEASUREMENT_REGEX_TEMPLATE = String.raw`\b(?:(?:(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:{{UNIT_BIG}})[ \t\f\v]+(?![\r\n])(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:{{UNIT_SMALL}}))|(?:(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:{{UNIT_COMBINED}})(?![ \t\f\v]+(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:{{UNIT_COMBINED}}))))\b(?!\s*\(.*\))`;

const TIME_REGEX = String.raw`\b(?:(?:1[0-2]|0?[1-9])(?:\s*:\s*[0-5][0-9])?\s*(?:am|pm)|(?:2[0-3]|[01]?[0-9])(?:\s*:\s*[0-5][0-9]))\s+(${UNITS.TIME.TIMEZONE.PRIMARY})\b(?!\s*\([^)]*\))`;

/**
 * Converts a string representation of a number (including mixed numbers, fractions, and unicode fractions) to a decimal value
 * @param {string} value - The string to convert
 * @returns {number} - The decimal value, or NaN if the input is invalid
 *
 * @ai:ignore-start
 */
function convertToDecimal(value) {
    if (!value || typeof value !== 'string') {
        return NaN;
    }

    // Handle unicode fractions
    const unicodeFractions = {
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

    // Check if it's a single unicode fraction
    if (unicodeFractions[value.trim()]) {
        return unicodeFractions[value.trim()];
    }

    // Check for mixed number with unicode fraction (e.g., "1 ½" or "1½")
    const mixedUnicodeMatch = value.match(/^(\d+)\s*([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*$/);
    if (mixedUnicodeMatch) {
        const wholeNumber = parseInt(mixedUnicodeMatch[1], 10);
        const fraction = unicodeFractions[mixedUnicodeMatch[2]];
        return wholeNumber + fraction;
    }

    // Check if it's a decimal number
    if (/^\d*\.\d+\s*$/.test(value)) {
        return parseFloat(value);
    }

    // Check if it's a simple whole number
    if (/^\d+\s*$/.test(value)) {
        return parseInt(value, 10);
    }

    // Check if it's a simple fraction (e.g., "1/2")
    const fractionMatch = value.match(/^(\d+)\/(\d+)\s*$/);
    if (fractionMatch) {
        return parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);
    }

    // Check for mixed number (e.g., "1 1/2")
    const mixedMatch = value.match(/^(\d+)\s+(\d+)\/(\d+)\s*$/);
    if (mixedMatch) {
        const wholeNumber = parseInt(mixedMatch[1], 10);
        const numerator = parseInt(mixedMatch[2], 10);
        const denominator = parseInt(mixedMatch[3], 10);
        return wholeNumber + numerator / denominator;
    }

    return NaN;
}

function createRegexFromTemplate(unitBig, unitSmall = '') {
    // Replace placeholders in template with actual unit patterns
    let regexStr = MEASUREMENT_REGEX_TEMPLATE.replace('{{UNIT_BIG}}', unitBig || '')
        .replace('{{UNIT_SMALL}}', unitSmall || '')
        .replaceAll('{{UNIT_COMBINED}}', `${unitBig}|${unitSmall}` || '');

    return new RegExp(regexStr, 'giu');
}

// Conversion constants to meters
const LENGTH_INCH_TO_METERS = 0.0254;
const LENGTH_FOOT_TO_METERS = 0.3048;
const LENGTH_MILE_TO_METERS = 1609.344; // 1 mile = 1609.344 meters

// Add these constants at the top with the other conversion constants
const WEIGHT_OUNCE_TO_GRAMS = 28.3495;
const WEIGHT_POUND_TO_GRAMS = 453.592;

// Update the constants to use liters
const LIQUID_GALLON_TO_L = 3.78541;
const LIQUID_QUART_TO_L = 0.946353;
const LIQUID_PINT_TO_L = 0.473176;
const LIQUID_CUP_TO_L = 0.236588;
const LIQUID_FLOZ_TO_L = 0.0295735;
const LIQUID_TBSP_TO_L = 0.0147868;
const LIQUID_TSP_TO_L = 0.00492892;

// Add these constants for timezone conversions
const TIMEZONE_OFFSETS = {
    EST: -5, // Eastern Standard Time (UTC-5)
    CST: -6, // Central Standard Time (UTC-6)
    MST: -7, // Mountain Standard Time (UTC-7)
    PST: -8, // Pacific Standard Time (UTC-8)
    EDT: -4, // Eastern Daylight Time (UTC-4)
    CDT: -5, // Central Daylight Time (UTC-5)
    MDT: -6, // Mountain Daylight Time (UTC-6)
    PDT: -7, // Pacific Daylight Time (UTC-7)
};
/* @ai:ignore-end */

function convertLengthToMeters(feet = 0, inches = 0, miles = 0) {
    return (
        miles * LENGTH_MILE_TO_METERS +
        feet * LENGTH_FOOT_TO_METERS +
        inches * LENGTH_INCH_TO_METERS
    );
}

function formatLengthMeasurement(meters) {
    function formatNumber(num) {
        // Convert to string with max 2 decimal places
        const str = num.toFixed(2);
        // Remove trailing zeros after decimal point
        return str.replace(/\.?0+$/, '');
    }

    if (meters === 0) return '0 cm';
    // Format based on size
    if (meters >= 1000) {
        // For very large measurements: use kilometers
        return `${formatNumber(meters / 1000)} km`;
    } else if (meters >= 1) {
        // For human-scale measurements: use meters
        return `${formatNumber(meters)} m`;
    } else if (meters >= 0.01) {
        // For small measurements: use centimeters
        return `${formatNumber(meters * 100)} cm`;
    } else {
        // For very small measurements: use millimeters
        return `${formatNumber(meters * 1000)} mm`;
    }
}

/**
 * Parses a measurement string containing one or two measurements with units
 * @param {string} match - The matched string (e.g., "5 ft 6 in" or "3 lbs" or "2 ½ oz")
 * @param {Object} units - Object containing primary and secondary unit patterns
 * @returns {Object} - Contains values and units found
 */
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

        if (firstUnit.match(new RegExp(`^(${units.PRIMARY})$`, 'i'))) {
            primaryValue = firstValue;
            primaryUnit = firstUnit;

            // Check for secondary measurement
            if (parts.length >= 4) {
                const secondValue = convertToDecimal(parts[2]);
                const secondUnit = parts[3].toLowerCase();

                if (secondUnit.match(new RegExp(`^(${units.SECONDARY})$`, 'i'))) {
                    secondaryValue = secondValue;
                    secondaryUnit = secondUnit;
                }
            }
        } else if (firstUnit.match(new RegExp(`^(${units.SECONDARY})$`, 'i'))) {
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

    // Convert feet-inches combinations
    const feetInchesRegex = createRegexFromTemplate(
        UNITS.LENGTH.FEET_INCHES.PRIMARY,
        UNITS.LENGTH.FEET_INCHES.SECONDARY
    );

    converted = converted.replace(feetInchesRegex, function (match) {
        const parsed = parseMeasurementMatch(match, UNITS.LENGTH.FEET_INCHES);
        const meters = convertLengthToMeters(parsed.primary.value, parsed.secondary.value);
        return meters === 0 ? match : `${match} (${formatLengthMeasurement(meters)})`;
    });

    // Convert standalone miles
    const milesRegex = createRegexFromTemplate(UNITS.LENGTH.MILES.PRIMARY, '');

    converted = converted.replace(milesRegex, function (match) {
        const parsed = parseMeasurementMatch(match, UNITS.LENGTH.MILES);
        const meters = convertLengthToMeters(0, 0, parsed.primary.value);
        return meters === 0 ? match : `${match} (${formatLengthMeasurement(meters)})`;
    });

    return converted;
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

function processNode(node) {
    // Skip processing if we're in an editable context
    if (isEditableContext(node)) {
        return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
        const originalText = node.textContent;
        const newText = convertText(originalText);
        if (originalText !== newText) {
            node.textContent = newText;
        }
    } else {
        for (const childNode of node.childNodes) {
            processNode(childNode);
        }
    }
}

// Only run the browser-specific code if we're in a browser environment
if (typeof window !== 'undefined') {
    // Initial conversion
    processNode(document.body);

    // Watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    processNode(node);
                }
            }
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
        const str = num.toFixed(2);
        return str.replace(/\.?0+$/, '');
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

    const weightRegex = createRegexFromTemplate(UNITS.WEIGHT.PRIMARY, UNITS.WEIGHT.SECONDARY);

    converted = converted.replace(weightRegex, function (match) {
        const parsed = parseMeasurementMatch(match, UNITS.WEIGHT);
        const grams = convertWeightToGrams(parsed.primary.value, parsed.secondary.value);
        return grams === 0 ? match : `${match} (${formatWeightMeasurement(grams)})`;
    });

    return converted;
}

function formatLiquidMeasurement(liters) {
    function formatNumber(num) {
        // Round to 2 decimal places
        const rounded = Math.round(num * 100) / 100;
        const str = rounded.toFixed(2);
        return str.replace(/\.?0+$/, '');
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

    // Convert gallons-quarts combinations
    const gallonsQuartsRegex = createRegexFromTemplate(
        UNITS.LIQUID.GALLONS_QUARTS.PRIMARY,
        UNITS.LIQUID.GALLONS_QUARTS.SECONDARY
    );

    converted = converted.replace(gallonsQuartsRegex, function (match) {
        const parsed = parseMeasurementMatch(match, UNITS.LIQUID.GALLONS_QUARTS);
        const liters =
            parsed.primary.value * LIQUID_GALLON_TO_L + parsed.secondary.value * LIQUID_QUART_TO_L;
        return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
    });

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

    // Convert standalone gallons
    const gallonsRegex = createRegexFromTemplate(UNITS.LIQUID.GALLONS.PRIMARY, '');

    converted = converted.replace(gallonsRegex, function (match) {
        const parsed = parseMeasurementMatch(match, UNITS.LIQUID.GALLONS);
        const liters = parsed.primary.value * LIQUID_GALLON_TO_L;
        return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
    });

    // Convert standalone quarts
    const quartsRegex = createRegexFromTemplate(UNITS.LIQUID.QUARTS.PRIMARY, '');

    converted = converted.replace(quartsRegex, function (match) {
        const parsed = parseMeasurementMatch(match, UNITS.LIQUID.QUARTS);
        const liters = parsed.primary.value * LIQUID_QUART_TO_L;
        return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
    });

    // Convert standalone pints
    const pintsRegex = createRegexFromTemplate(UNITS.LIQUID.PINTS.PRIMARY, '');

    converted = converted.replace(pintsRegex, function (match) {
        const parsed = parseMeasurementMatch(match, UNITS.LIQUID.PINTS);
        const liters = parsed.primary.value * LIQUID_PINT_TO_L;
        return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
    });

    return converted;
}

// Update the main convertText function to handle liquid measurements
function parseTimezoneOffset(timezone) {
    // Handle GMT/UTC with explicit offset (e.g., GMT+5, UTC-7)
    const gmtMatch = timezone.match(/^(GMT|UTC)([+-])(\d+)$/);
    if (gmtMatch) {
        const sign = gmtMatch[2] === '+' ? 1 : -1;
        const hours = parseInt(gmtMatch[3], 10);
        return sign * hours;
    }

    // Handle standard abbreviations
    return TIMEZONE_OFFSETS[timezone] || 0;
}

// Convert time from source timezone to PT (Pacific Time)
function convertTimeToPST(hour, minute, ampm, sourceTimezone) {
    // Convert to 24-hour format
    let hour24 = hour;
    if (ampm) {
        if (ampm.toLowerCase() === 'pm' && hour < 12) {
            hour24 = hour + 12;
        } else if (ampm.toLowerCase() === 'am' && hour === 12) {
            hour24 = 0;
        }
    }

    const sourceOffset = parseTimezoneOffset(sourceTimezone);

    // Convert to GMT (baseline timezone)
    let gmtHour = (hour24 - sourceOffset) % 24;

    // Handle day wraparound for GMT conversion
    if (gmtHour < 0) {
        gmtHour += 24;
    }

    // Convert from GMT to PT (Pacific Time, UTC-8)
    const ptOffset = -8;
    let ptHour = (gmtHour + ptOffset) % 24;

    // Handle day wraparound for PT conversion
    if (ptHour < 0) {
        ptHour += 24;
    }

    // Convert back to 12-hour format for display
    let displayHour = ptHour % 12;
    if (displayHour === 0) {
        displayHour = 12;
    }

    const displayAmPm = ptHour < 12 ? 'am' : 'pm';

    // Format the time
    let result = `${displayHour}`;
    if (minute > 0) {
        result += `:${minute.toString().padStart(2, '0')}`;
    }
    result += ` ${displayAmPm} PT`;

    return result;
}

function convertTimezoneText(text) {
    // Check if the text already contains a timezone conversion pattern
    if (text.match(/\(\d+(?::\d+)?\s*(?:am|pm)\s+PT\)/i)) {
        return text; // Skip conversion if already converted
    }

    let converted = text;

    const timezoneRegex = new RegExp(TIME_REGEX, 'gi');

    converted = converted.replace(timezoneRegex, function (match) {
        // Handle 12-hour format (e.g., "12 pm EST", "1:30 am CST")
        const twelveHourMatch = match.match(
            /(?:1[0-2]|0?[1-9])(?:\s*:\s*[0-5][0-9])?\s*(?:am|pm)\s+(EST|CST|MST|PST|EDT|CDT|MDT|PDT|GMT[-+]\d+|UTC[-+]\d+)/i
        );
        if (twelveHourMatch) {
            const timeStr = twelveHourMatch[0].split(/\s+/)[0]; // Extract time part
            const timezone = twelveHourMatch[1];

            let hour,
                minute = 0,
                ampm;
            if (timeStr.includes(':')) {
                [hour, minute] = timeStr.split(':').map((num) => parseInt(num, 10));
            } else {
                hour = parseInt(timeStr, 10);
            }

            ampm = match.match(/am|pm/i)[0];

            const pstTime = convertTimeToPST(hour, minute, ampm, timezone);
            return `${match} (${pstTime})`;
        }

        // Handle 24-hour format (e.g., "14:00 EST", "23:30 GMT+5")
        const twentyFourHourMatch = match.match(
            /(?:2[0-3]|[01]?[0-9])(?:\s*:\s*[0-5][0-9])\s+(EST|CST|MST|PST|EDT|CDT|MDT|PDT|GMT[-+]\d+|UTC[-+]\d+)/i
        );
        if (twentyFourHourMatch) {
            const timeStr = twentyFourHourMatch[0].split(/\s+/)[0]; // Extract time part
            const timezone = twentyFourHourMatch[1];

            let hour,
                minute = 0;
            if (timeStr.includes(':')) {
                [hour, minute] = timeStr.split(':').map((num) => parseInt(num, 10));
            } else {
                hour = parseInt(timeStr, 10);
            }

            const pstTime = convertTimeToPST(hour, minute, null, timezone);
            return `${match} (${pstTime})`;
        }

        return match;
    });

    return converted;
}

function convertText(text) {
    let converted = text;

    // Helper function to check if text contains any units from a unit group
    const containsUnits = (text, unitPatterns) => {
        // Compose a string of all unit patterns at the first level
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

        return new RegExp(`\\b(?:${unitString})\\b`, 'i').test(text);
    };

    // Route to appropriate conversion function based on unit type
    if (containsUnits(converted, UNITS.LENGTH)) {
        converted = convertLengthText(text);
    }
    if (containsUnits(converted, UNITS.LIQUID)) {
        // needs to come before weight, since it will otherwise match "fl oz"
        converted = convertLiquidText(converted);
    }
    if (containsUnits(converted, UNITS.WEIGHT)) {
        converted = convertWeightText(converted);
    }
    if (containsUnits(converted, UNITS.TIME)) {
        converted = convertTimezoneText(converted);
    }

    return converted;
}

// Make functions available for testing
if (typeof exports !== 'undefined') {
    Object.assign(exports, {
        convertText,
        convertLengthText,
        convertWeightText,
        convertLiquidText,
        convertTimezoneText,
        processNode,
        formatLengthMeasurement,
        formatWeightMeasurement,
        formatLiquidMeasurement,
        isEditableContext,
        convertToDecimal,
        createRegexFromTemplate,
        parseMeasurementMatch,
        parseTimezoneOffset,
        convertTimeToPST,
    });
}
