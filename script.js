(() => {
  const stories = window.TALEATLAS_STORIES || [];
  const $ = (id) => document.getElementById(id);
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));

  const artwork = {
    'lion-mouse': {
      alt: 'A small mouse gnaws through the rope net holding a tawny lion in a sunlit forest clearing.'
    },
    'monkey-crocodile': {
      alt: 'A clever monkey sits safely in a fruit tree above a crocodile waiting at the riverbank.'
    },
    momotaro: {
      alt: 'An elderly Japanese couple discover a cheerful baby nestled inside a giant peach beside a stream.'
    },
    'anansi-wisdom': {
      alt: 'Anansi, a small eight-legged spider, climbs a tree with a round clay pot tied in front.'
    },
    'tortoise-hare': {
      alt: 'A steady tortoise nears a woodland finish line while a hare naps beneath a tree.'
    },
    'stone-soup': {
      alt: 'Travellers and villagers gather around a steaming pot as vegetables are added to make soup.'
    },
    'bremen-musicians': {
      alt: 'A donkey, dog, cat, and rooster stand together outside a quiet woodland cottage at night.'
    },
    'boy-wolf': {
      alt: 'A young shepherd watches his flock on a green hillside as a wolf approaches in the distance.'
    },
    'porridge-pot': {
      alt: 'A small enchanted pot overflows with golden porridge from a cottage doorway into the village street.'
    },
    'fisherman-wife': {
      alt: 'A fisherman releases a shimmering fish into a blue-grey sea near a humble cottage.'
    },
    'clever-rabbit': {
      alt: 'A small rabbit leads a roaring lion toward a deep stone well in a leafy forest.'
    },
    'grateful-crane': {
      alt: 'A red-crowned white crane works at a wooden loom in a quiet snowy cottage.'
    }
  };

  let current = -1;
  let returnFocus = null;
  let turnTimer;

  function scrollTo(element) {
    element.scrollIntoView({
      behavior: reduceMotion() ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  function openReader(index = -1) {
    returnFocus = document.activeElement;
    $('welcome').classList.add('hidden');
    $('reader').classList.remove('hidden');
    current = index;
    render(false);
    scrollTo($('reader'));
    $('reader-title').focus({ preventScroll: true });
  }

  function closeReader({ restoreFocus = true } = {}) {
    if ($('reader').classList.contains('hidden')) return;
    $('reader').classList.add('hidden');
    $('welcome').classList.remove('hidden');
    const target = returnFocus && returnFocus.isConnected ? returnFocus : $('contents-top');
    returnFocus = null;
    if (restoreFocus) {
      target.focus({ preventScroll: true });
      scrollTo(target);
    }
  }

  function artworkMarkup(story, className) {
    const image = artwork[story.id];
    if (!image) return '';
    return `<figure class="${className}">
      <img src="assets/${esc(story.id)}.webp" alt="${esc(image.alt)}" width="1600" height="1067" loading="lazy" decoding="async">
    </figure>`;
  }

  function renderContents() {
    $('reader-title').textContent = 'Contents';
    $('left-page').innerHTML = `
      <div class="page-label">Welcome, reader</div>
      <h2 class="page-title">A world inside these pages</h2>
      <div class="page-text">
        <p>Every tale is a little doorway into another place and time. Meet clever animals, brave companions, and people who learn something important along the way.</p>
        <p>Choose a story from the contents, or turn the page to begin your journey.</p>
      </div>
      <span class="folio">i</span>`;

    $('right-page').innerHTML = `
      <div class="page-label">In this book</div>
      <h2 class="page-title">Contents</h2>
      <ol class="contents-list">${stories.map((story, index) => `
        <li><button type="button" data-story="${index}">${esc(story.title)}<small>${esc(story.country)} · ${esc(story.readingTime)}</small></button></li>`).join('')}
      </ol>
      <span class="folio">ii</span>`;

    $('right-page').querySelectorAll('[data-story]').forEach((button) => {
      button.addEventListener('click', () => go(Number(button.dataset.story)));
    });
    $('page-counter').textContent = `${stories.length} stories · Contents`;
    $('prev').disabled = true;
    $('next').disabled = !stories.length;
    $('next').textContent = 'Begin reading';
  }

  function renderStory() {
    const story = stories[current];
    $('reader-title').textContent = story.title;
    $('left-page').innerHTML = `
      <div class="page-label">${esc(story.region)} · ${esc(story.theme)}</div>
      <h2 class="page-title">${esc(story.title)}</h2>
      <p class="page-meta">${esc(story.country)} · ${esc(story.readingTime)} read</p>
      <div class="page-text"><p>${esc(story.leftPage)}</p></div>
      <span class="folio">${String(current * 2 + 1).padStart(2, '0')}</span>`;

    $('right-page').innerHTML = `
      <div class="page-label">The tale continues</div>
      <div class="page-text"><p>${esc(story.rightPage)}</p></div>
      ${artworkMarkup(story, 'page-artwork')}
      <div class="lesson"><strong>A thought to keep</strong><p>${esc(story.moral)}</p></div>
      <span class="folio">${String(current * 2 + 2).padStart(2, '0')}</span>`;

    $('page-counter').textContent = `Story ${current + 1} of ${stories.length}`;
    $('prev').disabled = false;
    $('next').disabled = false;
    $('next').textContent = current === stories.length - 1 ? 'Back to contents' : 'Next story';
  }

  function render(animate = true) {
    const pageTurn = $('page-turn');
    if (turnTimer) window.clearTimeout(turnTimer);
    pageTurn.classList.remove('turning');
    if (animate && !reduceMotion()) {
      void pageTurn.offsetWidth;
      pageTurn.classList.add('turning');
      turnTimer = window.setTimeout(() => pageTurn.classList.remove('turning'), 640);
    }
    if (current < 0) renderContents();
    else renderStory();
  }

  function go(index) {
    if (!Number.isInteger(index) || index < 0 || index >= stories.length) return;
    current = index;
    render(true);
    scrollTo($('reader'));
    $('reader-title').focus({ preventScroll: true });
  }

  function nextPage() {
    if (current < 0) current = 0;
    else if (current >= stories.length - 1) current = -1;
    else current += 1;
    render(true);
  }

  function previousPage() {
    if (current <= 0) current = -1;
    else current -= 1;
    render(true);
  }

  function matchesRegion(story, region) {
    if (region === 'all') return true;
    const place = `${story.region} ${story.country}`;
    if (region === 'Asia') return /asia|india|japan/i.test(place);
    if (region === 'Africa') return /africa|ghana|akan/i.test(place);
    if (region === 'Europe') return /europe|germany/i.test(place);
    return region === 'Ancient Greece' && /ancient greece/i.test(story.region);
  }

  function renderCards() {
    const query = $('search').value.trim().toLowerCase();
    const region = $('region-filter').value;
    const filtered = stories.map((story, index) => ({ ...story, index })).filter((story) => {
      const searchable = `${story.title} ${story.region} ${story.country} ${story.theme} ${story.summary}`.toLowerCase();
      return searchable.includes(query) && matchesRegion(story, region);
    });

    const activeFilters = query.length > 0 || region !== 'all';
    $('story-count').textContent = activeFilters
      ? `${filtered.length} of ${stories.length} stories`
      : `${stories.length} stories`;

    $('story-grid').innerHTML = filtered.length
      ? filtered.map((story) => {
        const image = artwork[story.id];
        return `<article class="story-card${image ? ' story-card--illustrated' : ''}">
          ${artworkMarkup(story, 'story-art')}
          <div class="story-copy">
            <p class="story-region">${esc(story.region)}</p>
            <h3 id="story-title-${story.index}">${esc(story.title)}</h3>
            <p class="story-summary">${esc(story.summary)}</p>
            <div class="card-bottom">
              <span class="theme-label">${esc(story.theme)}</span>
              <button class="read-link" type="button" data-read="${story.index}" aria-labelledby="read-label-${story.index} story-title-${story.index}"><span id="read-label-${story.index}">Read story</span></button>
            </div>
          </div>
        </article>`;
      }).join('')
      : '<p class="empty" role="status">No stories found. Try a different search or choose another region.</p>';

    $('story-grid').querySelectorAll('[data-read]').forEach((button) => {
      button.addEventListener('click', () => openReader(Number(button.dataset.read)));
    });
  }

  $('open-book').addEventListener('click', () => openReader());
  $('cover-stage').addEventListener('click', () => openReader());
  $('contents-top').addEventListener('click', () => openReader());
  $('close-book').addEventListener('click', () => closeReader());
  $('brand-home').addEventListener('click', (event) => {
    event.preventDefault();
    closeReader({ restoreFocus: false });
    window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    $('brand-home').focus({ preventScroll: true });
  });
  $('about-button').addEventListener('click', () => $('about-dialog').showModal());
  $('about-close').addEventListener('click', () => $('about-dialog').close());
  $('about-dialog').addEventListener('close', () => $('about-button').focus({ preventScroll: true }));
  $('about-dialog').addEventListener('click', (event) => {
    if (event.target === $('about-dialog')) $('about-dialog').close();
  });
  $('prev').addEventListener('click', previousPage);
  $('next').addEventListener('click', nextPage);
  $('search').addEventListener('input', renderCards);
  $('region-filter').addEventListener('change', renderCards);

  document.addEventListener('keydown', (event) => {
    if ($('reader').classList.contains('hidden') || $('about-dialog').open) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || target.matches('input, textarea, select, [role="textbox"]'))) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextPage();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previousPage();
    } else if (event.key === 'Escape') {
      closeReader();
    }
  });

  renderCards();
})();
