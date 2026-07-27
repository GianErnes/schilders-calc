-- =====================================================================
-- schema_sleutelscan_3.sql
-- Project: schilders-calc
-- Gemaakt: 27 juli 2026
-- Hoort bij: opruimlijst punt 15, stap 0c
--
-- WAT DIT DOET
-- Scan 1 zocht op patronen die ik bedacht heb. Scan 2 zocht op lengte
-- met een grens die ik gekozen heb. Allebei leunen ze op mijn aannames.
-- Deze derde kijkt naar de vorm van de tekst en gebruikt geen enkele
-- aanname uit de eerste twee.
--
-- HET IDEE
-- Een sleutel heeft geen spaties, geen apenstaartje, en bijna altijd
-- hoofdletters en kleine letters door elkaar. Een berichttekst heeft
-- spaties. Een baknaam of tabelnaam heeft alleen kleine letters.
--
-- DIT BESTAND LEEST ALLEEN en TOONT NOOIT DE WAARDE ZELF.
-- Alleen de vorm: lengte, wel of geen spatie, wel of geen hoofdletters.
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

waarden as (
  select b.soort,
         b.naam,
         btrim(m[1], '''')  as waarde
  from bronnen b
  cross join lateral regexp_matches(b.inhoud, $q$'[^']*'$q$, 'g') m
),

profiel as (
  select w.soort,
         w.naam,
         length(w.waarde)                as lengte,
         (w.waarde ~ '[[:space:]]')      as heeft_spatie,
         (w.waarde ~ '@')                as heeft_apenstaartje,
         (w.waarde ~ '[A-Z]')            as heeft_hoofdletter,
         (w.waarde ~ '[a-z]')            as heeft_kleine_letter,
         (w.waarde ~* '^https?://')      as is_webadres
  from waarden w
)

select 1 as sortering,
       p.soort,
       p.naam,
       p.lengte,
       case
         when p.is_webadres          then 'webadres'
         when p.heeft_spatie         then 'tekst met spaties, geen sleutel'
         when p.heeft_apenstaartje   then 'e-mailadres'
         when not p.heeft_hoofdletter then 'alleen kleine letters, lijkt een naam of code'
         when not p.heeft_kleine_letter then 'alleen hoofdletters, lijkt een constante'
         else 'NAKIJKEN, hoofd- en kleine letters door elkaar zonder spatie'
       end::text as vorm
from profiel p
where p.lengte >= 20

union all

select 2,
       'UITSLAG',
       case
         when exists (
           select 1 from profiel q
           where q.lengte >= 20
             and not q.is_webadres
             and not q.heeft_spatie
             and not q.heeft_apenstaartje
             and q.heeft_hoofdletter
             and q.heeft_kleine_letter
         )
         then 'ER STAAT IETS DAT DE VORM VAN EEN SLEUTEL HEEFT'
         else 'NIETS MET DE VORM VAN EEN SLEUTEL, DE DUMP WORDT SCHOON'
       end,
       0,
       ''

order by 1, 4 desc, 2, 3;
