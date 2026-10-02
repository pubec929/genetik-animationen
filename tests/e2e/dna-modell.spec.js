const { test, expect } = require('@playwright/test');

test('DNA model preserves selection, chemistry, separation and reset in both themes', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://cloud.umami.is/**', route => route.fulfill({ body: '' }));
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.animation-card[href="dna-modell.html"]').click();
  await expect(page.locator('#dna-svg .dna-hit')).not.toHaveCount(0);
  for (const theme of ['light', 'dark']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('[data-theme-toggle]').click();
    await page.locator('#dna-svg [data-type="A"]').first().click();
    await expect(page.locator('#detail-title')).toHaveText('Adenin');
    await expect(page.locator('#chemical-structure svg')).toBeVisible();
    await expect(page.locator('.model-card')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(255, 255, 255)');
    await page.screenshot({ path: test.info().outputPath(theme + '-model.png'), fullPage: true });
    await page.getByRole('button', { name: 'Freie Base', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Freie Base', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /Partner zeigen/ }).click();
    await expect(page.locator('#detail-title')).toHaveText('Thymin');
    await page.locator('#close-detail').click();
    await page.locator('#separation').fill('100');
    await expect(page.locator('#separation-state')).toHaveText('Getrennt');
    await page.locator('#reset').click();
    await expect(page.locator('#separation-state')).toHaveText('Gepaart');
    await expect(page.locator('#inspector')).toHaveAttribute('inert', '');
  }
  expect(errors).toEqual([]);
});
