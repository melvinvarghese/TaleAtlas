const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const quotas = { 'South Asia': 20, 'East Asia': 20, Europe: 20 };
const approvedAdditionalIllustrations = [
  'the-dragon-princess', 'the-frog-princess', 'the-evil-eye-of-sani',
  'the-ghost-brahman', 'munachar-and-manachar', 'king-otoole-and-his-goose',
  'salmon-of-knowledge-fionn', 'the-brewery-of-eggshells',
  'how-we-got-the-name-spider-tales', 'the-squirrel-and-the-spider',
];
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'stories.js'), 'utf8'), context);
const stories = context.window.TALEATLAS_STORIES;
const appSource = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('regional first-20 art and only ten approved additions have local art and descriptive alt text', () => {
  for (const [region, quota] of Object.entries(quotas)) {
    const regionStories = stories.filter(story => story.region === region);
    const selected = regionStories.slice(0, quota);
    const expected = regionStories.filter((story, index) => index < quota || approvedAdditionalIllustrations.includes(story.id));
    const illustrated = regionStories.filter(story => fs.existsSync(path.join(root, 'assets', `${story.id}.webp`)));

    assert.equal(selected.length, quota, `${region} has enough stories`);
    assert.deepEqual(illustrated.map(story => story.id), expected.map(story => story.id),
      `${region} must keep its first ${quota} stories plus only approved additions illustrated`);

    for (const story of expected) {
      assert.ok(fs.existsSync(path.join(root, 'assets', `${story.id}.webp`)), `${story.id} is missing its WebP illustration`);
      const key = new RegExp(`(?:['\"])?${escapeRegExp(story.id)}(?:['\"])?\\s*:\\s*\\{\\s*alt:\\s*'([^']+)'`, 's');
      const match = appSource.match(key);
      assert.ok(match && match[1].trim().length >= 40, `${story.id} needs descriptive alt text in script.js`);
    }
  }

  for (const id of approvedAdditionalIllustrations) {
    const story = stories.find(item => item.id === id);
    assert.ok(story, `${id} must exist in stories.js`);
    assert.ok(fs.existsSync(path.join(root, 'assets', `${id}.webp`)), `${id} is missing its WebP illustration`);
    const key = new RegExp(`(?:['\"])?${escapeRegExp(id)}(?:['\"])?\\s*:\\s*\\{\\s*alt:\\s*'([^']+)'`, 's');
    const match = appSource.match(key);
    assert.ok(match && match[1].trim().length >= 40, `${id} needs descriptive alt text in script.js`);
  }
});
