# Metric<>Imperial Chrome Extension

A Chrome extension that automatically converts imperial measurements to metric units in web pages.

## Development Setup

1. Install dependencies:
```bash
npm install
```
2. Run tests:

```bash
npm test
```

3. Development with watch mode:
```bash
npm run test:watch
```

4. Lint and format code:
```bash
npm run lint
npm run format
```

5. Build extension:
```bash
npm run build
```

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension directory

## Features

- Converts imperial measurements to metric in real-time
- Supports inches (including fractions) and feet
- Works with dynamic content
- No network permissions required - all conversions happen locally

## Testing

The project uses Jest for testing. Run tests with:
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report