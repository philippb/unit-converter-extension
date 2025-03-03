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
        GALLONS: 'gallons|gallon|gal',
        QUARTS: 'quarts|quart|qt',
        PINTS: 'pints|pint|pt',
        CUPS: 'cups|cup|c',
        FLOZ: 'fluid\\s+ounces|fluid\\s+ounce|fl\\.?\\s*oz',
        TBSP: 'tablespoons|tablespoon|tbsp|tbs|tb',
        TSP: 'teaspoons|teaspoon|tsp|ts',
    },
};

// @ai:keep
const UNICODE_FRACTIONS = '½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒';
const MEASUREMENT_REGEX_TEMPLATE = String.raw`\b(?:(?:(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:{{UNIT_BIG}})[ \t\f\v]+(?![\r\n])(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:{{UNIT_SMALL}}))|(?:(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:{{UNIT_COMBINED}})(?![ \t\f\v]+(?:\d+\.\d+|\d\s*[${UNICODE_FRACTIONS}]|[${UNICODE_FRACTIONS}]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:{{UNIT_COMBINED}}))))\b(?!\s*\(.*\))`;

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

// Update the conversion function to use liters
function convertLiquidToL(
    gallons = 0,
    quarts = 0,
    pints = 0,
    cups = 0,
    floz = 0,
    tbsp = 0,
    tsp = 0
) {
    return (
        gallons * LIQUID_GALLON_TO_L +
        quarts * LIQUID_QUART_TO_L +
        pints * LIQUID_PINT_TO_L +
        cups * LIQUID_CUP_TO_L +
        floz * LIQUID_FLOZ_TO_L +
        tbsp * LIQUID_TBSP_TO_L +
        tsp * LIQUID_TSP_TO_L
    );
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

    // Handle each liquid measurement type
    Object.entries(UNITS.LIQUID).forEach(([unit, pattern]) => {
        const regex = createRegexFromTemplate(pattern);

        converted = converted.replace(regex, function (match) {
            const parts = match.trim().split(/\s+/);
            let value = 0;

            if (parts.length >= 2) {
                value = convertToDecimal(parts[0]);
            }

            // Convert based on unit type
            let liters = 0;
            switch (unit) {
                case 'GALLONS':
                    liters = value * LIQUID_GALLON_TO_L;
                    break;
                case 'QUARTS':
                    liters = value * LIQUID_QUART_TO_L;
                    break;
                case 'PINTS':
                    liters = value * LIQUID_PINT_TO_L;
                    break;
                case 'CUPS':
                    liters = value * LIQUID_CUP_TO_L;
                    break;
                case 'FLOZ':
                    liters = value * LIQUID_FLOZ_TO_L;
                    break;
                case 'TBSP':
                    liters = value * LIQUID_TBSP_TO_L;
                    break;
                case 'TSP':
                    liters = value * LIQUID_TSP_TO_L;
                    break;
            }

            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        });
    });

    return converted;
}

// Update the main convertText function to handle liquid measurements
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
    if (containsUnits(text, UNITS.LENGTH)) {
        converted = convertLengthText(text);
    } else if (containsUnits(text, UNITS.WEIGHT)) {
        converted = convertWeightText(text);
    } else if (containsUnits(text, UNITS.LIQUID)) {
        converted = convertLiquidText(text);
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
        processNode,
        formatLengthMeasurement,
        formatWeightMeasurement,
        formatLiquidMeasurement,
        isEditableContext,
        convertToDecimal,
        createRegexFromTemplate,
        parseMeasurementMatch,
    });
}
