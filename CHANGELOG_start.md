# CHANGELOG — start.html

Startpagina voor de iMac: één tegel per app met het live versienummer en een
synchroon-check tegen de changelog, drie ochtendtellers na inloggen, en het
systeemstatus-blok "Achter de schermen" (opruimpunt 5 uit SYSTEEM.md).
Hoort bij `sql/start_01_systeem_status.sql`.

## v0.2.1 — Taken-teller telt zoals taken.html (09-09-2026)

- De teller volgde alleen `toegewezen_aan` en miste daardoor Yoobi-taken
  (die lopen via `username` → persoon uit `taken_rollen.yoobi_naam`). Nu
  dezelfde regels als "Vandaag" in taken.html v0.18.0: op mijn naam en vandaag
  gepland tenzij vandaag weggezet, plus wat via `taak_dagkeuze` naar Vandaag is
  gehaald. Achterstand ("Op de rol") apart geteld en rood.
- Teller telt voor de ingelogde persoon; als `administratie` zie je dus niet
  gian's taken.

## v0.2.0 — Achter de schermen (09-09-2026)

- Blok onder de tegels, alleen voor rol `alles`, via databasefunctie
  `systeem_status()` (security definer; de browser mag niet bij `cron.*` en
  `storage.objects`). Bovenaan het echte bewijs: backupbestand in bak `backups`
  (`updated_at`, grootte), `fin_dashboard.bijgewerkt_op`, laatste geslaagde
  `yoobi_sync_log`. Daaronder alle cronjobs uit `cron.job` met laatste
  succeeded-run en drempel per job; bij `net.http_post`-jobs staat er bewust
  "verzoek verstuurd", niet "gelukt". Drempels uit SYSTEEM.md §3.4.
- Bolletje in de tabbladtitel bij rood of oranje.
- `sync_state` bewust buiten het scherm gelaten tot bekend is welke functie
  hem schrijft (stond 09-09-2026 op `fase = 'mislukt'`).

## v0.1.1 — Alles opent in een nieuw venster (09-09-2026)

## v0.1.0 — Eerste versie (09-09-2026)

- Acht tegels: Calculatie, Planning, Taken, Financieel, Oplevering, Klanten,
  Personeel, Voorraad (eigen repo `voorraad-app`, via de doorstuurpagina).
- Per tegel `APP_VERSION` live uit het bestand; bovenste entry uit de
  changelog ernaast: groen gelijk, oranje achter (tegel krijgt oranje rand),
  grijs "geen changelog" bij Taken. Voorraad vergelijkt met de banner bovenin.
- Voorraad-badge "N laag" / "op peil" via de publieke sleutel van de
  voorraad-app.
- Na inloggen (eigen `storageKey: sb-start-auth`): taken voor vandaag,
  lopende ziekmeldingen en certificaten binnen de termijn (die twee alleen met
  `ziet_personeel`).
