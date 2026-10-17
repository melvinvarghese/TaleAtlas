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
        const pageFlipRequested = Boolean(document.querySelector('script[src*="page-flip"]'));
        if (pageFlipRequested) await waitFor(() => window.St && window.St.PageFlip, 'PageFlip library did not load');
        document.getElementById('contents-top').click();
        await waitFor(() => document.querySelectorAll('.contents-list li').length === 12, 'Reader did not render all 12 contents entries');
        if (pageFlipRequested) {
          await waitFor(() => document.querySelector('#flipbook .stf__wrapper'), 'PageFlip did not initialize');
          await delay(1200);
          if (window.matchMedia('(max-width: 760px)').matches) {
            result.dataset.status = 'skipped';
            result.textContent = 'Legacy PageFlip mobile turning is not reliably controllable in Chromium --dump-dom.';
            return;
          }
        } else {
          await delay(300);
        }
        const lists = [...document.querySelectorAll('.contents-list')];
        const list = lists.sort((a, b) => {
          const first = a.getBoundingClientRect();
          const second = b.getBoundingClientRect();
          return second.width * second.height - first.width * first.height;
        })[0];
        const page = list.closest('.page-inner') || list.closest('.paper');
        const book = document.querySelector('#flipbook') || document.querySelector('.book');
        const pageRect = page.getBoundingClientRect();
        const bookRect = book.getBoundingClientRect();
        const entries = [...list.querySelectorAll('li')];
        const fullyInside = entries.filter(entry => {
          const rect = entry.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.left >= pageRect.left && rect.right <= pageRect.right && rect.top >= pageRect.top && rect.bottom <= pageRect.bottom;
        }).length;
        const lastRect = entries.at(-1).getBoundingClientRect();
        const metrics = {
          viewport: [window.innerWidth, window.innerHeight],
          entries: entries.length,
          fullyInsidePage: fullyInside,
          pageHeight: Math.round(pageRect.height),
          bookHeight: Math.round(bookRect.height),
          lastEntryBottom: Math.round(lastRect.bottom),
          bookBottom: Math.round(bookRect.bottom),
          pageOverflow: getComputedStyle(page).overflowY
        };
        result.dataset.status = entries.length === 12 && fullyInside === 12 && lastRect.bottom <= bookRect.bottom + 1 ? 'passed' : 'failed';
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

test('all 12 contents entries and the book bottom remain visible on desktop and mobile', async () => {
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
