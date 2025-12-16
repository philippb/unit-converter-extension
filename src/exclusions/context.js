const SKIP_TAGS = new Set([
    'CODE',
    'SCRIPT',
    'STYLE',
    'PRE',
    'NOSCRIPT',
    'IFRAME',
    'OBJECT',
    'EMBED',
    'SVG',
    'MATH',
    'HEAD',
    'TITLE',
    'KBD',
    'SAMP',
    'VAR',
]);

const CODE_CLASS_PATTERNS = [
    'hljs',
    'highlight',
    'prism',
    'prettyprint',
    'syntax',
    'blob-code',
    's-code-block',
    'code-example',
    'md-code-block',
];
const CODE_CLASS_PREFIXES = ['language-', 'lang-', 'cm-', 'CodeMirror'];

function hasCodeRelatedClass(classNames) {
    if (!classNames) return false;
    const iterable = typeof classNames === 'string' ? classNames.split(/\s+/) : classNames;
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
            if (tag === 'INPUT' || tag === 'TEXTAREA') {
                return true;
            }
        }
        if (
            current.getAttribute &&
            current.getAttribute('contenteditable') &&
            current.getAttribute('contenteditable').toLowerCase() === 'true'
        ) {
            return true;
        }
        current = current.parentNode;
    }
    return false;
}

const TEXT_NODE_TYPE = typeof Node !== 'undefined' ? Node.TEXT_NODE : 3;

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
    isExcludedContext,
};
