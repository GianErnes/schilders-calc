# SYSTEEM.md

**Technisch continuiteitsdossier Ernes Schilders**

Dit bestand beschrijft hoe de eigengebouwde bedrijfssoftware van Ernes
Schilders in elkaar zit. Het is geschreven voor drie soorten lezers: Gian
zelf als er iets stukgaat, Max of Maud als Gian onbereikbaar is, en een
buitenstaander die het ooit koud moet overnemen.

Opgesteld 26 juli 2026, bijgewerkt 27 juli 2026. Alle zes hoofdstukken
zijn ingevuld.

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
Functions en 7 cronjobs. De grootste tabellen zijn `calc_regel_stappen`
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

Eén account: **GianErnes**. Daaronder hangen beide repositories. Er is
geen tweede GitHub-account in gebruik.

Beide repositories zijn **openbaar**. Dat betekent dat iedereen op
internet het adres van je Supabase-projecten kan lezen en de publieke
sleutel die de apps gebruiken. Bij Supabase is dat normaal en op zichzelf
geen probleem, **maar alleen** omdat op alle tabellen in beide projecten
rijbeveiliging aanstaat en elke tabel een policy heeft.

> **Zet nooit RLS uit.** Doe je dat, dan ligt op hetzelfde moment de hele
> administratie op straat, want de sleutel om binnen te komen staat
> openbaar in de repo. Dit is de belangrijkste veiligheidsregel van het
> hele systeem.

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
- AFTAP, geheim voor de backupfunctie

De volledige lijst zoals die werkelijk in Supabase staat is
**[TE CONTROLEREN]**. Die is te vinden in Supabase Studio onder Edge
Functions, Secrets, per project.

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

### 3.1 De zeven cronjobs

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

### 3.2 De achttien Edge Functions

De broncode van alle achttien staat sinds 26 juli 2026 in de besloten
repo `GianErnes/ernes-edge-functions`. Dat is nodig, want een backup van
Supabase neemt Edge Functions **niet** mee.

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

**Eerste handeling:** kijk in de uitdraai wanneer `yuki-vuller-dagelijks`
en `yuki-vuller-middag` voor het laatst gedraaid hebben. Staan die op
vanmorgen, dan ligt het aan Yuki en niet aan ons.

**Let op:** de tabel `fin_dashboard` bevat één regel die twee keer per dag
overschreven wordt. Geeft Yuki een keer niets terug, dan staat er nul en
is de goede stand van gisteren weg. De maandberichten blijven wel bewaard
in `fin_berichten`.

**Verschil met Yuki zelf is normaal.** De app maakt een momentopname om
07:00. Yuki Monitor telt de boekingen van gedurende de dag mee, en
afschrijvingen. Vergelijk alleen 's ochtends, dan kijken beide naar
dezelfde stand.

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

## Opruimlijst per 26 juli 2026

Werk dat uit de inventarisatie van 26 juli naar voren kwam en nog open
staat.

**Afgerond op 26 juli:** de broncode van alle achttien Edge Functions
staat nu in de besloten repo `ernes-edge-functions`, en het terugzetten
van een backup is één keer echt geoefend en werkte.

1. **`accord-pdf` opnemen in de nachtelijke backup.** De platformbackup
   van Supabase bevat uitdrukkelijk geen bestanden, alleen de database. De
   eigen nachtelijke spiegel pakt alleen `calculatie-fotos` en
   `calculatie-documenten`. De 66 getekende akkoorden hebben daarmee op
   dit moment geen enkele backup. Van alles in het systeem is dat het
   enige met juridische waarde.
2. **`smooth-function` hernoemen.** Die functie staat in de lijst als
   `yuki-test` maar draait tweemaal daags het financiele dashboard vol.
   Wie ooit opruimt gooit een ding dat naar test heet zonder aarzelen weg.
   Hernoemen, en de twee cronjobs meeverhuizen.
3. **Vier ongebruikte Edge Functions verwijderen:** `taken-agenda`,
   `taken-meldingen`, `yoobi-kijkglas` en `yoobi-project-probe`. Bij alle
   vier staat de wachtwoordcontrole uit. Bij `taken-agenda` eerst de
   agenda-abonnementen van de telefoons halen, anders blijft er een
   kapotte koppeling achter.
4. **`index.html` toevoegen aan de voorraad-repo**, zodat het korte adres
   werkt en de app vindbaar blijft zonder de exacte bestandsnaam.
5. **Systeemstatus-scherm bouwen.** Een pagina die per achtergrondtaak
   toont wanneer die voor het laatst goed gelopen is. Geen geschreven
   pagina kan vertellen of de backup vannacht gedraaid heeft, een scherm
   wel.
6. **`taken-mail-melding` heroverwegen.** Die draait nu elke twee minuten,
   ruim 700 keer per dag. De kosten zijn geen punt, de logtabellen groeien
   er wel hard van vol.
7. **`sql/audit_query_periodiek.sql` samenvoegen tot één resultaat.** Nu
   vier losse opdrachten, waarvan Supabase Studio er maar één toont. De
   kwartaalcontrole meet dus drie van zijn vier dingen zonder ze te laten
   zien.
8. **`sql/template_nieuwe_tabel.sql` alsnog maken.** De README in die map
   verwijst ernaar als de manier om een nieuwe tabel aan te leggen, maar
   het bestand bestaat niet. Wie die instructie volgt loopt vast, en maakt
   dan een tabel zonder policies waar de app niet bij kan.
9. **De maandagbijlage vervangen door iets dat blijft werken.** Het
   backupbestand groeit met ongeveer 0,13 MB per dag en loopt naar
   verwachting begin december tegen de grens van een mailbijlage aan.
   Gebeurt dat, dan stopt de enige kopie buiten Supabase zonder dat
   iemand het merkt. Alternatief: comprimeren, of wegschrijven naar een
   plek buiten Supabase in plaats van meesturen. Zie 4.7.
10. **Een schemadump toevoegen aan de nachtelijke backup.** Nu wordt
    alleen de inhoud weggeschreven, niet de structuur van de database.
    Zonder tabeldefinities, policies en triggers is die JSON alleen
    bruikbaar als er al een werkende database staat om hem in te gieten.
    Zie 4.7.

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
