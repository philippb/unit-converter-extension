const { isExcludedContext } = require('./context.js');
const { shouldExcludeMatch } = require('./patterns.js');

module.exports = {
    isExcludedContext,
    shouldExcludeMatch,
};
