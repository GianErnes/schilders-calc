## v3.14.1 — Rayon-indicator: positie onder input-veld
De v3.14.0 indicator was geplaatst als `<span>` rechts naast het "Reisafstand (km enkele reis)" label. In de praktijk bleek dat de tekst "● binnen rayon (≤ 15 km) — geen reisuren" te lang om naast het label te passen: in normale form-grid kolommen werd hij gebroken over twee regels, met het bolletje rechts boven de uitleg-tekst. Rommelige aanblik die de hele label-rij ontregelt.
- **Verplaatsing**: indicator-element is nu een `<div>` ONDER het input-veld, in dezelfde form-cell. Krijgt eigen regel, zonder de label-rij te ontregelen.
- **Pill-styling**: ongewijzigd (groen voor binnen rayon, oranje voor buiten). Block-element van de div container zorgt voor natuurlijke left-alignment onder het invoerveld.
- **Patroon consistent** met andere secundaire-info-velden in de UI (Risico, Rayon-grens in instellingen) die ook hun uitleg onder het invoerveld tonen.

## v3.14.0 — Rayon-drempel voor reiskosten
Concurrentie-strategie: binnen het natuurlijke werkgebied wil Gian competitief blijven met lokale schilders die geen reiskosten hoeven door te rekenen, maar buiten dat gebied wel de volledige reistijd doorberekenen. Nieuwe instelling + bijbehorende rekenlogica + visuele indicator + transparante offerteweergave.

**Nieuwe instelling: `rayonDrempel`**
- UI: Instellingen → Uurtarieven → "Rayon-grens (km enkele reis)" met uitleg "Binnen deze afstand: alleen km-vergoeding, geen reisuren-arbeid"
- Default: 15 (passend bij Gian's werkgebied vanuit Koperslager 2 Heerlen — dekt heel Parkstad, Heuvelland tot Cadier en Keer, en Aachen-regio)
- Backward-compat: bestaande settings krijgen automatisch `rayonDrempel: 15` bij eerstvolgende load
- Opslag: standaard via `updSetting` → `_saveSettingsDB` → Supabase `settings.snapshot_json`

**Rekenlogica aangepast op vier plekken**
Reiskosten waren tot nu: `reisTotaal = (reisUren × reistijdTarief) + (km × kmTarief)`. Nieuwe regel:
```js
const binnenRayon = reisAfstand <= rayonDrempel;
const reisKostenUren = binnenRayon ? 0 : reisUren * sett.reistijd;
const reisTotaal = reisKostenUren + reisKm;
```
Binnen rayon: alleen km-vergoeding. Buiten rayon: ongewijzigd t.o.v. v3.13.x.

Vier berekenings-plekken (allemaal identieke logica):
- `_calcTotaal` (regel ±4163) — primaire calc-totaal-functie, gebruikt overal
- Tweede berekening voor print/PDF (regel ±5338)
- Derde berekening voor Yoobi-export (regel ±5653)
- Vierde berekening voor werkbon (regel ±8214)

**Visuele indicator naast calcReis-input**
Naast het reisafstand-veld een pill die direct toont waar de calc staat:
- ≤ 0 km: leeg
- ≤ rayonDrempel: groen "● binnen rayon (≤ 15 km) — geen reisuren"
- > rayonDrempel: oranje "● buiten rayon (> 15 km) — volledige reiskosten"

Triggers via `_renderRayonIndicator()`:
- `onchange` op `#calcReis` input
- In `updSetting` als `field === 'rayonDrempel'`
- Aan einde van `openCalc` (init bij laden van calc)

**Print/PDF aangepast**
- Calc-opbouw reis-regel: bij binnen rayon "Reis (X km, binnen rayon)" i.p.v. "Reis (X u + X km)"
- Settings-overzicht onderaan offerte: extra regel "Rayon-grens (geen reisuren-arbeid binnen): 15 km" voor transparantie naar de klant — laat zien dat het bedrag eerlijk is gebaseerd op afstand, geen verborgen toeslag of korting.

**Sessie-aantekening** Implementatie verspreid over vijf logische stappen met tussentijdse `cp` naar `/mnt/user-data/outputs/` als bescherming tegen herhaling van de mount-uitval die in v3.13.6 optrad. Geen uitval voorgekomen tijdens de bouw zelf, maar de CHANGELOG-mount viel uit op het moment van CHANGELOG-update — wat zonder de discipline het hele CHANGELOG-werk verloren had laten gaan. Discipline werkt.

## v3.13.6 — Stap-weergave: materiaal nu op verkoopprijs (consistent met arbeid)
In de stap-weergave binnen een calc-regel werd het materiaal-bedrag (zowel het label achter de materiaalnaam als de bijdrage in het stap-totaal rechts) gebaseerd op de **inkoopprijs**, terwijl de arbeidskosten al op **verkooptarief** stonden (uurloon × uren). Een verborgen inconsistentie: je zag bij Sigmatex `(0,160 L · € 1,33)` en een stap-totaal van € 13,83 per m², terwijl het werkelijke verkoopwaarde (incl. groeps-opslag) hoger ligt. Het **eindtotaal** van de calculatie was wel altijd correct (`_calcTotaal` gebruikt al `matVerkoop` op regel 4185) — het probleem zat puur in de tussen-weergave die de gebruiker gebruikt om regels en stappen te beoordelen.
- **Wijziging**: `const matKost = cs.matInkoop;` → `const matKost = cs.matVerkoop;` in de stap-rendering (renderRegel, regel ±7026).
- **`calcSnapshotStep` levert al beide waarden**: `matInkoop` (basis) en `matVerkoop` (incl. groeps-opslag). De fix kiest alleen de juiste van de twee — geen rekenwijziging, geen DB-migratie.
- **Effect zichtbaar bij**: alle stappen met een materiaal dat in een groep zit met >0% opslag. Stappen zonder materiaal (`matInkoop = matVerkoop = 0`) zijn onveranderd.
- **Achtergrond**: een toekomst-Gian zou hier vrijwel zeker over een maand weer over struikelen ("waarom klopt het stap-totaal niet met wat onderaan staat?") — daarom direct opgelost in plaats van als bekend artefact laten staan.
- **Sessie-aantekening**: deze fix is twee keer gemaakt. Eerste poging ging verloren toen `/mnt/project` tijdens de sessie geremount werd (vermoedelijk getriggerd door wijzigingen aan project knowledge in de Claude.ai UI). Workaround: na elke kritieke wijziging direct `cp` naar `/mnt/user-data/outputs/` zodat de file beschermd is tegen een tweede mount-uitval.

## v3.13.5 — Stap-regel: minuten ook geschaald met percentage
In een calc-regel werd op stap-niveau bij een afwijkend percentage (bv. 50%) maar drie van de vier getallen meegeschaald: prijs per eenheid (€), totale uren in de regel (→ uur) en stap-totaal (€ rechts). Het vierde getal — `minuten per eenheid` — bleef hardnekkig op de bibliotheek-norm staan. Bijvoorbeeld: een stap "Repareren stucwerk" met norm 6 min/m² toonde bij 50% nog steeds `6,00 min` terwijl `(€ 3,75)` ernaast al de geschaalde waarde was (= 3 min × €1,25/min bij uurloon €75). Eén getal bleef hangen op een ander referentiekader dan de rest.
- **Wijziging**: `${fmt(st.minuten)} min` → `${fmt(cs.minuten)} min` in de stap-regel rendering (renderRegel, regel ±7036). Door `cs.minuten` te gebruiken (= `st.minuten × percentage/100`, geleverd door `calcSnapshotStep`) i.p.v. de rauwe norm-waarde, scaled de minuten-weergave automatisch mee met het percentage-veld.
- **Geen impact op berekeningen**: alle reken-output (uren, prijzen, totalen) gebruikt al `cs.uren`/`cs.minuten`, die het percentage al verwerken. Dit is puur een weergave-fix.
- **Bibliotheek-norm**: voor wie de ongeschalde 6,00 min wil zien, blijft die zichtbaar in de bewerkingen-tab. In de calc-regel staat voortaan alleen wat er daadwerkelijk in déze regel wordt gerekend.
- **Effect bij 100%**: geen — daar is `cs.minuten === st.minuten`. De wijziging is alleen merkbaar bij regels die op een ander percentage dan 100% staan.

## v3.13.4 — Duplicaat-uitlog-knop verwijderd uit Instellingen
Er stond nog een tweede `logout()`-knop onderaan in het **Data Beheer**-blok in Instellingen — een restant uit een eerdere versie, vóór de uitlog-knop in de header werd toegevoegd. Semantisch onlogisch (uitloggen ≠ data-beheer) en visueel verstopt — je moest scrollen om 'm te zien, terwijl er al een nette knop rechtsboven in de header staat.
- Knop `⎋ Uitloggen` weggehaald uit de "Data Beheer"-sectie van Instellingen.
- Header-knop `🔒 Uitloggen` blijft op zijn logische plek naast `🔑 Wachtwoord`.
- `logout()`-functie zelf blijft in de code, wordt nog gebruikt door de header-knop en door de auto-signOut bij wachtwoord-recovery.

## v3.13.3 — Materiaal-eenheid 'm' (meter) toegevoegd
De materiaal-eenheid dropdown bood alleen `L`, `kg` en `stuk` — geen `m`. Voor renovlies (Conpart GroundVlies 4090, Erfurt, etc.) klopt geen van die drie: vlies komt op rollen en wordt per lopende meter ingekocht. Verbruik-relatie is daarbij `meter rol per m² muur` (ongeveer 1,2 m per m² afhankelijk van rolbreedte en snijverlies).
- **Wijziging**: `['L','kg','stuk']` → `['L','kg','m','stuk']` in `renderMaterialen()` (regel ±5119). Logische volgorde: vloeibaar / gewicht / lengte / aantal.
- **Info-tekst** boven de materialen-tab bijgewerkt van "L/kg/stuk per eenheid" naar "L/kg/m/stuk per eenheid".
- **Geen DB-migratie nodig**: de `eenheid`-kolom op `materialen` is een vrije string. Bestaande materialen met 'L'/'kg'/'stuk' blijven werken. Materialen die ten onrechte als 'L' waren ingesteld (zoals waarschijnlijk de huidige Conpart GroundVlies bij Gian) kunnen via de dropdown handmatig naar 'm' worden gezet.
- **Automatische weergave in calculaties**: het verbruik-label in bewerkingen wordt opgebouwd als `{materiaalEenheid}/{bewerkingEenheid}`. Een renovlies-materiaal op 'm' bij een bewerking op 'm²' toont voortaan dus `m/m²` (i.p.v. de onjuiste `L/m²`).

## v3.13.2 — Kopieer-icoon groter
Het ⧉-symbool nam in de knop visueel weinig ruimte in vergeleken met de beschikbare ruimte van het kader. In gebruik bleek dat een gemiste kans — er is plaats om het icoon prominenter te maken zonder de knop op te blazen.
- `font-size: 1.05rem` (was 0.72rem via `btn-sm`)
- `line-height: 1` zodat de extra hoogte de knop-hoogte niet beïnvloedt en het symbool netjes verticaal gecentreerd blijft
- Knop-afmetingen onveranderd (padding via `btn-sm` blijft)

## v3.13.1 — Kopieer-icoon zichtbaar gemaakt
Het ⎘-symbool (U+2398 NEXT PAGE) op de onderdeel-kop bleek visueel te vervagen in zijn eigen wit-op-wit knopvak. Op een screenshot tijdens gebruik bleek de knop een leeg kader te lijken, wat de hele feature onvindbaar maakte voor iemand die niet wist dat 'ie er moest zijn.
- **Symbool gewijzigd**: ⎘ → **⧉** (U+29C9, SQUARED TIMES). Twee overlappende vierkanten — de universele "kopieer/dupliceer"-conventie zoals in macOS, Windows en de meeste design-tools. Door bijna iedereen herkend als "kopie maken" zonder verdere uitleg.
- **Kleur**: het symbool krijgt `color: var(--blue)` met `font-weight: 700`, zodat het fel afsteekt tegen de witte knop-achtergrond. Knop-styling zelf blijft `.btn-secondary btn-sm` om visueel ondergeschikt te blijven aan de × verwijder-knop (rood/danger blijft de visueel zwaarste actie).
- **Niet veranderd**: positie (links van ×), tooltip, klikgedrag, modal.

## v3.13.0 — Regels kopiëren tussen onderdelen
**Herstel van een feature die er ooit was en op 20 mei verloren ging bij de versie-merge.** Bij grotere objecten — Siltjens-achtige zorgcentra met 7 vergelijkbare kamers, appartementencomplexen — is het invoeren van alle calc-regels per kamer onwerkbaar. Workflow nu: maak één kamer compleet, klik op het nieuwe `⎘`-icoon in de onderdeel-kop (naast ×), en kies via een modal welke andere onderdelen in dezelfde hoofdgroep de regels moeten erven.
- **Knop**: `⎘` in `.btn-secondary btn-sm` stijl op de `onderdeel-head`, links van de delete-`×`. Tooltip "Regels kopiëren naar andere onderdelen".
- **Modal `#kopieerRegelsModal`**: lijst van alle andere onderdelen in dezelfde hoofdgroep, met checkbox per target. Per target wordt het aantal al bestaande regels getoond (of "(leeg)"). Standaard staan álle checkboxes uit — bewuste keuze door gebruiker. Knoppen "Selecteer alle" / "Deselecteer alle" voor snel werk.
- **Scope**: alleen targets binnen dezelfde hoofdgroep. Wilde je tussen Binnen en Buiten kopiëren, dan zou de UI verwarrend worden (over scrollen heen, niet duidelijk welke set je bekijkt). Voor nu pragmatisch beperkt; uitbreidbaar in een later v3.14.x als er behoefte is.
- **Gedrag**: TOEVOEGEN, niet vervangen. Bron-regels komen achter de bestaande regels van het target. Voor lege targets is er geen verschil; voor targets met eigen werk (bv. een Badkamer met 2 unieke regels) blijft alles staan en kan de gebruiker daarna eventueel overbodige nieuwe regels weghalen.
- **Wat gaat mee**: snapshot-data (systeemNaam/Eenheid/Ondergrond/Locatie), hoeveelheid, toeslag, alle stappen met hun snapshot (bewerking-data, materiaal-data, percentages), en het `actief`-veld van de regel. Volgorde: doortellen vanaf de laatste regel in het target met stappen van 10.
- **Wat NIET mee gaat**: meetstaat-koppelingen. Die zijn per regel-ID en horen per kamer uniek te zijn — een meting van 4 kozijnen in Kamer 1 mag niet stilletjes meegekopieerd worden naar Kamer 2.
- **DB-patroon**: gebruikt `_insertRegelDB(payload, targetOdId)` exact zoals `dupCalc` dat doet — inclusief stappen-array in dezelfde call, geen aparte stap-inserts. Nieuwe regel-IDs komen uit Supabase, consistent client ↔ server.
- **Edge cases**:
  - Bron heeft 0 regels → toast "Geen regels om te kopiëren", modal opent niet.
  - Hoofdgroep heeft maar één onderdeel (= de bron zelf) → toast "Geen andere onderdelen in deze hoofdgroep", modal opent niet.
  - Geen targets aangevinkt bij klik op "Kopieer regels" → toast.
  - Inserts deels mislukt → toast vermeldt dat expliciet, geslaagde inserts blijven staan (geen rollback).
- **Lock-status**: knop is altijd zichtbaar, ook in vergrendelde calcs (verzonden/geaccepteerd) — consistent met `delOd` dat ook geen lock-check doet. Pragmatisch: in de praktijk komt deze use case vooral voor in concept-fase.
- **Feedback**: toast met "X regels gekopieerd naar Y onderdelen" bij succes, ok-kleur. Bij gedeeltelijk falen err-kleur met "(sommige inserts mislukt)".

## v3.12.0 — Dashboard: groepering per status + sorteerbare kolommen
De calculatie-lijst groeide onhandig: tientallen rijen door elkaar, met "Verloren" en oude "Geaccepteerd"-calcs die boven nieuwe Concepten konden eindigen zodra `gewijzigd` ergens werd geraakt. Nu wordt de lijst opgebroken in vijf secties — Concept, Gereed, Verzonden, Geaccepteerd, Verloren — elk met een klikbare kop (▸/▾), telling, status-bolletje in de kleurcode, en sectie-totaal incl. BTW.
- **Default open**: Concept + Gereed. **Default dicht**: Verzonden, Geaccepteerd, Verloren. Lege secties worden niet getoond (geen "Verloren (0)"-spookjes).
- **State**: alleen in geheugen — geen `localStorage`. Elke nieuwe sessie reset naar deze defaults. Bewust: als je de browser sluit en terugkomt, vind je het werk-in-uitvoering bovenin en het archief uit de weg.
- **Sorteerbare datakolommen**: Opname, Deadline, Gewijzigd, Totaal incl. BTW. Klik op de kolomkop schakelt tussen ↑ en ↓ (2-klik cyclus, zoals afgesproken). Niet-actieve kolommen tonen een dof ↕-indicator. Naam en Status blijven niet-sorteerbaar — die zijn geen "data" in dezelfde zin (Naam is alfabetisch wat al via groeperen onlogisch wordt; Status is juist de groeperings-as).
- **Sorteer-keuze geldt over alle secties tegelijk**, niet per sectie apart. Anders ontstaat een visueel inconsistent beeld waarbij Concept aflopend op datum staat en Verzonden oplopend op bedrag.
- **Default sortering** per sessie: Gewijzigd ↓ (identiek aan v3.11.x-gedrag).
- **Lege waarden zakken altijd naar onderaan**, ongeacht op- of aflopend. Calcs zonder opname-datum of zonder bedrag verdwijnen anders bovenaan een ↑-sortering en duwen je actieve werk weg. De richting bepaalt alleen de volgorde van de niet-lege waarden.
- **Sectie-totaal incl. BTW** in de kop berekent zich op dezelfde manier als de bedrag-cel: live `_calcTotalForArchive` voor geladen calcs, anders de `totaalInclBtw`-cache uit DB. Calcs zonder bekend totaal tellen voor 0 mee en tonen — in hun bedrag-cel.
- **Behouden**: actieve-calc highlight, deadline-kleuren (rood verstreken / oranje binnen 3 dgn), "op tijd / +X dg"-label op Gewijzigd voor verzonden/geaccepteerd, inline status-dropdown, actie-knoppen rechts.

## v3.11.6 — Bandering-contrast verdubbeld
De 4%-zwart-overlay uit v3.11.5 was visueel te subtiel om in de praktijk te functioneren — Gian's oog kon de regel-rij nog steeds niet onderscheiden van de stappen-bewerkingen eronder. Tint verdubbeld naar `rgba(0, 0, 0, 0.08)` (8% zwart). Nog steeds geen schreeuwerige bandering, wel het oog-prikkelende contrast dat nodig is om verfsystemen visueel als blokken te zien.

## v3.11.5 — Verfsysteem-bandering nu écht zichtbaar
De v3.11.3-poging om de regel-rij subtiel donkerder te maken landde op `.calc-regel`, maar die selector wordt overschreven door een specifiekere regel `.calc-regel-wrap .calc-regel { background: var(--paper); }` die de basis-styling herstelt nadat de wrapper-div was toegevoegd voor de v3.11.0 aan/uit-vinkjes feature. CSS-cascade-issue: de v3.11.3-styling stond er wel, maar verloor in de browser.
- **Fix**: bandering verplaatst naar de winnende selector `.calc-regel-wrap .calc-regel` op regel 612. Nu schemert de 4%-zwart-overlay door, zoals oorspronkelijk bedoeld.
- **Opgeruimd**: de dode v3.11.3-styling op `.calc-regel` is teruggedraaid naar `var(--paper)` om verwarring te voorkomen.
- **Les voor toekomstige sessies**: bij CSS-wijzigingen op elementen die in een wrapper zijn gepakt (zoals na v3.11.0 met `.calc-regel-wrap`), altijd checken welke selector daadwerkelijk wint in de cascade. Een `grep -n "\.calc-regel"` voor je wijzigt scheelt deze hele false start.

## v3.11.4 — Bugfix: staartkosten uit template verdwenen
Wanneer een staartkost (winterschilder, afdekvilt, en andere standaard-toeslagen) via de template-dropdown aan een calculatie werd toegevoegd, verdween deze in een volgende sessie weer. Concreet werd de post wel zichtbaar in de browser-tab maar nooit in Supabase opgeslagen. Bij herladen of in een nieuwe sessie viel de calc terug op de DB-staat en waren de templates-uit-dropdown weer weg.
- **Oorzaak**: `addStaartFromTpl()` pushte de nieuwe post wel naar `data.calc.staart` in geheugen maar riep geen `_insertStaartCalcDB` aan. Een vergeten DB-write. De `saveData()`-call die volgde werkt alleen de gewijzigd-timestamp van de calculatie bij, niet de staart-tabel.
- **Fix**: functie veranderd naar `async`, en het patroon uit `saveStaart()` overgenomen — eerst payload bouwen, dan `_insertStaartCalcDB` aanroepen, dan met het uit DB teruggekregen object in de lokale array zetten. Hiermee is het ID consistent tussen client en server, en blijft de post na herladen bestaan.
- **Andere routes ongewijzigd**: handmatig toegevoegde staartkosten (via "Nieuw +" → modal → opslaan) deden de DB-insert al correct via `saveStaart()`. Bij dupliceren van een calc werd ook al correct geïnsert. Verwijderen via het kruisje en bewerken via de modal werkten ook goed. Dit was een bug die uniek voor de template-shortcut bestond.
- **Bestaande "verdwenen" posten zijn definitief weg** — die zijn nooit in de DB geweest. Voor Francot binnenwerk en eventuele andere calcs waarbij dit voorkwam: opnieuw toevoegen met v3.11.4 actief, dan blijven ze blijven.

## v3.11.3 — Verfsysteem-rij subtiel gemarkeerd
Bij calculaties met meerdere verfsystemen onder één onderdeel verdwijnt de structuur visueel in een grijs vlak van stappen en cijfers — het oog vindt moeilijk waar een verfsysteem begint en het volgende eindigt. De **regel-rij** (met locatie-input, systeemnaam, hoeveelheid, % staat en uren/materiaal/verkoop) krijgt nu een subtiele bandering die als visueel anker fungeert voor het bijbehorende verfsysteem-blok eronder.
- `.calc-regel` krijgt `background: rgba(0,0,0,0.035)` — 3,5% zwart-overlay op de bestaande paper-tint. Net donker genoeg dat het oog de scheiding tussen verfsystemen oppakt, niet zo donker dat het schreeuwt.
- Bordjes en hoeken blijven ongewijzigd. Bestaande inactief-styling (v3.11.0 doorstreping) schemert er gewoon doorheen omdat `is-inactief` in een hogere cascade-positie staat.
- **Onderweg fout gecorrigeerd**: in een eerste poging werd het strookje "BEWERKINGEN IN DEZE REGEL — wijzigingen blijven binnen deze calculatie" gestyled. Bij het zien van het resultaat bleek dat niet de juiste rij. De stylering van dat strookje is teruggedraaid naar v3.11.2-stijl en de bandering is verplaatst naar de regel-rij waar 'm bedoeld was.

## v3.11.2 — Default indexering onderhoudsplan van 3,5% naar 6,5%
Op basis van een filosofische analyse van de loon- en materiaalprijsontwikkeling in de Nederlandse schildersbranche over de afgelopen 20 jaar is geconcludeerd dat de oude default-indexatie van 3,5% per jaar onvoldoende toekomstig risico afdekt. Met name in lange onderhoudsplannen (10-15 jaar) liep de cumulatieve mismatch tussen werkelijke kosteninflatie (5-8% gemiddeld sinds 2020) en de gehanteerde indexatie op tot 18-21% verlies van marge. Nieuwe default is 6,5% — voorzichtig genoeg om de markt niet uit te prijzen, ruim genoeg om CAO-schokken en materiaalprijs-volatiliteit op te vangen.
- Drie plekken gewijzigd: HTML-input default (`value="6.5"`), JS-fallback in de "bestaand plan zonder indexeringPct"-tak, en de "nieuw plan zonder data"-tak in dezelfde functie.
- **Bestaande onderhoudsplannen** met een opgeslagen indexering (3,5% of anders) blijven ongewijzigd — hun `indexeringPct` is per plan opgeslagen en bindt de offerte zoals 'ie destijds is verstrekt aan de klant. Alleen nieuwe plannen krijgen vanaf nu standaard 6,5%.
- Geen DB-migratie nodig: dit is puur een UI/JS-default. Gebruiker kan per plan altijd nog aanpassen.

## v3.11.1 — Welkomstblok inklapbaar
- Welkomstboodschap op het dashboard is nu standaard ingeklapt en wordt op één regel getoond als `▸ Welkom bij v3.11.X`. Klikken op de titel klapt het blok open of dicht, met een meedraaiende caret als visuele feedback. Geen `localStorage`: bij elke sessie start het blok weer ingeklapt — als je de nieuwsbrief al gelezen hebt, hoef je hem niet weer dicht te klikken, maar hij verdringt ook niet langer permanent het werk eronder.
- Implementatie via klasse `intro-collapsible` op de wrapper-div met `collapsed`-state, en een aparte `.intro-body`-div voor de paragrafen. CSS verbergt de body via `display: none` in collapsed-state en draait de caret 90° met `transform: rotate(90deg)` als-ie open is. Geen JavaScript-state nodig.
- De welkomsttekst zelf is ongewijzigd t.o.v. v3.11.0.

## v3.11.0 — Aan/uit-vinkjes per onderdeel (onderhandel-modus)
Nieuwe feature voor het keukentafel-gesprek na het uitbrengen van een offerte. Wanneer een klant kiest om bepaalde delen niet te laten uitvoeren — een gevel, een kamer, of zelfs specifieke kozijnen terwijl de deuren wél meedoen — kan de actuele offerteprijs nu live worden bijgesteld door simpelweg vinkjes uit te zetten. De oorspronkelijke offerte blijft daarnaast bewaard als bevroren referentie, zodat altijd zichtbaar is wat oorspronkelijk verstuurd is en wat het verschil is met de aangepaste uitvoering. Werkt op drie niveaus, in elke status (concept én vergrendeld), en is volledig terug te draaien.

### DB-migratie
Drie kolommen toegevoegd aan Supabase:
- `hoofdgroepen.actief` — `boolean NOT NULL DEFAULT true`
- `onderdelen.actief` — `boolean NOT NULL DEFAULT true`
- `calc_regels.actief` — `boolean NOT NULL DEFAULT true`
- `calculaties.totaal_offerte_origineel` — `numeric` (nullable, bevroren bedrag bij eerste vergrendeling)

`NOT NULL` + `DEFAULT true` zorgt ervoor dat bestaande data automatisch als "actief" wordt gezien zonder migratie van bestaande rijen. Geen RLS-aanpassingen nodig, bestaande policies dekken automatisch de nieuwe kolommen.

### Datamodel-laag
- Helper `_isActief(item)` toegevoegd — defensieve check die `true` retourneert tenzij `actief === false` expliciet aanwezig is. Werkt ook met oude data zonder veld.
- Mappers `_mapHgFromDB/ToDB`, `_mapOdFromDB/ToDB`, `_mapRegelFromDB/ToDB` aangevuld met `actief`.
- `_mapCalcHeaderFromDB` aangevuld met `totaalOfferteOrigineel`. Bewust **niet** in `_mapCalcHeaderToDB` opgenomen om accidentele overschrijving via reguliere saves te voorkomen — wordt enkel via dedicated query gezet in `setCalcStatus`.

### Rekenkern
- `calcOnderdeelTotalen` filtert nu inactieve regels via `_isActief` (eerste filter-niveau).
- `calcHoofdgroepTotalen` filtert inactieve onderdelen (tweede niveau).
- `calcProjectTotalen` filtert inactieve hoofdgroepen (derde niveau).
- Parallelle `calcOnderdeelTotalenOrigineel` / `calcHoofdgroepTotalenOrigineel` / `calcProjectTotalenOrigineel` sommeren *alles* zonder filter — voor het oorspronkelijk-bedrag op de PDF en in het scenario-blok.
- `_calcTotalForArchive(c, includeInactief = false)` kreeg een tweede parameter. Default filtert hij; met `includeInactief = true` rekent hij alles mee — dezelfde berekenpath voor beide doelen, geen duplicatie.

### UI — vinkjes
Vinkjes (`<input type="checkbox" class="actief-toggle">`) toegevoegd op drie plaatsen:
- In `renderHoofdgroep`, vóór de uitklap-caret.
- In `renderOnderdeel`, vóór de uitklap-caret.
- In `renderRegel`, vóór de verfsysteem-naam (vóór "Binnendeur hout - onderhoud" e.d.).

De wrapper-divs (`.hoofdgroep`, `.onderdeel`, `.calc-regel-wrap`) krijgen voorwaardelijk de klasse `is-inactief`. CSS regelt visueel doorgestreepte tekst (opacity 0.45 + line-through) op de titel/stats, en lichte transparantie (0.55) op de body. Bestaande gridstructuur blijft intact — vinkjes vloeien netjes in de bestaande title-spans.

### UI — lock-uitzondering
Vinkjes blijven werken in vergrendelde calculaties via een CSS-uitzondering op `#calculatie.is-locked input.actief-toggle` (pointer-events: auto, opacity 1, cursor pointer). Andere inputs blijven netjes geblokkeerd. Dit maakt de onderhandelmodus mogelijk in een al verzonden of geaccepteerde offerte zonder de offerte structureel te moeten ontgrendelen.

### Handlers
- `toggleHgActief(hgId)` — invert `actief`, sla op via `_updateHgDB`, sync cache via `_syncCalcTotalToDB`, hertekenen op drie niveaus (calc-structuur, totalen, dashboard).
- `toggleOdActief(hgId, odId)` — idem voor onderdeel.
- `toggleRegelActief(hgId, odId, rId)` — idem voor regel.

### Scenario-blok (calc-tab)
Onder "Totaal incl." in de rechterkolom verschijnt een oranje kadertje wanneer er ergens iets uitgezet is. Drie regels: "Oorspronkelijk volledig" — "Aangepast (actuele offerte)" — "Verschil (vervalt)" in vet oranje met scheidingslijn. Verschijnt niet als alles aan staat (geen onnodige clutter). Berekent het origineel-bedrag via `_calcTotalForArchive(data.calc, true)` zodat alle reis-/staart-/btw-berekeningen kloppen op basis van het volledige werk.

### Status-flow — bevriezen origineel
In `setCalcStatus`, bij elke nieuwe vergrendeling (concept → verzonden/geaccepteerd/etc), wordt het volledige origineel-bedrag berekend met `_calcTotalForArchive(c, true)` en weggeschreven naar `totaal_offerte_origineel`. Bij hervergrendelen na een terug-naar-concept wordt het overschreven — de laatste uitgebrachte versie is de "echte" oorspronkelijke offerte. Bij terug-naar-concept blijft het bedrag gewoon staan (geschiedenis behouden).

### PDF
- Hoofdgroep-, onderdeel- en regel-rijen krijgen voorwaardelijke styling (opacity 0.5 + line-through) als ze inactief zijn. Een uitgezette parent zet erfelijk alle kinderen visueel uit, ongeacht hun eigen actief-status.
- Subtotaal- en hoofdgroep-totaalregels van inactieve hg's zijn ook half-transparant.
- Subtotalen tonen het *origineel*-bedrag (`calcHoofdgroepTotalenOrigineel`, `calcOnderdeelTotalenOrigineel`) — de PDF presenteert immers de volledige offerte met streepjes door wat vervalt.
- Onderaan het totalenoverzicht verschijnt, als er iets uitgezet is, een driedelig blok in lichte oranjetint: "Oorspronkelijk volledig offertebedrag" — "Vervalt op verzoek" — "Aangepast offertebedrag". Voor de klant transparant en zonder dat 'ie zelf moet rekenen.

### Bewuste keuzes (zie eerdere ontwerpsessie)
- **Geen vinkje op stap-niveau** binnen een regel — stappen vormen samen een verfsysteem; losse stappen uitzetten breekt dat. Een regel = bundel, aan-of-uit als geheel.
- **Origineel-bedrag overschrijven bij hervergrendelen** — pragmatischer dan "eerste verzending is heilig" en aansluit bij het normale werkproces (aanpassen → opnieuw uitbrengen).
- **Yoobi-export en werkbon** nog níet aangepast — komt in een latere versie. Voor nu volstaan dashboard + calc-UI + PDF om aan tafel met de klant te werken.

## v3.10.4 — Dashboard-totalen consistent
Twee samenhangende bugs in de "Totaal incl. BTW"-kolom van het dashboard opgelost. Concept-calcs toonden willekeurig `€ 0,00` of `—` voor hetzelfde inhoudelijke geval (leeg), en verzonden/geaccepteerde calcs verloren hun bedrag na een nieuwe sessie waardoor het dashboard de volgende dag weer streepjes liet zien.
- **Oorzaak 1 — `€ 0,00` vs `—`**: het renderpad checkte `cl.totaalInclBtw != null`, waardoor een DB-waarde van exact `0` (van calcs die ooit zonder regels zijn opgeslagen) als `€ 0,00` werd getoond, terwijl `NULL` als `—` verscheen. Inhoudelijk identiek, visueel verschillend.
- **Oorzaak 2 — verdwijnen na sessie**: de cache-write naar `totaal_incl_btw` in Supabase gebeurde alleen op specifieke momenten (concept-save via `_touchCalc`, of bij vergrendelen vanuit een al geladen calc). Verzonden/geaccepteerde calcs konden zo nooit hun bedrag in de DB krijgen als ze niet `__loaded` waren op het moment van statuswissel — dashboard toonde tijdens de sessie wel het live-berekende bedrag, maar de volgende dag (nieuwe sessie, `__loaded` = false) viel het weer terug op de lege DB-cache.
- **Fix A — Cache-write bij elk openen**: nieuwe centrale helper `_syncCalcTotalToDB(c)` die het actuele totaal naar `totaal_incl_btw` schrijft, ongeacht status. Wordt automatisch aangeroepen in `openCalc` direct na het laden van de body. Alleen schrijven als de waarde verandert (geen onnodige DB-writes). Stille fail bij berekeningsfouten — beïnvloedt UI niet.
- **Fix B — Lazy-load bij vergrendelen**: in `setCalcStatus`, als een nog niet geladen calc naar een vergrendelde status gaat (gereed/verzonden/geaccepteerd/verloren), wordt de body alsnog ingeladen via `_loadCalcBody` vóór het cachen. Voorkomt structureel dat verzonden-calcs ooit nog zonder bedrag in het dashboard belanden.
- **Fix C — Display 0 == ∅**: in `renderCalculatiesArchief` worden zowel `null` als `0` nu als `—` getoond (`tot != null && tot > 0`). Cosmetische pleister bovenop de structurele fix; een lege calc oogt rustig in plaats van met een verwarrende `€ 0,00`.
- **Inhaalslag**: één keer alle bestaande calcs openen (klik op Openen, even kijken, terug naar dashboard) → de cache wordt voor alle calcs in één rondje bijgewerkt en het dashboard is voorgoed consistent. Daarna onderhoudt het zichzelf.

## v3.10.3 — Standaard werkdag-lengte 7,5 uur
- **Fallback voor `uurDag` over de hele codebase van 8 naar 7,5 uur**, op alle 17 plekken waar deze waarde wordt gebruikt: de initiële calc-constructor, beide DB-mappers (`_mapCalcHeaderFromDB` / `_mapCalcHeaderToDB`), `loadCalc`-default, alle afrondingstoeslag-berekeningen (calculatie-tab, werkbon, archief-totaal, onderhoudsplan), dagen-helpers, dupliceer-flow, JSON-import-flow en de print-labels op de Calculatie- en Werkbon-prints.
- **Effect**: nieuwe calculaties starten standaard op 7,5 u/dag. Bestaande calculaties met een expliciet ingevulde waarde blijven ongewijzigd — alleen calcs waar `uurDag` om welke reden ook leeg/null is, vallen nu terug op 7,5 in plaats van 8.
- **Geen instellingen-veld toegevoegd** (zoals besproken): 7,5 u/dag is een vaste praktijknorm voor Ernes Schilders. Mocht dit ooit moeten variëren per scenario, dan kan later een echt instellingen-veld onder Uurtarieven worden toegevoegd dat deze hardcoded fallback overneemt.

## v3.10.2 — Scroll-naar-boven bij openen calculatie
- **Schoonheidsfout opgelost**: bij klikken op "Openen" in het dashboard sprong de Calculatie-tab open op de scroll-positie van het dashboard, waardoor de paneel-header en projectnaam-velden boven de viewport-rand uitvielen. Eén regel `window.scrollTo({ top: 0, behavior: 'smooth' })` toegevoegd in `openCalc`, na de tab-switch.
- **Bewust alleen in `openCalc`**, niet in de generieke nav-tab-handler: bij gewoon tussen tabbladen wisselen kan een gebruiker bewust ergens scrollen en willen terugkeren op die positie. Bij `openCalc` is de actie expliciet "ik open een ander item", dus "begin bovenaan" past daar.
- **`'smooth'`** in plaats van een harde sprong: de korte animatie verbindt de klik visueel aan de scroll-beweging en voelt minder schokkerig.

## v3.10.1 — Opname-datum & offerte-deadline
- **Twee nieuwe velden per calculatie**: `opname_datum` (handmatig) en `deadline_datum` (auto-berekend = opname + 14 dagen, vrij aan te passen). Beide nullable, `date`-type in Supabase. Bestaande calculaties blijven leeg (geen inhaalslag) en tonen `—` in het dashboard.
- **Auto-vul-logica**: bij wijzigen van de opname-datum vult de deadline automatisch op opname + 14. Als de deadline daarna handmatig is overschreven (afwijkt van de auto-waarde) blijft die bij volgende opname-wijzigingen staan. Wis de deadline en wijzig opname → vult weer auto. Geen popup, geen bevestiging, het gedrag is intuïtief.
- **Calculatie-detailscherm**: twee `<input type="date">` velden toegevoegd aan de header form-grid naast Uren/werkdag. Korte hint "(+14 dgn)" achter het deadline-label om de auto-relatie te suggereren zonder de regel te laten wikkelen.
- **Dashboard-tabel uitgebreid** met twee kolommen tussen Naam en Gewijzigd: Opname en Deadline. Bij Concept/Gereed-status kleurt de deadline subtiel mee: grijs (> 3 dagen weg), oranje (≤ 3 dagen, dreigend), rood vetgedrukt (verstreken). Bij Verzonden/Geaccepteerd komt de deadline grijs als referentiewaarde, en verschijnt naast de Gewijzigd-datum een klein label: `op tijd` (groen) of `+N dg` (rood) op basis van het verschil tussen de gewijzigd-timestamp en de deadline. Zo functioneert "Gewijzigd" automatisch als verzonden-stempel + prestatie-indicator t.o.v. de afspraak met de klant (twee weken na opname).
- **Mappers uitgebreid**: `_mapCalcHeaderFromDB` en `_mapCalcHeaderToDB` nemen de twee nieuwe kolommen mee. Snake_case in DB (`opname_datum`, `deadline_datum`), camelCase in JS-model (`opnameDatum`, `deadlineDatum`). Geen RLS-aanpassing nodig, bestaand beleid op `calculaties` dekt automatisch ook de nieuwe kolommen.
- **Helper `_addDays`** toegevoegd voor pure YYYY-MM-DD datum-arithmetiek, omzeilt de tijdzone-valkuilen van `new Date('2026-05-17')` (die als UTC-midnight parst en in NL een dag terug springt).
- **Geen breaking changes** aan bestaande functionaliteit. Bestaande calcs werken ongewijzigd; alleen de twee nieuwe velden zijn beschikbaar.

## v3.10.0 — Onderhoudsplan
- **Nieuwe tab "Onderhoudsplan"** tussen Ondergronden en Instellingen. Stel een meerjaren-onderhoudsplan op op basis van een opgeslagen calculatie, bedoeld als verkoopinstrument voor klanten die periodiek schilderwerk willen onderbrengen in een onderhoudscontract.
- **Datamodel**: twee nieuwe Supabase-tabellen: `onderhoudsplannen` (1-op-1 gekoppeld aan een calculatie, met prijspeil, looptijd, indexering, BTW-override, notities) en `onderhoudsplan_beurten` (n-op-1, met jaartal, naam, modus, scaling als jsonb, en `mee_in_gemiddelde`-vlag). RLS via `auth.uid()`.
- **Bron-picker**: zoekveld + statusfilter (concept/gereed/geaccepteerd default aan, verzonden/verloren default uit). Gesorteerd op meest recent gewijzigd. Hele Parameters-blok inklapbaar via een `<details>`-toggle die de bronnaam in de kop toont, default ingeklapt als er een werkend plan is.
- **Drie schaal-modi per beurt**:
  - *Algemeen*: één percentage op het hele project. Voor controlebeurten (15%) en eerste behandelingen (100%).
  - *Per regel*: per regel een eigen percentage, met snelinvuller per hoofdgroep ("zet alle Buitenwerk-regels op 25%"). Default per regel = 100%.
  - *Per stap*: per stap een eigen percentage, regels uitklapbaar om scherm leesbaar te houden, samenvattend label rechts (alles 100% / variabel / uit). Voor onderhoudsbeurten waarbij afbranden of machinaal schuren uit moet, maar eindlaag wel mee gaat.
- **Rekenkern** spiegelt letterlijk de structuur van de calculatie-tab: regels (arbeid + matVerkoop) + reiskosten + afrondingstoeslag bij volle dagen + kleinMat/afval/arbo + staart → directe kosten → × risico → excl. BTW. Voor de print: × BTW = incl. BTW. Geen winst-per-regel meer (dat gaf 0,5% afwijking ten opzichte van de offerte). Werkt op een snapshot van de calc-settings, zodat het plan niet meebeweegt als jij later uurloon aanpast.
- **BTW-veld** per plan, default = BTW van de bron-calculatie. Override mogelijk voor het nieuwbouw → onderhoud-scenario (nieuwbouw-calc 21%, daaropvolgende onderhoudsbeurten 9%). Hint achter het veld laat zien of je op de bron-waarde zit of afwijkt.
- **"Mee in gemiddelde"-vinkje per beurt**: zo niet, dan telt de beurt wel in de jaartabel maar niet in totaal/gemiddeld jaarbedrag. Voor de eerste behandeling die de klant separaat afrekent (Ernes is geen bank).
- **"Kopieer uit andere beurt"-knop** in de bewerk-modal: dropdown met alle andere beurten van dit plan (eerdere én latere), met modus en samenvatting per item. Klik = kopieer modus + scaling naar de huidige beurt. Beurt-typen volgen elkaar zelden direct op, dus directe-vorige-kopie was te beperkt.
- **Resultaatblok**: gemiddeld per jaar (incl. BTW), jaartabel met visueel onderscheid tussen meegerekende beurten (blauw accent) en eenmalige (grijs).
- **Print-functie** als verkoopdocument: header met logo, kerncijfers (gemiddeld per maand prominent, looptijd), jaartabel, project-specifieke notities. Geen handtekening-blok (Yoobi doet dat digitaal), geen generieke uitleg-tekst (zit in de Yoobi-offerte zelf), geen beurten-tabel met aanpak-info (dubbeling met jaartabel, te veel detail voor klant).
- **Notities-veld** op het plan voor klant-specifieke afspraken die op de print verschijnen.
- **Volgordefix tijdens ontwikkeling**: rekenkern eerst gebouwd (zodat bedragen testbaar waren in de lijst), modal pas daarna. Dat bleek essentieel voor het tijdig vinden van de 0,5% afwijking en de ontbrekende afrondingstoeslag/reiskosten in de eerste rekenkern.
- **Geen breaking changes** aan bestaande tabs of functionaliteit. Alle wijzigingen geïsoleerd in nieuwe DB-tabellen en eigen JS-module met `_ohp`-prefix.

## 2026-05-15 — GitHub-beveiliging op orde (geen code-wijziging)
- **Geen versie-bump** want er is geen functionaliteit aan de app toegevoegd of gewijzigd. Deze entry documenteert dat de **GitHub-repo en het account erachter zelf** vandaag in één sessie van drie beveiligingslagen zijn voorzien. Doel: voorkomen dat de live-app via een account-takeover beschadigd of vervangen kan worden.
- **Laag 1 — Authenticatie aangescherpt**: 2FA aangezet op het `GianErnes` GitHub-account met TOTP-codes via een wachtwoord-manager + een passkey als sterkere en phishing-bestendige tweede methode. Recovery codes zijn op papier opgeslagen op een fysiek veilige locatie buiten elk digitaal apparaat.
- **Laag 2 — Toegangshygiëne**: alle externe toegangsroutes geïnventariseerd en opgeruimd. Op de repo zelf staan geen collaborators. Op accountniveau zijn geen Personal Access Tokens (classic én fine-grained), geen SSH/GPG-keys, geen door mij gebouwde OAuth-apps, geen geïnstalleerde of geautoriseerde GitHub-Apps, en geen geautoriseerde OAuth-Apps actief. Eén niet-gebruikte third-party koppeling is ingetrokken.
- **Laag 3 — Branch protection**: ruleset *"Bescherm main branch"* aangemaakt en op `Active` gezet, gericht op de default branch (`main`). Twee regels actief: *Restrict deletions* (main kan niet worden verwijderd) en *Block force pushes* (commit-geschiedenis kan niet worden herschreven of vervalst). Een bypass voor de rol *Repository admin* zorgt dat de eigenaar van de repo onbelemmerd kan blijven werken zoals voorheen.
- **Wat dit oplost**: bij een eventueel toekomstig incident waarbij iemand alsnog toegang krijgt zonder admin-rechten — bijvoorbeeld via een gekaapt token of een gestolen sessie zonder volledige account-takeover — kan `main` niet worden gewist en de geschiedenis niet worden vervalst. Combinatie met 2FA + passkey op Laag 1 maakt account-overname zelf bovendien substantieel moeilijker.
- **Wat dit niet oplost**: een volledige takeover van het admin-account (wachtwoord + 2FA + passkey + bypass-rechten) blijft theoretisch destructief. De drie lagen zijn defense-in-depth, geen absolute garantie. De papieren back-up van de recovery codes en het feit dat de Supabase-data los van GitHub staat, vormen de laatste vangnetten.
- **Geen wijziging aan `index.html`, `APP_VERSION` of de live-app**. Volgende sessie: zelfde drie lagen toepassen op het `administratie@ernes.nl` GitHub-account (voorraad-app).

## v3.9.6.4 — Hotfix #4 (laatste): foutmeldingen weer in net Nederlands
- **Bug**: na v3.9.6.2/3 verschenen foutmeldingen bij wachtwoord wijzigen als generieke "Wijzigen mislukt: HTTP 400" in plaats van duidelijke Nederlandse meldingen als "Huidig wachtwoord klopt niet" of "Nieuw wachtwoord moet anders zijn dan het huidige".
- **Diagnose via DevTools** (Network tab → Response): de server-response bleek deze structuur te hebben:
  ```json
  { "code": 400, "error_code": "current_password_invalid", "msg": "Current password required when setting new password." }
  ```
  Maar mijn vertaal-code in v3.9.6.2 las `body.code` en `body.message`. Resultaat: `code` was de HTTP status (400) i.p.v. de error-string, en `message` bestond niet. Mijn `if`-takken matchten nooit, fallback gaf altijd "HTTP 400".
- **Fix**: drie veldnamen aangepast:
  - `body.code` → `body.error_code || body.code` (gotrue gebruikt snake_case)
  - `body.message` → `body.msg || body.message || ...` (idem)
  - Extra error-code `current_password_invalid` toegevoegd (verschillend van `current_password_required` — eerste = klopt niet, tweede = ontbreekt; beide vertalen we naar "Huidig wachtwoord klopt niet")
- **Lessen uit de saga (vier hotfixes voor één feature)**:
  - Library-docs zijn niet altijd accuraat over wire-format (camelCase in docs, snake_case in werkelijkheid)
  - Server-side response-velden zijn ook snake_case en wijken af van wat ik verwachtte
  - DevTools Network-tab is onmisbaar bij elke auth-debug, niet pas als laatste redmiddel
  - Toast-aanroepen direct na async calls kunnen door interne library-effects worden onderbroken; toast eerst, async daarna
- **Geen nieuwe functionaliteit, alleen betere foutafhandeling**. Wachtwoord wijzigen werkt sinds v3.9.6.2; v3.9.6.3 fixte de toast; v3.9.6.4 fixt nu de foutmelding-tekst.

## v3.9.6.3 — Hotfix #3: bevestigings-toast verscheen niet na wachtwoord wijzigen
- **Bug**: in v3.9.6.2 werkte het wachtwoord wijzigen functioneel correct (server-call slaagde, wachtwoord daadwerkelijk gewijzigd, nieuw wachtwoord bruikbaar bij login), maar de groene bevestigings-toast "Wachtwoord gewijzigd..." verscheen niet. De modal sloot gewoon zonder feedback, waardoor het voor de gebruiker leek alsof er niks gebeurde.
- **Theorie/diagnose**: in `submitChangePassword` stond de volgorde van calls in v3.9.6.2 als volgt:
  1. `await fetch(...)` (slaagt)
  2. `await _sb.auth.refreshSession()` (probeert nieuwe tokens te halen)
  3. `closeChangePasswordModal()`
  4. `_toast(...)`
  Vermoeden: stap 2 (refreshSession) gooit intern in supabase-js een fout omdat de oude refresh-token na de server-side wachtwoord-wijziging niet meer geldig is. Mijn `try/catch` ving zichtbare exceptions wel op, maar interne async errors of unhandled promise rejections konden de UI-render-thread alsnog kort onderbreken — net lang genoeg om de toast onzichtbaar of niet-rendered te laten.
- **Fix**: volgorde van calls omgedraaid:
  1. Modal sluiten
  2. Toast tonen
  3. `refreshSession()` op de achtergrond (zonder `await`, met `.catch()` voor losse error-logging)
  
  Toast verschijnt nu meteen, sessie-refresh gebeurt zonder de gebruiker te laten wachten.
- **Bonus diagnostiek**: `console.log('[v3.9.6.3] Wachtwoord gewijzigd, toast tonen')` toegevoegd vóór de toast-aanroep, plus `console.warn` als refreshSession alsnog ergens faalt. Niet zichtbaar voor de gebruiker, alleen voor toekomstige debug-sessies.
- **Geen bewijs van oorzaak** — alleen een waarschijnlijke theorie. Mocht de toast nog steeds niet verschijnen na deze fix, dan zit het probleem ergens anders en moeten we verder kijken (DOM-element-id-conflict, z-index-stacking, CSS-overwrite).

## v3.9.6.2 — Tweede hotfix: supabase-js camelCase/snake_case bug omzeild met directe fetch
- **Bug**: na v3.9.6.1 bleef de "Wachtwoord wijzigen"-modal de melding "Huidig wachtwoord klopt niet" geven, ook bij het correct ingetypte wachtwoord (zelfs het wachtwoord dat zojuist had gewerkt bij login).
- **Diagnose via DevTools**: in de Network-tab toonde de **Payload** van de PUT /auth/v1/user call deze JSON:
  ```json
  { "password": "...", "currentPassword": "..." }
  ```
  Maar de server-**Response** klaagde:
  ```json
  { "code": "current_password_required", "message": "Current password required when setting new password." }
  ```
  Conclusie: supabase-js v2 stuurt de parameter als `currentPassword` (camelCase) naar de server, terwijl gotrue/auth-server `current_password` (snake_case) verwacht. De camelCase-key wordt door de server genegeerd, alsof hij niet was meegestuurd. Bekend [supabase-discussie-item](https://github.com/supabase/gotrue/issues/608) — de library converteert tussen casing voor sommige endpoints inconsistent.
- **Fix**: voor deze ene call (PUT /auth/v1/user) wordt de library overgeslagen. Directe `fetch()` naar `${SUPABASE_URL}/auth/v1/user` met de juiste `current_password` snake_case sleutel in de body. Authorization-header met access_token uit de huidige sessie, en `apikey`-header met de anon key. De rest van de app blijft de library gebruiken zoals voorheen — alleen deze call is direct.
- **Verbeterde foutafhandeling**: error-detectie nu op `code`-veld van de server-response (`current_password_required`, `same_password`, `weak_password`, `invalid_credentials`) in plaats van tekst-matchen op de message. Codes zijn stabieler dan vertaalde tekst.
- **Na succes**: `_sb.auth.refreshSession()` zodat de lokale supabase-js-sessie nieuwe tokens krijgt en verder normaal blijft werken. Zonder deze stap zou er een mismatch ontstaan tussen wat de server weet en wat de lokale sessie denkt te weten.
- **Waarom geen library-upgrade?** De script-tag laadt `@supabase/supabase-js@2` (laatste 2.x). De bug zit in een actuele versie, dus upgraden lost niets op. Een specifieke versie pinnen zou alleen werken als ik kon garanderen dat de bug daar opgelost was — dat kon ik op basis van de changelog niet bevestigen. Directe fetch is robuuster en hangt niet af van library-quirks.

## v3.9.6.1 — Hotfix: wachtwoord wijzigen werkte niet met "Secure password change"
- **Bug**: in v3.9.6 verscheen bij elke poging om het wachtwoord te wijzigen via de nieuwe in-app modal de foutmelding `Current password required when setting new password`, ook al was het huidige wachtwoord correct ingevuld. De feature was effectief stuk.
- **Oorzaak**: `submitChangePassword()` gebruikte een aanpak met twee Supabase-calls — eerst opnieuw inloggen met het huidige wachtwoord (`signInWithPassword`) om dit te verifiëren, dan apart `updateUser({ password: nieuw })` aanroepen. Maar de Supabase-instelling "Require current password when updating" (server-side aangezet in v3.9.5) eist dat het huidige wachtwoord in **dezelfde call** wordt meegestuurd als parameter — niet via een aparte re-auth. Het twee-stappen-patroon dat ik koos was achterhaald (was de oude manier vóór supabase-js v2.102.0).
- **Fix**: één enkele call `_sb.auth.updateUser({ password: nieuw, currentPassword: huidig })`. Supabase valideert het huidige wachtwoord server-side. Schoner, sneller, en werkt mét de strikte instelling aan.
- **Bonus**: Supabase-foutmeldingen worden nu vertaald naar nette Nederlandse meldingen — "Huidig wachtwoord klopt niet" in plaats van Engelse technische tekst. Detectie via keyword-matching op de error message van Supabase (`current password`, `invalid login`, etc.).
- **Geen wijziging in flow B (vergeten-link)** — die had dit probleem niet omdat de recovery-sessie zelf al een verificatie is.
- **Geen DB-wijziging**, geen Supabase-config-wijziging — alleen JS in `submitChangePassword()`.

## v3.9.6 — Wachtwoord beheren in de app (wijzigen + vergeten-flow)
- **Aanleiding**: bij het reset-wachtwoord-experiment in v3.9.5 bleek dat de Supabase-resetlink in de mail de gebruiker direct ingelogd doorstuurt naar de app, zonder de kans een nieuw wachtwoord in te stellen. De recovery-flow was effectief stuk omdat de app geen UI had voor "stel nieuw wachtwoord in". Tegelijk was er sowieso geen in-app manier om een wachtwoord te wijzigen — moest via Supabase dashboard, wat omslachtig is en niet werkt voor medewerkers zonder dashboard-toegang.
- **Flow A — Wachtwoord wijzigen (ingelogd)**: nieuwe knop **🔑 Wachtwoord** rechtsboven naast Uitloggen. Opent modal met huidig + nieuw + bevestiging. Re-authenticeert met het huidige wachtwoord vóór `updateUser` wordt aangeroepen (voorkomt dat iemand bij een open laptop snel een ander wachtwoord instelt). Na succes: gebruiker blijft ingelogd, toast bevestigt de wijziging.
- **Flow B — Wachtwoord vergeten (uitgelogd)**: nieuwe link **Wachtwoord vergeten?** onder het inlog-formulier. Klap open → e-mail invullen → `resetPasswordForEmail`. Bewust generieke succes-melding ("Als dit e-mailadres bekend is...") om niet te lekken of een account bestaat.
- **Flow B — Recovery-landing**: bij klik op resetlink uit de mail detecteert de app het `PASSWORD_RECOVERY`-event van Supabase via `onAuthStateChange` en opent automatisch een aparte modal om een nieuw wachtwoord in te stellen (niet sluitbaar via X — wel via Annuleren, die uitlogt en terug naar login brengt). De URL-hash met access_token wordt na succes opgeschoond zodat een refresh niet opnieuw recovery triggert. `detectSessionInUrl` op de Supabase-client staat nu aan (was uit).
- **Wachtwoordregels (zelfde overal)**: minimaal 10 tekens, minstens 1 letter, minstens 1 cijfer. Identiek aan wat Supabase server-side afdwingt sinds v3.9.5. Centrale validatie via `_validatePasswordRule()` zodat regels op één plek wijzigen als ze later strenger of milder worden.
- **Tip in de UI**: hint-tekst onder het nieuw-wachtwoord-veld wijst op zinnetjes (`kwast-en-roller-99`) als sterker alternatief dan korte complexe wachtwoorden. Lengte > complexiteit, conform [NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html).
- **Bug-fix meegepakt**: de `auth-card` CSS styleerde alleen `input[type="email"]`, niet `[type="password"]`. Daardoor zag het wachtwoord-veld op het inlog-scherm er anders uit dan het e-mailveld. Nu beide types (+ `[type="text"]`) consistent gestyled.
- **Supabase dashboard-actie (door eigenaar)**: Site URL en Redirect URLs in `Authentication → URL Configuration` moeten op `https://gianernes.github.io/schilders-calc/` staan, anders verwijst de resetmail naar het verkeerde domein. Verifiëren bij eerste reset-test.
- **Bewust niet toegevoegd (mogelijk later)**: toon-wachtwoord-oogje, sterkte-meter, e-mailadres wijzigen, rate-limiting in UI (Supabase heeft eigen rate limits server-side).
- **Nieuwe functies**: `_validatePasswordRule`, `_showMsg`, `openChangePasswordModal`, `closeChangePasswordModal`, `submitChangePassword`, `toggleForgotPanel`, `submitForgotPassword`, `openRecoveryModal`, `cancelRecovery`, `submitRecoveryPassword`. Init-blok aangepast met `onAuthStateChange`-listener.

## v3.9.5 — Database-hardening (security-audit Supabase mei 2026)
- **Aanleiding**: Supabase-aankondiging dat vanaf 30 oktober 2026 nieuwe tabellen in `public` niet meer automatisch toegankelijk zijn via de Data API. Audit gedaan in het hele schema; meerdere kleine security-issues meteen meegepakt.
- **Geen JS- of UI-wijzigingen** (behalve `APP_VERSION` bump + welkomsttekst). Alle wijzigingen zitten in de Supabase-database, niet in de app-code. App-gedrag is identiek aan v3.9.4.
- **DB-wijziging 1 — `set_updated_at` veilig gezet**: de trigger-functie had geen vaste `search_path`, wat theoretisch schema-injectie mogelijk maakte. Nu vastgezet op `public, pg_temp` via `ALTER FUNCTION`.
- **DB-wijziging 2 — `anon`-rechten ingetrokken**: de rol `anon` had op alle 16 tabellen volledige rechten (SELECT/INSERT/UPDATE/DELETE/TRUNCATE). Dat werd al afgevangen door RLS (geen anon-policies), maar dat was een fragiele single-layer-verdediging. Nu defense-in-depth: `REVOKE ALL FROM anon` op alle bestaande tabellen. De app vereist altijd login (rol `authenticated`), dus geen impact op functionaliteit.
- **Niet uitgevoerd (bewust)**: hernoemen van de "anon alles xxx"-policies naar consistente namen. Werkt correct, alleen verwarrend genoemd vanuit een eerdere migratie. Cosmetische actie met klein risico, geen meerwaarde.
- **`app_settings` ongewijzigd**: single-row tabel met bedrijfsinstellingen, geen DELETE-policy is bewust ontwerp (rij mag niet weg).
- **Nieuwe map `/sql/`**: alle migratiescripts bewaard voor traceerbaarheid. Twee herbruikbare bestanden voor de toekomst: `template_nieuwe_tabel.sql` (correct grants + RLS + policy bij elke nieuwe tabel — vereist vanaf 30 okt 2026) en `audit_query_periodiek.sql` (kwartaal-check voor regressie).
- **Auth-instellingen aangescherpt** (Supabase dashboard, Email-provider): minimum wachtwoordlengte van 6 naar 10 karakters · password requirements op "Letters and digits" (afgewogen tegenover de zwaardere optie met symbolen — wachtwoord-zinnen zijn beter te onthouden en evengoed veilig) · "Require current password when updating" aan (voorkomt snel wijzigen op een open laptop). Bestaande wachtwoorden blijven werken; nieuwe regels gelden bij wijziging of nieuwe account.
- **Niet uitgevoerd — Pro plan vereist**: leaked password protection via HaveIBeenPwned.org is alleen beschikbaar op Pro plan en hoger ($25/mnd). Risico-afweging: signups staan uit, accounts worden handmatig aangemaakt, en de gestrengde wachtwoordregels dekken het meest waarschijnlijke aanvalsoppervlak (zwakke wachtwoorden zoals `welkom123` zijn nu sowieso geblokkeerd). Bij eventuele upgrade naar Pro plan voor andere redenen (backups, hogere limieten) alsnog aanzetten.

## v3.9.4 — Referentie-blokken normenboek bij staartkosten (kleine objecten + klimtijd)
- **Doel**: rekenhulp voor twee veelgebruikte toeslagen uit het normenboek, zonder automatische toepassing. Pure transparantie: jij ziet de richtwaarde, jij beslist welk percentage je in de toeslag-post invult.
- **Blok 1 — Toeslag kleine objecten**:
  - Berekent op basis van het totaal arbeidsuren van de calculatie de richtwaarde uit het normenboek
  - Tabel: ≤ 10 uur = 30% · ≤ 25 uur = 25% · ≤ 50 uur = 20% · ≤ 100 uur = 15% · ≤ 150 uur = 10% · > 150 uur = 0%
  - De huidige geldige rij wordt visueel benadrukt
- **Blok 2 — Toeslag klimtijd**:
  - Kies hoogste woonlaag (1 t/m 5) via knoppen, optioneel +6% voor doorlopende balkons/galerij
  - Tabel: 1 laag = 6% · 2 lagen = 13% · 3 lagen = 17,5% · 4 lagen = 20% · 5 lagen = 24%
  - Toont samengestelde richtwaarde (basis + galerij-opslag indien aangevinkt)
  - Woonlaag-keuze en galerij-vinkje worden lokaal in localStorage bewaard tussen sessies (geen DB-veld)
- **Bewuste afbakening**: géén automatische invulling van de toeslag-post. Dat zou suggereren dat de norm wet is — terwijl het een vuistregel is die jij interpreteert. Bij gemengde projecten (mix van hoogtes, mix van klein/groot werk) past de gebruiker zelf het juiste percentage toe.
- **Plaatsing**: tussen het "Staartkosten"-kopje en de staartkosten-lijst, in het calculatie-paneel.
- **Geen DB-wijziging** — pure UI met afgeleide berekeningen uit bestaande data.
- **Nieuwe functies**: `_normPctKleineObj`, `_setNormKlimLaag`, `_setNormKlimGalerij`, `renderNormRefs`. Nieuwe constanten `NORM_KLEIN_OBJ`, `NORM_KLIMTIJD`.

## v3.9.3 — Nieuwe bewerking ter plekke aanmaken in verfsysteem-formulier
- **Doel**: vlot bewerkingen toevoegen tijdens het opbouwen van een verfsysteem, zonder tab-switch naar het bewerkingen-tabblad. Cruciaal voor het on-the-job vullen van de bibliotheek waarbij tientallen bewerkingen uit het normenboek moeten worden ingevoerd.
- **Knop "+ Nieuw"** naast de bewerking-dropdown in het verfsysteem-formulier. Klik opent een mini-modal met velden: naam, eenheid, minuten/eenheid, ondergrond, materiaal, verbruik.
- **Slimme defaults**: eenheid en ondergrond worden voorgevuld op basis van het verfsysteem waar je in werkt — spaart typewerk.
- **Materiaal-veld**: dropdown met bestaande materialen + "geen". Verbruik-veld is alleen actief als een materiaal is gekozen. Bij geen of weinig materialen verschijnt een hint dat de materialen-bibliotheek apart bijgewerkt kan worden via het Materialen-tabblad.
- **Na opslaan**: nieuwe bewerking wordt aangemaakt in `data.bewerkingen` (DB-insert), automatisch toegevoegd als stap (`modalSteps`) aan het verfsysteem-in-wording, dropdown wordt ververst, mini-modal sluit. De gebruiker werkt direct verder met de stap-percentage instellen.
- **Z-index 200** op de mini-modal zodat hij netjes bovenop het verfsysteem-formulier staat (modal-in-modal-stapeling).
- **Bewuste afbakening (geen nested materiaal-aanmaak)**: binnen de bewerking-mini-modal is géén "+ Nieuw materiaal"-knop. Drie modals diep wordt te veel cognitieve belasting voor gebruikers, en materialen-bibliotheken zijn doorgaans kleiner/stabieler dan bewerkingen-bibliotheken. Indien deze beperking knelt in de praktijk, kan dit alsnog worden toegevoegd.
- **Nieuwe functies**: `openNewBewModal()`, `closeNewBewModal()`, `_toggleNewBewVerbruik()`, `saveNewBewFromSystem()`.

## v3.9.2 — Bugfix: nieuw verfsysteem vanuit calc-regel wordt nu auto-ingevoegd
- **Bug**: bij het aanmaken van een nieuw verfsysteem vanuit de "Verfsysteem toevoegen"-modal (knop "+ Nieuw systeem aanmaken") verscheen het zojuist opgeslagen systeem niet automatisch in de calc-regel. De gebruiker moest het systeem nogmaals handmatig kiezen via de keuzemodal.
- **Oorzaak**: in `openSystemFromAdd()` werd `modalSysContext` éérst gezet (met de calc-context: hoofdgroep + onderdeel), en daarna pas `openSystemModal()` aangeroepen. Maar `openSystemModal()` reset `modalSysContext = null` als allereerste regel. Daardoor was de context verloren tegen de tijd dat `saveSystem()` controleerde of er een auto-invoeg moest gebeuren. De volledige auto-invoeg-logica bestond al — werd alleen nooit getriggerd.
- **Fix**: volgorde omgedraaid — eerst `openSystemModal()`, daarna pas `modalSysContext` zetten. Daarmee werkt de bestaande auto-invoeg-flow zoals oorspronkelijk bedoeld: na opslaan wordt automatisch een nieuwe regel met snapshot van het verse systeem aangemaakt in het juiste onderdeel, calculatie wordt bijgewerkt, modal sluit.
- **Effect op werkflow**: maakt het on-the-job vullen van de bibliotheek wezenlijk soepeler. Geen "klik systeem opnieuw aan"-stap meer. Cruciaal voor de fase waarin de verfsystemen tijdens echte calculaties worden opgebouwd.

## v3.9.1 — Materiaalverbruik per regel (kleurzone-niveau)
- **Per regel een materiaalblokje** direct na de stappentabel — dit is het kleurzone-niveau. Voor projecten met verschillende kleuren binnen één onderdeel (bv. witte deuren + zwarte kozijnen in dezelfde "Hal BG") zie je nu per regel exact hoeveel materiaal nodig is.
- **Visuele hiërarchie** op de Werkbon:
  - **Regel-blokje** (nieuw): klein, grijs lettertype, dunne linker-rand — zit visueel "binnen" de regel
  - **Onderdeel-blokje**: prominenter, lichte achtergrond, dikkere linker-rand — som van alle regels binnen het onderdeel
  - **Projecttotaal**: onveranderd, gegroepeerd per materiaalgroep, onderaan de werkbon
- **Altijd alle niveaus tonen**, ook bij onderdelen met maar één regel. Voor consistente layout — je weet altijd waar je moet kijken.
- **Begripsverheldering**: in v3.9.0 stond per ongeluk de aggregatie alleen op onderdeel-niveau, omdat de term "onderdeel" voor verschillende structuren wordt gebruikt. In jouw werkwijze geldt: hoofdgroep = ruimte (bv. "Binnen"), onderdeel = element-type (bv. "Hal BG"), regel = uitvoering met eigen verfsysteem + kleur. Het kleurzone-niveau is dus de regel — daar zit de uitsplitsing nu.

## v3.9.0 — Materiaalverbruik op Werkbon (boodschappenlijst voor bestellen)
- **Werkbon toont nu materiaalverbruik op twee niveaus**:
  1. **Per onderdeel** — onder elk onderdeel een compacte tabel met materiaal, totaal verbruik en eenheid. Geaggregeerd over alle regels van dat onderdeel (dus aflak die zowel in tussen- als eindlaag zit, telt op).
  2. **Projecttotaal onderaan** — een aparte sectie "Materiaal totaal voor project", gegroepeerd per materiaalgroep (Verven, Hulpmiddelen, Kit, etc.) volgens de volgorde uit `groepOpslagen`. Dit is de boodschappenlijst voor het bestellen.
- **Rekenregel**: `regel.hoeveelheid × stap.verbruik × (stap.percentage / 100)`. **Staat-toeslag wordt NIET meegerekend** — alleen basisverbruik (theoretisch minimum), zodat de gebruiker zelf bepaalt hoe royaal hij bestelt.
- **Aggregatie-sleutel**: `materiaalId` uit de stap-snapshot. Vergrendelde calcs blijven dus correct ook als een materiaal later hernoemd of verwijderd wordt in de bibliotheek.
- **Stappen zonder materiaal** (`materiaalId = null`, bv. "Ontvetten" of "Afplakken") worden overgeslagen in de aggregatie.
- **Sortering binnen het projecttotaal**: groepen in volgorde van `groepOpslagen`-keys, dan alfabetisch op materiaalnaam.
- **Knop hernoemd**: "📋 Werkbon printen" → "📋 Werkbon" (printen is een vanzelfsprekendheid).
- **Geen DB-wijziging nodig** — alle benodigde data zat al in de stap-snapshots (`materiaalNaam`, `materiaalEenheid`, `materiaalGroep`, `verbruik`).
- **Nieuwe functies**: `_aggregeerMateriaalVerbruik(regels)` en `_renderMateriaalTabel(rows, opts)`.

## v3.8.2 — Dashboard-totalen gecached + vergrendeling-fix
- **Dashboard toont nu het totaal voor alle calculaties**, niet alleen de actieve.
  Het bedrag wordt gecached in nieuwe DB-kolom `calculaties.totaal_incl_btw`
  (NUMERIC(12,2), nullable).
- **Concept-calcs**: bij elke wijziging wordt het totaal opnieuw berekend en
  gesaved via `_touchCalc()`. Live waarde altijd up-to-date.
- **Vergrendelde calcs (gereed/verzonden/geaccepteerd/verloren)**: het totaal wordt
  éénmalig berekend op het moment van vergrendelen (in `setCalcStatus()`) en daarna
  bevroren. Het bedrag verandert NIET als uurloon, BTW of opslagen later wijzigen.
- **Bug-fix in `_calcTotalForArchive()`**: dashboard-archief gebruikte voor álle
  calcs de live `data.settings`, ook voor vergrendelde calcs. Nu pakt het de
  `settingsSnapshot` indien vergrendeld — consistent met `_S()` in het rekenmodel.
- **Render-strategie in `renderCalculatiesArchief()`**:
  1. Geladen calc → live berekenen (meest actuele waarde)
  2. Niet-geladen calc met cache → cached bedrag uit DB
  3. Geen cache (NULL) → gedachtestreepje (—) met tooltip "Open en sla op om te berekenen"
- **Backfill**: bestaande calcs vullen zichzelf bij eerstvolgende save (concept) of
  vergrendel-wijziging (anders). Geen migratie-script nodig.
- **DB-migratie** (al uitgevoerd): `ALTER TABLE calculaties ADD COLUMN totaal_incl_btw NUMERIC(12,2)`.
