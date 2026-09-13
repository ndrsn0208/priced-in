# Priced In

The Priced In website: Bitcoin prediction signals, recorded pricing charts, and an interactive compounding illustration.

This repository contains the public static website and its display data. The prediction API and Claude setup skill are coming soon.

## Local preview

The website has no runtime dependencies. From this directory:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080/.

## Publishing

Deployment target: Cloudflare Pages, connected to this repository's `main` branch. GitHub Pages remains disabled.

Cloudflare build settings:

- Framework preset: **None**.
- Production branch: `main`.
- Build command: `node scripts/build-site.mjs`.
- Build output directory: `dist`.
- Root directory: the repository root.

The build copies only `index.html`, `src/`, and `assets/` into `dist/`. All chart data and fonts are included. No environment variables or API credentials are required by the website.

To prepare the same upload directory locally, run:

```sh
node scripts/build-site.mjs
```

Asset and module paths are relative. The canonical and Open Graph URL will be set to the Cloudflare address when the project is created.

- `index.html`: page metadata and entrypoint.
- `src/app.js` and `src/styles.css`: content and Paper styling.
- `src/charts.js` and `src/math.js`: charts and interactive calculations.
- `src/data.js`: selected recorded curves and summary figures displayed on the page.
- `assets/`: locally hosted fonts, their original licenses, and the favicon.

The return simulator is an illustration using the selected inputs and half-Kelly sizing; it is not realized performance.
