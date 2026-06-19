## v3.88.0 — Klanttype VVE in het offerte-blok
Je kunt een offerte nu op drie typen zetten: Particulier, VVE of Zakelijk. VVE krijgt dezelfde algemene voorwaarden als Zakelijk.

### Wijzigingen
- De keuzelijst Klanttype in het Offerte-blok heeft nu drie opties: Particulier, VVE en Zakelijk.
- De keuze die eerst Consument heette is nu Particulier. De werking blijft precies gelijk.
- VVE krijgt overal de zakelijke algemene voorwaarden: in het offertedocument, in de offerte met bijlagen en op de ondertekenpagina.
- In de samenvatting boven de teksten staat nu netjes Particulier, VVE of Zakelijk.
- De standaardteksten volgen voor VVE voorlopig de zakelijke. De vinkjes van v3.87.0 gaan de teksten per type kiezen in de volgende update.
- Geen SQL.

---

## v3.87.0 — Standaardtekst per offertetype, vinkjes (eerste stap)
Per offertetekst kun je nu aanvinken voor welk type hij standaard hoort: Particulier, VVE of Zakelijk. Dit is de eerste stap; de offerte gaat de vinkjes in een volgende update zelf gebruiken.

### Vooraf in Supabase (eenmalig)
- Draai de losse SQL die drie kolommen toevoegt aan offerte_teksten: std_consument, std_vve, std_zakelijk.
- De SQL vult de vinkjes meteen slim voor op de bestaande naam-logica, zodat je huidige automatische keuze blijft werken. VVE begint gelijk aan Zakelijk.

### Wijzigingen
- Op het tabblad Offerteteksten staat bij elke variant de regel Standaard aan voor: met drie vinkjes (Particulier, VVE, Zakelijk).
- Een vinkje aan of uit wordt meteen bewaard.
- De vinkjes sturen de offerte nog niet aan. Dat komt in de volgende stap, samen met het derde klanttype VVE in het offerte-blok.

---

## v3.86.0 — Opmerkingen onder de prijs stapelbaar
De sectie Opmerkingen onder de prijs kan nu meerdere teksten onder elkaar bevatten, net als Werkzaamheden.

### Wijzigingen
- Bij Opmerkingen onder de prijs staat nu de knop + Blok, waarmee je meerdere teksten in één offerte onder elkaar zet.
- Zo kun je bijvoorbeeld zowel je standaard opmerking als de uitleg over een stelpost meesturen.
- Bestaande offertes houden hun ene blok en je kunt er voortaan blokken bij zetten.
- Geen SQL.

---

## v3.85.0 — Invulveld {adres} voor de offerteteksten
Je kunt nu {adres} in een offertetekst zetten. De app vult dan het adres zonder postcode in, bijvoorbeeld Oude Baan 43A, Wittem.

### Wijzigingen
- Nieuw invulveld `{adres}` dat straat, huisnummer en woonplaats invult, zonder postcode.
- Het staat tussen de invulvelden op het tabblad Offerteteksten, naast {project}.
- Het volgt het standaard klantadres, of het afwijkende adres dat je per offerte hebt opgegeven.
- Lege onderdelen vallen weg en bij een leeg adres verschijnen de puntjes, net als bij de andere velden.
- Geen SQL.

---

## v3.84.2 — Fix: uitgezette verfsystemen verdwijnen uit de offerte
Zet je in een calculatie een regel, onderdeel of hoofdgroep uit, dan telt die nu ook echt niet meer mee in het offertedocument en de Yoobi-export.

### Wijzigingen
- Een met het vinkje uitgezette regel, onderdeel of hoofdgroep verschijnt niet meer in de offerte.
- Het projecttotaal hield daar al rekening mee, maar de prijs per regel in de offerte deed dat nog niet. Daardoor verscheen een uitgezet verfsysteem toch en raakten de andere prijzen licht vertekend. Dat klopt nu.
- Geldt voor de knoppen Offertedocument en Offerte + bijlagen en voor de Yoobi-export.
- De interne calculatie-print laat ik ongemoeid.
- Geen SQL.

### Techniek
- In `_berekenOfferteCijfers` en `printOfferteYoobi` werd `allRegels` opgebouwd door `c.hoofdgroepen`, onderdelen en regels te doorlopen zonder `_isActief`-filter, terwijl `calcProjectTotalen` dat wel doet. Daardoor liepen het totaal en de regelverdeling uit elkaar.
- Opgelost door bij het verzamelen van `allRegels` te filteren op `_isActief` op alle drie de niveaus, zodat het gelijkloopt met het projecttotaal.

---

## v3.84.1 — Fix: lege calculatie toont weer 0 uur
Bij een nieuwe of leeggemaakte calculatie bleven de richtwaarde-blokjes het arbeidstotaal van de vorige calculatie tonen. Dat is opgelost.

### Wijzigingen
- Maak je een nieuwe calculatie aan, of haal je de laatste regel weg, dan springen de blokjes "Toeslag kleine objecten" en "Toeslag klimtijd" nu meteen terug naar 0,00 uur en 30%.
- Het was alleen een weergave-restje. Het getal werd nergens in een berekening gebruikt, dus aan je cijfers en totalen veranderde niets.
- Geen SQL.

### Techniek
- `renderTotals` nam bij een lege calculatie (0 uur en geen staartposten) een vroege return voor de placeholder in `totalsBody`, nog voordat `renderNormRefs()` onderaan werd aangeroepen. Daardoor bleef `#normRefs` op de oude inhoud staan.
- Opgelost door `renderNormRefs()` ook in die lege-calc-tak aan te roepen, vlak voor de `return`.

---

## v3.84.0 — Getalvelden: hele waarde selecteren bij aanklikken
Klik of tik je in een cijferveld in de voorcalculatie, dan is de hele waarde meteen geselecteerd. Tik je een nieuw getal in, dan overschrijft dat de oude waarde direct. Geen tekst meer wissen vooraf.

### Wijzigingen
- Elk getalveld (maten, aantallen, prijzen, looptijd, uurloon en alle andere cijfervelden) selecteert zijn hele inhoud zodra je het aanklikt of aantikt.
- Een nieuw getal overschrijft meteen de oude waarde.
- Tik je een tweede keer in hetzelfde veld, dan kun je de cursor gewoon ergens neerzetten. Eerste tik selecteert alles, daarna fijn-positioneren.
- Werkt op Mac en op de iPad. De spinner-pijltjes van een getalveld blijven gewoon werken.
- Tekstvelden zoals namen, adressen, omschrijvingen en notities blijven ongemoeid.
- Geen SQL.

### Techniek
- Eén gedelegeerde `focusin`-luisteraar op `document` pakt alle huidige en later gerenderde `input[type="number"]` velden, zonder veld-voor-veld bedrading; `disabled` en `readonly` velden worden overgeslagen.
- Mac: directe `el.select()` plus herhaling via `setTimeout(0)` en op de `mouseup` van hetzelfde veld, zodat de muisklik de verse selectie niet wist.
- iPad/Safari: de `setTimeout`-select herstelt de selectie die Safari na het focussen soms wist.
- `select()` staat in `try/catch` (number-inputs ondersteunen `setSelectionRange` niet) en herselecteert alleen als het veld nog `document.activeElement` is.
- De spinner-pijltjes blijven werken omdat de `mouseup`-default niet wordt geblokkeerd (re-select in plaats van `preventDefault`).

---

## v3.83.0 — Sectie Bevindingen volgt de notitie uit de calculatie
De offertesectie "Wat zijn onze bevindingen?" wordt voortaan automatisch gevuld met de notitie boven in de calculatie. Eén keer intikken tijdens de opname is genoeg.

### Wijzigingen
- Nieuw invulveld `{bevindingen}` dat de notitie boven in de calculatie ophaalt. Het staat ook in de invulvelden-hulplijst op de Offerteteksten-tab.
- De sectie Bevindingen staat standaard op dit veld. Pas je de notitie later aan, dan loopt de offerte mee.
- Wil je voor een offerte een andere formulering, tik dan het veld in de sectie gewoon over. Dat geldt dan alleen voor die offerte, met het gele "aangepast"-label en de knop terug naar de bibliotheek.
- Bestaande offertes waarin Bevindingen nog leeg is krijgen dit ook. Offertes waar je al tekst in had blijven ongemoeid.
- Bevindingen met streepjes ervoor worden in het document automatisch opsommingstekens.
- Geen SQL.

### Techniek
- `{bevindingen}` toegevoegd aan `_offVulVelden` (`(c.notities||'').trim()`) en aan `OFFERTE_VELDEN`.
- In `_offCfg` krijgt de sectie bevindingen bij een nieuwe offerte het blok `{ variantId: null, tekst: '{bevindingen}' }`. Een bestaande offerte met een lege bevindingen-sectie wordt veilig opgewaardeerd naar dat veld zonder eigen tekst te overschrijven.
- Omdat het veld als placeholder in de blok-tekst staat, blijft de koppeling live: het bewerkveld toont `{bevindingen}`, het voorbeeld en het document tonen de actuele notitie.

---


Geeft een klant via de ondertekenlink akkoord, dan kan hij nu zelf een PDF downloaden waarin staat dat en wanneer hij getekend heeft. Dezelfde bevestigingspagina als jouw archiefexemplaar.

### Wijzigingen
- Na akkoord wordt de download-knop op de ondertekenpagina "Download uw getekende offerte (PDF)". De klant krijgt dan de offerte met achteraan de bevestigingspagina: geaccordeerd door wie, datum en tijd, project, klant, bedrag en de eventuele opmerking.
- Heropent de klant later de link van een al geaccordeerde offerte, dan kan hij de getekende offerte opnieuw ophalen.
- De offerte in beeld blijft de kale offerte zoals verstuurd. De bevestiging komt als extra pagina in de download.
- Het IP-adres blijft van het papier af, net als bij jouw archiefexemplaar.

### Techniek
- De opbouw van de bevestigingspagina is uit `_accordDownloadGetekend` gehaald naar een herbruikbare kern `_bouwGetekendePdfBytes(frozenBytes, info)` plus `_pdfBytesDownload`. Jouw kant gebruikt die nu ook, zodat beide kanten exact dezelfde pagina geven.
- `_accordRender` zet `_accordCtx` (publieke pdfUrl, project, klant, bedrag) en plaatst de download-knop in een container met id `acPdfDl`. Bij een al geaccordeerde link wordt die meteen vervangen door de getekende-knop via `_accordZetGetekendKnop`.
- Bij een vers akkoord in `_accordVerstuur` wordt dezelfde knop gezet met de net ingevulde naam, het tijdstip en de eventuele opmerking. De klant-kant haalt de bevroren PDF via de publieke URL (anon kan niet via de SDK-download door de RLS) en bouwt de getekende PDF met de al geladen pdf-lib.
- Geen SQL.

---


Heeft een klant via de ondertekenlink akkoord gegeven, dan kun je nu een archiefkopie maken van de offerte met de akkoordbevestiging erbij.

### Wijzigingen
- In het linkbeheer staat bij een geaccordeerde offerte een knop "Getekend exemplaar (PDF)".
- Die maakt een kopie van de bevroren offerte met achteraan een aparte bevestigingspagina: geaccordeerd door wie, datum en tijd, project, klant, bedrag incl. btw en de eventuele opmerking van de klant.
- Het document zelf blijft exact zoals het verstuurd is. De bevestiging komt als nette extra pagina achteraan.
- Het IP-adres blijft bewust van het papier af, net als bij de bevestiging op het scherm. Het blijft in de administratie als bewijs.
- Werkt voor links die vanaf deze week (v3.79.0) zijn aangemaakt. Oudere links hebben geen bevroren PDF en krijgen de knop niet.

### Techniek
- Nieuwe functie `_accordDownloadGetekend` haalt de bevroren PDF op (bij voorkeur via `_sb.storage.download` op `pdf_path`, zodat er geen CORS speelt), laadt hem met pdf-lib en voegt een A4-bevestigingspagina toe.
- pdf-lib is nieuw toegevoegd, geladen van de jsdelivr-CDN als globale `PDFLib`.
- De datum komt via `toLocaleString('nl-NL')`, het bedrag via `_accordEur` op het frozen `rij.bedrag`. De opmerking wordt eenvoudig afgebroken met `widthOfTextAtSize`. Tekst wordt naar WinAnsi gesaneerd zodat vreemde tekens de PDF niet breken.
- De kopie wordt als Blob gedownload met bestandsnaam "[project] - getekend.pdf".
- Geen SQL.

---


De handtekening in het offertedocument was te dun en lichtblauw, waardoor hij op papier wegviel. Hij is nu wat steviger aangezet en iets donkerder blauw, zodat hij in print duidelijk leesbaar blijft.

### Wijzigingen
- De handtekening leest nu duidelijk op een afdruk. Het karakter van de echte pen-handtekening blijft behouden.
- Verder verandert er niets aan het document.

### Techniek
- Alleen de data-URI in de constante `HANDTEKENING_ERNES` is vervangen. De twee gebruiksplekken (de `img`-bron in het HTML-document en de pdfmake-`image` in `_bouwOfferteDocDef`) blijven ongewijzigd.
- De bron-PNG is 3x opgeschaald (LANCZOS), de lijnen licht verdikt via een MaxFilter-dilatatie van 3 px, en de doorzichtigheid met gamma 0,7 opgehaald zodat dunne halen voller worden. Inktkleur donkerblauw (25, 45, 110), transparante achtergrond behouden.
- Geen SQL.

---


De accordeerlink (de pagina waar de klant ondertekent) toont voortaan de echte offerte-PDF in plaats van een nagebootst HTML-document. De klant ziet op telefoon en op desktop precies het document dat verstuurd is, inclusief de foto's en de algemene voorwaarden, zonder app of inloggen.

### Wijzigingen
- Bij het aanmaken van een ondertekenlink wordt dezelfde PDF gemaakt als met de knop "Offerte + bijlagen" en bevroren opgeslagen. Die PDF verandert nooit meer, ook niet als de calculatie later wijzigt of vergrendeld wordt.
- De foto's zitten in de PDF gebakken, dus de fotolinks kunnen niet meer verlopen.
- Het akkoord blijft zichtbaar als groene balk boven de offerte en wordt vastgelegd in de administratie (naam, tijdstip, opmerking). Het stempel ín het document vervalt voor de nieuwe PDF-links, want een PDF ligt vast.
- Oude links blijven gewoon werken via de oude HTML-weg. Alleen nieuwe links krijgen de PDF.
- De PDF is even goed afgeschermd als de link zelf: de bestandsnaam is de token uit de link, en de bucket laat geen bladeren toe.

### Techniek
- `_accordNieuweLink` bouwt via `_bouwOfferteCompleetDocDef` de doc-definitie, haalt de bytes op met `pdfMake.createPdf(dd).getBlob`, en uploadt naar de publieke bucket `accord-pdf` onder `{token}.pdf` (`upsert: true`).
- De publieke URL gaat in het bestaande `snapshot`-veld (`snapshot.pdf`), zodat de Edge Function `offerte-accord` ongewijzigd blijft. Het pad gaat ook in de nieuwe kolom `pdf_path` voor opruimen later.
- `_accordRender` kiest: is er een `snapshot.pdf` dan toont het de PDF in een `object` (80vh) met een duidelijke "Offerte openen of downloaden (PDF)"-knop eronder als zekere weg voor iOS; anders de oude iframe-weg met `srcdoc`.
- De HTML-momentopname wordt nog steeds opgeslagen als terugval, mocht het maken of uploaden van de PDF mislukken (bijvoorbeeld als pdfmake niet geladen is). De link werkt dan via de oude weg.

### SQL (los geleverd, vóór de code gedraaid)
- Kolom `pdf_path` (text) op `offerte_accorderingen`.
- Publieke bucket `accord-pdf`, max 25 MB per bestand, alleen `application/pdf`.
- Policies op `storage.objects` voor `authenticated`: insert, update en select binnen `accord-pdf`. Publiek lezen loopt buiten RLS om via de publieke URL.

---


De knop "Offerte + bijlagen" maakt nu één doorlopende PDF in plaats van een browser-print. De offerte, de getekende kozijnen en de foto's komen achter elkaar, met de algemene voorwaarden paginavullend achteraan.

### Wijzigingen
- De kozijntekeningen gaan als scherpe vectortekening mee, met de genummerde gebreken erop. Naast elke tekening staat de locatie, de vorm, de maten, de m¹ uitgesplitst per onderdeel, de m² per vulling en de lijst met gebreken.
- De foto's komen in twee kolommen, elk met de genummerde gebrek-stippen erop, de status (wel of niet meegerekend in de prijs), de opmerking en de lijst met gebreken.
- De algemene voorwaarden staan paginavullend achteraan, in de juiste variant voor consument of zakelijk.
- Het kleine Ernes-logo bovenaan en het Vakwerk-logo met "pagina x van y" onderaan lopen door over de offerte, de kozijnen en de foto's. De algemene voorwaarden blijven paginavullend zonder kop of voet en tellen niet mee in het paginatotaal.

### Techniek
- Nieuwe async builder `_bouwOfferteCompleetDocDef` neemt de content van `_bouwOfferteDocDef` (de offerte) en hangt daar de kozijnen, de foto's en de algemene voorwaarden aan.
- Kozijntekeningen via pdfmake `svg` (`_kozijnThumbSvg` met `genummerd`/`fill`), zodat ze als vector scherp blijven.
- pdfmake kan in de browser geen externe URL's ophalen. De foto's en de AV-paginabeelden worden daarom eerst via een canvas naar data-URI's gezet. Op de foto's worden de gebrek-stippen meteen mee op het canvas getekend.
- Kop, voet en het paginatotaal schakelen op een onzichtbare marker met `id: 'avStart'`. Die legt in de `pageBreakBefore`-callback het AV-startpaginanummer vast (`startPosition.pageNumber + 1`); kop en voet geven `null` vanaf die pagina en het totaal is `avStartPage - 1`.
- `printOfferteCompleet` roept de nieuwe builder aan en opent de PDF, met de oude HTML-print als terugval als pdfmake niet geladen is. `_bouwOfferteDocHtml`, `_bouwKozijnenHtml`, `_bouwFotoHtml` en `_bouwVoorwaardenHtml` blijven als terugval bestaan.
- Geen SQL.

## v3.77.2 — Prijsopgave in de PDF opgeruimd
Drie verfijningen aan de prijsopgave in het pdfmake-offertedocument.

### Wijzigingen
- Het herhaalde kopje "Omschrijving" per gevel is weg in de regel-weergave zonder hoeveelheden. De bovenste regel "Naam | Totaal excl. BTW" labelt de kolommen al, dus dat scheelt ruimte.
- De bijkomende kosten (reiskosten en staart) en het eindtotaal staan nu netjes op dezelfde rechterrand als de gevelbedragen.
- Er zit nu meer witruimte (ongeveer twee regels) tussen de kosten en de tekst eronder.

### Techniek
- Alle prijstabellen en het eindtotaalblok hebben `paddingRight: 0`, zodat de rechterrand overal gelijk is. Gaten tussen kolommen lopen via `paddingLeft` op niet-eerste kolommen (regeltabel 8pt, eindtotaal 6pt), wat de rechteruitlijning niet verstoort.
- Het eindtotaalblok heeft een ondermarge van 24pt gekregen.
- In de regel-weergave wordt de kop-rij van de gevel-tabel alleen nog toegevoegd als de hoeveelheden getoond worden (vijf kolommen).
- Geen SQL.

## v3.77.1 — Kostenkop blijft bij de prijstabel (geen wezen-koppen)
In het pdfmake-offertedocument bleef de kop "Wat zijn de kosten?" met de kolomregel onderaan een pagina staan, terwijl de prijstabel pas op de volgende pagina begon. Dat is opgelost.

### Wijzigingen
- De kostenkop schuift nu mee naar de volgende pagina als hij te laag op de pagina zou beginnen, zodat de kop, de kolomregel en de eerste prijsrijen bij elkaar blijven.
- Dezelfde bescherming geldt voor de andere koppen: een kop blijft niet los onderaan een pagina staan.

### Techniek
- Document-brede `pageBreakBefore`-callback. De kostenkop heeft `id: 'offKostenKop'` en breekt bij `startPosition.top / pageInnerHeight > 0,62`.
- Overige koppen (tekstsecties, de hoofdgroep- en onderdeelkoppen in de regel-weergave en het ondertekenblok) krijgen `headlineLevel: 1` en breken als er geen volgende node meer op de pagina staat (`followingNodesOnPage` leeg).
- Geen SQL.

## v3.77.0 — Offertedocument als echte PDF via pdfmake (fase 1)
De knop "Offerte document" maakt nu een echte PDF in plaats van een browser-print. Dit is de eerste stap van de geplande overstap naar pdfmake.

### Wijzigingen
- Het losse offertedocument wordt gegenereerd met pdfmake. Daardoor loopt het kleine Ernes-logo netjes mee als kopregel vanaf pagina 2, staat het Vakwerk Plusgarantie-logo onderaan en is er een echt "pagina x van y". Het resultaat is identiek in Safari en Chrome.
- Alle inhoud is overgenomen: briefhoofd met bedrijfsgegevens, klant met t.a.v., offertetitel met witruimte, alle tekstsecties (met opsommingen en regelafbrekingen), de prijstabel in beide weergaven (per onderdeel en per regel) inclusief de schakelaars, de bijkomende kosten, het eindtotaalblok en het ondertekenblok met handtekening.
- De offerte-met-bijlagen (knop "Offerte + bijlagen") blijft voorlopig werken zoals hij was. Die volgt in fase 2.

### Techniek
- Nieuwe functie `_bouwOfferteDocDef` levert een pdfmake-documentdefinitie op, gevoed met `data.calc`, `_offCfg()` en `_berekenOfferteCijfers`. `printOfferteDocument` roept `pdfMake.createPdf(dd).open()` aan.
- pdfmake en de lettertypes worden geladen via de jsdelivr-CDN (`pdfmake@0.2.20`).
- Als de bibliotheek niet geladen is (bijvoorbeeld zonder internet), valt `printOfferteDocument` terug op de oude HTML-print.
- `_bouwOfferteDocHtml` en `printOfferteCompleet` zijn ongemoeid gelaten.
- Het lettertype is voorlopig Roboto (de pdfmake-standaard). Eigen lettertype inbedden kan later.
- Geen SQL.

## v3.76.1 — Meer witruimte tussen klantadres en offertetitel
In het offertedocument staat nu meer lucht tussen het klantadres en de regel "Offerte ... | ...".

### Wijzigingen
- De ondermarge van het klantblok (.print-only .off-klant) is vergroot van 22pt naar 54pt, ongeveer vier regels witruimte boven de offertetitel.

### Techniek
- Alleen CSS. Geen SQL.

## v3.76.0 — Logo's ook in de offerte-met-bijlagen via een lopende kop- en voetregel
De logo's lopen nu mee op elke offertepagina, in beide print-knoppen.

### Wijzigingen
- Het Ernes-logo bovenaan en het Vakwerk Plusgarantie-logo onderaan zitten nu in een lopende kop- en voetregel rond de offerte-inhoud. Daardoor verschijnen ze op elke offertepagina, niet alleen in de losse print maar ook in de print met bijlagen (offerte + bijlagen).
- De bijlagen (getekende kozijnen, foto's) en de algemene voorwaarden staan buiten deze kop- en voetregel en blijven dus ongemoeid. De algemene voorwaarden blijven paginavullend.
- Deze opzet werkt via de kop- en voetgroep van een tabel. Dat is in Safari betrouwbaarder dan de vorige techniek met een vaste positie, en er is geen aparte paginamarge meer voor nodig.
- Paginanummers zet je nog steeds aan via de print-optie "Koppen en voetteksten" (Safari) of "Koppen en voetteksten" (Chrome). De browser kan een meetellend nummer niet uit het document zelf halen.

### Aandachtspunt
- Controleer even of in jouw Safari de logo's op alle pagina's meelopen en of de prijstabel netjes op een nieuwe pagina begint. Een lopende voetregel volgt op de laatste pagina de tekst in plaats van strak onderaan te staan; dat is normaal bij deze techniek. Geen SQL nodig.


Een lopende kopregel met het logo, en een strakker prijsoverzicht.

### Wijzigingen
- Op de losse offerte-print staat nu boven aan elke pagina een klein Ernes-logo, links uitgelijnd op de contentrand, naast het garantie-logo onderaan. De bovenmarge van de pagina is daarvoor iets ruimer gezet.
- De regels in de prijstabel staan dichter op elkaar (minder verticale ruimte per regel en minder ruimte na elke tabel). Daardoor neemt het prijsoverzicht in totaal minder ruimte in.

### Aandachtspunt
- Op de eerste pagina staat al de briefkop met het grote logo. Het kleine logo bovenaan verschijnt daar dus erboven. Wil je het kleine logo alleen vanaf pagina 2, of het op pagina 1 weglaten, dan is dat een aparte aanpassing want de browser zet een vaste kopregel standaard op elke pagina. Net als de voettekst is de herhaling per pagina in Safari minder voorspelbaar dan in Chrome. Geen SQL nodig.


Het Vakwerk Plusgarantie-logo staat nu onderaan elke pagina van de offerte.

### Wijzigingen
- Op de losse offerte-print staat het Vakwerk Plusgarantie-logo links onderaan op elke pagina, uitgelijnd zoals het Ernes-logo bovenaan (op de contentrand). Het logo herhaalt via een vaste positie op iedere pagina.
- Voor de paginanummers "x van y" zet je in het print-venster de optie "Kop- en voetteksten" (Safari) of "Koppen en voetteksten" (Chrome) aan. De browser zet dan het paginanummer en de datum erbij. Een automatisch meetellend nummer in het document zelf ondersteunen de browsers bij het printen niet.
- De losse offerte-print gebruikt nu een eigen A4-paginamarge (16mm boven, 15mm zijkanten, 26mm onder voor het logo). De doorlopende print met de bijlagen en de algemene voorwaarden is hierbij niet aangeraakt, zodat de paginavullende AV-beelden heel blijven.
- Het logo had een zwarte achtergrond. Die is transparant gemaakt met een zachte rand en het logo is verkleind, zodat het op wit papier schoon staat en de code niet onnodig groeit.

### Aandachtspunt
- De herhaling van een vaste voettekst op elke pagina is in Safari minder voorspelbaar dan in Chrome. Controleer even of het logo in jouw Safari ook op pagina 2 en verder verschijnt. Lukt dat niet, dan is er een alternatieve techniek mogelijk. Geen SQL nodig.


De prijstabel gebruikt overal dezelfde lettergrootte.

### Wijzigingen
- In de prijstabel van het offertedocument stonden de regelkop (10,5pt) en het eindtotaal (11pt) net iets groter dan de lopende tekst. Die staan nu allemaal op 10pt, gelijk aan de rest.
- Het lettertype was al overal hetzelfde; de cijfers gebruiken alleen tabulaire cijferbreedtes voor nette uitlijning, dat is geen ander lettertype.
- Het vet op de koppen, de subtotalen en het eindtotaal is in deze versie nog ongemoeid gelaten. Geen SQL nodig.


De gegevens in de offertekop staan niet meer vast in de code.

### Wijzigingen
- Onder Instellingen staat een nieuw blok Bedrijfsgegevens en logo. Daar pas je de bedrijfsnaam, het adres, de postcode met plaats, telefoon, e-mail, internet, IBAN, BIC, KvK-nummer en BTW-nummer aan. Die gegevens staan in de kop en in het ondertekenblok van het offertedocument en gelden voor elke offerte.
- In hetzelfde blok stel je de logo-grootte van de offerte in, in punten hoog. Standaard 69, hoger is groter.
- De gegevens werden voorheen vast in de code bewaard. Ze staan nu in de instellingen, met de oude waarden als terugval, zodat een lege of nieuwe installatie er net zo uitziet als voorheen. De waarden worden veilig in HTML weergegeven.
- Onder de motorkap: `data.settings.bedrijf` (setter `updBedrijf`) en `data.settings.offerteLogoPt`, beide in app_settings, defaults gevuld bij het laden. `_bouwOfferteDocHtml` bouwt het bedrijfsblok en de logo-hoogte uit de instellingen. Geen SQL nodig.


Het logo is een derde groter en de kop ademt iets meer.

### Wijzigingen
- Het Ernes-logo bovenaan het offertedocument is een derde groter (van 52 naar 69 pt hoog).
- Tussen het klant-adres en het offertenummer zit nu meer witruimte, zodat de kop wat rustiger oogt. Geen SQL nodig.


Minder schreeuwerige koppen en geen uitgevulde tekst meer.

### Wijzigingen
- De koppen boven elke alinea in het offertedocument zijn nu even groot als de lopende tekst (10pt) maar wel vet. Daardoor vallen ze rustiger in het document in plaats van als grote koppen. Dit geldt voor de sectiekoppen en de gevel- en onderdeel-labels.
- De lopende tekst is links uitgelijnd in plaats van uitgevuld over de volle breedte. Zo ontstaan er geen grote, ongelijke spaties meer tussen de woorden.
- De subtotalen, de bedragen en de eindtotaal-regels blijven precies zoals ze waren. Geen SQL nodig.


Rustiger beeld in het offertedocument.

### Wijzigingen
- De lijn onder de kolomkop "Omschrijving" (en bij de regel-weergave met hoeveelheden ook onder Verfsysteem, Hoeveelheid en Eenheidsprijs) is per onderdeel weggehaald. Bij meerdere onderdelen scheelt dat een hoop herhaalde streepjes.
- Alleen de sectiekop bovenaan, "Naam | Totaal excl. BTW", houdt zijn lijn als scheiding tussen kop en inhoud.
- De subtotalen per onderdeel en de lijnen bij het eindtotaal blijven precies zoals ze waren. Geen SQL nodig.


Bij de regel-weergave kun je de hoeveelheden en eenheidsprijzen nu verbergen.

### Wijzigingen
- Kies je bij Prijsweergave voor Regels, dan staat er nu een schakelaar "Hoeveelheden en eenheidsprijzen tonen". Die staat standaard aan, dus bestaande offertes veranderen niet: je ziet per regel de omschrijving, het verfsysteem, de hoeveelheid, de eenheidsprijs en het bedrag.
- Zet je de schakelaar uit, dan houd je per regel alleen de omschrijving en het regelbedrag over. Het verfsysteem, de hoeveelheid en de eenheidsprijs vervallen, zodat je een offerte per regel kunt sturen zonder je hoeveelheden en eenheidsprijzen prijs te geven. De subtotalen per onderdeel en het eindtotaal blijven staan.
- De schakelaar verschijnt alleen wanneer Regels gekozen is. Bij Per onderdeel verandert er niks.
- Onder de motorkap: nieuw veld `offerte_config.prijsRegelsHoeveelheden` (standaard true). `bouwPrijsPerRegel` vertakt op die schakelaar met de juiste koppen, rijen en subtotaal-colspan. De prijsweergave-keuze hertekent het Offerte-blok zodat de schakelaar meteen verschijnt of verdwijnt. Geen SQL nodig.


Voor een bedrijf of VvE adresseer je nu een persoon naast de organisatie.

### Wijzigingen
- In het Offerte-blok onderaan de Calculatie-tab staat nu een blok Contactpersoon met drie velden: voorletters, tussenvoegsel en achternaam. Bedoeld voor offertes aan een bedrijf of VvE, waar de naam de organisatie is en je een specifieke persoon aanschrijft.
- Is de achternaam ingevuld, dan komt in de kop van het offertedocument onder de organisatienaam een regel "t.a.v. ..." met de volledige naam inclusief voorletters, bijvoorbeeld "t.a.v. J.A. van der Berg".
- De aanhef gebruikt dan de achternaam zonder voorletters, samen met de aanspreekvorm, dus "Geachte heer van der Berg," in plaats van de organisatienaam. Is er geen contactpersoon ingevuld, dan valt de aanhef terug op de klantnaam van de calculatie, precies zoals voorheen.
- Let op: de aanhef verschijnt alleen daar waar je tekst de regel "Geachte {aanhef}," bevat. Staat dat niet in je inleiding-variant, dan komt er ook geen aanhef in het document. Dat controleer je in de Offerteteksten-tab.
- Opslag in `offerte_config.contactpersoon`, geen migratie nodig. Nieuwe helpers `_offContactVol` (voor de t.a.v.) en `_offContactAanhefNaam` (voor de aanhef), aangeroepen in `_bouwOfferteDocHtml` en `_offAanhef`. Nieuwe setter `_offCfgContact`. Geen SQL nodig.


Minder klikwerk bij een nieuwe offerte, en opsommingstekens in de tekst.

### Wijzigingen
- Bij een nieuwe offerte kiest de app per sectie automatisch de variant die bij het klanttype past. Omdat het klanttype standaard op consument staat, staan de consument-teksten meteen klaar en hoef je ze niet meer stuk voor stuk aan te tikken. De keuze gaat op naam: een variant met "consument" of "zakelijk" in de naam wordt gekozen op basis van het klanttype, anders een variant zonder dat onderscheid, anders de bovenste. Heeft een sectie nog geen tekst in de bibliotheek, dan blijft die leeg tot je zelf kiest. Dit geldt alleen voor nieuwe offertes; bestaande offertes blijven precies zoals ze waren.
- Opsommingstekens in de offertetekst: laat een regel beginnen met een streepje en een spatie ("- ") en in het voorbeeld en in het offertedocument wordt dat een bolletje. Meerdere van die regels onder elkaar worden samen één opsommingslijst. Een streepje hoeft niet, ook "•" of "*" gevolgd door een spatie werkt. Gewone regels behouden hun regelafbrekingen zoals voorheen.
- Onder de motorkap: `_offStandaardVariantId` bepaalt de standaardvariant en wordt aangeroepen bij het opbouwen van de sectie-config in `_offCfg`. `_offTekstNaarHtml` zet platte tekst veilig om naar HTML met opsommingslijsten en wordt gebruikt in zowel het voorbeeld als `_bouwOfferteDocHtml`. Nieuwe `.off-bullets`-stijl voor scherm en print. Geen SQL nodig.


Het Archiveren-venster vinkt niet meer alles vooraf aan.

### Wijzigingen
- In het Archiveren-venster stonden alle beschikbare PDF-opties standaard aangevinkt. Meestal heb je er maar een of twee nodig, dus de selectie begint nu leeg. Je vinkt zelf aan wat je wilt en tikt op Genereer. Niet-beschikbare opties (bijvoorbeeld een onderhoudsplan dat er niet is) blijven grijs. Tik je op Genereer zonder iets te kiezen, dan verschijnt de melding dat je minstens één type moet selecteren. Geen SQL nodig.


Twee verbeteringen voor het meten op locatie.

### Wijzigingen
- Cijferblok op de iPad: tik je in een cijferveld (breedte, hoogte, aantal of factor), dan licht de hele waarde nu op. Zo zie je en weet je zeker dat je eerste cijfer de bestaande waarde, meestal de 1, vervangt. De bestaande werking waarbij het eerste cijfer de waarde overschrijft blijft gelijk; alleen de selectie is nu zichtbaar. Geldt voor aanraakschermen waar het cijferblok opent; op de Mac blijft de gewone cursor-bewerking.
- De naam die je een kozijn in de tekenaar geeft vult de omschrijving van die meetstaat-regel, maar wordt niet meer doorgezet naar de volgende regel. Die naam hoort bij dat ene kozijn. De koppeling aan de calc-regel (de gevel) blijft wel onthouden, want die is meestal nog van toepassing.
- Onder de motorkap: `NumPad.open` selecteert bij het openen de volledige veldinhoud (met een korte timeout voor iOS), en `addMeetstaat` neemt de omschrijving alleen over als de vorige handmatige regel geen tekening droeg. Geen SQL nodig.


Fix op v3.67.0: de omzetting draait nu ook bij het openen van de Meetstaat-tab.

### Wijzigingen
- De automatische vulling-regels per kozijntekening (v3.67.0) werden alleen opnieuw opgebouwd nadat je iets in de meetstaat bewerkte, een kozijn opsloeg of een kozijn kopieerde. Bij alleen het openen van de Meetstaat-tab gebeurde dat niet, waardoor een bestaande open calculatie de oude samengerolde regel "Vulling uit kozijntekeningen (automatisch)" bleef tonen tot je een rij aanraakte.
- De sync draait nu ook bij het openen van de Meetstaat-tab. Een bestaande calculatie zet de samengerolde regel daardoor meteen om naar regels per tekening zodra je de tab opent, zonder dat je eerst iets hoeft te wijzigen. De omzetting is idempotent: er wordt alleen naar de database geschreven als er werkelijk iets verandert.
- Geen SQL nodig. De migratie van v3.67.0 (kolom `bron_meetstaat_id`) blijft de enige die nodig is.


In de kozijnen-PDF staat nu onder de naam van elk kozijn waar het zit.

### Wijzigingen
- Onder de naam van elk kozijn in de kozijnen-PDF staat voortaan de locatie: de hoofdgroep en het onderdeel uit de calculatie, bijvoorbeeld "Buiten houtwerk · Voorgevel". Die plek wordt opgehaald uit de calc-regel waaraan de meetstaat-regel met de tekening gekoppeld is, niet uit de tekeningnaam. Zo herken je na de opname, en de klant net zo goed, meteen aan welke gevel een kozijn hoort, ook als de tekening generiek "Kozijn" heet.
- Onder de motorkap bouwt `_bouwKozijnenHtml` een map van calc-regel naar "Hoofdgroep · Onderdeel" uit de meegegeven calculatie `c`, dus ook de doorlopende offerte-PDF en het archief tonen de juiste plek, ook voor een niet-actieve calculatie. Nieuwe print-stijl `.kz-locatie` als rode ondertitel.
- Een tekening die je een eigen naam hebt gegeven houdt die naam; je kunt een verwarrende naam in de tekenaar gewoon aanpassen. Geen SQL nodig.


De m² van deuren en panelen wordt niet meer samengerold. Per kozijntekening krijg je een eigen auto-regel, direct onder zijn tekening.

### Wijzigingen
- De automatische vulling-regels in de meetstaat worden niet meer samengevoegd tot één regel per calc-regel over alle tekeningen heen. Voortaan is er per kozijntekening per calc-regel één auto-regel, en die staat direct onder zijn brontekening, consistent met de m¹ die al per tekening op de regel staat.
- De auto-regel heet naar zijn bron, bijvoorbeeld "Voorgevel · Geveldeur (auto)", zodat je meteen ziet welke deur of welk paneel uit welk kozijn komt.
- Het calc-totaal blijft kloppen: meerdere auto-regels met dezelfde calc-regel tellen op in de samenvatting onderaan de meetstaat.
- Bestaande open calculaties bouwen de regels vanzelf opnieuw op zodra je de meetstaat aanraakt of een kozijn opslaat. De oude samengerolde auto-regels worden daarbij opgeruimd. Vergrendelde offertes blijven ongemoeid.
- De kozijnen-PDF toont de vulling al sinds v3.55.0 per tekening (kop met de tekeningnaam) en per deur (m² met naam), dus de klant leest meteen waar de m² van gemeten is. De meetstaat sluit hier nu op aan.
- Onder de motorkap: `_syncVullingMeetstaat` keyt nu op brontekening plus calc-regel in plaats van alleen calc-regel. Nieuwe helpers `_vullingDoelenPerTekening` (doelen per tekening) en `_herordenVullingMeetstaat` (auto-regel onder zijn bron, volgorde vastgezet op de array-index, alleen gewijzigde rijen weggeschreven). `addMeetstaat` baseert de standaardwaarden van een nieuwe regel op de laatste handmatige regel, niet op een auto-regel.
- Eénmalige SQL-migratie: kolom `bron_meetstaat_id` op de meetstaat-tabel (al gedaan).


Bovenaan de offerte staat nu een net klantblok met naam, adres en woonplaats.

### Wijzigingen
- Het klantblok bovenaan het offertedocument toont nu de naam, de straat met huisnummer en de postcode met woonplaats, in plaats van alleen de klantnaam met de projectnaam. De projectnaam blijft in de titelregel van de offerte staan.
- Nieuwe sectie Adres op de offerte in het Offerte-blok, met velden voor naam, straat, huisnummer, postcode en woonplaats. Standaard staat daar het werkadres uit de calculatie (postcode en huisnummer) en de klantnaam.
- Knop Zoek straat en woonplaats: haalt via de postcode (en huisnummer) automatisch de straat en de woonplaats op bij PDOK, gratis en zonder sleutel. Je kunt alles daarna nog met de hand aanpassen.
- Wil je een ander correspondentie-adres dan het werkadres, dan typ je dat gewoon in de velden. Laat je een veld leeg, dan valt de offerte terug op het werkadres en de klantnaam uit de calculatie.
- Opgeslagen bij de offerte, geen SQL nodig. Bestaande offertes tonen het werkadres totdat je in het Offerte-blok op zoeken klikt of de velden invult.

## v3.65.0 — Akkoord-stempel op de offerte
Na akkoord toont de offerte op de accord-pagina dat en wanneer de klant akkoord heeft gegeven.

### Wijzigingen
- Zodra een klant akkoord geeft, verschijnt in het ondertekenvak van de offerte de regel "Digitaal geaccordeerd door [naam] op [datum]". De klant ziet zo op het document zelf dat hij akkoord is gegaan en op welke datum. Slaat hij de accord-pagina op als PDF, dan staat de stempel erin.
- De stempel verschijnt direct na het akkoord en ook wanneer de klant de link later opnieuw opent.
- Het IP-adres blijft als bewijs in de database staan, maar wordt bewust niet op het papier gezet.
- Nog niet hierin: de bevestigingsmail aan de klant en het seintje aan jou bij een reactie. Die vragen eerst het opzetten van de mailprovider (Resend) en de domeinverificatie, en volgen als apart blok.

## v3.64.0 — Kozijnen en foto's op de accord-pagina
De accordeerlink toont nu het volledige document: offerte, getekende kozijnen, foto-bijlage en algemene voorwaarden, net als de knop Offerte + bijlagen.

### Wijzigingen
- De publieke accord-pagina toont nu het complete document in plaats van alleen het offertedocument. De volgorde is gelijk aan de doorlopende PDF: eerst het offertedocument, dan de getekende kozijnen, dan de foto-bijlage en als laatste de algemene voorwaarden. De per-offerte schakelaars voor kozijnen en foto's worden gerespecteerd.
- De opmaak komt rechtstreeks uit de print-stijl van de app. Bij het tonen wordt de echte print-opmaak uit de geladen pagina gehaald en in het kadertje toegepast, zodat de klant precies ziet wat in de PDF staat. Het losse logo van de bijlage-koppen (dat als data in een aparte regel zit) gaat automatisch mee.
- De fotolinks van Supabase verlopen normaal na een uur. Voor de accordeerlink worden ze in het bevroren snapshot gezet met een houdbaarheid van een jaar, zodat de foto's op de accord-pagina blijven werken zolang de offerte geldig is.
- De algemene voorwaarden worden met absolute adressen bevroren zodat de beelden in het kadertje laden, en de print-truc met negatieve marges is voor het scherm geneutraliseerd. Tussen de onderdelen staat een nette scheidingslijn.
- Let op: maak voor een bestaande offerte even een nieuwe accordeerlink, dan zitten de kozijnen, de foto's en de voorwaarden in het snapshot. Bestaande links tonen nog hun oude inhoud.

## v3.63.1 — Algemene voorwaarden op de accord-pagina en vinkje-fix
De accordeerlink toont nu ook de algemene voorwaarden, en het akkoord-vinkje staat weer netjes.

### Wijzigingen
- De algemene voorwaarden lopen nu mee op de publieke accord-pagina, onder het offertedocument, in de juiste variant (consument of zakelijk) op basis van het klanttype. Ze worden als paginabeelden in het snapshot bevroren op het moment dat je de link aanmaakt, met absolute URLs zodat ze ook in het iframe van de klantpagina laden.
- Het iframe berekent zijn hoogte opnieuw zodra die voorwaarden-beelden geladen zijn, zodat de pagina niet halverwege wordt afgekapt.
- Akkoord-vinkje-fix: de app geeft alle invoervelden standaard volledige breedte, en daardoor werd het selectievakje opgerekt en viel de akkoordtekst ernaast weg. Het vakje krijgt nu een eigen breedte, zodat vakje en tekst weer naast elkaar staan.
- Let op: maak voor een bestaande offerte even een nieuwe accordeerlink, dan zitten de voorwaarden in het snapshot. Bestaande links tonen nog de oude versie zonder voorwaarden.
- De getekende kozijnen en de foto-bijlage staan nog niet op de accord-pagina. Die volgen apart: de fotolinks van Supabase verlopen na een uur en moeten met een lange houdbaarheid bevroren worden, en de bijlagen leunen op de print-opmaak die voor het scherm meegenomen moet worden.

## v3.63.0 — Aanspreekvorm in de aanhef en melding bij reacties
Twee verbeteringen rond de offerte: een nette aanhef met aanspreekvorm, en een melding op het dashboard zodra een klant reageert.

### Wijzigingen
- Nieuw keuzeveld Aanspreekvorm per offerte in het Offerte-blok, naast Klanttype: heer, mevrouw, heer en mevrouw, familie, of zakelijk (geen naam). Opgeslagen in offerte_config, geen SQL.
- Nieuw invulveld {aanhef}. Zet in de inleiding "Geachte {aanhef}," en de app vult de aanspreekvorm plus de klantnaam in, bijvoorbeeld "Geachte heer Nacken,". Bij zakelijk wordt het "Geachte heer, mevrouw," zonder naam. Het veld werkt zowel in het Voorbeeld als in het echte document, want het loopt via dezelfde invulveld-functie. Laat je de aanspreekvorm leeg, dan komt alleen de kale klantnaam, precies zoals voorheen, dus geen verrassingen in bestaande offertes.
- Het veld {aanhef} staat ook in de kopieerbare invulvelden-lijst op de Offerteteksten-tab.
- Nieuw blok Reacties op offertes bovenaan het dashboard. Zodra een klant via de accordeerlink akkoord geeft, afwijst of een vraag stelt, verschijnt daar een regel met het project, de klant en wat er gebeurd is. Per regel een knop Openen (springt naar die calculatie en opent het Accordeerlink-venster) en een knop Gezien. Bovenin staat Alles gezien.
- Een reactie blijft in het blok staan tot je zelf op Gezien klikt. Komt er na het wegklikken een nieuwe vraag of reactie, dan verschijnt die opnieuw.
- Eenmalige Supabase-stap: de kolom gezien_op op offerte_accorderingen, die bijhoudt wat je al gezien hebt. Al uitgevoerd.

## v3.62.0 — Accorderen via een unieke link per offerte
Per offerte kun je nu een accordeerlink aanmaken. De klant opent die zonder in te loggen, ziet de volledige offerte read-only en geeft akkoord, wijst af of stelt een vraag. Dit vervangt het digitale ondertekenen in Yoobi.

### Wijzigingen
- Nieuwe knop Accordeerlink in het Offerte-blok onderaan de Calculatie-tab. Die legt een snapshot van het offertedocument vast (de offerte zoals die op dat moment is) en geeft een publieke link in de vorm ?accord=TOKEN. Een venster toont de link met een kopieerknop en de actuele status.
- Publieke accord-pagina in dezelfde index.html: staat ?accord=TOKEN in de URL, dan slaat de app het inloggen en het laden van de app volledig over en toont alleen de accord-pagina. De bevroren offerte wordt in een geïsoleerd iframe getoond, met eigen opmaak, dus net als de PDF en zonder botsing met de app. Logo en handtekening zitten al als data in het document, dus de weergave is zelfstandig.
- Drie acties voor de klant: Akkoord geven (naam verplicht plus een akkoord-vinkje met het bedrag en verwijzing naar de algemene voorwaarden; de calculatie springt op geaccepteerd), Afwijzen (naam plus reden; de calculatie springt op verloren) en Vraag stellen (een opmerking zonder de offerte af te sluiten; de link blijft geldig).
- Bij een definitieve reactie worden naam, tijdstip, IP-adres en de opmerking vastgelegd. Dat is de bewijslaag nu dit het ondertekenen vervangt.
- De klantkant praat uitsluitend met de Edge Function offerte-accord (draait met de service-sleutel, valt buiten RLS). De klant raakt de database nooit rechtstreeks. De anon-sleutel die de pagina meestuurt geeft geen tabeltoegang omdat de grants zijn ingetrokken.
- Linkbeheer toont per offerte de status: actief en wachtend, geaccordeerd door wie en wanneer, of afgewezen met reden. Eventuele vragen van de klant staan er onder. Met Nieuwe link maken vervang je een nog niet beantwoorde link; een al beantwoorde reactie blijft in het overzicht staan en vraagt eerst om bevestiging.
- Eenmalige Supabase-stappen: de SQL-migratie voor de tabel offerte_accorderingen en de Edge Function offerte-accord. Beide al uitgevoerd. Geen wijziging aan bestaande tabellen.

## v3.61.1 — Voorwaarden vullen de volledige pagina
De algemene voorwaarden in de doorlopende PDF stonden te klein op de pagina.

### Wijzigingen
- Oorzaak: de paginabeelden van de voorwaarden bevatten zelf al de marges van het officiële document, en daar kwam de print-marge van het printvenster (1,5 cm rondom, padding op .print-only) nog eens overheen. Dubbele marge, waardoor de voorwaarden klein in het midden stonden.
- Oplossing: voor de voorwaardenpagina's (.dpv-vw) wordt de horizontale print-marge opgeheven met negatieve marges van 1,5 cm links en rechts, zodat het beeld de volle paginabreedte pakt. De beeldhoogte is begrensd op 26,5 cm zodat een vol beeld nooit een lege vervolgpagina veroorzaakt. Het beeld staat gecentreerd.
- Alleen CSS; geen wijziging aan de logica of aan de losse documenten.


De offertemodule maakt nu in één keer een complete, doorlopende PDF: het offertedocument met de gekozen bijlagen en de algemene voorwaarden achter elkaar.

### Wijzigingen
- Nieuwe knop Offerte + bijlagen in het Offerte-blok onderaan de Calculatie-tab, naast Offertedocument en Voorbeeld. Functie printOfferteCompleet bouwt alles in één printArea en doet één window.print(), zodat de browser er via Opslaan als PDF één doorlopend document van maakt.
- Volgorde in de PDF: 1) het offertedocument, 2) de getekende kozijnen (indien aan en aanwezig), 3) de foto-bijlage (indien aan en aanwezig), 4) altijd de algemene voorwaarden. Tussen elk blok een paginabreuk.
- Twee schakelaars per offerte in het Offerte-blok: Getekende kozijnen en Foto-bijlage. Opgeslagen in calculaties.offerte_config (JSON), standaard aan. Geen SQL-migratie nodig.
- De algemene voorwaarden lopen mee als paginabeelden. De variant (consument of zakelijk) wordt automatisch gekozen op basis van het klanttype uit het Offerte-blok. Vereist dat de vier PNG-bestanden naast index.html in de repo staan: av-consument-1.png, av-consument-2.png, av-zakelijk-1.png, av-zakelijk-2.png (A4 op 150 dpi, officiële STAF-voorwaarden).
- De print-functies zijn opgesplitst in herbruikbare HTML-builders zonder gedragsverandering voor de losse documenten: _bouwOfferteDocHtml (uit printOfferteDocument), _bouwKozijnenHtml (uit printKozijnen) en _bouwFotoHtml (uit printFotoBijlage). De losse knoppen en de Archiveren-flow blijven exact hetzelfde werken.
- Geen Supabase-migratie en geen PDF-merge-library: alles loopt via de bestaande HTML-plus-window.print()-route. Werkt ook offline op de iPad zodra de beelden in de repo staan.
- De aankondiging van de bijlagen in het offertedocument zelf (sectie Bijlagen) blijft zoals in A4a; de werkelijke bijlagen zitten nu in de doorlopende PDF.


Het kostenoverzicht in het offertedocument is nagebouwd naar de vertrouwde Yoobi-offerte, plus drie kleinere correcties.

### Wijzigingen
- Geveluitsplitsing exact als Yoobi (bouwPrijsPerOnderdeel omgebouwd):
  - Projectnaam als kopregel bovenaan de tabel (.proj-row).
  - Per gevel staat elke onderdeel-regel als "Gevel | Onderdeel" met het onderdeel-subtotaal.
  - Daaronder een vetgedrukt gevel-subtotaal met de volledige gevelnaam (inclusief (straatzijde)/(voordeurzijde)), met een lijn erboven (.gevel-sub).
- Kolomkop toegevoegd: "Naam" links en "Totaal excl. BTW" rechts, met een lijn eronder (.kosten-kop).
- Eindtotalen in Yoobi-stijl (bouwBijkomendEnTotaal herschreven): bijkomende kosten (reis + zichtbare staart) lopen door in de lijst; de eindtotalen staan in een apart, rechts ingesprongen blok met een EUR-kolom (Totaal excl. BTW, BTW-percentage, Totaal incl. BTW). De rechts-uitlijning is via inline-style gezet zodat ze betrouwbaar werkt, ongeacht de algemene tabel-CSS.
- Interne regel "In de eenheidsprijzen verwerkt: Kleinschaligheidstoeslag" verwijderd uit de offerte; dit is interne calculatie-informatie en hoort niet in een klantofferte.
- Lijntjes om de blokken in het kostenoverzicht verwijderd; alleen de subtiele lijnen onder de kolomkop, boven de gevel-subtotalen en boven het eindtotaal blijven staan.
- Het kostenblok begint op een eigen pagina (page-break-before: always op .kosten-blok) zodat het altijd compleet bij elkaar staat in plaats van gesplitst over twee pagina's. Let op: test dit in Safari; de paginabreuk kan per print-engine verschillen.

## v3.60.2 — Strakkere offerte: strepen weg en nette pagina-doorloop
Twee laatste punten op het offertedocument: de strepen onder de koppen moesten weg, en de tekst sprong met grote witruimte naar nieuwe pagina's.

### Wijzigingen
- Alle strepen onder de koppen verwijderd binnen .off-doc (h2, h3 en h4 krijgen geen onderlijn meer). Het document is nu lijnloos, op de subtiele lijn boven de bijkomende kosten en boven het eindtotaal na.
- Pagina-doorloop verbeterd. De secties mochten voorheen niet over een paginagrens breken (page-break-inside: avoid), waardoor een hele sectie naar de volgende pagina schoof en er onderaan grote witruimte achterbleef. Binnen .off-doc breken secties nu wel (page-break-inside: auto), zodat de pagina volledig benut wordt en de tekst vloeiend doorloopt.
- Koppenbescherming: page-break-after: avoid op de koppen plus orphans/widows op de tekst zorgen dat een kop nooit alleen onderaan een pagina belandt; de kop schuift mee met zijn eerste regels naar de volgende pagina.
- Tabelrijen in het offertedocument breken niet doormidden over een paginagrens (page-break-inside: avoid op tr), en de kolomkop herhaalt bij een tabel die over twee pagina's loopt.
- Alleen het offertedocument is geraakt; de andere PDF's gebruiken hun eigen opmaak buiten .off-doc.

## v3.60.1 — Logo in offertedocument en rustige prijstabel
Drie punten op het offertedocument: het logo ontbrak, en de horizontale strepen in de prijstabel moesten weg.

### Wijzigingen
- Logo verscheen niet: printOfferteDocument laadde het via erneslogo.png uit de repo, maar dat bestand stond er niet (of onder een andere naam). Logo en handtekening zijn nu ingebakken in de code als centrale globale constanten LOGO_ERNES en HANDTEKENING_ERNES, vlak vóór de onderhoudsplan-functies, zodat alle print-functies erbij kunnen. De voorheen lokale LOGO_ERNES binnen _ohpBuildOfferteHTML is verwijderd; er is nu één bron voor beide. Er hoeven geen losse bestanden (erneslogo.png, handtekening.png) meer in de repo te staan.
- Prijstabel rustiger: de hele offerte-HTML zit in een wrapper div.off-doc. Daarop staat CSS die de tabelranden weghaalt. De horizontale strepen tussen de regels zijn weg; alleen een dunne lijn onder de kolomkop, boven de bijkomende kosten en boven het eindtotaal blijft staan. De randen rond het ondertekenvak blijven behouden.
- De andere PDF's (calculatie, meetstaat, kozijnen, onderhoudsplan, werkbon) zijn niet geraakt; de strepen-loze opmaak geldt alleen binnen .off-doc.

## v3.60.0 — Eigen offertenummering
De app deelt nu zelf offertenummers uit in de vorm JJ-NNN (bijvoorbeeld 26-009), met een per jaar oplopende teller en een instelbaar startnummer.

### Wijzigingen
- Offertenummer in de vorm JJ-NNN: tweecijferig jaartal, streepje, volgnummer met drie cijfers opgevuld met nullen. De teller telt per jaar op en reset elk nieuw jaar terug naar 1 (of naar het ingestelde startnummer voor dat jaar).
- Een calculatie krijgt zijn definitieve offertenummer pas op het moment dat het offertedocument voor het eerst wordt gegenereerd (_kenOfferteNummerToe), niet al bij het aanmaken. Zo blijven kladjes en proefberekeningen zonder nummer en blijft de reeks aaneengesloten. Eenmaal toegekend blijft het nummer vast in offerteConfig (offerteJaar + offerteNr), ook bij opnieuw genereren.
- Nieuwe sectie Offertenummering onder Instellingen met een instelbaar startnummer voor het huidige jaar (ondergrens; het eerstvolgende nummer wordt minimaal dit getal) en een uitgeschakeld info-veld dat toont welk nummer het volgende wordt. Bedoeld om bij de overstap vanuit Yoobi op een bestaande reeks aan te sluiten.
- Tellerstanden en startnummer staan in app_settings (data.settings.offerteTellers per jaar, data.settings.offerteStartNr). Geen Supabase-migratie nodig.
- Botsing-achtervang: kent _kenOfferteNummerToe een nummer toe dat al bij een andere calc in gebruik is (bijvoorbeeld door twee apparaten tegelijk), dan schuift de teller door naar het eerstvolgende vrije nummer en toont een toast-melding. Bewuste keuze voor de eenvoudige aanpak passend bij eenmansgebruik, in plaats van een aparte atomair-ophogende tellertabel.
- De oude noodgreep (volgnummer afgeleid van een hash van het calc-id, vorm JJ-NNNN-V) is vervangen.

## v3.59.2 — Fix: offertedocument opende niet (LOGO_ERNES)
Het offertedocument (v3.59.0) deed niets, niet via de knop Offertedocument en niet via het Archiveren-venster. De console toonde een ReferenceError: LOGO_ERNES is not defined.

### Wijzigingen
- Oorzaak: printOfferteDocument gebruikte LOGO_ERNES voor het briefhoofd, maar die constante is lokaal gedefinieerd binnen _ohpBuildOfferteHTML en daardoor niet bereikbaar vanuit andere functies. De code wierp daardoor een fout vóór window.print, zodat er nooit een printvenster opende. De Archiveren-flow rondde zichzelf wel af (vandaar de melding 1 PDF aangeboden), maar er was niets te zien.
- Oplossing: het briefhoofd laadt het logo nu via src="erneslogo.png" uit de repo, met dezelfde onerror-fallback als de handtekening (src="handtekening.png"). Geen herhaling van de base64-string, geen scope-afhankelijkheid. Beide afbeeldingen laden mee bij het printen.
- Vereist dat erneslogo.png en handtekening.png naast index.html in de repo staan (erneslogo.png stond er al).

## v3.59.1 — Fix: offertedocument in Archiveren
Het offertedocument (v3.59.0) liet zich wel los printen via de knop, maar bleef hangen wanneer het via het Archiveren-venster werd gekozen: er werd een document aangekondigd en vervolgens gebeurde er niets.

### Wijzigingen
- Oorzaak: printOfferteDocument had een extra wachtstap (Promise.all op het laden van de afbeeldingen in printArea) voordat window.print werd aangeroepen. Het Archiveren-venster wacht zelf al op het afterprint-event om naar het volgende document te gaan; die twee mechanismen botsten, waardoor het printvenster niet of te laat opende.
- Oplossing: de wachtstap is verwijderd. printOfferteDocument roept nu direct window.print() aan, net als printCalc, printMeetstaat en _ohpPrint. Het logo is een data-URI (meteen beschikbaar) en de handtekening is een klein PNG-bestand dat ruim op tijd meelaadt; na de eerste keer staat het in de browsercache.

## v3.59.0 — Het offertedocument
Brok A4a van de offertemodule. De generator die van de calculatie en de gekozen teksten een compleet, vormgegeven offertedocument maakt in de Ernes-huisstijl.

### Wijzigingen
- Nieuwe functie printOfferteDocument bouwt het hele offertedocument: briefhoofd met logo en bedrijfsgegevens, klantblok, automatisch offertenummer (vorm JJ-NNNN-V), datum, alle ingeschakelde teksten uit het offerte-blok in documentvolgorde met hun koppen en ingevulde invulvelden, de prijsopgave op de juiste plek, het ondertekenblok met handtekening en de slotzin. Knop Offertedocument staat in het offerte-blok onderaan de Calculatie-tab, naast Voorbeeld.
- Prijsweergave per offerte instelbaar met een nieuwe schakelaar in het offerte-blok: per onderdeel (subtotalen per onderdeel onder de hoofdgroep, Nacken-stijl) of regels (elke regel met hoeveelheid, eenheidsprijs en regeltotaal, Yoobi-stijl). Onder beide weergaven volgen de bijkomende kosten (reis en zichtbare staartposten) en het eindtotaal met BTW.
- Gedeelde rekenkern _berekenOfferteCijfers afgesplitst uit de oude printOfferteYoobi. Zowel het nieuwe offertedocument als de Yoobi-export gebruiken nu deze ene functie, met de verstopte toeslagen proportioneel over de regels verdeeld en eenheidsprijzen naar boven afgerond op een cent. Daardoor zijn de eindbedragen van document en export per definitie identiek.
- Het ondertekenblok toont de handtekening uit handtekening.png (naast index.html in de repo). Ontbreekt dat bestand, dan blijft het vak netjes leeg. De print wacht op het laden van logo en handtekening voordat de printdialoog opent.
- In het Archiveren-venster is de oude optie Offerte (Yoobi) vervangen door twee aparte opties: Offertedocument (het nieuwe document) en Offerte (Yoobi-export) voor de facturatie-workflow. De losse functie printOfferteYoobi blijft ongewijzigd bestaan.
- Offertenummer-helper _offerteNummer: jaar uit de offertedatum plus volgnummer (uit offerteConfig of een stabiele waarde uit het calc-id) plus versie.
- Print via de browser (Opslaan als PDF), zelfde mechanisme als de andere documenten; gebruikt het bestaande printArea met de print-CSS, aangevuld met offerte-specifieke opmaak.
- Bijlagen (getekende kozijnen, foto-bijlage, algemene voorwaarden consument/zakelijk) en het samenvoegen tot één doorlopend PDF volgen in brok A4b.
- Geen Supabase-migratie nodig; bouwt op offerte_teksten en offerte_config uit eerdere brokken.

## v3.58.0 — Offerte-blok in de calculatie
Brok A3 van de offertemodule. Onderaan de Calculatie-tab stel je per offerte de teksten en instellingen samen; de generator (brok A4) maakt er straks het document van.

### Wijzigingen
- Uitklapbaar blok "📄 Offerte" onderaan de Calculatie-tab, onder de totalen. Instellingenrij met klanttype (consument/zakelijk, stuurt de garantietekst en straks de AV-bijlage), offertedatum (standaard vandaag), geldig-tot (springt bij wijzigen van de offertedatum opnieuw op +30 dagen, blijft daarna vrij aanpasbaar) en garantiejaren.
- Per tekstsectie, in documentvolgorde: aan/uit-vinkje, variantkeuze uit de bibliotheek en de tekst direct zichtbaar in een tekstvak. Aanpassen maakt er een offerte-eigen tekst van met een geel "✎ aangepast"-label en een knop ↺ Bibliotheek om terug te keren; ongewijzigde teksten volgen de bibliotheek live. Werkzaamheden is stapelbaar: + Blok voegt blokken toe, × haalt ze weg (minimaal één blijft staan).
- Voorbeeld-venster (👁 Voorbeeld, ook bij vergrendelde calculatie te openen): alle gekozen teksten met de documentkoppen en echt gevulde invulvelden. {totaal_incl} komt uit de centrale archief-berekening (respecteert de settings-snapshot van vergrendelde calculaties), {werkdagen} is het factureerbare aantal, datums in lang NL-formaat. Auto-secties staan als grijze placeholders ertussen.
- Opslag in calculaties.offerte_config (JSON) via een gerichte, gedebouncede update van alleen dat veld. De kolom is bewust niet opgenomen in _mapCalcHeaderToDB, zodat een header-save nooit een verse offerte-config kan overschrijven (zelfde principe als totaal_offerte_origineel). De header-mapper leest de kolom wel mee.
- Een vergrendelde calculatie zet ook het offerte-blok op slot via de bestaande lock-CSS; alleen de Voorbeeld-knop blijft werken.
- Geen Supabase-migratie nodig; de kolom offerte_config bestaat sinds brok A1.

## v3.57.0 — Tab Offerteteksten: de tekstenbibliotheek van de offertemodule
Brok A2 van de offertemodule. Een eigen tab met alle vaste offerteteksten als bibliotheek, in de volgorde van het offertedocument.

### Wijzigingen
- Nieuwe tab Offerteteksten naast de andere bibliotheken. De zestien tekstsecties staan in documentvolgorde, elk uitklapbaar, met de documentkop erbij (bv. "Wat zijn onze bevindingen?"). De automatisch gegenereerde delen (briefhoofd, prijsopgave, ondertekenblok, bijlagenlijst) staan als grijze regels ertussen, zodat de complete documentopbouw zichtbaar is.
- Per sectie meerdere varianten: naam, volgorde (pijltjes; de sectie hernummert in stappen van 10) en de tekst in een ruim tekstvak. Wijzigingen worden direct bij het verlaten van een veld opgeslagen, zonder re-render zodat de cursor blijft staan. Toevoegen per sectie met + Variant, verwijderen met bevestiging. De open/dicht-stand van de secties blijft staan tijdens het werken.
- Invulvelden-hulplijst bovenin: {klant}, {project}, {werkdagen}, {totaal_incl}, {geldig_tot}, {opnamedatum} en {garantiejaren} als knoppen, tik om te kopiëren. De generator (brok A4) vult ze straks vanuit de calculatie.
- Sectieregister OFFERTE_SECTIES als vaste constante in de code (code, naam, documentkop, type tekst/auto, stapelbaar). Brok A3 (offerte-blok in de calculatie) en A4 (generator) bouwen hierop voort. De sectie werkzaamheden is stapelbaar: daar kunnen per offerte meerdere blokken tegelijk in.
- Offerteteksten laden mee bij het opstarten, net als de andere bibliotheken, en vallen buiten de localStorage-herstelroute.
- Foutmeldingen bij opslaan, bijwerken en verwijderen tonen de werkelijke Supabase-fout in de toast.
- Vereist de SQL-migratie van brok A1 (tabel offerte_teksten, kolom offerte_config op calculaties), gedraaid op 12 juni 2026.

## v3.56.2 — Dashboard rekent nu altijd met de meetstaat
De archief-berekening deed de meetstaat-som niet zelf en rekende daardoor met verouderde regel-hoeveelheden. Nu doet zij eerst dezelfde som als de calculatie-kaart.

### Wijzigingen
- De meetstaat is de bron van de regel-hoeveelheden, maar die som werd alleen voor de actieve calculatie gezet bij het renderen van de Calculatie-tab. Het dashboard, de bedragen-cache en het bevriezen bij gereedmelden gebruikten daardoor de kale hoeveelheden uit de database. Bij een net via kozijnen en meetstaat opgebouwde calculatie (zoals Nacken 13) toonde de lijst zo € 2.069,78 waar de kaart terecht € 11.751,71 zegt.
- De archief-berekening doet nu als eerste stap zelf de meetstaat-som per regel, in het geheugen en zonder database-writes, met exact dezelfde rijformule als de kaart (stuk, m¹ met één of twee maten, m², inclusief factor). Regels zonder meetstaat-rijen behouden hun handmatige hoeveelheid.
- Dit corrigeert alle plekken die op deze route leunen: het lijstbedrag voor geopende calculaties, het zelfherstel van de cache, het cachen bij wijzigen en vergrendelen, het bevriezen van het oorspronkelijke offertebedrag en het scenario-blok.
- Lijstbedragen herstellen zichzelf zodra je de calculatie één keer opent. Is een calculatie met te lage hoeveelheden gereed gemeld, zet de status dan even op Concept en terug zodat het bevroren offertebedrag opnieuw correct wordt vastgelegd; de instellingen-snapshot wordt daarbij opnieuw met de huidige tarieven gezet.
- Geen Supabase-migratie nodig.

---

## v3.56.1 — Lijst en calculatie rekenen weer hetzelfde
Het bedrag op het dashboard kon afwijken van het totaal in de calculatie zelf. De oude archief-rekenroute is regel voor regel gelijkgetrokken met de kaart.

### Wijzigingen
- Het dashboard gebruikte voor geopende calculaties (en voor het cachen van het lijstbedrag) een oude, parallelle berekening die niet was meegegroeid met de calculatie-kaart. Daardoor kon de lijst bijvoorbeeld € 3.372,15 tonen waar de calculatie € 2.737,01 zegt. De calculatie had altijd gelijk; het lijstbedrag was fout.
- Gelijkgetrokken: toeslag-uren met "telt in werkdagen" (zoals de kleinschaligheids- en klimtoeslag) tellen nu ook in het archief mee in de werkelijke werkdagen, zodat er geen afrondingstoeslag meer bij komt die de calculatie terecht niet rekent.
- Gelijkgetrokken: de rayon-regeling. Binnen het rayon kosten reisuren niets, alleen de kilometers tellen.
- Gelijkgetrokken: procent-staartposten rekenen over de arbeid zonder afrondingstoeslag, precies zoals de kaart, en de grondslag "subtotaal" (verkoopwaarde) wordt nu ook in het archief ondersteund.
- Zelfherstel: bij het openen van een calculatie wordt het juiste totaal stil teruggeschreven naar de lijst. Foute lijstbedragen genezen dus vanzelf zodra je de calculatie een keer opent; ook een aan/uit-vinkje of statuswissel schrijft het juiste bedrag.
- Het bevroren "oorspronkelijke offertebedrag" van vergrendelde calculaties blijft bewust ongemoeid. Wil je dat voor een bestaande calculatie corrigeren, zet de status even op Concept en daarna terug; let op dat de instellingen-snapshot dan opnieuw met de huidige tarieven wordt gezet.
- In de code staat nu een duidelijke waarschuwing dat de kaart en de archieffunctie synchroon gehouden moeten worden bij toekomstige formule-wijzigingen.
- Geen Supabase-migratie nodig.

---

## v3.56.0 — Navigatiebalk blijft bovenin staan
De tabbalk plakt nu bovenaan het scherm, zodat je vanuit een lange lijst altijd direct van tab kunt wisselen.

### Wijzigingen
- De navigatiebalk (Dashboard tot en met Instellingen) blijft bij het scrollen bovenaan staan. De koptekst met het logo scrolt gewoon weg, alleen de tabbalk plakt.
- De balk ligt boven de pagina-inhoud maar onder vensters, het cijfertoetsenbord en meldingen, dus die blijven werken zoals je gewend bent.
- Automatisch scrollen naar een veld houdt rekening met de hoogte van de balk, zodat het doel niet half onder de balk verdwijnt.
- Op een smal scherm kun je de balk zelf nog steeds horizontaal schuiven.
- Geen Supabase-migratie nodig.

---

## v3.55.0 — Kozijnen-PDF met volledige onderbouwing
De kozijnen-bijlage laat nu dezelfde onderbouwing zien als de tekenaar: uitsplitsing van de meters, deurnamen met m² en de loze onderdorpel.

### Wijzigingen
- Onder elk kozijn in de PDF staat de uitsplitsing van de strekkende meters, bijvoorbeeld "42,17 m¹ (frame 12,37 + tussenwerk 8,33 + ramen 21,47)". Posten die nul zijn worden weggelaten en de roeden van v3.54.0 lopen er gewoon in mee.
- Elke deur of elk paneel krijgt een eigen regel met naam en oppervlak, dus "Geveldeur transparant: 3,42 m²" in plaats van een kaal getal. Een nog niet gekoppelde vulling heet "Vulling". Dit werkt meteen voor alle bestaande tekeningen, want de namen zitten al in de opslag.
- Heeft het kozijn een loze onderdorpel, dan staat dat als grijze vermelding achter de meters, net als in de voet van de tekenaar.
- De uitsplitsing wordt vanaf nu bij Klaar in de tekening bewaard (veld `m1Delen` in de tekening-JSON). Tekeningen van vóór deze versie tonen in de PDF het totaal zoals voorheen, tot je ze een keer opent en op Klaar tikt.
- Het overzicht "Getekende kozijnen" in de app blijft bewust compact: thumbnail, naam en totaal.
- Geen Supabase-migratie nodig.

---

## v3.54.0 — Roeden in de kozijn-tekenaar
Een raam met ruitjes teken je nu echt zo: stel per vak in hoeveel ruitjes het raam breed en hoog is en de roeden tellen mee in de strekkende meters.

### Wijzigingen
- Tik een vak aan en stel bij "Roeden · ruitjes" met de plus- en min-knoppen in hoeveel ruitjes het raam breed en hoog is, bijvoorbeeld 2 breed × 3 hoog (= 6 ruitjes, dus 1 staande en 2 liggende roeden, maximaal 8×8). Terug naar 1×1 haalt de roeden er weer af.
- De roeden komen als dunne lijntjes in het vak te staan, duidelijk dunner dan een tussenstijl of tussendorpel, zodat je het verschil in één oogopslag ziet.
- De strekkende meters van de roeden tellen mee in het totaal dat bij Klaar in de regel landt. In de voet staat de opsplitsing nu als frame + tussenwerk + ramen + roeden.
- De lengtes kloppen ook in schuine en boog-vakken: elke roede wordt als werkelijke koorde op de vak-vorm geknipt, met dezelfde rekenwijze als de deellijnen.
- Roeden gaan vanzelf mee bij Dupliceren en bij het kopiëren naar een andere gevel, en zijn zichtbaar op de mini-tekening op de meetstaat-regel, in het overzicht "Getekende kozijnen" en in de kozijnen-PDF, die allemaal dezelfde render delen.
- Op een vulling (dicht paneel) kun je geen roeden zetten; het ronde raam houdt zijn eigen kruis- en spaken-indeling. Bestaande tekeningen blijven ongewijzigd.
- Techniek: de ruitjesverdeling wordt als `ro: { k, r }` op de vak-node in de tekening-JSON bewaard; bij 1×1 verdwijnt het veld weer. Geen Supabase-migratie nodig.

---

## v3.53.0 — Loze onderdorpel in de kozijn-tekenaar
Een deurkozijn zonder houten onderdorpel: tik op de onderrand van het frame en hij telt niet meer mee.

### Wijzigingen
- Tik in de tekenaar op de onderdorpel van het frame om te wisselen tussen kozijnhout en loos. Een korte melding bevestigt de wissel. In markeer-modus blijft een tik onderaan gewoon een gebrek-stip plaatsen.
- Een loze dorpel wordt getekend als een dun grijs stippellijntje, in dezelfde stijl als de loze stijl bij een verticale deellijn (v3.46.0).
- De breedte van de onderrand telt niet mee in de frame-m¹. Dat werkt bij rechthoek, schuin enkel, schuin punt en boog; bij rond bestaat er geen onderdorpel. Achter de omtrek-regel in de tekenaar-voet staat "loze onderdorpel" als geheugensteun.
- De instelling wordt in de tekening opgeslagen en gaat vanzelf mee bij Dupliceren en bij het kopiëren naar een andere gevel (v3.52.0).
- De stippellijn is ook zichtbaar op de mini-tekening op de meetstaat-regel, in het overzicht "Getekende kozijnen" en in de kozijnen-PDF, die allemaal dezelfde render delen.
- Bestaande tekeningen blijven ongewijzigd (houten dorpel) tot je de onderrand aantikt.
- Techniek: de geometrie levert naast de gesloten contour nu ook een open variant zonder ondersegment (`dOpen`) plus het dorpel-segment zelf; de tik-zone is een brede transparante lijn over de onderrand, naar het patroon van de deellijn-tikzones. Geen Supabase-migratie nodig.

---

## v3.52.0 — Getekend kozijn kopiëren naar de gevel waar je mee bezig bent
Een kopieer-knopje op de tegels in "Getekende kozijnen", dat een kozijnmodel in één tik overzet naar het actieve onderdeel.

### Wijzigingen
- Op elke tegel in het overzicht "Getekende kozijnen" staat rechtsboven een blauw ⧉-knopje. Tikken kopieert het kozijn naar het onderdeel waar je mee bezig bent, zonder dialoogjes.
- Het actieve onderdeel wordt bepaald via de onderste handmatige meetstaat-rij, hetzelfde onthouden-principe dat + Regel al gebruikt. Automatische vulling-rijen tellen daarbij niet als context.
- Binnen dat onderdeel zoekt de app de calc-regel met dezelfde naam als waar het bron-kozijn aan hangt en hangt de kopie daaraan. Een melding bevestigt waar de kopie geland is ("Kozijn gekopieerd naar Zuidgevel · Gevelkozijnen en -ramen").
- De kopie is een eigen exemplaar (losse tekening): naam, vorm, maten, indeling en ramen gaan mee. Gebrek-stippen gaan bewust niet mee; die documenteren het exemplaar, niet het model. Voor een kopie mét gebreken binnen dezelfde regel bestaat Dupliceren in de tekenaar.
- Aantal en factor van de nieuwe regel beginnen op 1.
- Vulling-koppelingen (deuren, panelen) worden per vak op regelnaam hergekoppeld binnen het doel-onderdeel. Is daar geen regel met die naam, dan komt het vak op "nog koppelen" te staan, zichtbaar in de tekenaar.
- Heeft het doel-onderdeel geen calc-regel met de naam van de bron-regel, dan verschijnt een melding met de aanwijzing om die eerst toe te voegen (het blauwe ⧉ op de onderdeel-balk in de Calculatie-tab verspreidt een regel naar andere onderdelen). Er wordt dan niets gekopieerd.
- Bij een vergrendelde offerte wordt het knopje niet getoond.
- Geen Supabase-migratie nodig.

---

## v3.51.1 — Project-totaal per regel-type toont nu alle regel-types
Regel-types die maar in één onderdeel voorkwamen, vielen weg uit het project-totaal. Nu staan ze er allemaal.

### Wijzigingen
- Het overzicht "Project-totaal per regel-type" onderaan de meetstaat toonde alleen regel-types die over meer dan één calc-regel verspreid waren. Een post die maar in één gevel of kamer voorkwam (een hekje, een losse deur) verscheen er niet, terwijl je die voor de materiaal-bestelling net zo goed nodig hebt.
- Het filter is verwijderd. Alle regel-types staan nu in het project-totaal, ongeacht in hoeveel onderdelen ze voorkomen.
- De volgorde is grootste posten eerst (meeste regels), daarbinnen alfabetisch op naam, zodat het overzicht stabiel en leesbaar blijft.
- Geen Supabase-migratie nodig.

---

## v3.51.0 — Aantal in de kozijn-tekenaar, plus een fix op de vulling
Een aantal-veld in de tekenaar voor identieke kozijnen, en de vulling-m² schaalt nu correct mee.

### Wijzigingen
- Onderaan in de kozijn-tekenaar, bij de totalen, staat nu een veld Aantal. Geef je daar een getal groter dan 1 op, dan telt dit kozijn zo vaak mee zonder dat je het hoeft te dupliceren.
- De totalen onder de tekening tonen bij een aantal groter dan 1 zowel het per-stuk-getal als het totaal (×N), voor de omtrek (m¹) en voor de vulling (m²).
- Het aantal wordt opgeslagen op de meetstaat-regel van de tekening (het bestaande aantal-veld) en pas vastgelegd bij Klaar, net als de naam en de maten.

### Fix
- De m² van een vulling (deur of paneel) schaalde nog niet mee met het aantal en de factor van het kozijn, terwijl de omtrek dat al wel deed (lengte × aantal × factor). Daardoor telde een getekende deur die meerdere keren voorkwam maar als één deur in de m². Vanaf nu vermenigvuldigt de vulling-m² ook met aantal en factor.
- **Let op voor bestaande calculaties:** staat er in een offerte een getekend kozijn met een vulling op een aantal groter dan 1, dan wordt de vulling-m² nu hoger en correct. Loop zulke calculaties na als je ze nog gebruikt.
- Geen Supabase-migratie nodig. Aantal en factor zijn bestaande kolommen op de meetstaat.

---

## v3.50.2 — Materiaal-bedrag per bewerkingsregel zichtbaar
Het totale materiaal-bedrag per stap staat nu in beeld, zodat je kunt zien dat het meeschaalt met het percentage.

### Wijzigingen
- In het grijze regeltje onder elke bewerking in een calc-regel staat nu naast de totale uren ook het totale materiaal-bedrag (verkoop) voor die stap, in blauw.
- Beide grootheden zijn met het percentage en de hoeveelheid van de regel verrekend. Een stap op 25% toont dus een kwart van de uren en een kwart van het materiaal.
- Bij een stap zonder gekoppeld materiaal verschijnt het materiaal-bedrag niet, het regeltje blijft dan zoals het was.
- De berekening zelf is niet aangeraakt. Het materiaal schaalde altijd al correct mee, zowel in de offerteprijs (`calcSnapshotStep`) als in het te bestellen verbruik op de werkbon (`_aggregeerMateriaalVerbruik`). Dit maakt het alleen zichtbaar ter controle.
- Geen Supabase-migratie nodig.

---

## v3.50.1 — Meetstaat-tabel smaller op een breed scherm
De getalkolommen in de meetstaat rekten op een breed scherm onnodig uit. De tabel heeft nu een vaste kolom-layout.

### Wijzigingen
- De meetstaat-tabel kreeg een vaste kolom-layout (table-layout: fixed). De kolommen b, h, aantal en factor hebben nu krappe, afgemeten breedtes in plaats van mee te rekken met het scherm.
- De vrijgekomen ruimte gaat naar de kolommen calc-regel, omschrijving en opmerking, waar bredere velden wel nut hebben.
- De kaartweergave op een staande iPad of telefoon blijft ongewijzigd. Die zit in een eigen stuk opmaak voor smalle schermen en is niet aangeraakt.
- Geen Supabase-migratie nodig.

---

## v3.50.0 — Calc-regel dupliceren
Een ⎘-knop op elke calc-regel, om de regel met het complete verfsysteem in één keer te kopiëren binnen hetzelfde onderdeel.

### Wijzigingen
- Op elke regel in de calculatie staat nu naast het rode verwijderkruisje een knop ⎘. Die maakt een volledige kopie van de regel met het hele verfsysteem eronder: alle bewerkingen met hun percentages, dezelfde ondergrond, eenheid, toeslag-percentage en de hoeveelheid. De naam krijgt (kopie) erachter.
- De kopie komt direct achter het origineel te staan in hetzelfde onderdeel, zodat je hem meteen terugvindt.
- De meetstaat gaat bewust niet mee. De kopie staat met de hoeveelheid van het origineel als handmatig getal en je vult de meting van de kopie zelf opnieuw in. Past bij de praktijk waarin je dezelfde opbouw voor een andere plek met andere maten neerzet.
- Een vergrendelde offerte blijft ongemoeid: in een verzonden of geaccepteerde calculatie staat de knop net als de andere knoppen op slot.
- Techniek: `dupRegel()` hergebruikt `_insertRegelDB()` (parent-regel plus de stappen-snapshot), exact zoals `dupCalc()` dat doet. De kopie krijgt een volgorde tussen het origineel en de volgende regel in. Geen Supabase-migratie nodig.

---

## v3.49.2 — Wis-toets met een duidelijk symbool
De wis-toets op het cijferblok toonde op de iPad geen icoon. Hij heeft nu een gewoon ⌫-symbool dat altijd zichtbaar is.

### Wijzigingen
- De wis-toets van het cijferblok gebruikt nu het Unicode-teken ⌫ in plaats van een icoon uit het icoon-lettertype. Op de iPad laadde dat lettertype niet, waardoor de toets leeg leek. Het ⌫-teken werkt zonder extra lettertype.
- Geen Supabase-migratie nodig.

---

## v3.49.1 — Verwijderknop bij kozijnen weer in beeld
Het rode kruisje om een meetregel te verwijderen staat nu links op een vaste plek, zodat een brede kozijn-miniatuur het niet meer uit beeld duwt.

### Wijzigingen
- In de meetstaat staat het verwijder-kruisje nu links in de actie-kolom, vóór het potlood of de kozijn-miniatuur. Daardoor blijft het altijd zichtbaar, ook bij een breed kozijn.
- Voorheen stond het kruisje rechts naast de miniatuur; bij een brede tekening viel het buiten de kolom en kon je de regel niet verwijderen.
- De automatische regels (auto) houden zoals altijd geen knoppen, want die worden uit de kozijntekeningen bijgehouden.
- Geen Supabase-migratie nodig.

---

## v3.49.0 — Min-knop op het cijferblok
Een ±-knop bij aantal en factor, zodat je een kozijn kunt aftrekken van een gevel of binnenwand.

### Wijzigingen
- Het cijferblok heeft nu een ±-knop, die alleen verschijnt bij de velden aantal en factor in de meetstaat. Tik na het intikken van het getal om de waarde negatief te maken; nog een tik maakt hem weer positief.
- Een negatieve aantal of factor maakt het rijtotaal negatief en trekt zo van het totaal af. De praktijk: maak een aparte regel voor het kozijn, vul breedte en hoogte positief in en zet het aantal op -1 (of -2, -3 bij meerdere gelijke kozijnen).
- Bij breedte, hoogte en de kozijn-maatvelden blijft de knop bewust weg, want een negatieve maat hoort daar niet.
- Op de Mac met fysiek toetsenbord kun je in deze velden nu ook gewoon een minteken typen.
- Techniek: het cijferblok zet een `np-signon` klasse op het raster bij velden met `data-np-sign`; de ±-toets wisselt het leidende minteken op de waarde. De meetstaat-rekenregel en de Supabase-mapping rekenen al met negatieve waarden door, dus geen migratie nodig.

---

## v3.48.0 — Verfsystemen dupliceren
Een Dupliceren-knop op elke verfsysteem-kaart, om snel een variant te maken zonder het origineel te raken.

### Wijzigingen
- Op elke verfsysteem-kaart staat nu naast Bewerken en Verwijderen een knop Dupliceren.
- Dupliceren maakt een volledige kopie van het systeem: alle stappen met hun percentages, dezelfde ondergrond, eenheid en notities. De naam krijgt (kopie) erachter.
- De kopie opent meteen in het bewerk-venster, zodat je hem direct kunt aanpassen (bijvoorbeeld een laag eraf halen of een andere ondergrond kiezen).
- Het is een echt nieuw systeem in de bibliotheek met eigen regels in Supabase, dus wat je aan de kopie verandert laat het origineel ongemoeid.
- Techniek: `dupliceerSysteem()` hergebruikt `_insertVerfsysteemDB()` (parent plus stappen) en daarna `editSystem()` op het nieuwe id. Geen Supabase-migratie nodig.

---

## v3.47.1 — Cijferblok loopt door naar een nieuwe meetregel
Kleine uitbreiding op het cijferblok van v3.47.0, na de praktijktest op de steiger.

### Wijzigingen
- Volgende op de factor van de láátste meetregel maakt nu automatisch een nieuwe regel aan en zet het cijferblok meteen in de breedte van die nieuwe regel. Zo kun je regel na regel wegtikken zonder tussendoor op "+ Regel" te drukken.
- Dit gebeurt alleen als de laatste regel gevuld is (breedte of hoogte groter dan nul). Is de regel leeg, dan sluit het blok gewoon, zodat er geen lege regels ontstaan als je klaar bent.
- Tussen bestaande regels sprong Volgende al door (van de factor van een regel naar de breedte van de volgende). Dit gedrag is ongewijzigd; alleen het einde van de laatste regel is nieuw.
- In de kozijntekenaar blijft Volgende binnen de maatvelden; daar wordt uiteraard geen meetregel aangemaakt.
- Techniek: de bestaande functie `addMeetstaat()` wordt hergebruikt (die voegt de regel toe, rendert opnieuw en focust de breedte van de nieuwe regel), waardoor het cijferblok vanzelf weer opkomt. Geen Supabase-migratie nodig.

---

## v3.47.0 — Eigen cijferblok voor het steigerwerk
Een eigen numeriek toetsenbord onder de meetstaat- en kozijn-maatvelden, zodat invoeren op de iPad op de steiger sneller en handschoen-vriendelijk wordt.

### Wijzigingen
- De velden breedte, hoogte, aantal en factor in de meetstaat, en alle kozijn-maatvelden, openen voortaan een eigen cijferblok. Het iPad-toetsenbord blijft uit (via `inputmode="none"`); het veld blijft wel aanklikbaar.
- Het blok is een vaste balk onderaan het scherm met grote knoppen 0 tot 9, een wis-toets en een Volgende-toets. De pagina schuift zo dat het actieve veld zichtbaar blijft boven de balk.
- Knopindeling op verzoek: de Volgende-toets (enter) staat groot rechtsonder, waar hij vertrouwd aanvoelt, en bevestigt de waarde plus springt naar het volgende veld. De wis-toets staat rechtsboven, ver van Volgende, zodat ze niet verwisseld worden. Aan het einde van de reeks sluit het blok vanzelf.
- De factor is een decimaal veld en krijgt een komma-toets (linksonder); de hele getallen (breedte, hoogte, aantal, kozijn-maten) krijgen die niet. Een komma wordt intern omgerekend naar een punt, zodat de berekening blijft kloppen. De factor wordt ook met een komma getoond.
- Het eerste cijfer dat je intikt vervangt de bestaande waarde (zoals een rekenmachine); daarna typt het verder. Buiten het veld tikken of op Klaar drukken sluit het blok.
- Op de Mac met een fysiek toetsenbord blijft normaal typen werken; letters worden in deze numerieke velden geweerd, en Enter/Tab blijven door de velden lopen zoals voorheen.
- Techniek: de invoervelden zijn van `type="number"` naar `type="text"` gegaan (nodig voor de komma-weergave en betrouwbaar cursorgedrag op iOS); de invoer wordt komma-tolerant ingelezen via nieuwe helpers `_npFloat` en `_npInt`. Het bijwerken van een meetstaat-veld bouwt de tabel niet opnieuw op, dus de velden blijven onder het blok staan. Geen Supabase-migratie nodig.

---

## v3.46.3 — Foto-bijlage: lege beginpagina nu echt opgelost
De aanpassing in v3.46.1 loste de lege eerste pagina niet volledig op. Deze versie pakt de oorzaak goed aan.

### Wijzigingen
- Oorzaak: ook na v3.46.1 had het fotoblok een opmaak met een harde "niet over een paginarand breken". Daardoor sprong het hele blok naar pagina twee als het naast de kop niet in één keer paste, en bleef pagina één leeg op de kop na.
- Het fotoblok gebruikt nu dezelfde tabel-opmaak als de meetstaat- en calculatie-PDF: de tabel mag tussen de rijen breken, terwijl een rij (en dus een foto) als geheel bij elkaar blijft. Die opmaak breekt in alle browsers betrouwbaar over pagina's, ook bij printen vanaf de iPad.
- Gevolg: de foto's beginnen onder de kop op pagina één en vullen de pagina's netjes; een foto wordt nooit over een paginarand gesneden. De genummerde stippen en de genummerde notitie-lijst van v3.46.2 blijven ongewijzigd.
- Let op bij het testen: ververs de app na het uploaden hard (browsercache), anders draait nog de oude versie. Dat verklaarde mogelijk ook waarom de vorige fix "niets leek te doen".
- Alleen de foto-bijlage is geraakt; de rekenkern en de andere PDF's blijven ongemoeid. Geen Supabase-migratie nodig.

---

## v3.46.2 — Genummerde gebreken op de foto-bijlage
De gebrek-stippen op de foto's stonden zonder nummer, waardoor de notities eronder los van de stippen kwamen te staan. Nu zijn ze, net als bij de getekende kozijnen, genummerd en gekoppeld.

### Wijzigingen
- Elke gebrek-stip op een foto krijgt een nummer in de cirkel (wit cijfer), in dezelfde volgorde als geplaatst.
- Onder elke foto staat een genummerde lijst met per stip het gebrek en de notitie. De nummers komen overeen met de stippen op de foto, dus je ziet meteen welke tekst bij welke plek hoort.
- De algemene foto-opmerking staat nu apart als bijschrift, los van de gebrek-notities. Eerder werden ze samengevoegd tot één regel, waardoor de tekst rommelig en losgezongen onder de foto stond.
- Stippen en lijst delen dezelfde kleur per gebrek-soort en dezelfde nummering, gelijk aan de getekende-kozijnen-PDF.
- Alleen de foto-bijlage is geraakt; de rekenkern en de andere PDF's blijven ongemoeid. Geen Supabase-migratie nodig.

---

## v3.46.1 — Fix: foto-bijlage zonder lege beginpagina
De geprinte foto-bijlage begon soms met een lege eerste pagina (alleen de kop en de legenda), waarna de foto's pas op pagina twee kwamen.

### Wijzigingen
- Oorzaak: het fotoblok was een raster met een harde "niet over een paginarand breken". Samen met de kop op pagina één was dat blok te hoog, dus sprong het in z'n geheel naar pagina twee en bleef pagina één leeg achter.
- De foto's lopen nu door onder de kop in een doorlopende twee-koloms opmaak. Elke foto blijft heel (wordt niet over een paginarand gesneden), maar de pagina's vullen zich gewoon op. Geen lege beginpagina meer.
- Deze opmaak (inline-block in plaats van CSS-raster) breekt betrouwbaarder over pagina's, ook bij het printen vanaf de iPad.
- Alleen de foto-bijlage is geraakt; de andere PDF's en de rekenkern blijven ongemoeid. Geen Supabase-migratie nodig.

---

## v3.46.0 — Loze stijl: twee vleugels zonder middenstijl
Bij dubbele openslaande ramen of deuren zonder vaste middenstijl sluiten de twee vleugels direct op elkaar aan. De kozijn-tekenaar kan dat nu rekenen en tekenen.

### Wijzigingen
- Een verticale deellijn heeft nu bij "Soort" de keuze tussen tussenstijl (zoals altijd) en loze stijl. Tik de deellijn aan om te kiezen.
- Een loze stijl telt niet mee in het tussenwerk (geen kozijnhout). Beide aansluitende ramen houden hun volle raamhout, dus op die lijn reken je twee raamstijlen in plaats van een tussenstijl plus twee raamstijlen. Dat klopt met de werkelijkheid: er is geen kozijnstijl, alleen de twee vleugels met een slaglat.
- In de tekening wordt een loze stijl een dun grijs stippellijntje in plaats van de dikke bruine stijl, zodat in één oogopslag zichtbaar is waar wel en geen middenstijl zit. Dat geldt ook op de getekende-kozijnen-PDF.
- Alleen voor verticale deellijnen (twee vleugels naast elkaar). Horizontale deellijnen blijven een gewone tussendorpel.
- De keuze wordt bij de tekening opgeslagen; bestaande tekeningen blijven ongemoeid (zonder de vlag is een deellijn gewoon een tussenstijl, net als voorheen). Geen Supabase-migratie nodig.

---

## v3.45.3 — Getekende kozijnen als PDF, bij Archiveren
De kozijnen die je in een calculatie hebt getekend kun je nu als PDF-bijlage printen, via dezelfde Archiveren-knop als de andere uitvoer. Eén overzicht van alles wat je hebt opgenomen, voor in het dossier en voor de ploeg op locatie.

### Wijzigingen
- Nieuwe optie "Getekende kozijnen" in de Archiveren-modal (alleen beschikbaar als er in de calculatie kozijnen getekend zijn).
- Eén kozijn per rij: de tekening links, rechts de naam, de vorm, de maten, de strekkende meters (m¹) en de vulling-m² als die er is.
- Gebrek-stippen krijgen op papier een nummer, met onder de tekening een lijstje dat per nummer het gebrek en de notitie toont. Op het scherm tik je een stip aan voor de notitie; op papier kan dat niet, daarom de nummering.
- Legenda onderaan de pagina met de gebrek-kleuren die op de tekeningen voorkomen, dezelfde conventie als de foto-bijlage.
- De stippen op de kozijn-tekening worden genummerd (schone lijntekening), terwijl de foto-bijlage gekleurde stippen zonder cijfer houdt (drukke fotoachtergrond). Bewuste keuze: elke bijlage de weergave die daar het best leest.
- Kop in de calculatie-huisstijl met logo en projectgegevens, net als de andere PDF's. Een kozijn-kaart breekt niet over een paginarand.
- Technisch: de bestaande tekening-render is uitgebreid met een genummerde stip-variant en een vul-modus voor de printkaart. Geen Supabase-migratie nodig, de tekeningen zaten al opgeslagen bij de meetstaat-regels.
- En passant: de statusbalk tijdens het archiveren toont nu ook voor de foto-bijlage een nette naam in plaats van de interne sleutel.

---

## v3.45.2 — Prijs-status op de foto-bijlage
De geprinte foto-bijlage liet niet zien of een gemarkeerd gebrek ook in de prijs was meegerekend.

### Wijziging
Per foto met gebreken staat er nu een statusregel onder de foto, met dezelfde "telt mee"-logica als de editor: staat de meetel-vlag van die foto aan, dan "Gebreken meegerekend in de prijs" (groen); staat hij uit, dan "Gebreken alleen ter documentatie — niet in de prijs" (grijs). Zo is op de bijlage in één oogopslag duidelijk wat in de offerte zit en wat puur ter vastlegging is. Geen SQL nodig.

---



Op een foto kon alleen de laatst geplaatste gebrek-stip verwijderd worden; een eerdere stip aantikken om hem te selecteren deed niets.

### Oorzaak en oplossing
Voor soepel zoomen en slepen wordt de aanraking met `setPointerCapture` vastgehouden door het tekenvlak. Daardoor wijst het tik-doel (`e.target`) altijd naar het tekenvlak, nooit naar de stip eronder, zodat de stip-selectie nooit afging — alleen de net geplaatste stip was al geselecteerd en dus verwijderbaar. De tik-afhandeling gaat nu niet meer op het tik-doel af, maar bepaalt geometrisch (schermafstand, vinger-vriendelijke trefstraal) welke stip onder de tik ligt. Daarmee is elke stip te selecteren voor een notitie of om te verwijderen, ook ingezoomd; inzoomen vergroot de tussenruimte zodat dicht bij elkaar liggende stippen los aan te tikken en te plaatsen blijven. Geen SQL nodig.

---



De gekleurde gebrek-stippen uit de kozijn-tekenaar kunnen nu ook op foto's, voor objecten zonder kozijn-tekening (bijvoorbeeld een tuinhuis met een foto per zijde).

### Vereist een SQL-migratie
Draai eerst de bijgeleverde migratie in Supabase Studio (twee kolommen op `calculatie_fotos`: `markeringen` jsonb en `gebreken_tellen` boolean), daarna pas de code uploaden. De migratie is idempotent (`add column if not exists`).

### Wijzigingen
- Een foto aantikken opent een markeer-editor op het volledige scherm met dezelfde gebreken-legenda als de tekenaar: houtrot, scheur/naad, kit vervangen, loszittende verf.
- Kies een gebrek en tik het op de foto. **Knijp-zoom en pan** voor nauwkeurig plaatsen; een tik plaatst, een sleep schuift, twee vingers zoomen. De stippen schalen tegen de zoom in, zodat ze klein en precies blijven.
- Tik een stip aan voor een korte notitie of om hem te verwijderen.
- Posities worden als **fractie** van de foto bewaard (0–1 in breedte en hoogte), dus ze blijven correct op elk schermformaat en op de print.
- Per foto een **"telt mee"-vlag** (standaard uit): staat hij aan, dan lopen de stippen van die foto mee in de automatische gebrek-toeslagen, net als de kozijn-stippen. Zo voorkom je dubbeltelling als hetzelfde gebrek al op een tekening staat.
- Op de foto-tegel een chip met de telling (gekleurde stippen + aantal); de chip krijgt een accent-rand als de foto meetelt.
- De foto-bijlage (print) toont de stippen op de juiste plek met een legenda bovenaan en de notities onder elke foto.
- Technisch: stippen + meetel-vlag in het foto-datamodel (`_mapFotoFromDB`/`_mapFotoToDB`/`_updateFotoDB`); `_telGebreken` telt de meetellende foto-stippen mee; de print-bijlage geeft elke foto-wrapper de juiste beeldverhouding zodat de procent-posities exact op het beeld vallen.

---



Naast rechthoek, schuin en boog kent de tekenaar nu een ronde vorm: een rondvenster of ossenoog, met een eigen verdeel-model naast de v/h-deelboom.

### Geen SQL nodig
Puur JS. De ronde indeling staat als JSON in het tekening-object (`{rond:true, mode, n, type, regelId, label}`); er verandert niets aan de database. Bestaande tekeningen blijven ongemoeid. Het verdeling-formaat wordt bij wisselen van/naar de ronde vorm genormaliseerd, zodat het ronde model en de deelboom niet door elkaar lopen.

### Wijzigingen
- Nieuwe vorm **rond** met één maat: de diameter. Het frame is een echte cirkel (cirkelboog-pad), de omtrek is exact π × diameter.
- Drie indelingen: **heel** (één rond glasvlak), **kruis** (een verticale en horizontale roede door het midden) en **spaken** (N roeden vanuit het midden naar de rand, gelijk verdeeld; N instelbaar van 2 t/m 12, bovenaan beginnend en met de klok mee). Kruis is feitelijk vier spaken.
- Roeden tellen mee in het tussenwerk (m¹): kruis = 2 × diameter; spaken = N × straal.
- Eén type voor het hele ronde raam: glas / vast / draai naar binnen / draai naar buiten. Raamhout-m¹ = 0 / omtrek / omtrek / 2 × omtrek, precies zoals een vak bij de andere vormen.
- Type **vulling**: een dicht rond paneel of luik. Het oppervlak (π × straal²) loopt als m² mee, met dezelfde automatische koppeling aan een m²-calc-regel als de andere vullingen (Brok 6B-machinerie). De regelnaam staat als label in het midden van het raam.
- Onderaan dezelfde uitsplitsing "frame + tussenwerk + ramen"; de totale m¹ landt bij Klaar in de regel.
- Gebrek-markeringen (stippen) werken ook op het ronde raam.
- Technisch: het ronde model loopt via guards bovenin de reken- en tekenfuncties (`_kozijnOmtrekCm`, `_kozijnMembersCm`, `_kozijnRamenCm`, `_kozijnVlakkenCm2`, `_kozijnVlakkenPerRegel`, `_kozijnBuildInner`, `_kozijnRenderVerdeelControls`), met eigen helpers (`_kozijnRond*`). De deelboom-code raakt rond niet aan.

---



Verdelen in ramen, panelen en vulling werkte tot nu alleen bij rechthoekige kozijnen. Vanaf nu kan het bij alle vormen: schuin enkel (lessenaar), schuin punt (puntgevel) en boog.

### Geen SQL nodig
Puur JS. De verdeling staat als JSON in het tekening-object; er verandert niets aan de database. Bestaande rechthoek-tekeningen renderen en rekenen bit-voor-bit hetzelfde — de rechthoek is gewoon het bijzondere geval van het veelhoek-model.

### Wijzigingen
- Elke vorm wordt nu behandeld als een convexe veelhoek (de boog als veelhoek met fijne arc-punten). Een verticale of horizontale deellijn knipt de werkelijke vorm via half-vlak-clipping (Sutherland–Hodgman tegen één halfvlak) in twee convexe stukken.
- De deellijn is de werkelijke koorde waar de snijlijn de vorm kruist. Een tussenstijl hoog in een puntgevel of een tussendorpel hoog in een boog is daardoor korter, en die kortere lengte telt zo mee in het tussenwerk (m¹).
- Het oppervlak van een vulling volgt de echte geknipte vorm (shoelace), dus de m² klopt ook bij schuine en gebogen vlakken.
- De raam-omtrek (vast/draai) wordt op de echte vakvorm gerekend.
- Een raam of vulling in een puntgevel krijgt een echte schuine bovenkant in de tekening — eerlijk op het scherm en op de klant-PDF.
- De positie van een deellijn in cm wordt nog steeds gerekend tegen het huidige stuk (lokale bounding-box), net als voorheen.
- De melding "verdelen kan alleen bij rechthoeken" is verdwenen.
- Technisch: de losse rechthoek-walks zijn vervangen door één veelhoek-collector (`_kozijnCollectFrom`) met meetkunde-helpers (clip, oppervlak, omtrek, koorde, zwaartepunt, inset). `_kozijnGeometrie` leidt het frame-pad nu af uit dezelfde veelhoek-punten, zodat tekening en berekening uit één bron komen.

### Op de horizon
- Brok 7b: rond raam als nieuwe vorm met eigen verdeling — heel, kruis of N spaken (radiaal past niet in het v/h-deelmodel en krijgt een eigen klein model).

---



De m² van deuren en panelen landt nu vanzelf in de calculatie. Sluitstuk van 6a: je koppelt een vulling-vak aan een regel, en de app voert de m² nu ook daadwerkelijk in.

### Vereist: SQL-migratie eerst
Draai `2026-06-06_meetstaat_bron.sql` in Supabase **voordat** je deze versie uploadt — de auto-regels gebruiken een nieuwe `bron`-kolom op de meetstaat-tabel. Bestaande regels blijven werken (de kolom wordt alleen meegestuurd bij auto-regels), maar het automatisch invoeren werkt pas na de migratie.

### Wijzigingen
- Per gekoppelde m²-regel houdt de app één automatische meetstaat-regel bij, die alle vulling-vakken van die soort optelt — over alle kozijnen in de calculatie heen.
- De regel loopt mee: m² erbij → bedrag erbij; laatste vulling weg → regel verdwijnt.
- Automatische regels zijn gemarkeerd met "auto", gedempt weergegeven en op slot (niet handmatig te bewerken of te verwijderen). Ze zijn getagd via `bron='vulling_auto'`, zodat je eigen meetstaat-regels volledig ongemoeid blijven.
- Vergrendelde offertes (gereed/verzonden/geaccepteerd/verloren) worden niet aangeraakt.
- Niet-gekoppelde vulling telt niet mee — koppel die eerst aan een regel.
- Technisch: de m² wordt in de auto-regel als b×h gecodeerd (hoogte 1,00 m, breedte = m² × 100 cm), zodat de bestaande meetstaat-rekenkern het zonder aanpassing oppakt.

---


## v3.41.0 — Kozijn-tekenaar 6a (vervolg): vulling koppelen aan een m²-regel
Het oorspronkelijke vulling-type telde alle m² op één hoop. Maar een dichte vulling kan een deur, een paneel of een luik zijn, en die horen vaak bij verschillende m²-regels met een eigen norm. Eén lumped getal kun je dan niet splitsen. Daarom koppelt een vulling-vak nu per stuk aan een specifieke regel.

### Wijzigingen
- Bij een geselecteerd vulling-vak verschijnt "Koppel aan regel": een keuzelijst van de m²-regels uit de huidige calculatie (gefilterd op eenheid m²).
- De naam van de gekoppelde regel staat als label centraal in het vak — leesbaar bij de uitvoering en voor de klant.
- De m² loopt nu **per gekoppelde regel** apart mee onder de tekening, niet meer als één totaal. Zoveel soorten als je regels hebt, niet vast op twee.
- Een vulling die nog niet gekoppeld is, staat apart als "nog koppelen" (rood), zodat je niets vergeet.
- Het tekening-object bewaart nu `vlakkenM2PerRegel` (regelId, label, m²) naast het totaal — daar leest 6b straks uit.

### Let op
- Om aan te koppelen moeten de m²-regels (deuren, panelen, ...) al in de calculatie bestaan. Dat past in de werkwijze: eerst het calc-skelet, dan de opname.
- Vulling-vakken uit v3.40.0 (zonder koppeling) verschijnen automatisch onder "nog koppelen"; er gaat niets verloren.
- Het automatisch invoeren van de m² in de regels (per regel één meetstaat-regel die meeloopt) volgt in 6b. In deze stap raakt het de bedragen nog niet.

---


## v3.40.0 — Kozijn-tekenaar Brok 6a: deuren en puivulling
Deuren en dichte panelen (puivulling) zijn m²-werk, geen m¹. Tot nu toe leverde de tekenaar alleen omtrek (m¹). Nu kun je een vak als dichte vulling markeren, en wordt het oppervlak apart geteld.

### Wijzigingen
- Nieuw vak-type **Vulling (m²)** naast vast glas, vast raam en draairaam. Een vulling is een dicht vlak — een deur of een paneel — en telt in m² (oppervlak), niet in m¹.
- Eén kant gerekend (buitenwerk): de tekenaar levert het kale oppervlak (breedte × hoogte).
- Werkt in beide situaties: een losse deur (hele binnenvlak op vulling) en een deur of paneel als vak binnen een pui (alleen dat vak op vulling, de rest glas/raam).
- De tekenaar toont nu twee totalen onder de tekening: **m¹** (frame + tussenwerk + ramen) en **m²** (deuren + panelen).
- Vulling-vakken krijgen een eigen, gevulde weergave zodat ze visueel verschillen van glas en ramen. Gebreken blijven er gewoon op te markeren.
- De m² wordt al meegeschreven in het tekening-object (`vlakkenM2`); de automatische koppeling naar een eigen calc-regel volgt in 6b. In deze stap raakt het de calculatie-bedragen nog niet.

### Let op
- Of een vulling als deur of als puivulling wordt afgerekend, bepaal je in de calc-regel (het m²-verfsysteem). De tekenaar maakt dat onderscheid bewust niet.
- Verdelen in vakken (en dus ook vulling-vakken) kan nog steeds alleen bij rechthoekige kozijnen. Verdeling bij schuine en gebogen vormen is een aparte, volgende brok.

---


## v3.39.0 — Gebrek-prijzen → automatische toeslagen
De gebrek-markeringen uit de kozijn-tekenaar krijgen een prijskaartje. Per gebrek-type stel je één keer een vaste prijs per stuk in; de stippen die je tijdens de opname tekent, lopen daarna automatisch als toeslag mee in de calculatie. Daarmee is de cirkel opname → prijs rond.

### Database (migratie vooraf in Supabase Studio)
- `2026-06-06_staart_gebrek_type.sql` — voegt kolom `gebrek_type` toe aan de `staart`-tabel. Tagt de automatisch gegenereerde gebrek-posten zodat de app zijn eigen posten herkent en handmatige toeslagen met rust laat. Idempotent.

### Instellingen
- Nieuw blok **Gebrek-prijzen**: vier velden (houtrot, scheur/naad, kit, loszittende verf), € per stuk. Default 0 — staat een prijs op 0, dan verschijnt er niets.

### Werking
- Bij opslaan, dupliceren of verwijderen van een kozijn telt de app alle gebrek-stippen over de hele calculatie en zet per soort één toeslag-post neer: type "eenheid" (stuk × prijs), bijv. "Houtrot herstel — 7 × €15". Aantal en prijs lopen automatisch mee; bij de laatste stip weg verdwijnt de post.
- Wijzig je een prijs in de instellingen terwijl een calculatie open staat, dan wordt die meteen bijgewerkt.
- **Vergrendelde offertes** (gereed/verzonden/geaccepteerd/verloren) worden niet aangeraakt — de snapshot blijft bevroren.
- **Handmatige toeslag-posten** blijven ongemoeid; de sync werkt alleen zijn eigen, getagde posten bij. Hernoem je een gebrek-post, dan blijft die naam staan — alleen aantal en prijs lopen mee.

---


## v3.38.2 — Beter te onderscheiden gebrek-kleuren
De markeringen uit Brok 4 zaten met houtrot (rood), scheur (oranje) en loszittende verf (amber) te dicht bij elkaar; alleen kit (blauw) sprong eruit. Als kleine, halfdoorzichtige stippen waren ze nauwelijks uit elkaar te houden.

### Wijzigingen
- Vier duidelijk verschillende tinten, ontleend aan het dashboard-statuspalet: houtrot rood (#dc2626), scheur/naad paars (#8b5cf6, als "afspraak"), kit vervangen blauw (#2196f3, als "verzonden"), loszittende verf groen (#16a34a, als "geaccepteerd").
- Stippen iets minder doorzichtig (fill-opacity 0,5 → 0,65) zodat de kleur beter leest.

---


## v3.38.1 — Fix: naam onder getekend kozijn volgt de regel
In het overzicht "Getekende kozijnen" werd de naam getoond uit de tekenaar (`tekening.naam`), die bevroren bleef. Paste je daarna de omschrijving van de meetstaat-regel aan, dan veranderde het label onder de tekening niet mee.

### Wijzigingen
- Het overzicht gebruikt nu `ms.omschrijving` als eerste keuze (valt terug op de tekenaar-naam en anders "Kozijn"). De omschrijving van de regel is daarmee leidend.
- De tekenaar vult bij openen het naamveld ook met de huidige omschrijving, zodat tekenaar, regel en overzicht consistent blijven.

---


## v3.38.0 — Kozijn-tekenaar, Brok 4: gebreken markeren
Op de tekening kun je nu aangeven waar de gebreken zitten — houtrot voorop.

### Wijzigingen
- **Gebreken-balk** in de tekenaar: houtrot (rood), scheur / naad (oranje), kit vervangen (blauw), loszittende verf (amber). Kies een gebrek en tik het op de tekening; er komt een gekleurde stip op die plek.
- **Notitie en verwijderen:** tik een geplaatste stip aan om er een korte notitie bij te zetten ("onderdorpel links") of om hem te verwijderen.
- **Documentatie, geen rekenwerk:** markeringen veranderen de m¹ niet. Ze zijn zichtbaar in de tekenaar, op de mini-tekening van de regel en in het overzicht.
- Werkt bij elke vorm, ook bij schuine en boog-kozijnen (anders dan het verdelen, dat voorlopig rechthoek-only is).

### Code
- De markeringen leven als `markeringen: [{x, y, type, notitie}]` in `tekening` (coördinaten in het tekening-coördinatenstelsel; geplaatst via `getScreenCTM().inverse()` zodat de tik exact op de juiste plek landt). Geen migratie nodig.
- Tekenlogica gedeeld via `_kozijnBuildInner` (dezelfde stippen in editor, thumbnail en overzicht). In markeer-modus ligt er een transparante overlay over de tekening die de tik opvangt; de bestaande tik-vlakken voor delen zijn dan even inactief.
- Markeringen worden meegenomen in `_kozijnBouwTekening`, dus ze slaan op én komen mee bij Dupliceren (diepe kopie).

---


## v3.37.0 — Kozijn-tekenaar: raam weghalen en kozijn dupliceren
Twee verbeteringen die in het gebruik naar boven kwamen.

### Wijzigingen
- **Vak-type togglen:** nog eens op de al-gekozen variant tikken zet het vak terug naar vast glas. Zo haal je een raam er net zo makkelijk weer af als dat je het erop zette.
- **Dupliceren:** een knop in de tekenaar maakt een diepe kopie van het hele ontwerp (vorm, verdeling én ramen) als nieuwe meetstaat-regel op dezelfde calc-regel, en opent die meteen. Voor een vergelijkbaar kozijn hoef je dan alleen de maten aan te passen.

### Code
- `_kozijnSetVakType` togglet naar `glas` als het aangetikte type al actief is.
- `_kozijnBouwTekening` gedeeld door opslaan en dupliceren; `dupliceerKozijn` werkt eerst de bron bij, maakt dan een diepe kopie (JSON-clone, eigen verdeling-boom) via `_insertMeetstaatDB` en opent de kopie. Geen migratie nodig.

---


## v3.36.0 — Kozijn-tekenaar, Brok 3: getekende kozijnen blijven zien
De tekeningen verdwijnen niet meer uit beeld zodra je de m¹ hebt.

### Wijzigingen
- **Mini-tekening op de regel:** een meetstaat-regel met een tekening toont op de plek van het potlood-knopje een kleine weergave van het kozijn. Eén tik opent de tekenaar om te bekijken of bij te werken. Regels zonder tekening houden het potlood (✎).
- **Overzicht per calculatie:** onderaan de Meetstaat-tab staat "Getekende kozijnen" — alle tekeningen van deze calculatie naast elkaar, met naam en strekkende meters, elk aantikbaar om te openen.

### Code
- De teken-logica is opgesplitst: `_kozijnGeometrie(vorm, maten)` en een gedeelde `_kozijnBuildInner(g, vorm, verdeling, interactive, sel)` worden gebruikt door zowel de editor (interactief) als door `_kozijnThumbSvg(tek, hoogte)` voor de statische mini-tekeningen. Eén bron, dus thumbnail en editor lopen niet uiteen.
- Geen migratie nodig — alles komt uit de bestaande `tekening`-kolom.

---


## v3.35.0 — Kozijn-tekenaar, Brok 2c: draaiende en vaste ramen
Per vak geef je nu aan wat het is, met de juiste strekkende meters en de juiste tekening.

### Wijzigingen
- **Vier vak-types:** vast glas, vast raam, draairaam naar binnen, draairaam naar buiten. Tik een vak aan en kies het type.
- **Meters per type:** vast glas telt niets; vast raam en draai-binnen tellen het raamhout 1× (de omtrek van het vak); draai-buiten telt 2× — raamhout plus sponningkanten.
- **Tekening:** een raam krijgt een eigen raamhout-randje; een draairaam ook het open-symbool, in stippellijn (naar binnen) of doorgetrokken (naar buiten).
- **m¹ uitgesplitst:** onderaan staat nu frame + tussenwerk + ramen.

### Code
- `_kozijnRamenWalk` loopt de splits-boom langs en telt per leaf-vak de raam-bijdrage op basis van het type (glas 0, vast/binnen 2·(b+h), buiten 4·(b+h)). `_kozijnTotaalCm` = omtrek + tussenwerk + ramen; die totale lengte gaat bij Klaar via `bCm` in de regel.
- Het vak-type leeft als `type` op het leaf-vak in `tekening.verdeling`. Geen migratie nodig.
- Open-symbool met `stroke-dasharray` (non-scaling-stroke, dus de streepjes blijven gelijk bij elke schaal). Een ongedeeld kozijn dat één raam is, telt ook mee (het wortel-vak krijgt gewoon een type).

---


## v3.34.0 — Kozijn-tekenaar, Brok 2b: verdelen in ramen en panelen
Een rechthoekig kozijn kun je nu opdelen met tussenstijlen en -dorpels, en die strekkende meters tellen mee in de m¹.

### Wijzigingen
- **Tik-en-splits:** tik op een vak, kies verticaal (│) of horizontaal (─) delen. Recursief, dus bovenlicht-met-ramen-eronder of een ruitjesverdeling gaat in een paar tikken.
- **Positie per laser-maat:** tik op een deellijn om die te selecteren (kleurt rood), typ de exacte positie in centimeters (bijv. bovenlicht 40 cm) of verwijder de lijn. Geen sleepwerk — de maat komt uit de laser, niet uit de pixels.
- **m¹ met opsplitsing:** de lengte van elke tussenstijl (= hoogte van zijn vak) en -dorpel (= breedte van zijn vak) telt bij de omtrek op. Onderaan staat "Totaal X m¹ (frame Y + tussenwerk Z)".
- Verdelen kan voorlopig alleen bij rechthoekige kozijnen; bij schuin/boog werkt het frame en de omtrek wél, met een nette melding bij de verdeel-besturing.

### Code
- De verdeling is een splits-boom (`{t:'split', r:'v'|'h', pos, k:[...]}`) opgeslagen in `tekening.verdeling`. Geen migratie nodig — past in de bestaande kolom.
- Exacte m¹: `_kozijnMembersWalk` sommeert de lengte van elke deler op basis van het vak waarin hij staat; positie telt dus mee. Bij Klaar gaat de totale lengte (frame + tussenwerk, cm) via `bCm` in de regel — reken-engine ongemoeid.
- SVG-hittesten via transparante vak-rechthoeken en brede transparante lijnen (touch-vriendelijk); positie-invoer behoudt focus doordat alleen de tekening hertekent, niet de besturing.

---


## v3.33.0 — Kozijn-tekenaar, Brok 2a: het frame met vormkeuze
Het tekenvenster (uit Brok 1) doet nu echt iets: je kiest een kozijn-vorm, vult de lasermaten in, ziet het kozijn op schaal en de omtrek loopt live mee als m¹.

### Wijzigingen
- **Vormkeuze:** rechthoek, schuin enkel (lessenaar), schuin punt (puntgevel) en boog (rond én segment, via de boog-hoogte). Per vorm verschijnen de juiste maatvelden in centimeters.
- **Tekening op schaal:** het kozijn wordt als SVG meteen op de ingevulde verhoudingen getekend (vector-effect non-scaling-stroke, dus de lijn blijft even dik bij elke schaal).
- **Live omtrek-m¹:** onderaan loopt de omtrek mee in NL-notatie. De schuine rand wordt op werkelijke lengte gerekend (Pythagoras), de boog op echte booglengte (cirkelsegment; rondboog = boog-hoogte gelijk aan halve breedte).
- **Maat blijft uit de laser:** de tekening levert de structuur, de m¹ komt uit de ingevulde centimeters, niet uit de pixels.

### Code
- Bij Klaar wordt de exacte omtrek (cm) in `bCm` gezet en `hCm` op 0. De bestaande `_meetstaatRijTotaal` rekent dat bij een m¹-systeem als lengte × aantal × factor — de reken-engine blijft volledig ongemoeid. De tekening (vorm + maten + omtrekM1 + naam) wordt opgeslagen in de `tekening`-kolom.
- Nieuwe helpers: `_kozijnOmtrekCm`, `_kozijnGeometrie` (SVG-pad), `_kozijnTeken`, plus vorm-/maat-rendering. Geen nieuwe migratie nodig — alles past in de bestaande `tekening`-kolom.

### Let op
- De tekenaar gaat ervan uit dat de gekoppelde calc-regel een m¹-verfsysteem gebruikt (zoals "Houten kozijn buiten - onderhoud"). Bij meerdere identieke kozijnen gebruik je het aantal-veld van de regel.

---


## v3.32.1 — Meetstaat als kaarten op smalle schermen
De meetstaat-tabel heeft negen kolommen en was daarmee breder dan een staande iPad. Op zo'n scherm vielen factor, totaal, opmerking en de teken- en verwijderknoppen rechts buiten beeld; je kon ze alleen bereiken door horizontaal te vegen. Dat blokkeerde juist de opname op locatie, waar de iPad vaak rechtop in de hand ligt.

### Wijzigingen
- Op smalle schermen (≤ 1024px breed) wordt elke meetstaat-regel een compact kaartje in plaats van een tabelrij: nummer en knoppen op de bovenste strook, daaronder de calc-regel, de omschrijving, dan b / h / aantal / factor op één regeltje, en het totaal eronder. De hele regel in beeld, grotere tikvelden, verticaal scrollen in plaats van horizontaal vegen.
- Brede schermen (Mac, iPad liggend) houden de bestaande tabel ongewijzigd.

### Code
- Eén CSS-media-query (`max-width: 1024px`); geen tweede renderpad, dus schakelt vanzelf mee met de oriëntatie. Elke cel kreeg een `data-label` zodat het veldlabel als `::before` in de kaart verschijnt. De vier cijfervelden delen via flex één regel; de tekstvelden lopen vol.

---


## v3.32.0 — Kozijn-tekenaar, Brok 1: de schil
Eerste, onzichtbare aanzet voor de opname op locatie. De kozijn-tekenaar wordt de grootste functie tot nu toe en komt daarom in brokken. Deze brok legt alleen de opslag en de schil vast; het tekenen zelf volgt.

### Wijzigingen
- **Potlood-knop per meetstaat-regel** (✎). Opent een schermvullend venster waarin je het kozijn een naam geeft. Die naam vult meteen de omschrijving van de regel. Heeft een regel al een tekening, dan toont de knop 📐 in het accent-rood.
- De tekening wordt opgeslagen bij de regel en blijft bewaard, ook na de opname. Het venster is bewust nog leeg op één naamveld na — de tekenaar zelf (frame, tussenstijlen en -dorpels, strekkende meters, houtrot-markeringen) komt in Brok 2 en verder.

### Code
- Nieuwe kolom `tekening` (jsonb) op de meetstaat-tabel. Eén kolom draagt straks álles: frame, maten, stijlen/dorpels, markeringen én behandelcodes. Geen latere migratie meer nodig. Migratie apart aangeleverd, idempotent.
- `tekening` toegevoegd aan `_mapMeetstaatFromDB` en `_mapMeetstaatToDB`.
- Overlay `#kozijnTekenaarModal` plus `openKozijnTekenaar` / `closeKozijnTekenaar` / `saveKozijnTekenaar`. De tekening wordt met `Object.assign` aangevuld zodat latere velden bij een herbewerking niet verloren gaan.

---


## v3.31.0 — Zoeken in de dashboard-archieven
Bij een groeiend aantal projecten wordt scrollen door de dichtgeklapte status-groepen traag. Een zoekbalk per archief lost dat op.

### Wijzigingen
- **Zoekbalk** boven het Calculaties-archief en boven het Onderhoudsplannen-archief op het dashboard. Filtert op naam en klant (hoofdletterongevoelig).
- Bij een zoekterm tonen alleen de groepen met treffers, en die klappen automatisch open zodat je de match direct ziet. Lege zoekterm herstelt de normale weergave (gegroepeerd, dichtgeklapt, op sortering).
- Geen treffers geeft een nette melding per archief.

### Code
- Zoekvariabelen `_dashCalcZoek` en `_dashPlanZoek`. Het calc-archief (in geheugen) re-rendert per toetsaanslag via `renderCalculatiesArchief`, met een filter bij het groeperen en een geforceerde open-stand bij een zoekterm.
- Het plannen-archief is gesplitst: `renderPlannenArchief` haalt op en cachet in `_planArchiefCache`, `_renderPlannenArchiefUit` rendert uit die cache met de zoekfilter. Zo geen Supabase-call per toetsaanslag. `togglePlanSection` rendert nu ook uit de cache.

---


## v3.30.9 — Geen hover-kleur in de Planning-matrix
De globale `tr:hover td`-regel kleurde de rij onder de cursor warm. In de Planning botste dat met de grijze achtergrond van de reeds-uitgevoerde cellen, wat de leesbaarheid van de gereed-markering verslechterde.

### Wijziging
- CSS-regel `.planning-matrix tr:hover td { background: transparent; }` zet de hover-kleur uit, maar alleen in de Planning-matrix. Alle andere tabellen (Materialen, Bewerkingen, enzovoort) houden hun rij-hover.

---


## v3.30.8 — Hoger omschrijvingsveld, matrix-schakelaar vervalt
De omschrijving van een handmatige regel paste niet in het smalle invoerveld. Door er een hoger tekstvak van te maken zie je de hele tekst bij het bewerken, en wordt de matrix-schakelaar overbodig.

### Wijzigingen
- **Omschrijving-veld** in `#planningHandmatigModal` van een enkelregelig invoerveld naar een textarea (4 regels, verticaal uitrekbaar).
- **Schakelaar "Beschrijvingen tonen"** uit het Planning-panel verwijderd, plus de bijbehorende variabele en functie. De matrix klapt beschrijvingen nu altijd in tot één regel; de volledige tekst lees je door op de cel te klikken.

### Code
- `phOmschrijving` is nu een `<textarea>` (leest/schrijft via dezelfde `.value`, dus geen verdere aanpassing in opslaan/laden).
- `_planningToonBeschrijving` en `_planningToggleBeschrijving` verwijderd; de line-clamp in de cel-render is nu onvoorwaardelijk.

---


## v3.30.7 — Vinkje voor uitgevoerde beurten in de matrix
Verdere hoogtebesparing in de Planning-matrix.

### Wijziging
- De tekst "reeds uitgevoerd" in een matrix-cel (die op smalle kolommen over twee regels brak) is vervangen door een vinkje direct achter het bedrag. Het vinkje staat op de bedrag-regel zodat het altijd zichtbaar blijft, ook als de ingeklapte beschrijving wordt afgekapt. De grijze cel blijft het tweede signaal. De "reeds uitgevoerd"-badge in de onderhoudsplan-jaarblokken (offerte-bijlage) blijft ongewijzigd, daar is ruimte zat.

---


## v3.30.6 — Koptitels weg op alle tabs
In het verlengde van de compactere Planning: de grote paginatitel boven elke tab is overbodig naast de menubalk en kostte op elke tab verticale ruimte.

### Wijzigingen
- **Koptitels verborgen** op alle tabs (Calculatie, Meetstaat, Verfsystemen, Bewerkingen, Materialen, Ondergronden, Onderhoudsplan, Instellingen). Het dashboard houdt zijn welkomstblok, dat heeft geen panel-head.
- **Actieknoppen** in die balken blijven staan en zijn rechts uitgelijnd nu de titel weg is.
- De Instellingen-kop bevatte alleen een titel en is daarom helemaal verwijderd.

### Code
- Drie CSS-regels: `.panel-head h2 { display: none; }`, `.panel-head { justify-content: flex-end; }` en `#instellingen .panel-head { display: none; }`. Geen HTML- of JS-wijziging, dus eenvoudig terug te draaien.

---


## v3.30.5 — Compactere Planning: inklapbare beschrijvingen
Meer rijen tegelijk in beeld op de Planning-tab, door verticale ruimte terug te winnen.

### Wijzigingen
- **Intro-tekst en paginakop "Planning" verwijderd** boven de matrix. De nav laat al zien op welke tab je zit, dus de ruimte gaat nu naar het overzicht.
- **Beschrijvingen standaard ingeklapt** tot één regel per cel (via `-webkit-line-clamp`), zodat lange omschrijvingen (vooral bij de geïmporteerde plannen) de rijhoogte niet meer opblazen. Een schakelaar "Beschrijvingen tonen" bovenaan klapt ze allemaal uit. Bewerken blijft via klikken op een cel, waar de volledige tekst hoe dan ook in het venster staat.

### Code
- Module-var `_planningToonBeschrijving` (default false) plus `_planningToggleBeschrijving`. In de cel-render krijgt de beschrijving-regel een line-clamp wanneer de schakelaar uit staat.

---


## v3.30.4 — Planning op volle schermbreedte
De Planning-matrix is een brede spreadsheet, maar de app kapte de inhoud af op 1500px (goed voor leesbaarheid van formulieren en tekst, jammer voor een breed jaaroverzicht). Nu krijgt alleen de Planning-tab de volle breedte.

### Wijziging
- CSS-regel `main:has(#planning.active) { max-width: 100%; }`. Alleen wanneer de Planning-tab actief is laat `main` de 1500px-limiet los en gebruikt de volle schermbreedte (minus de standaard marge). Alle andere tabs houden hun leesbare 1500px. Geen JS nodig.

---


## v3.30.3 — Sticky-fix: tabel-overflow blokkeerde het vastzetten
De vaste rij, kolom en voet uit v3.30.2 werkten in geen enkele browser. Oorzaak: de globale `table`-stijl heeft `overflow: hidden`, en dat element zit dichter bij de cellen dan het scrollvenster. Daardoor koos de browser de tabel als sticky-context in plaats van het scrollvenster, en deed sticky niets. Niet browser-specifiek, dus ook niet door `border-collapse` zoals eerst gedacht.

### Wijziging
- `.planning-matrix` op `overflow: visible` gezet, zodat de tabel geen sticky-context meer is en de cellen weer aan het scrollvenster (`.table-scroll`) plakken. De rest van de spreadsheet-opzet uit v3.30.2 blijft ongewijzigd.

---


## v3.30.2 — Planning-matrix als spreadsheet: vaste rij, kolom en voet
De Planning-matrix gedraagt zich nu als een spreadsheet met bevroren vensters. De klantkolom plakte eerder niet vast (sticky werkt niet met `border-collapse: collapse` in Safari), dat is opgelost.

### Wijzigingen
- **Jaartallen-rij** blijft bovenaan staan bij verticaal scrollen, **klantkolom** blijft links staan bij horizontaal scrollen, met de hoek-cel erboven.
- **Samenvatting onderaan** (laatste subtotaal, totaal per jaar, capaciteit-regels) blijft als voet in beeld, ook tijdens het scrollen.
- De matrix heeft een eigen scrollvenster gekregen (`max-height: 70vh`, eigen overflow).

### Code
- `.planning-matrix` op `border-collapse: separate; border-spacing: 0;` gezet, de bekende voorwaarde voor werkende sticky-cellen in Safari. Cel-randen blijven gelijk omdat alleen onder-randen worden gebruikt.
- Header-cellen sticky top, hoek-cel sticky top en links met de hoogste z-index. Scroll-div met `max-height` en eigen overflow.
- Voet-rijen krijgen klasse `pm-foot`; `_planningPinFooter()` zet ze na het renderen vast aan de onderkant met een oplopende bottom-offset (van onder naar boven gestapeld), omdat sticky per cel werkt en de rijen in hoogte verschillen.

---


## v3.30.1 — Opslaan en nog één bij handmatige regels
Kleine maar praktische toevoeging op v3.30.0. Meerdere jaren van één oud plan invoeren ging regel voor regel, telkens met de naam opnieuw. Nu sneller.

### Wijzigingen
- **Knop "Opslaan en nog één"** in het handmatige-regel venster. Bewaart de regel en houdt het venster open: klant en betaalwijze blijven staan, jaar/bedrag/omschrijving/reeds worden geleegd en het jaar springt alvast een jaar verder. De cursor staat klaar in het bedrag-veld.
- De gewone "Opslaan" sluit het venster zoals voorheen.

### Code
- `_planningSaveHandmatig(blijfOpen)` kreeg een parameter. Bij `true` reset de functie naar een nieuwe regel met behoud van klant en betaalwijze in plaats van te sluiten, en hertekent de matrix zodat de zojuist opgeslagen regel meteen zichtbaar is.

---


## v3.30.0 — Handmatige oude plannen in de planning (brok 5, stap 1)
De laatste brok van het Planning-tabblad. Je oude plannen die nog geen calculatie in de app hebben, kun je nu als handmatige regels toevoegen aan de matrix. Stap 1 is de bouw, stap 2 wordt de eenmalige import van je sheet.

### Geen migratie
De tabel `planning_handmatig` is al in v3.27.0 aangemaakt. Deze release koppelt 'm aan de UI.

### Wijzigingen
- **Knop "+ Handmatige regel"** boven de Planning-matrix opent een venster met klant, betaalwijze (contant of abonnement), jaar, bedrag (incl. BTW), omschrijving en reeds-uitgevoerd. Meerdere jaren voor dezelfde klant: dezelfde naam gebruiken, dan bundelt de matrix ze op één rij.
- **Handmatige regels in de matrix**: verschijnen tussen de app-plannen, alfabetisch en gegroepeerd onder Contant en Abonnement met dezelfde subtotalen en het gezamenlijke totaal. Klik op een handmatige cel om te wijzigen of te verwijderen.
- **Geen uren**: handmatige regels hebben geen calculatie, dus ze tellen mee in de euro-totalen en de euro-capaciteit, maar niet in de manuren-regel. Staat als notitie bij de matrix.

### Code
- CRUD op `planning_handmatig` via `_sbQuery`: `_planningFetchHandmatig`, plus insert/update/delete in `_planningSaveHandmatig` en `_planningDeleteHandmatig`.
- `renderPlanningMatrix` haalt de handmatige regels op, groepeert ze per klant tot matrix-rijen (met `handmatig: true` en `handmatigId` per cel-item) en voegt ze samen met de app-rijen vóór het sorteren en het jaarbereik. De rij-helper routeert de cel-klik naar de handmatige editor of de beurt-editor.
- Nieuwe modal `#planningHandmatigModal` plus `_planningOpenHandmatigEdit` en `_planningCloseHandmatig`. De beurt-index-opbouw is afgeschermd tegen rijen zonder plan.

---


## v3.29.1 — Uitleg toeslag-schaling in de modus-hint
Kleine documentatie-toevoeging. De subtiele rekenwijze van de toeslagen per beurt-modus stond nergens uitgelegd, waardoor je 'm telkens opnieuw moet uitvogelen. Nu staat het in de hint onder de modus-keuze.

### Wijzigingen
- **Modus-hints uitgebreid** in de beurt-modal:
  - Algemeen: alles schaalt evenredig mee, steiger en voorrij incluis.
  - Per regel: vaste toeslagen schalen mee met het gemiddelde van je regel-percentages.
  - Per stap: idem, met het gemiddelde van je stap-percentages.
- Em-dashes in deze hints vervangen door komma's, conform de schrijfafspraak.

Geen functionele of reken-wijziging, alleen tekst.

---


## v3.29.0 — Contant en abonnement gesplitst (brok 4)
Brok 4 van het Planning-tabblad. Een plan heeft nu een betaalwijze (contant of abonnement) en de matrix splitst de plannen in twee groepen met subtotalen, plus een gezamenlijk totaal met de capaciteit eronder.

### Geen migratie
De kolom `betaalmodel` op `onderhoudsplannen` (default 'abo', CHECK contant/abo) is al in v3.27.0 aangemaakt. Deze release koppelt 'm aan de code.

### Wijzigingen
- **Betaalwijze-dropdown** in het parameters-blok van het onderhoudsplan (contant of abonnement), naast Type ontvanger en Status. Bestaande plannen staan op abonnement, per plan om te zetten. Bewaart via dezelfde auto-save als de andere parameters.
- **Splitsing in de matrix**: plannen worden gegroepeerd onder een kop Contant en een kop Abonnement, elk met een subtotaal per jaar. Daaronder het gezamenlijke totaal per jaar plus de capaciteit-percentages (euro en uren) op het geheel, want de capaciteit geldt voor de hele onderneming. Staat er maar één soort, dan vervallen de groepskoppen en toont de matrix gewoon één lijst.

### Code
- `betaalmodel` toegevoegd aan `_mapOhpFromDB`, `_mapOhpToDB`, `_ohpSaveParams`, `_ohpReadParamsFromUI` en `_ohpRenderParams` (vullen + disablen), plus aan de auto-save-listeners. Volgt exact het patroon van `ontvangerType`.
- `renderPlanningMatrix` opgesplitst in een rij-helper (`_rijHtml`) en een groep-helper (`_groepHtml`); de gezamenlijke totalen worden in de rij-helper opgeteld zodat de capaciteit-regels ongewijzigd blijven werken.

---


## v3.28.0 — Snel bewerken vanuit de Planning-matrix
De matrix was alleen-lezen, waardoor je voor een kleine bijsturing (notitie, uitstellen) helemaal naar het plan moest navigeren terwijl je de juiste cel al in beeld had. Nu kun je rechtstreeks vanuit een cel bewerken.

### Geen migratie
Alle gebruikte velden (jaartal, planning_notitie, reeds_uitgevoerd) bestaan al.

### Wijzigingen
- **Klikbare beurt-naam in de matrix-cel.** Klik of tik op de naam van een beurt en er opent een klein venster met drie velden: het jaar (om de beurt te verschuiven), de planning-notitie en een vinkje reeds-uitgevoerd. Opslaan werkt direct op de beurt en de matrix ververst, dus een verschoven beurt springt meteen naar de juiste jaarkolom.
- **Notitie-indicator.** Een beurt met een planning-notitie toont een 📝 in de cel. De losse klik-om-te-tonen (v3.27.5) is vervangen: de notitie zie en bewerk je nu in het snelle venster. Het 📝 is alleen nog een signaal dat er een notitie is.
- Het volledige bewerken (modus, schaling, offerte-tekst) blijft bewust in de Onderhoudsplan-tab. De matrix is de snelle stuurplek.

### Code
- `_planningRekenPlan` geeft per cel-item de `beurtId` door. `renderPlanningMatrix` bouwt een `_planningBeurtIndex` (beurt-id naar beurt-object plus klantnaam) en rendert de naam als klikbare link.
- Nieuwe modal `#planningEditModal` plus `_planningOpenCelEdit`, `_planningEditBeurt`-logica, `_planningSaveCelEdit` en `_planningCloseCelEdit`. Opslaan gaat via de bestaande `_updateBeurt`, identiek aan de beurt-modal, dus geen nieuw opslag-pad.
- `_planningToggleNotitie` (v3.27.5) is vervangen door deze functies.

---


## v3.27.5 — Planning-notitie per beurt
Elke beurt krijgt een eigen interne planning-notitie, los van de offerte-tekst. Bedoeld als vervanger van de omschrijving-kolommen uit de oude planning-sheet (verplaatst, gestopt, ingepland enzovoort). Komt nergens in een klant-document.

### ⚠️ Vereiste Supabase-migratie (al gedraaid)
```sql
ALTER TABLE onderhoudsplan_beurten
  ADD COLUMN IF NOT EXISTS planning_notitie text DEFAULT '';
```

### Wijzigingen
- **Nieuw veld** `planning_notitie` op `onderhoudsplan_beurten`, in de mappers als `planningNotitie`.
- **Textarea "Planning-notitie (intern)"** in de bewerk-modal van een beurt, onder de offerte-tekst, met de melding dat het niet op de klant-print komt.
- **Notitie-icoon in de Planning-matrix**: bij een beurt met een notitie verschijnt een 📝-icoon. Klik of tik erop en de notitie klapt open onder de cel. Werkt op Mac en iPad, geen hover-afhankelijkheid. Meerdere beurten in dezelfde cel: notities worden samengevoegd.

### Code
- `_mapBeurtFromDB`/`_mapBeurtToDB` uitgebreid. De bestaande beurt-save (`_updateBeurt`) en read-back nemen het veld automatisch mee.
- `_planningRekenPlan` geeft de notitie per cel-item door, `renderPlanningMatrix` rendert het icoon plus een verborgen tekst-div, `_planningToggleNotitie` klapt die open/dicht. De offerte-tekst en de klant-bijlage zijn niet aangeraakt.

---


## v3.27.4 — Planning: capaciteit per jaar (brok 3)
Onder de jaartotalen in de Planning-matrix komen drie capaciteitsregels: het euro-percentage van de jaarcapaciteit, de manuren per jaar en het uren-percentage. Hiermee zie je per jaar hoe vol de planning zit. Brok 3 van het Planning-tabblad.

### Geen migratie
De capaciteit-instellingen leven in het bestaande `app_settings.data` jsonb-blok, dus geen Supabase-wijziging nodig. Bestaande gebruikers krijgen de euro-capaciteit op de default 450.000 via `defaultData.settings`.

### Wijzigingen
- **Twee instellingen** onder Instellingen → Planning: jaarcapaciteit in euro (default 450.000, incl. BTW, zelfde grondslag als de matrix-bedragen) en jaarcapaciteit in manuren (optioneel). Het uren-percentage verschijnt alleen als de uren-capaciteit is ingevuld.
- **Drie regels** onderaan de matrix: "% van [euro-capaciteit]", "Manuren per jaar" en "% van [uren-capaciteit]". Percentages in NL-notatie met komma. Lege cellen blijven leeg.
- De manuren zijn de genormeerde schilderuren plus de werkdag-tellende staart (bijvoorbeeld kleinschaligheidstoeslag), exclusief reisuren. Conform de keuze "alleen manuren werk".

### Code
- `defaultData.settings` uitgebreid met `jaarcapaciteitEuro` (450000) en `jaarcapaciteitUren` (null).
- Instellingen-veld + `loadSettings`-koppeling via de bestaande `updSetting`-flow.
- De uren per beurt komen uit de bestaande engine: `_ohpBeurtBasisBedrag` rekende de manuren al uit en zet ze nu additief weg in `_ohpLastBeurtUren` (reset bovenin, waarde na de dagen-berekening). De engine-uitkomst en de offerte-bijlage blijven ongewijzigd. `_planningRekenPlan` leest die waarde uit, `renderPlanningMatrix` telt per jaar op en rendert de drie regels.

---


## v3.27.3 — Onderhoudsplan verwijderen
Er was wel een backend-functie om een plan te verwijderen (`_deleteOhp`, met FK-cascade op de beurten), maar geen knop ervoor. Handig om testplannen op te ruimen voor de Planning-tab in gebruik gaat.

### Wijzigingen
- **Knop "Verwijder dit plan"** onderaan een geopend onderhoudsplan, visueel losgemaakt van de beurt-acties met een scheidingslijn zodat 'ie niet per ongeluk geraakt wordt.
- **Bevestiging vooraf** via `confirm`, met het aantal beurten erbij en de melding dat de bron-calculatie blijft bestaan en dat het niet ongedaan te maken is.
- Na verwijderen: `_ohpState.plan` op null (de bron-calc blijft geselecteerd), params en inhoud opnieuw gerenderd, toast, en `renderDashboard` om het plannen-archief en de tegels bij te werken. De Planning-matrix is bij de volgende keer openen vanzelf vers.

### Code
- Nieuwe handler `_ohpDeletePlan` naast `_ohpDeleteBeurt`, hergebruikt de bestaande `_deleteOhp`. Geen migratie nodig.

---


## v3.27.2 — Bugfix: plan-status werd niet bewaard
Een statuswijziging van een onderhoudsplan in de editor (Concept, Gereed, Verzonden, Geaccepteerd, Verloren) werd niet opgeslagen en sprong terug naar de oude status. De dropdown-waarde werd wel gelezen, maar bij het opslaan overschreven door de bestaande status uit het geheugen.

### Oorzaak
`_ohpSaveParams` bouwt het plan-object op door `_ohpState.plan` te spreaden en daarna een vaste set velden te overschrijven. `status` ontbrak in die set, dus de oude (gespreade) status won altijd. De bug bestond sinds v3.25.10: de status werd toen eenmalig vanuit de bron-calc gezet en kon daarna nooit meer via de editor wijzigen.

### Fix
- Eén regel: `status: params.status || 'concept'` toegevoegd aan het plan-object in `_ohpSaveParams`. `_ohpReadParamsFromUI` las de waarde al correct uit de dropdown, en `_mapOhpToDB` mapte 'm al naar de kolom. De DB-CHECK-constraint stond Verloren altijd al toe.

Geen migratie nodig.

---


## v3.27.1 — Planning filtert op status Geaccepteerd
Correctie op brok 2. De matrix toonde álle onderhoudsplannen, maar een uitgebracht plan is nog geen opdracht. Alleen plannen met de status Geaccepteerd horen in de planning.

### Wijzigingen
- **Filter op Geaccepteerd**: `renderPlanningMatrix` haalt alle plannen op en filtert op `status === 'geaccepteerd'`. Concept, verzonden en verloren plannen vallen er buiten.
- **Onderscheidende meldingen** in plaats van één generieke lege-tekst: geen plannen in de app, wel plannen maar geen enkel Geaccepteerd (met telling en hint om in de Onderhoudsplan-tab op Geaccepteerd te zetten), of wel Geaccepteerd maar nog zonder beurten.
- **Introtekst** van het tabblad aangepast naar "alle geaccepteerde onderhoudsplannen (opdrachten)".

### Let op (gegevens)
Plan-status bestaat sinds v3.25.10. Plannen die daarvóór zijn gemaakt staan op de default Concept en verschijnen pas in de planning zodra ze op Geaccepteerd worden gezet. De vijf plan-statussen (Concept, Gereed, Verzonden, Geaccepteerd, Verloren) bestonden al, ook Verloren.

---


## v3.27.0 — Nieuw tabblad Planning (brok 1 + 2)
Eerste twee stappen van het Planning-tabblad, het jaaroverzicht dat de Excel/Numbers-planningsheet vervangt. Een matrix met klanten als rijen en jaren als kolommen, automatisch opgebouwd uit de onderhoudsplannen in Supabase. Gebouwd in brokken: dit is het fundament plus de matrix zelf. Capaciteit-percentage, uren, contant/abo-splitsing en het meenemen van de oude plannen volgen in brok 3 tot en met 5.

### ⚠️ Vereiste Supabase-migratie (brok 1)
Eénmalig draaien in het schilders-calc-project (idempotent):

```sql
ALTER TABLE onderhoudsplannen
  ADD COLUMN IF NOT EXISTS betaalmodel text NOT NULL DEFAULT 'abo';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'onderhoudsplannen_betaalmodel_chk') THEN
    ALTER TABLE onderhoudsplannen
      ADD CONSTRAINT onderhoudsplannen_betaalmodel_chk CHECK (betaalmodel IN ('contant','abo'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS planning_handmatig (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  klant text NOT NULL,
  betaalmodel text NOT NULL DEFAULT 'contant' CHECK (betaalmodel IN ('contant','abo')),
  jaartal integer NOT NULL,
  bedrag numeric NOT NULL DEFAULT 0,
  omschrijving text DEFAULT '',
  reeds_uitgevoerd boolean NOT NULL DEFAULT false,
  volgorde integer NOT NULL DEFAULT 0,
  aangemaakt timestamptz NOT NULL DEFAULT now(),
  gewijzigd timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS planning_handmatig_klant_jaar_idx ON planning_handmatig (klant, jaartal);
ALTER TABLE planning_handmatig ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'planning_handmatig' AND policyname = 'planning_handmatig_all') THEN
    CREATE POLICY planning_handmatig_all ON planning_handmatig FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
```

Bestaande calc-plannen komen op betaalmodel `abo` te staan, per plan om te zetten zodra de toggle er is (brok 4). De tabel `planning_handmatig` is nog leeg en wordt in brok 5 gevuld.

### Wijzigingen (brok 2)
- **Nieuw tabblad Planning** tussen Onderhoudsplan en Instellingen. Toont een jaarmatrix van alle onderhoudsplannen in de app: rijen zijn de klanten (uit de calc-klantnaam, alfabetisch), kolommen de jaren (dynamisch van vroegste tot laatste beurt). Per cel het bedrag inclusief BTW plus de korte beurt-naam. Reeds uitgevoerde beurten staan grijs met een badge. Onderaan een regel met het totaal per jaar.
- **Nog niet meegenomen** (volgt): capaciteit-percentage van de jaaromzet (default wordt 450.000), de uren-regel, de splitsing contant versus abo en de handmatige regels voor oude plannen.

### Code
- `_planningFetchAllPlannen` haalt alle plannen plus beurten op in twee queries, los van de editor-state.
- `_planningRekenPlan` rekent per beurt het bedrag per jaar (basis × indexfactor × btwfactor) uit met de bestáánde engine, via een tijdelijke state-swap op `_ohpState`. De reken-functies (`_ohpBeurtBasisBedrag`, `_ohpBtwFactor`, `_ohpIndexFactor`) en de offerte-bijlage blijven ongewijzigd. Nul risico voor bestaande features.
- `renderPlanningMatrix` laadt steeds vers zodat plan-bewerkingen meteen kloppen, en zorgt per plan dat de calc-body geladen is via `_loadCalcBody`.
- Nav-knop, panel en de tab-wissel-aanroep toegevoegd.

---


## v3.26.2 — Meetstaat: breedte vóór hoogte + vrije ×factor
Twee wensen uit de praktijk voor de meetstaat.

### ⚠️ Vereiste Supabase-migratie
Eénmalig draaien in het schilders-calc-project (idempotent):

```sql
ALTER TABLE meetstaat ADD COLUMN IF NOT EXISTS factor numeric NOT NULL DEFAULT 1;
```

Bestaande regels krijgen factor 1, dus hun totalen veranderen niet.

### Wijzigingen
- **Breedte vóór hoogte**: de kolommen "b (cm)" en "h (cm)" zijn van plaats gewisseld, zodat breedte als eerste maat wordt ingevoerd. De Enter-toets springt nu ook eerst naar breedte en dan naar hoogte. De focus na "+ Regel" landt op breedte. Doorgevoerd in zowel de tabel als de meetstaat-PDF. Geen reken-impact: oppervlakte b × h is gelijk aan h × b en de lengte-modus werkte al symmetrisch.
- **Vrije ×factor**: nieuw veld "factor" tussen aantal en totaal, met decimalen en standaard 1. Het rij-totaal wordt maat × aantal × factor (en bij de stuk-eenheid aantal × factor). De factor wordt opgeslagen per meetstaat-regel, gaat mee bij dupliceren van een calculatie en verschijnt in de meetstaat-PDF (gedimd weergegeven zolang hij 1 is).

### Code
- Nieuwe kolom verwerkt in `_mapMeetstaatFromDB` en `_mapMeetstaatToDB` (numeriek, default 1).
- Rij-totaal in `_meetstaatRijTotaal` vermenigvuldigt nu met de factor.
- `renderMeetstaat`, de Enter-navigatie (`msKey`), de nieuwe-rij-default en de dupliceer-flow bijgewerkt.

---


## v3.26.1 — Versie-geschiedenis en welkomstblok aangevuld (gaten gedicht)
Bij het terugkijken bleek dat zowel de Versie-geschiedenis-tijdlijn als het welkomstblok op het dashboard een gat hadden tussen v3.20.0 en v3.26.0. De bijwerk-stap voor beide overzichten was een tijd overgeslagen, waarschijnlijk door werk in parallelle chats, terwijl APP_VERSION en CHANGELOG wel doorliepen.

### Wijzigingen
- **RELEASE_HIGHLIGHTS** (de tijdlijn): 24 ontbrekende versies toegevoegd, v3.21.0 tot en met v3.25.12, als één regel per versie. Bron: het welkomstblok voor de v3.25-reeks en de CHANGELOG voor v3.24, v3.23 en v3.22.3.
- **Welkomstblok** (de paragrafen): 8 ontbrekende paragrafen toegevoegd tussen v3.24.5 en v3.22.3, namelijk de foto-versies v3.24.0 tot en met v3.24.3 en de VvE-versies v3.23.0 tot en met v3.23.3. Bron: de CHANGELOG.

### Niet meegedaan
- De versies v3.24.4 en v3.22.0 tot en met v3.22.2 hebben nergens een bewaard spoor en zijn overgeslagen in plaats van verzonnen. Daardoor zie je in beide overzichten bijvoorbeeld v3.24.5 meteen gevolgd door v3.24.3.
- De datums van de bijgevulde tijdlijn-regels staan op "eind mei 2026" omdat exacte dagdatums per versie niet waren vastgelegd. Te verfijnen in de array indien gewenst.
- Geen functionele of code-wijziging aan de app zelf, dit is puur de twee versie-overzichten.

---


## v3.26.0 — Automatische reisafstand via postcode (PDOK + OpenRouteService)
Tot nu toe zocht je de enkele reisafstand handmatig op in een navigatie-app (afstand van Koperslager 2 naar het werkadres) en typte je die over in het km-veld. Vanaf nu kan de app dat zelf: vul de postcode (en eventueel huisnummer) van het werkadres in, klik op "Afstand ophalen" en het km-veld wordt automatisch gevuld. Het veld blijft met de hand aanpasbaar, dus overrulen kan altijd.

### ⚠️ Vereiste Supabase-migratie
Eénmalig draaien in het schilders-calc-project (idempotent, veilig bij herhaling):

```sql
ALTER TABLE calculaties ADD COLUMN IF NOT EXISTS postcode text;
ALTER TABLE calculaties ADD COLUMN IF NOT EXISTS huisnummer text;
```

Huisnummer bewust `text` zodat toevoegingen als 12A of 2-bis passen.

### Eenmalige instelling
Onder Instellingen, nieuw blok "Automatische afstand":
- **OpenRouteService API-sleutel**: gratis aan te maken op openrouteservice.org. Wordt opgeslagen in de Supabase-instellingen (`app_settings.data.orsKey`), dus niet in de openbare GitHub-code.
- **Vertrekadres** (postcode + huisnummer): standaard leeg, eenmalig je bedrijfsadres invullen (Koperslager 2). Bewust een instelling in plaats van een vaste waarde in de code, zodat het wijzigbaar blijft en de exacte postcode niet hoeft te worden geraden.

### Hoe het werkt
1. PDOK Locatieserver zet zowel het vertrek- als het werkadres om naar coördinaten (gratis, geen sleutel, het officiële Nederlandse BAG-adresregister). Endpoint `api.pdok.nl/bzk/locatieserver/search/v3_1/free`, filter `type:adres`.
2. OpenRouteService berekent de rij-afstand (auto-profiel) tussen die twee punten.
3. De afstand wordt afgerond op 0,1 km en in het km-veld gezet, daarna opgeslagen en alle totalen herberekend.

De vertrek-coördinaten worden binnen de sessie gecachet (`_vertrekCoords`), zodat alleen het werkadres per keer wordt opgezocht. De cache wordt geleegd zodra je het vertrekadres in de instellingen wijzigt.

### Wijzigingen in code
- `_mapCalcHeaderToDB` en `_mapCalcHeaderFromDB`: `postcode` en `huisnummer` toegevoegd (opslaan en laden).
- Calc-scherm: velden "Postcode werkadres" en "Huisnr." plus knop "📍 Afstand ophalen" met een statusregel eronder. De knop heeft géén `lock-allowed` en wordt dus automatisch uitgeschakeld bij een vergrendelde calculatie.
- Reisafstand-veld: `step` van 1 naar 0,1 omdat de berekende waarde decimalen kan bevatten.
- Change-binding: `calcPostcode` en `calcHuisnummer` toegevoegd aan de map, persisten als tekst.
- Nieuwe `updSettingText`-helper voor tekst-instellingen (de bestaande `updSetting` doet `parseFloat` en is ongeschikt voor sleutel en postcode).
- Nieuwe functies `_pdokGeocode`, `_orsAfstandMeters` en `ophaalAfstand`.

### Foutafhandeling
Nette Nederlandse meldingen onder het veld bij: geen sleutel ingesteld, geen vertrekadres, lege postcode, adres niet gevonden, ongeldige sleutel (HTTP 401 of 403) of geen route. In alle gevallen blijft de handmatig ingevoerde waarde staan.

### Niet meegedaan
- **Alleen Nederlandse adressen**: PDOK dekt alleen NL. Duitse en Belgische werkadressen (Aken, Vaals, Herzogenrath) worden niet gevonden. Bewuste keuze voor deze versie. Wil je dat later wel, dan kan de adres-stap via OpenRouteService lopen (dekt heel Europa).
- **Geen autocomplete**: bewust een expliciete knop in plaats van zoeken-tijdens-typen, om API-aanroepen te beperken en jou de controle te laten.

---


## v3.25.12 — Dashboard-tegels nog veel compacter (mini-strip)
Tegels uit v3.25.11 waren al kleiner, maar nog steeds prominent. Deze versie maakt er een echte mini-strip van bovenaan het dashboard.

### Wijzigingen
- Getal-formaat: 1.55rem → 0.95rem (ongeveer halvering)
- Label-font: 0.6rem → 0.55rem; letter-spacing 0.1em → 0.08em
- Padding: 0.55rem 0.75rem → 0.3rem 0.55rem
- `minmax`: 150px → 110px → meer tegels naast elkaar
- `gap`: 0.6rem → 0.4rem
- `margin-bottom`: 1rem → 0.8rem

Op een gewone laptop passen alle acht tegels nu in één rij. Op smal scherm wraps het responsief naar 4+4 of 5+3.

---


De bibliotheek-tegels (Materialen, Bewerkingen, Verfsystemen, Ondergronden, Uurloon) en de succestegels (Calculaties, Onderhoudsplannen, Win-ratio) zijn samengevoegd tot één compactere tegel-grid op het dashboard. Scheelt ongeveer 40% verticale ruimte zonder iets aan informatie te verliezen.

### Wijzigingen
- Twee aparte grids samengevoegd tot één enkele grid.
- `grid-template-columns`: `minmax(180px, 1fr)` → `minmax(150px, 1fr)`. Met 8 tegels passen ze nu allemaal op één rij op een breed scherm (~1280px+), of netjes 4+4 op een gewone laptop.
- `gap`: 1rem → 0.6rem.
- `margin-bottom`: 1.5rem → 1rem.
- Per tegel: inline `padding: 0.55rem 0.75rem` toegevoegd om de default `settings-section`-padding te overschrijven.
- Getal-formaat: 2.2rem → 1.55rem, met `line-height: 1.15` voor compactheid.
- Label: font-size 0.65rem → 0.6rem; letter-spacing 0.12em → 0.1em.

### Niet meegedaan
- Geen aparte visuele scheiding tussen "bibliotheek" en "productie" tegels — bij compacte rendering werd dat juist drukker. De groepering blijft impliciet (eerste vijf = wat je hebt, laatste drie = wat je doet).
- Geen layout-forced 4-kolommen: `auto-fit` blijft, zodat 'm responsief schaalt naar 8 op rij, 4+4, 3+3+2 etc. afhankelijk van de schermbreedte.

---


Tot v3.25.9 volgde een onderhoudsplan automatisch de status van zijn bron-calculatie. In de praktijk klopt dat niet: calc-status en plan-status zijn twee verschillende beslissingen van de klant. Een klant kan de schilderopdracht accepteren maar het onderhoudsplan afwijzen — of andersom. Vanaf v3.25.10 heeft elk plan z'n eigen status, onafhankelijk van de calc.

### ⚠️ Vereiste Supabase-migratie
Eénmalig draaien in het schilders-calc-project:

```sql
ALTER TABLE onderhoudsplannen ADD COLUMN status TEXT;
UPDATE onderhoudsplannen op SET status = c.status
  FROM calculaties c WHERE op.calculatie_id = c.id;
UPDATE onderhoudsplannen SET status = 'concept'
  WHERE status = 'afspraak' OR status IS NULL;
ALTER TABLE onderhoudsplannen ALTER COLUMN status SET NOT NULL;
ALTER TABLE onderhoudsplannen ALTER COLUMN status SET DEFAULT 'concept';
ALTER TABLE onderhoudsplannen ADD CONSTRAINT onderhoudsplannen_status_check
  CHECK (status IN ('concept', 'gereed', 'verzonden', 'geaccepteerd', 'verloren'));
```

Bestaande plannen erven via stap 2 de status van hun bron-calc als startwaarde. 'Afspraak'-status is geen geldige plan-status (een plan ontstaat per definitie pas na opname), die wordt in stap 3 gemapt naar 'concept'. Daarna onafhankelijk te beheren.

### Wijzigingen
- **Datamodel**: `_mapOhpFromDB` / `_mapOhpToDB` nemen nu een `status`-veld mee (default `'concept'` bij ontbreken).
- **UI**: nieuwe `Status van plan`-dropdown naast `Type ontvanger` in de Onderhoudsplan-tab. Vijf waarden, met hint *"eigen status, los van de bron-calculatie"*.
- **`_ohpReadParamsFromUI`**: leest de status mee bij save.
- **`_ohpRenderParams`**: zet de dropdown bij het laden van een plan, en disable't 'm wanneer er geen bron-calc is.
- **Event-binding**: `ohpStatus` toegevoegd aan de lijst van velden die `_ohpScheduleSave` / `_ohpFlushSave` triggeren. Een wijziging slaat dus op via de bestaande debounce-flow.
- **Plannen-archief op dashboard** (v3.25.9): de status-bron is gewisseld van `calc.status` naar `r.status` (uit de plan-row zelf). Query haalt nu ook `status` op naast `id, calculatie_id, gewijzigd`.

### Niet meegedaan / bewust gelaten
- **Win-ratio-tegel blijft over calc-status** (niet plan-status). De win-ratio meet het commerciële succes van uitgebrachte schilderopdrachten — een plan dat geaccepteerd wordt is een extra metric die je in een latere versie eventueel als aparte tegel kunt toevoegen.
- **Default-status nieuw plan** is `'concept'`, niet `c.status` van de bron-calc. Een nieuw plan begint altijd vers in concept, ongeacht waar de calc staat.
- Status-wijziging triggert wel een `gewijzigd`-update (via `_mapOhpToDB`), waardoor het plan in het archief omhoog springt in de sortering — dat is intentioneel: zojuist-gewijzigd boven.
- Geen aparte "status-geschiedenis"-log. Mocht je willen weten *wanneer* een plan op geaccepteerd is gezet (los van algemene wijzigingen), is dat een latere uitbreiding.

### Les voor mezelf
- Eerder schreef ik in v3.25.9 dat plan-status uit calc kwam. Pas bij gebruik bleek dat semantisch fout. Bij toekomstige model-keuzes: bij iets dat een "eigen leven" lijkt te leiden (zoals een offerte naast een calc), eerder de vraag stellen *of het echt 1-op-1 dezelfde status moet hebben*. Niet aannemen op basis van convenience.

---


Onder het bestaande Calculaties-archief op het dashboard komt een tweede archief: **Onderhoudsplannen**. Dezelfde groepen-per-status-structuur als het calc-archief, dezelfde collapse-gedrag (alles default dicht), maar dan voor onderhoudsplannen. Klik op een rij → spring naar de Onderhoudsplan-tab met dat plan actief.

### Werking
- **5 status-groepen** in vaste volgorde: Concept · Gereed · Verzonden · Geaccepteerd · Verloren. De Afspraak-status doet niet mee — een afspraak heeft per definitie nog geen plan-content.
- **De status komt uit de calc**, niet uit het plan zelf. Onderhoudsplannen hebben geen eigen status-veld (`_mapOhpToDB` slaat niets op), ze "volgen" de status van hun bron-calculatie via `calculatie_id`.
- **4 kolommen per rij**: Project (naam + klant uit calc) · Aanvraag (= calc.opnameDatum) · Deadline (= calc.deadlineDatum) · Laatste wijziging (= plan.gewijzigd, NL-kort formaat zoals "12 jun 26").
- **Sortering** binnen elke groep: laatste wijziging desc — meest recent boven.
- **Klik op een rij** roept `openPlan(calcId)` aan: triggert eerst een tab-knop-click (zorgt dat de Onderhoudsplan-tab actief wordt via de bestaande nav-handler), daarna `_ohpSetBronCalc(calcId)` om het plan in beeld te krijgen, plus een soepele scroll naar boven.

### Nieuwe functies
- `renderPlannenArchief()` — async, doet één Supabase-query op `onderhoudsplannen` (alleen `id, calculatie_id, gewijzigd`), cross-referencet met `data.calculaties` voor klant/project/datums/status, groepeert per calc-status en rendert.
- `openPlan(calcId)` — tab-switch + plan activeren + scroll.
- `togglePlanSection(status)` — open/dicht-toggle per groep (los van calc-archief's `toggleDashSection`).
- `_planCollapsed` Set — collapse-state per status, default alle 5 dicht.
- `_fmtDatumKort(s)` — kort NL datum-formaat met 2-cijferig jaartal voor compactheid in het archief.

### Totaalbedrag bewust weggelaten
Een plan-totaal incl. BTW vereist `_ohpBeurtBasisBedrag` per beurt — die functie hangt aan `_ohpState.plan` (globale state) en vereist een volledig geladen calc met regels/onderdelen/scaling. Voor een archief-overzicht met alle plannen tegelijk zou dat óf een lange dashboard-load betekenen (alle calcs voorafgaand laden), óf een caching-mechanisme nodig hebben (extra DB-kolom + recompute bij elke plan- en beurt-mutatie). Voor v3.25.9 weggelaten omdat de archief-functie navigatie is — wil je het bedrag zien, open je het plan in de tab. Mogelijk caching toevoegen in een latere versie als de behoefte er is.

### Niet meegedaan / bewust gelaten
- Geen per-calc "heeft plan"-indicator in het calc-archief — dat zou symmetrisch zijn maar de gebruiker vraagt expliciet om navigatie via dashboard, dat dekt het.
- Geen filter-controls bovenaan (zoals zoek/datum). Het archief is georganiseerd via collapse — wil je een plan zien, klap je de status open. Bij grotere aantallen kan dit later.
- Geen "+ Nieuw plan"-knop in deze sectie — plannen worden aangemaakt vanuit een calculatie in de Onderhoudsplan-tab, niet vanaf het dashboard.

### Performance
Eén lichte query (alleen 3 kolommen) per dashboard-render. Cross-reference is in-memory (`data.calculaties` is al geladen). Geen state-mutaties, geen lazy loads. Schaalbaar tot honderden plannen zonder merkbare vertraging.

---


Onder de bestaande "bibliotheek"-tegels (Materialen / Bewerkingen / Verfsystemen / Ondergronden / Uurloon) staat nu een tweede tegel-rij met cijfers over de productie en het resultaat van het bedrijf: aantal calculaties, aantal onderhoudsplannen en de win-ratio. Visueel gelijk aan de andere tegels — dezelfde grid, dezelfde stijl, dezelfde accent-kleur — maar in een aparte grid eronder zodat ze duidelijk een eigen groep vormen.

### Drie tegels

**Calculaties** — `data.calculaties.length`. Alle statussen samen, inclusief afspraken en concepten. Geeft het totale werk-volume.

**Onderhoudsplannen** — via een `count: 'exact', head: true`-query op de `onderhoudsplannen`-tabel. Plannen zitten niet in `data.*` (worden lazy geladen per calculatie), dus deze count komt direct uit Supabase. Bij fout of geen data: "—".

**Win-ratio** — `geaccepteerd / (verzonden + geaccepteerd + verloren) × 100%`, afgerond op heel getal.
- Bewust niet over álle calculaties: een concept of afspraak is nog "in beweging", die meetellen zou de ratio kunstmatig drukken.
- Bij `uitgebracht === 0` toon "—" (anders deling-door-nul of een misleidende 0%).
- Hover toont absolute aantallen ("3 gewonnen van 5 uitgebrachte offertes").

### Wijzigingen
- HTML: tweede grid eronder met drie `settings-section`-divs, ids `statCalc` / `statPlannen` / `statWin`.
- `renderDashboard()`: drie regels voor calc-count, win-ratio (synchroon uit `data.calculaties`) en plannen-count (async via Supabase count-query, defensief tegen `_sb` undefined).

### Architectuur
- Geen nieuwe state of cache voor het plannen-aantal — gewoon één lichte count-query per dashboard-render. Goedkoop genoeg.
- De win-ratio berekening gebruikt `c.status === 'geaccepteerd'` en `['verzonden','geaccepteerd','verloren'].includes(c.status)`. Andere statussen (concept, afspraak) zijn bewust uitgesloten uit zowel teller als noemer.

---


Voorheen waren `Afspraak`, `Concept` en `Gereed` standaard open en `Verzonden`/`Geaccepteerd`/`Verloren` standaard dicht. Nu starten alle zes groepen dicht — alleen sectiekoppen tonen titel + aantal + totaal. Rustiger overzicht bij het openen van het dashboard.

### Wijziging
`_dashCollapsed`-Set bevat nu alle zes statussen ipv alleen de laatste drie:
```js
const _dashCollapsed = new Set(['afspraak', 'concept', 'gereed', 'verzonden', 'geaccepteerd', 'verloren']);
```

### Onveranderd
- De toggle-state (`toggleDashSection`) blijft per status werken — je kunt elke groep individueel open- of dichtklappen door op de kop te klikken.
- Geen persistentie van de open/dicht-state: bij elke page-load start je weer met alles dicht. Dat sluit aan bij de intentie "rustig openen" — wil je iets zien, klik je het zelf open.

---


De klant-autofill uit v3.25.4 reageerde alleen op het `change`-event van het projectnaam-veld. Dat event vuurt op blur — prima voor wijzigingen achteraf, maar bij "+ Nieuwe calculatie" wordt de naam via een prompt-modal ingevoerd. De naam wordt vervolgens programmatisch in het veld gezet bij het openen van de calc, en programmatische `value`-toewijzingen vuren **geen** change-event. Resultaat: klant bleef leeg ondanks pipe-naam.

### Wijziging
In `newCalc()`, na het lezen van de prompt-naam, wordt klant direct afgeleid uit het deel vóór `|` en meegegeven aan `_insertCalcDB`:
```js
const _pipeIdx = naam.indexOf('|');
const klant = _pipeIdx >= 0 ? naam.slice(0, _pipeIdx).trim() : '';
const fresh = await _insertCalcDB({ naam, status: 'afspraak', klant });
```

Geen pipe in de prompt-naam → klant leeg (niet de hele naam, want anders krijg je "Calculatie 5" als klant bij de default-prompt-naam).

### Onveranderd
De blur-handler uit v3.25.4 op het projectnaam-veld blijft werken voor latere wijzigingen — typ je in het veld iets aan, dan past klant zich automatisch aan (met respect voor handmatige overschrijving).

### Les voor mezelf
- Bij events: bedenk niet alleen *wanneer* maar ook *door wie* het event wordt getriggerd. `value = …` via JS triggert geen change. Voor "altijd reageren op programmatische wijzigingen" moet de logica óók in de programmatische code zelf staan — niet alleen in event-handlers.
- Twee complementaire paden: blur-handler vangt typewijzigingen op, expliciete code in `newCalc()` vangt prompt-aanmaak op.

---


In v3.25.3 was de wijziging gedaan in `_newCalcObj()` — die functie blijkt dode code (nergens aangeroepen). Het gedrag in de praktijk bleef daardoor onveranderd: nieuwe calculaties startten nog steeds op `concept` omdat de echte insert-flow (`newCalc → _insertCalcDB → _mapCalcHeaderToDB`) op de fallback `c.status || 'concept'` viel.

### Wijziging
Bij `newCalc()` wordt nu expliciet `status: 'afspraak'` meegegeven aan `_insertCalcDB`:
```js
const fresh = await _insertCalcDB({ naam, status: 'afspraak' });
```
`_mapCalcHeaderToDB()` pakt dat op via `c.status || 'concept'` — `c.status` is nu gevuld, dus de fallback wordt niet meer geraakt.

### Les voor mezelf
- Bij wijziging van defaults: **verifieer de aanroep-keten** voordat je vasthoudt aan een aanname. Een functie aanpassen heeft alleen effect als die functie ook gebruikt wordt.
- Snelle controle die ik had moeten doen: `grep -n "_newCalcObj" index.html` → 1 voorkomen (alleen de definitie) → rode vlag, niet gerefereerd dus zinloos om aan te passen.
- Dupliceren en de oude-data-migratie raken `status` netjes via een hardcoded `'concept'`, dus die zijn niet getroffen door deze fout.

### Niet meegedaan
- `_newCalcObj()` zelf laten staan als dode code (had bij deze sessie kunnen weggehaald, maar buiten scope). Status erin blijft op `'afspraak'` voor consistentie als 'm ooit gebruikt zou worden.

---


In de praktijk volgt de projectnaam vrijwel altijd het patroon `"Klantnaam | projectomschrijving"` — bv. *"Mordant | Tuinhuis"*. Het Klant-veld krijgt nu het deel vóór de pipe als auto-fill, zodat je niet elke keer dezelfde klantnaam opnieuw hoeft te typen.

### Logica
- **Klant leeg** → vullen met het deel vóór `|` (getrimd). Geen pipe in projectnaam? Dan wordt de hele projectnaam de klant.
- **Klant = vorige auto-waarde** → bijwerken naar nieuwe auto-waarde (typ je projectnaam aan, dan volgt klant).
- **Klant handmatig ingevuld als iets anders** (bv. "Familie Mordant" ipv "Mordant") → laten staan, geen overschrijving.

Hetzelfde "respect voor handmatige overschrijving"-patroon dat al gebruikt wordt voor opname-datum → deadline auto-fill (sinds v3.16.x). Triggert op `change`-event van het projectnaam-veld (op blur), dus pas zichtbaar zodra je het veld verlaat.

### Wijziging
- In de globale `change`-event handler (header form binding): vlak na het bepalen van `oldOpname`/`oldDeadline` nu ook `oldNaam` en `oldKlant` vastleggen. Na de hoofdupdate van `data.calc[k]` controleren of `k === 'naam'`, en de auto-fill toepassen indien de voorwaarden kloppen.
- Helper `_extractKlant(s)` inline gedefinieerd in dezelfde scope: pakt alles vóór de eerste `|` en trimt. Geen pipe? Dan de hele string.

### Niet meegedaan
- Geen aparte UI-aanwijzing dat het veld auto-gevuld is. Het patroon werkt voor jou onzichtbaar — het is een productivity-tweak, niet een nieuwe feature die uitleg behoeft.
- Geen retroactieve aanpassing van bestaande calculaties met lege klant-velden. Alleen nieuwe wijzigingen aan projectnaam triggeren de auto-fill.

---


Aansluiting op v3.25.2: in de praktijk is een nieuwe calculatie bijna altijd een opname-afspraak (klant belt, opname plannen, dan pas inhoudelijk uitwerken). Het opent vanaf nu dus direct in de Afspraak-categorie, scheelt elke keer een klik op de status-dropdown.

### Wijziging
- Default-template voor `addCalculatie()`: `status: 'afspraak'` (was `'concept'`).
- Dupliceren (`duplicateCalculatie()`) blijft `status: 'concept'` — een kopie heeft al inhoud, dus dat is geen afspraak meer.
- Migratie-pad (oude localStorage-data importeren) blijft `status: 'concept'` — bestaande, ingevulde data hoort niet als afspraak.

Eén regel code, één gedragswijziging — past in de bestaande Afspraak-flow zonder nieuwe knoppen of velden.

---


Voor opname-afspraken die ingepland zijn bij een klant maar nog geen uitgewerkte calculatie hebben. Workflow: klant belt, je plant opname in, je maakt alvast een calc-record aan met klantnaam (en eventueel datum/notitie), zet 'm op "Afspraak". Na de opname schuif je 'm via de status-dropdown naar "Concept" en werk je uit. Pure UI/sortering — datamodel en alle gegevens blijven onveranderd; alleen een extra waarde voor het bestaande `status`-veld.

### ⚠️ Vereiste Supabase-migratie (correctie achteraf)
In de oorspronkelijke release van v3.25.2 stond dat geen migratie nodig was. Dat klopte niet — `status` had een CHECK constraint die alleen de oude vijf waarden toeliet. Bij het wisselen van status naar "Afspraak" verscheen: `new row for relation "calculaties" violates check constraint "calculaties_status_check"`. Onderstaande SQL vervangt de constraint zodat 'afspraak' óók is toegestaan:

```sql
ALTER TABLE calculaties DROP CONSTRAINT IF EXISTS calculaties_status_check;
ALTER TABLE calculaties ADD CONSTRAINT calculaties_status_check
  CHECK (status IN ('concept', 'gereed', 'verzonden', 'geaccepteerd', 'verloren', 'afspraak'));
```

**Les voor Claude (en toekomstige sessies):** ga niet uit van een "vrij tekstveld" wanneer een kolom statussen bevat — altijd het schema verifiëren via `project_knowledge_search` of door de DDL op te vragen voor uitspraken doet over migraties. Eerder in deze sessie schreef ik "geen DB-migratie nodig" zonder de constraint te checken; dat is precies de aanname die fout uitpakt.

### Wijzigingen
**Status-set uitgebreid (5 plekken):**
- `STATUS_LABELS` in `renderCalculatiesArchief()`, print-headers (2×) en de bron-calc-kiezer in de Onderhoudsplan-tab: nu inclusief `afspraak: 'Afspraak'`.
- `STATUS_COLORS` in `renderCalculatiesArchief()`: `afspraak: '#8b5cf6'` (paars — onderscheidend van de bestaande grijs/oranje/blauw/groen/donkeroranje).
- `STATUS_ORDER` in `renderCalculatiesArchief()`: `['afspraak', 'concept', ...]` — Afspraak bovenaan in de groepering.
- `_ohpFilter.status` (bron-calc filter): `afspraak: false` als default (uit) — een afspraak gebruik je normaal niet als bron voor een onderhoudsplan.

**Bewerkbaarheid:**
- `_isCalcLocked(c)`: een calc met status `afspraak` is **niet** vergrendeld (zelfde behandeling als `concept`).
- `_touchCalc()`'s `isConcept`-flag: een afspraak telt ook als concept-achtig, dus bij wijzigen wordt het totaal-cache gewoon bijgewerkt.
- Gevolg: in een afspraak-record kun je naam/klant/datums vrij invullen en aanpassen. Daarmee bewust geen aparte tabel of nieuw datamodel nodig — een afspraak is gewoon een lege calculatie met status `afspraak`.

**Bron-calc-filter (Onderhoudsplan-tab):**
- Nieuwe checkbox "Afspraak" toegevoegd vóór de bestaande "Concept"-checkbox. Default uit; aanvinken laat afspraak-calc's in de lijst verschijnen (voor wie 'm toch ooit als bron wil gebruiken).

### Niet meegedaan / bewust gelaten
- ~~Geen DB-migratie nodig — `status` is een bestaande `TEXT`-kolom zonder enum-constraint.~~ **Onjuist** — er stond wél een CHECK constraint op `status`; zie de correctie-sectie hierboven voor de noodzakelijke SQL.
- Geen extra velden bij een afspraak (datum/tijd/adres apart). Bestaande velden volstaan; klanten-naam, notitie en opname-datum-veld (al aanwezig) zijn genoeg.
- Geen aparte "Nieuwe afspraak"-knop. Je maakt 'm via de gewone "Nieuwe calculatie"-flow en zet 'm via de status-dropdown op Afspraak.

---


Zodra je voor een onderhoudsplan een bron-calculatie hebt gekozen, verdwijnt de hele kies-UI (zoekbalk + status-filter-checkboxes + scrollbare lijst met calculaties) uit beeld. In plaats daarvan staat er één compact regeltje met de gekozen bron en een **Wijzig**-knop voor het geval je naar een andere bron wilt switchen. Scheelt visuele ruis tijdens dagelijks gebruik — de hele "riedel" hoort thuis bij het opstarten van een plan, niet bij het bewerken ervan.

### Wijzigingen
**HTML:**
- Nieuw element `#ohpBronCompact` boven het bestaande `#ohpBronWrap`-blok, in een lichtgrijs blokje met flex-layout: links de tekst "Bron-calculatie: [naam · klant]", rechts de Wijzig-knop.

**JS state:**
- Nieuwe boolean `_ohpBronEditing` (default `false`). Hij staat alleen op `true` tussen het moment dat de gebruiker op **Wijzig** klikt en het moment dat een nieuwe bron wordt geselecteerd.
- Nieuwe functie `_ohpWijzigBron()`: zet de flag op `true` en triggert de render.

**Aangepast — `_ohpRenderHuidigeBron()`:**
- Werkt nu drie elementen bij: het status-label, het summary-label én de zichtbaarheid van compact-blok versus volledig kies-blok.
- Bij `!calcId` of `calcId niet gevonden`: compact uit, volledig kies-blok zichtbaar (= nieuw plan, of plan op een verwijderde calc).
- Bij gekozen bron én `_ohpBronEditing === false`: compact tonen (flex), kies-blok verbergen.
- Bij gekozen bron én `_ohpBronEditing === true`: compact verbergen, kies-blok zichtbaar (gebruiker is aan het switchen).

**Aangepast — `_ohpSetBronCalc()`:**
- Zet `_ohpBronEditing = false` aan het begin, zodat na een wisseling automatisch wordt teruggekeerd naar de compacte weergave.

### Niet meegedaan / bewust gelaten
- De Parameters-`<details>`-summary toont de bron-naam al sinds v3.23.0 in het label "· Bron: [naam]" — die regel blijft ongewijzigd en doet z'n werk bij ingeklapt Parameters-blok.
- Geen migratie nodig (alleen UI-aanpassing, geen DB-wijzigingen).

---


De offerte-bijlage voor particuliere klanten is volledig heringericht: in plaats van "uitleg + cijfers eerst, dan persoonlijke details" begint het document nu met het persoonlijke verhaal van de woning, en pas daarna komt het commerciële verhaal. Voor de VvE-variant is alles ongewijzigd.

### Nieuwe pagina-volgorde particulier
**Pagina 1 — het verhaal**
- Persoonlijke aanhef: *"Hierbij ontvangt u het op maat gemaakte Onderhouds garantie+ plan voor uw woning."*
- §01 Wat we aantroffen — automatisch gevuld vanuit `calc.notities` (de notitie in de bron-calculatie)
- §02 Voor uw huis specifiek — de jaar-blokken, met de eerste beurt altijd benoemd als "Startonderhoudsbeurt"

**Pagina 2 — het plan**
- §03 Wat het plan u biedt — lead-tekst, hero met €/maand en de 6 zekerheden
- §04 Welke beurten zitten in het plan — controle- en herschilderbeurt-uitleg
- §05 De planning — alleen de horizontale tijdlijn (geen jaartabel meer)

**Pagina 3 — zekerheid**
- §06 Uw zekerheid — gelijk aan VvE: garantie-items, prijszekerheid/buiten-plan en quotes

### Belangrijke wijzigingen tegenover de oude particulier-versie
- **Totaalbedrag uit de hero gehaald.** De €/maand staat nu centraal; het cumulatieve "totale investering" bedrag is voor particulier weggehaald (was psychologisch afschrikkend). Hero strekt zich uit over de volle breedte met €/maand groot en sub-tekst "gemiddeld over X jaar · YYYY–YYYY · inclusief btw".
- **Jaartabel weggehaald.** De tabel onder de tijdlijn was een derde weergave van dezelfde info (jaartal-rij op tijdlijn + jaar-blokken op p1 + tabel). Voor particulier nu alleen de tijdlijn. Bij VvE blijft de tabel staan (zakelijke context vraagt om expliciete cijfers).
- **Aanhef-zin als prominente opening** vóór alle secties op pagina 1, in groter formaat met onderlijn.
- **Calc-notities-sectie** alleen tonen als er notities zijn ingevuld; anders begint het document direct met §01 Voor uw huis specifiek (sectienummering schuift automatisch op via de bestaande `nextSec()`-helper).

### Reeds-uitgevoerd visueel (gebruikt het v3.24.5 vinkje)
- **Tijdlijn**: kaart, dot, jaartal en verbindingsstem worden in grijze tinten getoond. Na het type-label komt "· reeds uitgevoerd" als gedempt suffix.
- **Jaar-blokken**: hele blok in grijze tint (linker-rand, dot, kop en tekst). Naast de kop een klein rond "reeds uitgevoerd"-badge in uppercase.
- De eerste beurt in het plan heet altijd "Startonderhoudsbeurt" — ongeacht status. Een reeds-uitgevoerde startbeurt blijft dus zichtbaar in het plan, maar duidelijk als verleden gemarkeerd.

### Architectuur
- De template-functie `_ohpBuildOfferteHTML` splitst de body nu in twee varianten via een ternary: één voor particulier (nieuwe omgekeerde volgorde, geen tabel) en één voor VvE (bestaande volgorde, met tabel). CSS, masthead, footer, en alle data-helpers zijn gedeeld.
- Nieuwe CSS-klassen: `.aanhef`, `.tl-card.done` (+ `.amt`, `.type`, `.stem` varianten), `.tl-dot.done`, `.tl-year.done`, `.yearblock.done` (+ `::before` + `.yhead` + `p` varianten), `.done-tag` (tijdlijn-suffix), `.done-badge` (jaar-blok badge).
- Aanhef en aangetroffen-content worden vooraf opgebouwd als variabelen (`aanhefHtml`, `aangetroffenHtml`); de ternary zorgt dat ze alleen voor de particulier-variant in de body terechtkomen, zonder dubbele `nextSec()`-side-effects.

### Niet meegedaan / bewust gelaten
- VvE-variant blijft volledig zoals 'ie was; herinrichting daarvan (indien gewenst, "kritisch kijken naar VvE-document") in een latere ronde.
- De `calc.notities` voor VvE blijft niet getoond — VvE heeft z'n eigen `plan.scopeOmschrijving`-veld voor "Wat valt onder dit plan" (§03 in VvE-variant). Geen overlap of duplicatie.

---


Eerste stap richting de psychologische herinrichting van de particulier-variant van de offerte-bijlage. Deze versie legt alleen de datalaag + UI voor het vinkje; het visuele effect (grijs tonen in tijdlijn/jaarblokken) komt mee in de volgende versie waarin de particulier-bijlage wordt heringericht.

### Vereiste Supabase-migratie (al uitgevoerd)
```sql
ALTER TABLE onderhoudsplan_beurten
  ADD COLUMN IF NOT EXISTS reeds_uitgevoerd BOOLEAN DEFAULT FALSE;
```

### Wijzigingen
**Datamodel:**
- `_mapBeurtFromDB`: leest nieuwe kolom `reeds_uitgevoerd` → JS-veld `reedsUitgevoerd` (boolean, default false).
- `_mapBeurtToDB`: schrijft `reedsUitgevoerd` → `reeds_uitgevoerd` weg.

**UI — bewerk-modal van een beurt:**
- Nieuw vinkje tussen het naam/jaar-blok en de modus-radio's: "Deze beurt is reeds uitgevoerd". Lichtgrijs blokje met uitleg eronder, visueel apart van de rekenkundige instellingen zodat het als status-veld opvalt.
- `_ohpOpenBeurtModal` vult het vinkje; `_ohpMbOpslaan` leest 'm uit en slaat 'm op via de bestaande `_updateBeurt`-flow.

### Architectuur
- Geen nieuwe tabel of query-functie. Enige backend-wijziging is één kolom met sensible default (FALSE), dus bestaande beurten zijn automatisch "nog niet uitgevoerd".
- Het veld doet in deze versie nog niets zichtbaars in de bijlage; dat komt in de volgende stap waarin we voor de particulier-variant de hele bijlage psychologisch omkeren (verhaal eerst, pitch tweede) en de Startonderhoudsbeurt anders weergeven afhankelijk van deze vlag.

---


Het klusdossier kent nu naast notities, taken en foto's ook **documenten**: losse PDF's die je aan een calculatie hangt — bijvoorbeeld een ingescande opname, een getekend formulier of een bestaand MJOP van een VvE. Hiermee is de fotomodule-reeks (fase 1–3) afgerond.

### Vereist (al gedaan)
Privé Storage-bucket `calculatie-documenten` + tabel `calculatie_documenten` met RLS en storage-policies.

### Wat je kunt doen
- In het paneel **"Notities, taken & foto's"** staat onderaan nu een **Documenten**-blok met een **"+ PDF"**-knop. Je kunt één of meerdere PDF's tegelijk kiezen.
- Elk document staat in de lijst met zijn **bestandsnaam**. Klik erop om het in een **nieuw tabblad** te openen; het ×-knopje verwijdert het (met bevestiging).
- De kop-samenvatting toont nu ook het aantal documenten, bv. "✎ · 4 foto's · 2 documenten".
- Bestanden tot 50 MB (grens gratis Supabase-laag); grotere worden netjes geweigerd met een melding.
- Een geüploade PDF gaat **niet** door de Archiveren-printsequentie — het ís al een PDF, dus je opent/downloadt 'm gewoon.

### Onder de motorkap
- PDF's worden as-is in Storage bewaard (geen verkleining), metadata (pad, naam, grootte) in de tabel; meegeladen bij het openen van een calc, net als de foto's.
- Tijdelijke (1 uur) signed link bij openen; om pop-upblokkering te vermijden wordt het tabblad synchroon binnen de klik geopend.
- Dezelfde nette opruiming: verwijder je een document, dan gaan bestand én rij weg; verwijder je een hele calculatie, dan wordt ook de documentmap (én de fotomap) uit Storage geveegd. Geen wezen.

---

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
