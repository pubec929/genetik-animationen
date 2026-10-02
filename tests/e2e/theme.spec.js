const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');

const pages = ['index.html', 'proteinbiosynthese-uebung.html', 'dna-modell.html', 'dna-replikation.html', 'mrna-translation.html', 'rna-spleissen.html', 'proteinbiosynthese-prokaryoten.html', 'proteinbiosynthese-eukaryoten.html'];

test.beforeEach(async ({ page, context }) => {
  await context.route('https://cloud.umami.is/**', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
});

for (const file of pages) {
  test(`${file}: switches theme with readable content and no layout overflow`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/' + file);
    const toggle = page.getByRole('button', { name: 'Dunkelmodus', exact: true });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(18, 18, 18)');
    await expect(page.locator('.site-header')).toHaveCSS('background-color', 'rgba(18, 18, 18, 0.96)');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#121212');
    await page.screenshot({ path: test.info().outputPath('dark-mode.png'), fullPage: true });
    if (file !== 'index.html' && file !== 'dna-modell.html' && file !== 'proteinbiosynthese-uebung.html') {
      const scene = page.locator('svg[id$="scene"]');
      await expect(scene).toBeVisible();
      await expect(scene.locator('text').first()).toHaveCSS('fill', 'rgb(238, 238, 238)');
      await page.getByRole('button', { name: 'Weiterlaufen', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
    }
    for (const width of [320, 390, 1024, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(toggle).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const overlap = await page.evaluate(() => {
        const theme = document.querySelector('[data-theme-toggle]').getBoundingClientRect();
        return [...document.querySelectorAll('.brand, .menu-toggle, .site-nav')].some(el => {
          const box = el.getBoundingClientRect();
          return box.width && box.height && theme.left < box.right && theme.right > box.left && theme.top < box.bottom && theme.bottom > box.top;
        });
      });
      expect(overlap, 'Theme switch does not overlap navigation').toBe(false);
    }
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(32, 56, 49)');
    await page.emulateMedia({ media: 'screen' });
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 248, 245)');
    expect(errors).toEqual([]);
  });
}

test('saved choice persists across every page and reloads, overriding the system theme', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Dunkelmodus' }).click();
  for (const file of pages) {
    await page.goto('/' + file);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  }
  await page.reload();
  await expect(page.getByRole('button', { name: 'Dunkelmodus' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Dunkelmodus' }).click();
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('uses and follows system preference until the user makes a choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Dunkelmodus' }).click();
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('switch works when local storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new Error('Storage disabled'); };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Dunkelmodus' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Dunkelmodus' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('theme changes synchronize between tabs', async ({ page, context }) => {
  await page.goto('/');
  const other = await context.newPage();
  await other.goto('/rna-spleissen.html');
  await page.getByRole('button', { name: 'Dunkelmodus' }).click();
  await expect(other.locator('html')).toHaveAttribute('data-theme', 'dark');
  await other.getByRole('button', { name: 'Dunkelmodus' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('theme switch initializes when its script runs after DOMContentLoaded', async ({ page }) => {
  const source = await fs.readFile(path.join(__dirname, '../../src/js/theme.js'), 'utf8');
  await page.route('**/assets/js/theme.js*', route => route.fulfill({
    contentType: 'text/javascript',
    body: `window.addEventListener('load', () => { ${source}\n });`,
  }));
  await page.goto('/rna-spleissen.html');
  const toggle = page.getByRole('button', { name: 'Dunkelmodus' });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('restored pages reread the saved theme and keep the switch usable', async ({ page }) => {
  await page.goto('/');
  // Model another page changing storage while this document is in the history cache.
  await page.evaluate(() => {
    localStorage.setItem('genetik-theme', 'dark');
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Dunkelmodus' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('actual links preserve choices from home to every animation and back', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Dunkelmodus' }).click();
  for (const file of pages.slice(1)) {
    await page.locator(`.animation-card[href="${file}"], .action-primary[href="${file}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const toggle = page.getByRole('button', { name: 'Dunkelmodus' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await toggle.click();
    await page.locator('.brand').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Dunkelmodus' })).toBeVisible();
  }
});
