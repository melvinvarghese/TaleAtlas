// Removes "uncertainty" notes (for example "authorship uncertain", "community
// varies", "version varies") from each story's source line. The place name and
// the real source citation are kept. stories.js itself is not edited.
// Loaded after reading-time.js and before script.js.
(() => {
  const stories = window.TALEATLAS_STORIES || [];

  // A note is dropped if it contains one of these words.
  const uncertain = /\b(?:varies|vary|varying|uncertain|unknown|unclear)\b/i;

  const clean = (country) => {
    const parts = String(country).split(';').map((part) => part.trim());
    const place = parts[0];
    const notes = parts.slice(1)
      // First trim a trailing ", version varies"-style clause inside a note...
      .map((note) => note.replace(/,\s*[^,;]*\b(?:varies|vary|varying|uncertain|unknown|unclear)\b[^,;]*$/i, '').trim())
      // ...then drop any note that is still just an uncertainty note.
      .filter((note) => note && !uncertain.test(note));
    return [place, ...notes].join('; ');
  };

  stories.forEach((story) => {
    if (typeof story.country === 'string' && story.country.includes(';')) {
      story.country = clean(story.country);
    }
  });
})();
