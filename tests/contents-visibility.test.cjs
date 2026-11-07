const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function runChromium(url, width, height) {
  return new Promise((resolve, reject) => {
    const child = spawn('chromium', [
      '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
      `--window-size=${width},${height}`, '--virtual-time-budget=15000', '--dump-dom', url,
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => child.kill('SIGKILL'), 60000);
    child.stdout.setEncoding('utf8').on('data', chunk => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
    child.once('error', error => { clearTimeout(timeout); reject(error); });
    child.once('close', status => { clearTimeout(timeout); resolve({ status, stdout, stderr }); });
  });
}

function createServer() {
  let testHtml = '';
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/__test__/index.html') {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(testHtml);
      return;
    }
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.resolve(root, relative);
    if (!filePath.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
      response.end(content);
    });
  });
  return { server, setTestHtml: html => { testHtml = html; } };
}

function contentsHarness() {
  return `<script>
    (async () => {
      const result = document.createElement('pre');
      result.id = 'contents-visibility-result';
      result.dataset.status = 'running';
      document.body.appendChild(result);
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      const waitFor = async (predicate, message) => {
        const deadline = Date.now() + 12000;
        while (Date.now() < deadline) {
          if (predicate()) return;
          await delay(50);
        }
        throw new Error(message);
      };
      try {
        const opener = document.getElementById('open-book');
        if (!opener) throw new Error('Reader opener is missing');
        opener.click();

        const storyCount = 301;
        const pageSize = 20;
        const pageCount = Math.ceil(storyCount / pageSize);
        await waitFor(() => document.querySelectorAll('.contents-list li').length === pageSize, 'Reader did not render the first 20 contents entries');
        const allIndexes = [];
        const pageMetrics = [];

        for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
          const start = (pageNumber - 1) * pageSize;
          const end = Math.min(start + pageSize, storyCount);
          const expectedCounter = 'Contents ' + (start + 1) + '–' + end + ' of ' + storyCount;
          await waitFor(() => document.getElementById('page-counter').textContent === expectedCounter, 'Reader did not show ' + expectedCounter);

          const list = document.querySelector('.contents-list');
          const page = list.closest('.page-inner') || list.closest('.paper');
          const book = document.querySelector('.book');
          const pageRect = page.getBoundingClientRect();
          const bookRect = book.getBoundingClientRect();
          const entries = [...list.querySelectorAll('li')];
          const indexes = entries.map(entry => Number(entry.querySelector('[data-story]').dataset.story));
          const fullyInside = entries.filter(entry => {
            const rect = entry.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.left >= pageRect.left && rect.right <= pageRect.right && rect.top >= pageRect.top && rect.bottom <= pageRect.bottom;
          }).length;
          const lastRect = entries.at(-1).getBoundingClientRect();
          const expectedEntries = end - start;
          const visible = entries.length === expectedEntries
            && fullyInside === expectedEntries
            && lastRect.bottom <= bookRect.bottom + 1
            && indexes[0] === start
            && indexes.at(-1) === end - 1;

          allIndexes.push(...indexes);
          pageMetrics.push({ page: pageNumber, entries: entries.length, fullyInside, visible });
          if (pageNumber < pageCount) {
            document.getElementById('next').click();
            const nextStart = end;
            const nextEnd = Math.min(nextStart + pageSize, storyCount);
            const nextCounter = 'Contents ' + (nextStart + 1) + '–' + nextEnd + ' of ' + storyCount;
            await waitFor(() => document.getElementById('page-counter').textContent === nextCounter, 'Next did not show ' + nextCounter);
          }
        }

        const indexesAreOrdered = allIndexes.length === storyCount
          && allIndexes.every((index, offset) => index === offset);
        const lastCounter = 'Contents 301–301 of 301';
        document.getElementById('next').click();
        await waitFor(() => document.getElementById('reader-title').textContent === 'The Lion and the Mouse', 'Last contents page did not begin reading');
        const beginReadingWorks = document.getElementById('page-counter').textContent === 'Story 1 of 301';
        document.getElementById('prev').click();
        await waitFor(() => document.getElementById('page-counter').textContent === lastCounter, 'Previous did not return to the last contents page');

        const metrics = {
          viewport: [window.innerWidth, window.innerHeight],
          storyCount,
          contentsPages: pageCount,
          visitedEntries: allIndexes.length,
          indexesAreOrdered,
          visiblePages: pageMetrics.filter(page => page.visible).length,
          lastPageCounter: lastCounter,
          beginReadingWorks,
          pageMetrics
        };
        result.dataset.status = indexesAreOrdered && pageMetrics.every(page => page.visible) && beginReadingWorks ? 'passed' : 'failed';
        result.textContent = JSON.stringify(metrics);
      } catch (error) {
        result.dataset.status = 'failed';
        result.textContent = error.stack || String(error);
      }
    })();
  </script>`;
}

async function checkViewport(baseUrl, label, width, height) {
  const response = await runChromium(`${baseUrl}__test__/index.html`, width, height);
  assert.equal(response.status, 0, `${label}: ${response.stderr}`);
  const match = response.stdout.match(/<pre id="contents-visibility-result" data-status="(passed|failed|skipped)">([\s\S]*?)<\/pre>/);
  assert.ok(match, `Chromium did not return a contents check for ${label}. Output: ${response.stdout.slice(-1200)}`);
  return { label, status: match[1], details: match[2] };
}

test('all 301 contents entries are visible across paginated book pages on desktop and mobile', async () => {
  const productionHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const { server, setTestHtml } = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}/`;
    const base = `<base href="${baseUrl}">`;
    setTestHtml(productionHtml.replace('<head>', `<head>\n  ${base}`).replace('</body>', `${contentsHarness()}\n</body>`));
    const results = [
      await checkViewport(baseUrl, 'desktop 1366×768', 1366, 768),
      await checkViewport(baseUrl, 'mobile 390×844', 390, 844),
    ];
    const failures = results.filter(result => result.status !== 'passed');
    assert.deepEqual(failures, [], `Contents checks did not pass:\n${failures.map(result => `${result.label}: ${result.details}`).join('\n')}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
