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
  check('four curated story illustrations are local, lazy-loaded, described, and credited', () => {
    const figures = [...document.querySelectorAll('#story-grid .story-art')];
    equal(figures.length, 4, 'illustrated story count');
    for (const figure of figures) {
      const image = figure.querySelector('img');
      if (!image?.getAttribute('alt')?.trim()) throw new Error('image is missing descriptive alt text');
      if (image.loading !== 'lazy') throw new Error('image is not lazy-loaded');
      if (!image.getAttribute('src').startsWith('assets/')) throw new Error('image is not served locally');
      if (!figure.querySelector('figcaption a[href^="https://"]')) throw new Error('image source credit is missing');
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
