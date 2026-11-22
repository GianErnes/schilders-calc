// test_posten_v4.129.0.js — hoort bij index.html v4.129.0 (vaste posten bij een optie).
// Gebruik: node test_posten_v4.129.0.js <index.html v4.127.0> <index.html v4.129.0>
// Nodig: acorn (npm install acorn), en test_keuzes_laad.js en test_keuzes_fixture.js in dezelfde map.
// De referentie is v4.127.0: daar bestaan geen delen als keuze en geen posten bij een optie,
// dus elke stand wordt daar met de hand gezet (vinkjes en gewone staartposten).
const { laad } = require('./test_keuzes_laad.js');
const FIX = require('./test_keuzes_fixture.js');
const padOud = process.argv[2], padNieuw = process.argv[3];
if (!padOud || !padNieuw) { console.log('Gebruik: node test_posten_v4.129.0.js <index.html v4.127.0> <index.html v4.129.0>'); process.exit(2); }
let goed = 0, mis = 0; const misLijst = [];
function check(naam, v, detail) { if (v) goed++; else { mis++; misLijst.push(naam + (detail ? ' :: ' + detail : '')); console.log('  MIS  ' + naam + (detail ? ' :: ' + detail : '')); } }
const J = x => JSON.stringify(x);
const cent = (a, b) => Math.abs((a || 0) - (b || 0)) < 0.005;
const balans = h => (h.match(/<div\b/g) || []).length - (h.match(/<\/div>/g) || []).length;
const wacht = L => L.run("new Promise(r => setTimeout(r, 20))");
const ORDE = ['oA', 'oB', 'oC', 'oD', 'oE', 'oF', 'oG', 'oH'];
const HAND = { oA: m => [['r8b', m], ['r8', !m]], oB: m => [['r13', m]], oC: m => [['odAG', m]], oD: m => [['odDK', m]], oE: m => [['hgG', m]], oF: m => [['odHL', m]], oG: m => [['odZG', m]], oH: m => [['r2', m]] };
// De posten bij de opties, en dezelfde posten als gewone staartpost voor de referentie.
const POSTEN = {
  oC: [{ naam: 'Steiger achtergevel', type: 'vast', bedrag: 850, btwPct: 21, kostensoort: 'materieel' }, { naam: 'Hoogwerker achtergevel', type: 'eenheid', bedrag: 175, hoeveelheid: 2, eenheid: 'dag', kostensoort: 'materieel' }],
  oE: [{ naam: 'Container garage', type: 'vast', bedrag: 60 }],
  oA: [{ naam: 'Extra afplakmateriaal', type: 'eenheid', bedrag: 12.5, hoeveelheid: 3, eenheid: 'stuk' }]
};
const alsStaart = (q, i) => "__post('hand" + i + "', " + J(q.naam) + ", " + J(q.type) + ", " + q.bedrag + ", " + J({ hoeveelheid: q.hoeveelheid || 0, eenheid: q.eenheid || '', btwPct: q.btwPct == null ? null : q.btwPct, kostensoort: q.kostensoort || null }) + ")";
function vers(pad, variant) {
  const L = laad(pad); L.run(FIX);
  L.run("__zetKlaar(__maakCalc(" + J(variant) + ")); data.calc.btwPctOverride = 9;");   // schilderwerk 9%, de steiger van derden 21%
  return L;
}

(async () => {
  console.log('oud:   ' + padOud + '\nnieuw: ' + padNieuw + '\n');
  const N = vers(padNieuw, 'delen');
  await N.run("__syncAlles()");
  const voor = N.run("(b => ({ basis: [b.basis.excl, b.basis.incl], meer: b.opties.map(o => o.meerExcl) }))(_optBereken(data.calc))");
  const staartVoor = N.run("JSON.stringify(data.calc.staart)");

  console.log('1. Wat mag een post bij een optie zijn');
  {
    const c = v => N.run("_optPostControle(" + J(v) + ")");
    check('vast bedrag wordt aangenomen', J(c({ naam: ' Steiger ', type: 'vast', bedrag: '850' }).post) === J({ naam: 'Steiger', type: 'vast', bedrag: 850 }));
    check('aantal × prijs wordt aangenomen', J(c({ naam: 'Hoogwerker', type: 'eenheid', bedrag: 175, hoeveelheid: '2', eenheid: 'dag', btwPct: '', kostensoort: 'materieel' }).post) === J({ naam: 'Hoogwerker', type: 'eenheid', bedrag: 175, hoeveelheid: 2, eenheid: 'dag', kostensoort: 'materieel' }));
    check('eigen BTW-tarief gaat mee', c({ naam: 'Steiger', type: 'vast', bedrag: 850, btwPct: '21' }).post.btwPct === 21);
    for (const t of ['dag', 'week', 'percent', '', undefined]) check('soort ' + J(t) + ' wordt geweigerd', !!c({ naam: 'x', type: t, bedrag: 10 }).fout);
    check('zonder naam geweigerd', !!c({ naam: '  ', type: 'vast', bedrag: 10 }).fout);
    check('bedrag nul geweigerd', !!c({ naam: 'x', type: 'vast', bedrag: 0 }).fout && !!c({ naam: 'x', type: 'vast', bedrag: 'abc' }).fout);
    check('aantal nul geweigerd', !!c({ naam: 'x', type: 'eenheid', bedrag: 10, hoeveelheid: 0 }).fout);
    check('naam van een automatische post geweigerd', !!c({ naam: 'Afdekvilt extra', type: 'vast', bedrag: 10 }).fout && !!c({ naam: 'kleinschaligheid', type: 'vast', bedrag: 10 }).fout);
    check('template per dag wordt aantal × prijs met eenheid dag', J(N.run("_optPostUitTemplate({ naam: 'Hoogwerker', type: 'dag', bedrag: 175, kostensoort: 'materieel' })")) === J({ naam: 'Hoogwerker', type: 'eenheid', bedrag: 175, hoeveelheid: 1, eenheid: 'dag', btwPct: null, kostensoort: 'materieel' }));
    check('template per week wordt aantal × prijs met eenheid week', N.run("_optPostUitTemplate({ naam: 'Container', type: 'week', bedrag: 60 }).eenheid") === 'week');
    N.run("data.staartLib.push({ id: 'libP', naam: 'Toeslag', type: 'percent', bedrag: 5 }, { id: 'libD', naam: 'Hoogwerker', type: 'dag', bedrag: 175 });");
    check('percentage staat niet in de keuzelijst, per dag wel, afdekvilt en kleinschaligheid niet', J(N.run("_optPostTemplates().map(t => t.naam)")) === J(['Hoogwerker']), J(N.run("_optPostTemplates().map(t => t.naam)")));
    check('gewone staartpost schrijft geen optie_id', !('optie_id' in N.run("_mapStaartCalcToDB(data.calc.staart[0], 'x', 0)")));
    check('post van een optie schrijft optie_id en optie_post', J(N.run("(r => [r.optie_id, r.optie_post])(_mapStaartCalcToDB(_optPostAlsStaart('oC', { id: 'p1', naam: 'S', type: 'vast', bedrag: 5 }), 'x', 0))")) === J(['oC', 'p1']));
  }

  console.log('2. Posten toevoegen: de basis verandert niet, de meerprijs wel');
  {
    for (const id of Object.keys(POSTEN)) for (const q of POSTEN[id]) { const ok = await N.run("optPostZet(" + J(id) + ", null, " + J(q) + ")"); check('post "' + q.naam + '" toegevoegd bij ' + id, ok === true, J(N.meldingen.toast.slice(-1))); await wacht(N); }
    await N.run("__syncAlles()");
    check('posten staan bij de optie in geheugen en database', J(N.run("data.calc.offerteConfig.opties.map(o => (o.posten || []).length)")) === J([1, 0, 2, 0, 1, 0, 0, 0]) && J(N.run("__db.tabellen.calculaties[0].offerte_config.opties.map(o => (o.posten || []).length)")) === J([1, 0, 2, 0, 1, 0, 0, 0]));
    check('de staart is ongewijzigd', N.run("JSON.stringify(data.calc.staart)") === staartVoor);
    check('geen staartrij met optie_id in de database', N.run("__db.tabellen.staart.filter(r => r.optie_id).length") === 0);
    const na = N.run("(b => ({ basis: [b.basis.excl, b.basis.incl], meer: b.opties.map(o => o.meerExcl), fouten: b.fouten, waarsch: b.waarsch }))(_optBereken(data.calc))");
    check('basis op de cent gelijk aan vóór de posten', J(na.basis) === J(voor.basis), J(na.basis) + ' / ' + J(voor.basis));
    check('meerprijs alleen hoger bij de opties met een post', na.meer.every((m, i) => [0, 2, 4].includes(i) ? m > voor.meer[i] + 30 : cent(m, voor.meer[i])), J(na.meer) + ' / ' + J(voor.meer));
    check('geen fouten of waarschuwingen', na.fouten.length === 0 && na.waarsch.length === 0, J(na.fouten.concat(na.waarsch)));
    N.document.getElementById('printArea').innerHTML = ''; N.run("printOfferteYoobi()");
    check('Yoobi-export van de basis noemt de posten niet', !/Steiger achtergevel|Hoogwerker achtergevel|Container garage|afplakmateriaal/.test(N.document.getElementById('printArea').innerHTML));
    check('werkbon van de basis noemt de posten niet', !/Steiger achtergevel|Container garage/.test(N.run("_werkbonHtml(data.calc)")));
    check('cijfers voor de accordeerlink: staart van de basis zonder de posten', !/Steiger achtergevel|Container garage|Hoogwerker achtergevel/.test(N.run("_accordCijfersVoorLink(data.calc).staart.map(p => p.naam).join('|')")));
    const doc = N.run("_bouwOfferteDocHtml()");
    check('offertedocument: posten staan nergens apart', typeof doc === 'string' && !/Steiger achtergevel|Extra afplakmateriaal/.test(doc) && /Optie 3: Achtergevel/.test(doc), N.meldingen.alert.join(' | '));
    N.run("renderOptiesBlok()");
    const hb = N.document.getElementById('optiesBlokBody').innerHTML;
    check('blok toont de posten met knoppen', /Posten bij deze optie/.test(hb) && /Steiger achtergevel/.test(hb) && /BTW 21%/.test(hb) && /2 dag × /.test(hb) && (hb.match(/optPostOpen\('o[A-H]',null\)/g) || []).length === 8 && /optPostWeg\('oC'/.test(hb));
    check('blok: div-balans', balans(hb) === 0, String(balans(hb)));
  }

  console.log('3. Alle 256 samenstellingen naast "met de hand" in v4.127.0, met gewone staartposten');
  let tabel = null;
  {
    tabel = N.run("(b => b.combi.map(x => ({ m: x.masker, ok: x.ok, excl: x.excl, btw: x.btw, incl: x.incl, dagen: x.dagen })))(_optBereken(data.calc, { volledig: true }))");
    check('256 rijen, alle te berekenen', tabel.length === 256 && tabel.every(x => x.ok));
    check('rekenen laat de staart ongemoeid', N.run("JSON.stringify(data.calc.staart)") === staartVoor);
    let afw = 0, eerste = '';
    for (let m = 0; m < 256; m++) {
      const O = vers(padOud, 'regels');
      const zet = []; const posten = [];
      ORDE.forEach((id, i) => { const aan = !!(m & (1 << i)); HAND[id](aan).forEach(z => zet.push(z)); if (aan && POSTEN[id]) POSTEN[id].forEach(q => posten.push(q)); });
      O.run(zet.map(z => "__vind(" + J(z[0]) + ").actief = " + z[1] + ";").join(' '));
      if (posten.length) O.run("data.calc.staart.push(" + posten.map(alsStaart).join(', ') + ");");
      await O.run("__syncAlles()");
      const ref = O.run("(() => { const cij = _berekenOfferteCijfers(data.calc); return { excl: _r2(cij.exBtwFinal), btw: _r2(cij.btwBedrag), incl: _r2(cij.totaalIncl), dagen: cij.dagenFactureerbaar }; })()");
      const rij = tabel[m];
      if (!(cent(ref.excl, rij.excl) && cent(ref.btw, rij.btw) && cent(ref.incl, rij.incl) && ref.dagen === rij.dagen)) { afw++; if (!eerste) eerste = 'masker ' + m + ' ref ' + J(ref) + ' app ' + J(rij); }
    }
    check('alle 256 samenstellingen op de cent gelijk (excl., BTW en incl.) aan "met de hand" in v4.127.0', afw === 0, afw + ' afwijkend; ' + eerste);
    console.log('     basis ' + tabel[0].incl + ' incl., alleen achtergevel ' + tabel[4].incl + ', alles ' + tabel[255].incl);
  }

  console.log('4. Keuze vastleggen: de posten worden echte staartposten');
  let idsEcht = null;
  {
    const masker = (1 << 2) | (1 << 4);   // achtergevel en garage
    N.run("_optKiesConcept = { calcId: data.calc.id, ids: new Set(['oC', 'oE']) }; __db.log.length = 0;");
    await N.run("optLegVast(false)"); await wacht(N);
    const tot = N.run("__totaal()");
    check('totaal na vastleggen = voorspelde samenstelling', cent(tot.incl, tabel[masker].incl) && cent(tot.excl, tabel[masker].excl), J(tot) + ' / ' + J(tabel[masker]));
    check('geen waarschuwing', N.meldingen.alert.length === 0, N.meldingen.alert.join(' | '));
    const echt = N.run("data.calc.staart.filter(p => p.optieId).map(p => [p.naam, p.type, p.bedrag, p.hoeveelheid, p.btwPct, p.kostensoort, p.optieId, !!p.optiePost, !!p.id, p.verstopInEenheidsprijs, p.teltInWerkdagen])");
    check('drie echte posten met de juiste waarden', J(echt) === J([['Steiger achtergevel', 'vast', 850, 0, 21, 'materieel', 'oC', true, true, false, false], ['Hoogwerker achtergevel', 'eenheid', 175, 2, null, 'materieel', 'oC', true, true, false, false], ['Container garage', 'vast', 60, 0, null, null, 'oE', true, true, false, false]]), J(echt));
    check('database: drie rijen met optie_id en optie_post', J(N.run("__db.tabellen.staart.filter(r => r.optie_id).map(r => [r.naam, r.optie_id, !!r.optie_post, r.btw_pct]).sort()")) === J([['Container garage', 'oE', true, null], ['Hoogwerker achtergevel', 'oC', true, null], ['Steiger achtergevel', 'oC', true, 21]]));
    check('optie_post verwijst naar de post bij de optie', N.run("data.calc.staart.filter(p => p.optieId).every(p => (data.calc.offerteConfig.opties.find(o => o.id === p.optieId).posten || []).some(q => q.id === p.optiePost))"));
    const sn = N.run("JSON.stringify(data.calc.staart.map(p => [p.naam, p.bedrag, p.hoeveelheid]).sort())");
    await N.run("__syncAlles()");
    check('de echte bijwerkroutines veranderen daarna niets', sn === N.run("JSON.stringify(data.calc.staart.map(p => [p.naam, p.bedrag, p.hoeveelheid]).sort())") && cent(N.run("__totaal().incl"), tabel[masker].incl));
    const b2 = N.run("(b => ({ fouten: b.fouten, waarsch: b.waarsch, zwerf: b.zwerfPosten, huidig: b.huidig, combi: b.combi.map(x => [x.masker, x.excl, x.btw, x.incl, x.dagen]) }))(_optBereken(data.calc, { volledig: true }))");
    check('na vastleggen: geen fouten, stand is de gekozen samenstelling', b2.fouten.length === 0 && b2.zwerf === 0 && b2.huidig === masker, J(b2.fouten));
    check('na vastleggen: de hele tabel van 256 is nog dezelfde (basis zonder de posten)', b2.combi.every((x, i) => cent(x[1], tabel[i].excl) && cent(x[2], tabel[i].btw) && cent(x[3], tabel[i].incl) && x[4] === tabel[i].dagen));
    const opt = N.run("JSON.parse(JSON.stringify(_optVoorDocument(data.calc, _berekenOfferteCijfers(data.calc)).opt))");
    check('document: basis zonder posten, totaal van de keuze met posten', cent(opt.basis.incl, tabel[0].incl) && cent(opt.nu.incl, tabel[masker].incl) && opt.gekozen === true && opt.nu.btwGemengd === true, J([opt.basis, opt.nu.incl, opt.nu.btwGemengd]));
    N.run("renderStaartList()");
    const sl = N.document.getElementById('staartList').innerHTML;
    idsEcht = N.run("data.calc.staart.filter(p => p.optieId).map(p => p.id)");
    check('staartlijst: label van de optie en geen knoppen op die posten', /optie: Achtergevel/.test(sl) && /optie: Garage/.test(sl) && (sl.match(/>bij de optie<\/span>/g) || []).length === 3 && idsEcht.every(id => !sl.includes("editStaart('" + id + "')") && !sl.includes("delStaart('" + id + "')")) && /editStaart\('st1'\)/.test(sl));
    N.meldingen.toast.length = 0;
    N.run("editStaart(" + J(idsEcht[0]) + ")"); await N.run("delStaart(" + J(idsEcht[0]) + ")");
    check('wijzigen of weghalen in de staartlijst wordt geweigerd', N.run("data.calc.staart.some(p => p.id === " + J(idsEcht[0]) + ")") && N.run("staartCtx.id") !== idsEcht[0]);
    check('posten wijzigen bij de optie kan niet zolang de keuze vastligt', (await N.run("optPostZet('oC', null, { naam: 'Nog iets', type: 'vast', bedrag: 5 })")) === false && (await N.run("optPostWeg('oE', data.calc.offerteConfig.opties.find(o => o.id === 'oE').posten[0].id)")) === false);
    N.document.getElementById('printArea').innerHTML = ''; N.run("printOfferteYoobi()");
    check('Yoobi-export van de gekozen uitvoering noemt de steiger', /Steiger achtergevel/.test(N.document.getElementById('printArea').innerHTML));
    N.run("renderOptiesBlok()");
    check('blok bij een vastgelegde keuze: geen knoppen op de posten', !/optPostOpen\(/.test(N.document.getElementById('optiesBlokBody').innerHTML) && /Steiger achtergevel/.test(N.document.getElementById('optiesBlokBody').innerHTML));
  }

  console.log('5. Dupliceren, andere keuze, wissen');
  {
    const nStaart = N.run("data.calc.staart.filter(p => !p.optieId).length");
    await N.run("_dupCalcUitvoeren('calc1', true, false, false)"); await wacht(N);
    const k = N.run("(k => k ? ({ staart: k.staart.length, metOptie: k.staart.filter(p => p.optieId).length, posten: (k.offerteConfig.opties || []).map(o => (o.posten || []).length), keuze: k.offerteConfig.optiesKeuze || null }) : null)(data.calculaties.find(c => c.id !== 'calc1'))");
    check('kopie: de echte posten van de keuze gaan niet mee, de posten bij de optie wel', !!k && k.staart === nStaart && k.metOptie === 0 && J(k.posten) === J([1, 0, 2, 0, 1, 0, 0, 0]) && k.keuze === null, J(k));
    N.run("data.calculaties = data.calculaties.filter(c => c.id === 'calc1'); data.activeCalcId = 'calc1';");
    // andere keuze: alleen de achtergevel
    N.run("_optKiesConcept = { calcId: data.calc.id, ids: new Set(['oC']) };");
    await N.run("optLegVast(false)"); await wacht(N);
    check('andere keuze: totaal = voorspeld', cent(N.run("__totaal().incl"), tabel[4].incl), N.run("__totaal().incl") + ' / ' + tabel[4].incl);
    check('andere keuze: container weg, steiger en hoogwerker houden hun rij', J(N.run("data.calc.staart.filter(p => p.optieId).map(p => p.id)")) === J(idsEcht.slice(0, 2)) && N.run("__db.tabellen.staart.filter(r => r.optie_id).length") === 2);
    check('geen waarschuwing', N.meldingen.alert.length === 0, N.meldingen.alert.join(' | '));
    await N.run("optLegVast(true)"); await wacht(N);
    check('wissen: totaal terug op de basis', cent(N.run("__totaal().incl"), tabel[0].incl), N.run("__totaal().incl") + ' / ' + tabel[0].incl);
    check('wissen: geen echte posten meer, in geheugen en database', N.run("data.calc.staart.filter(p => p.optieId).length") === 0 && N.run("__db.tabellen.staart.filter(r => r.optie_id).length") === 0);
    check('wissen: de staart is weer als aan het begin', N.run("JSON.stringify(data.calc.staart.map(p => [p.naam, p.bedrag, p.hoeveelheid]).sort())") === JSON.stringify(JSON.parse(staartVoor).map(p => [p.naam, p.bedrag, p.hoeveelheid]).sort()));
    check('wissen: de posten staan nog bij de opties', J(N.run("data.calc.offerteConfig.opties.map(o => (o.posten || []).length)")) === J([1, 0, 2, 0, 1, 0, 0, 0]));
  }

  console.log('6. Post wijzigen en weghalen, optie opheffen, zwerfpost');
  {
    const pid = N.run("data.calc.offerteConfig.opties.find(o => o.id === 'oE').posten[0].id");
    check('post wijzigen', (await N.run("optPostZet('oE', " + J(pid) + ", { naam: 'Container groot', type: 'vast', bedrag: 95 })")) === true && J(N.run("data.calc.offerteConfig.opties.find(o => o.id === 'oE').posten")) === J([{ id: pid, naam: 'Container groot', type: 'vast', bedrag: 95 }]));
    await wacht(N);
    const m5 = N.run("_optBereken(data.calc).opties[4].meerExcl");
    check('meerprijs volgt de gewijzigde post', m5 > 0 && !cent(m5, tabel[16].excl - tabel[0].excl));
    check('post weghalen', (await N.run("optPostWeg('oE', " + J(pid) + ")")) === true && N.run("(data.calc.offerteConfig.opties.find(o => o.id === 'oE').posten || []).length") === 0);
    await wacht(N);
    check('zonder post is de meerprijs van de garage weer als vóór de posten', cent(N.run("_optBereken(data.calc).opties[4].meerExcl"), voor.meer[4]));
    check('maximum aantal posten per optie', N.run("OPT_POST_MAX") === 6);
    N.run("optPostOpen('oC', null)");
    // optie opheffen neemt de posten mee
    await N.run("optOpheffen('oA')"); await wacht(N);
    check('optie opheffen: optie en haar post zijn weg', !N.run("_optCfgLijst(data.calc).some(o => o.id === 'oA')") && N.run("data.calc.staart.filter(p => p.optieId).length") === 0);
    check('bevestiging bij opheffen noemt de post', N.meldingen.confirm.some(t => /post bij deze optie gaat ook weg/.test(t)), J(N.meldingen.confirm.slice(-2)));
    // zwerfpost: een echte post van een optie die niet aan staat
    N.run("data.calc.staart.push(Object.assign(_optPostAlsStaart('oC', { id: 'zwerf', naam: 'Losse steiger', type: 'vast', bedrag: 500 }), { id: 'zw1', __optSim: false })); __db.tabellen.staart.push({ id: 'zw1', calculatie_id: 'calc1', naam: 'Losse steiger', optie_id: 'oC', optie_post: 'zwerf' });");
    const bz = N.run("(b => ({ zwerf: b.zwerfPosten, fouten: b.fouten, basis: b.basis.incl }))(_optBereken(data.calc))");
    check('zwerfpost wordt gemeld en houdt het document tegen', bz.zwerf === 1 && bz.fouten.some(t => /Losse steiger/.test(t) && /Keuze wissen/.test(t)), J(bz.fouten));
    N.run("renderOptiesBlok()");
    check('blok biedt Keuze wissen aan', /optLegVast\(true\)/.test(N.document.getElementById('optiesBlokBody').innerHTML));
    await N.run("optLegVast(true)"); await wacht(N);
    check('Keuze wissen ruimt de zwerfpost op', N.run("data.calc.staart.filter(p => p.optieId).length") === 0 && N.run("__db.tabellen.staart.filter(r => r.optie_id).length") === 0 && N.run("_optBereken(data.calc).fouten.length") === 0);
    // post van een optie die niet meer bestaat: in de staartlijst gewoon te bewerken
    N.run("data.calc.staart.push(Object.assign(_optPostAlsStaart('weg', { id: 'x', naam: 'Oude post', type: 'vast', bedrag: 10 }), { id: 'zw2', __optSim: false })); renderStaartList();");
    const sl = N.document.getElementById('staartList').innerHTML;
    check('post van een verdwenen optie: label "optie onbekend" en gewone knoppen', /optie onbekend/.test(sl) && /delStaart\('zw2'\)/.test(sl));
  }

  console.log('\n' + (goed + mis) + ' controles: ' + goed + ' goed, ' + mis + ' mis');
  if (mis) { console.log(misLijst.map(x => ' - ' + x).join('\n')); process.exit(1); }
})().catch(e => { console.error('TEST GESTOPT MET EEN FOUT:', e); process.exit(2); });
