// test_keuzes_v4.128.0.js — hoort bij index.html v4.128.0 en v4.128.1 (delen als keuze, acht keuzes;
// in v4.128.1 alleen andere namen op het scherm). Bijgewerkt op 22-11-2026 voor v4.128.1 en v4.129.0
// (de vergelijking kijkt niet meer naar het versienummer in voetregels).
// Laadt de echte code uit twee bestanden (oud = v4.127.0, nieuw = v4.128.0) in een eigen
// vm-context en legt ze naast elkaar. Gebruik:
//   node test_keuzes_v4.128.0.js <oud index.html> <nieuw index.html>
// Nodig: acorn (npm install acorn), en test_keuzes_laad.js en test_keuzes_fixture.js in dezelfde map.
const { laad } = require('./test_keuzes_laad.js');
const FIX = require('./test_keuzes_fixture.js');
const padOud = process.argv[2], padNieuw = process.argv[3];
if (!padOud || !padNieuw) { console.log('Gebruik: node test_keuzes_v4.128.0.js <index.html v4.127.0> <index.html v4.128.0>'); process.exit(2); }

let goed = 0, mis = 0;
const misLijst = [];
function check(naam, voorwaarde, detail) {
  if (voorwaarde) goed++;
  else { mis++; misLijst.push(naam + (detail ? ' :: ' + detail : '')); console.log('  MIS  ' + naam + (detail ? ' :: ' + detail : '')); }
}
const J = x => JSON.stringify(x);
const cent = (a, b) => Math.abs((a || 0) - (b || 0)) < 0.005;
// De voetregel van werkbon en afdrukken noemt het versienummer; dat verschil hoort erbij en wordt weggestreept.
const vX = t => String(t).replace(/v4\.\d+\.\d+/g, 'vX');
function vers(pad, variant) {
  const L = laad(pad);
  L.run(FIX);
  L.run("__zetKlaar(__maakCalc(" + J(variant) + "))");
  return L;
}
const balans = html => (html.match(/<div\b/g) || []).length - (html.match(/<\/div>/g) || []).length;
const ORDE = ['oA', 'oB', 'oC', 'oD', 'oE', 'oF', 'oG', 'oH'];
// Wat een samenstelling met de hand betekent: welke vinkjes staan aan.
const HAND = { oA: m => [['r8b', m], ['r8', !m]], oB: m => [['r13', m]], oC: m => [['odAG', m]], oD: m => [['odDK', m]], oE: m => [['hgG', m]], oF: m => [['odHL', m]], oG: m => [['odZG', m]], oH: m => [['r2', m]] };

(async () => {
  console.log('oud:   ' + padOud + '\nnieuw: ' + padNieuw + '\n');

  // ------------------------------------------------------------------
  console.log('1. Geen neveneffect: calculatie zonder opties, oud naast nieuw');
  {
    const O = vers(padOud, false), N = vers(padNieuw, false);
    check('beide bestanden laden zonder fouten', O.fouten.length === 0 && N.fouten.length === 0, O.fouten.concat(N.fouten).join(' | '));
    await O.run("__syncAlles()"); await N.run("__syncAlles()");
    check('totaal gelijk', J(O.run("__totaal()")) === J(N.run("__totaal()")), J(N.run("__totaal()")));
    for (const m of ['undefined', 'true', "'volledig'"]) {
      check('_calcTotalForArchive(' + m + ') gelijk', J(O.run("_calcTotalForArchive(data.calc, " + m + ")")) === J(N.run("_calcTotalForArchive(data.calc, " + m + ")")));
    }
    check('_optBereken is null zonder opties', O.run("_optBereken(data.calc)") === null && N.run("_optBereken(data.calc)") === null);
    check('_optVoorDocument is null zonder opties', N.run("_optVoorDocument(data.calc)") === null);
    check('_heeftVervallen gelijk (nee)', O.run("_heeftVervallen(data.calc)") === false && N.run("_heeftVervallen(data.calc)") === false);
    check('werkbon gelijk', vX(O.run("_werkbonHtml(data.calc)")) === vX(N.run("_werkbonHtml(data.calc)")));
    check('onderhoudsplan-rekenpad gelijk', J(O.run("_ohpProjectRauw(data.calc, data.settings, null, null)")) === J(N.run("_ohpProjectRauw(data.calc, data.settings, null, null)")));
    check('tekeningen voor document gelijk', J(O.run("_kozijnenVoorDocument(data.calc).map(m=>m.id)")) === J(N.run("_kozijnenVoorDocument(data.calc).map(m=>m.id)")));
    check('tekeningen voor offerte = voor document', J(N.run("_kozijnenVoorOfferte(data.calc).map(m=>m.id)")) === J(N.run("_kozijnenVoorDocument(data.calc).map(m=>m.id)")));
    check('gebreken en deuronderkanten gelijk', J(O.run("[_telGebreken(), _telDeurOnderkanten()]")) === J(N.run("[_telGebreken(), _telDeurOnderkanten()]")));
    check('gewone hoofdgroep schrijft geen optie_id', J(O.run("_mapHgToDB(data.calc.hoofdgroepen[0], 'x')")) === J(N.run("_mapHgToDB(data.calc.hoofdgroepen[0], 'x')")));
    check('gewoon onderdeel schrijft geen optie_id', J(O.run("_mapOdToDB(data.calc.hoofdgroepen[0].onderdelen[0], 'x')")) === J(N.run("_mapOdToDB(data.calc.hoofdgroepen[0].onderdelen[0], 'x')")));
    // met de hand uitgezet: hoofdgroep, onderdeel, regel
    for (const L of [O, N]) L.run("__vind('hgG').actief = false; __vind('odZG').actief = false; __vind('r9').actief = false;");
    await O.run("__syncAlles()"); await N.run("__syncAlles()");
    check('met de hand uitgezet: totaal gelijk', J(O.run("__totaal()")) === J(N.run("__totaal()")));
    check('met de hand uitgezet: vervallen gelijk (ja)', O.run("_heeftVervallen(data.calc)") === true && N.run("_heeftVervallen(data.calc)") === true);
    for (const m of ['undefined', 'true', "'volledig'"]) {
      check('met de hand uitgezet: _calcTotalForArchive(' + m + ') gelijk', J(O.run("_calcTotalForArchive(data.calc, " + m + ")")) === J(N.run("_calcTotalForArchive(data.calc, " + m + ")")));
    }
    check('met de hand uitgezet: werkbon concept gelijk', vX(O.run("_werkbonHtml(data.calc)")) === vX(N.run("_werkbonHtml(data.calc)")));
    for (const L of [O, N]) L.run("data.calc.status = 'geaccepteerd';");
    check('met de hand uitgezet: werkbon vergrendeld gelijk', vX(O.run("_werkbonHtml(data.calc)")) === vX(N.run("_werkbonHtml(data.calc)")));
    check('met de hand uitgezet: werkbon noemt vervallen', /vervallen na akkoord/.test(N.run("_werkbonHtml(data.calc)")));
    check('met de hand uitgezet: plan-rekenpad gelijk', J(O.run("_ohpProjectRauw(data.calc, data.settings, null, null)")) === J(N.run("_ohpProjectRauw(data.calc, data.settings, null, null)")));
  }

  // ------------------------------------------------------------------
  console.log('2. Geen neveneffect: regel-opties zoals in v4.125.0 (twee opties), oud naast nieuw');
  {
    const O = vers(padOud, 'regels'), N = vers(padNieuw, 'regels');
    await O.run("__syncAlles()"); await N.run("__syncAlles()");
    const strip = "(b => ({ n: b.n, huidig: b.huidig, fouten: b.fouten, waarsch: b.waarsch, basis: [b.basis.excl, b.basis.incl, b.basis.dagen], combi: b.combi.map(x => [x.masker, x.ids, x.ok, x.excl, x.btw, x.incl, x.dagen, x.dagenWerkelijk]), meer: b.opties.map(o => [o.id, o.nr, o.status, o.meerExcl, o.meerIncl]) }))(_optBereken(data.calc))";
    const bo = O.run(strip), bn = N.run(strip);
    check('_optBereken gelijk (4 samenstellingen)', J(bo) === J(bn), J(bn).slice(0, 300));
    check('nieuw rekent hier alles direct door', N.run("(b => b.volledig && b.aantal === 4 && b.totaalAantal === 4)(_optBereken(data.calc))"));
    const doc = "(d => JSON.stringify(d.opt))(_optVoorDocument(data.calc))";
    check('_optVoorDocument gelijk', O.run(doc) === N.run(doc));
    check('offerteblok (scherm) gelijk', O.run("_optDocHtml(_optVoorDocument(data.calc))") === N.run("_optDocHtml(_optVoorDocument(data.calc))"));
    check('offerteblok (pdf) gelijk', J(O.run("_optDocContent(_optVoorDocument(data.calc))")) === J(N.run("_optDocContent(_optVoorDocument(data.calc))")));
    const tab = "(t => { const k = Object.assign({}, t); delete k.ms; return JSON.stringify(k); })(_optTabelVoorLink(data.calc))";
    check('tabel voor de accordeerlink gelijk (zonder rekentijd)', O.run(tab) === N.run(tab));
    check('plan-rekenpad gelijk', J(O.run("_ohpProjectRauw(data.calc, data.settings, null, null)")) === J(N.run("_ohpProjectRauw(data.calc, data.settings, null, null)")));
    check('werkbon gelijk', vX(O.run("_werkbonHtml(data.calc)")) === vX(N.run("_werkbonHtml(data.calc)")));
    check('vervallen gelijk (nee)', O.run("_heeftVervallen(data.calc)") === false && N.run("_heeftVervallen(data.calc)") === false);
    check('_calcTotalForArchive(true) gelijk', J(O.run("_calcTotalForArchive(data.calc, true)")) === J(N.run("_calcTotalForArchive(data.calc, true)")));
    // keuze vastleggen zoals in v4.125.0: optie A en B
    for (const L of [O, N]) { L.run("_optKiesConcept = { calcId: data.calc.id, ids: new Set(['oA', 'oB']) };"); await L.run("optLegVast(false)"); await L.run("new Promise(r => setTimeout(r, 5))"); }
    check('na vastleggen: totaal gelijk', J(O.run("__totaal()")) === J(N.run("__totaal()")), J(N.run("__totaal()")));
    check('na vastleggen: totaal = voorspelde samenstelling', cent(N.run("__totaal().incl"), bn.combi[3][5]), N.run("__totaal().incl") + ' / ' + bn.combi[3][5]);
    check('na vastleggen: vinkjes gelijk', J(O.run("['r8','r8b','r13'].map(i => __vind(i).actief)")) === J(N.run("['r8','r8b','r13'].map(i => __vind(i).actief)")));
    check('na vastleggen: schrijfacties naar dezelfde tabellen', J(O.run("__db.log.filter(l => l.op !== 'select').map(l => l.tabel + ':' + l.op)")) === J(N.run("__db.log.filter(l => l.op !== 'select').map(l => l.tabel + ':' + l.op)")));
    check('na vastleggen: geen waarschuwing', O.meldingen.alert.length === 0 && N.meldingen.alert.length === 0, N.meldingen.alert.join(' | '));
  }

  // ------------------------------------------------------------------
  console.log('3. Acht keuzes: alle 256 samenstellingen naast "met de hand" in v4.127.0');
  let ber8 = null;
  {
    const N = vers(padNieuw, 'delen');
    await N.run("__syncAlles()");
    check('basis: geen meldingen bij klaarzetten', N.meldingen.alert.length === 0);
    const info = N.run("(b => ({ n: b.n, volledig: b.volledig, aantal: b.aantal, totaal: b.totaalAantal, fouten: b.fouten, waarsch: b.waarsch, huidig: b.huidig, ids: b.opties.map(o => o.id), status: b.opties.map(o => o.status), meer: b.opties.map(o => o.meerExcl) }))(_optBereken(data.calc))");
    check('acht keuzes aangeboden', info.n === 8 && J(info.ids) === J(ORDE), J(info.ids));
    check('licht: 9 van de 256 doorgerekend', info.volledig === false && info.aantal === 9 && info.totaal === 256, info.aantal + '/' + info.totaal);
    check('geen fouten, geen waarschuwingen', info.fouten.length === 0 && info.waarsch.length === 0, J(info.fouten.concat(info.waarsch)));
    check('alle keuzes staan uit, basis is de huidige stand', info.huidig === 0 && info.status.every(s => s === 'uit'));
    check('elke keuze heeft een meerprijs boven nul', info.meer.every(x => x > 0), J(info.meer));
    await N.run("new Promise(r => setTimeout(r, 20))");
    const schrijfVoor = N.run("__db.log.filter(l => l.op !== 'select').length");
    const staartVoor = N.run("JSON.stringify(data.calc.staart)");
    const licht = N.run("_optBereken(data.calc).combi.map(x => [x.masker, x.excl, x.incl, x.dagen])");
    const t0 = Date.now();
    ber8 = N.run("(b => ({ ms: b.ms, volledig: b.volledig, fouten: b.fouten, combi: b.combi.map(x => ({ m: x.masker, ids: x.ids, ok: x.ok, excl: x.excl, incl: x.incl, dagen: x.dagen })) }))(_optBereken(data.calc, { volledig: true }))");
    console.log('     256 samenstellingen in Node: ' + ber8.ms + ' ms (gemeten door de app zelf), ' + (Date.now() - t0) + ' ms inclusief ophalen');
    check('volledig: 256 rijen, alle te berekenen', ber8.volledig && ber8.combi.length === 256 && ber8.combi.every(x => x.ok));
    check('licht en volledig geven dezelfde bedragen', licht.every(l => { const v = ber8.combi[l[0]]; return v.m === l[0] && cent(v.excl, l[1]) && cent(v.incl, l[2]) && v.dagen === l[3]; }));
    check('rekenen laat de calculatie ongemoeid', N.run("['odAG','odDK','hgG','odHL','odZG','r2','r13','r8b'].every(i => __vind(i).actief === false) && __vind('r8').actief === true"));
    await N.run("new Promise(r => setTimeout(r, 20))");
    check('rekenen schrijft niets naar de database', N.run("__db.log.filter(l => l.op !== 'select').length") === schrijfVoor, schrijfVoor + ' -> ' + N.run("__db.log.filter(l => l.op !== 'select').length"));
    check('rekenen laat de staart ongemoeid', N.run("JSON.stringify(data.calc.staart)") === staartVoor);
    // Onafhankelijke referentie: dezelfde calculatie in v4.127.0, zonder keuze-mechaniek voor delen.
    // Vinkjes met de hand gezet, daarna de echte bijwerkroutines van de app voor de staartposten.
    let afw = 0, eerste = '';
    const dagenSoorten = new Set();
    for (let m = 0; m < 256; m++) {
      const O = vers(padOud, 'regels');
      const zet = [];
      ORDE.forEach((id, i) => HAND[id](!!(m & (1 << i))).forEach(z => zet.push(z)));
      O.run(zet.map(z => "__vind(" + J(z[0]) + ").actief = " + z[1] + ";").join(' '));
      // in v4.127.0 zijn r2 en de delen gewone onderdelen: geen optie_id
      await O.run("__syncAlles()");
      const ref = O.run("__totaal()");
      const rij = ber8.combi[m];
      dagenSoorten.add(ref.dagen);
      if (!(cent(ref.excl, rij.excl) && cent(ref.incl, rij.incl) && ref.dagen === rij.dagen)) { afw++; if (!eerste) eerste = 'masker ' + m + ' ref ' + J(ref) + ' app ' + J(rij); }
    }
    check('alle 256 samenstellingen op de cent gelijk aan "met de hand" in v4.127.0', afw === 0, afw + ' afwijkend; ' + eerste);
    check('de proef bevat sprongen in werkdagen', dagenSoorten.size >= 3, J(Array.from(dagenSoorten)));
    const b0 = ber8.combi[0], b255 = ber8.combi[255];
    console.log('     basis ' + b0.incl + ' incl. (' + b0.dagen + ' dagen), alles gekozen ' + b255.incl + ' incl. (' + b255.dagen + ' dagen), werkdagen in de proef: ' + Array.from(dagenSoorten).sort((a, b) => a - b).join(', '));
  }

  // ------------------------------------------------------------------
  console.log('4. Uit door een keuze is niet vervallen');
  {
    const N = vers(padNieuw, 'delen'), K = vers(padNieuw, 'delen-kaal'), O = vers(padOud, 'delen-kaal');
    await N.run("__syncAlles()"); await K.run("__syncAlles()"); await O.run("__syncAlles()");
    check('zelfde stand met de hand uitgezet: totaal gelijk aan de basis', J(N.run("__totaal()")) === J(K.run("__totaal()")) && J(K.run("__totaal()")) === J(O.run("__totaal()")));
    check('met de hand uitgezet telt als vervallen (oud en nieuw)', O.run("_heeftVervallen(data.calc)") === true && K.run("_heeftVervallen(data.calc)") === true);
    check('als keuze uitgezet telt niet als vervallen', N.run("_heeftVervallen(data.calc)") === false);
    const basis = N.run("_calcTotalForArchive(data.calc)");
    check('oorspronkelijk bedrag (bij vergrendelen) = basis', cent(N.run("_calcTotalForArchive(data.calc, true).totaal"), basis.totaal), J(basis.totaal));
    check('oorspronkelijk volledig = basis', cent(N.run("_calcTotalForArchive(data.calc, 'volledig').totaal"), basis.totaal));
    check('met de hand uitgezet: oorspronkelijk bedrag is hoger dan de basis', K.run("_calcTotalForArchive(data.calc, true).totaal") > basis.totaal + 100);
    // een regel met de hand uit, naast de keuzes: alleen die regel is vervallen
    N.run("__vind('r9').actief = false;"); K.run("__vind('r9').actief = false;");
    check('regel met de hand uit naast keuzes: wel vervallen', N.run("_heeftVervallen(data.calc)") === true);
    const metR9 = N.run("_calcTotalForArchive(data.calc, 'volledig').totaal"), zonderR9 = N.run("_calcTotalForArchive(data.calc).totaal");
    check('oorspronkelijk volledig telt alleen de vervallen regel erbij', metR9 > zonderR9 && metR9 < K.run("_calcTotalForArchive(data.calc, 'volledig').totaal"));
    N.run("__vind('r9').actief = true;");
    // meetrij uit in een niet-gekozen deel: niet vervallen
    N.run("data.calc.meetstaat.find(m => m.id === 'ms3').actief = false;");
    check('uitgezette meetrij in een niet-gekozen deel: niet vervallen', N.run("_heeftVervallen(data.calc)") === false);
    N.run("data.calc.meetstaat.find(m => m.id === 'ms3').actief = true; _syncMeetstaatHoeveelheden();");
    // onderdeel met de hand uit BINNEN een hoofdgroep die als keuze uit staat: niet vervallen
    N.run("__vind('odGD').actief = false;");
    check('onderdeel uit binnen een niet-gekozen hoofdgroep: niet vervallen', N.run("_heeftVervallen(data.calc)") === false);
    N.run("__vind('odGD').actief = true;");
    // totalen per deel
    check('oorspronkelijk totaal hoofdgroep Buiten telt de niet-gekozen onderdelen niet', cent(N.run("calcHoofdgroepTotalenOrigineel(__vind('hgB')).verkoop"), N.run("calcOnderdeelTotalenOrigineel(__vind('odVG')).verkoop")));
    check('oorspronkelijk projecttotaal telt de niet-gekozen delen niet', N.run("calcProjectTotalenOrigineel().verkoop") < K.run("calcProjectTotalenOrigineel().verkoop") - 100);
  }

  // ------------------------------------------------------------------
  console.log('5. Werkbon, onderhoudsplan en tekeningen');
  {
    const N = vers(padNieuw, 'delen');
    await N.run("__syncAlles()");
    // Referentie: dezelfde calculatie waarin de niet-gekozen delen en regels helemaal niet bestaan.
    const Z = vers(padNieuw, 'delen');
    Z.run("data.calc.hoofdgroepen = data.calc.hoofdgroepen.filter(h => !h.optieId); data.calc.hoofdgroepen.forEach(h => { h.onderdelen = h.onderdelen.filter(o => !o.optieId); h.onderdelen.forEach(o => { o.regels = o.regels.filter(r => !r.optieId); }); }); data.calc.meetstaat = data.calc.meetstaat.filter(m => !!__vind(m.calcRegelId)); data.calc.offerteConfig.opties = [];");
    await Z.run("__syncAlles()");
    check('referentie zonder de delen: totaal = basis', J(N.run("__totaal()")) === J(Z.run("__totaal()")), J(N.run("__totaal()")) + ' / ' + J(Z.run("__totaal()")));
    check('werkbon concept = werkbon zonder die delen', N.run("_werkbonHtml(data.calc)") === Z.run("_werkbonHtml(data.calc)"));
    N.run("data.calc.status = 'geaccepteerd';"); Z.run("data.calc.status = 'geaccepteerd';");
    const wb = N.run("_werkbonHtml(data.calc)");
    check('werkbon vergrendeld = werkbon zonder die delen', wb === Z.run("_werkbonHtml(data.calc)"));
    check('werkbon vergrendeld noemt geen vervallen delen', !/vervallen na akkoord/.test(wb) && !/Achtergevel|Dakkapel|Garagedeur|Zijgevel/.test(wb));
    check('werkbon vergrendeld: div-balans', balans(wb) === 0, String(balans(wb)));
    N.run("data.calc.status = 'concept';"); Z.run("data.calc.status = 'concept';");
    const pn = N.run("_ohpProjectRauw(data.calc, data.settings, null, null)"), pz = Z.run("_ohpProjectRauw(data.calc, data.settings, null, null)");
    check('onderhoudsplan-rekenpad = zonder die delen', J(pn) === J(pz), J(pn) + ' / ' + J(pz));
    const O = vers(padOud, 'delen-kaal');
    check('in v4.127.0 telde een uitgezet deel wel mee in het plan (controle van de proef)', O.run("_ohpProjectRauw(data.calc, data.settings, null, null).uren") > pn.uren + 1);
    // tekeningen
    check('tekeningen intern (Craft, losse print): alleen de basis', J(N.run("_kozijnenVoorDocument(data.calc).map(m => m.id)")) === J(['ms1', 'ms2']));
    check('tekeningen op de klantofferte: ook van aangeboden delen', J(N.run("_kozijnenVoorOfferte(data.calc).map(m => m.id)")) === J(['ms1', 'ms2', 'ms3', 'ms4', 'ms5']));
    const lab = N.run("_optTekLabels(data.calc)"), labVerw = { r3: 'Optie 3', r4: 'Optie 3', r6: 'Optie 4', r7: 'Optie 4', r14: 'Optie 5', r10: 'Optie 6', r11: 'Optie 6', r5: 'Optie 7' };
    check('label bij tekeningen van een aangeboden deel', Object.keys(lab).length === 8 && Object.keys(labVerw).every(k => lab[k] === labVerw[k]), J(lab));
    const kh = N.run("_bouwKozijnenHtml(data.calc, _kozijnenVoorOfferte(data.calc))");
    check('kozijnbijlage noemt "Achtergevel · Optie 3"', /Buiten · Achtergevel · Optie 3/.test(kh) && /Buiten · Dakkapel · Optie 4/.test(kh) && /Buiten · Voorgevel</.test(kh));
    check('kozijnbijlage: div-balans', balans(kh) === 0);
    check('gebreken en deuronderkanten tellen alleen de basis', J(N.run("[_telGebreken().houtrot, _telGebreken().kit, _telDeurOnderkanten()]")) === J([1, 0, 1]));
    // keuze vastgelegd zonder de achtergevel: tekeningen van niet-gekozen delen weg
    N.run("data.calc.offerteConfig.optiesKeuze = { op: '2026-11-21T10:00:00Z', door: 'test', gekozen: [] };");
    check('keuze vastgelegd: geen tekeningen van niet-gekozen delen', J(N.run("_kozijnenVoorOfferte(data.calc).map(m => m.id)")) === J(['ms1', 'ms2']));
    N.run("delete data.calc.offerteConfig.optiesKeuze;");
    // een deel met de hand uit wordt niet aangeboden
    const K = vers(padNieuw, 'delen-kaal');
    check('met de hand uitgezet deel: geen tekeningen op de offerte', J(K.run("_kozijnenVoorOfferte(data.calc).map(m => m.id)")) === J(['ms1', 'ms2']));
  }

  // ------------------------------------------------------------------
  console.log('6. Niet nesten, en wat het blok meldt');
  {
    const N = vers(padNieuw, 'regels');
    await N.run("__syncAlles()");
    const blok = (hg, od) => N.run("_optDeelBlokkade(data.calc, _optDeelZoek(" + J(hg) + ", " + J(od) + "))");
    check('onderdeel met een optieregel kan geen keuze worden', /optie binnen een keuze/i.test(blok('hgI', 'odWK')), blok('hgI', 'odWK'));
    check('hoofdgroep met een optieregel kan geen keuze worden', /optie binnen een keuze/i.test(blok('hgI', null)));
    check('gewoon onderdeel kan een keuze worden', blok('hgB', 'odAG') === '');
    check('gewone hoofdgroep kan een keuze worden', blok('hgG', null) === '');
    N.run("__vind('odZG').actief = false;");
    check('uitgezet onderdeel kan geen keuze worden', /staat uit/.test(blok('hgB', 'odZG')));
    N.run("__vind('odZG').actief = true;");
    // maak Achtergevel een keuze (echte functie, nep-database)
    await N.run("optDeelMaak('hgB', 'odAG')");
    check('optDeelMaak: onderdeel uit, optie_id gezet (geheugen)', N.run("__vind('odAG').actief === false && !!__vind('odAG').optieId"));
    check('optDeelMaak: database bijgewerkt', N.run("(r => r.actief === false && r.optie_id === __vind('odAG').optieId)(__db.tabellen.onderdelen.find(r => r.id === 'odAG'))"));
    check('optDeelMaak: optie in de config, soort erbij, titel = naam', N.run("(o => !!o && o.soort === 'erbij' && o.titel === 'Buiten · Achtergevel')(__db.tabellen.calculaties[0].offerte_config.opties.find(o => o.id === __vind('odAG').optieId))"));
    check('optDeelMaak: regels in het deel houden hun eigen vinkje', N.run("__vind('r3').actief === true && __vind('r4').actief === true && !__vind('r3').optieId"));
    check('hoofdgroep met een onderdeel-keuze kan geen keuze worden', /onderdeel al een keuze/.test(blok('hgB', null)), blok('hgB', null));
    check('een deel dat al een keuze is', /al een keuze/.test(blok('hgB', 'odAG')));
    // vinkje van een keuze-deel is niet met de hand om te zetten
    N.meldingen.toast.length = 0;
    N.run("toggleOdActief('hgB', 'odAG')");
    check('vinkje van een keuze-deel volgt de keuze', N.run("__vind('odAG').actief") === false);
    // regel in een keuze-deel: geen optie mogelijk
    N.run("optOpenMaak('hgB', 'odAG', 'r3')");
    check('geen optie op een regel binnen een keuze-deel', N.run("_optMaakCtx") === null && N.run("_optRegelKnopHtml('hgB', 'odAG', __vind('r3'))") === '');
    check('wel een optie-knop op een regel buiten een keuze-deel', /optOpenMaak/.test(N.run("_optRegelKnopHtml('hgB', 'odVG', __vind('r1'))")));
    // met de hand genest (kan via de app niet): doet niet mee, met reden
    N.run("__vind('r4').optieId = 'oB'; __vind('r4').actief = false;");
    let w = N.run("_optBereken(data.calc).waarsch");
    check('geneste optieregel doet niet mee', w.some(t => /doet niet mee, want het deel waar hij in zit is zelf een keuze/.test(t)), J(w));
    N.run("__vind('r4').optieId = null; __vind('r4').actief = true;");
    N.run("__vind('hgB').optieId = 'oB'; __vind('hgB').actief = false;");
    w = N.run("_optBereken(data.calc).waarsch");
    check('onderdeel-keuze binnen een hoofdgroep-keuze doet niet mee', w.some(t => /onderdeel "Achtergevel" \(Buiten\) doet niet mee, want de hoofdgroep is zelf een keuze/.test(t)), J(w));
    N.run("__vind('hgB').optieId = null; __vind('hgB').actief = true;");
    // deel bij een optie die niet meer bestaat
    N.run("__vind('odZG').optieId = 'weg'; __vind('odZG').actief = false;");
    w = N.run("_optBereken(data.calc).waarsch");
    check('deel bij een verdwenen optie wordt gemeld', w.some(t => /Onderdeel "Buiten · Zijgevel" hoort bij een optie die niet meer bestaat/.test(t)), J(w));
    check('zo\'n deel telt niet als vervallen en niet in het plan', N.run("_heeftVervallen(data.calc)") === false && N.run("_optDeelUit(__vind('odZG'))") === true);
    const kop = N.run("_optDeelKop('hgB', 'odZG', __vind('odZG'))");
    check('kop toont "optie onbekend" met de terugknop', /optie onbekend/.test(kop.tag) && /optDeelLos\('hgB','odZG'\)/.test(kop.tag) && kop.knop === '');
    await N.run("optDeelLos('hgB', 'odZG')");
    check('optDeelLos op zo\'n deel: weer gewoon, aan', N.run("__vind('odZG').actief === true && __vind('odZG').optieId === null") && N.run("(r => r.actief === true && r.optie_id === null)(__db.tabellen.onderdelen.find(r => r.id === 'odZG'))"));
    // maximum
    N.run("data.calc.offerteConfig.opties = data.calc.offerteConfig.opties.concat([1,2,3,4,5].map(i => ({ id: 'vul' + i, soort: 'erbij', titel: 'vul ' + i, klanttekst: '' }))); __db.tabellen.calculaties[0].offerte_config.opties = JSON.parse(JSON.stringify(data.calc.offerteConfig.opties));");
    check('er staan nu acht opties', N.run("_optCfgLijst(data.calc).length") === 8);
    N.meldingen.toast.length = 0;
    await N.run("optDeelMaak('hgG', null)");
    check('negende keuze wordt geweigerd', N.run("__vind('hgG').actief === true && !__vind('hgG').optieId") && N.run("_optCfgLijst(data.calc).length") === 8);
    check('OPT_MAX is 8', N.run("OPT_MAX") === 8);
  }

  // ------------------------------------------------------------------
  console.log('7. Maken, vastleggen, wissen en terugdraaien met een hoofdgroep en een onderdeel');
  {
    const N = vers(padNieuw, 'regels');
    await N.run("__syncAlles()");
    const start = N.run("__totaal()");
    const staart0 = N.run("JSON.stringify(data.calc.staart.map(p => [p.naam, p.bedrag, p.hoeveelheid]).sort())");
    await N.run("optDeelMaak('hgG', null)"); await N.run("__syncAlles()");
    await N.run("optDeelMaak('hgB', 'odAG')"); await N.run("__syncAlles()");
    await N.run("optDeelMaak('hgI', 'odHL')"); await N.run("__syncAlles()");
    check('drie delen als keuze: vijf opties', N.run("_optBereken(data.calc).n") === 5);
    check('hoofdgroep-keuze: tabel hoofdgroepen bijgewerkt', N.run("(r => r.actief === false && !!r.optie_id)(__db.tabellen.hoofdgroepen.find(r => r.id === 'hgG'))"));
    const ber = N.run("(b => ({ volledig: b.volledig, aantal: b.aantal, fouten: b.fouten, waarsch: b.waarsch, ids: b.opties.map(o => o.id), basis: b.basis.incl, combi: b.combi.map(x => ({ m: x.masker, incl: x.incl, excl: x.excl })) }))(_optBereken(data.calc, { volledig: true }))");
    check('geen fouten', ber.fouten.length === 0, J(ber.fouten));
    check('basis is lager dan het begin', ber.basis < start.incl - 100, ber.basis + ' / ' + start.incl);
    // vastleggen: garage + achtergevel + hal + optie B, niet optie A
    const kiesIds = [ber.ids[1], ber.ids[2], ber.ids[3], ber.ids[4]];
    const masker = ber.ids.reduce((m, id, i) => m | (kiesIds.includes(id) ? (1 << i) : 0), 0);
    N.run("_optKiesConcept = { calcId: data.calc.id, ids: new Set(" + J(kiesIds) + ") };");
    N.run("__db.log.length = 0;");
    await N.run("optLegVast(false)"); await N.run("new Promise(r => setTimeout(r, 5))");
    const na = N.run("__totaal()");
    check('vastleggen: totaal op de cent gelijk aan de voorspelde samenstelling', cent(na.incl, ber.combi[masker].incl) && cent(na.excl, ber.combi[masker].excl), na.incl + ' / ' + ber.combi[masker].incl);
    check('vastleggen: geen waarschuwing', N.meldingen.alert.length === 0, N.meldingen.alert.join(' | '));
    check('vastleggen: vinkjes in het geheugen', N.run("__vind('hgG').actief === true && __vind('odAG').actief === true && __vind('odHL').actief === true && __vind('r13').actief === true && __vind('r8b').actief === false && __vind('r8').actief === true"));
    check('vastleggen: vinkjes in de database, elk in zijn eigen tabel', N.run("__db.tabellen.hoofdgroepen.find(r => r.id === 'hgG').actief === true && __db.tabellen.onderdelen.find(r => r.id === 'odAG').actief === true && __db.tabellen.onderdelen.find(r => r.id === 'odHL').actief === true && __db.tabellen.calc_regels.find(r => r.id === 'r13').actief === true"));
    check('vastleggen: schrijft naar hoofdgroepen, onderdelen en calc_regels', J(Array.from(new Set(N.run("__db.log.filter(l => l.op === 'update' && l.payload && Object.keys(l.payload).join() === 'actief').map(l => l.tabel)"))).sort()) === J(['calc_regels', 'hoofdgroepen', 'onderdelen']));
    check('vastleggen: keuze aangetekend met bedrag', N.run("(k => !!k && k.gekozen.length === 4 && Math.abs(k.totaalIncl - " + ber.combi[masker].incl + ") < 0.005 && k.app === APP_VERSION)(__db.tabellen.calculaties[0].offerte_config.optiesKeuze)"));
    check('vastleggen: optie_id blijft op de delen staan', N.run("!!__vind('hgG').optieId && !!__vind('odAG').optieId && !!__db.tabellen.hoofdgroepen.find(r => r.id === 'hgG').optie_id"));
    // Onafhankelijk: staart na vastleggen = wat de echte bijwerkroutines zouden doen
    const staartNa = N.run("JSON.stringify(data.calc.staart.map(p => [p.naam, p.bedrag, p.hoeveelheid]).sort())");
    await N.run("__syncAlles()");
    check('vastleggen: de echte bijwerkroutines veranderen daarna niets meer aan de staart', staartNa === N.run("JSON.stringify(data.calc.staart.map(p => [p.naam, p.bedrag, p.hoeveelheid]).sort())"));
    check('vastleggen: totaal blijft na de bijwerkroutines gelijk', cent(N.run("__totaal().incl"), ber.combi[masker].incl));
    check('gekozen deel telt niet als vervallen', N.run("_heeftVervallen(data.calc)") === false);
    check('gekozen deel staat op de werkbon', /Garagedeur/.test(N.run("_werkbonHtml(data.calc)")) && /Achtergevel/.test(N.run("_werkbonHtml(data.calc)")));
    check('gekozen deel telt mee in het plan', N.run("_ohpProjectRauw(data.calc, data.settings, null, null).uren") > 0 && cent(N.run("_ohpProjectRauw(data.calc, data.settings, null, null).uren"), N.run("calcProjectTotalen().uren")));
    check('gekozen deel: kop toont "gekozen"', /hele hoofdgroep · gekozen/.test(N.run("_optDeelKop('hgG', null, __vind('hgG')).tag")));
    // verwijderen en terugdraaien geblokkeerd bij een vastgelegde keuze
    N.meldingen.toast.length = 0;
    await N.run("delOd('hgB', 'odAG')"); await N.run("delHg('hgG')"); await N.run("optDeelLos('hgG', null)");
    check('bij een vastgelegde keuze: deel verwijderen of terugdraaien geweigerd', N.run("!!__vind('odAG') && !!__vind('hgG') && !!__vind('hgG').optieId"));
    // wissen
    await N.run("optLegVast(true)"); await N.run("new Promise(r => setTimeout(r, 5))");
    check('wissen: totaal terug op de basis', cent(N.run("__totaal().incl"), ber.basis), N.run("__totaal().incl") + ' / ' + ber.basis);
    check('wissen: delen weer uit, in geheugen en database', N.run("__vind('hgG').actief === false && __vind('odAG').actief === false && __vind('odHL').actief === false && __db.tabellen.hoofdgroepen.find(r => r.id === 'hgG').actief === false && __db.tabellen.onderdelen.find(r => r.id === 'odAG').actief === false"));
    check('wissen: geen waarschuwing', N.meldingen.alert.length === 0, N.meldingen.alert.join(' | '));
    // terugdraaien: alles weer gewoon
    await N.run("optDeelLos('hgG', null)"); await N.run("__syncAlles()");
    await N.run("optDeelLos('hgI', 'odHL')"); await N.run("__syncAlles()");
    const optieAG = N.run("__vind('odAG').optieId");
    await N.run("optOpheffen(" + J(optieAG) + ")");
    await N.run("new Promise(r => setTimeout(r, 20))");   // optOpheffen wacht zelf niet op zijn bijwerkronde (ongewijzigd uit v4.125.0)
    await N.run("__syncAlles()");
    check('terugdraaien: delen weer aan, zonder optie_id', N.run("['hgG','odHL','odAG'].every(i => __vind(i).actief === true && __vind(i).optieId === null)"));
    check('terugdraaien: database gelijk', N.run("__db.tabellen.hoofdgroepen.find(r => r.id === 'hgG').optie_id === null && __db.tabellen.onderdelen.find(r => r.id === 'odAG').optie_id === null && __db.tabellen.onderdelen.find(r => r.id === 'odAG').actief === true"));
    check('terugdraaien: de opties van de delen zijn weg, de twee regel-opties staan er nog', J(N.run("_optCfgLijst(data.calc).map(o => o.id)")) === J(['oA', 'oB']));
    check('terugdraaien: totaal weer als aan het begin', J(N.run("__totaal()")) === J(start), J(N.run("__totaal()")) + ' / ' + J(start));
    check('terugdraaien: staart weer als aan het begin', N.run("JSON.stringify(data.calc.staart.map(p => [p.naam, p.bedrag, p.hoeveelheid]).sort())") === staart0);
    // twee snelle tikken achter elkaar: de tweede wacht op de eerste, geen dubbele staartposten
    const p1 = N.run("optDeelMaak('hgB', 'odAG')"), p2 = N.run("optDeelLos('hgB', 'odAG')"), p3 = N.run("optDeelMaak('hgG', null)");
    await Promise.all([p1, p2, p3]); await N.run("new Promise(r => setTimeout(r, 20))");
    check('snelle tikken: alleen de eerste is uitgevoerd', N.run("__vind('odAG').actief === false && !!__vind('odAG').optieId && __vind('hgG').actief === true && !__vind('hgG').optieId"));
    await N.run("optDeelLos('hgB', 'odAG')"); await N.run("__syncAlles()");
    check('snelle tikken: geen dubbele staartposten', N.run("(n => n.length === new Set(n).size)(data.calc.staart.map(p => p.gebrekType || p.naam))"), N.run("data.calc.staart.map(p => p.naam).join(' | ')"));
    check('snelle tikken: totaal weer als aan het begin', J(N.run("__totaal()")) === J(start));
    // mislukte database-schrijfactie: niets half
    N.run("__db.fout.onderdelen = 'kolom optie_id bestaat niet';");
    N.meldingen.toast.length = 0;
    await N.run("optDeelMaak('hgB', 'odZG')");
    check('database weigert: deel blijft gewoon en de optie wordt teruggedraaid', N.run("__vind('odZG').actief === true && !__vind('odZG').optieId") && J(N.run("_optCfgLijst(data.calc).map(o => o.id)")) === J(['oA', 'oB']) && N.run("__db.tabellen.calculaties[0].offerte_config.opties.length") === 2);
    N.run("delete __db.fout.onderdelen;");
  }

  // ------------------------------------------------------------------
  console.log('8. Document en scherm');
  {
    const N = vers(padNieuw, 'delen');
    await N.run("__syncAlles()");
    const opt = N.run("JSON.parse(JSON.stringify(_optVoorDocument(data.calc).opt))");
    check('document bij acht keuzes: geen tabel per samenstelling', opt.n === 8 && opt.toonCombi === false && opt.combi.length === 0);
    check('document: acht opties met meerprijs, doorgenummerd', opt.opties.length === 8 && opt.opties.every((o, i) => o.nr === i + 1 && o.meerExcl > 0 && o.meerIncl > o.meerExcl) && opt.opties[2].label === 'Optie 3: Achtergevel', J(opt.opties.map(o => o.label)));
    check('document: meerprijzen = losse samenstelling min basis', opt.opties.every((o, i) => cent(o.meerIncl, ber8.combi[1 << i].incl - ber8.combi[0].incl)));
    const dh = N.run("_optDocHtml(_optVoorDocument(data.calc))");
    check('offerteblok noemt alle acht opties en geen samenstellingstabel', [1, 2, 3, 4, 5, 6, 7, 8].every(i => dh.includes('Optie ' + i + ':')) && !/Totaal per samenstelling/.test(dh));
    check('offerteblok: kostenoverzicht is de basis', cent(N.run("_r2(_optVoorDocument(data.calc).exBtwFinal)"), ber8.combi[0].excl));
    const tab = N.run("JSON.parse(JSON.stringify(_optTabelVoorLink(data.calc)))");
    check('tabel voor de accordeerlink: 256 samenstellingen', tab.n === 8 && tab.combi.length === 256 && tab.combi.every((x, m) => cent(x.incl, ber8.combi[m].incl) && J(x.ids) === J(ber8.combi[m].ids)));
    console.log('     tabel voor de link: ' + J(tab).length + ' tekens');
    // scherm
    N.run("renderOptiesBlok()");
    let h = N.document.getElementById('optiesBlokBody').innerHTML;
    check('blok: knop voor alle 256 samenstellingen', /Alle 256 samenstellingen doorrekenen/.test(h) && /9 van de 256 doorgerekend/.test(h));
    check('blok: delen staan als heel onderdeel of hele hoofdgroep', /heel onderdeel/.test(h) && /hele hoofdgroep/.test(h) && /Buiten · Achtergevel/.test(h));
    check('blok licht: div-balans', balans(h) === 0, String(balans(h)));
    N.run("optKiesToggle('oC', true); optKiesToggle('oE', true);");
    h = N.document.getElementById('optiesBlokBody').innerHTML;
    const doelMasker = (1 << 2) | (1 << 4);
    check('blok: aangevinkte samenstelling is doorgerekend en toont het juiste totaal', /10 van de 256 doorgerekend/.test(h) && h.includes(N.run("eur(" + ber8.combi[doelMasker].incl + ")")), N.run("eur(" + ber8.combi[doelMasker].incl + ")"));
    N.run("optToonAlles()");
    h = N.document.getElementById('optiesBlokBody').innerHTML;
    check('blok volledig: 256 rijen en de rekentijd', /Alle 256 samenstellingen/.test(h) && /256 samenstellingen doorgerekend in \d/.test(h) && (h.match(/<tr class=/g) || []).length >= 256);
    check('blok volledig: div-balans', balans(h) === 0, String(balans(h)));
    N.run("_optKiesConcept = null;");
    // koppen in de calculatie
    const kopHg = N.run("renderHoofdgroep(__vind('hgG'))"), kopB = N.run("renderHoofdgroep(__vind('hgB'))");
    check('kop hoofdgroep-keuze: label, vast vinkje, terugknop, geen ◇', /OPTIE 5 · hele hoofdgroep · niet gekozen/.test(kopHg) && /class="hoofdgroep[^"]*is-inactief[^"]*is-keuze/.test(kopHg) && /disabled title="Dit deel is een keuze/.test(kopHg) && /optDeelLos\('hgG',null\)/.test(kopHg) && !/optDeelMaak\('hgG',null\)/.test(kopHg));
    check('kop gewone hoofdgroep: ◇ en vrij vinkje', /optDeelMaak\('hgB',null\)/.test(kopB) && /onchange="toggleHgActief\('hgB'\)"/.test(kopB));
    check('kop onderdeel-keuze binnen Buiten', /OPTIE 3 · heel onderdeel · niet gekozen/.test(kopB) && /optDeelLos\('hgB','odAG'\)/.test(kopB) && /optDeelMaak\('hgB','odVG'\)/.test(kopB));
    check('koppen: div-balans', balans(kopHg) === 0 && balans(kopB) === 0);
    // v4.128.1 — namen op het scherm: het woord "erbij" komt niet meer voor
    N.run("renderOptiesBlok()");
    const hb = N.document.getElementById('optiesBlokBody').innerHTML;
    const soorten = (hb.match(/font-size:0\.68rem; color:var\(--ink-soft\);">([^<]+)<\/span><\/td>/g) || []).map(x => x.replace(/^.*">/, '').replace(/<.*$/, ''));
    check('blok: soort per optie heet naar wat ze omvat', J(soorten) === J(['in plaats van', 'hele regel', 'heel onderdeel', 'heel onderdeel', 'hele hoofdgroep', 'heel onderdeel', 'heel onderdeel', 'hele regel']), J(soorten));
    const alleKoppen = N.run("data.calc.hoofdgroepen.map(hg => renderHoofdgroep(hg)).join('')");
    check('scherm: het woord "erbij" staat niet meer in het blok of in de koppen en regels', !/\berbij\b/i.test(hb.replace(/optienummer erbij/g, '')) && !/·\s*erbij\s*·/.test(alleKoppen) && !/>erbij</.test(alleKoppen), (hb.match(/.{30}\berbij\b.{20}/i) || [''])[0]);
    check('regel-label: "hele regel" en "in plaats van"', /OPTIE 8 · hele regel · niet gekozen/.test(alleKoppen) && /OPTIE 1 · in plaats van · niet gekozen/.test(alleKoppen));
    const V = vers(padNieuw, false);
    V.document.body.appendChild = function (d) { V.document.__modal = d; };
    Object.assign(V.document.getElementById('optMkOptie'), { options: [], selectedOptions: [] });   // de nagebootste pagina kent geen keuzelijsten
    try { V.run("optOpenMaak('hgB', 'odVG', 'r1')"); } catch (e) { /* het venster staat er al; optMaakSoort vraagt een echte keuzelijst en die heeft het harnas niet */ }
    const mh = (V.document.__modal && V.document.__modal.innerHTML) || '';
    check('venster optie maken: drie nieuwe namen', /<strong>Ander verfsysteem\.<\/strong>/.test(mh) && /<strong>Extra bewerking\.<\/strong>/.test(mh) && /<strong>Hele regel als optie\.<\/strong>/.test(mh) && !/Erbij:/.test(mh) && !/In plaats van:/.test(mh), mh.slice(0, 120));
    check('venster optie maken: de waarden achter de rondjes zijn ongewijzigd', /value="systeem"/.test(mh) && /value="kopie"/.test(mh) && /value="erbij"/.test(mh));
    check('_optSoortLabel', J([{ soort: 'vervang', regels: [{}] }, { soort: 'erbij', regels: [{ deel: null }] }, { soort: 'erbij', regels: [{ deel: 'od' }] }, { soort: 'erbij', regels: [{ deel: 'hg' }] }, { soort: 'erbij', regels: [{ deel: 'hg' }, { deel: null }] }, { soort: 'erbij', regels: [] }].map(o => N.run("_optSoortLabel(" + J(o) + ")"))) === J(['in plaats van', 'hele regel', 'heel onderdeel', 'hele hoofdgroep', 'hele delen en regels', 'hele regel']));
    // twee opties: tabel op papier blijft
    const T = vers(padNieuw, false);
    await T.run("__syncAlles()");
    await T.run("optDeelMaak('hgG', null)"); await T.run("__syncAlles()");
    await T.run("optDeelMaak('hgB', 'odAG')"); await T.run("__syncAlles()");
    const o2 = T.run("JSON.parse(JSON.stringify(_optVoorDocument(data.calc).opt))");
    check('twee delen als keuze: tabel met vier samenstellingen op papier', o2.n === 2 && o2.toonCombi === true && o2.combi.length === 4 && o2.combi[3].label === 'Basis + optie 1 en 2');
    check('twee delen als keuze: offerteblok toont de tabel', /Totaal per samenstelling/.test(T.run("_optDocHtml(_optVoorDocument(data.calc))")));
  }

  // ------------------------------------------------------------------
  console.log('9. Dupliceren en database-mapping');
  {
    const N = vers(padNieuw, 'delen');
    check('keuze-hoofdgroep schrijft optie_id en actief = false', N.run("(r => r.optie_id === 'oE' && r.actief === false)(_mapHgToDB(__vind('hgG'), 'x'))"));
    check('keuze-onderdeel schrijft optie_id en actief = false', N.run("(r => r.optie_id === 'oC' && r.actief === false)(_mapOdToDB(__vind('odAG'), 'x'))"));
    check('lezen uit de database: optie_id wordt optieId', N.run("_mapHgFromDB({ id: 'a', naam: 'x', actief: false, optie_id: 'oE' }, []).optieId === 'oE' && _mapOdFromDB({ id: 'b', naam: 'y', actief: false, optie_id: 'oC' }).optieId === 'oC' && _mapHgFromDB({ id: 'a', naam: 'x' }, []).optieId === null"));
    // de echte dupliceerfunctie tegen de nep-database
    N.run("__vind('hgG').actief = true;");   // een gekozen deel: in de kopie weer uit
    N.run("data.calc.offerteConfig.optiesKeuze = { op: 'x', gekozen: ['oE'] };");
    await N.run("_dupCalcUitvoeren('calc1', true, false, false)");
    await N.run("new Promise(r => setTimeout(r, 10))");
    const kopie = N.run("(k => k ? ({ naam: k.naam, hg: k.hoofdgroepen.map(h => [h.naam, h.actief, h.optieId || null]), od: [].concat.apply([], k.hoofdgroepen.map(h => h.onderdelen.map(o => [o.naam, o.actief, o.optieId || null]))), r: [].concat.apply([], k.hoofdgroepen.map(h => [].concat.apply([], h.onderdelen.map(o => o.regels.map(r => [r.naam + '/' + r.systeemNaam, r.actief, r.optieId || null]))))), keuze: (k.offerteConfig || {}).optiesKeuze || null, opties: ((k.offerteConfig || {}).opties || []).length }) : null)(data.calculaties.find(c => c.id !== 'calc1'))");
    check('kopie is gemaakt', !!kopie, J(N.meldingen.toast));
    if (kopie) {
      check('kopie: keuze-hoofdgroep blijft keuze en staat uit', J(kopie.hg) === J([['Buiten', true, null], ['Binnen', true, null], ['Garage buiten', false, 'oE']]), J(kopie.hg));
      check('kopie: keuze-onderdelen blijven keuze en staan uit', J(kopie.od.filter(o => o[2])) === J([['Achtergevel', false, 'oC'], ['Zijgevel', false, 'oG'], ['Dakkapel', false, 'oD'], ['Hal', false, 'oF']]), J(kopie.od));
      check('kopie: gewone onderdelen staan aan', kopie.od.filter(o => !o[2]).every(o => o[1] === true));
      check('kopie: de acht opties gaan mee, de vastgelegde keuze niet', kopie.opties === 8 && kopie.keuze === null);
      check('kopie: database-rijen van de delen', N.run("__db.tabellen.hoofdgroepen.filter(r => r.optie_id === 'oE').length === 2 && __db.tabellen.hoofdgroepen.filter(r => r.optie_id === 'oE').every(r => r.id === 'hgG' || r.actief === false) && __db.tabellen.onderdelen.filter(r => r.optie_id === 'oC' && r.actief === false).length === 2"));
    }
  }

  // ------------------------------------------------------------------
  console.log('10. Hele documenten: calculatieprint, offerte, Controleer, link, planbeurt');
  {
    // De voetregel van een afdruk noemt het versienummer; dat verschil hoort erbij en wordt weggestreept.
    const pa = L => L.document.getElementById('printArea').innerHTML.replace(/v4\.\d+\.\d+/g, 'vX');
    for (const variant of [false, 'regels']) {
      const O = vers(padOud, variant), N = vers(padNieuw, variant);
      await O.run("__syncAlles()"); await N.run("__syncAlles()");
      const naam = variant ? 'met regel-opties' : 'zonder opties';
      O.run("printCalc()"); N.run("printCalc()");
      check('calculatieprint ' + naam + ': gelijk aan v4.127.0', pa(O).length > 2000 && pa(O) === pa(N));
      const ho = O.run("_bouwOfferteDocHtml()"), hn = N.run("_bouwOfferteDocHtml()");
      check('offertedocument (scherm) ' + naam + ': gelijk aan v4.127.0', typeof hn === 'string' && hn.length > 2000 && ho === hn, (O.meldingen.alert.concat(N.meldingen.alert)).join(' | '));
      check('offertedocument (pdf) ' + naam + ': gelijk aan v4.127.0', J(O.run("_bouwOfferteDocDef()")) === J(N.run("_bouwOfferteDocDef()")) && J(N.run("_bouwOfferteDocDef()")).length > 2000);
      check('Controleer ' + naam + ': gelijk aan v4.127.0', J(O.run("_controleerVerzamel()")) === J(N.run("_controleerVerzamel()")) && N.run("_controleerVerzamel().length") > 0);
      const lk = "(x => { const k = JSON.parse(JSON.stringify(x)); if (k.opties) delete k.opties.ms; delete k.app; return JSON.stringify(k); })(_accordCijfersVoorLink(data.calc))";
      check('cijfers voor de accordeerlink ' + naam + ': gelijk aan v4.127.0', O.run(lk) === N.run(lk));
      O.run("printOfferteYoobi()"); N.run("printOfferteYoobi()");
      check('Yoobi-export ' + naam + ': gelijk aan v4.127.0', pa(O).length > 500 && pa(O) === pa(N));
    }
    const N = vers(padNieuw, 'delen');
    await N.run("__syncAlles()");
    N.run("printCalc()");
    const pc = pa(N);
    check('calculatieprint met delen: label "keuze voor de klant, niet gekozen"', (pc.match(/keuze voor de klant, niet gekozen/g) || []).length === 5 && !/\(vervalt\)/.test(pc), String((pc.match(/keuze voor de klant, niet gekozen/g) || []).length));
    check('calculatieprint met delen: geen blok vervallen', !/Verschil \(vervalt\)/.test(pc));
    check('calculatieprint met delen: div-balans gelijk aan die zonder opties', balans(pc) === (() => { const K = vers(padNieuw, false); K.run("printCalc()"); return balans(pa(K)); })());
    const hd = N.run("_bouwOfferteDocHtml()");
    check('offertedocument met acht keuzes wordt gemaakt', typeof hd === 'string' && /Optie 8: Boeidelen voorgevel/.test(hd) && /Optie 3: Achtergevel/.test(hd), N.meldingen.alert.join(' | '));
    check('offertedocument: niet-gekozen delen staan niet in het kostenoverzicht', !/<td[^>]*>[^<]*Garagedeur/.test(hd.split('<h3>Opties</h3>')[0]) && !/Dakkapel/.test(hd.split('<h3>Opties</h3>')[0]));
    const dd = J(N.run("_bouwOfferteDocDef()"));
    check('offerte-pdf met acht keuzes wordt gemaakt', dd.length > 2000 && /Optie 8: Boeidelen voorgevel/.test(dd));
    const ctl = N.run("_controleerVerzamel()");
    check('Controleer met acht keuzes: geen blokkade over opties', Array.isArray(ctl) && !ctl.some(x => x.n === 0 && /^Opties/.test(x.t)), J(ctl.filter(x => /^Opties/.test(x.t))));
    const lk = N.run("_accordCijfersVoorLink(data.calc)");
    check('cijfers voor de link: basisbedrag en 256 samenstellingen', cent(lk.totaalIncl, ber8.combi[0].incl) && lk.opties.combi.length === 256 && /^v4\.\d+\.\d+$/.test(lk.app), lk.app);
    N.run("printOfferteYoobi()");
    check('Yoobi-export met delen: alleen de basis', !/Garagedeur|Dakkapel|Achtergevel|Zijgevel/.test(pa(N)) && /Voorgevel/.test(pa(N)));
    // planbeurt: per regel en per stap, naast dezelfde calculatie zonder de niet-gekozen delen
    const Z = vers(padNieuw, 'delen');
    Z.run("data.calc.hoofdgroepen = data.calc.hoofdgroepen.filter(h => !h.optieId); data.calc.hoofdgroepen.forEach(h => { h.onderdelen = h.onderdelen.filter(o => !o.optieId); h.onderdelen.forEach(o => { o.regels = o.regels.filter(r => !r.optieId); }); }); data.calc.meetstaat = data.calc.meetstaat.filter(m => !!__vind(m.calcRegelId)); data.calc.offerteConfig.opties = [];");
    await Z.run("__syncAlles()");
    const beurten = [{ modus: 'algemeen', scaling: { pct: 60 } }, { modus: 'per_regel', scaling: { regels: { r1: 50, r9: 0 } } }, { modus: 'per_stap', scaling: { stappen: { r1_s3: 40, r8_s1: 0 } } }];
    for (const b of beurten) {
      const code = "(() => { _ohpState.calcId = 'calc1'; _ohpState.plan = { id: 'p1', calculatieId: 'calc1' }; try { return [_ohpBeurtBasisBedrag(" + J(b) + ", false), _ohpLastBeurtUren]; } catch (e) { return 'FOUT ' + e.message; } })()";
      const rn = N.run(code), rz = Z.run(code);
      check('planbeurt ' + b.modus + ': gelijk aan dezelfde calculatie zonder de niet-gekozen delen', Array.isArray(rn) && rn[0] > 0 && J(rn) === J(rz), J(rn) + ' / ' + J(rz));
    }
  }

  console.log('\n' + (goed + mis) + ' controles: ' + goed + ' goed, ' + mis + ' mis');
  if (mis) { console.log(misLijst.map(x => ' - ' + x).join('\n')); process.exit(1); }
})().catch(e => { console.error('TEST GESTOPT MET EEN FOUT:', e); process.exit(2); });
