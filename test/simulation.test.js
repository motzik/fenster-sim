// Ganze Läufe: Reproduzierbarkeit, Blockaufteilung, Konsistenz, Abgleich mit der HTML-Datei.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { sim } = require('./helpers.js');

const CHUNK = 25000;
const blockSeed = (seed, i) => (seed + i * 1000003) >>> 0; // wie im Browser

// Ganzzahlige Zähler müssen exakt stimmen. Summen aus Kommazahlen hängen von der Reihenfolge ab.
function assertSameStats(a, b) {
  for (const k of ['turns', 'pass3', 'mand', 'changed']) assert.equal(a[k], b[k], k);
  assert.deepEqual(a.attempts, b.attempts);
  assert.deepEqual(a.hits, b.hits);
  assert.ok(Math.abs(a.loss - b.loss) < 1e-6, 'loss');
  a.sumP.forEach((v, i) => assert.ok(Math.abs(v - b.sumP[i]) < 1e-6, `sumP[${i}]`));
}

test('gleicher Seed, gleiches Ergebnis', () => {
  const cfg = { decks: 1, jokers: 2, trials: 20000, seed: 42 };
  assert.deepEqual(sim.runBatch(cfg), sim.runBatch(cfg));
});

test('anderer Seed, anderes Ergebnis', () => {
  const a = sim.runBatch({ decks: 1, jokers: 2, trials: 20000, seed: 1 });
  const b = sim.runBatch({ decks: 1, jokers: 2, trials: 20000, seed: 2 });
  assert.notDeepEqual(a, b);
});

test('Ergebnis hängt nicht davon ab, wie die Blöcke auf Threads verteilt werden', () => {
  const blocks = [0, 1, 2, 3].map((i) =>
    sim.runBatch({ decks: 1, jokers: 2, trials: CHUNK, seed: blockSeed(2026, i) }));
  const forward = blocks.reduce(sim.mergeStats, sim.emptyStats());
  const backward = [...blocks].reverse().reduce(sim.mergeStats, sim.emptyStats());
  // Zwei "Threads": gerade und ungerade Blöcke getrennt, am Ende zusammengeführt.
  const even = sim.mergeStats(blocks[0], blocks[2]);
  const odd = sim.mergeStats(blocks[1], blocks[3]);
  assertSameStats(forward, backward);
  assertSameStats(forward, sim.mergeStats(odd, even));
});

for (const [decks, jokers] of [[1, 0], [1, 2], [2, 6]]) {
  test(`Konsistenz: beobachtet ≈ berechnet (${decks} Blatt, ${jokers} Joker)`, () => {
    const st = sim.runBatch({ decks, jokers, trials: 200000, seed: 7 });
    for (let i = 0; i < 4; i++) {
      const observed = st.hits[i] / st.attempts[i];
      const predicted = st.sumP[i] / st.attempts[i];
      assert.ok(Math.abs(observed - predicted) < 0.003,
        `Karte ${i + 1}: ${(observed * 100).toFixed(2)} % beobachtet, ${(predicted * 100).toFixed(2)} % berechnet`);
    }
    if (jokers === 0) assert.equal(st.changed, 0, 'ohne Joker darf die Sperre nie greifen');
  });
}

test('Schnelltest aus der Dokumentation: etwa 65,3 %', () => {
  const st = sim.runBatch({ decks: 1, jokers: 2, trials: 200000, seed: 1 });
  assert.ok(Math.abs(st.pass3 / st.turns - 0.653) < 0.005, String(st.pass3 / st.turns));
});

test('sim_core.js ist identisch mit dem Code in Fenster-Simulator.html', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'Fenster-Simulator.html'), 'utf8');
  const m = html.match(/<script type="text\/plain" id="sim-src">([\s\S]*?)<\/script>/);
  assert.ok(m, 'eingebetteter Code nicht gefunden');
  const core = fs.readFileSync(path.join(root, 'sim_core.js'), 'utf8');
  const norm = (s) => s.replace(/\r\n/g, '\n').trim();
  assert.equal(norm(m[1]), norm(core));
});
