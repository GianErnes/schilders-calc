# CHANGELOG planning.html

## v0.17.0 — Paraplu-projecten standaard van het bord, "verberg" in "Nog geen datum", 04-10-2026

**Aanleiding.** Hoofdprojecten in Yoobi waar jaarlijkse deelprojecten onder hangen (bijvoorbeeld *Van Gessel | Onderhoudsplan 2026-2032*) stonden op het bord en in de kaart "Nog geen datum in Yoobi", terwijl het werk in de deelprojecten zit. Gian koos op 04-10-2026 voor herkenning op de naam, met handmatig tonen/verbergen als overrule (route 2 via Yoobi `includeMainOrSubProject=1` blijft mogelijk voor later; de verkenning daarvoor is nog niet gedraaid).

**Regel.** `PARAPLU_REGEL`: de projectnaam bevat "onderhoudsplan" gevolgd door twee jaartallen met een streepje (ook –, — of /) ertussen. Eén jaartal, zoals het deelproject "Onderhoudsplan 2027", telt niet. Volgens Gian is de naam van een hoofdproject altijd zo opgebouwd.

**Gebouwd.**
- Eén functie `isVerborgen(p)`: bewust verborgen (`zichtbaar === false`) óf paraplu zonder overrule. Gebruikt in `rijenOpBord`, `projectenOverDatum`, `kennisStatus`, `tekenVerborgen` en nu ook in `projectenZonderDatum` — die laatste negeerde de verberg-vlag (bug sinds het begin: een verborgen project bleef in "Nog geen datum" staan).
- Kaart "Verborgen projecten" toont ook de regel-verborgen hoofdprojecten, met label "regel" en muistip; knop "toon" werkt voor beide. Voetnoot aangevuld.
- Kaart "Nog geen datum in Yoobi": knop "verberg" per regel (zelfde `zetZichtbaar`).
- `zetZichtbaar` onderscheidt nu: paraplu → `toon_ondanks_regel` aan/uit (zichtbaar blijft true); gewoon project → `zichtbaar` zoals voorheen. "Verbergen" in het projectpaneel zet bij een teruggehaalde paraplu de overrule dus weer uit.
- Nieuwe kolom `plan_projecten.toon_ondanks_regel boolean not null default false` via `planning_06_paraplu.sql` (één controleregel). Oude rijen en standen zonder de kolom gelden als "geen overrule"; de app leest `=== true`, dus niets breekt als de SQL nog niet is gedraaid — alleen "toon" op een hoofdproject geeft dan "Opslaan mislukt" (kolom bestaat niet).

**Niet gewijzigd.** Sync `fin-werkvoorraad-sync`, Edge Function `planning-ics` (aanname: leest `plan_uren`; hoofdprojecten hebben geen uren), deelprojecten (eigen Yoobi-code, blijven gewoon staan).

**Getest.** Node-parse; 14 runtime-tests op `isParaplu`/`isVerborgen`/`verborgenDoorRegel` (Gessel-naam, en-dash, kleine letters, één jaartal niet, "2027 Controlebeurt" niet, jaartallen zonder het woord niet, leeg; zonder rij, rij met default true, overrule true/false, expliciet verborgen wint); div-balans 127/127 en CSS-balans 876/876 gelijk aan live v0.16.2.

**Niet getest.** In de browser tegen de echte stand. Te controleren door Gian: Gessel verdwijnt van bord en uit "Nog geen datum" en staat onder "Verborgen projecten" met "regel"; "toon" haalt hem terug (na de SQL); de deelprojecten staan er nog; "verberg" in "Nog geen datum" werkt.

## v0.16.2 — Voetrijen "Nog te plannen per dag" bij eerste openen allemaal zichtbaar, 04-10-2026

**Aanleiding.** Melding van Gian: bij nieuw openen van de planning is onderaan meestal maar één rij van "Nog te plannen per dag" zichtbaar (alleen Jens); na een willekeurige klik die het bord hertekent staan alle rijen er wel.

**Oorzaak (uit de code).** De voetrijen hangen met `position: sticky; bottom` onder elkaar; per rij wordt `bottom` berekend uit `offsetHeight` van de rijen eronder. In `laadData()` werd `tekenBord()` aangeroepen terwijl `.wrap` nog `display:none` had. Een onzichtbaar element heeft `offsetHeight` 0, dus alle rijen kregen `bottom: 0px` en lagen over elkaar; alleen de laatst getekende (Jens) was zichtbaar. Elke herteken daarna gebeurde met zichtbaar bord en ging goed.

**Wijzigingen.**
- `laadData()`: `.wrap` eerst zichtbaar maken en de laadmelding sluiten, pas daarna `tekenBord()`.
- Berekening van de voet-`bottom`s uit `tekenBord()` gehaald naar `zetVoetRijenVast()`. Vangnet: is de onderste voetrij nog 0 pixels hoog, dan wordt een frame later opnieuw gerekend (max. 60 frames, ca. 1 seconde). Daarmee kan dit niet terugkomen als het bord ooit op een andere plek onzichtbaar getekend wordt.

**Status.** Diagnose uit de code; JS parse-test (`node --check`) geslaagd. Nog te controleren door Gian in de echte browser: planning vers openen (ook met Cmd/Ctrl+Shift+R) en zien dat Gian, Max, Bjorn en Jens plus de kopregel onderaan allemaal staan.

## v0.16.1 — Correctietekst als de planning na een kennisgeving is verschoven, 03-10-2026

**Aanleiding.** Vraag van Gian na de eerste tien weekaankondigingen: zegt de mail bij een verschuiving ook dát er iets verschoven is? Nee: "opnieuw" maakte dezelfde standaardtekst. Besluit Gian: wel een correctietekst, zonder excuses (de wijziging kan ook van de klant komen).

**Wijziging.** `kennisVorige(p, soort)`: de laatste niet-overgeslagen verzending voor die soort, alleen als de periode sindsdien veranderd is (zelfde regel als het oranje label). Is die er, dan begint de tekst met "In afwijking van ons eerdere bericht: de werkzaamheden aan [project] zijn verplaatst van week 43 naar week 45 (2 november t/m 6 november 2026)." (maand: "van oktober 2026 naar november 2026"; dag: "starten niet op donderdag 22 oktober 2026 maar op maandag 2 november 2026", met de startijden zoals gewoonlijk), het onderwerp krijgt "Gewijzigd: " ervoor en de knop in het paneel heet "corrigeren". De oude periode komt uit `periode_tekst` van de eerdere rij (wat de klant las), met terugval op de berekening uit `start_bij_verzending`. Zelfde periode of eerdere rij overgeslagen: gewone tekst en knop "opnieuw".

**Getest.** `node --check` schoon; 49 gedragstests (6 nieuw: week-, dag- en maandcorrectie, onderwerp "Gewijzigd:", zelfde week geeft gewone tekst, overgeslagen geeft gewone tekst). Niet in de browser getest.

## v0.16.0 — Aanhef met heer/mevrouw en achternaam in de kennisgevingen, 03-10-2026

**Aanleiding.** Wens van Gian: "Geachte heer Kamp," in plaats van "Geachte Peter Kamp,". Yoobi geeft geen geslacht mee en de calculatie (waar de aanspreekvorm per calculatie gekozen wordt, `_offAanhef`) is niet aan de Yoobi-projectcode gekoppeld, dus de keuze moet in de planning zelf. Besluit Gian: versturen pas mogelijk als de aanspreekvorm gekozen is; geen gok, geen neutrale terugval.

**Wijziging.**
1. **SQL `planning_05_aanhef.sql`** (guard op planning_04, idempotent): `plan_projecten.contact_aanspreekvorm` (check: heer / mevrouw / echtpaar / familie / zakelijk) en `contact_achternaam`.
2. **planning.html**: in het kennisgevingvenster onder de contactpersoon een regel Aanhef: keuzelijst met dezelfde vijf vormen als de offerte en een veld "tussenvoegsel en achternaam" dat uit de Yoobi-naam wordt gegokt (`achternaamGok`: titels als Dhr./Mevr./Fam./De heer en voorletters eraf, vanaf het eerste tussenvoegsel, anders het laatste woord; "Jan van der Berg" → "van der Berg", "L. en M. Willems" → "Willems"). Onder de regel staat live "De mail begint met: Geachte heer Kamp,". Bij zakelijk is het naamveld uit en luidt de aanhef "Geachte heer, mevrouw,". Zonder aanspreekvorm (of zonder achternaam bij een niet-zakelijke vorm) weigert Versturen met een melding. Contactpersoon én aanhef worden vóór elke verzending (en bij "wijzig" zonder mail) met één upsert op `plan_projecten` bewaard; mislukt dat, dan gaat er geen mail. De week- en dagmail nemen de bewaarde aanhef over; het paneel toont hem achter de contactpersoon, of "aanhef nog kiezen" in oranje.

**Getest.** SQL op lokale Postgres 16: guard, tweemaal draaien 3× GOED, check weigert "meneer". App: `node --check` schoon; 43 gedragstests (de 30 bestaande, plus aanhef per vorm en negen naamgokken). Niet in de browser getest; de live-voorbeeldregel en het uitschakelen van het naamveld bij zakelijk zijn alleen uit de code beoordeeld.

**Bewust zo gelaten.** De gok is een voorstel; wat er in het veld staat gaat mee. Eén aanhef per project, ook bij meerdere contactpersonen: wissel je van contactpersoon, dan wordt de achternaam opnieuw gegokt zolang je hem niet zelf hebt aangepast.

## v0.15.2 — Volledige mailhandtekening onder de kennisgevingen, 03-10-2026

**Aanleiding.** Eerste echte verzending (dagmail, 3 oktober 20:16, afzender planning@ernes.nl): werkt, maar zonder de handtekening met logo's die de offertemail wel heeft.

**Wijziging.**
1. **Edge Function `planning-kennisgeving` v2** (opnieuw uitrollen, Verify JWT blijft AAN): `handtekening()` letterlijk overgenomen uit `offerte-verzenden` v3.96.0 (groet "Met kleurrijke groet, Gian Ernes", logo, contactgegevens, klantenvertellen, Vakwerk PlusGarantie, KvK; plaatjes op www.ernes.nl). Staat onder elke kennisgeving, in dezelfde omslag (640 px, Arial) als de offertemail. De tekstversie krijgt een platte handtekening van drie regels. Eindigt de tekst uit de app toch op een groet ("Met vriendelijke/kleurrijke/hartelijke groet, …"), dan knipt de functie die weg zodat de groet één keer staat; in `plan_kennisgevingen.tekst` komt de tekst zonder groet en zonder handtekening.
2. **planning.html**: de drie mailteksten eindigen niet meer op "Met vriendelijke groet, Ernes Schilders"; de hint onder het tekstvak zegt dat de handtekening er automatisch onder komt.

**Getest.** Functie: 9 Deno-tests (de 8 van v1 plus: handtekening aanwezig in de html; groet in de app-tekst wordt weggeknipt; groet staat één keer in html én tekst; vastgelegde tekst zonder groet); `deno check` schoon. App: `node --check` schoon, 30 gedragstests slagen (de aanhef-test en de teksttests ongewijzigd). Niet getest: de weergave van de handtekening in Gmail/Apple Mail voor deze mail — in de offertemail is hij al in gebruik.

## v0.15.1 — 2027-werk stond op het 2026-bord, 03-10-2026

**Aanleiding.** Gezien na v0.15.0 (schermafbeelding Gian): Penders "2027 Controlebeurt" met Yoobi-datums in april 2027 en 0 uur in 2026 stond toch op het 2026-bord. Oorzaak: de terugval in `rijenOpBord` ("geen datum in dit jaar, maar wel uren: toch tonen") gebruikt `urenVanFase`, en die telt sinds v0.12.0 ook `urenBuiten` mee. Elk project met uren in welk jaar dan ook kwam zo op elk jaarbord. Fout uit v0.12.0, zichtbaar geworden door de labels van v0.15.0.

**Wijziging.** `urenVanFase(code, f, ditJaar)`: met `ditJaar` alleen de uren van het bordjaar. De bordfilter geeft `true` mee; het paneel (fase-sommen) blijft alle jaren tellen, zoals bedoeld in v0.12.0.

**Getest.** `node --check` schoon; de 28 gedragstests van v0.15.0 slagen nog; extra test: project met start in 2027 en alleen uren in 2027 staat niet op het 2026-bord, met uren in 2026 wel. Niet in de browser getest.

## v0.15.0 — Kennisgevingen aan de klant: maand, week en startdag, 03-10-2026

**Aanleiding.** Wens van Gian: vanuit de planning drie korte mails aan de klant kunnen sturen — de geplande maand direct na het inplannen, de week ongeveer twee weken vooraf, en de startdag de week ervoor — met vastlegging van wanneer wat verzonden is. Keuzes van Gian (03-10-2026): contactpersoon uit Yoobi kiezen bij de eerste mail (niet de sync uitbreiden), signalen op het bord maar versturen blijft handmatig, de drie mails staan los van elkaar, afzender planning@ernes.nl, starttijd in de dagmail "tussen 8:15 en 8:30 uur" tenzij later ingedeeld, en een knop "overslaan" zodat oude projecten niet blijven knipperen.

**Wijziging.**

1. **SQL `planning_04_kennisgevingen.sql`** (project-guard, idempotent): kolommen `plan_projecten.contact_naam` en `contact_email`; nieuwe tabel `plan_kennisgevingen` (yoobi_code, soort maand/week/dag met check, verzonden_op, overgeslagen, aan, aan_naam, door, periode_tekst, start_bij_verzending, onderwerp, tekst, resend_id) volgens het sjabloon: RLS aan, policy `plan_kennisgevingen_authenticated_alles`, anon niets. Eén rij per verzending of overslaan; de laatste rij per soort geldt. Door Gian gedraaid op 03-10-2026: 7× GOED.
2. **Edge Function `planning-kennisgeving` v1** (Verify JWT AAN; archief in `ernes-edge-functions`). Volgorde: harde stop zonder `RESEND_API_KEY` → body controleren (400) → inlog controleren via `/auth/v1/user` voor de kolom `door` (401) → Resend vanaf `Ernes Schilders <planning@ernes.nl>`, `reply_to info@ernes.nl`, `bcc administratie@ernes.nl`, tekst als text én eenvoudige html → rij in `plan_kennisgevingen` → contactpersoon op `plan_projecten` bijwerken. Mislukt het vastleggen ná de mail: antwoord `ok:true, vastgelegd:false`, geen tweede mail. De **app** stelt de tekst samen en toont hem vooraf; de functie controleert, verstuurt en legt vast. Overslaan schrijft de app zelf (authenticated), daar komt de functie niet aan te pas.
3. **planning.html** — nieuw brok 7:
   - Signalen. Maand: vanaf de maandag ná de eerste ingeplande uren van het project (`min(plan_uren.created_at)`, beide urenqueries laden nu `created_at`). Week: vanaf de maandag twee weken vóór de startweek. Startdag: vanaf de maandag van de week vóór de startweek. Start = eerste fase, anders de projectdatums (zelfde terugval als het bord). Geen signaal als er al een rij is, als de start voorbij is, of als het project verborgen is.
   - Verschoven: is er gemaild en valt de start nu in een andere maand (maand), andere week (week) of op een andere dag (dag) dan `start_bij_verzending`, dan oranje "verstuurd … voor week 43 — nu week 45" in het paneel en een omlijnd label op het bord.
   - Bord: oranje label "✉ maand · week" in de linkerkolom (bij fasen alleen op de eerste rij) en een teller "✉ n" in de kop die, zoals de over-datum-teller, langs de projecten springt en het paneel opent.
   - Paneel (met en zonder fasen): blok "Kennisgevingen aan de klant" met de contactpersoon (knop wijzig) en per soort status + knop versturen/opnieuw + overslaan. Teksten in het paneel: "kan verstuurd worden", "vanaf 5 okt", "verstuurd 5 okt voor week 43", "overgeslagen 5 okt door gian".
   - Modaal: contactpersonen opgehaald uit Yoobi via de bestaande Edge Function `yoobi-klant` (`?code=<klantcode>` uit de Yoobi-stand; contacten met e-mail, plus het algemene relatieadres als dat afwijkt), de eerder gekozen contactpersoon voorgeselecteerd, of handmatig naam + adres. Onderwerp en volledige tekst aanpasbaar; de aanhef volgt de gekozen naam zolang de tekst niet met de hand is gewijzigd. Versturen roept de functie aan met het sessietoken; de keuze wordt op `plan_projecten` bewaard (ook via de knop wijzig zonder mail, met upsert op yoobi_code).
   - Dagmail-starttijden: dezelfde blokindeling als `planning-ics` v2 (`WERKBLOKKEN` en `klokNaWerk` letterlijk overgenomen, volgorde via `dagProjecten`). Eerste blok van de dag → "tussen 8:15 en 8:30 uur", later → "rond 12:15 uur"; per schilder een regel als de tijden verschillen; geen uren op de startdag → algemene zin. Weekaanduiding: "week 43 (19 oktober t/m 23 oktober 2026)".
   - Ontbreekt de tabel (SQL nog niet gedraaid), dan laadt het bord gewoon zonder kennisgevingen (melding in de console) en zegt overslaan het erbij; een 404 van de functie geeft de hint dat hij nog niet is uitgerold.

**Getest.**
- SQL op lokale Postgres 16: guard in lege database stopt; tweemaal draaien schoon; soort `jaar` geweigerd; anon geen rechten, authenticated lezen en schrijven.
- Edge Function met Deno 2.2.7 en nagebootste Resend/auth/PostgREST, 8 tests: harde stop raakt niets aan; vijf foute bodies 400 zonder aanroepen; niet ingelogd 401; geslaagde verzending met controle op from/bcc/reply_to, de rij (door, resend_id, start) en de contact-PATCH in de juiste volgorde; Resend-fout 502 zonder rij; vastleggen mislukt → mail één keer, melding apart. `deno check` schoon.
- planning.html: `node --check` schoon; 28 gedragstests in Node met nagebootste DOM en vaste datum (za 3 okt 2026): signaaldatums per soort, teller, labels, verschoven per soort (zelfde week andere dag = alleen dag verschoven), overgeslagen telt niet als verschoven, start voorbij en verborgen geven geen signaal, fasen nemen de eerste fase, starttijden (08:00 → "tussen 8:15 en 8:30 uur", na 4 uur ander werk → "rond 12:15 uur"), en de drie mailteksten en onderwerpen.
- **Nog niet getest in de echte omgeving:** de functie tegen Supabase en Resend, het ophalen van contactpersonen via `yoobi-klant` vanuit planning.html, het modaal op iPad/iPhone, en de rij die `laadAlles` na een verzending terugleest.

**Bewust zo gelaten.** Geen automatische verzending (cron): elke mail gaat na een klik met de tekst in beeld. De signalen gebruiken `plan_uren.created_at` van de oudste nog bestaande urenrij; worden alle uren gewist en opnieuw gezet, dan schuift het maandsignaal mee. De starttijd in de dagmail is een indeling van de geplande uren, geen afspraak die de planning vastlegt; wijzigt de volgorde na verzending, dan ziet het bord dat niet (alleen datumverschuivingen). Bij projecten met fasen gelden de kennisgevingen voor de eerste fase; latere fasen krijgen geen eigen mails.

## v0.14.0 — Agenda als tijdblokken 08:00–16:15, volgorde per dag kiesbaar, 03-10-2026

**Aanleiding.** v0.13.0 werkte in de echte iPhone-agenda (bevestigd met schermafbeeldingen), maar als hele-dag-items bovenin. Wens van Gian: blokken in de dagweergave, zoals 08:00–12:30 Laumen en 12:30–16:30 Oudelhoven. Kader dat hij gaf: werkdag altijd 08:00–16:15, pauze 10:00–10:15 en 12:30–13:00, in principe nooit meer dan 7,5 uur per dag gepland.

**Wijziging.**

1. **Edge Function `planning-ics` v2** (opnieuw uitrollen, Verify JWT blijft UIT; link en token veranderen niet). Per project per dag een tijdblok met `DTSTART;TZID=Europe/Amsterdam`, plus een `VTIMEZONE`-blok voor zomer-/wintertijd. De blokken liggen achter elkaar vanaf 08:00; pauzes schuiven alleen de eindtijd op (één afspraak per project, geen gesplitste blokken). Eindigt een blok precies op een pauzegrens, dan staat er 10:00 en niet 10:15. Meer dan 7,5 uur op een dag loopt voorbij 16:15 door, met een "Let op"-regel in de omschrijving — zichtbaar met opzet. Titel "Klant – project"; omschrijving: uren, bij meerdere projecten de tijden en het dagtotaal, Yoobi-code, en de zin dat de tijden een indeling van de uren zijn en geen afspraak met de klant. Verlof blijft een hele-dag-item. Volgorde: `plan_uren.volgorde` (1 = eerst), anders grootste blok eerst, dan klant alfabetisch, dan Yoobi-code.
2. **SQL `planning_03_volgorde.sql`**: kolom `plan_uren.volgorde smallint` (leeg = regel). Guard eist dat `planning_02` al gedraaid is.
3. **planning.html**: het dagvenster (klik onderaan het bord op een dag bij een medewerker) toont bij twee of meer projecten de volgorde zoals de agenda hem krijgt, met per project een knop **eerst**. Die zet de volgorde van alle projecten op die dag (1, 2, 3…) met `update … match()` en herbouwt het venster. Mislukt het opslaan, dan draait het geheugen terug en meldt de status het, met een hint naar het SQL-bestand als de kolom ontbreekt. Dezelfde sorteerregel als in de functie staat in `dagProjecten()`. `volgorde` wordt meegeladen in `laadAlles` en gaat uit het geheugen zodra de uren van die dag op nul gaan.

**Bewust zo gelaten.** Bij het verschuiven van een fase (`slaDatumsOp`: delete + upsert) en bij het wissen van uren gaat de handmatige volgorde van die dagen verloren; de dag is dan toch opnieuw ingedeeld. Een gewone urenwijziging via het bord laat `volgorde` staan: de upsert stuurt die kolom niet mee, en PostgREST zet bij een conflict alleen de meegestuurde kolommen — dat laatste is een aanname op basis van PostgREST-gedrag, lokaal met gewone SQL nagebootst, niet tegen PostgREST getest. Begintijd en pauzes staan vast in de functie (`WERKBLOKKEN`), niet per medewerker instelbaar.

**Getest.**
- SQL op lokale Postgres 16: guard zonder `planning_02` stopt; tweemaal draaien schoon; een upsert die `volgorde` niet meestuurt laat hem staan.
- Edge Function: `deno check` schoon; 31 mocktests, waaronder 7,5 u → 08:00–16:15, 4 u + 3,5 u → 08:00–12:15 en 12:15–16:15, handmatige volgorde die van de regel wint, een blok over de 10:00-pauze heen (1 u + 2 u → 09:00–11:15), 8,5 u op een dag → eind 17:15 plus waarschuwing, 9 u in één blok → 17:45, een 2-uursblok dat op 10:00 eindigt en niet op 10:15, VTIMEZONE vóór de afspraken, verlof als hele dag. Uitvoer geparsed door ical.js: 08:00 Europe/Amsterdam komt uit op 06:00 UTC (zomertijd, klopt voor oktober vóór de 25e).
- planning.html: Node-parsetest, CSS 217/217, div 113/113, runtime-harnas met stub-Supabase: regelvolgorde, lijst alleen bij ≥2 projecten, "eerst" slaat 1-2-3 op voor de juiste medewerker en dag, andere medewerker ongemoeid, terugdraaien bij databasefout, deels gezette volgorde.

**Niet getest (aan Gian).** De keten tot in de agenda-app na de herdeploy; of Apple en Google de `VTIMEZONE` netjes overnemen rond de wintertijdwissel van 25 oktober; het dagvenster op de iPad in het echt (knop "eerst" en herbouw van het venster). De eerste controle: één dag met twee projecten, in de agenda moeten ze aansluiten en de dag moet op 16:15 eindigen.

## v0.13.0 — Agenda-abonnement per medewerker (Apple/Google Agenda), 03-10-2026

**Aanleiding.** Vraag van Gian: kan de planning in de agenda van de telefoon? Gekozen (na afweging van losse ICS-download en tweewegs Google API): een abonnements-feed, eenrichting, één hele-dag-item per project per werkdag, per medewerker gefilterd. Weekblik is genoeg; trage verversing door Google (soms pas na een dag) is aanvaard.

**Wijziging.** Drie delen, in deze volgorde uit te rollen:

1. **SQL `planning_02_ics_token.sql`** — kolom `plan_medewerkers.ics_token` (tekst, leeg = geen feed) met unieke index. Geen RLS-wijziging: de bestaande policy `plan_medewerkers_authenticated_alles` geldt, dus iedereen die in planning.html kan, kan links maken en vernieuwen.
2. **Edge Function `planning-ics` (nieuw, Verify JWT UIT)** — `GET ?t=<token>` → medewerker via `ics_token` → `plan_uren` en `plan_verlof` van vandaag −30 t/m +365 dagen → projectnaam en klant uit de laatste `fin_werkvoorraad`-stand (`data.projecten[]`, match op `code`, zelfde bron als het bord) → `text/calendar`. Per dag met uren één hele-dag-afspraak `"<klant> – <project> (7,5 u)"`, omschrijving met Yoobi-code; verlof als `"Verlof – <omschrijving>"` of `"<x> u gereserveerd"`. UID stabiel per project+medewerker+datum (`@ernes`), zodat agenda-apps een gewijzigde dag bijwerken in plaats van verdubbelen. `LAST-MODIFIED` uit `plan_uren.updated_at`. Dagen met 0 uur en onbekende tokens (ook te korte: geen databaseaanroep) geven niets terug; databasefout → 503. Leest met de service-rol, schrijft nooit.
3. **planning.html** — in Beheer → Medewerkers per medewerker een knop **Agenda** (✓ als er een link is). Paneel: de `webcal://`-link, *Kopieer link*, *Open in agenda-app*, *Link vernieuwen* (nieuw token, oude link direct dood, met bevestiging), *Intrekken* (token leeg, agenda wordt leeg, met bevestiging), een QR-code en drie regels uitleg. Token: 24 willekeurige bytes uit `crypto.getRandomValues` → 32 tekens base64url. De QR wordt in de pagina zelf berekend (eigen implementatie, bytemodus, foutcorrectie M, versie 1 t/m 10; geen externe bibliotheek). Opslaan via `update … eq('id')`, dus de bestaande `slaMedewerkerOp`-upsert raakt het token niet aan.

**Bewust buiten scope.** Adres in het item, begintijden, gesloten dagen/feestdagen (staan al in ieders agenda), verlof van anderen, pushmelding bij wijziging, iets terugschrijven vanuit de agenda.

**Beveiliging, eerlijk gezegd.** De link is zonder login bereikbaar; dat moet, want agenda-apps kunnen niet inloggen. Het geheim is het token (32 tekens, ~144 bits). Wie zijn link doorstuurt, geeft zijn planning weg; daarvoor is *Link vernieuwen*. Het token staat leesbaar in `plan_medewerkers` voor iedere ingelogde planninggebruiker (zelfde kring die het bord ziet).

**Getest.**
- SQL op lokale Postgres 16: project-guard stopt in een leeg project; tweemaal draaien schoon; dubbel token geweigerd; gewone update op de rij laat het token staan.
- Edge Function: `deno check` schoon; 20 mocktests (404-paden, 405, HEAD, lege planning, 503 bij databasefout, escaping van `,` en `;`, regelvouwing op 75 octetten incl. é, stabiele UID, LAST-MODIFIED, CRLF); uitvoer onafhankelijk geparsed door ical.js (Mozilla) als hele-dag-afspraken.
- QR: 120 willekeurige teksten in versie 1 t/m 10 correct teruggelezen door jsQR (onafhankelijke lezer). Daarbij drie fouten in de eerste versie gevonden en hersteld — zonder die externe lezer waren er twee ongemerkt gebleven.
- planning.html: Node-parsetest, CSS-balans (214/214), div-balans (110/110), runtime-harnas: 500 tokens uniek en passend op de `TOKEN_RE` van de functie, url-opbouw, paneel in drie toestanden met stub-DOM, QR van een echte link leesbaar (versie 6).

**Niet getest (aan Gian).**
- De hele keten in het echt: SQL → deploy → link maken → abonneren op een iPhone en in Google Agenda. Hoe het er in de agenda-apps uitziet kan ik niet zien.
- Aanname: op iPhone opent tikken op een `webcal://`-link de Agenda met een abonnementsvraag (algemeen bekend gedrag, niet door mij getest).
- Aanname: de menutekst "Andere agenda's → Via URL" in Google Agenda staat uit het geheugen, niet opgezocht. Controleren voordat de uitleg aan een medewerker wordt gegeven; staat in `tekenAgendaPaneel`.
- Of Supabase een `HEAD` op een Edge Function doorlaat is niet gecontroleerd; `GET` is wat agenda-apps gebruiken.

## v0.12.0 — Nog te plannen en fase-uren tellen over alle jaren, 01-10-2026

Melding van Gian (project De Bie, Yoobi 20261671, fase 1 in nov 2026, fase 2 in apr 2027): op het bord 2026 stond "nog te plannen 8,89" (budget 21,64 − 12,75 gepland), op het bord 2027 stond ineens 21,64 nog te plannen en fase 1 toonde 0 uur. Oorzaak: `laadAlles` haalde `plan_uren` alleen voor het bordjaar op, en "nog te plannen" en de fase-sommen rekenden met dat jaar. Intern consistent, maar fout voor elk project dat over de jaargrens loopt.

Hoe het nu werkt: één extra query in `laadAlles` haalt de uren **buiten** het bordjaar (`datum < 1 jan OR datum > 31 dec`) in een aparte laag `urenBuiten`. Het bord zelf blijft rekenen op `uren` (alleen bordjaar) en wordt niet trager. In het paneel:
- **Ingepland <jaar>**: ongewijzigd, telt alleen het bordjaar.
- **Nog te plannen**: budget − ingepland over álle jaren (`urenVanProject(code, true)`).
- **Uren per fase**: over alle jaren, dus fase 1 toont op het bord 2027 ook haar 12,75 uur uit 2026.
- Uren die bij een verschuiving over de jaargrens landen, gaan in `urenBuiten` in plaats van uit het geheugen te verdwijnen (voorheen pas zichtbaar na herladen).
- Voetnoten en muistips aangepast.

Terugval: mislukt de extra query, dan een waarschuwing in de console en gedrag als v0.11.1 (alleen dit jaar).

Niet gewijzigd, bewust: bij het verschuiven van een fase gaan alleen de uren van het bordjaar mee (`slaDatumsOp` kijkt in `uren`). Een fase die zelf over de jaargrens ligt verschuif je dus per bordjaar.

Getest: Node-parsetest, CSS/div-balans, rekenlogica met synthetische De Bie-data (12,75 / 8,89 / fase-sommen beide kanten op). De PostgREST `.or('datum.lt.…,datum.gt.…')`-filter is uit de supabase-js-documentatie en niet live getest — controleer bij de eerste lading dat het paneel op 2027 nu 8,89 toont.

## v0.11.1 — Hulpmiddel-naam altijd zwart, 25-09-2026

- De naam en omschrijving in de hulpmiddelstrook waren wit (donker alleen bij mobiel toilet). Loopt de tekst voorbij een korte strook over de projectblokken of leeg veld heen, dan was hij onleesbaar. Nu altijd zwart, ongeacht de kleur eronder.
- Technisch: `.middeltekst` color `#000`; `.middeltekst.donker` en de bijbehorende klasse in `tekenProjectRij` verwijderd (overbodig).

## v0.11.0 — "Over datum": nog open in Yoobi, planning voorbij, 23-09-2026

Vraag van Gian: een werk dat door regen of anderszins niet is uitgevoerd, blijft stil op zijn oude plek in de planning staan en schuift uit beeld. Regel (Gian): een project dat in Yoobi gesloten is, is echt klaar; alles wat over datum is en nog open staat, is ofwel nog uit te voeren (herplannen) ofwel te sluiten. Dat moet een melding krijgen.

Hoe het werkt: een project dat nog in de Yoobi-stand staat (de sync haalt alleen actieve projecten, dus "niet in de stand" = gesloten) en waarvan de einddatum op ons bord (`plan_eind`, anders Yoobi-eind; bij fasen het einde van de laatste fase) meer dan **2 werkdagen** vóór vandaag ligt, telt als over datum. Weekend en gesloten dagen tellen niet mee (`werkdagenTussen`). Voorbeeld: eind vrijdag → maandag en dinsdag nog stil, woensdag melding. Verborgen projecten worden met rust gelaten.

Zichtbaar: rood label "Over datum" in de linkerkolom, rode gestreepte periodelijn en rode urenblokken op de rij, muistip met wat te doen. In de kop een rode knop "N over datum"; elke klik springt naar de volgende over-datum-rij (uitgelicht, 2,5 s) en scrolt de einddatum in beeld. Projecten die over datum zijn maar niet op dit jaarbord staan (eind vóór dit jaar) komen in een kaart "Over datum, niet op dit bord" rechts, met einddatum — anders zou de teller iets tellen dat je niet kunt vinden. Legenda-item toegevoegd. Melding verdwijnt vanzelf na balk slepen of na sluiten in Yoobi (het tweede na de nachtsync).

Geen nieuwe tabel of opslag; puur berekening bij het tekenen. Nieuwe functies: `projectEind`, `isOverDatum`, `projectenOverDatum`, `tekenOverDatum`; constante `OVER_DATUM_WERKDAGEN = 2`.

Getest (node, synthetisch): drempel rond weekend en gesloten dag (7 gevallen), laatste-fase-bepaling, JS-parse, divbalans. Niet getest: echt bord, iPhone, gedrag van de springknop met ingeklapte kolom.

Hoort erbij, apart gesprek: het 3-maandenfilter ("verlopen") in Edge Function `fin-werkvoorraad-sync` uitzetten, zodat oude nooit-gesloten projecten in de stand blijven en hier zichtbaar worden. Gian ruimt die handmatig op. Volgorde: eerst dit bord, dan het filter.

## v0.10.5 — Eigen icoon op het iPhone-beginscherm, 16-09-2026

Eén regel in de head: `apple-touch-icon` naar het nieuwe `apple-touch-icon-planning.png` (Ernes-logo met groene band "Planning", 180×180, uit `erneslogo.png`). Wie Planning op het beginscherm heeft staan ziet nu een grijze P; na verwijderen en opnieuw toevoegen het logo. Verder niets gewijzigd. Getest: JS-parse (node) en tagbalans. Niet getest: iPhone.

## v0.10.4 — Stroken onder en boven de lijn, rij groeit pas bij drie, 09-09-2026

Idee van Gian: niet de rij hoger maken, maar de ruimte in de rij gebruiken. De eerste hulpmiddelstrook ligt nu onder de projectlijn, de tweede erboven, beide over de werkblokken heen (de blokken zijn achtergrond). Zo blijft een rij met twee hulpmiddelen gewoon 40 px. Pas bij een derde en vierde overlappende strook groeit de rij, 12 px per strook, en die komen bovenop. Lijn, blokken, grepen en tekst zijn onderaan de rij verankerd, zodat een hogere rij ze niet meer oprekt. Bij vier overlappende middelen: rij 64 px in plaats van 76. 135 controles.

## v0.10.3 — Naam ín de hulpmiddelstrook, 09-09-2026

De namen bij de stroken stonden als losse tekst boven de strook, over de werkblokken heen, en waren slecht leesbaar. Nu is de strook 11 px hoog met de naam erin: wit op de kleur, donker op het gele toilet. Geen losse tekst meer boven de strook. Lagen staan 12 px uit elkaar in plaats van 14 (vier hulpmiddelen: rij 76 in plaats van 82 px). Alleen CSS en één getal; 132 controles ongewijzigd goed. Leesbaarheid beoordeelt Gian in de browser.

## v0.10.2 — Twee takken samengevoegd, 09-09-2026

Op 9 september is aan planning.html in twee chats tegelijk gewerkt: v0.9.3 (paneel: nog te plannen / nog te werken) in de planningschat en v0.10.0/v0.10.1 (ziekdagen uit Personeel, hulpmiddelen in lagen) in de personeelschat, beide vanaf v0.9.2. v0.10.2 is v0.10.1 plus de paneelwijziging van v0.9.3; verder geen nieuw gedrag. Volledige testreeks (132 controles in jsdom) op het samengevoegde bestand: fasen, hulpmiddelen, verlof, zoeken, slepen, paneel. De ziekdagen- en lagenlogica staan niet in die reeks en bewijzen zich in de browser (F-testronde uit de personeelschat).

## v0.10.1 — Overlappende hulpmiddelen onder elkaar, 09-09-2026

Twee of meer hulpmiddelen die elkaar in tijd overlappen (steiger én toilet) stonden op dezelfde pixels, strook én naam door elkaar. Nu krijgt elk middel een eigen laag: op volgorde van startdatum de laagste laag die vrij is, zoals afspraken in een agenda. De projectrij groeit 14px per extra laag (40 → 54 → 68 → 82px); rijen zonder overlap blijven exact zoals ze waren. Gevonden door Gian bij een demonstratie aan Max.

## v0.10.0 — Ziekdagen uit Personeel op het bord, 09-09-2026

Het bord leest de view `pers_verzuim_dagen` uit de personeelsmodule (alleen leesbaar voor wie `ziet_personeel` heeft). Elke ziekdag komt als regel in dezelfde verlof-map: 100% ziek blokkeert de hele dag (licht rood, "z" in plaats van ✕), gedeeltelijk ziek telt als reservering van norm × percentage, zodat de rest van de dag inplanbaar blijft. Een eigen verlofregel op dezelfde dag wint. Klik op een ziekdag in de totaalrij geeft geen "Opheffen" maar de tekst dat dit in Personeel is gemeld. Planning schrijft nooit in personeel. Is de view niet leesbaar, dan gaat het bord zonder ziekdagen verder (console.warn), zoals bij `plan_verlof`.

## v0.9.3 — "Resterend" vervangen door "nog te plannen" en "nog te werken", 09-09-2026

"Resterend = budget − geboekt − ingepland" telde bij een lopend project de gewerkte dagen dubbel (Terworm: −26,75 terwijl er 43,75 uur budget over was). Nu, zoals Yoobi de cijfers naast elkaar zet:
- **Nog te plannen** = budget − ingepland (dit jaar). Rood als je meer hebt ingezet dan het budget.
- **Nog te werken** = budget − geboekt (Yoobi). Rood als het project over zijn budget is.
Ingepland telt alleen het gekozen jaar (keuze Gian). Gebouwd in de planningschat, los van v0.10.0/v0.10.1 uit de personeelschat; samengevoegd in v0.10.2.

## v0.9.2 — Urencel selecteert het hele getal, 07-09-2026

Klik of tab je in een urencel met inhoud, dan staat het hele getal geselecteerd en vervangt wat je typt het meteen. Voorheen kwam de cursor achter het getal en typte je eraan vast.

## v0.9.1 — "Wijkt af van Yoobi" alleen bij echt verschil, 07-09-2026

De melding verscheen zodra er eigen datums waren opgeslagen, ook als die gelijk waren aan Yoobi (bijvoorbeeld na verschuiven en terugzetten). Nu alleen als start of eind werkelijk anders is. De knop "Terug naar Yoobi-datum" blijft zichtbaar zolang er eigen datums staan, zodat je ze kunt opruimen. 130 controles.

## v0.9.0 — Hulpmiddelen: hoogwerker, steigers, toilet (brok 4b), 07-09-2026

Vereist eerst `planning_05_middelen.sql` (tabel `plan_middelen`). Zonder die tabel werkt het bord gewoon, zonder hulpmiddelen.

### Wat er kan
- **Hulpmiddelen per project of fase**: hoogwerker (oranje), rolsteiger (blauw), vaste steiger (rood), mobiel toilet (geel), overig (grijs, met eigen naam). Elk met periode en notitie (leverancier, tijd).
- **Op het bord** een smalle strook onderin de projectrij van opbouw- tot afbouwdag, met het woord erbij aan het begin, zodat de kleur niet het enige signaal is. Aanwijzen toont periode en notitie.
- **In het paneel** een blok Hulpmiddelen: bestaande regels aanpassen (van, tot, notitie) of verwijderen (met bevestiging); toevoegen met van/tot standaard op de periode van het project of de gekozen fase.
- **Bij een hele verschuiving** van project of fase een aparte vraag of de hulpmiddelen mee moeten ("een bestelde steiger schuift meestal niet mee"). Standaard is niets meeschuiven.
- Geen dubbel-gebruikwaarschuwing: de hoogwerker wordt gehuurd.

### Ook in deze ronde
- **Oranje lijn alleen nog voor de aanname** (Yoobi-start in een eerder jaar, geen eigen datum gezet). Een bewuste afwijking van Yoobi blijft blauw en staat alleen in het paneel. Zo blijft oranje een signaal in plaats van ruis. Legenda aangepast, met de hulpmiddelkleuren.

### Onder de kap
- `plan_middelen` (yoobi_code, fase_id, soort, omschrijving, van, tot). Middelen zonder fase horen bij fase 1 als een project later geknipt wordt.
- Getest: 128 controles in jsdom, waaronder strook en label, toevoegen (overig zonder naam geweigerd), wijzigen, meeschuiven met bevestiging, verwijderen.

## v0.8.1 — Tekst schuift achter de linkerkolom, 07-09-2026

De naam en afspraak vóór de lijn bleven zichtbaar bóven de vaste linkerkolom bij horizontaal scrollen; de blokken verdwenen wel. Oorzaak: gelijke stapelhoogte (z-index) als de kolom. Tekst en grepen staan nu één laag lager. Alleen CSS.

## v0.8.0 — Projecten in fasen knippen (brok 4a), 07-09-2026

Vereist eerst `planning_04_fasen.sql` (tabel `plan_fasen`). Zonder die tabel werkt het bord gewoon, zonder fasen.

Aanleiding: een project als Massop met werk in september en één dag in november stond als één lange rij hoog op het bord; in november keek je omhoog naar een anonieme lijn.

### Wat er kan
- **Knip in fasen** in het paneel: kies een datum, het project splitst in fase 1 (tot en met de dag ervoor) en fase 2 (vanaf die dag). Een fase kun je nog eens knippen. Standaardnamen "fase 1", "fase 2", … zelf te hernoemen.
- **Elke fase is een eigen rij** op het bord met eigen lijn, gesorteerd op eigen start: fase 2 van Massop staat tussen de novemberprojecten. Slepen en trekken werken per fase; uren meeverschuiven geldt voor de dagen van die fase.
- **Eigen klantafspraak per fase**, vóór de lijn naast de naam ("Massop | Kelderkamer · fase 2  vast doc week 46").
- **Elke dag hoort bij precies één fase**: de fase waarin hij valt, anders de dichtstbijzijnde. Een uur staat dus nooit dubbel en verdwijnt nooit; in de andere fase-rijen is die dag niet invulbaar.
- **Samenvoegen met vorige** per fase. Blijft er één over, dan verdwijnen de fasen en krijgt het project die periode als eigen start/eind terug.
- Paneel bij een project met fasen: aanneemsom, budget, ingepland, geboekt en resterend voor het geheel; per fase naam, van/tot, uren, knip- en samenvoegknop.

### Onder de kap
- `plan_fasen` (yoobi_code, volgnr, naam, van, tot, notitie). Knippen en samenvoegen schrijven alle fasen van een project opnieuw (renummerd); slepen, hernoemen en de notitie zijn losse updates.
- Getest: 116 controles in jsdom, waaronder knippen (ook geweigerd buiten de periode), toewijzing van dagen aan fasen, slepen per fase met alleen de eigen uren, hernoemen, notitie per fase, samenvoegen terug naar één periode.

## v0.7.1 — Kop blijft altijd zichtbaar, 07-09-2026

De pagina scrolde mee als het paneel rechts hoger was dan het scherm, waardoor de kop van het bord (weeknummers, dagen) uit beeld verdween. Nu staat de pagina stil: het bord vult het scherm onder de kopbalk en scrolt zelf, het paneel rechts scrolt zelf als het te hoog wordt. Op smalle schermen (onder 1100 px) scrolt de pagina zoals voorheen, met het paneel bovenaan. Alleen CSS; 97 controles ongewijzigd goed. Beeld niet in een echte browser getest.

## v0.7.0 — Naam vóór de lijn, inklapbare kolom, zoeken, 07-09-2026

Op verzoek na v0.6.0: de projectnaam hoort wel in de tijdlijn.

### Wat er anders is
- **Projectnaam + afspraak staan vóór de start van de lijn**, tegen het beginpunt aan (zoals Yoobi). Klik op de naam klapt het project open; klik op de afspraak bewerkt hem. Geen ruimte links (start in de eerste week, of overloopwerk vanaf 1 januari): dan achter het einde van de lijn.
- **Linkerkolom inklapbaar** met het knopje ‹ › in de kop. Ingeklapt blijft 40 px over en krijgt het bord de breedte; de keuze wordt in de browser onthouden.
- **Zoekveld** boven de linkerkolom (bij ingeklapte kolom in de kopbalk): filtert op klant, projectnaam of Yoobi-code terwijl je typt. De totaaltelling onderaan blijft over alle projecten rekenen. Geen treffer geeft een melding.

Getest: 97 controles in jsdom. v0.6.0 is niet live geweest; v0.7.0 bevat die wijzigingen ook (lijn met blokken).

## v0.6.0 — Periode als lijn, geplande dagen als blokken, 07-09-2026

Uit het plannen zelf: een project als Massop (periode september–november, werk op vijf dagen) vulde de hele tijdlijn met een dik blok, en de tekst erop dekte de cellen af zodat je de geplande dagen alleen aan de randjes zag.

### Wat er anders is
- De **periode** (start tot eind) is een dunne lijn met de grepen aan de uiteinden. Gestreept zolang er niemand op gepland is, oranje als onze datum van Yoobi afwijkt, oranje gestippeld bij een aanname.
- Alleen **dagen met geplande uren** krijgen een vol blok. Zo zie je het werk en niet de contractperiode.
- De **projectnaam staat niet meer in de balk**; de vaste linkerkolom toont hem al.
- De **klantnotitie** is een klein label direct achter het einde van de lijn, buiten de cellen (of ervoor, als de lijn het jaar uitloopt). Leeg = "+ afspraak".
- Legenda aangepast.

Getest: 88 controles in jsdom. Het beeld zelf beoordeelt Gian.

## v0.5.0 — Reservering: een deel van een dag niet beschikbaar, 07-09-2026

Vereist eerst `planning_03_verlof_uren.sql` (kolom `plan_verlof.uren`).

Aanleiding: bureau-uren en ziekenhuisbezoeken stonden nergens en werden zo overgepland. Yoobi's "Indirecte uren" wordt bewust weggefilterd, en verlof was alleen een hele dag.

### Wat er kan
- Verlof heeft nu een veld **uren**. Leeg = hele dag vrij (✕, zoals voorheen). Ingevuld = reservering: die uren gaan van de dag af in de totaaltelling (7,5 wordt 4,5 bij 3 uur ziekenhuis), de rest blijft planbaar, en plan je er overheen dan komt het rode hoekje met de reservering in de uitleg. De cel onderaan krijgt een grijs randje; aanwijzen toont de reservering.
- **Wekelijks herhalen t/m** in het verlofformulier: "elke vrijdag 4 uur bureau tot 9 oktober" is één handeling.
- Het popover onderaan het bord vraagt nu ook om uren (leeg = hele dag) en toont bij een bestaande regel wat er staat, met "Opheffen".
- Uurvelden in beheer en popover accepteren een komma (waren getalvelden, die weigeren "2,5").

### Onder de kap
- `plan_verlof.uren` numeric, null = hele dag. Een reservering blokkeert de dag niet voor meeverschuiven; een hele dag wel.
- Getest: 84 controles in jsdom.

## v0.4.0 — Medewerkers, Yoobi verversen, verbergen (brok 3b, deel 2), 07-09-2026

### Wat er kan
- **Medewerkers beheren** in hetzelfde scherm als Vrije dagen: norm (uren per dag) aanpassen, actief aan/uit, volgorde met pijltjes, nieuwe medewerker toevoegen (dubbele naam wordt geweigerd). Niet-actief verdwijnt van het bord; uren blijven bewaard.
- **Yoobi verversen** (knop bovenaan): start `fin-werkvoorraad-sync` v5 met het sessietoken van de ingelogde gebruiker, wacht tot de stand een nieuw tijdstempel heeft (hoogstens 2 minuten) en herlaadt het bord. Een 401 betekent dat v5 niet gedeployd is of Verify JWT aan staat.
- **Project verbergen** (knop in het paneel) voor kapstokprojecten zonder werk. Kaart "Verborgen projecten" rechts met "toon" om ze terug te zetten.

### Onder de kap
- `plan_medewerkers` wordt nu volledig geladen (ook inactief) en bij gebruik gefilterd. Schrijft `plan_medewerkers` (upsert op id, insert bij nieuw) en `plan_projecten.zichtbaar`.
- Verversen leest `fin_werkvoorraad.bijgewerkt_op` voor en na; die kolom schrijft de Edge Function (bron: `fin-werkvoorraad-sync_v5_index.ts`).
- Getest: 75 controles in jsdom. De echte aanroep van de Edge Function is alleen te testen in de browser.

## v0.3.0 — Vrije dagen: gesloten dagen en verlof (brok 3b, deel 1), 07-09-2026

Vereist eerst `planning_02_verlof.sql` (tabel `plan_verlof`). Zonder die tabel werkt het bord gewoon, maar zonder verlof (melding in de browserconsole).

### Wat er kan
- Knop **Vrije dagen** bovenaan opent het beheer voor het gekozen jaar.
- **Gesloten dagen** (voor iedereen): "Nederlandse feestdagen voorstellen" toont de negen feestdagen van het jaar (Paasdatum berekend, Koningsdag op zaterdag als 27 april een zondag is), alle aangevinkt behalve wat er al staat of in het weekend valt; met één knop toevoegen. Periode toevoegen (van t/m, soort, omschrijving) slaat elke weekdag op. Verwijderen per regel.
- **Verlof per medewerker**: periode via het beheer, of één dag door onderaan het bord op de dag bij de medewerker te klikken (popover met "Vrij zetten" / "Verlof opheffen", waarschuwt als er al uren staan).
- Verlofcel: grijs met ✕, geen invoer, telt niet in het restant. Staan er tóch uren op een dag die later vrij werd, dan blijven ze rood zichtbaar zodat je ze kunt verplaatsen.
- Meeverschuiven van uren springt per medewerker over zijn eigen verlof heen.

### Onder de kap
- Leest en schrijft `plan_verlof` (upsert op medewerker_id+datum), `plan_gesloten_dagen` (upsert op datum).
- Getest: 63 controles in jsdom, waaronder feestdagen 2025/2026/2027, periodes zonder weekend, verlof via beheer en via popover, verschuiven over verlof.

## v0.2.1 — Slepen werkte niet in de browser, 07-09-2026

Slepen en trekken deden niets. Vermoedelijke oorzaak (niet na te bootsen in jsdom): de browser begon zelf tekst te selecteren of te slepen en stuurde `pointercancel`. Drie maatregelen: balktekst niet selecteerbaar, browsergedrag bij muis-omlaag op de balk uitgeschakeld, native slepen binnen het bord geblokkeerd. Als dit het niet is, is de volgende stap een kijkje in de browserconsole.

## v0.2.0 — Datums aanpassen (brok 3a), 07-09-2026

### Wat er kan
- Balk slepen: midden vastpakken verschuift start en eind samen; de grepen aan het linker- en rechteruiteinde verschuiven alleen start of alleen eind. Tijdens het slepen staan de nieuwe datums rechtsboven.
- Datumvelden Start en Eind in het paneel rechts, plus de knop "Terug naar Yoobi-datum" die onze datums wist.
- Uren verschuiven mee bij een hele verschuiving (slepen in het midden, of start en eind in het paneel even veel opschuiven), na bevestiging met aantal uren, dagen en werkdagen. Elke geplande dag gaat evenveel werkdagen op; weekend en gesloten dagen tellen niet mee. Bij trekken aan een uiteinde blijven de uren staan.
- Overloopwerk: ligt de Yoobi-start vóór het gekozen jaar en is er geen eigen datum, dan begint de balk als aanname op vandaag (oranje rand met streepjes; het paneel legt het uit). Reden: Yoobi's `startdate` is de opdrachtdatum, niet de geplande uitvoering.
- Aanraking: slepen start pas na 350 ms vasthouden zodat scrollen over het bord blijft werken. Niet getest op iPad; de datumvelden zijn het zekere alternatief.

### Gerepareerd
- De kleur van de totaaltelling (groen/oranje/rood) werd bij het tekenen niet gezet, pas na een wijziging.
- De markering van overschrijdingen doorzocht na elke tekening 730 keer de hele tabel; nu alleen de dagen waar uren op staan. In jsdom van 19 s naar 0,4 s per tekening.

### Onder de kap
- Schrijft `plan_projecten.plan_start`/`plan_eind` (upsert; null = terug naar Yoobi). Bij meeverschuiven: eerst de oude dagen van dat project uit `plan_uren`, dan de nieuwe dagen erin.
- Getest: 44 controles in jsdom, waaronder slepen en trekken met nagebootste muisgebeurtenissen, bevestigingstekst, verplaatste rijen en terug naar Yoobi.

## v0.1.2 — Kolombreedtes afgedwongen, 06-09-2026

In de browser rekte de linkerkolom mee met de langste projectnaam, stond de scroll op maart en liepen de getallen onderaan in elkaar. Eén oorzaak: `table-layout: fixed` werkt alleen met een tabelbreedte, en die ontbrak. De tabel krijgt nu 300 + 365 × 34 px, de linkerkolom knipt lange namen af met "…" (volledige naam in de zweeftekst), en "Vandaag" scrolt op de echte kolompositie. Rijhoogte ongewijzigd. 23/23 controles in jsdom; het beeld zelf is niet in een echte browser getest.

## v0.1.1 — Projectnaam in de balk, 06-09-2026

Na eerste blik in de browser: als je naar de huidige week scrolt zegt een balk niets meer. De projectnaam staat nu vooraan in de balk, de klantnotitie erachter. De tekst heeft de balkkleur als achtergrond en loopt bij een korte balk leesbaar over het einde heen. Getest: 23/23 controles in jsdom.

## v0.1.0 — Het bord in zijn kern (brok 2), 06-09-2026

Eigen pagina naast financieel.html en taken.html, zelfde login en stijl.

### Wat er kan
- Jaarbord met dagkolommen, weeknummers, weekend grijs (niet invulbaar), gesloten dagen grijs gearceerd (niet invulbaar), vandaag gemarkeerd. Knop "Vandaag" en jaarkiezer.
- Projecten uit de laatste stand in `fin_werkvoorraad` (Yoobi) die in het gekozen jaar vallen, gesorteerd op startdatum. Blauwe balk; gearceerd zolang er geen uur op gepland is.
- Klik op een project: medewerkerrijen klappen uit, paneel rechts toont aanneemsom, budget, ingepland (dit jaar), geboekt en resterend (rood als negatief). Nog een klik klapt weer in.
- Uren per medewerker per dag invullen; opslaan bij verlaten van de cel (komma of punt). Leegmaken verwijdert de rij. Pijltjestoetsen bewegen door het rooster.
- Totaaltelling onderaan: restant per medewerker per dag (norm min gepland). Grijs = niets gepland, oranje = deels, groen = precies vol, rood = te veel.
- Rood hoekje op elke gevulde cel van een medewerker op een dag waarop zijn totaal boven de norm zit, met uitleg bij aanwijzen.
- Klantnotitie in de balk ("afspraak klant…"), klik om te bewerken, Enter of wegklikken slaat op, Escape breekt af.
- Lijst "Nog geen datum in Yoobi" voor projecten zonder startdatum.

### Nog niet (brok 3)
- Balk verschuiven, project verbergen, knop "Yoobi verversen" (vereist Edge Function v5), beheer van gesloten dagen en medewerkers, verlof per medewerker.

### Onder de kap
- Leest: `fin_werkvoorraad` (laatste peildatum), `plan_medewerkers` (actief, op volgorde), `plan_projecten`, `plan_uren` (alleen het gekozen jaar), `plan_gesloten_dagen` (gekozen jaar).
- Schrijft: `plan_uren` (upsert op yoobi_code+medewerker_id+datum, delete bij 0), `plan_projecten` (upsert klantnotitie).
- Mislukt opslaan: geheugen en cel worden teruggedraaid en de status meldt het.
- "Ingepland" en "gearceerd" kijken alleen naar uren in het geladen jaar.
- Projecten met lege Yoobi-code worden niet getoond (twee in de stand van 01-09-2026); Edge Function v5 geeft die een noodsleutel.
- Getest: JS parse (node), 23 functionele controles in jsdom met nagebootste Supabase. Niet getest: echte browser, echte Supabase, aanraakbediening.
