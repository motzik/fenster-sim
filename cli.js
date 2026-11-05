#!/usr/bin/env node
// Fenster aufmachen: Simulation auf der Kommandozeile.
//
//   node cli.js                          ganze Spiele, Fall 1 und Fall 2 mit 1 Blatt
//   node cli.js --modus zug              einzelne Züge wie bisher
//   node cli.js --blatt 2 --n 50000      2 Blätter, 50.000 Spiele
//   node cli.js --joker 4                nur Fall 2 mit 4 Jokern
//   node cli.js --json                   Ausgabe als JSON
//   node cli.js --schwelle 70            nach den Pflichtkarten weiter ab 70 % Trefferchance (Standard 80)
//   node cli.js --schwelle aus           nach den Pflichtkarten immer sofort weitergeben
//   node cli.js --feld doppel            Doppelfenster (zwei Fenster mit geteilter Mittelspalte)
//
// Die Arbeit wird in feste Blöcke geteilt (Seed pro Block: seed + i * 1000003).
// Das Ergebnis hängt deshalb nicht von der Anzahl der Threads ab.
const { Worker, isMainThread, parentPort } = require('node:worker_threads');
const os = require('node:os');
const sim = require('./sim_core.js');

if (!isMainThread) {
  parentPort.on('message', (job) => {
    parentPort.postMessage({ id: job.id, stats: job.mode === 'game' ? sim.runGames(job) : sim.runBatch(job) });
  });
  return;
}

function parseArgs(argv) {
  const o = { modus: 'spiel', blatt: 1, joker: null, n: null, seed: 2026, threads: os.availableParallelism ? os.availableParallelism() : os.cpus().length, json: false, schwelle: '80', feld: 'einzel' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') o.json = true;
    else if (a === '--help' || a === '-h') o.help = true;
    else if (a.startsWith('--')) o[a.slice(2)] = argv[++i];
  }
  o.blatt = parseInt(o.blatt, 10);
  o.seed = parseInt(o.seed, 10);
  o.threads = Math.max(1, parseInt(o.threads, 10));
  if (o.modus !== 'spiel' && o.modus !== 'zug') throw new Error('--modus muss spiel oder zug sein');
  if (![1, 2].includes(o.blatt)) throw new Error('--blatt muss 1 oder 2 sein');
  if (o.schwelle === 'aus') o.threshold = null;
  else {
    o.threshold = parseFloat(o.schwelle) / 100;
    if (!(o.threshold >= 0 && o.threshold <= 1)) throw new Error('--schwelle muss zwischen 0 und 100 liegen oder aus sein');
  }
  if (o.feld !== 'einzel' && o.feld !== 'doppel') throw new Error('--feld muss einzel oder doppel sein');
  o.layout = o.feld === 'doppel' ? 'double' : 'single';
  const big = o.layout === 'double';
  o.n = o.n === null ? (o.modus === 'spiel' ? (big ? 2000 : 20000) : 1000000) : parseInt(o.n, 10);
  return o;
}

function runParallel({ mode, decks, jokers, total, seed, threads, threshold, layout }) {
  const chunk = mode === 'game' ? (layout === 'double' ? 100 : 500) : 25000;
  const jobs = [];
  for (let i = 0; i * chunk < total; i++) {
    const n = Math.min(chunk, total - i * chunk);
    jobs.push({ id: i, mode, decks, jokers, threshold, layout, seed: (seed + i * 1000003) >>> 0, trials: n, games: n });
  }
  const results = new Array(jobs.length);
  let next = 0, done = 0;
  return new Promise((resolve, reject) => {
    const workers = [];
    const nW = Math.min(threads, jobs.length);
    const give = (w) => { if (next < jobs.length) w.postMessage(jobs[next++]); };
    for (let k = 0; k < nW; k++) {
      const w = new Worker(__filename);
      w.on('error', reject);
      w.on('message', (m) => {
        results[m.id] = m.stats;
        done++;
        if (process.stderr.isTTY) process.stderr.write(`\r  ${Math.round(done / jobs.length * 100)} %`);
        if (done === jobs.length) {
          workers.forEach((x) => x.terminate());
          if (process.stderr.isTTY) process.stderr.write('\r       \r');
          // In fester Blockreihenfolge zusammenführen, damit auch die Kommazahlen exakt gleich sind.
          const merge = mode === 'game' ? sim.mergeGameStats : sim.mergeStats;
          resolve(results.reduce(merge, mode === 'game' ? sim.emptyGameStats() : sim.emptyStats()));
        } else give(w);
      });
      workers.push(w);
      give(w);
    }
  });
}

function quantile(hist, total, q) {
  let acc = 0;
  for (let i = 0; i < hist.length; i++) { acc += hist[i]; if (acc >= q * total) return i; }
  return hist.length - 1;
}

function summarizeGames(s) {
  const n = s.games, mean = s.turns / n;
  const sd = Math.sqrt(Math.max(0, s.turns2 / n - mean * mean));
  const top = sim.GAME_BINS;
  return {
    spiele: n, abbrueche: s.aborted,
    zuegeMittel: mean, zuegeCI95: 1.96 * sd / Math.sqrt(n),
    zuegeMedian: quantile(s.hist, n, 0.5), zuege90: quantile(s.hist, n, 0.9),
    zuegeUeber: s.hist[top] ? `${s.hist[top]} Spiele mit ${top} oder mehr Zügen` : null,
    fehlversucheMittel: s.fails / n, schluckeMittel: s.sips / n, neuAufgelegtMittel: s.relaid / n,
    zusatzMittel: s.extraTries / n, zusatzJokerMittel: s.extraJoker / n, zusatzTrefferquote: s.extraTries ? s.extraHits / s.extraTries : 0, verteiltMittel: s.given / n,
    mitteFehlerMittel: s.midFails / n, neuGemischtMittel: s.reshuffles / n,
    sperreAnteil: s.mand ? s.changed / s.mand : 0, sperreVerlust: s.changed ? s.loss / s.changed : 0,
  };
}

function summarizeTurns(s) {
  const p = s.pass3 / s.turns;
  return {
    zuege: s.turns, dreiPflicht: p, dreiPflichtCI95: 1.96 * Math.sqrt(p * (1 - p) / s.turns),
    trefferquote: s.hits.map((h, i) => h / s.attempts[i]),
    sperreAnteil: s.mand ? s.changed / s.mand : 0, sperreVerlust: s.changed ? s.loss / s.changed : 0,
  };
}

const num = (x, d = 1) => x.toLocaleString('de-AT', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (x, d = 2) => num(x * 100, d) + ' %';

function printTable(rows, mode) {
  const head = mode === 'game'
    ? ['Fall', 'Joker', 'Spiele', 'Ø Züge', '± 95 %', 'Median', '90 %', 'Ø Fehler', 'Ø getrunken §7', 'Ø Zusatz', 'davon Joker', 'Ø verteilt §6', 'Sperre greift']
    : ['Fall', 'Joker', 'Züge', '3 Pflichtkarten', '± 95 %', 'Karte 1/2/3/4', 'Sperre greift'];
  const body = rows.map(({ fall, jokers, r }) => mode === 'game'
    ? [fall, jokers, r.spiele.toLocaleString('de-AT'), num(r.zuegeMittel), num(r.zuegeCI95), r.zuegeMedian, r.zuege90,
      num(r.fehlversucheMittel), num(r.schluckeMittel, 0), num(r.zusatzMittel), jokers ? num(r.zusatzJokerMittel) : '–', num(r.verteiltMittel), jokers ? pct(r.sperreAnteil) : '–']
    : [fall, jokers, r.zuege.toLocaleString('de-AT'), pct(r.dreiPflicht), num(r.dreiPflichtCI95 * 100, 2),
      r.trefferquote.map((x) => num(x * 100)).join(' / '), jokers ? pct(r.sperreAnteil) : '–']);
  const all = [head, ...body].map((r) => r.map(String));
  const w = head.map((_, i) => Math.max(...all.map((r) => r[i].length)));
  const line = (r) => r.map((c, i) => (i < 2 ? c.padEnd(w[i]) : c.padStart(w[i]))).join('  ');
  console.log(line(all[0]));
  console.log(w.map((x) => '─'.repeat(x)).join('  '));
  all.slice(1).forEach((r) => console.log(line(r)));
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.help) { console.log(require('node:fs').readFileSync(__filename, 'utf8').split('\n').slice(1, 11).join('\n')); return; }
  const mode = o.modus === 'spiel' ? 'game' : 'turn';
  const defaultJokers = o.blatt === 1 ? 2 : 6;
  const cases = o.joker === null
    ? [{ fall: '1 · ohne Joker', jokers: 0 }, { fall: '2 · mit Sperre', jokers: defaultJokers }]
    : [{ fall: parseInt(o.joker, 10) ? '2 · mit Sperre' : '1 · ohne Joker', jokers: parseInt(o.joker, 10) }];
  const rows = [];
  for (const c of cases) {
    const t0 = Date.now();
    const stats = await runParallel({ mode, decks: o.blatt, jokers: c.jokers, total: o.n, seed: o.seed, threads: o.threads, threshold: o.threshold, layout: o.layout });
    const r = mode === 'game' ? summarizeGames(stats) : summarizeTurns(stats);
    rows.push({ ...c, r, sekunden: (Date.now() - t0) / 1000 });
  }
  if (o.json) {
    console.log(JSON.stringify({ modus: o.modus, blatt: o.blatt, seed: o.seed, feld: o.feld, schwelle: o.threshold, faelle: rows }, null, 2));
    return;
  }
  console.log(`\nFenster aufmachen · ${o.feld === 'doppel' ? 'Doppelfenster' : 'Einzelfenster'} · ${o.modus === 'spiel' ? 'ganze Spiele' : 'einzelne Züge'} · ${o.blatt * 52} Karten · Schwelle ${o.threshold === null ? 'aus' : Math.round(o.threshold * 100) + ' %'} · Seed ${o.seed} · ${o.threads} Threads\n`);
  printTable(rows, mode);
  rows.forEach((x) => { if (x.r.zuegeUeber) console.log(`\nHinweis (${x.fall}): ${x.r.zuegeUeber}.`); });
  console.log(`\nRechenzeit: ${rows.map((x) => num(x.sekunden) + ' s').join(', ')}`);
}

main().catch((e) => { console.error('Fehler:', e.message); process.exit(1); });
