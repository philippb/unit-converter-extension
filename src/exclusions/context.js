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

const CODE_CLASS_PATTERNS = new Set([
    'hljs',
    'highlight',
    'prism',
    'prettyprint',
    'syntax',
    'blob-code',
    's-code-block',
    'code-example',
    'md-code-block',
]);
const CODE_CLASS_PREFIXES = ['language-', 'lang-', 'cm-', 'CodeMirror'];

function hasCodeRelatedClass(classNames) {
    if (!classNames) return false;
    const iterable = typeof classNames === 'string' ? classNames.split(/\s+/) : classNames;
    for (const cls of iterable) {
        if (!cls) continue;
        if (CODE_CLASS_PATTERNS.has(cls)) {
            return true;
        }
        for (const prefix of CODE_CLASS_PREFIXES) {
            if (cls.startsWith(prefix)) return true;
        }
    }
    return false;
}

function isContentEditableElement(node) {
    if (!node) return false;
    if (node.isContentEditable) return true;
    if (!node.getAttribute) return false;
    if (node.hasAttribute && !node.hasAttribute('contenteditable')) return false;
    const attr = node.getAttribute('contenteditable');
    if (!attr && attr !== '') return false;
    const normalized = String(attr).trim().toLowerCase();
    return normalized === '' || normalized === 'true';
}

function isEditableContext(node) {
    let current = node;
    while (current) {
        if (current.tagName === 'INPUT' || current.tagName === 'TEXTAREA') return true;
        if (isContentEditableElement(current)) {
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
        if (current.tagName && SKIP_TAGS.has(current.tagName)) {
            return true;
        }
        if (hasCodeRelatedClass(current.classList || current.className)) {
            return true;
        }
        current = current.parentNode;
    }
    return false;
}

function isExcludedElement(node) {
    if (!node || !node.tagName) return false;
    if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') return true;
    if (isContentEditableElement(node)) return true;
    if (SKIP_TAGS.has(node.tagName)) return true;
    return hasCodeRelatedClass(node.classList || node.className);
}

function isExcludedContext(node) {
    let current = node && isTextNode(node) ? node.parentNode : node;
    while (current) {
        if (isExcludedElement(current)) return true;
        current = current.parentNode;
    }
    return false;
}

module.exports = {
    isEditableContext,
    isInSkippableContainer,
    hasCodeRelatedClass,
    isExcludedElement,
    isExcludedContext,
};
