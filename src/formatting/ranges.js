function formatNum(n) {
    const s = n.toFixed(2).replace(/\.?0+$/, '');
    const [intPart, frac] = s.split('.');
    const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return frac ? `${intWithCommas}.${frac}` : intWithCommas;
}

function formatLengthRange(m1, m2) {
    const a = Math.min(m1, m2);
    const b = Math.max(m1, m2);
    if (b >= 1000) return `${formatNum(a / 1000)}–${formatNum(b / 1000)} km`;
    if (b >= 1) return `${formatNum(a)}–${formatNum(b)} m`;
    if (b >= 0.01) return `${formatNum(a * 100)}–${formatNum(b * 100)} cm`;
    return `${formatNum(a * 1000)}–${formatNum(b * 1000)} mm`;
}

function formatWeightRange(g1, g2) {
    const a = Math.min(g1, g2);
    const b = Math.max(g1, g2);
    if (a >= 1000 && b >= 1000) return `${formatNum(a / 1000)}–${formatNum(b / 1000)} kg`;
    return `${formatNum(a)}–${formatNum(b)} g`;
}

function formatLiquidRange(l1, l2) {
    const a = Math.min(l1, l2);
    const b = Math.max(l1, l2);
    if (b >= 1) return `${formatNum(a)}–${formatNum(b)} L`;
    return `${formatNum(a * 1000)}–${formatNum(b * 1000)} ml`;
}

function formatTemperatureRange(c1, c2) {
    const a = Math.min(c1, c2);
    const b = Math.max(c1, c2);
    return `${Math.round(a)}–${Math.round(b)}`;
}

module.exports = {
    formatLengthRange,
    formatWeightRange,
    formatLiquidRange,
    formatTemperatureRange,
};
