# SYSTEEM.md

**Technisch continuiteitsdossier Ernes Schilders**

Dit bestand beschrijft hoe de eigengebouwde bedrijfssoftware van Ernes
Schilders in elkaar zit. Het is geschreven voor drie soorten lezers: Gian
zelf als er iets stukgaat, Max of Maud als Gian onbereikbaar is, en een
buitenstaander die het ooit koud moet overnemen.

Opgesteld 26 juli 2026, laatst bijgewerkt 30 juli 2026. Alle zes
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
| Schilders Calc | `index.html` | `GianErnes/schilders-calc` | https://gianernes.github.io/schilders-calc/ | v4.39.0 |
| Taken | `taken.html` | `GianErnes/schilders-calc` | https://gianernes.github.io/schilders-calc/taken.html | v0.15.0 |
| Financieel | `financieel.html` | `GianErnes/schilders-calc` | https://gianernes.github.io/schilders-calc/financieel.html | v1.0.3 |
| Voorraad | `voorraad-app_2.html` | `GianErnes/voorraad-app` | https://gianernes.github.io/voorraad-app/voorraad-app_2.html | [TE CONTROLEREN] |

**Let op bij Voorraad.** In die repo staat geen `index.html`. Het korte
adres `gianernes.github.io/voorraad-app/` werkt daarom niet. Je moet de
volledige bestandsnaam kennen, inclusief de `_2`. Zolang dat zo is, is de
app alleen te vinden door wie het adres nog heeft. Op de opruimlijst staat
dit als punt 4.

**Gevelscanner** is op 26 juli 2026 bewust buiten dit document gelaten.
Dat is een besluit en geen vergissing. Bestaat die app nog en raakt hij
bedrijfsgegevens, dan hoort hij hier alsnog in.

### 1.2 De databases

Twee Supabase-projecten, allebei in dezelfde organisatie **Gian Ernes**,
abonnement **Pro**, allebei op AWS in regio `eu-west-1`, allebei
computegrootte Nano.

| Project | Verwijzing | Gebruikt door |
|---|---|---|
| `schilders-calc` | `gjcjpigirqbpkjkymbio` | Calc, Taken, Financieel |
| `schilder-voorraad` | `rcwlbcfuvfprnnkypbba` | Voorraad |

Adres van een project is altijd `https://<verwijzing>.supabase.co`.

**schilders-calc** telt 37 tabellen, 6 opslagbakken, 11 triggers, 18 Edge
Functions en 8 cronjobs. De grootste tabellen zijn `calc_regel_stappen`
(1959 rijen), `meetstaat` (747) en `bewerkingen` (548).

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
| `schilders-calc` | **openbaar** | de vier appbestanden, `sql/`, dit document |
| `schilder-voorraad` | **openbaar** | de voorraad-app |
| `ernes-edge-functions` | **besloten** | de broncode van alle achttien Edge Functions, plus de twee knoppen |

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
| **Functies ophalen uit Supabase** | elke zondag 03:00 UTC, en met de hand | haalt de broncode van alle achttien functies op en legt die vast in de repo, plus `functies-overzicht.json` met de instelling per functie |
| **Functies uitrollen naar Supabase** | alleen met de hand, en alleen na `JA` intikken | rolt alle achttien functies in één keer uit naar een op te geven project |

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
**alle acht cronjobs** hun sleutel daaruit op. In de kluis staan drie
geheimen:

| Naam in de kluis | Hoort gelijk te zijn aan | Gebruikt door |
|---|---|---|
| `maandbericht_key` | **[TE CONTROLEREN]**, gaat mee als `Authorization: Bearer` | `maandbericht-maandelijks`, `yuki-vuller-dagelijks`, `yuki-vuller-middag`, `yuki-vuller-avond` |
| | **Let op:** die laatste drie roepen `smooth-function` aan, niet `maandbericht`. Eén sleutel doet hier dus twee verschillende functies. Vervang je `maandbericht_key`, dan stopt óók je financiele dashboard met bijwerken, en cron blijft gewoon `succeeded` melden. Bevestigd uit `cron.job` op 30 juli 2026. | |
| `aftap_secret` | de Edge Function secret `AFTAP_SECRET` | `backup-nachtelijk`, `taken-mail-melding`, `werkvoorraad-sync-wekelijks` |
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

### 3.1 De acht cronjobs

Allemaal in `schilders-calc`, allemaal actief.

> **Alle tijden hieronder staan in UTC.** Dat is de tijd waarin cron
> werkt en waarin de logboeken van Supabase de runs tonen. UTC schuift
> niet mee met de zomertijd en onze klok wel, dus het verschil is 's
> zomers twee uur en 's winters één uur. Reken altijd om voordat je
> concludeert dat er iets niet gedraaid heeft.

| Naam | UTC | Bij ons, zomer | Bij ons, winter | Roept aan | Wat het doet |
|---|---|---|---|---|---|
| `backup-nachtelijk` | 02:00 | 04:00 | 03:00 | `backup-dump` | dump van de database naar de bak `backups`, plus kopie van foto's en documenten. Stuurt maandag een statusmail |
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

### 3.2 De vijftien Edge Functions

Het waren er achttien tot 27 juli 2026. Toen zijn `taken-meldingen`,
`yoobi-kijkglas` en `yoobi-project-probe` verwijderd, alle drie na
vaststelling dat ze zesentwintig dagen lang nul keer waren aangeroepen.
`taken-agenda` stond ook op die lijst maar leeft nog, zie de opruimlijst.

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
`fin-werkvoorraad-sync`, `maandbericht`.

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
| `yoobi-taken-sync` | Taken | taken uit Yoobi |

`offerte-herinnering` wordt zowel door cron als vanuit de app aangeroepen.

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

### 3.3 De elf triggers

Allemaal op tabellen in `schilders-calc`, allemaal actief.

| Trigger | Op tabel | Wat het doet |
|---|---|---|
| `trg_offerte_taken` | `calculaties` | maakt taken aan als een offerte van status wisselt |
| `trg_todo_taken` | `todos` | spiegelt een todo uit de calculatie naar de takenapp |
| `trg_taken_todo_terug` | `taken` | spiegelt terug van taak naar todo |
| `bescherm_eigen` | `taken` | voorkomt dat iemand andermans taak aanpast |
| `bevries_yoobi` | `taken` | beschermt velden die uit Yoobi komen |
| `zet_bijgewerkt` | `taken` | zet de bijwerkdatum |
| `trg_bewerkingen_upd` | `bewerkingen` | zet de bijwerkdatum |
| `trg_materialen_upd` | `materialen` | zet de bijwerkdatum |
| `trg_ondergronden_upd` | `ondergronden` | zet de bijwerkdatum |
| `trg_settings_upd` | `settings` | zet de bijwerkdatum |
| `trg_verfsystemen_upd` | `verfsystemen` | zet de bijwerkdatum |

Triggers zijn het makkelijkst te vergeten onderdeel van dit systeem,
omdat ze nergens zichtbaar zijn en geen logboek bijhouden. Ze doen werk
waarvan iedereen denkt dat de app het doet.

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

**Twee bekende uitzonderingen.** De tabellen `sync_state` en
`taken_melding_sleutels` hebben rijbeveiliging aan en **nul policies**.
Volgens `sql/README.md` is dat een rode vlag. Hier is het bewust: die
tabellen worden alleen door Edge Functions gevuld, en die werken met de
servicesleutel en gaan langs de rijbeveiliging heen. **Zet er geen policy
op om het te repareren.** Dan open je ze voor iedereen die is ingelogd.

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

> **De blinde vlek van cron.** Zeven van de acht cronjobs gebruiken
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
| **De achttien functies uitrollen** | n.v.t. | **uren klikwerk** |
| De acht cronjobs | ja, hoofdstuk 3.1 | half uur |
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
| 37 tabellen | `schema_dump()` | ja |
| 52 policies op `public` | `schema_dump()` | ja |
| **16 policies op `storage.objects`** | `schema_dump()` | ja |
| 29 indexen | `schema_dump()` | ja |
| 17 databasefuncties | `schema_dump()` | ja |
| 11 triggers | `schema_dump()` | ja |
| rechten en rijbeveiliging | `schema_dump()` | ja |
| 6 opslagbakken | `schema_dump()` | ja |
| 25 verwijssleutels | `schema_dump()` | ja, onderaan als `ALTER TABLE` |
| 1 reeks (`taak_dagkeuze_id_seq`) | `schema_dump()` | ja, plus `setval` |
| 8 cronjobs | `schema_dump()` en 3.1 | ja, adres handmatig aanpassen |
| views | n.v.t., er zijn er geen | — |
| de drie kluissleutels | **nee, met opzet** | met de hand |

> **Splits altijd per schema bij het tellen van policies.** Het getal 69
> uit de inventarisatie van 27 juli is geen 69 policies op `public` maar
> 53 op `public` plus 16 op `storage.objects`. Sinds 2 augustus 2026 zijn
> het er 52 plus 16, samen 68: opruimpunt 17 haalde een dubbele weg. Op 30 juli 2026 werd een
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
In `ernes-edge-functions` zit een knop die alle achttien functies in één
keer uitrolt naar een op te geven project. Zie 2.1. Wat uren klikwerk was
is nu één handeling van een halve minuut.

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
   het project het **nieuwe** ref in en tik `JA`. Zie 2.1
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
6. **`taken-mail-melding` van de klok halen.** Die draait nu elke twee
   minuten, ruim 700 keer per dag.

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
9. **De maandagbijlage vervangen door iets dat blijft werken.** Het
   backupbestand groeit met ongeveer 0,13 MB per dag en loopt naar
   verwachting begin december tegen de grens van een mailbijlage aan.
   Gebeurt dat, dan stopt de enige kopie buiten Supabase zonder dat
   iemand het merkt. Alternatief: comprimeren, of wegschrijven naar een
   plek buiten Supabase in plaats van meesturen. Zie 4.7.
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
18. **Automatische taken rond offerte en akkoord.** Twee taken die vanzelf
    ontstaan, naast de backup uit punt 1 en niet in plaats daarvan:
    - **bij versturen van een offerte:** taak om alle stukken,
      calculatiegegevens en de offerte zelf, in Yoobi bij verkoop te zetten
    - **bij een akkoord:** taak om de getekende offerte er in verkoop bij
      te zetten

    Doel is **vindbaarheid**, niet bewaring. Een PDF in een backup-bak is
    iets dat je terug kunt halen als je weet dat je het kwijt bent. Iets
    in Yoobi is een archief waar je in kunt zoeken als een klant er over
    twee jaar over belt.

    Aandachtspunt bij de bouw: hoeveel offertes gaan er per week uit? Bij
    meer dan een paar wordt de eerste taak ruis, en ruis vink je weg
    zonder te kijken. Dan lijkt het geregeld terwijl het dat niet is.
    Overweeg of die taak bij Gian hoort of bij Maud, die het
    verwerkingswerk toch al doet. Uitbreiden van de bestaande trigger
    `offerte_taken_sync`, geen nieuw bouwwerk.

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

    Wat overblijft is dat `TO public` misleidend leest en dat iemand het
    patroon zou kunnen kopiëren zonder de voorwaarde. Besluit van Gian:
    geneuzel, niet aan beginnen.
---

## Wat er nog niet in staat

- **De negen plekken met [TE CONTROLEREN].** Vooral de kluis, het adres
  van de gedeelde mailbox, wie welke rol heeft, en de contactgegevens van
  Ed en Vincent.
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
  `eu-west-1`, de achttien functies uitrollen, het herbouwbestand draaien,
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
