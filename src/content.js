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

// @ai:keep
const UNICODE_FRACTIONS = '½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒';
const MEASUREMENT_REGEX_TEMPLATE = String.raw`\b(?:(?:(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:{{UNIT_BIG}})[ \t\f\v]+(?![\r\n])(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:{{UNIT_SMALL}}))|(?:(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:{{UNIT_COMBINED}})(?![ \t\f\v]+(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:{{UNIT_COMBINED}}))))\b(?!\s*\(.*\))`;

// New regex pattern for time with timezone
const TIME_REGEX = String.raw`\b(?:(?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\s*(?:am|pm)|(?:2[0-3]|[01]?[0-9])(?::[0-5][0-9])(?::[0-5][0-9])?)(?:\s+)(?:(?:EST|CST|MST|PST|EDT|CDT|MDT|PDT)|(?:GMT|UTC)(?:\s*[+-]\s*\d+(?::[0-5][0-9])?)?)\b(?!\s*\(.*\))`;

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
];

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
        if (hasRelevantUnits(originalText)) {
            const newText = convertText(originalText);
            if (originalText !== newText) {
                node.textContent = newText;
            }
        }
    }
}

// Keep old function name for compatibility but use optimized version
function processNode(node) {
    processElement(node);
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
                    // Use optimized processing for new nodes
                    processElement(node);
                } else if (node.nodeType === Node.TEXT_NODE) {
                    // Handle text nodes directly added
                    if (hasRelevantUnits(node.textContent)) {
                        const originalText = node.textContent;
                        const newText = convertText(originalText);
                        if (originalText !== newText) {
                            node.textContent = newText;
                        }
                    }
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
    const timeRegex = new RegExp(TIME_REGEX, 'gi');

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
        converted = convertLengthText(converted);
    }
    if (containsUnits(converted, UNITS.LIQUID)) {
        // needs to come before weight, since it will otherwise match "fl oz"
        converted = convertLiquidText(converted);
    }
    if (containsUnits(converted, UNITS.WEIGHT)) {
        converted = convertWeightText(converted);
    }

    // Check for time zone expressions
    const hasTimeZone = new RegExp(TIME_REGEX, 'i').test(converted);
    if (hasTimeZone) {
        converted = convertTimeZoneText(converted);
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
        convertTimeZoneText,
        processNode,
        processElement,
        hasRelevantUnits,
        formatLengthMeasurement,
        formatWeightMeasurement,
        formatLiquidMeasurement,
        isEditableContext,
        convertToDecimal,
        createRegexFromTemplate,
        parseMeasurementMatch,
        convertTimeZone,
    });
}
