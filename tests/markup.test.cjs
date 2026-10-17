const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('the current SEO title and description retain the canonical and Open Graph metadata', () => {
  assert.match(html, /<title>TaleAtlas — The World Folktale Book<\/title>/);
  assert.match(html, /name="description" content="A growing illustrated library of child-friendly folktales from around the world\."/);
  assert.match(html, /<link rel="canonical" href="https:\/\/melvinvarghese\.github\.io\/TaleAtlas\/">/);
  assert.match(html, /property="og:title" content="TaleAtlas — The World Folktale Book"/);
  assert.match(html, /property="og:description" content="A growing illustrated library of child-friendly folktales from around the world\."/);
  assert.match(html, /property="og:image" content="https:\/\/melvinvarghese\.github\.io\/TaleAtlas\/cover\.svg"/);
});

test('the page has a focusable skip target, named navigation, and live result status', () => {
  assert.match(html, /class="skip-link" href="#main-content"/);
  assert.match(html, /<main id="main-content" tabindex="-1">/);
  assert.match(html, /<nav aria-label="Main navigation">/);
  assert.match(html, /id="story-count"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /<label for="search">/);
  assert.match(html, /<label for="region-filter">/);
  assert.match(html, /aria-controls="about-dialog" aria-haspopup="dialog"/);
});

test('keyboard focus and reduced-motion preferences are explicitly styled', () => {
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
