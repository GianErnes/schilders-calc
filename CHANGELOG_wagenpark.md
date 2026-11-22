# CHANGELOG — wagenpark.html

Beheer van de vier eigen bussen, als pagina in de suite. Leest en schrijft
de vijf `wp_`-tabellen en de bak `wagenpark`. De taken in de Takenapp en de
kilometerstand van de bus regelt de database zelf
(`sql/wagenpark_01_tabellen.sql` en `sql/wagenpark_02_incident_taak_km.sql`).

## v0.1.0 — Eerste versie: stap 1 (22-11-2026)

- **Eerste scherm.** De bus die op jouw naam staat (vaste rijder) bovenaan, met twee grote knoppen: *Incident melden* en *Aandachtspunt noteren*. De andere bussen eronder. Bussen die uit gebruik zijn staan ingeklapt onderaan.
- **Voertuigkaart** met vier tabbladen: Logboek, Aandachtspunten, Termijnen, Gegevens. Het kenteken staat als gele plaat in beeld.
- **Incident melden.** Soort, omschrijving, datum, kilometerstand en foto's. De database maakt de taak voor Gian. Lukt dat niet, dan zegt de pagina dat tegen de melder. Een open incident zonder taak krijgt het label "zonder taak".
- **Incident afhandelen en weer openzetten: alleen Gian** (besluit 22-11-2026). De pagina verbergt de knoppen voor de anderen; de database staat het iedereen toe (keuze A van 21-11-2026). De pagina schrijft alleen `status`; de database vinkt de taak af.
- **Verwijderen van een logboekregel of bijlage: alleen Gian** (keuze van de bouwer, door Gian te bevestigen). Eerst de bestanden uit de bak, dan de regel.
- **Onderhoud of reparatie invoeren** met garage, bedrag, kilometerstand en factuur of foto. De open aandachtspunten van de bus staan erbij met vinkjes; wat je aanvinkt is afgehandeld in die beurt. Een punt kan ook los vervallen en weer teruggezet worden.
- **Kilometerstand.** De database zet de bus bij als een logboekregel een hogere stand heeft; de pagina leest daarna opnieuw. Bij een stand die meer dan 20.000 km boven de bus ligt vraagt de pagina eerst of het klopt. Op het tabblad Gegevens is de stand direct te corrigeren, ook naar beneden.
- **Termijnen** (APK, onderhoudsbeurt, verzekering, motorrijtuigenbelasting, overig) met vervaldatum, aantal dagen vooraf, herhaling en voor wie de taak is. Is de vervaldatum voorbij en de herhaler in de Takenapp doorgeschoven, dan toont de pagina de datum van de open taak plus de dagen vooraf als "geschat", met de knop *Nieuwe vervaldatum invullen*. Is de taak niet doorgeschoven, dan staat er "verlopen". Is de taak in de Takenapp verwijderd, dan staat er "geen taak".
- **Geen automatische termijnen bij een nieuwe bus.** Direct na het invoeren vraagt de pagina om de APK-vervaldatum en hoe vaak die terugkomt; "Later invullen" kan. Er is bewust geen standaard voor de herhaling: hoe vaak de APK terugkomt hangt af van brandstof en leeftijd (opgezocht 22-11-2026 bij ANWB en Autoreview, niet bij de RDW zelf).
- **Bijlagen** in de besloten bak `wagenpark`, pad `<voertuig>/<logboekregel>/<tijdstempel>_<naam>`, maximaal 25 MB. Een foto wordt verkleind (langste zijde 1600 px, JPEG 0,8, overgenomen uit `oplevering.html`); een factuur niet. Openen gaat met een ondertekende link van vijf minuten.
- **Bus uit gebruik nemen** in plaats van verwijderen. Een bus met logboek is in de database niet te verwijderen.
- **Inloggen** met hetzelfde account als de andere pagina's, met een eigen sessie (`sb-wagenpark-auth`, zoals Taken, Oplevering en Personeel elk hun eigen sessie hebben). Wie geen rij in `taken_rollen` heeft krijgt een melding en geen inhoud.
- **Eigen icoon voor het beginscherm:** `apple-touch-icon-wagenpark.png`.
- Foutmeldingen tonen de werkelijke fout uit Supabase.

**Getest (22-11-2026).**
- Pure functies, gesneden uit het bestand: 16 groepen goed (`test_puur.js`).
- De hele pagina in jsdom tegen een nagebootste database met de echte kolomnamen en regels: 9 scenario's goed (`test_pagina.js`, `nepdb.js`). Drie opzettelijk ingebouwde fouten werden gevangen.
- In Chromium op telefoonbreedte (390 px): geen scriptfouten, geen zijwaarts schuiven, een foto van 4000 bij 3000 werd door de echte browser verkleind naar JPEG.
- **Niet getest:** tegen de echte database, op een echte iPhone, door een mens. Dat is het testplan in echt gebruik.

**Bekende grenzen.**
- Een incident zonder taak dat weer op open gaat krijgt geen nieuwe taak (database). De pagina toont "zonder taak".
- Onderhoud op kilometerstand kan niet automatisch: de Takenapp kent alleen datums.
- De streepjes in het kenteken zijn alleen weergave. Zes tekens die in drie groepen vallen krijgen streepjes; anders blijft staan wat is ingetikt.
- De pagina ververst bij openen, na elke handeling, bij terugkomen in beeld en met de knop Verversen. Niet vanzelf terwijl hij openstaat.
- Banden, vloeistoffen, documenten, sleutels en tankpas horen bij stap 2.
