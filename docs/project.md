# Project guide

[Documentation index](README.md)

## Purpose and architecture

Genetik in Bewegung is a German-language genetics learning website for individual study and classroom presentation. Its eight public pages comprise a homepage, five timed SVG animations, an interactive DNA model, and a transcription/translation exercise.

The site uses plain HTML, CSS, and JavaScript. Each learning page owns its rendering and interaction logic; there is no application framework, backend, database, or client-side router. Navigation loads separate HTML documents. The drawings are educational models with simplified sizes, sequences, and timing.

## Source and generated files

| Location | Responsibility |
| --- | --- |
| `src/pages/` | Public HTML documents and their local asset references |
| `src/js/site.js` | Responsive navigation menu |
| `src/js/theme.js` | Early theme selection and theme controls |
| `src/js/animations/` | Page-specific SVG renderers, including DNA atom templates |
| `src/js/exercises/` | Exercise tasks, answer validation, and live previews |
| `src/styles/site.css` | Shared layout, typography, theme variables, and navigation |
| `src/styles/animations/`, `src/styles/exercises/` | Page-specific presentation |
| `src/assets/images/` | SVG illustrations and favicon |
| `scripts/` | Static build and preview server |
| `tests/` | Node build checks and Playwright browser checks |
| `dist/` | Generated deployment output; ignored by Git |

Edit `src/` for website changes. The root-level `dna_model.html` is a standalone design reference and is not copied into the published site. The DNA atom templates used by the public page live in its animation script; see the [DNA guide](dna-model.md).

## Development commands

Use Node.js 22 or newer. Run commands from the repository root:

```sh
npm ci
npm run dev
```

The preview is available at <http://127.0.0.1:4173>. `dev` builds once and starts the server; it does not watch source files. Restart it after edits, or run `npm run build` and reload the already-running preview.

| Command | Effect |
| --- | --- |
| `npm run build` | Recreates `dist/` from source |
| `npm run dev` / `npm run preview` | Builds and serves `dist/` locally |
| `npm run test:build` | Rebuilds and validates output and asset references |
| `npm test` | Runs build and desktop/mobile browser checks, including visual comparisons |
| `npm run test:visual` | Builds and compares fixed scenes with reviewed screenshot baselines |
| `npm run test:ui` | Opens the Playwright test interface |

Install Chromium with `npx playwright install chromium`, or use the executable override in the [testing guide](testing.md). The DNA model needs no Python generation step.

## Build and deployment

[`scripts/build.js`](../scripts/build.js) copies JavaScript, CSS, and images into `dist/assets/`, then emits every source HTML page at the root of `dist/`. It appends content hashes to local HTML asset references. Use relative `assets/...` and page URLs so the output also works beneath a GitHub Pages project path.

[`scripts/serve.js`](../scripts/serve.js) serves only generated HTML, JavaScript, CSS, and SVG on `127.0.0.1:4173`. Unsupported or missing paths return 404. Preview through this server rather than opening source HTML directly.

[The test workflow](../.github/workflows/tests.yml) runs on pushes and pull requests. [The Pages workflow](../.github/workflows/static.yml) independently builds and publishes `dist/` on pushes to `main` or manual dispatch. Deployment currently has no dependency on the test job, so passing tests is a contributor responsibility rather than an enforced deployment gate. Failure traces are retained for seven days.

## Shared interface and state

The header, navigation links, and footer are repeated in each HTML document. Update all affected pages when changing their markup. `site.js` opens the mobile menu and closes it on navigation, outside clicks, or Escape; Escape also restores focus to the toggle.

`theme.js` runs before styles to apply the saved `genetik-theme` preference from local storage. Without a saved choice it follows the system color scheme. It handles cross-tab changes and restored pages, and continues working if storage is unavailable. Use shared CSS variables for readable light and dark themes.

Animation playback, selections, and exercise answers live in page memory and reset on reload. The exercise checks answers locally. Each public page includes the Umami analytics script; browser tests stub that request. The molecular model uses local atom templates and does not fetch coordinates at runtime.

## Accessibility and motion

Keep German labels, native buttons and form controls, skip links, SVG titles/descriptions, and visible keyboard focus. Test the responsive menu and page controls with the keyboard. The five timed animations initially pause when reduced motion is requested; users can start them explicitly. DNA zoom and live base insertion also respect reduced motion. See [animation behavior](animations.md) for playback details.

## Adding or changing a page

1. Add or update the HTML, external page script, and styles under `src/`. Load interactive scripts with `defer` and retain early theme initialization.
2. Update the homepage cards, shared navigation, and relevant previous/next links. Keep public URLs stable when possible.
3. For a new page, update the explicit page lists in `tests/build.test.js` and `tests/e2e/theme.spec.js`, plus suitable interaction tests.
4. Add its guide to the [documentation index](README.md). Document teaching assumptions and source data alongside behavior.
5. Run focused checks, then inspect desktop/mobile rendering in both themes. Follow [repository conventions](../AGENTS.md) when preparing a commit or PR.
