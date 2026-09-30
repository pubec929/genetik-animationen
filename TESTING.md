# Animation regression tests

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

The suite runs 70 tests across every animation at desktop and mobile sizes. It checks SVG rendering and accessible descriptions, every labeled stage and cycle restart, pause/resume, all three speeds, every term explanation, reduced-motion startup, hidden-document behavior, and resizing while paused. Script errors, invalid SVG values, console errors, and failed HTTP responses fail tests.

Tests control only the browser's requestAnimationFrame scheduler. They invoke production callbacks every 50 ms and interact with the actual controls; they do not expose or modify the animation's internal state. Expected stages and timings are independent fixtures in `tests/animations.spec.js`. Update them when intentionally changing the educational sequence. Pixel-perfect visual appearance and biological accuracy still require review.

GitHub Actions runs the suite on pushes and pull requests. Failure traces are uploaded as `animation-test-results`; download a trace and open it with `npx playwright show-trace path/to/trace.zip`. Configure the `animations` job as a required branch check if merges must be blocked by test failures.

Runner configuration follows the [Playwright configuration documentation](https://playwright.dev/docs/test-configuration).
