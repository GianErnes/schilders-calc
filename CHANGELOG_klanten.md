# CHANGELOG klanten.html

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
