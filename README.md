# Priced In

The Priced In website: Bitcoin prediction signals, recorded pricing charts, and an interactive compounding illustration.

**Website:** https://ndrsn0208.github.io/priced-in/

This repository contains the public static website and its display data. The prediction API and Claude setup skill are coming soon.

## Local preview

No dependencies or build step are required. From this directory:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080/.

## Publishing

GitHub Pages publishes the root of `main`. Push website changes to `main` to update the site. Keep asset and module paths relative so the site works under `/priced-in/`.

- `index.html`: page metadata and entrypoint.
- `src/app.js` and `src/styles.css`: content and Paper styling.
- `src/charts.js` and `src/math.js`: charts and interactive calculations.
- `src/data.js`: selected recorded curves and summary figures displayed on the page.
- `assets/`: locally hosted fonts, their original licenses, and the favicon.

The return simulator is an illustration using the selected inputs and half-Kelly sizing; it is not realized performance.
