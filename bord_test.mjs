// Runtime-test van de kennisgevingsregels in planning.html (brok 7) met synthetische gegevens.
// Haalt de benodigde functies uit het script van planning.html en draait ze in Node zonder DOM.
import { readFileSync } from "node:fs";
const html = readFileSync(new URL("./planning.html", import.meta.url), "utf8");
const script = html.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/)[1];

function pakFunctie(naam) {
  const re = new RegExp("(?:^|\\n)(async )?function " + naam + "\\s*\\(");
  const m = re.exec(script); if (!m) throw new Error("functie niet gevonden: " + naam);
  let i = m.index + (m[0].startsWith("\n") ? 1 : 0);
  let j = script.indexOf("{", i), diepte = 0;
  for (; j < script.length; j++) { const c = script[j]; if (c === "{") diepte++; else if (c === "}") { diepte--; if (!diepte) break; } }
  return script.slice(i, j + 1);
}
function pakConst(naam) { const m = script.match(new RegExp("\\nconst " + naam + " = [^\\n]*\\n")); if (!m) throw new Error("const niet gevonden: " + naam); return m[0]; }

const functies = ["vanIso", "naarIso", "yoobiDatum", "maandagVan", "isoWeek", "fmtDatumLang", "fmtDatumKort", "weekTekst", "maandTekst", "periodeTekst", "zelfdePeriode",
  "isParaplu", "isVerborgen", "projDatums", "fasenVan", "faseVanDag", "projectStart", "kennisStart", "faseSleutel", "isEersteFase", "kennisFasen", "kennisNoteer",
  "kennisSleutels", "kennisVan", "urenEersteVan", "faseLabel", "nabelTaakVan", "werkdagenNa", "isOnderhoudsplan", "beurtenVanKlant", "opdrachtDrager", "isOpdrachtDrager",
  "opdrachtJarenLijst", "jarenTekst", "opdrachtJaren", "groepHeeftKennisgeving", "opdrachtUrenEerste", "decemberGrens", "kennisPeriodeTekst", "kennisStatus", "kennisTeNodig", "kennisVerschoven",
  "kennisBounce", "kennisNabellen", "kennisVorige", "kennisWerk", "kennisTekst", "kennisOnderwerp", "kennisAanhefVan", "aanhef", "startTijden", "startRegel", "thuisZin", "kennisTitel"];
const consts = ["PARAPLU_REGEL", "KENNIS_SOORTEN", "KENNIS_ALLE", "KENNIS_NAAM", "MAANDEN_LANG", "DAGEN_LANG", "KENNIS_NABEL_WERKDAGEN", "ONDERHOUD_HINT"];
const bron = consts.map(pakConst).join("\n") + "\n" + functies.map(pakFunctie).join("\n\n") +
  "\nfunction dagProjecten() { return []; }\nfunction klokNaWerk(m) { return m; }\nfunction hhmm(m) { return m; }\nfunction esc(s) { return String(s); }\n" +
  "\nreturn { kennisStatus, kennisTeNodig, kennisTekst, kennisOnderwerp, kennisNoteer, opdrachtJaren, opdrachtDrager, kennisPeriodeTekst, vanIso, kennisTitel, set(g) { Object.assign(S, g); } };";
// gedeelde toestand via één object S waar de functies naar verwijzen (let-variabelen in de echte pagina)
const S = { stand: null, planProjecten: {}, fasen: {}, urenEerste: {}, urenRijen: {}, kennis: {}, kennisOoitVerstuurd: {}, nabelAfgehandeld: {}, jaar: 2026, medewerkers: [] };
const bronMetToestand = Object.keys(S).map(k => `let ${k}; Object.defineProperty(globalThis, '${k}', { get: () => S.${k}, set: v => { S.${k} = v; }, configurable: true });`).join("\n") + "\n" + bron
  .replace(/\b(stand|planProjecten|fasen|urenEerste|urenRijen|kennis|kennisOoitVerstuurd|nabelAfgehandeld|jaar|medewerkers)\b(?=\s*[\[\.\)]|\s*&&|\s*\|\||\s*\?|\s*;|\s*,|\s*$)/g, "globalThis.$1");
const M = new Function("S", bronMetToestand)(S);

let n = 0, fout = 0;
function test(naam, fn) { n++; try { fn(); console.log("  ok   " + naam); } catch (e) { fout++; console.log("  FOUT " + naam + "\n       " + (e.message || e)); } }
function eq(a, b, wat) { const sa = JSON.stringify(a), sb = JSON.stringify(b); if (sa !== sb) throw new Error((wat || "") + " verwacht " + sb + ", kreeg " + sa); }
function reset(g) { for (const k of Object.keys(S)) S[k] = k === "jaar" ? 2026 : (k === "stand" ? null : (k === "medewerkers" ? [] : {})); Object.assign(S, g); }
const vandaagEcht = Date;
function zetVandaag(iso) { const vast = new vandaagEcht(iso + "T09:00:00"); globalThis.Date = class extends vandaagEcht { constructor(...a) { if (!a.length) return new vandaagEcht(vast); return new vandaagEcht(...a); } static now() { return vast.getTime(); } }; }
const P = (code, klant, naam, kc) => ({ code, klant, naam, klantcode: kc || klant, startdatum: "", einddatum: "" });

console.log("planning.html v0.27.0 — regels brok 7");

test("beurt zonder vinkje: gewone maandregel (maandag na uren)", () => {
  zetVandaag("2026-11-09");
  reset({ stand: { projecten: [P("A", "Trilsbeek", "Trilsbeek 2028 controlebeurt")] }, planProjecten: { A: { plan_start: "2028-06-05", plan_eind: "2028-06-05" } }, urenEerste: { A: "2026-11-02" } });
  eq(M.kennisTeNodig(S.stand.projecten[0], null), ["maand"]);
});

test("beurt mét vinkje: maandsignaal pas 1 december van het jaar ervoor; opdrachtsignaal nu", () => {
  zetVandaag("2026-11-09");
  const st = { projecten: [P("A", "Trilsbeek", "Trilsbeek 2028 controlebeurt"), P("B", "Trilsbeek", "Trilsbeek 2030 herschilderbeurt")] };
  reset({ stand: st, planProjecten: { A: { plan_start: "2028-06-05", plan_eind: "2028-06-05", onderhoudsplan: true }, B: { plan_start: "2030-06-03", plan_eind: "2030-06-06", onderhoudsplan: true } }, urenEerste: { A: "2026-11-02", B: "2026-11-02" } });
  const sA = M.kennisStatus(st.projecten[0], null), sB = M.kennisStatus(st.projecten[1], null);
  eq(Object.keys(sA), ["opdracht", "maand", "week", "dag"], "drager heeft opdracht vooraan");
  eq(Object.keys(sB), ["maand", "week", "dag"], "andere beurt geen opdracht-rij");
  eq(M.kennisTeNodig(st.projecten[0], null), ["opdracht"]);
  eq(M.kennisStatus(st.projecten[0], null).maand.vanaf.getTime(), new Date(2027, 11, 1).getTime(), "maand vanaf 1 dec 2027");
  eq(M.opdrachtJaren(st.projecten[1]), "2028 en 2030");
  eq(M.kennisOnderwerp(st.projecten[0], "opdracht", null), "Uw onderhoudsplan: planning van de beurten");
  const t = M.kennisTekst(st.projecten[0], "opdracht", "Geachte familie Trilsbeek,", null);
  if (!/ingepland in 2028 en 2030\./.test(t) || !/In december voorafgaand/.test(t)) throw new Error("opdrachttekst: " + t);
  eq(M.kennisPeriodeTekst(st.projecten[0], "opdracht", null), "2028 en 2030");
});

test("in december 2027: maandsignaal voor de beurt 2028, met onderhoudsplan-tekst; vervallen rij telt niet", () => {
  zetVandaag("2027-12-06");
  const st = { projecten: [P("A", "Trilsbeek", "Trilsbeek 2028 controlebeurt")] };
  reset({ stand: st, planProjecten: { A: { plan_start: "2028-06-05", plan_eind: "2028-06-05", onderhoudsplan: true } }, urenEerste: { A: "2026-11-02" } });
  M.kennisNoteer({ yoobi_code: "A", soort: "maand", overgeslagen: false, verzonden_op: "2026-11-09T10:36:00Z", start_bij_verzending: "2028-06-05", vervallen_op: "2026-11-09T14:00:00Z" });
  M.kennisNoteer({ yoobi_code: "A", soort: "opdracht", overgeslagen: false, verzonden_op: "2026-11-16T10:00:00Z", start_bij_verzending: "2028-06-05", bevestigd_op: "2026-11-16T12:00:00Z", bevestig_token: "t" });
  eq(M.kennisTeNodig(st.projecten[0], null), ["maand"]);
  eq(M.kennisOnderwerp(st.projecten[0], "maand", null), "Onderhoudsplan, beurt 2028: juni 2028");
  const t = M.kennisTekst(st.projecten[0], "maand", "Geachte familie Trilsbeek,", null);
  if (!/Zoals afgesproken in uw onderhoudsplan staat de onderhoudsbeurt \(Trilsbeek 2028 controlebeurt\) voor komend jaar voorlopig ingepland in juni 2028\./.test(t)) throw new Error(t);
});

test("beurt dit jaar met vinkje: decembergrens ligt in het verleden, gewone regel", () => {
  zetVandaag("2026-11-09");
  const st = { projecten: [P("A", "Voncken", "Voncken onderhoudsbeurt 2027")] };
  reset({ stand: st, planProjecten: { A: { plan_start: "2026-12-14", plan_eind: "2026-12-15", onderhoudsplan: true } }, urenEerste: { A: "2026-11-02" } });
  eq(M.kennisTeNodig(st.projecten[0], null), ["opdracht", "maand"]);
});

test("opdracht: nabellen na 3 werkdagen, gedekt door bevestigde maandmail", () => {
  zetVandaag("2027-12-13");
  const st = { projecten: [P("A", "K", "K 2028 beurt")] };
  reset({ stand: st, planProjecten: { A: { plan_start: "2028-06-05", plan_eind: "2028-06-05", onderhoudsplan: true } }, urenEerste: { A: "2026-11-02" } });
  M.kennisNoteer({ yoobi_code: "A", soort: "opdracht", overgeslagen: false, verzonden_op: "2027-12-06T10:00:00Z", start_bij_verzending: "2028-06-05", bevestig_token: "t" });
  eq(M.kennisStatus(st.projecten[0], null).opdracht.nabellen, true);
  M.kennisNoteer({ yoobi_code: "A", soort: "maand", overgeslagen: false, verzonden_op: "2027-12-07T10:00:00Z", start_bij_verzending: "2028-06-05", bevestig_token: "t", bevestigd_op: "2027-12-08T10:00:00Z" });
  const s = M.kennisStatus(st.projecten[0], null);
  eq([s.opdracht.nabellen, s.opdracht.gedektDoor], [false, "maand"]);
});

test("gewoon project: geen opdracht-rij, geen decembergrens (regressie)", () => {
  zetVandaag("2026-11-09");
  const st = { projecten: [P("Q", "VvE", "VvE Von Clermontpark")] };
  reset({ stand: st, planProjecten: { Q: { plan_start: "2027-06-07", plan_eind: "2027-06-11" } }, urenEerste: { Q: "2026-10-26" } });
  const s = M.kennisStatus(st.projecten[0], null);
  eq(Object.keys(s), ["maand", "week", "dag"]);
  eq(M.kennisTeNodig(st.projecten[0], null), ["maand"]);
  eq(M.kennisTitel("maand") + "|" + M.kennisTitel("opdracht"), "Maandkennisgeving|Opdrachtbevestiging");
});

globalThis.Date = vandaagEcht;
console.log(fout ? `\n${fout} van ${n} tests FOUT` : `\nalle ${n} tests goed`);
process.exit(fout ? 1 : 0);
