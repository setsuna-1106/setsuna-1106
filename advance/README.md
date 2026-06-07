# Advance dynamic portfolio

This folder is an independent deployable version of the existing site. It does not depend on the root `index.html`, `styles.css`, or `script.js`.

## Run locally

```bash
python3 -m http.server 8080 --directory advance
```

Open `http://localhost:8080`.

## Deploy

Upload the full `advance/` folder to any static host, or configure your server root to point at this directory.

The app is data-driven:

- `data.js` contains profile, projects, notes, matrix, and seed tasks.
- `app.js` renders the UI, filters projects, runs the canvas simulations, and saves local task edits to `localStorage`.
- To connect a backend later, replace `window.siteData` with fetched JSON and keep the render functions mostly unchanged.
