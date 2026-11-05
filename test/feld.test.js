// Feldaufbau nach § 2: 5 × 5 mit vier Lücken, also 21 Karten.
const test = require('node:test');
const assert = require('node:assert/strict');
const { sim, sorted } = require('./helpers.js');

test('genau 21 Felder und 4 Lücken', () => {
  assert.equal(sim.CELLS.length, 21);
  assert.deepEqual(sorted(sim.HOLES), [6, 8, 16, 18]);
  for (const h of sim.HOLES) assert.ok(!sim.CELLS.includes(h), `Lücke ${h} ist kein Feld`);
});

test('Ecken und Mitte sind Felder', () => {
  assert.deepEqual(sorted(sim.CORNERS), [0, 4, 20, 24]);
  assert.equal(sim.MID, 12);
  for (const c of [...sim.CORNERS, sim.MID]) assert.ok(sim.CELLS.includes(c));
});

test('Nachbarn: nur waagrecht und senkrecht, keine Lücken', () => {
  assert.deepEqual(sorted(sim.NEIGHBORS[0]), [1, 5]);
  assert.deepEqual(sorted(sim.NEIGHBORS[2]), [1, 3, 7]);
  assert.deepEqual(sorted(sim.NEIGHBORS[7]), [2, 12]); // 6 und 8 sind Lücken
  assert.deepEqual(sorted(sim.NEIGHBORS[12]), [7, 11, 13, 17]);
  assert.deepEqual(sorted(sim.NEIGHBORS[24]), [19, 23]);
  for (const c of sim.CELLS) {
    for (const n of sim.NEIGHBORS[c]) assert.ok(!sim.HOLES.includes(n), `${c} grenzt an Lücke ${n}`);
  }
});

test('Nachbarschaft ist symmetrisch', () => {
  for (const c of sim.CELLS) {
    for (const n of sim.NEIGHBORS[c]) assert.ok(sim.NEIGHBORS[n].includes(c), `${c} → ${n}, aber nicht zurück`);
  }
});
