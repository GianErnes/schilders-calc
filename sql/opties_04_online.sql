-- opties_04_online.sql — 25-11-2026 — hoort bij index.html v4.131.0 en
-- Edge Function offerte-accord (de versie na 43).
-- Twee kolommen op public.offerte_accorderingen voor release 3: de klant
-- kiest online zijn opties en geeft akkoord op zijn samenstelling.
--
-- Aanleiding: ontwerpmemo "Keuzes voor de klant, online samenstellen" van
-- 20-11-2026 (stap D en hoofdstuk 7) en de overdrachtsbriefing van 22-11-2026.
-- Besluiten Gian 25-11-2026: 1a (bedrag wordt bij akkoord het gekozen totaal),
-- 2a en 3a.
--
--   optiekeuze         wat de klant bij zijn akkoord koos, door de Edge Function
--                      zelf opgezocht in de tabel van de link (cijfers.opties):
--                      { v, ids, nrs, titels, excl, incl, basisExcl, basisIncl,
--                        klanttype, op }.
--                      Leeg = een link zonder online keuze (alle links van voor
--                      deze versie, planlinks, houtrot-opgaven).
--   optie_verwerkt_op  het moment waarop de app de keuze in de calculatie heeft
--                      verwerkt. De app eist dit stempel op (update ... where
--                      optie_verwerkt_op is null) voordat hij iets omzet; zo
--                      verwerkt van twee gelijktijdige gebruikers er maar een.
--                      Leeg bij een gevulde optiekeuze = nog te verwerken.
--
-- De kolom bedrag bestaat al. Bij een akkoord met online keuze schrijft de
-- Edge Function daar het gekozen totaal incl. btw in; het basisbedrag blijft
-- bewaard in optiekeuze.basisIncl en in cijfers.
--
-- Rechten: de policy op offerte_accorderingen staat een ingelogde gebruiker
-- alles toe (gemeten 24-11-2026, CHANGELOG v4.130.0). Prullenbak: terugzetten
-- gaat met jsonb_populate_record; een bewaarde rij van voor deze migratie
-- krijgt lege waarden.
--
-- Idempotent. Bestaande rijen houden beide kolommen leeg en gedragen zich
-- exact als voorheen. index.html v4.130.0 en ouder noemt deze kolommen niet
-- en blijft werken. VOLGORDE: eerst deze SQL, dan de Edge Function, dan
-- index.html; de nieuwe Edge Function leest optiekeuze bij elke opening.

-- Projectguard: stopt als dit niet schilders-calc is.
do $$ begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'fin_werkvoorraad') then
    raise exception 'Verkeerd Supabase-project: dit is niet schilders-calc';
  end if;
end $$;

alter table public.offerte_accorderingen
  add column if not exists optiekeuze jsonb,
  add column if not exists optie_verwerkt_op timestamptz;

comment on column public.offerte_accorderingen.optiekeuze is
  'v4.131.0: de samenstelling waarop de klant online akkoord gaf (ids, nrs, titels, excl, incl, basis). Door offerte-accord opgezocht in cijfers.opties. Leeg = geen online keuze.';
comment on column public.offerte_accorderingen.optie_verwerkt_op is
  'v4.131.0: wanneer de app de online keuze in de calculatie heeft verwerkt. Leeg bij gevulde optiekeuze = nog te verwerken.';

-- Controle: beide kolommen bestaan en zijn overal leeg.
select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'offerte_accorderingen'
      and column_name in ('optiekeuze', 'optie_verwerkt_op')) as kolommen_aanwezig,   -- hoort 2 te zijn
  (select count(*) from public.offerte_accorderingen) as links_totaal,
  (select count(*) from public.offerte_accorderingen
    where optiekeuze is not null or optie_verwerkt_op is not null) as links_met_waarde;  -- hoort 0 te zijn
