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
| `audit_query_periodiek.sql` | Eens per kwartaal: check RLS-status en anon-grants |
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
Rode vlaggen die direct aandacht vragen:
- Een tabel met RLS UIT
- Een tabel waar `anon` weer grants heeft
- Een tabel met RLS AAN maar zonder policies (= app kan er niet bij)
