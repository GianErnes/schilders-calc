-- accord_05_cijfers.sql — 13-11-2026 — hoort bij index.html v4.120.0
-- Kolom cijfers op public.offerte_accorderingen.
--
-- Aanleiding: offerte 260148 (M. Joosten). Een herziene offerte ging de deur uit
-- waarin alle regels stegen door een sprong van 5 naar 6 gefactureerde dagen; bij
-- het versturen was dat nergens te zien. Vanaf v4.120.0 toont de app bij een
-- herziening een vergelijking met de vorige versie. Daarvoor bewaart elke nieuwe
-- accordeerlink de cijfers van dat moment: per regel hoeveelheid, eenheidsprijs
-- en bedrag, de zichtbare staartposten, reiskosten, dagen werkelijk en
-- gefactureerd, afrondingstoeslag en totalen.
--
-- Waarom een eigen kolom en niet in snapshot: de Edge Function offerte-accord
-- geeft de hele snapshot door aan de browser van de klant (gelezen in v43 op
-- 13-11-2026). Dagen en afrondingstoeslag zijn intern. De select van die functie
-- noemt haar kolommen bij naam; cijfers staat daar niet tussen.
--
-- Rechten: de tabel heeft tabelrechten voor authenticated en service_role, geen
-- voor anon, geen afwijkende kolomrechten en er hangt geen view aan (gemeten
-- 13-11-2026). Een nieuwe kolom valt onder de bestaande rijbeveiliging.
--
-- Idempotent. Bestaande rijen houden cijfers = null; de app valt daar terug op
-- een vergelijking van alleen het totaalbedrag.
-- Zonder deze kolom werkt v4.120.0 ook: de link wordt gemaakt zonder cijfers en
-- de app meldt dat.

-- Projectguard: stopt als dit niet schilders-calc is.
do $$ begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'fin_werkvoorraad') then
    raise exception 'Verkeerd Supabase-project: dit is niet schilders-calc';
  end if;
end $$;

alter table public.offerte_accorderingen
  add column if not exists cijfers jsonb;

comment on column public.offerte_accorderingen.cijfers is
  'v4.120.0 — cijfers van de offerte op het moment van de link (regels, staart, dagen, afronding, totalen). Intern: niet uitleveren aan de klantpagina.';

-- Controle
do $$
declare n int;
begin
  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'offerte_accorderingen'
     and column_name = 'cijfers' and data_type = 'jsonb' and is_nullable = 'YES';
  if n <> 1 then
    raise exception 'Controle mislukt: kolom cijfers (jsonb, leeg toegestaan) niet gevonden';
  end if;
  raise notice 'GOED: offerte_accorderingen.cijfers bestaat (jsonb, leeg toegestaan)';
end $$;
