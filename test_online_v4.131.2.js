// test_online_v4.131.2.js — hoort bij index.html v4.131.2 en Edge Function offerte-accord
// versie 45: onder elke optie de regel "Geldt voor" (hoofdgroep, onderdeel, omschrijving van
// de regel) op het document, de klantpagina, in mail B en C en op de akkoordbevestiging.
// Gebruik: node test_online_v4.131.2.js <index.html v4.131.1> <index.html v4.131.2> <edge versie 44 .ts> <edge versie 45 .ts>
// Nodig: npm install acorn jsdom pdf-lib, Node 22.13 of nieuwer, en in dezelfde map
// test_keuzes_laad.js, test_keuzes_fixture.js en test_online_edge.js.
// De rekenkant is niet gewijzigd; daarvoor blijft test_online_v4.131.0.js de set.
const fs = require('fs'), acorn = require('acorn');
const { JSDOM } = require('jsdom');
const { laad } = require('./test_keuzes_laad.js');
const FIX = require('./test_keuzes_fixture.js');
const { laadEdge } = require('./test_online_edge.js');
const padOud = process.argv[2], padNieuw = process.argv[3], padEdgeOud = process.argv[4], padEdge = process.argv[5];
if (!padOud || !padNieuw || !padEdgeOud || !padEdge) { console.log('Gebruik: node test_online_v4.131.2.js <index.html v4.131.1> <index.html v4.131.2> <edge versie 44 .ts> <edge versie 45 .ts>'); process.exit(2); }
let goed = 0, mis = 0; const misLijst = [];
function check(naam, v, detail) { if (v) goed++; else { mis++; misLijst.push(naam + (detail ? ' :: ' + detail : '')); console.log('  MIS  ' + naam + (detail ? ' :: ' + detail : '')); } }
const J = x => JSON.stringify(x);
const K = x => JSON.parse(JSON.stringify(x));
const cent = (a, b) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 0.005;
const even = ms => new Promise(r => setTimeout(r, ms || 60));
const PIJL = ' \u203a ';

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
async function vers(pad, variant) {
  const L = laad(pad); L.run(FIX);
  L.run("__zetKlaar(__maakCalc(" + J(variant) + ")); data.calc.btwPctOverride = 9;");
  await L.run("__syncAlles()");
  return L;
}
function edgeMet(pad, tab, extra) {
  const E = laadEdge(pad);
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
  w.__fetchLog = []; w.__alerts = [];
  w.alert = t => w.__alerts.push(String(t));
  w.Element.prototype.scrollIntoView = function () {};
  w.eval("var SUPABASE_URL = 'http://sb.test', SUPABASE_KEY = 'anon';\n" + code + "\n;window.__ev = function (s) { return eval(s); };");
  return w;
}
const render = (w, res) => { w.__res = J(res); return w.__ev("(function(){ _accordCtx = null; _accordVerlopenModus = false; const r = document.createElement('div'); r.id = 'accordRoot'; document.body.innerHTML = ''; document.body.appendChild(r); _accordRender(r, 'tok1', JSON.parse(window.__res)); window.__root = r; return r.innerHTML; })()"); };
const tekst = (w, sel) => w.__ev("(function(){ const e = window.__root.querySelector(" + J(sel) + "); return e ? e.textContent : null; })()");
const klik = (w, sel) => w.__ev("window.__root.querySelector(" + J(sel) + ").click()");

(async () => {
  console.log('oud:   ' + padOud + '\nnieuw: ' + padNieuw + '\nedge 44: ' + padEdgeOud + '\nedge 45: ' + padEdge + '\n');
  const ontOud = ontleed(padOud), ontNieuw = ontleed(padNieuw);

  console.log('1. Waar een optie voor geldt');
  let TAB2, TAB8, TAB2oud;
  {
    const N = await vers(padNieuw, 'regels'), D = await vers(padNieuw, 'delen');
    const waar = (L, id) => L.run("(function(){ const o = _optBereken(data.calc).opties.find(x => x.id === " + J(id) + "); return o ? _optWaar(o) : null; })()");
    check('andere uitvoering van een regel: hoofdgroep, onderdeel, omschrijving van de regel', waar(N, 'oA') === 'Binnen' + PIJL + 'Woonkamer' + PIJL + 'Wanden', waar(N, 'oA'));
    check('hele regel als optie', waar(N, 'oB') === 'Binnen' + PIJL + 'Slaapkamer' + PIJL + 'Plafond', waar(N, 'oB'));
    check('heel onderdeel als optie: hoofdgroep en onderdeel', waar(D, 'oC') === 'Buiten' + PIJL + 'Achtergevel', waar(D, 'oC'));
    check('hele hoofdgroep als optie: alleen de hoofdgroep', waar(D, 'oE') === 'Garage buiten', waar(D, 'oE'));
    check('losse regel in een groot onderdeel', waar(D, 'oH') === 'Buiten' + PIJL + 'Voorgevel' + PIJL + 'Boeidelen', waar(D, 'oH'));
    // omschrijving leeg: terugval op de basisregel, daarna stoppen bij het onderdeel; nooit het verfsysteem
    N.run("__vind('r8b').naam = ''");
    check('optieregel zonder omschrijving: die van de basisregel', waar(N, 'oA') === 'Binnen' + PIJL + 'Woonkamer' + PIJL + 'Wanden');
    N.run("__vind('r8').naam = '   '");
    check('beide zonder omschrijving: het pad stopt bij het onderdeel', waar(N, 'oA') === 'Binnen' + PIJL + 'Woonkamer', waar(N, 'oA'));
    check('het verfsysteem staat er nooit in', ['oA', 'oB'].every(id => !/Wand na stucwerk|Wand overschilderen|Plafond sauzen/.test(waar(N, id))) && N.run("__vind('r8b').systeemNaam") === 'Wand na stucwerk');
    N.run("__vind('r13').naam = '  Plafond   boven  bed  '");
    check('spaties worden opgeschoond', waar(N, 'oB') === 'Binnen' + PIJL + 'Slaapkamer' + PIJL + 'Plafond boven bed');
    N.run("__vind('odSK').naam = ''; __vind('hgI').naam = ''; __vind('r13').naam = ''");
    check('geen enkele naam: lege tekst, geen "zonder naam"', waar(N, 'oB') === '');
    // een optie op meer plekken
    const M = await vers(padNieuw, 'regels');
    M.run("(function(){ const r = __vind('r11'); r.optieId = 'oB'; r.actief = false; })()");
    check('twee regels in twee onderdelen: beide genoemd', waar(M, 'oB') === 'Binnen' + PIJL + 'Hal' + PIJL + 'Plafond; Binnen' + PIJL + 'Slaapkamer' + PIJL + 'Plafond', waar(M, 'oB'));
    M.run("(function(){ ['r9','r10','r12'].forEach(function(id){ const r = __vind(id); r.optieId = 'oB'; r.actief = false; }); })()");
    const veel = waar(M, 'oB');
    check('meer dan drie plekken: drie genoemd en "en 2 andere"', veel.split('; ').length === 3 && / en 2 andere$/.test(veel), veel);
    M.run("__vind('r9').naam = 'x'.repeat(400)");
    check('nooit langer dan 240 tekens', waar(M, 'oB').length <= 240);
    check('zelfde plek twee keer wordt één keer genoemd', (function () { const Z = M; Z.run("__vind('r9').naam = 'Plafond'; __vind('r10').naam = 'Plafond'; __vind('odHL').naam = 'Woonkamer'"); const t = waar(Z, 'oB'); return t.split('Binnen' + PIJL + 'Woonkamer' + PIJL + 'Plafond').length === 2; })(), waar(M, 'oB'));
    // dubbele titels
    const dub = l => K(N.run("_optDubbeleTitels(" + J(l) + ")"));
    check('dubbele titels: hoofdletters en leestekens tellen niet mee', J(dub([{ nr: 1, titel: 'Extra grondlaag i.v.m. kleurwissel' }, { nr: 2, titel: 'Extra grondlaag i.v.m. kleurwissel.' }, { nr: 3, titel: 'Iets anders' }])) === J([[1, 2]]));
    check('dubbele titels: verschillende titels en lege titels geven niets', dub([{ nr: 1, titel: 'A' }, { nr: 2, titel: 'B' }, { nr: 3, titel: '' }, { nr: 4, titel: ' ' }]).length === 0);
    check('het blok Opties toont de melding en wat de klant ziet', /_optDubbeleTitels\(ber\.opties\)/.test(ontNieuw.functies.renderOptiesBlok) && /De klant ziet onder de titel/.test(ontNieuw.functies.renderOptiesBlok));

    const V = await vers(padNieuw, 'regels'), O = await vers(padOud, 'regels'), D8 = await vers(padNieuw, 'delen');
    TAB2 = K(V.run("_optTabelVoorLink(data.calc)")); TAB2oud = K(O.run("_optTabelVoorLink(data.calc)")); TAB8 = K(D8.run("_optTabelVoorLink(data.calc)"));
    check('tabel van de link: waar per optie', J(TAB2.opties.map(o => o.waar)) === J(['Binnen' + PIJL + 'Woonkamer' + PIJL + 'Wanden', 'Binnen' + PIJL + 'Slaapkamer' + PIJL + 'Plafond']));
    const zonder = K(TAB2); zonder.opties.forEach(o => delete o.waar); delete zonder.ms; const oudK = K(TAB2oud); delete oudK.ms;
    check('tabel van de link: verder letterlijk gelijk aan v4.131.1', J(zonder) === J(oudK));
    // document
    const doc = L => L.run("(function(){ const cij = _optVoorDocument(data.calc, null); return _optDocHtml(cij) + '|||' + JSON.stringify(_optDocContent(cij)); })()");
    const dN = doc(V), dO = doc(O);
    check('document (scherm): Geldt voor onder elke optie', dN.indexOf('<strong>Optie 1: Wanden woonkamer na stucwerk</strong><br><span style="color:#444;">Geldt voor: Binnen' + PIJL + 'Woonkamer' + PIJL + 'Wanden</span>') >= 0 && (dN.split('|||')[0].match(/Geldt voor: /g) || []).length === 2, dN.slice(0, 400));
    check('document (pdf): Geldt voor onder elke optie', (dN.split('|||')[1].match(/"text":"Geldt voor: /g) || []).length === 2);
    const strip = t => t.replace(/<br><span style="color:#444;">Geldt voor: [^<]*<\/span>/g, '').replace(/,\{"text":"Geldt voor: [^"]*","color":"#444"\}/g, '');
    check('document: zonder die regels letterlijk gelijk aan v4.131.1', strip(dN) === dO);
    V.run("_optKiesConcept = { calcId: data.calc.id, ids: new Set(['oB']) }"); await V.run("optLegVast(false)"); await V.run("new Promise(r => setTimeout(r, 20))");
    const dK = doc(V);
    check('document na een vastgelegde keuze ("Uw keuze"): ook daar Geldt voor', /<h3>Uw keuze<\/h3>/.test(dK) && dK.indexOf('Geldt voor: Binnen' + PIJL + 'Slaapkamer' + PIJL + 'Plafond') > 0 && dK.indexOf('Woonkamer' + PIJL + 'Wanden') < 0);
  }

  console.log('2. Edge Function versie 45 naast versie 44');
  {
    // a. een link zonder het veld waar (gemaakt met v4.131.1): 45 gedraagt zich als 44
    const Ea = edgeMet(padEdgeOud, TAB2oud), Eb = edgeMet(padEdge, TAB2oud);
    const ga = (await Ea.roep('GET', null, '?token=tok1&intern=1')).body, gb = (await Eb.roep('GET', null, '?token=tok1&intern=1')).body;
    check('link zonder waar: versie 45 geeft een lege tekst mee', gb.opties.opties.every(o => o.waar === ''));
    const gbK = K(gb); gbK.opties.opties.forEach(o => delete o.waar);
    check('link zonder waar: antwoord bij ophalen verder gelijk aan versie 44', J(gbK) === J(ga));
    const pa = await Ea.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: ['oA', 'oB'] }), pb = await Eb.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: ['oA', 'oB'] });
    const kaal = k => { const x = K(k); delete x.waar; delete x.op; return J(x); };
    check('link zonder waar: vastgelegde keuze gelijk aan versie 44, plus lege waar', kaal(linkRij(Ea).optiekeuze) === kaal(linkRij(Eb).optiekeuze) && J(linkRij(Eb).optiekeuze.waar) === J(['', '']) && linkRij(Ea).optiekeuze.waar === undefined && cent(linkRij(Ea).bedrag, linkRij(Eb).bedrag));
    check('link zonder waar: mail B en mail C letterlijk gelijk aan versie 44', Ea.mails.length === 2 && Eb.mails.length === 2 && Ea.mails.every((m, i) => m.subject === Eb.mails[i].subject && m.html.replace(/\d{1,2} \w+ \d{4} om \d{2}:\d{2}/g, 'T') === Eb.mails[i].html.replace(/\d{1,2} \w+ \d{4} om \d{2}:\d{2}/g, 'T')) && Eb.mails[0].html.indexOf('Geldt voor') < 0 && Eb.mails[1].html.indexOf('geldt voor') < 0, J([pa.status, pb.status]));
    // b. links zonder opties, plan en houtrot: 45 gelijk aan 44
    for (const [naam, extra, voor] of [
      ['gewone link zonder opties', {}, null],
      ['planlink', { onderhoudsplan_id: 'plan1' }, E => E.db.tabellen.onderhoudsplannen.push({ id: 'plan1', naam: 'Plan', status: 'verzonden', betaalmodel: 'beide', offerte_config: { geldigTot: '2999-01-01' } })],
      ['houtrot-opgave', { calculatie_id: null, oplevering_id: 'opl1', snapshot: { geldigTot: '2999-01-01', offertenummer: 'H-1', klantEmail: 'k@t.nl' } }, E => E.db.tabellen.opleveringen.push({ id: 'opl1', projectnaam: 'Rot', klant: 'K', status: 'verstuurd' })]
    ]) {
      const A = edgeMet(padEdgeOud, null, extra), B = edgeMet(padEdge, null, extra);
      if (voor) { voor(A); voor(B); }
      const g1 = await A.roep('GET', null, '?token=tok1&intern=1'), g2 = await B.roep('GET', null, '?token=tok1&intern=1');
      const body = { token: 'tok1', actie: 'akkoord', naam: 'Jan', betaalkeuze: 'abo', opties: ['oA'] };
      const p1 = await A.roep('POST', body), p2 = await B.roep('POST', body);
      const rij = E => { const r = K(linkRij(E)); delete r.gereageerd_op; return J(r); };
      const tijdloos = h => h.replace(/\d{1,2} \w+ \d{4} om \d{2}:\d{2}/g, 'T');
      check(naam + ': ophalen, akkoord, rij en mails gelijk aan versie 44', J(g1) === J(g2) && J(p1) === J(p2) && rij(A) === rij(B) && A.mails.length === B.mails.length && A.mails.every((m, i) => m.subject === B.mails[i].subject && tijdloos(m.html) === tijdloos(B.mails[i].html)), J([g1.status, p1, p2, A.mails.length, B.mails.length]));
    }
    // c. een link met waar
    const E = edgeMet(padEdge, TAB2);
    const g = await E.roep('GET', null, '?token=tok1&intern=1');
    check('ophalen: waar per optie, en verder alleen de smalle vorm', J(g.body.opties.opties.map(o => o.waar)) === J(TAB2.opties.map(o => o.waar)) && g.body.opties.opties.every(o => J(Object.keys(o).sort()) === J(['id', 'klanttekst', 'meerExcl', 'meerIncl', 'nr', 'titel', 'waar'])));
    const doel = TAB2.combi.find(x => x.ids.length === 1 && x.ids[0] === 'oB');
    const p = await E.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: ['oB'], waar: ['verzonnen'] });
    const ok = linkRij(E).optiekeuze;
    check('akkoord: waar vastgelegd uit de tabel van de link, in de volgorde van titels', p.status === 200 && J(ok.waar) === J(['Binnen' + PIJL + 'Slaapkamer' + PIJL + 'Plafond']) && ok.titels.length === 1 && ok.titels[0] === 'Optie 2: Plafond slaapkamer' && cent(linkRij(E).bedrag, doel.incl), J(ok));
    const mb = E.mails.find(m => m.to[0] === 'klant@test.nl'), mc = E.mails.find(m => m.to[0] === 'info@ernes.nl');
    check('mail B: onder de optie "Geldt voor"', mb.html.indexOf('<li>Optie 2: Plafond slaapkamer<br><span style="color:#666666;">Geldt voor: Binnen' + PIJL + 'Slaapkamer' + PIJL + 'Plafond</span></li>') > 0, mb.html.slice(250, 800));
    check('mail C: achter de optie "(geldt voor: …)"', mc.html.indexOf('Optie 2: Plafond slaapkamer (geldt voor: Binnen' + PIJL + 'Slaapkamer' + PIJL + 'Plafond)') > 0);
    const vuil = K(TAB2); vuil.opties[0].waar = '<b>Buiten</b> & "voor"'; vuil.opties[1].waar = 'y'.repeat(500);
    const Ev = edgeMet(padEdge, vuil);
    const gv = await Ev.roep('GET', null, '?token=tok1&intern=1');
    await Ev.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan', opties: ['oA', 'oB'] });
    check('waar wordt in de mail als tekst gezet en afgekapt op 300 tekens', Ev.mails[0].html.indexOf('<b>Buiten</b>') < 0 && Ev.mails[0].html.indexOf('&lt;b&gt;Buiten&lt;/b&gt; &amp; &quot;voor&quot;') > 0 && gv.body.opties.opties[1].waar.length === 300);
    const geenTekst = K(TAB2); geenTekst.opties[0].waar = { a: 1 }; geenTekst.opties[1].waar = null;
    const Eg = edgeMet(padEdge, geenTekst);
    const gg = await Eg.roep('GET', null, '?token=tok1&intern=1');
    check('waar dat geen tekst is of ontbreekt: de link werkt gewoon', gg.status === 200 && gg.body.opties.opties[1].waar === '' && (await Eg.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan', opties: ['oB'] })).status === 200);
    const basis = edgeMet(padEdge, TAB2);
    await basis.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan' });
    check('niets gekozen: lege lijst waar, mail zonder "Geldt voor"', J(linkRij(basis).optiekeuze.waar) === J([]) && basis.mails[0].html.indexOf('Geldt voor') < 0);
  }

  console.log('3. De klantpagina');
  {
    async function metOpties(ont, tab) {
      const E = edgeMet(padEdge, tab);
      const get = await E.roep('GET', null, '?token=tok1&intern=1');
      const w = pagina(ont);
      w.fetch = async (url, opt) => { const body = JSON.parse(opt.body); w.__fetchLog.push(body); const r = await E.roep('POST', body); return { ok: r.status === 200, status: r.status, json: async () => r.body }; };
      render(w, get.body);
      return { w, E, get };
    }
    const { w, E } = await metOpties(ontNieuw, TAB2);
    klik(w, '.ac-btn-ok');
    const blok = w.__ev("window.__root.querySelector('#acOpties').innerHTML");
    check('bij elk vinkje staat Geldt voor, direct onder de titel', blok.indexOf('<strong>Optie 1: Wanden woonkamer na stucwerk</strong><br><span class="ac-opt-waar">Geldt voor: Binnen' + PIJL + 'Woonkamer' + PIJL + 'Wanden</span>') > 0 && (blok.match(/class="ac-opt-waar"/g) || []).length === 2, blok.slice(0, 700));
    check('de omschrijving staat er nog onder', blok.indexOf('Wanden</span><br><span>Voorstrijken en twee keer sauzen.</span>') > 0);
    w.__ev("(function(){ const v = window.__root.querySelector('input[data-opt=\"oA\"]'); v.checked = true; v.dispatchEvent(new window.Event('change', { bubbles: true })); window.__root.querySelector('#acNaam').value = 'Jan'; window.__root.querySelector('#acAkkVink').checked = true; })()");
    klik(w, '.ac-submit'); await even();
    check('verstuurd: nog steeds alleen ids', J(Object.keys(w.__fetchLog[0]).sort()) === J(['actie', 'naam', 'notitie', 'opties', 'token']));
    check('na akkoord: "Uw keuze" met Geldt voor', /Uw keuze/.test(tekst(w, '#acOpties')) && w.__ev("window.__root.querySelector('#acOpties').innerHTML").indexOf('<li>Optie 1: Wanden woonkamer na stucwerk<br><span class="ac-opt-waar">Geldt voor: Binnen' + PIJL + 'Woonkamer' + PIJL + 'Wanden</span></li>') > 0);
    const h2 = render(w, (await E.roep('GET', null, '?token=tok1&intern=1')).body);
    check('heropenen na akkoord: Geldt voor staat er nog', h2.indexOf('Geldt voor: Binnen' + PIJL + 'Woonkamer' + PIJL + 'Wanden') > 0);
    // link zonder waar: pagina gelijk aan v4.131.1
    const a = await metOpties(ontOud, TAB2oud), b = await metOpties(ontNieuw, TAB2oud);
    klik(a.w, '.ac-btn-ok'); klik(b.w, '.ac-btn-ok');
    check('link zonder waar: pagina en formulier letterlijk gelijk aan v4.131.1', a.w.__ev("window.__root.innerHTML") === b.w.__ev("window.__root.innerHTML") && b.w.__ev("window.__root.innerHTML").indexOf('Geldt voor') < 0);
    const vuil = K(TAB2); vuil.opties[0].waar = '<img src=x onerror=alert(1)>';
    const v = await metOpties(ontNieuw, vuil); klik(v.w, '.ac-btn-ok');
    check('waar wordt als tekst getoond, niet als code', v.w.__ev("window.__root.querySelectorAll('#acOpties img').length") === 0 && v.w.__ev("window.__root.innerHTML").indexOf('&lt;img src=x') > 0);
    check('telefoon: de tekst van een optie blijft naast het vinkje (flex 1 1 0)', /#accordRoot \.ac-opt-tekst \{ flex:1 1 0; min-width:0;/.test(ontNieuw.html) && !/#accordRoot \.ac-opt-tekst \{ flex:1 1 auto;/.test(ontNieuw.html));
  }

  console.log('4. De akkoordbevestiging op het getekende exemplaar');
  {
    const PDFLib = require('pdf-lib');
    const bouw = async (ont, info) => {
      const namen = ['_bouwGetekendePdfBytes', '_accordEur', '_accordBetaalLabel', '_accordOptZakelijk'];
      const code = namen.filter(n => ont.functies[n]).map(n => ont.functies[n]).join('\n');
      const getekend = [];
      const orig = PDFLib.PDFPage.prototype.drawText;
      PDFLib.PDFPage.prototype.drawText = function (t, o) { getekend.push(String(t)); return orig.call(this, t, o); };
      try {
        const fn = new Function('PDFLib', code + '\nreturn _bouwGetekendePdfBytes;')(PDFLib);
        const leeg = await PDFLib.PDFDocument.create(); leeg.addPage([595.28, 841.89]);
        await fn(await leeg.save(), info);
        return getekend;
      } finally { PDFLib.PDFPage.prototype.drawText = orig; }
    };
    const info = { naam: 'Jan Test', datumIso: '2026-11-25T10:00:00Z', project: 'Testhuis', klant: 'Fam. Test', bedrag: 5123.45, notitie: '' };
    const ok = { ids: ['oA', 'oC'], nrs: [1, 3], titels: ['Optie 1: Extra grondlaag', 'Optie 3: Extra grondlaag.'], waar: ['Buiten' + PIJL + 'Voorgevel' + PIJL + 'Kozijnen', ''], excl: 4700.41, incl: 5123.45, klanttype: 'consument' };
    const t = await bouw(ontNieuw, Object.assign({}, info, { optiekeuze: ok }));
    check('onder de eerste optie "Geldt voor", met > in plaats van het pijltje', t.indexOf('Geldt voor: Buiten > Voorgevel > Kozijnen') === t.indexOf('Optie 1: Extra grondlaag') + 2 && t.indexOf('Geldt voor: Buiten > Voorgevel > Kozijnen') < t.indexOf('Optie 3: Extra grondlaag.') && t.join('|').indexOf('?') < 0, J(t));
    check('een optie zonder waar krijgt geen lege regel', t.filter(x => /^Geldt voor/.test(x)).length === 1);
    const zonder = Object.assign({}, ok); delete zonder.waar;
    check('keuze zonder waar (akkoord van voor versie 45): gelijk aan v4.131.1', J(await bouw(ontNieuw, Object.assign({}, info, { optiekeuze: zonder }))) === J(await bouw(ontOud, Object.assign({}, info, { optiekeuze: zonder }))));
    check('zonder keuze: gelijk aan v4.131.1', J(await bouw(ontNieuw, info)) === J(await bouw(ontOud, info)));
    const lang = await bouw(ontNieuw, Object.assign({}, info, { optiekeuze: Object.assign({}, ok, { waar: ['Heel lange naam van een hoofdgroep '.repeat(8), ''] }) }));
    check('een lange tekst wordt afgekapt', lang.some(x => /^Geldt voor: /.test(x) && /\u2026$/.test(x) && x.length < 100));
  }

  console.log('5. Wat gewijzigd is en wat niet');
  {
    const gewijzigd = Object.keys(ontNieuw.functies).filter(n => ontOud.functies[n] && ontOud.functies[n] !== ontNieuw.functies[n]).sort();
    const nieuw = Object.keys(ontNieuw.functies).filter(n => !ontOud.functies[n]).sort();
    const weg = Object.keys(ontOud.functies).filter(n => !ontNieuw.functies[n]);
    check('precies de verwachte functies gewijzigd', J(gewijzigd) === J(['_accordOptBlokHtml', '_accordOptVastHtml', '_bouwGetekendePdfBytes', '_optDocContent', '_optDocHtml', '_optTabelVoorLink', '_optVoorDocument', 'renderOptiesBlok']), J(gewijzigd));
    check('precies twee nieuwe functies', J(nieuw) === J(['_optDubbeleTitels', '_optWaar']), J(nieuw));
    check('geen functie verdwenen', weg.length === 0, J(weg));
    for (const n of ['_berekenOfferteCijfers', '_optBereken', '_optAanbod', '_optMetStand', '_optPasStandToe', 'optLegVast', '_optOnlineVerwerk', '_optOnlineOordeel', '_accordCijfersVoorLink', '_accordNieuweLink', '_accordRender', '_accordFormHtml', '_accordWireActies', '_accordVerstuur', '_accordOptCombi', '_accordOptWire', '_offerteMailStandaardtekst', '_offerteVerzendCall'])
      check('ongewijzigd: ' + n, !!ontOud.functies[n] && ontOud.functies[n] === ontNieuw.functies[n]);
    check('versienummer v4.131.2 op drie plekken', /const APP_VERSION = 'v4\.131\.2';/.test(ontNieuw.html) && ontNieuw.html.indexOf('Welkom bij v4.131.2</h2>') > 0 && /\{ v: '4\.131\.2', d: '2026-11-25'/.test(ontNieuw.html));
    const e44 = fs.readFileSync(padEdgeOud, 'utf8').split('\n'), e45 = fs.readFileSync(padEdge, 'utf8').split('\n');
    const set44 = new Set(e44);
    const erbij = e45.filter(r => !set44.has(r)), set45 = new Set(e45), eraf = e44.filter(r => !set45.has(r));
    check('Edge Function: alleen regels over waar zijn gewijzigd of erbij', eraf.length === 3 && erbij.every(r => /waar|v4\.131\.2|^\/\/|^$|optiekeuze\.titels\.length$|basisuitvoering, zonder opties|^\}$|^return typeof w === "string"/.test(r.trim()) || /waar/i.test(r)), J({ eraf: eraf.map(r => r.trim().slice(0, 60)), erbij: erbij.length }));
    console.log('     Edge Function: ' + erbij.length + ' regels erbij, ' + eraf.length + ' regels vervangen');
  }

  console.log('\n' + (mis ? 'MISLUKT' : 'ALLES GOED') + ': ' + goed + ' goed, ' + mis + ' mis');
  if (mis) { console.log(misLijst.map(x => ' - ' + x).join('\n')); process.exit(1); }
})().catch(e => { console.error('TEST GECRASHT:', e); process.exit(1); });
