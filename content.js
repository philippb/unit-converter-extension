// Conversion constants to meters
const INCH_TO_METERS = 0.0254;
const FOOT_TO_METERS = 0.3048;
const MILE_TO_METERS = 1609.344; // 1 mile = 1609.344 meters

// Remove unused constants
// const YARD_TO_METER = 0.9144;
// const MILE_TO_KM = 1.60934;
// const POUND_TO_KG = 0.453592;
// const OUNCE_TO_GRAM = 28.3495;

function convertToMeters(feet = 0, inches = 0, miles = 0) {
    return miles * MILE_TO_METERS + feet * FOOT_TO_METERS + inches * INCH_TO_METERS;
}

function parseInches(whole, numerator, denominator) {
    let inches = 0;
    if (whole) {
        inches = parseFloat(whole);
    }
    if (numerator && denominator) {
        inches += parseFloat(numerator) / parseFloat(denominator);
    }
    return inches;
}

function formatMetricMeasurement(meters) {
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

function convertText(text) {
    let converted = text;

    // Convert miles first (should be done before feet to avoid partial matches)
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:mile|miles|mi)\b(?!\s*(?:\(.*\)))/gi,
        function (match, miles) {
            const meters = convertToMeters(0, 0, parseFloat(miles));
            return meters === 0 ? match : `${match} (${formatMetricMeasurement(meters)})`;
        }
    );

    // Handle combined feet and inches pattern
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:feet|foot|ft)\s+(?:(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*)?(?:inches|inch|in)\b/gi,
        function (match, feet, wholeInches, numerator, denominator) {
            const inchValue = parseInches(wholeInches, numerator, denominator);
            const meters = convertToMeters(parseFloat(feet), inchValue);
            return meters === 0 ? match : `${match} (${formatMetricMeasurement(meters)})`;
        }
    );

    // Convert standalone inches (including fractions and decimals)
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*inch(?:es)?\b(?!\s*(?:\(.*\)))/gi,
        function (match, whole, numerator, denominator) {
            // Only convert if there's an actual number
            if (!whole && !numerator) return match;

            const inches = parseInches(whole, numerator, denominator);
            const meters = convertToMeters(0, inches);
            return meters === 0 ? match : `${match} (${formatMetricMeasurement(meters)})`;
        }
    );

    // Convert standalone feet
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:foot|feet|ft)\b(?!\s+(?:\d+(?:\.\d+)?(?:\s+)?(?:\d+\s*\/\s*\d+)?\s*)?(?:inches|inch|in)\b)(?!\s*(?:\(.*\)))/gi,
        function (match, feet) {
            const meters = convertToMeters(parseFloat(feet), 0);
            return meters === 0 ? match : `${match} (${formatMetricMeasurement(meters)})`;
        }
    );

    return converted;
}

function processNode(node) {
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
    exports.convertText = convertText;
    exports.processNode = processNode;
    exports.formatMetricMeasurement = formatMetricMeasurement; // Export for testing
}
