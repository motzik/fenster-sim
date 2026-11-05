// Kopiert sim_core.js in den eingebetteten <script id="sim-src"> von Fenster-Simulator.html.
// Die HTML-Datei soll ohne Server laufen und braucht den Code deshalb direkt in der Seite.
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'Fenster-Simulator.html');
const core = fs.readFileSync(path.join(root, 'sim_core.js'), 'utf8').replace(/\r\n/g, '\n').trim();
const html = fs.readFileSync(htmlPath, 'utf8');
const re = /(<script type="text\/plain" id="sim-src">)[\s\S]*?(<\/script>)/;
if (!re.test(html)) throw new Error('<script id="sim-src"> nicht gefunden');
if (core.includes('</script')) throw new Error('sim_core.js darf kein </script enthalten');
const out = html.replace(re, (_, open, close) => open + '\n' + core + '\n' + close);
fs.writeFileSync(htmlPath, out);
console.log(out === html ? 'Fenster-Simulator.html war schon aktuell.' : 'Fenster-Simulator.html aktualisiert.');
