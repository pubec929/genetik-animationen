# Genetik in Bewegung

A static, German-language learning website with six interactive SVG learning pages and an exercise for transcription and translation.

## Project layout

```text
src/
  pages/                 HTML pages
  js/
    animations/          Page renderers and bundled DNA atomic data
    exercises/           Interactive exercise logic
    site.js              Shared navigation behavior
    theme.js             Early theme initialization and switching
  styles/
    animations/          Styles for individual animation scenes
    exercises/           Exercise layout and feedback styles
    site.css             Shared layout, controls, and themes
  assets/images/         SVG illustrations and favicon
scripts/
  build.js               Creates the deployable website
  serve.js               Serves the generated website locally
tests/
  e2e/                   Playwright browser regression tests
docs/
  README.md              Documentation index and guides for all eight pages
  project.md             Architecture, shared behavior, and deployment
  animations.md          Shared playback and rendering conventions
  testing.md             Test setup and coverage
dist/                    Generated output, ignored by Git
.github/workflows/       CI tests and GitHub Pages deployment
```

## Local development

Use Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Open <http://127.0.0.1:4173>. Edit files in `src/`, then restart `npm run dev` to rebuild. The server serves `dist/`, so opening source HTML directly is not the supported preview workflow.

## Build and deployment

```sh
npm run build
```

The build copies assets into `dist/assets/` and generates HTML at the root of `dist/`. Existing URLs such as `index.html` and `rna-spleissen.html` stay the same. All local asset references receive content-based cache versions automatically. Relative paths support GitHub Pages project subdirectories.

GitHub Actions builds and deploys only `dist/`. Do not edit generated files or publish the repository root. Animation scripts use `defer` to initialize after their HTML exists; the theme script runs early to apply the saved theme before rendering. The Umami snippet is included on all public pages.

## Tests

```sh
npx playwright install chromium
npm test
```

See [testing instructions](docs/testing.md) for coverage, browser setup, and debugging.

## Documentation

Start with the [documentation index](docs/README.md) or the [project guide](docs/project.md).

| Page | Guide |
| --- | --- |
| Homepage | [Navigation and collection](docs/homepage.md) |
| DNA model | [Zoom, atomic data, and regeneration](docs/dna-model.md) |
| DNA replication | [Fork and protein interactions](docs/dna-replication.md) |
| mRNA translation | [Ribosome and peptide growth](docs/mrna-translation.md) |
| RNA splicing | [Intron removal and exon joining](docs/rna-splicing.md) |
| Prokaryotic protein synthesis | [Coupled transcription and translation](docs/prokaryotic-protein-synthesis.md) |
| Eukaryotic protein synthesis | [Processing, export, and translation](docs/eukaryotic-protein-synthesis.md) |
| Exercise | [Inputs, live previews, and feedback](docs/protein-synthesis-exercise.md) |

The [shared animation guide](docs/animations.md) explains playback behavior. Python is only needed when regenerating DNA coordinates; normal development and deployment use the checked-in JavaScript data.
