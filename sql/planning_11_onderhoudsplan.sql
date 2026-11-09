-- ============================================================
-- PLANNING brok 11: onderhoudsplan-beurten en opdrachtkennisgeving
-- Hoort bij planning.html v0.27.0, Edge Functions planning-kennisgeving
-- v3.4 en planning-kennisgeving-taken v1.5, bevestig.html v1.3.
-- Besluiten Gian 09-11-2026, zie CHANGELOG_planning.md v0.27.0.
--
-- 1. plan_projecten.onderhoudsplan (vinkje in het projectpaneel):
--    bij een aangevinkte beurt komt het maandsignaal op z'n vroegst
--    1 december van het jaar vóór de start.
-- 2. plan_kennisgevingen.soort mag ook 'opdracht' zijn: één
--    opdrachtbevestiging per klant met de uitvoeringsjaren.
-- 3. plan_kennisgevingen.vervallen_op / vervallen_reden: een rij die
--    niet meer meetelt voor de signalen, maar in de historie blijft.
--    Gezet op de drie maandaankondigingen voor Trilsbeek-God 2028/2030/
--    2033 die op 09-11-2026 te vroeg zijn verstuurd (besluit Gian).
--
-- Idempotent. Draaien in Supabase Studio > SQL Editor, of via de
-- Supabase-koppeling. Onderaan controleregels: allemaal GOED.
-- ============================================================

-- Projectguard: alleen in schilders-calc (live) of het hersteltestproject,
-- herkenbaar aan de tabel plan_kennisgevingen met kolom fase_id (planning_09).
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'plan_kennisgevingen' and column_name = 'fase_id'
  ) then
    raise exception 'planning_11: verkeerd project of planning_09 nog niet gedraaid (plan_kennisgevingen.fase_id ontbreekt)';
  end if;
end $$;

-- 1. vinkje onderhoudsplan-beurt
alter table public.plan_projecten
  add column if not exists onderhoudsplan boolean not null default false;
comment on column public.plan_projecten.onderhoudsplan is
  'v0.27.0: beurt uit een onderhoudsplan. Maandsignaal op z''n vroegst 1 december van het jaar vóór de start; telt mee in de opdrachtbevestiging per klant.';

-- 2. soort 'opdracht'
alter table public.plan_kennisgevingen drop constraint if exists plan_kennisgevingen_soort_check;
alter table public.plan_kennisgevingen
  add constraint plan_kennisgevingen_soort_check
  check (soort in ('maand', 'week', 'dag', 'opdracht'));

-- 3. vervallen
alter table public.plan_kennisgevingen
  add column if not exists vervallen_op timestamp with time zone,
  add column if not exists vervallen_reden text;
comment on column public.plan_kennisgevingen.vervallen_op is
  'v0.27.0: gevuld = telt niet meer mee voor signaal, correctie, nabellen of bounce; blijft zichtbaar in de historie.';

-- De drie te vroeg verstuurde maandaankondigingen (Trilsbeek-God, 09-11-2026).
-- Alleen rijen die nog niet vervallen zijn; nogmaals draaien doet niets.
update public.plan_kennisgevingen
   set vervallen_op = now(),
       vervallen_reden = 'Te vroeg verstuurd (beurt jaren vooruit); maandmelding volgt opnieuw in december vóór het uitvoeringsjaar. Besluit Gian 09-11-2026.'
 where yoobi_code in ('20261699', '20261700', '20261701')
   and soort = 'maand'
   and overgeslagen = false
   and verzonden_op::date = '2026-11-09'
   and vervallen_op is null;

-- Controle
select 'kolom onderhoudsplan' as controle,
       case when exists (select 1 from information_schema.columns where table_name = 'plan_projecten' and column_name = 'onderhoudsplan') then 'GOED' else 'FOUT' end as stand
union all
select 'soort opdracht toegestaan',
       case when exists (select 1 from pg_constraint where conname = 'plan_kennisgevingen_soort_check' and pg_get_constraintdef(oid) like '%opdracht%') then 'GOED' else 'FOUT' end
union all
select 'kolom vervallen_op',
       case when exists (select 1 from information_schema.columns where table_name = 'plan_kennisgevingen' and column_name = 'vervallen_op') then 'GOED' else 'FOUT' end
union all
select 'drie Trilsbeek-rijen vervallen',
       case when (select count(*) from public.plan_kennisgevingen where yoobi_code in ('20261699','20261700','20261701') and soort = 'maand' and vervallen_op is not null) = 3 then 'GOED' else 'FOUT' end;
