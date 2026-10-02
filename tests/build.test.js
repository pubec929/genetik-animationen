const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const pages = ['index.html', 'proteinbiosynthese-uebung.html', 'dna-modell.html', 'dna-replikation.html', 'mrna-translation.html', 'rna-spleissen.html', 'proteinbiosynthese-prokaryoten.html', 'proteinbiosynthese-eukaryoten.html'];

before(() => execFileSync(process.execPath, ['scripts/build.js'], { cwd: root }));

test('build preserves every public page and includes only deployable files', async () => {
  assert.deepEqual((await fs.readdir(output)).sort(), ['assets', ...pages].sort());
  for (const page of pages) {
    const html = await fs.readFile(path.join(output, page), 'utf8');
    assert.doesNotMatch(html, /<script\s*>|<style\s*>/);
    assert.equal((html.match(/https:\/\/cloud\.umami\.is\/script\.js/g) || []).length, 1);
    for (const match of html.matchAll(/href="([^"#?]+\.html)(?:[?#][^"]*)?"/g)) {
      assert.ok(pages.includes(match[1]), `Broken page link ${match[1]} in ${page}`);
    }
  }
});

test('every local asset exists and carries a version matching its contents', async () => {
  for (const page of pages) {
    const html = await fs.readFile(path.join(output, page), 'utf8');
    for (const match of html.matchAll(/(?:src|href)="(assets\/[^"?]+)(?:\?v=([a-f0-9]+))?"/g)) {
      const contents = await fs.readFile(path.join(output, match[1]));
      const hash = createHash('sha256').update(contents).digest('hex').slice(0, 12);
      assert.equal(match[2], hash, `Stale or missing version for ${match[1]}`);
    }
  }
});

test('interactive scripts initialize after parsing and before analytics', async () => {
  for (const page of pages.slice(1)) {
    const html = await fs.readFile(path.join(output, page), 'utf8');
    const script = html.match(/<script src="assets\/js\/(?:animations|exercises)\/[^" ]+" defer><\/script>/);
    assert.ok(script, `Missing deferred animation script in ${page}`);
    assert.ok(html.indexOf(script[0]) < html.indexOf('https://cloud.umami.is/script.js'));
  }
});
