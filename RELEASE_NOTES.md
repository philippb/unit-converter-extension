# Release Notes

## 1.7 — 2025-12-18

Changes:

- Significant performance improvements: reduced conversion time from ~120ms to ~50ms through optimized DOM traversal and regex caching.
- Added GitHub workflow to gate performance regressions and track conversion benchmarks.
- Bumped extension manifest to 1.7.

## 1.6 — 2025-12-17

Changes:

- Refactored the converter into a modular pipeline (parsing, exclusions, conversion, formatting) with faster pre-filters and shared range handling to reduce double work and false positives.
- Added AWG wire-gauge support (inches → mm), shared-inch dimension handling (e.g., `6×9"` now yields `15.24x22.86 cm`), and better inch symbol parsing (double apostrophes/curly quotes).
- Fixed negative Fahrenheit conversions, strengthened length/liquid/temperature range formatting, and improved precision/number formatting consistency.
- Hardened exclusions: skip conversions inside code/CodeMirror blocks, quoted strings, currency/colon prefixes, and port numbers; reduce accidental "in" → inches when used as a preposition or after currency.
- Expanded regression coverage (issues #6, #9, #10, #12, #13, #14, #15, #17, #20, plus #32 tracking) with an aggregated test runner to lock in fixes.
- Build pipeline now bundles the content script with esbuild, refreshes lint/format rules, and updates Safari build settings to avoid recursive resource copies.
- Bumped extension manifest to 1.6.

## 1.5 — 2025-09-05

Changes:

- 4df630a Added dynamic decimal precision based on size of the number
- 1e21e50 Added acres
- ea5e2f7 Added square area support such as sq ft

## 1.4 — 2025-09-05

Changes:

- Added dynamic precision for output data based on input precision (d86f8fc)
- Fixed bug with thousand separator where 1,200 lb wouldn't be converted (da3f3ac)
- chore: bump extension version to 1.4 (5b4ce73)
