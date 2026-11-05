// Hilfsfunktionen für die Tests.
const sim = require('../sim_core.js');

// Baut einen Spielstand von Hand.
// open: { feld: wert } mit 0 = Joker, 2..14 = Rang (Ass = 14).
// Die offenen Karten werden aus dem unbekannten Rest herausgerechnet, genau wie im Spiel.
// layout: 'single' (Einzelfenster, Standard) oder 'double' (Doppelfenster).
function makeState({ decks = 1, jokers = 0, open = {}, layout = 'single' } = {}) {
  sim.setLayout(layout);
  const size = sim.layout().size;
  const st = { revealed: new Int8Array(size), value: new Int8Array(size), counts: new Int16Array(15), N: 0 };
  for (let r = 2; r <= 14; r++) st.counts[r] = 4 * decks;
  st.counts[0] = jokers;
  st.N = 52 * decks + jokers;
  for (const [cell, v] of Object.entries(open)) {
    st.value[cell] = v;
    sim.reveal(st, Number(cell));
  }
  return st;
}

const sorted = (a) => [...a].sort((x, y) => x - y);

module.exports = { sim, makeState, sorted };
