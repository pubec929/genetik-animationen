const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Read the shipped data, not the generator's intermediate values.
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/js/animations/dna-helix-data.js'), 'utf8'), context);
const { atoms, bonds, basePairs } = context.window.DNA_HELIX_DATA;

function strands() {
  const neighbors = atoms.map(() => []);
  for (const [a, b] of bonds) {
    neighbors[a].push(b);
    neighbors[b].push(a);
  }
  const unseen = new Set(atoms.map((_, i) => i));
  const components = [];
  while (unseen.size) {
    const first = unseen.values().next().value;
    const pending = [first], component = [];
    unseen.delete(first);
    while (pending.length) {
      const current = pending.pop();
      component.push(current);
      for (const next of neighbors[current]) if (unseen.delete(next)) pending.push(next);
    }
    components.push(component);
  }
  return components;
}

test('atomic data has finite coordinates and valid, unique covalent bonds', () => {
  assert.equal(basePairs, 30);
  for (const [element, ...xyz] of atoms) {
    assert.ok(['C', 'N', 'O', 'P'].includes(element));
    assert.equal(xyz.length, 3);
    assert.ok(xyz.every(Number.isFinite));
  }
  const seen = new Set();
  for (const [a, b] of bonds) {
    assert.ok(Number.isInteger(a) && Number.isInteger(b) && a >= 0 && b >= 0);
    assert.ok(a < atoms.length && b < atoms.length && a !== b);
    const key = [a, b].sort((x, y) => x - y).join(':');
    assert.ok(!seen.has(key), `Duplicate bond ${key}`);
    seen.add(key);
    const distance = Math.hypot(...atoms[a].slice(1).map((v, i) => v - atoms[b][i + 1]));
    assert.ok(distance > 1 && distance < 2.5, `Implausible bond ${key}: ${distance} Å`);
  }
});

test('the molecule has two continuous backbones with one phosphate per base pair', () => {
  const components = strands();
  assert.equal(components.length, 2, 'Broken backbone, isolated atoms, or a covalent cross-link');
  for (const component of components) {
    assert.equal(component.filter(i => atoms[i][0] === 'P').length, 30);
    assert.ok(component.length > 500);
  }
});

test('both backbones wind right-handed around the long axis for multiple turns', () => {
  // In a right-handed x/y/z frame, atan2(z, x) decreases along positive y.
  // Sorting phosphates along y makes this independent of chain ordering.
  for (const component of strands()) {
    const phosphates = component.filter(i => atoms[i][0] === 'P')
      .map(i => atoms[i]).sort((a, b) => a[2] - b[2]);
    let twist = 0;
    for (let i = 1; i < phosphates.length; i++) {
      const previous = phosphates[i - 1], next = phosphates[i];
      const angle = Math.atan2(next[3], next[1]) - Math.atan2(previous[3], previous[1]);
      twist += Math.atan2(Math.sin(angle), Math.cos(angle));
    }
    const turns = twist / (2 * Math.PI);
    assert.ok(turns < -2 && turns > -3.5, `Expected a multi-turn right-handed helix, got ${turns}`);
    const span = axis => Math.max(...phosphates.map(p => p[axis])) - Math.min(...phosphates.map(p => p[axis]));
    assert.ok(span(2) > 80 && span(2) < 120, 'Incorrect axial proportions');
    assert.ok(span(1) > 15 && span(1) < 35, 'Collapsed or stretched width');
    assert.ok(span(3) > 15 && span(3) < 35, 'Flattened or stretched depth');
  }
});
