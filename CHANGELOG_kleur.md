# CHANGELOG — Kleurvisualisatie

## v0.1.1 — Fotogrens 12 MP → 60 MP (2026-09-29)

**Gerepareerd**
- Een gewone iPhone-foto (4032×3024 = 12,19 MP) werd geweigerd met "Foto groter dan
  12 megapixel" (gezien door Gian bij de eerste test). De grens uit spec §5 zat net te
  krap; de app verkleint toch alles zelf naar 1600 px. Nu 60 MP, ruim boven de
  48 MP-stand van de nieuwste iPhones.

**Getest**
- JS-parse, CSS-brace-check en de Playwright-browsertest opnieuw: goed.

## v0.1.0 — `kleur.html`, fase 0, chat B (2026-09-29)

Eerste versie van de kleurvisualisatie-app. Foto → Edge Function `kleur-analyse` →
benoemde vlakken → RAL-kleur per vlak → voor/na-schuif. Geen opslag.

**Nieuw**
- Inloggen verplicht (patroon `taken.html`, storageKey `sb-kleur-auth`); elk account
  mag, geen rolcheck. Opmaak: tokens van `taken.html`, 900 px breed, foto beeldvullend.
- Foto wordt in de browser verkleind: 1200 px naar de functie (JPEG 0,8), 1600 px
  voor de herkleuring. Foto's boven 12 MP worden geweigerd vóór verzending.
- Vloedvulling vanaf de ankerpunten in Lab (ΔE ≤ 12, schuif 4–30), begrensd door het
  kader plus 8 %, vereniging over ankers, randverzachting ≈ 1,5 px, in een Web Worker
  met terugval op de hoofdthread.
- Ankerzuivering vóór het vullen. Regel bijgesteld t.o.v. de spec van 29-09: niet de
  mediaan, maar de grootste kleurgroep wint; bij gelijkspel (2–2) wint de groep die het
  verst van de al gevulde gevel ligt. Reden: de mediaanregel zette bij 2 goede en 2
  foute ankers álles op verdacht (gevonden in de Node-test). Vlakken worden daarom van
  groot naar klein gevuld.
- Overlay in ERNES-oranje 35 %, rood bij "controleer" (zekerheid laag, minder dan 0,5 %
  gevuld, of twijfel bij de zuivering). Label op het zwaartepunt van elk vlak.
- Paneel per vlak: RAL-zoekveld, waaier per groep, 215 RAL Classic-kleuren uit
  Wikipedia met Lab als bron (hex wijkt bij 60 kleuren > 5 ΔE af en is genegeerd;
  RAL 6039 heeft geen Lab op Wikipedia). 23 parelmoer/lichtgevend/aluminium te kiezen
  met melding "niet realistisch te visualiseren".
- Herkleurregel uit de spec: L uit de foto, a/b uit RAL, doel-L geplafonneerd op
  88 en 12, schaduwfactor 0,9.
- "Afstellen" per vlak verborgen, automatisch open bij "controleer": gevoeligheid,
  toevoegen (tik), gum (tik), opnieuw.
- Voor/na-schuif met handvat 48 px; "Alles" wisselt schuif → nieuw → origineel.
- Terugval: functiefout of time-out (60 s), leeg antwoord → melding + "Vlak zelf
  aanwijzen" (één tik, kader = hele foto).
- Kostenregel onder de foto: aantal vlakken, € en seconden uit het functie-antwoord.

**Getest**
- CSS-brace-check, Node-parse van alle scriptblokken, tagbalans: goed.
- Node-runtime `test_kleur_engine.js`, 22 controles: Lab heen-en-terug op 1000 kleuren
  (afwijking 0), vulling op synthetische gevel (ramen uitgespaard, buurpand niet
  meegevuld, kader begrenst), ankerzuivering (2–2 met en zonder gevelkleur, 3–1,
  1–2), gum, verzachting, herkleurregel met vier proefgevallen (plafond 88 en
  bodem 12 werken), donker→wit behoudt schaduwverloop.
- Playwright `test_kleur_browser.py` op een synthetische gevel (1600×1000) met
  nagebootste supabase-js en Edge Function, 13 controles: verzoek naar de functie
  (base64 zonder prefix, 1200 px), gevel/kozijnen/deur gevuld met de juiste
  verdachte ankers, herkleuring naar RAL 7016 (glas ongemoeid), schuif slepen,
  gum en toevoegen, zelf aanwijzen, functiefout 529, leeg antwoord, 390 px.
- RAL-tabel: 215 regels geparsed, groepen 30/14/25/12/25/36/38/20/15.

**Niet getest (bewust, dat is fase 0 in de praktijk)**
- Echte foto's op de iPad: kwaliteit van de vulling op metselwerk, snelheid van de
  Worker, oriëntatie van iPhone-foto's (`createImageBitmap` met `imageOrientation`,
  aanname Safari 16+).
- De echte Edge Function vanuit de app (de keten is in chat A wel afgetapt).

**Uitrol**
1. `kleur.html` uploaden naar de root van de repo. Openen via
   https://gianernes.github.io/schilders-calc/kleur.html, aanmelden.
2. Testen met minimaal drie woningen en één interieur (spec §7).

## Fase 0, chat A — Edge Function `kleur-analyse` + logtabel (2026-09-29)

Eerste bouwsteen van de kleurvisualisatie (zie `kleurvisualisatie_fase0_spec.md`).
Route: Claude wijst de schilderbare oppervlakken aan met ankerpunten en een grof
kader; `kleur.html` (chat B, nog te bouwen) vult de randen zelf.

**Nieuw**
- Edge Function `kleur-analyse` (`kleur-analyse_index.ts`), patroon `offerte-leescontrole`
  v4.19.1: eigen logincheck via `/auth/v1/user`, model `claude-opus-4-8`, tariefconstanten
  $5/$25 per miljoen tokens, koers 0,87, niet-blokkerend loggen, geen backticks.
  Foto gaat als `image`-blok (base64) mee. Antwoord wordt gesaneerd: vaste typenlijst,
  coördinaten binnen de foto, ankers binnen het kader, onbekend type wordt `overig`
  met zekerheid `laag`, minder dan 3 ankers wordt zekerheid `laag`, maximaal 12
  oppervlakken en 8 ankers per oppervlak.
- Tabel `kleur_analyse_log` (`kleur_00_log.sql`): ingelogd alleen lezen, schrijven
  alleen via service_role, projectguard op het bestaan van `calculaties`.

**Getest**
- `deno check`: geen fouten (Deno 2.9.7).
- Mocktest `kleur-analyse_test_mock.ts`: 14 gevallen (goed antwoord en sanering,
  logregel, kapotte JSON, AI-status 529, netwerkfout, niet ingelogd, foto ontbreekt,
  data:-prefix, maten ontbreken, foto te groot, ongeldige body, leeg resultaat,
  config onvolledig, OPTIONS): 14 goed.
- SQL: syntaxcontrole met pglast (12 statements). Niet gedraaid tegen Postgres;
  de controleregels onderaan het script zijn de echte test.

**Niet getest (bewust, dat is fase 0 in de praktijk)**
- Echte aanroep via de API met een echte foto, tokens en kosten.
- Kwaliteit van de ankerpunten op Nederlandse woningen.

**Uitrol**
1. `kleur_00_log.sql` draaien in de SQL Editor; vijf controleregels moeten GOED zijn.
2. Nieuwe Edge Function `kleur-analyse` aanmaken, inhoud van `kleur-analyse_index.ts`
   plakken, **Verify JWT uit** (zoals `offerte-leescontrole`). Secrets bestaan al.
3. Eerste test met één foto via de SQL Editor (`extensions.http`-patroon uit
   SYSTEEM.md) of vanuit chat B zodra `kleur.html` er is.

**Correctie na uitrol (2026-09-29):** controleregel "authenticated alleen select" gaf
FOUT. Oorzaak: Supabase geeft een nieuwe tabel standaard alle rechten aan
`authenticated`; het script trok alleen insert/update/delete in. Handmatig
gerepareerd met `revoke all` + `grant select`, daarna GOED. `kleur_00_log.sql`
aangepast zodat een herbouw meteen goed gaat.
