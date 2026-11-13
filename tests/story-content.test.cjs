const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const firstIllustratedBatch = [
  'the-tortoise-with-a-pretty-daughter',
  'the-kings-magic-drum',
  'ituen-and-the-kings-wife',
  'of-the-pretty-stranger-who-killed-the-king',
  'the-disobedient-daughter-who-married-a-skull',
  'the-king-who-married-the-cocks-daughter',
  'concerning-the-woman-the-ape-and-the-child',
  'the-fish-and-the-leopards-wife',
  'why-the-worms-live-underneath-the-ground',
  'why-the-sun-and-the-moon-live-in-the-sky',
  'the-story-of-the-lightning-and-the-thunder',
  'why-dead-people-are-buried',
  'of-the-fat-woman-who-melted-away',
  'the-king-and-the-ju-ju-tree',
  'of-the-pretty-girl-and-the-seven-jealous-women',
  'the-lucky-fisherman',
  'the-orphan-boy-and-the-magic-stone',
  'concerning-the-fate-of-essido-and-his-evil-companions',
  'the-story-of-the-drummer-and-the-alligators',
  'the-election-of-the-king-bird',
];
const secondIllustratedBatch = [
  'the-wolf-and-the-lamb',
  'the-ass-and-the-grasshopper',
  'the-wolf-and-the-crane',
  'the-father-and-his-sons',
  'the-bat-and-the-weasels',
  'the-cock-and-the-jewel',
  'the-swallow-and-the-crow',
  'the-dog-and-the-shadow',
  'hercules-and-the-wagoner',
  'the-mole-and-his-mother',
  'the-fawn-and-his-mother',
  'the-ass-the-fox-and-the-lion',
  'the-flies-and-the-honey-pot',
  'the-farmer-and-the-snake',
  'the-man-and-the-lion',
  'the-mountain-in-labor',
  'the-bear-and-the-fox',
  'the-tortoise-and-the-eagle',
  'the-fox-and-the-goat',
  'the-raven-and-the-swan',
];

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

function storyRecord(id) {
  const story = loadStories().find(candidate => candidate.id === id);
  assert.ok(story, `missing story: ${id}`);
  return story;
}

test('the original 112 stories remain unchanged and approved regional stories receive illustrations', () => {
  const stories = loadStories();
  const originalCollection = stories.slice(0, 112);
  const additions = stories.slice(12, 112);
  const regionalIllustrations = ['South Asia', 'East Asia', 'Europe'].flatMap(region =>
    stories.filter(story => story.region === region).slice(0, 20).map(story => story.id));
  const illustratedBatches = new Set([...firstIllustratedBatch, ...secondIllustratedBatch, ...regionalIllustrations]);
  const expectedRegions = {
    Africa: 20,
    'Ancient Greece': 20,
    'East Asia': 20,
    Europe: 20,
    'South Asia': 20,
  };

  assert.equal(stories.length, 301);
  assert.equal(originalCollection.length, 112);
  assert.equal(additions.length, 100);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(originalCollection)).digest('hex'),
    '4fa792bcc4c2a0655688c34d4a33459240a2f7c80c3833f7e02be3b1e2a79203',
    'the existing 112 story records must stay unchanged');
  assert.equal(new Set(stories.map(story => story.id)).size, 301, 'story ids must be unique');
  assert.equal(new Set(stories.map(story => story.title)).size, 301, 'story titles must be unique');

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
    assert.equal(fs.existsSync(path.join(root, 'assets', `${story.id}.webp`)),
      illustratedBatches.has(story.id), `${story.id} illustration status`);
  }
});

test('the first illustrated batch is exactly stories 13–32 in collection order', () => {
  const batch = loadStories().slice(12, 32).map(story => story.id);
  assert.deepEqual(Array.from(batch), firstIllustratedBatch);
  for (const id of firstIllustratedBatch) {
    assert.ok(fs.existsSync(path.join(root, 'assets', `${id}.webp`)), `${id} is missing its illustration`);
  }
});

test('the second illustrated batch is exactly stories 33–52 in collection order', () => {
  const batch = loadStories().slice(32, 52).map(story => story.id);
  assert.deepEqual(Array.from(batch), secondIllustratedBatch);
  for (const id of secondIllustratedBatch) {
    assert.ok(fs.existsSync(path.join(root, 'assets', `${id}.webp`)), `${id} is missing its illustration`);
  }
});

test('189 new stories add the approved sourced, complete, text-only regional totals', () => {
  const stories = loadStories();
  const additions = stories.slice(112);
  const expectedRegions = {
    Africa: 34,
    'Ancient Greece': 40,
    'East Asia': 40,
    Europe: 40,
    'South Asia': 35,
  };

  assert.equal(additions.length, 189);
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

test('the 189 addition IDs stay fixed and unreviewed records retain their approved snapshot', () => {
  const additions = loadStories().slice(112);
  const reviewedIds = [
    'the-lion-the-hyena-and-the-rabbit-zanzibar',
    'the-frog-and-his-clothes',
    'the-sun-and-how-it-was-made-by-divine-will',
    'the-magic-mirror',
    'concerning-a-man-and-two-yakas',
    'how-gourds-were-put-in-small-mouthed-pots',
    'hans-in-luck',
    'the-two-foxes-the-mole-and-the-crows',
    'a-wonderful-medicine',
    'hare-earned-cow-and-chieftainship',
    'how-the-tortoise-overcame-the-elephant-and-the-hippopotamus',
    'man-and-turtle-angola',
    'the-frightened-yaka',
    'east-light-and-the-bridge-of-fishes',
    'a-lesson-for-kings',
    'the-stars-in-the-sky',
    'pride-goeth-before-a-fall',
    'the-fox-and-the-mask',
    'the-rabbit',
    'the-trees-and-the-axe',
  ];
  const reviewed = new Set(reviewedIds);
  const unreviewed = additions.filter(story => !reviewed.has(story.id));
  const sha256 = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

  assert.equal(additions.length, 189);
  assert.equal(reviewed.size, reviewedIds.length, 'reviewed story IDs must be unique');
  assert.deepEqual(reviewedIds.filter(id => !additions.some(story => story.id === id)), []);
  assert.equal(sha256(additions.map(story => story.id)),
    '5a88038b74b895c42f4b2eaf7599a657d940086f02eb9c8b63aedb27126b4f10',
    'the approved 189 story IDs and order must stay fixed');
  assert.equal(unreviewed.length, 169);
  assert.equal(sha256(unreviewed),
    '7eb5c4416876fc96d995214c67837b8a01fd4a267165ff6a0331010a61b4430f',
    'unreviewed additions must match the approved snapshot');
});

test('How the Tortoise Overcame the Elephant and the Hippopotamus preserves Dayrell’s contests and tortoise origin', () => {
  const story = loadStories().find(candidate => candidate.id === 'how-the-tortoise-overcame-the-elephant-and-the-hippopotamus');
  assert.ok(story, 'missing Tortoise story');
  assert.match(story.leftPage, /Elephant and Hippopotamus were good friends who often fed together/i);
  assert.doesNotMatch(story.leftPage, /boasted of their strength/i);
  assert.match(story.leftPage, /Elephant pulled until (?:his|the) rope broke/i);
  assert.match(story.leftPage, /fastened it around a rock/i);
  assert.match(story.leftPage, /Tortoise untied the rope from the rock/i);
  assert.match(story.leftPage, /show(?:ed|ing) that it was still tied to his leg/i);
  assert.match(story.rightPage, /After pulling until tired, Hippopotamus surfaced puffing/i);
  assert.match(story.rightPage, /^After three months,/i);
  assert.match(story.rightPage, /Hippopotamus proposed that he stay in the water while Tortoise remained on land/i);
  assert.match(story.rightPage, /he would pull Tortoise into the river/i);
  assert.match(story.rightPage, /Tortoise agreed/i);
  assert.match(story.rightPage, /took the rope twice around a strong palm tree/i);
  assert.match(story.rightPage, /unwound the rope from the palm tree/i);
  assert.match(story.rightPage, /showed him the rope still around Hippopotamus’s hind leg/i);
  assert.doesNotMatch(story.rightPage, /rope still tied to his leg/i);
  assert.match(story.rightPage, /elephant and the hippo agreed to take Tortoise as their friend/i);
  assert.match(story.rightPage, /thinking he was very strong/i);
  assert.match(story.rightPage, /the story explains that he had won through cunning, not strength/i);
  assert.doesNotMatch(story.rightPage, /Tortoise explained that cleverness/i);
  assert.match(story.rightPage, /left his son with Elephant on land/i);
  assert.match(story.rightPage, /lived with Hippopotamus in the water/i);
  assert.match(story.rightPage, /tortoises live on land and in water/i);
  assert.match(story.rightPage, /water tortoise.{0,80}(?:much )?(?:larger|bigger).{0,80}plenty of fish/i);
  assert.match(story.rightPage, /land tortoise.{0,80}short of food/i);
  assert.doesNotMatch(story.rightPage, /hippopotamus.{0,100}(?:fell|hurt|injur|head)/i);
});

test('The Flower of Beauty summary flags the lamb sacrifice for an adult reader', () => {
  const story = loadStories().find(candidate => candidate.id === 'the-flower-of-beauty');
  assert.ok(story, 'missing Flower of Beauty story');
  assert.match(story.summary, /lamb/i);
  assert.match(story.summary, /grown-ups?|caregivers?/i);
});

test('The Pretty Stranger keeps the witch’s murder and Itu’s attack on Old Town', () => {
  const text = storyText('of-the-pretty-stranger-who-killed-the-king');
  assert.match(text, /witch/i);
  assert.match(text, /kill(?:ed|s) King Mbotu/i);
  assert.match(text, /Itu.{0,160}attack(?:ed|s)? Old Town|attack(?:ed|s)? Old Town.{0,160}Itu/i);
  assert.match(text, /Old Town.{0,100}(?:defeated|captured|taken prisoner)|(?:defeated|captured|taken prisoner).{0,100}Old Town/i);
});

test('the four duplicate plots are replaced without changing the 301-story target or regional counts', () => {
  const replacements = [
    ['east-light-and-the-bridge-of-fishes', 'East Asia', /Griffis.*1922/i],
    ['pride-goeth-before-a-fall', 'South Asia', /Jacobs.*1892/i],
    ['the-stars-in-the-sky', 'Europe', /Jacobs.*1894/i],
    ['the-fox-and-the-mask', 'Ancient Greece', /Townsend.*1867/i],
  ];
  for (const [id, region, source] of replacements) {
    const story = storyRecord(id);
    assert.equal(story.region, region, `${id} region`);
    assert.match(story.country, source, `${id} source`);
  }

  const stories = loadStories();
  assert.equal(stories.length, 301);
  assert.equal(stories.slice(112).length, 189);
  for (const id of ['the-rabbits-eyes', 'the-lion-and-the-crane', 'the-wee-bannock', 'ant-and-the-dove']) {
    assert.equal(stories.some(story => story.id === id), false, `${id} remains in the additions`);
  }
});

test('Pride Goeth Before a Fall keeps the merchants’ coded song and non-graphic escape', () => {
  const story = storyRecord('pride-goeth-before-a-fall');
  const text = `${story.leftPage} ${story.rightPage}`;
  assert.match(story.summary, /Caregiver note:.*robbery.*weapon/i);
  assert.match(story.summary, /forced removal of.*clothes/i);
  assert.match(story.summary, /compelled dancing|forced dancing/i);
  assert.match(story.country, /Adapted from Jacobs/i);
  assert.match(story.country, /Tales of the Sun.*1890/i);
  assert.match(story.leftPage, /ten cloth merchants/i);
  assert.match(story.leftPage, /three robbers/i);
  assert.match(text, /song/i);
  assert.match(text, /bound|tied/i);
  assert.match(text, /recovered|got back/i);
  assert.doesNotMatch(text, /killed|bloodshed/i);
});

test('The Fox and the Mask keeps Townsend’s distinct appearance-and-wisdom fable', () => {
  const story = storyRecord('the-fox-and-the-mask');
  const text = `${story.leftPage} ${story.rightPage}`;
  assert.equal(story.title, 'The Fox and the Mask');
  assert.match(story.country, /Adapted from Townsend/i);
  assert.match(story.leftPage, /actor/i);
  assert.match(story.leftPage, /mask/i);
  assert.match(story.leftPage, /placed his paws on it/i);
  assert.doesNotMatch(story.leftPage, /turned it over/i);
  assert.match(story.rightPage, /beautiful head/i);
  assert.match(story.rightPage, /no brains/i);
});

test('the Zanzibar tale keeps Bateman’s journey, riddles, and cave while labeling its softened ending', () => {
  const story = storyRecord('the-lion-the-hyena-and-the-rabbit-zanzibar');
  const text = `${story.leftPage} ${story.rightPage}`;
  assert.match(story.summary, /gentle adaptation/i);
  assert.match(story.summary, /Caregiver note:.*eating/i);
  assert.match(story.summary, /Bateman’s original includes Rabbit and Lion eating Hyena/i);
  assert.match(story.summary, /Rabbit later traps and eats Lion/i);
  assert.match(story.summary, /sole owner of the farm and crops/i);
  assert.match(story.country, /adapted/i);
  assert.match(text, /journey/i);
  assert.match(text, /riddle/i);
  assert.match(text, /cave/i);
  assert.match(text, /fair|share/i);
  assert.match(story.leftPage, /all three paused together/i);
  assert.match(story.leftPage, /Lion and Hyena stopped to ponder/i);
  assert.match(story.rightPage, /Hyena stopped alone while Lion and Rabbit kept walking/i);
  assert.match(story.rightPage, /under the gentler bargain, he would lose a share/i);
  assert.match(story.rightPage, /Bateman’s original.{0,100}eaten.{0,80}here Rabbit helps him out/i);
});

test('The Frog and His Clothes keeps the source transformation and coercive bargain visible to caregivers', () => {
  const story = storyRecord('the-frog-and-his-clothes');
  assert.match(story.summary, /Caregiver note:.*(?:marriage|threat)/i);
  assert.match(story.leftPage, /threatened to kill/i);
  assert.match(story.leftPage, /by day.{0,50}frog|frog.{0,50}by day/i);
  assert.match(story.rightPage, /wax/i);
  assert.match(story.country, /Adapted from Eells/i);
  assert.match(story.rightPage, /candle wax.{0,80}sleeping human husband.{0,80}turning him into a frog/i);
  assert.doesNotMatch(story.rightPage, /wax fell on the sleeping frog/i);
  assert.match(story.summary, /neighbor.{0,100}(?:threat|threatens).{0,100}rock/i);
  assert.match(story.rightPage, /clothes.{0,60}pocket|pocket.{0,60}clothes/i);
  assert.match(story.rightPage, /fair/i);
  assert.match(story.rightPage, /already had.{0,40}clothes.{0,40}carried them to a fair/i);
  assert.doesNotMatch(story.rightPage, /followed clues|find.{0,30}where her husband/i);
});

test('The Sun credits Balmont rather than Afanasyev as the tale’s author', () => {
  const story = storyRecord('the-sun-and-how-it-was-made-by-divine-will');
  assert.match(story.country, /Balmont/i);
  assert.doesNotMatch(story.country, /Afanasyev/i);
  assert.match(story.country, /Adapted from/i);
  assert.match(story.country, /Leonard A\. Magnus/i);
  assert.match(story.summary, /Balmont’s religious poem/i);
  assert.match(story.summary, /Caregiver note:.*Christian references.*feathers.*scorched/i);
  assert.doesNotMatch(`${story.summary} ${story.leftPage} ${story.rightPage}`, /folk legend|religious folk explanation/i);
});

test('The Magic Mirror says plainly that the barber’s mirror is a bluff', () => {
  const story = storyRecord('the-magic-mirror');
  assert.match(story.summary, /bluff|pretend/i);
  assert.match(story.leftPage, /only magic.{0,80}conscience/i);
  assert.match(story.country, /Adapted from Sellers/i);
  assert.match(story.leftPage, /shepherdess (?:looked|gazed) into the mirror and blushed/i);
  assert.doesNotMatch(story.leftPage, /saw no blemishes|said so/i);
  assert.match(story.rightPage, /court ladies.{0,80}(?:inspected|looked into) the mirror/i);
  assert.doesNotMatch(story.moral, /courtship custom/i);
  assert.doesNotMatch(story.rightPage, /barber admitted/i);
  assert.match(story.rightPage, /no (?:real )?magic|only magic.{0,80}conscience/i);
  assert.match(story.country, /Sellers.*1888/i);
});

test('the two-yakā tale follows the tree-and-provisions bargain rather than a pit capture', () => {
  const story = storyRecord('concerning-a-man-and-two-yakas');
  const text = `${story.leftPage} ${story.rightPage}`;
  assert.match(story.leftPage, /tree/i);
  assert.match(story.leftPage, /each evening|every evening/i);
  assert.match(text, /under (?:his|the) bed/i);
  assert.match(text, /hungry enough to eat a yakā/i);
  assert.match(text, /knife.{0,80}pineapple|pineapple.{0,80}knife/i);
  assert.match(text, /monthly|each month/i);
  assert.match(story.country, /Adapted from Parker/i);
  assert.doesNotMatch(story.moral, /fair agreement/i);
  assert.match(story.moral, /without a fight|resourcefulness/i);
  assert.doesNotMatch(text, /pit|cook any yakā/i);
});

test('the gourd-pots story uses tiny fruits and labels its softened marriage-threat ending as an adaptation', () => {
  const story = storyRecord('how-gourds-were-put-in-small-mouthed-pots');
  assert.match(story.summary, /tiny|small.{0,30}gourd/i);
  assert.match(story.summary, /Caregiver note:/i);
  assert.match(story.country, /adapted/i);
  assert.match(story.leftPage, /copper pots/i);
  assert.match(story.leftPage, /tiny|small.{0,30}(?:gourd|fruit)/i);
  assert.match(story.leftPage, /king asked the girl where the sesame flower came from/i);
  assert.doesNotMatch(story.leftPage, /could grow/i);
  assert.match(story.summary, /widowhood threat.{0,80}coerced marriage/i);
  assert.doesNotMatch(story.rightPage, /widow|make her a widow/i);
  assert.match(story.rightPage, /dirty cloth/i);
  assert.match(story.moral, /unfair demands|equal|equality/i);
});

test('Hans in Luck says the sharpening stone falls into a stream, not a well', () => {
  const story = storyRecord('hans-in-luck');
  assert.match(story.country, /Adapted from Grimm.*1912/i);
  assert.match(story.country, /Taylor.*Jardine.*Edwardes/i);
  assert.doesNotMatch(story.country, /1884/i);
  assert.match(story.rightPage, /set the sharpening stone down/i);
  assert.match(story.rightPage, /rolled into (?:the )?stream/i);
  assert.match(story.rightPage, /stream|river/i);
  assert.doesNotMatch(story.rightPage, /well/i);
});

test('the two foxes make leafy garments and tree-gum food, not food from leaves', () => {
  const story = storyRecord('the-two-foxes-the-mole-and-the-crows');
  const text = `${story.leftPage} ${story.rightPage}`;
  assert.match(story.country, /Adapted from Chamberlain/i);
  assert.doesNotMatch(story.summary, /leafy disguises/i);
  assert.match(story.summary, /leaves.{0,80}(?:garments|treasures)|(?:garments|treasures).{0,80}leaves/i);
  assert.match(story.summary, /tree gum.{0,80}(?:food|cakes)|(?:food|cakes).{0,80}tree gum/i);
  assert.match(story.leftPage, /leaves.{0,100}(?:garments|clothes|treasures)|(?:garments|clothes|treasures).{0,100}leaves/i);
  assert.match(story.leftPage, /gum/i);
  assert.match(text, /danced.{0,120}flew away/i);
  assert.match(text, /return(?:ed)? for more food.{0,120}Mole.{0,100}reveal(?:ed|s)/i);
  assert.doesNotMatch(story.leftPage, /food.{0,40}leaves/i);
});

test('A Wonderful Medicine does not claim the source guarantees nobody was injured', () => {
  const story = storyRecord('a-wonderful-medicine');
  const text = `${story.summary} ${story.leftPage} ${story.rightPage}`;
  assert.match(story.country, /Adapted from Gale/i);
  assert.match(story.country, /Imps, Ghosts and Fairies/i);
  assert.doesNotMatch(text, /(?:no one|nobody).{0,60}injured/i);
});

test('the hare’s caregiver note distinguishes the source’s feast plan and omitted threat', () => {
  const story = storyRecord('hare-earned-cow-and-chieftainship');
  assert.match(story.country, /Adapted from Baskerville.*1925/i);
  assert.doesNotMatch(story.country, /1900/i);
  assert.match(story.summary, /cow.{0,80}feast|feast.{0,80}cow/i);
  assert.doesNotMatch(story.rightPage, /none of the animals was harmed/i);
  assert.match(story.summary, /Caregiver note:.*source.{0,100}Chief wants a cow killed for the feast/i);
  assert.match(story.summary, /source.{0,100}does not narrate a slaughter/i);
  assert.doesNotMatch(story.summary, /source says the cow is killed/i);
  assert.match(story.summary, /threat to kill (?:the )?hyena if he tastes the meat/i);
  assert.match(story.summary, /retelling keeps the no-tasting instruction but omits the threatened punishment/i);
  assert.match(story.summary, /skinning attempt/i);
  assert.match(story.leftPage, /old chief/i);
  assert.match(story.leftPage, /hares built a round hut and a high fence/i);
  assert.match(story.leftPage, /brought a hollow log full of (?:bumble[- ]?)?bees.{0,100}into the hut they had built/i);
  assert.doesNotMatch(story.leftPage, /to the old Chief’s hut/i);
  assert.match(story.leftPage, /then went to the herdsmen.{0,80}gave him a cow/i);
  assert.match(story.rightPage, /beat the log.{0,60}bees buzz.{0,80}(?:frighten(?:ed|ing)|startled) the animals/i);
  assert.match(story.rightPage, /lion.{0,100}basket.{0,100}water poured through.{0,100}ran away/i);
  assert.match(story.rightPage, /hare (?:told|warned) Hyena he could skin the cow but must not taste the King’s meat/i);
  assert.match(story.rightPage, /hyena began skinning the cow, licked his paws, and could not resist the meat/i);
  assert.match(story.rightPage, /hare raised the alarm, “The hyena is eating the King’s meat!” and beat the hollow log; the bees buzzed/i);
  assert.match(story.rightPage, /hyena.{0,100}dropped his knife and fled/i);
  assert.doesNotMatch(story.leftPage, /persuaded (?:the )?bees? to follow/i);
  assert.doesNotMatch(story.leftPage, /bees?.{0,100}lion.{0,100}ran/i);
  assert.doesNotMatch(story.leftPage, /forest king/i);
  assert.doesNotMatch(story.rightPage, /feast was made from the cow/i);
});

test('Man and Turtle has a brief caregiver note about the captors’ threats', () => {
  const story = storyRecord('man-and-turtle-angola');
  assert.match(story.summary, /Caregiver note:/i);
  assert.match(story.summary, /threat.{0,60}(?:kill|turtle)/i);
  assert.match(story.country, /Adapted from Chatelain/i);
  assert.match(story.moral, /clever/i);
  assert.doesNotMatch(story.moral, /calm/i);
});

test('The Frightened Yakā identifies the Queen’s possession and return to her senses', () => {
  const story = storyRecord('the-frightened-yaka');
  assert.match(story.summary, /Caregiver note:/i);
  assert.match(story.summary, /Queen.{0,40}possessed/i);
  assert.match(story.summary, /returns to her senses/i);
  assert.match(story.leftPage, /tree.{0,80}woman’s doorway/i);
  assert.match(story.leftPage, /waiting to possess her/i);
  assert.doesNotMatch(story.leftPage, /woman who passed by/i);
  assert.match(story.leftPage, /Queen.{0,100}possessed|possessed.{0,100}Queen/i);
  assert.match(story.rightPage, /Queen.{0,50}came to her senses/i);
  assert.match(story.country, /Adapted from Parker/i);
  assert.doesNotMatch(story.country, /Sinhalese/i);
  assert.doesNotMatch(story.summary, /quick thinking drives it away/i);
  assert.doesNotMatch(story.leftPage, /noticed it/i);
  assert.match(story.leftPage, /yakā.{0,60}heard.{0,60}bill-hook/i);
  assert.doesNotMatch(storyText('the-frightened-yaka'), /faint/i);
});

test('East Light flags the source’s infant danger and arrow pursuit for caregivers', () => {
  const story = storyRecord('east-light-and-the-bridge-of-fishes');
  assert.match(story.summary, /Caregiver note:/i);
  assert.match(story.summary, /infant|baby/i);
  assert.match(story.summary, /pigpen.{0,80}stable|stable.{0,80}pigpen/i);
  assert.match(story.summary, /arrows/i);
  assert.match(story.country, /Adapted from Griffis.*1922/i);
  assert.doesNotMatch(story.country, /1911.*rev/i);
  assert.match(story.rightPage, /Cho[-–]sen/i);
  assert.match(story.rightPage, /Morning Radiance/i);
  assert.match(story.rightPage, /Land of the Morning Calm/i);
});

test('A Lesson for Kings preserves the nonviolent virtues comparison in Jacobs’s tale', () => {
  const story = storyRecord('a-lesson-for-kings');
  assert.match(story.country, /ch\.\s*XVII/i);
  assert.match(story.country, /Adapted from Jacobs/i);
  assert.match(story.leftPage, /narrow road/i);
  assert.match(story.rightPage, /anger.{0,60}calm/i);
  assert.match(story.rightPage, /goodness/i);
  assert.match(story.rightPage, /gifts/i);
  assert.match(story.rightPage, /truth/i);
  assert.match(story.rightPage, /Mallika’s charioteer.{0,120}strength with strength and wickedness with wickedness/i);
  assert.match(story.rightPage, /Benares charioteer praised a better rule/i);
});

test('The Stars in the Sky ends with the child back home after the frightening journey', () => {
  const story = storyRecord('the-stars-in-the-sky');
  assert.match(story.summary, /Caregiver note:/i);
  assert.match(story.summary, /paddles in (?:a )?brooklet/i);
  assert.match(story.summary, /adult supervision/i);
  assert.match(story.summary, /never enter a dam or stream to imitate the tale/i);
  assert.match(story.summary, /safe, appropriate place under responsible adult supervision/i);
  assert.match(story.country, /Adapted from Jacobs/i);
  assert.match(story.rightPage, /back home|home beside her bed|by her bedside/i);
});

test('The Rabbit credits prayer rather than attributing the revival to magic water', () => {
  const story = storyRecord('the-rabbit');
  assert.match(story.summary, /prayer|prays/i);
  assert.doesNotMatch(story.summary, /magic water/i);
  assert.match(story.summary, /Caregiver note:.*dead body/i);
  assert.match(story.summary, /supernatural revival/i);
  assert.match(story.rightPage, /invisible hands.{0,40}took human form/i);
  assert.doesNotMatch(story.rightPage, /spellbound court returned to life/i);
  assert.match(story.country, /Adapted from Pedroso/i);
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


test('The Trees and the Axe replaces the duplicate imagined-wealth spill fable', () => {
  const stories = loadStories();
  const additions = stories.slice(112);
  const replacement = additions.find(story => story.id === 'the-trees-and-the-axe');

  assert.ok(replacement, 'missing the distinct Greek replacement story');
  assert.equal(replacement.region, 'Ancient Greece');
  assert.match(replacement.country, /Townsend.*Three Hundred.*1867/i);
  assert.match(replacement.leftPage, /young ash/i);
  assert.match(replacement.rightPage, /axe.{0,80}felled|felled.{0,80}axe/i);
  assert.equal(additions.some(story => story.id === 'milk-woman-and-her-pail'), false,
    'the duplicate milk-and-daydream plot must be removed');
  assert.equal(additions.some(story => story.id === 'the-ass-in-the-lions-skin'), false,
    'do not add another appearance-themed story');
  assert.equal(stories.length, 301);
});

test('the gourd-tale caregiver note says the later hat-and-equality scene is retained', () => {
  const story = storyRecord('how-gourds-were-put-in-small-mouthed-pots');
  assert.match(story.summary, /source includes a widowhood threat.{0,80}coerced marriage/i);
  assert.match(story.summary, /omits the (?:threat and )?(?:forced )?marriage/i);
  assert.match(story.summary, /retains the later clever[- ]hat and equality scene/i);
  assert.doesNotMatch(story.summary, /ends before the source’s forced marriage/i);
});

test('the rooster sings when the angels take the sun’s robes and crown from the throne', () => {
  const story = storyRecord('the-sun-and-how-it-was-made-by-divine-will');
  assert.match(story.leftPage, /sun wanes to the West.{0,160}angels.{0,80}(?:robes|garb).{0,80}crown.{0,80}throne/i);
  assert.match(story.rightPage, /angels.{0,80}take.{0,80}crown from the throne.{0,160}rooster awakens/i);
  assert.match(story.rightPage, /rooster.{0,100}(?:sings|singing) in praise of Christ, the Giver of Light/i);
});

test('the Ainu fox story identifies who eats fruit and how the crows drop it', () => {
  const story = storyRecord('the-two-foxes-the-mole-and-the-crows');
  assert.match(story.summary, /foxes eat.{0,80}mulberries and grapes/i);
  assert.match(story.rightPage, /foxes and their companions, the crows,.{0,100}fruit.{0,100}crows drop/i);
  assert.doesNotMatch(story.rightPage, /joined the crows to eat fruit/i);
});

test('Hans in Luck flags the source’s omitted horse fall and cow kick for caregivers', () => {
  const story = storyRecord('hans-in-luck');
  assert.match(story.summary, /Caregiver note:.*horse.{0,60}(?:fall|throws|throwing).{0,100}cow.{0,40}kick/i);
  assert.doesNotMatch(`${story.leftPage} ${story.rightPage}`, /horse.{0,50}(?:threw|fell|fall)|cow.{0,50}kick/i);
});

test('regional source labels avoid unsupported Calabar and Lowland specificity', () => {
  const hippo = storyRecord('affair-of-the-hippopotamus-and-the-tortoise');
  const ropeTortoise = storyRecord('how-the-tortoise-overcame-the-elephant-and-the-hippopotamus');
  const stars = storyRecord('the-stars-in-the-sky');
  assert.match(hippo.country, /^Nigeria; Dayrell,/);
  assert.match(ropeTortoise.country, /^Nigeria; Dayrell,/);
  assert.match(stars.country, /^Scotland; Adapted from Jacobs,/);
  assert.doesNotMatch(`${hippo.country} ${ropeTortoise.country} ${stars.country}`, /Calabar|Lowland/i);
});
