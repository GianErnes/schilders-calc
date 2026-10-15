# CHANGELOG kaart.html

## v0.1.1 — Controle op PDOK-resultaten (15-10-2026)

Aanleiding: Gian klikte op een pin "Simpelveld" naast Eindhoven. Meting in `yoobi_klant_geo` (query van Gian): 31 pins waarvan de PDOK-weergavenaam niet bij de Yoobi-plaats paste; 18 daarvan stonden echt verkeerd. Oorzaak: bij een niet-bestaande postcode geeft de PDOK-zoekfunctie het eerstbeste adres elders terug (de vier cijfers van de postcode als huisnummer, of dezelfde letters in een andere stad), en v0.1.0 nam dat blind over.

- Elk PDOK-resultaat wordt getoetst aan het Yoobi-adres: huisnummer moet gelijk zijn; met postcode moet de postcode gelijk zijn (of straat én plaats); zonder postcode moet de straat gelijk zijn. Kerkdorp-verschillen (Klimmen/Voerendaal, Eys/Trintelen) en spelfouten in de plaats blijven geaccepteerd.
- Haalt het postcode-resultaat de toets niet, dan tweede poging op straat + huisnummer + plaats. Haalt ook die het niet: geen pin, status "PDOK vond ander adres (reden): …" in de lijst, zodat de fout in Yoobi te vinden is.
- Postbusadressen en adressen zonder huisnummer worden niet opgezocht (status in de lijst).
- Eerder opgeslagen pins worden bij het laden met dezelfde toets nagekeken; afgekeurde pins verdwijnen van de kaart en komen terug in de lijst "te doen" met de reden.
- Getest op de 31 gemeten regels: 31 van 31 juist beoordeeld (`node`).

## v0.1.0 — Eerste versie: klantenkaart Zuid-Limburg (15-10-2026)

Doel: zien waar de klanten zitten om het campagnegebied te bepalen (Google Ads, folders, wintercampagne). Intern, alleen na inloggen.

- Inloggen met het Schilders Calc account; inhoud alleen voor accounts in `yoobi_toegang` (zelfde route als `klanten.html`).
- Kaart (Leaflet 1.9.4, markercluster 1.5.3 via jsdelivr) met PDOK BRT-Achtergrondkaart; bij drie of meer tegelfouten automatisch OpenStreetMap met een zichtbare melding. Start op Heerlen.
- Marker per klant met coördinaten, geclusterd bij uitzoomen. Klik: naam, adres, klanttype (particulier/zakelijk, op basis van de Yoobi-categorie), datum laatste project.
- "Laatste project" = jongste `einddatum` (anders `startdatum`) van de projecten van de klant. Dat zijn contractdata uit Yoobi, geen uitvoerdata.
- Filters: periode laatste project (2/5/10 jaar, alles), klanttype, plaats; schakelaar "Ook prospects tonen" (standaard uit). Leveranciers nooit op de kaart. Plaatsnamen worden voor telling en filter gelijkgetrokken (HEERLEN = Heerlen); de Yoobi-data blijft onaangeraakt.
- Rechts een telling per plaats binnen de filters; klik zoomt naar die plaats.
- Blok "Adressen zonder coördinaten": geocoderen alleen op knopdruk via de PDOK Locatieserver (zelfde aanroep als in de calculatie-app), één adres per 150 ms, resultaat in de nieuwe tabel `yoobi_klant_geo`. Huisnummer uit het adresveld; bij een reeks (83-139) het eerste nummer. Buitenlandse adressen (land ≠ NL of geen Nederlandse postcode) worden overgeslagen. Een gewijzigd adres in Yoobi wordt herkend aan `adres_hash` en komt weer in de lijst.
- Nieuwe tabel `yoobi_klant_geo` (`kaart_01_klant_geo.sql`): RLS via `yoobi_mag_lezen()`, los van de Yoobi-sync.
