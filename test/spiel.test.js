// Ganze Spiele: § 7 (Entfernen), Stapel, Spielende, Reproduzierbarkeit, Protokoll.
const test = require('node:test');
const assert = require('node:assert/strict');
const { sim, makeState, sorted } = require('./helpers.js');

test('component: nur offene Karten, die über offene Nachbarn zusammenhängen', () => {
  // Offen: obere Reihe 0..3 und Ecke 24. Falsch aufgedeckt: Feld 5 (unter der Ecke 0).
  const st = makeState({ open: { 0: 5, 1: 6, 2: 7, 3: 8, 24: 9 } });
  assert.deepEqual(sorted(sim.component(st, 5)), [0, 1, 2, 3, 5]); // 24 hängt nicht dran
});

test('component: Ecke ohne offene Nachbarn bleibt allein', () => {
  const st = makeState({ open: { 0: 5, 4: 5, 20: 5, 24: 5 } });
  assert.deepEqual(sorted(sim.component(st, 1)), [0, 1]);
});

test('failAt: Ecken liegen danach wieder offen, der Rest verdeckt, Schlucke stimmen', () => {
  const st = makeState({ open: { 0: 5, 1: 6, 2: 7 } });
  const g = { stack: [2, 3, 4, 10, 11], disc: [], open: 3, reshuffles: 0 };
  const stats = sim.emptyGameStats();
  st.value[3] = 13; // falsche Karte auf Feld 3
  sim.failAt(st, g, sim.makeRng(1), stats, 3);
  assert.equal(stats.sips, 3);           // 0, 1, 2 hängen an der falschen Karte
  assert.equal(stats.relaid, 4);
  assert.equal(st.revealed[0], 1);       // Ecke neu und offen
  for (const c of [1, 2, 3]) assert.equal(st.revealed[c], 0);
  assert.equal(g.open, 1);
  assert.deepEqual(sorted(g.disc), [5, 6, 7, 13]);
  assert.equal(g.stack.length, 1);
});

test('failAt: leerer Stapel wird aus den entfernten Karten neu gemischt', () => {
  const st = makeState({ open: { 0: 5, 1: 6 } });
  const g = { stack: [], disc: [], open: 2, reshuffles: 0 };
  st.value[2] = 9;
  sim.failAt(st, g, sim.makeRng(3), sim.emptyGameStats(), 2);
  assert.equal(g.reshuffles, 1);
  const now = [st.value[0], st.value[1], st.value[2], ...g.stack];
  assert.deepEqual(sorted(now), [5, 6, 9]); // keine Karte geht verloren, keine kommt dazu
});

for (const [decks, jokers] of [[1, 0], [1, 2]]) {
  test(`jedes Spiel endet (${decks} Blatt, ${jokers} Joker)`, () => {
    const st = sim.runGames({ decks, jokers, games: 300, seed: 11 });
    assert.equal(st.aborted, 0);
    assert.equal(st.games, 300);
    assert.equal(st.hist.reduce((a, b) => a + b, 0), 300);
    assert.ok(st.midTries >= st.games, 'die Mitte wird in jedem Spiel mindestens einmal gespielt');
    if (jokers === 0) assert.equal(st.changed, 0);
  });
}

test('keepPlaying: Schwelle und Schlucke müssen beide passen', () => {
  assert.equal(sim.keepPlaying(0.98, 0.8, 1, 0, 10), true);   // über der Schwelle, 0,98 > 0,02 · 10
  assert.equal(sim.keepPlaying(0.98, 0.8, 1, 0, 60), false);  // zu viel auf dem Spiel: 0,98 < 0,02 · 60
  assert.equal(sim.keepPlaying(0.85, 0.8, 1, 0, 4), true);    // 0,85 > 0,15 · 4 = 0,6
  assert.equal(sim.keepPlaying(0.85, 0.8, 1, 0, 8), false);   // 0,85 < 0,15 · 8 = 1,2
  assert.equal(sim.keepPlaying(0.75, 0.8, 5, 0, 0), false);   // unter der Schwelle, egal wie viel es bringt
});

test('Schwelle aus: nie freiwillig weiter, keine verteilten Schlucke', () => {
  const off = sim.runGames({ decks: 1, jokers: 2, games: 200, seed: 5, threshold: null });
  assert.equal(off.extraTries, 0);
  assert.equal(off.given, 0);
});

test('Schwelle an: Zusatzkarten, mit Jokern auch neben Jokern', () => {
  const on = sim.runGames({ decks: 1, jokers: 2, games: 200, seed: 5 }); // Standard 0,8
  assert.ok(on.extraTries > 0);
  assert.ok(on.extraJoker > 0);
  assert.ok(on.extraHits / on.extraTries > 0.8, 'nur Karten ab 80 % werden freiwillig gespielt');
  assert.ok(on.given > 0);
  const none = sim.runGames({ decks: 1, jokers: 0, games: 200, seed: 5 });
  assert.equal(none.extraJoker, 0);
});

test('Ohne Joker ändert die Schwelle nur die Züge, nicht die aufgedeckten Karten', () => {
  // Alle wählen dieselbe beste Karte. Ob der Spieler weitermacht oder der nächste übernimmt,
  // ergibt dieselbe Kartenfolge. Erst die Sperrregel (nur in Pflichtkarten) macht einen Unterschied.
  const a = sim.runGames({ decks: 1, jokers: 0, games: 300, seed: 9, threshold: null });
  const b = sim.runGames({ decks: 1, jokers: 0, games: 300, seed: 9, threshold: 0.8 });
  assert.equal(a.fails, b.fails);
  assert.equal(a.sips, b.sips);
  assert.ok(b.turns < a.turns);
});

test('Spiele: gleicher Seed, gleiches Ergebnis', () => {
  const cfg = { decks: 1, jokers: 2, games: 100, seed: 99 };
  assert.deepEqual(sim.runGames(cfg), sim.runGames(cfg));
});

test('traceGame spielt genau das Spiel, das runGames mit demselben Seed zählt', () => {
  for (const seed of [1, 2, 3]) {
    const tr = sim.traceGame({ decks: 1, jokers: 2, seed });
    const st = sim.runGames({ decks: 1, jokers: 2, games: 1, seed });
    assert.equal(tr.turns, st.turns);
    assert.equal(tr.log.filter((e) => e.t === 'fail').length, st.fails);
    assert.equal(tr.log[0].t, 'deal');
    assert.equal(tr.log[tr.log.length - 1].t, 'end');
  }
});

test('Protokoll: Spielfeld nachspielen ergibt am Ende ein volles Fenster', () => {
  const tr = sim.traceGame({ decks: 1, jokers: 2, seed: 4 });
  const open = new Array(25).fill(0);
  for (const e of tr.log) {
    if (e.t === 'deal' || e.t === 'fail') for (const [c, , o] of e.cells) open[c] = o;
    if (e.t === 'card' && e.hit) open[e.cell] = 1;
  }
  for (const c of sim.CELLS) assert.equal(open[c], 1, `Feld ${c} ist am Ende nicht offen`);
});
