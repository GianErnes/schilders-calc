-- =====================================================================
-- schema_sleutelscan.sql
-- Project: schilders-calc
-- Gemaakt: 27 juli 2026
-- Hoort bij: opruimlijst punt 15, stap 0
--
-- WAT DIT DOET
-- Doorzoekt alles wat straks in de schemadump terechtkomt op sleutels
-- en wachtwoorden die er letterlijk in staan. Doorzocht worden de
-- databasefuncties, de cronjobs, de policies, de views, de triggers en
-- de kolomstandaarden.
--
-- DIT BESTAND LEEST ALLEEN. Het verandert niets en het kan zonder
-- gevolgen twee keer gedraaid worden.
--
-- DE UITKOMST TOONT NOOIT DE GEVONDEN WAARDE.
-- Alleen waar hij zit en waarom hij verdacht is. Anders zou de uitkomst
-- van de scan zelf het lek zijn dat hij moet voorkomen.
--
-- LET OP BIJ schilder-voorraad
-- Daar staat pg_cron niet aan. Verwijder dan het blok met het label
-- cronjob, anders breekt de query af op cron.job.
-- =====================================================================

with patronen(patroon, omschrijving, oordeel) as (
  values
    ($p$eyJ[A-Za-z0-9_-]{10,}$p$,
     'JWT-achtige sleutel, lijkt op een Supabase anon- of servicesleutel',
     'NAKIJKEN'),

    ($p$sk-ant-[A-Za-z0-9_-]{10,}$p$,
     'Anthropic-sleutel',
     'NAKIJKEN'),

    ($p$re_[A-Za-z0-9]{16,}$p$,
     'Resend-sleutel',
     'NAKIJKEN'),

    ($p$bearer[[:space:]]+[A-Za-z0-9._-]{12,}$p$,
     'Authorization Bearer met een waarde erachter',
     'NAKIJKEN'),

    ($p$x-(aftap|opvolg)-key[^,)]{0,40}'[^']{6,}'$p$,
     'eigen sleutelheader met een waarde erin',
     'NAKIJKEN'),

    ($p$(password|passwd|wachtwoord)[[:space:]]*[:=][[:space:]]*'[^']+'$p$,
     'wachtwoord letterlijk in de tekst',
     'NAKIJKEN'),

    ($p$apikey[^,)]{0,40}'[^']{6,}'$p$,
     'apikey met een waarde erin',
     'NAKIJKEN'),

    ($p$client_secret[^,)]{0,40}'[^']{6,}'$p$,
     'OAuth-inloggegevens met een waarde erin',
     'NAKIJKEN'),

    ($p$service_role$p$,
     'noemt de servicesleutel, kijken of de waarde er ook staat',
     'NAKIJKEN'),

    ($p$decrypted_secrets$p$,
     'leest ontsleutelde kluiswaarden, hoort zo maar wel bewust',
     'VERWACHT'),

    ($p$[a-z]{20}\.supabase\.co$p$,
     'projectadres staat hard in de tekst, moet mee bij een herbouw',
     'AANPASSEN BIJ HERBOUW')
),

-- ---------------------------------------------------------------------
-- Alles wat straks in de dump komt, op een hoop
-- ---------------------------------------------------------------------
bronnen(soort, naam, inhoud) as (

  -- databasefuncties in public, zonder die van extensies
  select 'databasefunctie'::text,
         p.proname::text,
         pg_get_functiondef(p.oid)::text
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prokind in ('f', 'p')
    and not exists (
      select 1 from pg_depend d
      where d.objid = p.oid and d.deptype = 'e'
    )

  union all

  -- cronjobs
  select 'cronjob'::text,
         coalesce(j.jobname, 'job ' || j.jobid::text)::text,
         j.command::text
  from cron.job j

  union all

  -- policies, zowel de using- als de with check-voorwaarde
  select 'policy'::text,
         (c.relname || ' / ' || pol.polname)::text,
         (coalesce(pg_get_expr(pol.polqual, pol.polrelid), '') || ' ' ||
          coalesce(pg_get_expr(pol.polwithcheck, pol.polrelid), ''))::text
  from pg_policy pol
  join pg_class c on c.oid = pol.polrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in ('public', 'storage')

  union all

  -- views en gematerialiseerde views
  select 'view'::text,
         c.relname::text,
         pg_get_viewdef(c.oid)::text
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('v', 'm')

  union all

  -- triggers, zonder de interne
  select 'trigger'::text,
         (c.relname || ' / ' || t.tgname)::text,
         pg_get_triggerdef(t.oid)::text
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and not t.tgisinternal

  union all

  -- kolomstandaarden
  select 'kolomstandaard'::text,
         (c.relname || '.' || a.attname)::text,
         pg_get_expr(ad.adbin, ad.adrelid)::text
  from pg_attrdef ad
  join pg_class c on c.oid = ad.adrelid
  join pg_namespace n on n.oid = c.relnamespace
  join pg_attribute a on a.attrelid = ad.adrelid and a.attnum = ad.adnum
  where n.nspname = 'public'
),

-- ---------------------------------------------------------------------
-- De treffers. De gevonden waarde wordt bewust niet meegegeven.
-- ---------------------------------------------------------------------
treffers as (
  select b.soort, b.naam, p.omschrijving, p.oordeel
  from bronnen b
  join patronen p on b.inhoud ~* p.patroon
),

-- ---------------------------------------------------------------------
-- Tellingen, zodat een schone uitslag niet komt doordat er niets
-- doorzocht is. Dat is de gevaarlijkste vorm van geen treffers.
-- ---------------------------------------------------------------------
tellingen as (
  select b.soort, count(*)::text as aantal
  from bronnen b
  group by b.soort
)

select 1 as sortering,
       'DOORZOCHT'::text  as blok,
       t.soort            as soort,
       t.aantal           as naam,
       ''::text           as omschrijving,
       ''::text           as oordeel
from tellingen t

union all

select 2,
       'TREFFER',
       t.soort,
       t.naam,
       t.omschrijving,
       t.oordeel
from treffers t

union all

select 3,
       'UITSLAG',
       case when exists (select 1 from treffers where oordeel = 'NAKIJKEN')
            then 'ER STAAT MOGELIJK EEN SLEUTEL IN'
            else 'GEEN SLEUTELS GEVONDEN'
       end,
       '', '', ''

order by 1, 3, 4;
