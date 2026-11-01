# INSTAP — Schilders Calc, de suite van Ernes Schilders

**Versie 1.0, 2 november 2026.** Dit is de voordeur. Lees dit eerst; alles
wat hier staat is kort en bewust onvolledig. Het volledige dossier is
`SYSTEEM.md` in dezelfde map (ruim 6.000 regels, met dagverslagen sinds
juli 2026). Dit document zegt bij elk onderwerp waar je in SYSTEEM.md
verder leest.

Dit document bevat **geen wachtwoorden en geen sleutels**. Het staat in een
openbare repository. Het zegt wel waar die dingen liggen en wie erbij kan.

Een regel tussen vierkante haken, zoals **[INVULLEN: …]**, is een gat dat
Gian Ernes zelf moet vullen. Staat er nog zo'n haak als je dit leest, bel
dan eerst (hoofdstuk 3).

---

## 0. Voor wie dit is en wat je ermee moet kunnen

Je bent een ontwikkelaar, of Gians zoon, of een AI-assistent die dit
systeem voor het eerst ziet. Gian is er niet, of de assistent waarmee dit
gebouwd is (Claude, Anthropic) is er niet. Na het lezen van dit document
moet je drie dingen kunnen:

1. Begrijpen wat dit systeem is en waar elk onderdeel staat (hoofdstuk 1
   en 2).
2. Een verloren database **terugzetten** uit de eigen backup in een leeg
   Supabase-project en de apps daarop laten werken (hoofdstuk 5). Dit is
   op 1 november 2026 geoefend en werkt; de oefening kost met het
   gereedschap in de hand ongeveer een uur.
3. Veilig **doorbouwen** aan de apps zonder werk van anderen te
   overschrijven (hoofdstuk 6).

**De proef die telt:** doe hoofdstuk 5 na op het oefenproject
`schilders-calc-hersteltest` (zie 2.3), zonder hulp van Gian. Lukt dat, dan
is dit document goed. Lukt het niet, schrijf op waar je vastliep en zet
dat in dit document.

---

## 1. Wat dit is, in tien regels

Ernes Schilders is een schildersbedrijf in Heerlen (Limburg, NL), vijf
mensen. Eigenaar Gian Ernes heeft sinds april 2026 een reeks eigen
web-apps gebouwd, samen met een AI-assistent, zonder
development-achtergrond. Het bedrijf voert zijn CRM en projectadministratie
in **Yoobi** (extern pakket). Yoobi blijft de bron; de suite leest eruit
en schrijft er nooit naar terug.

De suite doet wat Yoobi niet doet: calculaties en offertes maken en laten
accorderen, onderhoudsplannen, planning per medewerker, taken met
meldingen, een financieel dashboard, opleverlijsten, personeelsdossier,
klantenspiegel en een voorraad-app voor de bus. Het geheel wordt
dagelijks gebruikt door Gian, Max, Bjorn, Jens en Maud.

Techniek, bewust simpel: **één HTML-bestand per app** met JavaScript erin,
zonder bouwstap en zonder framework, gehost op GitHub Pages, pratend met
een **Supabase**-database (Postgres) met Edge Functions (Deno/TypeScript)
en cronjobs. Niets draait op een eigen server.

---

## 2. Landkaart: waar staat wat

### 2.1 GitHub (één account: `GianErnes`)

| Repository | Zichtbaar | Inhoud |
|---|---|---|
| `schilders-calc` | openbaar | alle app-bestanden, `sql/`, `SYSTEEM.md`, de CHANGELOGs, `herstel.html`, dit document |
| `voorraad-app` | openbaar | de voorraad-app (`voorraad-app_2.html`; er is géén `index.html` in die repo) |
| `ernes-edge-functions` | **besloten** | broncode van alle Edge Functions in `supabase/functions/`, plus twee GitHub Actions: "Functies ophalen" (wekelijkse kopie uit Supabase) en "Functies uitrollen naar Supabase" (alles in één keer naar een op te geven project). Lees eerst de README daar. |

Live adressen: `https://gianernes.github.io/schilders-calc/` en daarachter
`taken.html`, `planning.html`, `financieel.html`, `oplevering.html`,
`personeel.html`, `klanten.html`, `kaart.html`, `start.html`.
`start.html` is een dashboard dat van elke app de live versie toont en
rood/oranje kleurt als app en CHANGELOG niet gelijk lopen. Versienummers
staan daarom niet in dit document; kijk op `start.html`.

Verder lezen: SYSTEEM.md 1.1 (apps) en 2.1 (GitHub, de twee knoppen).

### 2.2 Supabase (één organisatie "Gian Ernes", abonnement Pro, regio eu-west-1)

| Project | Ref | Gebruikt door |
|---|---|---|
| `schilders-calc` | `gjcjpigirqbpkjkymbio` | alle apps behalve Voorraad |
| `schilder-voorraad` | `rcwlbcfuvfprnnkypbba` | Voorraad |
| `schilders-calc-hersteltest` | `xcrhzxeqdlbtwpmiagwk` | oefenproject, momentopname van 1 november 2026 (sinds die dag, $10/maand) |

Adres van een project is altijd `https://<ref>.supabase.co`.

In `schilders-calc` staan (stand 1 november 2026, gemeten bij de
hersteltest): 69 tabellen, 2 views, 46 databasefuncties, 57 triggers,
46 verwijssleutels, 8 opslagbakken, 86 policies op `public` plus 21 op
`storage`, 16 Edge Functions en 11 cronjobs. **Migrations is leeg:** alle
SQL is ooit direct in de SQL Editor geplakt. De opbouw staat daarom in de
nachtelijke schemadump (2.4), niet in een migratiegeschiedenis.

Aanmelden bij Supabase gebeurt met **[INVULLEN: welk e-mailadres]**.

Verder lezen: SYSTEEM.md 1.2 (databases), 1.3 (bakken), 3 (wat draait er
automatisch: cronjobs, Edge Functions, triggers).

### 2.3 Google Workspace en Google Drive

Het bedrijf heeft Google Workspace (domein `ernes.nl`). Eén serviceaccount
leest de Google Agenda (opname-afspraken) en schrijft elke nacht de backup
weg naar de map **"Backups Schilders Calc" in de Drive van
`administratie@ernes.nl`**. Daar staan per nacht `backup-JJJJ-MM-DD.json`
(alle tabelinhoud) en `schema-JJJJ-MM-DD.sql` (de hele structuur,
uitvoerbaar), 60 dagen bewaard. Een PDF van dit document hoort in
diezelfde map.

Verder lezen: SYSTEEM.md 4.7.

### 2.4 De backup, in één alinea

Elke nacht om 04:00 maakt de Edge Function `backup-dump` een JSON van
alle tabellen in `public` en roept `schema_dump()` aan voor een
SQL-herbouwbestand. Beide gaan naar de bak `backups` in het project zelf
én naar Google Drive. Vijf bestandsbakken (foto's, documenten) worden
gespiegeld naar de bak `backups`, **maar die spiegel gaat niet mee naar
Drive**: valt het hele Supabase-project weg, dan zijn de foto's en
documenten weg. Dat is het grootste bekende gat (stand 2 november 2026).
Elke maandag komt een statusmail op `info@ernes.nl`. Supabase zelf
bewaart daarnaast een platformbackup van zeven dagen ("Restore to new
project", geoefend op 26 juli 2026).

### 2.5 Koppelingen naar buiten

Yoobi (CRM, REST API), Yuki (boekhouding, voedt het financieel
dashboard), Resend (alle uitgaande mail, vanaf `info@ernes.nl`, DMARC
op `p=reject`), Craft.do (werkvoorbereidingsdocumenten), Anthropic
(leescontrole op offertes en vraagbaak in de app), Google Agenda en
Drive, PDOK (adressen en kaart, gratis), OpenRouteService (rijafstand),
Mollie via Yoobi (incasso onderhoudsabonnementen). Elke koppeling heeft
een sleutel; zie hoofdstuk 4.

Verder lezen: SYSTEEM.md 1.4.

---

## 3. Mensen: wie je belt en wie je toegang geeft

| Wie | Rol | Bereikbaar |
|---|---|---|
| Gian Ernes | eigenaar, bouwer, beheerder van alle accounts | **[INVULLEN: telefoon, e-mail]** |
| **[INVULLEN: naam zoon]** | beoogd opvolger van het bedrijf | **[INVULLEN]** |
| Max | collega, heeft toegang tot bankzaken en tot de kluis met sleutels | **[INVULLEN]** |
| Maud | administratie (maandagmiddag), heeft toegang tot de kluis | **[INVULLEN]** |
| Ed Mordant | domein `ernes.nl`, website, e-mail. **Niet** voor apps of database | **[INVULLEN]** |
| Vincent Egt | Yoobi, hoogste aanspreekpunt als de gewone ondersteuning niet doorpakt | **[INVULLEN]** |
| Supabase | geen telefoon; Support onderin het dashboard (Pro) | supabase.com |

**Wie beheert de accounts als Gian niet kan?** **[INVULLEN: naam]**.
Het gaat om vier accounts: GitHub `GianErnes`, de Supabase-organisatie,
Google Workspace (beheerconsole) en Anthropic. Zonder die vier kun je
niets herstellen. Of hier 2FA op staat en waar de herstelcodes liggen:
**[INVULLEN]**.

Verder lezen: SYSTEEM.md 6.

---

## 4. Sleutels en geheimen: waar ze liggen (niet wat ze zijn)

- **De kluis** waar alle wachtwoorden en API-sleutels in staan:
  **[INVULLEN: welk wachtwoordbeheer]**. Vastgesteld is dat Max en Maud
  erbij kunnen.
- **Edge Function secrets** staan in Supabase Studio onder Edge
  Functions → Secrets, per project. Namen o.a. `AFTAP_SECRET`,
  `OPVOLG_KEY`, `RESEND_*`, `GOOGLE_SA_JSON`, `GOOGLE_AGENDA_GEBRUIKER`,
  `GOOGLE_DRIVE_BACKUP_MAP`, de Yoobi-, Yuki-, Craft- en
  Anthropic-sleutels, `VAPID_PRIVATE_KEY` (push-meldingen). De volledige
  lijst lees je daar af.
- **De Supabase-kluis `vault`** bevat drie geheimen die de cronjobs
  gebruiken: `maandbericht_key`, `aftap_secret`, `opvolg_key`. Elk
  daarvan moet **gelijk zijn** aan de gelijknamige Edge Function secret.
  Wijzig je er één, wijzig dan beide, anders weigert de functie met een
  401 terwijl cron "succeeded" blijft melden.
- **Niets hiervan zit in de backup.** Bij een herbouw vul je secrets en
  vault met de hand uit de kluis.
- **Geleerd op 27 juli 2026:** een database-uitdraai kan sleutels
  bevatten. Doorzoek elk uitdraaibestand op sleutels vóórdat het ergens
  heen gaat, en zet het nooit ongezien in de openbare repo. Verwijderen
  uit git is niet genoeg (de geschiedenis onthoudt het); alleen de sleutel
  vervangen helpt.

Verder lezen: SYSTEEM.md 2.4.

---

## 5. Herstel: de database terugzetten in een leeg project

Dit is de procedure die op 1 november 2026 is geoefend en gelukt is:
Drive-JSON (31 MB, 69 tabellen, 18.618 rijen) plus schemabestand in een
leeg project, daarna werkten alle zes apps. Volg de volgorde; ze is zo
omdat de verwijssleutels onderaan het herbouwbestand staan en de
triggers tijdens het laden uit moeten.

**Wat je nodig hebt:** toegang tot de Supabase-organisatie; uit Drive het
nieuwste `schema-JJJJ-MM-DD.sql` en `backup-JJJJ-MM-DD.json`;
`herstel.html` uit de repo (lokaal openen, dubbelklik); een teksteditor.

1. **Nieuw project** aanmaken in de organisatie, regio `eu-west-1`.
2. **Structuur, deel A.** Open het schemabestand. Knip het in drie delen:
   A = alles tot aan het blok `CRONJOBS`; B = het blok `VERWIJSSLEUTELS`;
   C = de `setval`-regels onderaan. Plak alleen A in de SQL Editor van het
   nieuwe project en draai het. Het bestand begint met een controle die
   afbreekt als het project niet leeg is; dat is de bedoeling (het
   beschermt live). Het blok `CRONJOBS` sla je over tot stap 7.
3. **Gegevens.** Open `herstel.html` lokaal. Vul het adres van het nieuwe
   project in en de **legacy `service_role`-sleutel** (Project Settings →
   API Keys → tabblad "Legacy anon, service_role API keys"; begint met
   `eyJ`; de nieuwe `sb_secret_`-sleutel werkt niet in een browser). Kies
   de JSON. Klik eerst **"Alleen vergelijken"**, dan **"Laden"**. De
   pagina stuurt per tabel in porties naar de databasefunctie
   `herstel_laad_tabel`, die de triggers per tabel uit- en weer aanzet.
   Elke tabel moet "klopt" tonen. Opnieuw draaien kan; dubbele rijen
   worden overgeslagen.
4. **Deel B en C.** Draai B (verwijssleutels). Vier sleutels naar
   `auth.users` falen zolang er geen accounts zijn; dat is normaal, die
   komen in stap 6. Draai daarna C.
5. **Bestanden:** als het oude project nog bestaat, kopieer de bakken
   (`calculatie-fotos`, `calculatie-documenten`, `accord-pdf`,
   `taken-documenten`, `taken-fotos`, `oplever-fotos`) uit de spiegel in
   de bak `backups`. Bestaat het oude project niet meer, dan zijn ze weg
   (zie 2.4).
6. **Accounts.** Maak in Authentication de accounts aan,
   **`administratie@ernes.nl` als eerste**: de Calculatie-app laat alleen
   dat adres binnen (accountpoort `TOEGESTANE_ACCOUNTS` in `index.html`)
   en de onderhoudsplannen hangen eraan. Daarna gian, max, maud, jens,
   bjorn (`@ernes.nl`). Nieuwe accounts krijgen **nieuwe id's**, en de
   tabel `taken_rollen` komt uit de backup met de oude. Werk daarom in de
   SQL Editor `taken_rollen.user_id` bij met de nieuwe id's, zet
   `onderhoudsplannen`, `onderhoudsplan_beurten` en
   `onderhoudsplan_externe_posten` op het id van administratie, en maak
   `push_subscriptions` leeg. **Sla je dit over, dan ziet niemand één
   taak of plan en lijkt alles stuk, terwijl alles er wel staat.** Nu de
   vier sleutels naar `auth.users` uit deel B alsnog draaien.
7. **Edge Functions, secrets, cronjobs.** Secrets en vault vullen uit de
   kluis (hoofdstuk 4). Functies uitrollen via de GitHub Action
   "Functies uitrollen naar Supabase" in `ernes-edge-functions` (nieuwe
   ref invullen, bevestigen met `JA`). Dan de databasefunctie
   `taak_melding_signaal` nalopen: daar staat het **live projectadres hard
   in de code**; vervang het. Pas daarna het blok `CRONJOBS` uit het
   schemabestand draaien, met de adressen omgezet naar het nieuwe project.
   Dit deel is op 1 november 2026 **niet** geoefend; de stappen staan in
   SYSTEEM.md 4.8.
8. **De apps richten.** In elk HTML-bestand staan het projectadres en de
   publieke sleutel hard in de code (`SUPABASE_URL`, `SUPABASE_KEY`, of
   een variant daarvan; zoek op `supabase.co`). Vervang ze door die van
   het nieuwe project. Dit is de laatste stap en de makkelijkst vergeten:
   vergeet je hem, dan draaien de apps door tegen een database die niet
   meer bestaat, zonder duidelijke foutmelding.
9. **Testen** in elke app, met het account dat er in live ook voor wordt
   gebruikt: inloggen, een calculatie openen, een PDF printen, een taak
   afvinken, de planning tot en met volgend jaar openen.

**Oefenen zonder risico:** doe stap 2 tot en met 4, 6, 8 en 9 op het
oefenproject `schilders-calc-hersteltest`, met een lokale kopie van
`index.html` die naar dat project wijst. Dat is precies wat op 1 november
is gedaan. Sluit nooit cronjobs of mailende functies aan op een
oefenproject: ze mogen niet naar buiten mailen of naar live wijzen.

Verder lezen: SYSTEEM.md 4.9 (de geoefende procedure en de bevindingen),
4.8 (herbouwen vanaf nul, inclusief functies en cronjobs), 4.0 tot en met
4.6 (wat te doen bij kleinere storingen; begin altijd bij 4.0).

---

## 6. Doorbouwen zonder Gian of zonder Claude

Deze regels zijn niet vrijblijvend; elke regel is ontstaan uit een fout
die een halve dag of meer heeft gekost.

1. **Sessiestart-check.** Haal het bestand dat je gaat wijzigen altijd
   **live** uit de repo (met cache-omzeiling), nooit uit een oude kopie.
   Vergelijk de constante `APP_VERSION` met de bovenste regel van de
   bijbehorende CHANGELOG. Kloppen ze niet, synchroniseer eerst en bouw
   niets. Vlak voor je een nieuwe versie klaarzet: nog eens live
   ophalen; is er intussen iets veranderd, bouw opnieuw op de nieuwe
   versie. Dit geldt ook voor `SYSTEEM.md` (botst het vaakst) en voor
   Edge Functions (vergelijk de kopregel van de code in het dashboard
   met de CHANGELOG; een versie in een CHANGELOG is geen bewijs).
2. **De vijf ankers** van `index.html` dragen hetzelfde versienummer:
   `APP_VERSION`, de welkomstkop in het dashboard, de openingsalinea van
   de introtekst, de bovenste regel van `RELEASE_HIGHLIGHTS` en de
   bovenste regel van `CHANGELOG.md`. Elke andere app heeft minstens
   `APP_VERSION` plus zijn eigen CHANGELOG.
3. **Kwaliteitspoorten** voor elke oplevering: alle scriptblokken
   parsen (`node --check`), aantal `<div>`/`</div>` en scripttags gelijk
   aan de live versie, de ankers gelijk. Nooit "werkend" noemen zonder
   geautomatiseerde test; wat in de browser niet getest is, staat zo in
   de CHANGELOG.
4. **Werkwijze:** eerst bespreken, dan samenvatten, dan bevestiging, dan
   pas bouwen. Databasewijzigingen gaan altijd eerst, als los
   SQL-bestand in `sql/`, herhaalbaar zonder schade, met een
   **projectwaker** bovenaan (controle dat je in het goede project zit)
   en een controleregel onderaan. Pas als dat gedraaid en bevestigd is,
   wordt de code aangepast.
5. **Elke wijziging:** versienummer omhoog, CHANGELOG-entry met
   aanleiding, gebouwd, niet gewijzigd, getest en niet getest; bij een
   grotere wijziging een gedateerde sectie in `SYSTEEM.md`. Raakt de
   wijziging een Edge Function, dan dezelfde dag de code in
   `ernes-edge-functions` bijwerken.
6. **De bewijsregel:** bij elk getal, elke bestandsnaam en elke bewering
   over dit systeem hoort een bron: *gemeten* (uit een opgehaald bestand
   of een gedraaide query, met vindplaats), *vermoeden* (met de meting
   die het zou beslissen) of *aanname* (zo genoemd). Nooit bouwen op een
   diagnose uit een regel; eerst meten.
7. **Uitrollen** gebeurt met de hand via de browser: SQL in de SQL
   Editor van Supabase Studio, Edge Functions via de editor in Studio of
   de GitHub Action, app-bestanden via de website van GitHub. Gian werkt
   nooit met een terminal; bied hem altijd een browserweg.

Verder lezen: SYSTEEM.md 5 (releaseregels, met de voorvallen erachter).

---

## 7. Wat je nooit doet

- **SQL in live draaien zonder projectwaker.** In september 2026 is per
  ongeluk een migratie in het verkeerde Supabase-project gedraaid.
  Sindsdien begint elk SQL-bestand met een controle op een tabel die
  alleen in het bedoelde project bestaat.
- **Een Edge Function opslaan onder de standaardnaam.** Supabase Studio
  vult een willekeurige naam in (`bright-endpoint` en dergelijke) als je
  het naamveld niet aanpast. Op 29 oktober 2026 is zo
  `onderaannemer-aanvraag` onder een verkeerde naam beland; de app kreeg
  een 404 die Safari als "Load failed" toonde. Controleer de naam voor je
  op Deploy klikt.
- **Een oude kopie uitrollen.** Gebruik voor Edge Functions alleen
  `supabase/functions/` in `ernes-edge-functions`. Git-geschiedenis is om
  terug te kijken, niet om uit te rollen.
- **Een uitdraai van de database ongezien delen.** Zie hoofdstuk 4.
- **Naar Yoobi terugschrijven.** De suite leest uit Yoobi; schrijven doet
  Gian zelf in Yoobi.
- **Cronjobs of mailende functies aansluiten op een oefenproject.**
- **Bouwen zonder bevestiging.** Gian wil eerst een voorstel, dan een
  keuze, dan pas werk.

---

## 8. Leeswijzer SYSTEEM.md

| Vraag | Lees |
|---|---|
| Welke apps, welke databases, welke bakken, welke koppelingen | hoofdstuk 1 |
| Wie kan waar bij, welke sleutels bestaan | hoofdstuk 2 |
| Wat draait er 's nachts en 's ochtends vanzelf, en hoe zie je of het nog draait | hoofdstuk 3 (3.4 heeft de controlequery `inventarisatie_automatiek.sql`) |
| Er is iets stuk | hoofdstuk 4, begin bij 4.0 |
| De database terugzetten | 4.9, daarna 4.8 |
| Hoe er gebouwd en uitgerold wordt | hoofdstuk 5 |
| Wie te bellen | hoofdstuk 6 |
| Wat er op een bepaalde dag is gebeurd en waarom | de dagverslagen onderaan, gedateerd |

De CHANGELOGs per app (`CHANGELOG.md` voor Calc, `CHANGELOG_taken.md`,
`CHANGELOG_planning.md`, enzovoort) zijn de fijnste bron: elke versie
noemt aanleiding, wat er gebouwd is, wat niet gewijzigd is en wat wel en
niet getest is.

---

*Dit document is leidend in de repo `schilders-calc`; de PDF in de
Drive-map "Backups Schilders Calc" is een kopie en wordt alleen ververst
bij een inhoudelijke wijziging. Datum en versie staan bovenaan. Wijzig je
dit document, wijzig dan beide.*
