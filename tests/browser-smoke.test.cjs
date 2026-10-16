const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

test('the production TaleAtlas page supports search, filters, reader, and keyboard access in Chromium', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taleatlas-browser-'));
  try {
    const productionHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const base = `<base href="${pathToFileURL(`${root}${path.sep}`).href}">`;
    const instrumentedHtml = productionHtml
      .replace('<head>', `<head>\n  ${base}`)
      .replace('</body>', '  <script src="tests/smoke.js"></script>\n</body>');
    const testPage = path.join(tempDir, 'index.html');
    fs.writeFileSync(testPage, instrumentedHtml);

    const result = spawnSync('chromium', [
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      '--allow-file-access-from-files',
      '--window-size=390,844',
      '--dump-dom',
      pathToFileURL(testPage).href,
    ], { encoding: 'utf8', timeout: 30000 });

    assert.equal(result.error, undefined, result.error?.message);
    assert.equal(result.status, 0, result.stderr);
    const match = result.stdout.match(/<pre id="test-result" data-status="(passed|failed)">([\s\S]*?)<\/pre>/);
    assert.ok(match, `Chromium did not return the test result. Output: ${result.stdout.slice(-1200)}`);
    assert.equal(match[1], 'passed', match[2].replace(/&#10;/g, '\n'));
    assert.match(match[2], /14 passed; 0 failed/);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
