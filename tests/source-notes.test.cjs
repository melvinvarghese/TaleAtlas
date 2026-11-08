const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

function cleaned(countries) {
  const context = { window: { TALEATLAS_STORIES: countries.map((country) => ({ country })) } };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'source-notes.js'), 'utf8'), context);
  return context.window.TALEATLAS_STORIES.map((story) => story.country);
}

test('uncertainty notes are removed and the place and real source are kept', () => {
  assert.deepEqual(cleaned([
    'Nigeria; Dayrell, Folk Stories from Southern Nigeria (1910); community varies',
    'Greece; Aesopic tradition, Townsend collection (1867); authorship uncertain',
    'China; Wilhelm, The Chinese Fairy Book (1921); version varies',
    'India; Jacobs, Indian Fairy Tales (1892); variants vary',
  ]), [
    'Nigeria; Dayrell, Folk Stories from Southern Nigeria (1910)',
    'Greece; Aesopic tradition, Townsend collection (1867)',
    'China; Wilhelm, The Chinese Fairy Book (1921)',
    'India; Jacobs, Indian Fairy Tales (1892)',
  ]);
});

test('a trailing uncertainty clause inside a note is removed', () => {
  assert.deepEqual(cleaned(['Japan; Ozaki, Japanese Fairy Tales (1908), versions vary']),
    ['Japan; Ozaki, Japanese Fairy Tales (1908)']);
});

test('real provenance notes are left alone', () => {
  const kept = [
    'Germany; a version collected by the Brothers Grimm',
    'India; Panchatantra tradition',
    'Ghana and Akan traditions',
    'Japan; Ozaki, Japanese Fairy Tales (1908); adapted retelling',
    'Scotland; Adapted from Jacobs, Celtic Fairy Tales (1892)',
  ];
  assert.deepEqual(cleaned(kept), kept);
});

test('a story whose only note was an uncertainty note keeps just its place', () => {
  assert.deepEqual(cleaned(['Nigeria; community varies']), ['Nigeria']);
});

test('index.html loads source-notes.js after reading-time.js and before script.js', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const order = ['reading-time.js', 'source-notes.js', 'script.js'].map((name) => html.indexOf(`<script src="${name}"></script>`));
  assert.ok(order.every((position) => position >= 0), 'a script tag is missing');
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});
