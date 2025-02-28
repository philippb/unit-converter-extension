// const regex = /\b(?:(?:(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:ounce|oz|mi|pounds|lbs|lb|ft|in)[ \t\f\v]+(?![\r\n])(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:ounce|oz|mi|pounds|lbs|lb|ft|in))|(?:(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:ounce|oz|mi|pounds|lbs|lb|ft|in)(?![ \t\f\v]+(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:ounce|oz|mi|pounds|lbs|lb|ft|in))))\b(?!\s*\(.*\))/giu;

// Define unit patterns
const UNITS = {
    LENGTH: {
        PRIMARY: '′|feet|foot|ft',
        SECONDARY: '″|inches|inch|in',
        MILES: 'miles|mile|mi',
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
const MEASUREMENT_REGEX_TEMPLATE = String.raw`\b(?:(?:(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:{{UNIT_BIG}})[ \t\f\v]+(?![\r\n])(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:{{UNIT_SMALL}}))|(?:(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:{{UNIT_COMBINED}})(?![ \t\f\v]+(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:{{UNIT_COMBINED}}))))\b(?!\s*\(.*\))`;

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
        '¼': 0.25,
        '½': 0.5,
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
    };

    // Check if it's a single unicode fraction
    if (unicodeFractions[value]) {
        return unicodeFractions[value];
    }

    // Check for mixed number with unicode fraction (e.g., "1 ½" or "1½")
    const mixedUnicodeMatch = value.match(/^(\d+)\s*([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/);
    if (mixedUnicodeMatch) {
        const wholeNumber = parseInt(mixedUnicodeMatch[1], 10);
        const fraction = unicodeFractions[mixedUnicodeMatch[2]];
        return wholeNumber + fraction;
    }

    // Check if it's a simple whole number
    if (/^\d+$/.test(value)) {
        return parseInt(value, 10);
    }

    // Check if it's a simple fraction (e.g., "1/2")
    const fractionMatch = value.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
        return parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);
    }

    // Check for mixed number (e.g., "1 1/2")
    const mixedMatch = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
        const wholeNumber = parseInt(mixedMatch[1], 10);
        const numerator = parseInt(mixedMatch[2], 10);
        const denominator = parseInt(mixedMatch[3], 10);
        return wholeNumber + numerator / denominator;
    }

    return NaN;
}

function createRegexFromTemplate(unitBig, unitSmall, unitCombined) {
    // Replace placeholders in template with actual unit patterns
    let regexStr = MEASUREMENT_REGEX_TEMPLATE.replace('{{UNIT_BIG}}', unitBig || '')
        .replace('{{UNIT_SMALL}}', unitSmall || '')
        .replaceAll('{{UNIT_COMBINED}}', unitCombined || '');

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

function parseLengthInches(whole, numerator, denominator) {
    let inches = 0;
    if (whole) {
        inches = parseFloat(whole);
    }
    if (numerator && denominator) {
        inches += parseFloat(numerator) / parseFloat(denominator);
    }
    return inches;
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

function convertLengthText(text) {
    let converted = text;

    // Convert miles first (should be done before feet to avoid partial matches)
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:mile|miles|mi)\b(?!\s*(?:\(.*\)))/gi,
        function (match, miles) {
            const meters = convertLengthToMeters(0, 0, parseFloat(miles));
            return meters === 0 ? match : `${match} (${formatLengthMeasurement(meters)})`;
        }
    );

    // Handle combined feet and inches pattern
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:feet|foot|ft)\s+(?:(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*)?(?:inches|inch|in)\b/gi,
        function (match, feet, wholeInches, numerator, denominator) {
            const inchValue = parseLengthInches(wholeInches, numerator, denominator);
            const meters = convertLengthToMeters(parseFloat(feet), inchValue);
            return meters === 0 ? match : `${match} (${formatLengthMeasurement(meters)})`;
        }
    );

    // Convert standalone inches (including fractions and decimals)
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*inch(?:es)?\b(?!\s*(?:\(.*\)))/gi,
        function (match, whole, numerator, denominator) {
            if (!whole && !numerator) return match;
            const inches = parseLengthInches(whole, numerator, denominator);
            const meters = convertLengthToMeters(0, inches);
            return meters === 0 ? match : `${match} (${formatLengthMeasurement(meters)})`;
        }
    );

    // Convert standalone feet
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:foot|feet|ft)\b(?!\s+(?:\d+(?:\.\d+)?(?:\s+)?(?:\d+\s*\/\s*\d+)?\s*)?(?:inches|inch|in)\b)(?!\s*(?:\(.*\)))/gi,
        function (match, feet) {
            const meters = convertLengthToMeters(parseFloat(feet), 0);
            return meters === 0 ? match : `${match} (${formatLengthMeasurement(meters)})`;
        }
    );

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
    });
}

// Add these new functions
function convertWeightToGrams(pounds = 0, ounces = 0) {
    return pounds * WEIGHT_POUND_TO_GRAMS + ounces * WEIGHT_OUNCE_TO_GRAMS;
}

function parseWeightOunces(whole, numerator, denominator) {
    let ounces = 0;
    if (whole) {
        ounces = parseFloat(whole);
    }
    if (numerator && denominator) {
        ounces += parseFloat(numerator) / parseFloat(denominator);
    }
    return ounces;
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

    // Convert combined pounds and ounces
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:pounds|pound|lbs|lb)\s+(?:(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*)?(?:ounces|ounce|oz)\b(?!\s*(?:\(.*\)))/giu,
        function (match, pounds, wholeOunces, numerator, denominator) {
            const ounceValue = parseWeightOunces(wholeOunces, numerator, denominator);
            const grams = convertWeightToGrams(parseFloat(pounds), ounceValue);
            return grams === 0 ? match : `${match} (${formatWeightMeasurement(grams)})`;
        }
    );

    // Convert standalone pounds
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:pounds|pound|lbs|lb)\b(?!\s+(?:\d+(?:\.\d+)?(?:\s+)?(?:\d+\s*\/\s*\d+)?\s*)?(?:ounces|ounce|oz)\b)(?!\s*(?:\(.*\)))/giu,
        function (match, pounds) {
            const grams = convertWeightToGrams(parseFloat(pounds), 0);
            return grams === 0 ? match : `${match} (${formatWeightMeasurement(grams)})`;
        }
    );

    // Convert standalone ounces
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*(?:ounces|ounce|oz)\b(?!\s*(?:\(.*\)))/giu,
        function (match, whole, numerator, denominator) {
            if (!whole && !numerator) return match;
            const ounces = parseWeightOunces(whole, numerator, denominator);
            const grams = convertWeightToGrams(0, ounces);
            return grams === 0 ? match : `${match} (${formatWeightMeasurement(grams)})`;
        }
    );

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

function parseLiquidFraction(whole, numerator, denominator) {
    let value = 0;
    if (whole) {
        value = parseFloat(whole);
    }
    if (numerator && denominator) {
        value += parseFloat(numerator) / parseFloat(denominator);
    }
    return value;
}

// Update the formatting function to use liters as base
function formatLiquidMeasurement(liters) {
    function formatNumber(num) {
        const str = num.toFixed(2);
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

    // Convert gallons
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:gallons|gallon|gal)\b(?!\s*(?:\(.*\)))/giu,
        function (match, gallons) {
            const liters = convertLiquidToL(parseFloat(gallons));
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        }
    );

    // Convert quarts
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:quarts|quart|qt)\b(?!\s*(?:\(.*\)))/giu,
        function (match, quarts) {
            const liters = convertLiquidToL(0, parseFloat(quarts));
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        }
    );

    // Convert pints
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:pints|pint|pt)\b(?!\s*(?:\(.*\)))/giu,
        function (match, pints) {
            const liters = convertLiquidToL(0, 0, parseFloat(pints));
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        }
    );

    // Convert cups
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*(?:cups|cup|c)\b(?!\s*(?:\(.*\)))/giu,
        function (match, whole, numerator, denominator) {
            if (!whole && !numerator) return match;
            const cups = parseLiquidFraction(whole, numerator, denominator);
            const liters = convertLiquidToL(0, 0, 0, cups);
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        }
    );

    // Convert fluid ounces
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*(?:fluid\s+ounces|fluid\s+ounce|fl\.?\s*oz)\b(?!\s*(?:\(.*\)))/giu,
        function (match, whole, numerator, denominator) {
            if (!whole && !numerator) return match;
            const floz = parseLiquidFraction(whole, numerator, denominator);
            const liters = convertLiquidToL(0, 0, 0, 0, floz);
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        }
    );

    // Convert tablespoons
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*(?:tablespoons|tablespoon|tbsp|tbs|tb)\b(?!\s*(?:\(.*\)))/giu,
        function (match, whole, numerator, denominator) {
            if (!whole && !numerator) return match;
            const tbsp = parseLiquidFraction(whole, numerator, denominator);
            const liters = convertLiquidToL(0, 0, 0, 0, 0, tbsp);
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        }
    );

    // Convert teaspoons
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*(?:teaspoons|teaspoon|tsp|ts)\b(?!\s*(?:\(.*\)))/giu,
        function (match, whole, numerator, denominator) {
            if (!whole && !numerator) return match;
            const tsp = parseLiquidFraction(whole, numerator, denominator);
            const liters = convertLiquidToL(0, 0, 0, 0, 0, 0, tsp);
            return liters === 0 ? match : `${match} (${formatLiquidMeasurement(liters)})`;
        }
    );

    return converted;
}

// Update the main convertText function to handle liquid measurements
function convertText(text) {
    return convertLiquidText(convertWeightText(convertLengthText(text)));
}
