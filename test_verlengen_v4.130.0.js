// Test voor v4.130.0 — Geldigheid van een verstuurde offerte verlengen.
// Gebruik: node test_verlengen_v4.130.0.js <index.html v4.129.1> <index.html v4.130.0>
// Vraagt: npm install acorn jsdom
// De functies worden met acorn uit het bestand zelf gesneden; er wordt niets nagetypt.
const fs = require('fs'), vm = require('vm'), acorn = require('acorn');
const { JSDOM } = require('jsdom');
const [oudPad, nieuwPad] = process.argv.slice(2);
if (!oudPad || !nieuwPad) { console.error('twee bestanden nodig'); process.exit(2); }

function snij(pad) {
  const html = fs.readFileSync(pad, 'utf8');
  const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g; let m, groot = '';
  while ((m = re.exec(html))) { if (!/\bsrc=/.test(m[1] || '') && m[2].length > groot.length) groot = m[2]; }
  const ast = acorn.parse(groot, { ecmaVersion: 'latest' });
  const fn = {};
  for (const n of ast.body) if (n.type === 'FunctionDeclaration') fn[n.id.name] = groot.slice(n.start, n.end);
  return { html, js: groot, fn };
}
const OUD = snij(oudPad), NIEUW = snij(nieuwPad);

let goed = 0, fout = 0;
function ok(naam, voorwaarde, extra) {
  if (voorwaarde) { goed++; } else { fout++; console.log('FOUT  ' + naam + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
}
function gelijk(naam, a, b) { ok(naam, JSON.stringify(a) === JSON.stringify(b), { kreeg: a, verwacht: b }); }

const NODIG = ['_verlengGeldigeDatum', '_verlengStandaardDatum', '_verlengControle', '_verlengMailTekst', '_verlengMailKan',
  '_verlengSnapshot', '_verlengRegelHtml', '_verlengUitvoeren', '_verlengMelding', '_accordVerlengen',
  '_offGeldigDagenNorm', '_offIsoPlusDagen', '_offIsoVandaag', '_offDatumLang', '_offKlanttypeLabel',
  '_accordEsc', '_accordDatum', '_accordLinkVoor', '_accordBeheerRender', '_wachtrijBlokHtml', '_wachtrijTijdKort',
  '_opvolgBlokHtml', '_opvolgRegel', '_opvolgIsYmd', '_opvolgDagVan', '_opvolgDagTijd', '_opvolgDatumKort',
  '_opvolgYmdPlus', '_opvolgEersteMaandag', '_opvolgEersteMaandagNa', '_offerteMailStandaardtekst'];

// Bouwt een omgeving met de gesneden functies en nagebootste buitenwereld.
function omgeving(bron, opties) {
  opties = opties || {};
  const dom = new JSDOM('<!doctype html><html><body><div class="acb-body"></div></body></html>');
  const log = { toasts: [], db: [], cfgZet: [], mails: [], herlaad: 0, confirms: [] };
  const ctx = {
    document: dom.window.document, window: dom.window, console, Date, JSON, Math, String, Number, Array, Object, Promise, Error, isNaN, isFinite, setTimeout,
    navigator: {}, SUPABASE_URL: 'x', SUPABASE_KEY: 'k', location: { origin: 'https://voorbeeld.test', pathname: '/schilders-calc/', href: 'https://voorbeeld.test/schilders-calc/' },
    _toast: (t, soort) => log.toasts.push({ t: t, soort: soort || 'err' }),
    confirm: (t) => { log.confirms.push(t); return opties.confirm !== false; },
    data: { calc: null },
    _nabelBlokHtml: () => '', _accordEerdereHtml: () => '', _accordEerdereWire: () => {}, _offerteNummer: () => '26-001',
    _offerteMailen: () => { log.mailVenster = true; }, _accordNieuweLink: () => {}, _accordDownloadGetekend: () => {},
    _wachtrijIntrekken: async () => 0, _wachtrijLaatsteStatus: async () => '',
    accordLinkBeheer: () => { log.herlaad++; },
    _offCfgVersLezen: async (c) => { if (opties.cfgLeesFout) throw new Error('lezen mislukt'); return JSON.parse(JSON.stringify(opties.cfgDb || {})); },
    _offCfgGerichtZetten: async (c, velden) => {
      if (opties.cfgSchrijfFout) throw new Error('schrijven mislukt');
      log.cfgZet.push(velden); Object.assign(opties.cfgDb || {}, velden);
      c.offerteConfig = Object.assign({}, c.offerteConfig || {}, velden); return c.offerteConfig;
    },
    _offerteVerzendCall: async (token, tekst) => {
      if (opties.mailFout) { if (opties.mailFoutNaVerzenden && opties.linkDb) opties.linkDb.beltaak_op = null; throw new Error('fout 502'); }
      log.mails.push({ token, tekst });
      if (opties.mailAl) return { ok: true, alVerstuurd: true };
      // offerte-verzenden v38: stempel gemaild_op zetten en de vier opvolgstempels wissen.
      if (opties.linkDb) Object.assign(opties.linkDb, { gemaild_op: '2026-11-24T10:00:00Z', beltaak_op: null, herinnering_op: null, verlopen_mail_op: null, afsluittaak_op: null });
      return { ok: true };
    },
  };
  // Nagebootste Supabase-client: alleen de ketens die het nieuwe blok gebruikt.
  ctx._sb = opties.geenSb ? null : {
    from(tabel) {
      const q = { tabel, soort: 'select', filters: {}, waarden: null };
      const k = {
        select(kol) { if (q.soort === 'update') q.terug = kol; else q.kolommen = kol; return k; },
        update(w) { q.soort = 'update'; q.waarden = w; return k; },
        eq(a, b) { q.filters[a] = b; return k; },
        maybeSingle() { log.db.push(q); return Promise.resolve(opties.linkLeesFout ? { data: null, error: new Error('lezen link mislukt') } : { data: opties.linkDb === undefined ? null : JSON.parse(JSON.stringify(opties.linkDb)), error: null }); },
        then(res, rej) {
          log.db.push(q);
          let uit;
          if (q.soort === 'update') {
            const alleenBel = Object.keys(q.waarden).join() === 'beltaak_op';
            if (alleenBel && opties.belSchrijfFout) uit = { data: null, error: new Error('timeout') };
            else if (opties.linkSchrijfFout) uit = { data: null, error: new Error('permission denied') };
            else if (opties.linkNulRijen) uit = { data: [], error: null };
            else { Object.assign(opties.linkDb, q.waarden); uit = { data: [{ id: q.filters.id }], error: null }; }
          } else uit = { data: [], error: null };
          return Promise.resolve(uit).then(res, rej);
        },
      };
      return k;
    },
  };
  vm.createContext(ctx);
  let code = 'var _wachtrijCache = { calcId: null, rows: [], fout: "" };\n';
  for (const n of NODIG) if (bron.fn[n]) code += bron.fn[n] + '\n';
  code += 'this._zetWachtrij = function (w) { _wachtrijCache = w; };\n';
  vm.runInContext(code, ctx);
  ctx.log = log; ctx.body = dom.window.document.querySelector('.acb-body'); ctx.dom = dom;
  return ctx;
}
const wacht = () => new Promise(r => setTimeout(r, 15));
const klik = (ctx, sel) => ctx.body.querySelector(sel).dispatchEvent(new ctx.dom.window.Event('click', { bubbles: true }));

(async () => {
  const N = omgeving(NIEUW);
  const VANDAAG = '2026-11-24';

  // ---- A. losse functies ----
  ok('A1 nieuwe functies bestaan', ['_verlengGeldigeDatum', '_verlengUitvoeren', '_accordVerlengen', '_verlengRegelHtml'].every(n => !!NIEUW.fn[n]));
  ok('A2 bestonden niet in de oude versie', !OUD.fn._verlengUitvoeren && !OUD.fn._accordVerlengen);
  ok('A3 geldige datum', N._verlengGeldigeDatum('2026-12-15') === true);
  ok('A4 31 februari is geen datum', N._verlengGeldigeDatum('2026-02-31') === false);
  ok('A5 rommel is geen datum', !N._verlengGeldigeDatum('15-12-2026') && !N._verlengGeldigeDatum('') && !N._verlengGeldigeDatum(null));
  gelijk('A6 voorstel particulier: vandaag + 21', N._verlengStandaardDatum('2026-11-28', 'particulier', VANDAAG), '2026-12-15');
  gelijk('A7 voorstel zakelijk: vandaag + 30', N._verlengStandaardDatum('2026-11-20', 'zakelijk', VANDAAG), '2026-12-24');
  gelijk('A8 voorstel VvE: vandaag + 180', N._verlengStandaardDatum('', 'vve', VANDAAG), '2027-05-23');
  gelijk('A9 voorstel niet na huidige: huidige + norm', N._verlengStandaardDatum('2027-01-10', 'particulier', VANDAAG), '2027-01-31');
  gelijk('A10 controle goed', N._verlengControle('2026-12-15', '2026-11-28', VANDAAG), { ok: true, korter: false });
  ok('A11 controle: verleden geweigerd', N._verlengControle('2026-11-23', '2026-11-20', VANDAAG).ok === false);
  ok('A12 controle: vandaag mag', N._verlengControle(VANDAAG, '2026-11-20', VANDAAG).ok === true);
  ok('A13 controle: zelfde datum geweigerd', N._verlengControle('2026-11-28', '2026-11-28', VANDAAG).ok === false);
  ok('A14 controle: korter gemeld', N._verlengControle('2026-11-26', '2026-11-28', VANDAAG).korter === true);
  ok('A15 controle: geen datum geweigerd', N._verlengControle('', '2026-11-28', VANDAAG).ok === false);
  ok('A16 controle: zonder huidige datum goed', N._verlengControle('2026-12-01', '', VANDAAG).ok === true);
  const mt = N._verlengMailTekst('heer Jansen', '2026-12-15');
  ok('A17 mailtekst: aanhef en datum', mt.indexOf('Geachte heer Jansen,') === 0 && mt.indexOf('15 december 2026') > 0);
  ok('A18 mailtekst: terugval aanhef', N._verlengMailTekst('', '2026-12-15').indexOf('Geachte heer, mevrouw,') === 0);
  const rijB = { token: 'T1', gemaild_op: '2026-11-03T08:00:00Z', snapshot: { klantEmail: 'a@b.nl', aanhef: 'heer Jansen', geldigTot: '2026-11-24' } };
  ok('A19 mail kan', N._verlengMailKan(rijB, { rows: [] }).kan === true && N._verlengMailKan(rijB, { rows: [] }).email === 'a@b.nl');
  ok('A20 mail kan niet: geen adres', N._verlengMailKan({ token: 'T1', gemaild_op: 'x', snapshot: {} }, { rows: [] }).kan === false);
  ok('A21 mail kan niet: nog niet gemaild', N._verlengMailKan(Object.assign({}, rijB, { gemaild_op: null }), { rows: [] }).kan === false);
  ok('A22 mail kan niet: verzending ingepland', N._verlengMailKan(rijB, { rows: [{ token: 'T1', status: 'gepland' }] }).kan === false);
  ok('A23 mail kan wel: planning van een andere link', N._verlengMailKan(rijB, { rows: [{ token: 'T9', status: 'gepland' }] }).kan === true);
  ok('A24 mail kan niet: wachtrij onleesbaar', N._verlengMailKan(rijB, { rows: [], fout: 'x' }).kan === false);
  const s0 = { pdf: 'p', geldigTot: '2026-11-24', klantEmail: 'a@b.nl' };
  const s1 = N._verlengSnapshot(s0, '2026-11-24', '2026-12-15', '2026-11-24T10:00:00.000Z');
  ok('A25 snapshot: datum gezet, rest behouden', s1.geldigTot === '2026-12-15' && s1.pdf === 'p' && s1.klantEmail === 'a@b.nl');
  ok('A26 snapshot: origineel ongewijzigd', s0.geldigTot === '2026-11-24' && !('verlengingen' in s0));
  gelijk('A27 snapshot: logje', s1.verlengingen, [{ op: '2026-11-24T10:00:00.000Z', van: '2026-11-24', tot: '2026-12-15' }]);
  const s2 = N._verlengSnapshot(s1, '2026-12-15', '2027-01-05', '2026-12-10T10:00:00.000Z');
  ok('A28 snapshot: tweede verlenging erbij', s2.verlengingen.length === 2 && s1.verlengingen.length === 1);
  ok('A29 snapshot: leeg snapshot gaat goed', N._verlengSnapshot(null, '', '2026-12-15', 'x').geldigTot === '2026-12-15');
  const r1 = N._verlengRegelHtml({ offerteConfig: { geldigTot: '2026-12-15' } }, { snapshot: {} }, VANDAAG);
  ok('A30 regel: geldig tot', r1.indexOf('Geldig tot 15 december 2026.') > 0 && r1.indexOf('Verlopen') < 0);
  const r2 = N._verlengRegelHtml({ offerteConfig: { geldigTot: '2026-11-20' } }, { snapshot: {} }, VANDAAG);
  ok('A31 regel: verlopen', r2.indexOf('Verlopen op 20 november 2026') > 0);
  ok('A32 regel: op de dag zelf nog geldig', N._verlengRegelHtml({ offerteConfig: { geldigTot: VANDAAG } }, { snapshot: {} }, VANDAAG).indexOf('Geldig tot') > 0);
  ok('A33 regel: geen datum', N._verlengRegelHtml({ offerteConfig: {} }, { snapshot: {} }, VANDAAG).indexOf('verloopt niet') > 0);
  const r3 = N._verlengRegelHtml({ offerteConfig: { geldigTot: '2026-12-15' } }, { snapshot: s1 }, VANDAAG);
  ok('A34 regel: verlengd op, was', r3.indexOf('Verlengd op') > 0 && r3.indexOf('was 24 november 2026') > 0);
  ok('A35 melding: goed zonder mail', N._verlengMelding({ nieuw: '2026-12-15', linkBij: true, mail: 'geen' }, '').soort === 'ok');
  ok('A36 melding: goed met mail noemt adres', N._verlengMelding({ nieuw: '2026-12-15', linkBij: true, mail: 'ok' }, 'a@b.nl').tekst.indexOf('a@b.nl') > 0);
  ok('A37 melding: mail mislukt is rood', N._verlengMelding({ nieuw: '2026-12-15', linkBij: true, mail: 'mislukt', mailFout: 'x' }, 'a@b.nl').soort === 'err');
  const mLink = N._verlengMelding({ nieuw: '2026-12-15', linkBij: false, linkFout: 'x', mailGevraagd: true }, 'a@b.nl');
  ok('A38 melding: link niet bij is rood en zegt geen mail', mLink.soort === 'err' && mLink.tekst.indexOf('geen mail verstuurd') > 0 && mLink.tekst.indexOf('oude datum') > 0);

  // ---- B. het werk zelf, tegen een nagebootste database ----
  function start(extra) {
    const o = Object.assign({
      cfgDb: { geldigTot: '2026-11-20', klanttype: 'particulier', email: 'a@b.nl' },
      linkDb: { id: 'L1', status: 'open', snapshot: { pdf: 'p', geldigTot: '2026-11-20', klantEmail: 'a@b.nl', aanhef: 'heer Jansen' },
        onderhoudsplan_id: null, oplevering_id: null, herinnering_op: '2026-11-13T07:00:00Z', verlopen_mail_op: null, afsluittaak_op: null, beltaak_op: '2026-11-09T07:00:00Z' },
    }, extra || {});
    const ctx = omgeving(NIEUW, o);
    const c = { id: 'C1', naam: 'Jansen | Buitenwerk', klant: 'Jansen', status: 'verzonden', offerteConfig: { geldigTot: '2026-11-20', klanttype: 'particulier' } };
    const rij = { id: 'L1', token: 'T1', status: 'open', gemaild_op: '2026-11-03T08:00:00Z', snapshot: JSON.parse(JSON.stringify(o.linkDb ? o.linkDb.snapshot : {})), herinnering_op: '2026-11-13T07:00:00Z' };
    return { ctx, o, c, rij };
  }
  {
    const { ctx, o, c, rij } = start();
    const uit = await ctx._verlengUitvoeren(c, rij, '2026-12-15', false, '');
    ok('B1 zonder mail: geslaagd', uit.linkBij === true && uit.mail === 'geen' && uit.oud === '2026-11-20');
    gelijk('B2 calculatie: alleen geldigTot gezet', ctx.log.cfgZet, [{ geldigTot: '2026-12-15' }]);
    ok('B3 calculatie in database', o.cfgDb.geldigTot === '2026-12-15' && o.cfgDb.email === 'a@b.nl' && o.cfgDb.klanttype === 'particulier');
    ok('B4 link: snapshot-datum', o.linkDb.snapshot.geldigTot === '2026-12-15' && o.linkDb.snapshot.pdf === 'p');
    ok('B5 link: drie stempels gewist', o.linkDb.herinnering_op === null && o.linkDb.verlopen_mail_op === null && o.linkDb.afsluittaak_op === null);
    ok('B6 link: beltaak-stempel ongemoeid', o.linkDb.beltaak_op === '2026-11-09T07:00:00Z');
    ok('B7 link: status ongemoeid', o.linkDb.status === 'open');
    const upd = ctx.log.db.find(q => q.soort === 'update');
    gelijk('B8 update gericht op deze open link', upd.filters, { id: 'L1', status: 'open' });
    gelijk('B9 update schrijft precies vijf kolommen', Object.keys(upd.waarden).sort(), ['afsluittaak_op', 'beltaak_op', 'herinnering_op', 'snapshot', 'verlopen_mail_op']);
    ok('B9b bestaande beltaak: snapshot zegt niet dat hij vervalt', !('belVervalt' in o.linkDb.snapshot));
    ok('B10 geen mail verstuurd', ctx.log.mails.length === 0);
    ok('B11 rij in het geheugen bijgewerkt', rij.snapshot.geldigTot === '2026-12-15' && rij.herinnering_op === null);
    ok('B12 calculatiestatus ongemoeid', c.status === 'verzonden');
  }
  {
    const { ctx, c, rij } = start();
    const uit = await ctx._verlengUitvoeren(c, rij, '2026-12-15', true, 'Geachte heer Jansen, tekst');
    ok('B13 met mail: geslaagd', uit.linkBij === true && uit.mail === 'ok');
    gelijk('B14 mail met token en tekst', ctx.log.mails, [{ token: 'T1', tekst: 'Geachte heer Jansen, tekst' }]);
    const volg = ctx.log.db.map(q => q.soort);
    ok('B15 volgorde: eerst lezen, dan schrijven', volg[0] === 'select' && volg[1] === 'update');
  }
  for (const [naam, extra] of [['akkoord', { status: 'akkoord' }], ['vervangen', { status: 'vervangen' }]]) {
    const st = start(); Object.assign(st.o.linkDb, extra);
    let gegooid = '';
    try { await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't'); } catch (e) { gegooid = e.message; }
    ok('B16 link ' + naam + ': geweigerd', gegooid.indexOf('niet meer open') > 0);
    ok('B17 link ' + naam + ': niets geschreven, niets gemaild', st.ctx.log.cfgZet.length === 0 && st.ctx.log.mails.length === 0 && !st.ctx.log.db.some(q => q.soort === 'update'));
  }
  {
    const st = start({ linkDb: undefined });
    let g = ''; try { await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', false, ''); } catch (e) { g = e.message; }
    ok('B18 link weg: geweigerd, niets geschreven', g.indexOf('bestaat niet meer') > 0 && st.ctx.log.cfgZet.length === 0);
  }
  {
    const st = start(); st.o.linkDb.onderhoudsplan_id = 'P1';
    let g = ''; try { await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', false, ''); } catch (e) { g = e.message; }
    ok('B19 planlink: geweigerd, niets geschreven', g.indexOf('geen offerte-link') >= 0 && st.ctx.log.cfgZet.length === 0);
  }
  {
    const st = start({ cfgSchrijfFout: true });
    let g = ''; try { await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't'); } catch (e) { g = e.message; }
    ok('B20 calculatie schrijven mislukt: gegooid, link en mail onaangeraakt', g === 'schrijven mislukt' && !st.ctx.log.db.some(q => q.soort === 'update') && st.ctx.log.mails.length === 0 && st.o.linkDb.snapshot.geldigTot === '2026-11-20');
  }
  {
    const st = start({ linkLeesFout: true });
    let g = ''; try { await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't'); } catch (e) { g = e.message; }
    ok('B21 link lezen mislukt: gegooid, niets geschreven', g === 'lezen link mislukt' && st.ctx.log.cfgZet.length === 0);
  }
  {
    const st = start({ linkSchrijfFout: true });
    const uit = await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't');
    ok('B22 link schrijven mislukt: gemeld, geen mail', uit.linkBij === false && uit.linkFout === 'permission denied' && st.ctx.log.mails.length === 0);
    ok('B23 calculatie is dan wel verlengd', st.o.cfgDb.geldigTot === '2026-12-15');
  }
  {
    const st = start({ linkNulRijen: true });
    const uit = await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't');
    ok('B24 link raakte nul rijen: gemeld, geen mail', uit.linkBij === false && st.ctx.log.mails.length === 0);
  }
  {
    const st = start({ mailFout: true });
    const uit = await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't');
    ok('B25 mail mislukt: verlenging staat, gemeld', uit.linkBij === true && uit.mail === 'mislukt' && uit.mailFout === 'fout 502' && st.o.linkDb.snapshot.geldigTot === '2026-12-15');
  }
  {
    const st = start({ mailAl: true });
    const uit = await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't');
    ok('B26 dubbele-mailrem: gemeld als al verstuurd', uit.mail === 'al');
  }
  {
    const st = start({ geenSb: true });
    let g = ''; try { await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', false, ''); } catch (e) { g = e.message; }
    ok('B27 geen verbinding: gegooid', g === 'Geen verbinding.');
  }

  // ---- G. besluit Gian 24-11: geen beltaken meer na verlenging ----
  // offerte-herinnering v29 maakt een beltaak als beltaak_op leeg is (en de maandag bereikt is).
  const automaatMaaktBeltaak = (link) => !link.beltaak_op;
  {
    const st = start(); // er was al een beltaak (stempel 9 november)
    const uit = await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't');
    ok('G1 met mail, beltaak bestond: stempel na de mail teruggezet op de oude waarde', st.o.linkDb.beltaak_op === '2026-11-09T07:00:00Z' && uit.belFout === '');
    ok('G2 met mail: automaat maakt geen beltaak', automaatMaaktBeltaak(st.o.linkDb) === false);
    ok('G3 met mail: de andere drie stempels blijven leeg', st.o.linkDb.herinnering_op === null && st.o.linkDb.verlopen_mail_op === null && st.o.linkDb.afsluittaak_op === null);
    const upds = st.ctx.log.db.filter(q => q.soort === 'update');
    ok('G4 met mail: tweede schrijfronde raakt alleen beltaak_op', upds.length === 2 && Object.keys(upds[1].waarden).join() === 'beltaak_op');
  }
  {
    const st = start(); st.o.linkDb.beltaak_op = null; // nog niet gebeld
    ok('G5 controle op de test: zonder verlenging zou de automaat een beltaak maken', automaatMaaktBeltaak(st.o.linkDb) === true);
    await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', false, '');
    ok('G6 zonder mail, nog geen beltaak: stempel gevuld, automaat maakt er geen', !!st.o.linkDb.beltaak_op && automaatMaaktBeltaak(st.o.linkDb) === false);
    ok('G7 snapshot onthoudt dat het geen echte beltaak was', st.o.linkDb.snapshot.belVervalt === true && st.rij.snapshot.belVervalt === true);
    ok('G8 zonder mail: een schrijfronde', st.ctx.log.db.filter(q => q.soort === 'update').length === 1);
  }
  {
    const st = start(); st.o.linkDb.beltaak_op = null;
    await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't');
    ok('G9 met mail, nog geen beltaak: na de mail weer gevuld', !!st.o.linkDb.beltaak_op && automaatMaaktBeltaak(st.o.linkDb) === false && st.o.linkDb.snapshot.belVervalt === true);
  }
  {
    const st = start({ mailFout: true, mailFoutNaVerzenden: true });
    const uit = await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't');
    ok('G10 mail meldt fout maar wiste het stempel toch: teruggezet', uit.mail === 'mislukt' && st.o.linkDb.beltaak_op === '2026-11-09T07:00:00Z');
  }
  {
    const st = start({ belSchrijfFout: true });
    const uit = await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't');
    const m = st.ctx._verlengMelding(uit, 'a@b.nl');
    ok('G11 terugzetten mislukt: gemeld in het resultaat', uit.mail === 'ok' && uit.belFout === 'timeout');
    ok('G12 terugzetten mislukt: rode melding die Maud noemt', m.soort === 'err' && m.tekst.indexOf('Maud') > 0 && m.tekst.indexOf('gemaild naar a@b.nl') > 0);
  }
  {
    const st = start({ mailAl: true });
    await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', true, 't');
    ok('G13 dubbele-mailrem: stempel blijft gevuld', st.o.linkDb.beltaak_op === '2026-11-09T07:00:00Z');
  }
  {
    const n = omgeving(NIEUW);
    const part = { offerteConfig: { klanttype: 'particulier', geldigTot: '2026-12-15' } };
    const basis = { status: 'open', automaat_uit: false, gemaild_op: '2026-11-20T08:00:00Z' };
    const h1 = n._opvolgBlokHtml(part, Object.assign({}, basis, { beltaak_op: '2026-11-24T10:00:00Z', snapshot: { geldigTot: '2026-12-15', belVervalt: true } }));
    ok('G14 venster: nabellen "vervalt na de verlenging", niet "gedaan"', h1.indexOf('vervalt na de verlenging') > 0 && h1.indexOf('gedaan op 24 november') < 0);
    const h2 = n._opvolgBlokHtml(part, Object.assign({}, basis, { beltaak_op: '2026-11-23T07:00:00Z', snapshot: { geldigTot: '2026-12-15' } }));
    ok('G15 venster: echte beltaak blijft "gedaan op"', h2.indexOf('gedaan op 23 november') > 0 && h2.indexOf('vervalt na de verlenging') < 0);
    const h3 = n._opvolgBlokHtml(part, Object.assign({}, basis, { beltaak_op: null, snapshot: { geldigTot: '2026-12-15', belVervalt: true } }));
    ok('G16 venster: stempel later gewist (offerte opnieuw gemaild) toont weer de geplande maandag', h3.indexOf('vervalt na de verlenging') < 0 && h3.indexOf('23 november') > 0);
  }
  ok('G17 snapshot-functie: belVervalt alleen als gevraagd', N._verlengSnapshot({}, '', '2026-12-15', 'x', true).belVervalt === true && !('belVervalt' in N._verlengSnapshot({}, '', '2026-12-15', 'x', false)));

  // ---- C. sluit het aan op de Edge Functions? Regels overgenomen uit de bron van 24-11-2026 ----
  // offerte-accord v43: geldigTotVoor (offerte) = calculaties.offerte_config.geldigTot; isVerlopen = vandaag > datum.
  // offerte-herinnering v29: geldigTot = snapshot.geldigTot || calculatie; verlopen-mail vanaf datum + 10.
  // offerte-verzenden v38: de geldig-zin komt uit snapshot.geldigTot.
  const leesYmd = v => { const s = String(v == null ? '' : v).trim(); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''; };
  const accordVerlopen = (cfg, vandaag) => { const g = leesYmd(cfg.geldigTot); return !!g && vandaag > g; };
  const herinnerDatum = (snap, cfg) => leesYmd(snap.geldigTot) || leesYmd(cfg.geldigTot);
  {
    const st = start();
    ok('C1 vooraf: link dicht voor akkoord', accordVerlopen(st.o.cfgDb, VANDAAG) === true);
    await st.ctx._verlengUitvoeren(st.c, st.rij, '2026-12-15', false, '');
    ok('C2 daarna: zelfde link weer open', accordVerlopen(st.o.cfgDb, VANDAAG) === false);
    ok('C3 daarna: open tot en met de datum, dicht de dag erna', accordVerlopen(st.o.cfgDb, '2026-12-15') === false && accordVerlopen(st.o.cfgDb, '2026-12-16') === true);
    ok('C4 automaat rekent met de nieuwe datum', herinnerDatum(st.o.linkDb.snapshot, st.o.cfgDb) === '2026-12-15');
    ok('C5 mailzin krijgt de nieuwe datum', String(st.o.linkDb.snapshot.geldigTot) === '2026-12-15');
  }
  {
    // De omweg van voor deze versie (alleen de calculatie aanpassen) liet de automaat op de oude datum.
    const cfg = { geldigTot: '2026-12-15' }, snap = { geldigTot: '2026-11-20' };
    ok('C6 controle op de test zelf: alleen calculatie = automaat op oude datum', herinnerDatum(snap, cfg) === '2026-11-20');
  }

  // ---- D. het venster ----
  function venster(bron, rijExtra, cExtra, opties) {
    const ctx = omgeving(bron, Object.assign({
      cfgDb: { geldigTot: '2026-11-28', klanttype: 'particulier' },
      linkDb: { id: 'L1', status: 'open', snapshot: { geldigTot: '2026-11-28', klantEmail: 'a@b.nl', aanhef: 'heer Jansen' }, onderhoudsplan_id: null, oplevering_id: null },
    }, opties || {}));
    const c = Object.assign({ id: 'C1', naam: 'Jansen | Buitenwerk', klant: 'Jansen', status: 'verzonden', offerteConfig: { geldigTot: '2026-11-28', klanttype: 'particulier' } }, cExtra || {});
    const rij = Object.assign({ id: 'L1', token: 'T1', status: 'open', gemaild_op: '2026-11-03T08:00:00Z', automaat_uit: false, snapshot: { geldigTot: '2026-11-28', klantEmail: 'a@b.nl', aanhef: 'heer Jansen' } }, rijExtra || {});
    ctx._offIsoVandaag = () => VANDAAG; // vaste dag voor de test
    ctx._accordBeheerRender(ctx.body, c, rij, null);
    return { ctx, c, rij };
  }
  {
    const { ctx } = venster(NIEUW);
    ok('D1 open link: knop Geldigheid verlengen', !!ctx.body.querySelector('#acbVerleng'));
    ok('D2 open link: regel Geldig tot', ctx.body.innerHTML.indexOf('Geldig tot 28 november 2026.') > 0);
    ok('D3 bestaande knoppen staan er nog', ['#acbKopieer', '#acbBekijk', '#acbMail', '#acbNieuw', '#acbOpvolg'].every(s => !!ctx.body.querySelector(s)));
    const o = venster(OUD);
    ok('D4 oude versie had de knop niet', !o.ctx.body.querySelector('#acbVerleng'));
  }
  for (const st of ['akkoord', 'afgekeurd']) {
    const { ctx } = venster(NIEUW, { status: st });
    ok('D5 link ' + st + ': geen knop, geen regel', !ctx.body.querySelector('#acbVerleng') && ctx.body.innerHTML.indexOf('Geldig tot') < 0);
  }
  {
    const { ctx } = venster(NIEUW, null, { offerteConfig: { geldigTot: '2026-11-20', klanttype: 'particulier' } });
    ok('D6 verlopen link: rood gemeld, knop staat er', ctx.body.innerHTML.indexOf('Verlopen op 20 november 2026') > 0 && !!ctx.body.querySelector('#acbVerleng'));
  }
  {
    const { ctx, c, rij } = venster(NIEUW);
    klik(ctx, '#acbVerleng');
    const inp = ctx.body.querySelector('#acbVerlDatum'), ta = ctx.body.querySelector('#acbVerlTekst'), vink = ctx.body.querySelector('#acbVerlMail');
    ok('D7 verlengvenster: datumveld met voorstel vandaag + 21', inp && inp.value === '2026-12-15' && inp.getAttribute('min') === VANDAAG);
    ok('D8 verlengvenster: vinkje aan, tekst voorgevuld', vink && vink.checked && ta.value.indexOf('15 december 2026') > 0 && ta.value.indexOf('Geachte heer Jansen,') === 0);
    ok('D9 knoptekst met mail', ctx.body.querySelector('#acbVerlOk').textContent === 'Verlengen en mailen');
    inp.value = '2026-12-31'; inp.dispatchEvent(new ctx.dom.window.Event('change'));
    ok('D10 andere datum: tekst gaat mee', ta.value.indexOf('31 december 2026') > 0 && ta.value.indexOf('15 december') < 0);
    ta.value = 'Eigen tekst'; inp.value = '2027-01-05'; inp.dispatchEvent(new ctx.dom.window.Event('change'));
    ok('D11 eigen tekst wordt niet overschreven', ta.value === 'Eigen tekst');
    ta.value = 'Geachte heer Jansen, geldig tot 5 januari 2027.';
    klik(ctx, '#acbVerlOk'); await wacht();
    ok('D12 verlengen en mailen: calculatie gezet', JSON.stringify(ctx.log.cfgZet) === JSON.stringify([{ geldigTot: '2027-01-05' }]));
    ok('D13 verlengen en mailen: mail met eigen tekst', ctx.log.mails.length === 1 && ctx.log.mails[0].tekst.indexOf('5 januari 2027') > 0);
    ok('D14 groene melding en venster ververst', ctx.log.toasts.length === 1 && ctx.log.toasts[0].soort === 'ok' && ctx.log.herlaad === 1);
    ok('D15 geen bevestigingsvraag nodig', ctx.log.confirms.length === 0);
  }
  {
    const { ctx } = venster(NIEUW);
    klik(ctx, '#acbVerleng');
    const vink = ctx.body.querySelector('#acbVerlMail');
    vink.checked = false; vink.dispatchEvent(new ctx.dom.window.Event('change'));
    ok('D16 vinkje uit: tekstblok weg, knop heet Verlengen', ctx.body.querySelector('#acbVerlMailBlok').style.display === 'none' && ctx.body.querySelector('#acbVerlOk').textContent === 'Verlengen');
    klik(ctx, '#acbVerlOk'); await wacht();
    ok('D17 vinkje uit: verlengd zonder mail', ctx.log.cfgZet.length === 1 && ctx.log.mails.length === 0 && ctx.log.toasts[0].soort === 'ok');
  }
  {
    const { ctx } = venster(NIEUW);
    klik(ctx, '#acbVerleng');
    ctx.body.querySelector('#acbVerlDatum').value = '2026-11-28';
    klik(ctx, '#acbVerlOk'); await wacht();
    ok('D18 zelfde datum: melding, niets geschreven', ctx.log.cfgZet.length === 0 && ctx.log.toasts.length === 1 && ctx.log.herlaad === 0);
    ctx.body.querySelector('#acbVerlDatum').value = '';
    klik(ctx, '#acbVerlOk'); await wacht();
    ok('D19 lege datum: melding, niets geschreven', ctx.log.cfgZet.length === 0 && ctx.log.toasts.length === 2);
    ctx.body.querySelector('#acbVerlDatum').value = '2026-12-15'; ctx.body.querySelector('#acbVerlTekst').value = '   ';
    klik(ctx, '#acbVerlOk'); await wacht();
    ok('D20 lege mailtekst: melding, niets geschreven', ctx.log.cfgZet.length === 0 && ctx.log.toasts.length === 3);
  }
  {
    const { ctx } = venster(NIEUW, null, null, { confirm: false });
    klik(ctx, '#acbVerleng');
    ctx.body.querySelector('#acbVerlDatum').value = '2026-11-26'; // korter dan 28-11; tekst noemt 15 december
    klik(ctx, '#acbVerlOk'); await wacht();
    ok('D21 inkorten met nee op de vraag: niets geschreven', ctx.log.confirms.length >= 1 && ctx.log.cfgZet.length === 0 && ctx.log.mails.length === 0);
  }
  {
    const { ctx } = venster(NIEUW, { gemaild_op: null });
    klik(ctx, '#acbVerleng');
    ok('D22 nog niet gemaild: geen vinkje, wel uitleg', !ctx.body.querySelector('#acbVerlMail') && ctx.body.innerHTML.indexOf('nog niet vanuit de app gemaild') > 0);
    klik(ctx, '#acbVerlOk'); await wacht();
    ok('D23 nog niet gemaild: verlengen zonder mail werkt', ctx.log.cfgZet.length === 1 && ctx.log.mails.length === 0);
  }
  {
    const { ctx } = venster(NIEUW);
    ctx._zetWachtrij({ calcId: 'C1', rows: [{ token: 'T1', status: 'gepland', gepland_op: '2026-11-25T07:00:00Z' }], fout: '' });
    klik(ctx, '#acbVerleng');
    ok('D24 verzending ingepland: geen vinkje', !ctx.body.querySelector('#acbVerlMail') && ctx.body.innerHTML.indexOf('nog een verzending ingepland') > 0);
  }
  {
    const { ctx } = venster(NIEUW, null, null, { cfgSchrijfFout: true });
    klik(ctx, '#acbVerleng'); klik(ctx, '#acbVerlOk'); await wacht();
    const t = ctx.log.toasts[0] || {};
    ok('D25 schrijffout: rode melding "niets gewijzigd", knoppen weer bruikbaar', t.soort === 'err' && t.t.indexOf('Er is niets gewijzigd') > 0 && ctx.body.querySelector('#acbVerlOk').disabled === false && ctx.log.herlaad === 0);
  }
  {
    const { ctx } = venster(NIEUW, null, { status: 'verloren' });
    klik(ctx, '#acbVerleng');
    ok('D26 calculatie niet op Verzonden: waarschuwing over de opvolging', ctx.body.innerHTML.indexOf('De calculatie staat op Verloren') > 0);
    klik(ctx, '#acbVerlTerug');
    ok('D27 Terug: het gewone venster staat er weer', !!ctx.body.querySelector('#acbVerleng') && !ctx.body.querySelector('#acbVerlOk'));
  }

  // ---- E. het opvolgblok: VvE wordt nu herkend, particulier blijft gelijk ----
  {
    const rij = { status: 'open', automaat_uit: false, gemaild_op: '2026-11-03T08:00:00Z', snapshot: { geldigTot: '2026-12-15' } };
    const part = { offerteConfig: { klanttype: 'particulier', geldigTot: '2026-12-15' } };
    const vve = { offerteConfig: { klanttype: 'vve', geldigTot: '2026-12-15' } };
    const o = omgeving(OUD), n = omgeving(NIEUW);
    ok('E1 particulier: opvolgblok gelijk aan v4.129.1', o._opvolgBlokHtml(part, rij) === n._opvolgBlokHtml(part, rij));
    ok('E2 VvE: oude versie toonde maildatums', o._opvolgBlokHtml(vve, rij).indexOf('niet bij een VvE') < 0);
    ok('E3 VvE: nieuwe versie zegt "niet bij een VvE"', (n._opvolgBlokHtml(vve, rij).match(/niet bij een VvE/g) || []).length === 3);
    const rijZonder = { status: 'open', automaat_uit: false, gemaild_op: '2026-11-03T08:00:00Z', snapshot: {} };
    ok('E4 geen datum in de link: nieuwe versie valt terug op de calculatie', n._opvolgBlokHtml(part, rijZonder).indexOf('geen geldig-tot-datum bekend') < 0 && o._opvolgBlokHtml(part, rijZonder).indexOf('geen geldig-tot-datum bekend') > 0);
    ok('E5 na verlengen toont het schema de nieuwe datum', n._opvolgBlokHtml(part, Object.assign({}, rij, { snapshot: { geldigTot: '2027-01-05' } })).indexOf('15 januari') > 0);
  }

  // ---- F. wat niet mocht veranderen ----
  {
    const zelfde = ['_offerteMailen', '_offerteVerzendCall', '_accordNieuweLink', 'setCalcStatus', '_offCfgGerichtZetten', '_offCfgVersLezen',
      '_ohpOpvolgBlokHtml', '_accordRenderVerlopen', '_accordPaginaTonen', '_wachtrijInplannen', '_wachtrijBlokHtml', '_offGeldigDagenNorm', '_offCfgDatum', 'accordLinkBeheer'];
    const anders = zelfde.filter(n => OUD.fn[n] !== NIEUW.fn[n]);
    gelijk('F1 veertien bestaande functies letterlijk gelijk', anders, []);
    const gewijzigd = Object.keys(OUD.fn).filter(n => NIEUW.fn[n] !== OUD.fn[n]).sort();
    gelijk('F2 precies twee bestaande functies gewijzigd', gewijzigd, ['_accordBeheerRender', '_opvolgBlokHtml']);
    const nieuw = Object.keys(NIEUW.fn).filter(n => !(n in OUD.fn)).sort();
    gelijk('F3 precies tien nieuwe functies', nieuw, ['_accordVerlengen', '_verlengControle', '_verlengGeldigeDatum', '_verlengMailKan', '_verlengMailTekst', '_verlengMelding', '_verlengRegelHtml', '_verlengSnapshot', '_verlengStandaardDatum', '_verlengUitvoeren']);
    ok('F4 geen functie verdwenen', Object.keys(OUD.fn).every(n => n in NIEUW.fn));
  }

  console.log((fout ? 'NIET GOED' : 'GOED') + ': ' + goed + ' controles goed, ' + fout + ' fout');
  process.exit(fout ? 1 : 0);
})().catch(e => { console.error('TEST GECRASHT', e); process.exit(3); });
