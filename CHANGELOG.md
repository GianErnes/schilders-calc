# Schilders Calculatie — Changelog

## v3.8.2 — Pictogram-verbetering
- Dupliceer-pictogram ⎘ → ⧉ overal in de app (visueel duidelijker: twee overlappende vierkantjes = kopie).
- Doorgevoerd op: onderdeel-dupliceren, bewerking-dupliceren (bibliotheek), calculatie-dupliceren (dashboard).
- Knop bij onderdeel-dupliceren licht vergroot (font-size 1.1rem) voor extra leesbaarheid.

## v3.8.1 — UX-fix dupliceer-knop
- ⎘-knop voor onderdeel-dupliceren had te weinig contrast (grijs op grijs); nu blauw karakter, consistent met andere secundaire acties in de app.

## v3.8.0 — Onderdeel dupliceren
- Nieuwe ⎘-knop op elk onderdeel: dupliceert alle regels (incl. snapshot-stappen) naar één of meer andere onderdelen in dezelfde hoofdgroep.
- Modal met dubbele input: vink bestaande onderdelen aan én/of typ nieuwe namen (kommagescheiden) — die worden direct aangemaakt en gevuld.
- Hoeveelheden komen op 0 (m² per kamer verschilt). Meetstaat-rijen niet meegekopieerd (ruimte-specifiek).
- Geen overschrijven van bestaande regels in doelen — kopieën worden toegevoegd.

## v3.7.1 — Status-render fix
- Bug verholpen: status-wijziging in dashboard of vergrendel-banner werd pas na verversen zichtbaar.
- Oorzaak: `setCalcStatus` riep een niet-bestaande `renderCalc()` aan; vervangen door `renderCalcStructuur()`.

## v3.7.0 — Calculatie-vergrendeling
<!-- nog in te vullen -->

## v3.6.x
<!-- nog in te vullen -->

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
