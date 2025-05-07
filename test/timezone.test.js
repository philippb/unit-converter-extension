describe('Timezone Conversion Tests', () => {
    const { parseTimezoneOffset, convertTimeToPST, convertTimezoneText, processNode } = require('../src/content.js');
    
    beforeEach(() => {
        document.body.innerHTML = '';
    });
    
    describe('Timezone Parsing', () => {
        test('parses timezone abbreviations correctly', () => {
            expect(parseTimezoneOffset('EST')).toBe(-5);
            expect(parseTimezoneOffset('CST')).toBe(-6);
            expect(parseTimezoneOffset('MST')).toBe(-7);
            expect(parseTimezoneOffset('PST')).toBe(-8);
            expect(parseTimezoneOffset('EDT')).toBe(-4);
            expect(parseTimezoneOffset('CDT')).toBe(-5);
            expect(parseTimezoneOffset('MDT')).toBe(-6);
            expect(parseTimezoneOffset('PDT')).toBe(-7);
        });
        
        test('parses GMT/UTC offset references', () => {
            expect(parseTimezoneOffset('GMT+5')).toBe(5);
            expect(parseTimezoneOffset('GMT-3')).toBe(-3);
            expect(parseTimezoneOffset('UTC+1')).toBe(1);
            expect(parseTimezoneOffset('UTC-7')).toBe(-7);
        });
    });
    
    describe('Time Conversion', () => {
        test('converts 12-hour format times correctly', () => {
            expect(convertTimeToPST(12, 0, 'pm', 'EST')).toBe('9 am PST');
            expect(convertTimeToPST(1, 30, 'pm', 'EST')).toBe('10:30 am PST');
            expect(convertTimeToPST(9, 0, 'am', 'EST')).toBe('6 am PST');
            expect(convertTimeToPST(11, 45, 'pm', 'EST')).toBe('8:45 pm PST');
            
            expect(convertTimeToPST(12, 0, 'pm', 'GMT+5')).toBe('11 pm PST'); // Previous day
            expect(convertTimeToPST(8, 0, 'am', 'GMT+5')).toBe('7 pm PST'); // Previous day
        });
        
        test('converts 24-hour format times correctly', () => {
            expect(convertTimeToPST(12, 0, null, 'EST')).toBe('9 am PST');
            expect(convertTimeToPST(13, 30, null, 'EST')).toBe('10:30 am PST');
            expect(convertTimeToPST(9, 0, null, 'EST')).toBe('6 am PST');
            expect(convertTimeToPST(23, 45, null, 'EST')).toBe('8:45 pm PST');
            
            expect(convertTimeToPST(12, 0, null, 'GMT+5')).toBe('11 pm PST');
            expect(convertTimeToPST(8, 0, null, 'GMT+5')).toBe('7 pm PST');
        });
    });
    
    describe('Text Conversion', () => {
        test('convertTimezoneText handles various time formats with timezones', () => {
            const testCases = [
                {
                    input: "Let's meet at 12 pm EST",
                    expected: "Let's meet at 12 pm EST (9 am PST)"
                },
                {
                    input: "The meeting starts at 9:30 am CST",
                    expected: "The meeting starts at 9:30 am CST (7:30 am PST)"
                },
                {
                    input: "Conference call at 3 pm GMT+5",
                    expected: "Conference call at 3 pm GMT+5 (2 am PST)"
                },
                {
                    input: "Webinar begins at 14:00 EST",
                    expected: "Webinar begins at 14:00 EST (11 am PST)"
                },
                {
                    input: "Call scheduled for 23:30 UTC-4",
                    expected: "Call scheduled for 23:30 UTC-4 (7:30 pm PST)"
                }
            ];
            
            testCases.forEach(({input, expected}) => {
                expect(convertTimezoneText(input)).toBe(expected);
            });
        });
        
        test('processes timezone conversions in document nodes', () => {
            const testCases = [
                {
                    input: "Let's meet at 12 pm EST",
                    expected: "Let's meet at 12 pm EST (9 am PST)"
                },
                {
                    input: "The meeting starts at 9:30 am CST",
                    expected: "The meeting starts at 9:30 am CST (7:30 am PST)"
                }
            ];
            
            testCases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
        
        test('handles multiple time zones in complex text', () => {
            const cases = [
                {
                    input: 'First call at 10 am EST, second at 2 pm CST',
                    expected: 'First call at 10 am EST (7 am PST), second at 2 pm CST (12 pm PST)'
                },
                {
                    input: 'Meeting schedule: 9:00 EST, 14:30 GMT+5',
                    expected: 'Meeting schedule: 9:00 EST (6 am PST), 14:30 GMT+5 (1:30 am PST)'
                }
            ];
            
            cases.forEach(({ input, expected }) => {
                document.body.textContent = input;
                processNode(document.body);
                expect(document.body.textContent).toBe(expected);
            });
        });
        
        test('does not convert text already containing conversions', () => {
            const input = "Let's meet at 12 pm EST (9 am PST)";
            document.body.textContent = input;
            processNode(document.body);
            expect(document.body.textContent).toBe(input);
        });
    });
});
