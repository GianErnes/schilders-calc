// test_online_v4.131.1.js — hoort bij index.html v4.131.1: de opties staan in het
// akkoordformulier in plaats van onder het document, zin over de opties in de offertemail,
// strook miniaturen dicht, begrijpelijke melding bij een gewiste inlogsessie.
// Gebruik: node test_online_v4.131.1.js <index.html v4.131.0> <index.html v4.131.1> <offerte-accord_index.ts>
// Nodig: npm install acorn jsdom, Node 22.13 of nieuwer, en in dezelfde map
// test_keuzes_laad.js, test_keuzes_fixture.js en test_online_edge.js.
// De klantpagina draait in jsdom met het echte antwoord van de Edge Function (in Node,
// nagebootste database, geen netwerk). De rekenkant is niet gewijzigd; daarvoor blijft
// test_online_v4.131.0.js de set (secties 1 t/m 9 en 11).
const fs = require('fs'), acorn = require('acorn');
const { JSDOM } = require('jsdom');
const { laad } = require('./test_keuzes_laad.js');
const FIX = require('./test_keuzes_fixture.js');
const { laadEdge } = require('./test_online_edge.js');
const padOud = process.argv[2], padNieuw = process.argv[3], padEdge = process.argv[4];
if (!padOud || !padNieuw || !padEdge) { console.log('Gebruik: node test_online_v4.131.1.js <index.html v4.131.0> <index.html v4.131.1> <offerte-accord_index.ts>'); process.exit(2); }
let goed = 0, mis = 0; const misLijst = [];
function check(naam, v, detail) { if (v) goed++; else { mis++; misLijst.push(naam + (detail ? ' :: ' + detail : '')); console.log('  MIS  ' + naam + (detail ? ' :: ' + detail : '')); } }
const J = x => JSON.stringify(x);
const K = x => JSON.parse(JSON.stringify(x));
const cent = (a, b) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 0.005;
const eurNL = n => '\u20ac ' + Number(n).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const even = ms => new Promise(r => setTimeout(r, ms || 60));

function ontleed(pad) {
  const html = fs.readFileSync(pad, 'utf8');
  const re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
  let m, src = null;
  while ((m = re.exec(html))) { if (!src || m[1].length > src.length) src = m[1]; }
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script' });
  const functies = {}, delen = [];
  for (const n of ast.body) {
    const bron = src.slice(n.start, n.end);
    if (n.type === 'FunctionDeclaration') { functies[n.id.name] = bron; delen.push({ namen: [n.id.name], bron }); }
    else if (n.type === 'VariableDeclaration') delen.push({ namen: n.declarations.map(d => d.id.name || ''), bron });
  }
  return { functies, delen, html };
}
function tabel(variant) {
  const L = laad(padNieuw); L.run(FIX);
  L.run("__zetKlaar(__maakCalc(" + J(variant) + ")); data.calc.btwPctOverride = 9;");
  return L.run("__syncAlles()").then(() => K(L.run("_optTabelVoorLink(data.calc)")));
}
function edgeMet(tab, extra) {
  const E = laadEdge(padEdge);
  E.db.tabellen.calculaties.push({ id: 'calc1', naam: 'Testhuis', klant: 'Fam. Test', offerte_config: { geldigTot: '2999-01-01' }, status: 'verzonden' });
  E.db.tabellen.offerte_accorderingen.push(Object.assign({
    id: 'L1', token: 'tok1', calculatie_id: 'calc1', status: 'open', vragen: [], klant_naam: null, notitie: null, gereageerd_op: null,
    snapshot: { offertenummer: '26-100', aanhef: 'heer Test', klantEmail: 'klant@test.nl', html: '<p>document</p>' },
    bedrag: tab ? tab.basis.incl : 1000, cijfers: tab ? { v: 1, opties: tab } : null,
    eerste_geopend_op: '2026-11-01T10:00:00Z', geopend_aantal: 1, pdf_path: null, onderhoudsplan_id: null, oplevering_id: null, betaalkeuze: null, optiekeuze: null, optie_verwerkt_op: null
  }, extra || {}));
  return E;
}
const linkRij = E => E.db.tabellen.offerte_accorderingen[0];
function pagina(ont) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const code = ont.delen.filter(d => d.namen.some(n => /^_accord|^_ACCORD|^ACCORD_/.test(n))).map(d => d.bron).join('\n');
  w.__fetchLog = []; w.__alerts = []; w.__scroll = [];
  w.alert = t => w.__alerts.push(String(t));
  w.Element.prototype.scrollIntoView = function (o) { w.__scroll.push(o && o.block); };
  w.eval("var SUPABASE_URL = 'http://sb.test', SUPABASE_KEY = 'anon';\n" + code + "\n;window.__ev = function (s) { return eval(s); };");
  return w;
}
const render = (w, res) => { w.__res = J(res); return w.__ev("(function(){ _accordCtx = null; _accordVerlopenModus = false; const r = document.createElement('div'); r.id = 'accordRoot'; document.body.innerHTML = ''; document.body.appendChild(r); _accordRender(r, 'tok1', JSON.parse(window.__res)); window.__root = r; return r.innerHTML; })()"); };
const q = (w, sel) => w.__ev("window.__root.querySelector(" + J(sel) + ")");
const tekst = (w, sel) => { const e = q(w, sel); return e ? e.textContent : null; };
const aantal = (w, sel) => w.__ev("window.__root.querySelectorAll(" + J(sel) + ").length");
const klik = (w, sel) => w.__ev("window.__root.querySelector(" + J(sel) + ").click()");
const vink = (w, id, aan) => w.__ev("(function(){ const v = window.__root.querySelector('input[data-opt=\"" + id + "\"]'); v.checked = " + (aan ? 'true' : 'false') + "; v.dispatchEvent(new window.Event('change', { bubbles: true })); })()");

(async () => {
  console.log('oud:   ' + padOud + '\nnieuw: ' + padNieuw + '\nedge:  ' + padEdge + '\n');
  const ontOud = ontleed(padOud), ontNieuw = ontleed(padNieuw);
  const TAB2 = await tabel('regels'), TAB8 = await tabel('delen');
  async function metOpties(tab) {
    const E = edgeMet(tab);
    const get = await E.roep('GET', null, '?token=tok1&intern=1');
    const w = pagina(ontNieuw);
    w.fetch = async (url, opt) => { const body = JSON.parse(opt.body); w.__fetchLog.push(body); const r = await E.roep('POST', body); return { ok: r.status === 200, status: r.status, json: async () => r.body }; };
    const html = render(w, get.body);
    return { w, E, tab, html, get };
  }

  console.log('1. Wat gewijzigd is en wat niet');
  {
    const gewijzigd = Object.keys(ontNieuw.functies).filter(n => ontOud.functies[n] && ontOud.functies[n] !== ontNieuw.functies[n]).sort();
    const nieuw = Object.keys(ontNieuw.functies).filter(n => !ontOud.functies[n]).sort();
    const weg = Object.keys(ontOud.functies).filter(n => !ontNieuw.functies[n]);
    check('precies de verwachte functies gewijzigd', J(gewijzigd) === J(['_accordFormHtml', '_accordOptBlokHtml', '_accordRender', '_accordToonGetekendInViewer', '_accordVerstuur', '_accordWireActies', '_offerteMailStandaardtekst', '_offerteMailen', '_offerteVerzendCall']), J(gewijzigd));
    check('precies twee nieuwe functies', J(nieuw) === J(['_accordOptWijzer', '_optOnlineAantal']), J(nieuw));
    check('geen functie verdwenen', weg.length === 0, J(weg));
    for (const n of ['_berekenOfferteCijfers', '_optBereken', '_optMetStand', '_optPasStandToe', 'optLegVast', '_optTabelVoorLink', '_optOnlineVerwerk', '_optOnlineOordeel', '_optOnlineTrigger', '_optOnlineEis', '_accordCijfersVoorLink', '_accordNieuweLink', '_bouwGetekendePdfBytes', '_accordOptCombi', '_accordOptTotaalHtml', '_accordOptAkkZin', '_accordOptWire', '_accordOptVastHtml', '_accordActiesHtml', '_optOnlineLinkHtml', '_optOnlineAkkoordHtml'])
      check('ongewijzigd: ' + n, !!ontOud.functies[n] && ontOud.functies[n] === ontNieuw.functies[n]);
    check('versienummer v4.131.1 op drie plekken', /const APP_VERSION = 'v4\.131\.1';/.test(ontNieuw.html) && ontNieuw.html.indexOf('Welkom bij v4.131.1</h2>') > 0 && /\{ v: '4\.131\.1', d: '2026-11-25'/.test(ontNieuw.html));
    check('strook miniaturen: navpanes=0 op de twee plekken waar de PDF getoond wordt', (ontNieuw.html.match(/#view=FitH&navpanes=0/g) || []).length === 2 && (ontNieuw.html.match(/#view=FitH(?!&navpanes=0)/g) || []).length === 0);
  }

  console.log('2. Links zonder opties: de pagina is gelijk aan v4.131.0');
  {
    const wO = pagina(ontOud), wN = pagina(ontNieuw);
    const basisRes = { status: 'open', bedrag: 4741.16, snapshot: { html: '<p>doc</p>' }, gereageerd_op: null, klant_naam: null, project: 'Testhuis', klant: 'Fam. Test', geldig_tot: '2999-01-01', verlopen: false, afwijzen_mogelijk: true, document_beschikbaar: true, soort: 'offerte', betaalmodel: null, keuze_nodig: false, betaalkeuze: null, opties: null, optiekeuze: null };
    const varianten = {
      'open offerte': basisRes,
      'geaccordeerde offerte zonder keuze': Object.assign({}, basisRes, { status: 'akkoord', klant_naam: 'Jan', gereageerd_op: '2026-11-20T10:00:00Z' }),
      'geaccordeerde offerte met online keuze': Object.assign({}, basisRes, { status: 'akkoord', klant_naam: 'Jan', gereageerd_op: '2026-11-25T10:00:00Z', bedrag: 5240.16, optiekeuze: { ids: ['a'], nrs: [1], titels: ['Optie 1: Wanden'], excl: 4330.71, incl: 5240.16, klanttype: 'consument' } }),
      'afgewezen offerte': Object.assign({}, basisRes, { status: 'afgekeurd', klant_naam: 'Jan', gereageerd_op: '2026-11-20T10:00:00Z', snapshot: null }),
      'verlopen offerte': Object.assign({}, basisRes, { verlopen: true, snapshot: null, geldig_tot: '2020-01-01' }),
      'vervangen offerte': Object.assign({}, basisRes, { status: 'vervangen', snapshot: null }),
      'plan met betaalkeuze': Object.assign({}, basisRes, { soort: 'plan', bedrag: null, betaalmodel: 'beide', keuze_nodig: true }),
      'houtrot-opgave': Object.assign({}, basisRes, { soort: 'houtrot' })
    };
    for (const naam of Object.keys(varianten)) {
      const a = render(wO, varianten[naam]), b = render(wN, varianten[naam]);
      check('gelijk aan v4.131.0: ' + naam, a === b && a.length > 100, a.length + ' / ' + b.length);
      if (varianten[naam].status === 'open' && !varianten[naam].verlopen) {
        for (const knop of ['.ac-btn-ok', '.ac-btn-nee', '.ac-btn-vraag']) {
          const f = w => w.__ev("(function(){ window.__root.querySelector(" + J(knop) + ").click(); return window.__root.querySelector('#acForm').innerHTML; })()");
          check('formulier ' + knop + ' gelijk aan v4.131.0: ' + naam, f(wO) === f(wN));
        }
      }
    }
    const pdfRes = Object.assign({}, basisRes, { snapshot: { pdf: 'https://signed.test/x.pdf' } });
    const a = render(wO, pdfRes), b = render(wN, pdfRes);
    check('offerte met pdf: alleen de aanwijzing navpanes=0 is erbij', a !== b && a === b.split('&amp;navpanes=0').join('').split('&navpanes=0').join(''), a.length + ' / ' + b.length);
    check('geen wijzer en geen aanwijzing bij een link zonder opties', b.indexOf('acOptWijzer') < 0 && b.indexOf('acOptHint') < 0);
    check('scrollt bij een link zonder opties naar het midden, zoals voorheen', (() => { wN.__scroll.length = 0; render(wN, basisRes); klik(wN, '.ac-btn-ok'); return true; })());
    await even(80);
    check('  (gemeten) block = center', wN.__scroll.slice(-1)[0] === 'center', J(wN.__scroll));
  }

  console.log('3. Link met opties: de keuze staat in het akkoordformulier');
  {
    const { w, E, tab, html } = await metOpties(TAB2);
    check('voor Akkoord geven: geen vinkjes en geen keuzeblok op de pagina', aantal(w, 'input[data-opt]') === 0 && q(w, '#acOpties') === null);
    check('wijzer bovenaan, direct onder de kop', tekst(w, '#acOptWijzer') === 'Deze offerte heeft 2 opties. U kiest ze onderaan bij Akkoord geven; daar ziet u direct het totaal van uw samenstelling.' && w.__ev("window.__root.querySelector('.ac-kop').nextElementSibling.id") === 'acOptWijzer', tekst(w, '#acOptWijzer'));
    check('wijzer staat boven het document', html.indexOf('acOptWijzer') < html.indexOf('acOfferte'));
    check('aanwijzing in de knoppenbalk, boven de knoppen', tekst(w, '#acOptHint') === 'U kiest uw opties na Akkoord geven.' && w.__ev("window.__root.querySelector('#acOptHint').nextElementSibling.className") === 'ac-knoppen');
    // Afwijzen en Vraag stellen tonen geen vinkjes
    klik(w, '.ac-btn-nee'); check('Afwijzen: geen vinkjes in het formulier', aantal(w, 'input[data-opt]') === 0);
    klik(w, '.ac-btn-vraag'); check('Vraag stellen: geen vinkjes in het formulier', aantal(w, 'input[data-opt]') === 0);
    // Akkoord geven
    w.__scroll.length = 0;
    klik(w, '.ac-btn-ok'); await even(80);
    check('na Akkoord geven: twee vinkjes in het formulier, geen aangevinkt', aantal(w, '#acForm input[data-opt]') === 2 && aantal(w, '#acForm input[data-opt]:checked') === 0);
    check('het keuzeblok staat boven het naamveld', w.__ev("(function(){ const f = window.__root.querySelector('#acForm'); const k = Array.prototype.slice.call(f.children); return k.indexOf(f.querySelector('#acOpties')) === 0 && k.indexOf(f.querySelector('#acOpties')) < k.indexOf(f.querySelector('#acNaam')); })()") === true);
    check('nummering, titels en omschrijving als op de offerte', /Optie 1: Wanden woonkamer na stucwerk/.test(tekst(w, '#acOpties')) && /Optie 2: Plafond slaapkamer/.test(tekst(w, '#acOpties')) && /Voorstrijken en twee keer sauzen\./.test(tekst(w, '#acOpties')));
    check('totaal begint op de basis', tekst(w, '.ac-opt-tot-groot') === eurNL(tab.basis.incl) + ' incl. btw' && tekst(w, '#acAkkBedrag') === ', basisuitvoering, zonder opties, bedrag ' + eurNL(tab.basis.incl) + ' incl. btw');
    check('het formulier schuift met de bovenkant in beeld (opties eerst)', w.__scroll.slice(-1)[0] === 'start', J(w.__scroll));
    let alle = true;
    for (const x of tab.combi) {
      tab.opties.forEach(o => vink(w, o.id, x.ids.indexOf(o.id) >= 0));
      if (tekst(w, '.ac-opt-tot-groot') !== eurNL(x.incl) + ' incl. btw' || tekst(w, '.ac-opt-tot-klein') !== eurNL(x.excl) + ' excl. btw') alle = false;
    }
    check('elke samenstelling: het totaal is het bedrag uit de tabel', alle);
    // vinkjes overleven het wisselen tussen de knoppen
    tab.opties.forEach(o => vink(w, o.id, false)); vink(w, 'oB', true);
    klik(w, '.ac-btn-nee'); klik(w, '.ac-btn-vraag'); klik(w, '.ac-btn-ok');
    const eenB = tab.combi.find(x => x.ids.length === 1 && x.ids[0] === 'oB');
    check('na wisselen naar Afwijzen en Vraag en terug: het vinkje staat er nog', w.__ev("window.__root.querySelector('input[data-opt=\"oB\"]').checked") === true && w.__ev("window.__root.querySelector('input[data-opt=\"oA\"]').checked") === false && w.__ev("window.__root.querySelector('input[data-opt=\"oB\"]').closest('.ac-opt').classList.contains('aan')") === true);
    check('en totaal en akkoordzin kloppen meteen weer', tekst(w, '.ac-opt-tot-groot') === eurNL(eenB.incl) + ' incl. btw' && tekst(w, '#acAkkBedrag') === ', basisuitvoering met optie 2, bedrag ' + eurNL(eenB.incl) + ' incl. btw', tekst(w, '#acAkkBedrag'));
    // vinkje wijzigen zet het akkoordvinkje uit
    w.__ev("window.__root.querySelector('#acAkkVink').checked = true");
    vink(w, 'oA', true);
    const beide = tab.combi.find(x => x.ids.length === 2);
    check('vinkje wijzigen: akkoordvinkje uit, zin loopt mee', w.__ev("window.__root.querySelector('#acAkkVink').checked") === false && tekst(w, '#acAkkBedrag') === ', basisuitvoering met optie 1 en 2, bedrag ' + eurNL(beide.incl) + ' incl. btw');
    w.__ev("window.__root.querySelector('#acNaam').value = 'Jan Test'");
    klik(w, '.ac-submit');
    check('zonder akkoordvinkje wordt er niets verstuurd', w.__fetchLog.length === 0 && w.__alerts.length === 1);
    w.__ev("window.__root.querySelector('#acAkkVink').checked = true"); klik(w, '.ac-submit'); await even();
    const body = w.__fetchLog[0];
    check('verstuurd: alleen ids, geen bedrag', body && J(Object.keys(body).sort()) === J(['actie', 'naam', 'notitie', 'opties', 'token']) && J(body.opties) === J(['oA', 'oB']), J(body));
    check('server legt het bedrag uit de tabel vast', linkRij(E).status === 'akkoord' && cent(linkRij(E).bedrag, beide.incl) && J(linkRij(E).optiekeuze.ids) === J(['oA', 'oB']));
    check('na akkoord: geen vinkjes, kaart "Uw keuze" boven de bevestiging', aantal(w, 'input[data-opt]') === 0 && aantal(w, '#acOpties') === 1 && /Uw keuze/.test(tekst(w, '#acOpties')) && w.__ev("window.__root.querySelector('#acOpties').nextElementSibling.id") === 'acActies' && tekst(w, '#acOpties .ac-opt-tot-groot') === eurNL(beide.incl) + ' incl. btw');
    check('na akkoord: wijzer en aanwijzing zijn weg, de bevestiging noemt samenstelling en totaal', q(w, '#acOptWijzer') === null && q(w, '#acOptHint') === null && /Uw akkoord is vastgelegd, basisuitvoering met optie 1 en 2, totaal /.test(tekst(w, '#acActies')));
  }
  {
    // niets aanvinken = akkoord op de basis
    const { w, E, tab } = await metOpties(Object.assign(K(TAB2), { klanttype: 'zakelijk' }));
    klik(w, '.ac-btn-ok');
    check('zakelijk: totaal excl. btw groot, ook in het formulier', tekst(w, '.ac-opt-tot-groot') === eurNL(tab.basis.excl) + ' excl. btw' && tekst(w, '.ac-opt-prijs').indexOf('meerprijs ' + eurNL(tab.opties[0].meerExcl) + ' excl. btw') === 0);
    w.__ev("window.__root.querySelector('#acNaam').value = 'BV Test'; window.__root.querySelector('#acAkkVink').checked = true"); klik(w, '.ac-submit'); await even();
    check('niets aangevinkt: lege lijst verstuurd, server legt de basis vast', J(w.__fetchLog[0].opties) === J([]) && linkRij(E).optiekeuze.ids.length === 0 && cent(linkRij(E).bedrag, tab.basis.incl));
    const get2 = await E.roep('GET', null, '?token=tok1&intern=1');
    const h2 = render(w, get2.body);
    check('heropenen na akkoord: "Uw keuze", geen wijzer, geen vinkjes', /Uw keuze/.test(h2) && h2.indexOf('acOptWijzer') < 0 && h2.indexOf('acOptHint') < 0 && !/data-opt/.test(h2));
  }
  {
    // één optie: enkelvoud
    const een = K(TAB2); een.n = 1; een.opties = een.opties.slice(0, 1); een.combi = een.combi.filter(x => x.ids.indexOf('oB') < 0);
    const { w } = await metOpties(een);
    check('één optie: wijzer en aanwijzing in het enkelvoud', tekst(w, '#acOptWijzer') === 'Deze offerte heeft 1 optie. U kiest onderaan bij Akkoord geven of u die wilt laten uitvoeren; daar ziet u direct het totaal.' && tekst(w, '#acOptHint') === 'U kiest na Akkoord geven of u de optie wilt.');
    klik(w, '.ac-btn-ok'); check('één optie: één vinkje', aantal(w, '#acForm input[data-opt]') === 1);
  }
  {
    const { w, E } = await metOpties(TAB2);
    klik(w, '.ac-btn-ok'); vink(w, 'oA', true);
    klik(w, '.ac-btn-nee');
    w.__ev("window.__root.querySelector('#acNaam').value = 'Jan'; window.__root.querySelector('#acNotitie').value = 'te duur'"); klik(w, '.ac-submit'); await even();
    check('afwijzen na een vinkje: geen veld opties verstuurd, niets van de keuze vastgelegd', !('opties' in w.__fetchLog[0]) && linkRij(E).status === 'afgekeurd' && linkRij(E).optiekeuze === null && q(w, '#acOpties') === null && q(w, '#acOptWijzer') === null);
  }
  {
    const { w, E } = await metOpties(TAB2);
    klik(w, '.ac-btn-vraag');
    w.__ev("window.__root.querySelector('#acNotitie').value = 'Kan het in maart?'"); klik(w, '.ac-submit'); await even();
    check('vraag stellen: wijzer blijft staan, de klant kan daarna nog kiezen', linkRij(E).status === 'open' && q(w, '#acOptWijzer') !== null && q(w, '#acOptHint') !== null);
    klik(w, '.ac-btn-ok'); check('na een vraag: Akkoord geven toont de vinkjes weer', aantal(w, '#acForm input[data-opt]') === 2);
  }
  {
    // de server weigert: melding, formulier en vinkjes blijven
    const gat = K(TAB2);
    const { w, E } = await metOpties(gat);
    E.db.tabellen.offerte_accorderingen[0].cijfers.opties.combi = gat.combi.filter(x => x.ids.length !== 1 || x.ids[0] !== 'oA');
    klik(w, '.ac-btn-ok'); vink(w, 'oA', true);
    w.__ev("window.__root.querySelector('#acNaam').value = 'Jan'; window.__root.querySelector('#acAkkVink').checked = true"); klik(w, '.ac-submit'); await even();
    check('server weigert: melding, vinkjes blijven, link open', w.__alerts.some(a => /niet beschikbaar/.test(a)) && aantal(w, '#acForm input[data-opt]') === 2 && linkRij(E).status === 'open');
  }
  {
    const { w, html } = await metOpties(TAB8);
    check('acht opties: wijzer noemt 8', /heeft 8 opties/.test(tekst(w, '#acOptWijzer')));
    klik(w, '.ac-btn-ok'); ['oC', 'oE', 'oH'].forEach(id => vink(w, id, true));
    const x = TAB8.combi.find(c => J(c.ids.slice().sort()) === J(['oC', 'oE', 'oH']));
    check('acht opties: acht vinkjes in het formulier, totaal van drie gekozen uit de tabel', aantal(w, '#acForm input[data-opt]') === 8 && tekst(w, '.ac-opt-tot-groot') === eurNL(x.incl) + ' incl. btw' && /optie 3, 5 en 8/.test(tekst(w, '.ac-opt-tot-lbl')));
  }
  {
    const vuil = K(TAB2); vuil.opties[0].titel = '<img src=x onerror=alert(1)>'; vuil.opties[0].klanttekst = 'regel 1\n<script>x</script>';
    const { w } = await metOpties(vuil);
    klik(w, '.ac-btn-ok');
    const h = w.__ev("window.__root.innerHTML");
    check('titel en omschrijving als tekst, niet als code', h.indexOf('<img src=x') < 0 && h.indexOf('<script>x') < 0 && aantal(w, '#acOpties img, #acOpties script') === 0);
  }

  console.log('4. De zin over de opties in de offertemail');
  {
    const N = laad(padNieuw), O = laad(padOud);
    const std = (L, a, n) => L.run("_offerteMailStandaardtekst(" + J(a) + (n === undefined ? '' : ', ' + J(n)) + ")");
    check('zonder opties letterlijk de tekst van v4.131.0', std(N, 'heer Ernes') === std(O, 'heer Ernes') && std(N, 'heer Ernes', 0) === std(O, 'heer Ernes') && std(N, '', null) === std(O, ''));
    const t2 = std(N, 'heer Ernes', 2), t1 = std(N, 'heer Ernes', 1);
    check('twee opties: de zin staat erin, als eigen alinea na de eerste', t2.indexOf('\n\nDe offerte bevat 2 opties. Bij uw akkoord kiest u zelf welke u wilt laten uitvoeren; u ziet dan direct het totaal.\n\nU kunt de offerte hieronder bekijken') > 0, t2);
    check('één optie: enkelvoud', t1.indexOf('De offerte bevat 1 optie. Bij uw akkoord kiest u zelf of u die wilt laten uitvoeren; u ziet dan direct het totaal.') > 0);
    check('de rest van de tekst is gelijk', t2.replace('De offerte bevat 2 opties. Bij uw akkoord kiest u zelf welke u wilt laten uitvoeren; u ziet dan direct het totaal.\n\n', '') === std(O, 'heer Ernes'));
    const n = r => { N.ctx.__r = J(r); return N.run("_optOnlineAantal(JSON.parse(__r))"); };
    check('aantal: link met merkteken telt zijn opties', n({ cijfers: { opties: TAB2 } }) === 2 && n({ cijfers: { opties: TAB8 } }) === 8);
    const zonder = K(TAB2); delete zonder.online;
    check('aantal: geen merkteken, merkteken 0, tekst "1", geen cijfers of geen rij geeft 0', n({ cijfers: { opties: zonder } }) === 0 && n({ cijfers: { opties: Object.assign(K(TAB2), { online: 0 }) } }) === 0 && n({ cijfers: { opties: Object.assign(K(TAB2), { online: '1' }) } }) === 0 && n({ cijfers: null }) === 0 && n({}) === 0 && n(null) === 0);
    check('het venster Offerte mailen geeft het aantal van de link door', /_offerteMailStandaardtekst\(aanhef, _optOnlineAantal\(rij\)\)/.test(ontNieuw.functies._offerteMailen));
  }

  console.log('5. Melding bij een gewiste inlogsessie');
  {
    const roep = async (pad, status, body) => {
      const L = laad(pad);
      L.run("_sb = { auth: { getSession: function () { return Promise.resolve({ data: { session: { access_token: 'sessie' } } }); } } }");
      L.ctx.__status = status; L.ctx.__body = J(body);
      L.run("fetch = function () { return Promise.resolve({ ok: __status >= 200 && __status < 300, status: __status, json: function () { return Promise.resolve(JSON.parse(__body)); } }); }");
      try { const r = await L.run("_offerteVerzendCall('tok', 'tekst')"); return { ok: K(r) }; } catch (e) { return { fout: String(e && e.message) }; }
    };
    const n1 = await roep(padNieuw, 401, { error: 'Geen toegang: sessie ongeldig (403)' }), o1 = await roep(padOud, 401, { error: 'Geen toegang: sessie ongeldig (403)' });
    check('v4.131.0 gaf de kale melding', o1.fout === 'Geen toegang: sessie ongeldig (403)', J(o1));
    check('nieuw: zegt dat je niet meer bent ingelogd en wat je moet doen, met de oorzaak erachter', n1.fout === 'je bent in dit tabblad niet meer ingelogd. Log uit en opnieuw in, en probeer het nog eens. (Geen toegang: sessie ongeldig (403))', J(n1));
    const n2 = await roep(padNieuw, 401, { error: 'Geen toegang: anon-sleutel is geen sessie' });
    check('ook bij "anon-sleutel is geen sessie"', /niet meer ingelogd/.test(n2.fout));
    for (const [st, b] of [[409, { error: 'Deze link is al afgehandeld; maak een nieuwe link en mail die.' }], [502, { error: 'Versturen via Resend mislukt. Controleer RESEND_API_KEY en het Resend-logboek.' }], [400, { error: 'geen token' }], [500, {}]]) {
      const a = await roep(padNieuw, st, b), o = await roep(padOud, st, b);
      check('andere fout (' + st + ') ongewijzigd', a.fout === o.fout && !/ingelogd/.test(a.fout), J([a, o]));
    }
    const goedN = await roep(padNieuw, 200, { ok: true, naar: 'k@t.nl', stempel: true }), goedO = await roep(padOud, 200, { ok: true, naar: 'k@t.nl', stempel: true });
    check('geslaagde verzending ongewijzigd', J(goedN) === J(goedO) && goedN.ok && goedN.ok.ok === true);
  }

  console.log('\n' + (mis ? 'MISLUKT' : 'ALLES GOED') + ': ' + goed + ' goed, ' + mis + ' mis');
  if (mis) { console.log(misLijst.map(x => ' - ' + x).join('\n')); process.exit(1); }
})().catch(e => { console.error('TEST GECRASHT:', e); process.exit(1); });
