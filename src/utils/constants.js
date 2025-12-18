const LENGTH_INCH_TO_METERS = 0.0254;
const LENGTH_FOOT_TO_METERS = 0.3048;
const LENGTH_YARD_TO_METERS = 0.9144;
const LENGTH_MILE_TO_METERS = 1609.344;

const WEIGHT_OUNCE_TO_GRAMS = 28.3495;
const WEIGHT_POUND_TO_GRAMS = 453.592;

const AREA_SQFT_TO_SQM = LENGTH_FOOT_TO_METERS * LENGTH_FOOT_TO_METERS;
const AREA_SQIN_TO_SQM = LENGTH_INCH_TO_METERS * LENGTH_INCH_TO_METERS;
const AREA_SQYD_TO_SQM = LENGTH_YARD_TO_METERS * LENGTH_YARD_TO_METERS;
const AREA_SQMI_TO_SQM = LENGTH_MILE_TO_METERS * LENGTH_MILE_TO_METERS;
const AREA_ACRE_TO_SQM = 4046.8564224;

const LIQUID_GALLON_TO_L = 3.78541;
const LIQUID_QUART_TO_L = 0.946353;
const LIQUID_PINT_TO_L = 0.473176;
const LIQUID_CUP_TO_L = 0.236588;
const LIQUID_FLOZ_TO_L = 0.0295735;
const LIQUID_TBSP_TO_L = 0.0147868;
const LIQUID_TSP_TO_L = 0.00492892;

const UNICODE_FRACTIONS = '½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒';
const UNICODE_FRACTIONS_MAP = {
    '½': 0.5,
    '¼': 0.25,
    '¾': 0.75,
    '⅓': 1 / 3,
    '⅔': 2 / 3,
    '⅕': 0.2,
    '⅖': 0.4,
    '⅗': 0.6,
    '⅘': 0.8,
    '⅙': 1 / 6,
    '⅚': 5 / 6,
    '⅛': 0.125,
    '⅜': 0.375,
    '⅝': 0.625,
    '⅞': 0.875,
    '⅐': 1 / 7,
    '⅑': 1 / 9,
    '⅒': 0.1,
};
const UNICODE_FRACTIONS_DENOM = {
    '½': 2,
    '¼': 4,
    '¾': 4,
    '⅓': 3,
    '⅔': 3,
    '⅕': 5,
    '⅖': 5,
    '⅗': 5,
    '⅘': 5,
    '⅙': 6,
    '⅚': 6,
    '⅛': 8,
    '⅜': 8,
    '⅝': 8,
    '⅞': 8,
    '⅐': 7,
    '⅑': 9,
    '⅒': 10,
};

const CURRENCY_SYMBOLS = '$€£¥₹₽₩₺₪₫₴₦₱฿₭₲₡₵₸₼₾₿';
const FEET_SYMBOLS = "'′\u2019";
const INCH_SYMBOLS = '"\u2033\u201D';

const TIME_ZONE_OFFSETS = {
    EST: -5,
    CST: -6,
    MST: -7,
    PST: -8,
    EDT: -4,
    CDT: -5,
    MDT: -6,
    PDT: -7,
    GMT: 0,
    UTC: 0,
};

module.exports = {
    LENGTH_INCH_TO_METERS,
    LENGTH_FOOT_TO_METERS,
    LENGTH_YARD_TO_METERS,
    LENGTH_MILE_TO_METERS,
    AREA_SQFT_TO_SQM,
    AREA_SQIN_TO_SQM,
    AREA_SQYD_TO_SQM,
    AREA_SQMI_TO_SQM,
    AREA_ACRE_TO_SQM,
    WEIGHT_OUNCE_TO_GRAMS,
    WEIGHT_POUND_TO_GRAMS,
    LIQUID_GALLON_TO_L,
    LIQUID_QUART_TO_L,
    LIQUID_PINT_TO_L,
    LIQUID_CUP_TO_L,
    LIQUID_FLOZ_TO_L,
    LIQUID_TBSP_TO_L,
    LIQUID_TSP_TO_L,
    UNICODE_FRACTIONS,
    UNICODE_FRACTIONS_MAP,
    UNICODE_FRACTIONS_DENOM,
    CURRENCY_SYMBOLS,
    FEET_SYMBOLS,
    INCH_SYMBOLS,
    TIME_ZONE_OFFSETS,
};
