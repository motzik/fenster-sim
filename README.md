# Fenster-Simulator

Simulation für das Trinkspiel **Fenster aufmachen**. Die Frage dahinter: Wird das Spiel leichter oder schwerer, wenn man mit Jokern und der Sperrregel spielt, statt die Joker vorher auszusortieren?

Ein perfekter Spieler spielt dafür tausende Fenster von der ersten Karte bis zur Mitte durch, einmal ohne Joker und einmal mit Jokern. Danach werden beide Fälle verglichen.

## Ergebnis

Je 100.000 Spiele, Seed 2026:

| Blatt | Fall | Ø Züge bis das Fenster zu ist | Median |
|---|---|---|---|
| 52 Karten | ohne Joker | 127,8 | 90 |
| 52 Karten | mit 2 Jokern und Sperre | 163,8 | 112 |
| 104 Karten | ohne Joker | 143,1 | 101 |
| 104 Karten | mit 6 Jokern und Sperre | 210,6 | 145 |

**Mit Jokern und Sperrregel wird das Spiel deutlich schwerer:** mit einem Blatt etwa 28 % mehr Züge, mit zwei Blättern etwa 47 % mehr. Der Grund ist die Sperre. Sie greift in echten Spielverläufen bei gut 10 % der Pflichtkarten und zwingt den Spieler dann auf ein schlechteres Feld.

## Benutzen

**Im Browser:** `Fenster-Simulator.html` öffnen, ohne Installation und ohne Server. Die Seite rechnet beide Fälle mit Web Workern, zeigt währenddessen ein laufendes Beispielspiel und danach den Vergleich.

**Auf der Kommandozeile** (Node 18 oder neuer, keine Abhängigkeiten):

```bash
node cli.js                     # ganze Spiele, beide Fälle, 1 Blatt
node cli.js --blatt 2 --n 50000 # 2 Blätter, 50.000 Spiele pro Fall
node cli.js --modus zug         # einzelne Züge statt ganzer Spiele
node cli.js --json              # Ausgabe als JSON
```

Weitere Optionen: `--joker`, `--seed`, `--threads`. Gleicher Seed ergibt das gleiche Ergebnis, egal wie viele Threads rechnen.

## Regeln im Modell

Die wichtigsten Annahmen:

- Der Spieler wählt immer das Feld und die Wette mit der besten Trefferchance. Er darf bei jeder Karte an jeder Stelle weitermachen, die an eine offene Karte grenzt.
- Ein Joker ist immer richtig, außer ein offener Joker liegt daneben. Dann zählt nur „Gleich“.
- **Sperrregel:** In den drei Pflichtkarten sind Felder neben einem offenen Joker gesperrt, solange es ein anderes Feld gibt.
- **Fehler (§ 7):** Die falsche Karte und alle offenen Karten, die mit ihr zusammenhängen, kommen weg, Ecken eingeschlossen. Ecken werden wieder offen aufgelegt.
- Nach drei Treffern gibt der Spieler weiter. Die Mitte ist Rot oder Schwarz, 50 : 50.

Das vollständige Regelwerk, alle Annahmen, offenen Fragen und bisherigen Ergebnisse stehen in [FENSTER_AUFMACHEN_KONTEXT.md](FENSTER_AUFMACHEN_KONTEXT.md).

## Aufbau

| Datei | Inhalt |
|---|---|
| `sim_core.js` | Simulationskern: Wetten, Sperrregel, ganze Spiele, Spielprotokoll. Läuft in Node und im Browser. |
| `Fenster-Simulator.html` | Browser-Oberfläche. Enthält eine Kopie von `sim_core.js`. |
| `cli.js` | Kommandozeile mit `worker_threads` |
| `test/` | Tests mit `node:test` |
| `scripts/sync-html.js` | Kopiert `sim_core.js` in die HTML-Datei |
| `Dockerfile` | Auslieferung der Seite über nginx |

## Entwickeln

```bash
npm test       # alle Tests
npm run sync   # nach jeder Änderung an sim_core.js
```

Den Simulationscode in der HTML-Datei nicht von Hand ändern. Ein Test prüft, dass er mit `sim_core.js` übereinstimmt.

## Deployment

Das `Dockerfile` liefert die Seite mit nginx auf Port 80 aus. In Coolify reicht das Build Pack **Dockerfile** mit Port 80.
