function formatNumberWithGrouping(num, decimals) {
    const fixed = num.toFixed(Math.max(decimals, 0));
    const trimmed = decimals > 0 ? fixed.replace(/\.?0+$/, '') : fixed;
    const [intPart, frac] = trimmed.split('.');
    const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return frac ? `${intWithCommas}.${frac}` : intWithCommas;
}

module.exports = {
    formatNumberWithGrouping,
};
