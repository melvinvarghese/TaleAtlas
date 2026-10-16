# TaleAtlas: World Folktales for Kids

TaleAtlas is a free, growing collection of child-friendly world folktales, presented as an illustrated storybook. Read 12 traditional tales retold in fresh wording, explore by title, place, theme, or region, and follow each story in a two-page reader.

[Visit TaleAtlas](https://melvinvarghese.github.io/TaleAtlas/)

## Features

- An illustrated storybook cover and two-page reading spreads with page-turn animation.
- 12 child-friendly retellings of traditional tales from different regions.
- A contents page and story cards, with search and region filters for Africa, Asia, Europe, and Ancient Greece.
- Reader controls for previous and next stories, plus left and right arrow-key navigation.
- A responsive layout for phones and computers.

## Run locally

Clone or download the repository, then open `index.html` in a browser. The site is built with HTML, CSS, and JavaScript; it needs no package installation, build step, or database. Google Fonts are optional, with fallback fonts available.

## Publish with GitHub Pages

1. Keep `index.html`, `styles.css`, `script.js`, `stories.js`, and the asset files at the repository root.
2. Push the files to the `main` branch of your GitHub repository.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/(root)`. Save your settings.
5. After deployment, open the Pages URL shown in GitHub.

## Project files

- `index.html` — page content and structure.
- `styles.css` — visual styling and responsive layout.
- `stories.js` — story text and details.
- `script.js` — story cards, search, filters, and reader controls.
- `cover.svg` and `favicon.svg` — site artwork and icon.

## Add a story

In `stories.js`, add an object to the story array, following an existing entry. Each story needs a unique `id` and the fields `title`, `region`, `country`, `theme`, `readingTime`, `summary`, `moral`, `leftPage`, and `rightPage`. If you add a region filter, also update the options in `index.html` and the matching logic in `script.js`.

## Cultural and copyright note

This is a starter collection. Folktales have many versions, and details can vary by community and source. Keep a record of each story's source and provenance, and ask knowledgeable readers to review cultural context and age suitability. Use public-domain source texts or write fresh retellings; modern translations and illustrations may be copyrighted.
