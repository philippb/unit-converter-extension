const { convertText } = require('../src/content.js');

describe('Range Conversion - Comprehensive Support', () => {
    describe('Length Ranges', () => {
        describe('Miles', () => {
            test('0.1-10 miles (issue #18)', () => {
                const input = '0.1-10 miles';
                const expected = '0.1-10 miles (0.16–16.09 km)';
                expect(convertText(input)).toBe(expected);
            });

            test('5-10 miles (hyphen)', () => {
                const input = 'Distance: 5-10 miles';
                const expected = 'Distance: 5-10 miles (8.05–16.09 km)';
                expect(convertText(input)).toBe(expected);
            });

            test('1 to 3 miles (word separator)', () => {
                const input = 'Range: 1 to 3 miles';
                const expected = 'Range: 1 to 3 miles (1.61–4.83 km)';
                expect(convertText(input)).toBe(expected);
            });

            test('2 mi – 5 mi (repeated unit)', () => {
                const input = 'Between 2 mi – 5 mi';
                const expected = 'Between 2 mi – 5 mi (3.22–8.05 km)';
                expect(convertText(input)).toBe(expected);
            });
        });

        describe('Yards', () => {
            test('10-20 yards (hyphen)', () => {
                const input = 'Throw distance: 10-20 yards';
                const expected = 'Throw distance: 10-20 yards (9.14–18.29 m)';
                expect(convertText(input)).toBe(expected);
            });

            test('5 to 15 yards', () => {
                const input = 'Distance: 5 to 15 yards';
                const expected = 'Distance: 5 to 15 yards (4.57–13.72 m)';
                expect(convertText(input)).toBe(expected);
            });

            test('100-200 yd (repeated unit)', () => {
                const input = '100 yd – 200 yd from target';
                const expected = '100 yd – 200 yd (91.44–182.88 m) from target';
                expect(convertText(input)).toBe(expected);
            });
        });

        describe('Feet', () => {
            test('5-8 feet (hyphen)', () => {
                const input = 'Height: 5-8 feet';
                const expected = 'Height: 5-8 feet (1.52–2.44 m)';
                expect(convertText(input)).toBe(expected);
            });

            test('10 to 20 ft', () => {
                const input = 'Length: 10 to 20 ft';
                const expected = 'Length: 10 to 20 ft (3.05–6.1 m)';
                expect(convertText(input)).toBe(expected);
            });

            test('Composite: 5 ft 6 in–6 ft 2 in', () => {
                const input = 'Height range 5 ft 6 in–6 ft 2 in';
                const expected = 'Height range 5 ft 6 in–6 ft 2 in (1.68–1.88 m)';
                expect(convertText(input)).toBe(expected);
            });
        });

        describe('Inches', () => {
            test('5–8 inches (en dash)', () => {
                const input = 'The board is 5–8 inches long';
                const expected = 'The board is 5–8 inches (12.7–20.32 cm) long';
                expect(convertText(input)).toBe(expected);
            });

            test('5-8 inches (hyphen)', () => {
                const input = 'Allow 5-8 inches of clearance';
                const expected = 'Allow 5-8 inches (12.7–20.32 cm) of clearance';
                expect(convertText(input)).toBe(expected);
            });

            test('5 in – 8 in (repeated unit)', () => {
                const input = 'Cut to 5 in – 8 in';
                const expected = 'Cut to 5 in – 8 in (12.7–20.32 cm)';
                expect(convertText(input)).toBe(expected);
            });

            test('1/2 to 3/4 inch (fractions)', () => {
                const input = 'Thickness: 1/2 to 3/4 inch';
                const expected = 'Thickness: 1/2 to 3/4 inch (1.27–1.9 cm)';
                expect(convertText(input)).toBe(expected);
            });
        });
    });

    describe('Weight Ranges', () => {
        describe('Pounds', () => {
            test('2-3 lbs (hyphen)', () => {
                const input = 'Package weight 2-3 lbs';
                const expected = 'Package weight 2-3 lbs (907.18–1,360.78 g)';
                expect(convertText(input)).toBe(expected);
            });

            test('5 to 10 pounds', () => {
                const input = 'Weight: 5 to 10 pounds';
                const expected = 'Weight: 5 to 10 pounds (2.27–4.54 kg)';
                expect(convertText(input)).toBe(expected);
            });

            test('1.5–2.5 lbs (decimal)', () => {
                const input = 'Baby weight: 1.5–2.5 lbs';
                const expected = 'Baby weight: 1.5–2.5 lbs (680.39–1,133.98 g)';
                expect(convertText(input)).toBe(expected);
            });

            test('10 lb – 15 lb (repeated unit)', () => {
                const input = 'Dumbbell: 10 lb – 15 lb';
                const expected = 'Dumbbell: 10 lb – 15 lb (4.54–6.8 kg)';
                expect(convertText(input)).toBe(expected);
            });
        });

        describe('Ounces', () => {
            test('8-16 oz (hyphen)', () => {
                const input = 'Portion size: 8-16 oz';
                const expected = 'Portion size: 8-16 oz (226.8–453.59 g)';
                expect(convertText(input)).toBe(expected);
            });

            test('4 to 6 ounces', () => {
                const input = 'Serving: 4 to 6 ounces';
                const expected = 'Serving: 4 to 6 ounces (113.4–170.1 g)';
                expect(convertText(input)).toBe(expected);
            });

            test('2 oz – 4 oz (repeated unit)', () => {
                const input = 'Add 2 oz – 4 oz of cheese';
                const expected = 'Add 2 oz – 4 oz (56.7–113.4 g) of cheese';
                expect(convertText(input)).toBe(expected);
            });
        });
    });

    describe('Liquid Volume Ranges', () => {
        describe('Gallons', () => {
            test('1-2 gallons (hyphen)', () => {
                const input = 'Capacity: 1-2 gallons';
                const expected = 'Capacity: 1-2 gallons (3.79–7.57 L)';
                expect(convertText(input)).toBe(expected);
            });

            test('0.5 to 1.5 gallons', () => {
                const input = 'Fill with 0.5 to 1.5 gallons';
                const expected = 'Fill with 0.5 to 1.5 gallons (1.89–5.68 L)';
                expect(convertText(input)).toBe(expected);
            });

            test('2 gal – 3 gal (repeated unit)', () => {
                const input = 'Tank size: 2 gal – 3 gal';
                const expected = 'Tank size: 2 gal – 3 gal (7.57–11.36 L)';
                expect(convertText(input)).toBe(expected);
            });
        });

        describe('Quarts', () => {
            test('1-2 quarts (hyphen)', () => {
                const input = 'Add 1-2 quarts of broth';
                const expected = 'Add 1-2 quarts (0.95–1.89 L) of broth';
                expect(convertText(input)).toBe(expected);
            });

            test('2 to 4 qt', () => {
                const input = 'Use 2 to 4 qt of water';
                const expected = 'Use 2 to 4 qt (1.89–3.79 L) of water';
                expect(convertText(input)).toBe(expected);
            });

            test('1 qt – 3 qt (repeated unit)', () => {
                const input = 'Pour 1 qt – 3 qt';
                const expected = 'Pour 1 qt – 3 qt (0.95–2.84 L)';
                expect(convertText(input)).toBe(expected);
            });
        });

        describe('Pints', () => {
            test('1-2 pints (hyphen)', () => {
                const input = 'Add 1-2 pints of cream';
                const expected = 'Add 1-2 pints (473.18–946.35 ml) of cream';
                expect(convertText(input)).toBe(expected);
            });

            test('2 to 4 pints', () => {
                const input = 'Use 2 to 4 pints';
                const expected = 'Use 2 to 4 pints (0.95–1.89 L)';
                expect(convertText(input)).toBe(expected);
            });

            test('1 pt – 2 pt (repeated unit)', () => {
                const input = 'Mix 1 pt – 2 pt of milk';
                const expected = 'Mix 1 pt – 2 pt (473.18–946.35 ml) of milk';
                expect(convertText(input)).toBe(expected);
            });
        });

        describe('Cups', () => {
            test('0.5 to 1 cup', () => {
                const input = 'Add 0.5 to 1 cup of milk';
                const expected = 'Add 0.5 to 1 cup (118.29–236.59 ml) of milk';
                expect(convertText(input)).toBe(expected);
            });

            test('1-2 cups (hyphen)', () => {
                const input = 'Use 1-2 cups of flour';
                const expected = 'Use 1-2 cups (236.59–473.18 ml) of flour';
                expect(convertText(input)).toBe(expected);
            });

            test('2 c – 3 c (repeated unit)', () => {
                const input = 'Mix 2 c – 3 c of sugar';
                const expected = 'Mix 2 c – 3 c (473.18–709.76 ml) of sugar';
                expect(convertText(input)).toBe(expected);
            });
        });

        describe('Fluid Ounces', () => {
            test('8-16 fl oz (hyphen)', () => {
                const input = 'Drink 8-16 fl oz of water';
                const expected = 'Drink 8-16 fl oz (236.59–473.18 ml) of water';
                expect(convertText(input)).toBe(expected);
            });

            test('4 to 8 fluid ounces', () => {
                const input = 'Add 4 to 8 fluid ounces';
                const expected = 'Add 4 to 8 fluid ounces (118.29–236.59 ml)';
                expect(convertText(input)).toBe(expected);
            });

            test('2 fl oz – 4 fl oz (repeated unit)', () => {
                const input = 'Pour 2 fl oz – 4 fl oz';
                const expected = 'Pour 2 fl oz – 4 fl oz (59.15–118.29 ml)';
                expect(convertText(input)).toBe(expected);
            });
        });

        describe('Tablespoons', () => {
            test('1-2 tablespoons (hyphen)', () => {
                const input = 'Add 1-2 tablespoons of oil';
                const expected = 'Add 1-2 tablespoons (14.79–29.57 ml) of oil';
                expect(convertText(input)).toBe(expected);
            });

            test('2 to 4 tbsp', () => {
                const input = 'Mix in 2 to 4 tbsp of butter';
                const expected = 'Mix in 2 to 4 tbsp (29.57–59.15 ml) of butter';
                expect(convertText(input)).toBe(expected);
            });

            test('1 tbsp – 3 tbsp (repeated unit)', () => {
                const input = 'Use 1 tbsp – 3 tbsp';
                const expected = 'Use 1 tbsp – 3 tbsp (14.79–44.36 ml)';
                expect(convertText(input)).toBe(expected);
            });
        });

        describe('Teaspoons', () => {
            test('1-2 teaspoons (hyphen)', () => {
                const input = 'Add 1-2 teaspoons of salt';
                const expected = 'Add 1-2 teaspoons (4.93–9.86 ml) of salt';
                expect(convertText(input)).toBe(expected);
            });

            test('1/2 to 1 tsp (fractions)', () => {
                const input = 'Use 1/2 to 1 tsp of vanilla';
                const expected = 'Use 1/2 to 1 tsp (2.46–4.93 ml) of vanilla';
                expect(convertText(input)).toBe(expected);
            });

            test('1 tsp – 2 tsp (repeated unit)', () => {
                const input = 'Season with 1 tsp – 2 tsp';
                const expected = 'Season with 1 tsp – 2 tsp (4.93–9.86 ml)';
                expect(convertText(input)).toBe(expected);
            });
        });
    });

    describe('Temperature Ranges', () => {
        test('350-400°F (hyphen)', () => {
            const input = 'Bake at 350-400°F';
            const expected = 'Bake at 350-400°F (177–204°C)';
            expect(convertText(input)).toBe(expected);
        });

        test('70 to 80 degrees F', () => {
            const input = 'Temperature: 70 to 80 degrees F';
            const expected = 'Temperature: 70 to 80 degrees F (21–27°C)';
            expect(convertText(input)).toBe(expected);
        });

        test('32–212°F (water range)', () => {
            const input = 'Water freezes at 32°F and boils at 212°F, range 32–212°F';
            const expected =
                'Water freezes at 32°F (0.00°C) and boils at 212°F (100°C), range 32–212°F (0–100°C)';
            expect(convertText(input)).toBe(expected);
        });

        test('98.6 F – 100.4 F (decimal)', () => {
            const input = 'Fever range: 98.6 F – 100.4 F';
            // Individual temperatures are converted separately when there are spaces before F
            const expected = 'Fever range: 98.6 F (37.0°C) – 100.4 F (38.0°C)';
            expect(convertText(input)).toBe(expected);
        });
    });

    describe('Range Separators', () => {
        test('supports hyphen (-)', () => {
            const input = '5-10 miles';
            const expected = '5-10 miles (8.05–16.09 km)';
            expect(convertText(input)).toBe(expected);
        });

        test('supports en dash (–)', () => {
            const input = '5–10 miles';
            const expected = '5–10 miles (8.05–16.09 km)';
            expect(convertText(input)).toBe(expected);
        });

        test('supports em dash (—)', () => {
            const input = '5—10 miles';
            const expected = '5—10 miles (8.05–16.09 km)';
            expect(convertText(input)).toBe(expected);
        });

        test('supports "to"', () => {
            const input = '5 to 10 miles';
            const expected = '5 to 10 miles (8.05–16.09 km)';
            expect(convertText(input)).toBe(expected);
        });

        test('supports "through"', () => {
            const input = '5 through 10 miles';
            const expected = '5 through 10 miles (8.05–16.09 km)';
            expect(convertText(input)).toBe(expected);
        });

        test('supports "thru"', () => {
            const input = '5 thru 10 miles';
            const expected = '5 thru 10 miles (8.05–16.09 km)';
            expect(convertText(input)).toBe(expected);
        });
    });
});
