// bestBet, wins und pick an handgerechneten Beispielen.
// Feld 1 hat die Nachbarn 0 und 2. Darum dient es hier als Testfeld.
const test = require('node:test');
const assert = require('node:assert/strict');
const { sim, makeState } = require('./helpers.js');

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, `${a} ≠ ${b}`);

test('bestBet: eine Nachbarkarte, keine Joker', () => {
  // Offen: eine 2. Unbekannt: 51 Karten, davon 48 höher.
  const bet = sim.bestBet(1, makeState({ open: { 0: 2 } }));
  assert.equal(bet.kind, 'gt');
  assert.equal(bet.a, 2);
  near(bet.p, 48 / 51);
});

test('bestBet: Gleichstand zwischen Drüber und Drunter bleibt bei Drüber', () => {
  // Offen: eine 8. Höher: 24, niedriger: 24, gleich: 3 (von 51).
  const bet = sim.bestBet(1, makeState({ open: { 0: 8 } }));
  assert.equal(bet.kind, 'gt');
  near(bet.p, 24 / 51);
});

test('bestBet: Nicht dazwischen schlägt Drüber und Drunter', () => {
  // Offen: 7 und 9. Unbekannt: 50. Unter 7: 20, über 9: 20. Nicht dazwischen: 40.
  const bet = sim.bestBet(1, makeState({ open: { 0: 7, 2: 9 } }));
  assert.equal(bet.kind, 'outside');
  assert.deepEqual([bet.a, bet.b], [7, 9]);
  near(bet.p, 40 / 50);
});

test('bestBet: verdeckter Joker zählt als Treffer, wenn kein Joker daneben liegt', () => {
  // 54 Karten, eine 2 offen, also 53 unbekannt. Höher: 48, dazu 2 Joker.
  const bet = sim.bestBet(1, makeState({ jokers: 2, open: { 0: 2 } }));
  assert.equal(bet.kind, 'gt');
  assert.equal(bet.jok, true);
  near(bet.p, 50 / 53);
});

test('bestBet: Joker daneben, alles richtig außer ein Joker', () => {
  // 54 Karten, ein Joker offen, 53 unbekannt, davon 1 Joker. Richtig sind die 52 anderen.
  const bet = sim.bestBet(1, makeState({ jokers: 2, open: { 0: 0 } }));
  assert.equal(bet.kind, 'jokerfree');
  assert.equal(bet.jok, false);
  near(bet.p, 52 / 53);
});

test('bestBet: Joker und normale Karte daneben, der Joker zählt', () => {
  // Offen: ein Joker auf Feld 0 und ein Ass auf Feld 2. Unbekannt: 52, davon 1 Joker.
  // "Drunter Ass" hätte 48 / 52, die Joker-Wette 51 / 52.
  const bet = sim.bestBet(1, makeState({ jokers: 2, open: { 0: 0, 2: 14 } }));
  assert.equal(bet.kind, 'jokerfree');
  near(bet.p, 51 / 52);
});

test('wins: alle Wettarten mit Gleichstand an der Grenze', () => {
  const W = (kind, a, b = 0) => ({ kind, a, b, jok: true });
  assert.equal(sim.wins(W('gt', 8), 9), true);
  assert.equal(sim.wins(W('gt', 8), 8), false);
  assert.equal(sim.wins(W('lt', 8), 7), true);
  assert.equal(sim.wins(W('lt', 8), 8), false);
  assert.equal(sim.wins(W('eq', 8), 8), true);
  assert.equal(sim.wins(W('eq', 8), 9), false);
  assert.equal(sim.wins(W('between', 5, 10), 7), true);
  assert.equal(sim.wins(W('between', 5, 10), 5), false); // Gleichstand verliert
  assert.equal(sim.wins(W('between', 5, 10), 10), false);
  assert.equal(sim.wins(W('outside', 5, 10), 4), true);
  assert.equal(sim.wins(W('outside', 5, 10), 11), true);
  assert.equal(sim.wins(W('outside', 5, 10), 5), false); // Gleichstand verliert auch hier
  assert.equal(sim.wins(W('outside', 5, 10), 10), false);
});

test('wins: Joker', () => {
  assert.equal(sim.wins({ kind: 'gt', a: 8, jok: true }, 0), true);   // kein Joker daneben
  assert.equal(sim.wins({ kind: 'gt', a: 8, jok: false }, 0), false); // Joker daneben, falsche Wette
  assert.equal(sim.wins({ kind: 'jokerfree', a: 0, jok: false }, 5), true);  // neben Joker: alles richtig
  assert.equal(sim.wins({ kind: 'jokerfree', a: 0, jok: false }, 14), true);
  assert.equal(sim.wins({ kind: 'jokerfree', a: 0, jok: false }, 0), false); // außer ein Joker
});

test('pick: Sperrregel meidet Felder neben einem offenen Joker', () => {
  // Joker in der Ecke 0, sonst normale Ecken. Gesperrt: 1 und 5.
  const st = makeState({ jokers: 2, open: { 0: 0, 4: 5, 20: 5, 24: 5 } });
  const res = sim.pick(st, true);
  assert.ok(![1, 5].includes(res.cell), `Feld ${res.cell} ist gesperrt`);
});

test('pick: Sperre entfällt, wenn es keine andere Stelle gibt', () => {
  const st = makeState({ jokers: 2, open: { 0: 0 } });
  const res = sim.pick(st, true);
  assert.ok([1, 5].includes(res.cell));
  assert.equal(res.kind, 'jokerfree');
});

test('pick: ohne Sperre nimmt der Spieler das leichte Feld neben dem Joker', () => {
  const st = makeState({ jokers: 2, open: { 0: 0, 4: 5, 20: 5, 24: 5 } });
  const res = sim.pick(st, false);
  assert.ok([1, 5].includes(res.cell));
  assert.equal(res.kind, 'jokerfree');
});
