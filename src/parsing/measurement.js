const { UNICODE_FRACTIONS } = require('../utils/constants.js');
const { convertToDecimal } = require('./numbers.js');

const unitRegexCache = new WeakMap();

function getUnitRegexes(units) {
    let pair = unitRegexCache.get(units);
    if (!pair) {
        const primary = new RegExp(`^(${units.PRIMARY})$`, 'i');
        const secondary = new RegExp(`^(${units.SECONDARY})$`, 'i');
        pair = { primary, secondary };
        unitRegexCache.set(units, pair);
    }
    return pair;
}

function extractFirstValueToken(s) {
    const unicode = UNICODE_FRACTIONS;
    const re = new RegExp(
        String.raw`(?:(?:\d{1,3}(?:,\d{3})+|\d+)\.\d+|(?:\d{1,3}(?:,\d{3})+|\d)\s*[${unicode}]|[${unicode}]|(?:\d{1,3}(?:,\d{3})+|\d)\s*\d+\/\d+|\d+\/\d+|(?:\d{1,3}(?:,\d{3})+|\d+))`,
        'u'
    );
    const m = String(s).match(re);
    return m ? m[0] : '';
}

function parseMeasurementMatch(match, units) {
    const unitPattern = new RegExp(`(${units.PRIMARY}|${units.SECONDARY})`, 'i');
    const parts = match
        .trim()
        .split(unitPattern)
        .map((p) => p.trim())
        .filter(Boolean);

    let primaryValue = 0,
        secondaryValue = 0;
    let primaryUnit = null,
        secondaryUnit = null;
    let primaryRaw = null,
        secondaryRaw = null;

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
        secondary: { value: secondaryValue, unit: secondaryUnit, raw: secondaryRaw },
    };
}

module.exports = {
    getUnitRegexes,
    extractFirstValueToken,
    parseMeasurementMatch,
};
