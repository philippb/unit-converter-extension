// Popup functionality for Imperial to Metric extension
document.addEventListener('DOMContentLoaded', function () {
    // Initialize popup
    initializePopup();

    // Check if extension is working on current tab
    checkExtensionStatus();
});

function initializePopup() {
    // Add click handlers for interactive elements
    addClickHandlers();

    // Add keyboard navigation
    addKeyboardNavigation();

    // Animate elements on load
    animateOnLoad();
}

function checkExtensionStatus() {
    // Query the active tab to check if content script is running
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length === 0) return;

        const currentTab = tabs[0];
        const statusElement = document.querySelector('.status');
        const statusText = document.querySelector('.status-text');
        const statusIndicator = document.querySelector('.status-indicator');

        // Check if URL is supported (not chrome:// or other restricted URLs)
        if (isRestrictedUrl(currentTab.url)) {
            updateStatus(
                statusElement,
                statusText,
                statusIndicator,
                false,
                'Extension cannot run on this page'
            );
        } else {
            // Try to communicate with content script
            chrome.tabs.sendMessage(currentTab.id, { action: 'ping' }, function (response) {
                const isActive =
                    !chrome.runtime.lastError && response && response.status === 'active';
                updateStatus(
                    statusElement,
                    statusText,
                    statusIndicator,
                    isActive,
                    isActive
                        ? 'Extension is active on this page'
                        : 'Extension not running on this page'
                );
                
                // Update performance info if available
                if (isActive && response.performance) {
                    updatePerformanceInfo(response.performance);
                }
            });
        }
    });
}

function isRestrictedUrl(url) {
    if (!url) return true;
    
    const restrictedProtocols = ['chrome:', 'chrome-extension:', 'moz-extension:', 'edge:'];
    const restrictedDomains = ['chrome.google.com'];

    return (
        restrictedProtocols.some((protocol) => url.startsWith(protocol)) ||
        restrictedDomains.some((domain) => url.includes(domain))
    );
}

function updateStatus(statusElement, statusText, statusIndicator, isActive, message) {
    statusText.textContent = message;

    if (isActive) {
        statusIndicator.className = 'status-indicator active';
        statusElement.style.background = '#f0f9ff';
        statusElement.style.borderColor = '#bae6fd';
        statusText.style.color = '#0369a1';
    } else {
        statusIndicator.className = 'status-indicator inactive';
        statusElement.style.background = '#fef2f2';
        statusElement.style.borderColor = '#fecaca';
        statusText.style.color = '#dc2626';
    }
}

function updatePerformanceInfo(performance) {
    const footerText = document.querySelector('.footer-text');
    if (footerText && performance.lastRunTime !== undefined) {
        const runtimeText = performance.lastRunTime < 1 
            ? `${Math.round(performance.lastRunTime * 1000)}μs`
            : `${Math.round(performance.lastRunTime)}ms`;
        footerText.textContent = `v1.2 • Auto-converts imperial units • Runtime: ${runtimeText}`;
    }
}

function addClickHandlers() {
    // Add click handler for conversion examples to show they're interactive
    const examples = document.querySelectorAll('.example');
    examples.forEach((example) => {
        example.addEventListener('click', function () {
            // Add a subtle animation to show interaction
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });

    // Add click handler for feature items
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item) => {
        item.addEventListener('click', function () {
            const icon = this.querySelector('.feature-icon');
            icon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 200);
        });
    });
}

function addKeyboardNavigation() {
    // Allow keyboard navigation through examples and features
    const interactiveElements = document.querySelectorAll('.example, .feature-item');

    interactiveElements.forEach((element) => {
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');

        element.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

function animateOnLoad() {
    // Stagger animation of conversion categories
    const categories = document.querySelectorAll('.conversion-category');
    categories.forEach((category, index) => {
        category.style.opacity = '0';
        category.style.transform = 'translateY(10px)';

        setTimeout(() => {
            category.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            category.style.opacity = '1';
            category.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Animate feature items
    const features = document.querySelectorAll('.feature-item');
    features.forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateX(-10px)';

        setTimeout(
            () => {
                feature.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(0)';
            },
            400 + index * 50
        );
    });
}

// Add CSS for inactive status indicator
const style = document.createElement('style');
style.textContent = `
    .status-indicator.inactive {
        background: #ef4444 !important;
        box-shadow: 0 0 0 2px #fee2e2 !important;
        animation: none !important;
    }
    
    .example {
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .feature-item {
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .example:focus,
    .feature-item:focus {
        outline: 2px solid #667eea;
        outline-offset: 2px;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);
