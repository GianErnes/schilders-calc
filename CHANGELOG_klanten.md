# CHANGELOG klanten.html

## v0.3.0 — Sync nu, voortgang, inhoud van de kopie (09-09-2026)

- Knop **Sync nu** start een run van `yoobi-backup-sync` v0.2.0 (estafette, brok 2b). De pagina volgt de run elke 3 seconden via `yoobi_sync_log.cursor`: fase, stap, voortgang, aantallen per fase, fouten. Bij herladen van de pagina wordt een lopende run automatisch weer gevolgd.
- Kaart **Inhoud van de kopie**: aantallen klanten, contactpersonen, projecten, orders en projectinzichten (verdwenen records niet meegeteld).
- Sessie wordt vóór elke functie-aanroep verversd als het token binnen 5 minuten verloopt (oorzaak van de 401 van 09-09-2026).
- Logboek toont bij runs nu ook aantal stappen en voortgang; lopende run krijgt ⏳.

## v0.2.1 — Veldonderzoek ronde 2: detail-endpoints (09-09-2026)

- De knop Veldonderzoek haalt nu ook de detail-endpoints op met codes uit de eerste klant en het eerste project: customer, project, projectInsight, projectrates, infoOrder en projectAllCodes. crmContact is weggelaten (Yoobi geeft daar een HTTP 500 uit eigen fout, testpunt T3).

## v0.2.0 — Knop Veldonderzoek → klembord (09-09-2026)

- Nieuwe knop naast Verkennen: haalt achter elkaar customers, contacts, crmContact en projects (pagina 1) op en zet per endpoint statuscodes, aantallen, metadata, alle veldnamen en het eerste record als tekst op het klembord. Bedoeld om in het gesprek te plakken; vervangt schermafbeeldingen van uitgeklapte lijsten.
- Aanroep van de functie in één gedeelde routine (`roepFunctie`).

## v0.1.0 — Eerste versie: inloggen, toegang, Verkennen, logboek (09-09-2026)

Onderdeel van de Yoobi-backup (ontwerp: `Ontwerp_Yoobi_backup.md`), brok 3, eerste stap.

- Inloggen met het Schilders Calc account, zelfde patroon als `financieel.html`.
- Toegangscontrole: alleen accounts in `yoobi_toegang` zien de inhoud; anderen krijgen een nette melding.
- Blok **Verkennen**: roept de Edge Function `yoobi-backup-sync` (v0.1.0) aan in verkenmodus met de ingelogde sessie, en toont statuscode, aantal rijen, metadata, alle veldnamen en de ruwe Yoobi-response. Vervangt het testen via de browserconsole.
- Blok **Logboek**: laatste 10 regels uit `yoobi_sync_log`.
- Syncstand in de kop: nog geen sync / stand / oranje bij mislukte laatste run.
- Nog niet: zoeken, klantkaart, projecten, storingsnotities (volgende versies van brok 3 en brok 4).
