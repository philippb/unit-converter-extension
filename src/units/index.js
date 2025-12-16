const UNIT_SPECS = {
    LENGTH: {
        FEET_INCHES: {
            PRIMARY: ["'", '′', '\u2019', 'feet', 'foot', 'ft'],
            SECONDARY: ['"', '″', '\u201D', 'inches', 'inch', 'in\\.', 'in'],
        },
        MILES: {
            PRIMARY: ['miles', 'mile', 'mi'],
        },
        YARDS: {
            PRIMARY: ['yards', 'yard', 'yd'],
        },
    },
    AREA: {
        SQ_FEET: {
            PRIMARY: [
                'square\\s+feet',
                'square\\s+foot',
                'sq\\.?\\s*ft\\.?',
                'sq\\.?\\s*feet',
                'sq\\.?\\s*foot',
                'sq\\.?\\s*ft',
                'sqft',
                'ft\\s*(?:\\^?2|²)',
                'ft2',
            ],
        },
        SQ_INCHES: {
            PRIMARY: [
                'square\\s+inches',
                'square\\s+inch',
                'sq\\.?\\s*in\\.?',
                'sq\\.?\\s*inch(?:es)?',
                'sq\\.?\\s*in',
                'in\\s*(?:\\^?2|²)',
                'in2',
            ],
        },
        SQ_YARDS: {
            PRIMARY: [
                'square\\s+yards',
                'square\\s+yard',
                'sq\\.?\\s*yd\\.?',
                'sq\\.?\\s*yard(?:s)?',
                'sq\\.?\\s*yd',
                'yd\\s*(?:\\^?2|²)',
                'yd2',
            ],
        },
        SQ_MILES: {
            PRIMARY: [
                'square\\s+miles',
                'square\\s+mile',
                'sq\\.?\\s*mi\\.?',
                'sq\\.?\\s*mile(?:s)?',
                'sq\\.?\\s*mi',
                'mi\\s*(?:\\^?2|²)',
                'mi2',
            ],
        },
        ACRES: {
            PRIMARY: ['acre(?:s)?'],
        },
    },
    WEIGHT: {
        PRIMARY: ['pounds', 'pound', 'lbs', 'lb'],
        SECONDARY: ['ounces', 'ounce', 'oz'],
    },
    LIQUID: {
        GALLONS_QUARTS: {
            PRIMARY: ['gallons', 'gallon', 'gal'],
            SECONDARY: ['quarts', 'quart', 'qt'],
        },
        CUPS_FLOZ: {
            PRIMARY: ['cups', 'cup', 'c'],
            SECONDARY: ['fluid\\s+ounces', 'fluid\\s+ounce', 'fl\\.?\\s*oz'],
        },
        TBSP_TSP: {
            PRIMARY: ['tablespoons', 'tablespoon', 'tbsp', 'tbs', 'tb'],
            SECONDARY: ['teaspoons', 'teaspoon', 'tsp', 'ts'],
        },
        GALLONS: {
            PRIMARY: ['gallons', 'gallon', 'gal'],
        },
        QUARTS: {
            PRIMARY: ['quarts', 'quart', 'qt'],
        },
        PINTS: {
            PRIMARY: ['pints', 'pint', 'pt'],
        },
        CUPS: {
            PRIMARY: ['cups', 'cup', 'c'],
        },
        FLOZ: {
            PRIMARY: ['fluid\\s+ounces', 'fluid\\s+ounce', 'fl\\.?\\s*oz'],
        },
        TBSP: {
            PRIMARY: ['tablespoons', 'tablespoon', 'tbsp', 'tbs', 'tb'],
        },
        TSP: {
            PRIMARY: ['teaspoons', 'teaspoon', 'tsp', 'ts'],
        },
    },
    TIME_ZONE: {
        ABBREVIATIONS: {
            EST: ['EST'],
            CST: ['CST'],
            MST: ['MST'],
            PST: ['PST'],
            EDT: ['EDT'],
            CDT: ['CDT'],
            MDT: ['MDT'],
            PDT: ['PDT'],
            GMT: ['GMT'],
            UTC: ['UTC'],
        },
        OFFSET: ['GMT', 'UTC'],
    },
};

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

const { UNITS, UNIT_HINT_PATTERN } = buildUnitDataFromSpecs(UNIT_SPECS);

module.exports = {
    UNIT_SPECS,
    buildUnitDataFromSpecs,
    UNITS,
    UNIT_HINT_PATTERN,
};
