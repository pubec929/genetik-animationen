const path = require('node:path');
const { test: base, expect } = require('@playwright/test');

const fontDirectory = path.join(__dirname, '../fixtures/fonts');
const faces = [
  ['Visual Sans', 'LiberationSans-Regular.ttf', 400, 'normal'],
  ['Visual Sans', 'LiberationSans-Bold.ttf', 700, 'normal'],
  ['Segoe UI', 'LiberationSans-Regular.ttf', 400, 'normal'],
  ['Segoe UI', 'LiberationSans-Bold.ttf', 700, 'normal'],
  ['Inter', 'LiberationSans-Regular.ttf', 400, 'normal'],
  ['Inter', 'LiberationSans-Bold.ttf', 700, 'normal'],
  ['Arial', 'LiberationSans-Regular.ttf', 400, 'normal'],
  ['Arial', 'LiberationSans-Bold.ttf', 700, 'normal'],
  ['Georgia', 'LiberationSerif-Regular.ttf', 400, 'normal'],
  ['Georgia', 'LiberationSerif-Italic.ttf', 400, 'italic'],
  ['ui-monospace', 'LiberationMono-Regular.ttf', 400, 'normal'],
];
const fontCSS = faces.map(([family, file, weight, style]) =>
  `@font-face { font-family: '${family}'; src: url('/__visual_fonts/${file}'); font-weight: ${weight}; font-style: ${style}; }`
).join('\n') + `
  body { font-family: 'Visual Sans', sans-serif; }
  svg text { font-family: 'Visual Sans', sans-serif; }
  html { scroll-behavior: auto !important; }
  /* Locator screenshots scroll their target; keep sticky chrome from covering it. */
  .site-header { position: static !important; }
`;

const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
    await page.route('https://cloud.umami.is/**', route => route.fulfill({ body: '' }));
    await page.route('**/__visual_fonts/*.ttf', route => route.fulfill({
      path: path.join(fontDirectory, path.basename(new URL(route.request().url()).pathname)),
      contentType: 'font/ttf',
    }));
    await use(page);
    expect(errors, 'No browser or asset errors in visual scenarios').toEqual([]);
  },
});

async function prepareVisual(page) {
  await page.addStyleTag({ content: fontCSS });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.fonts].map(font => font.load()));
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.mouse.move(0, 0);
}

module.exports = { test, expect, prepareVisual };
