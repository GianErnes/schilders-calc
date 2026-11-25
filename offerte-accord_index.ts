// =====================================================================
// Supabase Edge Function: offerte-accord
// Publieke endpoint voor accord-via-link. Werkt met de service-sleutel en
// valt buiten RLS. Valideert het token, geeft de bevroren offerte terug en
// schrijft akkoord / afkeuren / vraag weg. Zet bij akkoord de calculatie op
// geaccepteerd, bij afkeuren op verloren.
//
// v3.95.0 — Resend-mails (deel 1):
//   * Bij akkoord: bevestiging naar de klant (mail B) + seintje naar info@ (mail C).
//   * Bij afkeuren of vraag: alleen seintje naar info@ (mail C).
//   Het versturen zit volledig in try/catch en kan de accord-registratie nooit
//   breken: faalt een mail, dan wordt de reactie nog steeds vastgelegd.
//   Vereist de secret RESEND_API_KEY (Supabase -> Edge Functions -> Secrets).
//
// v4.11.0 — Mail B bevat nu een groene knop naar de accordeerpagina
//   (?accord=TOKEN). Daar staat voor de klant de downloadknop van zijn
//   getekende exemplaar (bevroren offerte plus akkoordbevestiging).
//
// v4.12.0 — Verloopcontrole op de geldig-tot-datum:
//   * De vervaldatum komt uit calculaties.offerte_config.geldigTot (yyyy-mm-dd),
//     dus niet uit het snapshot. Daardoor werkt de controle ook voor bestaande
//     links van vóór deze versie.
//   * GET geeft geldig_tot en verlopen terug. Is een nog open link verlopen,
//     dan gaat de snapshot niet meer mee naar de browser (document dicht).
//   * POST weigert akkoord en afkeuren op een verlopen link (HTTP 410).
//     Vraag stellen blijft mogelijk zolang de link open is.
//   * Reeds beantwoorde links (akkoord of afgekeurd) blijven volledig werken.
//   * Geen of een onleesbare datum blokkeert niets (bestaand gedrag blijft).
//
// v4.14.0 — Openings-signaal:
//   * Elke opening van de accordeerpagina (GET) wordt geregistreerd in de
//     kolommen eerste_geopend_op, laatst_geopend_op en geopend_aantal
//     (eenmalige SQL al uitgevoerd).
//   * Bij de allereerste opening gaat een seintje naar info@ (mail D).
//   * Openingen met ?intern=1 (de knop Zelf bekijken in het beheer-venster)
//     tellen niet mee en sturen geen mail.
//   * Registreren en mailen zitten in try/catch en kunnen het tonen van de
//     offerte nooit breken.
//
// v4.35.0 — Afwijzen mag ook na het verlopen (opvolgautomaat):
//   * De verlopen-mail vraagt de klant alsnog om een reactie. Afwijzen moet dan
//     kunnen, anders stuurt die mail hem naar een dichte deur. Een afwijzing na
//     de vervaldatum kost niets en haalt de offerte uit de werkvoorraad.
//   * Akkoord blijft wél dicht (HTTP 410): een prijs van weken geleden mag niet
//     alsnog bindend worden. De klant krijgt de melding dat wij een nieuwe
//     offerte met actuele prijzen maken.
//   * Het interne seintje vermeldt of de afwijzing na het verlopen kwam.
//   * GET geeft afwijzen_mogelijk terug, zodat de accordeerpagina weet welke
//     knoppen ze mag tonen.
//
// v4.40.0 — De PDF gaat achter een verlopende link (opruimpunt 19):
//   * WAAROM. De bak accord-pdf staat openbaar en het bestand heet
//     {token}.pdf. De token staat in de accordeerlink die de klant per mail
//     kreeg. Wie die mail heeft, kan het bestand dus rechtstreeks bij de
//     opslag opvragen, buiten deze functie om. De verloopcontrole van
//     v4.12.0 zit op de deur, het document lag ernaast op straat. Gemeten
//     en bevestigd op 2 augustus 2026 door een verlopen token in een
//     uitgelogde browser te openen: de PDF kwam gewoon tevoorschijn.
//   * WAT ER NU GEBEURT. Deze functie geeft niet langer de opgeslagen
//     publieke URL door, maar maakt bij elke opening een verse ondertekende
//     link die na PDF_LINK_MINUTEN vervalt. De bak kan daarna dicht.
//   * WIE ER NOG BIJ MAG:
//       - open en niet verlopen      -> document, zoals altijd
//       - akkoord, binnen 30 dagen   -> document (mail B stuurt de klant
//                                       hierheen voor zijn exemplaar)
//       - akkoord, ouder dan 30 dagen-> dicht
//       - afgekeurd                  -> dicht
//       - open en verlopen           -> dicht (bestond al sinds v4.12.0)
//   * TWEE GEDRAGSVERANDERINGEN, bewust:
//       1. Een afgekeurde link toonde de offerte tot nu toe onbeperkt. Dat is
//          nu dicht. De pagina blijft wel melden dát er is afgewezen, want
//          dat loopt via status en niet via het document.
//       2. Bij "dicht" gaat de hele snapshot niet mee, ook de HTML-terugval
//          niet. Anders zou de oude weg alsnog de offerte tonen en was de
//          afscherming alleen op de PDF geplakt.
//   * OUDE LINKS ZONDER PDF (drie stuks, van vóór v3.79.0) houden hun
//     HTML-momentopname zolang ze open en niet verlopen zijn. Daar valt
//     niets te ondertekenen, die hebben geen bestand in de bak.
//   * TERUGDRAAIEN: zet de bak terug op openbaar en plak de vorige versie
//     van deze functie. Er is niets aan de gegevens veranderd.
//
// v4.51.0 (2026-08-29) — ACCORDEERLINK VOOR ONDERHOUDSPLANNEN (plan-tak):
//   * Nieuwe kolommen onderhoudsplan_id en betaalkeuze op offerte_accorderingen
//     (SQL 29-08-2026, gedraaid en bevestigd). Leeg = gewone offerte-link,
//     gevuld = link bij een onderhoudsplan. calculatie_id blijft ook bij
//     plannen gevuld: naam en klant komen daar vandaan.
//   * GET geeft extra terug: soort ('offerte' of 'plan'), betaalmodel van het
//     plan, keuze_nodig (plan op betaalmodel beide, nog open en niet
//     verlopen) en de vastgelegde betaalkeuze. De geldigheid van een planlink
//     komt uit onderhoudsplannen.offerte_config.geldigTot, met het bevroren
//     snapshot.geldigTot als terugval. De calculatie-config telt daar niet:
//     die hoort bij de schilderbeurt.
//   * POST bij een plan: akkoord of afwijzen zet onderhoudsplannen.status om
//     (geaccepteerd of verloren). Bij akkoord op betaalmodel beide is de
//     keuze verplicht (besluit Gian 29-08-2026: geen akkoord zonder keuze)
//     en gaat hij zowel in de kolom betaalkeuze op de rij als in
//     onderhoudsplannen.betaalmodel. De calculatie wordt bij een plan NIET
//     aangeraakt: die kan al lang afgerond en afgerekend zijn.
//   * Mails B, C en D spreken bij een plan over het onderhoudsplan. Mail B
//     bevestigt de gekozen betaalweg met de zin uit de bijlage ("daarmee ligt
//     het vast") en noemt geen downloadwoorden: een planlink heeft geen
//     bevroren PDF, de knop opent de pagina met plan en akkoordbevestiging.
//   * Offerte-links gedragen zich als voorheen; de plan-tak is overal een
//     aparte aftakking op isPlan.
//
// v4.56.0 (2026-08-30) — EIGEN PLANNAAM:
//   * Onderhoudsplannen hebben sinds app v4.56.0 een eigen naam (kolom naam;
//     leeg = terugval op de calc-naam). Die naam gaat hier voor de calc-naam
//     in de kopregel van de klantpagina (veld project in het GET-antwoord),
//     in mail B en in de seintjes C en D. De bestaande embeds lezen de kolom
//     mee; offerte-links veranderen niet.
//
// v4.91.0 (2026-10-12) — HOUTROT-OPGAVE (derde tak, isHoutrot):
//   * Nieuwe kolom oplevering_id op offerte_accorderingen (sql/
//     houtrot_03_accord.sql, gedraaid en 6x GOED op 12-10-2026). Gevuld =
//     link bij een houtrot-opgave uit oplevering.html (v0.4.0). Zo'n link
//     heeft GEEN calculatie: calculatie_id is leeg (de kolom mag dat sinds
//     dezelfde SQL). Een check-constraint houdt de drie kapstokken uit
//     elkaar: offerte (calculatie), plan (calculatie + plan) of houtrot
//     (alleen oplevering).
//   * GET: projectnaam en klant komen uit opleveringen (embed via de nieuwe
//     foreign key); de geldigheid uit snapshot.geldigTot (de oplever-app zet
//     die op vandaag + 14 dagen). soort: 'houtrot'. Openingsregistratie,
//     verloopcontrole, magDocumentZien en de verse PDF-link werken
//     ongewijzigd: een houtrot-link heeft wél een PDF in de bak accord-pdf.
//   * POST: akkoord of afwijzen zet opleveringen.status op 'akkoord' of
//     'afgewezen' (toegestaan door opleveringen_status_check sinds
//     houtrot_02). Geen betaalkeuze. calculaties en onderhoudsplannen
//     blijven onaangeraakt.
//   * Mails: B-variant "Bevestiging akkoord houtrotherstel <label>" met de
//     knop naar de pagina (de PDF is er, dus downloadwoorden mogen); C en D
//     spreken over de houtrot-opgave. Het label is het opgavenummer uit het
//     snapshot plus de projectnaam.
//   * Offerte- en planlinks gedragen zich als voorheen. De embed op
//     calculaties(...) geeft bij een lege calculatie_id gewoon null terug,
//     daar leunt de houtrot-tak nergens op.
//
// v4.131.0 (2026-11-25) — ONLINE KIEZEN (de klant stelt zijn offerte samen):
//   * Nieuwe kolommen optiekeuze en optie_verwerkt_op op offerte_accorderingen
//     (sql/opties_04_online.sql, gedraaid op 25-11-2026). De kolom cijfers
//     bestond al; deze functie las hem tot nu toe niet.
//   * WANNEER. Alleen bij een offerte-link waarvan cijfers.opties het
//     merkteken online = 1 draagt. Dat merkteken zet de app vanaf v4.131.0 bij
//     het maken van de link, en alleen als de offerte op de basis staat en
//     elke samenstelling is doorgerekend. Links van vóór die versie, planlinks
//     en houtrot-opgaven hebben het niet en gedragen zich exact als voorheen.
//   * GET geeft bij een open, niet verlopen link met merkteken het veld opties
//     mee: per optie nummer, titel, klanttekst en meerprijs, en per
//     samenstelling het totaal excl. en incl. Alleen wat de pagina nodig
//     heeft; de rest van cijfers (regels, staart, uren) gaat niet naar de
//     browser. Na een akkoord geeft GET de vastgelegde optiekeuze terug.
//   * POST akkoord neemt van de browser alleen de gekozen ids aan (veld
//     opties). Deze functie controleert dat elke id bij deze link hoort, zoekt
//     het bedrag zelf op in de tabel van de link en legt keuze en bedrag vast
//     in optiekeuze. Een bedrag uit de browser wordt nooit gelezen. Een
//     onbekende id, een dubbele id of een samenstelling die niet in de tabel
//     staat wordt geweigerd (HTTP 400) en er wordt niets vastgelegd. Geen veld
//     opties = akkoord op de basisuitvoering (besluit Gian 22-11-2026: niets
//     aanvinken is akkoord op de basis).
//   * BEDRAG (besluit Gian 25-11-2026, keuze 1a): bij een akkoord met online
//     keuze wordt de kolom bedrag het gekozen totaal incl. btw. Het
//     basisbedrag blijft staan in optiekeuze.basisIncl en in cijfers.
//   * De calculatie zelf wordt hier NIET in de gekozen samenstelling gezet:
//     dat doet de app bij het openen van de calculatie, met de rekenregels
//     die daar staan, en hij rekent het totaal na op de cent.
//   * Mail B noemt de gekozen opties en het totaal; mail C krijgt de regels
//     "Keuze klant" en "Totaal samenstelling". Groot en klein volgen het
//     klanttype (particulier incl. btw voorop, zakelijk en VvE excl. btw).
//   * DUBBEL VERSTUREN DICHT (besluit Gian 25-11-2026, keuze 3a): het akkoord
//     of de afwijzing wordt alleen geschreven als de link op dat moment nog
//     open staat (voorwaarde status = open in de schrijfopdracht zelf). Van
//     twee gelijktijdige klikken wint er één; de andere krijgt "reeds
//     afgehandeld" (HTTP 409) en er gaat geen tweede mail uit. Dit geldt voor
//     alle drie de soorten links.
//   * TERUGDRAAIEN: de vorige versie (43) terugzetten. De twee kolommen mogen
//     blijven staan; versie 43 leest ze niet.
//
// Deploy: Supabase Studio -> Edge Functions -> functie "offerte-accord" ->
// deze code plakken -> Deploy.
// JWT-verificatie mag AAN blijven: de klantpagina stuurt de anon-sleutel mee,
// en dat is een geldige JWT. De anon-sleutel geeft geen tabeltoegang
// (grants zijn ingetrokken), dus de beveiliging blijft heel.
// SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY worden automatisch door het
// platform geleverd. Niets handmatig instellen.
// =====================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOW_ORIGIN = "https://gianernes.github.io";

const cors = {
  "Access-Control-Allow-Origin": ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ---------------------------------------------------------------------
// v4.40.0 — instellingen voor de verlopende PDF-link
// ---------------------------------------------------------------------
const ACCORD_PDF_BUCKET = "accord-pdf";
// Hoe lang een verse link geldig is. Ruim genoeg om te bekijken en te
// downloaden, kort genoeg om doorsturen zinloos te maken.
const PDF_LINK_MINUTEN = 60;
// Hoe lang de klant na zijn akkoord nog bij zijn exemplaar mag. Vastgesteld
// door Gian op 2 augustus 2026. Daarna vraagt hij het bij ons op.
const AKKOORD_INZAGE_DAGEN = 30;

// ---------------------------------------------------------------------
// v3.95.0 — Resend-mails
// ---------------------------------------------------------------------
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const MAIL_FROM = "Ernes Schilders <info@ernes.nl>"; // 2026-10-20: was offerte@, zie spam-onderzoek
const MAIL_REPLY_TO = "info@ernes.nl";   // antwoorden van klanten komen hier binnen
const MAIL_NOTIFY = "info@ernes.nl";     // jouw interne seintje
const APP_URL = "https://gianernes.github.io/schilders-calc/";

// Eén verstuurpunt. Gooit nooit een fout omhoog: bij problemen alleen loggen,
// zodat de accord-registratie altijd doorgaat.
async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) { console.warn("RESEND_API_KEY ontbreekt — mail overgeslagen"); return; }
  if (!to) { console.warn("Geen ontvanger — mail overgeslagen"); return; }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [to],
        reply_to: MAIL_REPLY_TO,
        subject,
        html,
      }),
    });
    if (!r.ok) {
      console.warn("Resend fout " + r.status + ": " + (await r.text().catch(() => "")));
    }
  } catch (e) {
    console.warn("Resend uitzondering:", String(e));
  }
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// De volledige mailhandtekening van Ernes Schilders. Plaatjes staan openbaar op
// www.ernes.nl. Wil je dit ooit 1-op-1 gelijk trekken met de Gmail-handtekening,
// vervang dan deze HTML door de exacte HTML van Ed.
function handtekening(): string {
  return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#333333;font-size:14px;line-height:1.5;margin-top:18px;">
  <tr><td style="padding:0 0 8px 0;font-size:14px;color:#333333;">Met kleurrijke groet,</td></tr>
  <tr><td style="padding:0 0 10px 0;font-size:17px;font-weight:bold;color:#111111;">Gian Ernes</td></tr>
  <tr><td style="padding:0 0 4px 0;">
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:middle;padding:0 16px 0 0;">
        <img src="https://www.ernes.nl/images/handtekening/ernes-logo.png" width="185" alt="Ernes Schilders" style="display:block;border:0;outline:none;">
      </td>
      <td style="vertical-align:middle;border-left:3px solid #d2502a;padding:2px 0 2px 16px;font-size:14px;line-height:1.7;color:#333333;">
        <span style="color:#8a8a8a;">M</span>&nbsp;06-21220045<br>
        <span style="color:#8a8a8a;">E</span>&nbsp;<a href="mailto:administratie@ernes.nl" style="color:#1a5fb4;text-decoration:none;">administratie@ernes.nl</a><br>
        <span style="color:#8a8a8a;">W</span>&nbsp;<a href="https://www.ernes.nl" style="color:#1a5fb4;text-decoration:none;">www.ernes.nl</a><br>
        <span style="color:#8a8a8a;">A</span>&nbsp;Koperslager 2, 6422 PR Heerlen
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:12px 0 10px 0;border-top:1px solid #e0e0e0;font-size:14px;font-weight:bold;color:#1a5fb4;">
    &#11088; <a href="https://www.klantenvertellen.nl/reviews/1076744/ernes_schilders?from=widget&amp;lang=nl" style="color:#1a5fb4;text-decoration:none;font-weight:bold;">Lees wat klanten vertellen</a> &nbsp;|&nbsp; <a href="https://www.vakwerkplusgarantie.nl/bedrijven/ernes-schilders-heerlen/" style="color:#1a5fb4;text-decoration:none;font-weight:bold;">Ernes Schilders is een erkend schildersbedrijf</a>
  </td></tr>
  <tr><td style="padding:12px 0 0 0;border-top:1px solid #e0e0e0;">
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:middle;padding:0 14px 0 0;"><img src="https://www.ernes.nl/images/handtekening/onderhoudsgarantieplan.png" width="190" alt="Onderhoudsgarantieplan" style="display:block;border:0;outline:none;"></td>
      <td style="vertical-align:middle;padding:0 14px 0 0;"><img src="https://www.ernes.nl/images/handtekening/vakwerk_plusgarantie.png" width="64" alt="Vakwerk PlusGarantie" style="display:block;border:0;outline:none;"></td>
      <td style="vertical-align:middle;font-size:13px;color:#333333;line-height:1.4;"><strong>Erkend door</strong><br>Vakwerk PlusGarantie</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:10px 0 0 0;font-size:12px;color:#999999;">KvK 92481183</td></tr>
</table>`;
}

// ---------------------------------------------------------------------
// v4.131.0 — ONLINE KIEZEN: de tabel van de link lezen en een keuze toetsen.
// Deze vier functies raken het netwerk en de database niet; ze worden in de
// test los aangeroepen (test_online_v4.131.0.js).
// ---------------------------------------------------------------------
type OptieKeuze = {
  v: number;
  ids: string[];
  nrs: number[];
  titels: string[];
  excl: number;
  incl: number;
  basisExcl: number;
  basisIncl: number;
  klanttype: string;
  op: string;
};

// Bedrag in euro's, altijd op dezelfde manier geschreven (€ 1.234,56),
// onafhankelijk van de taalinstelling van de server.
function eurNL(n: unknown): string {
  const x = Number(n);
  if (!isFinite(x)) return "";
  const neg = x < 0;
  const centen = Math.round(Math.abs(x) * 100);
  const heel = Math.floor(centen / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const rest = (centen % 100).toString().padStart(2, "0");
  return (neg ? "-" : "") + "\u20ac " + heel + "," + rest;
}

function idsSleutel(ids: string[]): string {
  return ids.slice().sort().join(",");
}

// Geeft de optietabel van een link terug als de klant er online uit mag
// kiezen, anders null. Streng: ontbreekt het merkteken of klopt de vorm niet,
// dan is er geen online keuze en gedraagt de link zich als voorheen.
function leesOptieTabel(cijfers: unknown): Record<string, unknown> | null {
  if (!cijfers || typeof cijfers !== "object") return null;
  const t = (cijfers as Record<string, unknown>).opties;
  if (!t || typeof t !== "object") return null;
  const tab = t as Record<string, unknown>;
  if (tab.online !== 1) return null;
  const opties = tab.opties;
  const combi = tab.combi;
  if (!Array.isArray(opties) || !Array.isArray(combi)) return null;
  if (opties.length < 1 || opties.length > 8) return null;
  const gezien = new Set<string>();
  for (const o of opties) {
    if (!o || typeof o !== "object") return null;
    const id = (o as Record<string, unknown>).id;
    if (typeof id !== "string" || !id || gezien.has(id)) return null;
    gezien.add(id);
  }
  // De basis (niets gekozen) moet in de tabel staan met leesbare bedragen.
  const basis = combi.find((x) =>
    x && typeof x === "object" && Array.isArray((x as Record<string, unknown>).ids) &&
    ((x as Record<string, unknown>).ids as unknown[]).length === 0
  ) as Record<string, unknown> | undefined;
  if (!basis || !isFinite(Number(basis.excl)) || !isFinite(Number(basis.incl)) || basis.excl === null || basis.incl === null) return null;
  return tab;
}

function klanttypeVan(tab: Record<string, unknown>): string {
  const kt = String(tab.klanttype ?? "");
  return (kt === "zakelijk" || kt === "vve") ? kt : "consument";
}

// Wat de klantpagina nodig heeft om de vinkjes en het meelopende totaal te
// tonen. Bewust een eigen, smalle vorm: niets anders uit cijfers gaat mee.
function optiesVoorKlant(tab: Record<string, unknown>): Record<string, unknown> {
  const opties = (tab.opties as Record<string, unknown>[]).map((o, i) => {
    const nr = Number(o.nr);
    return {
      id: String(o.id),
      nr: (Number.isInteger(nr) && nr > 0) ? nr : i + 1,
      titel: String(o.titel ?? ""),
      klanttekst: String(o.klanttekst ?? ""),
      meerExcl: (o.meerExcl !== null && o.meerExcl !== undefined && isFinite(Number(o.meerExcl))) ? Number(o.meerExcl) : null,
      meerIncl: (o.meerIncl !== null && o.meerIncl !== undefined && isFinite(Number(o.meerIncl))) ? Number(o.meerIncl) : null,
    };
  });
  const combi = (tab.combi as unknown[])
    .filter((x) => x && typeof x === "object" && Array.isArray((x as Record<string, unknown>).ids))
    .map((x) => {
      const r = x as Record<string, unknown>;
      return { ids: (r.ids as unknown[]).map((id) => String(id)), excl: Number(r.excl), incl: Number(r.incl) };
    })
    .filter((x) => isFinite(x.excl) && isFinite(x.incl));
  const basis = combi.find((x) => x.ids.length === 0)!;
  return {
    klanttype: klanttypeVan(tab),
    basis: { excl: basis.excl, incl: basis.incl },
    opties,
    combi,
  };
}

// Toetst de ids uit de browser aan de tabel van de link en zoekt het bedrag
// op. De browser levert alleen ids; een bedrag wordt hier nergens aangenomen.
function kiesSamenstelling(
  tab: Record<string, unknown>,
  idsRaw: unknown,
): { ok: true; keuze: OptieKeuze } | { ok: false; fout: string } {
  const NIET = "Deze samenstelling is niet beschikbaar. Laad de pagina opnieuw of neem contact op met Ernes schilders.";
  const klant = optiesVoorKlant(tab);
  const opties = klant.opties as { id: string; nr: number; titel: string }[];
  const combi = klant.combi as { ids: string[]; excl: number; incl: number }[];
  let ids: unknown[];
  if (idsRaw === undefined || idsRaw === null) ids = [];
  else if (Array.isArray(idsRaw)) ids = idsRaw;
  else return { ok: false, fout: NIET };
  if (ids.length > opties.length) return { ok: false, fout: NIET };
  const bekend = new Set(opties.map((o) => o.id));
  const gekozen = new Set<string>();
  for (const id of ids) {
    if (typeof id !== "string" || !bekend.has(id) || gekozen.has(id)) return { ok: false, fout: NIET };
    gekozen.add(id);
  }
  // In de volgorde van de offerte, wat de browser ook stuurde.
  const inVolgorde = opties.filter((o) => gekozen.has(o.id));
  const sleutel = idsSleutel(inVolgorde.map((o) => o.id));
  const raak = combi.filter((x) => idsSleutel(x.ids) === sleutel);
  if (raak.length !== 1) return { ok: false, fout: NIET };
  const rij = raak[0];
  const basis = klant.basis as { excl: number; incl: number };
  if (!(rij.incl > 0) || !(rij.excl > 0) || rij.incl < rij.excl) return { ok: false, fout: NIET };
  return {
    ok: true,
    keuze: {
      v: 1,
      ids: inVolgorde.map((o) => o.id),
      nrs: inVolgorde.map((o) => o.nr),
      titels: inVolgorde.map((o) => "Optie " + o.nr + (o.titel ? ": " + o.titel : "")),
      excl: rij.excl,
      incl: rij.incl,
      basisExcl: basis.excl,
      basisIncl: basis.incl,
      klanttype: String(klant.klanttype),
      op: "",
    },
  };
}

// "basisuitvoering met optie 1 en 3" — voor mail C en de bevestiging.
function samenstellingNaam(nrs: number[]): string {
  if (!nrs.length) return "basisuitvoering, zonder opties";
  if (nrs.length === 1) return "basisuitvoering met optie " + nrs[0];
  return "basisuitvoering met optie " + nrs.slice(0, -1).join(", ") + " en " + nrs[nrs.length - 1];
}

// Het totaal in woorden; groot en klein volgen het klanttype (besluit Gian
// 22-11-2026): particulier incl. btw voorop, zakelijk en VvE excl. btw.
function totaalTekst(k: OptieKeuze): { groot: string; klein: string } {
  const zakelijk = k.klanttype === "zakelijk" || k.klanttype === "vve";
  return zakelijk
    ? { groot: eurNL(k.excl) + " excl. btw", klein: eurNL(k.incl) + " incl. btw" }
    : { groot: eurNL(k.incl) + " incl. btw", klein: eurNL(k.excl) + " excl. btw" };
}

// v4.131.0 — het blok in mail B met wat de klant koos en wat het kost.
function keuzeBlokMail(k: OptieKeuze | null): string {
  if (!k) return "";
  const t = totaalTekst(k);
  const kop = k.titels.length
    ? `<p style="margin:16px 0 4px 0;">U heeft gekozen voor de basisuitvoering met:</p>
  <ul style="margin:0 0 8px 0;padding-left:20px;">${k.titels.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
    : `<p style="margin:16px 0 8px 0;">U heeft gekozen voor de basisuitvoering, zonder opties.</p>`;
  return `${kop}
  <p style="margin:0 0 8px 0;">Totaal van uw samenstelling: <strong>${esc(t.groot)}</strong> (${esc(t.klein)}).</p>`;
}

// Mail B: bevestiging aan de klant bij akkoord.
// v4.11.0 — met knop naar de accordeerpagina voor het getekende exemplaar.
// v4.40.0 — de tekst noemt nu de termijn, zodat de klant weet dat hij het
// exemplaar beter kan bewaren dan de link.
// v4.131.0 — keuze (optioneel): de online gekozen samenstelling met het totaal.
function mailBevestiging(aanhef: string, offerteLabel: string, project: string, token: string, keuze: OptieKeuze | null = null): { subject: string; html: string } {
  const subject = "Bevestiging akkoord offerte " + offerteLabel;
  const accordUrl = APP_URL + "?accord=" + encodeURIComponent(token);
  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#222222;line-height:1.6;max-width:640px;">
  <p>Geachte ${esc(aanhef)},</p>
  <p>Dank voor uw akkoord op offerte ${esc(offerteLabel)}. Hierbij bevestigen wij de opdracht.</p>${keuzeBlokMail(keuze)}
  <p style="margin:24px 0 8px 0;">Uw getekende exemplaar met de akkoordbevestiging kunt u hier bekijken en downloaden:</p>
  <p style="margin:0 0 12px 0;">
    <a href="${accordUrl}"
       style="background:#1e8e3e;color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
      Uw getekende offerte bekijken en downloaden
    </a>
  </p>
  <p style="margin:0 0 24px 0;font-size:14px;color:#666666;">
    Deze link blijft ${AKKOORD_INZAGE_DAGEN} dagen bereikbaar. Bewaart u het bestand
    zelf even, dan heeft u het altijd bij de hand. Daarna sturen wij het op verzoek
    opnieuw toe.
  </p>
  <p>Wij nemen binnenkort contact met u op om de uitvoering en de planning af te stemmen.</p>
  ${handtekening()}
</div>`;
  return { subject, html };
}

// v4.51.0 — Mail B voor een onderhoudsplan. Zelfde opzet als de offerte-
// bevestiging, met de gekozen betaalweg erin als er wat te kiezen viel en
// zonder downloadwoorden: een planlink heeft geen bevroren PDF, de knop
// opent de pagina met het plan en de akkoordbevestiging.
function mailBevestigingPlan(aanhef: string, planLabel: string, token: string, betaalkeuze: string | null): { subject: string; html: string } {
  const subject = "Bevestiging akkoord onderhoudsplan " + planLabel;
  const accordUrl = APP_URL + "?accord=" + encodeURIComponent(token);
  const keuzeZin = betaalkeuze
    ? `<p>U heeft gekozen voor ${betaalkeuze === "abo" ? "maandelijkse betaling" : "betaling per beurt"}. Daarmee ligt het vast en hoeft u verder niets te regelen.</p>`
    : "";
  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#222222;line-height:1.6;max-width:640px;">
  <p>Geachte ${esc(aanhef)},</p>
  <p>Dank voor uw akkoord op onderhoudsplan ${esc(planLabel)}. Hierbij bevestigen wij de afspraak.</p>
  ${keuzeZin}
  <p style="margin:24px 0 8px 0;">Uw plan met de akkoordbevestiging kunt u hier teruglezen:</p>
  <p style="margin:0 0 12px 0;">
    <a href="${accordUrl}"
       style="background:#1e8e3e;color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
      Uw onderhoudsplan bekijken
    </a>
  </p>
  <p style="margin:0 0 24px 0;font-size:14px;color:#666666;">
    Deze link blijft ${AKKOORD_INZAGE_DAGEN} dagen bereikbaar. Daarna sturen wij het
    plan op verzoek opnieuw toe.
  </p>
  <p>Wij nemen contact met u op wanneer de eerste onderhoudsbeurt in de planning komt.</p>
  ${handtekening()}
</div>`;
  return { subject, html };
}

// v4.91.0 — Mail B voor een houtrot-opgave. Er is een PDF in de bak, dus de
// knop mag over bekijken en downloaden spreken. De slotzin zegt wat er nu
// gebeurt: het herstel wordt in het lopende werk ingepland.
function mailBevestigingHoutrot(aanhef: string, opgaveLabel: string, token: string): { subject: string; html: string } {
  const subject = "Bevestiging akkoord houtrotherstel " + opgaveLabel;
  const accordUrl = APP_URL + "?accord=" + encodeURIComponent(token);
  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#222222;line-height:1.6;max-width:640px;">
  <p>Geachte ${esc(aanhef)},</p>
  <p>Dank voor uw akkoord op de opgave houtrotherstel ${esc(opgaveLabel)}. Hierbij bevestigen wij de opdracht; het herstel nemen wij mee in het lopende schilderwerk.</p>
  <p style="margin:24px 0 8px 0;">De opgave met de akkoordbevestiging kunt u hier bekijken en downloaden:</p>
  <p style="margin:0 0 12px 0;">
    <a href="${accordUrl}"
       style="background:#1e8e3e;color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
      Uw opgave bekijken en downloaden
    </a>
  </p>
  <p style="margin:0 0 24px 0;font-size:14px;color:#666666;">
    Deze link blijft ${AKKOORD_INZAGE_DAGEN} dagen bereikbaar. Bewaart u het bestand
    zelf even, dan heeft u het altijd bij de hand. Daarna sturen wij het op verzoek
    opnieuw toe.
  </p>
  <p>Heeft u vragen over het herstel, dan hoort u het ons graag; een antwoord op deze mail komt rechtstreeks bij ons binnen.</p>
  ${handtekening()}
</div>`;
  return { subject, html };
}

// Mail C: intern seintje naar info@ bij elke reactie. Kaal en zakelijk.
// v4.51.0 — soortWoord ("offerte" of "onderhoudsplan") voor onderwerp en
// betaalkeuzeLabel voor de gekozen betaalweg bij een plan-akkoord.
// v4.91.0 — soortWoord kan ook "houtrot-opgave" zijn; nummerLabel ("Offertenummer"
// of "Opgavenummer") zet het juiste kopje bij het nummer.
// v4.131.0 — keuzeLabel en totaalLabel: de online gekozen samenstelling.
function mailSeintje(opts: {
  reactieLabel: string;
  klant: string;
  project: string;
  offertenummer: string;
  offerteLabel: string;
  naam: string;
  notitie: string;
  tijdstip: string;
  bevestigingVerstuurd?: boolean | null;
  soortWoord?: string;
  betaalkeuzeLabel?: string;
  nummerLabel?: string;
  keuzeLabel?: string;
  totaalLabel?: string;
}): { subject: string; html: string } {
  const subject = "Reactie op " + (opts.soortWoord || "offerte") + " " + opts.offerteLabel + ": " + opts.reactieLabel;
  const rij = (label: string, waarde: string) =>
    `<tr><td style="padding:2px 12px 2px 0;color:#888888;white-space:nowrap;vertical-align:top;">${esc(label)}</td><td style="padding:2px 0;color:#222222;">${esc(waarde) || "&mdash;"}</td></tr>`;
  let extra = "";
  if (opts.bevestigingVerstuurd === true) extra = rij("Bevestiging naar klant", "verstuurd");
  else if (opts.bevestigingVerstuurd === false) extra = rij("Bevestiging naar klant", "niet verstuurd (geen e-mailadres bekend)");
  let keuzeRij = "";
  if (opts.betaalkeuzeLabel) keuzeRij = rij("Betaalkeuze klant", opts.betaalkeuzeLabel);
  // v4.131.0 — online gekozen samenstelling; leeg bij elke andere link.
  if (opts.keuzeLabel) keuzeRij += rij("Keuze klant", opts.keuzeLabel);
  if (opts.totaalLabel) keuzeRij += rij("Totaal samenstelling", opts.totaalLabel);
  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222222;line-height:1.5;max-width:640px;">
  <p style="font-size:15px;">Er is een reactie binnengekomen op een ${opts.soortWoord || "offerte"}.</p>
  <table cellpadding="0" cellspacing="0" border="0" style="font-size:14px;">
    ${rij("Klant", opts.klant)}
    ${rij("Project", opts.project)}
    ${rij(opts.nummerLabel || "Offertenummer", opts.offertenummer)}
    ${rij("Reactie", opts.reactieLabel)}
    ${keuzeRij}
    ${rij("Naam ondertekenaar", opts.naam)}
    ${rij("Tijdstip", opts.tijdstip)}
    ${rij("Opmerking of reden", opts.notitie)}
    ${extra}
  </table>
  <p style="margin-top:14px;"><a href="${APP_URL}" style="color:#1a5fb4;">Open Schilders Calc</a> &mdash; te vinden onder "Reacties op offertes".</p>
</div>`;
  return { subject, html };
}

// v4.14.0 — Mail D: seintje bij de allereerste opening van de accordeerpagina.
// Kaal en zakelijk, in de stijl van mail C. Geopend is niet gereageerd.
// v4.51.0 — soortHoofd ("Offerte" of "Onderhoudsplan") en soortZin ("de
// offerte" of "het onderhoudsplan") zodat het seintje het juiste stuk noemt.
// v4.91.0 — nummerLabel, zie mail C.
function mailEersteOpening(opts: {
  klant: string;
  project: string;
  offertenummer: string;
  offerteLabel: string;
  tijdstip: string;
  soortHoofd?: string;
  soortZin?: string;
  nummerLabel?: string;
}): { subject: string; html: string } {
  const subject = (opts.soortHoofd || "Offerte") + " " + opts.offerteLabel + " voor het eerst geopend";
  const rij = (label: string, waarde: string) =>
    `<tr><td style="padding:2px 12px 2px 0;color:#888888;white-space:nowrap;vertical-align:top;">${esc(label)}</td><td style="padding:2px 0;color:#222222;">${esc(waarde) || "&mdash;"}</td></tr>`;
  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222222;line-height:1.5;max-width:640px;">
  <p style="font-size:15px;">De klant heeft ${opts.soortZin || "de offerte"} zojuist voor het eerst geopend.</p>
  <table cellpadding="0" cellspacing="0" border="0" style="font-size:14px;">
    ${rij("Klant", opts.klant)}
    ${rij("Project", opts.project)}
    ${rij(opts.nummerLabel || "Offertenummer", opts.offertenummer)}
    ${rij("Tijdstip", opts.tijdstip)}
  </table>
  <p style="margin-top:14px;">Geopend is nog geen reactie: de klant heeft de pagina bekeken. Reacties komen zoals altijd apart binnen.</p>
</div>`;
  return { subject, html };
}

function nuNL(): string {
  try {
    return new Date().toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam", dateStyle: "long", timeStyle: "short" });
  } catch {
    return new Date().toISOString();
  }
}

// ---------------------------------------------------------------------
// v4.12.0 — verloopcontrole op de geldig-tot-datum.
// De datum leeft in calculaties.offerte_config.geldigTot als yyyy-mm-dd.
// Geen of een onleesbare datum: nooit blokkeren (bestaand gedrag blijft).
// v4.51.0 — voor een planlink leeft de datum in
// onderhoudsplannen.offerte_config.geldigTot, met snapshot.geldigTot als
// terugval. leesYmdLos leest zo'n losse snapshotwaarde.
// v4.91.0 — voor een houtrot-link leeft de datum alleen in snapshot.geldigTot.
// ---------------------------------------------------------------------
function leesGeldigTot(cfg: unknown): string {
  if (!cfg || typeof cfg !== "object") return "";
  const raw = String((cfg as Record<string, unknown>).geldigTot ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
}

// v4.51.0 — losse yyyy-mm-dd lezen (snapshot.geldigTot van een planlink).
function leesYmdLos(v: unknown): string {
  const s = String(v ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

function vandaagNL(): string {
  try {
    // en-CA geeft yyyy-mm-dd, in Nederlandse tijd zodat de dag klopt.
    return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" });
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function isVerlopen(geldigTot: string): boolean {
  // Op de geldig-tot-dag zelf mag nog gereageerd worden; daarna is hij dicht.
  return !!geldigTot && vandaagNL() > geldigTot;
}

// ---------------------------------------------------------------------
// v4.40.0 — mag dit document nu nog getoond worden?
// Eén plek, zodat de regel niet op twee manieren kan uitvallen.
// ---------------------------------------------------------------------
function magDocumentZien(status: string, verlopen: boolean, gereageerdOp: unknown): boolean {
  if (status === "open") return !verlopen;
  if (status !== "akkoord") return false;   // afgekeurd en al het overige: dicht

  // Akkoord: nog inzage tot AKKOORD_INZAGE_DAGEN na de reactie.
  const raw = gereageerdOp ? String(gereageerdOp) : "";
  if (!raw) return true;                    // geen datum: niet dichtgooien
  const t = Date.parse(raw);
  if (!isFinite(t)) return true;            // onleesbaar: niet dichtgooien
  const dagen = (Date.now() - t) / 86400000;
  return dagen <= AKKOORD_INZAGE_DAGEN;
}

// v4.40.0 — verse ondertekende link op het bestand in de bak.
// Geeft null terug als er geen pad is of als het maken mislukt; de
// accordeerpagina valt dan terug op de HTML-momentopname.
async function versePdfLink(pdfPath: unknown): Promise<string | null> {
  const pad = String(pdfPath ?? "").trim();
  if (!pad) return null;
  try {
    const { data, error } = await sb
      .storage
      .from(ACCORD_PDF_BUCKET)
      .createSignedUrl(pad, PDF_LINK_MINUTEN * 60);
    if (error) {
      console.warn("Ondertekende link maken mislukt voor " + pad + ": " + error.message);
      return null;
    }
    return data?.signedUrl || null;
  } catch (e) {
    console.warn("Ondertekende link uitzondering voor " + pad + ": " + String(e));
    return null;
  }
}

// v4.91.0 — de drie kapstokken op één plek. Volgorde telt: een rij met
// oplevering_id is houtrot, ook als er ooit per ongeluk iets anders bij
// staat (de check-constraint uit houtrot_03 laat dat niet toe).
type Soort = "offerte" | "plan" | "houtrot";
function bepaalSoort(rij: Record<string, unknown>): Soort {
  if (rij.oplevering_id) return "houtrot";
  if (rij.onderhoudsplan_id) return "plan";
  return "offerte";
}

// v4.91.0 — projectnaam en klant per soort. Houtrot leest uit de oplevering;
// plan en offerte uit calculatie met de eigen plannaam ervoor (v4.56.0).
function projectEnKlant(rij: Record<string, unknown>, soort: Soort): { project: string; klant: string } {
  const calc = (rij.calculaties || null) as Record<string, unknown> | null;
  const plan = (rij.onderhoudsplannen || null) as Record<string, unknown> | null;
  const opl = (rij.opleveringen || null) as Record<string, unknown> | null;
  if (soort === "houtrot") {
    return {
      project: String(opl?.projectnaam ?? "").trim(),
      klant: String(opl?.klant ?? "").trim(),
    };
  }
  const planNaam = (soort === "plan" && plan && plan.naam && String(plan.naam).trim()) ? String(plan.naam).trim() : "";
  return {
    project: planNaam || String(calc?.naam ?? ""),
    klant: String(calc?.klant ?? ""),
  };
}

// v4.91.0 — de woorden per soort voor de seintjes C en D.
function woorden(soort: Soort): { soortWoord: string; soortHoofd: string; soortZin: string; nummerLabel: string } {
  if (soort === "houtrot") return { soortWoord: "houtrot-opgave", soortHoofd: "Houtrot-opgave", soortZin: "de houtrot-opgave", nummerLabel: "Opgavenummer" };
  if (soort === "plan") return { soortWoord: "onderhoudsplan", soortHoofd: "Onderhoudsplan", soortZin: "het onderhoudsplan", nummerLabel: "Offertenummer" };
  return { soortWoord: "offerte", soortHoofd: "Offerte", soortZin: "de offerte", nummerLabel: "Offertenummer" };
}

// v4.91.0 — geldig-tot per soort, één plek voor GET en POST.
function geldigTotVoor(rij: Record<string, unknown>, soort: Soort): string {
  const snap = (rij.snapshot && typeof rij.snapshot === "object") ? (rij.snapshot as Record<string, unknown>) : {};
  const calc = (rij.calculaties || null) as Record<string, unknown> | null;
  const plan = (rij.onderhoudsplannen || null) as Record<string, unknown> | null;
  if (soort === "houtrot") return leesYmdLos(snap.geldigTot);
  if (soort === "plan") return leesGeldigTot(plan?.offerte_config) || leesYmdLos(snap.geldigTot);
  return leesGeldigTot(calc?.offerte_config);
}

// v4.91.0 — de selects hieronder lezen alle drie de embeds (calculaties,
// onderhoudsplannen, opleveringen). Een lege calculatie_id of
// onderhoudsplan_id geeft null terug voor die embed; dat is bij een
// houtrot-link het normale geval. De select-tekst staat letterlijk in de
// aanroep: de typeparser van supabase-js kan geen samengestelde tekst lezen.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // ---------- OPHALEN: offerte, plan of houtrot-opgave tonen ----------
    if (req.method === "GET") {
      const url = new URL(req.url);
      const token = (url.searchParams.get("token") || "").trim();
      if (!token) return json({ error: "geen token" }, 400);

      // v4.131.0 — cijfers en optiekeuze lezen mee (online kiezen).
      const { data, error } = await sb
        .from("offerte_accorderingen")
        .select(
          "status, klant_naam, notitie, snapshot, bedrag, gereageerd_op, eerste_geopend_op, geopend_aantal, pdf_path, onderhoudsplan_id, oplevering_id, betaalkeuze, cijfers, optiekeuze, calculaties(naam, klant, offerte_config), onderhoudsplannen(naam, status, betaalmodel, ontvanger_type, offerte_config), opleveringen(projectnaam, klant, klant_email, status, btw_pct, opgave_nummer)",
        )
        .eq("token", token)
        .maybeSingle();

      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "onbekende link" }, 404);

      // v4.51.0 — plan-tak: gevulde onderhoudsplan_id betekent dat deze link
      // bij een onderhoudsplan hoort. Naam en klant blijven uit de calculatie
      // komen; geldigheid en gevolgen lopen via het plan.
      // v4.91.0 — houtrot-tak: gevulde oplevering_id. Naam en klant uit de
      // oplevering, geldigheid uit het snapshot.
      const rijObj = data as unknown as Record<string, unknown>;
      const soort = bepaalSoort(rijObj);
      const isPlan = soort === "plan";
      const plan = (rijObj.onderhoudsplannen || null) as Record<string, unknown> | null;
      const w = woorden(soort);

      // v4.56.0 — eigen plannaam gaat voor de calc-naam op de klantpagina en
      // in de seintjes. Leeg = calc-naam, als voorheen.
      const pk = projectEnKlant(rijObj, soort);
      const projectNaam = pk.project;

      // v4.14.0 — opening registreren en bij de allereerste een seintje sturen.
      // Interne openingen (?intern=1, de knop Zelf bekijken) slaan we over.
      // Alles niet-fataal: het tonen van de offerte gaat altijd door.
      const intern = url.searchParams.get("intern") === "1";
      if (!intern) {
        try {
          const nu = new Date().toISOString();
          const eersteKeer = !data.eerste_geopend_op;
          const { error: eOpen } = await sb
            .from("offerte_accorderingen")
            .update({
              eerste_geopend_op: data.eerste_geopend_op || nu,
              laatst_geopend_op: nu,
              geopend_aantal: (data.geopend_aantal || 0) + 1,
            })
            .eq("token", token);
          if (eOpen) {
            console.warn("Opening registreren mislukt:", eOpen.message);
          } else if (eersteKeer) {
            const snap = (data.snapshot && typeof data.snapshot === "object") ? (data.snapshot as Record<string, unknown>) : {};
            const project = projectNaam; // v4.56.0 — eigen plannaam gaat voor
            const klant = pk.klant;
            const offertenummer = String(snap.offertenummer || "").trim();
            const offerteLabel = offertenummer ? (offertenummer + " | " + project) : (project || "(zonder projectnaam)");
            const d = mailEersteOpening({
              klant, project, offertenummer, offerteLabel, tijdstip: nuNL(),
              soortHoofd: w.soortHoofd,
              soortZin: w.soortZin,
              nummerLabel: w.nummerLabel,
            });
            await sendMail(MAIL_NOTIFY, d.subject, d.html);
          }
        } catch (e) {
          console.warn("Openings-signaal mislukt (weergave gaat gewoon door):", String(e));
        }
      }

      // v4.12.0 — verlopen? Alleen relevant zolang de link nog open is.
      // v4.51.0 — bij een plan telt de geldigheid van het plan, niet die van
      // de calculatie: die hoort bij de schilderbeurt.
      // v4.91.0 — bij houtrot alleen snapshot.geldigTot.
      const geldigTot = geldigTotVoor(rijObj, soort);
      const verlopen = data.status === "open" && isVerlopen(geldigTot);

      // v4.40.0 — het document zelf.
      // Mag het niet meer gezien worden, dan gaat de hele snapshot niet mee.
      // Mag het wel, en is er een bestand in de bak, dan wordt de opgeslagen
      // publieke URL vervangen door een verse ondertekende link. De opgeslagen
      // waarde blijft in de database staan maar wordt niet meer uitgeleverd.
      const magZien = magDocumentZien(String(data.status || ""), verlopen, data.gereageerd_op);
      let snapshotUit: unknown = magZien ? data.snapshot : null;
      if (magZien && snapshotUit && typeof snapshotUit === "object") {
        const versePdf = await versePdfLink((data as any).pdf_path);
        if (versePdf) {
          snapshotUit = { ...(snapshotUit as Record<string, unknown>), pdf: versePdf };
        } else if ((data as any).pdf_path) {
          // Er hoort een bestand te zijn maar de link kwam niet rond. De oude
          // publieke URL doorgeven heeft geen zin zodra de bak dicht is, dus
          // die halen we eruit en de pagina valt terug op de HTML-opname.
          const kopie = { ...(snapshotUit as Record<string, unknown>) };
          delete kopie.pdf;
          snapshotUit = kopie;
        }
        // Geen pdf_path (oude link van vóór v3.79.0, of een planlink: die
        // heeft alleen de HTML-momentopname): snapshot ongewijzigd doorgeven.
      }

      // v4.131.0 — online kiezen. Alleen bij een offerte-link die nog open en
      // niet verlopen is en waarvan de tabel het merkteken draagt. Mislukt het
      // lezen om welke reden ook, dan gaat de link gewoon open zonder vinkjes.
      let optiesUit: unknown = null;
      try {
        if (soort === "offerte" && data.status === "open" && !verlopen) {
          const tabel = leesOptieTabel((data as any).cijfers);
          if (tabel) optiesUit = optiesVoorKlant(tabel);
        }
      } catch (e) {
        console.warn("Optietabel lezen mislukt (link opent zonder keuze):", String(e));
        optiesUit = null;
      }

      return json({
        status: data.status,
        bedrag: data.bedrag,
        snapshot: snapshotUit,
        gereageerd_op: data.gereageerd_op,
        klant_naam: data.klant_naam,
        project: projectNaam, // v4.56.0 — eigen plannaam gaat voor
        klant: pk.klant,
        geldig_tot: geldigTot || null,
        verlopen,
        // v4.35.0 — afwijzen mag ook na het verlopen, akkoord niet. De pagina
        // gebruikt dit om te bepalen welke knoppen ze toont.
        afwijzen_mogelijk: data.status === "open",
        // v4.40.0 — de pagina kan hiermee uitleggen waarom er geen document
        // staat, in plaats van een lege plek te tonen.
        document_beschikbaar: magZien,
        // v4.51.0 — plan-tak: hiermee zet de pagina de juiste woorden neer en
        // weet ze of het keuzeblok (per beurt of maandelijks) verplicht is.
        // betaalkeuze is gevuld nadat een klant met keuze akkoord gaf.
        // v4.91.0 — soort kan ook 'houtrot' zijn; dan geen betaalmodel.
        soort,
        betaalmodel: isPlan ? (plan?.betaalmodel ?? null) : null,
        keuze_nodig: isPlan && data.status === "open" && !verlopen && plan?.betaalmodel === "beide",
        betaalkeuze: (data as any).betaalkeuze ?? null,
        // v4.131.0 — opties: wat er te kiezen valt (null = geen online keuze).
        // optiekeuze: wat de klant bij zijn akkoord koos (null = geen keuze).
        opties: optiesUit,
        optiekeuze: data.status === "akkoord" ? ((data as any).optiekeuze ?? null) : null,
      });
    }

    // ---------- REAGEREN: akkoord / afkeuren / vraag ----------
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const token = (body.token || "").trim();
      const actie = body.actie; // 'akkoord' | 'afkeuren' | 'vraag'
      const naam = (body.naam || "").trim();
      const notitie = (body.notitie || "").trim();

      if (!token) return json({ error: "geen token" }, 400);
      if (!["akkoord", "afkeuren", "vraag"].includes(actie)) {
        return json({ error: "ongeldige actie" }, 400);
      }
      if ((actie === "akkoord" || actie === "afkeuren") && !naam) {
        return json({ error: "naam verplicht" }, 400);
      }

      // v4.131.0 — cijfers leest mee (de tabel van de link voor online kiezen).
      const { data: rij, error: e1 } = await sb
        .from("offerte_accorderingen")
        .select("id, calculatie_id, status, vragen, snapshot, onderhoudsplan_id, oplevering_id, cijfers, calculaties(naam, klant, offerte_config), onderhoudsplannen(naam, status, betaalmodel, ontvanger_type, offerte_config), opleveringen(projectnaam, klant, klant_email, status, btw_pct, opgave_nummer)")
        .eq("token", token)
        .maybeSingle();
      if (e1) return json({ error: e1.message }, 500);
      if (!rij) return json({ error: "onbekende link" }, 404);
      if (rij.status !== "open") {
        return json({ error: "reeds afgehandeld", status: rij.status }, 409);
      }

      // v4.51.0 — plan-tak, zie GET. v4.91.0 — houtrot-tak, zie GET.
      const rijObj = rij as unknown as Record<string, unknown>;
      const soort = bepaalSoort(rijObj);
      const isPlan = soort === "plan";
      const isHoutrot = soort === "houtrot";
      const plan = (rijObj.onderhoudsplannen || null) as Record<string, unknown> | null;
      const w = woorden(soort);

      // v4.12.0 / v4.35.0 — verlopen offertes.
      // Akkoord blijft dicht: een prijs van weken geleden mag niet alsnog
      // bindend worden. Afwijzen mag wél, dat is precies wat wij willen horen
      // en het haalt de offerte uit de werkvoorraad. Vraag stellen kon al.
      const geldigTotPost = geldigTotVoor(rijObj, soort);
      const verlopenNu = isVerlopen(geldigTotPost);
      if (actie === "akkoord" && verlopenNu) {
        return json({
          error: isHoutrot
            ? "Deze opgave is verlopen en kan niet meer worden geaccordeerd. Laat het ons weten via een bericht, dan maken wij een nieuwe opgave tegen de huidige prijzen. Afwijzen kan hier nog wel."
            : isPlan
              ? "Dit onderhoudsplan is verlopen en kan niet meer worden geaccordeerd. Laat het ons weten via een bericht, dan maken wij een nieuw voorstel tegen de huidige prijzen. Afwijzen kan hier nog wel."
              : "Deze offerte is verlopen en kan niet meer worden geaccordeerd. Laat het ons weten via een bericht, dan maken wij een nieuwe offerte tegen de huidige prijzen. Afwijzen kan hier nog wel.",
          verlopen: true,
          geldig_tot: geldigTotPost,
        }, 410);
      }

      // v4.51.0 — de keuze van de klant bij een plan op betaalmodel beide.
      // Verplicht bij akkoord (besluit Gian 29-08-2026: geen akkoord zonder
      // keuze, anders klopt "daarmee ligt het vast" op de bijlage niet).
      // In alle andere gevallen wordt een meegestuurde keuze genegeerd, zodat
      // er nooit een keuze in de rij komt waar niets te kiezen viel.
      const keuzeRaw = String((body as any).betaalkeuze || "").trim();
      const keuzeNodig = isPlan && plan?.betaalmodel === "beide";
      let betaalkeuze: string | null = null;
      if (actie === "akkoord" && keuzeNodig) {
        if (keuzeRaw !== "contant" && keuzeRaw !== "abo") {
          return json({ error: "Kies eerst hoe u wilt betalen: per beurt of per maand." }, 400);
        }
        betaalkeuze = keuzeRaw;
      }

      // v4.131.0 — online kiezen. Alleen bij akkoord op een offerte-link met
      // het merkteken. De browser levert ids; het bedrag zoekt deze functie
      // zelf op in de tabel van de link. Klopt een id of de samenstelling
      // niet, dan wordt er geweigerd en niets vastgelegd. Bij elke andere
      // link wordt een meegestuurd veld opties genegeerd.
      let optiekeuze: OptieKeuze | null = null;
      if (actie === "akkoord" && soort === "offerte") {
        const tabel = leesOptieTabel((rij as any).cijfers);
        if (tabel) {
          const k = kiesSamenstelling(tabel, (body as any).opties);
          if (!k.ok) return json({ error: k.fout }, 400);
          optiekeuze = k.keuze;
          optiekeuze.op = new Date().toISOString();
        }
      }

      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
      const ua = req.headers.get("user-agent") || null;

      // v3.95.0 — gegevens voor de mails uit de bevroren snapshot en de calculatie.
      const snap = ((rij as any).snapshot && typeof (rij as any).snapshot === "object") ? (rij as any).snapshot : {};
      // v4.56.0 — eigen plannaam gaat voor de calc-naam in mail B en de seintjes.
      // v4.91.0 — bij houtrot uit de oplevering.
      const pk = projectEnKlant(rijObj, soort);
      const project = pk.project;
      const klant = pk.klant;
      const offertenummer = String(snap.offertenummer || "").trim();
      const aanhef = String(snap.aanhef || "").trim() || klant || "heer, mevrouw";
      const klantEmail = String(snap.klantEmail || "").trim();
      // Label voor onderwerp en tekst: "26-014 | Project" of alleen "Project".
      const offerteLabel = offertenummer ? (offertenummer + " | " + project) : (project || "(zonder projectnaam)");
      const tijdstip = nuNL();
      // v4.51.0 / v4.91.0 — het juiste woord in het interne seintje.
      const soortWoord = w.soortWoord;
      const nummerLabel = w.nummerLabel;

      // Vraag stellen sluit de offerte niet af. Status blijft open.
      if (actie === "vraag") {
        const vragen = Array.isArray(rij.vragen) ? rij.vragen : [];
        vragen.push({ op: new Date().toISOString(), naam: naam || null, tekst: notitie });
        const { error: e2 } = await sb
          .from("offerte_accorderingen")
          .update({ vragen })
          .eq("id", rij.id);
        if (e2) return json({ error: e2.message }, 500);

        // Mail C — seintje (mag nooit de registratie breken).
        try {
          const c = mailSeintje({
            reactieLabel: "Vraag", klant, project, offertenummer, offerteLabel,
            naam, notitie, tijdstip, soortWoord, nummerLabel,
          });
          await sendMail(MAIL_NOTIFY, c.subject, c.html);
        } catch (e) { console.warn("Mail C (vraag) mislukt:", String(e)); }

        return json({ ok: true, status: "open" });
      }

      // Akkoord of afkeuren: definitief.
      const nieuweStatus = actie === "akkoord" ? "akkoord" : "afgekeurd";
      const wijziging: Record<string, unknown> = {
        status: nieuweStatus,
        klant_naam: naam,
        notitie: notitie || null,
        gereageerd_op: new Date().toISOString(),
        ip,
        user_agent: ua,
        betaalkeuze,   // v4.51.0 — alleen gevuld bij een plan-akkoord met keuze
      };
      // v4.131.0 — de online keuze en het gekozen totaal (besluit 1a). Bij
      // elke andere link komen deze twee velden niet in de schrijfopdracht.
      if (optiekeuze) {
        wijziging.optiekeuze = optiekeuze;
        wijziging.bedrag = optiekeuze.incl;
      }
      // v4.131.0 (keuze 3a) — alleen schrijven als de link op dit moment nog
      // open staat. Van twee gelijktijdige verzoeken raakt er één de rij; de
      // andere krijgt nul rijen terug en stopt hier, zonder gevolgen en mails.
      const { data: geraakt, error: e3 } = await sb
        .from("offerte_accorderingen")
        .update(wijziging)
        .eq("id", rij.id)
        .eq("status", "open")
        .select("id");
      if (e3) return json({ error: e3.message }, 500);
      if (!Array.isArray(geraakt) || geraakt.length !== 1) {
        return json({ error: "reeds afgehandeld" }, 409);
      }

      // v4.51.0 — gevolgen. Een offerte-akkoord zet de calculatie om, precies
      // als altijd. Een plan-akkoord raakt de calculatie NIET aan (die hoort
      // bij de schilderbeurt en kan al lang afgerond zijn) maar zet het plan
      // om, plus de gekozen betaalweg als er wat te kiezen viel (besluit Gian
      // 29-08-2026: status en betaalkeuze automatisch bijwerken).
      // v4.91.0 — een houtrot-akkoord zet alleen de oplevering om, op
      // 'akkoord' of 'afgewezen' (de statuswoorden van de oplever-app).
      const nieuweDoelStatus = actie === "akkoord" ? "geaccepteerd" : "verloren";
      if (isHoutrot) {
        await sb
          .from("opleveringen")
          .update({ status: actie === "akkoord" ? "akkoord" : "afgewezen" })
          .eq("id", (rij as any).oplevering_id);
      } else if (isPlan) {
        const planUpdate: Record<string, unknown> = { status: nieuweDoelStatus };
        if (betaalkeuze) planUpdate.betaalmodel = betaalkeuze;
        await sb
          .from("onderhoudsplannen")
          .update(planUpdate)
          .eq("id", (rij as any).onderhoudsplan_id);
      } else {
        await sb
          .from("calculaties")
          .update({ status: nieuweDoelStatus })
          .eq("id", rij.calculatie_id);
      }

      // v3.95.0 — mails versturen. Alles in try/catch: faalt het, dan is de
      // reactie hierboven al vastgelegd en geeft de functie gewoon ok terug.
      try {
        if (actie === "akkoord") {
          let bevestigingVerstuurd = false;
          if (klantEmail) {
            // v4.11.0 — token mee zodat de downloadknop in de mail komt.
            // v4.51.0 — plan-tak: eigen bevestiging met de gekozen betaalweg.
            // v4.91.0 — houtrot-tak: eigen bevestiging met downloadknop.
            // v4.131.0 — offerte-tak: de online gekozen samenstelling erbij.
            const b = isHoutrot
              ? mailBevestigingHoutrot(aanhef, offerteLabel, token)
              : isPlan
                ? mailBevestigingPlan(aanhef, offerteLabel, token, betaalkeuze)
                : mailBevestiging(aanhef, offerteLabel, project, token, optiekeuze);
            await sendMail(klantEmail, b.subject, b.html);
            bevestigingVerstuurd = true;
          }
          const tt = optiekeuze ? totaalTekst(optiekeuze) : null;
          const c = mailSeintje({
            reactieLabel: "Akkoord", klant, project, offertenummer, offerteLabel,
            naam, notitie, tijdstip, bevestigingVerstuurd, soortWoord, nummerLabel,
            betaalkeuzeLabel: betaalkeuze ? (betaalkeuze === "abo" ? "maandelijks" : "per beurt") : "",
            // v4.131.0 — wat de klant online koos, met de titels erbij.
            keuzeLabel: optiekeuze
              ? (optiekeuze.titels.length ? optiekeuze.titels.join("; ") : "basisuitvoering, zonder opties")
              : "",
            totaalLabel: tt ? (tt.groot + " (" + tt.klein + ")") : "",
          });
          await sendMail(MAIL_NOTIFY, c.subject, c.html);
        } else {
          // afkeuren: alleen seintje, klant krijgt niets automatisch.
          // v4.35.0 — vermelden of de afwijzing na de vervaldatum binnenkwam.
          const c = mailSeintje({
            reactieLabel: verlopenNu ? "Afgewezen (" + soortWoord + " was al verlopen)" : "Afgewezen",
            klant, project, offertenummer, offerteLabel,
            naam, notitie, tijdstip, soortWoord, nummerLabel,
          });
          await sendMail(MAIL_NOTIFY, c.subject, c.html);
        }
      } catch (e) {
        console.warn("Mailversturen mislukt (reactie blijft vastgelegd):", String(e));
      }

      // v4.131.0 — bij een online keuze gaan keuze en bedrag terug naar de
      // pagina, voor de bevestiging in beeld en op het getekende exemplaar.
      if (optiekeuze) {
        return json({ ok: true, status: nieuweStatus, optiekeuze, bedrag: optiekeuze.incl });
      }
      return json({ ok: true, status: nieuweStatus });
    }

    return json({ error: "methode niet ondersteund" }, 405);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
