# SYSTEEM.md

**Technisch continuiteitsdossier Ernes Schilders**

Dit bestand beschrijft hoe de eigengebouwde bedrijfssoftware van Ernes
Schilders in elkaar zit. Het is geschreven voor drie soorten lezers: Gian
zelf als er iets stukgaat, Max of Maud als Gian onbereikbaar is, en een
buitenstaander die het ooit koud moet overnemen.

Opgesteld 26 juli 2026.
Hoofdstuk 3 en 4 volgen in een tweede sessie.

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
binnen op een **gedeelde mailbox** die Gian, Max en Maud alledrie lezen.
Adres: **[TE CONTROLEREN, vermoedelijk info@ernes.nl]**.

Dat is bewust zo. Kwam die post op een persoonlijk adres binnen, dan zou
het systeem alleen werken zolang die ene persoon zijn mail leest.

De nachtelijke backup stuurt elke maandag een statusbericht met bijlage
naar dat adres. **Die mail is de enige kopie van de gegevens buiten
Supabase.** Zie hoofdstuk 4.

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

---

## Wat er nog niet in staat

- **Hoofdstuk 3, wat draait er automatisch.** De inventarisatie is gedaan
  en compleet, maar nog niet uitgeschreven.
- **Hoofdstuk 4, als het stukgaat.** Kan pas geschreven worden als het
  terugzetten van een backup één keer echt geoefend is. Een backup die
  nooit teruggezet is, is geen backup maar een verzameling bestanden.
- **De A4-noodkaart.** Eén vel om naast de iMac te hangen, met alleen de
  eerste handelingen en de telefoonnummers. Volgt zodra hoofdstuk 4 klaar
  is.
