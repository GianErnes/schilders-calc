-- opties_02_delen.sql — 21-11-2026 — hoort bij index.html v4.128.0
-- Kolom optie_id op public.hoofdgroepen en public.onderdelen: een gevel, ruimte
-- of onderdeel als keuze "erbij" voor de klant.
--
-- Aanleiding: ontwerpmemo "Keuzes voor de klant, online samenstellen" van
-- 20-11-2026, stap A. Een deel dat een keuze is staat in de basis uit (kolom
-- actief = false) en hangt met optie_id aan een optie uit
-- calculaties.offerte_config.opties (titel, klanttekst, soort "erbij"). De
-- rekenkern verandert niet: een uitgezet deel telt al sinds v3.11.0 niet mee.
-- De koppeling staat op het deel zelf en niet op elke regel, zodat regels die
-- later in het deel komen er vanzelf bij horen.
--
--   optie_id   bij welke optie het deel hoort. Tekst, verwijst naar een id in
--              calculaties.offerte_config.opties. Leeg = gewoon deel.
--
-- Bewust zonder verwijssleutel en zonder controle-constraint, net als
-- calc_regels.optie_id (sql/opties_01_calc_regels.sql): de optie zelf staat in
-- een jsonb-veld. De app meldt een deel waarvan de optie niet meer bestaat.
--
-- Prullenbak: gemeten 21-11-2026 in prullenbak_herstel: terugzetten gaat met
-- jsonb_populate_record. Een bewaarde rij van voor deze migratie mist de
-- sleutel optie_id en krijgt dan NULL; de kolom is niet verplicht, dus het
-- terugzetten van oude rijen blijft werken.
--
-- Rechten: beide tabellen hebben één policy "ingelogd alles ..." (gemeten
-- 21-11-2026). Nieuwe kolommen vallen onder de bestaande rijbeveiliging.
--
-- Idempotent. Bestaande rijen houden de kolom leeg en gedragen zich exact als
-- voorheen. index.html v4.127.0 en ouder noemt deze kolom niet en blijft
-- werken.

-- Projectguard: stopt als dit niet schilders-calc is.
do $$ begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'fin_werkvoorraad') then
    raise exception 'Verkeerd Supabase-project: dit is niet schilders-calc';
  end if;
end $$;

alter table public.hoofdgroepen
  add column if not exists optie_id text;
alter table public.onderdelen
  add column if not exists optie_id text;

comment on column public.hoofdgroepen.optie_id is
  'v4.128.0 — optie waar deze hoofdgroep als keuze "erbij" bij hoort (id uit calculaties.offerte_config.opties). Leeg = gewone hoofdgroep.';
comment on column public.onderdelen.optie_id is
  'v4.128.0 — optie waar dit onderdeel als keuze "erbij" bij hoort (id uit calculaties.offerte_config.opties). Leeg = gewoon onderdeel.';

-- Controle
do $$
declare n int; h int; o int;
begin
  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name in ('hoofdgroepen', 'onderdelen')
     and column_name = 'optie_id' and data_type = 'text' and is_nullable = 'YES';
  if n <> 2 then
    raise exception 'Controle mislukt: kolom optie_id (text, niet verplicht) niet op beide tabellen gevonden';
  end if;
  select count(*) into h from public.hoofdgroepen where optie_id is not null;
  select count(*) into o from public.onderdelen where optie_id is not null;
  raise notice 'GOED: hoofdgroepen.optie_id en onderdelen.optie_id bestaan; % hoofdgroep(en) en % onderdeel(en) als keuze', h, o;
end $$;
