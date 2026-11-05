// ===== Fenster aufmachen: Simulation =====
// Zwei Fälle:
//   Fall 1: Joker werden vor dem Spiel aussortiert  (jokers = 0, Sperrregel hat nichts zu tun)
//   Fall 2: Es wird mit Jokern gespielt, Sperrregel immer aktiv (jokers >= 1)
//
// Modell eines Zuges mit perfektem Spieler:
//   - Der Spieler kennt alle offenen Karten und weiß, welche Karten noch unbekannt sind.
//   - Er wählt jedes Mal die verdeckte Karte und die Wette mit der höchsten Trefferchance.
//   - Karte 1 bis 3 sind Pflicht, dort gilt die Sperrregel:
//       Felder neben einem offenen Joker sind gesperrt, solange es ein anderes Feld gibt.
//   - Karte 4 ist freiwillig weitergespielt (keine Sperre).
//   - Beim ersten Fehler endet der Zug.

// Felder sind Indizes 0..24 (Zeile * 5 + Spalte). Wert 0 steht für einen Joker, 2..14 für die Ränge (Ass = 14).
var HOLES = [6, 8, 16, 18];
var CORNERS = [0, 4, 20, 24];
var MID = 12;
var CELLS = [];
var NEIGHBORS = {};
(function () {
  var i;
  for (i = 0; i < 25; i++) if (HOLES.indexOf(i) < 0) CELLS.push(i);
  var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  CELLS.forEach(function (cell) {
    var r = Math.floor(cell / 5), c = cell % 5, list = [];
    dirs.forEach(function (d) {
      var rr = r + d[0], cc = c + d[1];
      if (rr < 0 || rr > 4 || cc < 0 || cc > 4) return;
      var j = rr * 5 + cc;
      if (HOLES.indexOf(j) < 0) list.push(j);
    });
    NEIGHBORS[cell] = list;
  });
})();

// Zufallszahlen (mulberry32), damit ein Seed immer dasselbe Ergebnis liefert.
function makeRng(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sumRange(counts, lo, hi) {
  var s = 0;
  if (lo < 2) lo = 2;
  if (hi > 14) hi = 14;
  for (var r = lo; r <= hi; r++) s += counts[r];
  return s;
}

// Beste Wette für ein verdecktes Feld. Referenzkarten sind die offenen Nachbarn.
// Ein offener Joker ist keine Referenz. Liegt ein Joker daneben, gewinnt ein verdeckter Joker nur bei "Gleich".
function bestBet(cell, st) {
  var nb = NEIGHBORS[cell], vals = [], jokerNb = false, i, v;
  for (i = 0; i < nb.length; i++) {
    if (!st.revealed[nb[i]]) continue;
    v = st.value[nb[i]];
    if (v === 0) jokerNb = true;
    else if (vals.indexOf(v) < 0) vals.push(v);
  }
  vals.sort(function (x, y) { return x - y; });
  var c = st.counts, N = st.N;
  var jb = jokerNb ? 0 : c[0] / N;
  var best = jokerNb
    ? { p: c[0] / N, kind: 'jokereq', a: 0, b: 0, jok: false }
    : { p: -1, kind: 'none', a: 0, b: 0, jok: true };
  var p, j;
  for (i = 0; i < vals.length; i++) {
    v = vals[i];
    p = sumRange(c, v + 1, 14) / N + jb; if (p > best.p) best = { p: p, kind: 'gt', a: v, b: 0, jok: !jokerNb };
    p = sumRange(c, 2, v - 1) / N + jb;  if (p > best.p) best = { p: p, kind: 'lt', a: v, b: 0, jok: !jokerNb };
    p = c[v] / N + jb;                   if (p > best.p) best = { p: p, kind: 'eq', a: v, b: 0, jok: !jokerNb };
    for (j = i + 1; j < vals.length; j++) {
      p = sumRange(c, vals[i] + 1, vals[j] - 1) / N + jb;
      if (p > best.p) best = { p: p, kind: 'between', a: vals[i], b: vals[j], jok: !jokerNb };
      p = (sumRange(c, 2, vals[i] - 1) + sumRange(c, vals[j] + 1, 14)) / N + jb;
      if (p > best.p) best = { p: p, kind: 'outside', a: vals[i], b: vals[j], jok: !jokerNb };
    }
  }
  return best;
}

// Gewinnt die Wette mit der tatsächlich darunter liegenden Karte v?
function wins(bet, v) {
  if (v === 0) return bet.kind === 'jokereq' || bet.jok;
  switch (bet.kind) {
    case 'gt': return v > bet.a;
    case 'lt': return v < bet.a;
    case 'eq': return v === bet.a;
    case 'between': return v > bet.a && v < bet.b;
    case 'outside': return v < bet.a || v > bet.b;
    default: return false;
  }
}

// Wählt Feld und Wette. Mit restricted = true gilt die Sperrregel.
function pick(st, restricted) {
  var cand = [], i, k, cell, nb, adj, near, cellNear = {};
  for (i = 0; i < CELLS.length; i++) {
    cell = CELLS[i];
    if (st.revealed[cell] || cell === MID) continue;
    nb = NEIGHBORS[cell]; adj = false; near = false;
    for (k = 0; k < nb.length; k++) {
      if (st.revealed[nb[k]]) { adj = true; if (st.value[nb[k]] === 0) near = true; }
    }
    if (adj) { cand.push(cell); cellNear[cell] = near; }
  }
  if (restricted) {
    var ok = cand.filter(function (x) { return !cellNear[x]; });
    if (ok.length) cand = ok;
  }
  if (!cand.length) return null;
  var best = null, bet, bc = -1;
  for (i = 0; i < cand.length; i++) {
    bet = bestBet(cand[i], st);
    if (!best || bet.p > best.p) { best = bet; bc = cand[i]; }
  }
  best.cell = bc;
  return best;
}

function reveal(st, cell) {
  st.revealed[cell] = 1;
  st.counts[st.value[cell]]--;
  st.N--;
}

function emptyStats() {
  return { turns: 0, attempts: [0, 0, 0, 0], hits: [0, 0, 0, 0], sumP: [0, 0, 0, 0], pass3: 0, mand: 0, changed: 0, loss: 0 };
}

function mergeStats(a, b) {
  var out = emptyStats(), i;
  ['turns', 'pass3', 'mand', 'changed', 'loss'].forEach(function (k) { out[k] = a[k] + b[k]; });
  for (i = 0; i < 4; i++) {
    out.attempts[i] = a.attempts[i] + b.attempts[i];
    out.hits[i] = a.hits[i] + b.hits[i];
    out.sumP[i] = a.sumP[i] + b.sumP[i];
  }
  return out;
}

// Ein Zug ab dem aktuellen Spielstand.
function playTurn(st, stats) {
  var pos, free, chosen, res, hit;
  if (!pick(st, false)) return;
  stats.turns++;
  for (pos = 0; pos < 4; pos++) {
    free = pick(st, false);
    if (!free) return;
    chosen = free;
    if (pos < 3) {
      res = pick(st, true);
      stats.mand++;
      if (free.p - res.p > 1e-9) { stats.changed++; stats.loss += free.p - res.p; }
      chosen = res;
    }
    hit = wins(chosen, st.value[chosen.cell]);
    stats.attempts[pos]++;
    stats.sumP[pos] += chosen.p;
    if (!hit) return;
    stats.hits[pos]++;
    if (pos === 2) stats.pass3++;
    reveal(st, chosen.cell);
  }
}

// cfg: { decks, jokers, trials, seed, kMax }
// kMax: so viele Karten werden vor dem Zug zufällig zusätzlich aufgedeckt (0 bis kMax, gleich verteilt).
function runBatch(cfg) {
  var decks = cfg.decks, jokers = cfg.jokers, trials = cfg.trials;
  var kMax = cfg.kMax === undefined ? 12 : cfg.kMax;
  var rng = makeRng(cfg.seed);
  var deck = [], d, r, i, t;
  for (d = 0; d < decks; d++) for (r = 2; r <= 14; r++) for (i = 0; i < 4; i++) deck.push(r);
  for (i = 0; i < jokers; i++) deck.push(0);
  var base = new Int16Array(15);
  for (i = 0; i < deck.length; i++) base[deck[i]]++;
  var st = { revealed: new Int8Array(25), value: new Int8Array(25), counts: new Int16Array(15), N: 0 };
  var stats = emptyStats();
  for (t = 0; t < trials; t++) {
    // Die 21 Fensterkarten ziehen (Teil-Mischen reicht).
    for (i = 0; i < CELLS.length; i++) {
      var j = i + Math.floor(rng() * (deck.length - i));
      var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
      st.value[CELLS[i]] = deck[i];
    }
    st.revealed.fill(0);
    st.counts.set(base);
    st.N = deck.length;
    for (i = 0; i < CORNERS.length; i++) reveal(st, CORNERS[i]);
    // Zufälliger Spielfortschritt: Karten aufdecken, immer an eine offene Karte angrenzend.
    var k = Math.floor(rng() * (kMax + 1));
    while (k-- > 0) {
      var front = [], c, n, q;
      for (c = 0; c < CELLS.length; c++) {
        var cell = CELLS[c];
        if (st.revealed[cell] || cell === MID) continue;
        n = NEIGHBORS[cell];
        for (q = 0; q < n.length; q++) if (st.revealed[n[q]]) { front.push(cell); break; }
      }
      if (front.length <= 1) break;
      reveal(st, front[Math.floor(rng() * front.length)]);
    }
    playTurn(st, stats);
  }
  return stats;
}

// ===== Ganze Spiele =====
// Ein Fenster wird von Anfang bis Ende gespielt. Regeln, mit dem Autor geklärt:
//   § 7  Bei einem Fehler werden die falsche Karte und alle offenen Karten entfernt, die über
//        offene Nachbarn mit ihr zusammenhängen, Ecken eingeschlossen. Geschluckt wird für jede
//        offene Karte in diesem Zusammenhang (die falsche Karte selbst zählt nicht).
//        Die Felder werden aus dem Stapel neu belegt: Ecken offen, alle anderen verdeckt.
//        Danach beginnt derselbe Spieler seinen Zug erneut.
//   Stapel leer: Die entfernten Karten werden gemischt und bilden den neuen Stapel.
//   Weniger als drei verdeckte Karten: Pflicht sind nur noch die verdeckten Karten.
//   Mitte: Rot oder Schwarz, 50 : 50. Ein Joker gewinnt immer.
//   Strategie: Nach den Pflichtkarten gibt der Spieler sofort weiter.
// Der Spieler zählt keine Karten mit: Unbekannt ist für ihn alles, was nicht offen im Fenster liegt.
var GAME_BINS = 2000; // Histogramm der Züge pro Spiel, das letzte Fach sammelt alles darüber

function isCorner(cell) { return cell === 0 || cell === 4 || cell === 20 || cell === 24; }

// Alle offenen Karten, die über offene Nachbarn mit dem Feld start zusammenhängen, plus start selbst.
function component(st, start) {
  var seen = {}, list = [start], i, k, nb;
  seen[start] = 1;
  for (i = 0; i < list.length; i++) {
    nb = NEIGHBORS[list[i]];
    for (k = 0; k < nb.length; k++) {
      if (st.revealed[nb[k]] && !seen[nb[k]]) { seen[nb[k]] = 1; list.push(nb[k]); }
    }
  }
  return list;
}

function shuffle(arr, rng) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1)), t = arr[i];
    arr[i] = arr[j]; arr[j] = t;
  }
}

// Eine Karte vom Stapel. Ist er leer, werden die entfernten Karten gemischt.
function draw(g, rng) {
  if (!g.stack.length) { g.stack = g.disc; g.disc = []; shuffle(g.stack, rng); g.reshuffles++; }
  return g.stack.pop();
}

function emptyGameStats() {
  var hist = [];
  for (var i = 0; i <= GAME_BINS; i++) hist.push(0);
  return { games: 0, aborted: 0, turns: 0, turns2: 0, attempts: 0, fails: 0, sips: 0, relaid: 0,
    midTries: 0, midFails: 0, reshuffles: 0, mand: 0, changed: 0, loss: 0, hist: hist };
}

function mergeGameStats(a, b) {
  var out = emptyGameStats(), k, i;
  for (k in out) if (k !== 'hist') out[k] = a[k] + b[k];
  for (i = 0; i <= GAME_BINS; i++) out.hist[i] = a.hist[i] + b.hist[i];
  return out;
}

// Eine Pflichtkarte spielen. Liefert das Feld und ob die Vorhersage stimmte.
function playCard(st, rng, stats) {
  var free = pick(st, false);
  if (!free) {
    // Nur noch die Mitte ist verdeckt: Rot oder Schwarz.
    stats.midTries++;
    return { cell: MID, hit: st.value[MID] === 0 || rng() < 0.5, bet: { kind: 'color', p: 0.5, a: 0, b: 0 }, blocked: false };
  }
  var res = pick(st, true);
  stats.mand++;
  var blocked = free.p - res.p > 1e-9;
  if (blocked) { stats.changed++; stats.loss += free.p - res.p; }
  return { cell: res.cell, hit: wins(res, st.value[res.cell]), bet: res, blocked: blocked };
}

// Spielprotokoll für die Animation. Nur aktiv, wenn g.log ein Array ist.
function logCells(st, cells) {
  var out = [];
  for (var i = 0; i < cells.length; i++) out.push([cells[i], st.value[cells[i]], st.revealed[cells[i]]]);
  return out;
}

// § 7: falsche Karte und ihren offenen Zusammenhang entfernen und neu auflegen.
function failAt(st, g, rng, stats, cell) {
  var comp = component(st, cell), i, c;
  stats.fails++;
  stats.sips += comp.length - 1;
  stats.relaid += comp.length;
  if (cell === MID) stats.midFails++;
  for (i = 0; i < comp.length; i++) {
    c = comp[i];
    if (st.revealed[c]) { st.revealed[c] = 0; st.counts[st.value[c]]++; st.N++; g.open--; }
    g.disc.push(st.value[c]);
  }
  for (i = 0; i < comp.length; i++) {
    c = comp[i];
    st.value[c] = draw(g, rng);
    if (isCorner(c)) { reveal(st, c); g.open++; }
  }
  if (g.log) g.log.push({ t: 'fail', cells: logCells(st, comp), sips: comp.length - 1 });
}

// Spielt ein Fenster zu Ende. Gibt die Anzahl der Züge zurück oder -1 bei Abbruch.
function playGame(st, g, rng, stats, maxTurns, maxAttempts) {
  var turns = 0, attempts = 0, hits, need, r;
  while (turns < maxTurns) {
    turns++;
    hits = 0; need = Math.min(3, CELLS.length - g.open); attempts++;
    if (g.log) g.log.push({ t: 'turn', n: turns });
    while (hits < need) {
      r = playCard(st, rng, stats);
      if (g.log) g.log.push({ t: 'card', cell: r.cell, v: st.value[r.cell], hit: r.hit, kind: r.bet.kind, a: r.bet.a, b: r.bet.b, p: r.bet.p, blocked: r.blocked });
      if (r.hit) {
        reveal(st, r.cell); g.open++; hits++;
        if (r.cell === MID) { if (g.log) g.log.push({ t: 'end', n: turns }); return turns; }
      } else {
        failAt(st, g, rng, stats, r.cell);
        if (++attempts > maxAttempts) return -1;
        hits = 0; need = Math.min(3, CELLS.length - g.open);
      }
    }
  }
  return -1;
}

// cfg: { decks, jokers, games, seed, maxTurns, maxAttempts }
function runGames(cfg) {
  var rng = makeRng(cfg.seed), maxTurns = cfg.maxTurns || 5000, maxAttempts = cfg.maxAttempts || 50000;
  var deck = [], d, r, i, t, n;
  for (d = 0; d < cfg.decks; d++) for (r = 2; r <= 14; r++) for (i = 0; i < 4; i++) deck.push(r);
  for (i = 0; i < cfg.jokers; i++) deck.push(0);
  var base = new Int16Array(15);
  for (i = 0; i < deck.length; i++) base[deck[i]]++;
  var st = { revealed: new Int8Array(25), value: new Int8Array(25), counts: new Int16Array(15), N: 0 };
  var stats = emptyGameStats();
  for (t = 0; t < cfg.games; t++) {
    var g = { stack: deck.slice(), disc: [], open: 0, reshuffles: 0 };
    shuffle(g.stack, rng);
    st.revealed.fill(0);
    st.counts.set(base);
    st.N = deck.length;
    for (i = 0; i < CELLS.length; i++) st.value[CELLS[i]] = draw(g, rng);
    for (i = 0; i < CORNERS.length; i++) { reveal(st, CORNERS[i]); g.open++; }
    n = playGame(st, g, rng, stats, maxTurns, maxAttempts);
    stats.reshuffles += g.reshuffles;
    if (n < 0) { stats.aborted++; continue; }
    stats.games++;
    stats.turns += n;
    stats.turns2 += n * n;
    stats.hist[Math.min(n, GAME_BINS)]++;
  }
  return stats;
}

// Ein einzelnes Spiel mit Protokoll, zum Anschauen. cfg: { decks, jokers, seed }
// Ergebnis: { turns, log } mit den Ereignissen deal, turn, card, fail, end.
function traceGame(cfg) {
  var rng = makeRng(cfg.seed), deck = [], d, r, i;
  for (d = 0; d < cfg.decks; d++) for (r = 2; r <= 14; r++) for (i = 0; i < 4; i++) deck.push(r);
  for (i = 0; i < cfg.jokers; i++) deck.push(0);
  var st = { revealed: new Int8Array(25), value: new Int8Array(25), counts: new Int16Array(15), N: deck.length };
  for (i = 0; i < deck.length; i++) st.counts[deck[i]]++;
  var g = { stack: deck.slice(), disc: [], open: 0, reshuffles: 0, log: [] };
  shuffle(g.stack, rng);
  for (i = 0; i < CELLS.length; i++) st.value[CELLS[i]] = draw(g, rng);
  for (i = 0; i < CORNERS.length; i++) { reveal(st, CORNERS[i]); g.open++; }
  g.log.push({ t: 'deal', cells: logCells(st, CELLS) });
  var n = playGame(st, g, rng, emptyGameStats(), cfg.maxTurns || 5000, cfg.maxAttempts || 50000);
  return { turns: n, log: g.log };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runBatch: runBatch, emptyStats: emptyStats, mergeStats: mergeStats,
    runGames: runGames, traceGame: traceGame, emptyGameStats: emptyGameStats, mergeGameStats: mergeGameStats, GAME_BINS: GAME_BINS,
    // Für Tests: Feldaufbau und Einzelschritte
    HOLES: HOLES, CORNERS: CORNERS, MID: MID, CELLS: CELLS, NEIGHBORS: NEIGHBORS,
    makeRng: makeRng, bestBet: bestBet, wins: wins, pick: pick, reveal: reveal, playTurn: playTurn,
    component: component, failAt: failAt
  };
}
if (typeof self !== 'undefined' && typeof postMessage === 'function' && typeof document === 'undefined') {
  self.onmessage = function (e) {
    var m = e.data.mode;
    if (m === 'trace') postMessage({ id: e.data.id, trace: traceGame(e.data) });
    else postMessage({ id: e.data.id, stats: m === 'game' ? runGames(e.data) : runBatch(e.data) });
  };
}
