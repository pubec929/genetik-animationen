const { test, expect } = require('@playwright/test');
const file = '/proteinbiosynthese-uebung.html';
const tasks = [
  { dna: 'TAC CGA AAA CCT TGG ATT', rna: ['AUG','GCU','UUU','GGA','ACC','UAA'], aa: ['M','A','F','G','T','*'], peptide: 'Met – Ala – Phe – Gly – Thr' },
  { dna: 'TAC GTT TTT ACG CTC ACC ATC', rna: ['AUG','CAA','AAA','UGC','GAG','UGG','UAG'], aa: ['M','Q','K','C','E','W','*'], peptide: 'Met – Gln – Lys – Cys – Glu – Trp' },
  { dna: 'TAC TAG GAC TCA GTA CCA AGG ACT', rna: ['AUG','AUC','CUG','AGU','CAU','GGU','UCC','UGA'], aa: ['M','I','L','S','H','G','S','*'], peptide: 'Met – Ile – Leu – Ser – His – Gly – Ser' }
];
test.beforeEach(async ({ page }) => {
  await page.route('https://cloud.umami.is/**', route => route.fulfill({ body: '' }));
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
});
async function answer(page, task) {
  await page.locator('#rna-sequence').fill(task.rna.join(''));
  for (let i = 0; i < task.rna.length; i++) {
    await page.locator(`#aa-${i}`).selectOption(task.aa[i]);
  }
}

test('home entry opens exercise and all three tasks accept correct solutions', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Interaktive Übung starten' }).click();
  await expect(page).toHaveURL(new RegExp(file));
  await expect(page.locator('#feedback')).toBeHidden();
  await page.screenshot({ path: test.info().outputPath('exercise-light.png'), fullPage: true });
  for (const task of tasks) {
    expect(await page.locator('#dna-sequence code').allTextContents()).toEqual(task.dna.split(' '));
    await answer(page, task);
    await page.getByRole('button', { name: 'Lösung prüfen' }).click();
    await expect(page.locator('#feedback')).toContainText('Alles richtig!');
    await expect(page.locator('#feedback')).toContainText(task.peptide);
    await expect(page.locator('[aria-invalid=true]')).toHaveCount(0);
    await page.locator('#solution summary').click();
    await expect(page.locator('#solution-content')).toContainText(task.rna.join(' · '));
    await page.locator('#new-task').click();
    await expect(page.locator('#solution')).toBeHidden();
    await expect(page.locator('#feedback')).toBeHidden();
    await expect(page.locator('#rna-sequence')).toHaveValue('');
  }
  await expect(page.locator('#task-number')).toContainText('Aufgabe 1 / 3');
  expect(errors).toEqual([]);
});

test('blank, invalid and cascading answers get actionable feedback, then can be corrected', async ({ page }) => {
  await page.goto(file);
  await page.getByRole('button', { name: 'Lösung prüfen' }).click();
  await expect(page.locator('[aria-invalid=true]')).toHaveCount(7);
  await expect(page.locator('#rna-feedback-0')).toContainText('fehlt');
  await expect(page.locator('#aa-feedback-0')).toContainText('Wähle');
  await answer(page, tasks[0]);
  await expect(page.locator('#feedback')).toBeHidden();
  await page.locator('#rna-sequence').fill('ATG GC? ??? AAA ACC UAA');
  await page.locator('#aa-3').selectOption('K');
  await page.locator('#aa-4').selectOption('*');
  await page.locator('#aa-5').selectOption('M');
  await page.getByRole('button', { name: 'Lösung prüfen' }).click();
  await expect(page.locator('#rna-feedback-0')).toContainText('U statt T');
  await expect(page.locator('#rna-feedback-1')).toContainText('genau drei');
  await expect(page.locator('#rna-feedback-2')).toContainText('genau drei');
  await expect(page.locator('#aa-feedback-3')).toContainText('Passt zu deiner mRNA');
  await expect(page.locator('#aa-feedback-4')).toContainText('noch weiter');
  await expect(page.locator('#aa-feedback-5')).toContainText('keine Aminosäure');
  await page.getByRole('button', { name: 'Dunkelmodus' }).click();
  await page.screenshot({ path: test.info().outputPath('exercise-dark-feedback.png'), fullPage: true });
  await answer(page, tasks[0]);
  await page.locator('#rna-sequence').fill(tasks[0].rna.join(' \n').toLowerCase());
  await page.getByRole('button', { name: 'Lösung prüfen' }).click();
  await expect(page.locator('#feedback')).toContainText('Alles richtig!');
  await page.locator('#reset-answers').click();
  await expect(page.locator('#completion')).toHaveText('0 / 18 mRNA-Zeichen · 0 / 6 Zuordnungen');
  await expect(page.locator('#feedback')).toBeHidden();
  await expect(page.locator('#rna-sequence')).toBeFocused();
  await expect(page.locator('[data-result]')).toHaveCount(0);
});

test('reference includes all 64 RNA codons, all stops, and matching accessible labels', async ({ page }) => {
  await page.goto(file);
  await page.getByText('Codontabelle öffnen', { exact: true }).click();
  const rows = page.locator('#codon-table tr');
  await expect(rows).toHaveCount(21);
  const codons = (await rows.locator('td:last-child').allTextContents()).flatMap(row => row.split(' · '));
  expect(new Set(codons).size).toBe(64);
  expect(codons.every(codon => /^[ACGU]{3}$/.test(codon))).toBe(true);
  await expect(rows.filter({ hasText: 'Keine Aminosäure' })).toContainText('UAA · UAG · UGA');
  await expect(rows.filter({ hasText: 'Methionin' })).toContainText('AUG');
  await page.getByRole('textbox', { name: 'Deine mRNA-Sequenz (5′ → 3′)' }).fill('AUG');
  await expect(page.locator('#entered-0')).toHaveText('AUG');
  await page.getByRole('combobox', { name: 'Aminosäure / Stopp 1', exact: true }).selectOption('M');
  await expect(page.locator('#completion')).toHaveText('3 / 18 mRNA-Zeichen · 1 / 6 Zuordnungen');
});

test('live polypeptide follows choices, gaps, edits and stop without revealing answers', async ({ page }) => {
  await page.goto(file);
  const beads = page.locator('.peptide-bead');
  await expect(beads).toHaveCount(0);
  await expect(page.locator('#peptide-status')).toContainText('Wähle oben');
  // Build directly from the student's choices, even before transcription or grading.
  await page.locator('#aa-0').selectOption('M');
  await expect(beads).toHaveCount(1);
  await expect(beads.locator('.peptide-label')).toHaveText(['Met']);
  await page.locator('#aa-2').selectOption('F');
  await expect(beads).toHaveCount(2);
  await expect(page.locator('.peptide-gap')).toHaveCount(1);
  await expect(page.locator('.peptide-link.is-gap')).toHaveCount(2);
  await page.locator('#aa-1').selectOption('A');
  await expect(beads.locator('.peptide-label')).toHaveText(['Met', 'Ala', 'Phe']);
  await expect(page.locator('.peptide-gap')).toHaveCount(0);
  await expect(page.locator('.peptide-link')).toHaveCount(2);
  await page.locator('#aa-1').selectOption('M');
  await expect(beads.locator('.peptide-label')).toHaveText(['Met', 'Met', 'Phe']);
  const fills = await beads.locator('circle:first-of-type').evaluateAll(circles => circles.map(circle => circle.getAttribute('fill')));
  expect(fills[0]).toBe(fills[1]);
  expect(fills[2]).not.toBe(fills[0]);
  await page.locator('#aa-1').selectOption('*');
  await expect(beads).toHaveCount(1);
  await expect(page.locator('#peptide-status')).toContainText('Stopp an Position 2');
  await page.locator('#aa-1').selectOption('A');
  await expect(beads).toHaveCount(3);
  await page.locator('#aa-1').selectOption('');
  await expect(page.locator('.peptide-gap')).toHaveCount(1);
  await page.locator('#aa-0').selectOption('*');
  await expect(beads).toHaveCount(0);
  await expect(page.locator('#peptide-status')).toContainText('keine Polypeptidkette');
  await expect(page.locator('#feedback')).toBeHidden();
  await page.locator('#reset-answers').click();
  await expect(page.locator('#peptide-status')).toContainText('Wähle oben');
  await page.locator('#aa-0').selectOption('M');
  await page.locator('#new-task').click();
  await expect(beads).toHaveCount(0);
});

test('long live chain stays connected and readable across sizes and themes', async ({ page }) => {
  await page.goto(file);
  await page.locator('#new-task').click();
  await page.locator('#new-task').click();
  await answer(page, tasks[2]);
  await expect(page.locator('.peptide-bead')).toHaveCount(7);
  await expect(page.locator('.peptide-link')).toHaveCount(6);
  await expect(page.locator('#peptide-svg-desc')).toContainText('Stopp an Position 8');
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(async () => page.locator('#peptide-drawing svg').evaluate(svg => svg.getBoundingClientRect().width)).toBeLessThan(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.locator('.peptide-bead')).toHaveCount(7);
  }
  await page.setViewportSize({ width: test.info().project.use.viewport.width, height: 900 });
  await page.locator('.peptide-preview').screenshot({ path: test.info().outputPath('live-chain-light.png') });
  await page.getByRole('button', { name: 'Dunkelmodus' }).click();
  await page.locator('.peptide-preview').screenshot({ path: test.info().outputPath('live-chain-dark.png') });
  await page.getByRole('button', { name: 'Lösung prüfen' }).click();
  await expect(page.locator('#feedback')).toContainText('Alles richtig!');
});

test('single mRNA field grows with each letter and regroups after editing', async ({ page }) => {
  await page.goto(file);
  await expect(page.getByRole('textbox')).toHaveCount(1);
  const input = page.locator('#rna-sequence');
  const bases = page.locator('.rna-base');
  for (const [i, base] of ['a', 'u', 'g'].entries()) {
    await input.pressSequentially(base);
    await expect(bases).toHaveCount(i + 1);
  }
  await expect(bases.locator('.rna-letter')).toHaveText(['A', 'U', 'G']);
  await input.press('Backspace');
  await expect(bases).toHaveCount(2);
  await input.fill('AUGCGU');
  await input.press('Home');
  await input.press('ArrowRight');
  await input.press('ArrowRight');
  await input.press('Delete');
  await expect(input).toHaveValue('AUCGU');
  await expect(page.locator('#entered-0')).toHaveText('AUC');
  await expect(page.locator('#entered-1')).toHaveText('GU');
  await expect(bases.locator('.rna-letter')).toHaveText(['A', 'U', 'C', 'G', 'U']);
  await input.fill('A T <');
  await expect(page.locator('.rna-invalid')).toHaveCount(2);
  await expect(page.locator('#rna-status')).toContainText('Markierte Zeichen prüfen');
  await input.fill(' u a c c ');
  await expect(page.locator('.rna-invalid')).toHaveCount(0);
  const colors = await bases.locator('.rna-base-shape').evaluateAll(nodes => nodes.map(node => node.getAttribute('fill')));
  expect(colors[2]).toBe(colors[3]);
  expect(new Set(colors).size).toBe(3);
  await expect(page.locator('#feedback')).toBeHidden();
  await page.locator('#reset-answers').click();
  await expect(input).toHaveValue('');
  await expect(bases).toHaveCount(0);
  await input.fill('A');
  await page.locator('#new-task').click();
  await expect(input).toHaveValue('');
  await expect(bases).toHaveCount(0);
});

test('complete mRNA stays readable on mobile and in dark mode', async ({ page }) => {
  await page.goto(file);
  await page.locator('#new-task').click();
  await page.locator('#new-task').click();
  await answer(page, tasks[2]);
  await expect(page.locator('.rna-base')).toHaveCount(24);
  await expect(page.locator('#rna-drawing .rna-link')).toHaveCount(24);
  await expect(page.locator('#rna-drawing .rna-letter')).toHaveText(tasks[2].rna.join('').split(''));
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(async () => page.locator('#rna-drawing').evaluate(el => el.getBoundingClientRect().width)).toBeLessThan(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: test.info().project.use.viewport.width, height: 900 });
  await page.locator('#rna-drawing').evaluate(el => { el.scrollLeft = 0; });
  await page.locator('.rna-preview').screenshot({ path: test.info().outputPath('live-rna-light.png') });
  await page.getByRole('button', { name: 'Dunkelmodus' }).click();
  await page.locator('.rna-preview').screenshot({ path: test.info().outputPath('live-rna-dark.png') });
  await page.getByRole('button', { name: 'Lösung prüfen' }).click();
  await expect(page.locator('#feedback')).toContainText('Alles richtig!');
});


test('RNA uses DNA model silhouettes and inserts only new bases from above', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(file);
  await expect(page.locator('.rna-ribose')).toHaveCount(18);
  await expect(page.locator('.rna-phosphate')).toHaveCount(18);
  const input = page.locator('#rna-sequence');
  await input.fill('A');
  const motion = await page.locator('.rna-base').evaluate(base => {
    const animation = base.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
    return { transform: getComputedStyle(base).transform, frames: animation.effect.getKeyframes() };
  });
  expect(motion.frames[0].transform).toBe('translateY(-58px)');
  expect(motion.transform).toBe('matrix(1, 0, 0, 1, 0, -58)');
  await page.locator('.rna-base').evaluate(base => base.getAnimations()[0].finish());
  await input.pressSequentially('U');
  expect(await page.locator('.rna-base').first().evaluate(base => base.getAnimations().length)).toBe(0);
  await input.fill('AUG');
  await input.fill('AUGC');
  expect(await page.locator('.rna-base-shape').evaluateAll(paths => paths.map(path => path.getAttribute('d')))).toEqual([
    'M0 -20H112L136 0L112 20H0Z',
    'M0 -20H125L103 0L125 20H0Z',
    'M0 -20H112Q137 -20 137 0Q137 20 112 20H0Z',
    'M0 -20H125C96 -20 96 20 125 20H0Z'
  ]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await input.fill('AUGA');
  expect(await page.locator('.rna-base').last().evaluate(base => base.getAnimations().length)).toBe(0);
  await page.locator('#new-task').click();
  await page.locator('#new-task').click();
  await input.fill(tasks[2].rna.join(''));
  expect(await page.locator('#rna-drawing').evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  await expect(input).toBeFocused();
  const visible = await page.locator('.rna-base').last().evaluate(base => {
    const viewport = document.getElementById('rna-drawing').getBoundingClientRect();
    const box = base.getBoundingClientRect();
    return box.left >= viewport.left && box.right <= viewport.right;
  });
  expect(visible).toBe(true);
});


test('single sequence rejects missing and extra bases and accepts formatted paste', async ({ page }) => {
  await page.goto(file);
  await answer(page, tasks[0]);
  const input = page.locator('#rna-sequence');
  await input.fill(tasks[0].rna.join('') + 'A');
  await page.getByRole('button', { name: 'Lösung prüfen' }).click();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#rna-feedback-summary')).toContainText('zusätzlichen Zeichen');
  await expect(page.locator('#feedback')).not.toContainText('Alles richtig!');
  await input.fill(tasks[0].rna.join('').slice(0, -1));
  await page.getByRole('button', { name: 'Lösung prüfen' }).click();
  await expect(page.locator('#rna-feedback-summary')).toContainText('fehlenden Basen');
  await expect(page.locator('#rna-feedback-5')).toContainText('genau drei');
  await input.fill(tasks[0].rna.join(' \n').toLowerCase());
  await page.getByRole('button', { name: 'Lösung prüfen' }).click();
  await expect(input).toHaveAttribute('aria-invalid', 'false');
  await expect(page.locator('#feedback')).toContainText('Alles richtig!');
});
