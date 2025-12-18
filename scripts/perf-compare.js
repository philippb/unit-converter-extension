#!/usr/bin/env node
/**
 * Performance comparison script for CI.
 * Runs performance tests multiple times and outputs JSON results.
 * Can compare against a baseline and fail if regression exceeds threshold.
 *
 * Usage:
 *   node scripts/perf-compare.js                    # Run benchmark, output JSON
 *   node scripts/perf-compare.js --baseline 50.0    # Compare against baseline
 *   node scripts/perf-compare.js --threshold 5      # Set threshold % (default: 5)
 */
const { spawnSync } = require('child_process');

const RUNS = 5;
const DEFAULT_THRESHOLD_PERCENT = 5;

function runOnce() {
    const res = spawnSync('npx', ['jest', 'test/performance.test.js', '--runInBand'], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
    });
    if (res.error) throw res.error;
    const out = (res.stdout || '') + (res.stderr || '');
    const m = out.match(/processNode on recipe\.html: ([0-9]+\.[0-9]+) ms/);
    if (!m) {
        throw new Error('Could not parse performance output. Output was:\n' + out);
    }
    return parseFloat(m[1]);
}

function parseArgs() {
    const args = process.argv.slice(2);
    const result = { baseline: null, threshold: DEFAULT_THRESHOLD_PERCENT };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--baseline' && args[i + 1]) {
            result.baseline = parseFloat(args[i + 1]);
            i++;
        } else if (args[i] === '--threshold' && args[i + 1]) {
            result.threshold = parseFloat(args[i + 1]);
            i++;
        }
    }
    return result;
}

function main() {
    const { baseline, threshold } = parseArgs();
    const times = [];

    // Run benchmark multiple times
    for (let i = 0; i < RUNS; i++) {
        const t = runOnce();
        times.push(t);
    }

    // Calculate statistics
    const sorted = [...times].sort((a, b) => a - b);
    const avg = times.reduce((a, b) => a + b, 0) / RUNS;
    const median = sorted[Math.floor(RUNS / 2)];
    const min = sorted[0];
    const max = sorted[RUNS - 1];

    const result = {
        runs: times,
        average: parseFloat(avg.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
    };

    // If baseline provided, compare
    if (baseline !== null) {
        const changePercent = ((avg - baseline) / baseline) * 100;
        result.baseline = baseline;
        result.changePercent = parseFloat(changePercent.toFixed(2));
        result.threshold = threshold;
        result.passed = changePercent <= threshold;

        console.log(JSON.stringify(result, null, 2));

        if (!result.passed) {
            console.error(
                `\nPerformance regression detected: ${changePercent.toFixed(2)}% slower (threshold: ${threshold}%)`
            );
            console.error(`Baseline: ${baseline.toFixed(2)} ms, Current: ${avg.toFixed(2)} ms`);
            process.exit(1);
        } else {
            console.log(`\nPerformance check passed: ${changePercent.toFixed(2)}% change (threshold: ${threshold}%)`);
        }
    } else {
        // Just output the benchmark result
        console.log(JSON.stringify(result, null, 2));
    }
}

main();
