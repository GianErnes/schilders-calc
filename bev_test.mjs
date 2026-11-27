import { JSDOM } from 'jsdom';
import fs from 'fs';
const s = fs.readFileSync('planning.html', 'utf8');
const brok = s.slice(s.indexOf('// ---------- v0.31.0: nieuwe bevestigingen'), s.indexOf('function kennisContactKeuze() {'));
const overlay = s.match(/<div class="overlay" id="bevOverlay">[\s\S]*?<\/div>\n<\/div>/)[0];
let ok = 0, fout = 0; const t = (n, c) => { if (c) ok++; else { fout++; console.log('FOUT:', n); } };
function omgeving(o = {}) {
  const dom = new JSDOM('<div class="wrap"><span id="status"></span><button id="bevKnop" style="display:none"></button><table id="bord"><tbody>' +
    '<tr class="project" data-code="A1"><td>A1</td></tr><tr class="project" data-code="B2" data-fase="f2"><td>B2</td></tr></tbody></table></div>' + overlay, { runScripts: 'outside-only' });
  const w = dom.window;
  w.CSS = { escape: x => String(x) };
  w.HTMLElement.prototype.scrollIntoView = function () {};
  const calls = [];
  const q = (res) => { const b = { _f: [], select(x) { calls.push(['select', x]); return b; }, not(...a) { calls.push(['not', ...a]); return b; }, is(...a) { calls.push(['is', ...a]); return b; },
    update(x) { calls.push(['update', x]); return b; }, in(k, v) { calls.push(['in', k, v]); return Promise.resolve(o.updFout ? { error: { message: 'geen recht' } } : { error: null }); },
    then(r, j) { return Promise.resolve(res).then(r, j); } }; return b; };
  w.sb = { from: (tbl) => { calls.push(['from', tbl]); return q(o.laadFout ? { data: null, error: { message: 'kolom ontbreekt' } } : { data: o.rijen || [], error: null }); } };
  w.eval(`
    var ikPersoon = ${JSON.stringify('ik' in o ? o.ik : 'gian')}; var jaar = 2026; var actiefCode = null, actiefFase = null; var paneelGetekend = 0;
    var KENNIS_NAAM = { opdracht: 'Opdrachtbevestiging', maand: 'Maand', week: 'Week', dag: 'Startdag', afsluiting: 'Afsluiting' };
    function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    var PROJ = { A1: { code: 'A1', klant: 'Jansen <b>', naam: 'Buitenwerk' }, B2: { code: 'B2', klant: 'Pieters', naam: 'Binnen' } };
    function vindProject(c) { return PROJ[c] || null; }
    function vindFase(c, id) { return id === 'f2' ? { id: 'f2', naam: 'fase 2' } : null; }
    function tekenPaneel() { paneelGetekend++; }
    var statusLog = []; function toonStatus(t, f) { statusLog.push([t, !!f]); }
  `);
  w.eval(brok.replace(/^const /gm, 'var ').replace(/^let /gm, 'var '));
  return { w, calls };
}
const R = (id, x = {}) => ({ id, yoobi_code: 'A1', soort: 'dag', periode_tekst: 'maandag 30 november', aan: 'p@x.nl', aan_naam: 'Piet', bevestigd_op: '2026-11-26T09:00:00Z', bevestiging_gezien_op: null, vervallen_op: null, overgeslagen: false, ...x });
const tick = () => new Promise(r => setTimeout(r, 0));

// 1 filter
{ const { w } = omgeving(); const f = w.bevFilter([R('a', { bevestigd_op: '2026-11-20T09:00:00Z' }), R('b'), R('c', { bevestiging_gezien_op: '2026-11-26T10:00:00Z' }), R('d', { vervallen_op: 'x' }), R('e', { overgeslagen: true }), R('f', { bevestigd_op: null }), null]);
  t('1 filter', f.map(x => x.id).join() === 'b,a'); t('1 leeg', w.bevFilter(null).length === 0); }
// 2 knop
{ const { w } = omgeving(); w.bevNieuw = [R('a'), R('b')]; w.tekenBevKnop(); const k = w.document.getElementById('bevKnop');
  t('2 zichtbaar', k.style.display === '' && k.textContent === '✓ 2');
  w.bevNieuw = []; w.tekenBevKnop(); t('2 leeg verborgen', k.style.display === 'none');
  w.bevFout = 'x'; w.tekenBevKnop(); t('2 fout toont !', k.style.display === '' && k.textContent === '✓ !' && k.title.includes('x')); }
{ const { w } = omgeving({ ik: 'maud' }); w.bevNieuw = [R('a')]; w.tekenBevKnop(); t('2 maud ziet niets', w.document.getElementById('bevKnop').style.display === 'none'); }
{ const { w } = omgeving({ ik: null }); w.bevNieuw = [R('a')]; w.tekenBevKnop(); t('2 onbekend ziet niets', w.document.getElementById('bevKnop').style.display === 'none'); }
// 3 rij
{ const { w } = omgeving(); const h = w.bevRijHtml(R('a'));
  t('3 klant ge-escaped', h.includes('Jansen &lt;b&gt;') && !h.includes('Jansen <b>')); t('3 soort', h.includes('Startdag voor maandag 30 november')); t('3 door', h.includes('door Piet'));
  const h2 = w.bevRijHtml(R('b', { yoobi_code: 'B2', fase_id: 'f2', soort: 'week' })); t('3 fase', h2.includes('Week · fase 2'));
  const h3 = w.bevRijHtml(R('c', { yoobi_code: 'ZZ', onderwerp: 'Start X', aan_naam: null })); t('3 zonder project', h3.includes('Start X') && h3.includes('door p@x.nl')); }
// 4 laden
{ const { w, calls } = omgeving({ rijen: [R('a'), R('g', { bevestiging_gezien_op: 'x' })] }); await w.bevLaad();
  t('4 gian laadt', w.bevNieuw.length === 1 && calls.some(c => c[0] === 'is' && c[1] === 'bevestiging_gezien_op'));
  t('4 knop', w.document.getElementById('bevKnop').textContent === '✓ 1'); }
{ const { w, calls } = omgeving({ ik: 'max', rijen: [R('a')] }); await w.bevLaad(); t('4 max geen query', !calls.length && w.bevNieuw.length === 0); }
{ const { w } = omgeving({ laadFout: true }); w.bevNieuw = [R('a')]; await w.bevLaad(); t('4 fout lijst blijft', w.bevNieuw.length === 1 && w.bevFout === 'kolom ontbreekt'); }
// 5 openen, gezien, alles gezien
{ const { w, calls } = omgeving({ rijen: [R('a'), R('b', { bevestigd_op: '2026-11-25T09:00:00Z' })] }); await w.bevLaad();
  w.document.getElementById('bevKnop').click(); await tick(); await tick();
  const ov = w.document.getElementById('bevOverlay'); t('5 open', ov.classList.contains('open')); t('5 twee regels', ov.querySelectorAll('.bevrij').length === 2);
  ov.querySelector('[data-bevgezien="a"]').click(); await tick(); await tick();
  t('5 update a', calls.some(c => c[0] === 'in' && c[2].join() === 'a')); t('5 één over', w.bevNieuw.length === 1 && ov.querySelectorAll('.bevrij').length === 1);
  t('5 nog open', ov.classList.contains('open'));
  ov.querySelector('#bevAllesGezien').click(); await tick(); await tick();
  t('5 alles', w.bevNieuw.length === 0 && !ov.classList.contains('open') && w.document.getElementById('bevKnop').style.display === 'none'); }
{ const { w } = omgeving({ updFout: true }); w.bevNieuw = [R('a')]; w.tekenBevLijst(); await w.bevGezien(['a']);
  t('5 updfout blijft', w.bevNieuw.length === 1 && w.statusLog.some(x => x[1] && x[0].includes('geen recht'))); }
// 6 toon
{ const { w } = omgeving(); w.bevNieuw = [R('a'), R('b', { yoobi_code: 'B2', fase_id: 'f2' }), R('z', { yoobi_code: 'ZZ' })];
  w.document.getElementById('bevOverlay').classList.add('open');
  w.bevToon('b'); t('6 fase-rij', w.actiefCode === 'B2' && w.actiefFase === 'f2' && w.paneelGetekend === 1 && !w.document.getElementById('bevOverlay').classList.contains('open'));
  t('6 uitgelicht', w.document.querySelector('tr[data-code="B2"]').classList.contains('uitgelicht'));
  w.bevToon('z'); t('6 niet op bord', w.statusLog.some(x => x[1] && x[0].includes('niet op het bord')) && w.actiefCode === 'B2'); }
// 7 laadAlles-volgorde in het echte bestand
{ const iIk = s.indexOf('ikPersoon = ik ? ik.persoon : null;'), iBev = s.indexOf('if (bevUitLaden) { bevNieuw = bevVoorMij()');
  t('7 afleiden na ikPersoon', iIk > 0 && iBev > iIk && iBev - iIk < 80); t('7 tekenBord roept knop', /tekenKennisTeller\(\);\n  tekenBevKnop\(\);/.test(s)); }
console.log(ok + ' goed, ' + fout + ' fout');
process.exit(fout ? 1 : 0);
