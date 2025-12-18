const { RE_TEMPERATURE_F } = require('../parsing/regex.js');
const { inferResolutionFromValue } = require('../utils/precision.js');
const { formatTemperatureCelsius } = require('../formatting/units.js');
const { buildInsertedParenthetical } = require('../utils/insertMarkers.js');

function convertTemperatureText(text, options = {}) {
    return text.replace(RE_TEMPERATURE_F, (match, fStr) => {
        const f = parseFloat(fStr);
        if (Number.isNaN(f)) return match;
        const c = ((f - 32) * 5) / 9;
        const resolutionCelsius = inferResolutionFromValue(fStr, 5 / 9);
        const formatted = `${formatTemperatureCelsius(c, { resolutionCelsius })}°C`;
        return `${match} ${buildInsertedParenthetical(formatted, options)}`;
    });
}

module.exports = {
    convertTemperatureText,
};
