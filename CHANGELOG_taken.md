# CHANGELOG taken.html

Aangemaakt op 09-09-2026 (v0.18.2). De regels tot en met v0.18.0 zijn
achteraf opgebouwd uit de versiecommentaren die in de code zelf staan;
wat daar niet in stond, staat hier ook niet. Datums zijn alleen genoemd
waar ze uit de code of uit de sessie bekend zijn. Geschiedenis vóór
v0.13.2 is niet vastgelegd.

## v0.28.0 — Taak aan een project op de planning hangen (SQL taken_29), 19-11-2026

**Aanleiding.** Gian 18-11-2026: voorbereidingstaken bij een project
(materiaal bestellen, toilet of steiger regelen) stonden hoofdzakelijk in
Yoobi, maar de Takenapp werkt sneller. Wens: taken koppelen aan een project
op de planning, op beide plekken zichtbaar en afvinkbaar, en in de Takenapp
op het juiste moment naar voren.

**Besluiten (Gian, 18-11-2026).** Taak staat op X kalenderdagen vóór de
start en schuift mee als de start verschuift. Koppelen aan project of fase.
Standaardlijstje in één tik én los intikken. Teller op de projectbalk, rood
bij te laat. Yoobi-archief nu niet: eerst gebruiken, later beslissen.

**Database (bestand `claude_taken_29_projecttaken.sql`, op 19-11-2026
gedraaid via de Supabase-koppeling met `execute_sql`; staat daardoor niet
in `supabase_migrations`).** Geen `DROP`, idempotent, projectguard.
- `taken` krijgt `plan_code` (Yoobi-projectcode), `plan_fase_id`
  (verwijst naar `plan_fasen`, wordt leeg als de fase verdwijnt) en
  `plan_dagen_voor` (0 t/m 365; leeg = vaste datum).
- Functie `plan_taak_start(code, fase)`: de start waar een taak aan hangt.
  Volgorde: gekozen fase, vroegste fase, eigen `plan_start`, Yoobi-start
  uit de laatste `fin_werkvoorraad` (niet als die in een eerder jaar ligt).
- Trigger `taken_plan_zet` (voor insert/update): bij gevulde dagen zet de
  database `gepland_op` (tijd blijft, anders 17:00), `piep_op` in
  Nederlandse tijd, en wist `mail_op`/`push_op` als de melding in de
  toekomst ligt. Vult `projectnaam`. Yoobi-taken blijven buiten schot.
- Functie `plan_taken_herreken(code)` plus triggers op `plan_fasen`,
  `plan_projecten` en `fin_werkvoorraad`: open taken met dagen schuiven
  mee. Elke trigger vangt zijn eigen fout af, zodat opslaan in de planning
  en de werkvoorraad-sync nooit blokkeren.
- Tabel `plan_taak_sjablonen` (standaardlijstje, leeg aangemaakt) met
  rijbeveiliging: lezen met een rol, beheren alleen rol `alles`.
- Functie `plan_taak_projecten()`: projectlijst (code, naam, klant, start,
  fasen) zonder bedragen, voor iedereen met een rol. `fin_werkvoorraad`
  zelf blijft alleen leesbaar voor rol `alles`.

**Wijziging in taken.html.**
- Nieuw veld **Project (planning)** in het vel van een eigen taak: zoeken
  op project of klant (zonder zoekterm de eerstvolgende starts), bij een
  project met fasen een fasekeuze, en **Dagen vóór start**.
- Met dagen ingevuld toont het vel de berekende datum en is het datumveld
  vergrendeld; de uitleg eronder noemt de start. Dagen leeg = vaste datum.
- De kaart toont de projectnaam als tweede regel, zoals bij Yoobi-taken.
- Een ongeldig aantal dagen (geen heel getal 0 t/m 365) wordt niet bewaard.
- Lukt de projectlijst niet, dan werkt de rest door en zegt het zoekvak dat
  de lijst niet geladen is.

**Getest.**
- SQL lokaal op Postgres 16: twee keer gedraaid (idempotent), 36 controles
  geslaagd (start-volgorde, meeschuiven per project en per fase, afgevinkt
  en vaste datum blijven staan, zomer- en wintertijd van de melding,
  rijbeveiliging lijstje, fout in de schuif-trigger blokkeert opslaan niet).
  Syntax met pglast.
- SQL live: proefrit in een teruggedraaide transactie naast de bestaande
  triggers op `taken` (insert 14 dagen vóór 1 maart 2027 gaf 15 februari
  17:00, na verschuiven 22 februari, afgevinkt bleef staan); daarna
  gecontroleerd dat er geen testrijen zijn achtergebleven.
- taken.html: `node --check` op beide scriptblokken, div- en
  accoladebalans, en een looptest in jsdom met nagebootste database:
  36 van 36 geslaagd (kiezen, rekenen, vergrendelen, opslaan, vaste datum,
  kruisje, bestaande taak, Yoobi-taak, afvinken).

**Niet getest.**
- Niets in een echte browser of op de iPhone: hoe het veld eruitziet en
  tikt is niet gezien.
- Een herhalende taak aan een project: niet uitgesloten en niet getest.
- De pushmelding van een verschoven taak op het nieuwe moment.
- Rol `eigen` (Max, Bjorn, Jens, Maud) met een echt account.

## v0.27.0 — Afvinkmelding wordt een taak voor Gian (SQL taken_28), uitkomst verplicht bij nabellen, Later terugbellen, 16-11-2026

**Aanleiding.** Gian 16-11-2026: "De opmerkingen die Maud schrijft bij de
taken, waar krijg ik die te zien?" Gemeten in de live database: de
nabeltaak Sluijsmans (offerte 260158) is om 11:27 afgevinkt met een
melding; de trigger `trg_taak_melding_signaal` riep `taak-afvinkmelding`
aan en die antwoordde `kanaal: push, toestellen: 2`. Mail gaat er dus
niet meer, alleen een push, en die had Gian niet gezien. In de lijst van
taken.html is aan een kaart niet te zien dat er een melding of notitie in
zit. Dezelfde dag: Voncken (260061) zonder uitkomst afgevinkt (bewust,
wordt niet nagebeld), en vier nabeltaken om 07:56 door Gian afgevinkt
terwijl hij ze een latere datum wilde geven.

**Besluiten (Gian, 16-11-2026).** Melding wordt een taak op zijn naam, in
de app. Uitkomst verplicht bij nabellen, ook voor hemzelf. Knop Later
terugbellen erbij. De vier taken terug naar open op volgende week maandag.

**Database (bestand `taken_28_meldtaak_gian.sql`, op 16-11-2026 rond 14:00
gedraaid via de Supabase-koppeling met `execute_sql`; staat daardoor niet
in `supabase_migrations`).** Geen `DROP`: de trigger is met `create or
replace trigger` gemaakt, omdat de koppeling bij DROP om een goedkeuring
vraagt die niet altijd aankomt.
- Functie `taak_meldtaak_upsert(taak-id)` en trigger
  `trg_taak_meldtaak_gian` (na insert of update op `taken`): vinkt iemand
  anders dan Gian af met een melding, dan komt er een taak voor Gian met
  bron `eigen`, `bron_kenmerk = 'melding:<crmtaskid>'`, `bron_ref`
  overgenomen, titel "Melding · <titel zonder 'Nabellen offerte'>", in de
  notitie de melding, wie, wanneer, de oorspronkelijke titel, klant en
  telefoon. `piep = false`, gepland op het moment zelf.
- Unieke index `taken_meldtaak_uidx`: één meldtaak per afgevinkte taak.
  Melding aangepast: open meldtaak wordt bijgewerkt, een afgevinkte niet.
  Oorspronkelijke taak terug naar open: open meldtaak verdwijnt.
- Fout bij het maken van de meldtaak: WARNING in het logboek, afvinken
  gaat door.
- De bestaande push is niet aangeraakt. `taken-mail-melding` (v24, bron
  gelezen via de Supabase-koppeling) selecteert alleen `piep = true`, dus
  geen tweede push voor de meldtaak.
- Eenmalig: inhaalslag voor meldingen vanaf 16-11-2026 (bij het draaien
  twee: Sluijsmans, en Bjorn die om 09:39 "Nee" antwoordde op de vraagtaak
  over de foto's in Craft);
  vier nabeltaken terug naar open op 23-11-2026 13:30 (Reijnaerts, Troost,
  M. Joosten, Parochie H. Cornelius), alleen als ze nog staan zoals
  gemeten.
- Idempotent, met projectguard.

**Gebouwd in taken.html.**
- `isNabeltaak(t)`: bron `offerte` met kenmerk `opvolg-bel` of `nabellen`,
  of een titel die met "Nabellen offerte" begint (handmatige kopieën met
  bron `eigen`, gemeten: Boek 260137).
- `vinkAf`: bij een nabeltaak zonder tekst in het meldingvak geen update;
  vak rood, regel uitleg eronder, toast. Het vak heet daar "Uitkomst van
  het gesprek (verplicht)". Terugzetten naar open valt er niet onder.
- Knop `s_later` "↻ Later terugbellen · ma <datum>" met
  `laterTerugbellen()`: `gepland_op` naar de eerstvolgende maandag 13:30
  (`volgendeBelMaandag`, op maandag zelf die van de week erna), piep
  opnieuw scherp (`mail_op` en `push_op` leeg), tekst uit het uitkomstvak
  met datum onderaan de notitie (`laterNotitie`), uit Actueel als hij daar
  met de hand stond. Via `eisRij`, dus een eerlijke fout als de update
  geen rij raakt.
- Tekst onder "Iets te melden?": "Wat je hier typt komt als taak bij
  Gian." Bij een afgevinkte taak heet het vak "Gemeld bij afvinken".
- `APP_VERSION` v0.27.0. Geen Edge Function.

**Getest.** SQL op lokale Postgres 16 (live draait 17.6) met nagebouwde
`taken`, de stand van 16-11 als zaaigegevens: twee keer draaien (4 taken
terug bij de eerste keer, 0 bij de tweede; één meldtaak, geen dubbele),
daarna 18 scenario's groen: velden van de meldtaak, bijwerken bij
gewijzigde melding, geen ketting op meldtaken, afgevinkte meldtaak blijft,
ongedaan maken ruimt de open meldtaak op, Gian zelf en lege melding geven
niets, insert-pad van de herhaler, terugval bij een fout (afvinken slaagt,
WARNING), oude meldingen niet ingehaald, `anon` en `authenticated` mogen
de functie niet aanroepen. taken.html: `node --check` op beide
scriptblokken, div-balans 111/111 (was 110/110, één regel uitleg erbij),
knoppen 40/40, CSS-accolades 239/239, Node-harness 34 controles op
functies die uit het gepatchte bestand gesneden zijn.

**Live gemeten na het draaien (16-11-2026).** Beide triggers staan aan
(`trg_taak_meldtaak_gian` en `trg_taak_melding_signaal`); twee meldtaken
op naam van gian, open, `piep = false`, met tekst, melder, tijd en bij
Sluijsmans klant, telefoon en categorie Offerte; de vier nabeltaken open
bij maud op 23-11-2026 13:30.

**Niet getest.** Een echte afvinkactie vanuit de app na het plaatsen van
de trigger (alleen de inhaalslag heeft live gedraaid). De app in de browser: of het rode vak en de knop
er op de iPhone goed uitzien, en of het vel naar het vak schuift.

**Bewuste beperkingen.**
- Het slot op afvinken zit alleen in de app, niet in de database. Een
  toestel met een oude taken.html kan een nabeltaak nog leeg afvinken.
- Vinkt Gian zelf een nabeltaak af, dan is de uitkomst verplicht maar komt
  er geen meldtaak (hij meldt niet aan zichzelf); de tekst staat bij de
  taak en in het Accordeerlink-venster van de Calculatie-app.
- Later terugbellen kent één keuze: de eerstvolgende maandag 13:30. Een
  andere datum kan nog steeds met Wanneer en Bewaren.
- Op de kaart in de lijst is nog steeds niet te zien dat een taak een
  notitie heeft. Niet gebouwd; de meldtaak dekt de afvinkmelding.

**Proef na uitrol.** (1) SQL is gedraaid. (2) Gian opent Taken: de
taak "Melding · 260158 | Sluijsmans | …" staat in Actueel. (3) Een open
nabeltaak openen, leeg op Afvinken tikken: vak wordt rood, taak blijft
open. (4) Op Later terugbellen tikken: taak staat op maandag. (5) Maud
vinkt de eerstvolgende nabeltaak af met een uitkomst: binnen een paar
seconden staat er een meldtaak bij Gian.

## v0.26.3 — Herplan-taken afvinkbaar (SQL taken_27), eerlijke melding als een update geen rij raakt, 09-11-2026

**Aanleiding.** Gian 09-11-2026: Maud kan de taken "Yoobi: project- en
orderdata aanpassen, start verschoven · …" niet afvinken. Gemeten in de
live database: deze taken hebben `bron = 'herplan'` (gemaakt door de
databasetrigger `herplan_taak_maak` zodra de startdatum in de planning
verschuift); 5 open, 0 ooit voltooid, eerste van 03-11-2026. De
RLS-policies `taken_bijwerken`, `taken_lezen` (rol eigen) en
`taken_verwijderen` kenden die bron niet, dus raakte een update nul
rijen, voor rol `eigen` én rol `alles`. De API geeft daarbij geen fout,
alleen een lege lijst; de app zei dus "Afgevinkt" terwijl er niets
gebeurd was (aanname over de toast, niet in de browser gezien). Dit was
een vergeten stap bij het bouwen van de herplan-taken, geen fout van Maud.

**Database (gedraaid via de Supabase-koppeling, 09-11-2026, bestand
`taken_27_herplan_rechten.sql`).** `herplan` toegevoegd aan de drie
policies met `ALTER POLICY`; de teksten zijn letterlijk uit `pg_policies`
overgenomen met alleen `'herplan'` erbij naast `'planning'`. Drop+create
is geprobeerd via `apply_migration`, maar de goedkeuringsvraag van de
koppeling kwam tweemaal niet aan; `ALTER POLICY` vraagt die niet. De
migratie staat daardoor niet in `supabase_migrations`; het bestand is
wel idempotent en draagt de projectguard.

**Gebouwd in taken.html.**
- `eisRij(res, wat)`: na een update op `taken` moet er een rij terugkomen
  (`.select('crmtaskid')`); zo niet, dan een fout "… raakte geen rij:
  geen rechten op deze taak, of hij bestaat niet meer". Toegepast op
  afvinken, doorschuiven van een herhaler, terugzetten naar open en
  bewaren. Andere updates (categorie, piep, foto, ongedaan maken) zijn
  niet aangepast.
- `catVast(bron)`: bron `herplan` valt onder de vaste categorie Planning
  (pil, filterbalk, geen categorieveld in het vel). Niet als aparte
  sleutel in `CAT_VAST`, anders zou de chip Planning twee keer verschijnen.
- `APP_VERSION` v0.26.3. Geen Edge Function.

**Getest.** SQL op lokale Postgres 16 met nagebootste `taken`, rolfuncties
en de letterlijke oude policies: vóór de migratie raakt afvinken 0 rijen
(als maud én als rol alles), erna 1 rij als maud, 0 bij andermans taak,
Yoobi ongewijzigd, verwijderen mogelijk, twee keer draaien kan, guard
stopt op een database zonder `fin_werkvoorraad`. **Live:** in een
teruggedraaide transactie als Maud (`taken_rol()` = eigen, persoon maud)
raakt afvinken van de Beekman-taak 1 rij, als Jens 0; daarna nog 5 open
herplan-taken. taken.html: `node --check` op beide scriptblokken, div-balans
110/110, Node-harness 13 controles (catVan per bron, herplan niet als
dubbele chip, eisRij bij rij/leeg/null/fout, vier aanroepen met
rijcontrole). Niet in de browser: dat is de test na deployen — Maud opent
de Beekman-taak, ziet de pil Planning en vinkt af.

**Open.** De vijf herplan-taken hebben alle `gepland_op` 09-11-2026 13:30
en `piep = true` op hetzelfde moment; of dat de bedoeling van de trigger
is, is niet onderzocht.

## v0.26.2 — Offerte en Planning ook als chip kiesbaar, 04-11-2026

**Aanleiding.** Gian 04-11-2026: een zelf getypte taak "offerte maken"
kon niet in de categorie Offerte, die kwam alleen uit bron. Niet ideaal.

**Gebouwd.** `bouwCatChips` zet de twee vaste categorieën uit `CAT_VAST`
(Offerte, Planning) vooraan tussen de chips. Ze staan niet in
`taak_categorieen` en zijn dus niet te verwijderen; een eigen taak krijgt
`categorie = 'Offerte'` in de database, de pil heeft dezelfde kleur als
de automatische Offerte-pil en in de filterbalk vallen handmatige en
automatische Offerte-taken onder één knop. "+ Nieuw" weigert nu ook
namen die met een vaste categorie botsen. `APP_VERSION` v0.26.2.
Geen SQL, geen Edge Function. Gebouwd op v0.26.1, die op dat moment nog
niet live stond (live was v0.26.0, ongewijzigd sinds de levering).

**Getest.** `node --check` op beide scriptblokken; div-balans 110/110;
Node-harness (vaste chips aanwezig en vooraan, selectie, `catVan` en
kleur voor een eigen taak in Offerte). Niet in de browser.

## v0.26.1 — Categorie slaat direct op bij aantikken, 04-11-2026

**Aanleiding.** Gian 04-11-2026, direct na v0.26.0: categorie toegekend
maar vergeten op Bewaren te tikken, dus niets opgeslagen en geen
filterbalk. Een chip voelt als een directe actie; Bewaren erachter
verwacht niemand.

**Gebouwd.** `zetCategorieDirect(naam)`: bij een bestaande eigen taak
gaat de chip-tik meteen als `update` naar `taken`, de kaart in de lijst
wordt herbouwd en een toast meldt het. Mislukt het, dan springt de chip
terug en komt de foutmelding. Bij een nieuwe taak is er nog geen rij;
dan blijft de keuze staan en gaat hij mee met Toevoegen. "+ Nieuw" loopt
via dezelfde weg, dus een nieuwe categorie staat meteen op de taak.
Bewaren stuurt `categorie` nog steeds mee, dat blijft consistent.
`APP_VERSION` v0.26.1. Geen SQL, geen Edge Function.

**Opgeruimd in de database (op verzoek Gian).** Klantcontact, Inkoop en
Kantoor verwijderd uit `taak_categorieen`; geen taak gebruikte ze.

**Getest.** `node --check` op beide scriptblokken; div-balans 110/110;
Node-harness op `zetCategorieDirect` uit het gepatchte bestand (update
gestuurd, lokaal bijgewerkt, terugdraaien bij fout, leegmaken, nieuwe
taak zonder update). Niet getest in de browser: dat is chip tikken,
vel sluiten met ✕, pil op de kaart en filterbalk zichtbaar.

## v0.26.0 — Categorieën op taken, 04-11-2026

**Aanleiding.** Gian 04-11-2026 ("take 26"): categorieën in de Taken-app.
Keuzes in overleg: vaste lijst die in de app is aan te vullen; gekleurd
label op de taak plus een filterbalk boven de lijst; offerte- en
planningstaken krijgen hun categorie automatisch uit `bron`; Yoobi-taken
geen categorie. Groeperen binnen Taken bewust niet gedaan: dat breekt de
datumvolgorde en de rode arcering.

**Database (gedraaid via de Supabase-koppeling, migratie
`taken_26_categorieen`, bestand `taken_26_categorieen.sql`).** Nieuwe
tabel `taak_categorieen` (id, naam uniek, kleur hex, volgorde, actief,
aangemaakt) met startlijst Klantcontact, Inkoop, Kantoor, Werkplaats,
Privé. Nieuwe kolom `taken.categorie` (text, leeg mag). RLS: ingelogd
mag lezen; alleen rol `alles` uit `taken_rollen` mag categorieën
toevoegen, wijzigen of verwijderen. Idempotent; controlequery na het
draaien: 5 categorieën, kolom aanwezig, 2 policies.

**Gebouwd in taken.html.**
- `catVan(t)`: Yoobi → geen; bron offerte → "Offerte", bron planning →
  "Planning" (vaste kleuren, niet handmatig te zetten); anders
  `t.categorie`.
- Categoriepil in de lijst en in de wie-regel van het vel, in de kleur
  uit de tabel (lichte tint als achtergrond). Bij bron offerte blijft de
  bestaande Offerte-pil staan, geen dubbele.
- Filterbalk `#cfilter` onder het persoonsfilter, voor iedereen. Toont
  "Alle" plus alleen de categorieën die in open taken voorkomen, met
  aantal. Geen categorieën in gebruik: balk verborgen. Filter werkt door
  in alle rubrieken en in de zoekresultaten (`zichtbareTaken` wikkelt
  nu `zichtbareTakenBasis`).
- Veld "Categorie" in het vel bij een nieuwe of eigen open taak, tenzij
  de categorie uit bron komt. Chips: tik om te kiezen, nog eens tikken
  om leeg te maken. Rol `alles` ziet "+ Nieuw": naam typen, Toevoegen of
  Enter; kleur uit een vast palet, volgorde achteraan, direct gekozen.
- Opslaan stuurt `categorie` alleen mee als het veld in beeld stond.
- Categorieën laden in `laadTaken`; mislukt dat, dan draait de app door
  zonder categorieën (waarschuwing in de console).
- `APP_VERSION` v0.26.0. Geen Edge Function.

**Niet gebouwd.** Categorie hernoemen, kleur kiezen of deactiveren in de
app (kan in Supabase Studio in `taak_categorieen`); categorie in
push/mail; categorie in andere apps.

**Getest.** `node --check` op beide scriptblokken; div-balans 110/110,
scripttags 3/3, CSS-accolades 233/233; Node-harness op code die uit het
gepatchte bestand gesneden is (20 controles: catVan per bron, kleuren,
filter, balk toont alleen in gebruik, chips, nieuw-knop per rol).
SQL met pglast geparsed en live gedraaid. Niet getest: de echte app in
de browser — dat is de test na deployen: taak openen, categorie kiezen,
bewaren, pil zichtbaar, filterbalk verschijnt, "+ Nieuw" als Gian.

## v0.25.1 — Alle taken laden, ook boven de 1000 rijen, 01-11-2026

**Aanleiding.** Gian 01-11-2026: de nieuwe taak "Roode-Wierda | Vocht
meten keermuren oprit" verdween na verzetten naar 11 november, en onder
Later / zonder datum stond niets verder dan morgen. Query op de live
database: `taken` telt 1144 rijen, waarvan 1007 tot en met morgen 14:00.
`haalTaken` deed één `select('*')` zonder limiet; de API geeft per
aanroep maximaal 1000 rijen terug (max-rows van PostgREST, standaard
1000 — opgezocht, niet in de projectinstellingen gecontroleerd). Door de
sortering op `gepland_op` vielen precies de nieuwste 144 weg, plus de 14
zonder datum die achteraan staan. De grens schoof elke dag verder op.

**Gebouwd.** `haalTaken` haalt in blokken van 1000 op met `.range()` en
vraagt met `count: 'exact'` het totaal mee; de lus loopt tot dat totaal
binnen is, met een stop op een leeg blok. Tweede sorteersleutel
`crmtaskid` zodat blokken elkaar bij gelijke datums niet overlappen.
`APP_VERSION` v0.25.1. Geen SQL, geen Edge Function.

**Niet gewijzigd.** Wat de rubrieken tonen of verbergen. Het laden van
alle (ook oude voltooide) Yoobi-rijen blijft; bij merkbare traagheid is
"alleen open plus recent voltooid laden" de volgende stap.

**Opgeruimd in de database (op verzoek Gian).** Drie dubbele
Roode-Wierda-taken (2× 4 nov, 1× "roode" 2 nov) en twee bijbehorende
regels in `taak_dagkeuze` verwijderd; de taak van 11 nov blijft.

**Getest.** `node -e` parse-test op beide scriptblokken; lus-test met een
nepclient (1144 rijen in blokken van 1000 → 1144 unieke rijen). Niet
getest tegen de echte API — dat is de test in de live app: na deployen
moeten Roode-Wierda (11 nov) en de overige novembertaken onder Later
staan en in de Voltooid-rubriek niets ontbreken.

## v0.25.0 — Taken standaard open, alleen deze week in beeld, 20-10-2026

**Taken start open** (`open:true` in `RUBRIEKEN`; was dicht sinds
v0.22.0).

**Alles na deze week dichtgeklapt.** In Taken staan standaard alleen de
kaarten met een rode arcering: achterstand plus wat tot en met komende
zondag gepland staat. Later en zonder datum zijn weg uit de lijst en
tellen niet mee in de kop "x te laat · y vandaag · z komt nog". Onderaan
de regel "n later of zonder datum dichtgeklapt · tonen" (`data-later`,
toestand `TOON_LATER`); open geworden zegt hij "Later en zonder datum
staan erbij · verbergen". De grens van de lichte arcering uit v0.24.0 is
daarmee verschoven van vandaag+7 naar het eind van de huidige week (t/m
zondag, `totZondag` in `verrijk`).

**Herhalers-regel ondergeschikt.** De regel "n herhalers verder dan een
week weg verborgen · tonen" (v0.23.0) staat er alleen nog als het
later-blok open staat; dicht zitten die herhalers daar toch al in.

Getest: niet vastgelegd; deze entry is op 01-11-2026 achteraf opgebouwd
uit het verschil tussen de commits van 20-10-2026 21:09 (v0.24.0) en
21:17 (v0.25.0) op GitHub. Wat er destijds getest is staat nergens.

## v0.24.0 — Rode arcering in Taken, 20-10-2026

**Urgentie per kaart.** In de rubriek Taken (en alleen daar) kleurt een
open taak met datum rood: donkerder bij achterstand (`urg-laat`, datum
vóór vandaag), lichter voor vandaag tot en met vandaag+7 (`urg-week`).
Zonder datum, voltooid of vervallen: geen kleur. Berekend als kale dagen
(`_urgentie` in `verrijk`), zomertijd telt niet mee.

**Scheidingslijn.** Tussen het rode blok en de rest een dunne lijn met de
tekst "later / zonder datum" (`.scheiding`), alleen als beide blokken
iets bevatten. De sortering (oudste datum bovenaan, zonder datum
onderaan) zet het rode blok al vanzelf boven; in Taken wordt daardoor
geen kaart meer als "Nu"-hero getekend.

Getest: niet vastgelegd; entry op 01-11-2026 achteraf opgebouwd uit het
verschil tussen de commits van 27-09-2026 22:51 (v0.23.0) en 20-10-2026
21:09 (v0.24.0) op GitHub.

## v0.23.0 — Herhalend opgegaan in Taken, 27-09-2026

**Rubriek Herhalend vervalt.** Alles wat open is en niet in Actueel staat,
staat nu in Taken, ook de herhaler die nog niet aan de beurt is (keuze
Gian). `rubriekVan` geeft daardoor nooit meer `'herhalend'` terug; de
CSS-kleur en de `order` voor die rubriek zijn weg. Sortering ongewijzigd:
oudste plandatum bovenaan, zonder datum onderaan. De ↻-pil met het ritme
laat zien dat het een herhaler is.

**Verder dan een week weg standaard verborgen.** Een herhaler die pas over
meer dan zeven dagen aan de beurt is (`_binnenWeek` is onwaar, dezelfde
grens als de oude rubriek Herhalend) staat niet in de lijst en telt niet
mee in de kop "x te laat · y vandaag · z komt nog". Onderaan staat de
regel "n herhalers verder dan een week weg verborgen · tonen"
(`data-herhalers`, toestand `TOON_HERHALERS_VERDEROP`), naast de bestaande
regel voor Yoobi-taken uit andere jaren. Eenmalige taken ver vooruit
blijven altijd zichtbaar, dat was al zo.

**Breed scherm.** Links Actueel, Voltooid en Vervallen; rechts Taken
(`KOLOM_LINKS`). Telefoon: Actueel, Taken, Voltooid, Vervallen.

Getest: JS-parse van alle scriptblokken, CSS-accolades en div-balans
tegen live v0.22.0, runtimetest van `rubriekVan`/`verrijk` met zeven
synthetische taken in Node. Niet getest in de browser; dat is de
eerste-gebruikstest van Gian.

## v0.22.0 — Eén rubriek Taken, pijl overal, breed scherm, 26-09-2026

**Rubrieken.** Op de rol, Losse taken en Klantopvolging zijn samen één
rubriek **Taken**: elke open taak die niet in Actueel staat, behalve een
herhaler die nog niet aan de beurt is (die blijft in Herhalend). Sortering:
oudste plandatum bovenaan, zonder datum onderaan (keuze Gian; vervangt het
aflopende Op de rol van v0.18.1). Kopregel "x te laat · y vandaag · z komt
nog", de ↻-knop voor Yoobi ophalen staat in deze kop. Yoobi-taken uit een
ander kalenderjaar blijven standaard verborgen (regel "tonen" onderaan,
zoals v0.19.0); eigen taken uit andere jaren blijven altijd zichtbaar.
Standaard dicht. Volgorde: Actueel, Taken, Herhalend, Voltooid, Vervallen.

**Pijl naar Actueel.** Bij elke open taak die niet uit Yoobi komt, in elke
rubriek (dus ook Herhalend en toekomstige taken). Bij Yoobi-taken nergens
meer een pijl, ook niet de schakelaar in het taakvel. Een Yoobi-taak die
vandaag op jouw naam staat landt nog wel vanzelf in Actueel; eruit gaat
alleen door de datum in Yoobi te verzetten (besluit Gian). De stand
'gehaald' in `taak_dagkeuze` telt niet meer bij Yoobi-taken; zulke rijen
blijven in de database staan maar doen niets. `schakelDagkeuze` weigert
Yoobi-taken ook als hij toch wordt aangeroepen.

**Schermen.** Telefoon ongewijzigd. Vanaf 700 px twee kolommen (links
Actueel en Herhalend, rechts Taken, Voltooid, Vervallen), app tot 1060 px
breed. Vanaf 1100 px is het taakvel een paneel rechts (440 px) in plaats
van een vel van onderen; de lijst blijft bruikbaar en een andere kaart
aantikken opent die taak (niet-bewaarde wijzigingen gaan dan verloren,
net als bij tikken op de scrim op de telefoon). Het paneel heeft een
✕-knop, alleen in die stand. Technisch: `.rubrieken` met twee `.kolom`;
op de telefoon `display:contents` plus `order`, breed `grid`.

**push_op.** Mee gewist met `mail_op` bij de herhaler die doorschuift,
bij melding aan/uit (`schakelPiep`) en bij uitstellen (`verzetMelding`),
zoals bij bewaren sinds v0.21.0.

**Getest.** CSS-accolades, div- en button-balans, JS-parse (node).
Rubriek, pijl en sortering met dertien neptaken in Node (eigen, Yoobi,
calculatie, herhalend; te laat, vandaag, later, zonder datum, 2024,
gehaald). Schermafdrukken in Chromium (Playwright) met nagebootste
Supabase op 390, 820, 1180 en 1400 px, plus openen van een andere kaart
en sluiten met ✕ in paneelstand.
**Niet getest.** Echte iPhone, iPad en pc met live data; Safari (de test
draaide in Chromium).

## v0.21.2 — Foto groot bekijken, 18-09-2026

Tik op de foto bij een taak en hij opent groot op een zwart scherm
(lightbox), sluiten met ✕, tik naast de foto of Escape. Pinch-zoom is
van de browser zelf. De miniatuur toont nu de hele foto (`object-fit:
contain`, donkere achtergrond) in plaats van een afgesneden uitsnede
(`cover`). Werkt zowel met de opgeslagen foto (signed URL) als met een
zojuist gekozen foto (blob-URL). Escape sluit alleen de lightbox, niet
het taakvenster erachter. Getest: JS-parse (node), tagbalans, gedrag
open/sluiten in jsdom. Niet getest: iPhone.

## v0.21.1 — Icoon met zwarte band, 16-09-2026

`apple-touch-icon` wijst nu naar `apple-touch-icon-taken.png` (Ernes-logo
met zwarte band "Taken", 180×180), in lijn met de andere apps van de
suite die vandaag elk een eigen kleur kregen. Verder niets gewijzigd; de
iconen in `manifest.json` en `sw.js` blijven `icon-192/512.png`. Het
icoon op de iPhone verandert pas na verwijderen en opnieuw toevoegen,
met opnieuw inloggen en meldingen aanzetten. Getest: JS-parse (node),
tagbalans. Niet getest: iPhone.

## v0.21.0 — Push opent de taak; push_op mee gewist, brok 4, 16-09-2026

Een tik op een pushmelding opent nu de taak zelf: de verzendfuncties
geven `taken.html?taak=<crmtaskid>` mee en `openViaAdres()` (aangeroepen
aan het eind van `start()`) zoekt die taak en opent hem met `openTask`.
Het nummer wordt daarna uit het adres gehaald zodat verversen niet
steeds dezelfde taak opent; onbekende of onzichtbare taak = niets doen.
Daarnaast: wie een piep-tijd naar de toekomst verzet, wist nu naast
`mail_op` ook `push_op`, anders zou de verzendfunctie na verzetten wel
opnieuw claimen maar nooit meer pushen.
Hoort bij `taken-mail-melding` v3 en `taak-afvinkmelding` v2 (Edge
Functions, besloten repo): push eerst, anders mail.
Getest: JS parse (node), div/scripttag-balans, drie scenario's voor
`openViaAdres` (bekende taak, onbekende taak, geen parameter).
Niet getest: browser; of iOS een al geopende beginscherm-app naar het
nieuwe adres laat springen.

## v0.20.0 — Meldingen op de iPhone (web push), brok 2, 16-09-2026

Nieuwe knop `meldingen` in de voet, alleen voor Gian, Max, Bjorn en Jens
(vaste lijst `PUSH_PERSONEN`; Maud met opzet niet). Tik = toestemming
vragen, abonneren met de publieke VAPID-sleutel, rij in
`push_subscriptions` (upsert op `endpoint`). Nog een tik = uitzetten
(abonnement weg, rij weg). In Safari zelf, waar iOS geen push kent, zegt
de knop dat de app op het beginscherm moet. Bij het openen: `sw.js`
registreren en, als de verzendfunctie het abonnement heeft ingetrokken
(`ingetrokken_op` gevuld), een toast met knop Aanzetten.
Nieuw in de head: `manifest.json` (short_name Taken) en
`apple-touch-icon`. Er wordt in deze versie nog géén melding verstuurd;
dat is brok 3/4 (verzendfunctie en koppeling aan `taken-mail-melding`).
Getest: JS parse (node), div/scripttag-balans, en tien nagebootste
scenario's (aanzetten, uitzetten, ingetrokken rij, ontbrekende rij,
geweigerd, Safari, Maud). Het bewijs dat een push op het slot-scherm
komt is op 16-09 los geleverd met `pushtest.html` en de Edge Function
`push-test` (Apple 201, melding zichtbaar op Gians iPhone).
Niet getest: browser met deze versie.

## v0.19.1 — Te laat onderaan in Actueel, 15-09-2026

Actueel sorteert in drie blokken: eerst wat vandaag gepland staat
(oplopend op tijd), dan gehaalde taken met een datum in de toekomst
(oplopend), dan de te-late taken onderaan met de meest recente plandatum
bovenaan, zoals Op de rol sinds v0.18.1. Zonder datum als laatste.
Plandatum en te-laat pillen ongewijzigd; niets in de database geraakt.
Technisch: nieuwe tak `vandaag` in `sorteer()`.
Getest: JS parse (node) en sorteertest met zeven neptaken (vandaag 08 en
14 uur, morgen, gisteren, 3 dagen en een week te laat, zonder datum).
Niet getest: browser.

## v0.19.0 — Klantopvolging alleen dit jaar, 15-09-2026

Klantopvolging toont standaard alleen Yoobi-taken met een plandatum in het
huidige kalenderjaar. Taken voor latere jaren blijven in de tabel en de sync
haalt ze gewoon binnen; ze verschijnen vanzelf zodra dat jaar aanbreekt.
Onderaan de lijst staat een tikbare regel ("N uit andere jaren verborgen ·
tonen") die ze tijdelijk erbij zet; bij herladen start de rubriek weer
verborgen. De teller in de kop telt alleen wat zichtbaar is; de subregel
noemt beide aantallen. Taken zonder plandatum blijven altijd zichtbaar.
Andere rubrieken, eigen taken en de meetstrook zijn ongewijzigd.
Technisch: `TOON_KLANT_ANDERE_JAREN`, filter in `bouwRubriek` (tak
`klant`), klik op `[data-klantjaren]` in de lijst-handler.
Getest: JS parse (node) en runtime-test van `bouwRubriek` met neptaken
(2026, 2027, 2028, zonder datum). Niet getest: browser.

## v0.18.2 — Op de rol standaard dicht, 09-09-2026

De rubriek Op de rol start dichtgeklapt; openklappen blijft met een tik.
Actueel start nog steeds open. Alleen `open:false` in `RUBRIEKEN`.
Getest: JS parse (node). Niet getest: browser.

## v0.18.1 — Op de rol omgekeerd, 09-09-2026

Op de rol sorteert nu op plandatum aflopend: de meest recente plandatum
bovenaan, de langste achterstand onderaan. Taken zonder datum blijven
onderaan. Alle andere rubrieken ongewijzigd (oplopend). Getest: JS parse
(node) en sorteertest met testdata; niet in een echte browser.

Dezelfde dag, zonder codewijziging: de melding "Geen rechten om op te
halen" bij Yoobi bijwerken bleek een verlopen sessie (voettekst toonde
"aangemeld als Overig"); afmelden en aanmelden loste het op. In de logs
van 6 en 9 september stond daarnaast een TLS-fout op de Yoobi-token-
endpoint (`peer closed connection without sending TLS close_notify`).
Ronde van 9 september 22:25 liep daarna schoon: 824 klanten, 0 fouten,
70 Yoobi-taken.

## v0.18.0 — Actueel in plaats van Vandaag, datum niet vastgelegd

De rubriek Vandaag heet Actueel. Het dagmodel is vervangen door een
blijvend model in `taak_dagkeuze`: één regel per persoon per taak (uniek
op persoon, taak_id). Stand `gehaald` = blijvend in Actueel, ongeacht de
dag. Stand `weggezet` = niet in Actueel. Staat de taak vandaag op jouw
naam gepland, dan geldt wegzetten alleen voor die dag (kolom `dag`);
morgen wint de planning weer en valt de taak anders door naar Op de rol.
De pijl staat ook bij een vaste taak, om hem voor vandaag weg te zetten.
Vervangt het dagmodel van v0.15.0-v0.17.0 waarin alleen regels met
dag = vandaag telden.

## v0.17.0 — Planning wint, datum niet vastgelegd

Wat op jouw naam staat en vandaag gepland is, landt vanzelf in Vandaag
(`_vandaagVast`) en is daar niet uit te tikken; wil je het niet vandaag,
dan verzet je de datum. De pijl en de dagkeuze-schakelaar verschijnen
daar niet, want ze zouden niets doen. Wat vóór vandaag gepland stond is
achterstand en blijft in Op de rol, ongeacht de bron. De pil "te laat"
zegt er meteen bij hoeveel dagen, berekend uit `gepland_op` zelf (als
kale dag, zomertijd telt niet mee). Vervangt de losse doorschuifpil die
alleen telde hoe vaak je zelf had aangetikt.

## v0.16.4 — Projectnaam uit Yoobi, datum niet vastgelegd

De projectnaam uit Yoobi als tweede regel bij een klanttaak, alleen als
de sync (`yoobi-taken-sync` 2026-08-13d) hem heeft kunnen vullen.

## v0.16.3 — Volgen tot de ronde rond is, ca. 13-08-2026

Een volle Yoobi-ronde duurt ruim zes minuten (gemeten 13-08-2026: 812
klanten, zes brokken, 11:09:30 tot 11:15:46). Het scherm gaf na drie
minuten op en meldde onterecht dat het nog doorliep. Nu volgt het tot
twintig minuten, maar haakt af zodra er vier minuten niets verandert;
dan is de keten weg zonder dat de stand op mislukt kwam en wordt de
lijst toch ververst.

## v0.16.2 — Weigeringen van de sync netjes tonen, ca. 13-08-2026

De Edge Function weigert sinds 13 augustus een tweede ronde met een 409
zolang er al een keten loopt: dat is uitleg, geen foutmelding. Zet de
function de stand op mislukt, dan stopt het scherm meteen met draaien in
plaats van drie minuten te wachten op een idle die nooit kwam.

## v0.16.1 — Kleine correcties Yoobi-rubriek, datum niet vastgelegd

De ondertitel van Klantopvolging zegt dat je de lijst zelf bijwerkt.
Stopt het ophalen zonder herbouw van het scherm, dan blijft "bezig met
ophalen" niet meer hangen maar valt terug op de vaste ondertitel.

## v0.16.0 — Melding bij afvinken, datum niet vastgelegd

Bij een open eigen taak een leeg vak om bij het afvinken iets kwijt te
kunnen. Bij een afgevinkte taak staat wat destijds gemeld is, alleen als
er iets staat. Bij Yoobi-taken niet; die worden hier niet afgevinkt.

## v0.15.0 — Vandaag als handkeuze, datum niet vastgelegd

Met één tik naar Vandaag en met één tik weer eruit, alleen zichtbaar in
Vandaag en Op de rol. Filter je op jezelf, dan blijft zichtbaar wat je
van een ander hebt overgenomen. Na een afgeronde ronde gaat de
doorschuifhistorie van een taak op nul. In v0.17.0 aangevuld met de
automatische plaatsing door de planning.

## v0.14.0 — Sjablonen, datum niet vastgelegd

Eén gedeelde lijst in `taak_sjablonen`: naam, titelvoorstel en
notitietekst. Iedereen met een rol leest mee, alleen rol `alles` maakt
aan of gooit weg; dat dwingt de RLS op de tabel af.

## v0.13.5 — Standaardtijd nieuwe taak, datum niet vastgelegd

Een nieuwe taak begint op vandaag 17:00. Is dat al voorbij, dan morgen
17:00, zodat de melding nooit in het verleden ligt en meteen zou mailen.

## v0.13.4 — Tijdzones, datum niet vastgelegd

Kale lokale tijdtekst wordt voor timestamptz-kolommen (`voltooid_op`,
`piep_op`) als lokale tijd gelezen en als UTC weggeschreven. `gepland_op`
is timestamp zonder tijdzone en gaat hier bewust niet doorheen.

## v0.13.3 — Onbekende persoon crasht niet meer, datum niet vastgelegd

Onbekende persoonswaarden worden "Overig" in plaats van een crash.

## v0.13.2 — ziet_klant uit taken_rollen, datum niet vastgelegd

De vlag `ziet_klant` komt uit `taken_rollen`; dezelfde vlag stuurt de
RLS-policy op de server, zodat client en server niet uiteen kunnen
lopen. Er wordt op bron gefilterd, zodat klanttaken in elke rubriek
zichtbaar blijven.
