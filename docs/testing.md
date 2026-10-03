# Website regression tests

[Documentation index](README.md) · [Project guide](project.md)

Install Node.js 22 or newer, then run:

```sh
npm ci
npx playwright install chromium
npm test
```

`npm run test:ui` opens Playwright's interactive runner. To use an existing Chromium installation:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/sbin/chromium npm test
```

`npm test` runs build checks, atomic-geometry checks, and browser tests at desktop and mobile sizes. Coverage includes SVG rendering and accessible descriptions, every labeled stage and cycle restart, pause/resume, all three speeds, term explanations, reduced-motion startup, hidden-document behavior, and resizing while paused. The animation fixture also fails on script, console, SVG, and HTTP errors. This describes behavioral coverage, not a measured line-coverage percentage.

Build checks verify public page URLs, local asset references and cache versions, analytics inclusion, and animation script load order. Browser tests run against the generated `dist/` site. The test server automatically builds the site before starting. Umami requests are stubbed in tests to avoid sending test visits to the live analytics dashboard.

Theme tests cover the switch on all public pages, keyboard operation, responsive header layout, readable animation labels, persistence across navigation and reloads, system preferences, cross-tab synchronization, unavailable local storage, delayed script initialization, restored pages, and navigation through actual home/animation links.

Exercise tests cover all three DNA tasks, correct mRNA and polypeptides, the three stop codons, empty and invalid answers, transcription errors carried into translation, correction and reset, all 64 codon-to-amino-acid mappings against an independent standard-code fixture, and entry from the homepage. Expected answers are independent fixtures in `tests/e2e/exercise.spec.js`.

DNA model tests cover component selection, chemical structure explanations, partner selection, strand separation, reset, and both themes. Zoom checks cover intermediate animation frames, atomic elements and bonds, mouse-wheel events, slider keyboard input, and reduced motion. Added regression cases exercise base-pair keyboard navigation, preserve the atomic caption when closing a detail panel while zoomed out, and verify that separation hides hydrogen bonds without modifying the backbone. Run these checks with `npm test -- tests/e2e/dna-modell.spec.js`.

`npm run test:unit` checks the **shipped** atomic coordinates for finite values, valid and unique covalent bonds, two connected strands, one phosphate per base pair, right-handed winding, and three-dimensional proportions. It requires Node only; the Python generator is not run. The [DNA model guide](dna-model.md) documents regeneration and scientific limitations. These invariants catch broken or mirrored geometry but are not a complete chemical validation.

Navigation tests exercise mobile menu keyboard operation, Escape focus restoration, outside clicks, the skip link, and homepage destinations. Additional exercise cases check stale-feedback removal after editing and ensure markup-like input cannot create HTML elements.

## Visual regression checks

```sh
npm run test:visual
```

The visual suite uses `toHaveScreenshot()` to compare against 76 committed PNGs in `tests/e2e/__screenshots__/visual.spec.js/`. Every scenario runs on desktop and mobile, in light and dark themes:

| Area | Captured states |
| --- | --- |
| Homepage | Full page, including loaded card images |
| DNA model | Drawing at zoom 0, 55, and 100; separated strands; guanine chemistry panel |
| Replication | Fragment copying and ligation |
| Translation | Translocation and peptide release |
| Splicing | First reaction/lariat and joined exons |
| Prokaryotic overview | Coupled expression and released proteins |
| Eukaryotic overview | Intron processing and nuclear export |
| Exercise | Entered RNA, selected peptide, and correct-answer feedback |

Animation screenshots advance production frame callbacks to fixed educational stages using `tests/helpers/animation-clock.js`. Other motion is disabled. Visual tests serve bundled Liberation font fixtures locally, normalize body/SVG text fonts, wait for font loading, and make the header non-sticky so it cannot cover a scrolled component capture. These adjustments apply only to visual tests. The separate theme/layout tests exercise the normal site styles.

Generate and compare baselines on Linux using Playwright's Chromium installed from the lockfile (`npm ci`, then `npx playwright install chromium`). The system-browser override remains useful for interaction tests, but a different browser version or platform can change pixel output. The font license is included in `tests/fixtures/fonts/LICENSE`.

Comparisons allow at most 40 differing pixels above a per-pixel color threshold of 0.15. Avoid increasing tolerance to accept an unexplained difference. On failure, inspect the expected, actual, and diff images in `test-results/` and the accompanying trace. CI's existing artifact upload includes these files.

For an intentional visual change, update only the affected scenario, for example:

```sh
npm run test:visual -- --project=desktop --grep 'visual light.*DNA zoom' --update-snapshots
```

Review the changed PNGs against the intended design and biological behavior, then rerun `npm run test:visual` **without** `--update-snapshots`. Commit the reviewed images with the related code change. Do not update snapshots in CI or accept changes solely because the update command passes. To check repeatability after changing screenshot setup, use `npm run test:visual -- --repeat-each=2`.

Animation tests control only the browser's requestAnimationFrame scheduler. They invoke production callbacks every 50 ms and interact with the actual controls; they do not expose or modify the animation's internal state. Expected stages and timings are independent fixtures in `tests/e2e/animations.spec.js`. Update them when intentionally changing the educational sequence. Screenshots catch appearance changes relative to their baselines; choosing scientifically correct baselines still requires review.

GitHub Actions runs the suite on pushes and pull requests. Failure traces are uploaded as `animation-test-results`; download a trace and open it with `npx playwright show-trace path/to/trace.zip`. Configure the `animations` job as a required branch check if merges must be blocked by test failures.

Runner configuration follows the [Playwright configuration documentation](https://playwright.dev/docs/test-configuration).
