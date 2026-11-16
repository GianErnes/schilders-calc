-- taken_28_meldtaak_gian.sql — 16-11-2026
-- Een afvinkmelding wordt een taak op naam van Gian.
--
-- Aanleiding (Gian, 16-11-2026): wat Maud bij het afvinken meldt, kwam alleen
-- als pushmelding binnen (gemeten 16-11-2026 11:27, taak-afvinkmelding,
-- kanaal push, 2 toestellen). Een push is weg zodra hij gemist of weggeveegd
-- is. Een taak blijft staan tot Gian hem afvinkt.
--
-- Wat dit bestand doet:
--   1. Functie taak_meldtaak_upsert(taak-id): maakt of werkt de meldtaak bij.
--   2. Trigger trg_taak_meldtaak_gian op public.taken (na insert of update).
--   3. Inhaalslag: meldingen vanaf 16-11-2026 krijgen alsnog een taak
--      (op het moment van schrijven is dat er een: Sluijsmans, offerte 260158).
--   4. Eenmalig: vier nabeltaken die Gian op 16-11-2026 om 07:56 afvinkte
--      terwijl hij ze wilde verzetten, gaan terug naar open op maandag
--      23-11-2026 13:30 (Reijnaerts, Troost, M. Joosten, Parochie H. Cornelius).
--
-- Wat het NIET doet: de bestaande push (trg_taak_melding_signaal) blijft
-- ongewijzigd. De meldtaak krijgt piep = false, dus taken-mail-melding
-- (selecteert alleen piep = true) stuurt er geen tweede push voor.
--
-- De meldtaak: bron 'eigen', toegewezen aan gian, bron_kenmerk
-- 'melding:<crmtaskid van de afgevinkte taak>', bron_ref overgenomen (bij een
-- offertetaak is dat de calculatie). Een taak per afgevinkte taak: wordt de
-- meldingstekst later aangepast, dan wordt de open meldtaak bijgewerkt.
-- Is de meldtaak al door Gian afgevinkt, dan blijft hij zoals hij was.
-- Wordt de oorspronkelijke taak teruggezet naar open ("Ongedaan maken"),
-- dan verdwijnt de nog open meldtaak weer.
--
-- Terugvalgedrag: gaat er in de meldtaak iets mis, dan komt er een WARNING in
-- het Postgres-logboek en gaat het afvinken zelf gewoon door.
--
-- Idempotent: mag vaker gedraaid worden.

-- Projectguard: stopt als dit niet schilders-calc is.
do $$ begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'fin_werkvoorraad') then
    raise exception 'Verkeerd Supabase-project: dit is niet schilders-calc';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 0. Een meldtaak per afgevinkte taak, afgedwongen door de database.
-- ---------------------------------------------------------------------
create unique index if not exists taken_meldtaak_uidx
  on public.taken (bron_kenmerk)
  where (bron_kenmerk like 'melding:%');

-- ---------------------------------------------------------------------
-- 1. De meldtaak maken of bijwerken.
-- ---------------------------------------------------------------------
create or replace function public.taak_meldtaak_upsert(p_taak text)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  t          public.taken%rowtype;
  v_kern     text;
  v_onderw   text;
  v_notitie  text;
  v_tel      text;
  v_wanneer  text;
begin
  select * into t from public.taken where crmtaskid = p_taak;
  if not found then
    return;
  end if;

  -- Dezelfde voorwaarden als de trigger; hier herhaald zodat de inhaalslag
  -- en een handmatige aanroep nooit iets anders doen dan de trigger.
  if t.voltooid_op is null then return; end if;
  if t.afvink_melding is null or btrim(t.afvink_melding) = '' then return; end if;
  if lower(coalesce(t.voltooid_door, '')) = 'gian' then return; end if;
  if coalesce(t.bron_kenmerk, '') like 'melding:%' then return; end if;

  -- Titel: "Melding · 260158 | Sluijsmans | Buitenwerk ...".
  v_kern := btrim(regexp_replace(coalesce(t.onderwerp, ''), '^\s*Nabellen offerte\s*', '', 'i'));
  if v_kern = '' then
    v_kern := coalesce(nullif(btrim(t.klantnaam), ''), 'taak zonder naam');
  end if;
  v_onderw := 'Melding · ' || v_kern;

  v_tel := coalesce(nullif(btrim(t.tel), ''), nullif(btrim(t.klant_tel), ''));
  v_wanneer := to_char(t.voltooid_op at time zone 'Europe/Amsterdam', 'DD-MM-YYYY HH24:MI');

  v_notitie := btrim(t.afvink_melding)
    || E'\n\n'
    || 'Gemeld door ' || coalesce(nullif(btrim(t.voltooid_door), ''), 'onbekend')
    || ' op ' || v_wanneer || ' bij het afvinken van:'
    || E'\n' || coalesce(nullif(btrim(t.onderwerp), ''), '(taak zonder naam)')
    || case when nullif(btrim(t.klantnaam), '') is not null
            then E'\nKlant: ' || btrim(t.klantnaam) else '' end
    || case when v_tel is not null
            then E'\nTelefoon: ' || v_tel else '' end;

  insert into public.taken
    (onderwerp, klantnaam, notitie, tel, gepland_op, piep, soort,
     toegewezen_aan, vandaag, bron, bron_ref, bron_kenmerk, status, categorie)
  values
    (v_onderw, coalesce(t.klantnaam, ''), v_notitie, v_tel,
     (now() at time zone 'Europe/Amsterdam'), false, 'eenmalig',
     'gian', false, 'eigen', t.bron_ref, 'melding:' || t.crmtaskid, 'actueel',
     case when t.bron = 'offerte' then 'Offerte' else null end)
  on conflict (bron_kenmerk) where (bron_kenmerk like 'melding:%')
  do update
     set onderwerp = excluded.onderwerp,
         notitie   = excluded.notitie,
         tel       = excluded.tel
   where public.taken.voltooid_op is null
     and (public.taken.notitie   is distinct from excluded.notitie
       or public.taken.onderwerp is distinct from excluded.onderwerp
       or public.taken.tel       is distinct from excluded.tel);
end;
$function$;

revoke all on function public.taak_meldtaak_upsert(text) from public;
revoke all on function public.taak_meldtaak_upsert(text) from anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. De trigger.
-- ---------------------------------------------------------------------
create or replace function public.taak_meldtaak_gian()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  -- Een meldtaak maakt zelf nooit een meldtaak.
  if coalesce(new.bron_kenmerk, '') like 'melding:%' then
    return new;
  end if;

  begin
    -- Teruggezet naar open: de nog open meldtaak hoort er dan niet meer te staan.
    if tg_op = 'UPDATE' and old.voltooid_op is not null and new.voltooid_op is null then
      delete from public.taken
       where bron_kenmerk = 'melding:' || new.crmtaskid
         and voltooid_op is null;
      return new;
    end if;

    if new.voltooid_op is null then
      return new;
    end if;
    if new.afvink_melding is null or btrim(new.afvink_melding) = '' then
      return new;
    end if;
    if lower(coalesce(new.voltooid_door, '')) = 'gian' then
      return new;
    end if;

    -- Al afgevinkt en de melding is niet veranderd: niets te doen.
    if tg_op = 'UPDATE'
       and old.voltooid_op is not null
       and old.afvink_melding is not distinct from new.afvink_melding then
      return new;
    end if;

    perform public.taak_meldtaak_upsert(new.crmtaskid);
  exception when others then
    -- Afvinken mag nooit stuklopen op de meldtaak.
    raise warning 'taak_meldtaak_gian: meldtaak niet gemaakt voor taak %: %', new.crmtaskid, sqlerrm;
  end;

  return new;
end;
$function$;

revoke all on function public.taak_meldtaak_gian() from public;
revoke all on function public.taak_meldtaak_gian() from anon, authenticated;

-- create or replace (geen drop): de Supabase-koppeling vraagt bij DROP om een
-- goedkeuring die niet altijd aankomt (zie taken_27).
create or replace trigger trg_taak_meldtaak_gian
  after insert or update on public.taken
  for each row execute function public.taak_meldtaak_gian();

-- ---------------------------------------------------------------------
-- 3. Inhaalslag: meldingen vanaf 16-11-2026 (Nederlandse tijd).
-- ---------------------------------------------------------------------
do $$
declare r record; n int := 0;
begin
  for r in
    select crmtaskid from public.taken
     where voltooid_op >= timestamp '2026-11-16 00:00' at time zone 'Europe/Amsterdam'
       and afvink_melding is not null and btrim(afvink_melding) <> ''
       and lower(coalesce(voltooid_door, '')) <> 'gian'
       and coalesce(bron_kenmerk, '') not like 'melding:%'
  loop
    perform public.taak_meldtaak_upsert(r.crmtaskid);
    n := n + 1;
  end loop;
  raise notice 'Inhaalslag: % afgevinkte taak/taken met een melding nagelopen', n;
end $$;

-- ---------------------------------------------------------------------
-- 4. Eenmalig: vier nabeltaken terug naar open, maandag 23-11-2026 13:30.
--    Alleen als ze nog precies zo staan als op 16-11-2026 gemeten:
--    afgevinkt door gian tussen 07:55 en 07:58. Daarna raakt dit niets meer.
-- ---------------------------------------------------------------------
do $$
declare n int;
begin
  update public.taken
     set voltooid_op   = null,
         voltooid_door = null,
         gepland_op    = timestamp '2026-11-23 13:30',
         piep_op       = case when piep then timestamp '2026-11-23 13:30' at time zone 'Europe/Amsterdam' else null end,
         mail_op       = null,
         push_op       = null
   where crmtaskid in (
           'app-f2a287bb-194f-492b-92fe-6100c9b242ce',  -- Reijnaerts, offerte 260151
           'app-c9374fe3-5969-4e58-bf3d-38b247ba523b',  -- Troost, offerte 260157
           'app-a9663ac2-4d31-4148-b875-8dd732325ae5',  -- M. Joosten, offerte 260148
           'app-885b1b83-41de-40bb-b907-27b764334a0a')  -- Parochie H. Cornelius, offerte 260162
     and voltooid_door = 'gian'
     and voltooid_op >= timestamp '2026-11-16 07:55' at time zone 'Europe/Amsterdam'
     and voltooid_op <  timestamp '2026-11-16 07:58' at time zone 'Europe/Amsterdam';
  get diagnostics n = row_count;
  raise notice 'Nabeltaken terug naar open: % (verwacht 4 bij de eerste keer, 0 daarna)', n;
end $$;

-- ---------------------------------------------------------------------
-- Controle: dit is wat je na het draaien hoort te zien.
-- ---------------------------------------------------------------------
select 'meldtaak' as wat, onderwerp, toegewezen_aan as wie,
       to_char(gepland_op, 'DD-MM-YYYY HH24:MI') as gepland,
       case when voltooid_op is null then 'open' else 'afgevinkt' end as stand
  from public.taken
 where bron_kenmerk like 'melding:%'
union all
select 'nabeltaak', onderwerp, toegewezen_aan,
       to_char(gepland_op, 'DD-MM-YYYY HH24:MI'),
       case when voltooid_op is null then 'open' else 'afgevinkt' end
  from public.taken
 where crmtaskid in (
         'app-f2a287bb-194f-492b-92fe-6100c9b242ce',
         'app-c9374fe3-5969-4e58-bf3d-38b247ba523b',
         'app-a9663ac2-4d31-4148-b875-8dd732325ae5',
         'app-885b1b83-41de-40bb-b907-27b764334a0a')
 order by 1, 2;
