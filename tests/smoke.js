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

  check('production page renders all 12 stories', () => equal(cardCount(), 12, 'card count'));
  check('artwork captions and notes links are absent from the page', () => {
    if (document.querySelector('.story-art figcaption, .page-artwork figcaption, .footer-source-link')) {
      throw new Error('visible artwork captions or notes links remain');
    }
  });
  check('all 12 story illustrations are local, described, and reused in the reader', () => {
    const cards = [...document.querySelectorAll('#story-grid .story-card')];
    equal(cards.length, 12, 'story card count');
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
  check('the production homepage fits the narrow viewport without horizontal scrolling', () => {
    if (window.innerWidth > 700) throw new Error(`expected responsive viewport, got ${window.innerWidth}px`);
    if (!hasNoHorizontalOverflow()) throw new Error(`page is ${document.documentElement.scrollWidth}px wide at ${document.documentElement.clientWidth}px`);
  });

  setRegion('Asia');
  check('region filter reports the four matching Asian stories', () => {
    equal(cardCount(), 4, 'filtered card count');
    equal(document.getElementById('story-count').textContent, '4 of 12 stories', 'visible story count');
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
    equal(cardCount(), 1, 'search card count');
    equal(document.getElementById('story-count').textContent, '1 of 12 stories', 'search count');
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
    equal(cardCount(), 4, 'Europe card count');
    equal(document.getElementById('story-count').textContent, '4 of 12 stories', 'region result count');
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
    equal(cardCount(), 4, 'Europe stories after clearing theme');
    equal(document.querySelector('#story-grid [data-filter="theme"]')?.getAttribute('aria-pressed'), 'false', 'cleared theme state');
  });

  check('country labels group stories with the same country despite provenance notes', () => {
    const germany = [...document.querySelectorAll('#story-grid [data-filter="country"]')]
      .find((button) => button.dataset.value === 'Germany');
    if (!germany) throw new Error('missing clickable Germany label');
    germany.click();
    equal(cardCount(), 3, 'Germany card count');
    equal([...document.querySelectorAll('#story-grid h3')].map((heading) => heading.textContent).join('|'),
      'The Bremen Town Musicians|The Magic Porridge Pot|The Fisherman and His Wife', 'Germany stories');
  });

  check('clear filters resets metadata, search, and the existing region dropdown', () => {
    setSearch('Bremen');
    setRegion('Europe');
    equal(cardCount(), 1, 'combined filters before clearing');
    const clear = document.getElementById('clear-filters');
    if (!clear || clear.hidden) throw new Error('clear filters control is not visible');
    clear.click();
    equal(cardCount(), 12, 'card count after clearing');
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
    equal(cardCount(), 3, 'country-filtered story count');
    const titles = [...document.querySelectorAll('#story-grid h3')].map((heading) => heading.textContent).join(' | ');
    equal(titles, 'The Bremen Town Musicians | The Magic Porridge Pot | The Fisherman and His Wife', 'normalized country results');
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

  const contentsButton = document.getElementById('contents-top');
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
    equal(document.activeElement.id, 'contents-top', 'restored focus target');
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
