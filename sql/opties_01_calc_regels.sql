-- opties_01_calc_regels.sql — 20-11-2026 — hoort bij index.html v4.125.0
-- Twee kolommen op public.calc_regels voor opties in de offerte (automodel).
--
-- Aanleiding: ontwerpmemo "Opties in de offerte volgens het automodel" van
-- 19-11-2026. Een optie is een gekoppelde calculatieregel die in de basis uit
-- staat (kolom actief = false). De rekenkern verandert niet: een uitgezette
-- regel telt al sinds v3.84.2 niet mee.
--
--   optie_id         bij welke optie de regel hoort. Tekst, verwijst naar een
--                    id in calculaties.offerte_config.opties (titel, klanttekst,
--                    soort). Leeg = gewone regel.
--   alternatief_voor de basisregel die deze optieregel vervangt ("in plaats
--                    van"). Leeg bij een optie "erbij" en bij gewone regels.
--
-- Bewust GEEN verwijssleutel op alternatief_voor. Gemeten 20-11-2026 in
-- prullenbak_herstel: rijen van dezelfde tabel worden teruggezet op volgorde
-- van verwijderd_op. Met een verwijssleutel zou het terugzetten van een
-- onderdeel mislukken zodra de optieregel vóór zijn basisregel aan de beurt is.
-- De app bewaakt de koppeling zelf en meldt een optieregel zonder basisregel
-- op het controlescherm.
--
-- Rechten: calc_regels heeft één policy "ingelogd alles calc_regels" (gemeten
-- 20-11-2026). Nieuwe kolommen vallen onder de bestaande rijbeveiliging.
--
-- Idempotent. Bestaande rijen houden beide kolommen leeg en gedragen zich
-- exact als voorheen. index.html v4.124.0 en ouder noemt deze kolommen niet
-- en blijft werken.

-- Projectguard: stopt als dit niet schilders-calc is.
do $$ begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'fin_werkvoorraad') then
    raise exception 'Verkeerd Supabase-project: dit is niet schilders-calc';
  end if;
end $$;

alter table public.calc_regels
  add column if not exists optie_id text,
  add column if not exists alternatief_voor uuid;

comment on column public.calc_regels.optie_id is
  'v4.125.0 — optie waar deze regel bij hoort (id uit calculaties.offerte_config.opties). Leeg = gewone regel.';
comment on column public.calc_regels.alternatief_voor is
  'v4.125.0 — id van de basisregel die deze optieregel vervangt (optie "in plaats van"). Bewust zonder verwijssleutel, zie sql/opties_01_calc_regels.sql.';

-- Een alternatief hoort altijd bij een optie, en een regel vervangt nooit zichzelf.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'calc_regels_alternatief_bij_optie') then
    alter table public.calc_regels
      add constraint calc_regels_alternatief_bij_optie
      check (alternatief_voor is null or (optie_id is not null and alternatief_voor <> id));
  end if;
end $$;

-- Controle
do $$
declare n int;
begin
  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'calc_regels'
     and ((column_name = 'optie_id' and data_type = 'text')
       or (column_name = 'alternatief_voor' and data_type = 'uuid'))
     and is_nullable = 'YES';
  if n <> 2 then
    raise exception 'Controle mislukt: kolommen optie_id (text) en alternatief_voor (uuid) niet beide gevonden';
  end if;
  select count(*) into n from pg_constraint where conname = 'calc_regels_alternatief_bij_optie';
  if n <> 1 then
    raise exception 'Controle mislukt: constraint calc_regels_alternatief_bij_optie ontbreekt';
  end if;
  select count(*) into n from public.calc_regels where optie_id is not null or alternatief_voor is not null;
  raise notice 'GOED: calc_regels.optie_id en alternatief_voor bestaan; % regel(s) met een optie', n;
end $$;
