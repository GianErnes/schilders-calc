-- kleinschalig_01_uit.sql (Calc v4.126.0)
-- Bron: letterlijk de tekst van migratie 20261120131513 "kleinschalig_01_uit"
-- uit supabase_migrations.schema_migrations, uitgelezen op 22-11-2026.
-- Idempotent: opnieuw draaien verandert niets.

do $$ begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'fin_werkvoorraad') then
    raise exception 'Verkeerd Supabase-project: dit is niet schilders-calc';
  end if;
end $$;

alter table public.calculaties
  add column if not exists kleinschalig_uit boolean default false;

comment on column public.calculaties.kleinschalig_uit is
  'v4.126.0 — true = de automatische post Kleinschaligheidstoeslag is in deze calculatie weggehaald en komt niet vanzelf terug. Leeg telt als false.';

do $$
declare n int;
begin
  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'calculaties'
     and column_name = 'kleinschalig_uit' and data_type = 'boolean';
  if n <> 1 then
    raise exception 'Controle mislukt: kolom calculaties.kleinschalig_uit (boolean) niet gevonden';
  end if;
end $$;
