# CLAUDE.md - Unit Converter Extension

## Project Overview

This is a browser extension that automatically converts imperial/US customary units to metric units in real-time on web pages. The extension supports Chrome and Safari, converting measurements for length, weight, liquid volume, and time zones.

## Architecture

### Core Technology Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Build System**: npm scripts with native tools
- **Testing**: Jest with jsdom environment
- **Linting**: ESLint with Prettier formatting
- **Version Control**: Git with Husky pre-commit hooks

### Extension Structure

- **Manifest V3** Chrome extension
- **Content Script** (`src/content.js`) - Main conversion logic
- **Cross-platform** - Works on Chrome and Safari (via Xcode conversion)

## Key Files and Directories

### Source Code (`src/`)

- `content.js` - Main conversion engine (793 lines)
- `manifest.json` - Extension configuration
- `icons/` - Extension icons (16px, 32px, 48px, 128px)
- `safari/` - Safari-specific build artifacts (auto-generated)

### Configuration Files

- `package.json` - Dependencies and build scripts
- `.eslintrc.js` / `prettier.config.js` - Code quality tools
- `husky/` - Git hooks for code quality

### Testing (`test/`)

- `content.test.js` - Comprehensive test suite (1468 lines)
- Covers unit conversions, DOM manipulation, edge cases

## Core Functionality

### Conversion Types

1. **Length Conversions**

    - Feet, inches, miles → meters, centimeters, kilometers
    - Supports fractions (1/2, 3/4) and Unicode fractions (½, ¾, ⅓, etc.)
    - Mixed measurements (6 ft 2 in)

2. **Weight Conversions**

    - Pounds, ounces → grams, kilograms
    - Mixed weight measurements (5 lbs 8 oz)

3. **Liquid Volume Conversions**

    - Gallons, quarts, pints, cups, fluid ounces, tablespoons, teaspoons
    - Converts to liters and milliliters
    - Recipe measurement support

4. **Time Zone Conversions**
    - US time zones (EST, CST, MST, PST, EDT, CDT, MDT, PDT)
    - GMT/UTC with offset support
    - Converts all to PST target timezone

### Performance Optimizations

- **Pre-filtering**: Fast keyword detection to skip irrelevant text
- **DOM tree optimization**: Skips entire subtrees without relevant units
- **Regex compilation**: Efficient pattern matching for unit detection
- **Editable context detection**: Avoids converting text in forms/inputs

## Development Commands

### Essential Scripts

```bash
# Run tests
npm test                    # Full test suite
npm run test:watch         # Watch mode for development
npm run test:coverage      # Generate coverage report

# Code quality
npm run lint               # Check code style
npm run lint:fix          # Auto-fix linting issues
npm run format            # Format code with Prettier

# Building
npm run build             # Build both Chrome and Safari versions
npm run build:chrome      # Chrome extension zip
npm run build:safari      # Safari extension via Xcode
```

### Development Workflow

1. Make changes to `src/content.js`
2. Run `npm run test:watch` to see test results
3. Use `npm run lint:fix` to maintain code quality
4. Test manually by loading unpacked extension in Chrome

## Browser Extension Details

### Chrome Extension

- **Manifest Version**: 3
- **Permissions**: `<all_urls>` host permissions
- **Content Script**: Runs on all websites
- **Icons**: Multiple sizes for different contexts

### Safari Extension

- **Platform**: macOS 10.14.6+ with Safari 14+
- **Build Process**: Uses `xcrun safari-web-extension-converter`
- **Development**: Requires Xcode for testing
- **Distribution**: Via Mac App Store or Developer ID

## Testing Strategy

### Test Coverage

- **Unit tests**: Core conversion functions
- **Integration tests**: DOM manipulation and MutationObserver
- **Edge cases**: Zero values, fractions, mixed units
- **Performance tests**: Pre-filtering optimization
- **Cross-browser compatibility**: Form field handling

### Test Environment

- **Framework**: Jest with jsdom
- **DOM simulation**: Full browser environment simulation
- **Coverage**: Focused on `src/content.js` main logic

## Code Quality Standards

### ESLint Configuration

- Prettier integration for consistent formatting
- Jest plugin for test-specific rules
- ES6+ syntax support

### Git Workflow

- **Pre-commit hooks**: Automatic linting and formatting
- **Lint-staged**: Only process changed files
- **Branch**: Currently on `cursor-timezone` branch

## Performance Considerations

### Optimization Strategies

1. **Fast pre-filtering** using simple string matching
2. **Lazy regex compilation** only when needed
3. **DOM tree pruning** to skip irrelevant subtrees
4. **MutationObserver efficiency** for dynamic content

### Memory Management

- No memory leaks in long-running content scripts
- Efficient regex pattern reuse
- Minimal DOM manipulation impact

## Deployment Information

### Chrome Web Store

- Package via `npm run build:chrome`
- Creates `dist/extension.zip`
- Ready for Chrome Web Store upload

### Safari App Store

- Build via `npm run build:safari`
- Generates Xcode project
- Requires Apple Developer account for distribution

## Claude Code Integration Notes

### Code Modification Guidelines

- **Primary file**: `src/content.js` contains all conversion logic
- **Test updates**: Modify `test/content.test.js` for new functionality
- **Build verification**: Always run tests before committing

### Common Development Tasks

1. **Adding new unit types**: Extend `UNITS` object and add conversion functions
2. **Performance improvements**: Focus on `hasRelevantUnits()` pre-filtering
3. **Bug fixes**: Check both conversion logic and DOM handling
4. **Feature additions**: Update both implementation and comprehensive tests

### Debugging Information

- Use `npm run test:watch` for rapid feedback
- Extension console available in Chrome DevTools
- Safari Web Inspector for Safari extension debugging

## Security Considerations

- **No network requests**: All conversions happen locally
- **Content script only**: No background script or storage permissions
- **Input sanitization**: Proper handling of malicious web content
- **No eval() usage**: Safe regex and mathematical operations only

This is a well-structured, production-ready browser extension with comprehensive testing and cross-platform support.
