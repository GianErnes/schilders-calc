-- claude_planning_13_bevestiging_gezien.sql (Planning v0.31.0, 26-11-2026)
-- Hoort bij planning.html v0.31.0 en Edge Function planning-kennisgeving-bevestig v2.2.
--
-- Wat het doet:
--   1. kolom plan_kennisgevingen.bevestiging_gezien_op (timestamptz, mag leeg).
--      Leeg + bevestigd_op gevuld = nieuwe bevestiging die Gian nog niet zag
--      (groene knop in de kop van de planning).
--   2. ALLEEN bij het aanmaken van de kolom: alle bevestigingen die er al zijn
--      krijgen nu als "gezien", anders staan ze allemaal tegelijk als melding.
--      Bij opnieuw draaien gebeurt stap 2 niet meer (de kolom bestaat dan al),
--      zodat echte nieuwe bevestigingen niet stil op gezien gaan.
-- Geen nieuwe tabel, geen RLS-wijziging: de bestaande policy
-- plan_kennisgevingen_authenticated_alles dekt lezen en bijwerken.
-- Idempotent.

do $$ begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'fin_werkvoorraad') then
    raise exception 'Verkeerd Supabase-project: dit is niet schilders-calc';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'plan_kennisgevingen' and column_name = 'bevestiging_gezien_op'
  ) then
    alter table public.plan_kennisgevingen add column bevestiging_gezien_op timestamptz;
    update public.plan_kennisgevingen set bevestiging_gezien_op = now()
      where bevestigd_op is not null;
  end if;
end $$;

-- Controle (verwacht: kolom bestaat; 0 bevestigde rijen zonder gezien direct na de eerste keer draaien)
select
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'plan_kennisgevingen' and column_name = 'bevestiging_gezien_op') as kolom_bestaat,
  (select count(*) from public.plan_kennisgevingen where bevestigd_op is not null) as bevestigd,
  (select count(*) from public.plan_kennisgevingen where bevestigd_op is not null and bevestiging_gezien_op is null) as nog_niet_gezien;
