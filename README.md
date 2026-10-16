# TaleAtlas — The World Folktale Book

A free static folktale library designed to feel like opening a classic illustrated storybook. Built with HTML, CSS, and JavaScript for GitHub Pages. No database, paid API, or build step is required.

## Included
- Illustrated-style cover and opening page
- Two-page reading spreads with page-turn animation
- Contents page, story cards, search, and region filters
- Responsive design for phones and computers
- 12 child-friendly retellings of traditional tales

## Publish on GitHub Pages
1. Create a new **public** GitHub repository, for example `taleatlas`.
2. Download and unzip this project.
3. Upload the **files inside** the `taleatlas` folder to the top level of the repository. `index.html` should be visible on the repository's main page. Do not upload only the ZIP.
4. Open **Settings → Pages**.
5. Under Build and deployment, choose **Deploy from a branch**.
6. Choose branch `main` and folder `/ (root)`, then save.
7. Wait a minute or two and open the Pages URL GitHub shows you.

## Add a story
Open `stories.js`, then add another object inside the array. Copy the format of an existing entry. Required fields: `id`, `title`, `region`, `country`, `theme`, `readingTime`, `summary`, `moral`, `leftPage`, and `rightPage`. Use a unique `id` and write retellings in your own wording. The cards and contents list update automatically. If you introduce a new region filter, also update the options in `index.html` and region matching in `script.js`.

## Grow the collection responsibly
1. Add stories in manageable batches, and keep a record of source and provenance.
2. Record alternate names and regional variants instead of presenting one version as definitive.
3. Prefer public-domain source texts or fresh retellings. Modern translations, retellings, and illustrations may be copyrighted.
4. Ask knowledgeable readers to review cultural context, age suitability, and wording.
5. As the collection grows, add tags for country/tradition, theme, age range, and reading time.

This is a starter collection, not yet the world's largest. Folktales vary by community and source; the cultural notes here should be researched and improved as the library expands. Google Fonts is optional; fallback fonts work if it is unavailable.
