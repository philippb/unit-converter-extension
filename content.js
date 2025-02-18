// Conversion constants
const INCH_TO_CM = 2.54;
const FOOT_TO_METER = 0.3048;
const YARD_TO_METER = 0.9144;
const MILE_TO_KM = 1.60934;
const POUND_TO_KG = 0.453592;
const OUNCE_TO_GRAM = 28.3495;

function convertText(text) {
    // Convert inches (including fractions)
    text = text.replace(/(\d+(?:\s+)?)(?:(\d+)\s*\/\s*(\d+))?\s*inch(?:es)?/gi, function(match, whole, numerator, denominator) {
        let inches = parseFloat(whole || 0);
        if (numerator && denominator) {
            inches += parseFloat(numerator) / parseFloat(denominator);
        }
        const cm = (inches * INCH_TO_CM).toFixed(2);
        return `${match} (${cm} cm)`;
    });

    // Convert feet
    text = text.replace(/(\d+(?:\.\d+)?)\s*(?:foot|feet|ft)/gi, function(match, feet) {
        const meters = (parseFloat(feet) * FOOT_TO_METER).toFixed(2);
        return `${match} (${meters} m)`;
    });

    // Add more conversions as needed

    return text;
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
    subtree: true
}); 