const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.route('https://cloud.umami.is/**', route => route.fulfill({ body: '' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('mobile menu supports keyboard opening, Escape, outside click and navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('[data-menu-toggle]');
  const nav = page.locator('#site-navigation');
  await expect(nav).toBeHidden();
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator('h1').click();
  await expect(nav).toBeHidden();
  await toggle.click();
  await nav.getByRole('link', { name: 'Übung', exact: true }).click();
  await expect(page).toHaveURL(/proteinbiosynthese-uebung.html$/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#exercise')).toBeVisible();
});

test('skip link reaches main content and all homepage cards have distinct working targets', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);
  const links = await page.locator('.animation-card').evaluateAll(cards => cards.map(card => card.getAttribute('href')));
  expect(new Set(links).size).toBe(6);
  for (const href of links) {
    const response = await page.goto('/' + href);
    expect(response.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator(`.site-nav a[href="${href}"]`)).toHaveAttribute('aria-current', 'page');
  }
});
