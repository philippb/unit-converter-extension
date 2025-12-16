const { processNode } = require('../../src/content.js');

describe('Issue #17: Only convert free standing numbers', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('should not convert port numbers like localhost:3000', () => {
        // Test the exact example from the issue
        document.body.textContent = 'Use localhost:3000 in development';
        processNode(document.body);
        expect(document.body.textContent).toBe('Use localhost:3000 in development');
    });

    test('should not convert port numbers in various URL formats', () => {
        const testCases = [
            {
                input: 'Visit http://localhost:3000 in your browser',
                expected: 'Visit http://localhost:3000 in your browser',
            },
            {
                input: 'The server runs on localhost:8080 in production',
                expected: 'The server runs on localhost:8080 in production',
            },
            {
                input: 'Connect to 127.0.0.1:5000 in terminal',
                expected: 'Connect to 127.0.0.1:5000 in terminal',
            },
            {
                input: 'Access the API at api.example.com:4000 in the app',
                expected: 'Access the API at api.example.com:4000 in the app',
            },
        ];

        testCases.forEach(({ input, expected }) => {
            document.body.textContent = input;
            processNode(document.body);
            expect(document.body.textContent).toBe(expected);
        });
    });

    test('should still convert valid inch measurements with "in"', () => {
        // Make sure we didn't break normal conversion
        const testCases = [
            {
                input: 'The table is 5 in wide',
                expected: 'The table is 5 in (12.7 cm) wide',
            },
            {
                input: 'A board 12 inches long',
                expected: 'A board 12 inches (30.48 cm) long',
            },
            {
                input: 'Height of 6 ft 2 in',
                expected: 'Height of 6 ft 2 in (1.88 m)',
            },
        ];

        testCases.forEach(({ input, expected }) => {
            document.body.textContent = input;
            processNode(document.body);
            expect(document.body.textContent).toBe(expected);
        });
    });

    test('should not convert numbers in port-like contexts without localhost', () => {
        // Additional edge cases
        const testCases = [
            {
                input: 'server:3000 in development',
                expected: 'server:3000 in development',
            },
            {
                input: 'Port :8080 in use',
                expected: 'Port :8080 in use',
            },
        ];

        testCases.forEach(({ input, expected }) => {
            document.body.textContent = input;
            processNode(document.body);
            expect(document.body.textContent).toBe(expected);
        });
    });
});
