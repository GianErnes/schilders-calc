# SQL-scripts Schilders Calc

Deze map bevat eenmalige migratiescripts en herbruikbare query's voor
de Supabase-database. De app zelf is een single-file `index.html` —
deze map is alleen voor DB-onderhoud.

## Eenmalige scripts (uitgevoerd, bewaard voor traceerbaarheid)

| Bestand | Wat | Wanneer uitgevoerd |
|---|---|---|
| `01_pre_check.sql` | Vóór-foto: grants per tabel + functie-config | 13 mei 2026 |
| `02_fix_set_updated_at.sql` | Vaste search_path op `set_updated_at` | 13 mei 2026 |
| `03_revoke_anon.sql` | Anon-grants ingetrokken op alle 16 tabellen | 13 mei 2026 |

Achtergrond: Supabase-aankondiging mei 2026 over Data API-defaults
(van kracht op alle bestaande projecten vanaf 30 oktober 2026). Bij
de audit kwamen ook andere zaken naar boven die meegenomen zijn —
zie CHANGELOG.md v3.9.5.

## Herbruikbare scripts

| Bestand | Wanneer gebruiken |
|---|---|
| `audit_query_periodiek.sql` | Eens per kwartaal: check RLS-status en anon-grants. Geeft alles in één resultaat |
| `template_nieuwe_tabel.sql` | Bij aanmaken nieuwe tabel — kopiëren en aanpassen |

## Het open model van Schilders Calc

Multi-user, iedereen ingelogd mag alles. Concreet:

- Rol `authenticated` heeft volledige rechten op alle tabellen.
- Rol `service_role` heeft volledige rechten (voor admin-taken).
- Rol `anon` heeft **geen** rechten — login is altijd vereist.
- Elke tabel heeft RLS aan met een policy `USING (true) WITH CHECK (true)`
  voor `authenticated`.

Bij nieuwe tabellen: volg `template_nieuwe_tabel.sql`. Zonder grants én
policies werkt de app niet meer met die tabel.

## Auditeren

Periodieke check: run `audit_query_periodiek.sql` in Supabase SQL Editor.
Sinds 27 juli 2026 geeft die alles in **één** resultaat. Daarvoor waren
het vier losse opdrachten, waarvan Supabase Studio er maar één toont, dus
werden drie van de vier controles gemeten zonder ze te laten zien.

Het resultaat staat in drie blokken, met de rode vlaggen bovenaan:

- **1. RODE VLAG** — hier moet je op reageren:
  - een tabel met RLS UIT
  - een tabel waar `anon` weer grants heeft
  - een tabel met RLS AAN maar zonder policies (= app kan er niet bij)
  
  Staat er alleen de regel *geen rode vlaggen gevonden*, dan is het goed.
  Die regel bestaat met opzet: een leeg resultaat lijkt te veel op een
  query die niet gelopen heeft.
- **2. bekend en goed** — `sync_state` en `taken_melding_sleutels` hebben
  RLS aan en nul policies. Dat is bewust: ze worden alleen door Edge
  Functions gevuld en die werken met de servicesleutel, dus die gaan langs
  de rijbeveiliging heen. **Zet er geen policy op om het te repareren.**
  Dan open je ze voor iedereen die is ingelogd
- **3. overzicht** — alle tabellen met hun stand, om doorheen te scrollen

Laatste schone controle: 27 juli 2026, 37 tabellen, geen enkele vlag.
