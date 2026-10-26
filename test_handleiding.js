const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('planning.html', 'utf8');
// Script niet laten draaien (Supabase-laden); we knippen de handleiding-functies uit en draaien ze tegen de DOM.
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window, d = w.document;
w.Element.prototype.scrollIntoView = function () { this._scrolled = true; };
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const blok = script.slice(script.indexOf('// ---------- handleiding (v0.23.0) ----------'), script.indexOf('// ---------- gebeurtenissen ----------'));
w.eval("const APP_VERSION = '0.23.0';\n" + blok + "\nwindow._h = { openHandleiding, sluitHandleiding, handleidingTreffers, handleidingFilter, handleidingGaNaar };");
const h = w._h;
let n = 0, fouten = 0;
function check(naam, ok) { n++; if (!ok) { fouten++; console.log('FOUT:', naam); } else console.log('ok  :', naam); }

const ov = d.getElementById('handleidingOverlay');
check('knop in de kop aanwezig', !!d.getElementById('handleidingKnop'));
check('overlay dicht bij start', !ov.classList.contains('open'));
d.getElementById('handleidingKnop').click();
check('knop opent de overlay', ov.classList.contains('open'));
check('versie in de kop', d.getElementById('handleidingVersie').textContent === 'v0.23.0');
const secties = Array.from(d.querySelectorAll('.hsec'));
check('16 secties', secties.length === 16);
check('ids h1..h16', secties.every((s, i) => s.id === 'h' + (i + 1)));
check('inhoudsopgave heeft 16 links', d.querySelectorAll('#handleidingInhoud a[data-hga]').length === 16);
check('elke inhoudslink wijst naar een bestaande sectie', Array.from(d.querySelectorAll('a[data-hga]')).every(a => d.getElementById(a.dataset.hga)));
check('elke sectie heeft trefwoorden', secties.every(s => (s.dataset.trefwoorden || '').length > 10));
check('elke sectie behalve 15/16 heeft een Sinds-regel', secties.slice(0, 14).every(s => s.querySelector('.hsinds')));

// zoeken
const zoek = d.getElementById('handleidingZoek');
zoek.value = 'volgorde'; zoek.dispatchEvent(new w.Event('input'));
const zichtbaar = () => secties.filter(s => !s.classList.contains('hweg')).map(s => s.id);
check('"volgorde" toont o.a. h8 en h10', zichtbaar().includes('h8') && zichtbaar().includes('h10'));
check('inhoudsopgave weg bij zoeken', d.getElementById('handleidingInhoud').classList.contains('hweg'));
check('treffermelding gevuld', /onderdel/.test(d.getElementById('handleidingTreffers').textContent));
zoek.value = 'nabellen bounce'; zoek.dispatchEvent(new w.Event('input'));
check('twee woorden = beide moeten voorkomen (h11)', zichtbaar().length >= 1 && zichtbaar().includes('h11') && !zichtbaar().includes('h3'));
zoek.value = 'xyzzyqq'; zoek.dispatchEvent(new w.Event('input'));
check('niets gevonden: 0 secties en melding', zichtbaar().length === 0 && /Niets gevonden/.test(d.getElementById('handleidingTreffers').textContent));
zoek.value = ''; zoek.dispatchEvent(new w.Event('input'));
check('leeg zoekveld: alles terug', zichtbaar().length === 16 && !d.getElementById('handleidingInhoud').classList.contains('hweg'));

// pure functie
check('handleidingTreffers leeg = alles', h.handleidingTreffers('', [{ id: 'a', tekst: 'x', trefwoorden: '' }]).join() === 'a');
check('handleidingTreffers op trefwoord', h.handleidingTreffers('STEIGER', [{ id: 'a', tekst: '', trefwoorden: 'steiger' }, { id: 'b', tekst: 'niets', trefwoorden: '' }]).join() === 'a');

// springen
zoek.value = 'volgorde'; zoek.dispatchEvent(new w.Event('input'));
const link = d.querySelector('#h16 a[data-hga="h3"]');
link.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
check('springen vanuit register maakt zoekfilter leeg en toont h3', !d.getElementById('h3').classList.contains('hweg') && zoek.value === '');
check('doelsectie gescrold en uitgelicht', d.getElementById('h3')._scrolled === true && d.getElementById('h3').classList.contains('hlicht'));

// sluiten
d.getElementById('handleidingSluit').click();
check('sluitknop sluit', !ov.classList.contains('open'));
h.openHandleiding('h8');
check('openHandleiding(sectie) opent en scrolt naar h8', ov.classList.contains('open') && d.getElementById('h8')._scrolled === true);
d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' }));
check('Escape sluit', !ov.classList.contains('open'));
ov.classList.add('open'); ov.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
check('klik naast het venster sluit', !ov.classList.contains('open'));

// inhoudelijke ankers: knopteksten die de handleiding noemt bestaan in de HTML
['Yoobi verversen', 'Vrije dagen &amp; medewerkers', 'Nederlandse feestdagen voorstellen', 'Aangevinkte dagen toevoegen', 'Terug naar Yoobi-datum', 'Samenvoegen met vorige', 'Agenda-link maken', 'Kopieer link', 'Link vernieuwen', 'overslaan', 'historie · ', 'Volgorde in de agenda', 'Eén plek eerder', 'Opheffen', 'Nog geen datum in Yoobi', 'Verborgen projecten', 'Over datum, niet op dit bord', 'wekelijks herhalen t/m']
  .forEach(t => check('knoptekst bestaat in app: ' + t, html.indexOf(t) !== -1));

console.log(`\n${n - fouten}/${n} controles goed`);
process.exit(fouten ? 1 : 0);
