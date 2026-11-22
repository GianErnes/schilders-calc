-- claude_planning_12_afsluiting.sql (Planning v0.29.0)
-- RECONSTRUCTIE, niet het oorspronkelijke bestand. Het origineel is niet als
-- migratie vastgelegd; dit is opgebouwd uit de live database op 22-11-2026.
-- Zichtbaar verschil in de database: de check op plan_kennisgevingen.soort
-- laat ook 'afsluiting' toe. Of het origineel meer deed (bijvoorbeeld een
-- cronjob of gegevens aanpassen) is niet vast te stellen uit het schema.
-- Idempotent: opnieuw draaien geeft hetzelfde resultaat.

do $$ begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'fin_werkvoorraad') then
    raise exception 'Verkeerd Supabase-project: dit is niet schilders-calc';
  end if;
end $$;

alter table public.plan_kennisgevingen
  drop constraint if exists plan_kennisgevingen_soort_check;

alter table public.plan_kennisgevingen
  add constraint plan_kennisgevingen_soort_check
  check (soort = any (array['maand'::text, 'week'::text, 'dag'::text, 'opdracht'::text, 'afsluiting'::text]));
