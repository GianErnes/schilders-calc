# Changelog Oplevering

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
