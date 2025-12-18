const INSERT_START = '\uE000';
const INSERT_END = '\uE001';

function buildInsertedParenthetical(text, options = {}) {
    const content = String(text);
    if (options.insertMarkers) {
        return `(${INSERT_START}${content}${INSERT_END})`;
    }
    return `(${content})`;
}

function stripInsertMarkers(text) {
    if (!text || typeof text !== 'string') return text;
    return text.split(INSERT_START).join('').split(INSERT_END).join('');
}

module.exports = {
    INSERT_START,
    INSERT_END,
    buildInsertedParenthetical,
    stripInsertMarkers,
};
