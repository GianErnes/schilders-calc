# SYSTEEM.md

**Technisch continuiteitsdossier Ernes Schilders**

Dit bestand beschrijft hoe de eigengebouwde bedrijfssoftware van Ernes
Schilders in elkaar zit. Het is geschreven voor drie soorten lezers: Gian
zelf als er iets stukgaat, Max of Maud als Gian onbereikbaar is, en een
buitenstaander die het ooit koud moet overnemen.

Opgesteld 26 juli 2026, laatst bijgewerkt 13 augustus 2026. Alle zes
hoofdstukken zijn ingevuld.

> **De enige regel die dit document in leven houdt**
>
> Dit bestand hoort in dezelfde repo als de code, en het wordt bijgewerkt
> in dezelfde handeling als de wijziging zelf. Wordt er een cronjob
> toegevoegd, een Edge Function verwijderd of een app verplaatst, dan
> verandert dit bestand mee. Gebeurt dat niet, dan is dit binnen drie
> maanden een museumstuk, en een fout continuiteitsdocument is
> gevaarlijker dan geen, want in nood handelt iemand ernaar.

Overal waar **[TE CONTROLEREN]** staat, is de informatie nog niet
geverifieerd en moet die worden ingevuld of nagekeken.

---

## 1. Landkaart

### 1.1 De apps

Alle apps zijn eenbestandstoepassingen: HTML met JavaScript erin, zonder
bouwstap, zonder framework. Ze worden gehost op GitHub Pages en praten
rechtstreeks met Supabase.

| App | Bestand | Repo | Adres | Versie |
|---|---|---|---|---|
| Schilders Calc | `index.html` | `GianErnes/schilders-calc` | https://gianernes.github.io/schilders-calc/ | v4.40.2 |
| Taken | `taken.html` | `GianErnes/schilders-calc` | https://gianernes.github.io/schilders-calc/taken.html | v0.17.0 |
| Financieel | `financieel.html` | `GianErnes/schilders-calc` | https://gianernes.github.io/schilders-calc/financieel.html | v1.1.1 |
| Oplevering | `oplevering.html` | `GianErnes/schilders-calc` | https://gianernes.github.io/schilders-calc/oplevering.html | v0.1.0 |
| Voorraad | `voorraad-app_2.html` | `GianErnes/voorraad-app` | https://gianernes.github.io/voorraad-app/voorraad-app_2.html | [TE CONTROLEREN] |

**Let op bij Voorraad.** In die repo staat geen `index.html`. Het korte
adres `gianernes.github.io/voorraad-app/` werkt daarom niet. Je moet de
volledige bestandsnaam kennen, inclusief de `_2`. Zolang dat zo is, is de
app alleen te vinden door wie het adres nog heeft. Op de opruimlijst staat
dit als punt 4.

**Oplevering** is er op 22 augustus 2026 bij gekomen. Een losse app voor
de opleverlijst op locatie: per project een lijst met punten, elk punt een
foto met open genummerde ringen, een omschrijving en een vinkje. Bewust
zonder koppeling met Taken en zonder koppeling met een calculatie. De
klantgegevens tik je met de hand in. Richting de klant gaat het lijstje
via Yoobi, dus er zit geen PDF-uitvoer in.

**Gevelscanner** is op 26 juli 2026 bewust buiten dit document gelaten.
Dat is een besluit en geen vergissing. Bestaat die app nog en raakt hij
bedrijfsgegevens, dan hoort hij hier alsnog in.

### 1.2 De databases

Twee Supabase-projecten, allebei in dezelfde organisatie **Gian Ernes**,
abonnement **Pro**, allebei op AWS in regio `eu-west-1`, allebei
computegrootte Nano.

| Project | Verwijzing | Gebruikt door |
|---|---|---|
| `schilders-calc` | `gjcjpigirqbpkjkymbio` | Calc, Taken, Financieel, Oplevering |
| `schilder-voorraad` | `rcwlbcfuvfprnnkypbba` | Voorraad |

Adres van een project is altijd `https://<verwijzing>.supabase.co`.

**schilders-calc** telt 39 tabellen, 7 opslagbakken, 14 triggers, 16 Edge
Functions en 9 cronjobs. De grootste tabellen zijn `calc_regel_stappen`
(1959 rijen), `meetstaat` (747) en `bewerkingen` (548). De 36 tabellen
van toen zijn geteld op 2 augustus 2026 met `information_schema.tables`
op schema `public`, type `BASE TABLE`; `opname_boekingen` is er op
8 augustus bijgekomen en de negende cronjob op 9 augustus, zie 3.1.
Op 22 augustus 2026 kwamen `opleveringen` en `oplever_punten` erbij voor de
opleverapp, met de bak `oplever-fotos` en twee `set_updated_at`-triggers,
aangelegd met `sql/oplever_tabellen.sql`. Die getallen zijn opgeteld bij de
meting van 2 augustus en niet opnieuw geteld.

> **Twee triggertellingen spreken elkaar tegen.** Hier staat 14, de
> herbouwtabel in 4.8 komt op 13. Dat verschil bestond al voor de
> opleverapp (12 tegen 11) en is nooit verklaard. Bij beide is dezelfde
> twee opgeteld, dus het gat is niet groter geworden. Welke van de twee
> klopt is **[TE CONTROLEREN]** met een telling over `pg_trigger` zonder
> de interne triggers.

Hier stond tot 9 augustus "19 Edge Functions, geteld op 2 augustus". Dat
getal spoort niet met de vijftien waar 3.2 diezelfde week op uitkwam en
het verschil is nooit verklaard. Welke telling klopt is
**[TE CONTROLEREN]** door de functielijst in Studio na te tellen; de 16
hierboven volgt de administratie van 3.2.

**schilder-voorraad** telt 9 tabellen en verder niets. Geen opslagbakken,
geen triggers, geen cronjobs, geen enkele achtergrondtaak. De tabellen
zijn `history` (1643 rijen), `products` (708), `bus_targets` (169),
`bus_stock` (100), `projects` (51), `categories` (15), `suppliers` (13),
`buses` (4) en `employees` (4).

Dat verschil is belangrijk. In schilders-calc houden triggers zoals
`set_updated_at` de administratie sluitend, ongeacht wat de app doet. In
voorraad staat geen enkele trigger, dus de tabel `history` wordt volledig
door de app zelf bijgehouden. Slaat de app een keer over, dan mist die
regel en merkt niets het. Dat is geen fout, wel een andere garantie.

### 1.3 Opslagbakken

Alleen in schilders-calc.

| Bak | Openbaar | Inhoud |
|---|---|---|
| `accord-pdf` | **ja, bewust** | getekende akkoorden, 66 bestanden |
| `calculatie-fotos` | nee | 114 bestanden |
| `calculatie-documenten` | nee | 32 bestanden |
| `taken-documenten` | nee | 1 bestand |
| `taken-fotos` | nee | 2 bestanden |
| `oplever-fotos` | nee | foto's bij de opleverpunten, leeg bij aanleg |
| `backups` | nee | nachtelijke dumps, 156 bestanden |

`accord-pdf` staat openbaar omdat de klant er met een link bij moet
kunnen. Of die bestandsnamen te raden zijn is **[TE CONTROLEREN]**. Zijn
het lange willekeurige codes, dan is het veilig. Staan er klantnamen in,
dan liggen getekende offertes met bedragen open op internet voor wie het
adres kent.

`taken-fotos` hoort bij geen enkele tabel. Wat die twee bestanden daar
doen is **[TE CONTROLEREN]**.

### 1.4 Koppelingen naar buiten

| Dienst | Waarvoor |
|---|---|
| Yoobi | CRM en projectadministratie, REST API |
| Yuki | boekhouding, voedt het financiele dashboard |
| Craft.do | werkvoorbereidingsdocumenten |
| Resend | verzenden van alle e-mail uit het systeem |
| Anthropic | leescontrole op offertes en de vraagbaak in de app |
| Google Agenda | klantboekingen voor de opnames lezen, via een serviceaccount, alleen-lezen |
| PDOK Locatieserver | adressen opzoeken, gratis |
| OpenRouteService | rijafstand berekenen |

---

## 2. Toegang

Dit hoofdstuk noemt **geen wachtwoorden**. Het beschrijft welke sleutels
bestaan en waar de echte waarde ligt.

### 2.1 GitHub

Eén account: **GianErnes**. Daaronder hangen drie repositories. Er is
geen tweede GitHub-account in gebruik.

| Repo | Zichtbaar | Wat erin staat |
|---|---|---|
| `schilders-calc` | **openbaar** | de vijf appbestanden, `sql/`, dit document |
| `schilder-voorraad` | **openbaar** | de voorraad-app |
| `ernes-edge-functions` | **besloten** | de broncode van de zestien Edge Functions, plus de twee knoppen |

`ernes-edge-functions` is bewust besloten. Daar staat de herbouwset, en
die kan onbedoeld geheimen bevatten. Alles wat op een uitdraai lijkt gaat
naar deze repo en niet naar een openbare.

De twee openbare repositories zijn **openbaar**. Dat betekent dat iedereen op
internet het adres van je Supabase-projecten kan lezen en de publieke
sleutel die de apps gebruiken. Bij Supabase is dat normaal en op zichzelf
geen probleem, **maar alleen** omdat op alle tabellen in beide projecten
rijbeveiliging aanstaat en elke tabel een policy heeft.

> **Zet nooit RLS uit.** Doe je dat, dan ligt op hetzelfde moment de hele
> administratie op straat, want de sleutel om binnen te komen staat
> openbaar in de repo. Dit is de belangrijkste veiligheidsregel van het
> hele systeem.

**De twee knoppen in `ernes-edge-functions`.** Sinds 27 juli 2026 staan
daar twee werkstromen onder `.github/workflows/`. Allebei te bedienen via
het tabblad Actions, dus zonder Terminal en zonder installatie op de iMac.

| Knop | Wanneer | Wat hij doet |
|---|---|---|
| **Functies ophalen uit Supabase** | elke zondag 03:00 UTC, en met de hand | haalt de broncode van alle functies op en legt die vast in de repo, plus `functies-overzicht.json` met de instelling per functie |
| **Functies uitrollen naar Supabase** | alleen met de hand, en alleen na `JA` kiezen | rolt de functies uit deze repo uit naar een op te geven project, alles tegelijk of een enkele als proef |

De ophaalknop is de belangrijkste van de twee, ook al is de andere de
rampknop. Hij zorgt dat de repo nooit meer achterloopt op wat er
werkelijk draait. Voorheen werd een functie in de Studio-editor gewijzigd
en verouderde de kopie in de repo stilletjes.

De uitrolknop leest `functies-overzicht.json` en zet daaruit per functie
de wachtwoordcontrole terug. **Dat is geen detail.** Zonder dat bestand
komt die controle overal op de standaardwaarde te staan, en bij de
functies die met een eigen sleutel werken zoals `x-aftap-key` is dat fout.
Die weigeren dan alles met een 401 zonder duidelijke reden.

> **De toegangssleutel voor die knoppen.** In `ernes-edge-functions` staat
> onder Settings, Secrets and variables, Actions een geheim met de naam
> `SUPABASE_ACCESS_TOKEN`. Dat is een persoonlijke toegangssleutel van
> Supabase en die **verloopt nooit**. Dat is bewust: een rampknop met een
> verlopen sleutel is geen rampknop.
>
> Die sleutel geeft toegang tot het hele Supabase-account. Vermoed je een
> lek, trek hem dan in op `supabase.com/dashboard/account/tokens` en maak
> een nieuwe onder dezelfde naam. De knoppen werken daarna weer.
>
> Er is een kanarie: de ophaalknop draait elke zondag. Klopt de sleutel
> niet meer, dan loopt die job rood en stuurt GitHub daarover een mail.

> **De rampknop heeft nog nooit gedraaid.** GEMETEN op 3 augustus 2026:
> onder Actions staat bij **Functies uitrollen naar Supabase** nul runs.
> Hij is op 27 juli geschreven en staat sindsdien in 4.8 als stap 5, op
> de plek waar anders uren klikwerk stond. Dat is de gevaarlijkste soort
> geruststelling: in het draaiboek is gerekend met een knop waarvan niet
> bewezen is dat hij werkt.
>
> Wat wel bewezen is, is de helft die hij deelt met de ophaalknop: de
> sleutel, `actions/checkout` en `supabase/setup-cli`. Die draaien elke
> zondag. Onbewezen is het eigen deel: of `functions deploy` zonder
> functienaam werkelijk alles pakt, en vooral of de wachtwoordcontrole
> goed terugkomt op de functies die op `false` staan. Gaat dat mis, dan
> stáán de functies er wel maar weigeren ze alles met een 401.
>
> **Zo test je hem zonder iets te breken.** Draai eerst de ophaalknop met
> de hand. Dan is de repo gelijk aan Supabase en is uitrollen inhoudloos:
> dezelfde code, alleen een nieuw versienummer. Vul daarna bij de
> uitrolknop bij **alleen deze functie** een naam in, bijvoorbeeld
> `reisafstand`, want die is klein en heeft geen cronjob. Kijk in de
> laatste stap of de wachtwoordcontrole klopt met wat je verwachtte.

**Wat de knoppen controleren sinds 3 augustus 2026.** Allebei de
werkstromen zijn die dag herschreven nadat gemeten was dat ze fouten
stilzwijgend konden doorlaten.

De **ophaalknop** schrijft het overzicht eerst naar een tijdelijk bestand
en zet het pas over als het een bruikbare lijst is. Daarvoor ging de
uitvoer van `curl` rechtstreeks het bestand in, en omdat `>` een bestand
leegmaakt vóór het commando draait, maakte één hikje van de API het goede
overzicht leeg. De stap stond bovendien op `continue-on-error`, dus dat
gebeurde groen. Nu blijft bij een fout het oude bestand staan en loopt de
job aan het eind alsnog rood.

Daarnaast legt de ophaalknop na afloop de mappen naast het overzicht. Loopt
dat uiteen, dan loopt de job rood. Dat is met opzet luidruchtig: een
archief dat stilletjes scheef staat merk je pas bij een ramp. Loopt de
zondagsjob rood, lees dan eerst welke stap het is. Gaat het om **Archief
naast het overzicht leggen**, dan is er niets mis met de sleutel.

De **uitrolknop** stopt nu waar hij eerst doorrolde:

| Wat er mis is | Wat er nu gebeurt |
|---|---|
| `functies-overzicht.json` ontbreekt | stopt, want anders komt de wachtwoordcontrole overal op de standaardwaarde |
| het overzicht is geen leesbare JSON | stopt |
| het overzicht is wel JSON maar geen functielijst | stopt |
| het overzicht bevat nul functies | stopt |
| er staat een map die niet in het overzicht staat | stopt, tenzij **toch doorgaan** op `JA` |
| er staat een functie in het overzicht zonder map | stopt, tenzij **toch doorgaan** op `JA` |
| bij **alleen deze functie** staat een naam zonder map | stopt |

Die eerste vier zijn geen keuze. `toch doorgaan` en de proefstand komen er
niet omheen, want een leeg overzicht is nooit een reden om door te rollen.

Na afloop meldt de uitrolknop welke functies er in het doelproject draaien
zonder broncode in de repo. Draai je hem tegen het gewone project, dan lees
je daar dus meteen af of het archief compleet is.

Wat bewust **niet** dichtgezet is: het projectveld blijft vrije tekst. Een
keuzelijst met de twee bekende projecten zou precies het scenario
blokkeren waarvoor de knop bestaat, want bij een echte herbouw is het
project nieuw. Besluit van Gian, 3 augustus 2026.

### 2.2 Supabase

Eén organisatie, **Gian Ernes**, abonnement Pro. Beide projecten hangen
eronder. Eén factuur, één toegang, geen los tweede account.

Aanmelden gebeurt met **[TE CONTROLEREN: welk e-mailadres]**.

### 2.3 Gebruikers van de apps

Aanmelden in de apps gaat via Supabase Auth met e-mailadres en
wachtwoord. Er zijn accounts voor gian, max, maud, jens en bjorn, allemaal
op `@ernes.nl`, plus `administratie@ernes.nl`. In de tabel `taken_rollen`
staan 6 regels, wat daarmee klopt.

De rollen bepalen wat iemand ziet. `alles` ziet alles, `eigen` ziet alleen
de eigen taken, afgedwongen door rijbeveiliging in de database. Wie welke
rol heeft is **[TE CONTROLEREN]** en hoort hier ingevuld te worden.

Kleuren per persoon, gebruikt door de hele suite: Gian blauw `#2563eb`,
Max oranje `#f97316`, Maud zalm `#f28b82`, Jens geel `#eab308`, Bjorn
groen `#16a34a`.

### 2.4 Sleutels en geheimen

Waar de werkelijke waarden liggen: **[TE CONTROLEREN: welke kluis]**.
Vastgesteld is wel dat Max en Maud daar toegang toe hebben, dus als Gian
onbereikbaar is komt men erbij. Dat was de belangrijkste vraag van dit
hele hoofdstuk en het antwoord is goed.

Welke sleutels bestaan (waarden staan in de kluis, niet hier):

- Supabase, per project een publieke sleutel en een servicesleutel
- Yoobi, OAuth2-inloggegevens, gebruiker `yoobiernes2`
- Yuki, koppelingsgegevens voor de boekhouding
- Resend, sleutel voor het verzenden van mail
- Anthropic, sleutel voor de leescontrole en de vraagbaak
- Craft.do, koppelingsgegevens
- Google, het serviceaccount voor de agendakoppeling: `GOOGLE_SA_JSON`
  (het complete sleutelbestand) en `GOOGLE_AGENDA_GEBRUIKER`
  (`administratie@ernes.nl`), als Edge Function secrets in
  `schilders-calc`
- `AFTAP_SECRET`, waarmee de cronjobs `backup-nachtelijk`,
  `taken-mail-melding` en `werkvoorraad-sync-wekelijks` de Edge Functions
  van binnenuit mogen aanroepen. Gaat mee in de header `x-aftap-key`
- `OPVOLG_KEY`, hetzelfde maar dan voor `offerte-opvolging-werkdagen`.
  Gaat mee in de header `x-opvolg-key`

De volledige lijst zoals die werkelijk in Supabase staat is
**[TE CONTROLEREN]**. Die is te vinden in Supabase Studio onder Edge
Functions, Secrets, per project.

**Twee plekken waar geheimen staan.** Naast de Secrets bij Edge Functions
heeft Supabase ook een eigen kluis, `vault`. Sinds 27 juli 2026 halen
**de acht cronjobs van dat moment** hun sleutel daaruit op. De negende,
`opname-boekingen-dagelijks` van 9 augustus 2026, draagt zijn sleutel
bewust leesbaar in de opdrachttekst: dat is de publieke publishable key
die toch al op regel 3541 van de openbare `index.html` staat. De
kluisregel geldt voor geheime sleutels en dit is er geen. In de kluis
staan drie geheimen:

| Naam in de kluis | Hoort gelijk te zijn aan | Gebruikt door |
|---|---|---|
| `maandbericht_key` | **[TE CONTROLEREN]**, gaat mee als `Authorization: Bearer` | `maandbericht-maandelijks`, `yuki-vuller-dagelijks`, `yuki-vuller-middag`, `yuki-vuller-avond` |
| | **Let op:** die laatste drie roepen `smooth-function` aan, niet `maandbericht`. Eén sleutel doet hier dus twee verschillende functies. Vervang je `maandbericht_key`, dan stopt óók je financiele dashboard met bijwerken, en cron blijft gewoon `succeeded` melden. Bevestigd uit `cron.job` op 30 juli 2026. | |
| `aftap_secret` | de Edge Function secret `AFTAP_SECRET` | `backup-nachtelijk`, `taken-mail-melding`, `werkvoorraad-sync-wekelijks`, en de trigger `trg_taak_melding_signaal` |
| `opvolg_key` | de Edge Function secret `OPVOLG_KEY` | `offerte-opvolging-werkdagen` |

**Elk van deze drie staat op twee plekken en die moeten gelijk blijven.**
Werk je er eentje bij, werk dan altijd allebei de plekken bij. Doe je dat
niet, dan weigert de functie het verzoek van de cronjob met een 401 en
merk je dat pas als het werk niet gedaan blijkt.

Bij een herbouw moet die kluis met de hand opnieuw gevuld worden, want
hij zit niet in de backup. Zie 4.8.

> **Geleerd op 27 juli 2026, op de harde manier.** Drie cronjobs droegen
> de AFTAP-sleutel **letterlijk leesbaar** in hun opdrachttekst. Bij het
> maken van een schema-uitdraai kwam die sleutel mee, en dat bestand is
> even in de openbare repo terechtgekomen.
>
> Gevolg: de sleutel moest vervangen worden. Dat is dezelfde dag gedaan,
> en het is te zien in de aanroepen van `taken-mail-melding`: twee
> weigeringen om 08:32 en 08:34, daarna weer alles goed.
>
> **Twee regels die daaruit volgen:**
>
> 1. Een uitdraai van de database kan geheimen bevatten. Doorzoek zo'n
>    bestand op sleutels **voordat** het ergens heen gaat, en zet het
>    nooit ongezien in een openbare repo.
> 2. Verwijderen uit een repo is niet genoeg, want de geschiedenis
>    onthoudt het. Alleen de sleutel vervangen helpt echt.
>
> **Opgelost op 27 juli 2026, later diezelfde dag.** Het waren er geen
> drie maar vier: ook `offerte-opvolging-werkdagen` droeg een sleutel
> letterlijk, onder de naam `x-opvolg-key`. Dat was bij het opstellen van
> de opruimlijst over het hoofd gezien omdat er alleen op het woord
> `secret` gezocht was, en die heet `key`.
>
> Alle vier halen hem nu uit de kluis. Beide sleutels zijn daarbij
> opnieuw vervangen, want de oude waarden waren nergens meer terug te
> vinden en Supabase toont ze niet. Zie de opruimlijst, punt 14.

### 2.5 Waar meldingen binnenkomen

Alle mail uit het systeem en alle waarschuwingen van leveranciers komen
binnen op een **gedeelde mailbox** die Gian, Max en Maud alledrie lezen:
`info@ernes.nl`. Het systeem verstuurt zelf vanaf `offerte@ernes.nl`.

Dat is bewust zo. Kwam die post op een persoonlijk adres binnen, dan zou
het systeem alleen werken zolang die ene persoon zijn mail leest.

De nachtelijke backup stuurt elke maandag een statusbericht met bijlage
naar `info@ernes.nl`. **Die bijlage is de enige kopie van de gegevens
buiten Supabase.** Zie 4.7, want er zitten drie haken aan.

### 2.6 Betalingen

De abonnementen lopen via de creditcard bij **Knab**. Max heeft toegang
tot de bankzaken en kan daar dus bij.

De meeste leveranciers waarschuwen zelf ruim voor een kaart verloopt, en
die waarschuwing komt op de gedeelde mailbox binnen. **Uitzondering: de
Anthropic-sleutel loopt op tegoed en waarschuwt niet netjes vooraf.**
Raakt dat tegoed op, dan stopt de leescontrole op offertes zonder dat
iemand een bericht krijgt.

### 2.7 Domein en e-mail

Het domein `ernes.nl`, de website en de e-mail worden beheerd door Ed
Mordant. Zie hoofdstuk 6.

---

## 3. Wat draait er automatisch

Dit hoofdstuk beschrijft alles wat werk doet zonder dat iemand erop
drukt. Vastgesteld door uitdraai op 26 juli 2026.

Er zijn **drie soorten** automatiek, en dat onderscheid is belangrijk,
want ze staan op drie verschillende plekken en gaan op drie verschillende
manieren stuk.

1. **Cronjobs.** Staan in de database. Roepen op vaste tijden een Edge
   Function aan.
2. **Edge Functions.** Los draaiende programmaatjes bij Supabase. Sommige
   worden door cron aangeroepen, andere door de apps, een paar door niets.
3. **Triggers.** Zitten vast aan een tabel en vuren op het moment dat er
   een rij verandert.

In het project `schilder-voorraad` bestaat **geen enkele** van de drie.
Daar draait niets automatisch. Alles wat daar gebeurt komt uit de app.

### 3.1 De negen cronjobs

Allemaal in `schilders-calc`, allemaal actief.

> **Alle tijden hieronder staan in UTC.** Dat is de tijd waarin cron
> werkt en waarin de logboeken van Supabase de runs tonen. UTC schuift
> niet mee met de zomertijd en onze klok wel, dus het verschil is 's
> zomers twee uur en 's winters één uur. Reken altijd om voordat je
> concludeert dat er iets niet gedraaid heeft.

| Naam | UTC | Bij ons, zomer | Bij ons, winter | Roept aan | Wat het doet |
|---|---|---|---|---|---|
| `backup-nachtelijk` | 02:00 | 04:00 | 03:00 | `backup-dump` | dump van de database naar de bak `backups`, plus kopie van foto's en documenten. Stuurt maandag een statusmail |
| `opname-boekingen-dagelijks` | 03:45 | 05:45 | 04:45 | `opname-boekingen` | leest de klantboekingen uit de Google agenda en werkt de tabel `opname_boekingen` bij. Bijgekomen 9 augustus 2026 |
| `yuki-vuller-dagelijks` | 05:00 | 07:00 | 06:00 | `smooth-function` | haalt de standen uit Yuki en vult het financiele dashboard |
| `yuki-vuller-middag` | 10:00 | 12:00 | 11:00 | `smooth-function` | zelfde, tweede keer op de dag |
| `yuki-vuller-avond` | 17:00 | 19:00 | 18:00 | `smooth-function` | zelfde, derde keer op de dag. Bijgekomen 1 augustus 2026 |
| `offerte-opvolging-werkdagen` | ma t/m vr 06:30 | 08:30 | 07:30 | `offerte-herinnering` | herinnert aan openstaande offertes |
| `taken-mail-melding` | elke 2 minuten | | | `taken-mail-melding` | stuurt mail bij nieuwe of gewijzigde taken |
| `werkvoorraad-sync-wekelijks` | dinsdag 06:00 | 08:00 | 07:00 | `fin-werkvoorraad-sync` | haalt de werkvoorraad uit Yoobi |
| `maandbericht-maandelijks` | de 7e, 07:00 | 09:00 | 08:00 | `maandbericht` | stelt het maandbericht op |

**Twee dingen om te weten.**

`smooth-function` staat in de lijst met Edge Functions als **`yuki-test`**.
Dat is geen test. Die functie vult tweemaal daags het financiele
dashboard. Wie ooit opruimt en een ding tegenkomt dat naar test heet,
gooit dat weg, en dan valt financieel.html om zonder dat iemand snapt
waarom. Zie de opruimlijst.

`taken-mail-melding` draait elke twee minuten, ruim 700 keer per dag. Dat
kost geen geld van betekenis, maar het laat de logtabellen hard vollopen.

### 3.2 De zestien Edge Functions

Het waren er achttien tot 27 juli 2026. Toen zijn `taken-meldingen`,
`yoobi-kijkglas` en `yoobi-project-probe` verwijderd, alle drie na
vaststelling dat ze zesentwintig dagen lang nul keer waren aangeroepen.
Op 2 augustus is `taken-agenda` gevolgd, waarmee het er veertien werden.
Op 3 augustus kwam `taak-afvinkmelding` erbij, zie opruimpunt 21. Daarmee
stond de teller weer op vijftien. Op 9 augustus 2026 is
`opname-boekingen` aan dit overzicht toegevoegd, zie verderop, en staat
de teller op zestien.

> **Het getal in dit document klopte niet.** GEMETEN op 3 augustus 2026:
> het woord "achttien" stond er twaalf keer, waarvan zes keer over de
> stand van vandaag. Die zes zijn gecorrigeerd, waaronder de knoppentabel
> van 2.1 en het herbouwdraaiboek van 4.8.
>
> Dat is een verraderlijke fout. Je rolt bij een herbouw uit, telt na,
> komt op vijftien, en gaat op je knieën zoeken naar drie functies die
> niet bestaan. Waar "achttien" nu nog staat gaat het over de situatie
> van juli 2026 en is dat met opzet.

De broncode staat sinds 26 juli 2026 in de besloten repo
`GianErnes/ernes-edge-functions`. Dat is nodig, want een backup van
Supabase neemt Edge Functions **niet** mee. Sinds 27 juli houdt de
ophaalknop die repo wekelijks vanzelf bij, zie 2.1.

> **`smooth-function` heet in de lijst `fin-dashboard-sync`.** Een Edge
> Function heeft twee namen: een adresnaam die in de URL staat en die
> vastligt, en een weergavenaam die vrij te wijzigen is. Bij deze functie
> zijn die verschillend:
>
> | Waar | Naam |
> |---|---|
> | in de lijst van Studio | `fin-dashboard-sync` |
> | in de URL, in de cronjobs, in de repo | `smooth-function` |
>
> Tot 27 juli 2026 was de weergavenaam `yuki-test`. Dat was gevaarlijk,
> want wie opruimt gooit iets dat naar test heet zonder aarzelen weg, en
> dan valt financieel.html om. De adresnaam veranderen kan niet zonder
> een nieuwe functie te maken en de cronjobs om te zetten, en dat is een
> operatie van dagen voor een cosmetisch probleem. Vandaar deze twee
> namen. **Zoek je hem in de cronjobs, zoek dan op `smooth-function`.**

**Aangeroepen door cron** (zie de tabel hierboven): `backup-dump`,
`smooth-function`, `offerte-herinnering`, `taken-mail-melding`,
`fin-werkvoorraad-sync`, `maandbericht`, `opname-boekingen`.

**`opname-boekingen`, de agendakoppeling.** Versie 4 sinds 9 augustus
2026. Leest de primaire agenda van `administratie@ernes.nl` via een
Google-serviceaccount: cloudproject `ernes-agenda`, serviceaccount
`schilders-calc-agenda@ernes-agenda.iam.gserviceaccount.com`,
domeinbrede machtiging met alleen `calendar.readonly`. De sleutels staan
als secrets in Supabase, zie 2.4. De functie herkent klantboekingen aan
"geboekt door" in de omschrijving, kijkt 180 dagen terug, zet postcode
plus huisnummer via PDOK om naar straat en woonplaats en groepeert
boekingen per e-mailadres, zodat `eerste_created` het echte
aanvraagmoment vasthoudt, ook na een verzetting.

Zonder parameter is elke aanroep een droogloop: de functie leest de
tabel, vergelijkt en meldt wat hij zou doen (nieuw, bijgewerkt,
ongewijzigd), maar verandert niets. Alleen met `?schrijf=1` schrijft hij
naar de tabel `opname_boekingen`, en die parameter geeft alleen de
cronjob mee.

Mengregels bij het bijwerken van een bestaande rij:

- de vier appkolommen `calculatie_id`, `verwerkt_op`,
  `annulering_gemeld_op` en `created_at` worden door de sync nooit
  aangeraakt, die zijn van de app
- `eerste_created`: de oudste waarde wint, zodat het aanvraagmoment niet
  meeschuift wanneer een oudere boeking uit het venster van 180 dagen
  valt
- klant-, adres- en notitievelden: gevuld wint en een lege nieuwe waarde
  laat de oude staan. Vangnet tegen een PDOK-storing, want bij de nieuwe
  formuliervorm komen straat en woonplaats alleen uit PDOK
- status- en tijdvelden: de laatste run wint
- een rij waar niets aan verandert wordt niet geschreven, dus
  `updated_at` betekent laatst inhoudelijk gewijzigd door de sync
- de kolom `gegevens` (jsonb) bevat het complete boekingsobject zoals de
  laatst schrijvende run het zag

De tabel `opname_boekingen` is aangemaakt op 8 augustus 2026, telt 24
kolommen, heeft een unieke sleutel op `google_event_id` en verwijst met
`calculatie_id` naar `calculaties`, on delete set null. Op 9 augustus
gevuld met de eerste 30 boekingen. Het blokje in de app dat deze
boekingen toont bestaat sinds v4.40.0 van diezelfde dag: knop
Calculatie aanmaken (naam Achternaam | werksoort uit het formulier,
alleen de achternaam in klant, deadline op opname plus veertien dagen,
adres, e-mail, telefoon en de aanvraagtekst in de notities) en knop
Wegtikken met een terugzetlijst. Zie de CHANGELOG bij v4.40.0 tot en
met v4.40.2.

**Bewust besluit van 9 augustus 2026.** Zodra die knop er is komt de
aanvraagtekst van de klant in `calculaties.notities` en daarmee
standaard onder het kopje Bevindingen op de offerte. Er komt geen
waarschuwing bij het aanmaken van de accordeerlink; Gian schrijft de
notitie tijdens de opname over. Dit is gekozen en geen vergeten risico.

**Aangeroepen vanuit de apps:**

| Functie | Vanuit | Wat het doet |
|---|---|---|
| `app-hulp` | Calc | vraagbaak in de app |
| `craft-werkvoorbereiding` | Calc | werkvoorbereidingsdocument in Craft |
| `offerte-accord` | Calc | akkoordverklaring en ondertekende PDF |
| `offerte-leescontrole` | Calc | controleert de offerte op fouten |
| `offerte-verzenden` | Calc | verstuurt de offerte |
| `reisafstand` | Calc | rijafstand naar het werkadres |
| `yoobi-klant` | Calc | klantgegevens uit Yoobi |
| `yoobi-taken-sync` | Taken | taken en projectnamen uit Yoobi |

`offerte-herinnering` wordt zowel door cron als vanuit de app aangeroepen.

**Aangeroepen door een trigger.** Eén functie hangt niet aan de klok en
niet aan een app, maar aan de database zelf.

| Functie | Vanuit | Wat het doet |
|---|---|---|
| `taak-afvinkmelding` | trigger `trg_taak_melding_signaal` op `taken` | mailt Gian de melding die iemand achterliet bij het afvinken |

Die functie mailt altijd naar Gian, ongeacht wie de taak had. Het adres
staat niet in de code maar wordt opgezocht in `taken_rollen` bij persoon
`gian`, met een kleine letter. Verandert dat adres, dan is dat de enige
plek om aan te passen. Staat er geen adres, dan stopt de functie met een
fout in het logboek. Dat is hier met opzet strenger dan bij
`taken-mail-melding`, want daar is geen adres soms de bedoeling (Maud) en
hier nooit.

> **Hij heette tot 3 augustus 2026 `taak-melding-mail`.** Hernoemd bij
> opruimpunt 21, omdat die naam dezelfde drie woorden bevatte als
> `taken-mail-melding` in een andere volgorde en de twee in de lijst pal
> onder elkaar stonden. De werking is geen letter gewijzigd. Kom je de
> oude naam ergens tegen, dan is dat een plek die is blijven staan.

> **De schrijfwijze stond hier eerst met een hoofdletter.** Alle waarden in
> `taken_rollen` zijn kleine letters; dat zijn ook de sleutels die
> `taken.html` gebruikt. `taak-afvinkmelding` zoekt inmiddels
> hoofdletteronafhankelijk (`ilike`), dus het gaat hoe dan ook goed, maar de
> tekst wees naar een waarde die niet bestaat.
>
> Let op het verschil met `taken-mail-melding`: die zoekt wél
> hoofdlettergevoelig, met een gewone opzoeking op `taken_rollen.persoon`.
> Komt daar ooit een naam met een hoofdletter in, dan valt die persoon stil
> in de tak `onbekende_persoon`. Sinds v2 van 2 augustus 2026 staat dat wel
> in het logboek, met de naam erbij.

**Bewust niet samengevoegd met `taken-mail-melding`.** Die functie is een
poller die zoekt op verstreken piep-tijd en mailt naar de toegewezen
persoon. Deze is het omgekeerde: aangeroepen op het moment zelf, altijd
naar Gian, andere tekst. Samenvoegen zou één functie opleveren die twee
dingen doet. Bijkomend: `taken-mail-melding` staat op de nominatie om van
de klok naar een trigger te gaan (opruimlijst punt 6), en bouwen in iets
dat gaat verschuiven is dubbel werk.

**Aangeroepen door niets.** Op 26 juli 2026 nagekeken in de
aanroeplogboeken. Deze vier staan op de nominatie om te verdwijnen en
staan bewaard in de archiefrepo.

| Functie | Wat het was |
|---|---|
| `taken-agenda` | taken tonen via een agenda-abonnement, verlaten |
| `taken-meldingen` | eerste poging tot taakmeldingen |
| `yoobi-kijkglas` | overblijfsel van de Yoobi-verkenning |
| `yoobi-project-probe` | overblijfsel van de Yoobi-verkenning |

> **Meldingen over taken lopen via mail.** Er zijn drie generaties van
> hetzelfde probleem geweest: `taken-meldingen`, toen `taken-agenda`, en
> uiteindelijk `taken-mail-melding`. De eerste twee zijn verlaten. Niet
> opnieuw bouwen.

Bij alle vier staat de wachtwoordcontrole uit. Ze zijn dus zonder
inloggegevens bereikbaar voor wie de naam raadt, en de twee Yoobi-functies
kunnen bij de Yoobi-inloggegevens van het project, want alle functies in
een project delen dezelfde geheimen. Dat is de reden om ze op te ruimen,
niet de netheid.

### 3.3 De twaalf triggers

Allemaal op tabellen in `schilders-calc`, allemaal actief.

| Trigger | Op tabel | Wat het doet |
|---|---|---|
| `trg_offerte_taken` | `calculaties` | maakt taken aan als een offerte van status wisselt |
| `trg_todo_taken` | `todos` | spiegelt een todo uit de calculatie naar de takenapp |
| `trg_taken_todo_terug` | `taken` | spiegelt terug van taak naar todo |
| `bescherm_eigen` | `taken` | voorkomt dat iemand andermans taak aanpast |
| `bevries_yoobi` | `taken` | beschermt velden die uit Yoobi komen |
| `zet_bijgewerkt` | `taken` | zet de bijwerkdatum |
| `trg_taak_melding_signaal` | `taken` | mailt Gian als iemand een taak afvinkt met een melding erbij |
| `trg_bewerkingen_upd` | `bewerkingen` | zet de bijwerkdatum |
| `trg_materialen_upd` | `materialen` | zet de bijwerkdatum |
| `trg_ondergronden_upd` | `ondergronden` | zet de bijwerkdatum |
| `trg_settings_upd` | `settings` | zet de bijwerkdatum |
| `trg_verfsystemen_upd` | `verfsystemen` | zet de bijwerkdatum |

Triggers zijn het makkelijkst te vergeten onderdeel van dit systeem,
omdat ze nergens zichtbaar zijn en geen logboek bijhouden. Ze doen werk
waarvan iedereen denkt dat de app het doet.

> **`trg_taak_melding_signaal` is de eerste trigger die de deur uit
> belt.** Alle andere blijven binnen de database. Deze roept via
> `net.http_post` de Edge Function `taak-afvinkmelding` aan, en haalt
> daarvoor de sleutel `aftap_secret` uit de kluis. Daarom staat hij op
> `security definer` met een vast `search_path`: een gewone ingelogde
> gebruiker mag niet bij die kluis.
>
> **Aflevertijd, gemeten op 2 augustus 2026:** taak afgevinkt om 23:23, mail
> binnen om 23:24. Dus binnen een minuut. Dat is een meting en geen
> schatting; eerder die dag is in een gesprek een looptijd van een halve
> seconde per mailaanroep verzonnen die nooit gemeten was, en dat is de
> aanleiding voor de bewijsregel in 5.6.
>
> Twee dingen om te weten als je hem ooit moet nakijken. Hij staat op
> **insert én update**, want een herhalende taak wordt afgevinkt door een
> historiekopie aan te maken die meteen voltooid is; zonder insert zou
> juist daar de mail uitblijven. En hij is **after**, zodat een storing
> in het mailen het afvinken zelf nooit tegenhoudt. Ontbreekt de sleutel,
> dan komt er een waarschuwing in het logboek en gaat het afvinken
> gewoon door: de tekst staat dan bij de taak, alleen ongelezen.

### 3.4 Hoe je ziet dat het nog draait

Dit is het lastigste stuk, want een geschreven pagina kan niet vertellen
of de backup vannacht gelopen heeft. Tot er een statusscherm is (punt 5
van de opruimlijst) gaat het handmatig.

**De uitdraai.** Draai `inventarisatie_automatiek.sql` in de SQL-editor.
Die geeft in één resultaat alle cronjobs met hun laatste run, alle
triggers, alle opslagbakken en alle tabellen. Dit is het snelste
totaalbeeld en het is puur lezen.

> **Waar die query staat.** In de map `sql/` van deze repo, onder de
> herbruikbare scripts. Allemaal read-only, ze veranderen niets:
>
> - `inventarisatie_automatiek.sql` — het totaalbeeld, voor `schilders-calc`
> - `inventarisatie_zonder_cron.sql` — dezelfde uitdraai zonder de
>   cronblokken. Nodig voor `schilder-voorraad`, want daar staat pg_cron
>   niet aan en dan breekt de eerste query af met een melding over
>   `cron.job`
> - `exacte_rijtelling.sql` — telt per tabel het werkelijke aantal rijen.
>   Gebruikt om te controleren of een herstel geslaagd is
> - `schema_sleutelscan.sql` — zoekt op patroon naar sleutels die
>   letterlijk in de structuur staan. Toont nooit de gevonden waarde
> - `schema_sleutelscan_2.sql` — meet de lengte van elke tekstwaarde.
>   Vangt sleutelsoorten die het patroon niet kent
> - `schema_sleutelscan_3.sql` — kijkt naar de vorm van de tekst. Een
>   sleutel heeft geen spaties en mengt hoofd- en kleine letters
> - `audit_query_periodiek.sql` — bestond al. Kijkt naar rechten en
>   rijbeveiliging, eens per kwartaal. Zie de waarschuwing hieronder
>
> Supabase Studio toont bij meerdere SELECT-opdrachten alleen het laatste
> resultaat. Daarom geven de eerste drie alles in één antwoord terug.

> **Waarschuwing bij `audit_query_periodiek.sql`.** Dat bestand bestaat
> uit vier losse SELECT-opdrachten. Supabase Studio toont daarvan alleen
> de laatste. Wie hem draait ziet dus uitsluitend de tabellen met
> rijbeveiliging zonder policy, en **niet** het rechtenoverzicht, niet de
> controle op tabellen zonder rijbeveiliging, en niet de controle op
> anon-rechten. Dat zijn juist de twee waarvoor de audit bedoeld was.
> Moet nog samengevoegd worden tot één resultaat, zie de opruimlijst.

**Een bekende uitzondering.** De tabel `sync_state` heeft rijbeveiliging
aan en **nul policies**. Volgens `sql/README.md` is dat een rode vlag.
Hier is het bewust: die tabel wordt alleen door Edge Functions gevuld, en
die werken met de servicesleutel en gaan langs de rijbeveiliging heen.
**Zet er geen policy op om het te repareren.** Dan open je hem voor
iedereen die is ingelogd.

> **Bijgewerkt op 2 augustus 2026.** Hier stond `taken_melding_sleutels`
> als tweede uitzondering. Die tabel is op 27 juli verwijderd, wat
> verderop in de opruimlijst ook staat, maar deze passage was niet
> meegegaan: twee plekken in hetzelfde bestand die elkaar tegenspraken.
> Gevonden door de lijst met tabelnamen uit de database naast dit
> document te leggen. Dat is een controle die zichzelf terugverdient, en
> die verder geen enkele andere afwijking opleverde: elke tabel die dit
> document bij naam noemt, bestaat.

Waar je op let in blok 2, de laatste runs:

- `taken-mail-melding` hoort op minuten te staan, niet op uren
- `backup-nachtelijk` en de twee yuki-vullers op hoogstens een etmaal
- `werkvoorraad-sync-wekelijks` op hoogstens acht dagen
- `maandbericht-maandelijks` op hoogstens vijfendertig dagen

**Ontbreekt een job helemaal in blok 2, dan heeft hij nog nooit
gedraaid.** Dat is niet hetzelfde als een oude laatste run en het is
ernstiger. Op 26 juli 2026 was dat het geval bij
`offerte-opvolging-werkdagen`, en dat bleek te kloppen: die was dat
weekend gebouwd en moest maandag voor het eerst vuren.

**Per Edge Function.** In Supabase Studio, Edge Functions, functie
aanklikken, tabblad **Invocations**. Zet het tijdvenster ruim. Daar zie je
per aanroep de datum en of hij gelukt is. Dit is de enige plek waar je
ziet of iets van buitenaf een functie aanroept, en dat is hoe op 26 juli
bleek dat `taken-agenda` nog springlevend was terwijl hij in geen enkel
bestand voorkwam.

**Waar je niet naar moet kijken.** De tabel `net._http_response` lijkt
bruikbaar maar is dat niet: alle functies staan er door elkaar op
volgorde van tijd en je trekt er makkelijk de verkeerde conclusie uit.

> **De blinde vlek van cron.** Acht van de negen cronjobs gebruiken
> `net.http_post`. Dat stuurt het verzoek de deur uit en gaat meteen
> door, zonder op antwoord te wachten. **Cron meldt daarom "succeeded"
> zodra het verzoek verstuurd is, ook als de functie het daarna weigert.**
>
> Gezien op 27 juli 2026: cron meldde succeeded terwijl de functie
> tweemaal 401 teruggaf omdat de sleutel niet klopte.
>
> Een groene laatste run betekent dus alleen dat cron het verzoek heeft
> verstuurd. Wil je weten of het werk ook echt gedaan is, kijk dan bij
> Invocations van de functie zelf. Daar staat 200 of een foutcode.
>
> Uitzondering: `werkvoorraad-sync-wekelijks` gebruikt `extensions.http`
> en wacht wél op antwoord. Bij die ene job zegt een mislukte run
> daadwerkelijk iets.

> **Drie valse signalen bij de nachtelijke backup.** Van alle
> achtergrondtaken is `backup-nachtelijk` de belangrijkste, en juist die
> laat zich het slechtst controleren. Er zijn drie manieren om er de
> verkeerde conclusie uit te trekken, en ze wijzen twee kanten op.
>
> 1. **Het groene vinkje bij de cronjob zegt niets.** Zie het blok
>    hierboven. Groen betekent alleen dat het verzoek verstuurd is
> 2. **De timeout van vijf seconden is normaal.** `net.http_post` wacht
>    vijf seconden en kapt dan af. De dump duurt langer, dus in
>    `net._http_response` staat bij deze job **altijd** `Timeout of 5000
>    ms reached` met een lege statuscode. De functie draait aan de andere
>    kant gewoon door. Wie dat niet weet, denkt dat de backup al maanden
>    stuk is
> 3. **`created_at` in `storage.objects` schuift niet mee.** De functie
>    schrijft één bestand per dag, `backup-JJJJ-MM-DD.json`, en
>    overschrijft dat bij een tweede run. Bij een overschrijving blijft
>    `created_at` staan op het eerste moment. Sorteer je daarop, dan lijkt
>    er niets gebeurd te zijn. **Kijk naar `updated_at`**
>
> Signaal 1 en 3 laten een werkende backup er stuk uitzien of andersom.
> Dat is de reden dat punt 5 van de opruimlijst, het statusscherm, geen
> luxe is.
>
> **De enige echte controle** is kijken of er een vers bestand in de bak
> staat:
>
> ```sql
> select name,
>        round((metadata->>'size')::numeric / 1024 / 1024, 2) as mb,
>        updated_at at time zone 'Europe/Amsterdam' as laatst_geschreven
> from storage.objects
> where bucket_id = 'backups' and name like 'backup-%'
> order by updated_at desc
> limit 5;
> ```
>
> Het bestand is ongeveer 8,3 MB en groeit met zo'n 0,13 MB per dag.

---

## 4. Als het stukgaat

De volgorde hieronder is de volgorde waarin je hem doorloopt. Begin
altijd bovenaan, ook als je denkt te weten wat het is.

### 4.0 Eerste handeling, altijd

1. **Werkt het bij iemand anders ook niet?** Werkt het wel bij een
   collega, dan zit het in de browser of het apparaat, en niet in het
   systeem. Laat de pagina hard verversen met cmd-shift-R.
2. **Staat Supabase zelf overeind?** Kijk op `status.supabase.com`. Ligt
   het daar, dan is er niets te repareren en wachten we.
3. **Draai de uitdraai.** `inventarisatie_automatiek.sql` uit de map
   `sql/` van deze repo. Binnen een minuut weet je of de
   achtergrondtaken nog lopen.

Pas daarna ga je zoeken.

### 4.1 Yoobi geeft overal foutmeldingen

**Beeld:** meerdere Yoobi-koppelingen geven tegelijk fout 500. Niet één,
maar allemaal.

**Eerste handeling:** niets zelf repareren. Als álle koppelingen tegelijk
omvallen, ligt het niet aan ons. Dit is eerder gebeurd en de oorzaak was
een kapotte API-gebruiker aan de kant van Yoobi.

**Bellen:** Yoobi, en bij geen doorpakken Vincent Egt. Zie hoofdstuk 6.

**Wat werkt intussen niet:** klantgegevens ophalen in Calc, taken uit
Yoobi, en de wekelijkse werkvoorraad. De rest van het systeem draait door.

### 4.2 Het financiele overzicht staat op nul

**Beeld:** financieel.html toont nullen of een oude stand.

**Eerste handeling:** kijk in de uitdraai wanneer `yuki-vuller-dagelijks`,
`yuki-vuller-middag` en `yuki-vuller-avond` voor het laatst gedraaid
hebben. Staan die op vandaag, dan ligt het aan Yuki en niet aan ons.

**Let op:** de tabel `fin_dashboard` bevat één regel die drie keer per dag
overschreven wordt. Er is geen geschiedenis: wat er gisteren stond is weg.
De maandberichten blijven wel bewaard in `fin_berichten`.

**Sinds 1 augustus 2026 overschrijft een mislukte run niets meer.** Geeft
Yuki een foutcode, dan breekt de vuller af. Komt het banksaldo op precies
0,00 uit, dan weigert hij te schrijven. In beide gevallen blijft de stand
van de vorige run staan, inclusief de oude `bijgewerkt_op`. Daarvóór
werden in dat geval nullen weggeschreven en was de goede stand weg.

**Zie je een oude stand, kijk dan eerst naar de tijdstempel.**
financieel.html toont bovenin Bijgewerkt met datum en tijd, rechtstreeks
uit `fin_dashboard.bijgewerkt_op`. Staat die op een eerdere run, dan heeft
de vuller bewust niets weggeschreven en staat de reden bij Invocations van
`smooth-function`. Er gaat met opzet geen mail uit: die tijdstempel is het
enige signaal, en die zie je vanzelf zodra je het dashboard opent.

**Verschil met Yuki zelf is normaal, behalve bij het banksaldo.** De app
maakt een momentopname om 07:00, om 12:00 en om 19:00, 's winters telkens
een uur eerder. Yuki Monitor telt de boekingen van gedurende de dag mee,
en afschrijvingen. Voor omzet en
resultaat vergelijk je daarom vlak na een verversing, dan kijken beide
naar dezelfde stand.

Het **banksaldo** hoort wél gelijk te zijn aan het Huidig saldo in Yuki,
op de boekingen van na de verversing na. Wijkt dat structureel af, dan is
er iets stuk. Sinds 28 juli 2026 rekent de vuller het zo:

| Onderdeel | Grootboek |
|---|---|
| bankrekeningen en spaarrekeningen | alles dat begint met 11 of 12 |
| creditcard | 15000 |
| betalingen onderweg | 23000 |

Die drie bij elkaar opgeteld is exact het Huidig saldo van Yuki. Rekening
23000 heet in het grootboek Betalingen onderweg, maar Yuki toont het
saldo in het banksaldo-scherm onder de kop Interne overboekingen
onderweg. Dat is dezelfde post.

**Rekening 23000 moet uit een saldibalans per 31 december komen,** niet
per vandaag. Betaalbatches worden geboekt op hun uitvoerdatum en die
ligt in de toekomst; een balans per vandaag ziet ze niet. Op 30 juli
2026 miste de balans per vandaag daardoor 11.613 aan geagendeerde
batches en stond de tegel met dat bedrag te hoog. De vuller haalt sinds
v1.1.1 één extra saldibalans per jaareinde op, alleen voor deze
rekening. Al het andere blijft per vandaag, anders lekt toekomstige
omzet het dashboard in.

> **Waarom dit een halve avond gekost heeft.** Tussen 21 en 28 juli 2026
> stond het banksaldo bijna twintigduizend te hoog. De vuller berekende
> het geagendeerde deel als saldo 16000 min de openstaande crediteuren.
> Dat kan niet werken: zodra een factuur in een betaalbatch gaat verlaat
> hij 16000 en komt hij op 23000 te staan, dus die twee bleven altijd
> gelijk en het verschil was nul. Rekening 23000 viel buiten beeld omdat
> de optelling alleen naar 11 en 12 keek en 23000 in de 2-reeks staat.
>
> **De les:** wil je weten hoe Yuki aan een getal komt, tel het dan na op
> de proef- en saldibalans in plaats van het uit de schermen af te
> leiden. De koppen in de schermen dekken de grootboeknamen niet.
>
> **Tweede les, van 30 juli:** een saldibalans heeft een peildatum en
> boekingen kunnen in de toekomst liggen. De jaaruitdraai waarop de
> formule bewezen werd bevatte de augustusboekingen, de API-aanroep per
> vandaag niet. Hetzelfde grootboek, twee getallen. Bij het narekenen
> hoort dus ook: over welke periode kijkt deze uitdraai, en over welke
> kijkt de code.

**Je bankapp staat altijd hoger.** Daar staat wat de bank verwerkt heeft,
hier staat wat geboekt is. Loopt dat verschil op, kijk dan in Yuki bij de
bankrekeningen naar de laatste transactiedatum per rekening. Staat er een
week tussen twee banken, dan wordt er ergens niet ingelezen.

### 4.3 Een achtergrondtaak draait niet meer

**Beeld:** geen mail meer bij nieuwe taken, geen maandbericht, geen
werkvoorraad.

**Eerste handeling:** uitdraai draaien en kijken naar blok 2. Staat de
laatste run te ver terug, of ontbreekt de job helemaal, dan is dat de
oorzaak.

**Daarna:** open de betreffende Edge Function in Studio en kijk bij
Invocations en Logs wat er misging. Meestal is het een sleutel die niet
meer werkt of een dienst aan de andere kant die niet antwoordt.

**Denk aan het tegoed.** De Anthropic-sleutel loopt op tegoed en
waarschuwt niet netjes vooraf. Raakt dat op, dan stopt de leescontrole op
offertes stilletjes.

### 4.4 Bestanden zijn weg

**Beeld:** foto's, documenten of getekende akkoorden zijn verdwenen.

**Dit is het zwakste punt van het hele systeem en dat moet je weten
voordat het gebeurt.**

De platformbackup van Supabase bevat **uitsluitend de database**, geen
bestanden. Dat staat letterlijk in het backupscherm. De eigen nachtelijke
kopie pakt alleen `calculatie-fotos` en `calculatie-documenten`.

Dat betekent dat `accord-pdf`, `taken-documenten` en `taken-fotos` op dit
moment **geen enkele backup** hebben. De 66 getekende akkoorden zijn
daarmee het enige onvervangbare in het systeem. Zie de opruimlijst,
punt 1.

**`taken-fotos` is in gebruik**, niet slapend. Op 27 juli kwam er een
bestand bij. Er hoort alleen geen tabel bij die weet welke foto bij welke
taak zit, en hij zit in geen enkele kopie. Twee dingen om uit te zoeken en
allebei nog **[TE CONTROLEREN]**.

**De maandagse statusmail meldt hierover ten onrechte groen.** Er staat
"Spiegel fotobuckets: achterstand 0", en dat klopt voor de twee bakken die
hij spiegelt. Over `accord-pdf` zwijgt hij. Je krijgt dus elke week een
bericht dat vertrouwen wekt dat je niet hebt. Bij het oppakken van punt 1
moet die mail vermelden wélke bakken hij meeneemt.

### 4.5 De database is weg of kapot

**Dit is geoefend op 26 juli 2026 en het werkt.** Doorlooptijd was een
half uur.

1. Supabase, het getroffen project, **Database**, onder PLATFORM
   **Backups**.
2. Tabblad **Restore to new project**. Niet de andere twee tabbladen,
   want die schrijven over het bestaande project heen.
3. Kies de gewenste dag en klik **Restore**.
4. Geef het nieuwe project een naam. **Let op dat de browser dat veld niet
   zelf invult met een e-mailadres**, dat gebeurde bij de oefening.
5. Wachten. Reken op een half uur.

**Het nieuwe project verschijnt niet meteen in de projectenlijst.** Die
toont alleen projecten die al actief zijn. Wil je weten of hij bestaat,
kijk dan bij de organisatie: daar staat het aantal projecten, en dat telt
hem wel mee. Verversen met cmd-shift-R helpt.

**Controleren of het gelukt is:** draai `exacte_rijtelling.sql` in het
nieuwe project en leg de aantallen naast de laatst bekende telling.

Bewaartermijn van de platformbackup is **zeven dagen**, voor beide
projecten.

### 4.6 Wat herstel niet terugbrengt

Dit is het belangrijkste deel van dit hoofdstuk. Een herstel geeft je je
gegevens terug, niet je systeem. Het volgende moet met de hand opnieuw:

| Wat | Waar je het terugvindt |
|---|---|
| Edge Functions | de besloten repo `ernes-edge-functions` |
| Cronjobs | hoofdstuk 3.1, opnieuw aanmaken |
| Triggers | komen wel mee, die zitten in de database |
| Bestanden in de opslagbakken | de bak `backups`, en voor accord-pdf: nergens |
| Geheimen en sleutels | de kluis |
| Instellingen van aanmelden | met de hand |

Reken dus niet op één knop. Reken op een knop plus een dag werk met deze
lijst ernaast.

### 4.7 De eigen nachtelijke dump

Bijgewerkt 27 juli 2026, na bestudering van de wekelijkse statusmail.

**Wat hij doet.** Elke nacht om 02:00 UTC schrijft `backup-dump` één
bestand weg naar de bak `backups`, met de naam `backup-JJJJ-MM-DD.json`.
Op 27 juli was dat 8,32 MB met 37 tabellen erin, wat klopt met de
werkelijkheid. Daarnaast spiegelt hij `calculatie-fotos` en
`calculatie-documenten`, en die zijn bij: achterstand nul.

Elke maandag om 04:00 onze tijd gaat er een statusmail naar
`info@ernes.nl`, verstuurd vanaf `offerte@ernes.nl`, met **de nieuwste
backup als bijlage**. Die bijlage is de enige kopie van de gegevens buiten
Supabase.

**Drie dingen die je moet weten voordat je hierop vertrouwt.**

**1. Het is een JSON-export, geen volledige databasedump.** Je krijgt
daarmee alle rijen terug, en **niet** de tabeldefinities, de policies, de
triggers of de indexen. Zou je dit in een leeg project moeten
terugzetten, dan heb je eerst een database nodig om het ín te gieten, en
die structuur staat nergens vastgelegd.

De platformbackup van Supabase heeft de structuur wél, maar zit ín
Supabase. De maandagmail zit buiten de deur, maar heeft alleen de inhoud.
**Los van elkaar is geen van beide compleet.** Een schemadump ontbreekt.

**2. Die bijlage loopt vast, vermoedelijk begin december 2026.** Het
bestand groeide van 7,03 MB op 17 juli naar 8,32 MB op 27 juli, ongeveer
0,13 MB per dag. De grens voor een mailbijlage ligt rond de 25 MB. Bij dit
tempo is dat over een kleine 130 dagen bereikt.

En dan gebeurt er niets zichtbaars: de mail komt aan zonder bijlage, of
komt helemaal niet aan, en niemand merkt dat de enige kopie buiten
Supabase is opgehouden te bestaan. Zie de opruimlijst.

**3. Hij is nog nooit teruggezet.** Of dat JSON-bestand werkelijk bruikbaar
is om mee te herstellen weet niemand. Dat is de eerstvolgende test die
gedaan moet worden en de belangrijkste openstaande vraag van dit document.

### 4.8 Herbouwen vanaf nul

Backup en herstel zijn twee verschillende dingen. De vorige paragrafen
gaan over het terughalen van gegevens. Deze gaat over de vraag die
daarachter zit: **hoe krijg je alles weer draaiend.**

Er zijn drie soorten ramp en je staat er per soort heel anders voor.

| Ramp | Wat er gebeurd is | Hoe je ervoor staat |
|---|---|---|
| **1** | iets stuk in de database | **gedekt**, zie 4.5, half uur, bewezen |
| **2** | het Supabase-project is weg | half gedekt, de structuur zit nog in de platformbackup |
| **3** | geen toegang meer tot Supabase | **niet gedekt**, alles moet opnieuw |

Ramp 1 is verreweg de waarschijnlijkste en die is af. Ramp 3 is
onwaarschijnlijk maar totaal: account geblokkeerd, betaalgeschil, of
Supabase houdt op te bestaan.

#### Wat er allemaal moet gebeuren bij ramp 2 en 3

| Onderdeel | Staat het buiten Supabase? | Tijd |
|---|---|---|
| De vier appbestanden | ja, GitHub | minuten |
| Broncode Edge Functions | ja, `ernes-edge-functions` | — |
| Structuur van de database | ja, `schema/` en de maandagbijlage | half uur |
| Inhoud van de database | ja, de JSON uit 4.7 | minuten |
| **De zestien functies uitrollen** | n.v.t. | **uren klikwerk** |
| De negen cronjobs | ja, hoofdstuk 3.1 | half uur |
| De geheimen | ja, de kluis | half uur |
| De zes inlogaccounts | nee | half uur, zie waarschuwing |
| Opslagbakken en hun rechten | ja, zitten in de schemadump | minuten |
| **De bestanden zelf** | deels, `accord-pdf` niet | zie de noot hieronder |
| **Adres en sleutels in de apps** | — | **half uur, wordt altijd vergeten** |

> **De stille moordenaar.** Een nieuw Supabase-project krijgt een **ander
> adres en andere sleutels**. Die staan hard in alle vier de
> HTML-bestanden. Pas je die niet aan, dan draaien je apps vrolijk door
> tegen een database die niet meer bestaat, zonder duidelijke foutmelding.
> Dit is de laatste stap van elk herstel en tegelijk de makkelijkst
> vergeten stap.

> **Let op de inlogaccounts. Dit is uitgezocht op 27 juli 2026 en het
> klopt: de rollen hangen aan de interne id's.** De functies `taken_rol()`,
> `taken_persoon()`, `taken_mijn_rol()`, `taken_mijn_persoon()` en
> `taken_yoobi_naam()` zoeken allemaal in `taken_rollen` op `user_id =
> auth.uid()`.
>
> Nieuwe accounts krijgen nieuwe id's. De tabel `taken_rollen` komt uit de
> backup met de **oude** id's. Die passen dan bij niemand. Gevolg:
> `taken_rol()` geeft leeg terug voor iedereen, en dan ziet **niemand nog
> één taak**, blijft het financiele dashboard leeg en werken de sjablonen
> niet. Alles staat er wel, en niemand kan erbij.
>
> **De reparatie is zes regels SQL**, maar alleen als je weet dat het
> nodig is: werk na het aanmaken van de accounts in `taken_rollen` de
> kolom `user_id` bij met de nieuwe id's. Dat moet in de SQL-editor, want
> `taken_rollen` heeft alleen een leespolicy en is dus niet via de app te
> bewerken.

> **Over `accord-pdf`, bijgesteld op 27 juli 2026.** Hier stond dat die
> akkoorden bij een herbouw verloren zijn. Dat is te somber. De akkoorden
> van gewonnen offertes gaan naar Yoobi bij het project, die van verloren
> offertes naar Yoobi bij verkoop. Ze liggen dus buiten Supabase zodra
> Maud ze verwerkt heeft.
>
> **Het gat zit in het wachtvenster.** Tussen tekenen en verwerken zit tot
> een week, want Maud doet een halve dag. Alles wat in dat venster valt
> bestaat op één plek en is bij een ramp weg. Zie opruimlijst punt 1.

**Eerlijke schatting met wat er vandaag ligt: één tot twee dagen werk.**
Niet enkele uren.

#### Wat er nodig is om het wél in uren te doen

Het inzicht: **je herstelt niet snel door terug te zetten, je herstelt
snel door te kunnen herbouwen.** Herbouwen kan alleen als alles bestaat
als bestand dat je opnieuw kunt afspelen. Drie dingen ontbreken.

**1. Een schemadump.** ~~Dit is het grootste gat.~~ **Gedicht op 30 juli
2026.** Eén SQL-bestand dat alle tabellen, sleutels, indexen, triggers,
functies, policies en rechten opnieuw aanlegt, elke nacht opnieuw gemaakt
door `public.schema_dump()`. Wat blijft staan is de proef: het bestand is
teruggezet in een nagebouwde database, nog niet in een echt leeg
Supabase-project.

**Migrations is leeg.** Nagekeken op 27 juli 2026. Alle SQL is
rechtstreeks in de editor geplakt, dus er bestaat geen opbouwgeschiedenis
en de dump moet uit de database zelf gegenereerd worden.

**Wat er wel en niet ligt, stand 30 juli 2026.** Alles hieronder komt uit
`public.schema_dump()`, elke nacht weggeschreven naar `schema/` en elke
maandag meegestuurd als bijlage.

| Onderdeel | Ligt er | Uitvoerbaar |
|---|---|---|
| 39 tabellen | `schema_dump()` | ja |
| 54 policies op `public` | `schema_dump()` | ja |
| **17 policies op `storage.objects`** | `schema_dump()` | ja |
| 29 indexen | `schema_dump()` | ja |
| 17 databasefuncties | `schema_dump()` | ja |
| 13 triggers | `schema_dump()` | ja |
| rechten en rijbeveiliging | `schema_dump()` | ja |
| 7 opslagbakken | `schema_dump()` | ja |
| 25 verwijssleutels | `schema_dump()` | ja, onderaan als `ALTER TABLE` |
| 1 reeks (`taak_dagkeuze_id_seq`) | `schema_dump()` | ja, plus `setval` |
| 9 cronjobs | `schema_dump()` en 3.1 | ja, adres handmatig aanpassen |
| views | n.v.t., er zijn er geen | — |
| de drie kluissleutels | **nee, met opzet** | met de hand |

> **Splits altijd per schema bij het tellen van policies.** Het getal 69
> uit de inventarisatie van 27 juli is geen 69 policies op `public` maar
> 53 op `public` plus 16 op `storage.objects`. Sinds 2 augustus 2026 zijn
> het er 52 plus 16, samen 68: opruimpunt 17 haalde een dubbele weg. Sinds
> 22 augustus 2026 zijn het er 54 plus 17, samen 71, door de twee tabellen
> en de bak van de opleverapp. Op 30 juli 2026 werd een
> telling over alleen `public` bijna aangezien voor volledig, waarna de
> zestien opslagregels stilzwijgend uit het herbouwbestand waren gevallen.
> Gevolg zou zijn geweest: na een herbouw staan de zes bakken er wel, maar
> komt de app er niet in. Een totaal waar twee soorten in zitten is geen
> controle maar een dekmantel.

> **`sql/schema_tabellen.sql` blijft staan als leesdocument.** Hij is niet
> uitvoerbaar en wordt dat ook niet meer. Voor herbouw gebruik je het
> bestand uit `schema/` of de maandagbijlage, nooit dit bestand.

**Punt 15 en punt 10 zijn één bouwsteen.** Punt 15 is de query die de
structuur uitleest en omzet naar opdrachten waarmee je hem opnieuw
aanlegt. Punt 10 is diezelfde query, elke nacht. Bouw punt 15 daarom als
databasefunctie en niet als los bestand, dan is punt 10 daarna klein.

**De uitvoer wordt schoon.** Op 27 juli 2026 is met drie onafhankelijke
scans vastgesteld dat er nergens in de structuur een sleutel letterlijk
staat: niet op patroon, niet op lengte, niet op vorm. De langste
onschuldige tekstwaarde in de hele database is 45 tekens. De scans staan
in `sql/` en horen herhaald te worden voordat een uitdraai ergens heen
gaat. Zie 3.4.

**2. Een manier om de functies snel uit te rollen.** ~~Achttien keer
klikken in de browser-editor kost uren.~~ **Opgelost op 27 juli 2026.**
In `ernes-edge-functions` zit een knop die alle functies in één keer
uitrolt naar een op te geven project. Zie 2.1. Wat uren klikwerk was is nu
één handeling van een halve minuut. Let op de waarschuwing in 2.1: die
knop heeft nog nooit gedraaid.

De opdrachtregel van Supabase is daarmee **niet** nodig op de iMac. Die
draait op de servers van GitHub. Er hoeft niets geïnstalleerd te worden
en er valt niets te leren op het verkeerde moment.

**3. De bestanden echt buiten de deur.** De bak `backups` zit in hetzelfde
project dat bij ramp 3 verdwenen is. Alleen de maandagbijlage staat er
buiten, en daar zitten geen foto's of PDF's in.

#### De volgorde bij een echte herbouw

Doe het in deze volgorde. Andersom werkt niet, want elke stap heeft de
vorige nodig.

1. Nieuw Supabase-project aanmaken, regio `eu-west-1`
2. Schemadump draaien: tabellen, policies, triggers, rechten.

   > **Let op, dit werkt nog niet.** `sql/schema_tabellen.sql` is de
   > schemaweergave van Studio en zegt bovenaan zelf dat hij niet
   > bedoeld is om te draaien: de tabelvolgorde en de constraints
   > kloppen niet voor uitvoering. Vastgesteld op 27 juli 2026.
   >
   > Er is op dit moment dus **geen uitvoerbare schemadump**. Wie hier
   > komt voordat punt 15 af is, moet de 37 tabellen met de hand
   > opbouwen met dat bestand als leidraad. Reken op een dag.
   >
   > Eén ding dat je dan zeker vergeet: `taak_dagkeuze.id` gebruikt de
   > sequence `taak_dagkeuze_id_seq`. Die wordt in het bestand wel
   > gebruikt en nergens aangemaakt, dus daar breekt hij af. En na het
   > terugzetten van de data moet de teller met `setval` op de hoogste
   > bestaande id gezet worden, anders botst de eerste nieuwe regel.
   > Alle 36 andere tabellen gebruiken uuid en hebben dit niet.
3. Extensies aanzetten, waaronder pg_cron en pg_net
4. Geheimen invoeren, op **twee** plekken: bij Edge Functions onder
   Secrets, en in de kluis `vault` van Supabase zelf. In de kluis horen
   drie namen: `maandbericht_key`, `aftap_secret` en `opvolg_key`. Die
   moeten gelijk zijn aan de gelijknamige Edge Function secrets. Zie 2.4
5. Edge Functions uitrollen: ga naar `ernes-edge-functions`, tabblad
   Actions, **Functies uitrollen naar Supabase**, Run workflow. Vul bij
   het project het **nieuwe** ref in, kies bij bevestiging `JA`, laat
   "alleen deze functie" leeg en laat "toch doorgaan" op `nee`. Klaagt hij
   over het archief, lees dan wat er staat voordat je `JA` kiest. Zie 2.1
6. Cronjobs opnieuw aanmaken volgens hoofdstuk 3.1
7. Opslagbakken aanmaken, met de goede openbaar-instelling per bak
8. Data terugzetten uit de JSON
9. Bestanden terugzetten voor zover die er zijn
10. De zes inlogaccounts aanmaken
11. **In `taken_rollen` de kolom `user_id` bijwerken met de nieuwe id's.**
    Sla je dit over, dan ziet niemand één taak en lijkt alles stuk
12. **Adres en sleutels aanpassen in alle vier de HTML-bestanden**
13. Aanmelden testen, een calculatie openen, een taak afvinken

**De herbouwset staat in `sql/`**, behalve het deel met de extensies,
rechten, functies, triggers, indexen, policies, bakken en cronjobs. Dat
laatste bestand is op 27 juli tijdelijk in de openbare repo beland omdat
er een sleutel in stond, en is daarom weggehaald. Het moet opnieuw
gemaakt worden en dan in de **besloten** repo `ernes-edge-functions`. Zie
de opruimlijst.

#### Het alternatief: een tweede project dat klaarstaat

Alles hierboven is herbouwen. Er is een andere weg: een tweede Supabase-
project dat structureel gelijk is en periodiek de data meekrijgt. Gaat er
iets mis, dan pas je in vier bestanden het adres en de sleutel aan en je
draait weer. **Dat is een uur in plaats van twee dagen.**

Kosten: een tweede Nano-project, ordegrootte tien tot vijfentwintig dollar
per maand. Extra werk: het synchroon houden, en dat is een cronjob.

**Het eerlijke tegenargument:** dat tweede project hangt aan hetzelfde
account, dus het dekt ramp 3 niet. Voor ramp 2 is het uitstekend, voor
ramp 3 heb je alsnog de herbouwmap nodig.

**Advies: eerst de herbouwmap.** Die dekt alle drie de rampen en kost geen
abonnement. Een warm reserveproject is een luxe die je later kunt
overwegen als een dag stilstand te veel blijkt.

---

## 5. Releaseregels

Deze regels zijn niet vrijblijvend. Ze zijn allemaal ontstaan uit een
fout die daadwerkelijk een halve dag of meer heeft gekost.

### 5.1 Sessiestart-check

**Waarom deze bestaat:** op 20 mei 2026 bleken er drie verschillende
versies van `index.html` in omloop, omdat er in verschillende gesprekken
op verschillende uitgangspunten was doorgebouwd. Een halve dag kwijt aan
uitzoeken welke de echte was.

Voor elke wijziging, zonder uitzondering:

1. Haal de **live** versie op uit de repo, niet uit een projectbijlage en
   niet uit een oud gesprek.
2. Vergelijk de constante `APP_VERSION` met de bovenste regel van
   `CHANGELOG.md`.
3. Komen ze niet overeen, meld dat en synchroniseer eerst. Bouw niets.
4. Bouw uitsluitend verder op de live versie.

Loopt er tegelijk een ander gesprek over dezelfde app, meld dat vooraf.
Vlak voordat een nieuwe versie klaargezet wordt, wordt de live
`APP_VERSION` nog eenmaal opgehaald. Is die inmiddels veranderd, dan wordt
er opnieuw gebouwd op de nieuwe live versie en gaat het versienummer
verder omhoog.

> **Deze regel geldt ook voor dit document zelf. Toegevoegd 27 juli 2026,
> na een bijna-misser.** SYSTEEM.md was tot dat moment het enige bestand
> in de repo waarvoor geen versiecontrole gold, terwijl het het
> botsingsgevoeligste bestand van allemaal is.
>
> Dat volgt uit de onderhoudsregel bovenaan: dit document wordt in
> **elke** sessie aangeraakt, want elke wijziging aan het systeem hoort
> er meteen in. `index.html` wordt niet elke sessie aangeraakt. Twee
> gesprekken die tegelijk aan verschillende dingen werken, botsen dus
> eerder hier dan in de app.
>
> Wat er gebeurde: SYSTEEM.md werd aan het begin van de sessie opgehaald
> en uren later bewerkt. Intussen had een ander gesprek er een hele
> sessie werk in gezet, waaronder vier afgeronde opruimpunten. De
> bewerking klopte, de ondergrond niet. Bij uploaden was dat werk
> teruggedraaid en had niemand het gemerkt, want het bestand zou er
> compleet uitzien.
>
> **De regel: haal SYSTEEM.md opnieuw op vlak voordat je hem klaarzet,
> niet aan het begin van de sessie.** Vergelijk het aantal tekens met wat
> je ophaalde. Wijkt dat af, bouw de wijziging dan opnieuw op de verse
> versie. Dit kostte nu niets omdat de vraag toevallig gesteld werd.

> **Verscherpt op 2 augustus 2026: het bleef niet bij een bijna-misser,
> en het geldt voor elk bestand.** Diezelfde dag stond SYSTEEM.md live op
> 95994 tekens tegenover 92302 in de kopie van eerder in dezelfde sessie.
> Het verschil was werk van een ander gesprek op 1 augustus: een achtste
> cronjob (`yuki-vuller-avond`) en een hele dagsectie. Patchen op de oude
> kopie had dat stilzwijgend teruggedraaid.
>
> **Twee vaste momenten, voor elk bestand uit de repo:** bij sessiestart,
> en opnieuw direct voordat er een wijziging op gemaakt wordt. Altijd met
> cache-omzeiling (`?c=` plus een tijdstempel). Leg de tekens van de
> verse ophaling naast de eerdere kopie en meld het verschil voordat je
> patcht.
>
> Dit is werkpatroon en geen oplettendheid. Een regel die alleen werkt
> als iemand er toevallig aan denkt, is geen regel. Wie hem toepast, hoeft
> dat niet te melden als verdienste; het hoort er gewoon bij.

### 5.2 De vijf ankers

Bij elke uitgave van Schilders Calc moeten **vijf** plaatsen hetzelfde
versienummer dragen. Klopt er één niet, dan is de release fout.

1. De constante `APP_VERSION`
2. De welkomstkop in het dashboard
3. De openingsalinea van de introtekst
4. De bovenste regel van `RELEASE_HIGHLIGHTS`
5. De bovenste regel van `CHANGELOG.md`

### 5.3 Kwaliteitspoorten

Voor elke oplevering:

- Ontleedcontrole op de JavaScript in het bestand
- Aantal geopende en gesloten `div`-elementen vergelijken met de live
  versie, het verschil moet nul zijn
- Controle dat alle scripttags in balans zijn
- Controle dat de vijf ankers hetzelfde nummer dragen

### 5.4 Werkwijze bij bouwen

De volgorde is: eerst filosoferen over wat er moet gebeuren, dan
samenvatten, dan bevestigen, en pas dan bouwen. Niet meteen wijzigen.

Databasewijzigingen gaan altijd eerst, als los SQL-bestand, en pas als dat
gedraaid is en bevestigd wordt de code aangepast. SQL is altijd
herhaalbaar te draaien zonder schade, en eindigt met een controleregel
zodat je kunt zien dat het gelukt is.

Code voor Edge Functions bevat geen accolade-aanhalingstekens, omdat de
editor in de browser daarover struikelt.

Is een onderdeel geblokkeerd doordat er iets ontbreekt, dan wordt dat
opgeschreven en stopt het werk daar. Er wordt niet omheen gebouwd en er
wordt niet gegokt.

### 5.5 Uitrollen

Gian doet alle uitrol zelf, altijd handmatig:

- SQL: plakken in de SQL-editor van Supabase Studio
- Edge Functions: via de editor in de browser in Supabase Studio, niet via
  een opdrachtregel
- Appbestanden: via de website van GitHub, bestand erin slepen

### 5.6 De bewijsregel

**Waarom deze bestaat:** op 30 juli 2026 stelde een gesprek vast dat er
sleutels in de cronjobs stonden. Dat was onjuist. Het liep goed af omdat
het een vermoeden werd genoemd met een query erbij. Was er meteen gebouwd,
dan was er een oplossing gekomen voor een probleem dat niet bestond. Op 31
juli 2026 werd in dit dossier een looptijd van een halve seconde per
mailaanroep genoemd, twee berichten lang, zonder dat die ooit gemeten was.

Bij elk getal, elke bestandsnaam, elk regelnummer en elke bewering over
dit systeem hoort een bron. Drie soorten:

- **gemeten:** uit een bestand dat is opgehaald, of uit een query die
  gedraaid is. De vindplaats staat erbij
- **vermoeden:** het woord staat er, plus de meting die het zou beslissen
- **aanname:** die wordt zo genoemd

Aannemelijke details zonder aanleiding zijn het gevaarlijkst. Een precies
getal of een exact regelnummer dat klopt koopt vertrouwen, en dat
vertrouwen wordt daarna uitgegeven aan iets wat niet klopt.

Een vermoeden promoveert nooit tot feit door herhaling. Blijft het
ongemeten, dan blijft het label staan, ook drie berichten later, ook als
het intussen handig zou zijn dat het waar was. Wordt iets uit een eerder
bericht teruggehaald, dan gaat het label mee.

Nooit bouwen na een diagnose van een regel. Eerst meten. Bij twijfel komt
er een query en geen oplossing.

---

## 6. Wie te bellen

### Ed Mordant

Domein `ernes.nl`, de website en de e-mail. Bel hem als mail niet
aankomt, als de website eruit ligt, of als er iets met het domein moet
gebeuren. Bel hem **niet** voor de apps of de database, daar gaat hij niet
over.

Contactgegevens: **[TE CONTROLEREN]**

### Vincent Egt, Yoobi

Managing partner bij Yoobi, het hoogste aanspreekpunt. Inzetten als de
gewone ondersteuning niet doorpakt.

Eerder voorgevallen: toen alle Yoobi-koppelingen tegelijk foutmelding 500
gaven, lag dat aan een kapotte API-gebruiker aan de kant van Yoobi, niet
aan ons. Gebeurt dat opnieuw, meteen contact opnemen en niet zelf gaan
zoeken.

Contactgegevens: **[TE CONTROLEREN]**

### Supabase

Geen telefoonnummer. Ondersteuning loopt via het dashboard, en het
Pro-abonnement geeft recht op het aanmelden van een storing. Ga naar
supabase.com, meld aan, en gebruik Support onderin het menu.

Voor herstel van gegevens is geen ondersteuning nodig, dat kan zelf. Zie
hoofdstuk 4.

### Yuki en Knab

**[TE CONTROLEREN: hoort hier een aanspreekpunt bij]**

---

## Opruimlijst per 27 juli 2026

Werk dat uit de inventarisatie van 26 juli naar voren kwam en nog open
staat.

**Afgerond op 26 juli:** de broncode van alle achttien Edge Functions
staat nu in de besloten repo `ernes-edge-functions`, en het terugzetten
van een backup is één keer echt geoefend en werkte.

1. ~~**`accord-pdf` opnemen in de nachtelijke backup.**~~ **Gedaan op 30
   juli 2026**, en het bleek groter dan de titel zegt. Niet één bak zonder
   backup maar **drie**: naast `accord-pdf` hadden ook `taken-fotos` en
   `taken-documenten` er geen. Er werden er twee gespiegeld van de vijf
   bronbakken. Alle vijf staan nu in `SPIEGEL_BRONNEN` in `backup-dump` v5.
   Eerste run: 70 bestanden bijgekopieerd, achterstand 0.

   **Hoe de twee eisen uit de oorspronkelijke omschrijving zijn afgedekt.**
   - *Niet mee in de rotatie van zestig dagen.* Was al geregeld en niet
     door deze wijziging: de opruimer kijkt alleen naar `backup-*.json` in
     de hoofdmap en raakt de map `bestanden/` nooit aan
   - *Eigen ruimte binnen de limiet van honderd per nacht.* Opgelost met de
     **volgorde** in plaats van met een aparte quotaregeling.
     `accord-pdf` staat vooraan in de lijst, dus bij een drukke dag vallen
     de foto's achteraan af en nooit de akkoorden. Een foto die een nacht
     later meegaat is niet erg, een akkoord dat blijft liggen wel

   **Het wachtvenster, vastgesteld op 27 juli 2026**, is hiermee gedicht.
   Een akkoord stond in `accord-pdf` tot Maud het verwerkte, en zij doet
   een halve dag per week. Er zat dus tot een week tussen tekenen en
   veiligstellen, langer bij vakantie of ziekte. In dat venster bestond
   het akkoord op precies één plek. Nu op twee, vanaf de eerstvolgende
   nacht.

   **Komt er ooit een bak bij, dan hoort hij in `SPIEGEL_BRONNEN`**,
   anders heeft hij stilzwijgend geen backup. Blok 5 van de kwartaalaudit
   toont welke bakken er zijn; leg die lijst naast die regel in de code.
   Dat deze drie bakken zo lang zijn gemist komt doordat niemand die twee
   lijsten ooit naast elkaar had gelegd.

   De openbare stand van `accord-pdf` is een apart punt geworden: zie
   opruimpunt 19.
2. ~~**`smooth-function` hernoemen.**~~ **Gedaan op 27 juli 2026.** De
   weergavenaam is nu `fin-dashboard-sync`. De cronjobs hoefden niet mee:
   die roepen de URL aan en de adresnaam is niet gewijzigd. Zie 3.2.
3. ~~**Nog één ongebruikte Edge Function verwijderen: `taken-agenda`.**~~
   **Gedaan op 2 augustus 2026.** Gian had de agenda-abonnementen van alle
   toestellen gehaald. Invocations toonde daarna nul over een dag, en
   sterker: nul sinds de laatste uitrol, vijfentwintig dagen eerder.

   Op 27 juli 2026 waren `taken-meldingen`, `yoobi-kijkglas` en
   `yoobi-project-probe` al verwijderd, alle drie na vaststelling van nul
   aanroepen over zesentwintig dagen. De code van alle vier blijft bewaard
   in de zips in de hoofdmap en in de geschiedenis van de repo.

   **Vier stappen, in deze volgorde:**
   1. Functie verwijderen in Supabase Studio
   2. Map `supabase/functions/<naam>` verwijderen in `ernes-edge-functions`.
      Kan in één keer via het menu rechtsboven, "Delete directory"
   3. Pas dán de bijbehorende tabel opruimen. Voor deze:
      `sql/taken_melding_sleutels_opruimen.sql`, gedraaid en teruggelezen
      met `bestaat_nog = false`
   4. De uitzondering uit `sql/audit_query_periodiek.sql` halen

   De tabel `taken_melding_sleutels` is weg. Hij hoorde bij
   `taken-meldingen` én `taken-agenda`; dat laatste bleek uit de broncode,
   die hem las om de sleutel uit de aanroep te controleren. Gemeten voor
   het verwijderen: nul treffers op die tabelnaam in `index.html`,
   `taken.html`, `financieel.html` en `voorraad-app_2.html`. Er stonden
   vijf sleutels in, één per persoon.
4. ~~**`index.html` toevoegen aan de voorraad-repo**, zodat het korte adres
   werkt en de app vindbaar blijft zonder de exacte bestandsnaam.~~
   **Gedaan op 2 augustus 2026.** Een doorstuurpagina van drie regels, geen
   tweede exemplaar van de app. `gianernes.github.io/voorraad-app/` stuurt
   nu door naar `voorraad-app_2.html`. Bestaande bladwijzers blijven werken.

   Drie wegen naar de app zodat het niet van één ding afhangt: een
   meta-refresh die ook zonder JavaScript werkt, een `location.replace()`
   in het script, en een zichtbare knop als beide falen. `replace()` en
   niet `href`, anders komt de terugknop in een lus.

   **De bestandsnaam staat op drie plekken in dat bestand.** Komt er ooit
   een `voorraad-app_3.html`, dan moeten ze alle drie mee. Een
   doorstuurpagina die naar een verdwenen bestand wijst is erger dan geen:
   dan lijkt het stuk in plaats van afwezig. Die waarschuwing staat als
   kader in het bestand zelf, want daar leest iemand hem wel.
5. **Systeemstatus-scherm bouwen.** Een pagina die per achtergrondtaak
   toont wanneer die voor het laatst goed gelopen is. Geen geschreven
   pagina kan vertellen of de backup vannacht gedraaid heeft, een scherm
   wel.
6. ~~**`taken-mail-melding` van de klok halen.**~~ **Gesloten op 3
   augustus 2026 na meting. De afronding staat onderaan dit punt; de
   redenering hieronder is bewaard omdat hij twee keer van kant
   gewisseld is.** Die draait nu elke twee minuten, ruim 700 keer per
   dag.

   **Op 27 juli 2026 wisselde dit punt van kant.** Het stond hier als
   *minder vaak laten draaien*, maar dat maakt het erger. Het echte
   bezwaar is namelijk niet de logboeken maar dat de gebruiker de
   vertraging moet compenseren: zet je om 16:14 een taak en gaan Jens en
   Bjorn om 16:15 naar huis, dan haalt de mail het niet. Je moet dus
   terugrekenen en vroeger noteren dan je bedoelt, en dat werkt tot de dag
   dat je haast hebt.

   Vandaar de omgekeerde richting: een trigger op de tabel `taken` die de
   functie aanroept op het moment dat er iets wordt opgeslagen. Dan is de
   melding onderweg voordat je je telefoon weglegt.

   Daarbij hoort een vangnet, want **polling is zelfherstellend en een
   trigger niet.** Faalt de functie nu een keer, dan probeert hij het twee
   minuten later opnieuw. Bij een trigger is die melding weg. Dus: de klok
   blijft draaien, maar om het halfuur, om op te pakken wat de trigger
   gemist heeft.

   Lost drie dingen tegelijk op: de vertraging bij het noteren, de
   volgelopen logboeken, en de Invocations-lijst die door 700 aanroepen
   per dag onbruikbaar is als diagnosemiddel. Dat laatste is geen detail,
   want op dat scherm hebben we op 27 juli drie keer moeten vertrouwen om
   te bewijzen dat een functie werkte.

   Eerst de code van `taken-mail-melding` lezen voor er iets gebouwd wordt.

   **Stand 2 augustus 2026: de constructie is beproefd.** Voor de
   afvinkmelding is `trg_taak_melding_signaal` gebouwd, een trigger op
   `taken` die via `net.http_post` een Edge Function aanroept met de
   sleutel uit de kluis. Dat is exact het patroon dat dit punt nodig
   heeft, en het draait nu op iets kleins: een paar meldingen per week in
   plaats van de hele dagelijkse werking. Gaat er iets mis, dan merk je
   het zonder dat de mailbox volloopt. Wie dit punt oppakt kan die
   triggerfunctie als voorbeeld nemen in plaats van vanaf nul te
   beginnen. Het vangnet blijft wel nodig: bij de afvinkmelding is er met
   opzet geen, omdat de tekst dan bij de taak blijft staan en er dus
   niets verloren gaat, maar een gemiste taakmelding is wél weg.

   **Gesloten op 3 augustus 2026. Het probleem bestaat niet.** Gemeten
   over alle 120 piep-taken in de tabel:

   | piep-tijd staat | aantal |
   |---|---|
   | direct bij opslaan | 6 |
   | binnen het uur | 1 |
   | binnen een dag | 55 |
   | binnen een week | 17 |
   | verder weg | 41 |

   Vijf procent piept direct. Alleen die zes zou een trigger sneller
   maken. De cron van `*/30` zou de overige 114 tot achtentwintig
   minuten trager maken. Dat is de omgekeerde ruil van wat hierboven
   staat.

   **De gemeten vertraging nu is 1 tot 6 seconden** na het gekozen
   tijdstip, over zestien echte meldingen. De twee uitschieters van 62
   seconden hadden een `piep_op` op een oneven minuut terwijl de cron op
   even minuten draait. Dat is ontwerp en geen storing.

   Gians maatstaf, in zijn eigen woorden op 3 augustus: er moet een
   melding komen op of nabij het tijdstip dat hij gekozen heeft, de rest
   is ballast. Dat gebeurt al.

   > **Het voorbehoud hoort erbij.** Die vijf procent kan onderdrukte
   > vraag zijn: misschien zet Gian zelden een taak die meteen moet
   > piepen juist omdát het nu traag voelt, en verzet hij hem uit
   > gewoonte naar een rond tijdstip. Dat is uit deze data niet uit te
   > sluiten. Komt het gevoel terug dat een melding te laat is, meet dan
   > opnieuw en kijk of die zes gegroeid zijn.

   **Wat er in plaats hiervan kán, als het logboek ooit stoort.** De
   echte klacht was dat de Invocations-lijst onbruikbaar is als
   diagnosemiddel. Laat de rapportregel alleen wegschrijven als er iets
   gebeurd is. Dat raakt de klok niet. Valkuil: stuur daarbij op
   `verstuurd`, `mislukt` of `onbekende_persoon` en **niet** op
   `gevonden`, want die teller staat permanent boven nul (zie 3
   augustus, de taken van Maud).
7. ~~**`sql/audit_query_periodiek.sql` samenvoegen tot één resultaat.**~~
   **Gedaan op 27 juli 2026.** Alles komt nu in één resultaat, in drie
   blokken met de rode vlaggen bovenaan. `sync_state` en
   `taken_melding_sleutels` staan apart als bewuste uitzondering, zodat ze
   niet elke keer als vlag opkomen en niemand ze per ongeluk repareert.
   Er is een regel *geen rode vlaggen gevonden* toegevoegd, want een leeg
   resultaat lijkt te veel op een query die niet gelopen heeft. De README
   in `sql/` is meegewijzigd. **Eerste schone controle: 27 juli 2026, 37
   tabellen, geen enkele vlag.**
8. ~~**`sql/template_nieuwe_tabel.sql` alsnog maken.**~~ **Gedaan op 27
   juli 2026.** Het sjabloon maakt de tabel, zet rijbeveiliging aan, legt
   de policy en de rechten aan, trekt de rechten voor anon in, hangt de
   trigger `set_updated_at` eronder en sluit af met vijf controleregels
   die op GOED horen te staan.

   > **Bij het bouwen ging het bijna mis en dat is het onthouden waard.**
   > De eerste versie maakte `set_updated_at` opnieuw aan **zonder** de
   > regel `set search_path = public, pg_temp`. Die is er op 26 mei 2026
   > bij gekomen in v3.9.5, zie `sql/02_fix_set_updated_at.sql`. Het is
   > één gedeelde functie, dus wie dat sjabloon had gedraaid, had die
   > beveiliging voor **alle** tabellen tegelijk teruggedraaid, stilletjes.
   > Gevonden doordat dat oude bestand toevallig in beeld kwam.
   >
   > Daarom staat er nu een vijfde controleregel in die kijkt of die
   > beveiliging er nog op zit. Die vangt niet alleen deze fout maar elke
   > toekomstige keer dat iemand die functie opnieuw aanmaakt.
9. **De maandagbijlage vervangen door iets dat blijft werken.**
   **Opnieuw gemeten op 2 augustus 2026: dit speelt niet dit jaar en de
   oude schatting zat er een factor acht naast.**

   Hier stond dat het bestand met 0,13 MB per dag groeit en begin
   december tegen de grens loopt. Die 0,13 was correct gemeten, maar over
   vijf dagen (17 t/m 21 juli). Over de laatste zeven dagen is het
   **0,018 MB per dag**.

   | periode | groei per dag |
   |---|---|
   | 17 t/m 23 juli | 0,05 tot 0,86, schokkerig |
   | 24 juli t/m 2 augustus | 0,00 tot 0,05 |
   | laatste drie dagen | vrijwel nul |

   Op 22 juli sprong het 0,86 omhoog en op 24 juli **0,35 omlaag**. Een
   backup die krimpt betekent dat er iets uit de database verdwenen is.
   Dat was de Yoobi-sync die zijn opruimregel draaide, dezelfde die op 2
   augustus als lek werd ontdekt (zie opruimpunt 19 en de dagsectie).

   > **De les zit niet in het getal maar in de vorm.** Deze reeks groeit
   > niet gelijkmatig maar met sprongen die horen bij wat er in het bedrijf
   > gebeurt. Vijf dagen meten en doortrekken geeft een voorspelling die er
   > compleet naast zit, in welke richting dan ook. Meet opnieuw voordat je
   > hierop bouwt.

   **De grenzen, opgezocht op 2 augustus 2026.** Resend staat 40 MB per
   mail toe, inclusief bijlagen ná Base64-codering. Die codering maakt een
   bestand ongeveer een derde groter, dus 40 MB gecodeerd is een echt
   bestand van ongeveer 30 MB. Maar de ontvangende mailbox is de kleinste
   schakel, niet Resend: gangbare grenzen liggen op 20 tot 25 MB
   gecodeerd.

   Het bestand is nu 8,44 MB, oftewel ongeveer 11,2 MB gecodeerd. Bij de
   huidige groei:

   | grens (gecodeerd) | echt bestand | bereikt over |
   |---|---|---|
   | 20 MB (strengste gangbare) | 15,0 MB | ongeveer 1 jaar |
   | 25 MB (ruimste gangbare) | 18,8 MB | ongeveer 1,6 jaar |
   | 40 MB (Resend zelf) | 30,1 MB | ongeveer 3,3 jaar |

   **[TE CONTROLEREN] Welke mailprovider draait achter `info@ernes.nl`?**
   Dat bepaalt welke van de drie regels geldt. Vraag het aan Ed Mordant.
   Zonder dat antwoord is de veilige aanname een jaar.

   **Wat er niet verandert.** Loopt hij ooit tegen de grens, dan stopt de
   enige kopie buiten Supabase zonder dat iemand het merkt. Dat blijft de
   reden dat dit punt bestaat. Alternatief: comprimeren, of wegschrijven
   naar een plek buiten Supabase in plaats van meesturen. Zie 4.7.
10. ~~**Een schemadump toevoegen aan de nachtelijke backup.**~~
    **Gedaan op 30 juli 2026.** `backup-dump` v4 roept `public.schema_dump()`
    aan en schrijft de uitvoer weg als `schema/schema-JJJJ-MM-DD.sql` in de
    bak `backups`. Eén bestand per dag, dertig dagen bewaren. De dump gaat
    ook als **tweede bijlage** mee met de maandagmail, want de bak zelf zit
    in hetzelfde project dat bij ramp 3 verdwijnt. Mislukt de schemadump,
    dan gaat er direct een mail uit, ook buiten maandag, en loopt de
    gegevensbackup gewoon door. Zie 4.7 en 4.8.
11. **Nakijken of Database, Migrations gevuld is.** ~~Staat daar de
    opbouwgeschiedenis~~ **Gedaan op 27 juli: leeg.** Alle SQL is
    rechtstreeks in de editor geplakt, dus er is geen opbouwgeschiedenis.
    De schemadump moet daarom uit de database zelf gegenereerd worden.
    `sql/schema_tabellen.sql` bevat inmiddels alle 37 tabellen.
12. **Uitzoeken of de rollen aan de interne id's hangen.** **Gedaan op 27
    juli: ja, dat is zo.** Opgenomen als stap 11 van de herbouwvolgorde in
    4.8. Geen verder werk nodig, wel weten.
13. ~~**De opdrachtregel van Supabase inrichten voor het uitrollen van
    Edge Functions.**~~ **Gedaan op 27 juli 2026, maar anders dan bedacht.**
    Niet met de opdrachtregel op de iMac, maar met twee knoppen in
    `ernes-edge-functions` die op de servers van GitHub draaien. Geen
    installatie, geen Docker, geen Terminal. Zie 2.1.
14. ~~**De drie cronjobs de sleutel uit de kluis laten halen.**~~
    **Gedaan op 27 juli 2026.** Het waren er vier, niet drie: ook
    `offerte-opvolging-werkdagen` droeg een sleutel letterlijk. Alle zeven
    cronjobs halen hun sleutel nu uit `vault`. Geen enkele opdrachttekst
    bevat nog een geheim, dus een uitdraai van `cron.job` is voortaan
    vanzelf schoon. Zie 2.4.
15. ~~**De schemadump maken.**~~ **Gedaan op 30 juli 2026.** Gebouwd als
    `public.schema_dump()`, in twee brokken plus een naderhand gevonden
    derde. Bewezen door de uitvoer in een tweede lege database terug te
    zetten en daarna de catalogus van allebei regel voor regel te
    vergelijken: kolommen, types, standaardwaarden, beperkingen, indexen,
    policies, rechten, reeksen, triggers en bakken alle gelijk. Op de
    echte database daarna geteld: 37 tabellen, 69 policies, 25
    verwijssleutels en 7 cronjobs, alle vier gelijk aan wat erin zit.
    **Nog niet gedaan: de terugzettest in een echt leeg Supabase-project.**
    Zolang die niet gedraaid is, is 4.8 stap 2 bewezen op een nabootsing
    en niet op het echte werk.

    *Oorspronkelijke omschrijving.* Was bedoeld als aanvulling op
    `sql/schema_tabellen.sql`. Op 27 juli 2026 bleek dat bestand niet
    uitvoerbaar, dus het is geen aanvulling maar het geheel: tabellen,
    extensies, rechten, rijbeveiliging, functies, triggers, indexen,
    policies, bakken en cronjobs. Bouwen als databasefunctie
    `public.schema_dump()`, want dan is punt 10 daarna klein.
    **Reken op twee sessies, niet op een uur.**

    *Stap 0 is gedaan op 27 juli 2026.* Drie scans, drie keer schoon: er
    staat nergens een sleutel letterlijk in de structuur. De uitvoer kan
    dus veilig gemaakt worden. De scans zelf staan in `sql/` en blijven
    de poort voor elke uitdraai.

    Vier eisen aan de bouw, alle vier uit het scanwerk:
    - **Vaste sortering.** Anders lijkt elke nacht alles veranderd en is
      de wijzigingsmelder ruis
    - **Verwijssleutels helemaal onderaan** als losse `ALTER TABLE`. Dan
      doet de tabelvolgorde er niet toe en vervalt een hele klasse fouten
    - **De functie niet voor iedereen aanroepbaar.** Een functie in
      `public` staat standaard open, en de publieke sleutel van de apps
      staat openbaar in de repo
    - **Het bestand draagt zijn eigen waarschuwingen**: de lege kluis, de
      `user_id` in `taken_rollen`, de `setval` op `taak_dagkeuze_id_seq`
      en de zeven cronjobs met het projectadres erin. Om twee uur 's
      nachts leest niemand dit document, men draait het bestand

    **Vijfde eis, erbij gekomen op 30 juli 2026 na een bijna-misser.** Het
    herbouwbestand begint met een leegtecontrole die afbreekt zodra schema
    `public` al tabellen bevat. Aanleiding: een uitdraai uit een
    testdatabase werd per ongeluk in de SQL Editor van de echte database
    geplakt. Er is niets gebeurd, want de editor draait zo'n plak als één
    transactie die bij de eerste fout helemaal terugdraait, maar had hij
    doorgelopen dan had `cron.schedule` de nachtelijke backup en de
    taakmeldingen overschreven met opdrachten naar een verkeerd adres.
    Vertrouw niet op die terugdraai, vertrouw op de controle.

    **De scan zit in de functie, niet ernaast.** `schema_dump()` kijkt naar
    zijn eigen uitvoer voordat hij die teruggeeft en weigert alles zodra er
    iets in staat dat op een sleutel lijkt. Daarmee is de scan een poort en
    niet iets waar iemand aan moet denken.

    **De reeks is geen open punt meer.** De dump haalt reeksen niet uit de
    catalogus maar uit de standaardwaarden van de kolommen. Daardoor komt
    `taak_dagkeuze_id_seq` er hoe dan ook in, ook al staat hij in geen
    enkel opbouwscript, en staat de bijbehorende `setval` uitgecommentarieerd
    onderaan het bestand klaar.
16. ~~**De namen van de oude policies opschonen.**~~ **Gedaan op 2 augustus
    2026.** Het waren er vijftien, niet "een stuk of tien". Alle vijftien
    heetten `anon alles <tabel>` terwijl ze `ALL TO authenticated` zijn,
    een overblijfsel van vóór 13 mei 2026. Ze heten nu `ingelogd alles
    <tabel>`. Die vorm was niet verzonnen: `offerte_accorderingen` had al
    `ingelogd alles offerte_accorderingen`. Alleen de naam veranderde,
    niet het commando, de rol of de voorwaarde. Zie `sql/policies_opschonen.sql`.
17. ~~**Dubbele policy op `offerte_controle_log` opruimen.**~~ **Gedaan op
    2 augustus 2026.** De twee waren op elk meetbaar punt gelijk: SELECT,
    `TO authenticated`, permissive, voorwaarde `true`. `offerte_controle_log_select`
    is gebleven, de zin in gewone taal is weg.

    **De beschrijving hierboven klopte niet helemaal.** `app_help_log`
    werd genoemd als tweede geval, maar die twee policies zijn een INSERT
    en een SELECT en dus geen duplicaat. De audit telde aantallen en er is
    een conclusie aan gehangen die er niet in zat. Een tabel met twee
    policies is normaal zodra er twee verschillende commando's op staan.
18. ~~**Automatische taken rond offerte en akkoord.**~~ **Gedaan op 2
    augustus 2026.** Twee taken die vanzelf ontstaan, beide voor Maud,
    beide gepland op de eerstvolgende maandag 13:30 net als de bestaande
    nabeltaak. Maud verwerkt op maandagmiddag, dus het moment van ontstaan
    doet er niet toe.

    | `bron_kenmerk` | ontstaat bij | onderwerp |
    |---|---|---|
    | `yoobi-verkoop` | status naar `verzonden` | Stukken in Yoobi bij verkoop zetten |
    | `yoobi-akkoord` | status naar `geaccepteerd` | Getekende offerte in Yoobi zetten |

    Doel is **vindbaarheid**, niet bewaring. Een PDF in een backupbak is
    iets dat je terug kunt halen als je weet dat je het kwijt bent. Iets
    in Yoobi is een archief waar je in kunt zoeken als een klant er over
    twee jaar over belt. Gian voegde daaraan toe: daarmee is Yoobi ook een
    tweede plek waar de gegevens staan.

    **Het ruis-argument uit de oude tekst was onjuist.** Daar stond dat de
    eerste taak ruis wordt bij meer dan een paar offertes per week.
    Weerlegd door Gian op 2 augustus: bij deze taak moet Maud werk
    verrichten dat anders niet gebeurt, en die stukken komen niet vanzelf
    in Yoobi. Vier per week is dan gewoon vier keer werk. Het ruis-argument
    telt bij een taak die alleen bevestigt dat er iets gebeurd is, niet bij
    een taak die werk aanstuurt.

    **Drie ontwerpbesluiten, alle drie in de kop van
    `sql/offerte_taken_sync_yoobi.sql`:**
    1. `ON CONFLICT DO NOTHING` in plaats van `DO UPDATE`. Opnieuw
       versturen van dezelfde offerte levert geen nieuw werk op. Bij
       `nabellen` is dat andersom en met opzet: opnieuw versturen is een
       reden om opnieuw te bellen, niet om dezelfde stukken nog een keer
       klaar te zetten
    2. Deze twee vervallen nooit bij een statuswisseling. Ook een verloren
       offerte hoort in het archief
    3. Bij het verwijderen van de calculatie vervallen ze wel, via het
       bestaande DELETE-blok. Is de calculatie weg, dan zijn de stukken er
       ook niet meer

    **Hoe het bewezen is.** Een testcalculatie doorlopen: verzonden gaf
    twee taken voor Maud, geaccepteerd liet `nabellen` vervallen en gaf de
    derde. Voor het `DO NOTHING`-gedrag was het scherm géén bewijs: alle
    drie de taken stonden op dezelfde dag gepland, dus `DO UPDATE` had er
    identiek uitgezien. Beslist op de kolom `bijgewerkt`, die door de
    trigger `zet_bijgewerkt` bij elke UPDATE wordt gezet:

    | kenmerk | aangemaakt | bijgewerkt | aangeraakt |
    |---|---|---|---|
    | `nabellen` | 14:41:03 | 14:44:01 | ja, heropend |
    | `yoobi-verkoop` | 14:41:03 | 14:41:03 | nee |
    | `yoobi-akkoord` | 14:42:23 | 14:42:23 | nee |

    Op de microseconde gelijk, terwijl blok C er in die drie minuten twee
    keer overheen ging.

    **Niet met terugwerkende kracht.** Alleen nieuwe gevallen. De 31
    bestaande accorderingen krijgen niets; dat zou 31 taken ineens op
    Maud's maandag opleveren.

19. ~~**De accord-pdf's achter een verlopende link zetten.**~~ **Gedaan op
    2 augustus 2026.** De bak `accord-pdf` staat niet meer openbaar.
    `offerte-accord` v4.40.0 maakt bij elke opening een ondertekende link
    van zestig minuten. Zie de dagsectie van 2 augustus voor het verloop.

    **De uitzondering in `sql/audit_query_periodiek.sql` mag weg.** Die
    stond er om te voorkomen dat de vlag elk kwartaal onterecht afging op
    een openbare bak. Er is nu geen openbare bak meer, dus als de audit
    er ooit weer een meldt, is dat echt nieuws. Nog niet uitgevoerd, dit
    is het eerstvolgende kleine karweitje.

    **De 28 uit de oorspronkelijke tekst was fout.** Dat was het aantal
    rijen met een `pdf_path`, niet het aantal bestanden. In de bak stonden
    er 66. Het verschil van 38 zijn wezen: bestanden waar geen rij meer
    naar wijst. Zie de dagsectie van 2 augustus.
20. **Zes policies staan op rol `public` in plaats van `authenticated`.**
    Gevonden op 2 augustus 2026 bij het opschonen van punt 16. In Postgres
    betekent `public` alle rollen, dus ook `anon`. De audit ziet dit niet:
    die kijkt naar rechten (grants) en niet naar de rol in de policy zelf.

    Het gaat om `onderhoudsplan_beurten` (`eigen beurten alles`),
    `onderhoudsplannen` (`eigen plannen alles`) en alle vier op
    `taak_sjablonen`.

    **Bekeken op 2 augustus 2026, bewust niets aan gedaan.** Dit punt is
    afgesloten. Het staat hier zodat niemand het over drie maanden opnieuw
    uitzoekt.

    **Twee sloten, allebei dicht.** Het eerste: `anon` en `public` hebben
    nul rechten op tabelniveau in `public`. Het tweede: geen van de zes
    heeft voorwaarde `true`. De twee onderhoudsplan-tabellen gebruiken
    `user_id = auth.uid()`, de vier op `taak_sjablonen` gebruiken
    `taken_rol()`. Die functie is wel `SECURITY DEFINER`, maar zoekt op
    `user_id = auth.uid()` en geeft dus leeg terug zonder inlog.

    Een niet-ingelogde komt er dus niet in, ook niet als die grants ooit
    per ongeluk opengaan.

    **Wat mijn eerste redenering fout maakte.** Er stond hier eerst dat
    deze zes bereikbaar zouden worden bij een fout in de grants. Dat klopt
    niet: de voorwaarde houdt ze hoe dan ook tegen. De redenering was
    gebouwd op de rol in de policy zonder de voorwaarde erbij te lezen.

21. ~~**`taak-melding-mail` en `taken-mail-melding` uit elkaar halen.**~~
    **Gedaan op 3 augustus 2026.** De afronding staat onderaan dit punt;
    de redenering hieronder is bewaard omdat het punt onderweg van omvang
    veranderd is.
    Twee Edge Functions met dezelfde drie woorden in een andere volgorde,
    die in de lijst ook nog pal onder elkaar staan. Ze doen iets
    verschillends: de een gaat af op een verstreken piep-tijd en mailt de
    toegewezen persoon, de ander gaat af bij het afvinken en mailt Gian.

    Het gevaar zit hem er juist in dat ze verwant klinken. Bij twee
    functies die niets met elkaar te maken hebben valt een verwisseling
    meteen op. Hier ziet iemand die de verkeerde openslaat een functie die
    mail verstuurt over taken, en denkt dat hij goed zit.

    Betere namen verwijzen naar de aanleiding en niet naar het onderwerp,
    bijvoorbeeld `taak-piep-mail` en `taak-afvinkmelding`. Hernoemen kan
    niet: je maakt een nieuwe functie en verwijdert de oude. Bij de eerste
    moet de cronjob mee, bij de tweede de triggerfunctie
    `taak_melding_signaal`, en dit bestand op vier plekken.

    **Het beste moment is samen met punt 6**, want dan gaat
    `taken-mail-melding` toch op de schop. Vastgelegd 2 augustus 2026,
    dezelfde dag dat de tweede functie gemaakt werd, omdat de naam toen al
    niet deugde.

    **Bijgesteld op 3 augustus 2026: dat moment komt niet, want punt 6 is
    gesloten.** Punt 21 staat dus alleen. Besluit van Gian: hernoem er
    één en niet allebei. De verwarring komt niet van de namen op zichzelf
    maar van de gelijkenis, dus één naam wijzigen is genoeg.

    Het wordt `taak-melding-mail` naar `taak-afvinkmelding`.
    `taken-mail-melding` houdt zijn naam, want die staat op de meeste
    plekken genoemd. Daarmee blijft de cronjob ongemoeid, hoeft alleen de
    triggerfunctie `taak_melding_signaal` mee, en beperkt het risico zich
    tot de afvinkmelding van een paar keer per week in plaats van tot de
    dagelijkse werking.

    **Uitgevoerd op 3 augustus 2026.** De volgorde was: nieuwe Edge
    Function `taak-afvinkmelding` aanmaken met dezelfde code en Verify JWT
    uit, die los aanroepen vanuit de SQL-editor met `net.http_post`
    terwijl de trigger nog naar de oude wees, pas daarna
    `taak_melding_signaal` omzetten, dan een echte afvinktest, en pas
    daarna de oude functie verwijderen. Die volgorde is bewust: zo test je
    één wijziging tegelijk en blijft de terugweg tot het laatst open. De
    SQL staat in `sql/taak_afvinkmelding_omzetten.sql`.

    Gemeten die dag: de losse testaanroep gaf status 200 met
    `{"verstuurd":1}`, en de afvinktest was om 13:17 afgevinkt met de mail
    om 13:17 binnen. In de besloten repo stond geen map
    `supabase/functions/taak-melding-mail/`, want de wekelijkse
    ophaalactie van 2 augustus draaide voordat die functie bestond. Daar
    viel dus niets te verwijderen.

    Wat overblijft is dat `TO public` misleidend leest en dat iemand het
    patroon zou kunnen kopiëren zonder de voorwaarde. Besluit van Gian:
    geneuzel, niet aan beginnen.

22. **Het archief in `ernes-edge-functions` klopt niet meer met Supabase.**
    Vastgelegd 3 augustus 2026, gevonden bij het afronden van punt 21.
    Het loopt twee kanten op tegelijk.

    **Het mist wat er wel draait.** De map
    `supabase/functions/taak-melding-mail/` heeft nooit bestaan: de
    ophaalknop draaide op 2 augustus voordat die functie gemaakt werd, en
    daarna is er geen ophaalactie meer geweest. Voor `taak-afvinkmelding`
    geldt hetzelfde tot de eerstvolgende zondag. Een functie die op maandag
    gemaakt wordt en op dinsdag stukgaat, staat die hele week nergens.

    **Het bewaart wat er niet meer is.** In de hoofdmap staan zips van
    `taken-agenda`, `taken-meldingen`, `yoobi-kijkglas` en
    `yoobi-project-probe`, alle vier verwijderd uit Supabase. Ze dragen de
    datum 26-07-2026 en zien er dus even geldig uit als de rest.

    **Waarom dat erger is dan het lijkt.** De uitrolknop rolt uit wat er in
    de repo staat. Wie na een ramp op die knop drukt krijgt het systeem
    terug zoals het bij de laatste ophaalactie was, met de dode functies
    erbij en zonder de nieuwste. Niemand die dan aan het herstellen is gaat
    eerst de lijst nalopen.

    **Gemeten op 3 augustus 2026.** Het overzicht telde veertien functies,
    de mappenlijst vijftien. Het verschil is precies `taken-agenda`. De
    download werkt dus goed en het archief loopt niet leeg; het gat is
    alleen het venster van zeven dagen plus mappen die blijven staan.

    **Half gebouwd op 3 augustus 2026.** Allebei de knoppen leggen nu de
    mappen naast het overzicht. De ophaalknop loopt rood als ze uiteenlopen
    en de uitrolknop weigert dan uit te rollen. Zie 2.1. Daarmee is
    "meten in plaats van onthouden" er, en wordt een scheef archief
    zichtbaar op de zondag erna in plaats van bij een ramp.

    **Wat er nog open staat.** Het venster van zeven dagen zelf. Een
    functie die op maandag gemaakt wordt en op dinsdag stukgaat, staat die
    hele week nergens. De ophaalknop vaker laten draaien is een oplossing
    zonder meting: eerst weten hoe vaak Edge Functions werkelijk wijzigen.
    Uit de wijzigingsdatums van 2 augustus blijkt dat de meeste functies
    weken tot maanden onaangeraakt blijven en dat er af en toe een dag is
    waarop er twee wijzigen.
---

## Wat er nog niet in staat

- **De zestien plekken met [TE CONTROLEREN]**, geteld op 9 augustus
  2026. Vooral de kluis, het adres van de gedeelde mailbox, wie welke
  rol heeft, en de contactgegevens van Ed en Vincent.
- **Een test van de eigen nachtelijke dump.** Zie 4.7. Dit is de
  belangrijkste openstaande vraag van het hele document.
- **De A4-noodkaart.** Eén vel om naast de iMac te hangen, met alleen de
  eerste handelingen uit 4.0 en de telefoonnummers uit hoofdstuk 6.
- **Gevelscanner.** Bewust buiten beschouwing gelaten op 26 juli 2026.
- **Versdatum van de bankboekingen in financieel.html.** Yuki toont per
  bankrekening een laatste transactiedatum. Stond die in de app, dan is
  een verschil met de bankapp meteen verklaard in plaats van een raadsel.
  De twee SOAP-aanroepen die de vuller nu doet leveren dat veld niet.
  Uitzoeken of de Yuki-API er een ingang voor heeft, en het niet bouwen
  zolang dat niet zeker is.
- **Rekening 13691, vooruitbetalingen onderhoudsplan.** Stond op 28 juli
  2026 op 7.175,16 credit. Dat is geld dat klanten vooruit betaald hebben
  en dat nog omgezet moet worden in werk. Het zit nergens in het
  werkkapitaal, dus dat cijfer staat met dat bedrag te gunstig. Geen
  haast, wel een gat.

---

## Wat er op 26 juli 2026 gedaan is

Voor wie later wil weten waar dit document vandaan komt.

- Volledige uitdraai van beide Supabase-projecten: cronjobs, triggers,
  opslagbakken, tabellen met exacte rijaantallen
- Alle achttien Edge Functions nagelopen op wie ze aanroept, via de
  broncode van de apps en via de aanroeplogboeken
- Alle achttien Edge Functions veiliggesteld in de besloten repo
  `ernes-edge-functions`, met leeswijzer
- Een herstel uit backup daadwerkelijk uitgevoerd op een apart
  testproject, geverifieerd op rijaantallen, en daarna opgeruimd

Vier dingen kwamen daarbij aan het licht die niemand wist: dat
`smooth-function` doorgaat voor een test terwijl hij het dashboard vult,
dat de getekende akkoorden geen enkele backup hebben, dat `taken-agenda`
nog tientallen keren per dag werd aangeroepen terwijl hij als verlaten
gold, en dat Edge Functions buiten elke backup vallen.

---

## Wat er op 27 juli 2026 gedaan is

- De schemadump gemaakt. `sql/schema_tabellen.sql` bevat nu alle 37
  tabellen. De aanvulling moet nog opnieuw, zie opruimlijst punt 15
- Vastgesteld dat Migrations leeg is, dus dat er geen opbouwgeschiedenis
  van de database bestaat
- Vastgesteld dat de rollen aan de interne id's van de inlogaccounts
  hangen, en wat dat betekent bij een herbouw
- Hoofdstuk 4.8 geschreven, herbouwen vanaf nul
- De AFTAP-sleutel vervangen nadat die in een uitdraai in de openbare repo
  terecht was gekomen. Zie 2.4
- Bevestigd dat `offerte-opvolging-werkdagen` draait. Eerste run 27 juli
  06:30 UTC
- Vastgesteld dat cron "succeeded" meldt ook als de functie het verzoek
  weigert. Zie 3.4

**De belangrijkste les van die dag:** een groene melding is geen bewijs
dat het werk gedaan is, en een uitdraai van de database kan geheimen
bevatten. Allebei staan ze nu opgeschreven op de plek waar iemand ze
zoekt.

Later diezelfde dag, in een tweede sessie:

- Opruimlijst punt 14 afgemaakt. Alle zeven cronjobs halen hun sleutel nu
  uit de kluis. `AFTAP_SECRET` en `OPVOLG_KEY` zijn daarbij opnieuw
  vervangen, want Supabase toont bestaande waarden niet meer
- Ontdekt dat het er vier waren en niet drie. `offerte-opvolging-werkdagen`
  stond niet op de lijst omdat er op het woord `secret` gezocht was en die
  sleutel `key` heet
- Bewezen met een echte aanroep dat `taken-mail-melding`, `backup-dump` en
  `fin-werkvoorraad-sync` de nieuwe sleutel accepteren
- Twee nieuwe valse signalen bij de nachtelijke backup gevonden: de
  timeout van vijf seconden die er altijd is, en `created_at` dat bij een
  overschreven bestand niet meeschuift. Zie 3.4
- Opruimlijst punt 13 afgemaakt, langs een andere weg dan bedacht. Twee
  knoppen in `ernes-edge-functions` in plaats van de opdrachtregel op de
  iMac. Zie 2.1
- De achttien functies staan nu per stuk in een eigen map in die repo, in
  plaats van achttien zips die allemaal naar `source` uitpakken. Dat was
  handwerk dat hoe dan ook moest gebeuren en de ophaalknop deed het in
  eenentwintig seconden
- Punt 7 afgemaakt: de auditquery geeft alles in één resultaat en de
  README is mee. Eerste schone controle gedraaid, 37 tabellen, geen vlag
- Punt 8 afgemaakt: `sql/template_nieuwe_tabel.sql` bestaat nu, met vijf
  controleregels. Zie de noot bij punt 8, daar ging het bijna mis
- Punt 2 afgemaakt: `yuki-test` heet nu `fin-dashboard-sync`. De cronjobs
  hoefden niet mee, die roepen de adresnaam aan en die is niet gewijzigd
- Punt 3 grotendeels afgemaakt: drie functies verwijderd na vaststelling
  van nul aanroepen over zesentwintig dagen, in Supabase én in de repo.
  `taken-agenda` blijft staan tot het agenda-abonnement van de telefoons is
- Punt 1 en punt 6 zijn niet gebouwd maar wel van kant gewisseld. Bij
  punt 1 kwam het wachtvenster van een week aan het licht, bij punt 6 dat
  minder vaak draaien het probleem juist groter maakt. Beide zijn met de
  nieuwe redenering herschreven
- Punt 18 toegevoegd: automatische taken rond offerte en akkoord

In een derde sessie diezelfde dag, aan het eind van de middag:

- Vastgesteld dat `sql/schema_tabellen.sql` **niet uitvoerbaar is.** Het
  is de schemaweergave van Studio en zegt dat zelf bovenaan. De
  herbouwset had daarmee geen enkele werkende schemadump, terwijl 4.8
  stap 2 zei dat je hem moest draaien. Dat is rechtgezet
- Punt 15 daardoor opnieuw afgebakend: geen aanvulling maar het geheel,
  en twee sessies in plaats van een uur
- Drie onafhankelijke sleutelscans gebouwd en gedraaid, alle drie schoon.
  De vijf verdachte plekken uit de eerste bleken loze alarmen: de vier
  omgezette cronjobs lezen aantoonbaar uit de kluis en
  `taken_bescherm_eigen` noemt alleen de rolnaam
- De aantallen uit de inventarisatie onafhankelijk bevestigd: 17
  databasefuncties, 11 triggers, 69 policies, 7 cronjobs
- Drie dingen gevonden die niemand wist. `taak_dagkeuze` gebruikt een
  sequence die nergens aangemaakt wordt, er bestaat geen enkele view, en
  alle zeven cronjobs dragen het projectadres letterlijk

- **Bijna-misser met dit document.** De wijzigingen hierboven waren
  gebouwd op de versie van 's ochtends, terwijl een ander gesprek er
  intussen een hele sessie werk in had gezet: de punten 2, 7 en 8
  afgerond, punt 3 grotendeels, de punten 1 en 6 herschreven en punt 18
  toegevoegd. Aan het bestand was niets te zien. Ontdekt doordat Gian
  vroeg op welk document de wijziging gebaseerd was. Zie 5.1, daar staat
  nu de regel die dit voortaan vangt

**Twee lessen van die derde sessie.**

Een bestand dat er compleet uitziet is niet hetzelfde als een bestand dat
draait. Dat verschil merk je pas op het moment dat je het nodig hebt, en
dan is het te laat. Daarom is de proefdraai geen luxe.

En: **de regel die de app beschermt beschermde dit document niet, terwijl
dit document vaker verandert dan de app.** Bescherming die op de
verkeerde plek zit voelt als bescherming en is het niet. Dat is hetzelfde
patroon als het groene vinkje van cron uit 3.4, alleen dan bij het
versiebeheer.

**Open, morgenochtend controleren:** `offerte-opvolging-werkdagen` draait
28 juli om 06:30 UTC, dat is 08:30 bij ons. Dat is de enige van de vier
die niet vooraf getest kon worden, want die stuurt mail naar klanten en
die trap je niet af om te kijken of het werkt. Kijk bij Edge Functions,
`offerte-herinnering`, Invocations. Staat daar 401, dan klopt `opvolg_key`
niet met de Edge Function secret `OPVOLG_KEY`. Er is dan niets ergs
gebeurd, want een geweigerd verzoek verstuurt geen mail. Deze faalt de
goede kant op en daarom is hij bewust niet vooraf getest.

---

## Wat er op 28 juli 2026 gedaan is

**Het banksaldo in financieel.html rechtgezet.** Het stond bijna
twintigduizend te hoog. De vuller telde alleen de grootboeken 11 en 12 op
en corrigeerde met een constructie die niets mat. Rekening 23000,
Betalingen onderweg, viel buiten beeld. Vanaf v1.1.0 is de formule 11xxx
plus 12xxx plus 15000 plus 23000, en dat is exact het Huidig saldo van
Yuki. Nagerekend op twee momenten, tot op de cent. Zie 4.2.

**Meegenomen opruiming.** De vuller haalde per maandeinde de openstaande
crediteuren apart op om die oude constructie te voeden. Dat is vervallen
en scheelt ruim twintig SOAP-aanroepen per run.

**De opbouwstrook liegt niet meer.** Daar stond bank met een bedrag waar
stilzwijgend een stuk leveranciersschuld in verwerkt zat. Het
werkkapitaal kwam goed uit, maar de regel klopte niet met zijn eigen
naam. Nu is bank echt bank.

> **Vier keer misgezeten op één avond.** De diagnose is drie keer op een
> aanname gebouwd en drie keer omgevallen: een dubbeltelling in het
> werkkapitaal die er niet was, een hangende ING-koppeling terwijl ING
> juist het verst bij was, en een profit-first-overboeking die in
> werkelijkheid de betaalbatches waren. Pas de proef- en saldibalans
> gaf uitsluitsel, en dat is één uitdraai uit Yuki.
>
> **De les:** bij een cijfer dat niet klopt, eerst de bron opvragen en
> dan pas redeneren. Schermen en changelogteksten beschrijven wat iemand
> dacht te bouwen, de saldibalans beschrijft wat er staat.

---

## Wat er op 30 juli 2026 gedaan is

### Schemadump gebouwd en aan de nacht gehangen (opruimpunt 15 en 10)

- **`public.schema_dump()` gebouwd.** Leest de inrichting van de database
  en zet die om in SQL waarmee je hem opnieuw aanlegt. Vaste volgorde:
  leegtecontrole, extensies, reeksen, tabellen, sleutels en beperkingen,
  indexen, functies, triggers, rijbeveiliging, policies, rechten,
  opslagbakken, opslagpolicies, cronjobs, en als laatste de
  verwijssleutels
- **Bewezen door terug te zetten, niet door te kijken.** De uitvoer is in
  een tweede lege database gedraaid en daarna zijn beide catalogi regel
  voor regel vergeleken. Kolommen, types, standaardwaarden, 22
  beperkingen, indexen, policies, rechten, reeksen, triggers en bakken:
  alle gelijk
- **`backup-dump` naar v4.** Schrijft `schema/schema-JJJJ-MM-DD.sql` weg,
  dertig dagen bewaren, en stuurt hem mee als tweede bijlage bij de
  maandagmail. Dat laatste is het punt: de bak `backups` zit in hetzelfde
  project dat bij ramp 3 verdwijnt, de mail niet
- **Mislukking wordt meteen gemeld.** Een mislukte schemadump breekt de
  gegevensbackup niet af maar stuurt direct een mail, ook op een dinsdag.
  Een schemadump die een week stilletjes niet werkt is erger dan een mail
  te veel

### Drie dingen die niemand wist

- **Zestien policies stonden op `storage.objects`, niet op `public`.** Het
  getal 69 uit de inventarisatie van 27 juli is 53 plus 16. Bij een
  telling over alleen `public` vielen de zestien opslagregels
  stilzwijgend uit het herbouwbestand. Zonder die regels staan na een
  herbouw de zes bakken er wel, maar komt de app er niet bij de foto's,
  documenten en getekende akkoorden
- **`smooth-function` draait op `maandbericht_key`.** De twee
  yuki-vullers dragen de sleutel van het maandbericht. Werkt, maar
  vervang je die sleutel dan ligt het financiele dashboard stil en meldt
  cron gewoon `succeeded`
- **Er lopen twee verschillende extensies.** Zes cronjobs gebruiken
  `net.http_post` uit `pg_net`, `werkvoorraad-sync-wekelijks` gebruikt
  `extensions.http()`. Bij een herbouw moeten allebei aan staan, anders
  draaien er zes en ligt de zevende stil zonder foutmelding

### Bijna-misser: een testuitdraai in de echte SQL Editor

Een herbouwbestand uit een nagebouwde testdatabase is per ongeluk in de
SQL Editor van de echte database geplakt en gedraaid. De tabelnamen in
die nabootsing waren verzonnen zonder na te denken en botsten met echte
namen, en de nagemaakte cronjobs heetten `backup-nachtelijk` en
`taken-mail-melding`. Was het bestand doorgelopen, dan had `cron.schedule`
allebei die jobs overschreven met opdrachten naar `https://x.supabase.co`.

Er is niets gebeurd. Hij struikelde bij de tweede index en de SQL Editor
draait zo'n plak als één transactie die bij een fout helemaal terugdraait.
Nagekeken met een leesquery: geen index, geen policy, en beide cronjobs
nog met het juiste adres.

Sindsdien draagt elk gegenereerd herbouwbestand een leegtecontrole
bovenaan die afbreekt zodra schema `public` al tabellen bevat. Dat is de
vijfde eis bij opruimpunt 15.

### Twee keer een vals groen licht bij het meten zelf

Bij het vergelijken van bron en doel meldde de controle "beperkingen
gelijk". Dat klopte, maar beide bestanden bevatten een foutmelding in
plaats van gegevens omdat de vergelijkingsquery een schrijffout had. Twee
lege uitkomsten zijn ook aan elkaar gelijk. Pas bij het tellen kwam er 22
uit.

Losstaand daarvan gaf de dekkingscontrole eerst 38 tabellen en 8
cronjobs bij 37 en 7 in de database. Verklaring: `schema_dump()` is zelf
een van de zeventien databasefuncties, dus zijn broncode staat in de
uitvoer, en in die broncode staan de zinnetjes waarop geteld werd.

**Les.** Vraag nooit "zijn ze gelijk", vraag "hoeveel zijn het er". Dit is
3.4 maar dan toegepast op het meetgereedschap in plaats van op het
systeem. Een controle die alleen "goed" kan zeggen kan ook zwijgen als er
niets is.

### Nog open

- **De terugzettest in een echt leeg Supabase-project.** Wegwerpproject in
  `eu-west-1`, de vijftien functies uitrollen, het herbouwbestand draaien,
  de drie kluissleutels opnieuw aanmaken, kijken of de app start, project
  weg. Zolang die niet gedraaid is, is 4.8 stap 2 bewezen op een
  nabootsing met elf tabellen en niet op de zevenendertig van het echte
  werk
### Auditquery naar v2

De kwartaalaudit keek helemaal niet naar opslag. `storage.objects` en de
zes bakken vielen er buiten, dus de zestien opslagregels waren met geen
enkele controle te zien. Uitgebreid met:

- **twee nieuwe rode vlaggen:** een bak die openbaar staat, en nul
  policies op `storage.objects`
- **blok 4 telt policies per schema** in plaats van als één totaal, met
  het samengestelde getal eronder en de verwijzing naar 4.8
- **blok 5 zet de bakken op een rij** met per bak besloten of openbaar

Getest door de vlaggen echt te laten afgaan en daarna weer te laten
zakken, niet door te kijken of hij groen gaf.

### Drie bakken zonder backup, niet één (opruimpunt 1)

`backup-dump` naar v5. De spiegel pakte twee van de vijf bronbakken.
`accord-pdf`, `taken-fotos` en `taken-documenten` hadden geen enkele
kopie. Van die drie is de eerste het ergst: getekende overeenkomsten met
naam, adres, bedrag en handtekening, het enige in het systeem met
juridische waarde.

Eerste run 70 bestanden, achterstand 0. De akkoorden staan vooraan in de
lijst zodat ze bij een drukke dag nooit achter de foto's aansluiten.

**Waarom dit zo lang gemist is.** De lijst `SPIEGEL_BRONNEN` in de code en
de lijst met bakken in Supabase zijn nooit naast elkaar gelegd. Beide
lijsten zagen er op zichzelf compleet uit. Dat is dezelfde soort fout als
de zestien opslagpolicies hieronder: een lijstje dat klopt tot je het
naast de werkelijkheid houdt. Blok 5 van de audit toont voortaan de
bakken, juist om dit te kunnen naleggen.

**En hij vond meteen iets.** Op zijn eerste echte run bleek `accord-pdf`
openbaar te staan. Dat is geen ongeluk maar de manier waarop het
accorderen werkt sinds v3.79.0, en dichtzetten zou het breken. Opgenomen
als opruimpunt 19 en als bekende uitzondering in de audit, met een derde
vlag erbij die afgaat zodra die uitzondering niet meer nodig is. Zo kan
een tijdelijke ontheffing niet stilletjes blijven staan.


**De naschok van het banksaldo.** Na de reparatie van 28 juli stond de
tegel nog steeds ruim elfduizend te hoog. Oorzaak: de vuller vroeg de
saldibalans per vandaag op, en betaalbatches staan geboekt op hun
uitvoerdatum in de toekomst. Rekening 23000 stond daardoor op 1.915
terwijl Yuki 13.529 liet zien, en het gat was tot op de cent de som van
de drie augustusbatches. Sinds v1.1.1 leest de vuller rekening 23000
uit een extra saldibalans per 31 december. Beide standen, per vandaag
en per jaareinde, zijn zichtbaar in de debugstand.

**Waarom het bewijs van 28 juli niet deugde.** De proef- en saldibalans
waarop de formule werd nagerekend was een jaaruitdraai, inclusief de
toekomstige boekingen. Daardoor klopte hij op papier en niet in de API.
Er bleef toen al een onverklaard restje van 2.671,68 over dat is
weggeredeneerd in plaats van uitgezocht. Een restverschil dat je niet
kunt verklaren is een meetfout die je nog niet gevonden hebt.


## Wat er op 31 juli 2026 gedaan is

De dag begon aan opruimpunt 6 en eindigde bij een lek dat daar niets mee
te maken had. Punt 6 staat nog precies waar het stond. Er is niets aan
gebouwd.

### De bewijsregel vastgelegd

Zie 5.6. Aanleiding waren twee gokken op een dag: het cronjobvermoeden van
30 juli, en een verzonnen looptijd van een halve seconde per mailaanroep
die twee berichten lang als feit meeliep zonder ooit gemeten te zijn.

### De Yoobi-sync veegde offerte-taken weg

**Het mechanisme.** `yoobi-taken-sync` sluit een voltooide ronde af met
een opruimregel:

    DELETE /taken?laatst_gezien=lt.{sweep_marker}

Er staat geen filter op `bron` bij. De kolom `laatst_gezien` heeft als
standaardwaarde `now()`, dus **elke** rij in `taken` krijgt bij aanmaak
een stempel, ook rijen die niets met Yoobi te maken hebben. Bij elke
voltooide ronde lagen alle oudere rijen dus onder de marker.

Wat dat opving was de trigger `bescherm_eigen` op `taken`, BEFORE DELETE.
Die blies de verwijdering af, maar keek alleen naar `old.bron = 'eigen'`.
Rijen met `bron = 'offerte'` vielen er doorheen.

**Wat er dus verdween.** Alle offerte-taken ouder dan de laatste ronde:
uitbrengtaken, nabeltaken voor Maud, en de todo-spiegels die
`todo_taken_sync` vanuit Calc aanmaakt. Vermoedelijk al maanden. Het viel
niet op omdat een taak die verdwijnt voordat je hem mist, niet gemist
wordt.

**Hoe het aan het licht kwam.** Niet door een storing. Er werd gemeten of
de Yoobi-bulk een trigger voor punt 6 zou kunnen laten overlopen. Daarbij
kwam de kolom `laatst_gezien` in beeld, en de vraag waarom de eigen taken
die verwijdering overleefden.

**De reparatie.** `taken_bescherm_eigen()` kijkt sinds vandaag naar
`old.bron <> 'yoobi'` in plaats van `= 'eigen'`. Bewust een uitsluiting en
geen opsomming: een bron die er later bij komt is dan vanzelf beschermd.
Precies de fout die hier gerepareerd werd. De trigger zelf is ongewijzigd,
`create or replace` laat hem op zijn plek. Teruggelezen met
`pg_get_functiondef` en niet afgegaan op *Success. No rows returned*.

**Wat bewezen is en wat niet.** Het mechanisme is gemeten: de code van de
sync, de oude triggerfunctie, de standaardwaarde van de kolom, en de
datums. Dat de todo-spiegels ook werkelijk zijn aangemaakt en daarna
verdwenen is **niet** bewezen. Er is geen logboek dat dat vasthoudt. Het
is een verklaring die alles dekt, geen bewijs.

**De trigger is dezelfde avond nog getest.** Een nieuwe todo in een lopende
calculatie leverde meteen een spiegel op: toegewezen aan `gian`, status
actueel, niet voltooid. `todo_taken_sync` werkt dus. Daarmee valt de
verklaring *die spiegels zijn er nooit geweest* af en blijft over dat ze
er waren en zijn opgeruimd. Strikt open blijft het geval dat die vier
todo's ouder zijn dan de trigger zelf. Niet te meten zonder de
aanmaakdatum van de trigger, en zonder gevolg: alle vier horen bij
verloren offertes en hadden volgens blok D van `offerte_taken_sync` toch
op vervallen gestaan.

**Tweede test loopt vanzelf.** Die nieuwe spiegel staat op 31 juli 18:33,
ruim na de sweep van 22 juli. Bij de eerstvolgende voltooide Yoobi-ronde
ligt hij onder de nieuwe marker. Staat hij er daarna nog, dan is de
reparatie in productie bewezen en niet alleen teruggelezen.

> **Bijgewerkt op 13 augustus 2026.** Die ronde is er geweest: de
> eerste voltooide ronde van de herbouwde sync, met opruimbeurt. De
> spiegel en de offerte-taken staan er nog. Daarmee is de reparatie in
> productie bewezen, zie de sectie van 13 augustus.

### Wat er onderweg nog meer gemeten is

- **De standaardwaarde van `taken.bron` is `'yoobi'`.** Wie ergens een rij
  in `taken` zet zonder `bron` mee te geven, maakt een Yoobi-taak die
  onder de opruimregel valt. `taken.html` zet hem expliciet op `eigen`.
  Voor elk nieuw stuk dat ooit in deze tabel schrijft is dit een valkuil
- **Het ketenslot in `yoobi-taken-sync` werkt niet.** De kop belooft dat
  een tweede aanroep weigert als er al een keten loopt. De controle staat
  er, maar het blok erachter bevat alleen commentaar en geen `return`. Twee
  keer op de knop drukken laat twee ketens door elkaar lopen
- **Yoobi-taken kunnen geen meldingen krijgen, maar dat zit in het
  scherm.** `taken.html` toont het meldingsblok alleen bij `modus ===
  'eigen'` (regel 1218). De database houdt het niet tegen: `bevries_yoobi`
  noemt `piep`, `piep_op` en `mail_op` niet. Verandert dat scherm ooit, dan
  valt de afbakening voor punt 6 om zonder dat iemand aan de trigger denkt
- **`taken.melding_geleverd_op` staat als `timestamp without time zone`**,
  terwijl alle andere tijdkolommen in die tabel een zone hebben. Dat is de
  vorm van de tijdzonefout die in taken v0.15.0 gerepareerd is
- **Er staan vier triggers op `taken`.** Postgres vuurt triggers van
  dezelfde soort in alfabetische naamvolgorde af. Een vijfde voor punt 6
  komt dus op een plek die de naam bepaalt, ten opzichte van
  `bevries_yoobi` en `zet_bijgewerkt`

> **Bijgewerkt op 13 augustus 2026.** Het ketenslot is herbouwd en
> weigert nu echt, met een 409. Zie de sectie van 13 augustus.

### Wat punt 6 hiervan meeneemt

De voorwaarde op de trigger mag niet alleen `NEW.piep = true` zijn. De
mailfunctie zet zelf `mail_op` met een PATCH, en dat is ook een UPDATE op
`taken`. Zonder `NEW.mail_op is null` erbij trapt de functie zichzelf aan
na elke verstuurde mail. Dat loopt niet oneindig door, maar het verdubbelt
het werk zonder dat iemand het ziet. De voorwaarde moet de selectie van de
functie spiegelen, niet alleen de piep.


## Wat er op 1 augustus 2026 gedaan is

Een kleine dag. Een derde vulling van het financiele dashboard erbij, en
twee wachten in de vuller. Het begon als een vraag van tien seconden en
werd onderweg tweemaal kleiner gemaakt.

### Derde vulling per dag

De cronjob `yuki-vuller-avond` draait sinds vandaag om 17:00 UTC, dat is
19:00 bij ons in de zomer en 18:00 in de winter. Het is een letterlijke
kopie van `yuki-vuller-middag`: dezelfde aanroep van `smooth-function`,
dezelfde sleutel `maandbericht_key` uit de kluis. Bevestigd uit `cron.job`
na afloop, jobid 22, `0 17 * * *`, actief.

Reden: wat er 's middags in Yuki geboekt wordt stond tot nu toe pas de
volgende ochtend in het dashboard. Vooral op maandag telt dat, want dan
werkt Maud de administratie bij.

### Twee wachten in `smooth-function`

`soapCall` keek niet naar de statuscode van het antwoord van Yuki. Gaf
Yuki een 500 terug, dan ging die foutpagina gewoon door de molen: het
antwoordelement ontbrak, `parseAccounts` kreeg een lege string, elke som
kwam op 0 uit en die nullen werden weggeschreven. De goede stand van de
vorige run was dan weg.

Wacht 1 zit nu in `soapCall` en breekt de run af bij een foutcode. Wacht 2
zit vlak voor de upsert en weigert te schrijven bij een banksaldo van
precies 0,00. Daarnaast meldt de functie voortaan eerlijk `ok: false`
wanneer het wegschrijven in `fin_dashboard` zelf mislukt; tot nu toe kwam
daar `ok: true` uit met `opgeslagen: false` ergens in het antwoord.

### Wat er bewust niet gebouwd is

Het eerste ontwerp legde de eis ook op de twintig maandeinde-saldibalansen
die de vuller voor de grafieken ophaalt. Dat is geschrapt. Stond die eis te
streng, dan zou hij elke dag de hele run blokkeren op een maand die
terecht leeg is, en dan veroudert het dashboard stilletjes terwijl er niets
stuk is. Een wacht die zelf een faalscenario toevoegt is geen winst.

Daarmee blijft het halve geval onbeschermd: Yuki geeft netjes een 200 maar
met een leeg antwoordelement voor een deel van de aanroepen. Dan lezen
bijvoorbeeld de debiteuren op nul en leest het werkkapitaal te gunstig.
Dat is aannemelijk en daarom lastig te zien. Bewust geaccepteerd tot het
een keer waargenomen wordt.

Er komt ook geen alarmmail. De tijdstempel bovenin financieel.html doet dat
werk al: slaat de vuller een run over, dan staat daar een oud tijdstip.

### Bewijsstand

Het faalscenario waar deze wachten tegen beschermen is nooit waargenomen.
`fin_dashboard` houdt geen geschiedenis bij, dus achteraf is niet vast te
stellen of het ooit gebeurd is. Het staat hier als redenering, niet als
meting. De wachten zijn gebouwd omdat ze klein zijn en niets kunnen
blokkeren dat nu werkt, niet omdat er een incident aan ten grondslag ligt.


## Wat er op 2 augustus 2026 gedaan is

Opruimpunt 19 afgerond. De bak `accord-pdf` staat dicht en de klant krijgt
zijn document via een link die na een uur vervalt.

### Wat er mis was, en waarom de oude beschrijving niet klopte

De verloopcontrole van v4.12.0 werkt: een verlopen offerte kan niet meer
geopend worden via de accordeerpagina. Maar de PDF stond in een openbare
bak onder de naam `{token}.pdf`, en die token staat in de accordeerlink
die de klant per mail kreeg. Wie die mail had, kon het bestand dus
rechtstreeks bij de opslag opvragen, buiten de functie om. **De controle
zat op de deur, het document lag ernaast op straat.**

Gemeten en bevestigd door een token van een verlopen offerte in een
incognitovenster te plakken: de offerte kwam gewoon tevoorschijn. Na het
dichtzetten geeft datzelfde adres `NoSuchBucket`.

**Twee dingen in de oude tekst van punt 19 waren onjuist.**

- *"een getekende overeenkomst met naam, adres, bedrag en handtekening"*.
  De PDF wordt gebouwd bij het **aanmaken** van de link, dus vóór het
  tekenen. Er staat geen handtekening in. De changelog bij v3.79.0 zegt
  het met zoveel woorden: het akkoordstempel vervalt voor PDF-links omdat
  een PDF vastligt; het akkoord leeft in `offerte_accorderingen`
- *"28 pdf's in de bak"*. Dat was het aantal rijen met een `pdf_path`. In
  de bak stonden er 66

Het tweede getal was overgenomen zonder te meten aan de bak zelf. Het
eerste is drie sessies lang meegereisd als feit.

### De metingen

| | |
|---|---|
| Bestanden in de bak | 66 |
| Rijen met een `pdf_path` | 28 |
| Rijen zonder `pdf_path` (van vóór v3.79.0) | 3 |
| Wezen: bestanden zonder rij | 38, samen 120,7 MB |
| Rijen die naar een verdwenen bestand wijzen | 0 |

De wezen ontstaan doordat een nieuwe link voor dezelfde offerte de rij
overschrijft maar het oude bestand laat staan. Zichtbaar in de data:
zeven bestandsgroottes komen meerdere keren voor, steeds binnen enkele
minuten van elkaar. Op 4 juli staan er drie van precies 4707332 bytes
binnen 55 seconden.

Dat `rijen_zonder_bestand` op nul staat is het belangrijkste getal: elke
levende rij heeft zijn bestand nog, dus opruimen raakt niets.

De query staat als `sql/wezen_accord_pdf.sql`. Leest alleen, mag altijd
opnieuw.

### Wat er gebouwd is

**`offerte-accord` v4.40.0.** Twee nieuwe functies: `magDocumentZien()`
houdt de regel op één plek, `versePdfLink()` maakt een ondertekende link
van zestig minuten. `pdf_path` is aan de select toegevoegd, die stond er
niet in. Het antwoord bevat nu ook `document_beschikbaar`.

De regel:

| toestand | document |
|---|---|
| open, niet verlopen | ja |
| akkoord, binnen 30 dagen na de reactie | ja |
| akkoord, ouder dan 30 dagen | nee |
| afgekeurd | nee |
| open en verlopen | nee (bestond al) |

De dertig dagen zijn een besluit van Gian, geen techniek. Mail B noemt de
termijn nu en raadt de klant aan het bestand zelf te bewaren.

**Twee bewuste gedragsveranderingen.** Een afgekeurde link toonde de
offerte tot nu toe onbeperkt; die is dicht. En bij "dicht" gaat de hele
snapshot niet mee, ook de HTML-terugval niet, anders zou de oude weg de
offerte alsnog tonen en zat de afscherming alleen op de PDF geplakt.

### Wat er bewust NIET gebouwd is

**`index.html` is niet gewijzigd.** Regel 20773 slaat nog een publieke URL
op in `snapshot.pdf`. Die waarde is dood: `offerte-accord` overschrijft
het veld bij elke opening. Een release van `index.html` alleen hiervoor is
veel beweging voor nul verschil, dus dit lift mee op de eerstvolgende
release. **Zolang dat niet gebeurd is, staat er in de database een kolom
vol adressen die nergens meer heen gaan.** Dat is geen storing, maar wel
een valstrik voor wie er over een half jaar naar kijkt.

**De 38 wezen staan er nog.** Sinds de bak dicht is, zijn ze geen lek meer
maar 120 MB rommel.

> **Wezen verwijderen mag NIET met SQL.** `delete from storage.objects`
> haalt alleen de registratie weg; het echte bestand blijft bij Amazon
> staan. Dan is het onzichtbaar én aanwezig, en dat is erger dan nu. Het
> moet via de Storage-API: met de hand in Studio, of met een functie die
> eerst een droogloop doet.

### Wat er gemeten is na afloop

- openbare URL van een bestaand bestand, incognito: `NoSuchBucket`
- lopende offerte via de accordeerlink: PDF verschijnt, link is
  `/object/sign/` met `exp` een uur later
- knop "Getekend exemplaar (PDF)" in het beheervenster: werkt. Die gaat
  via `storage.download` met de eigen inlog en de bestaande policies voor
  `authenticated`, dus die raakte het dichtzetten niet

### Terugdraaien

Bak terug op openbaar en de vorige versie van `offerte-accord` plakken.
Aan de gegevens is niets veranderd.

---

## Ook op 2 augustus 2026: de auditquery, de policies en de mailfunctie

### Auditquery naar v3

De uitzondering voor `accord-pdf` is uit `bak_uitzonderingen` gehaald. Die
stond er om te voorkomen dat de vlag elk kwartaal onterecht afging op een
bak die met opzet openbaar was. Die bak is er niet meer.

**Waarom dat niet kon blijven staan.** Zolang die naam in de lijst stond,
zou de audit óók gezwegen hebben als iemand die bak per ongeluk weer
openbaar zette. Een uitzondering die blijft staan nadat de reden verdwenen
is, is geen uitzondering meer maar een blinde vlek.

De lijst is leeg gelaten in plaats van weggehaald, met in het commentaar
de eis dat een toekomstige uitzondering een reden én een
herbeoordelingsdatum krijgt. De regel in blok 2 staat er ook nog, zodat een
nieuwe uitzondering zichtbaar wordt in plaats van stilzwijgend uit blok 1
te verdwijnen.

Gedraaid na afloop: geen rode vlaggen, alle zes bakken besloten.

> **De kwartaalaudit draait niet vanzelf.** Hij staat niet bij de acht
> cronjobs van 3.1 en heeft nooit een planner gehad. De naam wekt de
> indruk van wel. Sinds 2 augustus 2026 staat hij als terugkerende taak in
> de takenapp bij Gian, met de uitleg erin waar hij voor dient.
>
> Bewust géén cronjob: een controle die vanzelf draait en die niemand
> leest, geeft schijnzekerheid. Dat is hetzelfde patroon als het groene
> vinkje in cron.
>
> Bij het lezen van de uitkomst is de belangrijkste vraag niet of er een
> rode vlag staat, maar of het aantal policies uit blok 4 nog klopt met
> 4.8. Wijkt dat af, dan is er iets veranderd dat niet is opgeschreven.

### Opruimpunt 16 en 17

Zie de opruimlijst. Vijftien policies hernoemd, één dubbele verwijderd,
totaal in `public` van 53 naar 52. Bijvangst: opruimpunt 20, de zes
policies op rol `public`.

### Opruimpunt 6, brok 1: `taken-mail-melding` v2

Punt 6 zelf staat nog open. Dit is de eerste van drie brokken en hij kan
los: de functie is er beter van, ook als de trigger er nooit komt.

**Wat er vooraf gemeten is.** De Yoobi-sync kan geen enkele rij door de
poort `piep = true` duwen. Langs drie kanten bevestigd: de
standaardwaarde van de kolom is `false`, `yoobi-taken-sync` schrijft het
veld niet (de `rows.push` zet negen velden en `piep` zit er niet bij), en
`taken.html` toont de meldingsschakelaar alleen bij `modus === 'eigen'`
(regel 1218). Van de 94 Yoobi-taken heeft er nul een piep.

> **Die derde bescherming zit in het scherm, niet in de database.**
> `bevries_yoobi` noemt `piep`, `piep_op` en `mail_op` niet in zijn lijst
> bevroren velden. Verandert dat scherm ooit, dan valt de afbakening voor
> punt 6 om zonder dat iemand aan de trigger denkt.

**Drie wijzigingen in v2.**

1. **Claimen vóór mailen.** Oud: lezen, mailen, dán pas `mail_op` zetten.
   In dat gat kon een tweede aanroeper dezelfde rij lezen en nog een keer
   mailen. Nieuw: eerst claimen met een PATCH die alleen aanslaat als
   `mail_op` nog leeg is, en alleen mailen als die claim echt een rij
   oplevert. Faalt het versturen daarna, dan wordt de claim teruggedraaid
   zodat de volgende ronde het opnieuw probeert.
2. **Harde stop als de Resend-sleutel ontbreekt.** Dit was het ergste van
   de oude versie. De voorwaarde om te mailen was `adres && RESEND`. Viel
   de sleutel weg, dan ging élke taak door de tak "geen adres", kreeg
   `mail_op` en was voorgoed weg. Geen mail, geen fout, geen herkansing,
   en de cron bleef groen melden. Nu stopt de functie meteen met een 500
   en raakt geen enkele rij aan.
3. **Onderscheid tussen bewust en onbedoeld geen adres.** Maud heeft geen
   mailadres, met opzet: zij werkt een halve dag per week en leest dan
   haar taken. Iemand die per ongeluk ontbreekt in `taken_rollen` zag er
   in de code precies hetzelfde uit. Nu twee lijsten: staat de persoon in
   `taken_rollen` zonder adres, dan gebeurt er niets; staat de persoon er
   niet in, dan komt er een logregel met de naam erbij.

**Het restrisico van 1, bewust geaccepteerd (Gian, 31 juli 2026).** Gaat
de functie zelf onderuit tussen de claim en het terugdraaien, dan is die
ene melding weg. Een tweede kolom voor de claim zou dat oplossen, maar dat
is meer machinerie dan het geval waard is bij deze aantallen.

**Waar je op moet letten, en niet op wat je zou verwachten.** Wat v2
voorkomt is een dubbele mail. Wat er in ruil voor terugkomt is het
omgekeerde: een mail die stil niet aankomt. Het signaal is dus niet "te
veel mail" maar "een taak in de app waar niemand bericht over kreeg".

**Eerste meting na uitrol,** 2 augustus 12:38 uit de Logs:
`{"gevonden":2,"verstuurd":1,"bewust_geen_adres":1,"onbekende_persoon":0,"overgeslagen":0,"mislukt":0}`.
Die ene zonder adres was een taak voor Maud. De rapportregel staat nu in
het logboek; de oude versie liet niets achter.

**De teller `overgeslagen` is het bewijsmiddel.** Komt die ooit boven nul,
dan heeft de claim iets tegengehouden dat vroeger een dubbele mail was
geweest.

**Nog te doen voor punt 6:** brok 2 is de trigger op `taken`, brok 3 is de
cron van `*/2` naar `*/30`. Pas beginnen als v2 een dag stabiel draait.
De voorwaarde op die trigger mag níet alleen `NEW.piep = true` zijn: de
mailfunctie zet zelf `mail_op` met een PATCH, en dat is ook een UPDATE op
`taken`. Zonder `NEW.mail_op is null` erbij trapt de functie zichzelf aan
na elke verstuurde mail.

### Opruimpunt 3 en 4

Zie de opruimlijst. `taken-agenda` is verwijderd uit Supabase, uit de repo
en zijn tabel is weg. De voorraad-app heeft een doorstuurpagina.

### Wat we onderweg over `ernes-edge-functions` geleerd hebben

Dit stond nergens en het is contra-intuïtief.

> **`supabase/functies-overzicht.json` spiegelt Supabase. De mappen in
> `supabase/functions/` doen dat niet.**
>
> De Action "Functies ophalen uit Supabase" haalt de actuele lijst op en
> overschrijft dat JSON-bestand, dus daar staat precies wat er draait.
> Maar mappen van functies die niet meer bestaan laat hij staan. Op 2
> augustus is dat gemeten door de Action met de hand te starten nadat
> `taken-agenda` uit Supabase was verwijderd: het overzicht telde daarna
> veertien functies zonder `taken-agenda`, terwijl de map er nog stond.
>
> **Wie in nood die repo openslaat en op de mappen afgaat, ziet dus
> functies die niet meer bestaan.** Kijk in het JSON-bestand.
>
> Gevolg voor het opruimen: een Edge Function verwijderen is twee
> handelingen, Supabase én de map in de repo. Dat stond al zo in
> opruimpunt 3 en is nu ook gemeten.

**Drie lagen in die repo, en ze lopen uit elkaar:**

| Laag | Wat het is | Loopt mee |
|---|---|---|
| `supabase/functies-overzicht.json` | de actuele lijst uit Supabase | ja, elke run |
| `supabase/functions/<naam>/` | de broncode | alleen toevoegen en bijwerken |
| `*.zip` in de hoofdmap | momentbeeld van 26 juli 2026 | nee, bevroren archief |

De zips bevatten nog `taken-meldingen.zip`, `yoobi-kijkglas.zip` en
`yoobi-project-probe.zip`, drie functies die op 27 juli verwijderd zijn.
Dat is met opzet: het is archief.

> **De Action draait op onderdelen die uitgefaseerd worden.** Bij elke run
> komt de waarschuwing dat `actions/checkout@v4` en `supabase/setup-cli@v1`
> voor Node.js 20 gebouwd zijn en nu gedwongen op Node.js 24 draaien. Het
> werkt, maar op een dag stopt GitHub met dat opvangen en dan faalt deze
> workflow.
>
> Dat is geen storing van vandaag, maar wel een die stil kan verlopen: de
> backup van de Edge Functions stopt dan met bijwerken zonder dat er iets
> misgaat aan de kant die je gebruikt. Merkbaar aan de commitdatum van
> `functies-overzicht.json`: staat die er meer dan een week op, dan draait
> hij niet meer.

### Opruimpunt 18 en de hermeting van punt 9

Zie de opruimlijst. Punt 18 is gebouwd en bewezen, punt 9 is herschreven
omdat de oude schatting er een factor acht naast zat.

### Twee correcties op eerdere metingen van vandaag

**Punt 11 stond al afgestreept.** Bij het opsommen van de openstaande
punten is die ten onrechte als open geteld. Oorzaak: er staan twee
genummerde lijsten in dit document met allebei een punt 11, de opruimlijst
en het herbouwdraaiboek in 4.8. Een zoekopdracht op regelbegin pakt ze
allebei.

**De Action in `ernes-edge-functions` ruimt niet op.** Eerder op de dag
was de conclusie dat hij dat wel deed, op grond van drie ontbrekende
mappen. Dat was te snel: die drie waren op 27 juli met de hand verwijderd.
Rechtgezet door de Action met de hand te starten; de map bleef staan.

### Een testvorm die vandaag twee keer nodig was

> **Een test die alleen bevestigend kan uitvallen, bewijst niets.**
>
> Bij punt 18 stonden na de statuswisseling alle drie de taken op dezelfde
> dag gepland. Dat is precies wat `DO UPDATE` óók zou opleveren, dus het
> scherm kon het verschil niet tonen. Beslist op de kolom `bijgewerkt`.
>
> Bij `offerte-herinnering` staat in de logs alleen `booted` en
> `shutdown`. Nul mails en tien mails zien er identiek uit. Die functie
> heeft geen rapportregel zoals `taken-mail-melding` er sinds vandaag een
> heeft, en daarom is "testen of hij werkt" met de huidige code niet te
> beantwoorden.
>
> Vraag bij elke controle: **welke uitkomst zou deze test laten mislukken?**
> Is daar geen antwoord op, dan meet de test niets.

### Wat `offerte-herinnering` wel doet

Gemeten op 2 augustus uit de Logs: gedraaid op 29, 30 en 31 juli, steeds
om 08:30 lokale tijd en drie minuten later klaar. De cron
`offerte-opvolging-werkdagen` komt dus aan. 1 en 2 augustus ontbreken en
dat klopt, die cron draait alleen op werkdagen.

Die looptijd van drie minuten is lang voor een functie die niets doet, wat
suggereert dat er wel degelijk gewerkt wordt. **Dat vermoeden is later op
de dag weerlegd, zie hieronder.**

> **En de aflezing zelf deugde ook niet. Gemeten op 3 augustus 2026:** de
> afstand tussen `booted` en `shutdown` is niet de looptijd maar de
> leegloop-afsluiting, en die is min of meer vast op ruim drie minuten. Het
> werk duurde 941 ms. Uit die drie minuten viel dus niets af te leiden, niet
> in de ene en niet in de andere richting. Zie 3 augustus 2026.

### De opvolgautomaat had nog nooit iets te doen gehad

**De uitkomst eerst.** Er was niets stuk. De automaat is gebouwd op 25 juli
en 25 juli was de eerste vakantiedag. Sindsdien is er geen enkele offerte
via de app verstuurd, dus `gemaild_op` was nergens gezet en de selectie van
`offerte-herinnering` leverde elke ochtend nul rijen op.

**Hoe het eruitzag onderweg.** Van de 31 accorderingen had er geen enkele
een `gemaild_op`, en alle vier de opvolgstempels stonden op nul. Dat leest
als een kapotte keten. De broncode van `offerte-verzenden` bleek in orde:
het stempelblok staat erin, met foutafhandeling en een `stempel`-veld in
het antwoord. Toen bleef alleen over dat de functie nooit was aangeroepen,
en dat klopte.

> **De verklaring stond niet in de database maar in de agenda.** Dit is de
> tegenhanger van "nooit bouwen op een ongestelde diagnose": er was hier
> bijna een reparatie gebouwd voor iets dat niet stuk was. Vraag bij een
> keten die overal nul toont eerst of er ooit iets ingegaan is, voordat je
> uitzoekt waar het blijft steken.

### `offerte-herinnering` v4.40.0: rapport in de logs

De functie gaf haar rapport alleen terug in het antwoord op de aanroep, en
de cron gooit dat antwoord weg. In de Logs stond niets anders dan `booted`
en `shutdown`. Een dag met nul mails en een dag met tien mails zagen er
identiek uit.

Nu gaat er aan het eind van elke ronde één regel naar de Logs, ook bij nul
en ook bij een droogloop, plus elke handeling apart zodat achteraf te zien
is wélke offerte het betrof. Het rapport telt ook per poort hoeveel er
afvielen.

**Het onderscheid dat ertoe doet:**

| uitkomst | betekenis |
|---|---|
| `bekeken: 0` | geen offerte via de app verstuurd. Niets te doen, geen storing |
| `bekeken: 9, gedaan: 0` | er staan er open, maar vandaag was niets aan de beurt |
| `mislukt > 0` | hier moet naar gekeken worden |

Zonder dat onderscheid lijkt een stilstaande automaat op een rustige dag.
`maakTaak` geeft sindsdien ook terug of de taak al bestond, anders lijkt
een ronde waarin niets nieuws ontstond op een geslaagde ronde.

### De kale nabeltaak uit `offerte_taken_sync` gehaald

Bij het testen bleek dat twee systemen allebei een nabeltaak maakten:

| bron | `bron_kenmerk` | inhoud |
|---|---|---|
| trigger `offerte_taken_sync`, blok C | `nabellen` | kaal |
| Edge Function `offerte-herinnering` | `opvolg-bel` | belscript, telefoonnummer, klantgegevens |

Dubbel werk in de lijst van Maud. De kale is weggehaald uit blok C, zie
`sql/offerte_taken_sync_v2.sql`.

**Waarom dat kan zonder een gat te schieten.** `offerte-herinnering` maakt
zijn taak alleen als `gemaild_op` gevuld is, en dat gebeurt uitsluitend bij
mailen via de knop in de app. Gian bevestigde dat offertes altijd zo de
deur uit gaan; met de hand op verzonden zetten gebeurt niet. **Verandert
dat ooit, dan krijgt zo'n offerte geen nabeltaak meer en moet dit terug.**

Gemeten dat de volgorde klopt: `index.html` regel 20471 wacht op
`_offerteVerzendCall` en zet daarna pas de status op verzonden. Op het
moment dat de trigger vuurt staat `gemaild_op` dus al in de database. Dat
maakte een variant mogelijk waarin de trigger in `offerte_accorderingen`
kijkt, maar die is niet gebouwd: bij "ik mail altijd via de app" is
weghalen eenvoudiger en beter te begrijpen.

De regels die een bestaande `nabellen`-taak laten vervallen bij een
statuswisseling blijven staan; er lagen er nog vijf van vóór deze
wijziging. Er komt een opruimbestand dat een kale nabeltaak aanpakt
alléén als er voor dezelfde calculatie een `opvolg-bel`-taak bestaat: beter
een taak zonder belscript dan helemaal geen nabellen.

> **Op 3 augustus 2026 is dat `sql/nabeltaken_dubbel_opruimen.sql`
> geworden, en het zet de rij op `vervallen` in plaats van hem te
> verwijderen.** Reden: `offerte_taken_sync` gebruikt nergens een DELETE,
> alles gaat via `status = 'vervallen'`. Weggooien zou hier de enige
> uitzondering zijn. Het eerder genoemde `sql/nabeltaken_opruimen.sql`
> bestaat niet en moet niet gezocht worden.

### De testofferte van 2 augustus

Er staat een testofferte open, gemaild naar `gian@ernes.nl`. Die is het
eerste echte geval voor de opvolgautomaat sinds hij bestaat.

**Wat er op 3 augustus na 08:30 moet gebeuren:**

1. `offerte-herinnering` maakt de `opvolg-bel`-taak met belscript
2. In de Logs staat `bekeken: 1, gedaan: 1, beltaken: 1`
3. Er komt een mail op `info@` met onderwerp "Offerte-opvolging 2026-08-03"
4. Daarna kan blok B van `sql/nabeltaken_opruimen.sql` de dubbele opruimen

Gebeurt dat niet, dan is er wél iets aan de hand en is dat voor het eerst
vast te stellen.

De vier overige kale nabeltaken horen bij offertes van vóór de vakantie die
inmiddels verlopen zijn. Die moeten met de hand beoordeeld worden; er komt
nooit een tegenhanger bij, want die offertes hebben geen `gemaild_op`.

## Wat er op 3 augustus 2026 gedaan is

Een dag van meten. Er is één ding gebouwd en één ding gesloten, en dat
laatste was de belangrijkste uitkomst.

### De opvolgautomaat werkt, voor het eerst bewezen

De testofferte van 2 augustus is om 06:30 UTC opgepakt. Alle vier de
verwachtingen van gisteren zijn uitgekomen.

| wat | uitkomst |
|---|---|
| Logs | `bekeken: 1, gedaan: 1, beltaken: 1, beltaak_bestond_al: 0, mislukt: 0, duur_ms: 941` |
| mail op `info@` | 08:30, onderwerp "Offerte-opvolging 2026-08-03" |
| `gemaild_op` | 2026-08-02 15:16:26 |
| `beltaak_op` | 2026-08-03 06:30:03.925 |
| de taak | `opvolg-bel` bij Maud, met belscript, telefoon 045321471, geldig tot 16 augustus |

`herinnering_op`, `verlopen_mail_op` en `afsluittaak_op` staan leeg en dat
klopt: die stappen komen op 9 en 26 augustus en 5 september. De keten loopt
dus van de knop in de app tot de stempel terug in de database.

`offerte-herinnering` v4.40.0 stond al gedeployed. De rapportregel is
precies waarvoor hij gebouwd is: zonder die regel was deze ochtend niet van
een lege ochtend te onderscheiden geweest.

### Vals signaal: `booted` tot `shutdown` is niet de looptijd

| moment | tijd |
|---|---|
| booted | 06:30:03.255 |
| rapportregel | 06:30:04.318 |
| shutdown | 06:33:23.265 |

Het werk duurde 941 ms. Daarna stond de functie 199 seconden niets te doen
tot Supabase hem afsloot. **Die afstand is min of meer vast.** Op 29 tot 31
juli deed de functie helemaal niets en zag dat er in de Logs identiek uit.

Dit hoort in het rijtje naast de groene cron-indicator en de `net.http_post`
die altijd na vijf seconden afbreekt: **een aflezing die er betekenisvol
uitziet en het niet is.** De passage bij 2 augustus is hierop gecorrigeerd.

### `offerte_taken_sync` v3: het gat dat v2 achterliet

v2 haalde op 2 augustus de kale nabeltaak uit blok C, omdat
`offerte-herinnering` diezelfde taak al maakt met bron_kenmerk
`opvolg-bel`. Wat daarbij is blijven liggen: de plekken die een nabeltaak
laten **vervallen** noemden alleen `nabellen`. De nieuwe taak heet anders en
bleef dus staan.

**Gevolg:** zet je een calculatie op geaccepteerd of verloren, dan bleef de
beltaak met belscript in de lijst van Maud staan. Zij zou een klant nabellen
over een offerte die al binnen was. In Gians woorden: dat mag nooit
gebeuren, dat is slecht voor het zelfvertrouwen van Maud en de klant vindt
het gegarandeerd slordig.

v3 voegt `opvolg-bel` toe op twee plekken: het terugweg-blok en blok D.
`sql/offerte_taken_sync_v3.sql`. De DELETE-tak hoefde niet: die gaat op
`bron` en `bron_ref` zonder kenmerk en pakte `opvolg-bel` al mee.

> **Dit raakt ook het geval waarin de klant zelf op akkoord klikt.**
> Aanvankelijk was onzeker of `offerte-accord` de status van de calculatie
> meezet of alleen die van de accordering. Beslist zonder de Edge Function
> te lezen: het dashboard groepeert op `c.status`, dus op het statusveld van
> de calculatie zelf (`index.html` regel 19370 en 19676). Ziet Gian hem
> onder Geaccepteerd staan, dan stáát `calculaties.status` op geaccepteerd
> en vuurt de trigger. Een waarneming uit het gebruik werd zo een meting.

### De dubbele nabeltaak opgeruimd

Uit de overgang stond één dubbele: de testofferte kreeg op 2 augustus nog
een kale `nabellen` van de oude trigger en op 3 augustus een `opvolg-bel`
van de Edge Function. Eerst een droogloop (één rij, zoals voorspeld), toen
de wijziging.

`sql/nabeltaken_dubbel_opruimen.sql` zet zo'n rij op `vervallen` en
verwijdert hem niet. Reden: `offerte_taken_sync` gebruikt nergens een
DELETE.

Stand na afloop: `nabellen` vier vervallen en één afgevinkt, nul open.
`opvolg-bel` één open. Maud heeft nog exact één nabeltaak en dat is die met
het belscript.

De controle op zwevende beltaken bij offertes die al binnen of verloren zijn
gaf nul rijen. v3 is dus zuiver preventief.

### `taken-mail-melding` v2 na een etmaal

`mislukt` en `overgeslagen` staan op nul. Iedereen met een mailadres heeft
alles ontvangen: bjorn 9, jens 4, max 9, geen enkele lege `mail_op`.

Twee dingen die de meting opleverde en die geen storing zijn:

**De acht piep-taken van Gian zonder `mail_op` zijn allemaal vóór hun
piep-tijd afgevinkt.** Acht van acht, allemaal van vóór de uitrol van v2.
Bijvoorbeeld "accord-pdf opnemen in de nachtelijke backup": piep stond op 31
juli 06:50, afgevinkt op 30 juli 22:01.

> **Leesregel die daaruit volgt: afvinken zet `voltooid_op` en laat
> `status` op `actueel` staan.** Wie op `status` afgaat om te zien of een
> taak nog openstaat, leest het verkeerd. Dat raakt elke toekomstige trigger
> op `taken`: die moet `NEW.voltooid_op is null` in zijn voorwaarde krijgen.

**De teller `gevonden` is bedorven.** Maud heeft met opzet geen mailadres.
v2 zet dan geen `mail_op`, dus haar taken worden elke twee minuten opnieuw
gevonden, voor altijd. De oude versie stempelde ze wel af, vandaar dat er
twaalf taken van Maud **met** `mail_op` staan en twee zonder. Die teller
loopt dus op met elke taak die Maud ooit krijgt en is geen maat meer voor
werk.

### Nog een vals signaal: de bulkactie van 15 juli

Bij het analyseren van de meldingsgeschiedenis leken vijftien taken een
enorme vertraging te hebben. Ze hebben alle vijftien exact dezelfde
`mail_op`: `2026-07-15 09:49:32.756111`. Dat is één keer een stapel oude
rijen afstempelen, geen vijftien verzendingen. **Wie de
meldingsgeschiedenis analyseert moet die groep apart zetten.**

### Vier tegenstrijdige accorderingen, verklaard

Er stonden vier gevallen waar de accordeer-status niet strookte met de
status van de calculatie: drie keer akkoord bij een verloren calculatie, één
keer afgekeurd bij een geaccepteerde. Dat zou betekenen dat er een pad is
waarlangs een echt akkoord op verloren eindigt, en dan zou v3 een beltaak
laten vervallen die je wilde houden.

Het waren testritten van Gian zelf uit juni, met klantnamen Gian, Gian Ernes
en Gian Nacken. Drie ervan op dezelfde calculatie binnen anderhalf uur op 13
juni, de dag dat de accordeerlink live ging. Geen probleem, en het bezwaar
tegen v3 verviel daarmee.

### Opruimpunt 6 gesloten, punt 21 gehalveerd

Zie de opruimlijst voor beide. Kort: punt 6 loste een probleem op dat niet
bestaat, en punt 21 verliest daarmee zijn beste moment en wordt tot één
hernoeming teruggebracht.

### Werkwijze, twee dingen om te onthouden

**Een voorspelling is geen meting.** De controleregel onder v3 zou "3" geven
en gaf "7". `pg_get_functiondef` telt ook commentaar mee, en er stond vijf
keer `opvolg-bel` in de toelichting naast twee keer in de code. Het getal 3
was opgeschreven zonder te tellen. De vervangende controle zoekt de exacte
codetekst van beide regels en geeft twee keer "ja".

**Punt 21 is naar een verse chat gegaan.** Deze chat had al gebouwd en
geleverd, en punt 21 is een nieuw bouwwerk in een ander deel van het
systeem. Er is een overdrachtsbriefing meegegeven.

### Punt 21 uitgevoerd: `taak-melding-mail` heet nu `taak-afvinkmelding`

Gedaan in een verse chat, dezelfde dag. De volgorde en de metingen staan
bij opruimpunt 21. Wat hier hoort is wat het opleverde buiten de naam om.

**Het archief dekt minder dan het lijkt.** De besloten repo
`ernes-edge-functions` heeft nooit een map voor `taak-melding-mail`
gehad: de wekelijkse ophaalactie van 2 augustus draaide voordat die
functie bestond. Hetzelfde geldt nu voor `taak-afvinkmelding`, tot de
eerstvolgende actie. In de hoofdmap van die repo staan bovendien nog
zips van vier functies die allang uit Supabase weg zijn: `taken-agenda`,
`taken-meldingen`, `yoobi-kijkglas` en `yoobi-project-probe`. Het archief
mist dus nieuwe functies en bewaart oude die niet meer bestaan. Wie erop
vertrouwt bij een herbouw krijgt een systeem van vorige week. Opgenomen
als opruimpunt 22.

**Dezelfde meetfout twee keer op een dag.** De controlequery van blok D
zocht op de kale tekst `taak-melding-mail` in `prosrc`, en vond daarmee
de commentaarregel die diezelfde SQL er zelf in had gezet. Uitkomst: twee
keer `true`, wat eruitzag als een halve omzetting terwijl er niets mis
was. Dat is precies de fout die die ochtend al was opgeschreven onder
"Een voorspelling is geen meting", toen met `pg_get_functiondef`. De les
is niet dat er beter opgelet moet worden maar dit: **een controle die
tekst zoekt moet zoeken op iets dat alleen in de code kan voorkomen en
niet in de toelichting.** Hier werd dat `functions/v1/taak-afvinkmelding`,
met het pad ervoor.

---

## Wat er op 9 augustus 2026 gedaan is

### Agendakoppeling: v4 schrijft naar de database

`opname-boekingen` is van v3 (alleen lezen) naar v4 gegaan en schrijft
nu op verzoek naar de tabel `opname_boekingen`. Gedrag en mengregels
staan in 3.2. Het bewijs is in drie stappen geleverd: een droogloop
meldde 30 nieuw bij een lege tabel, de schrijfrun schreef er 30, en een
tweede droogloop meldde 30 ongewijzigd en 0 te schrijven. Die laatste
stap bewijst ook de tijdvergelijking: Google levert tijden met
milliseconden en een Z, de database geeft ze terug als +00, en de
vergelijking kijkt daarom naar het tijdstip en niet naar de tekst.

Stand van de tabel na de eerste vulling: 30 rijen, 26 confirmed, 4
cancelled, 2 zelf geboekt, alle vier de appkolommen leeg en geen enkele
rij zonder `eerste_created`.

Twee mengregels zijn op 9 augustus bewust aangescherpt ten opzichte van
het plan van de dag ervoor: de oudste `eerste_created` wint (anders
schuift het aanvraagmoment mee met het venster van 180 dagen) en
gevulde klant- en adresvelden worden nooit leeggemaakt door een lege
nieuwe waarde (anders wist een PDOK-storing goede adressen).

Bestanden van vandaag: `opname-boekingen-v4.ts` (39.153 bytes),
`2026-08-09_test_v4_sync.sql` en `2026-08-09_cron_opname_boekingen.sql`.

### Cronjob erbij: `opname-boekingen-dagelijks`

Elke dag om 03:45 UTC, dus 05:45 zomertijd en 04:45 wintertijd, roept
hij de functie aan met `?schrijf=1`. Aangemaakt met
`2026-08-09_cron_opname_boekingen.sql`. De sleutel staat bewust leesbaar
in de opdracht, zie de toelichting in 2.4.

### Getallen die niet sporen

In 1.2 stond 19 Edge Functions, geteld op 2 augustus, terwijl 3.2 op 3
augustus op vijftien uitkwam. Dat verschil van vier is nooit verklaard
en staat nu in 1.2 als controleerpunt: de functielijst in Studio
natellen beslist het. Verder telde dit bestand vandaag vijftien
markeringen, zestien met het nieuwe punt erbij, terwijl de lijst
achterin negen zei; dat getal is bijgewerkt naar de telling van vandaag.

### Het boekingenblokje is dezelfde dag gebouwd: v4.40.0 tot en met v4.40.2

De rijbeveiliging op `opname_boekingen` is eerst gemeten: huispatroon,
identiek aan `calculaties`, dus geen policywerk nodig. Daarna is het
blokje op het dashboard gebouwd met de knoppen Calculatie aanmaken en
Wegtikken, zie de CHANGELOG. Twee praktijkrondes dezelfde avond:
v4.40.1 vult de deadline (opname plus veertien dagen, de bestaande
autovulregel) en v4.40.2 volgt de naamconventie met de werksoort uit
het boekingsformulier zelf, gemeten uit de notities van alle dertig
boekingen.

### Nog te doen op dit spoor

- de eenmalige opruimronde: de oude boekingen in het blokje wegtikken
- v4 archiveren in `ernes-edge-functions`; de wekelijkse ophaalactie
  neemt hem bij de eerstvolgende run ook vanzelf mee, zie opruimpunt 22
- morgenochtend na 05:45 blok 5 van
  `2026-08-09_cron_opname_boekingen.sql` draaien om de eerste
  nachtelijke run te controleren

## Wat er op 12 augustus 2026 gedaan is

### De eerste echte herinnering is verstuurd, en de zin erin was fout

Op maandag 10 augustus om 08:30 stuurde `offerte-herinnering` voor het
eerst uit zichzelf een herinneringsmail, op de testofferte die op 2
augustus was gemaild (beide tijdstippen gemeten in
`offerte_accorderingen`). De automaat werkt dus van kop tot staart:
cron, poorten, venster, mail, stempel. De reparatie hieronder is twee
dagen later, op 12 augustus, gebouwd.

De zin in die mail was alleen niet goed: "Enige tijd geleden stuurden
wij u onze offerte voor Testen taken als gevolg van uitbrengen
offerte ." De functie plakte `calculaties.naam` letterlijk in de
lopende zin. De spatie voor de punt kwam niet uit het sjabloon maar uit
een naspatie in de opgeslagen naam, gemeten in de broncode: daar staat
geen spatie. De testquery van 12 augustus toonde de naspatie daarna
tussen haken in de opgeslagen naam. Het echte probleem is groter dan de testnaam: de
projectnaam volgt de conventie Achternaam | werksoort, dus een echte
klant zou "onze offerte voor Duvekot | Buitenwerk" lezen, met de eigen
achternaam erin. De projectnaam stond bovendien ook in de
onderwerpregels van beide klantmails en in de gesproken openingszin van
het belscript.

### `offerte-herinnering` v4.41.0: werksoort in de klantmails

Nieuwe helper `werksoortKlanttaal` leest het deel achter de streep van
de projectnaam en vertaalt naar klanttaal: Buitenwerk wordt "het
buitenschilderwerk", Binnenwerk "het binnenschilderwerk", Binnen- en
buitenwerk "het binnen- en buitenschilderwerk". Herkenning op de
woorden binnen en buiten, hetzelfde principe als `_opnameWerksoort` in
de app. Geen streep of niets herkenbaars, dan valt de zin terug op kaal
"onze offerte" en klopt hij nog steeds. Er wordt bewust niet vóór de
streep gezocht: daar staat de achternaam, en een naam als Buitenhuis
zou anders vals als buitenwerk herkend worden.

De onderwerpregels gebruiken nu het offertenummer: "Herinnering offerte
26-012" en "Offerte 26-012 is verlopen", met een nette kale variant als
het nummer ontbreekt. De gesproken zin van het belscript zegt "voor het
buitenschilderwerk" met terugval "uw schilderwerk". Intern verandert er
niets: taakonderwerpen, de regel Project: in de notitie, logregels en
het interne seintje behouden de volledige projectnaam, want daar moet
je hem juist wél zien.

Getest buiten de echte omgeving: esbuild-transpilatie plus node-parse,
en logische tests op `werksoortKlanttaal`, beide mails en het belscript
(zestien gevallen, waaronder de testnaam zonder streep, een achternaam
met buiten erin en naspaties). De echte-omgevingstest is dezelfde avond gedaan met
`2026-08-12_test_herinnering_v4.41.0.sql`: na deploy van v4.41.0 de
stempel `herinnering_op` teruggezet en de ronde met de hand gedraaid
via de cronopdracht uit `cron.job`. De mail van 22:38 had de kale
terugvalzin zonder projectnaam en zonder spatie voor de punt, als
onderwerp "Herinnering offerte 1111-11" met het nummer uit de
snapshot, en het interne seintje behield de projectnaam. Precies het
ontworpen gedrag, op alle drie de paden.

Bestanden van vandaag: `offerte-herinnering-v4.41.0.ts` en
`2026-08-12_test_herinnering_v4.41.0.sql`.

### Nog te doen op dit spoor

- blok 3 van het testbestand draaien: `herinnering_op` moet weer
  gevuld zijn. De functie controleert die update zelf niet op fouten
  en de stempel is de rem tegen een herhaalmail de volgende ochtend
- `offerte-herinnering-v4.41.0.ts` archiveren in `ernes-edge-functions`


## Wat er op 13 augustus 2026 gedaan is

Twee sporen op een dag. In de ochtend is de vastgelopen takensync
herbouwd, in de middag hebben de Yoobi-taken in de app een tweede regel
gekregen met de naam van het project waar ze bij horen. Vier
functieversies passeerden: `2026-08-13` (de herbouw), `b` en `c` (twee
meetversies die samen een paar uur geleefd hebben) en `d` (de
blijvende). De takenapp ging van v0.16.1 naar v0.16.4.

### De takensync liep vast en is herbouwd

**De storing.** De knop deed niets meer en de stand bleef op `bezig`
hangen. Twee oorzaken, beide gemeten in het logboek. Yoobi gaf een 429
op de token-endpoint: de functie vroeg per brok een nieuw token, zes
binnen een minuut, in de nasleep van een DDoS-aanval die Yoobi zelf
gemeld heeft. En de functie kende geen weg terug uit fase `bezig`, dus
een fout liet de app eeuwig wachten op een `idle` die niet kwam. De
stilte sinds 22 juli had een simpeler verklaring: vakantie. De sync
heeft geen cronjob en draait alleen op de knop.

**Uitgerold.** `sync_state` kreeg de kolommen `fouten_ronde` en
`geschreven_ronde` en de controle `sync_state_fase_geldig` (idle,
bezig, mislukt). De functie werd versie `2026-08-13`, met acht
wijzigingen: een token per ronde in plaats van per brok; fouten per
klant worden geteld en gelogd met statuscode, de eerste vijf volledige
teksten en de snelheidskoppen van Yoobi; vier tellers voor wat er
afvalt (uitgevoerd, geannuleerd, ruis, zonder id); de opruimregel
kreeg vier sloten, waaronder een filter `bron=eq.yoobi` dat los staat
van de trigger `bescherm_eigen`; een fout zet de stand op `mislukt`;
het ketenslot weigert nu echt, met een 409, en interne aanroepen gaan
er met `?intern=1` langs; bij een 429 stopt hij zonder aan te dringen;
en `BATCH` ging van 5 naar 2 met `PAUZE_MS` op 300, beide AANNAME want
Yoobi heeft geen limieten opgegeven. `taken.html` v0.16.2 en v0.16.3
herkennen de fase `mislukt`, tonen een 409 als uitleg in plaats van
als storing, en volgen een ronde tot twintig minuten met een
stilstandsmelder na vier minuten zonder beweging.

**De eerste geslaagde ronde, gemeten.** 11:09:30 tot 11:15:46 lokale
tijd, een druk op de knop: 812 klanten in zes brokken, nul fouten, 91
taken weggeschreven, opruimen liep met alle vier de sloten open en
verwijderde er drie. Daarmee is ook het losse eindje van 31 juli
dicht: de offerte-taken en de todo-spiegel hebben een volledige ronde
met opruimbeurt overleefd. De reparatie van `bescherm_eigen` is in
productie bewezen, niet alleen teruggelezen.

**Wat niet bewezen is.** Of de nul fouten aan de rustiger instellingen
ligt of aan herstel bij Yoobi: beide veranderden tegelijk. Het strenge
pad van de opruimregel, een ronde met fouten, is alleen in de code
gelezen. En de vraag aan Vincent Egt over de snelheidslimieten is
bewust uitgesteld tot Yoobi op adem is.

### Taken tonen nu het werk: de projectnaam uit Yoobi

**De aanleiding.** Een Yoobi-taak toonde wel de klant maar niet het
werk. Bij een klant met meerdere werken zegt "Francot laten weten
wanneer we het werk hebben ingepland" te weinig.

**De metingen die de richting omgooiden.** Het oorspronkelijke plan
was een kolom verkoopnaam, op basis van een enkele gemeten taak waarin
`crmsalename` gevuld was en `projectid` leeg. De telling over alle 86
weggeschreven open taken (meetversie `b`) draaide dat om: 1 met
verkoopnaam, 1 met verkoopcode, 78 met `projectid`. Die ene taak bleek
een uitgevoerde offertemailtaak uit 2021 en daarmee de uitzondering.
De projectmeting (meetversie `c`) maakte de rest hard: de ongefilterde
projectenlijst werkt, 1703 projecten over negen pagina's van
tweehonderd waarvan maar 180 actief, gesloten projecten doen mee, elk
project draagt zowel de GUID `projectid` als `name`, en alle 64 unieke
taak-ids werden in `projectAllCodes` teruggevonden. De acht taken
zonder `projectid` zijn werk dat nog geen project is: offertes
uitbrengen, onderhoudsplannen opstellen. Daar zegt het onderwerp zelf
al waar het over gaat.

**De bouw, drie lagen.**

1. Kolom `projectnaam` (text, nullable) op `taken`, met kolomcommentaar
   (`laag1_projectnaam_taken.sql`).
2. De bevriezing `taken_bevries_yoobi` telt nu dertien velden:
   `projectnaam` erbij, zodat het veld in de app alleen-lezen is zoals
   alle andere Yoobi-velden (`laag1b_bevriezing_projectnaam.sql`).
3. Functieversie `2026-08-13d`: bij de start van elke ronde haalt de
   sync de negen pagina's van de ongefilterde projectenlijst op, met
   de gewone adempauze ertussen, en bouwt een kaart van projectid naar
   naam. Elke weggeschreven taak krijgt `projectnaam` mee. Mislukt de
   kaart, dan draait de ronde door en wordt de kolom die ronde niet
   meegestuurd, zodat eerder gevulde namen nooit door leegte
   overschreven worden. Alleen een 429 op de kaart stopt de ronde, net
   als bij de klanten. Het rapport kreeg de velden `projectkaart` en
   `metProjectnaamDitBrok`, en beide tijdelijke metingen zijn eruit.
   `taken.html` v0.16.4 toont de volledige projectnaam als grijze
   tweede regel onder de titel, alleen als hij gevuld is. Het
   detailscherm is bewust nog niet meegegaan.

**Bewezen.** De leesquery na de eerste ronde met `d`: 86 open
Yoobi-taken, 78 met projectnaam, exact de meting. De schermfoto toont
de regels live, en twee taken van dezelfde klant laten nu in een
oogopslag zien dat ze over hetzelfde balkon gaan.

**Bijvangst.**

- In de voorbeeldenlijst van de telling stonden drie vrijwel gelijke
  Schiffelers-taken "inplannen + laten weten". Dat oogt als dubbel
  aangemaakt in Yoobi en is met de hand op te ruimen.
- Studio toont bij meerdere statements in een run alleen de laatste
  uitkomst. SQL-bestanden krijgen voortaan een statement per blok.
- De aanname dat pagina 2 tot en met 9 van de projectenlijst dezelfde
  vorm hebben als de gemeten pagina 1 is uitgekomen, anders had de
  leesquery geen 78 laten zien.

### Nog open op dit spoor

- De snelheidsinstellingen staan mogelijk te voorzichtig: een ronde
  duurt ruim zes minuten waar hij eerder anderhalve deed. Pas
  bijstellen op de snelheidskoppen uit het rapport, niet op gevoel.
- Het detailscherm van een taak toont de projectnaam nog niet.
- `yoobi-taken-sync` versie `2026-08-13d` gaat dinsdag met de
  wekelijkse ronde mee naar `ernes-edge-functions`.

## Wat er op 25 augustus 2026 gedaan is

Schilders Calc ging van v4.42.0 naar **v4.43.0**. Eén wijziging aan de
databank, twee kolommen op een bestaande tabel. Geen nieuwe tabel, geen
opslagbak, geen Edge Function, geen cronjob, geen policywerk.

### Twee kolommen op `calculaties`

| Kolom | Type | Leeg toegestaan | Waarvoor |
|---|---|---|---|
| `arch_documenten_op` | `timestamptz` | ja | wanneer de documenten van deze calculatie als gearchiveerd zijn gemarkeerd |
| `arch_getekend_op` | `timestamptz` | ja | wanneer de getekende offerte als gearchiveerd is gemarkeerd |

Aangelegd met `2026-08-24_v4.43.0_archiveer_markeringen.sql`, idempotent
via `add column if not exists`, gevalideerd met pglast v8.4 (5
statements, geen destructieve operatie) en door Gian gedraaid en
bevestigd op 25 augustus.

**Rechten.** Er is geen policy- of grantwijziging gedaan. Dat het zonder
kan is bevestigd doordat een gezette markering een herlaadslag overleeft;
was dat niet zo geweest, dan waren het kolom-grants in plaats van
tabel-grants.

### Hoe ze gevuld worden

Uitsluitend met een gerichte update van alleen het betreffende veld,
nooit via `_mapCalcHeaderToDB`. Dat is dezelfde afspraak als bij
`craft_geexporteerd_op` en `offerte_config`, en om dezelfde reden: een
gewone header-save schrijft alle gemapte velden terug, dus een oud
clientobject in een tweede tabblad zou een verse markering wissen.

Twee wegen naar binnen. Automatisch aan het einde van een **voltooide**
archiveer-reeks, waarbij de inhoud van de wachtrij bepaalt welke van de
twee valt: alleen `geaccordeerd` geeft alleen `arch_getekend_op`, alleen
andere types geven alleen `arch_documenten_op`, allebei geeft beide.
Halverwege stoppen stempelt niet. En met de hand vanuit de kolom
`Archief` op het dashboard, in beide richtingen, altijd achter een
bevestiging.

### Wat deze kolommen niet zijn

**Ze bewijzen niet dat er een bestand in de projectmap staat.** De app
weet alleen dat de PDF is aangemaakt en aan de browser is aangeboden.
Zeven van de negen documenttypes lopen via `window.print()`, en
`afterprint` vuurt daar ook af wanneer het printvenster wordt
geannuleerd. Negen keer Annuleren levert dus evengoed een markering op.
Dat is gemeten in v4.42.0 op regel 12365, waar dat gedrag ook letterlijk
in het commentaar staat, en het is bewust geaccepteerd. Wie deze
kolommen ooit voor een controle of een rapportage wil gebruiken moet dat
weten: het is een geheugensteun, geen registratie.

Daar komt bij dat elke markering met de hand weg te halen is. Er is geen
logboek van wie hem gezet of gewist heeft.

### Nog open op dit spoor

- De markeringen zijn niet sorteerbaar en er is geen filter "toon alleen
  nog niet gearchiveerd". Bewust buiten deze bouw gehouden om de
  comparator niet met de `colspan`-wijziging te mengen.
- Een teller in de statuskop, in de trant van "3 van de 10 nog niet
  gearchiveerd", is nu bijna gratis en waarschijnlijk nuttiger dan de
  losse tekens scannen. Niet gebouwd.
- Of de kolom op de iPad in staande stand niet te veel ruimte van Totaal
  afsnoept is **[TE CONTROLEREN]** op het apparaat zelf.

## Wat er op 28 augustus 2026 gedaan is

Schilders Calc ging van v4.43.0 naar **v4.45.0**, in twee stappen. Eén
wijziging aan de databank, drie kolommen op een bestaande tabel. Geen
nieuwe tabel, geen opslagbak, geen Edge Function, geen cronjob, geen
policywerk.

### Drie kolommen op `onderhoudsplannen`

| Kolom | Type | Leeg toegestaan | Waarvoor |
|---|---|---|---|
| `abo_startdatum` | `date` | ja | eerste maand waarin de klant het maandbedrag betaalt |
| `abo_aantal_maanden` | `integer` | ja | hoeveel maanden dat maandbedrag loopt |
| `toon_voorfinanciering` | `boolean` | nee, `default false` | vinkje per plan of het voorfinancieringsbeeld op de bijlage komt |

Aangelegd met `2026-08-28_v4.45.0_abo_looptijd_en_grafiek.sql`, idempotent
via `add column if not exists`, gevalideerd met pglast (9 statements, geen
destructieve operatie) en door Gian gedraaid en bevestigd op 28 augustus.
Er zit een `check`-constraint op `abo_aantal_maanden` die nul en negatief
weigert, want dat zou in de app een deling door nul geven.

**Rechten.** Geen policy- of grantwijziging. De twee bestaande policies op
deze tabel werken op `user_id = auth.uid()` en die kolom is niet aangeraakt.

**`toon_voorfinanciering` staat nog niet in de mapping.** De kolom bestaat
wel maar `_mapOhpFromDB` en `_mapOhpToDB` kennen hem niet. Dat is bewust:
zonder invoerveld zou `_ohpReadParamsFromUI` er `undefined` in schrijven en
dan wist een gewone opslag een gezette waarde. Hij komt erin op het moment
dat het vinkje er ook komt, in v4.46.0.

### v4.44.0 - de eenmalige beurt op de Offerte OHP

Een beurt die uit het gemiddelde is gehaald wordt eenmalig afgerekend na
uitvoering. Het scherm en het interne print toonden dat al, de bijlage voor
particulieren zweeg erover. Die heeft nu een blok onder het maandbedrag, een
tag op de tijdlijn en een label in het jaarblok. Alles achter `toonEenmalig`,
dat `!isVve` eist. Knop en tooltip heten voortaan **Offerte OHP**.

### v4.45.0 - het maandbedrag over een instelbaar aantal maanden

`gemPerMaand` komt niet meer uit `gemPerJaar / 12` maar uit
`totaalGemiddelde / _ohpAboMaanden(plan)`, met terugval op `looptijd * 12`.
Op **twee** plekken aangepast, `_ohpBuildPrintHTML` en `_ohpBuildOfferteHTML`,
want anders zouden het interne print en de klantbijlage een ander bedrag
tonen. De hero-ondertitel noemt de echte periode in plaats van het aantal
jaren.

`_ohpAboStart` leest de datum met een reguliere expressie en bewust **niet**
met `new Date()`. Een `date`-kolom komt als `YYYY-MM-DD` terug en de
constructor leest dat als UTC-middernacht, wat in een westelijke tijdzone een
dag terugschuift en dus in de verkeerde maand kan vallen.

### Wat hier al die tijd fout stond: `betaalmodel`

`betaalmodel` bestaat sinds v3.29.0 met waarden `contant` en `abo`. Gemeten
op 28 augustus met een grep over het hele bestand: hij werd **uitsluitend**
in de Planning-tab gelezen, om de matrix in contante en abo-rijen te
splitsen. Niet in `_ohpBuildOfferteHTML`, niet in `_ohpBuildPrintHTML`, niet
in `_ohpRenderResultaat`.

Gevolg: een plan op `contant` kreeg een Offerte OHP met bovenaan een hero
van euro zoveel per maand, terwijl die klant per beurt afrekent. Gian
bevestigde op 28 augustus dat hij die bijlage ook voor contante klanten
gebruikt, dus dat is de deur uit geweest. De particulier-hero heeft nu een
derde tak die de totale investering toont, en `toonEenmalig` eist er `isAbo`
bij omdat op een contant plan alles eenmalig is.

Dit is een **afvang, geen contante variant**. De leadteksten, de
verkooppunten en de jaarblokken zijn nog steeds geschreven vanuit het
abonnementsmodel.

### Vaste regel: VvE is altijd per beurt

Vastgelegd door Gian op 28 augustus 2026, na het tellen van de plannen in
de databank (vier stuks: drie contant en alledrie VvE, een abo en die is
particulier).

**Een VvE rekent altijd per beurt af.** De vereniging reserveert in haar
eigen MJOP-pot en betaalt Ernes op het moment van uitvoering. Er bestaat
geen abonnementsmodel voor een VvE.

Daaruit volgt:

- Het veld `betaalmodel` stuurt bij een VvE uitsluitend de splitsing in de
  Planning-matrix (regel 9615). Het heeft met het klantdocument niets te
  maken en hoeft daar ook nooit iets te sturen.
- De VvE-tak van `_ohpBuildOfferteHTML` is al in de juiste taal geschreven:
  gemiddeld per jaar te reserveren, de eigen reservepot in het
  liquiditeitsblok, en een ALV-besluit dat de jaarlijkse reservering in de
  begroting opneemt. Dat is het contante model.
- **De VvE-tak wordt niet aangeraakt.** Niet voor de eenmalig-melding, niet
  voor het maandenveld, niet voor het voorfinancieringsbeeld. Alle
  toekomstige werk aan de bijlage is particulier tenzij Gian uitdrukkelijk
  anders zegt.

De contante afvang van v4.45.0 vuurt daarom alleen bij particulier plus
contant, een combinatie die per 28 augustus nul keer voorkomt. Dat is
bewust een vangnet en geen reparatie.

### Bewust niet aangeraakt

**De VvE-tak, volledig.** Geen markering in de jaartabel, niets aan het
liquiditeitsblok, `perMaandPerApp` ongewijzigd. Op verzoek van Gian, die bij
VvE geen beurten uit het gemiddelde haalt.

**Het liquiditeitsblok klopt niet bij een uitgevinkte beurt.** De
reserveringslijn gebruikt `R = gemPerJaar` en telt dus alleen de aangevinkte
beurten, de uitgavenlijn gebruikt `bedragMee + bedragBuiten` en telt ze
allemaal. Het eindsaldo komt daardoor uit op precies min `totaalEenmalig`,
terwijl de slotzin eronder volledige dekking belooft. Gemeld op 28 augustus,
op verzoek blijven staan. **Wie ooit bij een VvE een beurt uitvinkt, moet die
grafiek niet vertrouwen.**

### Nog open op dit spoor

- De contante variant zelf: eigen leadteksten en verkooppunten in plaats van
  het abonnementsverhaal. Alleen de hero is nu afgevangen.
- v4.46.0, het voorfinancieringsbeeld achter `toon_voorfinanciering`. Bij het
  doorrekenen van het plan van 2026 bleek dat de klant op het diepste punt
  euro 10.348,08 vooruitstaat en Ernes dus niets voorfinanciert. Standaard
  uit, want in de gangbare planvorm werkt dat beeld tegen Ernes.
- Het plan loopt over `looptijd + 1` kalenderjaren (prijspeil tot en met
  eindjaar) terwijl het gemiddelde door `looptijd` deelt. Bij prijspeil 2026
  en looptijd 8 staan er negen jaartallen in de tabel. **[TE CONTROLEREN]**
  of dat ergens tot een verschil van een jaarbedrag leidt.
