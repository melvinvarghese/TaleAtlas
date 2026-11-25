const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');

test('the original 12 stories, next 40, and approved regional stories keep local illustrations', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'stories.js'), 'utf8'), context);
  const stories = context.window.TALEATLAS_STORIES;
  const approvedAdditionalIllustrations = new Set([
    'the-dragon-princess', 'the-frog-princess', 'the-evil-eye-of-sani',
    'the-ghost-brahman',
    'pride-goeth-before-a-fall', 'the-broken-pot', 'the-tiger-the-brahman-and-the-jackal', 'a-lesson-for-kings',
    'how-the-wicked-sons-were-duped', 'the-indigent-brahman', 'the-bears-bad-bargain', 'the-jackal-and-the-iguana',
    'the-sandy-road', 'the-story-of-chullaka-the-treasurer', 'the-measure-of-rice', 'the-banyan-deer',
    'the-greedy-antelope', 'the-wily-antelope', 'the-dog-who-turned-preacher', 'the-elephant-and-the-dog',
    'the-bull-who-won-the-bet', 'the-holy-quail', 'the-partridge-monkey-and-elephant', 'nanda-on-the-buried-gold',
    'munachar-and-manachar', 'king-otoole-and-his-goose',
    'salmon-of-knowledge-fionn', 'the-brewery-of-eggshells',
    'how-we-got-the-name-spider-tales', 'the-squirrel-and-the-spider',
    'the-leopard-and-the-ram', 'to-lose-an-elephant-for-the-sake-of-a-wren',
    'farmer-mybrow-and-the-fairies', 'affair-of-the-hippopotamus-and-the-tortoise',
    'how-the-tortoise-overcame-the-elephant-and-the-hippopotamus',
    'the-story-of-the-fairy-bee', 'the-story-of-the-hippos', 'the-hare-and-the-lion-zanzibar',
    'the-lion-the-hyena-and-the-rabbit-zanzibar', 'the-blacksmith-and-the-blackbirds',
    'man-and-turtle-angola', 'elephant-and-frog-angola', 'jackal-and-hare-angola',
    'squirrel-and-the-kingship', 'dog-and-the-kingship', 'dog-and-jackal-angola',
    'the-story-of-the-frog-uganda', 'hare-earned-cow-and-chieftainship',
    'the-man-who-knew-too-much', 'the-caterpillar-and-the-wild-animals',
    'how-the-turtle-outwitted-the-pig', 'cunning-rabbit-and-his-well',
    'the-lion-the-hyena-and-the-fox', 'the-elephant-and-the-rabbit-zanzibar',
    'the-little-iron-house', 'the-past-and-the-future',
    'morning-sunrise', 'the-story-of-the-animals-and-the-fruit',
    'the-story-of-the-fairy-foxes', 'the-story-of-the-two-friends-uganda',
    'the-cheats-of-kijongo', 'the-lioness-and-the-antelope',
    'charcoal-burner-and-fuller', 'boy-hunting-locusts',
    'fisherman-piping', 'pomegranate-apple-tree-bramble',
    'dog-in-the-manger', 'oxen-and-axle-trees',
    'boasting-traveler', 'boy-and-filberts',
  ]);
  const regionalIllustrations = new Set(['South Asia', 'East Asia', 'Europe'].flatMap(region =>
    stories.filter(story => story.region === region).slice(0, 20).map(story => story.id)));
  assert.equal(stories.length, 301);
  assert.equal(stories.slice(12, 112).length, 100);
  assert.equal(stories.slice(112).length, 189);
  for (const story of stories.slice(0, 12)) {
    const imagePath = path.join(root, 'assets', `${story.id}.webp`);
    assert.ok(fs.existsSync(imagePath), `${story.id} is missing ${imagePath}`);
  }
  for (const story of stories.slice(12, 32)) {
    const imagePath = path.join(root, 'assets', `${story.id}.webp`);
    assert.ok(fs.existsSync(imagePath), `${story.id} is missing ${imagePath}`);
  }
  for (const story of stories.slice(32, 52)) {
    const imagePath = path.join(root, 'assets', `${story.id}.webp`);
    assert.ok(fs.existsSync(imagePath), `${story.id} is missing ${imagePath}`);
  }
  for (const story of stories.slice(52)) {
    const imagePath = path.join(root, 'assets', `${story.id}.webp`);
    const expectedIllustration = regionalIllustrations.has(story.id) || approvedAdditionalIllustrations.has(story.id);
    assert.equal(fs.existsSync(imagePath), expectedIllustration, `${story.id} illustration status`);
  }
});

test('the standalone artwork-notes file is absent', () => {
  assert.equal(fs.existsSync(path.join(root, 'ASSET-CREDITS.md')), false);
});

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
    assert.match(match[2], /26 passed; 0 failed/);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
