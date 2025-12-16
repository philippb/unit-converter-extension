// const regex = /\b(?:(?:(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:ounce|oz|mi|pounds|lbs|lb|ft|in)[ \t\f\v]+(?![\r\n])(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)+[ \t\f\v]+(?![\r\n])(?:ounce|oz|mi|pounds|lbs|lb|ft|in))|(?:(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[ \t\f\v][¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:ounce|oz|mi|pounds|lbs|lb|ft|in)(?![ \t\f\v]+(?:\d+\.\d+|\d\s*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅞]|\d\s*\d+\/\d+|\d+\/\d+|\d+)[ \t\f\v]+(?:ounce|oz|mi|pounds|lbs|lb|ft|in))))\b(?!\s*\(.*\))/giu;

const { UNITS, UNIT_HINT_PATTERN } = require('./units/index.js');

const {
    LENGTH_INCH_TO_METERS,
    LENGTH_FOOT_TO_METERS,
    LENGTH_YARD_TO_METERS,
    LENGTH_MILE_TO_METERS,
    AREA_SQFT_TO_SQM,
    AREA_SQIN_TO_SQM,
    AREA_SQYD_TO_SQM,
    AREA_SQMI_TO_SQM,
    AREA_ACRE_TO_SQM,
    WEIGHT_OUNCE_TO_GRAMS,
    WEIGHT_POUND_TO_GRAMS,
    LIQUID_GALLON_TO_L,
    LIQUID_QUART_TO_L,
    LIQUID_PINT_TO_L,
    LIQUID_CUP_TO_L,
    LIQUID_FLOZ_TO_L,
    LIQUID_TBSP_TO_L,
    LIQUID_TSP_TO_L,
    UNICODE_FRACTIONS,
    UNICODE_FRACTIONS_MAP,
    UNICODE_FRACTIONS_DENOM,
    FEET_SYMBOLS,
    INCH_SYMBOLS,
    TIME_ZONE_OFFSETS,
} = require('./utils/constants.js');
const { convertToDecimal } = require('./parsing/numbers.js');
const {
    createRegexFromTemplate,
    RE_TIME_GLOBAL,
    RE_TIME_TEST,
    RE_TEMPERATURE_F,
    RE_TEMPERATURE_F_TEST,
} = require('./parsing/regex.js');
const {
    inferResolutionFromValue,
    mergeResolutionSteps,
    inferResolutionMetersFromNumber,
    resolutionStepOfValueString,
    inferResolutionMetersFromLengthMatch,
    inferResolutionFromParsedMeasurement,
    computeDecimalPlaces,
} = require('./utils/precision.js');
const {
    getUnitRegexes,
    extractFirstValueToken,
    parseMeasurementMatch,
} = require('./parsing/measurement.js');
const {
    formatLengthMeasurement,
    formatWeightMeasurement,
    formatLiquidMeasurement,
    formatAreaMeasurement,
    formatTemperatureCelsius,
} = require('./formatting/units.js');
const {
    formatLengthRange,
    formatWeightRange,
    formatLiquidRange,
    formatTemperatureRange,
} = require('./formatting/ranges.js');
const { convertLengthToMeters, convertLengthText } = require('./units/length.js');
const { convertWeightToGrams, convertWeightText } = require('./units/weight.js');
const { convertLiquidText } = require('./units/liquid.js');
const { convertAreaText } = require('./units/area.js');
const { convertTemperatureText } = require('./units/temperature.js');
const { convertTimeZone, convertTimeZoneText, TARGET_TIMEZONE, TARGET_TIMEZONE_OFFSET } = require('./units/timezone.js');
const { convertText, hasRelevantUnits } = require('./converter.js');
const exclusionContext = require('./exclusions/context.js');
const { shouldExcludeMatch } = require('./exclusions/patterns.js');

function buildUnitDataFromSpecs(specs) {
    const hintPieces = new Set();

    function shouldIncludeInHints(token) {
        return typeof token === 'string' && !/^[a-zA-Z]$/.test(token);
    }

    function compile(node, allowHints) {
        if (Array.isArray(node)) {
            const unique = [];
            const seen = new Set();
            for (const token of node) {
                if (typeof token !== 'string') continue;
                if (!seen.has(token)) {
                    unique.push(token);
                    seen.add(token);
                }
                if (allowHints && shouldIncludeInHints(token)) {
                    hintPieces.add(token);
                }
            }
            return unique.join('|');
        }
        if (node && typeof node === 'object') {
            const result = {};
            const explicitHints = Array.isArray(node.HINTS) ? node.HINTS : null;
            if (explicitHints) {
                for (const token of explicitHints) {
                    if (shouldIncludeInHints(token)) {
                        hintPieces.add(token);
                    }
                }
            }
            const nextAllowHints = allowHints && !explicitHints;
            for (const [key, value] of Object.entries(node)) {
                if (key === 'HINTS') continue;
                result[key] = compile(value, nextAllowHints);
            }
            return result;
        }
        return node;
    }

    const units = {};
    for (const [category, value] of Object.entries(specs)) {
        units[category] = compile(value, true);
    }

    const hintPattern = Array.from(hintPieces)
        .filter(Boolean)
        .sort((a, b) => (a > b ? 1 : a < b ? -1 : 0))
        .join('|');

    return { UNITS: units, UNIT_HINT_PATTERN: hintPattern };
}

// NOTE: quote length hint regex is compiled inline where used to avoid unused var lint

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
 * Optimized processing that skips entire element subtrees without relevant units
 * @param {Node} node - The DOM node to process
 */
function processElement(node) {
    if (exclusionContext.isExcludedContext(node)) {
        return;
    }

    // For element nodes, check entire textContent first to skip whole subtree if no units
    if (node.nodeType === Node.ELEMENT_NODE) {
        // Process children; text-node fast paths and SKIP_TAGS keep this efficient
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

        // Skip text nodes that do not contain relevant number+unit hints
        if (!hasRelevantUnits(originalText)) {
            return;
        }

        {
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

    try {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    } catch (_) {
        // In rare cases body may not be ready; ignore.
    }
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
        isEditableContext: exclusionContext.isEditableContext,
        convertToDecimal,
        createRegexFromTemplate,
        parseMeasurementMatch,
        convertTimeZone,
        // Precision helpers for testing
        resolutionStepOfValueString,
        inferResolutionMetersFromNumber,
        inferResolutionMetersFromLengthMatch,
        extractFirstValueToken,
        isInSkippableContainer: exclusionContext.isInSkippableContainer,
        hasCodeRelatedClass: exclusionContext.hasCodeRelatedClass,
        isExcludedContext: exclusionContext.isExcludedContext,
    });
}
