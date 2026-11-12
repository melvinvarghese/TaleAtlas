(() => {
  const failures = [];
  let passed = 0;
  const check = (name, assertion) => {
    try {
      assertion();
      passed += 1;
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
    }
  };
  const equal = (actual, expected, message) => {
    if (actual !== expected) throw new Error(`${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
  };
  const cardCount = () => document.querySelectorAll('#story-grid .story-card').length;
  const search = document.getElementById('search');
  const region = document.getElementById('region-filter');
  const openStoryFromCollection = (title) => {
    const heading = [...document.querySelectorAll('#story-grid h3')]
      .find((candidate) => candidate.textContent === title);
    if (!heading) throw new Error(`missing collection story: ${title}`);
    heading.closest('.story-card').querySelector('[data-read]').click();
  };
  const setSearch = (value) => {
    search.value = value;
    search.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const setRegion = (value) => {
    region.value = value;
    region.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const hasNoHorizontalOverflow = () => document.documentElement.scrollWidth <= document.documentElement.clientWidth;

  check('the 301-story collection is reachable across 16 correctly ordered pages', () => {
    const pageCount = 16;
    const indexes = [];
    for (let page = 1; page <= pageCount; page += 1) {
      const start = (page - 1) * 20;
      const end = Math.min(start + 20, 301);
      equal(document.getElementById('collection-page-status').textContent,
        `Page ${page} of ${pageCount} · Showing ${start + 1}–${end} of 301`, 'collection page status');
      const visibleIndexes = [...document.querySelectorAll('#story-grid [data-read]')]
        .map((button) => Number(button.dataset.read));
      equal(visibleIndexes.length, end - start, 'visible story count');
      indexes.push(...visibleIndexes);
      if (page < pageCount) document.getElementById('collection-next').click();
    }
    equal(indexes.join(','), Array.from({ length: 301 }, (_, index) => index).join(','), 'story order across pages');
    if (!document.getElementById('collection-next').disabled) throw new Error('last collection page still has a next page');
    while (!document.getElementById('collection-prev').disabled) document.getElementById('collection-prev').click();
    equal(document.getElementById('collection-page-status').textContent, 'Page 1 of 16 · Showing 1–20 of 301', 'collection reset to first page');
  });
  check('artwork captions and notes links are absent from the page', () => {
    if (document.querySelector('.story-art figcaption, .page-artwork figcaption, .footer-source-link')) {
      throw new Error('visible artwork captions or notes links remain');
    }
  });
  check('the 20 first-page illustrations stay local, described, and reused in the reader', () => {
    const cards = [...document.querySelectorAll('#story-grid .story-card')];
    equal(cards.length, 20, 'visible story card count');
    for (const [index, card] of cards.entries()) {
      const image = card.querySelector('.story-art img');
      if (!image?.getAttribute('alt')?.trim()) throw new Error(`card ${index} is missing descriptive alt text`);
      if (image.loading !== 'lazy') throw new Error(`card ${index} image is not lazy-loaded`);
      if (!image.getAttribute('src').startsWith('assets/')) throw new Error(`card ${index} image is not served locally`);
      if (card.querySelector('.story-art figcaption, .story-art a')) throw new Error(`card ${index} has a visible artwork caption or notes link`);

      card.querySelector('[data-read]').click();
      const readerImage = document.querySelector('#right-page .page-artwork img');
      if (!readerImage) throw new Error(`story ${index} is missing reader artwork`);
      equal(readerImage.getAttribute('src'), image.getAttribute('src'), `reader image source for story ${index}`);
      equal(readerImage.getAttribute('alt'), image.getAttribute('alt'), `reader image alt text for story ${index}`);
      readerImage.scrollIntoView({ block: 'center' });
      const readerImageHeight = readerImage.getBoundingClientRect().height;
      if (readerImageHeight < 80) throw new Error(`reader image for story ${index} is only ${readerImageHeight}px tall`);
      if (readerImage.closest('figure')?.querySelector('figcaption, a')) throw new Error(`reader story ${index} has a visible artwork caption or notes link`);
      document.getElementById('close-book').click();
    }
  });
  check('stories 33–52 render local illustrations with descriptive alt text in cards and the reader', () => {
    const ids = [
      'the-wolf-and-the-lamb', 'the-ass-and-the-grasshopper', 'the-wolf-and-the-crane',
      'the-father-and-his-sons', 'the-bat-and-the-weasels', 'the-cock-and-the-jewel',
      'the-swallow-and-the-crow', 'the-dog-and-the-shadow', 'hercules-and-the-wagoner',
      'the-mole-and-his-mother', 'the-fawn-and-his-mother', 'the-ass-the-fox-and-the-lion',
      'the-flies-and-the-honey-pot', 'the-farmer-and-the-snake', 'the-man-and-the-lion',
      'the-mountain-in-labor', 'the-bear-and-the-fox', 'the-tortoise-and-the-eagle',
      'the-fox-and-the-goat', 'the-raven-and-the-swan',
    ];
    for (const id of ids) {
      const story = window.TALEATLAS_STORIES.find((candidate) => candidate.id === id);
      if (!story) throw new Error(`missing story: ${id}`);
      setSearch(story.title);
      const card = document.querySelector('#story-grid .story-card');
      const image = card?.querySelector('.story-art img');
      if (!image) throw new Error(`${id} is missing its collection illustration`);
      if (!image.getAttribute('alt')?.trim() || image.getAttribute('alt').length < 40) {
        throw new Error(`${id} is missing descriptive alt text`);
      }
      equal(image.getAttribute('src'), `assets/${id}.webp`, `${id} collection image`);
      if (card.querySelector('.story-art figcaption, .story-art a')) throw new Error(`${id} has a caption or artwork-notes link`);
      card.querySelector('[data-read]').click();
      const readerImage = document.querySelector('#right-page .page-artwork img');
      if (!readerImage) throw new Error(`${id} is missing its reader illustration`);
      equal(readerImage.getAttribute('src'), image.getAttribute('src'), `${id} reader image source`);
      equal(readerImage.getAttribute('alt'), image.getAttribute('alt'), `${id} reader image alt text`);
      if (readerImage.closest('figure')?.querySelector('figcaption, a')) throw new Error(`${id} has a reader caption or artwork-notes link`);
      document.getElementById('close-book').click();
    }
    setSearch('');
  });
  check('a text-only story opens with its source note and no illustration', () => {
    document.getElementById('open-book').click();
    document.getElementById('next').click();
    document.querySelector('#right-page [data-story="32"]').click();
    if (document.querySelector('#right-page .page-artwork img')) throw new Error('text-only story shows artwork');
    if (!document.querySelector('#left-page .page-text p')?.textContent.trim()) throw new Error('first story page is empty');
    if (!document.querySelector('#right-page .page-text p')?.textContent.trim()) throw new Error('second story page is empty');
    if (!document.querySelector('#left-page .page-meta')?.textContent.includes(';')) throw new Error('source/version note is not visible in the reader');
    document.getElementById('close-book').click();
    document.getElementById('open-book').click();
    document.getElementById('prev').click();
    document.getElementById('close-book').click();
  });
  check('the production homepage fits the narrow viewport without horizontal scrolling', () => {
    if (window.innerWidth > 700) throw new Error(`expected responsive viewport, got ${window.innerWidth}px`);
    if (!hasNoHorizontalOverflow()) throw new Error(`page is ${document.documentElement.scrollWidth}px wide at ${document.documentElement.clientWidth}px`);
  });

  setRegion('East Asia');
  check('region filter reports the 62 matching East Asian stories', () => {
    equal(cardCount(), 20, 'visible filtered card count');
    equal(document.getElementById('story-count').textContent, '62 of 301 stories', 'filtered story count');
    equal(document.getElementById('collection-page-status').textContent, 'Page 1 of 4 · Showing 1–20 of 62', 'filtered collection page status');
  });

  setSearch('Momotaro');
  check('search and region filters combine without dropping either constraint', () => {
    equal(cardCount(), 1, 'combined filter count');
    equal(document.querySelector('#story-grid h3')?.textContent, 'Momotaro, the Peach Boy', 'combined filter result');
  });

  setSearch('');
  setRegion('all');
  setSearch('Anansi');
  check('search narrows the library and announces its result count', () => {
    equal(cardCount(), 2, 'search card count');
    equal(document.getElementById('story-count').textContent, '2 of 301 stories', 'search count');
  });

  setSearch('no such folktale');
  check('an empty search gives a clear empty state', () => {
    equal(cardCount(), 0, 'empty search card count');
    if (!document.getElementById('story-grid').textContent.includes('No stories found')) {
      throw new Error('missing empty-state guidance');
    }
  });

  setSearch('');
  setRegion('all');
  check('clicking a region label filters matching stories and reports the count', () => {
    const europe = [...document.querySelectorAll('#story-grid [data-filter="region"]')]
      .find((button) => button.dataset.value === 'Europe');
    if (!europe) throw new Error('missing clickable Europe label');
    europe.click();
    equal(cardCount(), 20, 'visible Europe card count');
    equal(document.getElementById('story-count').textContent, '64 of 301 stories', 'region result count');
    equal(document.querySelector('#story-grid [data-filter="region"]')?.getAttribute('aria-pressed'), 'true', 'active region state');
  });

  check('clicking a theme combines with the region filter and describes active filters', () => {
    const community = [...document.querySelectorAll('#story-grid [data-filter="theme"]')]
      .find((button) => button.dataset.value === 'Community');
    if (!community) throw new Error('missing clickable Community label');
    community.click();
    equal(cardCount(), 1, 'combined region and theme count');
    equal(document.querySelector('#story-grid h3')?.textContent, 'Stone Soup', 'combined filter story');
    equal(document.querySelector('#story-grid [data-filter="theme"]')?.getAttribute('aria-pressed'), 'true', 'active theme state');
    const summary = document.getElementById('active-filter-text').textContent;
    if (!summary.includes('Region: Europe') || !summary.includes('Theme: Community')) {
      throw new Error(`active filter summary is incomplete: ${summary}`);
    }
  });

  check('clicking an active theme label toggles that theme filter off', () => {
    document.querySelector('#story-grid [data-filter="theme"]').click();
    equal(cardCount(), 20, 'visible Europe stories after clearing theme');
    equal(document.querySelector('#story-grid [data-filter="theme"]')?.getAttribute('aria-pressed'), 'false', 'cleared theme state');
  });

  check('country labels group stories with the same country despite provenance notes', () => {
    const germany = [...document.querySelectorAll('#story-grid [data-filter="country"]')]
      .find((button) => button.dataset.value === 'Germany');
    if (!germany) throw new Error('missing clickable Germany label');
    germany.click();
    equal(cardCount(), 8, 'Germany card count');
    equal([...document.querySelectorAll('#story-grid h3')].map((heading) => heading.textContent).join('|'),
      'The Bremen Town Musicians|The Magic Porridge Pot|The Fisherman and His Wife|Hans in Luck|Jorinda and Jorindel|The Queen Bee|The Golden Goose|The Elves and the Shoemaker', 'Germany stories');
  });

  check('clear filters resets metadata, search, and the existing region dropdown', () => {
    setSearch('Bremen');
    setRegion('Europe');
    equal(cardCount(), 1, 'combined filters before clearing');
    const clear = document.getElementById('clear-filters');
    if (!clear || clear.hidden) throw new Error('clear filters control is not visible');
    clear.click();
    equal(cardCount(), 20, 'visible cards after clearing');
    equal(document.getElementById('story-count').textContent, '301 stories', 'total story count after clearing');
    equal(document.getElementById('collection-page-status').textContent, 'Page 1 of 16 · Showing 1–20 of 301', 'pagination after clearing');
    equal(search.value, '', 'search after clearing');
    equal(region.value, 'all', 'region dropdown after clearing');
    if (!document.getElementById('active-filters').hidden) throw new Error('active filter summary remains visible');
  });

  setSearch('Bremen');
  setRegion('Europe');
  openStoryFromCollection('The Bremen Town Musicians');
  check('the story reader exposes region, country, and theme as named filter buttons', () => {
    for (const type of ['region', 'country', 'theme']) {
      const control = document.querySelector(`#left-page [data-filter="${type}"]`);
      if (!control) throw new Error(`missing reader ${type} filter`);
      equal(control.tagName, 'BUTTON', `${type} control element`);
      if (!control.getAttribute('aria-label')?.startsWith('Filter by ')) {
        throw new Error(`${type} filter has no accessible name`);
      }
    }
  });

  check('the reader region action closes the book, preserves search and dropdown, and focuses the collection', () => {
    document.querySelector('#left-page [data-filter="region"]').click();
    if (!document.getElementById('reader').classList.contains('hidden')) throw new Error('reader is still open');
    equal(search.value, 'Bremen', 'search after reader filter');
    equal(region.value, 'Europe', 'region dropdown after reader filter');
    equal(cardCount(), 1, 'region-filtered story count');
    equal(document.activeElement.id, 'collection-title', 'focus after reader filter');
    if (!document.getElementById('active-filter-text').textContent.includes('Region: Europe')) {
      throw new Error('reader region filter is not shown in the active summary');
    }
  });

  check('the reader country action filters by the normalized label and retains provenance', () => {
    setSearch('Germany');
    openStoryFromCollection('The Magic Porridge Pot');
    const countryButton = document.querySelector('#left-page [data-filter="country"]');
    equal(countryButton.textContent, 'Germany', 'normalized reader country label');
    if (!document.querySelector('#left-page .page-meta').textContent.includes('; a version collected by the Brothers Grimm')) {
      throw new Error('reader country provenance is not visible beside its filter button');
    }
    countryButton.click();
    if (!document.getElementById('reader').classList.contains('hidden')) throw new Error('reader is still open');
    equal(search.value, 'Germany', 'search after reader country filter');
    equal(region.value, 'Europe', 'region dropdown after reader country filter');
    equal(cardCount(), 8, 'country-filtered story count');
    const titles = [...document.querySelectorAll('#story-grid h3')].map((heading) => heading.textContent).join(' | ');
    equal(titles, 'The Bremen Town Musicians | The Magic Porridge Pot | The Fisherman and His Wife | Hans in Luck | Jorinda and Jorindel | The Queen Bee | The Golden Goose | The Elves and the Shoemaker', 'normalized country results');
    equal(document.activeElement.id, 'collection-title', 'focus after reader country filter');
    if (!document.getElementById('active-filter-text').textContent.includes('Country: Germany')) {
      throw new Error('reader country filter is not shown in the active summary');
    }
  });

  check('the reader theme action applies its filter and closes the book', () => {
    openStoryFromCollection('The Bremen Town Musicians');
    document.querySelector('#left-page [data-filter="theme"]').click();
    if (!document.getElementById('reader').classList.contains('hidden')) throw new Error('reader is still open');
    equal(search.value, 'Germany', 'search after reader theme filter');
    equal(region.value, 'Europe', 'region dropdown after reader theme filter');
    equal(cardCount(), 1, 'theme-filtered story count');
    if (!document.getElementById('active-filter-text').textContent.includes('Theme: Friendship')) {
      throw new Error('reader theme filter is not shown in the active summary');
    }
  });

  document.getElementById('clear-filters').click();
  document.getElementById('close-book').click();

  const contentsButton = document.getElementById('open-book');
  contentsButton.focus();
  contentsButton.click();
  check('opening the reader moves focus to its heading', () => equal(document.activeElement.id, 'reader-title', 'focused element'));

  const firstContentsEntry = document.querySelector('#right-page [data-story="0"]');
  firstContentsEntry.focus();
  firstContentsEntry.click();
  check('selecting a contents entry opens the story and focuses its heading', () => {
    equal(document.getElementById('reader-title').textContent, 'The Lion and the Mouse', 'reader title');
    equal(document.activeElement.id, 'reader-title', 'focused element after selecting a story');
  });
  check('the open book fits a narrow viewport without horizontal scrolling', () => {
    if (!hasNoHorizontalOverflow()) throw new Error(`reader is ${document.documentElement.scrollWidth}px wide at ${document.documentElement.clientWidth}px`);
  });

  search.focus();
  search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  check('Escape in the search field leaves the reader open', () => {
    if (document.getElementById('reader').classList.contains('hidden')) throw new Error('reader closed while the search field had focus');
  });

  search.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  check('arrow keys in the search field do not turn reader pages', () => equal(document.getElementById('reader-title').textContent, 'The Lion and the Mouse', 'reader title'));

  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  check('arrow keys outside form fields still advance the reader', () => equal(document.getElementById('reader-title').textContent, 'The Monkey and the Crocodile', 'reader title'));

  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  check('Escape closes the reader and restores focus to its opener', () => {
    if (!document.getElementById('reader').classList.contains('hidden')) throw new Error('reader is still open');
    equal(document.activeElement.id, 'open-book', 'restored focus target');
  });

  let result = document.getElementById('test-result');
  if (!result) {
    result = document.createElement('pre');
    result.id = 'test-result';
    document.body.appendChild(result);
  }
  result.dataset.status = failures.length ? 'failed' : 'passed';
  result.textContent = failures.length ? `${passed} passed; ${failures.length} failed\n${failures.join('\n')}` : `${passed} passed; 0 failed`;
})();
