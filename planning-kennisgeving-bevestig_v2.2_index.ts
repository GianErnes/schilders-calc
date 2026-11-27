// @ts-nocheck
// =====================================================================
// Edge Function: planning-kennisgeving-bevestig (v2.2, 26-11-2026)
// v2.2: seintje aan Gian bij een bevestigde STARTDAG (besluit Gian 26-11-2026,
//       "B + C samen, alleen ik"). Na het vastleggen van bevestigd_op gaat er
//       bij soort 'dag' een kort mailtje via Resend naar Gian (adres uit
//       taken_rollen, persoon 'gian'; lukt dat lezen niet, dan gian@ernes.nl).
//       Alleen als déze aanroep de rij echt omzette (PATCH met
//       return=representation geeft een rij terug); twee gelijktijdige klikken
//       geven dus één seintje. Mislukt het seintje (geen RESEND_API_KEY,
//       Resend-fout, time-out na 8 s), dan wordt dat alleen gelogd: de
//       bevestiging staat en de klant krijgt gewoon "Bedankt".
//       Maand- en weekbevestigingen geven geen mail; die ziet Gian in de
//       planning (groene knop, planning.html v0.31.0, kolom
//       bevestiging_gezien_op uit claude_planning_13_bevestiging_gezien.sql;
//       deze functie raakt die kolom niet aan).
//       Plus: omschrijving voor soort 'opdracht' (was de terugval
//       "onze kennisgeving").
// v2.1: bevestig.html bevestigt nu vanzelf bij openen (besluit Gian); de
//       functie logt bij elke bevestiging de user-agent, zodat een valse
//       bevestiging door een mailscanner achteraf in de logs te herkennen is.
// v2:   geen HTML meer. Supabase herschrijft text/html bij een GET naar
//       text/plain (opgezocht 09-10-2026, docs "Development tips": "HTML
//       content is not supported"), dus de klant zag bij v1/v1.1 de
//       broncode als tekst. De pagina staat nu op GitHub Pages
//       (bevestig.html, zelfde repo als planning.html) en deze functie is
//       alleen nog de API erachter: JSON in, JSON uit, met CORS.
// v1.1: vast pad voor het formulier (achterhaald door v2).
// Hoort bij planning.html v0.31.0, planning_08_kennisgeving_status.sql,
// claude_planning_13_bevestiging_gezien.sql, planning-kennisgeving v3.6
// (zet de link naar bevestig.html in de mail) en bevestig.html v1.4.
//
// Aanroep (vanuit bevestig.html, niet ingelogd; Verify JWT bij deployen UIT):
//   GET  ?t=<token>            → wat is dit voor kennisgeving, is hij al bevestigd
//   POST { t: <token> }        → bevestigd_op = nu (alleen de eerste keer),
//                                sluit de open nabel-taak in `taken`,
//                                v2.2: bij soort 'dag' seintje aan Gian
// Antwoord altijd JSON:
//   { ok:true, status:'open'|'bevestigd'|'al_bevestigd', soort, omschrijving,
//     periode_tekst, bevestigd_op }
//   { ok:false, status:'ongeldig' }   (onbekend, ontbrekend of ongeldig token; 404)
// HEAD → 200 leeg.
//
// Toegang: het token zelf (uuid + 16 willekeurige bytes, uniek per rij).
// Alles wordt geschreven met de service_role-sleutel.
//
// Geheimen: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (zet Supabase klaar),
// RESEND_API_KEY (v2.2, alleen voor het seintje; ontbreekt hij, dan geen seintje).
// =====================================================================

const SOORT_NAAM = {
  opdracht: "onze opdrachtbevestiging", // v2.2
  maand: "onze maandaankondiging",
  week: "onze weekaankondiging",
  dag: "ons startdagbericht",
};
const TOKEN_RE = /^[A-Za-z0-9_-]{20,120}$/;

// v2.2: seintje aan Gian.
const SEINTJE_FROM = "Ernes Schilders <info@ernes.nl>"; // zelfde afzender als de andere interne seintjes (v4.98.1)
const SEINTJE_PERSOON = "gian";                        // taken_rollen.persoon
const SEINTJE_TERUGVAL = "gian@ernes.nl";              // als taken_rollen niet te lezen is (gemeten 26-11-2026 in taken_rollen)
const SEINTJE_TIMEOUT_MS = 8000;
const PLANNING_URL = "https://gianernes.github.io/schilders-calc/planning.html";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function env() {
  return {
    SB_URL: Deno.env.get("SUPABASE_URL") ?? "",
    SB_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    RESEND_KEY: Deno.env.get("RESEND_API_KEY") ?? "",
  };
}

function antwoord(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
function ongeldig(): Response { return antwoord(404, { ok: false, status: "ongeldig" }); }

export function omschrijving(rij: any): string {
  return (SOORT_NAAM[rij.soort] || "onze kennisgeving") + (rij.periode_tekst ? " voor " + rij.periode_tekst : "");
}
function uit(rij: any, status: string) {
  return { ok: true, status, soort: rij.soort, omschrijving: omschrijving(rij), periode_tekst: rij.periode_tekst || null, bevestigd_op: rij.bevestigd_op || null };
}

async function rest(pad: string, init: any = {}, fetchFn = fetch) {
  const { SB_URL, SB_KEY } = env();
  const r = await fetchFn(`${SB_URL}/rest/v1/${pad}`, {
    ...init,
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  if (!r.ok) throw new Error(`PostgREST ${r.status} op ${pad.split("?")[0]}: ${await r.text().catch(() => "")}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

async function zoekRij(token: string, fetchFn = fetch) {
  if (!TOKEN_RE.test(token)) return null;
  // v2.2: ook onderwerp, aan, aan_naam en start_bij_verzending, voor het seintje.
  const rijen = await rest(`plan_kennisgevingen?select=id,yoobi_code,soort,periode_tekst,bevestigd_op,overgeslagen,onderwerp,aan,aan_naam,start_bij_verzending&bevestig_token=eq.${encodeURIComponent(token)}&limit=1`, {}, fetchFn);
  return Array.isArray(rijen) && rijen[0] ? rijen[0] : null;
}

// v2.2: datum en tijd zoals Gian ze leest. Lukt Intl niet, dan de ISO-tekst.
export function nlTijd(iso: string): string {
  try {
    return new Date(iso).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  } catch (_e) { return String(iso); }
}

// v2.2: inhoud van het seintje. Los, zodat hij te testen is.
export function seintjeInhoud(rij: any, wanneer: string) {
  const wie = rij.aan_naam ? `${rij.aan_naam}${rij.aan ? " (" + rij.aan + ")" : ""}` : (rij.aan || "De klant");
  const onderwerp = String(rij.onderwerp || "").trim() || `project ${rij.yoobi_code}`;
  const regels = [
    `${wie} heeft de startdag bevestigd, ${nlTijd(wanneer)}.`,
    "",
    `Mail: ${onderwerp}`,
    rij.periode_tekst ? `Startdag: ${rij.periode_tekst}` : "",
    `Projectcode: ${rij.yoobi_code}`,
    "",
    "De nabeltaak voor deze startdag is gesloten.",
    `Planning: ${PLANNING_URL}`,
  ].filter((r, i, a) => !(r === "" && a[i - 1] === ""));
  return { subject: `Startdag bevestigd: ${onderwerp}`, text: regels.join("\n") };
}

async function seintjeAdres(fetchFn = fetch): Promise<string> {
  try {
    const r = await rest(`taken_rollen?select=mail&persoon=eq.${SEINTJE_PERSOON}&limit=1`, {}, fetchFn);
    const m = Array.isArray(r) && r[0] && r[0].mail ? String(r[0].mail).trim() : "";
    if (m) return m;
  } catch (e) { console.error("planning-kennisgeving-bevestig: taken_rollen niet gelezen, terugval-adres:", e && e.message ? e.message : e); }
  return SEINTJE_TERUGVAL;
}

// v2.2: nooit fataal. Geeft terug wat er gebeurde, voor de log en de tests.
export async function stuurSeintje(rij: any, wanneer: string, fetchFn = fetch): Promise<string> {
  const { RESEND_KEY } = env();
  if (!RESEND_KEY) { console.error("planning-kennisgeving-bevestig: geen RESEND_API_KEY, geen seintje"); return "geen_sleutel"; }
  try {
    const aan = await seintjeAdres(fetchFn);
    const { subject, text } = seintjeInhoud(rij, wanneer);
    const sig = typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(SEINTJE_TIMEOUT_MS) : undefined;
    const r = await fetchFn("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: SEINTJE_FROM, to: [aan], subject, text }),
      signal: sig,
    });
    if (!r.ok) { console.error("planning-kennisgeving-bevestig: seintje mislukt, Resend", r.status, await r.text().catch(() => "")); return "mislukt"; }
    console.log("planning-kennisgeving-bevestig: seintje verstuurd aan", aan, rij.yoobi_code);
    return "verstuurd";
  } catch (e) {
    console.error("planning-kennisgeving-bevestig: seintje mislukt:", e && e.message ? e.message : e);
    return "mislukt";
  }
}

export async function verwerk(req: Request, fetchFn = fetch, nu = new Date()): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method === "HEAD") return new Response(null, { status: 200, headers: CORS });
  const { SB_URL, SB_KEY } = env();
  if (!SB_URL || !SB_KEY) return antwoord(500, { ok: false, status: "fout", error: "Functie niet geconfigureerd" });
  const url = new URL(req.url);

  if (req.method === "GET") {
    const rij = await zoekRij((url.searchParams.get("t") || "").trim(), fetchFn);
    if (!rij) return ongeldig();
    return antwoord(200, uit(rij, rij.bevestigd_op ? "al_bevestigd" : "open"));
  }

  if (req.method === "POST") {
    let token = "";
    try {
      const ct = req.headers.get("content-type") || "";
      if (/application\/x-www-form-urlencoded|multipart\/form-data/.test(ct)) token = String((await req.formData()).get("t") || "");
      else token = String(((await req.json()) || {}).t || "");
    } catch (_e) { token = ""; }
    const rij = await zoekRij(token.trim(), fetchFn);
    if (!rij) return ongeldig();
    if (rij.bevestigd_op) return antwoord(200, uit(rij, "al_bevestigd"));
    const wanneer = nu.toISOString();
    // v2.2: return=representation, zodat we weten of déze aanroep de rij omzette.
    const gezet = await rest(`plan_kennisgevingen?id=eq.${encodeURIComponent(rij.id)}&bevestigd_op=is.null&select=id`, {
      method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ bevestigd_op: wanneer }),
    }, fetchFn);
    const ikZette = Array.isArray(gezet) && gezet.length > 0;
    // Open nabel-taak voor deze kennisgeving meteen sluiten (niet fataal;
    // de dagelijkse ronde van planning-kennisgeving-taken doet het anders).
    try {
      const kenmerk = `nabellen-${rij.soort}:${rij.yoobi_code}`;
      await rest(`taken?bron=eq.planning&bron_kenmerk=eq.${encodeURIComponent(kenmerk)}&voltooid_op=is.null`, {
        method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ voltooid_op: wanneer }),
      }, fetchFn);
    } catch (e) { console.error("planning-kennisgeving-bevestig: nabel-taak niet gesloten:", e && e.message ? e.message : e); }
    console.log("planning-kennisgeving-bevestig: bevestigd", rij.yoobi_code, rij.soort, "ua:", (req.headers.get("user-agent") || "?").slice(0, 160));
    if (ikZette && rij.soort === "dag") await stuurSeintje(rij, wanneer, fetchFn); // v2.2
    return antwoord(200, uit({ ...rij, bevestigd_op: wanneer }, "bevestigd"));
  }

  return antwoord(405, { ok: false, status: "fout", error: "Alleen GET of POST" });
}

if (typeof Deno !== "undefined" && Deno.serve) {
  Deno.serve(async (req: Request) => {
    try {
      return await verwerk(req);
    } catch (e) {
      console.error("planning-kennisgeving-bevestig:", e && e.message ? e.message : e);
      return antwoord(500, { ok: false, status: "fout", error: "Er ging iets mis" });
    }
  });
}
