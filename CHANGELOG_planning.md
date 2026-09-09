# CHANGELOG planning.html

## v0.10.0 — Ziekdagen uit Personeel op het bord, 09-09-2026

Het bord leest de view `pers_verzuim_dagen` uit de personeelsmodule (alleen leesbaar voor wie `ziet_personeel` heeft). Elke ziekdag komt als regel in dezelfde verlof-map: 100% ziek blokkeert de hele dag (licht rood, "z" in plaats van ✕), gedeeltelijk ziek telt als reservering van norm × percentage, zodat de rest van de dag inplanbaar blijft. Een eigen verlofregel op dezelfde dag wint. Klik op een ziekdag in de totaalrij geeft geen "Opheffen" maar de tekst dat dit in Personeel is gemeld. Planning schrijft nooit in personeel. Is de view niet leesbaar, dan gaat het bord zonder ziekdagen verder (console.warn), zoals bij `plan_verlof`.

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
