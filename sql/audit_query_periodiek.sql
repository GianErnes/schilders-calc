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
--
-- v2, 30 juli 2026. Drie dingen erbij:
--   - de opslagbakken en de policies op storage.objects, die tot nu
--     toe helemaal buiten de audit vielen
--   - een rode vlag op een bak die openbaar staat
--   - blok 4 telt de policies PER SCHEMA. Het totaal 69 bleek 53 op
--     public plus 16 op storage.objects, en in een enkel getal is dat
--     onderscheid onzichtbaar. Zie SYSTEEM.md 4.8.
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

-- de tabel die met opzet geen policy heeft.
-- sync_state wordt alleen door Edge Functions gevuld en die werken met de
-- servicesleutel, dus die gaat langs de rijbeveiliging heen.
-- ZET ER GEEN POLICY OP om het te repareren. Zie SYSTEEM.md 3.4.
--
-- v3 (2 augustus 2026): taken_melding_sleutels is hier weggehaald. Die
-- tabel hoorde bij taken-meldingen en taken-agenda, allebei verwijderd,
-- en is samen met taken-agenda opgeruimd. Staat hij ooit weer in de
-- database, dan is dat echt nieuws en hoort de audit erover te piepen.
uitzonderingen as (
  select unnest(array['sync_state']) as tabel
),

-- v3 (2 augustus 2026): DEZE LIJST IS LEEG EN HOORT LEEG TE BLIJVEN.
--
-- Hier stond 'accord-pdf' in. Die bak moest openbaar zijn omdat de klant
-- die de accordeerlink opent niet is ingelogd, en de policies op die bak
-- alleen voor authenticated gelden. Sinds offerte-accord v4.40.0 maakt
-- die functie zelf een ondertekende link van zestig minuten, dus de bak
-- kon dicht. Gemeten na afloop: de openbare URL geeft NoSuchBucket, de
-- accordeerpagina toont de PDF gewoon.
--
-- Zolang die uitzondering hier stond, zou de audit OOK gezwegen hebben
-- als iemand die bak per ongeluk weer openbaar zette. Een uitzondering
-- die blijft staan nadat de reden verdwenen is, is een blinde vlek.
--
-- Komt er ooit een naam bij: schrijf er dan bij WAAROM, en zet er een
-- datum bij waarop hij opnieuw beoordeeld wordt. Een openbare bak hoort
-- de uitzondering te zijn en niet de gewoonte.
bak_uitzonderingen as (
  select null::text as bak where false
),

-- v2: de opslagbakken. Een bak die openbaar staat is voor iedereen
-- met het adres leesbaar, ook zonder in te loggen.
bakken as (
  select b.id::text as bak,
         b.public   as openbaar,
         (select count(*) from pg_policies
           where schemaname = 'storage' and tablename = 'objects') as opslagpolicies
  from storage.buckets b
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

  -- v2
  union all
  select '1. RODE VLAG', 'BAK STAAT OPENBAAR', bak,
         'iedereen met het adres kan hier bestanden lezen zonder in te loggen'
  from bakken
  where openbaar
    and bak not in (select bak from bak_uitzonderingen)

  union all
  select '1. RODE VLAG', 'GEEN OPSLAGPOLICIES', 'storage.objects',
         'er staat geen enkele regel op de opslag: de app komt nergens bij'
  from (select 1) x
  where (select count(*) from pg_policies
          where schemaname = 'storage' and tablename = 'objects') = 0
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

  union all
  -- v3: de lijst is leeg, dus deze regel levert niets op zolang dat zo
  -- blijft. Hij staat er nog zodat een toekomstige uitzondering meteen
  -- zichtbaar is in blok 2 en niet stilzwijgend verdwijnt uit blok 1.
  select '2. bekend en goed', 'openbaar, met opzet', b.bak,
         'staat als uitzondering in deze query. Kijk na of de reden nog geldt'
  from bakken b
  join bak_uitzonderingen u on u.bak = b.bak
  where b.openbaar

  union all
  select '1. RODE VLAG', 'UITZONDERING NIET MEER NODIG', b.bak,
         'deze bak staat als openbare uitzondering in de audit maar is inmiddels besloten. Haal hem uit bak_uitzonderingen'
  from bakken b
  join bak_uitzonderingen u on u.bak = b.bak
  where not b.openbaar
),

overzicht as (
  select '3. overzicht'::text,
         case when rls_aan then 'beveiligd' else 'NIET beveiligd' end,
         tabel,
         'policies: ' || policies::text
           || ' | anon: ' || case when anon = '' then 'geen' else anon end
  from tabellen
),

-- v2: de telling per schema. Nooit meer een enkel totaal, want daar
-- passen twee verschillende soorten in zonder dat je het ziet.
per_schema as (
  select '4. policies per schema'::text,
         schemaname::text,
         count(*)::text || ' policies',
         'op ' || count(distinct tablename)::text || ' tabel(len)'
  from pg_policies
  where schemaname in ('public', 'storage')
  group by schemaname

  union all
  select '4. policies per schema', 'TOTAAL',
         (select count(*)::text from pg_policies
           where schemaname in ('public', 'storage')) || ' policies',
         'public plus storage samen. Dit getal hoort in SYSTEEM.md 4.8'
),

-- v2: de bakken zelf, zodat er nooit meer eentje ongemerkt bijkomt.
opslag as (
  select '5. opslagbakken'::text,
         case when openbaar then 'OPENBAAR' else 'besloten' end,
         bak,
         opslagpolicies::text || ' regels op storage.objects (geldt voor alle bakken samen)'
  from bakken
)

select * from vlaggen
union all select * from geen_vlaggen
union all select * from bekend
union all select * from overzicht
union all select * from per_schema
union all select * from opslag
order by 1, 2, 3;
