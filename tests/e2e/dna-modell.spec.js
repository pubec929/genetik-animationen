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

test('DNA zoom smoothly blends the helix and detail views and resets', async ({ page }) => {
  await page.route('https://cloud.umami.is/**', route => route.fulfill({ body: '' }));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/dna-modell.html');
  const zoom = page.locator('#model-zoom');
  const detailed = page.locator('#dna-svg');
  const helix = page.locator('#helix-svg');
  await expect(helix).toHaveAttribute('aria-label', /30 Basenpaaren.*atomares/);
  // The reference has individual atoms, rather than one large bead per base.
  for (const element of ['C', 'N', 'O', 'P']) {
    expect(await helix.locator(`[data-element="${element}"]`).count()).toBeGreaterThan(40);
  }
  expect(await helix.locator('line').count()).toBeGreaterThan(1000);
  await detailed.evaluate(node => {
    window.zoomSamples = [];
    window.zoomObserver = new MutationObserver(() => window.zoomSamples.push(Number(node.style.opacity)));
    window.zoomObserver.observe(node, { attributes: true, attributeFilter: ['style'] });
  });
  await zoom.fill('0');
  await expect(detailed).toHaveCSS('opacity', '0');
  const samples = await page.evaluate(() => {
    window.zoomObserver.disconnect();
    return window.zoomSamples;
  });
  expect(samples.some(opacity => opacity > 0 && opacity < 1)).toBe(true);
  await expect(helix).toHaveCSS('opacity', '1');
  await expect(detailed).toHaveAttribute('aria-hidden', 'true');
  await page.screenshot({ path: test.info().outputPath('helix-model.png'), fullPage: true });
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: test.info().outputPath('dark-helix-model.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const canvas = page.locator('.canvas-wrap');
  await canvas.dispatchEvent('wheel', { deltaY: -100 });
  await expect(zoom).toHaveValue('10');
  await canvas.dispatchEvent('wheel', { deltaY: 100 });
  await expect(zoom).toHaveValue('0');
  await page.getByRole('button', { name: 'Herauszoomen', exact: true }).click();
  await expect(zoom).toHaveValue('0');
  await page.getByRole('button', { name: 'Hineinzoomen', exact: true }).click();
  await expect(zoom).toHaveValue('25');
  await zoom.focus();
  await page.keyboard.press('ArrowRight');
  await expect(zoom).toHaveValue('26');
  await page.locator('#reset').click();
  await expect(zoom).toHaveValue('100');
  await expect(detailed).toHaveCSS('opacity', '1');
  await expect(detailed).toHaveAttribute('aria-hidden', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await zoom.fill('0');
  await expect(detailed).toHaveCSS('opacity', '0');
});

test('DNA keyboard navigation follows base pairs and strand partners', async ({ page }) => {
  await page.route('https://cloud.umami.is/**', route => route.fulfill({ body: '' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dna-modell.html');
  await page.locator('#dna-svg [data-type="A"]').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#detail-title')).toHaveText('Adenin');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#detail-title')).toHaveText('Guanin');
  await expect(page.locator('#dna-svg [aria-pressed="true"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#detail')).toContainText('3 Wasserstoffbrücken');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#detail-title')).toHaveText('Cytosin');
  await page.keyboard.press('End');
  await expect(page.locator('#dna-svg [aria-pressed="true"]')).toHaveAttribute('data-index', '7');
  await page.keyboard.press('Home');
  await expect(page.locator('#detail-title')).toHaveText('Thymin');
  await page.keyboard.press('Escape');
  await expect(page.locator('#inspector')).toHaveAttribute('inert', '');
  await expect(page.locator('#dna-svg')).toBeFocused();
});

test('closing details while zoomed out preserves the overview legend and count', async ({ page }) => {
  await page.route('https://cloud.umami.is/**', route => route.fulfill({ body: '' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dna-modell.html');
  await page.locator('#dna-svg [data-type="A"]').first().click();
  // A native range may be behind the open drawer on mobile; the input event
  // still models the supported state change without forcing a pointer click.
  await page.locator('#model-zoom').fill('0');
  await expect(page.locator('#dna-svg')).toHaveCSS('opacity', '0');
  await page.keyboard.press('Escape');
  await expect(page.locator('#view-count')).toContainText('30 Basenpaare');
  await expect(page.locator('#model-caption')).toContainText('Kohlenstoff');
  await expect(page.locator('#helix-svg')).toHaveAttribute('aria-hidden', 'false');
});

test('separation hides hydrogen bonds and reset restores them without changing the backbone', async ({ page }) => {
  await page.route('https://cloud.umami.is/**', route => route.fulfill({ body: '' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dna-modell.html');
  const backbone = await page.locator('.strand-bonds').evaluateAll(groups => groups.map(group => group.innerHTML));
  for (const [value, label, opacity] of [['30', 'Wird getrennt', '.5'], ['100', 'Getrennt', '0']]) {
    await page.locator('#separation').fill(value);
    await expect(page.locator('#separation-state')).toHaveText(label);
    const values = await page.locator('.hbond').evaluateAll(lines => lines.map(line => Number(line.getAttribute('opacity'))));
    expect(values.every(value => value === Number(opacity))).toBe(true);
    expect(await page.locator('.strand-bonds').evaluateAll(groups => groups.map(group => group.innerHTML))).toEqual(backbone);
  }
  await page.locator('#reset').click();
  expect(await page.locator('.hbond').evaluateAll(lines => lines.every(line => line.getAttribute('opacity') === '1'))).toBe(true);
});
