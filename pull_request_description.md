# Add Timezone Conversion Feature

## Description

This PR adds a new feature to the Imperial-to-Metric unit converter extension that automatically displays timezone conversions to Pacific Standard Time (PST). Similar to how the extension converts imperial measurements to metric units and displays them in parentheses, this feature detects time expressions with timezone information and adds the equivalent PST time in parentheses.

For example, "3 pm EST" will be converted to "3 pm EST (12 pm PST)".

## Features

- Converts times from various timezones (EST, CST, MST, EDT, CDT, MDT, GMT, UTC, etc.) to PST
- Handles time formats with or without minutes (12 pm, 3:30 pm)
- Supports 12-hour and 24-hour time formats
- Recognizes GMT/UTC with offsets (GMT+3, UTC-5, GMT+5:30)
- Skips conversion when the time is already in PST
- Works alongside existing imperial-to-metric conversions

## Examples

- "Let's meet at 12 pm EST" → "Let's meet at 12 pm EST (9 am PST)"
- "The call starts at 2:30 pm GMT" → "The call starts at 2:30 pm GMT (6:30 am PST)"
- "Conference at 10 am GMT+2" → "Conference at 10 am GMT+2 (12 am PST)"
- "Webinar time: 15:00 UTC-3" → "Webinar time: 15:00 UTC-3 (10 am PST)"
- "Office hours: 9 am PST" → "Office hours: 9 am PST" (no conversion needed)
- "Ship the 2 lb package at 3 pm EST" → "Ship the 2 lb (907.18 g) package at 3 pm EST (12 pm PST)"

## Implementation

- Added timezone pattern detection similar to existing measurement unit patterns
- Created timezone conversion logic that calculates the time difference
- Implemented PST conversion with appropriate handling for AM/PM and time wrapping
- Added comprehensive test coverage for various timezone formats and edge cases

## Notes

- The extension ignores daylight saving time adjustments as specified in the requirements
- All existing tests continue to pass
- The implementation follows the same pattern as the existing measurement conversion code
