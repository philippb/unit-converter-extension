const { TIME_ZONE_OFFSETS } = require('../utils/constants.js');
const { RE_TIME_GLOBAL } = require('../parsing/regex.js');
const { buildInsertedParenthetical } = require('../utils/insertMarkers.js');

const TARGET_TIMEZONE = 'PST';
const TARGET_TIMEZONE_OFFSET = -8;

function convertTimeZone(timeStr, sourceTimezone, sourceOffset = null) {
    let hours = 0;
    let minutes = 0;
    let isPM = false;

    const ampmMatch = timeStr.match(/(\d+)(?::(\d+))?(?::(\d+))?\s*(am|pm)/i);
    if (ampmMatch) {
        hours = parseInt(ampmMatch[1], 10);
        minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
        isPM = ampmMatch[4].toLowerCase() === 'pm';

        if (isPM && hours < 12) {
            hours += 12;
        } else if (!isPM && hours === 12) {
            hours = 0;
        }
    } else {
        const timeMatch = timeStr.match(/(\d+)(?::(\d+))?(?::(\d+))?/);
        if (timeMatch) {
            hours = parseInt(timeMatch[1], 10);
            minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        }
    }

    let tzOffset = 0;
    if (sourceOffset !== null) {
        tzOffset = sourceOffset;
    } else if (TIME_ZONE_OFFSETS[sourceTimezone]) {
        tzOffset = TIME_ZONE_OFFSETS[sourceTimezone];
    }

    const sourceMinutesFromUTC = hours * 60 + minutes - tzOffset * 60;
    const targetMinutesFromUTC = sourceMinutesFromUTC + TARGET_TIMEZONE_OFFSET * 60;

    let targetHours = Math.floor(targetMinutesFromUTC / 60);
    while (targetHours < 0) targetHours += 24;
    targetHours = targetHours % 24;

    let targetMinutes = targetMinutesFromUTC % 60;
    if (targetMinutes < 0) targetMinutes += 60;

    let targetAmPm = 'am';
    if (targetHours >= 12) {
        targetAmPm = 'pm';
        if (targetHours > 12) {
            targetHours -= 12;
        }
    } else if (targetHours === 0) {
        targetHours = 12;
    }

    const formattedMinutes = targetMinutes.toString().padStart(2, '0');

    return `${targetHours}${formattedMinutes > 0 && formattedMinutes !== '00' ? `:${formattedMinutes}` : ''} ${targetAmPm}`;
}

function convertTimeZoneText(text, options = {}) {
    let converted = text;
    const timeRegex = RE_TIME_GLOBAL;

    converted = converted.replace(timeRegex, function (match) {
        const timeAndTzParts = match.match(
            /^(.*?)(\s+)((?:EST|CST|MST|PST|EDT|CDT|MDT|PDT)|(?:GMT|UTC)(?:\s*[+-]\s*\d+(?::[0-5][0-9])?)?)$/
        );

        if (!timeAndTzParts) return match;

        const time = timeAndTzParts[1];
        const timezoneWithMaybeOffset = timeAndTzParts[3];

        const tzParts = timezoneWithMaybeOffset.match(
            /^(EST|CST|MST|PST|EDT|CDT|MDT|PDT|GMT|UTC)(?:\s*([+-])\s*(\d+)(?::(\d+))?)?$/i
        );

        if (!tzParts) return match;

        const tz = tzParts[1].toUpperCase();

        if (tz === TARGET_TIMEZONE) {
            return match;
        }

        let offset = null;
        if (tzParts[2] && tzParts[3]) {
            const sign = tzParts[2] === '+' ? 1 : -1;
            const hours = parseInt(tzParts[3], 10);
            const minutes = tzParts[4] ? parseInt(tzParts[4], 10) / 60 : 0;
            offset = sign * (hours + minutes);
        }

        const convertedTime = convertTimeZone(time, tz, offset);
        const formatted = `${convertedTime} ${TARGET_TIMEZONE}`;
        return `${match} ${buildInsertedParenthetical(formatted, options)}`;
    });

    return converted;
}

module.exports = {
    convertTimeZone,
    convertTimeZoneText,
    TARGET_TIMEZONE,
    TARGET_TIMEZONE_OFFSET,
};
