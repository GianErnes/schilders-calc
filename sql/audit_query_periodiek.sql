-- ============================================================
-- AUDIT-QUERY, herhaalbaar. Draai eens per kwartaal.
--
-- Kijkt of er per ongeluk tabellen zonder rijbeveiliging zijn
-- ontstaan, of dat anon ergens rechten heeft gekregen.
--
-- Alles komt in EEN resultaat. Supabase Studio toont bij meerdere
-- losse opdrachten namelijk alleen de laatste, en dan meet je drie
-- van de vier dingen zonder ze te zien.
--
-- Leest alleen. Verandert niets.
--
-- HOE JE HET LEEST: bovenaan staan de rode vlaggen. Staat daar
-- "geen rode vlaggen gevonden", dan is het goed en hoef je de rest
-- niet te lezen.
-- ============================================================

with tabellen as (
  select
    t.tablename::text as tabel,
    c.relrowsecurity  as rls_aan,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = t.tablename) as policies,
    coalesce((select string_agg(privilege_type, ', ' order by privilege_type)
                from information_schema.role_table_grants
               where table_schema = 'public'
                 and table_name = t.tablename
                 and grantee = 'anon'), '') as anon
  from pg_tables t
  join pg_class c     on c.relname = t.tablename
  join pg_namespace n on n.oid = c.relnamespace and n.nspname = t.schemaname
  where t.schemaname = 'public'
),

-- de twee tabellen die met opzet geen policy hebben.
-- Ze worden alleen door Edge Functions gevuld en die werken met de
-- servicesleutel, dus die gaan langs de rijbeveiliging heen.
-- ZET ER GEEN POLICY OP om het te repareren. Zie SYSTEEM.md 3.4.
uitzonderingen as (
  select unnest(array['sync_state', 'taken_melding_sleutels']) as tabel
),

vlaggen as (
  select '1. RODE VLAG'::text as blok,
         'RIJBEVEILIGING UIT'::text as oordeel,
         tabel,
         'zet rijbeveiliging aan en maak een policy'::text as toelichting
  from tabellen where not rls_aan

  union all
  select '1. RODE VLAG', 'ANON HEEFT RECHTEN', tabel,
         'rechten: ' || anon
  from tabellen where anon <> ''

  union all
  select '1. RODE VLAG', 'AAN ZONDER POLICY', tabel,
         'de app kan hier niet bij'
  from tabellen
  where rls_aan and policies = 0
    and tabel not in (select tabel from uitzonderingen)
),

geen_vlaggen as (
  select '1. RODE VLAG'::text, 'geen rode vlaggen gevonden'::text,
         ''::text, 'de audit is gelopen en alles staat goed'::text
  where not exists (select 1 from vlaggen)
),

bekend as (
  select '2. bekend en goed'::text, 'aan zonder policy, met opzet'::text,
         t.tabel,
         'alleen gevuld door Edge Functions. Geen policy op zetten'::text
  from tabellen t
  join uitzonderingen u on u.tabel = t.tabel
  where t.rls_aan and t.policies = 0
),

overzicht as (
  select '3. overzicht'::text,
         case when rls_aan then 'beveiligd' else 'NIET beveiligd' end,
         tabel,
         'policies: ' || policies::text
           || ' | anon: ' || case when anon = '' then 'geen' else anon end
  from tabellen
)

select * from vlaggen
union all select * from geen_vlaggen
union all select * from bekend
union all select * from overzicht
order by 1, 2, 3;
