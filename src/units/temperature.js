const { RE_TEMPERATURE_F } = require('../parsing/regex.js');
const { inferResolutionFromValue } = require('../utils/precision.js');
const { formatTemperatureCelsius } = require('../formatting/units.js');

function convertTemperatureText(text) {
    return text.replace(RE_TEMPERATURE_F, (match, fStr) => {
        const f = parseFloat(fStr);
        if (Number.isNaN(f)) return match;
        const c = ((f - 32) * 5) / 9;
        const resolutionCelsius = inferResolutionFromValue(fStr, 5 / 9);
        return `${match} (${formatTemperatureCelsius(c, { resolutionCelsius })}°C)`;
    });
}

module.exports = {
    convertTemperatureText,
};
