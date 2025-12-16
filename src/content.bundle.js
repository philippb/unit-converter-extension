(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/units/index.js
  var require_units = __commonJS({
    "src/units/index.js"(exports, module) {
      var UNIT_SPECS = {
        LENGTH: {
          FEET_INCHES: {
            PRIMARY: ["'", "\u2032", "\u2019", "feet", "foot", "ft"],
            SECONDARY: ['"', "\u2033", "\u201D", "inches", "inch", "in\\.", "in"]
          },
          MILES: {
            PRIMARY: ["miles", "mile", "mi"]
          },
          YARDS: {
            PRIMARY: ["yards", "yard", "yd"]
          }
        },
        AREA: {
          SQ_FEET: {
            PRIMARY: [
              "square\\s+feet",
              "square\\s+foot",
              "sq\\.?\\s*ft\\.?",
              "sq\\.?\\s*feet",
              "sq\\.?\\s*foot",
              "sq\\.?\\s*ft",
              "sqft",
              "ft\\s*(?:\\^?2|\xB2)",
              "ft2"
            ]
          },
          SQ_INCHES: {
            PRIMARY: [
              "square\\s+inches",
              "square\\s+inch",
              "sq\\.?\\s*in\\.?",
              "sq\\.?\\s*inch(?:es)?",
              "sq\\.?\\s*in",
              "in\\s*(?:\\^?2|\xB2)",
              "in2"
            ]
          },
          SQ_YARDS: {
            PRIMARY: [
              "square\\s+yards",
              "square\\s+yard",
              "sq\\.?\\s*yd\\.?",
              "sq\\.?\\s*yard(?:s)?",
              "sq\\.?\\s*yd",
              "yd\\s*(?:\\^?2|\xB2)",
              "yd2"
            ]
          },
          SQ_MILES: {
            PRIMARY: [
              "square\\s+miles",
              "square\\s+mile",
              "sq\\.?\\s*mi\\.?",
              "sq\\.?\\s*mile(?:s)?",
              "sq\\.?\\s*mi",
              "mi\\s*(?:\\^?2|\xB2)",
              "mi2"
            ]
          },
          ACRES: {
            PRIMARY: ["acre(?:s)?"]
          }
        },
        WEIGHT: {
          PRIMARY: ["pounds", "pound", "lbs", "lb"],
          SECONDARY: ["ounces", "ounce", "oz"]
        },
        LIQUID: {
          GALLONS_QUARTS: {
            PRIMARY: ["gallons", "gallon", "gal"],
            SECONDARY: ["quarts", "quart", "qt"]
          },
          CUPS_FLOZ: {
            PRIMARY: ["cups", "cup", "c"],
            SECONDARY: ["fluid\\s+ounces", "fluid\\s+ounce", "fl\\.?\\s*oz"]
          },
          TBSP_TSP: {
            PRIMARY: ["tablespoons", "tablespoon", "tbsp", "tbs", "tb"],
            SECONDARY: ["teaspoons", "teaspoon", "tsp", "ts"]
          },
          GALLONS: {
            PRIMARY: ["gallons", "gallon", "gal"]
          },
          QUARTS: {
            PRIMARY: ["quarts", "quart", "qt"]
          },
          PINTS: {
            PRIMARY: ["pints", "pint", "pt"]
          },
          CUPS: {
            PRIMARY: ["cups", "cup", "c"]
          },
          FLOZ: {
            PRIMARY: ["fluid\\s+ounces", "fluid\\s+ounce", "fl\\.?\\s*oz"]
          },
          TBSP: {
            PRIMARY: ["tablespoons", "tablespoon", "tbsp", "tbs", "tb"]
          },
          TSP: {
            PRIMARY: ["teaspoons", "teaspoon", "tsp", "ts"]
          }
        },
        TIME_ZONE: {
          ABBREVIATIONS: {
            EST: ["EST"],
            CST: ["CST"],
            MST: ["MST"],
            PST: ["PST"],
            EDT: ["EDT"],
            CDT: ["CDT"],
            MDT: ["MDT"],
            PDT: ["PDT"],
            GMT: ["GMT"],
            UTC: ["UTC"]
          },
          OFFSET: ["GMT", "UTC"]
        }
      };
      function buildUnitDataFromSpecs(specs) {
        const hintPieces = /* @__PURE__ */ new Set();
        function shouldIncludeInHints(token) {
          return typeof token === "string" && !/^[a-zA-Z]$/.test(token);
        }
        function compile(node, allowHints) {
          if (Array.isArray(node)) {
            const unique = [];
            const seen = /* @__PURE__ */ new Set();
            for (const token of node) {
              if (typeof token !== "string") continue;
              if (!seen.has(token)) {
                unique.push(token);
                seen.add(token);
              }
              if (allowHints && shouldIncludeInHints(token)) {
                hintPieces.add(token);
              }
            }
            return unique.join("|");
          }
          if (node && typeof node === "object") {
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
              if (key === "HINTS") continue;
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
        const hintPattern = Array.from(hintPieces).filter(Boolean).sort((a, b) => a > b ? 1 : a < b ? -1 : 0).join("|");
        return { UNITS: units, UNIT_HINT_PATTERN: hintPattern };
      }
      var { UNITS, UNIT_HINT_PATTERN } = buildUnitDataFromSpecs(UNIT_SPECS);
      module.exports = {
        UNIT_SPECS,
        buildUnitDataFromSpecs,
        UNITS,
        UNIT_HINT_PATTERN
      };
    }
  });

  // src/utils/constants.js
  var require_constants = __commonJS({
    "src/utils/constants.js"(exports, module) {
      var LENGTH_INCH_TO_METERS = 0.0254;
      var LENGTH_FOOT_TO_METERS = 0.3048;
      var LENGTH_YARD_TO_METERS = 0.9144;
      var LENGTH_MILE_TO_METERS = 1609.344;
      var WEIGHT_OUNCE_TO_GRAMS = 28.3495;
      var WEIGHT_POUND_TO_GRAMS = 453.592;
      var AREA_SQFT_TO_SQM = LENGTH_FOOT_TO_METERS * LENGTH_FOOT_TO_METERS;
      var AREA_SQIN_TO_SQM = LENGTH_INCH_TO_METERS * LENGTH_INCH_TO_METERS;
      var AREA_SQYD_TO_SQM = LENGTH_YARD_TO_METERS * LENGTH_YARD_TO_METERS;
      var AREA_SQMI_TO_SQM = LENGTH_MILE_TO_METERS * LENGTH_MILE_TO_METERS;
      var AREA_ACRE_TO_SQM = 4046.8564224;
      var LIQUID_GALLON_TO_L = 3.78541;
      var LIQUID_QUART_TO_L = 0.946353;
      var LIQUID_PINT_TO_L = 0.473176;
      var LIQUID_CUP_TO_L = 0.236588;
      var LIQUID_FLOZ_TO_L = 0.0295735;
      var LIQUID_TBSP_TO_L = 0.0147868;
      var LIQUID_TSP_TO_L = 492892e-8;
      var UNICODE_FRACTIONS = "\xBD\xBC\xBE\u2153\u2154\u2155\u2156\u2157\u2158\u2159\u215A\u2150\u215B\u215C\u215D\u215E\u2151\u2152";
      var UNICODE_FRACTIONS_MAP = {
        "\xBD": 0.5,
        "\xBC": 0.25,
        "\xBE": 0.75,
        "\u2153": 1 / 3,
        "\u2154": 2 / 3,
        "\u2155": 0.2,
        "\u2156": 0.4,
        "\u2157": 0.6,
        "\u2158": 0.8,
        "\u2159": 1 / 6,
        "\u215A": 5 / 6,
        "\u215B": 0.125,
        "\u215C": 0.375,
        "\u215D": 0.625,
        "\u215E": 0.875,
        "\u2150": 1 / 7,
        "\u2151": 1 / 9,
        "\u2152": 0.1
      };
      var UNICODE_FRACTIONS_DENOM = {
        "\xBD": 2,
        "\xBC": 4,
        "\xBE": 4,
        "\u2153": 3,
        "\u2154": 3,
        "\u2155": 5,
        "\u2156": 5,
        "\u2157": 5,
        "\u2158": 5,
        "\u2159": 6,
        "\u215A": 6,
        "\u215B": 8,
        "\u215C": 8,
        "\u215D": 8,
        "\u215E": 8,
        "\u2150": 7,
        "\u2151": 9,
        "\u2152": 10
      };
      var CURRENCY_SYMBOLS = "$\u20AC\xA3\xA5\u20B9\u20BD\u20A9\u20BA\u20AA\u20AB\u20B4\u20A6\u20B1\u0E3F\u20AD\u20B2\u20A1\u20B5\u20B8\u20BC\u20BE\u20BF";
      var FEET_SYMBOLS = "'\u2032\u2019";
      var INCH_SYMBOLS = '"\u2033\u201D';
      var TIME_ZONE_OFFSETS = {
        EST: -5,
        CST: -6,
        MST: -7,
        PST: -8,
        EDT: -4,
        CDT: -5,
        MDT: -6,
        PDT: -7,
        GMT: 0,
        UTC: 0
      };
      module.exports = {
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
        CURRENCY_SYMBOLS,
        FEET_SYMBOLS,
        INCH_SYMBOLS,
        TIME_ZONE_OFFSETS
      };
    }
  });

  // src/parsing/numbers.js
  var require_numbers = __commonJS({
    "src/parsing/numbers.js"(exports, module) {
      var { UNICODE_FRACTIONS_MAP, UNICODE_FRACTIONS_DENOM } = require_constants();
      var RE_MIXED_UNICODE = /^(\d+)\s*([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*$/;
      var RE_DECIMAL_NUM = /^\d*\.\d+\s*$/;
      var RE_WHOLE_NUM = /^\d+\s*$/;
      var RE_SIMPLE_FRACTION = /^(\d+)\/(\d+)\s*$/;
      var RE_MIXED_FRACTION = /^(\d+)\s+(\d+)\/(\d+)\s*$/;
      var RE_HYPHENATED_MIXED_FRACTION = /^(\d+)-(\d+)\/(\d+)\s*$/;
      function convertToDecimal(value) {
        if (!value || typeof value !== "string") {
          return NaN;
        }
        const trimmed = String(value).trim().replace(/,/g, "");
        if (Object.prototype.hasOwnProperty.call(UNICODE_FRACTIONS_MAP, trimmed)) {
          return UNICODE_FRACTIONS_MAP[trimmed];
        }
        const mixedUnicodeMatch = trimmed.match(RE_MIXED_UNICODE);
        if (mixedUnicodeMatch) {
          const wholeNumber = parseInt(mixedUnicodeMatch[1], 10);
          const fraction = UNICODE_FRACTIONS_MAP[mixedUnicodeMatch[2]];
          return Number.isNaN(fraction) ? NaN : wholeNumber + fraction;
        }
        if (RE_DECIMAL_NUM.test(trimmed)) {
          return parseFloat(trimmed);
        }
        if (RE_WHOLE_NUM.test(trimmed)) {
          return parseInt(trimmed, 10);
        }
        const fractionMatch = trimmed.match(RE_SIMPLE_FRACTION);
        if (fractionMatch) {
          return parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);
        }
        const hyphenatedMixedMatch = trimmed.match(RE_HYPHENATED_MIXED_FRACTION);
        if (hyphenatedMixedMatch) {
          const wholeNumber = parseInt(hyphenatedMixedMatch[1], 10);
          const numerator = parseInt(hyphenatedMixedMatch[2], 10);
          const denominator = parseInt(hyphenatedMixedMatch[3], 10);
          return wholeNumber + numerator / denominator;
        }
        const mixedMatch = trimmed.match(RE_MIXED_FRACTION);
        if (mixedMatch) {
          const wholeNumber = parseInt(mixedMatch[1], 10);
          const numerator = parseInt(mixedMatch[2], 10);
          const denominator = parseInt(mixedMatch[3], 10);
          return wholeNumber + numerator / denominator;
        }
        return NaN;
      }
      module.exports = {
        convertToDecimal
      };
    }
  });

  // src/parsing/regex.js
  var require_regex = __commonJS({
    "src/parsing/regex.js"(exports, module) {
      var { UNICODE_FRACTIONS } = require_constants();
      var MEASUREMENT_REGEX_TEMPLATE = String.raw`\b(?:(?:(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)-\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))+[ \t\f\v]+(?![\r\n])(?:{{UNIT_BIG}})[ \t\f\v]+(?![\r\n])(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)-\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))+[ \t\f\v]+(?![\r\n])(?:{{UNIT_SMALL}}))|(?:(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)-\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[ \t\f\v][${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))[ \t\f\v]+(?:{{UNIT_COMBINED}})(?![ \t\f\v]+(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)-\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${UNICODE_FRACTIONS}]|[${UNICODE_FRACTIONS}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))[ \t\f\v]+(?:{{UNIT_COMBINED}}))))(?=\b|\W|$)(?!\s*\(.*\))`;
      var measureRegexCache = /* @__PURE__ */ new Map();
      function createRegexFromTemplate(unitBig, unitSmall = "") {
        const key = `${unitBig}__${unitSmall}`;
        const cached = measureRegexCache.get(key);
        if (cached) return cached;
        const combined = unitSmall && unitSmall.length > 0 ? `${unitBig}|${unitSmall}` : unitBig;
        let regexStr = MEASUREMENT_REGEX_TEMPLATE.replace("{{UNIT_BIG}}", unitBig || "").replace("{{UNIT_SMALL}}", unitSmall || "").replaceAll("{{UNIT_COMBINED}}", combined || "");
        const compiled = new RegExp(regexStr, "giu");
        measureRegexCache.set(key, compiled);
        return compiled;
      }
      var TIME_REGEX = String.raw`\b(?:(?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\s*(?:am|pm)|(?:2[0-3]|[01]?[0-9])(?::[0-5][0-9])(?::[0-5][0-9])?)(?:\s+)(?:(?:EST|CST|MST|PST|EDT|CDT|MDT|PDT)|(?:GMT|UTC)(?:\s*[+-]\s*\d+(?::[0-5][0-9])?)?)\b(?!\s*\(.*\))`;
      var RE_TIME_GLOBAL = new RegExp(TIME_REGEX, "gi");
      var RE_TIME_TEST = new RegExp(TIME_REGEX, "i");
      var TEMPERATURE_F_REGEX = String.raw`(?<!\()(?<![\d.])(-?\d+(?:\.\d+)?)\s*(?:°\s*F|℉|F\b|deg\s*F|degree\s*F|degrees\s*F|degrees?\s*Fahrenheit|Fahrenheit)\b(?!\s*\()`;
      var RE_TEMPERATURE_F = new RegExp(TEMPERATURE_F_REGEX, "gi");
      var RE_TEMPERATURE_F_TEST = new RegExp(TEMPERATURE_F_REGEX, "i");
      module.exports = {
        MEASUREMENT_REGEX_TEMPLATE,
        createRegexFromTemplate,
        TIME_REGEX,
        RE_TIME_GLOBAL,
        RE_TIME_TEST,
        TEMPERATURE_F_REGEX,
        RE_TEMPERATURE_F,
        RE_TEMPERATURE_F_TEST
      };
    }
  });

  // src/parsing/measurement.js
  var require_measurement = __commonJS({
    "src/parsing/measurement.js"(exports, module) {
      var { UNICODE_FRACTIONS } = require_constants();
      var { convertToDecimal } = require_numbers();
      var unitRegexCache = /* @__PURE__ */ new WeakMap();
      function getUnitRegexes(units) {
        let pair = unitRegexCache.get(units);
        if (!pair) {
          const primary = new RegExp(`^(${units.PRIMARY})$`, "i");
          const secondary = new RegExp(`^(${units.SECONDARY})$`, "i");
          pair = { primary, secondary };
          unitRegexCache.set(units, pair);
        }
        return pair;
      }
      function extractFirstValueToken(s) {
        const unicode = UNICODE_FRACTIONS;
        const re = new RegExp(
          String.raw`(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${unicode}]|[${unicode}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))`,
          "u"
        );
        const m = String(s).match(re);
        return m ? m[0] : "";
      }
      function parseMeasurementMatch(match, units) {
        const unitPattern = new RegExp(`(${units.PRIMARY}|${units.SECONDARY})`, "i");
        const parts = match.trim().split(unitPattern).map((p) => p.trim()).filter(Boolean);
        let primaryValue = 0, secondaryValue = 0;
        let primaryUnit = null, secondaryUnit = null;
        let primaryRaw = null, secondaryRaw = null;
        if (parts.length >= 2) {
          const firstValueRaw = parts[0];
          const firstValue = convertToDecimal(firstValueRaw);
          const firstUnit = parts[1].toLowerCase();
          const { primary: rePrimary, secondary: reSecondary } = getUnitRegexes(units);
          if (rePrimary.test(firstUnit)) {
            primaryValue = firstValue;
            primaryUnit = firstUnit;
            primaryRaw = firstValueRaw;
            if (parts.length >= 4) {
              const secondValueRaw = parts[2];
              const secondValue = convertToDecimal(secondValueRaw);
              const secondUnit = parts[3].toLowerCase();
              if (reSecondary.test(secondUnit)) {
                secondaryValue = secondValue;
                secondaryUnit = secondUnit;
                secondaryRaw = secondValueRaw;
              }
            }
          } else if (reSecondary.test(firstUnit)) {
            secondaryValue = firstValue;
            secondaryUnit = firstUnit;
            secondaryRaw = firstValueRaw;
          }
        }
        return {
          primary: { value: primaryValue, unit: primaryUnit, raw: primaryRaw },
          secondary: { value: secondaryValue, unit: secondaryUnit, raw: secondaryRaw }
        };
      }
      module.exports = {
        getUnitRegexes,
        extractFirstValueToken,
        parseMeasurementMatch
      };
    }
  });

  // src/utils/precision.js
  var require_precision = __commonJS({
    "src/utils/precision.js"(exports, module) {
      var {
        LENGTH_INCH_TO_METERS,
        LENGTH_FOOT_TO_METERS,
        LENGTH_YARD_TO_METERS,
        LENGTH_MILE_TO_METERS,
        UNICODE_FRACTIONS_DENOM
      } = require_constants();
      var { getUnitRegexes } = require_measurement();
      function inferResolutionFromValue(raw, unitScale) {
        if (!raw || !(unitScale > 0)) return void 0;
        const step = resolutionStepOfValueString(String(raw));
        if (!(step > 0)) return void 0;
        return step * unitScale;
      }
      function mergeResolutionSteps(steps) {
        let best;
        for (const step of steps) {
          if (!(step > 0)) continue;
          best = best === void 0 ? step : Math.min(best, step);
        }
        return best;
      }
      function inferResolutionMetersFromNumber(raw, unit) {
        if (!unit) return void 0;
        const scaleMap = {
          in: LENGTH_INCH_TO_METERS,
          ft: LENGTH_FOOT_TO_METERS,
          mi: LENGTH_MILE_TO_METERS,
          yd: LENGTH_YARD_TO_METERS
        };
        const unitScale = scaleMap[unit];
        if (!unitScale) return void 0;
        return inferResolutionFromValue(raw, unitScale);
      }
      function resolutionStepOfValueString(s) {
        if (!s) return void 0;
        const str = String(s).trim();
        const slashMatch = str.match(/(\d+)\s*\/\s*(\d+)/);
        let denom = slashMatch ? parseInt(slashMatch[2], 10) : void 0;
        let unicodeDenom;
        for (const ch of str) {
          if (UNICODE_FRACTIONS_DENOM[ch]) {
            unicodeDenom = unicodeDenom ? Math.max(unicodeDenom, UNICODE_FRACTIONS_DENOM[ch]) : UNICODE_FRACTIONS_DENOM[ch];
          }
        }
        if (unicodeDenom) {
          denom = denom ? Math.max(denom, unicodeDenom) : unicodeDenom;
        }
        if (denom && denom > 0) {
          return 1 / denom;
        }
        const dot = str.indexOf(".");
        if (dot >= 0) {
          const dec = str.slice(dot + 1).replace(/\D/g, "");
          if (dec.length > 0) return Math.pow(10, -dec.length);
        }
        return 1;
      }
      function inferResolutionMetersFromLengthMatch(match, units) {
        try {
          const unitPattern = new RegExp(`(${units.PRIMARY}|${units.SECONDARY})`, "i");
          const parts = match.trim().split(unitPattern).map((p) => p.trim()).filter(Boolean);
          const { primary: rePrimary, secondary: reSecondary } = getUnitRegexes(units);
          const steps = [];
          if (parts.length >= 2) {
            const val1 = parts[0];
            const unit1 = parts[1].toLowerCase();
            const step1 = resolutionStepOfValueString(val1);
            if (step1 && step1 > 0) {
              if (rePrimary.test(unit1)) steps.push(step1 * LENGTH_FOOT_TO_METERS);
              else if (reSecondary.test(unit1)) steps.push(step1 * LENGTH_INCH_TO_METERS);
            }
          }
          if (parts.length >= 4) {
            const val2 = parts[2];
            const unit2 = parts[3].toLowerCase();
            const step2 = resolutionStepOfValueString(val2);
            if (step2 && step2 > 0) {
              if (reSecondary.test(unit2)) steps.push(step2 * LENGTH_INCH_TO_METERS);
              else if (rePrimary.test(unit2)) steps.push(step2 * LENGTH_FOOT_TO_METERS);
            }
          }
          return mergeResolutionSteps(steps);
        } catch (_) {
          return void 0;
        }
      }
      function inferResolutionFromParsedMeasurement(parsed, scales = {}) {
        if (!parsed || typeof parsed !== "object") return void 0;
        const steps = [];
        if (parsed.primary && parsed.primary.raw && scales.primary) {
          steps.push(inferResolutionFromValue(parsed.primary.raw, scales.primary));
        }
        if (parsed.secondary && parsed.secondary.raw && scales.secondary) {
          steps.push(inferResolutionFromValue(parsed.secondary.raw, scales.secondary));
        }
        return mergeResolutionSteps(steps);
      }
      function computeDecimalPlaces({
        valueInUnit,
        resolutionBase,
        unitScale,
        minDecimals = 0,
        maxDecimals = 6,
        magnitudeCaps = null,
        allowResolution = true
      }) {
        let effectiveMin = Math.max(0, minDecimals);
        let effectiveMax = Math.max(effectiveMin, maxDecimals);
        if (Array.isArray(magnitudeCaps) && magnitudeCaps.length > 0) {
          for (const { threshold, decimals: decimals2 } of magnitudeCaps) {
            if (Math.abs(valueInUnit) >= threshold) {
              effectiveMax = Math.min(effectiveMax, decimals2);
              break;
            }
          }
          if (effectiveMax < effectiveMin) {
            effectiveMin = effectiveMax;
          }
        }
        let decimals = allowResolution === false ? effectiveMax : effectiveMin;
        if (allowResolution && typeof resolutionBase === "number" && resolutionBase > 0) {
          const resolutionInUnit = resolutionBase * unitScale;
          if (resolutionInUnit > 0) {
            const raw = Math.ceil(-Math.log10(resolutionInUnit));
            if (Number.isFinite(raw)) {
              decimals = Math.max(decimals, raw);
            }
          }
        }
        decimals = Math.min(decimals, effectiveMax);
        if (!Number.isFinite(decimals) || decimals < 0) decimals = 0;
        return Math.floor(decimals);
      }
      module.exports = {
        inferResolutionFromValue,
        mergeResolutionSteps,
        inferResolutionMetersFromNumber,
        resolutionStepOfValueString,
        inferResolutionMetersFromLengthMatch,
        inferResolutionFromParsedMeasurement,
        computeDecimalPlaces
      };
    }
  });

  // src/formatting/numbers.js
  var require_numbers2 = __commonJS({
    "src/formatting/numbers.js"(exports, module) {
      function formatNumberWithGrouping(num, decimals) {
        const fixed = num.toFixed(Math.max(decimals, 0));
        const trimmed = decimals > 0 ? fixed.replace(/\.?0+$/, "") : fixed;
        const [intPart, frac] = trimmed.split(".");
        const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return frac ? `${intWithCommas}.${frac}` : intWithCommas;
      }
      module.exports = {
        formatNumberWithGrouping
      };
    }
  });

  // src/formatting/units.js
  var require_units2 = __commonJS({
    "src/formatting/units.js"(exports, module) {
      var { formatNumberWithGrouping } = require_numbers2();
      var { computeDecimalPlaces } = require_precision();
      function formatMeasurement(baseValue, options) {
        const { resolutionBase, units } = options;
        if (!(units && units.length)) return "";
        const lastIndex = units.length - 1;
        for (let i = 0; i < units.length; i++) {
          const config = units[i];
          const { threshold, scale, label } = config;
          const matches = Math.abs(baseValue) >= threshold || i === lastIndex;
          if (!matches) continue;
          const valueInUnit = baseValue * scale;
          const decimals = computeDecimalPlaces({
            valueInUnit,
            resolutionBase,
            unitScale: scale,
            minDecimals: config.minDecimals,
            maxDecimals: config.maxDecimals,
            magnitudeCaps: config.magnitudeCaps,
            allowResolution: config.allowResolution !== false
          });
          return `${formatNumberWithGrouping(valueInUnit, decimals)} ${label}`;
        }
        return "";
      }
      function formatLengthMeasurement(meters, options = {}) {
        const { resolutionMeters } = options;
        if (meters === 0) return "0 cm";
        return formatMeasurement(meters, {
          resolutionBase: resolutionMeters,
          units: [
            {
              threshold: 1e3,
              scale: 1 / 1e3,
              label: "km",
              minDecimals: 0,
              maxDecimals: 2,
              magnitudeCaps: [
                { threshold: 1e3, decimals: 0 },
                { threshold: 100, decimals: 1 },
                { threshold: 0, decimals: 2 }
              ],
              allowResolution: false
            },
            {
              threshold: 1,
              scale: 1,
              label: "m",
              minDecimals: 2,
              maxDecimals: 3
            },
            {
              threshold: 0.01,
              scale: 100,
              label: "cm",
              minDecimals: 2,
              maxDecimals: 3
            },
            {
              threshold: 0,
              scale: 1e3,
              label: "mm",
              minDecimals: 2,
              maxDecimals: 3
            }
          ]
        });
      }
      function formatWeightMeasurement(grams, options = {}) {
        const { resolutionGrams } = options;
        if (grams === 0) return "0 g";
        return formatMeasurement(grams, {
          resolutionBase: resolutionGrams,
          units: [
            {
              threshold: 900,
              scale: 1 / 1e3,
              label: "kg",
              minDecimals: 2,
              maxDecimals: 4
            },
            {
              threshold: 0,
              scale: 1,
              label: "g",
              minDecimals: 2,
              maxDecimals: 4
            }
          ]
        });
      }
      function formatLiquidMeasurement(liters, options = {}) {
        const { resolutionLiters } = options;
        if (liters === 0) return "0 ml";
        return formatMeasurement(liters, {
          resolutionBase: resolutionLiters,
          units: [
            {
              threshold: 0.25,
              scale: 1,
              label: "L",
              minDecimals: 2,
              maxDecimals: 4
            },
            {
              threshold: 0,
              scale: 1e3,
              label: "ml",
              minDecimals: 2,
              maxDecimals: 4
            }
          ]
        });
      }
      function formatAreaMeasurement(squareMeters, options = {}) {
        const { resolutionSquareMeters } = options;
        if (squareMeters === 0) return "0 m\xB2";
        return formatMeasurement(squareMeters, {
          resolutionBase: resolutionSquareMeters,
          units: [
            {
              threshold: 1e6,
              scale: 1 / 1e6,
              label: "km\xB2",
              minDecimals: 0,
              maxDecimals: 3,
              magnitudeCaps: [
                { threshold: 1e3, decimals: 0 },
                { threshold: 10, decimals: 1 },
                { threshold: 0, decimals: 2 }
              ],
              allowResolution: false
            },
            {
              threshold: 1e4,
              scale: 1 / 1e4,
              label: "ha",
              minDecimals: 2,
              maxDecimals: 4
            },
            {
              threshold: 0,
              scale: 1,
              label: "m\xB2",
              minDecimals: 2,
              maxDecimals: 3
            }
          ]
        });
      }
      function formatTemperatureCelsius(celsius, options = {}) {
        const { resolutionCelsius } = options;
        const decimals = computeDecimalPlaces({
          valueInUnit: celsius,
          resolutionBase: resolutionCelsius,
          unitScale: 1,
          minDecimals: 2,
          maxDecimals: 4,
          magnitudeCaps: [
            { threshold: 100, decimals: 0 },
            { threshold: 5, decimals: 1 },
            { threshold: 0, decimals: 2 }
          ]
        });
        return celsius.toFixed(decimals);
      }
      module.exports = {
        formatMeasurement,
        formatLengthMeasurement,
        formatWeightMeasurement,
        formatLiquidMeasurement,
        formatAreaMeasurement,
        formatTemperatureCelsius
      };
    }
  });

  // src/formatting/ranges.js
  var require_ranges = __commonJS({
    "src/formatting/ranges.js"(exports, module) {
      function formatNum(n) {
        const s = n.toFixed(2).replace(/\.?0+$/, "");
        const [intPart, frac] = s.split(".");
        const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return frac ? `${intWithCommas}.${frac}` : intWithCommas;
      }
      function formatLengthRange(m1, m2) {
        const a = Math.min(m1, m2);
        const b = Math.max(m1, m2);
        if (b >= 1e3) return `${formatNum(a / 1e3)}\u2013${formatNum(b / 1e3)} km`;
        if (b >= 1) return `${formatNum(a)}\u2013${formatNum(b)} m`;
        if (b >= 0.01) return `${formatNum(a * 100)}\u2013${formatNum(b * 100)} cm`;
        return `${formatNum(a * 1e3)}\u2013${formatNum(b * 1e3)} mm`;
      }
      function formatWeightRange(g1, g2) {
        const a = Math.min(g1, g2);
        const b = Math.max(g1, g2);
        if (a >= 1e3 && b >= 1e3) return `${formatNum(a / 1e3)}\u2013${formatNum(b / 1e3)} kg`;
        return `${formatNum(a)}\u2013${formatNum(b)} g`;
      }
      function formatLiquidRange(l1, l2) {
        const a = Math.min(l1, l2);
        const b = Math.max(l1, l2);
        if (b >= 1) return `${formatNum(a)}\u2013${formatNum(b)} L`;
        return `${formatNum(a * 1e3)}\u2013${formatNum(b * 1e3)} ml`;
      }
      function formatTemperatureRange(c1, c2) {
        const a = Math.min(c1, c2);
        const b = Math.max(c1, c2);
        return `${Math.round(a)}\u2013${Math.round(b)}`;
      }
      module.exports = {
        formatLengthRange,
        formatWeightRange,
        formatLiquidRange,
        formatTemperatureRange
      };
    }
  });

  // src/exclusions/patterns.js
  var require_patterns = __commonJS({
    "src/exclusions/patterns.js"(exports, module) {
      var { CURRENCY_SYMBOLS } = require_constants();
      var INVALID_PREFIXES = `${CURRENCY_SYMBOLS}:`;
      var CURRENCY_WORDS = [
        "USD",
        "CAD",
        "AUD",
        "EUR",
        "GBP",
        "JPY",
        "CHF",
        "CNY",
        "INR",
        "BRL",
        "MXN",
        "ZAR",
        "SGD",
        "HKD",
        "DKK",
        "SEK",
        "NOK",
        "TRY",
        "RUB",
        "AED",
        "SAR"
      ];
      var CURRENCY_WORD_SET = new Set(CURRENCY_WORDS);
      var INCH_ABBREVIATION_RE = /\bin\.?\b/i;
      var FOOT_TERMS_PATTERN = /\b(?:ft|feet|foot)\b/i;
      var STANDALONE_IN_PATTERN = /^\s*\d[\d\s,\.\/]*\s*in\.?\s*$/i;
      var QUOTE_PAIRS = [
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: "\u201C", close: "\u201D" },
        { open: "\u2018", close: "\u2019" }
      ];
      function hasInvalidPrefix(text, startIndex) {
        if (!text || typeof text !== "string") return false;
        let i = startIndex - 1;
        while (i >= 0) {
          if (/\s/.test(text[i])) {
            return false;
          }
          const ch = text[i];
          if (ch === ":") return true;
          if (INVALID_PREFIXES.includes(ch)) return true;
          i -= 1;
        }
        return false;
      }
      function hasPortContext(text, startIndex) {
        if (!text || typeof text !== "string") return false;
        const prefix = text.slice(0, startIndex);
        const portPattern = /:\d+\s*$/;
        return portPattern.test(prefix);
      }
      function hasCurrencyContext(text, startIndex) {
        if (!text || typeof text !== "string") return false;
        const slice = text.slice(0, startIndex).trimEnd();
        if (!slice) return false;
        const tokens = slice.split(/\s+/);
        const candidate = tokens[tokens.length - 1];
        if (!candidate) return false;
        const normalized = candidate.replace(/[^A-Za-z]/g, "").toUpperCase();
        return CURRENCY_WORD_SET.has(normalized);
      }
      function isInchAbbreviation(match) {
        if (!match || typeof match !== "string") return false;
        return INCH_ABBREVIATION_RE.test(match);
      }
      function shouldExcludeCurrencyIn(text, matchStart, match) {
        if (!isInchAbbreviation(match)) return false;
        return hasCurrencyContext(text, matchStart);
      }
      function hasCapitalizedWordAfter(text, matchStart, match) {
        if (!text || typeof text !== "string") return false;
        let index = matchStart + (match ? match.length : 0);
        while (index < text.length && /\s/.test(text[index])) {
          index += 1;
        }
        if (index >= text.length) return false;
        const ch = text[index];
        return ch === ch.toUpperCase() && ch !== ch.toLowerCase();
      }
      function isStandaloneInMatch(match) {
        if (!match || typeof match !== "string") return false;
        const trimmed = match.trim();
        if (!STANDALONE_IN_PATTERN.test(trimmed)) return false;
        return !FOOT_TERMS_PATTERN.test(trimmed);
      }
      function shouldExcludePrepositionIn(text, matchStart, match) {
        if (!isStandaloneInMatch(match)) return false;
        return hasCapitalizedWordAfter(text, matchStart, match);
      }
      function isWordChar(ch) {
        return ch ? /\w/.test(ch) : false;
      }
      function isInsideQuotes(text, matchStart, match) {
        if (!text || typeof text !== "string") return false;
        const matchEnd = matchStart + (match ? match.length : 0);
        for (const { open, close } of QUOTE_PAIRS) {
          let searchIndex = -1;
          while ((searchIndex = text.indexOf(open, searchIndex + 1)) !== -1) {
            if (searchIndex >= matchStart) {
              break;
            }
            if (isWordChar(text[searchIndex - 1])) {
              continue;
            }
            let closeIndex = searchIndex;
            while ((closeIndex = text.indexOf(close, closeIndex + 1)) !== -1) {
              if (isWordChar(text[closeIndex + 1])) {
                continue;
              }
              if (matchStart >= searchIndex && matchEnd <= closeIndex + 1) {
                return true;
              }
              if (closeIndex + 1 >= matchEnd) {
                break;
              }
            }
          }
        }
        return false;
      }
      function shouldExcludeMatch({ text, matchStart, match }) {
        if (hasInvalidPrefix(text, matchStart)) return true;
        if (isInsideQuotes(text, matchStart, match)) return true;
        if (shouldExcludeCurrencyIn(text, matchStart, match)) return true;
        if (hasPortContext(text, matchStart)) return true;
        if (shouldExcludePrepositionIn(text, matchStart, match)) return true;
        return false;
      }
      module.exports = {
        hasInvalidPrefix,
        hasCurrencyContext,
        isInchAbbreviation,
        isInsideQuotes,
        shouldExcludeCurrencyIn,
        shouldExcludeMatch
      };
    }
  });

  // src/units/length.js
  var require_length = __commonJS({
    "src/units/length.js"(exports, module) {
      var { UNITS } = require_units();
      var {
        LENGTH_INCH_TO_METERS,
        LENGTH_FOOT_TO_METERS,
        LENGTH_YARD_TO_METERS,
        LENGTH_MILE_TO_METERS,
        UNICODE_FRACTIONS,
        FEET_SYMBOLS,
        INCH_SYMBOLS
      } = require_constants();
      var { convertToDecimal } = require_numbers();
      var { createRegexFromTemplate } = require_regex();
      var { parseMeasurementMatch, extractFirstValueToken } = require_measurement();
      var {
        inferResolutionMetersFromNumber,
        inferResolutionMetersFromLengthMatch
      } = require_precision();
      var { formatLengthMeasurement } = require_units2();
      var { shouldExcludeMatch } = require_patterns();
      function shouldSkipMatch(match, offset, source) {
        return shouldExcludeMatch({ text: source, matchStart: offset, match });
      }
      function convertLengthToMeters(feet = 0, inches = 0, miles = 0, yards = 0) {
        return miles * LENGTH_MILE_TO_METERS + yards * LENGTH_YARD_TO_METERS + feet * LENGTH_FOOT_TO_METERS + inches * LENGTH_INCH_TO_METERS;
      }
      function convertLengthText(text) {
        let converted = text;
        const VALUE_PART = String.raw`(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)-\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+)\s+\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+)[${UNICODE_FRACTIONS}]?|[${UNICODE_FRACTIONS}])`;
        const dimensionRegex = new RegExp(
          String.raw`(${VALUE_PART})\s*(?:''|[${INCH_SYMBOLS}])?\s*[x×]\s*(${VALUE_PART})\s*(?:''|[${INCH_SYMBOLS}])(?!\s*\()`,
          "giu"
        );
        const inchesSymbolRegex = new RegExp(
          String.raw`(${VALUE_PART})\s*(?:''|[${INCH_SYMBOLS}])(?!\s*\()`,
          "giu"
        );
        const feetSymbolRegex = new RegExp(
          String.raw`(${VALUE_PART})\s*[${FEET_SYMBOLS}](?!')(?!\s*\()(?!s)`,
          "giu"
        );
        if (INCH_SYMBOLS.split("").some((sym) => converted.includes(sym)) || converted.includes("''")) {
          converted = converted.replace(dimensionRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const value1 = args[1];
            const value2 = args[2];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;
            const raw1 = String(value1);
            const raw2 = String(value2);
            const inches1 = convertToDecimal(raw1);
            const inches2 = convertToDecimal(raw2);
            if (Number.isNaN(inches1) || Number.isNaN(inches2)) return match;
            const meters1 = convertLengthToMeters(0, inches1, 0);
            const meters2 = convertLengthToMeters(0, inches2, 0);
            const resolutionMeters1 = inferResolutionMetersFromNumber(raw1, "in");
            const resolutionMeters2 = inferResolutionMetersFromNumber(raw2, "in");
            const formatted1 = formatLengthMeasurement(meters1, {
              resolutionMeters: resolutionMeters1
            });
            const formatted2 = formatLengthMeasurement(meters2, {
              resolutionMeters: resolutionMeters2
            });
            const numericPart1 = formatted1.replace(/\s*(cm|mm|m|km)\s*$/i, "");
            return `${match} (${numericPart1}x${formatted2})`;
          });
        }
        if (INCH_SYMBOLS.split("").some((sym) => converted.includes(sym)) || converted.includes("''")) {
          converted = converted.replace(inchesSymbolRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const value = args[1];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;
            const raw = String(value);
            const inches = convertToDecimal(raw);
            if (Number.isNaN(inches)) return match;
            const meters = convertLengthToMeters(0, inches, 0);
            const resolutionMeters = inferResolutionMetersFromNumber(raw, "in");
            const result = `${match} (${formatLengthMeasurement(meters, { resolutionMeters })})`;
            return result;
          });
        }
        if (FEET_SYMBOLS.split("").some((sym) => converted.includes(sym))) {
          converted = converted.replace(feetSymbolRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const value = args[1];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;
            const raw = String(value);
            const feet = convertToDecimal(raw);
            if (Number.isNaN(feet)) return match;
            const meters = convertLengthToMeters(feet, 0, 0);
            const resolutionMeters = inferResolutionMetersFromNumber(raw, "ft");
            return `${match} (${formatLengthMeasurement(meters, { resolutionMeters })})`;
          });
        }
        const lowerLen = converted.toLowerCase();
        if (lowerLen.includes("ft") || lowerLen.includes("foot") || lowerLen.includes("feet") || lowerLen.includes(" in") || lowerLen.includes("inch")) {
          const feetInchesRegex = createRegexFromTemplate(
            UNITS.LENGTH.FEET_INCHES.PRIMARY,
            UNITS.LENGTH.FEET_INCHES.SECONDARY
          );
          converted = converted.replace(feetInchesRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;
            if (s) {
              const after = s.slice(offset + match.length, offset + match.length + 3);
              if (/^\s*(?:\^\s*2|²)/.test(after)) return match;
            }
            const parsed = parseMeasurementMatch(match, UNITS.LENGTH.FEET_INCHES);
            const meters = convertLengthToMeters(parsed.primary.value, parsed.secondary.value);
            if (meters === 0) return match;
            const resolutionMeters = inferResolutionMetersFromLengthMatch(
              match,
              UNITS.LENGTH.FEET_INCHES
            );
            return `${match} (${formatLengthMeasurement(meters, { resolutionMeters })})`;
          });
        }
        if (lowerLen.includes(" mi") || lowerLen.includes("mile")) {
          const milesRegex = createRegexFromTemplate(UNITS.LENGTH.MILES.PRIMARY, "");
          converted = converted.replace(milesRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;
            if (s) {
              const after = s.slice(offset + match.length, offset + match.length + 3);
              if (/^\s*(?:\^\s*2|²)/.test(after)) return match;
            }
            const parsed = parseMeasurementMatch(match, UNITS.LENGTH.MILES);
            const meters = convertLengthToMeters(0, 0, parsed.primary.value);
            if (meters === 0) return match;
            const resolutionMeters = inferResolutionMetersFromNumber(
              extractFirstValueToken(match),
              "mi"
            );
            return `${match} (${formatLengthMeasurement(meters, { resolutionMeters })})`;
          });
        }
        if (lowerLen.includes(" yd") || lowerLen.includes("yard")) {
          const yardsRegex = createRegexFromTemplate(UNITS.LENGTH.YARDS.PRIMARY, "");
          converted = converted.replace(yardsRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const s = args[args.length - 1];
            if (shouldSkipMatch(match, offset, s)) return match;
            if (s) {
              const after = s.slice(offset + match.length, offset + match.length + 3);
              if (/^\s*(?:\^\s*2|²)/.test(after)) return match;
            }
            const parsed = parseMeasurementMatch(match, UNITS.LENGTH.YARDS);
            const meters = convertLengthToMeters(0, 0, 0, parsed.primary.value);
            if (meters === 0) return match;
            const resolutionMeters = inferResolutionMetersFromNumber(
              extractFirstValueToken(match),
              "yd"
            );
            return `${match} (${formatLengthMeasurement(meters, { resolutionMeters })})`;
          });
        }
        return converted;
      }
      module.exports = {
        convertLengthToMeters,
        convertLengthText
      };
    }
  });

  // src/units/weight.js
  var require_weight = __commonJS({
    "src/units/weight.js"(exports, module) {
      var { WEIGHT_OUNCE_TO_GRAMS, WEIGHT_POUND_TO_GRAMS } = require_constants();
      var { createRegexFromTemplate } = require_regex();
      var { parseMeasurementMatch } = require_measurement();
      var { inferResolutionFromParsedMeasurement } = require_precision();
      var { formatWeightMeasurement } = require_units2();
      var { shouldExcludeMatch } = require_patterns();
      var { UNITS } = require_units();
      function shouldSkipMatch(match, offset, source) {
        return shouldExcludeMatch({ text: source, matchStart: offset, match });
      }
      function convertWeightToGrams(pounds = 0, ounces = 0) {
        return pounds * WEIGHT_POUND_TO_GRAMS + ounces * WEIGHT_OUNCE_TO_GRAMS;
      }
      function convertWeightText(text) {
        let converted = text;
        const lower = converted.toLowerCase();
        if (lower.includes("lb") || lower.includes("pound") || lower.includes("oz") || lower.includes("ounce")) {
          const weightRegex = createRegexFromTemplate(UNITS.WEIGHT.PRIMARY, UNITS.WEIGHT.SECONDARY);
          converted = converted.replace(weightRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.WEIGHT);
            const grams = convertWeightToGrams(parsed.primary.value, parsed.secondary.value);
            if (grams === 0) return match;
            const resolutionGrams = inferResolutionFromParsedMeasurement(parsed, {
              primary: WEIGHT_POUND_TO_GRAMS,
              secondary: WEIGHT_OUNCE_TO_GRAMS
            });
            return `${match} (${formatWeightMeasurement(grams, { resolutionGrams })})`;
          });
        }
        return converted;
      }
      module.exports = {
        convertWeightToGrams,
        convertWeightText
      };
    }
  });

  // src/units/liquid.js
  var require_liquid = __commonJS({
    "src/units/liquid.js"(exports, module) {
      var {
        LIQUID_GALLON_TO_L,
        LIQUID_QUART_TO_L,
        LIQUID_PINT_TO_L,
        LIQUID_CUP_TO_L,
        LIQUID_FLOZ_TO_L,
        LIQUID_TBSP_TO_L,
        LIQUID_TSP_TO_L
      } = require_constants();
      var { createRegexFromTemplate } = require_regex();
      var { parseMeasurementMatch } = require_measurement();
      var { inferResolutionFromParsedMeasurement } = require_precision();
      var { formatLiquidMeasurement } = require_units2();
      var { shouldExcludeMatch } = require_patterns();
      var { UNITS } = require_units();
      function shouldSkipMatch(match, offset, source) {
        return shouldExcludeMatch({ text: source, matchStart: offset, match });
      }
      function convertLiquidText(text) {
        let converted = text;
        const lower = converted.toLowerCase();
        if (lower.includes("gal") || lower.includes("gallon") || lower.includes("quart") || lower.includes("qt")) {
          const gallonsQuartsRegex = createRegexFromTemplate(
            UNITS.LIQUID.GALLONS_QUARTS.PRIMARY,
            UNITS.LIQUID.GALLONS_QUARTS.SECONDARY
          );
          converted = converted.replace(gallonsQuartsRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.GALLONS_QUARTS);
            const liters = parsed.primary.value * LIQUID_GALLON_TO_L + parsed.secondary.value * LIQUID_QUART_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
              primary: LIQUID_GALLON_TO_L,
              secondary: LIQUID_QUART_TO_L
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
          });
        }
        if (lower.includes("cup") || lower.includes("fl oz") || lower.includes("fluid")) {
          const cupsFluidOuncesRegex = createRegexFromTemplate(
            UNITS.LIQUID.CUPS_FLOZ.PRIMARY,
            UNITS.LIQUID.CUPS_FLOZ.SECONDARY
          );
          converted = converted.replace(cupsFluidOuncesRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.CUPS_FLOZ);
            const liters = parsed.primary.value * LIQUID_CUP_TO_L + parsed.secondary.value * LIQUID_FLOZ_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
              primary: LIQUID_CUP_TO_L,
              secondary: LIQUID_FLOZ_TO_L
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
          });
        }
        if (lower.includes("tbsp") || lower.includes("tablespoon") || lower.includes("tsp") || lower.includes("teaspoon")) {
          const tablespoonsTeaspoonsRegex = createRegexFromTemplate(
            UNITS.LIQUID.TBSP_TSP.PRIMARY,
            UNITS.LIQUID.TBSP_TSP.SECONDARY
          );
          converted = converted.replace(tablespoonsTeaspoonsRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.TBSP_TSP);
            const liters = parsed.primary.value * LIQUID_TBSP_TO_L + parsed.secondary.value * LIQUID_TSP_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
              primary: LIQUID_TBSP_TO_L,
              secondary: LIQUID_TSP_TO_L
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
          });
        }
        if (lower.includes("gal") || lower.includes("gallon")) {
          const gallonsRegex = createRegexFromTemplate(UNITS.LIQUID.GALLONS.PRIMARY, "");
          converted = converted.replace(gallonsRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.GALLONS);
            const liters = parsed.primary.value * LIQUID_GALLON_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
              primary: LIQUID_GALLON_TO_L
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
          });
        }
        if (lower.includes("quart") || lower.includes("qt")) {
          const quartsRegex = createRegexFromTemplate(UNITS.LIQUID.QUARTS.PRIMARY, "");
          converted = converted.replace(quartsRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.QUARTS);
            const liters = parsed.primary.value * LIQUID_QUART_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
              primary: LIQUID_QUART_TO_L
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
          });
        }
        if (lower.includes("pint")) {
          const pintsRegex = createRegexFromTemplate(UNITS.LIQUID.PINTS.PRIMARY, "");
          converted = converted.replace(pintsRegex, function() {
            const args = Array.from(arguments);
            const match = args[0];
            const offset = args[args.length - 2];
            const source = args[args.length - 1];
            if (shouldSkipMatch(match, offset, source)) return match;
            const parsed = parseMeasurementMatch(match, UNITS.LIQUID.PINTS);
            const liters = parsed.primary.value * LIQUID_PINT_TO_L;
            if (liters === 0) return match;
            const resolutionLiters = inferResolutionFromParsedMeasurement(parsed, {
              primary: LIQUID_PINT_TO_L
            });
            return `${match} (${formatLiquidMeasurement(liters, { resolutionLiters })})`;
          });
        }
        return converted;
      }
      module.exports = {
        convertLiquidText
      };
    }
  });

  // src/units/area.js
  var require_area = __commonJS({
    "src/units/area.js"(exports, module) {
      var {
        AREA_SQFT_TO_SQM,
        AREA_SQIN_TO_SQM,
        AREA_SQYD_TO_SQM,
        AREA_SQMI_TO_SQM,
        AREA_ACRE_TO_SQM,
        UNICODE_FRACTIONS
      } = require_constants();
      var { convertToDecimal } = require_numbers();
      var { formatAreaMeasurement } = require_units2();
      var { inferResolutionFromValue } = require_precision();
      var { shouldExcludeMatch } = require_patterns();
      function shouldSkipMatch(match, offset, source) {
        return shouldExcludeMatch({ text: source, matchStart: offset, match });
      }
      function convertAreaText(text) {
        let converted = text;
        const lower = converted.toLowerCase();
        if (lower.includes("sq ") || lower.includes("sq.") || lower.includes("square ") || lower.includes("sqft") || lower.includes(" ft2") || lower.includes("ft^2") || lower.includes("ft\xB2") || lower.includes(" in2") || lower.includes("in^2") || lower.includes("in\xB2") || lower.includes(" yd2") || lower.includes("yd^2") || lower.includes("yd\xB2") || lower.includes(" mi2") || lower.includes("mi^2") || lower.includes("mi\xB2") || lower.includes("acre")) {
          const VALUE_PART = String.raw`(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)\s+\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+)[${UNICODE_FRACTIONS}]?|[${UNICODE_FRACTIONS}])`;
          const groups = [
            {
              units: String.raw`(?:sq\.?\s*ft\.?|sq\.?\s*feet|sq\.?\s*foot|square\s+feet|square\s+foot|sqft|ft\s*(?:\^\s*2|²|2))`,
              factor: AREA_SQFT_TO_SQM
            },
            {
              units: String.raw`(?:sq\.?\s*in\.?|sq\.?\s*inch(?:es)?|square\s+inch(?:es)?|in\s*(?:\^\s*2|²|2))`,
              factor: AREA_SQIN_TO_SQM
            },
            {
              units: String.raw`(?:sq\.?\s*yd\.?|sq\.?\s*yard(?:s)?|square\s+yard(?:s)?|yd\s*(?:\^\s*2|²|2))`,
              factor: AREA_SQYD_TO_SQM
            },
            {
              units: String.raw`(?:sq\.?\s*mi\.?|sq\.?\s*mile(?:s)?|square\s+mile(?:s)?|mi\s*(?:\^\s*2|²|2))`,
              factor: AREA_SQMI_TO_SQM
            },
            {
              units: String.raw`(?:acre(?:s)?)`,
              factor: AREA_ACRE_TO_SQM
            }
          ];
          for (const { units, factor } of groups) {
            const areaRegex = new RegExp(String.raw`\b(${VALUE_PART})\s*${units}(?!\s*\()`, "giu");
            converted = converted.replace(areaRegex, function() {
              const args = Array.from(arguments);
              const match = args[0];
              const value = args[1];
              const offset = args[args.length - 2];
              const source = args[args.length - 1];
              if (shouldSkipMatch(match, offset, source)) return match;
              const raw = String(value);
              const n = convertToDecimal(raw);
              if (Number.isNaN(n)) return match;
              const sqm = n * factor;
              const resolutionSquareMeters = inferResolutionFromValue(raw, factor);
              return `${match} (${formatAreaMeasurement(sqm, { resolutionSquareMeters })})`;
            });
          }
        }
        return converted;
      }
      module.exports = {
        convertAreaText
      };
    }
  });

  // src/units/temperature.js
  var require_temperature = __commonJS({
    "src/units/temperature.js"(exports, module) {
      var { RE_TEMPERATURE_F } = require_regex();
      var { inferResolutionFromValue } = require_precision();
      var { formatTemperatureCelsius } = require_units2();
      function convertTemperatureText(text) {
        return text.replace(RE_TEMPERATURE_F, (match, fStr) => {
          const f = parseFloat(fStr);
          if (Number.isNaN(f)) return match;
          const c = (f - 32) * 5 / 9;
          const resolutionCelsius = inferResolutionFromValue(fStr, 5 / 9);
          return `${match} (${formatTemperatureCelsius(c, { resolutionCelsius })}\xB0C)`;
        });
      }
      module.exports = {
        convertTemperatureText
      };
    }
  });

  // src/units/timezone.js
  var require_timezone = __commonJS({
    "src/units/timezone.js"(exports, module) {
      var { TIME_ZONE_OFFSETS } = require_constants();
      var { RE_TIME_GLOBAL } = require_regex();
      var TARGET_TIMEZONE = "PST";
      var TARGET_TIMEZONE_OFFSET = -8;
      function convertTimeZone(timeStr, sourceTimezone, sourceOffset = null) {
        let hours = 0;
        let minutes = 0;
        let isPM = false;
        const ampmMatch = timeStr.match(/(\d+)(?::(\d+))?(?::(\d+))?\s*(am|pm)/i);
        if (ampmMatch) {
          hours = parseInt(ampmMatch[1], 10);
          minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
          isPM = ampmMatch[4].toLowerCase() === "pm";
          if (isPM && hours < 12) {
            hours += 12;
          } else if (!isPM && hours === 12) {
            hours = 0;
          }
        } else {
          const timeMatch = timeStr.match(/(\d+)(?::(\d+))?(?::(\d+))?/);
          if (timeMatch) {
            hours = parseInt(timeMatch[1], 10);
            minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
          }
        }
        let tzOffset = 0;
        if (sourceOffset !== null) {
          tzOffset = sourceOffset;
        } else if (TIME_ZONE_OFFSETS[sourceTimezone]) {
          tzOffset = TIME_ZONE_OFFSETS[sourceTimezone];
        }
        const sourceMinutesFromUTC = hours * 60 + minutes - tzOffset * 60;
        const targetMinutesFromUTC = sourceMinutesFromUTC + TARGET_TIMEZONE_OFFSET * 60;
        let targetHours = Math.floor(targetMinutesFromUTC / 60);
        while (targetHours < 0) targetHours += 24;
        targetHours = targetHours % 24;
        let targetMinutes = targetMinutesFromUTC % 60;
        if (targetMinutes < 0) targetMinutes += 60;
        let targetAmPm = "am";
        if (targetHours >= 12) {
          targetAmPm = "pm";
          if (targetHours > 12) {
            targetHours -= 12;
          }
        } else if (targetHours === 0) {
          targetHours = 12;
        }
        const formattedMinutes = targetMinutes.toString().padStart(2, "0");
        return `${targetHours}${formattedMinutes > 0 && formattedMinutes !== "00" ? `:${formattedMinutes}` : ""} ${targetAmPm}`;
      }
      function convertTimeZoneText(text) {
        let converted = text;
        const timeRegex = RE_TIME_GLOBAL;
        converted = converted.replace(timeRegex, function(match) {
          const timeAndTzParts = match.match(
            /^(.*?)(\s+)((?:EST|CST|MST|PST|EDT|CDT|MDT|PDT)|(?:GMT|UTC)(?:\s*[+-]\s*\d+(?::[0-5][0-9])?)?)$/
          );
          if (!timeAndTzParts) return match;
          const time = timeAndTzParts[1];
          const timezoneWithMaybeOffset = timeAndTzParts[3];
          const tzParts = timezoneWithMaybeOffset.match(
            /^(EST|CST|MST|PST|EDT|CDT|MDT|PDT|GMT|UTC)(?:\s*([+-])\s*(\d+)(?::(\d+))?)?$/i
          );
          if (!tzParts) return match;
          const tz = tzParts[1].toUpperCase();
          if (tz === TARGET_TIMEZONE) {
            return match;
          }
          let offset = null;
          if (tzParts[2] && tzParts[3]) {
            const sign = tzParts[2] === "+" ? 1 : -1;
            const hours = parseInt(tzParts[3], 10);
            const minutes = tzParts[4] ? parseInt(tzParts[4], 10) / 60 : 0;
            offset = sign * (hours + minutes);
          }
          const convertedTime = convertTimeZone(time, tz, offset);
          return `${match} (${convertedTime} ${TARGET_TIMEZONE})`;
        });
        return converted;
      }
      module.exports = {
        convertTimeZone,
        convertTimeZoneText,
        TARGET_TIMEZONE,
        TARGET_TIMEZONE_OFFSET
      };
    }
  });

  // src/converter.js
  var require_converter = __commonJS({
    "src/converter.js"(exports, module) {
      var { UNITS, UNIT_HINT_PATTERN } = require_units();
      var { convertLengthToMeters } = require_length();
      var { convertWeightToGrams } = require_weight();
      var { convertLengthText } = require_length();
      var { convertWeightText } = require_weight();
      var { convertLiquidText } = require_liquid();
      var { convertAreaText } = require_area();
      var { convertTemperatureText } = require_temperature();
      var { convertTimeZoneText } = require_timezone();
      var { LIQUID_GALLON_TO_L, LIQUID_QUART_TO_L, LIQUID_PINT_TO_L, LIQUID_CUP_TO_L, LIQUID_FLOZ_TO_L, LIQUID_TBSP_TO_L, LIQUID_TSP_TO_L, UNICODE_FRACTIONS, INCH_SYMBOLS, FEET_SYMBOLS } = require_constants();
      var { convertToDecimal } = require_numbers();
      var { parseMeasurementMatch, extractFirstValueToken } = require_measurement();
      var { createRegexFromTemplate, RE_TEMPERATURE_F, RE_TEMPERATURE_F_TEST, RE_TIME_GLOBAL, RE_TIME_TEST } = require_regex();
      var { formatLengthRange, formatWeightRange, formatLiquidRange, formatTemperatureRange } = require_ranges();
      var FAST_NUMBER_HINT_GLOBAL = new RegExp(String.raw`[0-9${UNICODE_FRACTIONS}]`, "u");
      var UNIT_HINT_GROUP = new RegExp(`(?:${UNIT_HINT_PATTERN})`, "iu");
      var NUM_TOKEN_GROUP = (function() {
        const unicode = UNICODE_FRACTIONS;
        const num = String.raw`(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)\s+\d+\/\d+|\d+\/\d+|[${unicode}]|(?:\d{1,3}(?:,\d{3})+|\d+)`;
        return new RegExp(num, "u");
      })();
      var RE_UNIT_NUM_HINT = (function() {
        const num = NUM_TOKEN_GROUP.source;
        const unit = UNIT_HINT_GROUP.source;
        return new RegExp(`(?:${num})\\s*(?:${unit})|(?:${unit})\\s*(?:${num})`, "iu");
      })();
      function hasRelevantUnits(text) {
        if (!text || typeof text !== "string") return false;
        if (!FAST_NUMBER_HINT_GLOBAL.test(text)) {
          if (RE_TEMPERATURE_F_TEST.test(text)) return true;
          if (RE_TIME_TEST.test(text)) return true;
          return false;
        }
        if (RE_UNIT_NUM_HINT.test(text)) return true;
        const unicode = UNICODE_FRACTIONS;
        const numToken = String.raw`(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d+)\s+\d+\/\d+|\d+\/\d+|[${unicode}]|(?:\d{1,3}(?:,\d{3})+|\d+)`;
        const RE_INCH_SYMBOL_HINT = new RegExp(String.raw`(?:${numToken})\s*[${INCH_SYMBOLS}]`, "u");
        if (RE_INCH_SYMBOL_HINT.test(text)) return true;
        if (RE_TEMPERATURE_F_TEST.test(text)) return true;
        if (RE_TIME_TEST.test(text)) return true;
        return false;
      }
      function convertText(text) {
        let converted = text;
        const FAST_NUMBER_HINT = new RegExp(String.raw`[0-9${UNICODE_FRACTIONS}]`);
        if (!FAST_NUMBER_HINT.test(converted)) {
          return converted;
        }
        const RANGE_SEP_RE = /^(?:\s*)(?:-|–|—|to|through|thru)(?:\s*)$/i;
        const VALUE_TAIL_RE = new RegExp(
          String.raw`(${`(?:\\d{1,3}(?:,\\d{3})+|\\d+)\\.\\d+|(?:\\d{1,3}(?:,\\d{3})+|\\d+)\\s+\\d+\\/\\d+|\\d+\\/\\d+|(?:\\d{1,3}(?:,\\d{3})+|\\d+)[${UNICODE_FRACTIONS}]?|[${UNICODE_FRACTIONS}]`})\s*(?:-|–|—|to|through|thru)\s*$`,
          "iu"
        );
        const placeholders = [];
        const addPlaceholder = (replacement) => {
          const token = `[[RANGE::${placeholders.length}::]]`;
          placeholders.push({ token, replacement });
          return token;
        };
        function applyReplacements(original, replacements) {
          if (replacements.length === 0) return original;
          const sorted = [...replacements].sort((x, y) => x.start - y.start);
          let out = "";
          let pos = 0;
          for (const r of sorted) {
            if (r.start < pos) continue;
            out += original.slice(pos, r.start) + r.token;
            pos = r.end;
          }
          out += original.slice(pos);
          return out;
        }
        function mergeUnitRanges(s, config) {
          const { unitSpec, converter, formatter } = config;
          const replacements = [];
          const primary = unitSpec.PRIMARY || "";
          const secondary = unitSpec.SECONDARY || "";
          const regex = createRegexFromTemplate(primary, secondary);
          const re = new RegExp(regex.source, "giu");
          const matches = [];
          let m;
          while ((m = re.exec(s)) !== null) {
            matches.push({ start: m.index, end: re.lastIndex, text: m[0] });
          }
          for (let i = 0; i < matches.length; i++) {
            const curr = matches[i];
            if (i > 0) {
              const prev = matches[i - 1];
              const between = s.slice(prev.end, curr.start);
              if (RANGE_SEP_RE.test(between)) {
                const leftParsed = parseMeasurementMatch(prev.text, unitSpec);
                const rightParsed = parseMeasurementMatch(curr.text, unitSpec);
                const val1 = converter(leftParsed);
                const val2 = converter(rightParsed);
                const formatted = formatter(val1, val2);
                const token = addPlaceholder(`${s.slice(prev.start, curr.end)} (${formatted})`);
                replacements.push({ start: prev.start, end: curr.end, token });
                continue;
              }
            }
            const leftSlice = s.slice(Math.max(0, curr.start - 50), curr.start);
            const tail = leftSlice.match(VALUE_TAIL_RE);
            if (tail) {
              const tailStart = curr.start - tail[0].length;
              const rightParsed = parseMeasurementMatch(curr.text, unitSpec);
              const hasPrimary = rightParsed.primary.unit;
              const hasSecondary = rightParsed.secondary.unit;
              const isSingleUnit = hasPrimary && !hasSecondary || !hasPrimary && hasSecondary;
              if (isSingleUnit) {
                const leftValue = convertToDecimal(String(tail[1]));
                if (!Number.isNaN(leftValue)) {
                  const leftParsed = {
                    primary: hasPrimary ? { value: leftValue, unit: rightParsed.primary.unit } : { value: 0, unit: null },
                    secondary: hasSecondary ? { value: leftValue, unit: rightParsed.secondary.unit } : { value: 0, unit: null }
                  };
                  const val1 = converter(leftParsed);
                  const val2 = converter(rightParsed);
                  const formatted = formatter(val1, val2);
                  const token = addPlaceholder(
                    `${s.slice(tailStart, curr.end)} (${formatted})`
                  );
                  replacements.push({ start: tailStart, end: curr.end, token });
                }
              }
            }
          }
          return applyReplacements(s, replacements);
        }
        const lengthConverters = {
          feetInches: (parsed) => convertLengthToMeters(parsed.primary.value, parsed.secondary.value),
          miles: (parsed) => convertLengthToMeters(0, 0, parsed.primary.value),
          yards: (parsed) => convertLengthToMeters(0, 0, 0, parsed.primary.value)
        };
        const weightConverter = (parsed) => convertWeightToGrams(parsed.primary.value, parsed.secondary.value);
        const liquidConverters = {
          cups: (parsed) => parsed.primary.value * LIQUID_CUP_TO_L,
          gallons: (parsed) => parsed.primary.value * LIQUID_GALLON_TO_L,
          quarts: (parsed) => parsed.primary.value * LIQUID_QUART_TO_L,
          pints: (parsed) => parsed.primary.value * LIQUID_PINT_TO_L,
          floz: (parsed) => parsed.primary.value * LIQUID_FLOZ_TO_L,
          tbsp: (parsed) => parsed.primary.value * LIQUID_TBSP_TO_L,
          tsp: (parsed) => parsed.primary.value * LIQUID_TSP_TO_L
        };
        converted = mergeUnitRanges(converted, {
          unitSpec: UNITS.LENGTH.FEET_INCHES,
          converter: lengthConverters.feetInches,
          formatter: formatLengthRange
        });
        converted = mergeUnitRanges(converted, {
          unitSpec: UNITS.LENGTH.MILES,
          converter: lengthConverters.miles,
          formatter: formatLengthRange
        });
        converted = mergeUnitRanges(converted, {
          unitSpec: UNITS.LENGTH.YARDS,
          converter: lengthConverters.yards,
          formatter: formatLengthRange
        });
        converted = mergeUnitRanges(converted, {
          unitSpec: UNITS.WEIGHT,
          converter: weightConverter,
          formatter: formatWeightRange
        });
        converted = mergeUnitRanges(converted, {
          unitSpec: UNITS.LIQUID.CUPS,
          converter: liquidConverters.cups,
          formatter: formatLiquidRange
        });
        converted = mergeUnitRanges(converted, {
          unitSpec: UNITS.LIQUID.GALLONS,
          converter: liquidConverters.gallons,
          formatter: formatLiquidRange
        });
        converted = mergeUnitRanges(converted, {
          unitSpec: UNITS.LIQUID.QUARTS,
          converter: liquidConverters.quarts,
          formatter: formatLiquidRange
        });
        converted = mergeUnitRanges(converted, {
          unitSpec: UNITS.LIQUID.PINTS,
          converter: liquidConverters.pints,
          formatter: formatLiquidRange
        });
        converted = mergeUnitRanges(converted, {
          unitSpec: UNITS.LIQUID.FLOZ,
          converter: liquidConverters.floz,
          formatter: formatLiquidRange
        });
        converted = mergeUnitRanges(converted, {
          unitSpec: UNITS.LIQUID.TBSP,
          converter: liquidConverters.tbsp,
          formatter: formatLiquidRange
        });
        converted = mergeUnitRanges(converted, {
          unitSpec: UNITS.LIQUID.TSP,
          converter: liquidConverters.tsp,
          formatter: formatLiquidRange
        });
        const unitGroupRegexCache = /* @__PURE__ */ new WeakMap();
        const getUnitGroupRegex = (unitPatterns) => {
          let compiled = unitGroupRegexCache.get(unitPatterns);
          if (compiled) return compiled;
          const unitString = Object.values(unitPatterns).reduce((acc, pattern) => {
            if (typeof pattern === "string") {
              return acc ? `${acc}|${pattern}` : pattern;
            }
            const subPatterns = Object.values(pattern).map((p) => {
              if (typeof p === "string") return p;
              return Object.values(p).join("|");
            }).join("|");
            return acc ? `${acc}|${subPatterns}` : subPatterns;
          }, "");
          compiled = new RegExp(`(?<!\\w)(?:${unitString})(?!\\w)`, "iu");
          unitGroupRegexCache.set(unitPatterns, compiled);
          return compiled;
        };
        const containsUnits = (text2, unitPatterns) => {
          return getUnitGroupRegex(unitPatterns).test(text2);
        };
        const quoteLengthHint = new RegExp(
          String.raw`(?:\d|[${UNICODE_FRACTIONS}])\s*[${INCH_SYMBOLS}${FEET_SYMBOLS}]`,
          "i"
        ).test(converted) || converted.includes("''");
        const areaHint = new RegExp(
          String.raw`(?:sq\.?\s*ft|sq\.?\s*feet|sq\.?\s*foot|square\s+feet|square\s+foot|sqft|ft\s*(?:\^?2|²)|ft2|sq\.?\s*in|sq\.?\s*inch(?:es)?|square\s+inch(?:es)?|in\s*(?:\^?2|²)|in2|sq\.?\s*yd|sq\.?\s*yard(?:s)?|square\s+yard(?:s)?|yd\s*(?:\^?2|²)|yd2|sq\.?\s*mi|sq\.?\s*mile(?:s)?|square\s+mile(?:s)?|mi\s*(?:\^?2|²)|mi2|acre(?:s)?)`,
          "i"
        );
        if (areaHint.test(converted)) {
          converted = convertAreaText(converted);
        }
        if (quoteLengthHint || containsUnits(converted, UNITS.LENGTH)) {
          converted = convertLengthText(converted);
        }
        if (containsUnits(converted, UNITS.LIQUID)) {
          converted = convertLiquidText(converted);
        }
        if (containsUnits(converted, UNITS.WEIGHT)) {
          converted = convertWeightText(converted);
        }
        if (RE_TEMPERATURE_F_TEST.test(converted)) {
          const tempRangeRegex = new RegExp(
            String.raw`(\d+(?:\.\d+)?)\s*(?:-|–|—|to|through|thru)\s*(\d+(?:\.\d+)?)\s*(?:°\s*F|℉|F\b|deg\s*F|degree\s*F|degrees\s*F|degrees?\s*Fahrenheit|Fahrenheit)\b(?!\s*\()`,
            "gi"
          );
          converted = converted.replace(tempRangeRegex, (match, f1Str, f2Str) => {
            const f1 = parseFloat(f1Str);
            const f2 = parseFloat(f2Str);
            if (Number.isNaN(f1) || Number.isNaN(f2)) return match;
            const c1 = (f1 - 32) * 5 / 9;
            const c2 = (f2 - 32) * 5 / 9;
            const formatted = formatTemperatureRange(c1, c2);
            return addPlaceholder(`${match} (${formatted}\xB0C)`);
          });
          converted = convertTemperatureText(converted);
        }
        for (const { token, replacement } of placeholders) {
          converted = converted.replaceAll(token, replacement);
        }
        const hasTimeZone = RE_TIME_TEST.test(converted);
        if (hasTimeZone) {
          converted = convertTimeZoneText(converted);
        }
        return converted;
      }
      module.exports = { convertText, hasRelevantUnits };
    }
  });

  // src/exclusions/context.js
  var require_context = __commonJS({
    "src/exclusions/context.js"(exports, module) {
      var SKIP_TAGS = /* @__PURE__ */ new Set([
        "CODE",
        "SCRIPT",
        "STYLE",
        "PRE",
        "NOSCRIPT",
        "IFRAME",
        "OBJECT",
        "EMBED",
        "SVG",
        "MATH",
        "HEAD",
        "TITLE",
        "KBD",
        "SAMP",
        "VAR"
      ]);
      var CODE_CLASS_PATTERNS = [
        "hljs",
        "highlight",
        "prism",
        "prettyprint",
        "syntax",
        "blob-code",
        "s-code-block",
        "code-example",
        "md-code-block"
      ];
      var CODE_CLASS_PREFIXES = ["language-", "lang-", "cm-", "CodeMirror"];
      function hasCodeRelatedClass(classNames) {
        if (!classNames) return false;
        const iterable = typeof classNames === "string" ? classNames.split(/\s+/) : classNames;
        for (const cls of iterable) {
          if (!cls) continue;
          if (CODE_CLASS_PATTERNS.includes(cls)) {
            return true;
          }
          if (CODE_CLASS_PREFIXES.some((prefix) => cls.startsWith(prefix))) {
            return true;
          }
        }
        return false;
      }
      function isEditableContext(node) {
        let current = node;
        while (current) {
          if (current.tagName) {
            const tag = current.tagName.toUpperCase();
            if (tag === "INPUT" || tag === "TEXTAREA") {
              return true;
            }
          }
          if (current.getAttribute && current.getAttribute("contenteditable") && current.getAttribute("contenteditable").toLowerCase() === "true") {
            return true;
          }
          current = current.parentNode;
        }
        return false;
      }
      var TEXT_NODE_TYPE = typeof Node !== "undefined" ? Node.TEXT_NODE : 3;
      function isTextNode(node) {
        return node && node.nodeType === TEXT_NODE_TYPE;
      }
      function isInSkippableContainer(node) {
        let current = node && isTextNode(node) ? node.parentNode : node;
        while (current) {
          const tag = current.tagName ? current.tagName.toUpperCase() : null;
          if (tag && SKIP_TAGS.has(tag)) {
            return true;
          }
          if (hasCodeRelatedClass(current.classList || current.className)) {
            return true;
          }
          current = current.parentNode;
        }
        return false;
      }
      function isExcludedContext(node) {
        return isEditableContext(node) || isInSkippableContainer(node);
      }
      module.exports = {
        isEditableContext,
        isInSkippableContainer,
        hasCodeRelatedClass,
        isExcludedContext
      };
    }
  });

  // src/content.js
  var require_content = __commonJS({
    "src/content.js"(exports) {
      var { UNITS, UNIT_HINT_PATTERN } = require_units();
      var {
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
        TIME_ZONE_OFFSETS
      } = require_constants();
      var { convertToDecimal } = require_numbers();
      var {
        createRegexFromTemplate,
        RE_TIME_GLOBAL,
        RE_TIME_TEST,
        RE_TEMPERATURE_F,
        RE_TEMPERATURE_F_TEST
      } = require_regex();
      var {
        inferResolutionFromValue,
        mergeResolutionSteps,
        inferResolutionMetersFromNumber,
        resolutionStepOfValueString,
        inferResolutionMetersFromLengthMatch,
        inferResolutionFromParsedMeasurement,
        computeDecimalPlaces
      } = require_precision();
      var {
        getUnitRegexes,
        extractFirstValueToken,
        parseMeasurementMatch
      } = require_measurement();
      var {
        formatLengthMeasurement,
        formatWeightMeasurement,
        formatLiquidMeasurement,
        formatAreaMeasurement,
        formatTemperatureCelsius
      } = require_units2();
      var {
        formatLengthRange,
        formatWeightRange,
        formatLiquidRange,
        formatTemperatureRange
      } = require_ranges();
      var { convertLengthToMeters, convertLengthText } = require_length();
      var { convertWeightToGrams, convertWeightText } = require_weight();
      var { convertLiquidText } = require_liquid();
      var { convertAreaText } = require_area();
      var { convertTemperatureText } = require_temperature();
      var { convertTimeZone, convertTimeZoneText, TARGET_TIMEZONE, TARGET_TIMEZONE_OFFSET } = require_timezone();
      var { convertText, hasRelevantUnits } = require_converter();
      var exclusionContext = require_context();
      var { shouldExcludeMatch } = require_patterns();
      var URL_BLACKLIST = [
        /^https?:\/\/(?!mail\.)[^/]*\.google\./
        // e.g., www.google.com, docs.google.com, etc. (but not mail.google.com)
      ];
      function isBlacklistedUrl(url) {
        return URL_BLACKLIST.some((pattern) => pattern.test(url));
      }
      function getPluginName() {
        try {
          if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest) {
            const manifest = chrome.runtime.getManifest();
            if (manifest && manifest.name) return manifest.name;
          }
        } catch (_) {
        }
        return "Imperial to Metric";
      }
      function createInsertedSpan(text, doc) {
        const d = doc || (typeof document !== "undefined" ? document : null);
        const span = d ? d.createElement("span") : { style: {}, set textContent(t) {
        }, set title(t) {
        }, set className(c) {
        } };
        span.className = "mic-inserted";
        span.style.textDecorationLine = "underline";
        span.style.textDecorationStyle = "dotted";
        span.style.textDecorationColor = "currentColor";
        span.title = `Inserted by ${getPluginName()} extension`;
        span.textContent = text;
        return span;
      }
      function processElement(node) {
        if (exclusionContext.isExcludedContext(node)) {
          return;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          for (const childNode of node.childNodes) {
            processElement(childNode);
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          const originalText = node.textContent;
          let ns = node.nextSibling;
          while (ns && ns.nodeType === Node.TEXT_NODE && /^\s*$/.test(ns.textContent)) {
            ns = ns.nextSibling;
          }
          if (ns && ns.nodeType === Node.ELEMENT_NODE && ns.classList && ns.classList.contains("mic-inserted")) {
            return;
          }
          if (!hasRelevantUnits(originalText)) {
            return;
          }
          {
            const newText = convertText(originalText);
            if (originalText !== newText) {
              const doc = node && node.ownerDocument || (typeof document !== "undefined" ? document : null);
              const frag = doc ? doc.createDocumentFragment() : null;
              let i = 0;
              let j = 0;
              let buffer = "";
              const isWhitespace = (ch) => /\s/.test(ch || "");
              while (j < newText.length) {
                if (i < originalText.length && originalText[i] === newText[j]) {
                  buffer += newText[j];
                  i += 1;
                  j += 1;
                  continue;
                }
                if (newText[j] === "(" || isWhitespace(newText[j]) && newText[j + 1] === "(") {
                  if (buffer && frag && doc) {
                    frag.appendChild(doc.createTextNode(buffer));
                    buffer = "";
                  }
                  while (isWhitespace(newText[j]) && newText[j + 1] === "(") {
                    if (frag && doc) frag.appendChild(doc.createTextNode(newText[j]));
                    j += 1;
                  }
                  if (newText[j] !== "(") {
                    buffer += newText[j];
                    j += 1;
                    continue;
                  }
                  const closeIdx = newText.indexOf(")", j + 1);
                  if (closeIdx === -1) {
                    buffer += newText.slice(j);
                    break;
                  }
                  const insertedText = newText.slice(j, closeIdx + 1);
                  if (frag) {
                    frag.appendChild(createInsertedSpan(insertedText, doc));
                  }
                  j = closeIdx + 1;
                  continue;
                }
                buffer += newText[j];
                j += 1;
              }
              if (buffer && frag && doc) {
                frag.appendChild(doc.createTextNode(buffer));
              }
              if (frag) {
                node.replaceWith(frag);
              } else {
                node.textContent = newText;
              }
            }
          }
        }
      }
      function processNode(node) {
        processElement(node);
      }
      var performanceData = {
        lastRunTime: 0,
        totalConversions: 0,
        startTime: Date.now(),
        pageLoadTime: Date.now(),
        lastConversionTime: null
      };
      if (typeof window !== "undefined" && !isBlacklistedUrl(window.location.href)) {
        const startTime = performance.now();
        processNode(document.body);
        const endTime = performance.now();
        performanceData.lastRunTime = Math.round((endTime - startTime) * 100) / 100;
        performanceData.lastConversionTime = Date.now();
        const observer = new MutationObserver((mutations) => {
          const mutationStartTime = performance.now();
          let conversionsInMutation = 0;
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                processElement(node);
                conversionsInMutation++;
              } else if (node.nodeType === Node.TEXT_NODE) {
                processElement(node);
                conversionsInMutation++;
              }
            }
          }
          const mutationEndTime = performance.now();
          if (conversionsInMutation > 0) {
            performanceData.lastRunTime += Math.round((mutationEndTime - mutationStartTime) * 100) / 100;
            performanceData.totalConversions += conversionsInMutation;
            performanceData.lastConversionTime = Date.now();
          }
        });
        try {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        } catch (_) {
        }
      }
      if (typeof chrome !== "undefined" && chrome.runtime) {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
          if (request.action === "ping") {
            sendResponse({
              status: "active",
              performance: {
                lastRunTime: performanceData.lastRunTime,
                totalConversions: performanceData.totalConversions,
                uptime: Date.now() - performanceData.startTime,
                pageLoadTime: performanceData.pageLoadTime,
                lastConversionTime: performanceData.lastConversionTime,
                hasRunOnThisPage: performanceData.lastConversionTime !== null
              }
            });
          }
          return true;
        });
      }
      if (typeof exports !== "undefined") {
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
          isExcludedContext: exclusionContext.isExcludedContext
        });
      }
    }
  });
  require_content();
})();
