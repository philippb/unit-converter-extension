// Conversion constants
const INCH_TO_CM = 2.54;
const FOOT_TO_METER = 0.3048;

// Remove unused constants
// const YARD_TO_METER = 0.9144;
// const MILE_TO_KM = 1.60934;
// const POUND_TO_KG = 0.453592;
// const OUNCE_TO_GRAM = 28.3495;

function convertToMetric(feet = 0, inches = 0) {
    const totalMeters = feet * FOOT_TO_METER + (inches * INCH_TO_CM) / 100;
    return totalMeters.toFixed(4);
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

function convertText(text) {
    let converted = text;

    // Handle combined feet and inches pattern first
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:feet|foot|ft)\s+(?:(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*)?(?:inches|inch|in)\b/gi,
        function (match, feet, wholeInches, numerator, denominator) {
            const inchValue = parseInches(wholeInches, numerator, denominator);
            const meters = convertToMetric(parseFloat(feet), inchValue);
            return `${match} (${meters} m)`;
        }
    );

    // Convert standalone inches (including fractions and decimals)
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?(?:\s+)?)?(?:(\d+)\s*\/\s*(\d+))?\s*inch(?:es)?\b(?!\s*(?:\(.*\)))/gi,
        function (match, whole, numerator, denominator) {
            // Only convert if there's an actual number
            if (!whole && !numerator) return match;

            const inches = parseInches(whole, numerator, denominator);
            const cm = (inches * INCH_TO_CM).toFixed(2);
            return `${match} (${cm} cm)`;
        }
    );

    // Convert standalone feet
    converted = converted.replace(
        /\b(\d+(?:\.\d+)?)\s*(?:foot|feet|ft)\b(?!\s+(?:\d+(?:\.\d+)?(?:\s+)?(?:\d+\s*\/\s*\d+)?\s*)?(?:inches|inch|in)\b)(?!\s*(?:\(.*\)))/gi,
        function (match, feet) {
            const meters = (parseFloat(feet) * FOOT_TO_METER).toFixed(2);
            return `${match} (${meters} m)`;
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
}
