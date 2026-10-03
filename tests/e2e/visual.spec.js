const { test, expect, prepareVisual } = require('../helpers/visual');
const { installAnimationClock } = require('../helpers/animation-clock');

// Fixed educational milestones, independent of renderer implementation.
const scenes = [
  { file: 'dna-replikation', id: 'dc', initial: 4, stages: [[4, 'copying', 'verlängert'], [10, 'ligation', 'Ligase']] },
  { file: 'mrna-translation', id: 'tr', initial: .9, stages: [[12, 'translocation', 'Translokation'], [45, 'release', 'Kette wird frei']] },
  { file: 'rna-spleissen', id: 'sp', initial: .8, stages: [[19, 'lariat', 'Erste Spleißreaktion'], [32, 'joined-exons', 'Reife mRNA']] },
  { file: 'proteinbiosynthese-prokaryoten', id: 'po', initial: .8, stages: [[24, 'coupled', 'gleichzeitig'], [51, 'proteins', 'Mehrere Proteine']] },
  { file: 'proteinbiosynthese-eukaryoten', id: 'eu', initial: .8, stages: [[29, 'processing', 'Intron'], [40, 'export', 'verlässt den Zellkern']] },
];

for (const theme of ['light', 'dark']) {
  test.describe(`visual ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    });

    test('homepage', async ({ page }) => {
      await page.goto('/');
      await prepareVisual(page);
      // Load below-the-fold card images before capturing the full page.
      await page.locator('img').evaluateAll(images => Promise.all(images.map(async image => {
        image.loading = 'eager';
        await image.decode();
      })));
      await expect(page).toHaveScreenshot(`homepage-${theme}.png`, { fullPage: true });
    });

    test('DNA zoom levels, separation and chemical detail', async ({ page }) => {
      await page.goto('/dna-modell.html');
      await prepareVisual(page);
      for (const value of ['0', '55', '100']) {
        await page.locator('#model-zoom').fill(value);
        await expect(page.locator('#dna-svg')).toHaveCSS('opacity', value === '0' ? '0' : value === '100' ? '1' : '0.5');
        await expect(page.locator('.canvas-wrap')).toHaveScreenshot(`dna-zoom-${value}-${theme}.png`);
      }
      await page.locator('#separation').fill('100');
      await expect(page.locator('#separation-state')).toHaveText('Getrennt');
      await expect(page.locator('.canvas-wrap')).toHaveScreenshot(`dna-separated-${theme}.png`);
      await page.locator('#reset').click();
      await page.locator('#dna-svg [data-type="G"]').first().click();
      await expect(page.locator('#detail-title')).toHaveText('Guanin');
      await expect(page.locator('#inspector')).toHaveScreenshot(`dna-chemistry-${theme}.png`);
    });

    for (const scene of scenes) {
      test(`${scene.file} fixed stages`, async ({ page }) => {
        await installAnimationClock(page);
        await page.goto(`/${scene.file}.html`);
        await prepareVisual(page);
        await page.locator(`#${scene.id}-play`).click();
        await page.evaluate(() => window.advanceAnimation(50));
        let current = scene.initial;
        for (const [time, name, description] of scene.stages) {
          await page.evaluate(ms => window.advanceAnimation(ms), (time - current) * 1000);
          current = time;
          const status = page.locator(`#${scene.id}-${scene.id === 'dc' ? 'detail' : 'phase'}`);
          await expect(status).toContainText(description);
          await expect(page.locator('.animation-surface')).toHaveScreenshot(`${scene.file}-${name}-${theme}.png`);
        }
      });
    }

    test('exercise live strands and checked feedback', async ({ page }) => {
      await page.goto('/proteinbiosynthese-uebung.html');
      await prepareVisual(page);
      await page.locator('#rna-sequence').fill('AUG GCU UUU GGA ACC UAA');
      for (const [i, amino] of ['M', 'A', 'F', 'G', 'T', '*'].entries()) {
        await page.locator(`#aa-${i}`).selectOption(amino);
      }
      await page.locator('#rna-drawing').evaluate(element => { element.scrollLeft = 0; });
      await expect(page.locator('.rna-preview')).toHaveScreenshot(`exercise-rna-${theme}.png`);
      await expect(page.locator('.peptide-preview')).toHaveScreenshot(`exercise-peptide-${theme}.png`);
      await page.getByRole('button', { name: 'Lösung prüfen' }).click();
      await expect(page.locator('#feedback')).toContainText('Alles richtig!');
      await expect(page.locator('#feedback')).toHaveScreenshot(`exercise-feedback-${theme}.png`);
    });
  });
}
