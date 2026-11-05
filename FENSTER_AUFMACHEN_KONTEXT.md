# Fenster aufmachen: Kontext für Claude Code

Diese Datei fasst zusammen, was in der bisherigen Unterhaltung erarbeitet wurde. Sie kann als `CLAUDE.md` ins Projekt gelegt oder Claude Code als erste Nachricht gegeben werden. Sprache der Projektdokumentation und der Oberfläche: Deutsch (Österreich).

## 1. Ziel

Für das Trinkspiel **Fenster aufmachen** wird ein Regelwerk geschrieben. Eine geplante Zusatzregel mit Jokern soll statistisch bewertet werden. Gefragt ist, ob das Spiel dadurch leichter oder schwerer wird, und wie stark.

Zwei Fälle werden verglichen. Eine Variante ohne Sperrregel ist ausdrücklich keine Option.

1. **Fall 1:** Joker werden vor dem Spiel aussortiert. Die Sperrregel entfällt, weil es keine Joker gibt.
2. **Fall 2:** Es wird mit Jokern gespielt, und die Sperrregel gilt immer.

## 2. Basisregeln (Wortlaut des Autors)

**§ 1 Spielmaterial:** Gespielt wird mit einem französischen Blatt (Rommé-Karten) ohne Joker.

**§ 2 Spielaufbau:** Es wird ein Fenster aus 5 × 5 Karten verdeckt ausgelegt. In der zweiten und vierten Reihe bleiben jeweils die zweite und vierte Position frei. Das Fenster besteht somit aus 21 Karten. Die vier Eckkarten werden aufgedeckt. Die mittlere Karte wird stets als letzte Karte des Spiels aufgedeckt.

**§ 3 Spielbeginn und Spielrichtung:** Der jüngste Mitspieler beginnt. Gespielt wird im Uhrzeigersinn.

**§ 4 Aufdecken von Karten:** Es dürfen nur Karten aufgedeckt werden, die direkt an eine bereits aufgedeckte Karte grenzen. Vor dem Aufdecken muss der Spieler eine Vorhersage treffen:
- Neben einer einzelnen aufgedeckten Karte: „Drüber“ oder „Drunter“.
- Zwischen zwei aufgedeckten Karten: „Dazwischen“ oder „Nicht dazwischen“.
- Bei jeder Karte außer der Letzten zulässig: „Gleich“.
- Bei der mittleren (letzten) Karte: „Rot“ oder „Schwarz“.

Trifft die Vorhersage zu, gilt die Karte als richtig aufgedeckt.

**§ 5 Ablauf eines Zuges:** In jedem Zug müssen mindestens drei Karten richtig aufgedeckt werden. Nach drei richtig aufgedeckten Karten darf der Spieler an den nächsten Mitspieler weitergeben oder freiwillig weiterspielen.

**§ 6 Verteilen von Schlucken:** Für jede richtig aufgedeckte Karte über die dritte hinaus darf der Spieler Schlucke verteilen. Die vierte Karte bringt 1 Schluck, die fünfte 2, die sechste 3 usw. Die Schlucke werden aufsummiert. (Im Original folgt danach eine Tabelle, die in der Unterhaltung fehlte. Vermutet wird 1, 3, 6, 10 usw. Das ist zu bestätigen.) Schlucke dürfen ausschließlich nach einem erfolgreichen Zug verteilt werden.

**§ 7 Fehlversuch:** Wird eine Karte falsch vorhergesagt, trinkt der Spieler so viele Schlucke, wie aufgedeckte Karten mit der falschen Karte verbunden sind. Bereits erspielte Schlucke dieses Zuges verfallen. Die verbundenen Karten werden entfernt und neu aufgelegt. Der Spieler beginnt seinen Zug erneut und muss wieder mindestens drei Karten richtig aufdecken.

**§ 8 Spielende:** Das Spiel endet, sobald alle Karten richtig aufgedeckt sind. Alle Mitspieler außer dem Spieler, der das Fenster beendet hat, müssen ihr Getränk austrinken. Im Regelfall wird anschließend ein neues Fenster geöffnet.

### Feldaufbau (Index 0 bis 24, Zeile mal 5 plus Spalte)

```
 E  ■  ■  ■  E        E = Ecke, zu Beginn offen (0, 4, 20, 24)
 ■  ·  ■  ·  ■        · = frei (6, 8, 16, 18)
 ■  ■  M  ■  ■        M = Mitte (12), wird als letzte aufgedeckt
 ■  ·  ■  ·  ■
 E  ■  ■  ■  E
```

## 3. Zusatzregel: Joker und Sperrregel

Wortlaut des Autors, mit Klarstellung aus dem Gespräch:

- Es sind Joker dabei. Ein Joker ist immer richtig, außer es liegt ein anderer Joker daneben. Dann hätte man „Gleich“ sagen müssen.
- **Sperrregel:** Falls möglich, darf eine Karte neben einem offenen Joker erst aufgedeckt werden, wenn der Spieler seine drei Pflichtkarten schon hat. Der Spieler muss also an einer anderen Stelle weitermachen. Ein Joker, der selbst aufgedeckt wird, ist erlaubt, es geht nur um die Karten daneben. Eine Karte neben einer normalen Karte aufzudecken ist immer in Ordnung, auch wenn diese ein Joker ist (gemeint: die aufgedeckte Karte darf ein Joker sein).
- Gibt es keine andere erlaubte Stelle, entfällt die Sperre.

## 4. Offene Regelfragen (bisher nicht entschieden)

Die Simulation trifft dafür die Annahmen aus Abschnitt 5. Falls das Regelwerk anders entscheidet, muss die Simulation angepasst werden.

- Zählen diagonale Nachbarn? (Annahme: nein.)
- Wenn eine verdeckte Karte an mehrere offene grenzt: Welche Referenz zählt? (Annahme: der Spieler darf jede einzelne Nachbarkarte für Drüber/Drunter/Gleich und jedes Paar für Dazwischen/Nicht dazwischen wählen.)
- Ass hoch oder niedrig? (Annahme: hoch.)
- Gilt „Dazwischen“ bei Gleichstand mit einer Grenzkarte? (Annahme: Gleichstand verliert bei Dazwischen und bei Nicht dazwischen.)
- „Verbundene Karten“ in § 7: wie viele genau, und zählt die falsche Karte selbst mit? Ein Beispiel im Regelwerk fehlt.
- § 5: Muss man nach drei Treffern sofort entscheiden, oder erst bei Misserfolg?
- Ein Feld, das an einen offenen Joker und an eine normale offene Karte grenzt: gesperrt oder erlaubt? (Annahme: gesperrt, solange ein anderes Feld ohne Joker-Nachbarn existiert.)
- ~~Wie wird ein offener Joker als Referenz behandelt?~~ Entschieden: Daneben ist alles richtig außer ein Joker (siehe unten).

### Vom Autor entschieden (5. November 2026, für die Spielsimulation)

- **§ 7, verbundene Karten:** Entfernt werden die falsche Karte und alle offenen Karten, die über offene Nachbarn mit ihr zusammenhängen. Ecken zählen mit. Das ist oft sehr viel oder alles. Annahme dazu: Getrunken wird pro offener Karte in diesem Zusammenhang, die falsche Karte selbst zählt nicht. Entfernte Ecken werden wieder offen aufgelegt, alle anderen Felder verdeckt. Sonst gäbe es keine Stelle zum Weiterspielen.
- **Stapel leer:** Die entfernten Karten werden gemischt und bilden den neuen Stapel.
- **Weniger als drei verdeckte Karten:** Die Pflicht von drei Karten gilt dann nicht mehr. Modell: Pflicht sind nur noch die verdeckten Karten.
- **Mitte:** Ein Joker gewinnt auch dort immer. Sonst Rot oder Schwarz 50 : 50 (Farben werden nicht simuliert).
- **§ 5, Strategie:** Nach drei Treffern gibt der Spieler immer weiter.
- **Freie Wahl des Feldes:** Bei jeder Karte darf an jeder Stelle weitergemacht werden, die an eine offene Karte grenzt. Man muss nicht bei der zuletzt aufgedeckten Karte anschließen.
- **Feld neben einem offenen Joker:** Jede Vorhersage ist richtig, außer die aufgedeckte Karte ist selbst ein Joker (dann hätte man „Gleich“ sagen müssen). Das ersetzt die frühere Annahme „Ein offener Joker ist keine Referenz“. Genau deshalb gibt es die Sperrregel: Diese fast sicheren Karten dürfen nicht für die Pflichtkarten genutzt werden.
- **Weiterspielen nach den Pflichtkarten (neu, ersetzt „Gratiskarten“ und „immer weitergeben“):** Der Spieler deckt freiwillig weiter auf und verteilt dafür nach § 6 Schlucke. Er nimmt jeweils die beste Karte (ohne Sperre) und macht weiter, solange `p ≥ Schwelle` und `p · Gewinn > (1 − p) · (erspielte Schlucke + Schlucke nach § 7 bei einem Fehler)`. Die Schwelle ist ein Wert für alle Spieler, Standard 80 % (`--schwelle`, im Browser „Weiterspielen ab“). Felder neben Jokern (um 98 %) fallen fast immer darunter. Eine Normalverteilung der Schwelle pro Spieler (z. B. 80 % ± 7,5 %) ist vorgeschlagen, aber noch nicht eingebaut.
- **Folge ohne Joker:** Alle Spieler wählen dieselbe beste Karte. Ob ein Spieler weitermacht oder der nächste übernimmt, ergibt dann genau dieselbe Kartenfolge und dieselben Fehler. Die Schwelle ändert ohne Joker nur die Zahl der Züge und die verteilten Schlucke. Mit Jokern ist das anders, weil die Sperre nur für Pflichtkarten gilt.

### Doppelfenster (zweiter Spielmodus, vom Autor festgelegt)

Zwei Fenster liegen nebeneinander und teilen sich die mittlere Spalte: 5 × 9 Felder (Index Zeile · 9 + Spalte), Lücken 10, 12, 14, 16, 28, 30, 32, 34, also 37 Karten.

```
 E  ■  ■  ■  E  ■  ■  ■  E
 ■  ·  ■  ·  ■  ·  ■  ·  ■
 ■  ■  M1 ■  M  ■  M2 ■  ■
 ■  ·  ■  ·  ■  ·  ■  ·  ■
 E  ■  ■  ■  E  ■  ■  ■  E
```

- 6 Ecken, zu Beginn offen (0, 4, 8, 36, 40, 44). Auch die zwei Ecken auf der geteilten Spalte.
- Die Mitte der geteilten Spalte (Feld 22) verhält sich wie die alte Mitte: Sie kommt zuletzt, Rot oder Schwarz.
- M1 und M2 (die Mitten der Einzelfenster) sind normale Karten, von Anfang an aufdeckbar.
- Bei mehr als zwei offenen Nachbarn darf man zwei beliebige für „Dazwischen“ und „Nicht dazwischen“ wählen. Das Modell probiert dafür alle Paare durch (gilt auch im Einzelfenster).
- Alles andere wie im Einzelfenster. Im Code: `setLayout('double')` bzw. `cfg.layout = 'double'`, CLI `--feld doppel`.

## 5. Modell der Simulation

Ein perfekter Spieler spielt einen Zug:

1. Zufälliger Spielstand: Die 21 Fensterkarten werden zufällig aus dem Stapel gezogen. Die vier Ecken sind offen. Danach werden zufällig 0 bis 12 weitere Karten aufgedeckt, immer an eine offene Karte angrenzend. Die Mitte bleibt zu.
2. Der Spieler kennt alle offenen Karten und rechnet mit dem, was noch unbekannt ist (Stapel minus offene Karten). Alle verdeckten Karten sind für ihn gleich wahrscheinlich.
3. Er wählt jedes Mal das verdeckte Feld und die Wette mit der höchsten Trefferchance.
4. Karte 1 bis 3 sind Pflicht, dort gilt die Sperrregel. Karte 4 wird freiwillig gespielt, dort gilt keine Sperre.
5. Beim ersten Fehler endet der Zug. Gemessen werden Trefferquote pro Kartenposition und die Chance auf drei richtige Karten.
6. Zusätzlich wird erfasst, wie oft die Sperrregel den besten Zug ändert und wie viele Prozentpunkte Trefferchance das kostet.

Joker im Modell:

- Ein verdeckter Joker gewinnt jede Wette, solange kein offener Joker neben dem Feld liegt.
- Liegt ein offener Joker neben dem Feld, ist die Wette `jokerfree`: richtig ist alles außer ein Joker. Trefferchance (unbekannte Karten − unbekannte Joker) / unbekannte Karten, mit einem Blatt meist um 98 %.
- Ein Joker im Stapel verkleinert die Chancen der normalen Wetten, weil sich der Nenner um ihn vergrößert, hebt sie aber durch den Joker-Gewinn wieder an.
- (Bis 5. November 2026 galt hier die Annahme, dass ein offener Joker keine Referenz ist. Felder daneben gewannen dann nur mit „Gleich (Joker)“.)

Zufallszahlen: mulberry32 mit Seed. Der Browser teilt die Züge in feste Blöcke zu 25.000 mit Seed `seed + blockIndex * 1000003`. Dadurch ist das Ergebnis unabhängig von der Anzahl der Threads reproduzierbar.

## 6. Bisherige Ergebnisse

> **Überholt:** Alle Ergebnisse in diesem Abschnitt bis zur Überschrift „Ganze Spiele mit Joker-Nachbarn und Gratiskarten“ beruhen noch auf der alten Annahme, dass ein offener Joker keine Referenz ist. Felder daneben waren damit fast unmöglich statt fast sicher. Die Zahlen stehen nur noch zum Nachvollziehen hier.

Je 1.000.000 simulierte Züge, Seed 2026, mit dem Code aus Abschnitt 8.

| Blatt | Joker | 3 Pflichtkarten | Trefferquote Karte 1 / 2 / 3 / 4 | Sperre greift | Ø Verlust bei Sperre |
|---|---|---|---|---|---|
| 52 | 0 (Fall 1) | 65,35 % ± 0,09 | 90,1 / 87,0 / 83,3 / 80,2 % | 0 % | – |
| 52 | 2 (Fall 2) | 65,06 % ± 0,09 | 90,1 / 86,9 / 83,1 / 80,1 % | 1,64 % der Pflichtentscheidungen | 11,0 Prozentpunkte |
| 104 | 0 (Fall 1) | 63,19 % ± 0,09 | 89,1 / 86,1 / 82,4 / 79,2 % | 0 % | – |
| 104 | 6 (Fall 2) | 62,84 % ± 0,09 | 89,2 / 86,0 / 81,9 / 79,1 % | 2,26 % der Pflichtentscheidungen | 9,0 Prozentpunkte |

Lesart:

- Mit Jokern und Sperrregel wird das Spiel **minimal schwerer**, nicht leichter. Der Gewinn durch Joker in den Pflichtkarten wird von der Sperre ausgeglichen und leicht überholt. Der Effekt liegt bei etwa 0,3 bis 0,4 Prozentpunkten auf die Chance, die drei Pflichtkarten zu schaffen.
- Ein zweites Blatt senkt die Chancen stärker als alle Jokervarianten (etwa 2 Prozentpunkte).
- Plausibilitätscheck: Die beobachtete Trefferquote pro Karte stimmt mit der Ø berechneten Chance überein (Abweichung unter 0,2 Prozentpunkten). Das spricht dafür, dass Wettwahl und Gewinnprüfung konsistent sind.

### Ganze Spiele, alte Joker-Annahme (5. November 2026, überholt)

Je 100.000 Spiele, Seed 2026, `node cli.js --n 100000` (bzw. `--blatt 2`). Ein Spiel läuft vom Auslegen bis zur richtig aufgedeckten Mitte, mit den Regeln aus Abschnitt 4 („Vom Autor entschieden“). Der Spieler zählt keine Karten mit.

| Blatt | Joker | Ø Züge bis Fenster zu | Median | 90 % der Spiele | Ø Fehlversuche | Ø Schlucke § 7 | Sperre greift |
|---|---|---|---|---|---|---|---|
| 52 | 0 (Fall 1) | 127,8 ± 0,8 | 90 | ≤ 288 | 135,1 | 727 | – |
| 52 | 2 (Fall 2) | 163,8 ± 1,0 | 112 | ≤ 377 | 194,6 | 946 | 10,5 % |
| 104 | 0 (Fall 1) | 143,1 ± 0,9 | 101 | ≤ 325 | 160,9 | 835 | – |
| 104 | 6 (Fall 2) | 210,6 ± 1,3 | 145 | ≤ 482 | 273,9 | 1.260 | 11,1 % |

Lesart:

- Über ganze Spiele gemessen macht die Jokerregel das Spiel **deutlich schwerer**: etwa 28 % mehr Züge mit einem Blatt, etwa 47 % mehr mit zwei Blättern. Die Zugsimulation (oben) hatte nur 0,3 Prozentpunkte gezeigt.
- Grund: In echten Spielverläufen greift die Sperre in gut 10 % der Pflichtentscheidungen statt in 1,6 % bis 2,3 % bei den zufälligen Spielständen. Offene Joker bleiben lange liegen, weil Fehler das Fenster immer wieder abräumen und neu auflegen.
- Weil § 7 meist fast das ganze Fenster abräumt, ist die Verteilung sehr schief. Ein paar Spiele dauern über 1.000 Züge. Median und 90-%-Wert sind darum aussagekräftiger als der Durchschnitt.

### Ganze Spiele mit Schwelle (aktueller Stand)

Je 100.000 Spiele, Seed 2026, `node cli.js --n 100000` mit `--blatt 2` bzw. `--schwelle 70 | 90 | aus`. Ausgaben in `ergebnisse/`.

| Blatt | Schwelle | Joker | Ø Züge | Median | 90 % | Ø Fehler | Ø getrunken § 7 | Ø Zusatzkarten | davon neben Joker | Ø verteilt § 6 | Sperre greift |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 52 | 80 % | 0 | 104,9 ± 0,6 | 74 | ≤ 237 | 135,1 | 727 | 67,3 | – | 95,4 | – |
| 52 | 80 % | 2 | 65,1 ± 0,4 | 46 | ≤ 145 | 84,0 | 487 | 75,0 | 23,5 | 129,0 | 12,3 % |
| 104 | 80 % | 0 | 120,9 ± 0,7 | 85 | ≤ 274 | 160,9 | 835 | 65,5 | – | 87,1 | – |
| 104 | 80 % | 6 | 60,0 ± 0,3 | 43 | ≤ 133 | 80,7 | 461 | 74,9 | 31,9 | 131,7 | 17,3 % |
| 52 | 70 % | 0 / 2 | 94,7 / 57,0 | 67 / 41 | | 135,1 / 83,7 | | 92,0 / 93,9 | – / 23,5 | 135,6 / 163,0 | – / 12,7 % |
| 52 | 90 % | 0 / 2 | 121,0 / 77,1 | 85 / 55 | | 135,1 / 83,5 | | 22,9 / 40,4 | – / 23,2 | 28,2 / 63,3 | – / 11,4 % |
| 52 | aus | 0 / 2 | 127,8 / 59,2 | 90 / 42 | | 135,1 / 67,6 | | 0 / 0 | – | 0 / 0 | – / 73,4 % |

Lesart:

- **Mit Jokern deutlich leichter:** bei 80 % etwa 38 % weniger Züge (1 Blatt) bzw. 50 % weniger (2 Blätter), dazu rund ein Drittel mehr verteilte Schlucke.
- **Ohne Joker** sind Fehler und getrunkene Schlucke bei jeder Schwelle gleich (135,1 und 727). Die Schwelle ändert nur, wie viele Züge es braucht und wer verteilt.
- **Mit Jokern** kostet Weiterspielen etwas: Fehler steigen von 67,6 (nie weiter) auf rund 84. Die leichten Felder neben Jokern werden als freiwillige Karten verbraucht, statt später als fast sichere Pflichtkarten zu helfen, und Joker neben Joker räumt nach § 7 viel ab.
- Die Felder neben Jokern (rund 23 pro Spiel) nimmt der Spieler bei jeder Schwelle praktisch alle mit.

Je 100.000 Spiele, Seed 2026, `node cli.js --n 100000` (bzw. `--blatt 2`, `--gratis aus`). Regeln wie in Abschnitt 4 „Vom Autor entschieden“: Feld neben offenem Joker ist richtig außer bei einem Joker, Sperrregel in den Pflichtkarten, freiwillige Gratiskarten danach.

| Blatt | Joker | Gratiskarten | Ø Züge | Median | 90 % | Ø Fehler | Ø getrunken § 7 | Ø Gratiskarten | Ø verteilt § 6 | Sperre greift |
|---|---|---|---|---|---|---|---|---|---|---|
| 52 | 0 (Fall 1) | – | 127,8 ± 0,8 | 90 | ≤ 288 | 135,1 | 727 | – | – | – |
| 52 | 2 (Fall 2) | an | 82,6 ± 0,5 | 58 | ≤ 185 | 83,6 | 484 | 23,3 | 32,9 | 10,9 % |
| 52 | 2 (Fall 2) | aus | 59,2 ± 0,3 | 42 | ≤ 130 | 67,6 | 322 | – | – | 73,4 % |
| 104 | 0 (Fall 1) | – | 143,1 ± 0,9 | 101 | ≤ 325 | 160,9 | 835 | – | – | – |
| 104 | 6 (Fall 2) | an | 75,7 ± 0,4 | 54 | ≤ 169 | 81,6 | 466 | 32,1 | 47,0 | 15,6 % |

Lesart:

- Mit der richtigen Joker-Regel wird das Spiel mit Jokern **deutlich leichter**: etwa 35 % weniger Züge mit einem Blatt, etwa 47 % weniger mit zwei Blättern. Das frühere Ergebnis („schwerer“) kam allein von der falschen Annahme zum Joker als Referenz.
- Gratiskarten bringen dem Spieler im Schnitt rund 33 (bzw. 47) verteilte Schlucke pro Spiel, **verlängern aber das Spiel** von 59 auf 83 Züge. Grund: Ohne Gratiskarten bleiben die Felder neben Jokern liegen, bis sonst nichts mehr frei ist. Dann entfällt die Sperre, und sie werden zu fast sicheren Pflichtkarten. Mit Gratiskarten sind diese leichten Felder schon verbraucht, und der seltene Fehler (Joker neben Joker) räumt nach § 7 viel ab.
- Der Spieler im Modell entscheidet über Gratiskarten nur nach seinen eigenen Schlucken, nicht nach der Spieldauer. Das entspricht vermutlich dem echten Verhalten am Tisch.

Frühere Vorabrechnung (nur Spielstände, ohne simulierte Züge, 40.000 Stände): Die beste Wette auf die nächste Karte liegt im Schnitt bei etwa 88 %, mit und ohne Joker praktisch gleich. Die Sperrregel änderte den besten Zug dort in etwa 0,7 % (einfach) bis 1,1 % (doppelt) der Stände. Diese Zahlen sind durch die Zugsimulation überholt.

## 7. Bereits gebaute Ergebnisseiten (Claude-Artefakte)

- Auswertung mit Beispielspielfeldern: https://claude.ai/artifact/7pv25PZi1qBuudz59tBvEc (alter Stand mit Variante ohne Sperrregel, nur zur Ansicht)
- Browser-Simulator mit einsehbarem Code (Web Worker, Fall 1 und Fall 2): https://claude.ai/artifact/W149K7kMMvq8QPgzN6kWDJ

Beide Seiten sind privat, solange sie nicht über das Teilen-Menü freigegeben werden.

## 8. Referenzimplementierung (JavaScript)

Läuft in Node (`require`) und als Web Worker. Das ist exakt der Code, der im Browser-Simulator angezeigt wird.

```js
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runBatch: runBatch, emptyStats: emptyStats, mergeStats: mergeStats };
}
if (typeof self !== 'undefined' && typeof postMessage === 'function' && typeof document === 'undefined') {
  self.onmessage = function (e) { postMessage({ id: e.data.id, stats: runBatch(e.data) }); };
}
```

Schnelltest in Node:

```js
const s = require('./sim_core.js');
const st = s.runBatch({ decks: 1, jokers: 2, trials: 200000, seed: 1 });
console.log(st.pass3 / st.turns); // etwa 0.653
```

## 9. Aufgaben für Claude Code

Stand 5. November 2026: Punkt 1 bis 4 sind umgesetzt, zusätzlich die Simulation ganzer Spiele und das Live-Fenster.

- `sim_core.js`: Kern, enthält jetzt auch `runGames` (ganze Spiele) und `traceGame` (ein Spiel mit Protokoll für die Animation). Der Code in Abschnitt 8 ist nur der ältere Zugteil.
- `cli.js`: `node cli.js` (ganze Spiele, Fall 1 und 2) oder `node cli.js --modus zug`. Weitere Optionen: `--blatt`, `--joker`, `--n`, `--seed`, `--threads`, `--json`.
- `Fenster-Simulator.html`: Browser-Oberfläche mit beiden Modi und Live-Fenster. Den Code darin nie von Hand ändern. Nach jeder Änderung an `sim_core.js` `npm run sync` ausführen. Ein Test prüft, dass beide gleich sind.
- `npm test`: Tests für Feld, Wetten, Sperre, § 7, Stapel, Reproduzierbarkeit und Protokoll.

Vorschlag für die Reihenfolge:

1. Projektstruktur anlegen: `sim_core.js` (Kern, siehe oben), `cli.js` (Kommandozeile), `index.html` (Browser-Oberfläche), `test/`.
2. Tests schreiben:
   - Feldaufbau: genau 21 Felder, 4 Lücken, Nachbarlisten stimmen.
   - `bestBet` an handgerechneten Beispielen (inklusive Joker-Nachbar und reinem Joker-Nachbarn).
   - `wins` für alle Wettarten, Joker und Gleichstand.
   - Reproduzierbarkeit: gleicher Seed, gleiches Ergebnis, unabhängig von der Blockaufteilung.
   - Konsistenz: beobachtete Trefferquote pro Karte liegt innerhalb von 0,3 Prozentpunkten der berechneten.
3. CLI: Argumente für Blattanzahl, Joker, Züge, Seed, Ausgabe als Tabelle und JSON. Mehrere Kerne über `worker_threads` mit festen Blöcken zu 25.000 Zügen.
4. Browser-Oberfläche: Zwei Fälle (Joker aussortiert, mit Jokern und Sperrregel), Einstellung für Blatt und Joker, Fortschritt, Vergleichstabelle der Läufe, Code-Ansicht mit Kopieren-Knopf. Kein Server nötig.
5. Erweiterungen, falls gewünscht:
   - **Erwartete Schlucke pro Zug** inklusive optimaler Abbruchentscheidung (weiterspielen oder abgeben), sobald § 6 und § 7 eindeutig sind.
   - **Alle Fenster durchspielen:** Chance, das ganze Fenster ohne Fehler zu beenden, inklusive Rot/Schwarz auf der Mitte.
   - Sensitivität: Ass niedrig, Gleichstand bei Dazwischen als Treffer, diagonale Nachbarn, Joker als Referenzkarte.
   - Feste Spielfortschritte statt Zufall (z. B. nur die 4 Ecken offen, Frühphase, Endphase).

Regeln für die Arbeit:

- Zufallsquelle immer mit Seed. Keine `Math.random()`-Aufrufe im Kern.
- Der Kern bleibt abhängigkeitsfrei und läuft unverändert in Node und im Browser.
- Wenn sich eine Regelannahme aus Abschnitt 4 ändert, zuerst den Kern anpassen, dann Tests, dann diese Datei.

## 10. Anhang: Biervorgabe für das Regelwerk (Vorschlag)

Zusätzlich war ein Paragraph zum Getränk in Arbeit. Er schließt Biere der Brau Union (Heineken Österreich) aus, damit nur unabhängige Privatbrauereien unterstützt werden. Hintergrund: Die Brau Union (Gösser, Zipfer, Wieselburger, Puntigamer, Schwechater, Kaiser, Schladminger, Edelweiss u. a.) braut etwa die Hälfte des österreichischen Biers. Die Bundeswettbewerbsbehörde hat im Juni 2024 beim Kartellgericht Strafzahlungen wegen mutmaßlichen Marktmissbrauchs beantragt. Die Brau Union bestreitet die Vorwürfe, das Verfahren läuft.

> **§ 1 Getränk**
> 1. Gespielt wird ausschließlich mit Bier aus unabhängigen Privatbrauereien (z. B. Stiegl, Hirter, Zwettler, Ottakringer).
> 2. Biere der Brau Union (Gösser, Zipfer, Wieselburger, Puntigamer, Schwechater, Kaiser, Schladminger, Edelweiss u. a.) sind nicht zugelassen.
> 3. Wer ein nicht zugelassenes Bier ins Spiel bringt, trinkt es zur Strafe aus und spendiert der Runde ein zugelassenes.

Hinweis: Die Unabhängigkeit einzelner Marken (z. B. Villacher) vor dem Eintragen ins Regelwerk prüfen. Die Nummerierung der übrigen Paragraphen verschiebt sich um eins, wenn dieser Paragraph vorne eingefügt wird.
