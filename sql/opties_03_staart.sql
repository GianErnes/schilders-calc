-- opties_03_staart.sql — 22-11-2026 — hoort bij index.html v4.129.0
-- Twee kolommen op public.staart voor vaste posten bij een optie (steiger,
-- hoogwerker, container bij een gevel die de klant erbij kan kiezen).
--
-- Aanleiding: ontwerpmemo "Keuzes voor de klant, online samenstellen" van
-- 20-11-2026, stap B. Zolang een optie niet gekozen is staan haar posten niet
-- in deze tabel maar bij de optie zelf, in calculaties.offerte_config.opties
-- (lijst posten). De rekenkern, de basis, de werkbon en de Yoobi-export zien
-- ze dan niet. Pas als de keuze wordt vastgelegd schrijft de app ze als echte
-- staartpost, met deze twee kolommen gevuld. Bij Keuze wissen haalt de app
-- precies die rijen weer weg.
--
--   optie_id    de optie waar de post bij hoort (id uit offerte_config.opties).
--   optie_post  de post binnen die optie (offerte_config.opties[].posten[].id).
--   Beide leeg = gewone staartpost.
--
-- Bewust zonder verwijssleutel: de optie staat in een jsonb-veld. De app meldt
-- een staartpost waarvan de optie niet (meer) gekozen is.
--
-- Rechten: staart heeft één policy "ingelogd alles staart" (gemeten
-- 22-11-2026). Prullenbak: terugzetten gaat met jsonb_populate_record; een
-- bewaarde rij van voor deze migratie krijgt lege waarden en blijft terug te
-- zetten.
--
-- Idempotent. Bestaande rijen houden beide kolommen leeg en gedragen zich
-- exact als voorheen. index.html v4.128.1 en ouder noemt deze kolommen niet
-- en blijft werken.

-- Projectguard: stopt als dit niet schilders-calc is.
do $$ begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'fin_werkvoorraad') then
    raise exception 'Verkeerd Supabase-project: dit is niet schilders-calc';
  end if;
end $$;

alter table public.staart
  add column if not exists optie_id text,
  add column if not exists optie_post text;

comment on column public.staart.optie_id is
  'v4.129.0 — optie waar deze staartpost bij hoort (id uit calculaties.offerte_config.opties). Alleen gevuld bij een post die door een vastgelegde keuze in de staart is gezet. Leeg = gewone staartpost.';
comment on column public.staart.optie_post is
  'v4.129.0 — id van de post binnen die optie (offerte_config.opties[].posten[].id). Leeg = gewone staartpost.';

-- Een post binnen een optie hoort altijd bij een optie.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'staart_optie_post_bij_optie') then
    alter table public.staart
      add constraint staart_optie_post_bij_optie
      check (optie_post is null or optie_id is not null);
  end if;
end $$;

-- Controle
do $$
declare n int; m int;
begin
  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'staart'
     and column_name in ('optie_id', 'optie_post') and data_type = 'text' and is_nullable = 'YES';
  if n <> 2 then
    raise exception 'Controle mislukt: kolommen optie_id en optie_post (text, niet verplicht) niet beide op staart gevonden';
  end if;
  select count(*) into m from pg_constraint where conname = 'staart_optie_post_bij_optie';
  if m <> 1 then
    raise exception 'Controle mislukt: constraint staart_optie_post_bij_optie ontbreekt';
  end if;
  select count(*) into n from public.staart where optie_id is not null or optie_post is not null;
  raise notice 'GOED: staart.optie_id en staart.optie_post bestaan; % post(en) bij een optie', n;
end $$;
