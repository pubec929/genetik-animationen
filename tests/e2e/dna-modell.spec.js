const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.route('https://cloud.umami.is/**', route => route.fulfill({ body: '' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('homepage opens the new rotatable helix in both themes', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('.animation-card[href="dna-modell.html"]').click();
  await expect(page.locator('#detail-title')).toHaveText('Doppelhelix');
  await expect(page.locator('#view-count')).toContainText('20 Basenpaare');
  await expect(page.locator('#detail-zoom')).toHaveValue('0');
  await expect(page.locator('#reset-rotation')).toBeDisabled();
  await expect(page.locator('#separation')).toBeDisabled();
  expect(await page.locator('#helix-overview circle[data-atom]').count()).toBeGreaterThan(500);
  expect(await page.locator('#helix-overview line').count()).toBeGreaterThan(500);
  for (const theme of ['light', 'dark']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('.model-card')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(255, 255, 255)');
    await expect(page.locator('.legend')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(253, 254, 252)');
  }
  expect(errors).toEqual([]);
});

test('zoom changes from the atomic overview to selectable building blocks', async ({ page }) => {
  await page.goto('/dna-modell.html');
  const zoom = page.locator('#detail-zoom');
  await zoom.fill('55');
  expect(Number(await page.locator('#model-root').getAttribute('opacity'))).toBe(0);
  await zoom.fill('85');
  expect(Number(await page.locator('#model-root').getAttribute('opacity'))).toBeGreaterThan(0);
  await expect(page.locator('#model-root')).toHaveAttribute('aria-hidden', 'false');
  await zoom.fill('100');
  await expect(page.locator('#helix-overview')).toHaveCount(0);
  await expect(page.locator('#separation')).toBeEnabled();
  await expect(page.locator('#view-count')).toContainText('8 Basenpaare');
  await expect(page.locator('#reset-rotation')).toBeHidden();
  await page.getByRole('button', { name: 'Herauszoomen' }).click();
  await expect(zoom).toHaveValue('80');
  await page.getByRole('button', { name: 'Hineinzoomen' }).click();
  await expect(zoom).toHaveValue('100');
  await zoom.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(zoom).toHaveValue('99');
  await zoom.fill('0');
  await page.locator('#dna-svg').dispatchEvent('wheel', { deltaY: -100 });
  expect(Number(await zoom.inputValue())).toBeGreaterThan(0);
});

test('mouse and keyboard rotate the helix and reset its orientation', async ({ page }) => {
  await page.goto('/dna-modell.html');
  const atom = page.locator('#helix-overview circle[data-atom]').first();
  const original = await atom.getAttribute('cx');
  const svg = page.locator('#dna-svg');
  await svg.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#reset-rotation')).toBeEnabled();
  await expect(atom).not.toHaveAttribute('cx', original);
  await page.keyboard.press('r');
  await expect(page.locator('#reset-rotation')).toBeDisabled();
  await expect(atom).toHaveAttribute('cx', original);
  const box = await svg.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 25, { steps: 4 });
  await page.mouse.up();
  await expect(page.locator('#reset-rotation')).toBeEnabled();
  await page.locator('#reset-rotation').click();
  await expect(page.locator('#reset-rotation')).toBeDisabled();
});

test('building blocks explain chemistry, keyboard navigation, separation and reset', async ({ page }) => {
  await page.goto('/dna-modell.html');
  await page.locator('#detail-zoom').fill('100');
  await page.locator('#dna-svg [data-type="A"]').first().click();
  await expect(page.locator('#detail-title')).toHaveText('Adenin');
  await expect(page.locator('#chemical-structure svg')).toBeVisible();
  await page.getByRole('button', { name: 'Freie Base', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Freie Base', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /Partner zeigen/ }).click();
  await expect(page.locator('#detail-title')).toHaveText('Thymin');
  await page.locator('#dna-svg [data-type="G"]').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#detail-title')).toHaveText('Guanin');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#detail')).toContainText('3 Wasserstoffbrücken');
  const backbone = await page.locator('.backbone-line').count();
  await page.locator('#separation').fill('100');
  await expect(page.locator('#separation-state')).toHaveText('Getrennt');
  expect(await page.locator('.hbond').evaluateAll(lines => lines.every(line => line.getAttribute('opacity') === '0'))).toBe(true);
  expect(await page.locator('.backbone-line').count()).toBe(backbone);
  await page.locator('#reset').click();
  await expect(page.locator('#detail-zoom')).toHaveValue('0');
  await expect(page.locator('#detail-title')).toHaveText('Doppelhelix');
  await expect(page.locator('#separation')).toBeDisabled();
});

test('mobile model fits the viewport and reduced motion applies zoom immediately', async ({ page }) => {
  await page.goto('/dna-modell.html');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Bausteine entdecken' }).click();
  await expect(page.locator('#detail-zoom')).toHaveValue('100');
  await expect(page.locator('#detail-title')).toHaveText('Adenin');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
