const {
    LENGTH_INCH_TO_METERS,
    LENGTH_FOOT_TO_METERS,
    LENGTH_MILE_TO_METERS,
    LENGTH_YARD_TO_METERS,
    AREA_SQFT_TO_SQM,
    AREA_SQIN_TO_SQM,
    AREA_SQYD_TO_SQM,
    AREA_SQMI_TO_SQM,
    AREA_ACRE_TO_SQM,
    LIQUID_GALLON_TO_L,
    LIQUID_QUART_TO_L,
    LIQUID_PINT_TO_L,
    LIQUID_CUP_TO_L,
    LIQUID_FLOZ_TO_L,
    LIQUID_TBSP_TO_L,
    LIQUID_TSP_TO_L,
    WEIGHT_OUNCE_TO_GRAMS,
    WEIGHT_POUND_TO_GRAMS,
    CURRENCY_SYMBOLS,
    FEET_SYMBOLS,
    INCH_SYMBOLS,
    UNICODE_FRACTIONS,
    UNICODE_FRACTIONS_MAP,
    UNICODE_FRACTIONS_DENOM,
    TIME_ZONE_OFFSETS,
} = require('../src/utils/constants.js');

describe('Constants module', () => {
    test('length conversions are defined with known ratios', () => {
        expect(LENGTH_INCH_TO_METERS).toBeCloseTo(0.0254);
        expect(LENGTH_FOOT_TO_METERS).toBeCloseTo(0.3048);
        expect(LENGTH_YARD_TO_METERS).toBeCloseTo(0.9144);
        expect(LENGTH_MILE_TO_METERS).toBeCloseTo(1609.344);
    });

    test('area conversions are derived from length conversions', () => {
        expect(AREA_SQFT_TO_SQM).toBeCloseTo(LENGTH_FOOT_TO_METERS ** 2);
        expect(AREA_SQIN_TO_SQM).toBeCloseTo(LENGTH_INCH_TO_METERS ** 2);
        expect(AREA_SQYD_TO_SQM).toBeCloseTo(LENGTH_YARD_TO_METERS ** 2);
        expect(AREA_SQMI_TO_SQM).toBeCloseTo(LENGTH_MILE_TO_METERS ** 2);
        expect(AREA_ACRE_TO_SQM).toBeCloseTo(4046.8564224);
    });

    test('liquid conversions are defined to liters', () => {
        expect(LIQUID_GALLON_TO_L).toBeCloseTo(3.78541);
        expect(LIQUID_QUART_TO_L).toBeCloseTo(0.946353);
        expect(LIQUID_PINT_TO_L).toBeCloseTo(0.473176);
        expect(LIQUID_CUP_TO_L).toBeCloseTo(0.236588);
        expect(LIQUID_FLOZ_TO_L).toBeCloseTo(0.0295735);
        expect(LIQUID_TBSP_TO_L).toBeCloseTo(0.0147868);
        expect(LIQUID_TSP_TO_L).toBeCloseTo(0.00492892);
    });

    test('weight conversions exist', () => {
        expect(WEIGHT_OUNCE_TO_GRAMS).toBeCloseTo(28.3495);
        expect(WEIGHT_POUND_TO_GRAMS).toBeCloseTo(453.592);
    });

    test('symbol helpers include expected characters', () => {
        expect(CURRENCY_SYMBOLS).toContain('$');
        expect(FEET_SYMBOLS).toContain("'");
        expect(INCH_SYMBOLS).toContain('"');
    });

    test('unicode fractions data is populated', () => {
        expect(UNICODE_FRACTIONS).toContain('½');
        expect(UNICODE_FRACTIONS_MAP['½']).toBe(0.5);
        expect(UNICODE_FRACTIONS_DENOM['⅞']).toBe(8);
    });

    test('timezone offsets include common zones', () => {
        expect(TIME_ZONE_OFFSETS.EST).toBe(-5);
        expect(TIME_ZONE_OFFSETS.UTC).toBe(0);
    });
});
