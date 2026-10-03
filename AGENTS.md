# Repository Guidelines

## Project Structure & Module Organization

This is a static, German-language genetics learning website built with HTML, CSS, JavaScript, and SVG.

- `src/pages/`: public HTML pages, including the homepage and proteinbiosynthesis exercise.
- `src/js/`: shared navigation and theme scripts; `animations/` and `exercises/` contain page-specific behavior.
- `src/styles/`: shared `site.css` and corresponding animation/exercise styles.
- `src/assets/images/`: SVG illustrations and favicon.
- `scripts/`: build and local server utilities.
- `tests/build.test.js`: build checks; `tests/e2e/`: browser regression tests.
- `dist/`: generated deployment output, ignored by Git. Edit source files rather than generated files.

## Build, Test, and Development Commands

Use Node.js 22 or newer.

- `npm ci`: install dependencies from the lockfile.
- `npm run dev`: build and serve at `http://127.0.0.1:4173`; restart after source changes to rebuild.
- `npm run build`: generate `dist/` and content-based asset cache versions.
- `npx playwright install chromium`: install the test browser.
- `npm test`: run build checks and desktop/mobile Playwright tests.
- `npm run test:ui`: open the interactive test runner.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/sbin/chromium npm test`: use an existing Chromium installation.

## Coding Style & Naming Conventions

Follow adjacent formatting; use two-space indentation for new readable JavaScript and HTML. JavaScript uses strict-mode IIFEs, `const`/`let`, and semicolons. No formatter or linter is configured.

Use descriptive, lowercase, hyphenated filenames such as `proteinbiosynthese-uebung.html`. Keep scripts and styles external, load page scripts with `defer`, and preserve early theme initialization. Use shared CSS variables for dark mode, relative asset URLs, German interface text, and accessible labels.

## Testing Guidelines

Use Node's built-in test runner for builds and Playwright for interactions. Name browser tests `*.spec.js` under `tests/e2e/`. Run focused checks with `npm test -- tests/e2e/exercise.spec.js`.

For behavior changes, cover relevant input, feedback, reset, keyboard, responsive, and theme behavior. Keep expected educational answers independent of implementation. Review SVG appearance and biological accuracy manually. When adding pages, update page lists in build and theme tests.

## Commit & Pull Request Guidelines

History uses short, descriptive messages such as `added dna model`; no mandatory prefix convention is evident. Keep commits focused. PR descriptions should explain resulting behavior, relevant issues, and validation. Include screenshots for visual changes, preferably desktop/mobile and both themes. Run the relevant tests before submitting runtime changes. GitHub Actions tests pushes and PRs; pushes to `main` also deploy `dist/` to GitHub Pages.
