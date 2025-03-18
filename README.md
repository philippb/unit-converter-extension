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

## Safari Extension Setup (Developer Mode)

This extension can also be installed on Safari for macOS using Apple's developer tools. Follow these steps to install and test the extension in Safari developer mode:

### Prerequisites

- macOS 10.14.6 (Mojave) or later
- Safari 14 or later
- Xcode 12 or later (available on the Mac App Store)
- Apple Developer account (free account is sufficient for development)

### Building the Safari Extension

1. Run the build command to generate both Chrome and Safari extensions:

    ```
    npm run build
    ```

2. This will create a Safari extension project in the `dist/safari` directory.

### Running the Extension in Developer Mode

1. Open the Xcode project that was generated:

    ```
    open dist/safari/Metric\ Imperial\ Converter/Metric\ Imperial\ Converter.xcodeproj
    ```

2. In Xcode, select your Mac as the target device from the dropdown next to the Run button.

3. Click the Run button (▶️) to build and run the app.

4. A new app named "Metric Imperial Converter" will be installed and launched on your Mac.

5. The app itself is just a container and may show minimal UI. This is normal.

### Enabling the Extension in Safari

1. Open Safari.

2. Go to Safari > Settings... > Extensions.

3. You should see "Metric Imperial Converter" in the list of extensions.

4. Check the checkbox next to it to enable the extension.

5. You may need to grant permissions for the extension to access websites.

### Troubleshooting

- If the extension doesn't appear in Safari:

    - Make sure the app is running
    - Restart Safari
    - Check Console.app for any error messages

- If you make changes to the extension code:

    - Stop the app in Xcode
    - Run `npm run build:safari` again
    - Run the app in Xcode again
    - The changes should be reflected in Safari

- If Safari shows "Extension Manifest Not Found" error:
    - Make sure your `manifest.json` is valid
    - Try rebuilding the extension with `npm run build:safari`

### Debugging the Extension

1. In Safari, enable the Develop menu by going to Safari > Settings... > Advanced and checking "Show Develop menu in menu bar".

2. With the extension enabled and the website loaded, go to Develop > Web Extension Background Pages > Metric Imperial Converter.

3. This will open the Web Inspector for your extension, allowing you to view console logs and debug your extension.

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
