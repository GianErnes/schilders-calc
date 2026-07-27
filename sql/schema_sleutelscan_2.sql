-- =====================================================================
-- schema_sleutelscan_2.sql
-- Project: schilders-calc
-- Gemaakt: 27 juli 2026
-- Hoort bij: opruimlijst punt 15, stap 0b
--
-- WAT DIT DOET
-- Scan 1 vond vijf plekken die nagekeken moeten worden. Die kon niet
-- zien of er een sleutel staat of alleen de opdracht om er een uit de
-- kluis te halen. Deze scan meet dat wel.
--
-- HOE
-- Een sleutel is een lange lap tekst tussen aanhalingstekens die geen
-- webadres is. Een rolnaam of een headernaam is kort. Deze scan meet
-- per object de langste tekstwaarde en telt hoeveel er lang zijn.
--
-- DIT BESTAND LEEST ALLEEN en TOONT NOOIT DE WAARDE ZELF.
-- Alleen lengtes en aantallen. Daarmee is de uitkomst veilig te delen.
--
-- LET OP BIJ schilder-voorraad
-- Verwijder het blok met het label cronjob, want daar staat pg_cron uit.
-- =====================================================================

with bronnen(soort, naam, inhoud) as (

  select 'databasefunctie'::text, p.proname::text, pg_get_functiondef(p.oid)::text
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prokind in ('f', 'p')
    and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')

  union all

  select 'cronjob'::text, coalesce(j.jobname, 'job ' || j.jobid::text)::text, j.command::text
  from cron.job j

  union all

  select 'policy'::text,
         (c.relname || ' / ' || pol.polname)::text,
         (coalesce(pg_get_expr(pol.polqual, pol.polrelid), '') || ' ' ||
          coalesce(pg_get_expr(pol.polwithcheck, pol.polrelid), ''))::text
  from pg_policy pol
  join pg_class c on c.oid = pol.polrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in ('public', 'storage')

  union all

  select 'trigger'::text,
         (c.relname || ' / ' || t.tgname)::text,
         pg_get_triggerdef(t.oid)::text
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and not t.tgisinternal

  union all

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
-- Elke tekstwaarde tussen aanhalingstekens, los uit elkaar getrokken.
-- De waarde zelf gaat hierna nergens meer heen, alleen de lengte.
-- ---------------------------------------------------------------------
waarden as (
  select b.soort,
         b.naam,
         length(m[1]) - 2                                as lengte,
         (m[1] ~* $q$^'https?://$q$)                     as is_webadres
  from bronnen b
  cross join lateral regexp_matches(b.inhoud, $q$'[^']*'$q$, 'g') m
),

metingen as (
  select w.soort,
         w.naam,
         coalesce(max(w.lengte) filter (where not w.is_webadres), 0)          as langste_tekst,
         count(*) filter (where not w.is_webadres and w.lengte >= 20)         as aantal_lang,
         count(*) filter (where w.is_webadres)                                as aantal_webadressen
  from waarden w
  group by w.soort, w.naam
),

kluislezers as (
  select b.soort, b.naam
  from bronnen b
  where b.inhoud ~* 'decrypted_secrets'
)

-- ---------------------------------------------------------------------
-- Blok 1: de vijf plekken uit scan 1, met een oordeel
-- ---------------------------------------------------------------------
select 1 as sortering,
       'UIT SCAN 1'::text as blok,
       m.soort,
       m.naam,
       m.langste_tekst,
       m.aantal_lang,
       case
         when m.aantal_lang = 0 and k.naam is not null
           then 'SCHOON, haalt uit de kluis'
         when m.aantal_lang = 0
           then 'SCHOON, geen lange tekstwaarde'
         else 'LANGE TEKSTWAARDE GEVONDEN, met de hand bekijken'
       end::text as oordeel
from metingen m
left join kluislezers k on k.soort = m.soort and k.naam = m.naam
where m.naam in (
  'backup-nachtelijk',
  'offerte-opvolging-werkdagen',
  'taken-mail-melding',
  'werkvoorraad-sync-wekelijks',
  'taken_bescherm_eigen'
)

union all

-- ---------------------------------------------------------------------
-- Blok 2: elk ander object waar dan ook met een lange tekstwaarde
-- ---------------------------------------------------------------------
select 2,
       'ELDERS',
       m.soort,
       m.naam,
       m.langste_tekst,
       m.aantal_lang,
       'lange tekstwaarde, met de hand bekijken'::text
from metingen m
where m.aantal_lang > 0
  and m.naam not in (
    'backup-nachtelijk',
    'offerte-opvolging-werkdagen',
    'taken-mail-melding',
    'werkvoorraad-sync-wekelijks',
    'taken_bescherm_eigen'
  )

union all

-- ---------------------------------------------------------------------
-- Blok 3: de eindstand
-- ---------------------------------------------------------------------
select 3,
       'UITSLAG',
       case
         when exists (select 1 from metingen where aantal_lang > 0)
           then 'ER STAAT ERGENS EEN LANGE TEKSTWAARDE'
         else 'NERGENS EEN LANGE TEKSTWAARDE, DE DUMP WORDT SCHOON'
       end,
       '', 0, 0, ''

order by 1, 5 desc, 3, 4;
