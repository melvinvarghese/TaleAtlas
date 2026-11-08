// Fills in reading times for stories that were added without hand-set values.
// The 12 hand-prepared stories keep the times written in stories.js.
// Loaded after stories.js and before script.js.
(() => {
  const stories = window.TALEATLAS_STORIES || [];

  // Hand-prepared stories whose reading times are kept exactly as written.
  const handSet = new Set([
    'lion-mouse', 'monkey-crocodile', 'momotaro', 'anansi-wisdom',
    'tortoise-hare', 'stone-soup', 'bremen-musicians', 'boy-wolf',
    'porridge-pot', 'fisherman-wife', 'clever-rabbit', 'grateful-crane'
  ]);

  // The 12 hand-set times are 3 or 4 min for stories of roughly 120-140
  // words, which is a slow, storytime pace of about 40 words per minute.
  // The same pace is used for the rest, so a 120-word story reads as 3 min.
  // Raise this number to make every computed time shorter.
  const WORDS_PER_MINUTE = 40;

  const countWords = (text) => (String(text || '').match(/\S+/g) || []).length;

  stories.forEach((story) => {
    if (handSet.has(story.id)) return;
    const words = countWords(story.leftPage) + countWords(story.rightPage);
    const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
    story.readingTime = `${minutes} min`;
  });
})();
