-- ============================================================
-- SJABLOON: een nieuwe tabel aanleggen in Schilders Calc
--
-- Kopieer dit bestand, vervang overal TABELNAAM door de echte naam,
-- vul de kolommen in, en draai het in de Supabase SQL Editor.
--
-- Doe dit NIET met de tabel-knop in Supabase Studio. Die maakt een
-- tabel zonder policy en met rechten voor anon. Dan kan de app er niet
-- bij en staat hij tegelijk open voor iedereen zonder inlog.
--
-- Het model van Schilders Calc: iedereen die is ingelogd mag alles,
-- wie niet is ingelogd mag niets. Zie sql/README.md.
--
-- Alles hieronder is idempotent. Twee keer draaien kan geen kwaad.
-- ============================================================


-- ------------------------------------------------------------
-- 1. De tabel
-- ------------------------------------------------------------
create table if not exists public.TABELNAAM (
  id          uuid primary key default gen_random_uuid(),

  -- ---- hier je eigen kolommen ----
  naam        text not null,
  -- --------------------------------

  created_at  timestamp with time zone default now(),
  updated_at  timestamp with time zone default now()
);


-- ------------------------------------------------------------
-- 2. Rijbeveiliging aan
--    Zonder dit staat de tabel open voor iedereen die het adres en
--    de publieke sleutel kent, en die staan openbaar in de repo.
-- ------------------------------------------------------------
alter table public.TABELNAAM enable row level security;


-- ------------------------------------------------------------
-- 3. De policy
--    Naamconventie: <tabel>_authenticated_alles
--    Noem hem NOOIT "anon ..." ook al doet hij iets anders. Er staan
--    nog een stuk of tien oude policies met zo'n naam en die zorgen
--    bij elke audit voor een valse alarmbel. Zie opruimlijst punt 16.
-- ------------------------------------------------------------
drop policy if exists TABELNAAM_authenticated_alles on public.TABELNAAM;

create policy TABELNAAM_authenticated_alles
  on public.TABELNAAM
  for all
  to authenticated
  using (true)
  with check (true);


-- ------------------------------------------------------------
-- 4. Rechten
--    De revoke voor anon is GEEN overbodige regel. Een nieuwe tabel
--    in public krijgt die rechten vanzelf, dus je moet ze actief
--    weghalen.
-- ------------------------------------------------------------
grant select, insert, update, delete on public.TABELNAAM to authenticated;
grant all                            on public.TABELNAAM to service_role;
revoke all                           on public.TABELNAAM from anon;


-- ------------------------------------------------------------
-- 5. De bijwerkdatum bijhouden
--    Alleen nodig als de tabel een kolom updated_at heeft.
--    Laat je dit weg, dan blijft updated_at op het moment van
--    aanmaken staan en heb je een datum die liegt.
-- ------------------------------------------------------------
-- De functie zelf bestaat al en wordt door alle tabellen gedeeld.
-- Hij staat hier alleen voor het geval hij ontbreekt, bijvoorbeeld na
-- een herbouw vanaf nul.
--
-- >>> De regel `set search_path` MOET erbij blijven. <<<
-- Die is er op 26 mei 2026 bij gekomen in v3.9.5, zie
-- sql/02_fix_set_updated_at.sql. Zonder die regel kan de functie
-- gekaapt worden via een tabel met dezelfde naam in een ander schema.
-- Laat je hem weg, dan draai je die beveiliging terug voor ALLE
-- tabellen tegelijk, want het is een gedeelde functie.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists TABELNAAM_set_updated_at on public.TABELNAAM;

create trigger TABELNAAM_set_updated_at
  before update on public.TABELNAAM
  for each row
  execute function public.set_updated_at();


-- ------------------------------------------------------------
-- 6. Indexen
--    Alleen op kolommen waar je echt op zoekt of filtert. Een index
--    op alles maakt het schrijven trager zonder dat het lezen sneller
--    wordt. Voorbeeld, weghalen als je hem niet nodig hebt:
-- ------------------------------------------------------------
-- create index if not exists TABELNAAM_naam_idx
--   on public.TABELNAAM (naam);


-- ------------------------------------------------------------
-- 7. Controle
--    Draai dit mee. Alle vijf de regels horen op GOED te staan.
-- ------------------------------------------------------------
with c as (
  select
    (select relrowsecurity from pg_class
      where relname = 'TABELNAAM' and relnamespace = 'public'::regnamespace) as rls,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'TABELNAAM') as policies,
    (select count(*) from information_schema.role_table_grants
      where table_schema = 'public' and table_name = 'TABELNAAM'
        and grantee = 'authenticated') as rechten_auth,
    (select count(*) from information_schema.role_table_grants
      where table_schema = 'public' and table_name = 'TABELNAAM'
        and grantee = 'anon') as rechten_anon
)
select 'rijbeveiliging aan' as controle,
       case when rls then 'GOED' else 'FOUT' end as stand from c
union all
select 'minstens een policy',
       case when policies > 0 then 'GOED' else 'FOUT, app kan er niet bij' end from c
union all
select 'rechten voor authenticated',
       case when rechten_auth > 0 then 'GOED' else 'FOUT, app kan er niet bij' end from c
union all
select 'geen rechten voor anon',
       case when rechten_anon = 0 then 'GOED' else 'FOUT, tabel ligt open' end from c
union all
select 'set_updated_at beveiligd',
       case when exists (
         select 1 from pg_proc p
         join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = 'set_updated_at'
           and p.proconfig::text like '%search_path%'
       ) then 'GOED' else 'FOUT, zie sql/02_fix_set_updated_at.sql' end;
