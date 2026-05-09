# Schilders Calculatie — Changelog

## v3.7.4 — Arbeidskost per eenheid zichtbaar
- Calc-stap-regel: na `X min` nu ook `· € X,XX/eenheid` voor arbeidskost, in dezelfde grijze monospace-strook.
- Verfsysteem-modal: onder de MIN-cel een tweede regel met `€ X,XX/eenheid` voor arbeid (zelfde patroon als eenheid onder bewerkingsnaam).
- Sluitstuk van transparantie-reeks (v3.7.2 / v3.7.3 / v3.7.4): elke regel is nu volledig narekenbaar — arbeid + materiaal = totaal.

## v3.7.3 — Verfsysteem-modal transparanter
- Verfsysteem-bewerkingen modal toont nu ook €/eenheid achter het verbruik: bv. `0,005 L · € 0,07/m²`. Consistent met de calc-stap-regel uit v3.7.2.
- Kolom-totaal (€/eenh) gelabeld met `/m²` of `/m¹` voor duidelijkheid.
- Stap-totaal nu op verkoopprijs-basis (`cs.matVerkoop` i.p.v. `cs.matInkoop`), consistent met v3.7.2 en met het uurloon.
- Doel: tijdens het tunen van een verfsysteem direct zien wat materiaalkosten per stap zijn — zonder via een calculatie te hoeven gaan.

## v3.7.2 — Stap-regel transparanter
- Materiaal-haakjes tonen nu ook verkoopprijs per eenheid: bv. `Verfreiniger (0,006 L · € 0,25/m²)`. Inkoop × verbruik × percentage × (1 + groepsopslag).
- Stap-totaal rechts (`€ X,XX`) is voortaan gelabeld met `/m²` of `/m¹` zodat duidelijk is dat het per eenheid is, niet voor de hele regel.
- Stap-totaal nu op verkoopprijs-basis (`cs.matVerkoop` i.p.v. `cs.matInkoop`), consistent met het uurloon dat ook verkoop is. Voorheen was dit een mix van inkoop-materiaal + verkoop-arbeid, wiskundig inconsistent.
- Doel: in één oogopslag afwijkingen in materiaalverbruik tussen verfsystemen kunnen zien voor diagnostiek.

## v3.7.1 — Status-render fix
- Bug verholpen: status-wijziging in dashboard of vergrendel-banner werd pas na verversen zichtbaar.
- Oorzaak: `setCalcStatus` riep een niet-bestaande `renderCalc()` aan; vervangen door `renderCalcStructuur()`.

## v3.7.0 — Calculatie-vergrendeling
- Status-veld per calculatie: `concept` | `gereed` | `verzonden` | `geaccepteerd` | `verloren`.
- Niet-concept = vergrendeld: velden read-only via `is-locked` CSS-klasse, banner bovenaan met "Naar concept"-knop.
- Settings-snapshot bij vergrendelen: `data.settings` wordt diep gekopieerd naar `calc.settingsSnapshot` (kolom `settings_snapshot`). Rekenmodel pakt snapshot via `_activeSettings()` / `_S()`.
- Terug naar concept gooit snapshot weg → calc rekent weer met live tarieven.
- Status-dropdown met kleurcodes in dashboard-archief.
- Print-knoppen blijven werken bij vergrendeling via `lock-allowed` klasse.

## v3.6.x — Tussenversies (detailhistorie verloren)
Tussen v3.5.1 en v3.7.0 zijn meerdere kleinere wijzigingen doorgevoerd waarvan de
exacte versienummering niet meer reconstrueerbaar is. Op basis van code-inspectie
bevat deze reeks in elk geval:
- **Notities & taken paneel** — inklapbaar paneel boven calc-structuur, met samenvattings-balk (open taken / notitie-indicator). Collapse-state per calc onthouden in geheugen.
- **Werkbon printen** — aparte print-functie naast offerte. Alleen werkgegevens (regels, hoeveelheden, bewerkingen, %), geen prijzen. Bedoeld voor de schilders op de werkvloer.
- **Actieve calculatie persistent** — `activeCalcId` in localStorage zodat je na refresh of nieuwe sessie in dezelfde calc verder gaat.
- **Dashboard-archief uitgebreid** — klant-naam zichtbaar onder calc-naam, "● actief"-markering op huidige calc, dupliceer-knop (`⎘`) per rij, totaal incl. BTW per calc.
- Diverse kleinere UI-verfijningen (`btn-sm`, `btn-icon`, `empty-state`, `table-scroll` CSS-klassen).

## v3.5.1 (cleanup)
- Dood code verwijderd (`_bodyLS`/`_saveBody`/`_delBodyLS` stubs, `_origSaveData`, oude incode-constanten).
- Geen functionele wijziging.

## v3.5.0 — Security-pass
- Incode-login vervangen door echte Supabase Auth (e-mail + wachtwoord).
- `persistSession: true`, `autoRefreshToken: true` — sessie blijft actief, geen tokendans tijdens werken.
- Logout-knop in Settings → Data Beheer.
- RLS-policies omgezet van `to anon` naar `to authenticated` op alle 15 tabellen.

## v3.4.3 — Calculatie-importer
- Eenmalige import van v2.4.1-calculaties (incl. hg → od → regels → stappen → todo's → staart → meetstaat).
- Snapshots blijven 1-op-1 bewaard; ondergrond-koppeling op naam-match.
- Bewerking-IDs en materiaal-IDs in stappen worden bewust NULL (snapshot-pattern).

## v3.4.2 — Fase 3d.3 (slot)
- Meetstaat, todo's en staartkosten per calculatie naar Supabase.
- localStorage body-storage volledig uitgefaseerd.
- Dupliceren van een calc kopieert nu ook todo's, staart en meetstaat (met regel-id remapping).

## v3.4.1 — Fase 3d.2
- Calc-regels en hun snapshot-stappen naar Supabase (FK ON DELETE CASCADE).
- Snapshot-architectuur intact: bewerking-/materiaal-data bevroren in `calc_regels` en `calc_regel_stappen`.
- Granulaire CRUD per actie (geen full-replace bij elke wijziging).

## v3.4.0 — Fase 3d.1
- Calculaties, hoofdgroepen en onderdelen naar Supabase.
- Lazy loading: alleen calc-headers bij start, body bij activate.
- `_touchCalc()`-helper voor `gewijzigd`-tijdstempel.

## v3.3.4 — Bibliotheek-importer
- Eenmalige import van v2.4.1-bibliotheek (materialen, ondergronden, bewerkingen, templates, verfsystemen + stappen).
- UUID-mapping voor alle FK's bij import.

## v3.3.3 — Fase 3c.4
- Verfsystemen + verfsysteem-stappen naar Supabase.
- Full-replace strategie voor stappen bij wijziging.
- FK ON DELETE CASCADE voor stappen via SQL.

## v3.3.2 — Fase 3c.3
- Staart-templates (staart_lib) naar Supabase.
- DB-schema gefixt (kolom `detail` → `eenheid`/`grondslag`/`hoeveelheid`).
- CHECK-constraint op `type` aangepast aan JS-waarden.

## v3.3.1 — Fase 3c.2
- Bewerkingen naar Supabase met `volgorde`-veld voor handmatige sortering.

## v3.3.0 — Fase 3c.1
- Ondergronden naar Supabase met `volgorde`-veld.

## v3.2.0 — Incode-auth (tijdelijk)
- Supabase Auth uitgeschakeld vanwege trage token-refresh op werknetwerk.
- Hardcoded incode + localStorage flag als bouwfase-bescherming.
- RLS policies tijdelijk naar `to anon`.

## v3.1.x — Fase 3b
- Materialen schrijfbaar naar Supabase (CRUD).
- Defaults-fallback verwijderd; DB is bron van waarheid.
- Wachtwoord-login toegevoegd naast magic link (rate-limit issue).
- Timeout op DB-calls verhoogd naar 30s.

## v3.0.0 — Fase 3a
- Materialen READ uit Supabase.
- Magic-link auth.
- Eerste cloud-versie naast lokale v2.4.1.

## v2.4.1 (en eerder)
- Volledig lokale localStorage-versie. 9 jaar Cannonworks vervangen.
