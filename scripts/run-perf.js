/*
Runs the performance test 5 times and prints the average duration in ms.
Parses the console output from test/performance.test.js.
*/
const { spawnSync } = require('child_process');

function runOnce() {
    const res = spawnSync('npx', ['jest', 'test/performance.test.js', '--runInBand'], {
        encoding: 'utf8',
    });
    if (res.error) throw res.error;
    const out = (res.stdout || '') + (res.stderr || '');
    const m = out.match(/processNode on recipe\.html: ([0-9]+\.[0-9]+) ms/);
    if (!m) {
        throw new Error('Could not parse performance output. Output was:\n' + out);
    }
    return parseFloat(m[1]);
}

function main() {
    const runs = 5;
    const times = [];
    for (let i = 0; i < runs; i++) {
        const t = runOnce();
        times.push(t);
    }
    const avg = times.reduce((a, b) => a + b, 0) / runs;
    process.stdout.write('Runs: ' + times.map((t) => t.toFixed(2)).join(', ') + '\n');
    process.stdout.write('Average: ' + avg.toFixed(2) + ' ms\n');
}

main();
