# Changelog Oplevering

## v0.4.0 — Opgave versturen met accordeerlink
Stap 3 van de houtrot-opgave. Onder de totalen staat nu de groene knop *Opgave versturen*. Die bouwt de PDF, zet hem in de bak `accord-pdf`, maakt een accordeerlink aan (rij in `offerte_accorderingen` met `oplevering_id`, zonder calculatie; `sql/houtrot_03_accord.sql`) en mailt de klant via de Edge Function `offerte-verzenden` (v4.91.0) met de knop "Opgave bekijken en akkoord geven". De klant geeft akkoord op de Calc-pagina (`?accord=TOKEN`), en `offerte-accord` (v4.91.0) zet de opgave dan op akkoord of afgewezen; dat zie je terug in de status-pil.

### Wat er verandert
- Knop *Opgave versturen* (bij een al verstuurde opgave *Opnieuw versturen*; na akkoord of afwijzing verdwijnt hij). Vereist een e-mailadres bij Gegevens en minstens één plek; bij plekken zonder plek, methode of bedrag vraagt de app eerst of je toch wilt doorgaan. De bevestigingsvraag noemt het bedrag incl. btw en het e-mailadres.
- Eén actieve link per opgave: opnieuw versturen wist de oude open link en maakt een nieuwe. De link is 14 dagen geldig (`geldigTot` in het snapshot, vandaag + 14).
- Na een geslaagde mail gaat de opgave op *verzonden* met `verzonden_op`; onder de totalen staat "Verstuurd op <datum> naar <e-mail>". Mislukt een stap (PDF, opslaan, link, mail), dan blijft de status staan en zegt de toast welke stap faalde.
- De knop *PDF maken* heet nu *PDF* en staat zonder kleur; hij blijft voor het delen via het deelblad.
- Geen opvolgautomaat bij houtrot-opgaven (besluit 12-10-2026): geen beltaak, herinnering of verlopen-mail.
- Nog geen begeleidend tekstvak; de mail gebruikt de vaste intro uit `offerte-verzenden`. Dat kan er later bij, net als in Calc.

## v0.3.1 — Foto kiezen uit bibliotheek bij houtrot
Bij een houtrot-opgave opende de fotoknop op iPhone altijd direct de camera, zonder keuze voor de fotobibliotheek of bestanden. Dat kwam door `capture="environment"` op de verborgen bestandsinvoer, een keuze uit de eerste oplever-app (22-08-2026). Bij een houtrot-opgave vervalt dat attribuut nu vlak voor het openen (`stelFotoInvoerIn`), zodat het toestel het menu camera / fotobibliotheek / bestanden toont; bij een oplevering blijft de camera direct opengaan. Gevonden door Gian bij de iPhone-test van v0.3.0 op 12-10-2026.

## v0.3.0 — Houtrot-opgave vanaf de steiger
Kom je tijdens het werk houtrot tegen, dan maak je per plek een foto, kiest een herstelmethode en zet er een bedrag op. De app telt op en maakt een PDF die je via de deelknop naar de klant mailt. Stap 2 van vier; de accordeerlink en het mailen vanuit de app (stap 3 en 4) volgen.

### Wat er verandert
- Bovenaan twee tabbladen: Opleveringen en Houtrot. Een nieuwe lijst krijgt de soort van het open tabblad; bij Gegevens staat de keuze bovenin en ligt vast zodra de lijst bestaat.
- Een houtrot-opgave heeft extra gegevens: e-mail van de klant (voor stap 3), btw 9% of 21%, en een vrij opgavenummer.
- Een houtrot-plek is een punt met foto en ringen zoals bij de oplevering, plus plek, herstelmethode uit de tarieflijst (Calc → Instellingen → Houtrot-tarieven), aantal, prijs per eenheid en bedrag. Methode kiezen vult prijs en eenheid, aantal × prijs geeft het bedrag, en het bedrag blijft met de hand overschrijfbaar. Methode, klanttekst en prijs worden per plek gekopieerd: een latere tariefwijziging raakt een bestaande opgave niet.
- Opslaan zonder plek of zonder methode wordt geweigerd. In de lijst staat een plek zonder bedrag oranje, en de kop telt hoeveel plekken nog niet compleet zijn.
- De kop toont totaal excl., btw en incl. Het overzicht toont per opgave het aantal plekken, het bedrag excl. en de status (concept, verzonden, akkoord, afgewezen). Akkoord en afgewezen staan achter *toon afgehandelde*.
- Knop PDF maken: A4 met logo en bedrijfsgegevens uit de Calc-instellingen, projectnaam, opgavenummer, datum, klantblok, inleiding, per plek de foto mét ringen naast plek, methode, klanttekst, toelichting, aantal × prijs en bedrag, daaronder de totalen en een slotregel. Op iPhone opent de deelknop (Mail zit daarin), anders wordt het bestand gedownload. Ontbreekt er bij een plek nog iets, dan vraagt de app eerst of je toch wilt doorgaan.
- Tarieven worden na het inloggen geladen; is de lijst leeg als je een plek opent, dan haalt het vel hem zelf na.
- Gewone opleveringen werken ongewijzigd.

### Nodig
- `sql/houtrot_01_tarieven.sql` en `sql/houtrot_02_opgaven.sql`, beide op 12-10-2026 door Gian gedraaid (6× en 8× GOED).
- pdfmake 0.2.20 via jsDelivr, dezelfde versie als Calc.

### Getest
- JS-parse (node --check), css-accolades 127/127, tagbalans div 105/105, button 30/30, script 4/4.
- Runtime in Node met nagebootste Supabase en DOM, op code uit het gepatchte bestand: tabbladen filteren, kaarten met bedrag en status, schakel afgehandelde, totalen met 9% en 21%, punt-vel in beide standen, methode kiezen, herrekenen, handmatig bedrag, weigering zonder plek, opslaan met tariefkopie, telling na opslaan, nieuw erft soort, insert houtrot (concept, btw 9, e-mail, nummer), insert oplevering ongewijzigd, soort vergrendeld bij bewerken, tarieflijst laadt zichzelf na, PDF-definitie met bedrijfsgegevens en terugval, en een echte PDF gebouwd met pdfmake (57 kB, één pagina, tekst en voettekst gecontroleerd).
- Niet getest: in de browser en op de iPhone. Vooral: de foto mét ringen in de PDF (canvas met een signed URL uit Supabase Storage; lukt dat niet door CORS, dan gaat de kale foto mee, en lukt ook dat niet dan staat er "geen foto") en de deelknop naar Mail. Beide in echt gebruik controleren.

### Bewust nog niet
- Status wijzigen (verzonden, akkoord, afgewezen) kan nog niet in de app; dat komt met de accordeerlink in stap 3. Tot die tijd blijft een opgave op concept staan.
- Geen koppeling met een calculatie, Taken of Financieel.

## v0.2.1 — Eigen icoon op het iPhone-beginscherm
Eén regel in de head: `apple-touch-icon` naar het nieuwe `apple-touch-icon-oplevering.png` (Ernes-logo met oranje band "Oplevering", 180×180). Icoon dat er al staat: verwijderen en opnieuw toevoegen. Verder niets gewijzigd. Getest: JS-parse (node), tagbalans. Niet getest: iPhone. 16-09-2026.

## v0.2.0 — Elke ring zijn eigen maat
Een ring was altijd 7 procent van de fotobreedte. Een haarscheur en een hele muur kregen dus dezelfde cirkel. Vanaf nu stel je de maat per ring in.

### Wat er verandert
- Tik een ring aan en knijp om hem groter of kleiner te maken. De hintregel bovenin zegt dat ook zodra er een ring gekozen is. Tik naast de ring en knijpen zoomt weer gewoon.
- De maat zit vast aan de foto. Zoom je in, dan groeit de ring mee, want hij hoort bij dat stukje van de foto.
- De lijn van de ring en het nummerbolletje blijven wel even groot op het scherm. Anders wordt de lijn bij inzoomen een dikke worst die verbergt wat je wilt zien.
- Het bolletje zit nu op de lijn zelf, schuin rechtsboven, in plaats van op een vast aantal pixels van de hoek. Dat blijft kloppen bij elke maat.
- Kleinste ring is een middellijn van 2,4 procent, grootste is 90 procent.
- Aantikken houdt rekening met de eigen maat van elke ring, met een ondergrens zodat een kleine ring aantikbaar blijft. Liggen er ringen over elkaar, dan wint de dichtstbijzijnde.
- Ringen van voor deze versie hebben geen maat opgeslagen en blijven precies zoals ze waren.
- Het punteroverzicht tekent dezelfde maten als de editor.
- Geen SQL. De markeringen staan in een jsonb-kolom, dus het veld mag er zonder migratie bij.

## v0.1.0 — De eerste versie
Een losse app voor de opleverlijst op locatie. Naast Schilders Calc en Taken, in dezelfde repo en hetzelfde Supabase-project, maar met eigen tabellen en een eigen opslagbak. Geen koppeling met Taken, geen koppeling met een calculatie. Dat is een bewust besluit van 22 augustus 2026.

### Wat de app doet
- Een lijst per project. Klantgegevens tik je zelf in: project, klant, adres, postcode, plaats en een notitie. Niets wordt ergens vandaan gehaald.
- Twee statussen met het bekende gekleurde bolletje: lopend (oranje) en afgerond (groen). Afgeronde lijsten verdwijnen uit het hoofdscherm en staan onder de regel *toon afgeronde*. Niets wordt weggegooid.
- Per lijst een reeks punten. Elk punt is een foto, een omschrijving en een vinkje. Iedereen die is ingelogd mag afvinken, er staat geen naam bij een punt.
- Een voortgangsbalk in de kop: 3 van 7 klaar.

### De foto met ringen
- Op elke foto kun je open ringen zetten. Open, dus je ziet door het midden heen wat er aan de hand is. Eén kleur, genummerd 1, 2, 3, zodat de omschrijving naar een nummer kan verwijzen.
- Knijpen zoomt in, slepen schuift, tikken zet een ring. Tik een ring aan voor een notitie of om hem weg te halen.
- De posities worden bewaard als een fractie van nul tot een van de fotomaat, dezelfde rekenwijze als de foto-markeringen in Schilders Calc. Daardoor staat een ring op elk scherm op de goede plek.
- De foto is optioneel. Een punt zonder foto mag, voor dingen als *sleutel nalopen*.
- Foto's worden voor het uploaden verkleind naar hoogstens 1600 px, JPEG kwaliteit 0,8. Ongeveer 300 KB per stuk.

### Onder de motorkap
- Twee nieuwe tabellen: `opleveringen` en `oplever_punten`. Een nieuwe besloten opslagbak: `oplever-fotos`. Aan te leggen met `sql/oplever_tabellen.sql`.
- Bij het verwijderen van een oplevering wordt eerst de fotomap in Storage leeggeruimd en pas daarna de rij, zodat er geen bestanden achterblijven zonder eigenaar. Dezelfde volgorde als bij calculatiefoto's.
- Elke databaseaanroep loopt langs één functie die de werkelijke Supabase-fout in beeld brengt in plaats van een algemeen *mislukt*. Dat is het openstaande verbeterpunt uit Schilders Calc v3.9.5, hier meteen goed gedaan.
- Afvinken draait zichzelf terug als de database het weigert, dus het scherm liegt niet.

### Wat er nog niet is
- Geen PDF-export. Richting de klant gaat het lijstje via Yoobi.
- Geen offline werken. Zonder bereik lukt het uploaden van een foto niet. Dat is bekend en aanvaard.
- Geen volgorde verslepen van punten.
