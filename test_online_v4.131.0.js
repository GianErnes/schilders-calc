// test_online_v4.131.0.js — hoort bij index.html v4.131.0 en de Edge Function offerte-accord
// met online kiezen (release 3: de klant kiest zijn opties op de accordeerpagina).
// Gebruik: node test_online_v4.131.0.js <index.html v4.130.0> <index.html v4.131.0> <offerte-accord_index.ts>
// Nodig: npm install acorn jsdom pdf-lib, Node 22.13 of nieuwer, en in dezelfde map
// test_keuzes_laad.js, test_keuzes_fixture.js en test_online_edge.js.
// De referentie voor de bedragen is het echte v4.130.0: daar wordt dezelfde samenstelling met
// de knop "Leg deze keuze vast" gezet. De Edge Function draait als echte code in Node, met een
// nagebootste database en zonder netwerk.
// Bijgewerkt op 25-11-2026 voor v4.131.1: daar staan de vinkjes in het akkoordformulier. Krijgt
// deze set een index.html van v4.131.1 of nieuwer, dan slaat hij sectie 10 (de klantpagina) en de
// drie tellingen van gewijzigde functies over; die zitten in test_online_v4.131.1.js. De
// secties over de tabel, de Edge Function, de keten op de cent en het verwerken draaien altijd.
const fs = require('fs'), vm = require('vm'), acorn = require('acorn');
const { laad } = require('./test_keuzes_laad.js');
const FIX = require('./test_keuzes_fixture.js');
const { laadEdge } = require('./test_online_edge.js');
const padOud = process.argv[2], padNieuw = process.argv[3], padEdge = process.argv[4];
if (!padOud || !padNieuw || !padEdge) { console.log('Gebruik: node test_online_v4.131.0.js <index.html v4.130.0> <index.html v4.131.0> <offerte-accord_index.ts>'); process.exit(2); }
let goed = 0, mis = 0; const misLijst = [];
function check(naam, v, detail) { if (v) goed++; else { mis++; misLijst.push(naam + (detail ? ' :: ' + detail : '')); console.log('  MIS  ' + naam + (detail ? ' :: ' + detail : '')); } }
const J = x => JSON.stringify(x);
const K = x => JSON.parse(JSON.stringify(x));
const cent = (a, b) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 0.005;
const eurNL = n => '\u20ac ' + Number(n).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const wacht = L => L.run("new Promise(r => setTimeout(r, 20))");
const ORDE = ['oA', 'oB', 'oC', 'oD', 'oE', 'oF', 'oG', 'oH'];
// Posten bij opties, waaronder een steiger van derden met een eigen btw-tarief (21% naast 9%).
const POSTEN = {
  oC: [{ naam: 'Steiger achtergevel', type: 'vast', bedrag: 850, btwPct: 21, kostensoort: 'materieel' }, { naam: 'Hoogwerker achtergevel', type: 'eenheid', bedrag: 175, hoeveelheid: 2, eenheid: 'dag', kostensoort: 'materieel' }],
  oE: [{ naam: 'Container garage', type: 'vast', bedrag: 60 }],
  oA: [{ naam: 'Extra afplakmateriaal', type: 'eenheid', bedrag: 12.5, hoeveelheid: 3, eenheid: 'stuk' }]
};
async function vers(pad, variant, klanttype) {
  const L = laad(pad); L.run(FIX);
  L.run("__zetKlaar(__maakCalc(" + J(variant) + ")); data.calc.btwPctOverride = 9;");
  if (klanttype) L.run("data.calc.offerteConfig.klanttype = " + J(klanttype) + "; __db.tabellen.calculaties[0].offerte_config.klanttype = " + J(klanttype) + ";");
  if (variant) {
    const ids = L.run("_optCfgLijst(data.calc).map(o => o.id)");
    for (const id of Object.keys(POSTEN)) if (ids.indexOf(id) >= 0) for (const q of POSTEN[id]) { await L.run("optPostZet(" + J(id) + ", null, " + J(q) + ")"); await wacht(L); }
  }
  await L.run("__syncAlles()");
  return L;
}
const tabelVan = L => K(L.run("_optTabelVoorLink(data.calc)"));
// Een verse Edge Function met één offerte-link waarin deze tabel zit.
function edgeMet(tabel, extra) {
  const E = laadEdge(padEdge);
  E.db.tabellen.calculaties.push({ id: 'calc1', naam: 'Testhuis', klant: 'Fam. Test', offerte_config: { geldigTot: '2999-01-01' }, status: 'verzonden' });
  E.db.tabellen.offerte_accorderingen.push(Object.assign({
    id: 'L1', token: 'tok1', calculatie_id: 'calc1', status: 'open', vragen: [], klant_naam: null, notitie: null, gereageerd_op: null,
    snapshot: { offertenummer: '26-100', aanhef: 'heer Test', klantEmail: 'klant@test.nl', html: '<p>document</p>' },
    bedrag: tabel ? tabel.basis.incl : 1000, cijfers: tabel ? { v: 1, opties: tabel, regels: [{ naam: 'GEHEIM regel' }], staart: [{ naam: 'GEHEIM staart' }] } : null,
    eerste_geopend_op: '2026-11-01T10:00:00Z', geopend_aantal: 1, pdf_path: null, onderhoudsplan_id: null, oplevering_id: null, betaalkeuze: null, optiekeuze: null, optie_verwerkt_op: null
  }, extra || {}));
  return E;
}
const linkRij = E => E.db.tabellen.offerte_accorderingen[0];
// De link zoals de app hem na het akkoord in de database ziet.
function zetAkkoordInApp(L, rij) {
  L.ctx.__rij = J({ id: rij.id, calculatie_id: 'calc1', onderhoudsplan_id: null, oplevering_id: null, status: rij.status, klant_naam: rij.klant_naam,
    gereageerd_op: rij.gereageerd_op, bedrag: rij.bedrag, optiekeuze: rij.optiekeuze, optie_verwerkt_op: rij.optie_verwerkt_op || null });
  L.run("__db.tabellen.offerte_accorderingen = [JSON.parse(__rij)]");
}
const schrijfLog = L => K(L.run("__db.log.filter(x => x.op !== 'select').map(x => x.tabel + ':' + x.op)"));
// Top-level declaraties uit het inline script snijden (voor jsdom en voor de vergelijking).
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
  return { functies, delen };
}

(async () => {
  console.log('oud:   ' + padOud + '\nnieuw: ' + padNieuw + '\nedge:  ' + padEdge + '\n');
  const ontOud = ontleed(padOud), ontNieuw = ontleed(padNieuw);
  const LATER = !!ontNieuw.functies._accordOptWijzer;   // v4.131.1 of nieuwer
  if (LATER) console.log('(index.html is v4.131.1 of nieuwer: sectie 10 en de functietellingen worden overgeslagen, zie test_online_v4.131.1.js)\n');

  console.log('1. De tabel bij de link');
  let TAB2, TAB8;
  {
    const N = await vers(padNieuw, 'regels'), O = await vers(padOud, 'regels');
    const tn = tabelVan(N), to = tabelVan(O);
    TAB2 = tn;
    check('basis en alle samenstellingen gelijk aan v4.130.0', J(tn.basis) === J(to.basis) && J(tn.combi) === J(to.combi), J(tn.combi) + ' / ' + J(to.combi));
    check('id, soort en titel per optie gelijk aan v4.130.0', J(tn.opties.map(o => [o.id, o.soort, o.titel])) === J(to.opties.map(o => [o.id, o.soort, o.titel])));
    check('v4.130.0 zet geen merkteken', to.online === undefined);
    check('nieuw: merkteken online = 1 op de basis', tn.online === 1, J(tn.online));
    check('nieuw: klanttype standaard consument', tn.klanttype === 'consument');
    check('nieuw: per optie nummer, klanttekst en meerprijs', tn.opties.every((o, i) => o.nr === i + 1 && typeof o.klanttekst === 'string' && typeof o.meerExcl === 'number' && typeof o.meerIncl === 'number'));
    check('meerprijs in de tabel = samenstelling met alleen die optie min de basis', tn.opties.every(o => { const x = tn.combi.find(k => k.ids.length === 1 && k.ids[0] === o.id); return cent(o.meerIncl, Math.round((x.incl - tn.basis.incl) * 100) / 100) && cent(o.meerExcl, Math.round((x.excl - tn.basis.excl) * 100) / 100); }));
    check('4 samenstellingen bij 2 opties', tn.combi.length === 4);
    const Z = await vers(padNieuw, 'regels', 'zakelijk'); check('klanttype zakelijk gaat mee', tabelVan(Z).klanttype === 'zakelijk');
    const V = await vers(padNieuw, 'regels', 'vve'); check('klanttype vve gaat mee', tabelVan(V).klanttype === 'vve');
    // Is er al een keuze vastgelegd, dan geen online kiezen.
    N.run("_optKiesConcept = { calcId: data.calc.id, ids: new Set(['oB']) }");
    await N.run("optLegVast(false)"); await wacht(N);
    const tk = tabelVan(N);
    check('na een vastgelegde keuze: merkteken online = 0', tk && tk.online === 0, J(tk && tk.online));
    const D = await vers(padNieuw, 'delen');
    TAB8 = tabelVan(D);
    check('8 opties: 256 samenstellingen en merkteken 1', TAB8.n === 8 && TAB8.combi.length === 256 && TAB8.online === 1, J([TAB8.n, TAB8.combi.length, TAB8.online]));
    console.log('     tabel met 8 opties: ' + J(TAB8).length + ' tekens');
  }

  console.log('2. Edge Function: de tabel lezen en een keuze toetsen (zonder netwerk)');
  {
    const E = edgeMet(TAB2);
    E.ctx = null;
    const lees = c => K(E.run("(function(){ const t = leesOptieTabel(" + J(c) + "); return t ? true : false; })()"));
    const kies = (tab, ids) => K(E.run("kiesSamenstelling(" + J(tab) + ", " + (ids === undefined ? 'undefined' : J(ids)) + ")"));
    check('tabel met merkteken wordt gelezen', lees({ opties: TAB2 }) === true);
    const zonder = K(TAB2); delete zonder.online;
    check('tabel zonder merkteken (link van voor v4.131.0): geen online keuze', lees({ opties: zonder }) === false);
    check('merkteken 0: geen online keuze', lees({ opties: Object.assign(K(TAB2), { online: 0 }) }) === false);
    check('merkteken als tekst "1" telt niet', lees({ opties: Object.assign(K(TAB2), { online: '1' }) }) === false);
    check('geen cijfers, lege cijfers, cijfers zonder opties: geen online keuze', lees(null) === false && lees({}) === false && lees({ opties: null }) === false);
    const geenBasis = K(TAB2); geenBasis.combi = geenBasis.combi.filter(x => x.ids.length);
    check('tabel zonder basis: geen online keuze', lees({ opties: geenBasis }) === false);
    const dubbelId = K(TAB2); dubbelId.opties[1].id = dubbelId.opties[0].id;
    check('tabel met dubbele optie-id: geen online keuze', lees({ opties: dubbelId }) === false);
    const negen = K(TAB2); while (negen.opties.length < 9) negen.opties.push({ id: 'x' + negen.opties.length, titel: 'x' });
    check('meer dan acht opties: geen online keuze', lees({ opties: negen }) === false);
    // Elke samenstelling: het bedrag komt uit de tabel.
    let alle = true;
    for (const x of TAB2.combi) { const r = kies(TAB2, x.ids.slice().reverse()); if (!(r.ok && cent(r.keuze.incl, x.incl) && cent(r.keuze.excl, x.excl) && J(r.keuze.ids.slice().sort()) === J(x.ids.slice().sort()))) alle = false; }
    check('elke samenstelling uit de tabel geeft precies het bedrag uit de tabel', alle);
    const basis = kies(TAB2, undefined);
    check('geen veld opties = basisuitvoering', basis.ok && basis.keuze.ids.length === 0 && cent(basis.keuze.incl, TAB2.basis.incl) && basis.keuze.titels.length === 0);
    check('lege lijst = basisuitvoering', kies(TAB2, []).ok && cent(kies(TAB2, []).keuze.incl, TAB2.basis.incl));
    const beide = kies(TAB2, ['oB', 'oA']);
    check('volgorde van de offerte, nummers en titels', beide.ok && J(beide.keuze.ids) === J(['oA', 'oB']) && J(beide.keuze.nrs) === J([1, 2]) && beide.keuze.titels[0] === 'Optie 1: Wanden woonkamer na stucwerk', J(beide.keuze));
    check('basisbedrag en klanttype staan in de keuze', cent(beide.keuze.basisIncl, TAB2.basis.incl) && cent(beide.keuze.basisExcl, TAB2.basis.excl) && beide.keuze.klanttype === 'consument');
    check('onbekende id geweigerd', kies(TAB2, ['oA', 'oX']).ok === false);
    check('dubbele id geweigerd', kies(TAB2, ['oA', 'oA']).ok === false);
    check('id als getal geweigerd', kies(TAB2, [1]).ok === false);
    check('id als object geweigerd', kies(TAB2, [{ id: 'oA' }]).ok === false);
    check('opties als tekst geweigerd', kies(TAB2, 'oA').ok === false);
    check('opties als object geweigerd', kies(TAB2, { 0: 'oA', length: 1 }).ok === false);
    check('meer ids dan opties geweigerd', kies(TAB2, ['oA', 'oB', 'oA']).ok === false);
    const gat = K(TAB2); gat.combi = gat.combi.filter(x => !(x.ids.length === 2));
    check('samenstelling die niet in de tabel staat geweigerd', kies(gat, ['oA', 'oB']).ok === false && kies(gat, ['oA']).ok === true);
    const dubbelRij = K(TAB2); dubbelRij.combi.push({ ids: ['oB', 'oA'], excl: 1, incl: 2 });
    check('samenstelling die twee keer in de tabel staat geweigerd', kies(dubbelRij, ['oA', 'oB']).ok === false);
    const nul = K(TAB2); nul.combi.find(x => x.ids.length === 1 && x.ids[0] === 'oA').incl = 0;
    check('samenstelling met bedrag nul geweigerd', kies(nul, ['oA']).ok === false);
    const tekst = K(TAB2); tekst.combi.find(x => x.ids.length === 1 && x.ids[0] === 'oA').incl = 'veel';
    check('samenstelling met onleesbaar bedrag geweigerd', kies(tekst, ['oA']).ok === false);
    check('bedragen geschreven als euro met punt en komma', E.run("eurNL(4741.16)") === '\u20ac 4.741,16' && E.run("eurNL(1234567.5)") === '\u20ac 1.234.567,50' && E.run("eurNL(12)") === '\u20ac 12,00');
    check('naam van de samenstelling', E.run("samenstellingNaam([])") === 'basisuitvoering, zonder opties' && E.run("samenstellingNaam([2])") === 'basisuitvoering met optie 2' && E.run("samenstellingNaam([1,3,4])") === 'basisuitvoering met optie 1, 3 en 4');
  }

  console.log('3. Edge Function: ophalen (GET)');
  const V43_GET = ['status', 'bedrag', 'snapshot', 'gereageerd_op', 'klant_naam', 'project', 'klant', 'geldig_tot', 'verlopen', 'afwijzen_mogelijk', 'document_beschikbaar', 'soort', 'betaalmodel', 'keuze_nodig', 'betaalkeuze'];
  {
    const E = edgeMet(TAB2);
    const r = await E.roep('GET', null, '?token=tok1&intern=1');
    check('open link met merkteken: opties gaan mee', r.status === 200 && r.body.opties && r.body.opties.opties.length === 2 && r.body.opties.combi.length === 4);
    check('alle velden van versie 43 staan er nog, plus opties en optiekeuze', J(Object.keys(r.body)) === J(V43_GET.concat(['opties', 'optiekeuze'])), J(Object.keys(r.body)));
    check('alleen wat de pagina nodig heeft: klanttype, basis, opties, combi', J(Object.keys(r.body.opties).sort()) === J(['basis', 'combi', 'klanttype', 'opties']));
    check('per optie alleen id, nr, titel, klanttekst, meerExcl, meerIncl', r.body.opties.opties.every(o => J(Object.keys(o).sort()) === J(['id', 'klanttekst', 'meerExcl', 'meerIncl', 'nr', 'titel'])));
    check('regels en staart uit cijfers gaan niet naar de browser', J(r.body).indexOf('GEHEIM') < 0);
    check('bedrag bij een open link is de basis', cent(r.body.bedrag, TAB2.basis.incl) && r.body.optiekeuze === null);
    const zonder = K(TAB2); delete zonder.online;
    const E2 = edgeMet(zonder);
    const r2 = await E2.roep('GET', null, '?token=tok1&intern=1');
    check('link van voor v4.131.0 (geen merkteken): opties null', r2.status === 200 && r2.body.opties === null && r2.body.optiekeuze === null);
    const E3 = edgeMet(null);
    const r3 = await E3.roep('GET', null, '?token=tok1&intern=1');
    check('link zonder cijfers: opties null en verder alles aanwezig', r3.status === 200 && r3.body.opties === null && V43_GET.every(k => k in r3.body));
    const E4 = edgeMet(TAB2); E4.db.tabellen.calculaties[0].offerte_config.geldigTot = '2020-01-01';
    const r4 = await E4.roep('GET', null, '?token=tok1&intern=1');
    check('verlopen link: geen opties, geen document', r4.body.verlopen === true && r4.body.opties === null && r4.body.snapshot === null);
    const E5 = edgeMet(TAB2, { status: 'afgekeurd' });
    check('afgewezen link: geen opties', (await E5.roep('GET', null, '?token=tok1&intern=1')).body.opties === null);
    const E6 = edgeMet(TAB2, { status: 'vervangen' });
    check('vervangen link: geen opties', (await E6.roep('GET', null, '?token=tok1&intern=1')).body.opties === null);
    const E7 = edgeMet(TAB2, { onderhoudsplan_id: 'plan1' }); E7.db.tabellen.onderhoudsplannen.push({ id: 'plan1', naam: 'Plan', status: 'verzonden', betaalmodel: 'beide', offerte_config: { geldigTot: '2999-01-01' } });
    const r7 = await E7.roep('GET', null, '?token=tok1&intern=1');
    check('planlink: nooit opties, ook niet als er een tabel met merkteken zou staan', r7.body.soort === 'plan' && r7.body.opties === null && r7.body.keuze_nodig === true);
    const E8 = edgeMet(TAB2, { calculatie_id: null, oplevering_id: 'opl1', snapshot: { geldigTot: '2999-01-01', offertenummer: 'H-1' } }); E8.db.tabellen.opleveringen.push({ id: 'opl1', projectnaam: 'Rot', klant: 'K', status: 'verstuurd' });
    const r8 = await E8.roep('GET', null, '?token=tok1&intern=1');
    check('houtrot-opgave: nooit opties', r8.body.soort === 'houtrot' && r8.body.opties === null);
    const kapot = K(TAB2); kapot.combi = 'stuk';
    check('onleesbare tabel: link opent gewoon zonder keuze', (await edgeMet(kapot).roep('GET', null, '?token=tok1&intern=1')).body.opties === null);
  }

  console.log('4. Edge Function: akkoord (POST)');
  const V43_UPDATE = ['status', 'klant_naam', 'notitie', 'gereageerd_op', 'ip', 'user_agent', 'betaalkeuze'];
  {
    // a. akkoord met twee opties, in omgekeerde volgorde en met een verzonnen bedrag erbij
    const E = edgeMet(TAB2);
    const doel = TAB2.combi.find(x => x.ids.length === 2);
    const r = await E.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', notitie: '', opties: ['oB', 'oA'], bedrag: 1, optiekeuze: { incl: 1 } });
    const rij = linkRij(E);
    check('akkoord vastgelegd', r.status === 200 && r.body.ok === true && rij.status === 'akkoord');
    check('bedrag op de link = bedrag uit de tabel (keuze 1a), niet het bedrag uit de browser', cent(rij.bedrag, doel.incl) && cent(rij.optiekeuze.incl, doel.incl) && cent(rij.optiekeuze.excl, doel.excl), J([rij.bedrag, doel]));
    check('keuze vastgelegd met ids, nummers, titels, basis en tijdstip', J(rij.optiekeuze.ids) === J(['oA', 'oB']) && J(rij.optiekeuze.nrs) === J([1, 2]) && rij.optiekeuze.titels.length === 2 && cent(rij.optiekeuze.basisIncl, TAB2.basis.incl) && /^\d{4}-/.test(rij.optiekeuze.op));
    check('antwoord aan de pagina bevat keuze en bedrag', r.body.optiekeuze && cent(r.body.bedrag, doel.incl));
    check('calculatie op geaccepteerd', E.db.tabellen.calculaties[0].status === 'geaccepteerd');
    check('optie_verwerkt_op blijft leeg (dat doet de app)', rij.optie_verwerkt_op === null);
    const mailB = E.mails.find(m => m.to[0] === 'klant@test.nl'), mailC = E.mails.find(m => m.to[0] === 'info@ernes.nl');
    check('twee mails: B naar de klant en C naar info@', E.mails.length === 2 && !!mailB && !!mailC);
    check('mail B noemt beide opties en het totaal incl. btw groot', mailB.html.indexOf('Optie 1: Wanden woonkamer na stucwerk') > 0 && mailB.html.indexOf('Optie 2: Plafond slaapkamer') > 0 && mailB.html.indexOf('<strong>' + eurNL(doel.incl) + ' incl. btw</strong>') > 0 && mailB.html.indexOf(eurNL(doel.excl) + ' excl. btw') > 0, mailB.html.slice(200, 900));
    check('mail C heeft Keuze klant en Totaal samenstelling', mailC.html.indexOf('Keuze klant') > 0 && mailC.html.indexOf('Totaal samenstelling') > 0 && mailC.html.indexOf(eurNL(doel.incl)) > 0);
    const g = await E.roep('GET', null, '?token=tok1&intern=1');
    check('na akkoord: GET geeft de keuze terug en geen vinkjes meer', g.body.opties === null && g.body.optiekeuze && J(g.body.optiekeuze.ids) === J(['oA', 'oB']) && cent(g.body.bedrag, doel.incl));
    const r2 = await E.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: [] });
    check('tweede akkoord op dezelfde link geweigerd (409), keuze ongewijzigd', r2.status === 409 && J(linkRij(E).optiekeuze.ids) === J(['oA', 'oB']) && E.mails.length === 2);

    // b. niets aangevinkt
    const Eb = edgeMet(TAB2);
    const rb = await Eb.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test' });
    check('geen veld opties: akkoord op de basis, bedrag blijft de basis', rb.status === 200 && linkRij(Eb).optiekeuze.ids.length === 0 && cent(linkRij(Eb).bedrag, TAB2.basis.incl));
    check('mail B bij de basis: "zonder opties"', Eb.mails.find(m => m.to[0] === 'klant@test.nl').html.indexOf('basisuitvoering, zonder opties') > 0);

    // c. geweigerd: niets vastgelegd, geen mail, link blijft open
    for (const [naam, opties] of [['onbekende id', ['oA', 'oX']], ['id van een andere link', ['oC']], ['dubbele id', ['oB', 'oB']], ['tekst in plaats van lijst', 'oA'], ['te veel ids', ['oA', 'oB', 'oC']]]) {
      const Ec = edgeMet(TAB2);
      const rc = await Ec.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: opties, bedrag: 5 });
      check(naam + ': geweigerd (400), link open, niets geschreven, geen mail', rc.status === 400 && linkRij(Ec).status === 'open' && linkRij(Ec).optiekeuze === null && Ec.db.log.filter(x => x.op === 'update').length === 0 && Ec.mails.length === 0 && Ec.db.tabellen.calculaties[0].status === 'verzonden', J(rc));
    }
    const gat = K(TAB2); gat.combi = gat.combi.filter(x => x.ids.length !== 2);
    const Ed = edgeMet(gat);
    const rd = await Ed.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: ['oA', 'oB'] });
    check('samenstelling niet in de tabel: geweigerd, niets geschreven', rd.status === 400 && linkRij(Ed).status === 'open' && Ed.mails.length === 0);

    // d. zakelijk: excl. btw groot
    const tz = Object.assign(K(TAB2), { klanttype: 'zakelijk' });
    const Ez = edgeMet(tz);
    await Ez.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'BV Test', opties: ['oA'] });
    const dz = TAB2.combi.find(x => x.ids.length === 1 && x.ids[0] === 'oA');
    check('zakelijk: mail B zet het bedrag excl. btw groot', Ez.mails.find(m => m.to[0] === 'klant@test.nl').html.indexOf('<strong>' + eurNL(dz.excl) + ' excl. btw</strong>') > 0);

    // e. links zonder online keuze: exact de schrijfopdracht van versie 43
    const zonder = K(TAB2); delete zonder.online;
    const Ee = edgeMet(zonder);
    const re = await Ee.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: ['oA'], bedrag: 99 });
    const upd = Ee.db.log.find(x => x.tabel === 'offerte_accorderingen' && x.op === 'update');
    check('link zonder merkteken: schrijfopdracht heeft precies de velden van versie 43', J(Object.keys(upd.payload)) === J(V43_UPDATE), J(Object.keys(upd.payload)));
    check('link zonder merkteken: bedrag en optiekeuze onaangeroerd, antwoord als versie 43', cent(linkRij(Ee).bedrag, TAB2.basis.incl) && linkRij(Ee).optiekeuze === null && J(re.body) === J({ ok: true, status: 'akkoord' }));
    const mb = Ee.mails.find(m => m.to[0] === 'klant@test.nl'), mc = Ee.mails.find(m => m.to[0] === 'info@ernes.nl');
    check('link zonder merkteken: mails zonder keuzeblok', mb.html.indexOf('U heeft gekozen') < 0 && mb.html.indexOf('Totaal van uw samenstelling') < 0 && mc.html.indexOf('Keuze klant') < 0 && mc.html.indexOf('Totaal samenstelling') < 0);
    check('mail B zonder keuze: de twee alinea\'s sluiten aan zoals in versie 43', mb.html.indexOf('Hierbij bevestigen wij de opdracht.</p>\n  <p style="margin:24px 0 8px 0;">Uw getekende exemplaar') > 0);

    // f. planlink en houtrot: een meegestuurd veld opties wordt genegeerd
    const Ef = edgeMet(TAB2, { onderhoudsplan_id: 'plan1' }); Ef.db.tabellen.onderhoudsplannen.push({ id: 'plan1', naam: 'Plan', status: 'verzonden', betaalmodel: 'beide', offerte_config: { geldigTot: '2999-01-01' } });
    const rf0 = await Ef.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan', opties: ['oA'] });
    check('planlink: betaalkeuze nog steeds verplicht', rf0.status === 400 && /betalen/.test(rf0.body.error));
    const rf = await Ef.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan', opties: ['oA'], betaalkeuze: 'abo' });
    const updF = Ef.db.log.find(x => x.tabel === 'offerte_accorderingen' && x.op === 'update');
    check('planlink: akkoord als voorheen, geen optiekeuze, calculatie niet aangeraakt', rf.status === 200 && J(Object.keys(updF.payload)) === J(V43_UPDATE) && linkRij(Ef).optiekeuze === null && linkRij(Ef).betaalkeuze === 'abo' && Ef.db.tabellen.onderhoudsplannen[0].status === 'geaccepteerd' && Ef.db.tabellen.onderhoudsplannen[0].betaalmodel === 'abo' && Ef.db.tabellen.calculaties[0].status === 'verzonden' && J(rf.body) === J({ ok: true, status: 'akkoord' }));
    const Eh = edgeMet(TAB2, { calculatie_id: null, oplevering_id: 'opl1', snapshot: { geldigTot: '2999-01-01', offertenummer: 'H-1', klantEmail: 'k@t.nl' } }); Eh.db.tabellen.opleveringen.push({ id: 'opl1', projectnaam: 'Rot', klant: 'K', status: 'verstuurd' });
    const rh = await Eh.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan', opties: ['oA'] });
    check('houtrot-opgave: akkoord als voorheen, geen optiekeuze', rh.status === 200 && linkRij(Eh).optiekeuze === null && Eh.db.tabellen.opleveringen[0].status === 'akkoord' && Eh.mails[0].subject.indexOf('houtrotherstel') > 0);

    // g. afwijzen en vraag op een link met opties: als voorheen
    const Eg = edgeMet(TAB2);
    const rg1 = await Eg.roep('POST', { token: 'tok1', actie: 'vraag', naam: '', notitie: 'Kan het later?', opties: ['oA'] });
    check('vraag: link blijft open, geen keuze', rg1.status === 200 && rg1.body.status === 'open' && linkRij(Eg).status === 'open' && linkRij(Eg).optiekeuze === null && linkRij(Eg).vragen.length === 1);
    const rg2 = await Eg.roep('POST', { token: 'tok1', actie: 'afkeuren', naam: 'Jan', notitie: 'Te duur', opties: ['oA'] });
    check('afwijzen: geen keuze, bedrag blijft, calculatie verloren', rg2.status === 200 && linkRij(Eg).status === 'afgekeurd' && linkRij(Eg).optiekeuze === null && cent(linkRij(Eg).bedrag, TAB2.basis.incl) && Eg.db.tabellen.calculaties[0].status === 'verloren');
    // h. verlopen
    const Ev = edgeMet(TAB2); Ev.db.tabellen.calculaties[0].offerte_config.geldigTot = '2020-01-01';
    const rv = await Ev.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan', opties: ['oA'] });
    check('verlopen link weigert een akkoord met keuze (410), niets vastgelegd', rv.status === 410 && linkRij(Ev).status === 'open' && linkRij(Ev).optiekeuze === null);
    const Ew = edgeMet(TAB2, { status: 'vervangen' });
    check('vervangen link weigert een akkoord met keuze (409)', (await Ew.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan', opties: ['oA'] })).status === 409 && linkRij(Ew).optiekeuze === null);

    // i. twee gelijktijdige klikken met twee verschillende samenstellingen (keuze 3a)
    const Ei = edgeMet(TAB2);
    const [a, b] = await Promise.all([
      Ei.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan', opties: ['oA'] }),
      Ei.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan', opties: ['oB'] })
    ]);
    const st = [a.status, b.status].sort();
    check('twee gelijktijdige akkoorden: één slaagt, één krijgt 409', J(st) === J([200, 409]), J(st));
    const winnaar = a.status === 200 ? 'oA' : 'oB';
    check('de vastgelegde keuze is die van de winnaar, en er is één stel mails', J(linkRij(Ei).optiekeuze.ids) === J([winnaar]) && Ei.mails.length === 2, J([linkRij(Ei).optiekeuze.ids, Ei.mails.length]));
    // dezelfde bescherming bij een planlink zonder keuze en bij afwijzen
    const Ej = edgeMet(null);
    const [c1, c2] = await Promise.all([Ej.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan' }), Ej.roep('POST', { token: 'tok1', actie: 'afkeuren', naam: 'Jan', notitie: 'nee' })]);
    check('akkoord en afwijzing tegelijk op een gewone link: één slaagt', J([c1.status, c2.status].sort()) === J([200, 409]) && Ej.mails.filter(m => m.to[0] === 'info@ernes.nl').length === 1);
  }

  console.log('5. De keten op de cent: tabel van de link, bedrag van de server, calculatie na verwerken');
  async function keten(variant, ids, klanttype) {
    const N = await vers(padNieuw, variant, klanttype);
    const tab = tabelVan(N);
    const E = edgeMet(tab);
    const post = await E.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: ids.slice().reverse(), bedrag: 0.01 });
    const rij = linkRij(E);
    zetAkkoordInApp(N, rij);
    const s0 = schrijfLog(N).length;
    const res = K(await N.run("_optOnlineVerwerk(data.calc)"));
    const geschreven = schrijfLog(N).slice(s0);
    await N.run("__syncAlles()");
    const na = K(N.run("__totaal()"));
    // referentie: het echte v4.130.0, dezelfde samenstelling met de knop Leg deze keuze vast
    const O = await vers(padOud, variant, klanttype);
    O.ctx.__ids = J(ids);
    O.run("_optKiesConcept = { calcId: data.calc.id, ids: new Set(JSON.parse(__ids)) }");
    await O.run("optLegVast(false)"); await wacht(O); await O.run("__syncAlles()");
    const ref = K(O.run("__totaal()"));
    const inTab = tab.combi.find(x => J(x.ids.slice().sort()) === J(ids.slice().sort()));
    return { N, E, post, rij, res, na, ref, inTab, tab, geschreven };
  }
  {
    const gevallen = [['regels', []], ['regels', ['oA']], ['regels', ['oB']], ['regels', ['oA', 'oB']],
      ['delen', ['oC']], ['delen', ['oE']], ['delen', ['oA', 'oC', 'oE']], ['delen', ['oC', 'oD', 'oG', 'oH']], ['delen', ['oB', 'oF']], ['delen', ORDE.slice()], ['delen', ['oA', 'oB', 'oD', 'oE', 'oF', 'oG', 'oH']]];
    for (const [variant, ids] of gevallen) {
      const k = await keten(variant, ids, variant === 'delen' && ids.length === 3 ? 'vve' : null);
      const naam = variant + ' [' + ids.join(',') + ']';
      check(naam + ': server legt het bedrag uit de tabel vast', k.post.status === 200 && cent(k.rij.bedrag, k.inTab.incl) && cent(k.rij.optiekeuze.excl, k.inTab.excl), J([k.post.status, k.rij.bedrag, k.inTab]));
      check(naam + ': verwerkt, op de cent gelijk aan het akkoord', k.res.status === 'verwerkt' && cent(k.na.incl, k.rij.bedrag) && cent(k.na.excl, k.rij.optiekeuze.excl), J([k.res.status, k.na, k.rij.bedrag, k.rij.optiekeuze.excl]));
      check(naam + ': excl, btw en incl gelijk aan v4.130.0 met de hand vastgelegd', cent(k.na.excl, k.ref.excl) && cent(k.na.btw, k.ref.btw) && cent(k.na.incl, k.ref.incl) && k.na.dagen === k.ref.dagen, J([k.na, k.ref]));
      check(naam + ': btw = incl min excl uit de tabel', cent(k.na.btw, Math.round((k.inTab.incl - k.inTab.excl) * 100) / 100), J([k.na.btw, k.inTab]));
      const keuze = K(k.N.run("data.calc.offerteConfig.optiesKeuze")), dbKeuze = K(k.N.run("__db.tabellen.calculaties[0].offerte_config.optiesKeuze"));
      check(naam + ': optiesKeuze gevuld met de klant als bron, ook in de database', keuze && keuze.bron === 'klant' && keuze.accordId === 'L1' && J(keuze.gekozen.slice().sort()) === J(ids.slice().sort()) && cent(keuze.totaalIncl, k.rij.bedrag) && /online akkoord/.test(keuze.door) && dbKeuze && dbKeuze.bron === 'klant', J(keuze));
      check(naam + ': stempel optie_verwerkt_op gezet', !!K(k.N.run("__db.tabellen.offerte_accorderingen[0].optie_verwerkt_op")));
      if (ids.indexOf('oC') >= 0) {
        const st = K(k.N.run("__db.tabellen.staart.filter(p => p.optie_id).map(p => [p.optie_id, p.naam, p.btw_pct == null ? null : Number(p.btw_pct)])"));
        check(naam + ': de steiger (21% btw) en de hoogwerker staan als echte staartpost bij optie oC', st.filter(x => x[0] === 'oC').length === 2 && st.some(x => x[1] === 'Steiger achtergevel'), J(st));
      }
      if (!ids.length) check(naam + ': basis gekozen, geen enkel vinkje of staartpost geschreven', k.geschreven.filter(x => /^(calc_regels|hoofdgroepen|onderdelen):update|^staart:(insert|delete)/.test(x)).length === 0 && k.geschreven.indexOf('offerte_accorderingen:update') >= 0, J(k.geschreven));
      else check(naam + ': vinkjes zijn naar de database geschreven', k.geschreven.some(x => /^(calc_regels|hoofdgroepen|onderdelen):update/.test(x)), J(k.geschreven));
    }
  }

  console.log('6. Verwerken gebeurt één keer');
  {
    const k = await keten('regels', ['oA', 'oB']);
    const logVoor = schrijfLog(k.N).length, totVoor = J(K(k.N.run("__totaal()")));
    const r2 = K(await k.N.run("_optOnlineVerwerk(data.calc)"));
    check('tweede keer openen: niets te doen, niets geschreven, totaal gelijk', r2.status === 'geen' && schrijfLog(k.N).length === logVoor && J(K(k.N.run("__totaal()"))) === totVoor, J(r2));
    // twee gebruikers openen tegelijk: zelfde link-rij, elk een eigen calculatie in het geheugen
    const A = await vers(padNieuw, 'regels'), B = await vers(padNieuw, 'regels');
    const E = edgeMet(tabelVan(A));
    await E.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan', opties: ['oB'] });
    zetAkkoordInApp(A, linkRij(E));
    B.ctx.__gedeeld = A.run("__db.tabellen.offerte_accorderingen");
    B.run("__db.tabellen.offerte_accorderingen = __gedeeld");
    const sA = schrijfLog(A).length, sB = schrijfLog(B).length;
    const [ra, rb] = await Promise.all([A.run("_optOnlineVerwerk(data.calc)"), B.run("_optOnlineVerwerk(data.calc)")]);
    const sts = [K(ra).status, K(rb).status].sort();
    check('twee gebruikers tegelijk: één verwerkt, de ander doet niets', J(sts) === J(['elders', 'verwerkt']), J(sts));
    const verliezer = K(ra).status === 'elders' ? A : B;
    const vLog = schrijfLog(verliezer).slice(verliezer === A ? sA : sB);
    check('de verliezer heeft niets aan de calculatie geschreven', vLog.filter(x => !/^offerte_accorderingen:update$/.test(x)).length === 0, J(vLog));
    check('de verliezer krijgt geen "verwerkt"-melding en zijn calculatie staat nog op de basis', verliezer.meldingen.alert.length === 0 && verliezer.run("__vind('r13').actief") === false && !verliezer.run("data.calc.offerteConfig.optiesKeuze"));
    // de rem in renderCalcStructuur: buiten het tabblad Calculatie geen vraag aan de database
    const R = await vers(padNieuw, 'regels');
    const n0 = R.run("__db.log.length");
    R.run("_optOnlineTrigger(false)"); await wacht(R);
    check('rem: tabblad Calculatie niet in beeld, geen vraag aan de database', R.run("__db.log.length") === n0);
    R.run("_optOnlineTrigger(true)"); await wacht(R);
    check('bij het openen: precies één leesvraag, geen schrijfopdracht', R.run("__db.log.length") === n0 + 1 && R.run("__db.log[__db.log.length - 1].op") === 'select' && R.run("__db.log[__db.log.length - 1].tabel") === 'offerte_accorderingen');
  }

  console.log('7. Een calculatie zonder online keuze wordt niet aangeraakt');
  {
    const Kaal = await vers(padNieuw, false);
    const n0 = Kaal.run("__db.log.length"), t0 = J(K(Kaal.run("__totaal()")));
    const r = K(await Kaal.run("_optOnlineVerwerk(data.calc)"));
    Kaal.run("_optOnlineTrigger(true)"); await wacht(Kaal);
    check('calculatie zonder opties: geen enkele vraag aan de database', r.status === 'geen' && Kaal.run("__db.log.length") === n0 && J(K(Kaal.run("__totaal()"))) === t0);
    const N = await vers(padNieuw, 'regels');
    const s0 = schrijfLog(N).length;
    check('opties maar geen akkoord: niets te doen', K(await N.run("_optOnlineVerwerk(data.calc)")).status === 'geen' && schrijfLog(N).length === s0);
    const ok = { v: 1, ids: ['oA'], nrs: [1], titels: ['Optie 1: x'], excl: 1, incl: 2 };
    for (const [naam, rij] of [
      ['akkoord zonder keuze (link van voor v4.131.0)', { id: 'L1', calculatie_id: 'calc1', onderhoudsplan_id: null, status: 'akkoord', optiekeuze: null, optie_verwerkt_op: null }],
      ['open link met een tabel', { id: 'L1', calculatie_id: 'calc1', onderhoudsplan_id: null, status: 'open', optiekeuze: null, optie_verwerkt_op: null }],
      ['afgewezen link', { id: 'L1', calculatie_id: 'calc1', onderhoudsplan_id: null, status: 'afgekeurd', optiekeuze: ok, optie_verwerkt_op: null }],
      ['planakkoord', { id: 'L1', calculatie_id: 'calc1', onderhoudsplan_id: 'plan1', status: 'akkoord', optiekeuze: ok, optie_verwerkt_op: null }],
      ['akkoord van een andere calculatie', { id: 'L1', calculatie_id: 'calc2', onderhoudsplan_id: null, status: 'akkoord', optiekeuze: ok, optie_verwerkt_op: null }],
      ['keuze die al verwerkt is', { id: 'L1', calculatie_id: 'calc1', onderhoudsplan_id: null, status: 'akkoord', optiekeuze: ok, optie_verwerkt_op: '2026-11-25T10:00:00Z' }]
    ]) {
      N.ctx.__rij = J(rij); N.run("__db.tabellen.offerte_accorderingen = [JSON.parse(__rij)]");
      const s1 = schrijfLog(N).length, a1 = N.meldingen.alert.length, c1 = N.meldingen.confirm.length;
      const r1 = K(await N.run("_optOnlineVerwerk(data.calc)"));
      check(naam + ': niets gedaan, niets gevraagd', r1.status === 'geen' && schrijfLog(N).length === s1 && N.meldingen.alert.length === a1 && N.meldingen.confirm.length === c1, J(r1));
    }
  }

  console.log('8. Afwijking: de calculatie is gewijzigd nadat de link gemaakt is');
  {
    const N = await vers(padNieuw, 'regels');
    const E = edgeMet(tabelVan(N));
    await E.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: ['oA'] });
    const akkoordIncl = linkRij(E).bedrag;
    N.run("__vind('r9').hoeveelheid = 40; _syncMeetstaatHoeveelheden && 0;");   // plafond woonkamer 28 -> 40 m²
    await N.run("__syncAlles()");
    zetAkkoordInApp(N, linkRij(E));
    const voor = J(K(N.run("__totaal()"))), s0 = schrijfLog(N).length;
    N.ctx.__confirmAntwoord = false;
    const r1 = K(await N.run("_optOnlineVerwerk(data.calc)"));
    check('bedrag wijkt af: oordeel afwijking, er wordt een beslissing gevraagd', r1.status === 'later' && r1.oordeel.soort === 'afwijking' && N.meldingen.confirm.length === 1 && /klopt niet met de calculatie/.test(N.meldingen.confirm[0]) && N.meldingen.confirm[0].indexOf('Optie 1: Wanden woonkamer na stucwerk') > 0, J(r1));
    check('Annuleren: niets verwerkt, niets geschreven, stempel leeg, totaal ongewijzigd', schrijfLog(N).length === s0 && N.run("__db.tabellen.offerte_accorderingen[0].optie_verwerkt_op") == null && J(K(N.run("__totaal()"))) === voor && !N.run("data.calc.offerteConfig.optiesKeuze"));
    const r2 = K(await N.run("_optOnlineVerwerk(data.calc)"));
    check('zelfde sessie: de vraag komt niet opnieuw', r2.status === 'later' && N.meldingen.confirm.length === 1);
    N.run("_optOnlineLater = {}"); N.ctx.__confirmAntwoord = true;   // app opnieuw geladen, nu OK
    const r3 = K(await N.run("_optOnlineVerwerk(data.calc)"));
    await N.run("__syncAlles()");
    const na = K(N.run("__totaal()"));
    check('OK: toch verwerkt, gemeld als afwijking, stempel gezet', r3.status === 'verwerkt-afwijking' && !!N.run("__db.tabellen.offerte_accorderingen[0].optie_verwerkt_op") && N.run("__vind('r8b').actief") === true && N.run("__vind('r8').actief") === false && !cent(na.incl, akkoordIncl), J([r3.status, na.incl, akkoordIncl]));
    check('de melding noemt beide bedragen', N.meldingen.alert.some(a => a.indexOf('Bespreek het verschil met de klant') > 0 && a.indexOf('Het akkoord van de klant is gegeven op') > 0), J(N.meldingen.alert.slice(-1)));
    check('optiesKeuze onthoudt het bedrag van het akkoord', cent(K(N.run("data.calc.offerteConfig.optiesKeuze")).akkoordIncl, akkoordIncl));
  }

  console.log('9. Niet te verwerken, en mislukken onderweg');
  {
    // a. een gekozen optie is uit de calculatie verdwenen
    const N = await vers(padNieuw, 'regels');
    const E = edgeMet(tabelVan(N));
    await E.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: ['oA', 'oB'] });
    N.run("data.calc.offerteConfig.opties = data.calc.offerteConfig.opties.filter(o => o.id !== 'oB'); __vind('r13').optieId = null;");
    zetAkkoordInApp(N, linkRij(E));
    const voor = J(K(N.run("__totaal()"))), s0 = schrijfLog(N).length;
    N.ctx.__confirmAntwoord = false;
    const r1 = K(await N.run("_optOnlineVerwerk(data.calc)"));
    check('optie weg: oordeel onmogelijk, melding, niets gewijzigd', r1.status === 'later' && r1.oordeel.soort === 'onmogelijk' && /kan die keuze niet verwerken/.test(N.meldingen.confirm[0]) && schrijfLog(N).length === s0 && J(K(N.run("__totaal()"))) === voor, J(r1));
    N.run("_optOnlineLater = {}"); N.ctx.__confirmAntwoord = true;
    const r2 = K(await N.run("_optOnlineVerwerk(data.calc)"));
    check('OK = met de hand regelen: alleen het stempel, de calculatie blijft zoals zij stond', r2.status === 'gemarkeerd' && !!N.run("__db.tabellen.offerte_accorderingen[0].optie_verwerkt_op") && J(K(N.run("__totaal()"))) === voor && J(schrijfLog(N).slice(s0)) === J(['offerte_accorderingen:update']), J(schrijfLog(N).slice(s0)));
    // b. er is met de hand al een andere keuze vastgelegd
    const M = await vers(padNieuw, 'regels');
    const E2 = edgeMet(tabelVan(M));
    await E2.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: ['oA'] });
    M.run("_optKiesConcept = { calcId: data.calc.id, ids: new Set(['oB']) }"); await M.run("optLegVast(false)"); await wacht(M);
    zetAkkoordInApp(M, linkRij(E2));
    M.ctx.__confirmAntwoord = false; const c0 = M.meldingen.confirm.length;
    const rb = K(await M.run("_optOnlineVerwerk(data.calc)"));
    check('andere keuze al met de hand vastgelegd: niet stil overschrijven maar vragen', rb.status === 'later' && rb.oordeel.soort === 'afwijking' && M.meldingen.confirm.length === c0 + 1 && /al een andere keuze vastgelegd/.test(M.meldingen.confirm[c0]) && M.run("__vind('r13').actief") === true, J(rb));
    // c. dezelfde keuze stond al met de hand vastgelegd: alleen aftekenen
    const H = await vers(padNieuw, 'regels');
    const E3 = edgeMet(tabelVan(H));
    await E3.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: ['oB'] });
    H.run("_optKiesConcept = { calcId: data.calc.id, ids: new Set(['oB']) }"); await H.run("optLegVast(false)"); await wacht(H);
    zetAkkoordInApp(H, linkRij(E3));
    const sH = schrijfLog(H).length, tH = J(K(H.run("__totaal()")));
    const rc = K(await H.run("_optOnlineVerwerk(data.calc)"));
    check('zelfde keuze stond er al: alleen het stempel, verder niets', rc.status === 'gemarkeerd' && J(schrijfLog(H).slice(sH)) === J(['offerte_accorderingen:update']) && J(K(H.run("__totaal()"))) === tH, J([rc.status, schrijfLog(H).slice(sH)]));
    // d. de database weigert onderweg: stempel komt weer vrij
    const F = await vers(padNieuw, 'regels');
    const E4 = edgeMet(tabelVan(F));
    await E4.roep('POST', { token: 'tok1', actie: 'akkoord', naam: 'Jan Test', opties: ['oA'] });
    zetAkkoordInApp(F, linkRij(E4));
    const tF = J(K(F.run("__totaal()")));
    F.run("__db.fout.calc_regels = 'verbinding weg'");
    const rd = K(await F.run("_optOnlineVerwerk(data.calc)"));
    check('opslaan mislukt: status mislukt, stempel weer vrij, totaal ongewijzigd, geen optiesKeuze', rd.status === 'mislukt' && F.run("__db.tabellen.offerte_accorderingen[0].optie_verwerkt_op") == null && J(K(F.run("__totaal()"))) === tF && !F.run("data.calc.offerteConfig.optiesKeuze"), J(rd));
    F.run("delete __db.fout.calc_regels");
    const re = K(await F.run("_optOnlineVerwerk(data.calc)"));
    check('daarna lukt het alsnog', re.status === 'verwerkt', J(re));
    // e. het oordeel los
    const P = await vers(padNieuw, 'regels');
    const tabP = tabelVan(P);
    const oordeel = (k) => { P.ctx.__k = J(k); return K(P.run("(k => { const o = _optOnlineOordeel(_optBereken(data.calc, { kies: (k && k.ids) || [] }), k); return { soort: o.soort, redenen: o.redenen, masker: o.masker }; })(JSON.parse(__k))")); };
    const x = tabP.combi.find(c => c.ids.length === 2);
    check('oordeel gelijk bij exact bedrag', oordeel({ ids: ['oA', 'oB'], incl: x.incl, excl: x.excl }).soort === 'gelijk');
    check('oordeel afwijking bij één cent verschil incl.', oordeel({ ids: ['oA', 'oB'], incl: x.incl + 0.01, excl: x.excl }).soort === 'afwijking');
    check('oordeel afwijking bij één cent verschil excl.', oordeel({ ids: ['oA', 'oB'], incl: x.incl, excl: x.excl - 0.01 }).soort === 'afwijking');
    check('oordeel afwijking bij onleesbaar bedrag', oordeel({ ids: ['oA'], incl: 'veel', excl: 1 }).soort === 'afwijking');
    check('oordeel onmogelijk bij onbekende optie', oordeel({ ids: ['oZ'], incl: 1, excl: 1 }).soort === 'onmogelijk');
    check('oordeel onmogelijk bij onleesbare keuze', oordeel({ ids: 'oA', incl: 1, excl: 1 }).soort === 'onmogelijk');
  }

  console.log('10. De klantpagina (jsdom), met het echte antwoord van de Edge Function' + (LATER ? ' (overgeslagen)' : ''));
  if (!LATER) {
    const { JSDOM } = require('jsdom');
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
    const wO = pagina(ontOud), wN = pagina(ontNieuw);
    // a. links zonder opties: de pagina is letterlijk gelijk aan v4.130.0
    const basisRes = { status: 'open', bedrag: 4741.16, snapshot: { html: '<p>doc</p>' }, gereageerd_op: null, klant_naam: null, project: 'Testhuis', klant: 'Fam. Test', geldig_tot: '2999-01-01', verlopen: false, afwijzen_mogelijk: true, document_beschikbaar: true, soort: 'offerte', betaalmodel: null, keuze_nodig: false, betaalkeuze: null };
    const varianten = {
      'open offerte': basisRes,
      'open offerte met velden van de nieuwe functie (leeg)': Object.assign({}, basisRes, { opties: null, optiekeuze: null }),
      'geaccordeerde offerte': Object.assign({}, basisRes, { status: 'akkoord', klant_naam: 'Jan', gereageerd_op: '2026-11-20T10:00:00Z', optiekeuze: null }),
      'afgewezen offerte': Object.assign({}, basisRes, { status: 'afgekeurd', klant_naam: 'Jan', gereageerd_op: '2026-11-20T10:00:00Z', snapshot: null }),
      'verlopen offerte': Object.assign({}, basisRes, { verlopen: true, snapshot: null, geldig_tot: '2020-01-01' }),
      'vervangen offerte': Object.assign({}, basisRes, { status: 'vervangen', snapshot: null }),
      'plan met betaalkeuze': Object.assign({}, basisRes, { soort: 'plan', bedrag: null, betaalmodel: 'beide', keuze_nodig: true }),
      'houtrot-opgave': Object.assign({}, basisRes, { soort: 'houtrot' }),
      'offerte met pdf': Object.assign({}, basisRes, { snapshot: { pdf: 'https://signed.test/x.pdf' } })
    };
    for (const naam of Object.keys(varianten)) {
      const a = render(wO, varianten[naam]), b = render(wN, varianten[naam]);
      check('zonder opties gelijk aan v4.130.0: ' + naam, a === b && a.length > 100, a.length + ' / ' + b.length);
      if (varianten[naam].status === 'open' && !varianten[naam].verlopen) {
        const klik = w => w.__ev("(function(){ window.__root.querySelector('.ac-btn-ok').click(); return window.__root.querySelector('#acForm').innerHTML; })()");
        check('akkoordformulier gelijk aan v4.130.0: ' + naam, klik(wO) === klik(wN));
      }
    }
    // b. een link met opties: het antwoord komt van de echte Edge Function
    async function metOpties(klanttype, tabel) {
      const tab = Object.assign(K(tabel || TAB2), klanttype ? { klanttype } : {});
      const E = edgeMet(tab);
      const get = await E.roep('GET', null, '?token=tok1&intern=1');
      const w = pagina(ontNieuw);
      w.fetch = async (url, opt) => { const body = JSON.parse(opt.body); w.__fetchLog.push(body); const r = await E.roep('POST', body); return { ok: r.status === 200, status: r.status, json: async () => r.body }; };
      const html = render(w, get.body);
      return { w, E, tab, html, get };
    }
    const q = (w, sel) => w.__ev("window.__root.querySelector(" + J(sel) + ")");
    const tekst = (w, sel) => { const e = q(w, sel); return e ? e.textContent : null; };
    const vink = (w, id, aan) => w.__ev("(function(){ const v = window.__root.querySelector('input[data-opt=\"" + id + "\"]'); v.checked = " + (aan ? 'true' : 'false') + "; v.dispatchEvent(new window.Event('change', { bubbles: true })); })()");
    {
      const { w, tab, html } = await metOpties(null);
      check('blok "Stel uw offerte samen" met twee vinkjes, geen aangevinkt', /Stel uw offerte samen/.test(html) && w.__ev("window.__root.querySelectorAll('input[data-opt]').length") === 2 && w.__ev("window.__root.querySelectorAll('input[data-opt]:checked').length") === 0);
      check('het blok staat tussen het document en de knoppen', html.indexOf('acOfferte') < html.indexOf('acOpties') && html.indexOf('acOpties') < html.indexOf('acActies'));
      check('dezelfde nummering en titels als op de offerte', /Optie 1: Wanden woonkamer na stucwerk/.test(html) && /Optie 2: Plafond slaapkamer/.test(html) && /Voorstrijken en twee keer sauzen\./.test(html));
      check('particulier: meerprijs incl. btw groot, excl. klein', tekst(w, '.ac-opt-prijs').indexOf('meerprijs ' + eurNL(tab.opties[0].meerIncl) + ' incl. btw') === 0 && tekst(w, '.ac-opt-prijs small') === eurNL(tab.opties[0].meerExcl) + ' excl. btw', tekst(w, '.ac-opt-prijs'));
      check('niets aangevinkt: totaal = basis, incl. btw groot', tekst(w, '.ac-opt-tot-groot') === eurNL(tab.basis.incl) + ' incl. btw' && tekst(w, '.ac-opt-tot-klein') === eurNL(tab.basis.excl) + ' excl. btw' && /basisuitvoering, zonder opties/.test(tekst(w, '.ac-opt-tot-lbl')));
      let alle = true;
      for (const x of tab.combi) {
        tab.opties.forEach(o => vink(w, o.id, x.ids.indexOf(o.id) >= 0));
        if (tekst(w, '.ac-opt-tot-groot') !== eurNL(x.incl) + ' incl. btw' || tekst(w, '.ac-opt-tot-klein') !== eurNL(x.excl) + ' excl. btw') alle = false;
      }
      check('elke samenstelling: het totaal op het scherm is het bedrag uit de tabel', alle);
      const som = tab.basis.incl + tab.opties[0].meerIncl + tab.opties[1].meerIncl, beide = tab.combi.find(x => x.ids.length === 2).incl;
      console.log('     basis + beide meerprijzen = ' + som.toFixed(2) + ', tabel = ' + beide.toFixed(2) + (cent(som, beide) ? ' (telt hier op)' : ' (telt NIET op: de pagina toont de tabel)'));
      // akkoordformulier
      tab.opties.forEach(o => vink(w, o.id, false)); vink(w, 'oB', true);
      w.__ev("window.__root.querySelector('.ac-btn-ok').click()");
      const eenB = tab.combi.find(x => x.ids.length === 1 && x.ids[0] === 'oB');
      check('akkoordzin noemt de samenstelling en het totaal', tekst(w, '#acAkkBedrag') === ', basisuitvoering met optie 2, bedrag ' + eurNL(eenB.incl) + ' incl. btw', tekst(w, '#acAkkBedrag'));
      check('de akkoordzin staat als één blok naast het vinkje (niet in kolommen)', w.__ev("(function(){ const l = window.__root.querySelector('#acAkkVink').parentNode; return l.children.length === 2 && l.children[1].tagName === 'SPAN' && /^ Ik ga akkoord met deze offerte van Ernes schilders, basisuitvoering met optie 2, bedrag .* incl\\. btw, inclusief de algemene voorwaarden\\.$/.test(l.children[1].textContent); })()") === true);
      w.__ev("window.__root.querySelector('#acAkkVink').checked = true");
      vink(w, 'oA', true);
      check('vinkje wijzigen: akkoordzin loopt mee en het akkoordvinkje gaat uit', tekst(w, '#acAkkBedrag') === ', basisuitvoering met optie 1 en 2, bedrag ' + eurNL(beide) + ' incl. btw' && w.__ev("window.__root.querySelector('#acAkkVink').checked") === false);
      w.__ev("window.__root.querySelector('#acNaam').value = 'Jan Test'; window.__root.querySelector('.ac-submit').click()");
      check('zonder akkoordvinkje wordt er niets verstuurd', w.__fetchLog.length === 0 && w.__alerts.length === 1);
      w.__ev("window.__root.querySelector('#acAkkVink').checked = true; window.__root.querySelector('.ac-submit').click()");
      await new Promise(r => setTimeout(r, 60));
      const body = w.__fetchLog[0];
      check('verstuurd: alleen ids, geen bedrag', body && J(Object.keys(body).sort()) === J(['actie', 'naam', 'notitie', 'opties', 'token']) && J(body.opties) === J(['oA', 'oB']), J(body));
      const na = w.__ev("window.__root.innerHTML");
      check('na akkoord: geen vinkjes meer, blok "Uw keuze" met wat de server vastlegde', w.__ev("window.__root.querySelectorAll('input[data-opt]').length") === 0 && /Uw keuze/.test(na) && /Optie 2: Plafond slaapkamer/.test(tekst(w, '#acOpties')) && tekst(w, '#acOpties .ac-opt-tot-groot') === eurNL(beide) + ' incl. btw');
      check('na akkoord: banner noemt samenstelling en totaal', /Uw akkoord is vastgelegd, basisuitvoering met optie 1 en 2, totaal /.test(tekst(w, '#acActies')) && tekst(w, '#acActies').indexOf(eurNL(beide) + ' incl. btw') > 0, tekst(w, '#acActies'));
    }
    {
      const { w, E, tab } = await metOpties('zakelijk');
      check('zakelijk: totaal excl. btw groot, incl. klein', tekst(w, '.ac-opt-tot-groot') === eurNL(tab.basis.excl) + ' excl. btw' && tekst(w, '.ac-opt-tot-klein') === eurNL(tab.basis.incl) + ' incl. btw');
      check('zakelijk: meerprijs excl. btw groot', tekst(w, '.ac-opt-prijs').indexOf('meerprijs ' + eurNL(tab.opties[0].meerExcl) + ' excl. btw') === 0);
      w.__ev("window.__root.querySelector('.ac-btn-ok').click()");
      check('zakelijk: akkoordzin met excl. voorop en incl. tussen haakjes', tekst(w, '#acAkkBedrag') === ', basisuitvoering, zonder opties, bedrag ' + eurNL(tab.basis.excl) + ' excl. btw (' + eurNL(tab.basis.incl) + ' incl. btw)', tekst(w, '#acAkkBedrag'));
      // niets aanvinken = akkoord op de basis
      w.__ev("window.__root.querySelector('#acNaam').value = 'BV Test'; window.__root.querySelector('#acAkkVink').checked = true; window.__root.querySelector('.ac-submit').click()");
      await new Promise(r => setTimeout(r, 60));
      check('niets aangevinkt: lege lijst verstuurd, server legt de basis vast', J(w.__fetchLog[0].opties) === J([]) && linkRij(E).status === 'akkoord' && linkRij(E).optiekeuze.ids.length === 0 && cent(linkRij(E).bedrag, tab.basis.incl));
      // de klant heropent de link na zijn akkoord
      const get2 = await E.roep('GET', null, '?token=tok1&intern=1');
      const h2 = render(w, get2.body);
      check('heropenen na akkoord: geen vinkjes, wel "Uw keuze" en de banner met het totaal', !/data-opt/.test(h2) && /Uw keuze/.test(h2) && /Basisuitvoering, zonder opties\./.test(h2) && /is geaccordeerd door BV Test/.test(h2) && h2.indexOf(eurNL(tab.basis.excl) + ' excl. btw') > 0);
    }
    {
      const { w } = await metOpties('vve');
      check('VvE: excl. btw groot', /excl\. btw$/.test(tekst(w, '.ac-opt-tot-groot')));
    }
    {
      const vuil = K(TAB2); vuil.opties[0].titel = '<img src=x onerror=alert(1)>'; vuil.opties[0].klanttekst = 'regel 1\n<script>x</script>';
      const { w, html } = await metOpties(null, vuil);
      check('titel en omschrijving worden als tekst getoond, niet als code', html.indexOf('<img src=x') < 0 && html.indexOf('<script>x') < 0 && w.__ev("window.__root.querySelectorAll('#acOpties img, #acOpties script').length") === 0 && /regel 1<br>/.test(html));
    }
    {
      const { w, E } = await metOpties(null);
      w.__ev("window.__root.querySelector('.ac-btn-nee').click(); window.__root.querySelector('#acNaam').value = 'Jan'; window.__root.querySelector('#acNotitie').value = 'te duur'; window.__root.querySelector('.ac-submit').click()");
      await new Promise(r => setTimeout(r, 60));
      check('afwijzen op een link met opties: geen veld opties verstuurd, blok verdwijnt', !('opties' in w.__fetchLog[0]) && linkRij(E).status === 'afgekeurd' && q(w, '#acOpties') === null);
    }
    {
      // de server weigert (samenstelling ontbreekt): de klant krijgt de melding en kan opnieuw
      const gat = K(TAB2);
      const { w, E } = await metOpties(null, gat);
      E.db.tabellen.offerte_accorderingen[0].cijfers.opties.combi = gat.combi.filter(x => x.ids.length !== 1 || x.ids[0] !== 'oA');
      vink(w, 'oA', true);
      w.__ev("window.__root.querySelector('.ac-btn-ok').click(); window.__root.querySelector('#acNaam').value = 'Jan'; window.__root.querySelector('#acAkkVink').checked = true; window.__root.querySelector('.ac-submit').click()");
      await new Promise(r => setTimeout(r, 60));
      check('server weigert: melding aan de klant, vinkjes blijven, link blijft open', w.__alerts.some(a => /niet beschikbaar/.test(a)) && w.__ev("window.__root.querySelectorAll('input[data-opt]').length") === 2 && linkRij(E).status === 'open');
    }
    {
      const E = edgeMet(TAB8);
      const get = await E.roep('GET', null, '?token=tok1&intern=1');
      const w = pagina(ontNieuw);
      const html = render(w, get.body);
      check('acht opties: acht vinkjes, genummerd 1 t/m 8', w.__ev("window.__root.querySelectorAll('input[data-opt]').length") === 8 && /Optie 8: /.test(html));
      ['oC', 'oE', 'oH'].forEach(id => vink(w, id, true));
      const x = TAB8.combi.find(c => J(c.ids.slice().sort()) === J(['oC', 'oE', 'oH']));
      check('acht opties: totaal van drie gekozen komt uit de tabel', tekst(w, '.ac-opt-tot-groot') === eurNL(x.incl) + ' incl. btw' && /optie 3, 5 en 8/.test(tekst(w, '.ac-opt-tot-lbl')), tekst(w, '.ac-opt-tot-lbl'));
    }
  }

  console.log('11. Het getekende exemplaar');
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
        const uit = await fn(await leeg.save(), info);
        const doc = await PDFLib.PDFDocument.load(uit);
        return { paginas: doc.getPageCount(), tekst: getekend };
      } finally { PDFLib.PDFPage.prototype.drawText = orig; }
    };
    const info = { naam: 'Jan Test', datumIso: '2026-11-25T10:00:00Z', project: 'Testhuis', klant: 'Fam. Test', bedrag: 5123.45, notitie: 'Graag in maart' };
    const a = await bouw(ontOud, info), b = await bouw(ontNieuw, info);
    check('zonder online keuze: bevestigingspagina gelijk aan v4.130.0', J(a.tekst) === J(b.tekst) && b.paginas === 2);
    const ok = { ids: ['oA', 'oC'], nrs: [1, 3], titels: ['Optie 1: Wanden woonkamer na stucwerk', 'Optie 3: ' + 'Een heel lange titel die niet op de regel past '.repeat(4)], excl: 4700.41, incl: 5123.45, klanttype: 'consument' };
    const c = await bouw(ontNieuw, Object.assign({}, info, { optiekeuze: ok }));
    check('met keuze: bedrag, "Basisuitvoering met:" en de gekozen opties', c.tekst.indexOf('\u20ac 5.123,45 incl. btw') >= 0 && c.tekst.indexOf('Basisuitvoering met:') >= 0 && c.tekst.indexOf('Optie 1: Wanden woonkamer na stucwerk') >= 0, J(c.tekst));
    check('een te lange titel wordt afgekapt in plaats van over de rand te lopen', c.tekst.some(t => /^Optie 3: /.test(t) && /\u2026$/.test(t) && t.length < 90));
    check('particulier: geen aparte regel excl. btw', c.tekst.indexOf('Bedrag excl. btw') < 0);
    const d = await bouw(ontNieuw, Object.assign({}, info, { optiekeuze: Object.assign({}, ok, { klanttype: 'zakelijk', titels: [], ids: [], nrs: [] }) }));
    check('zakelijk en basis: regel excl. btw en "Basisuitvoering, zonder opties"', d.tekst.indexOf('Bedrag excl. btw') >= 0 && d.tekst.indexOf('\u20ac 4.700,41') >= 0 && d.tekst.indexOf('Basisuitvoering, zonder opties') >= 0);
    const e = await bouw(ontNieuw, Object.assign({}, info, { isPlan: true, bedrag: null, betaalkeuze: 'abo', optiekeuze: ok }));
    check('planakkoord: een keuze wordt daar nooit getoond', e.tekst.indexOf('Basisuitvoering met:') < 0 && e.tekst.indexOf('per maand') >= 0);
  }

  console.log('12. Document, venster Accordeerlink en wat niet mocht veranderen');
  {
    const N = await vers(padNieuw, 'regels'), O = await vers(padOud, 'regels');
    check('nieuwe standaardzin onder de opties', N.run("_optSlotTekst(data.calc)") === 'Bij uw digitale akkoord kiest u zelf welke opties u wilt laten uitvoeren; u ziet daar direct het totaal van uw samenstelling.');
    N.run("data.calc.offerteConfig.optiesSlot = 'Eigen zin.'");
    check('een eigen zin blijft staan', N.run("_optSlotTekst(data.calc)") === 'Eigen zin.');
    const D = await vers(padNieuw, 'delen');
    const intro = D.run("(function(){ const cij = _optVoorDocument(data.calc, null); return cij && cij.opt ? cij.opt.intro : null; })()");
    check('bij drie of meer opties: "ziet u bij uw digitale akkoord" (keuze 2a)', /Het exacte totaal van uw samenstelling ziet u bij uw digitale akkoord\.$/.test(intro || ''), intro);
    const html = (L, rij) => { L.ctx.__r = J(rij); return L.run("(function(){ const r = JSON.parse(__r); return [_optOnlineLinkHtml(r), _optOnlineAkkoordHtml(r)]; })()"); };
    check('venster: link met merkteken meldt online kiezen', /Online kiezen: de klant kan op de pagina uit 2 opties kiezen/.test(html(N, { cijfers: { opties: TAB2 } })[0]));
    const zonder = K(TAB2); delete zonder.online;
    check('venster: link van voor v4.131.0 meldt dat online kiezen er niet op zit', /Online kiezen: niet op deze link/.test(html(N, { cijfers: { opties: zonder } })[0]));
    check('venster: link zonder opties krijgt geen regel', html(N, { cijfers: { exBtw: 1 } })[0] === '' && html(N, { cijfers: null })[0] === '' && html(N, {})[1] === '');
    check('venster na akkoord: keuze en of ze verwerkt is', /Keuze van de klant: basisuitvoering met optie 1 en 2, .* incl\. btw\. Nog niet verwerkt/.test(html(N, { optiekeuze: { ids: ['a', 'b'], nrs: [1, 2], incl: 5000 } })[1]) && /Verwerkt in de calculatie op/.test(html(N, { optiekeuze: { ids: [], nrs: [], incl: 5000 }, optie_verwerkt_op: '2026-11-25T10:00:00Z' })[1]));
    // welke functies zijn gewijzigd, welke nieuw
    const gewijzigd = Object.keys(ontNieuw.functies).filter(n => ontOud.functies[n] && ontOud.functies[n] !== ontNieuw.functies[n]).sort();
    const nieuw = Object.keys(ontNieuw.functies).filter(n => !ontOud.functies[n]).sort();
    const weg = Object.keys(ontOud.functies).filter(n => !ontNieuw.functies[n]);
    const VERWACHT_GEWIJZIGD = ['_accordBeheerRender', '_accordDownloadGetekend', '_accordFormHtml', '_accordKlantDownloadGetekend', '_accordMeldingenRender', '_accordRender', '_accordToonGetekendInViewer', '_accordVerstuur', '_bouwGetekendePdfBytes', '_optTabelVoorLink', '_optVoorDocument', 'openArchiveerModal', 'openCalc', 'renderCalcStructuur'];
    if (!LATER) check('precies de verwachte functies gewijzigd', J(gewijzigd) === J(VERWACHT_GEWIJZIGD), J(gewijzigd));
    check('geen functie verdwenen', weg.length === 0, J(weg));
    if (!LATER) check('nieuwe functies: alleen _accordOpt* en _optOnline*', nieuw.length > 0 && nieuw.every(n => /^_accordOpt|^_optOnline/.test(n)), J(nieuw));
    console.log('     gewijzigd: ' + gewijzigd.length + ', nieuw: ' + nieuw.length + ' (' + nieuw.join(', ') + ')');
    for (const n of ['_berekenOfferteCijfers', '_optBereken', '_optMetStand', '_optPasStandToe', '_optSchrijfStaart', 'optLegVast', '_optAanbod', '_optSimStaart', '_accordCijfersVoorLink', '_accordNieuweLink', '_accordVergelijk', '_verlengUitvoeren', '_accordRenderVerlopen', '_accordRenderVervangen'].concat(LATER ? [] : ['_accordWireActies']))
      check('ongewijzigd: ' + n, !!ontOud.functies[n] && ontOud.functies[n] === ontNieuw.functies[n]);
    if (!LATER) check('versienummer v4.131.0 op drie plekken', N.run("APP_VERSION") === 'v4.131.0' && fs.readFileSync(padNieuw, 'utf8').indexOf('Welkom bij v4.131.0</h2>') > 0 && N.run("RELEASE_HIGHLIGHTS[0].v") === '4.131.0');
    // de documentbouwer zelf: de offerte op de basis is, op de twee zinnen na, gelijk
    const docN = N.run("(function(){ data.calc.offerteConfig.optiesSlot = undefined; delete data.calc.offerteConfig.optiesSlot; const cij = _optVoorDocument(data.calc, null); return cij ? JSON.stringify([cij.opt.opties, cij.opt.basis, cij.opt.combi, cij.opt.toonCombi]) : null; })()");
    const docO = O.run("(function(){ const cij = _optVoorDocument(data.calc, null); return cij ? JSON.stringify([cij.opt.opties, cij.opt.basis, cij.opt.combi, cij.opt.toonCombi]) : null; })()");
    check('opties, basis en tabel op het document gelijk aan v4.130.0', !!docN && docN === docO);
  }

  console.log('\n' + (mis ? 'MISLUKT' : 'ALLES GOED') + ': ' + goed + ' goed, ' + mis + ' mis');
  if (mis) { console.log(misLijst.map(x => ' - ' + x).join('\n')); process.exit(1); }
})().catch(e => { console.error('TEST GECRASHT:', e); process.exit(1); });
