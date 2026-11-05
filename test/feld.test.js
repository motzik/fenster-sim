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

// ----- Doppelfenster: zwei Fenster teilen sich die mittlere Spalte -----
test('Doppelfenster: 37 Felder, 8 Lücken, 6 Ecken, Mitte in der geteilten Spalte', () => {
  sim.setLayout('double');
  const L = sim.layout();
  assert.equal(L.cols, 9);
  assert.equal(L.cells.length, 37);
  assert.deepEqual(sorted(L.holes), [10, 12, 14, 16, 28, 30, 32, 34]);
  assert.deepEqual(sorted(L.corners), [0, 4, 8, 36, 40, 44]);
  assert.equal(L.mid, 22); // Reihe 3, Spalte 5
  sim.setLayout('single');
});

test('Doppelfenster: Mitte und alte Mitten M1/M2 haben je 4 Nachbarn', () => {
  sim.setLayout('double');
  const L = sim.layout();
  assert.deepEqual(sorted(L.neighbors[22]), [13, 21, 23, 31]);
  assert.deepEqual(sorted(L.neighbors[20]), [11, 19, 21, 29]); // M1
  assert.deepEqual(sorted(L.neighbors[24]), [15, 23, 25, 33]); // M2
  // Geteilte Spalte, Reihe 2: links und rechts Lücken, also nur oben und unten
  assert.deepEqual(sorted(L.neighbors[13]), [4, 22]);
  for (const c of L.cells) for (const n of L.neighbors[c]) assert.ok(L.neighbors[n].includes(c), `${c} → ${n} nicht symmetrisch`);
  sim.setLayout('single');
});

test('setLayout zurück auf Einzelfenster stellt alles wieder her', () => {
  sim.setLayout('double');
  sim.setLayout('single');
  assert.equal(sim.CELLS.length, 21);
  assert.deepEqual(sorted(sim.NEIGHBORS[7]), [2, 12]);
  assert.equal(sim.layout().mid, 12);
});
