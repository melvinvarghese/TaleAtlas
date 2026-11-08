const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

function run(stories) {
  const context = { window: { TALEATLAS_STORIES: stories } };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'reading-time.js'), 'utf8'), context);
  return context.window.TALEATLAS_STORIES;
}

const words = (count) => Array.from({ length: count }, () => 'word').join(' ');

test('hand-prepared stories keep the reading time written in stories.js', () => {
  const [story] = run([{ id: 'lion-mouse', readingTime: '3 min', leftPage: words(10), rightPage: words(10) }]);
  assert.equal(story.readingTime, '3 min');
});

test('other stories get a reading time from their word count at about 40 words per minute', () => {
  const stories = run([
    { id: 'short', readingTime: '2 min', leftPage: words(20), rightPage: words(20) },
    { id: 'medium', readingTime: '2 min', leftPage: words(60), rightPage: words(60) },
    { id: 'long', readingTime: '2 min', leftPage: words(100), rightPage: words(100) },
  ]);
  assert.deepEqual(stories.map((story) => story.readingTime), ['1 min', '3 min', '5 min']);
});

test('a very short story never drops below 1 min', () => {
  const [story] = run([{ id: 'tiny', readingTime: '2 min', leftPage: 'Once.', rightPage: 'Done.' }]);
  assert.equal(story.readingTime, '1 min');
});

test('index.html loads reading-time.js after stories.js and before script.js', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const order = ['stories.js', 'reading-time.js', 'script.js'].map((name) => html.indexOf(`<script src="${name}"></script>`));
  assert.ok(order.every((position) => position >= 0), 'a script tag is missing');
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});

test('vague source phrases are hidden but real citations and the country stay', () => {
  const base = { readingTime: '2 min', leftPage: words(10), rightPage: words(10) };
  const countries = [
    'Nigeria; Dayrell, Folk Stories from Southern Nigeria (1910); community varies',
    'Greece; Aesopic tradition, Townsend collection (1867); authorship uncertain',
    'India; Jacobs, Indian Fairy Tales (1892); variants vary',
    'China; Wilhelm, The Chinese Fairy Book (1921); version varies',
    'Japan; Ozaki, Japanese Fairy Tales (1908); adapted retelling',
    'Germany; a version collected by the Brothers Grimm',
    'Greece',
  ];
  const cleaned = run(countries.map((country, index) => ({ ...base, id: `s${index}`, country })))
    .map((story) => story.country);
  assert.deepEqual(cleaned, [
    'Nigeria; Dayrell, Folk Stories from Southern Nigeria (1910)',
    'Greece; Aesopic tradition, Townsend collection (1867)',
    'India; Jacobs, Indian Fairy Tales (1892)',
    'China; Wilhelm, The Chinese Fairy Book (1921)',
    'Japan; Ozaki, Japanese Fairy Tales (1908); adapted retelling',
    'Germany; a version collected by the Brothers Grimm',
    'Greece',
  ]);
});
