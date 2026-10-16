const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { test } = require('node:test');

const fixture = path.join(__dirname, 'smoke.html');
const url = `file://${fixture}`;

test('TaleAtlas search, filters, reader, and keyboard controls work in Chromium', () => {
  const result = spawnSync('chromium', [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--dump-dom',
    url,
  ], { encoding: 'utf8', timeout: 30000 });

  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr);
  const match = result.stdout.match(/<pre id="test-result" data-status="(passed|failed)">([\s\S]*?)<\/pre>/);
  assert.ok(match, `Browser did not return the test result. Output: ${result.stdout.slice(-1000)}`);
  assert.equal(match[1], 'passed', match[2].replace(/&#10;/g, '\n'));
  assert.match(match[2], /11 passed; 0 failed/);
});
