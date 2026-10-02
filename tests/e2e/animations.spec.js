const { test: base, expect } = require('@playwright/test');

// Exercise the production frame callbacks at realistic 50 ms intervals, without
// waiting minutes for a cycle or changing the animations' private state.
const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('https://cloud.umami.is/**', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.addInitScript(() => {
      let now = 1000, next = 0;
      const callbacks = new Map();
      window.requestAnimationFrame = callback => { callbacks.set(++next, callback); return next; };
      window.cancelAnimationFrame = id => callbacks.delete(id);
      window.pendingAnimationFrames = () => callbacks.size;
      window.advanceAnimation = milliseconds => {
        for (let elapsed = 0; elapsed < milliseconds; elapsed += 50) {
          now += Math.min(50, milliseconds - elapsed);
          const pending = [...callbacks.values()];
          callbacks.clear();
          pending.forEach(callback => callback(now));
        }
      };
    });
    await use(page);
    expect(errors, 'No script, SVG parser, console, or HTTP errors').toEqual([]);
  },
});

const animations = [
  { file: 'dna-replikation.html', id: 'dc', terms: 'proteins', count: 6, initial: 4, duration: 12,
    stages: [[0.8, 'Ein neuer RNA-Primer'], [4, 'verlängert ein Okazaki-Fragment'], [7.1, 'löst sich vom fertigen Fragment'], [8, 'ersetzt einen älteren RNA-Primer'], [10, 'Ligase schließt'], [11.5, 'wechselt zum nächsten Primer']] },
  { file: 'mrna-translation.html', id: 'tr', terms: 'terms', count: 6, initial: 0.9, duration: 55,
    stages: [[1, 'Initiation'], [6, 'Codonerkennung'], [10, 'Peptidbindung'], [12, 'Translokation'], [15, 'tRNA verlässt E'], [42, 'Stoppcodon UAA'], [45, 'Kette wird frei'], [48, 'Recycling'], [52, 'Fertiges Polypeptid']] },
  { file: 'rna-spleissen.html', id: 'sp', terms: 'terms', count: 7, initial: 0.8, duration: 40,
    stages: [[1, 'prä-mRNA im Zellkern'], [5, 'Signale erkennen'], [12, 'Spleißosom und Schleife'], [19, 'Erste Spleißreaktion'], [25, 'Zweite Spleißreaktion'], [32, 'Reife mRNA'], [38, 'Wiederholung']] },
  { file: 'proteinbiosynthese-prokaryoten.html', id: 'po', terms: 'term', count: 8, initial: 0.8, duration: 56,
    stages: [[1, 'Transkription startet'], [6, 'Die mRNA entsteht'], [15, 'Die Translation beginnt'], [24, 'Transkription und Translation gleichzeitig'], [29, 'Die Transkription endet'], [32, 'Die Translation läuft weiter'], [37, 'Die erste Kette wird freigesetzt'], [46, 'Ein weiteres Protein entsteht'], [51, 'Mehrere Proteine aus einer mRNA'], [54, 'Nächster Durchlauf']] },
  { file: 'proteinbiosynthese-eukaryoten.html', id: 'eu', terms: 'term', count: 9, initial: 0.8, duration: 77,
    stages: [[1, 'Transkription startet'], [6, 'Die prä-mRNA entsteht'], [10, 'erhält ein Cap'], [15, 'Das Gen wird abgeschrieben'], [21, 'Das 3′-Ende wird gebildet'], [25, 'Poly(A)-Schwanz wächst'], [29, 'Das Intron wird entfernt'], [33, 'Die reife mRNA ist bereit'], [40, 'verlässt den Zellkern'], [49, 'Das Startcodon wird gesucht'], [58, 'Das Polypeptid wächst'], [68, 'Das Polypeptid wird freigesetzt'], [72, 'Vom Gen zum Polypeptid'], [75, 'Nächster Durchlauf']] },
];

async function advance(page, seconds) {
  await page.evaluate(ms => window.advanceAnimation(ms), seconds * 1000);
}
const sceneHTML = (page, id) => page.locator(`#${id}-scene`).innerHTML();

async function assertScene(page, id) {
  const scene = page.locator(`#${id}-scene`);
  await expect(scene).toBeVisible();
  expect(await scene.locator('path').count()).toBeGreaterThan(10);
  await expect(scene.locator(`title#${id}-title`)).not.toBeEmpty();
  await expect(scene.locator(`desc#${id}-desc`)).not.toBeEmpty();
  const invalid = await scene.evaluate(svg => [...svg.querySelectorAll('*')].flatMap(el =>
    [...el.attributes].filter(attr => /NaN|Infinity|undefined/.test(attr.value)).map(attr => `${el.tagName}.${attr.name}=${attr.value}`)));
  expect(invalid, 'All rendered SVG attributes have valid values').toEqual([]);
}

for (const animation of animations) {
  const { file, id } = animation;
  test.describe(file, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/' + file);
      await expect(page.locator(`#${id}-play`)).toBeEnabled();
    });

    test('renders, advances, pauses, and resumes without accumulating frame loops', async ({ page }) => {
      await assertScene(page, id);
      const initial = await sceneHTML(page, id);
      await advance(page, 5);
      expect(await sceneHTML(page, id)).not.toBe(initial);
      const play = page.locator(`#${id}-play`);
      await play.click();
      await expect(play).toHaveText('Weiterlaufen');
      const paused = await sceneHTML(page, id);
      await advance(page, 3);
      expect(await sceneHTML(page, id)).toBe(paused);
      for (let i = 0; i < 3; i++) { await play.click(); await play.click(); }
      await play.click();
      await expect(play).toHaveText('Pause');
      await advance(page, 5);
      expect(await sceneHTML(page, id)).not.toBe(paused);
      expect(await page.evaluate(() => window.pendingAnimationFrames())).toBe(1);
      await assertScene(page, id);
    });

    test('all speed settings produce the same scene after equivalent animation time', async ({ page }) => {
      const scenes = [];
      for (const [speed, seconds] of [['0.5', 4.8], ['1', 2.4], ['1.5', 1.6]]) {
        await page.goto('/' + file);
        await page.locator(`#${id}-speed`).selectOption(speed);
        await advance(page, 0.05); // Establish the first frame's timestamp.
        await advance(page, seconds);
        // SVG decimal representations can differ by floating point roundoff.
        scenes.push((await sceneHTML(page, id)).replace(/-?\d+\.\d+(?:e[+-]?\d+)?/gi, number => Number(number).toFixed(6)));
      }
      expect(scenes[0]).toBe(scenes[1]);
      expect(scenes[2]).toBe(scenes[1]);
    });

    test('every stage renders and the next cycle restarts correctly', async ({ page }) => {
      await advance(page, 0.05);
      let time = animation.initial;
      const status = page.locator(`#${id}-${id === 'dc' ? 'detail' : 'phase'}`);
      for (const [target, text] of animation.stages) {
        const next = target < time ? target + animation.duration : target;
        await advance(page, next - time);
        time = next;
        await expect(status).toContainText(text);
        await assertScene(page, id);
      }
      const restart = animation.duration * (Math.floor(time / animation.duration) + 1) + animation.stages[0][0];
      await advance(page, restart - time);
      await expect(status).toContainText(animation.stages[0][1]);
      await assertScene(page, id);
    });

    test('every term shows an explanation, persists during playback, and can be cleared', async ({ page }) => {
      await page.locator(`#${id}-play`).click();
      const detail = page.locator(`#${id}-detail`);
      const automatic = await detail.textContent();
      const terms = page.locator(`#${id}-${animation.terms}`);
      if (animation.terms === 'term') {
        const options = await terms.locator('option').evaluateAll(options => options.filter(o => o.value).map(o => o.value));
        expect(options).toHaveLength(animation.count);
        for (const value of options) {
          await terms.selectOption(value);
          await expect(detail).not.toHaveText(automatic);
          expect((await detail.textContent()).length).toBeGreaterThan(40);
        }
        const selected = await detail.textContent();
        await page.locator(`#${id}-play`).click();
        await advance(page, 5);
        await expect(detail).toHaveText(selected);
        await terms.selectOption('');
        await expect(detail).not.toHaveText(selected);
      } else {
        const buttons = terms.getByRole('button');
        await expect(buttons).toHaveCount(animation.count);
        for (let i = 0; i < animation.count; i++) {
          const button = buttons.nth(i);
          await button.click();
          await expect(button).toHaveAttribute('aria-pressed', 'true');
          await expect(terms.locator('[aria-pressed="true"]')).toHaveCount(1);
          await expect(detail).not.toHaveText(automatic);
          await button.click();
          await expect(button).toHaveAttribute('aria-pressed', 'false');
          await expect(detail).toHaveText(automatic);
        }
        await buttons.first().click();
        const selected = await detail.textContent();
        await page.locator(`#${id}-play`).click();
        await advance(page, 5);
        await expect(detail).toHaveText(selected);
        await buttons.first().click();
        await expect(detail).not.toHaveText(selected);
      }
    });

    test('reduced motion starts paused and permits explicit playback', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      const play = page.locator(`#${id}-play`);
      await expect(play).toHaveText('Weiterlaufen');
      const initial = await sceneHTML(page, id);
      await advance(page, 5);
      expect(await sceneHTML(page, id)).toBe(initial);
      await play.click();
      await advance(page, 5);
      expect(await sceneHTML(page, id)).not.toBe(initial);
    });

    test('hidden documents stop advancing and resume without a time jump', async ({ page }) => {
      await advance(page, 5);
      const before = await sceneHTML(page, id);
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await advance(page, 20);
      expect(await sceneHTML(page, id)).toBe(before);
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await advance(page, 0.05);
      expect(await sceneHTML(page, id)).toBe(before);
      await advance(page, 2);
      expect(await sceneHTML(page, id)).not.toBe(before);
      await assertScene(page, id);
    });

    test('resizes while paused and keeps the scene within the viewport', async ({ page }) => {
      await page.locator(`#${id}-play`).click();
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const scene = page.locator(`#${id}-scene`);
        await expect.poll(async () => scene.evaluate(svg => Math.abs(svg.viewBox.baseVal.width - svg.getBoundingClientRect().width))).toBeLessThan(1);
        await assertScene(page, id);
        const bounds = await scene.boundingBox();
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
        const resized = await sceneHTML(page, id);
        await advance(page, 1);
        expect(await sceneHTML(page, id)).toBe(resized);
      }
    });
  });
}
