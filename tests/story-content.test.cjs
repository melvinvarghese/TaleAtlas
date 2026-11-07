const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');

function loadStories() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'stories.js'), 'utf8'), context);
  return context.window.TALEATLAS_STORIES;
}

function storyText(id) {
  const story = loadStories().find(candidate => candidate.id === id);
  assert.ok(story, `missing story: ${id}`);
  return [story.title, story.summary, story.moral, story.leftPage, story.rightPage].join(' ');
}

test('100 added stories are balanced, complete, sourced, and text-only', () => {
  const stories = loadStories();
  const additions = stories.slice(12);
  const expectedRegions = {
    Africa: 20,
    'Ancient Greece': 20,
    'East Asia': 20,
    Europe: 20,
    'South Asia': 20,
  };

  assert.equal(stories.length, 112);
  assert.equal(additions.length, 100);
  assert.equal(new Set(stories.map(story => story.id)).size, 112, 'story ids must be unique');
  assert.equal(new Set(stories.map(story => story.title)).size, 112, 'story titles must be unique');

  const regionCounts = Object.fromEntries(Object.keys(expectedRegions).map(region => [
    region,
    additions.filter(story => story.region === region).length,
  ]));
  assert.deepEqual(regionCounts, expectedRegions);

  for (const story of additions) {
    for (const field of ['id', 'title', 'region', 'country', 'theme', 'readingTime', 'summary', 'moral', 'leftPage', 'rightPage']) {
      assert.equal(typeof story[field], 'string', `${story.title || story.id} is missing ${field}`);
      assert.ok(story[field].trim(), `${story.title || story.id} has an empty ${field}`);
    }
    assert.match(story.country, /^[^;]+;\s*.{10,}$/, `${story.title} needs a short source/version note`);
    assert.ok(story.country.split(';').slice(1).join(';').trim().length <= 85, `${story.title} has an overlong source/version note`);
    assert.equal(fs.existsSync(path.join(root, 'assets', `${story.id}.webp`)), false, `${story.id} must remain text-only`);
  }
});

test('The Pretty Stranger keeps the witch’s murder and Itu’s attack on Old Town', () => {
  const text = storyText('of-the-pretty-stranger-who-killed-the-king');
  assert.match(text, /witch/i);
  assert.match(text, /kill(?:ed|s) King Mbotu/i);
  assert.match(text, /Itu.{0,160}attack(?:ed|s)? Old Town|attack(?:ed|s)? Old Town.{0,160}Itu/i);
  assert.match(text, /Old Town.{0,100}(?:defeated|captured|taken prisoner)|(?:defeated|captured|taken prisoner).{0,100}Old Town/i);
});

test('The Ass and the Grasshopper keeps the ass’s death from hunger', () => {
  assert.match(storyText('the-ass-and-the-grasshopper'), /died of hunger/i);
});

test('The Wolf and the Crane keeps the wolf’s refusal to pay', () => {
  const text = storyText('the-wolf-and-the-crane');
  assert.match(text, /refused to pay (?:Crane )?(?:the )?(?:promised )?fee/i);
  assert.match(text, /she should be glad she escaped his jaws unharmed/i);
});

test('The Tortoise and the Eagle keeps the tortoise’s fatal fall', () => {
  assert.match(storyText('the-tortoise-and-the-eagle'), /fell from the sky.{0,80}died/i);
});
