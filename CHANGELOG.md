## v3.24.3 — Foto-bijlage: grotere foto's
Na de eerste praktijkprint bleef de onderkant van de pagina leeg. De foto's in de bijlage zijn nu flink groter (vakhoogte van 6,5 naar 9 cm), zodat het 2×2-raster de A4 beter vult en details beter zichtbaar zijn. Nog steeds 4 per pagina. Liggende foto's blijven volledig passen (ze worden binnen het vak getoond, niet bijgesneden) en krijgen alleen wat smallere boven/onderranden. De kop op pagina 1 houdt genoeg marge zodat de pagina niet overloopt.

---

## v3.24.2 — Foto-bijlage als PDF · fase 2 (in Archiveren)
De foto's uit het klusdossier kunnen nu als nette PDF-bijlage geprint worden — ondergebracht bij de **Archiveren**-knop, naast Calculatie, Meetstaat, Offerte, Werkbon en Onderhoudsplan. Geen losse knop dus; alle PDF-uitvoer blijft op één plek.

### Wat het doet
- Nieuwe optie **"Foto-bijlage als PDF"** in de Archiveren-modal. Uitgegrijsd met de melding "geen foto's in deze calc" als er geen foto's zijn, in dezelfde stijl als de Meetstaat- en Onderhoudsplan-opties.
- Loopt mee in de bestaande archiveer-sequentie: vink je meerdere bijlagen aan, dan komt de foto-bijlage gewoon als één van de print-dialogen voorbij.
- **Layout:** kop in de stijl van de calculatie-print (Ernes-logo, projectnaam, klant, datum) en daarna **4 foto's per A4 (2×2)** met hun bijschrift eronder. Foto's worden volledig getoond (niet bijgesneden), zodat detail behouden blijft.
- De signed links en de afbeeldingen worden eerst volledig ingeladen vóór de print-dialoog opent, zodat er geen lege vlakken op papier verschijnen.

Hiermee is fase 2 klaar. Rest nog fase 3 (een opname-PDF opslaan), als je dat later wilt.

---

## v3.24.1 — Foto's bij een calculatie · stap 3 (UI in het klusdossier)
Nu zichtbaar en bruikbaar. Het "Notities & taken"-paneel heet voortaan **"Notities, taken & foto's"** en is daarmee een compleet klusdossier per calculatie.

### Wat je kunt doen
- **Foto's toevoegen** met de knop "+ Foto's". Die opent een bestandskiezer waarmee je meerdere foto's tegelijk kiest; op een telefoon biedt dezelfde knop automatisch camera-of-galerij aan. Elke foto wordt vóór upload verkleind, dus ook zware telefoonfoto's gaan vlot.
- **Galerij** met thumbnails in een raster. Onder elke foto een **bijschrift**-veldje ("voorgevel — kozijn rechtsonder rot").
- **Vergroten:** klik op een thumbnail voor een schermvullende weergave (handig om op locatie op je telefoon een scheur te beoordelen). Klik ergens om te sluiten.
- **Verwijderen** met het ×-knopje op de thumbnail (met bevestiging). Haalt het bestand én de regel weg.
- De **samenvatting** in de kop van het paneel toont nu ook het aantal foto's, bv. "✎ · 2/3 taken open · 4 foto's". Heeft een calculatie foto's, dan klapt het dossier vanzelf open.

### Onder de motorkap
- Foto's krijgen tijdelijke (1 uur) signed links, in één call voor de hele galerij opgehaald; verloopt een link tijdens een lange sessie, dan wordt hij bij de eerstvolgende weergave vernieuwd.
- Een uploadteller-knop ("Bezig met uploaden…") voorkomt dubbele acties tijdens het uploaden.

Hiermee is fase 1 compleet. Fase 2 (foto-bijlage printen) en fase 3 (opname-PDF) bouwen later voort op deze galerij.

---

## v3.24.0 — Foto's bij een calculatie · stap 2 (datalaag)
De onzichtbare onderbouw voor foto's per calculatie. Nog niets te klikken — dat komt in stap 3 (het fotoblok in het Notities & taken-paneel). Deze stap zet alleen de leidingen aan.

### Vereist (al gedaan)
Tabel `calculatie_fotos` + RLS, en een privé Storage-bucket `calculatie-fotos` met de bijbehorende policies. Bestanden leven in Storage, de metadata (pad, bijschrift, volgorde) in de tabel.

### Wat erbij komt
- `fotos`-array op elke calculatie, die parallel met de taken/staart/meetstaat wordt meegeladen bij het openen van een calc.
- **Verkleinen vóór upload:** een canvas-stap brengt elke foto terug naar max 1600 px langste zijde, JPEG kwaliteit 0,8 (~250–400 KB), ongeacht de oorspronkelijke grootte.
- **Upload:** verkleinen → naar Storage (`{calculatie_id}/{willekeurig}.jpg`) → metadata-rij. Mislukt de rij, dan wordt het zojuist geüploade bestand teruggehaald — geen wezen.
- **Tonen:** tijdelijke (1 uur) signed links worden in één call voor de hele galerij opgehaald, passend bij de privé-bucket.
- **Bijschrift & verwijderen** per foto; verwijderen haalt eerst het bestand uit Storage, dan de rij.
- **Opruimen van wezen:** bij het verwijderen van een hele calculatie wordt eerst de complete fotomap van die calc uit Storage geveegd, daarna pas de calculatie zelf. Netjes, zoals beloofd.

### Nog niet zichtbaar
De upload-, sign-, bijschrift- en verwijder-functies bestaan al, maar worden pas aangeroepen vanuit de UI in stap 3. Tot dan is er in de app niets veranderd dat je kunt zien of klikken.

---

## v3.23.3 — VvE-variant offerte-bijlage · chunk C (jaartabel + scope-sectie)
Laatste chunk van de VvE-variant. Hiermee is de schakelaar volledig: Particulier en VvE leveren nu elk een complete, passende bijlage.

### Jaartabel met dubbele BTW-kolom (VvE)
- Bij VvE toont de planningstabel twee bedragkolommen: **Excl. btw** en **Incl. btw**, met een totaalregel onder beide. De beheerder kan zo de excl.-bedragen rechtstreeks in de MJOP zetten en de incl.-bedragen voor de reservering gebruiken.
- Bij Particulier blijft de tabel ongewijzigd (één kolom, incl. btw).
- Rekenkern: per beurt wordt nu zowel het excl.- (`basis × indexfactor`) als het incl.-bedrag bijgehouden; de excl.-totaaltelling loopt mee in de lus, dus geen afrondingsdrift t.o.v. de incl.-som.

### Scope-sectie (VvE)
- Het scope-tekstveld uit chunk A verschijnt nu als eigen sectie **"Wat valt onder dit plan"** op pagina 2, vóór de beurt-uitleg. Bedoeld voor de afbakening: welke gevels, kozijnen, houten delen, galerijhekken en bergingen wel/niet onder het plan vallen.
- De sectie verschijnt alleen als het veld is ingevuld. Is het leeg, dan wordt de sectie overgeslagen en schuift de nummering vanzelf terug (VvE zonder scope = 01–05, met scope = 01–06).
- Lege regels in het tekstveld worden alinea's; enkele regelovergangen blijven behouden.

### Getest
Generator-rooktest met gestubde helpers bevestigt de sectienummering in alle drie de gevallen (Particulier, VvE+scope, VvE zonder scope) en de juiste tabelkolommen, hero-getallen en MJOP-notitie per variant.

### Aandachtspunt layout
Pagina 2 draagt bij VvE nu scope + beurt-uitleg + planning. De pagina's hebben een vaste A4-hoogte (overschot wordt afgekapt). Houd de scope-tekst daarom beknopt — een paar regels — zeker bij een lange looptijd met veel tabelrijen.

---

## v3.23.2 — Uitlijning parameters-blok
Kleine UI-fix na de praktijktest van chunk A/B.

- Het label "Type ontvanger" loopt door zijn hinttekst over twee regels. In het parameters-grid duwde dat het dropdown-veld lager dan de andere vier velden (Prijspeil, Looptijd, Indexering, BTW), waardoor de rij scheef oogde.
- Opgelost door de invoervelden in dit grid (`#ohpParamGrid`) onderaan uit te lijnen: labels van verschillende hoogte trekken de velden niet meer scheef. Scoped op alleen het onderhoudsplan-parameters-grid, de overige form-grids in de app blijven ongewijzigd.

---

## v3.23.1 — VvE-variant offerte-bijlage · chunk B (teksten)
De generator splitst nu op `ontvangerType`. Bij Particulier blijft de bijlage exact zoals in v3.22.3; bij VvE wisselen de teksten. Eén codebase, twee varianten.

### Wat wisselt bij VvE
- **§01 lead:** gericht op het complex en het ontzorgen van het bestuur in plaats van de individuele woningeigenaar.
- **Hero-getal:** toont **gemiddeld per jaar te reserveren** (sluit aan op het reservefonds) in plaats van een maandbedrag. De totale investering rechts blijft gelijk.
- **Benefits:** VvE-set — vaste bedragen als MJOP-basis, aansluiting op de reservefonds-begroting, één aanspreekpunt voor bestuur/beheerder, 100% garantie, Vakwerk Plusgarantie met geschillenregeling, bestuur ontzorgd.
- **§02-kop:** "Voor uw complex specifiek" in plaats van "Voor uw huis specifiek".
- **MJOP/ALV-notitie:** callout onder de jaartabel — de bedragen kunnen rechtstreeks in de MJOP en ter besluitvorming naar de ALV; cijfers per onderdeel op verzoek.
- **Quotes:** beheerder/bestuur-gericht. **Let op:** dit is voorlopige voorbeeldtekst — vervang door een echte VvE-referentie zodra je die hebt.

### Techniek
- **Dynamische sectienummering** via een `nextSec()`-teller in plaats van vaste 01–05. Daardoor schuift de nummering vanzelf op zodra in chunk C de scope-sectie erbij komt (alleen VvE).
- Alle variant-teksten staan gebundeld bovenaan `_ohpBuildOfferteHTML` (`leadHtml`, `heroInner`, `benefitsHtml`, `sec02Title`, `mjopNote`, `quotesHtml`), zodat de template-body overzichtelijk blijft.

### Nog niet in deze chunk
De jaartabel toont nog alleen incl. btw (één kolom), en de scope-sectie ontbreekt nog. Dat is chunk C.

---

## v3.23.0 — VvE-variant offerte-bijlage · chunk A (datalaag + schakelaar)
Eerste stap richting een VvE-versie van de offerte-bijlage. Eén generator, twee varianten via een schakelaar; in deze chunk alleen de datalaag en de UI. De bijlage zelf verandert nog niet — dat komt in chunk B (teksten) en C (jaartabel + scope-sectie).

### ⚠️ Eerst in Supabase draaien (vóór testen)
De opslag verwacht twee nieuwe kolommen op `onderhoudsplannen`. Draai deze migratie eerst, anders mislukt het opslaan van plannen:
```sql
alter table onderhoudsplannen
  add column ontvanger_type text not null default 'particulier',
  add column scope_omschrijving text;
```

### Wijzigingen
- **Schakelaar "Type ontvanger" (Particulier / VvE / beheerder)** toegevoegd aan het parameters-blok van de Onderhoudsplan-tab. Default `particulier` — bestaande plannen blijven dus ongewijzigd.
- **Scope-veld** ("wat valt onder dit plan") als textarea, dat alleen verschijnt zodra VvE is gekozen. Bedoeld voor de afbakening van onderdelen (gevels, kozijnen, galerijhekken, bergingen) die in chunk C als aparte sectie op de bijlage komt.
- **Datalaag:** `ontvangerType` en `scopeOmschrijving` toegevoegd aan het plan-object en aan de Supabase-mapping (`ontvanger_type`, `scope_omschrijving`). Lezen, opslaan (debounced) en herladen werken net als de overige parameters.
- Velden zijn alleen bedienbaar als er een bron-calculatie gekozen is, conform de rest van het parameters-blok.

### Nog niet zichtbaar
De offerte-bijlage (`_ohpBuildOfferteHTML`) gebruikt deze velden nog niet — print je nu een bijlage, dan is die identiek aan v3.22.3, ongeacht het gekozen type. Dat is bewust: eerst de datalaag stabiel, dan de presentatie.

---

## v3.22.3 — Offerte-bijlage: logo's ingebed + taalpuntjes
Twee verbeteringen na de praktijktest.

### Logo's nu ingebed (base64) — vallen nooit meer weg
- Beide logo's (`ernes-logo.png` en het Onderhouds garantie+ plan-logo) staan nu als base64 data-URI rechtstreeks in de code, in plaats van als relatief bestandspad.
- Aanleiding: het Ernes-logo verdween uit de geprinte bijlage omdat het bestand niet in de repo stond. Met inbedden is de bijlage volledig self-contained qua afbeeldingen — er hoeven **geen losse logo-bestanden meer naast index.html** te staan voor de offerte-bijlage.
- Logo's vooraf geoptimaliseerd (320px breed) zodat de base64 compact blijft; index.html groeit hierdoor ~50kb.

### Taalcorrecties in de vaste teksten
- **Gedachtestreepjes verwijderd** uit de lopende vaste teksten (§1 en §5): vervangen door punten of komma's waar dat natuurlijker leest. Voorbeeld: "wanneer wat moet — dat doen wij" → "wanneer wat moet. Dat doen wij."
- **Komma vóór "en" weggehaald** in opsommingen (geen Engelse stijl meer): "voeren het op tijd uit, en garanderen" → "…uit en garanderen"; "aangebracht, en bescherming" → "aangebracht en de bescherming".
- Bewust ongemoeid gelaten: het jaartal-bereik in de kop ("2025 — 2035") en de bronvermelding bij de citaten ("— klant Ernes Schilders") — dat zijn functionele streepjes, geen gedachtestreepjes.
- De "voor uw huis"-teksten per beurt blijven vrije invoer; eventuele streepjes daarin typt en bepaalt Gian zelf.

---


Fix na praktijktest: de uit de app geprinte PDF miste de visuele elementen die de proef zo mooi maakten (zwarte hero-balk, oranje gevulde tijdlijn-dots, stems, callout-achtergrond) en gebruikte een verkeerd lettertype. Oorzaak lag in het printgedrag van de browser, niet in de opmaak zelf.

### Wijzigingen
**Achtergrondkleuren printen nu mee:**
- Toegevoegd aan de gescopte bijlage-CSS: `.ob, .ob *, .ob *::before, .ob *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`.
- Chrome print standaard géén achtergrondkleuren bij `window.print()` (afhankelijk van de "Achtergrondafbeeldingen"-checkbox). Deze regel forceert ze, zodat de hero-balk, oranje dots, stems en callouts altijd verschijnen — ongeacht de printinstelling van de gebruiker.

**Lettertype geladen vóór printen:**
- `_ohpPrintOfferte()` wacht nu met `document.fonts.load(...)` op de vier Libre Franklin-gewichten (400/600/700/900) voordat `window.print()` wordt aangeroepen.
- De app gebruikt zelf Inter; Libre Franklin werd pas opgehaald zodra de bijlage het nodig had. Zonder deze wachtstap printte de browser met een fallback-font omdat het lettertype nog niet binnen was.

### Resultaat
De uit de app geprinte PDF is nu visueel identiek aan de ontwerp-proef: juiste huisstijl-kleuren, juiste lettertype, dynamische tijdlijn met gevulde knopen en verbindings-stems.

---


Fix na de eerste praktijktest met een 10-jaarsplan (2025–2035). Bij veel jaartallen liep de layout vast op twee punten; beide opgelost.

### Wijzigingen
**Tijdlijn — geen overlap meer bij veel jaren:**
- De bedrag-kaartjes staan nu **afwisselend boven en onder** de tijdlijn (klassen `.tl-card.hi` / `.tl-card.lo`), via een `werkIdx`-teller in de generatie-loop. Naburige werkjaren botsen daardoor nooit meer, ongeacht looptijd of onderlinge afstand.
- De "geen werkzaamheden"-sublabels (`.tl-sub`) zijn van de tijdlijn verwijderd — die overlapten bij dicht opeenstaande jaren ("werkzaamhedenwerkzaamheden"). De info staat al volledig in de jaartabel eronder.
- Tijdlijn-hoogte 184px → 200px; as naar het midden; jaartallen consistent onder de as; verbindings-stems per niveau (hi 108px / lo 52px).

**Pagina-indeling — niets valt meer af:**
- De Prijszekerheid / Wat-valt-buiten-blokken zijn van pagina 2 naar pagina 3 verplaatst (onder §5 Uw zekerheid, waar ze thematisch ook passen). Bij 11 tabelrijen vielen ze voorheen buiten pagina 2.
- Tabelrijen compacter (`padding` 7px → 4.5px) en tijdlijn-marges kleiner, zodat tijdlijn + volledige jaartabel + totaalregel samen op pagina 2 passen tot ~15 jaar looptijd.

### Resultaat
Een 10-jaarsplan rendert nu correct op 3 pagina's: p1 plan + voor-uw-huis, p2 beurt-uitleg + tijdlijn + volledige tabel, p3 zekerheid + prijszekerheid + quotes.

---


De tweede en grote chunk: een nieuwe knop "📄 Offerte-bijlage" in de Onderhoudsplan-tab genereert een volledig vormgegeven PDF van 3 pagina's in de Ernes-huisstijl, bedoeld als bijlage bij de Yoobi-offerte. Geen NAW op de bijlage (privacy blijft bij Yoobi); de koppeling loopt via de offerte waaraan de bijlage hangt.

### Vereiste bestanden in de repo (naast index.html)
- `ernes-logo.png` — getrimd Ernes Schilders-logo (wordt apart meegeleverd)
- `onderhouds-garantie-plus.jpg` — bestond al (gebruikt door de oude print)

Het lettertype **Libre Franklin** wordt via Google Fonts geladen (toegevoegd aan de bestaande font-link).

### Wat de bijlage toont
- **Pagina 1:** masthead (Ernes-logo + Onderhouds garantie+ plan-logo), §1 "wat het plan inhoudt" met hero (gemiddeld per maand + totaal), 6 voordelen-bullets, §2 "voor uw huis specifiek" met een jaar-blok per beurt gevuld uit `offerteTekst`.
- **Pagina 2:** §3 uitleg controle-/herschilderbeurt, §4 **dynamische tijdlijn** (gelijkmatig verdeeld over het werkelijke aantal jaren; werkjaren met bedrag + type-label, lege jaren grijs) + jaartabel met totaalregel + prijszekerheid/buiten-plan blokken.
- **Pagina 3:** §5 zekerheid (garantie wel/niet, Vakwerk Plusgarantie, opzegbaar) + 2 klantquotes.

### Nieuwe functies
- `_ohpTypeLabel(naam)`: leidt een kort type-label af ("Controlebeurt"/"Herschilderbeurt"/…) uit de beurt-naam voor tijdlijn-card en jaarblok-kop.
- `_ohpBuildOfferteHTML(plan, calc)`: bouwt de complete bijlage-HTML met ingebedde, gescopte `<style>` (alle CSS onder `.ob` zodat het niet botst met de bestaande print-styling). Hergebruikt de bestaande rekenhelpers (`_ohpBeurtBasisBedrag`, `_ohpIndexFactor`, `_ohpBtwFactor`, `eur`).
- `_ohpPrintOfferte()`: validatie + `printArea` vullen + `window.print()`. Zelfde Chromium-printengine als de ontwerp-proef, dus identieke output.

### Slimme details
- **"Let op:"-conventie**: begint een alinea in een beurt-tekst met "Let op:", dan wordt die automatisch als oranje aandachtsblok (callout) gerenderd.
- **Maandbedrag** volgt de plan-looptijd: `totaalGemiddelde / looptijdJaren / 12`. Bij Penders (looptijd 5) → € 195/maand; pas de looptijd aan om dit te sturen.
- Vaste pagina-hoogte (296mm, `overflow:hidden`) + `page-break-after` houdt het exact op 3 pagina's.

### Architectuur
- Geen backend-wijziging in deze chunk (kolom `offerte_tekst` kwam in v3.21.0).
- De bijlage hergebruikt het bestaande `printArea` + `@media print`-mechanisme; de gescopte `<style>` in de innerHTML overschrijft waar nodig de generieke print-CSS.

---


Eerste bouwsteen voor een automatisch gegenereerde, vormgegeven PDF-bijlage bij de Onderhouds garantie+ plan-offerte. Deze chunk legt de datalaag: een vrij tekstveld per beurt waarin Gian per inspectie noteert wat hij aantrof en wat er gebeurt. De generator zelf (de mooie bijlage-PDF) volgt in chunk 2.

### Vereiste Supabase-migratie (eenmalig, vóór gebruik)
```sql
ALTER TABLE onderhoudsplan_beurten
  ADD COLUMN IF NOT EXISTS offerte_tekst TEXT DEFAULT '';
```

### Wijzigingen
**Datamodel:**
- `_mapBeurtFromDB`: leest nieuwe kolom `offerte_tekst` → JS-veld `offerteTekst` (default leeg).
- `_mapBeurtToDB`: schrijft `offerteTekst` → `offerte_tekst` weg.

**UI — bewerk-modal van een beurt:**
- Nieuw `<textarea id="ohpMbOfferteTekst">` onderaan de modal-body, onder het basisbedrag-blok, met label "Voor de offerte-bijlage — wat troffen we aan / wat gaan we doen" en een voorbeeld-placeholder.
- `_ohpOpenBeurtModal` vult het veld met `b.offerteTekst`.
- `_ohpMbOpslaan` leest het veld en slaat het mee op via de bestaande `_updateBeurt`.

**Architectuur:**
- Geen nieuwe tabel, geen nieuwe query-functie — hergebruik van de bestaande beurt-update-flow. De enige backend-wijziging is één kolom.
- Tekst is optioneel: leeg laten is prima, dan toont de bijlage straks alleen jaar + beurttype.

---


Antwoord op een al lang sluimerende UX-vraag: kun je in een specifieke calc-regel afwijken van de bibliotheek-materiaal zonder een nieuwe bewerking of een nieuw verfsysteem aan te maken? Vanaf vandaag: ja, direct in de calculatie zelf.

### Wijzigingen

**UI in calc-regel-stappen:**
- De voorheen read-only materiaal-tekst (`<span class="regel-stap-mat">${matInfo}</span>` met materiaal-naam + verbruik + matKost als gehavende tekst) is vervangen door drie inline elementen binnen dezelfde grid-kolom:
  1. **Materiaal-dropdown** (`<select>`) met slim groep-filter — toont per default alleen materialen uit de groep die past bij de bewerking-naam (gronden → grondverf, aflakken → dekverf, etc., via de bestaande `_resolveExpectedGroup` mapping van v3.18.5). Inclusief defensief: als het huidige materiaal buiten de filter valt blijft het zichtbaar in de dropdown zodat de selectie niet "verdwijnt".
  2. **Verbruik-input** (`<input type="number" step="0.001">`) — direct naast de dropdown, smal (60px), `disabled` als er geen materiaal gekoppeld is.
  3. **Eenheid-label** (mat-eenheid/bewerking-eenheid, bv. "L/m²") — read-only, alleen ter referentie.
  4. **Filter-knop** (`☰`) — toggle om het groep-filter handmatig uit te zetten en de hele materialen-lijst te tonen. Per-stap state, niet persistent (resetten bij F5).
- De totaal-€-kolom rechts toont nog steeds het stap-totaal (mat + arbeid). De extra `(0.012 L · € 0.85)` preview-info die voorheen onder de materiaal-naam stond is weggevallen — dubbele informatie nu de gebruiker zelf verbruik en materiaal direct ziet en muteert.

**Functies:**
- Nieuwe `updRegelStapMateriaal(hgId, odId, rId, idx, materiaalId)`: pakt naam/eenheid/prijs/groep van het nieuwe materiaal en schrijft alle 5 snapshot-velden in één DB-write weg via `_updateStapSnapshotDB`. Verbruik blijft staan — dat wordt apart aangepast via de bestaande generieke `updRegelStap(hgId, odId, rId, idx, 'verbruik', val)`.
- Nieuwe `toggleMatFilterRegelStap(stapKey)` met eigen Set `_matFilterOffRegelStap` — naast de bestaande `_matFilterOff` van v3.18.5. Twee aparte sets omdat de toggle in de Bewerkingen-tab `renderBewerkingen()` aanroept en de calc-versie `renderCalcStructuur()`.

**Architectuur — waarom dit zonder backend-wijzigingen kon:**
- De `calc_regel_stappen` tabel in Supabase heeft sinds v3.0 elke stap als aparte rij met **alle materiaal-velden als eigen kolommen** (`materiaal_id`, `materiaal_naam`, `materiaal_eenheid`, `materiaal_prijs`, `materiaal_groep`, `verbruik`). Het rekenmodel `calcSnapshotStep` (regel 7373) leest direct uit deze snapshot-velden, niet uit `data.materialen`. Dit is het zogenaamde **snapshot-patroon** — calculaties zijn historische foto's, niet live-views.
- Wat we vandaag hebben gebouwd is dus puur UI: de DB-shape stond al toe wat we nu doen, de update-functie `_updateStapSnapshotDB` schreef alle materiaal-velden al weg. Er was alleen geen control om het te triggeren.

**UX-keuzes vooraf bevestigd:**
- Materiaal + verbruik aanpasbaar (geen prijs-override — daarvoor moet je naar de Materialen-tab).
- Geen visuele "aangepast"-badge — silent override, jouw calc, jouw beslissing.
- Geen "reset naar bibliotheek-default" knop — eens aangepast blijft aangepast tot je 't handmatig terug zet.

### Niet aangepast
- De **bibliotheek** (`data.bewerkingen`, `data.materialen`, `data.systemen`) blijft onaangetast bij elke materiaal-wissel in een calc-regel. Wijzigingen blijven gescoopt op die ene calc-regel-stap.
- De grid-template van `.regel-stap` (`22px 2fr 1.6fr 0.6fr 0.7fr 90px`) blijft hetzelfde — de drie nieuwe elementen passen in de bestaande 1.6fr-materiaal-kolom als inline-flex.
- Print, Werkbon en Yoobi-export gebruiken al de snapshot-data van `calc_regel_stappen` — aangepaste materialen komen automatisch correct mee in alle exports.
- De backwards-compatibiliteit van bestaande calculaties: alle calculaties van vóór v3.20.0 blijven exact zo werken — hun stappen hadden al gewoon `materiaal_id` etc. ingevuld via de snapshot.

### Versie
APP_VERSION: `v3.19.2` → `v3.20.0`. Minor bump want nieuwe functionele feature (per-stap materiaal-override), niet alleen styling.

---

## v3.19.2 — Scheidingslijntjes Meetstaat-samenvattingen donkerder
Kleine maar gerichte UX-tweak op basis van gebruikersfeedback: bij grotere calculaties met veel meetregels werd het volgen van een rij in de "Totalen per calc-regel" en "Project-totaal per regel-type" lijstjes moeilijk omdat de stippellijntjes te licht waren om je oog over de regel te leiden.

### Wijzigingen

- In drie identieke render-plekken (regel 7986, 8033 en 8115 in `index.html`) is de inline `border-bottom: 1px dashed var(--paper-deep);` vervangen door `border-bottom: 1px dashed color-mix(in srgb, var(--paper-deep), var(--muted));` — een 50/50 mix tussen de bestaande lichte tint en de muted-tekstkleur.
- Effectief: de dashed-streep is ongeveer twee keer zo grijs als voorheen. Subtiel genoeg om visueel rustig te blijven, donker genoeg om het oog van de regel-naam links naar het getal rechts te begeleiden.
- Drie plekken meegenomen omdat ze allemaal hetzelfde leesprobleem hebben:
  - "Totalen per calc-regel" — hoofd-render (regel 7986)
  - "Project-totaal per regel-type" — geaggregeerde regel-types over alle onderdelen (regel 8033)
  - "Totalen per calc-regel" — secundair render-pad (regel 8115, bij verversen na meetstaat-mutatie)

### Browser-compatibiliteit
`color-mix(in srgb, ...)` is sinds 2023 ondersteund in alle moderne browsers (Chrome 111+, Safari 16.2+, Firefox 113+). Voor deze app (Chrome op desktop in Limburg in 2026) geen risico.

### Niet aangepast
- Lijn-dikte blijft 1px (niet verdikt naar 2px — Gian vroeg om grijsheid, niet pixel-dichtheid).
- Lijn-stijl blijft `dashed` (niet `solid` of `dotted`).
- Andere scheidingslijntjes elders in de app onaangetast — alleen de drie locaties in de Meetstaat-samenvatting.

### Versie
APP_VERSION: `v3.19.1` → `v3.19.2`. Patch-bump.

---

## v3.19.1 — Versie-geschiedenis uitgebreid (oerjaren + recente sessie)
Data-update voor de versie-tijdlijn op het dashboard: 15 nieuwe entries die het verhaal van de app completer maken. Geen feature-code, geen UI-shifts — alleen `RELEASE_HIGHLIGHTS` aangevuld en de datum-render iets toleranter gemaakt.

### Wijzigingen

**`RELEASE_HIGHLIGHTS` array uitgebreid:**

**Bovenaan** (5 nieuwe recente entries — newest first):
- `v3.19.0` (25 mei): Verfsystemen-tab master-detail layout
- `v3.18.8` (25 mei): Cluster-volgorde ↑/↓ vanuit Bewerkingen-tab
- `v3.18.7` (25 mei): Inklap-clusters Bewerkingen-tab
- `v3.18.6` (24 mei): CSV-import voor bewerkingen — Chunk 3 normenboek
- `v3.18.5` (24 mei): Blauwe normenboek-streep + slimme materiaal-dropdown — Chunk 2 normenboek

**Onderaan** (10 historische entries — toegevoegd na de bestaande `v3.8.2`):
- `v3.7.0`: Calc-vergrendeling bij statussen Gereed/Verzonden/Geaccepteerd/Verloren met snapshot van instellingen
- `v3.5.0`: Multi-user authenticatie via Supabase Auth (tussen-stadium, gemarkeerd)
- `v3.0.0`: Supabase-migratie (van localStorage naar Postgres + RLS, tussen-stadium, gemarkeerd)
- `v2.4.1`: Notities-paneel bugfix + per-calc onthouden van open/dicht
- `v2.3.6`: Meetstaat regel-totalen sync-volgorde bugfix
- `v2.3.5`: Tabellen compacter (kleinere cell-padding)
- `v2.3.4`: Verfsysteem-tegels visueel opgeschoond (emoji → strakke labels)
- `v2.3.3`: Calc-regel hoeveelheid-veld + meetstaat-totaal weer correct met 📐-badge
- `v2.3.2`: Meetstaat m¹ symmetrische lengte (h of b)
- `v2.3.1`: Meetstaat spinner-pijltjes weg + niet meer renderen tijdens typen (Enter-flow)

**Datum-strategie:**
- 5 recente entries: exacte ISO-datums (`2026-05-24` / `2026-05-25`).
- 10 historische entries: vrije tekst `'begin mei 2026'` — geen exacte datums beschikbaar in git log of geheugen.
- `_formatDatumNL()` aangepast om niet-ISO strings letterlijk door te laten i.p.v. lege string te returnen. Bestaande entries (alle 53 daarvoor) blijven exact zo renderen als voor deze release.

**CSS-aanpassing:**
- Datum-span in `renderVersieGeschiedenis()`: `min-width` van 6.5rem → 8.5rem en `white-space: nowrap` toegevoegd, zodat "begin mei 2026" (14 karakters) niet wrapt of zichzelf afkort.

**Tussen-stadia v3.0.0 en v3.5.0:**
- We hebben geen feitelijke `index.html`-bestanden voor deze versies, maar uit de v2.4.1 (0 Supabase-refs) → v3.7.0 (32 Supabase-refs, `<h2>Inloggen</h2>`-panel) sprong is duidelijk dat de Supabase-migratie en de multi-user auth ergens daartussen hebben plaatsgevonden.
- De versienummers v3.0.0 en v3.5.0 zijn pragmatisch gekozen om het gat zichtbaar te overbruggen — de werkelijke nummers kunnen anders zijn geweest. Datums staan ook op "begin mei 2026" tot beter bekend is.

### Niet aangepast
- De render-functie van de versie-tijdlijn (`renderVersieGeschiedenis`) zelf blijft ongewijzigd qua structuur.
- Bestaande 53 entries onaangetast, geen herschrijving van highlights.
- Geen schema-wijzigingen aan Supabase, geen wijzigingen aan andere tabs.

### Versie
APP_VERSION: `v3.19.0` → `v3.19.1`. Patch-bump want puur data + 1 kleine render-tolerantie, geen nieuwe features.

---

## v3.19.0 — Verfsystemen-tab herzien naar master-detail layout
De Verfsystemen-tab is van een grid-van-kaarten omgebouwd naar een master-detail layout met lijst links en detail rechts. Voorbereiding op groei (uitbreiding van het aantal verfsystemen in de komende periode).

### Wijzigingen

**Layout:**
- De `.systems-grid` (3-koloms responsive grid van system-cards) is vervangen door `.sys-master-detail` — een grid met vaste 280px linker-kolom (lijst) en flexibele rechter-kolom (detail).
- Lijst-paneel: `.sys-list` met `.sys-list-tools` bovenaan (zoekbalk + sort-dropdown) en `.sys-list-body` daaronder (scrollbaar tot 70vh).
- Detail-paneel: hergebruikt de bestaande `.system-card` styling 1:1 — uiterlijk van een geselecteerd systeem is identiek aan vroeger.
- Geselecteerde lijst-regel krijgt een 3px linker-accent in `var(--accent)` plus een lichte `var(--paper-warm)` achtergrond (zelfde accent als bv. notitie-blokken).

**Lijst-regels:**
- Elke regel toont alleen `naam` + meta-regel `€ verkoopprijs /eenheid`. Geen stappen-teller, geen badges — kort en scanbaar.
- Klik = `_selectSystem(id)` → detail-paneel wisselt direct.

**Zoeken & sorteren:**
- Zoekbalk (oninput, real-time) filtert op zowel systeem-naam als ondergrond-naam (case-insensitive substring match). Typ "binnendeur" → alle binnendeur-systemen onafhankelijk van of het in de systeem-naam of ondergrond-naam zit.
- Sortering-dropdown met 5 opties:
  - **Op ondergrond (gegroepeerd)** — default. Systemen worden per ondergrond gegroepeerd met een sticky sub-header per groep (`.sys-list-group-header` — small, uppercase, muted color). Binnen elke groep alfabetisch op systeem-naam. Groepen zelf alfabetisch op ondergrond-naam.
  - Naam ↑ / ↓ — platte alfabetische sort.
  - Prijs ↑ / ↓ — platte sort op verkoopprijs (excl. BTW).
- Sticky group-headers gebruiken `position: sticky; top: 0; z-index: 1;` — bij scrollen blijft de header van de huidige groep aan de bovenkant van het lijst-paneel zichtbaar.

**Bestaande Locatie-filter:**
- De `<select id="filterLocatie">` in de panel-head blijft staan en werkt door tegen alle drie de filter-stappen heen (locatie → zoek → sort/groepering).

**Default state na page-load / F5:**
- `_selSystemId = null` → detail-paneel toont empty state: "Klik een systeem links om te bekijken" (of bij volledig lege tab: "Nog geen systemen. Klik op '+ Nieuw Systeem'…").
- Selectie wordt bewust niet in localStorage gepersisteerd — voorspelbaar startgedrag.

**Auto-select:**
- Nieuw systeem aanmaken via "+ Nieuw Systeem" modal → `_selSystemId` springt direct naar het nieuwe systeem zodra modal sluit, zodat je je werk meteen ziet.
- Bestaand systeem opslaan via "Bewerken" modal → idem, blijft / wordt geselecteerd.
- "Opslaan als nieuw" duplicate → het duplicaat wordt geselecteerd.
- Geselecteerd systeem verwijderen → `_selSystemId` reset naar `null`, detail-paneel valt terug op empty state.

### State variabelen
- `let _selSystemId = null;`
- `let _sysZoek = '';`
- `let _sysSortMode = 'ondergrond';`

### Niet aangepast
- Het "+ Nieuw Systeem" werkbank-modal (de uitgebreide editor met percentages, dragbare stappen, etc.) blijft ongewijzigd.
- `calcSystem()` en `_systeemLocatie()` worden hergebruikt zonder wijziging.
- De Calculatie-tab leest nog steeds dezelfde `data.systemen` array en `_snapshotSystem`-output — geen impact op calc-regels.
- De bestaande CSS-class `.systems-grid` is in de stylesheet blijven staan (mocht 'ie ergens anders alsnog opduiken) — maar wordt in de Verfsystemen-tab niet meer gebruikt.

### Versie
APP_VERSION: `v3.18.8` → `v3.19.0`. Minor bump want layout-paradigm shift, niet alleen styling-tweak.

---

## v3.18.8 — Cluster-volgorde wijzigen vanuit Bewerkingen-tab
Bij de cluster-titels staan nu ↑/↓ knoppen waarmee je de volgorde van de clusters direct vanuit de Bewerkingen-tab kunt aanpassen — zelfde patroon als in de Ondergronden-tab, beide tabs blijven synchroon.

### Wijzigingen

**UI:**
- Elke cluster-titel-balk heeft rechts uitgelijnd twee kleine `↑` en `↓` knoppen, naast de "— N bewerkingen" teller.
- Klik op `↑` schuift de cluster één plek omhoog in de zichtbare lijst, klik op `↓` één plek omlaag.
- Aan beide uiteinden wordt de respectievelijke knop disabled getoond (eerste cluster heeft geen `↑`, laatste cluster heeft geen `↓`).
- Klikken op `↑` of `↓` opent of sluit de cluster niet — `event.stopPropagation()` zorgt dat de toggle-actie van v3.18.7 niet meeloopt.

**Gedrag:**
- Onder water: de `volgorde`-velden van de twee betroffen ondergronden worden in `data.ondergronden` geswapt, de array wordt op `volgorde` opnieuw gesorteerd, en beide records gaan persistent in Supabase via `_updateOndDB`.
- Zowel de Bewerkingen-tab als de Ondergronden-tab worden direct opnieuw gerenderd — geen handmatige tabwissel nodig om te zien dat de Ondergronden-tab gelijktijdig is bijgewerkt.

**Skip-logica voor lege ondergronden:**
- Sommige ondergronden hebben (nog) geen bewerkingen — die worden niet als cluster in de Bewerkingen-tab getoond.
- Als ik de ruwe array-volgorde zou gebruiken zou ↓ vanaf een cluster kunnen "lijken stil te staan" wanneer de directe array-buur een lege ondergrond is (in werkelijkheid wel verschoven, maar onzichtbaar).
- Daarom werkt `moveBewCluster` op de **zichtbare lijst** — de ↓-knop springt direct naar de volgende cluster die wél bewerkingen heeft. Het volgorde-veld in Supabase blijft niettemin correct.

### Niet aangepast
- Volgorde-knoppen voor bewerkingen *binnen* een cluster (eveneens `↑/↓`, via `moveBewInOnd`) waren al aanwezig — die blijven precies zoals ze waren.
- De Ondergronden-tab gebruikt nog steeds zijn eigen `moveOnd` — die stapt 1 plek in de ruwe array (inclusief lege ondergronden). Dat is daar het gewenste gedrag. De twee functies leven naast elkaar.

### Versie
APP_VERSION: `v3.18.7` → `v3.18.8`. Welkomstblok-tekst bijgewerkt.

---

## v3.18.7 — Inklap-clusters in Bewerkingen-tab
Met 14 ondergronden en 115+ bewerkingen werd de Bewerkingen-tab een lange verticale muur. Deze release groepeert de tab nu visueel: alle clusters starten dicht, je klapt open wat je nodig hebt.

### Wijzigingen

**UI:**
- De Bewerkingen-tab toont na page-load / F5 alle 14+ ondergronden als compacte, klikbare balken onder elkaar — geen tabellen tot je een cluster opent.
- Klik op een cluster-titel om uit te klappen → de tabel met bewerkingen verschijnt eronder. Pijltje ▸ wordt ▾.
- Klik nog eens op de titel om weer dicht te klappen. Hele balk is klikbaar (grote hitbox), niet alleen het pijltje.
- Hover-effect op de cluster-titel (lichte achtergrondkleur-shift) maakt zichtbaar dat hij klikbaar is.
- Cluster-spacing kleiner gemaakt (1,4rem → 0,5rem) zodat de dichte balken dicht op elkaar staan en je in één schermhoogte alle 14+ ondergronden ziet.

**Slimme auto-opens:**
- "+ Nieuwe Bewerking" → cluster van de eerste ondergrond wordt automatisch geopend zodat de nieuwe rij direct zichtbaar is.
- Bewerking dupliceren (⎘) → cluster van de gedupliceerde bewerking blijft / wordt open.
- Bewerking verplaatsen via de ondergrond-dropdown rechts in de rij → doel-cluster opent automatisch zodat je ziet waar 'ie geland is.
- CSV-import → alle nieuwe / aangevulde clusters openen automatisch in één keer na succesvolle import, zodat je direct controleert wat er binnen is gekomen.

**Edge cases:**
- Orphans-cluster ("⚠ Zonder ondergrond" — vangnet voor bewerkingen zonder geldige ondergrond-FK) wordt altijd open getoond, is niet klikbaar, en heeft geen toggle-pijltje.
- State leeft in geheugen (Set met ondergrond-IDs). Geen localStorage — bewust simpel: na F5 is alles weer dicht. Voorspelbaar gedrag.

### Niet aangepast
- Materialen-tab en Ondergronden-tab houden hun huidige (uitgeklapte) lijst-rendering. Bewust scope-keuze: eerst Bewerkingen, dan kijken hoe het bevalt.
- Geen "Alles uit/inklappen" knop in de panel-head. Bewust minimaal gehouden — als blijkt dat we 'm missen kan hij later in 5 minuten erbij.
- Het bestaande blauwe normenboek-streepje (v3.18.5), de slimme materiaal-dropdown (v3.18.5) en auto-promotie bij wijziging van minuten/verbruik (v3.18.4) werken ongewijzigd binnen de uitgeklapte tabellen.

### Versie
APP_VERSION: `v3.18.6` → `v3.18.7`. Welkomstblok-tekst bijgewerkt; versie-geschiedenis krijgt later een 1-regel entry.

---

## v3.18.6 — CSV-import voor bewerkingen (Normenboek-integratie Chunk 3/4)
Chunk 1 zette de datalaag (`bron` veld + auto-promotie), Chunk 2 maakte normenboek-rijen visueel herkenbaar + de materiaal-dropdown slim. Deze chunk levert de pijp om écht data in bulk binnen te krijgen: een CSV-import-flow met preview, validatie en duplicaat-detectie.

### Wijzigingen in deze chunk

**Nieuwe UI:**
- Knop **"📥 Importeer CSV"** in de panel-head van de Bewerkingen-tab, naast "+ Nieuwe Bewerking".
- Nieuwe modal `#importBewModal` met twee staten: stap 1 (upload + uitleg + CSV-voorbeeld), stap 2 (preview met counts/lijsten + commit-knop).

**Verwacht CSV-formaat:**

```
ondergrond;bewerking;eenheid;minuten;verbruik
Gevelkozijn hout buiten;Afbranden;m²;15;0
Gevelkozijn hout buiten;Afbijten;m²;25;0,10
Hout binnen;Schuren machinaal;m²;8;0
```

- Header-regel verplicht. Volgorde van kolommen vrij — de parser zoekt op naam (case-insensitive). Ontbrekende kolom → hele import geweigerd.
- Scheidingsteken `;` of `,` wordt automatisch gedetecteerd uit de header-regel (NL-Excel exporteert `;` standaard omdat `,` decimaal is).
- Decimaal `,` of `.` wordt per cel gedetecteerd. Bij beide aanwezig: punt wint, komma's worden als duizendtal-separator behandeld.
- BOM (`\uFEFF`) aan het begin van de file wordt automatisch verwijderd — voorkomt issues bij Excel-export als UTF-8.
- Bestand wordt gelezen als UTF-8.

**Validatie — strikt (één fout = hele import geweigerd, Gian-keuze):**
- Eenheid moet exact `m²`, `m¹` of `stuk` zijn.
- Minuten en verbruik moeten numeriek en ≥ 0 zijn.
- Ondergrond en bewerking mogen niet leeg zijn.
- Bij fouten: preview toont rode foutmelding met regelnummer + reden, geen importeer-knop. Gebruiker corrigeert CSV en probeert opnieuw.
- Lege regels worden stil overgeslagen, geen error.

**Duplicaat-detectie binnen de batch:**
- Twee rijen met dezelfde combinatie `ondergrond + bewerking` (case-insensitive) → tweede wordt geskipt.
- Skipped rijen worden in de preview opgesomd met regelnummer en namen.
- **Niet** gecontroleerd tegen bestaande DB-bewerkingen, omdat per Gian-keuze altijd een nieuwe ondergrond wordt aangemaakt — een nieuwe ondergrond kan per definitie geen bestaande duplicaten hebben.

**Bulk-insert in twee Supabase-calls:**
1. **Ondergronden:** unieke ondergrond-namen uit CSV → array met `crypto.randomUUID()` per stuk + `locatie: 'beide'` (default) + oplopende `volgorde` na de bestaande max. Eén `insert()` call.
2. **Bewerkingen:** per geldige CSV-rij een record met FK naar de net-aangemaakte ondergrond-UUID, `materiaal_id = null`, `bron = 'normenboek'`, `volgorde` oplopend per ondergrond (beginnend op 0).

**Foutherstel halverwege:** als stap 1 lukt maar stap 2 faalt, wordt na de fout-toast de lokale data herladen uit de DB (`_fetchOndergrondenFromDB` + `_fetchBewerkingenFromDB`) zodat de UI in elk geval een consistent beeld toont. Eventuele "wees-ondergronden" zonder bewerkingen zijn dan zichtbaar en kan Gian handmatig verwijderen.

**Na succesvolle import:**
- Toast: "X bewerkingen geïmporteerd uit Y ondergronden".
- Lokale `data.ondergronden` + `data.bewerkingen` aangevuld via `_mapOndFromDB` / `_mapBewFromDB`.
- `renderBewerkingen()` opnieuw — nieuwe rijen verschijnen met **blauwe linker-rand** (Chunk 2) en, waar van toepassing, een hamburger-knop voor de gefilterde materiaal-dropdown.

### Architectuur-keuzes (besloten in filosofeer-fase)

- **Geen voorbeeld-template download** in de modal — Gian heeft het niet nodig.
- **Geen suffix `(normenboek)` op aangemaakte ondergronden** — consistent met Chunk 1 besluit dat bron-marker alleen op bewerking-niveau zit, en met Gian-besluit "altijd nieuwe aanmaken, ik ruim later op". Geen extra DB-migratie voor een ondergrond-bron-veld.
- **Strikte validatie** — geen "import wat kan, skip de rest"-modus. Eén stukke rij betekent dat de gebruiker zijn CSV moet corrigeren en opnieuw moet proberen. Dat dwingt schone data af.
- **Materiaal blijft leeg bij import** — gekoppeld blijft de architectuur-keuze uit Chunk 1. De slimme dropdown van Chunk 2 helpt Gian later het juiste materiaal te kiezen.

### Wat (nog) niet inzit

- Geen progress-bar (bulk-insert is sub-seconde voor ~70 rijen).
- Geen rollback / undo na succesvolle import (handmatig per rij verwijderen blijft mogelijk).
- Geen in-modal correctie van CSV-fouten — gebruiker corrigeert het bronbestand.
- Geen export-naar-CSV — alleen import in deze chunk.

### Backlog (carry-over)

- Beter foutmeldingen in `_sbQuery` calls (toast met echte Supabase-error i.p.v. generieke "Verwijderen/Opslaan mislukt") — al lang open.
- v3.18.2 gedragswijziging (afronding-drempel symmetrisch) kan oude calculaties van mini-klusjes (<0,55 dag) anders laten uitkomen bij heropenen.

### Chunk-roadmap

| # | Inhoud | Status |
|---|---|---|
| 1 | DB-veld `bron` + mapper + auto-promotie | ✅ v3.18.4 |
| 2 | UI-cue (blauwe linker-rand) + materiaal-dropdown gefilterd op groep | ✅ v3.18.5 |
| 3 | CSV-import-flow met preview, validatie, duplicaat-detectie, bulk-insert | ✅ v3.18.6 |
| 4 | Test-import van I-1 + I-2 normbladen (afbranden + afbijten gevelkozijn hout, hoogste norm) | volgende sessie |

---

## v3.18.5 — Visuele cue + slimme materiaal-dropdown (Normenboek-integratie Chunk 2/4)
Chunk 1 zette de datalaag op (`bron` veld + auto-promotie). Deze chunk maakt die zichtbaar in de UI én voegt een eerste stuk slimheid toe aan de materiaal-koppeling. Zodra straks de import-flow draait (Chunk 3) zie je in één oogopslag welke bewerkingen vers uit het normenboek komen, en bij het invullen van het materiaal hoef je niet door de hele lijst te scrollen.

### Wijzigingen in deze chunk

**Visuele cue op normenboek-bewerkingen:**
- Elke `<tr>` in `#bewerkingenLijst` krijgt nu een `data-bron="eigen|normenboek"` attribuut.
- CSS-regel: rijen met `data-bron="normenboek"` krijgen een **4px blauwe linker-rand** (via `box-shadow: inset 4px 0 0 var(--blue)` op de eerste cel — verschuift de inhoud niet).
- Eigen rijen blijven volledig neutraal — stil tot je iets importeert.
- Auto-promotie uit Chunk 1 (`updBew` bij wijziging van `minuten` of `verbruik`) maakt dat de blauwe rand vanzelf verdwijnt zodra je een normenboek-rij aanraakt en de cijfers aanpast.

**Statische mapping bewerking → materiaal-groep:**

```js
const NORM_MATERIAAL_GROEP = {
  'afbranden':      null,                          // geen materiaal verwacht
  'afbijten':       'Hulpmiddelen',
  'wassen ammonia': 'Hulpmiddelen',
  'schuren':        'Hulpmiddelen',
  'gronden':        'Grondverf watergedragen',
  'overlakken':     'Dekverf watergedragen',
  'aflakken':       'Dekverf watergedragen',
  'plamuren':       'Non paint',
  'stoppen':        'Non paint',
  'beitsen':        'Vernis/transparante verf',
  'vernissen':      'Vernis/transparante verf'
};
```

Helper-functie `_resolveExpectedGroup(naam)` matcht **substring, case-insensitive**. Bij conflict tussen twee keys (kan in praktijk niet) retourneert het `null`, dus dan geen filter.

**Slimme materiaal-dropdown met override:**
- Bij een bewerkingsnaam waarvan de groep bekend is, toont de materiaal-`<select>` standaard **alleen** materialen uit die groep.
- **Veiligheidsklep:** als het reeds gekoppelde materiaal buiten de filter valt, wordt het bovenaan toegevoegd zodat de selectie niet stilletjes "leeg" lijkt.
- Naast de dropdown verschijnt een klein **☰**-knopje (`.mat-filter-btn`). Klik toggle't het filter aan/uit voor die ene rij. Aan (default): blauw-getint. Uit: neutraal. Title-attribuut legt uit wat de huidige stand doet.
- Het knopje verschijnt **alleen wanneer een mapping bekend is** — bewerkingen zonder verwachte groep ("ontvetten", "isolerend voorstrijken", etc.) krijgen geen knop en zien de volledige materiaal-lijst zoals voorheen.
- Toggle-state (`_matFilterOff` Set) is **in-memory per pageview**. Een refresh reset alles naar default (filter aan) — bewust gekozen om verborgen UI-state niet tussen sessies te slepen.

**Beits/vernis is meegenomen:** in de oorspronkelijke memo stond dat groep nog "niet ingericht" was, maar `MATERIAAL_GROEPEN` heeft wel `'Vernis/transparante verf'`. De mapping wijst daar nu naar — als de groep leeg is werkt de filter nog steeds (lege lijst → klik op ☰ en je hebt alles), als hij later wordt gevuld werkt het direct.

### Wat (nog) niet zichtbaar is

Nog steeds geen import-flow — dat blijft Chunk 3. Geen UI om handmatig `bron` te kunnen wijzigen (niet nodig — auto-promotie regelt dit). De cue is alleen zichtbaar in de Bewerkingen-tab; verfsystemen en stappen tonen geen bron-indicator (architectuur-keuze uit Chunk 1: receptuur is altijd eigen compositie).

### Backlog (carry-over uit v3.18.4)

- Beter foutmeldingen in `_sbQuery` calls (toast met echte Supabase-error i.p.v. generieke "Verwijderen/Opslaan mislukt") — al lang open.
- v3.18.2 gedragswijziging (afronding-drempel symmetrisch) kan oude calculaties van mini-klusjes (<0,55 dag) anders laten uitkomen bij heropenen.
- Normenboek (~150 boekpagina's) nog te scannen door Gian — relevant voor Chunk 3/4.

### Chunk-roadmap

| # | Inhoud | Status |
|---|---|---|
| 1 | DB-veld `bron` + mapper + auto-promotie | ✅ v3.18.4 |
| 2 | UI-cue (blauwe linker-rand) + materiaal-dropdown gefilterd op groep | ✅ v3.18.5 |
| 3 | Import-flow met auto-aanmaak van ontbrekende ondergronden + bulk-insert | volgende |
| 4 | Test-import van I-1 + I-2 normbladen (afbranden + afbijten gevelkozijn hout) | na 3 |

---

## v3.18.4 — Bewerkingen krijgen herkomst-stempel (Normenboek-integratie Chunk 1/4)
Eerste, onzichtbare stap richting volledige normenboek-integratie. Filosoferen-fase afgerond met de conclusie dat de bestaande `bewerkingen` / `ondergronden` / `verfsystemen` / `verfsysteem_stappen` tabellen 1-op-1 mappen op de structuur van het normenboek (Onderdeel × Bewerking × tarieftijd + materiaalverbruik). Er hoeft architecturaal niets veranderd. Enige toevoeging: een herkomst-stempel om straks visueel te scheiden welke bewerkingen uit Gian's eigen ervaring komen en welke uit het normenboek geïmporteerd zijn.

### Wijzigingen in deze chunk

**DB-migratie (handmatig uit te voeren in Supabase SQL-editor):**
```sql
ALTER TABLE bewerkingen ADD COLUMN bron text DEFAULT 'eigen';
UPDATE bewerkingen SET bron = 'eigen' WHERE bron IS NULL;
```

De `DEFAULT 'eigen'` zorgt dat alle bestaande ~48 bewerkingen automatisch als `eigen` gemarkeerd worden — die zijn allemaal door Gian zelf ingevoerd, dus dat klopt.

**Mapper-functies (`_mapBewFromDB` / `_mapBewToDB`):** veld `bron` toegevoegd, met fallback `'eigen'`. Code is **forward-compatible**: werkt voor én na de DB-migratie omdat de fallback altijd terugvalt op `'eigen'`.

**`updBew()` — auto-promotie:** zodra `field === 'minuten'` of `field === 'verbruik'` wijzigt op een bewerking met `bron === 'normenboek'`, wordt automatisch `bron = 'eigen'`. Naam, eenheid, ondergrond en materiaal-koppeling wijzigen veranderen de cijfers zelf niet — daarvoor géén promotie.

**`addBewerking()`:** nieuwe bewerkingen via deze knop krijgen expliciet `bron: 'eigen'` (was al de DB-default, maar nu ook expliciet in de JS).

### Wat (nog) niet zichtbaar is

Geen visuele cue in de UI — dat is Chunk 2. Geen import-flow — dat is Chunk 3. Geen test op echte normenboek-data — dat is Chunk 4. Onder de motorkap is alles klaar om die chunks straks te dragen.

### Chunk-roadmap (verfijning na filosoferen)

| # | Inhoud | Status |
|---|---|---|
| 1 | DB-veld `bron` + mapper + auto-promotie | **deze versie** |
| 2 | UI-cue (kleur/badge) op normenboek-rijen + materiaal-dropdown gefilterd op verwachte groep | volgende sessie |
| 3 | Import-flow met auto-aanmaak van ontbrekende ondergronden | volgende sessie |
| 4 | Test-import van I-1 + I-2 normbladen (afbranden + afbijten gevelkozijn hout, hoogste norm) | na 3 |

### Architectuur-keuzes (besloten in filosofeer-fase)

- **Bron-marker alleen op `bewerkingen`-niveau**, niet op verfsystemen of stappen. Een verfsysteem-receptuur is altijd Gian's eigen compositie, ook al gebruikt hij normenboek-bewerkingen erin.
- **Geen Type A-G dimensie** uit het normenboek — Gian gebruikt altijd de hoogste norm.
- **Geen Systeem I-V dimensie** in de data — Gian rekent standaard op 100%, en `verfsysteem_stappen.percentage` regelt de aanpassing per project-keten.
- **Materiaal-koppeling bij import**: `materiaal_id = null` (Gian kiest zelf het merk). In Chunk 2 wordt de materiaal-dropdown gefilterd op de verwachte groep (statische mapping in code: gronden → Grondverf watergedragen, aflakken → Dekverf watergedragen, etc.).
- **Beits/vernis-groep nog leeg** in Gian's materialen-tabel — wordt later aangevuld.

## v3.18.3 — Reis-label in calc-paneel beschrijft zichzelf
Op het calc-paneel stond bij de reisregel "Reis (20,40 km, binnen rayon) — € 7,14". Het bedrag klopte (2 factureerbare dagen × 5,1 km enkele reis × 2 heen+terug × €0,35/km = €7,14), maar die 20,40 km was een raadsel: je vult 5,1 km in en ziet 20,40 km terug — pas als je weet dat het ×dagen ×2 is, snap je het. Andere regels in het paneel tonen wél hun samenstelling ("klein mat. 10% over materiaal", "afval 0,5% over arbeid+materiaal"). De reis-regel hoort dat ook te doen.

### Wijziging
Eén regel in `renderTotals()` (regel 8928). Het label toont nu de samenstelling i.p.v. een berekend totaal-km-getal:

| Situatie | Voorheen | Nu |
|---|---|---|
| Binnen rayon | `Reis (20,40 km, binnen rayon)` | `Reis (2 dgn × heen+terug, binnen rayon)` |
| Buiten rayon | `Reis (0,8 u + km)` ← km-getal ontbrak sowieso | `Reis (2 dgn × heen+terug + reisuren)` |
| 0 factureerbare dagen | `Reis (0 km, binnen rayon) — €0,00` | `Reis — €0,00` |

Smaak C uit het filosofeer-gesprek: focus op de logica, geen getallenwirwar. Wie het exacte km-getal wil zien kan dat altijd narekenen vanuit de input (5,1 km enkele reis) en de planning (factureerbare dagen).

### Wat niet wijzigt
- De berekening zelf: 100% identiek aan v3.18.2.
- De interne calc-print (regel 5940): blijft `Reis (X u + Y km)` — daar zijn de getallen op hun plaats in een formele document-context.
- De klant-offerte (regel 6402): blijft `${dagenFactureerbaar} dagen × ${reisAfstand} km enkele reis` — was al zelf-beschrijvend.
- Onderhoudsplan-rekenflow (regel 4338-ev): aparte tab, niet aangeraakt.

### Scope-keuze
Bewust beperkt tot het in-app calc-paneel. De PDF-print is een formeel document met een eigen toon (getallen en breakdown horen daar). Het calc-paneel is werkvloer-tool — daar telt leesbaarheid zwaarder.

### Versie-bump checkpoint
4 verplichte plekken bijgewerkt: APP_VERSION (regel 2036), welkomstblok-titel (regel 1439), CHANGELOG (deze), RELEASE_HIGHLIGHTS-top (regel 2398). Optionele 5e: nieuwe paragraaf bovenaan in welkomstblok-inhoud — toegevoegd.

## v3.18.2 — Afronding-drempel werkt symmetrisch ook onder 1 dag
Gian meldde: bij een calculatie van 0,3 werkdagen werd toch "afronding +0,68 dag €765" bijgeteld, terwijl de drempel op 0,55 stond. Z'n verbazing klopte met de UI-tekst van de drempel ("Pas afronden naar boven als overschot ≥ deze waarde") maar niet met het gedrag van de code. Dat was een gat tussen belofte en uitvoering.

### Achtergrond — wat de code écht deed
Op drie plekken stond een expliciete "minimum 1 dag"-regel die de drempel-instelling overrulede zodra werkelijk < 1 dag was:
- regel **4259** in `_ohpDagen` (onderhoudsplan): `if (werkelijk < 1) factureerbaar = 1;`
- regel **6856** in `_calcDaysFactureerbaar` (calc-tab dashboard helper): `if (d < 1) return 1;`  // commentaar: "klusje: altijd minstens 1 dag"
- regel **9509** in een tweede calc-flow: `else if (dagenWerkelijk < 1) dagenFactureerbaar = 1;`  // commentaar: "klein klusje: altijd minstens 1 dag"

Drie plekken, drie identieke comments. Dat was geen bug — het was een vroegere bewuste keuze die nooit in de UI is opgeschreven. Bij doorvragen bleek de bedoelde bedrijfsregel anders: de drempel hoort de enige plaats te zijn die over afronding gaat, ook onder 1 dag.

### Wijzigingen

**1. Alle drie de plekken: minimum-1-dag-regel verwijderd.** Bij `werkelijk < 1` valt de berekening nu in de algemene drempel-tak: `floor(0,3) = 0`, `overschot = 0,3`, `0,3 < 0,55` → `factureerbaar = 0`. Géén afrondingstoeslag.

**2. UI-tekst van de drempel ongewijzigd.** *"Pas afronden naar boven als overschot ≥ deze waarde. Default 0,6 = 'vanaf halve dag werk over → hele dag factureren'."* — matcht nu 1-op-1 met het gedrag.

**3. Reis & dag/week-staart volgen `dagenFactureerbaar` strikt.** Bij `factureerbaar = 0` worden ook reis en daggebaseerde staart €0. Dat is filosofisch zuiver (factureer alleen waar je de klant op aanspreekt), maar betekent dat je bij mini-klusjes met fysieke reisafstand zelf reiskosten in de staart moet plakken als de klant moet bijdragen. Bewuste keuze van Gian (optie Z in het filosofeer-gesprek) boven een automatische fallback-magie die meer verrassingen geeft dan oplost.

### Gedragswijzigingen voor bestaande calculaties
Calculaties met `werkelijk < 1` én `werkelijk < drempel` (typisch: heel kleine klusjes onder 0,55 dag bij default drempel) krijgen vanaf nu een lagere factureerbare basis — geen afrondingstoeslag meer. Reiskosten worden €0 als de klus binnen 1 dag valt. Dit kan verbazend zijn bij heropenen van oude calculaties van mini-klusjes; bewust herzien is dan op zijn plaats.

Calculaties met `werkelijk ≥ 1` zijn ongewijzigd.

### Versie-bump checkpoint
4 verplichte plekken bijgewerkt (APP_VERSION, welkomstblok-titel, CHANGELOG, RELEASE_HIGHLIGHTS-top). Optionele 5e: welkomstblok-inhoud — nieuwe paragraaf bovenaan toegevoegd met uitleg van het nieuwe gedrag.

## v3.18.1 — Datums per versie in de Versie-geschiedenis
In v3.18.0 stond datums per versie nog onder "Niet meegenomen" met als argument: chronologische volgorde maakt al duidelijk wat recent is. Eén dag later toch teruggekomen op dat besluit — bij 49 entries op één lange lijst wordt "lang geleden vs kort geleden" toch grover dan handig. Een datum naast elke versie maakt de tijdlijn instant leesbaar: in welke week/maand viel iets, hoeveel iteratie zat ertussen.

### Wijzigingen

**1. Datum-veld in `RELEASE_HIGHLIGHTS`** (regel ~2396) — elke van de 49 entries krijgt een `d: 'YYYY-MM-DD'` veld. ISO-formaat als opslagvorm zodat sorteren/formatteren altijd consistent blijft.

**2. Datum-bronnen, 3 niveaus van zekerheid:**
- **Getagde commits (24×)**: versie staat in commit-message van GitHub (`V3.18.0 Logboek`, `v3.16.1 — Staartpost-uren`, etc.). Dag-precieze datum uit commit-timestamp. Inclusief typo-correctie (`V.17.4` → v3.17.4, `V.13.3` → v3.13.3, `Versie 3.12.0 Kopieren tussen onderdelen` → v3.13.0 via feature-match).
- **Inferentie uit timing-gat (2×)**: v3.17.5 en v3.17.1 staan niet in een tag, maar er is steeds één untagged upload tussen twee aangrenzende tagged versies — eenduidig toewijsbaar.
- **Cluster-heuristiek voor v3.11.5 en ouder (23×)**: voor de oude batch staan in GitHub alleen anonieme "Add files via upload"-commits. Heuristiek: 74 untagged uploads geclusterd op 30-minuten-vensters → 30 unieke "release-momenten" → eerste 23 toegewezen aan ontbrekende versies in chronologische volgorde, laatste upload van elk cluster als release-tijdstip. De resterende 7 clusters vallen vóór v3.8.2 (= pre-changelog ontwikkeling, klopt).

**3. Render-helper `_formatDatumNL(iso)`** — voor de helper geplaatste vóór `renderVersieGeschiedenis()`. Mapt YYYY-MM-DD naar Nederlandse spelling ("23 mei 2026") via maand-array. Geen toekomstig typo-risico bij nieuwe releases — alleen ISO invoeren, render-functie doet de rest.

**4. `renderVersieGeschiedenis()` aangepast** — datum-pill ingevoegd tussen versie-pill en highlight-tekst. Styling: italic, kleine font (0.72rem), `--muted` kleur, `min-width: 6.5rem` voor uitlijning. Layout switch van `align-items` default naar `align-items: baseline` zodat versie / datum / highlight op één lijn rusten.

### Onderhoudsnoot

Datums voor v3.11.5 en ouder zijn **gegokt op basis van timing**, niet uit commit-message. Als ik bij terugkijken merk dat een datum mis is, gewoon corrigeren in de array — verandert niets aan de render-flow.

## v3.18.0 — 📜 Versie-geschiedenis: tijdlijn-sectie onder welkomstblok
Gian had behoefte aan iets nostalgisch — een leesbare tijdlijn van hoe de app gegroeid is, niet als ontwikkelaars-logboek maar als verhaal. CHANGELOG.md is technisch en lang (DB-mappers, "Les voor mezelf"-secties, bugfixes-details); voor de "groei-van-de-app"-ervaring werkt curated highlights beter.

### Wijzigingen

**1. Nieuwe `RELEASE_HIGHLIGHTS` array** (regel ~2395) — alle 49 versies sinds v3.8, ieder met versienummer + 1-regel highlight in informeel Nederlands. Newest first. Bij elke nieuwe versie wordt 1 regel BOVENAAN toegevoegd in dezelfde sessie als de CHANGELOG-update. Werkt als parallel-bron naast CHANGELOG.md (technisch detail) vs. RELEASE_HIGHLIGHTS (publieksvriendelijk).

**2. Nieuwe collapsable HTML-sectie** "📜 Versie-geschiedenis" direct onder het welkomstblok in de Dashboard-tab. Hergebruikt de bestaande `intro intro-collapsible collapsed` styling-class voor visuele consistentie. Default ingeklapt — wie wil terugkijken, klikt uit. Een korte instructie-zin bovenin: "Hoe de app gegroeid is, 1 zin per versie — newest first."

**3. `renderVersieGeschiedenis()` functie** — rendert de array als verticale lijst. De huidige versie is geaccentueerd met een `--paper-warm` achtergrond en een dikkere `--accent-deep` linker-rand; oudere versies krijgen een dunnere `--paper-deep` rand. Versie-tekst in mono-font, highlight-tekst in normale UI-font, twee kolommen via flexbox.

**4. Aanroep vanuit `renderDashboard()`** — render-call toegevoegd na `renderCalculatiesArchief()` zodat de geschiedenis-lijst altijd actueel is na laden van het dashboard.

### Niet meegenomen

- **Datums per versie**: gedacht aan, niet gedaan. Per versie de exacte release-datum bijhouden voegt onderhoud toe en de chronologische volgorde (newest first) maakt al duidelijk wat recent is. Voor "lang geleden vs kort geleden" volstaat de positie in de lijst.
- **Scroll-naar-onderaan-knop voor "lees vanaf het begin"**: optie 3 in user-input was dit, Gian koos optie 1 (gewoon newest first, scroll voor oudere).
- **Filter op major versies** (alleen v3.X.0 tonen): zou kunnen, maar dan verlies je de geschiedenis van bugfixes en kleine UX-tweaks die juist het verhaal van "constante optimalisatie" vertellen — passend bij Gian's werkstijl.
- **Live-fetch van CHANGELOG.md**: technisch mogelijk maar de markdown is te technisch en te lang voor casual lezen; curated highlights blijven beter.

### Onderhoudsproces voor nieuwe versies

Bij elke versie-bump vanaf nu: 
1. APP_VERSION verhogen (al bestaand)
2. CHANGELOG.md entry bovenaan (al bestaand)
3. Welkomstblok-titel updaten (al bestaand sinds v3.17.4)
4. **NIEUW**: `RELEASE_HIGHLIGHTS` array — 1 regel toevoegen BOVENAAN

Toegevoegd aan persoonlijke checklist: versie-bump = 4 plekken, niet 3.

## v3.17.5 — Twee bugs in werkdagen-flag + afronding-display
Gian zag op een Keim-calc twee anomalieën: afrondingsregel toonde "0,2 dag" terwijl het werkelijke verschil 0,15 dag was, en de v3.16.1 uren-subregel onder "Totaal uren" verscheen niet ondanks dat hij de "Telt mee in werkdagen"-flag had aangezet in de bibliotheek.

### Bug 1 — afronding-display floating-point artefact
**Probleem**: `(1 - 0.85).toFixed(1)` geeft "0.2" door floating-point representatie (`1 - 0.85 = 0.15000000000000002`). Het **bedrag** is correct (gebaseerd op de exacte 0,15 dag), alleen de **display** rondt verkeerd naar 0,2.

**Fix**: in `renderTotals` regel afronding-display gebruikt nu `fmt(dagenVerschil)` (2 decimalen) i.p.v. `fmt1(dagenVerschil)` (1 decimaal). Resultaat: "0,15 dag" — exact wat het is, geen verwarring. Voor grotere afrondingen (bv. 0,76 dag) toont 'ie nu "0,76 dag" i.p.v. "0,8 dag" wat ook eerlijker is.

### Bug 2 — teltInWerkdagen-flag werd nooit naar DB geschreven
**Probleem**: bij v3.16.0 had ik wel `_mapStaartToDB` (voor `staart_lib` tabel) en de `saveStaart`-payload bijgewerkt, maar **`_mapStaartCalcToDB` (voor de `staart` tabel — staartposten per calc) was vergeten**. Daardoor:
- Bij elke save van een staartpost in een calc: `telt_in_werkdagen` werd niet meegestuurd naar Supabase → bleef default FALSE in DB
- Bij reload van de calc: `_mapStaartFromDB` las de DB-waarde correct, maar die was FALSE
- Resultaat: gebruiker zet checkbox aan in de UI → werkt in-memory tijdens deze sessie → bij navigeren naar andere calc en terug verdwijnt de flag

Daarnaast had **`addStaartFromTpl`** (import uit bibliotheek) `teltInWerkdagen` niet in de payload. Dus zelfs als de template-instelling in `staart_lib` correct was opgeslagen (wat ook bij v3.16.0 was gebroken — maar via `_mapStaartToDB` wél gefixt), werd de flag bij het importeren naar een calc niet overgenomen.

**Fixes**:
1. **`_mapStaartCalcToDB`** (regel 3551): `telt_in_werkdagen: !!s.teltInWerkdagen` toegevoegd
2. **`addStaartFromTpl`** (regel 8629): `teltInWerkdagen: !!t.teltInWerkdagen` overgenomen uit template
3. **`addStaartCustom`** (regel 8645): expliciete `teltInWerkdagen: false` default
4. **`addStaartLib`** (regel 8749): expliciete `teltInWerkdagen: false` default
5. **`_insertStaartCalcDB` (via dupCalc)**: gebruikt nu de gefixte mapper, dus bij calc-duplicatie wordt de flag ook correct overgenomen — extra bonus

### Effect op bestaande staartposten in DB
Bestaande staartposten in de `staart` tabel hebben `telt_in_werkdagen = FALSE` (default uit DB-migratie). Bij eerstvolgende save van een staartpost (bv. naam wijzigen) wordt de in-memory waarde nu correct meegeschreven. Dus de **eerstvolgende keer** dat Gian zijn kleinschaligheidstoeslag opslaat (vink aan, klik Opslaan), wordt 'ie blijvend in DB opgeslagen — niet meer "verdwijnen na reload".

### Les voor mezelf
v3.16.0 had **TWEE** mappers die bijgewerkt moesten worden, niet één: `_mapStaartToDB` (voor `staart_lib`) **én** `_mapStaartCalcToDB` (voor `staart`). Ik heb alleen de eerste gefixt. Toevoegen aan persoonlijke checklist: bij elke nieuwe DB-kolom in een gerelateerde dubbel-tabel-structuur (templates + per-calc instances) ALTIJD beide mappers checken via `grep "verstopInEenheidsprijs:"` of vergelijkbaar — zoek alle plekken waar de andere boolean wordt gemapt.

## v3.17.4 — Welkomsttekst gecorrigeerd: liep drie versies achter
Gian spotte tijdens deploy: na de update naar v3.17.3 stond het welkomstblok inhoudelijk nog op v3.17.0 (Archiveren-feature). Alleen de versie-titel ("Welkom bij v3.17.X") was bij elke versie meegerold; de paragrafen zelf waren sinds v3.17.0 niet bijgewerkt. Dus geen melding van:
- v3.17.1 archiveer-modal class-naam fix
- v3.17.2 nieuw materiaal verschijnt bovenaan
- v3.17.3 klikbare sortering op Naam/Merk/Groep in Materialen-tab

**Wijziging**: welkomstblok herschreven met drie paragrafen, nieuwste features bovenaan (consistent met "newest first"-patroon):
1. v3.17.2 + v3.17.3 — Materialen-tab uitbreidingen (vers-bovenaan + klikbare sortering)
2. v3.17.0 — Archiveren in 1 knop + logische bestandsnamen
3. v3.16-serie — samenvatting (staartposten in werkdagen, transparante uren-subregel)

**Les voor mezelf**: bij elke versie-bump altijd controleren of zowel APP_VERSION als CHANGELOG **én welkomsttekst** zijn bijgewerkt. Niet alleen de versie-titel verhogen — de inhoud moet ook actueel zijn. Toevoegen aan persoonlijke check-list.

## v3.17.3 — Materialen-tab: klikbare sortering op Naam, Merk en Groep
De materialen-lijst stond standaard alfabetisch op groep dan naam — prima default, maar bij doorbladeren naar één specifiek materiaal of merk wil je soms anders kunnen sorteren. Patroon volgt het bestaande dashboard-sorterings-patroon voor consistentie.

**Wijzigingen**
- **Nieuwe state** `_matSort = { key, dir }` — `key` null = default-sortering (groep dan naam), of een van `'naam'|'merk'|'groep'`. `dir` is `'asc'|'desc'`.
- **Nieuwe functie `setMatSort(key)`** — 2-klik cyclus: 1e klik op een kolom → asc, 2e klik op zelfde kolom → desc, klik op andere kolom → switch + start asc. Tekst-asc (A→Z) is de natuurlijke startrichting, anders dan dashboard waar datum-desc (nieuwste eerst) start.
- **Klikbare kolomkoppen** alleen voor Naam, Merk en Groep (tekst-kolommen). Eenh., € Inkoop en € Verkoop blijven niet-sorteerbaar zoals afgesproken — minder relevant in deze tab.
- **Sort-indicator**: kleurloos ↕ (opacity 0.4) op inactieve kolommen, gekleurd ↑ of ↓ op de actieve. Identiek aan dashboard-indicator.
- **`renderMaterialen` sortering uitgebreid**: als `_matSort.key` actief → sorteer op die kolom. Anders default (groep dan naam, zoals voorheen). Beide gebruiken localeCompare voor correcte alfabetische volgorde inclusief diakritische tekens en hoofdletter-ongevoeligheid.

**Vers-items v3.17.2 blijven bovenaan ongeacht actieve sortering**, zoals expliciet door Gian gekozen. Een net toegevoegd materiaal blijft dus duidelijk vindbaar, ook als je tussendoor op Merk sorteert om een ander item te zoeken.

**Tab-switch reset uitgebreid**: bij navigeren naar Materialen-tab vanuit een andere tab worden zowel `_materialenVersToegevoegd` als `_matSort` geleegd. Resultaat: schone lijst in default-sortering, geen verrassende state-carryover.

## v3.17.2 — Nieuw materiaal verschijnt bovenaan (newest first), niet alfabetisch midden in lijst
De materialen-tab sorteert alfabetisch op groep dan op naam. Klik op "+ Nieuw Materiaal" maakt een rij met naam "Nieuw materiaal" en groep "Hulpmiddelen" — die landt door de N-letter midden in de Hulpmiddelen-groep, tussen Delta schuurpapier en Schuurpapier korrel 120. Gevolg: je moet scrollen om 'm te vinden en in te vullen.
- **Nieuwe module-level array** `_materialenVersToegevoegd` (lege bij pageload). Houdt ID's bij van materialen die deze sessie via de toevoeg-knop zijn aangemaakt.
- **`addMaterial`** voegt na succesvolle DB-insert de saved-ID toe aan deze array.
- **`renderMaterialen`** sorteert nu in twee stappen: eerst de vers-toegevoegde items in **omgekeerde insertion-order** (newest first) bovenaan, daarna de rest alfabetisch zoals voorheen.
- **`delMat`** filtert de ID ook uit de tracker (anders blijft 'ie als ghost-referentie hangen voor een verwijderd materiaal).
- **Tab-switch handler**: bij navigatie naar de Materialen-tab wordt de tracker geleegd vóór het renderen, zodat de lijst weer compleet alfabetisch is.

**Wanneer komt 'ie alfabetisch op zijn plek?**
- Bij switch naar een andere tab en weer terug naar Materialen
- Bij pagina-refresh (F5 / Cmd-R) — tracker is sowieso weg
- **Niet** bij in-place wijzigingen (naam, merk, groep, eenheid, prijs) — de gebruiker is dan nog actief bezig met die specifieke regel, je wilt 'm niet opeens onder de cursor wegtrekken

**Bewust niet gedaan**: optie "springt naar alfabetisch zodra naam wordt gewijzigd" (was 3e keuze in user-input). Te verstorend tijdens invullen — je typt, klikt buiten het veld, en opeens is de rij weg.

## v3.17.1 — Archiveer-modal: class-naam fix
De v3.17.0 archiveer-knop deed niets bij klikken — `openArchiveerModal()` voegde `classList.add('open')` toe aan het modal-element, maar alle andere modals in de app gebruiken `classList.add('active')`. De CSS heeft geen `.modal-overlay.open { display: flex }` regel, dus de modal bleef onzichtbaar.

**Wijziging**: in `openArchiveerModal()` en `closeArchiveerModal()` de class-naam veranderd van `'open'` naar `'active'`. Klein typefout in de eerste implementatie, makkelijk te missen bij JS-parse-check (de syntax was prima, de string-waarde matchte alleen niet met bestaande conventie).

**Les voor mezelf**: bij toevoegen van nieuwe modals altijd eerst kijken hoe bestaande modals worden geopend (`grep -n "classList\.add" index.html`) i.p.v. te gokken op een class-naam. JS-parse-check vangt dit type fout niet — alleen een functionele test.

## v3.17.0 — 💾 Archiveren: 1 knop, meerdere PDFs in sequentie
Gian's workflow bij het afronden van een calc: alle relevante PDFs opslaan in dezelfde projectmap als extra veiligheidslaag. Voorheen vijf losse knoppen op vijf plekken (vier in de calc-tab + de Onderhoudsplan-print-knop in de OHP-tab). Nu één knop in de calc-tab die naar een modal leidt, waar je vinkjes zet voor welke PDFs je wilt, en daarna sequentieel doorloopt.

### Wijzigingen

**1. UI: vier print-knoppen vervangen door één Archiveer-knop**
- Weg: 📄 Calculatie als PDF, 📐 Meetstaat als PDF, 📋 Offerte (Yoobi), 📋 Werkbon
- Erbij: **💾 Archiveren** met titel-tooltip "Genereer 1 of meerdere PDFs voor in de projectmap"
- De Onderhoudsplan-print-knop in de OHP-tab blijft staan (heeft zijn eigen context daar), maar onderhoudsplan kun je nu OOK vanuit de archiveer-modal in de calc-tab printen

**2. Modal `#archiveerModal`**
Modal met 5 checkboxes, één per PDF-type. Conditioneel gedrag:
- **Calculatie**, **Offerte (Yoobi)**, **Werkbon**: altijd beschikbaar, default aangevinkt
- **Meetstaat**: aangevinkt + beschikbaar als `data.calc.meetstaat.length > 0`, anders disabled met toelichting "geen meetregels in deze calc"
- **Onderhoudsplan**: aangevinkt + beschikbaar als er een compleet plan (prijspeil + looptijdJaren ingesteld) is voor deze calc; gedetecteerd via `_ohpLoad(calcId)` bij openen modal. Anders disabled met toelichting "geen (compleet) onderhoudsplan voor deze calc"
- "Genereer"-knop start de sequentie; "Annuleren" sluit modal

**3. State: `_archiveerCtx`**
```js
{
  running: false,
  cancelled: false,
  queue: [],     // { type, label } per gekozen PDF
  current: 0,
  total: 0
}
```

**4. Sequence-mechanisme via afterprint-event chaining**
`_archiveerVolgende()` doet één PDF tegelijk:
- Check cancelled → stop
- Check queue leeg → klaar (toast "✓ N PDFs aangeboden voor opslag")
- Register `afterprint` handler die `_archiveerVolgende()` opnieuw aanroept na een korte adempauze (600ms)
- Roep de juiste print-functie aan (`printCalc`, `printMeetstaat`, etc.)
- Browser-print-dialoog opent → gebruiker klikt Opslaan/Annuleren → afterprint-event vuurt → volgende dialoog opent automatisch

Belangrijke kanttekening: browsers maken geen verschil tussen "Opslaan" en "Annuleren" in het afterprint-event. Sequentie loopt door tenzij de gebruiker op de Stop-knop drukt in de status-bar.

**5. Status-bar bovenin de pagina**
Fixed-positioned `#archiveerStatusBar` boven aan de viewport, oranje-bruine accentkleur, met tekst "Bezig met PDF X van Y: {Label}" en een witte **Stop sequentie**-knop. Verschijnt zodra de sequentie start, verdwijnt bij klaar of stop. Onzichtbaar in print-CSS (`@media print { display: none !important }`) zodat 'ie niet in de PDFs verschijnt.

**6. Browser-map-onthouden**
Chrome/Edge/Firefox onthouden de gekozen map in de eerste print-dialoog en stellen die als default in voor de volgende dialogen in dezelfde sessie. Hierdoor kost het hele archiveren van een complete calc nog maar 5× "Opslaan" (in dezelfde map) i.p.v. 5× "Opslaan + map kiezen".

### Niet meegenomen

- **Echte 1-klik-PDF-generatie** zonder dialogen (via jsPDF). Vereist herontwerp van alle print-functies in een andere bibliotheek, en de PDF-output zou er anders uitzien dan de huidige browser-print-output (die we de afgelopen versies juist hebben gepoleerd). Voor de minimaal extra moeite (5 klikken vs 1 klik) was Gian's keuze om bij de browser-print-route te blijven.
- **Auto-detectie van annuleren** in de browser-print-dialoog. Browsers onderscheiden niet tussen Opslaan en Annuleren in de event-output, dus de sequentie loopt door tot ze allemaal geprobeerd zijn of tot je expliciet stopt.

## v3.16.2 — Logische bestandsnamen bij print-naar-PDF
Bij "Opslaan als PDF" in de browser-print-dialoog gebruikte elke print-knop dezelfde default-bestandsnaam ("index" of equivalent). Bij meerdere offertes per dag werd het hierdoor lastig om files terug te vinden — `index (3).pdf`, `index (4).pdf` etc.
- **Nieuwe helper `_setPrintTitle(suffix)`**: past tijdelijk `document.title` aan vlak vóór `window.print()`. Browsers gebruiken `document.title` als default-bestandsnaam in de print-dialoog. Na de print-dialoog wordt de oude titel hersteld via het `afterprint`-event (met setTimeout-fallback van 10s voor browsers zonder afterprint-support).
- **Sanitatie**: verboden filename-tekens (`< > : " / \ | ? *`) worden vervangen door `-`. Dat is met name belangrijk omdat veel projectnamen het `|`-teken bevatten (bv. "Deumens | Voorgevel") wat op Windows verboden is in bestandsnamen.
- **Toegepast op 4 print-knoppen** in de calc-tab:
  - `printCalc()` → `{Project}-calculatie`
  - `printMeetstaat()` (beide aftakkingen: normaal en empty-state) → `{Project}-meetstaat`
  - `printOfferteYoobi()` → `{Project}-offerte`
  - `printWerkbon()` → `{Project}-werkbon`
- **Voorbeeld**: "Deumens | Voorgevel" → `Deumens - Voorgevel-calculatie.pdf`. Browser voegt zelf `.pdf` toe.
- **Onderhoudsplan-print** (`_ohpPrint()`) is bewust NIET meegenomen — buiten de scope van Gian's vraag. Indien gewenst in vervolgsessie toevoegen.

## v3.16.1 — Staartpost-uren transparant in calc-paneel
Bij de v3.16.0 implementatie werkten de werkdagen-berekening en de afrondingstoeslag correct: Deumens-voorgevel ging van 4,1 → 4,7 werkdagen, met kleinere afrondingstoeslag (€292,50). Maar Gian's observatie was terecht: "nergens staat wat er bij komt qua uren uit toeslag kleinschaligheid, alleen werkdagen verandert" — de berekening was niet transparant. Het CALCULATIE-paneel toonde "Totaal uren 61,78 u" en daarna "4,7 werkdagen", zonder uitleg waar het verschil vandaan kwam.

**Wijziging**: per staartpost met `teltInWerkdagen=true` wordt nu een sub-regel getoond onder "Totaal uren" in het CALCULATIE-paneel:
```
Totaal uren                          61,78 u
  + Kleinschaligheidstoeslag          9,3 u    ← nieuw
Arbeid                            €4.633,81
  + afronding (0,3 dag)             €292,50
...
```

Consistent patroon met de bestaande "+ afronding (X dag)" sub-regel onder Arbeid: een "+ uitleg" indent-regel die laat zien waar het opbouw-getal vandaan komt. Bij meerdere staartposten met de flag aan zou je meerdere sub-regels zien (één per post).

**Berekening per post**: `bedrag / uurloon`. Voor type `vast` is dat het vast bedrag direct, voor type `percent` het percentage × grondslag-basis. Types `dag`/`week`/`eenheid` worden hier ook niet getoond (consistent met de exclusie in `_extraUrenUitStaart`).

**Alleen tonen wanneer relevant**: regel wordt overgeslagen als er geen staartposten met de flag zijn óf als het berekende uren-getal ≤ 0. Voor calcs zonder gebruik van deze feature is er geen visueel verschil.

**Geen impact op PDF/Yoobi/werkbon**: deze transparantie-regel staat alleen in het in-app calc-paneel. De externe outputs blijven het werkdagen-getal tonen zoals voorheen — voor de klant is "4,7 werkdagen" voldoende, de opbouw is voor interne controle.

## v3.16.0 — Staartpost telt mee in werkdagen — geen dubbeltelling meer
Gian's observatie tijdens Deumens-calc: 3,8 werkdagen wordt berekend uit pure calc-regel uren (klopt). Maar bij gebruik van zowel kleinschaligheidstoeslag (% over arbeid) als afrondingstoeslag (volle dagen factureren) zit er een dubbeltelling — beide mechanismen dekken hetzelfde fenomeen "kleine klus moet relatief duurder zijn", maar werken nu boven op elkaar.

**Oplossing**: per staartpost een nieuwe opt-in checkbox waarmee het toeslag-bedrag wordt teruggerekend naar uren en meegeteld in de werkdagen-berekening. Door de werkelijke dagen-getoond op te hogen, wordt het verschil met de factureerbare dagen kleiner, en valt de afrondingstoeslag automatisch lager uit.

### DB-MIGRATIE VEREIST (vóór deploy)
In Supabase SQL editor uitvoeren:
```sql
ALTER TABLE staart ADD COLUMN telt_in_werkdagen BOOLEAN DEFAULT FALSE;
ALTER TABLE staart_lib ADD COLUMN telt_in_werkdagen BOOLEAN DEFAULT FALSE;
```
Zonder deze migratie zal opslaan/laden van staartposten falen (kolom bestaat niet).

### Wijzigingen

**1. DB-mappers** (`_mapStaartFromDB` / `_mapStaartToDB`)
Nieuwe property `teltInWerkdagen` ↔ DB-kolom `telt_in_werkdagen`. Backward-compat via `!!` (undefined → false).

**2. UI in staart-modal** (regel ±1863)
Tweede checkbox onder de bestaande "Verwerken in eenheidsprijs". Zelfde visuele stijl (paper-warm box met uitleg eronder). Tekst:
> Telt mee in werkdagen-berekening
> Het bedrag wordt teruggerekend naar uren (bedrag / uurloon) en opgeteld bij de werkdagen. Bedoeld voor toeslagen als kleinschaligheid die feitelijk extra arbeid vertegenwoordigen. Voorkomt dubbeltelling met de afrondingstoeslag (volle dagen factureren) — die wordt automatisch herberekend op de verhoogde werkdagen.

**3. Modal-functies** (`openStaartModal`, `saveStaart`)
Laad/save van de checkbox toegevoegd.

**4. Nieuwe helper `_extraUrenUitStaart(staartPosten, t, uurloon)`** — vlak na `calcStaartTotaal`
Loopt door staartposten, voor die met `teltInWerkdagen=true`:
- type `vast`: bedrag direct
- type `percent`: bedrag berekenen op pure calc-totalen (`t.arbeid` etc. uit `calcProjectTotalen`) — geen circulariteit
- type `dag`/`week`/`eenheid`: **stilletjes genegeerd** (zouden circulair worden, en niet zinvol voor deze flag)

Som van alle bedragen / uurloon = extra uren.

**5. `_calcDays()`**
Update om extra uren mee te tellen:
```js
const extraUren = _extraUrenUitStaart(data.calc.staart || [], t, _S().uurloon);
const u = t.uren + extraUren;
```
Doordat alle plekken in de hoofdcalc (in-app PLANNING-blok, PDF-print, Yoobi-export, werkbon) via `_calcDays()` / `_calcDaysFactureerbaar()` lopen, gaat de wijziging automatisch overal door. **Eén plek wijzigen, vier plekken effect** — mooie tegenstelling met v3.14.0 (rayon-drempel) waar ik vier plekken handmatig moest aanpassen omdat de berekening daar inline stond.

**6. `_calcTotaal`** (onderhoudsplan-pad, regel ±4172)
Aparte path want gebruikt `_ohpDagen()` met `t.uren` als parameter:
```js
const extraUrenStaart = _extraUrenUitStaart(calc.staart || [], t, sett.uurloon);
const dg = _ohpDagen(calc, sett, t.uren + extraUrenStaart);
```

### Effect — voorbeeld Deumens-voorgevel
Zonder v3.16.0:
- Werkelijke dagen: 3,8 (uit pure calc-uren)
- Factureerbare dagen: 4 (volle dagen aan)
- Afrondingstoeslag: 0,2 dag × 2 schilders × 7,5 u × €75 = €225
- Kleinschaligheidstoeslag: €500 (= 10% over arbeid)
- **Totaal extra**: €725 — beide mechanismen werken bovenop elkaar

Met v3.16.0 (kleinschaligheid heeft nu `teltInWerkdagen=true`):
- Extra uren: €500 / €75 = 6,67 uur
- Werkelijke dagen: (57 + 6,67) / 2 / 7,5 = 4,24
- Factureerbare dagen: 5 (volle dagen aan)
- Afrondingstoeslag: 0,76 dag × 2 × 7,5 × €75 = €855
- Kleinschaligheidstoeslag: €500 (ongewijzigd, want bedrag wordt op pure calc-arbeid berekend)
- **Totaal extra**: €1.355 — schijnbaar nog hoger?

Wacht — dit klopt niet met het doel. **Let op**: bij volle dagen factureren wordt 4,24 → afgerond naar 5 dagen. Dat is mogelijk zelfs ongewenst hoog. **Praktijktip voor Gian**: combineer `teltInWerkdagen=true` met `volleDagen=uit` voor deze specifieke calc (de override-toggle in calc-instellingen). Dan toont 4,24 werkdagen, wordt 4,24 dag gefactureerd, en heeft de kleinschaligheid zijn werk gedaan zonder dat de afronding er bovenop komt. Dit is een **werkwijze-overweging** — de software ondersteunt nu beide scenario's, jij kiest per calc.

### Beperkingen — v1
- Alleen `vast` en `percent` ondersteund. `dag`/`week`/`eenheid` worden stilletjes genegeerd om circulariteit te voorkomen. Voor Gian's primaire use-case (kleinschaligheidstoeslag = percent over arbeid) volstaat dit.
- Geen visuele indicator in de UI dat een staartpost de werkdagen beïnvloedt. Kan in een vervolgsessie als pill/badge bij de staartpost-row toegevoegd worden.
- Voorbeeld-rekensom hierboven laat zien dat het zelf-uitschakelen van `volleDagen` per calc nodig kan zijn voor het beoogde effect. Mogelijk gewenste vervolgstap: bij actieve `teltInWerkdagen`-post automatisch een visuele waarschuwing tonen als ook `volleDagen` aanstaat ("staat dat zo bedoeld?").

## v3.15.3 — Meetstaat-tab: project-totaal per regel-type
Bij grotere projecten zoals Zieltjens (75 meetregels over 7 kamers) wordt de bestaande "Totalen per calc-regel"-samenvatting al snel een lange lijst. Voor materiaal-bestelling en voortgang-bewaking heb je dan eigenlijk een niveau hoger nodig: hoeveel m² plafond zit er in het hele project (over alle kamers samen)? Hoeveel m¹ kozijn? Hoeveel m² wand?

**Nieuwe sub-samenvatting** in de Meetstaat-tab, direct onder "Totalen per calc-regel":

> **Project-totaal per regel-type**
> Geaggregeerd over alle onderdelen — handig voor materiaal-bestelling en voortgang-bewaking.
>
> **Plafond** · Steenachtig binnen (6 regels in 6 onderdelen, 9 metingen)     119,77 m²
> **Binnenwanden** · Steenachtig binnen (5 regels in 5 onderdelen, 20 metingen)     175,43 m²
> **Binnendeurkozijnen** · Houtwerk binnen (2 regels in 2 onderdelen, 10 metingen)     56,12 m¹
> *etc.*

**Groepering**: regelnaam (case-insensitive, getrimd) + verfsysteem-ID. Zelfde naam + zelfde systeem mag samen, anders niet. Voorkomt dat bv. "Plafond" met systeem "Steenachtig binnen" en "Plafond" met systeem "Buiten houtwerk" per ongeluk worden samengevoegd.

**Zichtbaarheid**: alleen tonen wanneer minstens één groep ≥ 2 unieke calc-regels combineert. Voor projecten waar elk regel-type maar één keer voorkomt (kleine klussen) is deze sectie redundant met de bovenstaande — dan wordt 'ie automatisch weggelaten.

**Sortering**: groepen met meeste calc-regels bovenaan (= meest interessant om te aggregeren).

**Telling**: aantal unieke calc-regels, aantal unieke onderdelen, totaal aantal metingen — drie cijfers die samen vertellen waar de aggregatie vandaan komt.

**Niet in PDF**: alleen in de in-app Meetstaat-tab, op verzoek van gebruiker. De PDF blijft de detailweergave en de per-calc-regel samenvatting.

## v3.15.2 — Meetstaat PDF: witruimte weg, tabellen mogen pagina-breken
De v3.15.0 PDF gebruikte de bestaande `.section` print-CSS class, die `page-break-inside: avoid` toepast om kleine secties bij elkaar te houden. Voor de meetregels-tabel met 75 rijen (Zieltjens-calc) was dat catastrofaal: de browser probeerde steeds de hele tabel op één pagina te houden, gaf op, duwde de hele sectie naar de volgende pagina, waar 'ie ook niet paste, en herhaalde. Resultaat: 9 pagina's met enkele kop, tabel-header-alleen, en lege pagina's tussendoor.
- **Nieuwe CSS-class** `.section-flow` voor lange secties met tabellen die wél mogen breken:
  ```css
  .print-only .section-flow { page-break-inside: auto; }
  .print-only .section-flow h2 { page-break-after: avoid; }     /* h2 niet alleen onderaan */
  .print-only .section-flow table { page-break-inside: auto; }  /* tabel mag breken */
  .print-only .section-flow thead { display: table-header-group; } /* header herhalen */
  .print-only .section-flow tr { page-break-inside: avoid; }    /* één rij blijft samen */
  ```
- **Toegepast** op zowel de Meetregels-sectie als de Samenvatting-sectie in `printMeetstaat`.
- **Effect**: 9 pagina's gaat terug naar ongeveer 3-4 pagina's (afhankelijk van aantal meetregels), zonder witruimte, met **tabelkop automatisch herhaald** bovenaan elke nieuwe pagina, en geen rijen die halverwege over een pagina-grens breken.
- **Niet aangepast**: andere prints (printCalc, printOfferte, printWerkbon) blijven `.section` gebruiken — die zijn klein genoeg om binnen één pagina te passen, daar werkt `page-break-inside: avoid` juist gunstig.
- **Bonus**: de nieuwe class is hergebruikbaar als ooit een andere lange tabel in een print-output komt — even `section-flow` toevoegen aan de class.

## v3.15.1 — In-app calc-paneel: reis-weergave consistent met rayon-status
Bij de v3.14.0 implementatie van de rayon-drempel waren vier berekenings-plekken aangepast én de PDF-tekst (regel 5516). Maar de **in-app calc-samenvatting** (rechter paneel "CALCULATIE" in de calc-tab) toonde nog steeds altijd `"Reis (X u + km)"`, ongeacht of de calc binnen of buiten rayon viel. Het **bedrag** was correct (alleen km bij binnen rayon), maar de **tekst** suggereerde dat er reisuren in het bedrag zaten — verwarrend, en juist het soort visuele inconsistentie waar je vanaf wilt.

Concreet voorbeeld dat Gian spotte op de Zieltjens-calc: 5,7 km (binnen rayon), groene pill toont correct "geen reisuren", maar het in-app paneel toonde "Reis (1,67 u + km) · € 20,43". Klopt vanuit "€ 20,43 is alleen km", maar "1,67 u" hoort daar niet bij genoemd te worden.
- **Wijziging**: regel 8398 in `renderTotals()`. Tekst is nu conditioneel:
  - Binnen rayon: `"Reis (X km, binnen rayon)"`
  - Buiten rayon: `"Reis (X u + km)"` (zoals voorheen)
- **Consistent met PDF-versie** uit v3.14.0 (regel 5516) — beide weergaves gebruiken nu hetzelfde patroon.

**Achtergrond op deze gemiste plek:** v3.14.0 deed 4 berekenings-plekken correct én de PDF-display, maar de in-app totaal-display was de vijfde plek waar reisuren werden getoond. Lesson voor volgende keer: bij display-veranderingen niet alleen op berekenings-plekken zoeken (`reisUren`, `reisKostenUren`), maar ook expliciet zoeken op weergave-strings (`"Reis ("`, `"u + km"`). Toegevoegd aan persoonlijke check-list voor multi-plek-features.

## v3.15.0 — Meetstaat als PDF
Gian wil de meetstaat kunnen meesturen met de offerte: een professionele bijlage die laat zien aan de klant dat er serieus is gemeten en gerekend, niet zomaar een prijs uit de mouw. Tot nu was de meetstaat alleen in-app zichtbaar — geen knop, geen print, geen exporteerbare versie.

**Nieuwe knop in calc-tab:** `📐 Meetstaat als PDF` naast de bestaande print-knoppen (Calculatie als PDF, Offerte Yoobi, Werkbon). Consistent geplaatst, zelfde stijl (`btn-secondary lock-allowed`).

**Functie `printMeetstaat()`** — patroon volgt `printCalc`:
- Vult `#printArea` met opgemaakte HTML
- Roept `window.print()` — gebruikt bestaande print-CSS in de pagina (header-block, section, footer-block, brand-logo print)
- Geen aparte window.open — zelfde stijl-conventies als de rest

**Layout van de PDF:**
1. **Kop** met logo, "Meetstaat" titel en datum
2. **Project-info** sectie: projectnaam, klant, opname-datum, aantal meetregels, aantal calc-regels in meting
3. **Meetregels-tabel**: # · calc-regel · omschrijving · h (cm) · b (cm) · aantal · totaal · opmerking
4. **Samenvatting per calc-regel**: aantal metingen en totaal per regel (geaggregeerd, met juiste eenheid)
5. **Footer**: app-versie + project-naam + klant + print-datum

**Edge cases:**
- Geen meetregels: toont leeg-state-bericht "Geen meetstaat-regels — voeg meetregels toe in de Meetstaat-tab"
- Calc-regel ontbreekt (referentie naar verwijderde regel): toont `— regel ontbreekt —` italic grijs
- **Lege meetrijen** (h=0 én b=0 én aantal=0): worden gerenderd met `opacity:0.4` zodat klant ziet welke regels niet meetellen — transparant in plaats van weglaten
- HTML-escape op alle vrije velden (omschrijving, opmerking) tegen XSS

**Waarom MINOR bump (v3.15.0):** nieuwe afgeronde feature met eigen knop, eigen functie, eigen output-document. Geen breaking change in bestaande data of API, geen DB-migratie nodig (gebruikt bestaande `calc.meetstaat` array). Past niet als PATCH-tweak op v3.14.x.

## v3.14.2 — Rayon-pill: kortere tekst, past nu op één regel
De v3.14.1 indicator-pill paste verticaal goed onder het reisafstand-veld, maar de tekst zelf brak nog over twee regels in de form-grid breedte: "● binnen rayon (≤ 15 km) — geen" / "reisuren". De drempelvermelding "(≤ 15 km)" was bovendien dubbele informatie — die staat ook in Instellingen.
- **Tekst-wijziging**:
  - Binnen rayon: "● binnen rayon (≤ 15 km) — geen reisuren" → **"● binnen rayon — geen reisuren"**
  - Buiten rayon: "● buiten rayon (> 15 km) — volledige reiskosten" → **"● buiten rayon — incl. reisuren"**
- **Drempel in tooltip**: `title`-attribuut op de pill toont de volledige info bij hover ("Reisafstand ≤ 15 km — geen reisuren-arbeid"). Voor wie meer wil weten zonder UI-overload voor wie het niet hoeft te weten.
- **Symmetrie**: beide pills nu vergelijkbaar in lengte en structuur ("● [status] — [gevolg]"), consistent leesbaar.

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
