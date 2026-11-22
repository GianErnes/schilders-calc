// Testgegevens en nep-database. Deze broncode wordt in de vm-context van zowel de oude
// als de nieuwe index.html gedraaid, zodat beide exact dezelfde calculatie krijgen.
module.exports = String.raw`
var __KOZ  = [['Ontvetten',1.5],['Schuren',2.4,'Schuurpapier',0.4,0.03],['Gronden',4.2,'Primer',22.5,0.007],['Aflakken',6.0,'Aflak',28,0.008]];
var __WAND = [['Afplakken',1.8],['Sauzen',2.7,'Muurverf',9.5,0.15],['Sauzen',2.7,'Muurverf',9.5,0.15]];
var __STUC = [['Afplakken',1.8],['Voorstrijken',2.1,'Voorstrijk',7.8,0.11],['Sauzen',2.7,'Muurverf',9.5,0.15],['Sauzen',2.7,'Muurverf',9.5,0.15]];
var __PLAF = [['Afplakken',2.2],['Sauzen',3.3,'Muurverf',9.5,0.16],['Sauzen',3.3,'Muurverf',9.5,0.16]];
var __DEUR = [['Ontvetten',1.5],['Schuren',3.0,'Schuurpapier',0.4,0.05],['Gronden',3.6,'Primer',22.5,0.08,60],['Aflakken',4.8,'Aflak',32.5,0.08]];
function __stappen(pre, defs) {
  return defs.map(function (d, i) { return { id: pre + '_s' + i, bewerkingId: null, bewerkingNaam: d[0], bewerkingEenheid: 'm²', minuten: d[1],
    percentage: d[5] == null ? 100 : d[5], materiaalId: null, materiaalNaam: d[2] || null, materiaalEenheid: 'L', materiaalPrijs: d[3] || 0,
    materiaalGroep: d[2] ? 'Dekverf watergedragen' : null, verbruik: d[4] || 0, volgorde: i }; });
}
function __regel(id, naam, hv, sys, eenheid, loc, defs, extra) {
  return Object.assign({ id: id, naam: naam, hoeveelheid: hv, toeslag: 0, systeemId: 'sys_' + sys, systeemNaam: sys, systeemEenheid: eenheid,
    systeemOndergrond: 'Hout', systeemOndergrondId: 'o3', systeemLocatie: loc, volgorde: 0, actief: true, optieId: null, alternatiefVoor: null,
    stappen: __stappen(id, defs) }, extra || {});
}
function __od(id, naam, regels) { regels.forEach(function (r, i) { r.volgorde = i * 10; }); return { id: id, naam: naam, collapsed: false, volgorde: 0, actief: true, optieId: null, regels: regels }; }
function __hg(id, naam, ods) { ods.forEach(function (o, i) { o.volgorde = i * 10; }); return { id: id, naam: naam, collapsed: false, volgorde: 0, actief: true, optieId: null, onderdelen: ods }; }
function __tek(mark, deur) { return { vorm: 'rechthoek', maten: { h: 200, b: 100 }, markeringen: mark.map(function (t, i) { return { type: t, x: 0.1 * (i + 1), y: 0.2, nr: i + 1 }; }), deurOnderkanten: deur || 0, omtrekM1: 6 }; }
function __ms(id, regel, oms, h, b, aantal, tek) { return { id: id, calcRegelId: regel, omschrijving: oms, hCm: h, bCm: b, aantal: aantal, factor: 1, opmerking: '', tekening: tek || null, volgorde: 0, bron: '', bronMeetstaatId: null, actief: true }; }
function __post(id, naam, type, bedrag, extra) { return Object.assign({ id: id, naam: naam, type: type, bedrag: bedrag, eenheid: '', grondslag: '', hoeveelheid: 0, verstopInEenheidsprijs: false, teltInWerkdagen: false, gebrekType: null, btwPct: null, kostensoort: null, volgorde: 0 }, extra || {}); }

// metOpties: false = kale calculatie · 'regels' = alleen regel-opties (zoals v4.125.0) · 'delen' = ook delen als keuze (v4.128.0)
function __maakCalc(metOpties) {
  var c = { id: 'calc1', naam: 'Testhuis', klant: 'Fam. Test', reis: 22, schilders: 2, uurDag: 7.5, volleDagenOverride: null, status: 'concept',
    postcode: '', huisnummer: '', notities: '', todos: [], fotos: [], documenten: [], aanvragen: [], offerteConfig: {}, settingsSnapshot: null,
    afdekviltUit: false, kleinschaligUit: false, __loaded: true,
    hoofdgroepen: [
      __hg('hgB', 'Buiten', [
        __od('odVG', 'Voorgevel', [__regel('r1', 'Kozijnen', 46.1, 'Kozijn buiten', 'm¹', 'buiten', __KOZ), __regel('r2', 'Boeidelen', 14, 'Boeideel buiten', 'm²', 'buiten', __DEUR)]),
        __od('odAG', 'Achtergevel', [__regel('r3', 'Kozijnen', 34, 'Kozijn buiten', 'm¹', 'buiten', __KOZ), __regel('r4', 'Achterdeur', 6, 'Deur buiten', 'm²', 'buiten', __DEUR, { toeslag: 15 })]),
        __od('odZG', 'Zijgevel', [__regel('r5', 'Kozijnen', 21, 'Kozijn buiten', 'm¹', 'buiten', __KOZ)]),
        __od('odDK', 'Dakkapel', [__regel('r6', 'Kozijnen', 6, 'Kozijn buiten', 'm¹', 'buiten', __KOZ), __regel('r7', 'Boeidelen', 5, 'Boeideel buiten', 'm²', 'buiten', __DEUR)])
      ]),
      __hg('hgI', 'Binnen', [
        __od('odWK', 'Woonkamer', [__regel('r8', 'Wanden', 62, 'Wand overschilderen', 'm²', 'binnen', __WAND), __regel('r9', 'Plafond', 28, 'Plafond sauzen', 'm²', 'binnen', __PLAF)]),
        __od('odHL', 'Hal', [__regel('r10', 'Wanden', 31, 'Wand overschilderen', 'm²', 'binnen', __WAND), __regel('r11', 'Plafond', 9, 'Plafond sauzen', 'm²', 'binnen', __PLAF)]),
        __od('odSK', 'Slaapkamer', [__regel('r12', 'Wanden', 40, 'Wand overschilderen', 'm²', 'binnen', __WAND), __regel('r13', 'Plafond', 14, 'Plafond sauzen', 'm²', 'binnen', __PLAF)])
      ]),
      __hg('hgG', 'Garage buiten', [__od('odGD', 'Garagedeur', [__regel('r14', 'Garagedeur', 11, 'Deur buiten', 'm²', 'buiten', __DEUR)])])
    ],
    staart: [
      __post('st1', 'Klimtoeslag', 'percent', 5, { grondslag: 'arbeid_buiten' }),
      __post('st2', 'Kleinschaligheidstoeslag', 'percent', 0, { grondslag: 'arbeid', verstopInEenheidsprijs: true, teltInWerkdagen: true, gebrekType: 'kleinschalig' }),
      __post('st3', 'Hoogwerker', 'dag', 175, { kostensoort: 'materieel' }),
      __post('st4', 'Opstartkosten', 'vast', 120, { verstopInEenheidsprijs: true }),
      __post('st5', 'Container', 'week', 60)
    ],
    meetstaat: [
      __ms('ms1', 'r1', 'Voordeur', 210, 95, 1, __tek(['houtrot'], 1)),
      __ms('ms2', 'r1', 'Kozijn voor', 180, 220, 5, __tek([], 0)),
      __ms('ms3', 'r3', 'Kozijn achter', 200, 150, 4, __tek(['houtrot', 'houtrot', 'kit'], 0)),
      __ms('ms4', 'r3', 'Achterdeur', 210, 90, 1, __tek(['scheur'], 1)),
      __ms('ms5', 'r6', 'Dakkapelkozijn', 120, 180, 1, __tek(['houtrot', 'losseverf'], 0))
    ] };
  c.hoofdgroepen.forEach(function (h, i) { h.volgorde = i * 10; });
  c.staart.forEach(function (p, i) { p.volgorde = i; });
  c.meetstaat.forEach(function (m, i) { m.volgorde = i; });
  if (metOpties) {
    // "in plaats van": wanden woonkamer na stucwerk · "erbij": plafond slaapkamer · "erbij": boeidelen voorgevel
    var od = c.hoofdgroepen[1].onderdelen[0];
    od.regels.splice(1, 0, __regel('r8b', 'Wanden', 62, 'Wand na stucwerk', 'm²', 'binnen', __STUC, { optieId: 'oA', alternatiefVoor: 'r8', actief: false }));
    var r13 = c.hoofdgroepen[1].onderdelen[2].regels[1]; r13.optieId = 'oB'; r13.actief = false;
    c.offerteConfig.opties = [
      { id: 'oA', soort: 'vervang', titel: 'Wanden woonkamer na stucwerk', klanttekst: 'Voorstrijken en twee keer sauzen.' },
      { id: 'oB', soort: 'erbij', titel: 'Plafond slaapkamer', klanttekst: 'Plafond twee keer sauzen.' }
    ];
  }
  if (metOpties === 'delen' || metOpties === 'delen-kaal') {
    var r2 = c.hoofdgroepen[0].onderdelen[0].regels[1];
    var kies = function (d, id) { d.actief = false; if (metOpties === 'delen') d.optieId = id; };
    kies(c.hoofdgroepen[0].onderdelen[1], 'oC');   // Achtergevel (tekeningen, stippen, deuronderkant)
    kies(c.hoofdgroepen[0].onderdelen[3], 'oD');   // Dakkapel
    kies(c.hoofdgroepen[2], 'oE');                 // hele hoofdgroep Garage buiten
    kies(c.hoofdgroepen[1].onderdelen[1], 'oF');   // Hal (plafond: afdekvilt)
    kies(c.hoofdgroepen[0].onderdelen[2], 'oG');   // Zijgevel
    r2.actief = false; r2.optieId = 'oH';          // losse regel erbij: boeidelen voorgevel
    c.offerteConfig.opties = c.offerteConfig.opties.concat([
      { id: 'oC', soort: 'erbij', titel: 'Achtergevel', klanttekst: 'Schilderwerk achtergevel.' },
      { id: 'oD', soort: 'erbij', titel: 'Dakkapel', klanttekst: 'Schilderwerk dakkapel.' },
      { id: 'oE', soort: 'erbij', titel: 'Garage', klanttekst: 'Garagedeur schilderen.' },
      { id: 'oF', soort: 'erbij', titel: 'Hal', klanttekst: 'Wanden en plafond hal.' },
      { id: 'oG', soort: 'erbij', titel: 'Zijgevel', klanttekst: 'Schilderwerk zijgevel.' },
      { id: 'oH', soort: 'erbij', titel: 'Boeidelen voorgevel', klanttekst: 'Boeidelen schilderen.' }
    ]);
  }
  return c;
}

// ---- nep-database: tabellen in het geheugen, zelfde aanroepketen als supabase-js ----
var __db = null;
function __maakDb() {
  var tabellen = {}, log = [], fout = {}, teller = 1;
  function from(tabel) {
    var st = { op: 'select', filters: [], payload: null, enkel: null };
    var api = {
      select: function () { return api; },
      insert: function (rows) { st.op = 'insert'; st.payload = rows; return api; },
      upsert: function (rows) { st.op = 'insert'; st.payload = rows; return api; },
      update: function (p) { st.op = 'update'; st.payload = p; return api; },
      delete: function () { st.op = 'delete'; return api; },
      eq: function (k, v) { st.filters.push(function (r) { return r[k] === v; }); return api; },
      neq: function (k, v) { st.filters.push(function (r) { return r[k] !== v; }); return api; },
      is: function (k, v) { st.filters.push(function (r) { return (r[k] == null ? null : r[k]) === v; }); return api; },
      in: function (k, vs) { st.filters.push(function (r) { return vs.indexOf(r[k]) >= 0; }); return api; },
      order: function () { return api; }, limit: function () { return api; }, range: function () { return api; },
      single: function () { st.enkel = 'single'; return api; }, maybeSingle: function () { st.enkel = 'maybe'; return api; },
      then: function (ok, mis) { return Promise.resolve().then(voer).then(ok, mis); }
    };
    function voer() {
      var t = tabellen[tabel] || (tabellen[tabel] = []);
      log.push({ tabel: tabel, op: st.op, payload: st.payload ? JSON.parse(JSON.stringify(st.payload)) : null });
      if (fout[tabel] && st.op !== 'select') return { data: null, error: { message: fout[tabel] } };
      var raak = function (r) { return st.filters.every(function (f) { return f(r); }); };
      var rows;
      if (st.op === 'select') rows = t.filter(raak);
      else if (st.op === 'insert') { rows = st.payload.map(function (p) { return Object.assign({ id: 'nieuw' + (teller++) }, p); }); rows.forEach(function (r) { t.push(r); }); }
      else if (st.op === 'update') { rows = t.filter(raak); rows.forEach(function (r) { Object.assign(r, st.payload); }); }
      else { rows = t.filter(raak); tabellen[tabel] = t.filter(function (r) { return rows.indexOf(r) < 0; }); }
      rows = JSON.parse(JSON.stringify(rows));
      if (st.enkel) return { data: rows[0] || null, error: (st.enkel === 'single' && !rows[0]) ? { message: 'geen rij' } : null };
      return { data: rows, error: null, count: rows.length };
    }
    return api;
  }
  return { from: from, tabellen: tabellen, log: log, fout: fout,
    auth: { getSession: function () { return Promise.resolve({ data: { session: { user: { email: 'test@ernes.nl' } } } }); } } };
}
// Zet de calculatie c als enige, geopende calculatie klaar, met een gevulde nep-database.
function __zetKlaar(c) {
  data.settings.afrondingsDrempel = 0.8;
  data.settings.gebrekPrijzen = { houtrot: 45, scheur: 20, kit: 12, losseverf: 15 };
  data.settings.deurOnderkantPrijs = 18;
  data.staartLib = [
    { id: 'lib1', naam: 'Afdekvilt', type: 'eenheid', bedrag: 1.1, eenheid: 'm¹', grondslag: '', verstopInEenheidsprijs: false, teltInWerkdagen: false },
    { id: 'lib2', naam: 'Kleinschaligheidstoeslag', type: 'percent', bedrag: 0, grondslag: 'arbeid', verstopInEenheidsprijs: true, teltInWerkdagen: true }
  ];
  data.calculaties = [c]; data.activeCalcId = c.id;
  __db = __maakDb(); _sb = __db;
  var T = __db.tabellen;
  T.calculaties = [{ id: c.id, offerte_config: JSON.parse(JSON.stringify(c.offerteConfig || {})), afdekvilt_uit: false, kleinschalig_uit: false }];
  T.hoofdgroepen = []; T.onderdelen = []; T.calc_regels = []; T.staart = []; T.offerte_accorderingen = []; T.meetstaat = [];
  c.hoofdgroepen.forEach(function (hg) {
    T.hoofdgroepen.push(Object.assign({ id: hg.id, optie_id: hg.optieId || null }, _mapHgToDB(hg, c.id)));
    hg.onderdelen.forEach(function (od) {
      T.onderdelen.push(Object.assign({ id: od.id, optie_id: od.optieId || null }, _mapOdToDB(od, hg.id)));
      od.regels.forEach(function (r) { T.calc_regels.push(Object.assign({ id: r.id, optie_id: null, alternatief_voor: null }, _mapRegelToDB(r, od.id))); });
    });
  });
  c.staart.forEach(function (p, i) { T.staart.push(Object.assign({ id: p.id }, _mapStaartCalcToDB(p, c.id, i))); });
  _syncMeetstaatHoeveelheden();
  return c;
}
// De echte bijwerkroutines van de app voor de automatische staartposten.
async function __syncAlles() {
  await _syncGebrekToeslagen();
  await _syncAfdekvilt();
  await _syncKleinschalig();
  await new Promise(function (r) { setTimeout(r, 0); });
}
function __totaal() {
  var cij = _berekenOfferteCijfers(data.calc);
  return { excl: _r2(cij.exBtwFinal), btw: _r2(cij.btwBedrag), incl: _r2(cij.totaalIncl), dagen: cij.dagenFactureerbaar, dw: _calcDays() };
}
function __vind(id) {
  var uit = null;
  data.calc.hoofdgroepen.forEach(function (hg) { if (hg.id === id) uit = hg; hg.onderdelen.forEach(function (od) { if (od.id === id) uit = od; od.regels.forEach(function (r) { if (r.id === id) uit = r; }); }); });
  return uit;
}
`;
