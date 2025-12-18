const {
    LENGTH_INCH_TO_METERS,
    LENGTH_FOOT_TO_METERS,
    LENGTH_YARD_TO_METERS,
    LENGTH_MILE_TO_METERS,
    UNICODE_FRACTIONS_DENOM,
} = require('../utils/constants.js');
const { getUnitRegexes } = require('../parsing/measurement.js');

function inferResolutionFromValue(raw, unitScale) {
    if (!raw || !(unitScale > 0)) return undefined;
    const step = resolutionStepOfValueString(String(raw));
    if (!(step > 0)) return undefined;
    return step * unitScale;
}

function mergeResolutionSteps(steps) {
    let best;
    for (const step of steps) {
        if (!(step > 0)) continue;
        best = best === undefined ? step : Math.min(best, step);
    }
    return best;
}

function inferResolutionMetersFromNumber(raw, unit) {
    if (!unit) return undefined;
    const scaleMap = {
        in: LENGTH_INCH_TO_METERS,
        ft: LENGTH_FOOT_TO_METERS,
        mi: LENGTH_MILE_TO_METERS,
        yd: LENGTH_YARD_TO_METERS,
    };
    const unitScale = scaleMap[unit];
    if (!unitScale) return undefined;
    return inferResolutionFromValue(raw, unitScale);
}

function resolutionStepOfValueString(s) {
    if (!s) return undefined;
    const str = String(s).trim();
    const slashMatch = str.match(/(\d+)\s*\/\s*(\d+)/);
    let denom = slashMatch ? parseInt(slashMatch[2], 10) : undefined;
    let unicodeDenom;
    for (const ch of str) {
        if (UNICODE_FRACTIONS_DENOM[ch]) {
            unicodeDenom = unicodeDenom
                ? Math.max(unicodeDenom, UNICODE_FRACTIONS_DENOM[ch])
                : UNICODE_FRACTIONS_DENOM[ch];
        }
    }
    if (unicodeDenom) {
        denom = denom ? Math.max(denom, unicodeDenom) : unicodeDenom;
    }
    if (denom && denom > 0) {
        return 1 / denom;
    }
    const dot = str.indexOf('.');
    if (dot >= 0) {
        const dec = str.slice(dot + 1).replace(/\D/g, '');
        if (dec.length > 0) return Math.pow(10, -dec.length);
    }
    return 1;
}

function inferResolutionMetersFromLengthMatch(match, units) {
    try {
        const unitPattern = new RegExp(`(${units.PRIMARY}|${units.SECONDARY})`, 'i');
        const parts = match
            .trim()
            .split(unitPattern)
            .map((p) => p.trim())
            .filter(Boolean);
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
        return undefined;
    }
}

function inferResolutionFromParsedMeasurement(parsed, scales = {}) {
    if (!parsed || typeof parsed !== 'object') return undefined;
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
    allowResolution = true,
}) {
    let effectiveMin = Math.max(0, minDecimals);
    let effectiveMax = Math.max(effectiveMin, maxDecimals);

    if (Array.isArray(magnitudeCaps) && magnitudeCaps.length > 0) {
        for (const { threshold, decimals } of magnitudeCaps) {
            if (Math.abs(valueInUnit) >= threshold) {
                effectiveMax = Math.min(effectiveMax, decimals);
                break;
            }
        }
        if (effectiveMax < effectiveMin) {
            effectiveMin = effectiveMax;
        }
    }

    let decimals = allowResolution === false ? effectiveMax : effectiveMin;
    if (allowResolution && typeof resolutionBase === 'number' && resolutionBase > 0) {
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
    computeDecimalPlaces,
};
