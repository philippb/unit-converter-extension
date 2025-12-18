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
const {
    convertTimeZone,
    convertTimeZoneText,
    TARGET_TIMEZONE,
    TARGET_TIMEZONE_OFFSET,
} = require('./units/timezone.js');
const { convertText, convertTextWithInsertMarkers, hasRelevantUnits } = require('./converter.js');
const exclusionContext = require('./exclusions/context.js');
const { shouldExcludeMatch } = require('./exclusions/patterns.js');
const { INSERT_START, INSERT_END, stripInsertMarkers } = require('./utils/insertMarkers.js');

const WHITESPACE_ONLY_RE = /^\s*$/;

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
        void _;
    }
    return 'Imperial to Metric';
}

let cachedPluginName = null;
function getCachedPluginName() {
    if (cachedPluginName) return cachedPluginName;
    cachedPluginName = getPluginName();
    return cachedPluginName;
}

const styledDocs = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
function ensureInsertedStyles(doc) {
    if (!doc) return;
    if (styledDocs && styledDocs.has(doc)) return;
    if (doc.getElementById && doc.getElementById('mic-inserted-style')) {
        if (styledDocs) styledDocs.add(doc);
        return;
    }

    const style = doc.createElement ? doc.createElement('style') : null;
    if (!style) return;
    style.id = 'mic-inserted-style';
    style.textContent = `.mic-inserted {\n  text-decoration-line: underline !important;\n  text-decoration-style: dotted !important;\n  text-decoration-color: currentColor !important;\n}`;

    const parent = doc.head || doc.documentElement || doc.body;
    if (parent && parent.appendChild) {
        parent.appendChild(style);
        if (styledDocs) styledDocs.add(doc);
    }
}

// Helper to style inserted conversions with underline + tooltip
function createInsertedSpan(text, doc) {
    const d = doc || (typeof document !== 'undefined' ? document : null);
    const span = d
        ? d.createElement('span')
        : {
              style: {},
              set textContent(t) {
                  void t;
              },
              set title(t) {
                  void t;
              },
              set className(c) {
                  void c;
              },
          };
    span.className = 'mic-inserted';
    ensureInsertedStyles(d);
    span.title = `Inserted by ${getCachedPluginName()} extension`;
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

    function processTextNode(textNode) {
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
        const originalText = textNode.nodeValue;

        // Skip text nodes that do not contain relevant number+unit hints
        if (!hasRelevantUnits(originalText)) {
            return;
        }

        // Fast pre-filter: only process text that might contain relevant units
        // Skip if the next significant sibling (ignoring whitespace-only text nodes)
        // is one of our inserted spans. This prevents double-processing the same
        // text node content after we've already added a following "(… )" span.
        let ns = textNode.nextSibling;
        while (ns && ns.nodeType === Node.TEXT_NODE && WHITESPACE_ONLY_RE.test(ns.nodeValue)) {
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

        const markedText = convertTextWithInsertMarkers(originalText);
        if (originalText === markedText) {
            return;
        }

        // Build a fragment that preserves text and wraps inserted conversions
        // like " (12.7 cm)" in a styled span.
        const doc =
            (textNode && textNode.ownerDocument) ||
            (typeof document !== 'undefined' ? document : null);
        const frag = doc ? doc.createDocumentFragment() : null;
        if (!frag || !doc) {
            // Extremely defensive fallback for non-browser contexts
            textNode.nodeValue = stripInsertMarkers(markedText);
            return;
        }

        const startMarker = INSERT_START;
        const endMarker = INSERT_END;
        let pos = 0;

        let startIdx;
        while ((startIdx = markedText.indexOf(startMarker, pos)) !== -1) {
            const endIdx = markedText.indexOf(endMarker, startIdx + 1);
            if (endIdx === -1) {
                // Should not happen; fall back to plain text without markers
                frag.appendChild(doc.createTextNode(stripInsertMarkers(markedText.slice(pos))));
                pos = markedText.length;
                break;
            }

            const openParenIdx = startIdx - 1;
            const closeParenIdx = endIdx + 1;
            if (
                openParenIdx < pos ||
                markedText[openParenIdx] !== '(' ||
                closeParenIdx >= markedText.length ||
                markedText[closeParenIdx] !== ')'
            ) {
                // Unexpected marker placement; fall back to plain text without markers
                frag.appendChild(doc.createTextNode(stripInsertMarkers(markedText.slice(pos))));
                pos = markedText.length;
                break;
            }

            const before = markedText.slice(pos, openParenIdx);
            if (before) {
                frag.appendChild(doc.createTextNode(before));
            }

            const insertedContent = markedText.slice(startIdx + 1, endIdx);
            frag.appendChild(createInsertedSpan(`(${insertedContent})`, doc));

            pos = closeParenIdx + 1;
        }

        if (pos < markedText.length) {
            const tail = markedText.slice(pos);
            if (tail) {
                frag.appendChild(doc.createTextNode(tail));
            }
        }

        textNode.replaceWith(frag);
    }

    if (!node) return;

    if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node);
        return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    let current = node.firstChild;
    const stack = [];

    while (current) {
        if (current.nodeType === Node.ELEMENT_NODE) {
            if (exclusionContext.isExcludedElement(current)) {
                current = current.nextSibling;
            } else if (current.firstChild) {
                if (current.nextSibling) stack.push(current.nextSibling);
                current = current.firstChild;
            } else {
                current = current.nextSibling;
            }
        } else if (current.nodeType === Node.TEXT_NODE) {
            const next = current.nextSibling;
            processTextNode(current);
            current = next;
        } else {
            current = current.nextSibling;
        }

        while (!current && stack.length) {
            current = stack.pop();
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
