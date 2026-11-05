# Fenster-Simulator

Simulation für das Trinkspiel **Fenster aufmachen**. Die Frage dahinter: Wird das Spiel leichter oder schwerer, wenn man mit Jokern und der Sperrregel spielt, statt die Joker vorher auszusortieren?

Ein perfekter Spieler spielt dafür tausende Fenster von der ersten Karte bis zur Mitte durch, einmal ohne Joker und einmal mit Jokern. Danach werden beide Fälle verglichen.

## Ergebnis

Je 100.000 Spiele, Seed 2026, Weiterspielen ab 80 %:

| Blatt | Fall | Ø Züge bis das Fenster zu ist | Median | Ø verteilte Schlucke |
|---|---|---|---|---|
| 52 Karten | ohne Joker | 104,9 | 74 | 95 |
| 52 Karten | mit 2 Jokern und Sperre | 65,1 | 46 | 129 |
| 104 Karten | ohne Joker | 120,9 | 85 | 87 |
| 104 Karten | mit 6 Jokern und Sperre | 60,0 | 43 | 132 |

**Mit Jokern wird das Spiel deutlich leichter:** mit einem Blatt etwa 38 % weniger Züge, mit zwei Blättern etwa 50 % weniger. Außerdem werden mehr Schlucke verteilt. Felder neben einem offenen Joker sind fast sichere Karten. Die Sperrregel hält sie aus den Pflichtkarten heraus, danach nimmt sie der Spieler aber praktisch immer mit.

Die Schwelle ändert vor allem, wie schnell es geht. Mit einem Blatt:

| Weiterspielen ab | ohne Joker | mit 2 Jokern |
|---|---|---|
| nie (immer weitergeben) | 127,8 Züge | 59,2 Züge |
| 90 % | 121,0 Züge | 77,1 Züge |
| 80 % | 104,9 Züge | 65,1 Züge |
| 70 % | 94,7 Züge | 57,0 Züge |

Ohne Joker ändert die Schwelle nur die Zahl der Züge, nicht die Karten und Fehler: Alle wählen dieselbe beste Karte, egal wer gerade dran ist. Mit Jokern ist „nie weiterspielen“ überraschend schnell. Die Felder neben Jokern bleiben dann liegen, bis sonst nichts mehr frei ist, und helfen am Ende als fast sichere Pflichtkarten.

## Benutzen

**Im Browser:** `Fenster-Simulator.html` öffnen, ohne Installation und ohne Server. Die Seite rechnet beide Fälle mit Web Workern, zeigt währenddessen ein laufendes Beispielspiel und danach den Vergleich.

**Auf der Kommandozeile** (Node 18 oder neuer, keine Abhängigkeiten):

```bash
node cli.js                     # ganze Spiele, beide Fälle, 1 Blatt
node cli.js --blatt 2 --n 50000 # 2 Blätter, 50.000 Spiele pro Fall
node cli.js --modus zug         # einzelne Züge statt ganzer Spiele
node cli.js --json              # Ausgabe als JSON
```

Weitere Optionen: `--joker`, `--seed`, `--threads`, `--schwelle 70` (nach den Pflichtkarten weiter ab 70 % Trefferchance, Standard 80) oder `--schwelle aus` (immer sofort weitergeben). Gleicher Seed ergibt das gleiche Ergebnis, egal wie viele Threads rechnen.

## Regeln im Modell

Die wichtigsten Annahmen:

- Der Spieler wählt immer das Feld und die Wette mit der besten Trefferchance. Er darf bei jeder Karte an jeder Stelle weitermachen, die an eine offene Karte grenzt.
- Ein aufgedeckter Joker ist immer richtig. **Neben einem offenen Joker** ist jede Vorhersage richtig, außer die Karte ist selbst ein Joker.
- **Sperrregel:** In den drei Pflichtkarten sind Felder neben einem offenen Joker gesperrt, solange es ein anderes Feld gibt.
- **Weiterspielen:** Nach den Pflichtkarten deckt der Spieler freiwillig weiter auf und verteilt dafür Schlucke (§ 6). Er macht weiter, solange beides gilt:
  - Die beste Karte hat mindestens die Schwelle als Trefferchance (Standard 80 %, gleich für alle Spieler).
  - Sie lohnt sich: Trefferchance × Schlucke dieser Karte > Fehlerchance × (schon erspielte Schlucke + Schlucke, die er nach § 7 selbst trinken müsste).

  Felder neben einem Joker (um 98 %) nimmt er damit fast immer mit.
- **Fehler (§ 7):** Die falsche Karte und alle offenen Karten, die mit ihr zusammenhängen, kommen weg, Ecken eingeschlossen. Ecken werden wieder offen aufgelegt.
- Die Mitte ist Rot oder Schwarz, 50 : 50.

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
