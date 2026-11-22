// test_optieregel_v4.129.1.js — hoort bij index.html v4.129.1 (de optieregel: uitleg, verschillen
// met de basisregel, tekst bij de posten, ruitje). Alleen weergave; er wordt niets anders gerekend.
// Gebruik: node test_optieregel_v4.129.1.js <index.html v4.129.0> <index.html v4.129.1>
// Nodig: acorn (npm install acorn), en test_keuzes_laad.js en test_keuzes_fixture.js in dezelfde map.
const { laad } = require('./test_keuzes_laad.js');
const FIX = require('./test_keuzes_fixture.js');
const padOud = process.argv[2], padNieuw = process.argv[3];
if (!padOud || !padNieuw) { console.log('Gebruik: node test_optieregel_v4.129.1.js <index.html v4.129.0> <index.html v4.129.1>'); process.exit(2); }
let goed = 0, mis = 0; const misLijst = [];
function check(naam, v, detail) { if (v) goed++; else { mis++; misLijst.push(naam + (detail ? ' :: ' + detail : '')); console.log('  MIS  ' + naam + (detail ? ' :: ' + detail : '')); } }
const J = x => JSON.stringify(x);
const balans = h => (h.match(/<div\b/g) || []).length - (h.match(/<\/div>/g) || []).length;
function vers(pad, variant) { const L = laad(pad); L.run(FIX); L.run("__zetKlaar(__maakCalc(" + J(variant) + "))"); return L; }
// maakt van r8b een kopie van r8 (soort "Extra bewerking"): zelfde systeem, zelfde bewerkingen met eigen ids
const KOPIE = "(function () { var b = __vind('r8'), o = __vind('r8b'); o.systeemId = b.systeemId; o.systeemNaam = b.systeemNaam; o.stappen = b.stappen.map(function (s, i) { return Object.assign({}, s, { id: 'kop_s' + i }); }); })()";

(async () => {
  console.log('1. Verschillen tussen optieregel en basisregel');
  {
    const N = vers(padNieuw, 'regels');
    check('ander verfsysteem: niets te vergelijken', N.run("_optStapVerschillen(data.calc, __vind('r8b'))") === null);
    check('basisregel en gewone regel: niets te vergelijken', N.run("_optStapVerschillen(data.calc, __vind('r8'))") === null && N.run("_optStapVerschillen(data.calc, __vind('r1'))") === null && N.run("_optStapVerschillen(data.calc, __vind('r13'))") === null);
    N.run(KOPIE);
    let v = N.run("_optStapVerschillen(data.calc, __vind('r8b'))");
    check('verse kopie: gelijk aan de basis', J(v) === J({ perStap: [null, null, null], ontbreekt: [], aantal: 0 }), J(v));
    N.run("__vind('r8b').stappen.push({ id: 'x1', bewerkingId: null, bewerkingNaam: 'Voorstrijken', bewerkingEenheid: 'm²', minuten: 2.1, percentage: 100, materiaalNaam: 'Voorstrijk', materiaalPrijs: 7.8, verbruik: 0.11, volgorde: 3 });");
    v = N.run("_optStapVerschillen(data.calc, __vind('r8b'))");
    check('bewerking toegevoegd in de optie: extra', v.aantal === 1 && v.perStap[3].soort === 'extra' && v.perStap.slice(0, 3).every(x => x === null), J(v));
    // het geval van Gian: twee keer dezelfde bewerking, in de basis de tweede op 25%, in de optie op 100%
    N.run("__vind('r8').stappen[2].percentage = 25;");
    v = N.run("_optStapVerschillen(data.calc, __vind('r8b'))");
    check('tweede laag in de basis op 25%, in de optie 100%: anders dan basis, met "basis 25%"', v.perStap[1] === null && v.perStap[2].soort === 'anders' && v.perStap[2].detail === 'basis 25%' && v.aantal === 2, J(v));
    N.run("__vind('r8').stappen[2].percentage = 100; __vind('r8').stappen[1].percentage = 25;");
    v = N.run("_optStapVerschillen(data.calc, __vind('r8b'))");
    check('ook als de eerste laag in de basis op 25% staat: één keer anders, één keer gelijk', v.perStap.slice(1, 3).filter(Boolean).length === 1 && v.perStap.slice(1, 3).some(x => x && x.detail === 'basis 25%'), J(v));
    N.run("__vind('r8').stappen[1].percentage = 100; __vind('r8b').stappen[0].minuten = 3; __vind('r8b').stappen[1].verbruik = 0.2; __vind('r8b').stappen[2].materiaalNaam = 'Andere muurverf';");
    v = N.run("_optStapVerschillen(data.calc, __vind('r8b'))");
    check('andere minuten, verbruik en materiaal worden genoemd', /basis 1,80 min/.test(v.perStap[0].detail) && /basis verbruik 0,15/.test(v.perStap[1].detail) && /basis: Muurverf/.test(v.perStap[2].detail), J(v.perStap));
    N.run(KOPIE); N.run("__vind('r8b').stappen.splice(0, 1);");
    v = N.run("_optStapVerschillen(data.calc, __vind('r8b'))");
    check('bewerking weggehaald uit de optie: wordt genoemd als ontbrekend', J(v.ontbreekt) === J(['Afplakken']) && v.aantal === 0, J(v));
    check('vergelijken verandert niets aan de regels', N.run("__vind('r8').stappen.length") === 3 && N.run("__vind('r8b').stappen.length") === 2);
  }

  console.log('2. Wat er op het scherm staat');
  {
    const N = vers(padNieuw, 'delen');
    await N.run("__syncAlles()");
    N.run(KOPIE);
    let h = N.run("renderRegel('hgI', 'odWK', __vind('r8b'))");
    check('optieregel: uitleg met "nog gelijk aan de basis"', /class="opt-regel-hint">Dit is de optie\. Pas hier aan wat de klant extra krijgt; de basisregel erboven blijft de uitvoering zonder de optie\./.test(h) && /De optie is nu nog gelijk aan de basis/.test(h));
    check('optieregel: klasse is-optie en is-inactief, div-balans', /class="calc-regel-wrap is-inactief\s+is-optie/.test(h) && balans(h) === 0, String(balans(h)));
    N.run("__vind('r8b').stappen[2].percentage = 150; __vind('r8b').stappen.push({ id: 'x1', bewerkingId: null, bewerkingNaam: 'Voorstrijken', bewerkingEenheid: 'm²', minuten: 2.1, percentage: 100, materiaalNaam: null, materiaalPrijs: 0, verbruik: 0, volgorde: 3 });");
    h = N.run("renderRegel('hgI', 'odWK', __vind('r8b'))");
    check('optieregel: labels "extra" en "anders dan basis" met wat de basis heeft', (h.match(/class="opt-tag is-extra"/g) || []).length === 2 && />extra<\/span>/.test(h) && />anders dan basis<\/span><span class="opt-stap-detail">basis 100%<\/span>/.test(h) && !/nog gelijk aan de basis/.test(h));
    const hb = N.run("renderRegel('hgI', 'odWK', __vind('r8'))");
    check('basisregel: geen uitleg en geen labels', !/opt-regel-hint/.test(hb) && !/is-extra/.test(hb));
    check('hele regel als optie: eigen uitleg', /Dit is de optie: deze hele regel staat uit in de basis\. Je kunt hem gewoon bewerken\./.test(N.run("renderRegel('hgI', 'odSK', __vind('r13'))")));
    const O = vers(padOud, 'delen'); await O.run("__syncAlles()");
    const ruit = t => String(t).split(' opt-ruit').join('').replace(/\s+/g, ' ');   // witruimte telt niet: de lege plek van de uitleg is een regeleinde
    check('gewone regel: gelijk aan v4.129.0 op het ruitje na', ruit(N.run("renderRegel('hgB', 'odVG', __vind('r1'))")) === ruit(O.run("renderRegel('hgB', 'odVG', __vind('r1'))")));
    check('ruitje bij een regel heeft de nieuwe klasse', /class="btn-secondary btn btn-sm opt-ruit" onclick="optOpenMaak\(/.test(N.run("renderRegel('hgB', 'odVG', __vind('r1'))")));
    check('ruitje in de kop van een deel heeft de nieuwe klasse', /class="btn-secondary btn btn-sm opt-ruit" onclick="optDeelMaak\('hgB',null\)"/.test(N.run("renderHoofdgroep(__vind('hgB'))")));
    check('kop van een deel: gelijk aan v4.129.0 op het ruitje na', ruit(N.run("renderHoofdgroep(__vind('hgG'))")) === ruit(O.run("renderHoofdgroep(__vind('hgG'))")));
    // ander verfsysteem
    const A = vers(padNieuw, 'regels');
    check('ander verfsysteem: eigen uitleg, geen labels', (x => /hetzelfde oppervlak met een ander verfsysteem/.test(x) && !/is-extra/.test(x))(A.run("renderRegel('hgI', 'odWK', __vind('r8b'))")));
    // tekst bij de posten
    const zonder = N.run("_optPostenHtml({ id: 'oC', posten: [] }, false)");
    const een = N.run("_optPostenHtml({ id: 'oC', posten: [{ id: 'p1', naam: 'Steiger', type: 'vast', bedrag: 850 }] }, false)");
    const twee = N.run("_optPostenHtml({ id: 'oC', posten: [{ id: 'p1', naam: 'Steiger', type: 'vast', bedrag: 850 }, { id: 'p2', naam: 'Hoogwerker', type: 'eenheid', bedrag: 175, hoeveelheid: 2, eenheid: 'dag' }] }, true)");
    check('zonder posten geen tekst', !/opt-post-hint/.test(zonder));
    check('één post: tekst in het enkelvoud', /De klant ziet deze post niet apart op de offerte\. Noem hem in de omschrijving hierboven, anders weet de klant niet dat hij in de meerprijs zit\./.test(een));
    check('twee posten: tekst in het meervoud, ook bij een vastgelegde keuze', /De klant ziet deze posten niet apart op de offerte\. Noem ze in de omschrijving hierboven, anders weet de klant niet dat ze in de meerprijs zitten\./.test(twee) && balans(twee) === 0);
    // opmaak in het bestand
    const css = require('fs').readFileSync(padNieuw, 'utf8');
    check('opmaak: rode lijn, niet doorgestreept en niet grijs', /\.calc-regel-wrap\.is-optie \{ border-color: rgba\(230,51,41,0\.55\); \}/.test(css) && /\.calc-regel-wrap\.is-optie\.is-inactief \.regel-stappen \{ opacity: 1; \}/.test(css) && /\.hoofdgroep\.is-keuze, \.onderdeel\.is-keuze \{ border-color: rgba\(230,51,41,0\.55\); \}/.test(css) && !/is-optie \{ border-left: 3px solid var\(--blue/.test(css));
  }
  console.log('\n' + (goed + mis) + ' controles: ' + goed + ' goed, ' + mis + ' mis');
  if (mis) { console.log(misLijst.map(x => ' - ' + x).join('\n')); process.exit(1); }
})().catch(e => { console.error('TEST GESTOPT MET EEN FOUT:', e); process.exit(2); });
