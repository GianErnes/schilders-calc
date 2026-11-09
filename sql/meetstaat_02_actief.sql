-- meetstaat_02_actief.sql — 09-11-2026 — hoort bij index.html v4.117.0
-- Aan/uit per meetrij: kolom actief op public.meetstaat.
--
-- Aanleiding (Gian, 09-11): hoofdgroepen, onderdelen en regels kun je aan- en
-- uitzetten; dezelfde logica moet per meetrij kunnen.
--
-- Bewust NULL toegestaan (anders dan hoofdgroepen/onderdelen/calc_regels, die
-- NOT NULL zijn). Reden, gemeten op 09-11-2026 via de Supabase-koppeling:
-- prullenbak_herstel() zet rijen terug met
--   insert ... select * from jsonb_populate_record(null::public.meetstaat, rij)
-- Een rij die vóór deze migratie is weggegooid heeft geen sleutel "actief" in
-- zijn JSON en krijgt dan NULL. Met NOT NULL zou terugzetten mislukken; er
-- stonden op dat moment 33 meetstaat-rijen in de prullenbak.
-- De app leest NULL als aan (actief !== false).
--
-- Idempotent: nogmaals draaien verandert niets.

-- Projectguard: stopt als dit niet schilders-calc is.
do $$ begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'fin_werkvoorraad') then
    raise exception 'Verkeerd Supabase-project: dit is niet schilders-calc';
  end if;
end $$;

alter table public.meetstaat
  add column if not exists actief boolean default true;

comment on column public.meetstaat.actief is
  'v4.117.0: meetrij telt mee (true of NULL) of is uitgezet (false). NULL toegestaan vanwege prullenbak_herstel.';
