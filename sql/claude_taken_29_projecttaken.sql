-- claude_taken_29_projecttaken.sql (Taken v0.28.0, Planning v0.28.0)
-- RECONSTRUCTIE, niet het oorspronkelijke bestand. Taken_29 is destijds via
-- execute_sql gedraaid en staat niet in supabase_migrations. Dit bestand is
-- opgebouwd uit de live database op 22-11-2026: kolommen, controles, index,
-- tabel, rijbeveiliging, functies en triggers zoals ze er nu staan.
-- Niet opgenomen: de inhoud van plan_taak_sjablonen (2 rijen; staat in de
-- nachtelijke backup) en de rechten op de twee triggerfuncties (niet gemeten).
-- Idempotent: opnieuw draaien geeft hetzelfde resultaat.

do $$ begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'fin_werkvoorraad') then
    raise exception 'Verkeerd Supabase-project: dit is niet schilders-calc';
  end if;
end $$;

-- 1. Kolommen op taken -------------------------------------------------------

alter table public.taken add column if not exists plan_code text;
alter table public.taken add column if not exists plan_fase_id uuid;
alter table public.taken add column if not exists plan_dagen_voor integer;

comment on column public.taken.plan_code is
  'Yoobi-projectcode van het planningsproject waar deze taak bij hoort (taken_29).';
comment on column public.taken.plan_fase_id is
  'Optioneel: de fase (plan_fasen.id) waar de taak aan hangt (taken_29).';
comment on column public.taken.plan_dagen_voor is
  'Kalenderdagen voor de start; gevuld = datum volgt de start, leeg = vaste datum (taken_29).';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'taken_plan_fase_fk' and conrelid = 'public.taken'::regclass) then
    alter table public.taken
      add constraint taken_plan_fase_fk foreign key (plan_fase_id)
      references public.plan_fasen(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'taken_plan_dagen_voor_bereik' and conrelid = 'public.taken'::regclass) then
    alter table public.taken
      add constraint taken_plan_dagen_voor_bereik
      check (plan_dagen_voor is null or (plan_dagen_voor >= 0 and plan_dagen_voor <= 365));
  end if;
end $$;

create index if not exists taken_plan_code_idx
  on public.taken using btree (plan_code) where (plan_code is not null);

-- 2. Tabel plan_taak_sjablonen ----------------------------------------------

create table if not exists public.plan_taak_sjablonen (
  id             uuid primary key default gen_random_uuid(),
  naam           text not null,
  dagen_voor     integer not null default 14,
  toegewezen_aan text not null default 'gian'::text,
  volgorde       integer not null default 0,
  aangemaakt     timestamp with time zone not null default now(),
  constraint plan_taak_sjablonen_dagen_voor_check check (dagen_voor >= 0 and dagen_voor <= 365)
);

comment on table public.plan_taak_sjablonen is
  'Standaardlijstje voorbereidingstaken per planningsproject (taken_29).';

alter table public.plan_taak_sjablonen enable row level security;

revoke all on public.plan_taak_sjablonen from anon;
grant all on public.plan_taak_sjablonen to authenticated, service_role;

drop policy if exists plan_taak_sjablonen_lezen on public.plan_taak_sjablonen;
create policy plan_taak_sjablonen_lezen on public.plan_taak_sjablonen
  for select to authenticated using (taken_rol() is not null);

drop policy if exists plan_taak_sjablonen_beheer_toevoegen on public.plan_taak_sjablonen;
create policy plan_taak_sjablonen_beheer_toevoegen on public.plan_taak_sjablonen
  for insert to authenticated with check (taken_rol() = 'alles'::text);

drop policy if exists plan_taak_sjablonen_beheer_wijzigen on public.plan_taak_sjablonen;
create policy plan_taak_sjablonen_beheer_wijzigen on public.plan_taak_sjablonen
  for update to authenticated using (taken_rol() = 'alles'::text) with check (taken_rol() = 'alles'::text);

drop policy if exists plan_taak_sjablonen_beheer_verwijderen on public.plan_taak_sjablonen;
create policy plan_taak_sjablonen_beheer_verwijderen on public.plan_taak_sjablonen
  for delete to authenticated using (taken_rol() = 'alles'::text);

-- 3. Functies ----------------------------------------------------------------

create or replace function public.plan_taak_start(p_code text, p_fase uuid)
 returns date
 language plpgsql
 stable security definer
 set search_path to 'public'
as $function$
declare
  v date;
  v_tekst text;
begin
  if p_code is null or p_code = '' then return null; end if;
  if p_fase is not null then
    select f.van into v from plan_fasen f where f.id = p_fase and f.yoobi_code = p_code;
    if v is not null then return v; end if;
  end if;
  select min(f.van) into v from plan_fasen f where f.yoobi_code = p_code;
  if v is not null then return v; end if;
  select pp.plan_start into v from plan_projecten pp where pp.yoobi_code = p_code;
  if v is not null then return v; end if;
  select p ->> 'startdatum' into v_tekst
    from (select w.data from fin_werkvoorraad w order by w.peildatum desc limit 1) laatste,
         jsonb_array_elements(laatste.data -> 'projecten') p
   where p ->> 'code' = p_code
   limit 1;
  if v_tekst is null or v_tekst !~ '^\d{2}-\d{2}-\d{4}$' then return null; end if;
  begin
    v := to_date(v_tekst, 'DD-MM-YYYY');
  exception when others then
    return null;
  end;
  if extract(year from v) < extract(year from current_date) then return null; end if;
  return v;
end;
$function$;

create or replace function public.plan_taak_projecten()
 returns jsonb
 language plpgsql
 stable security definer
 set search_path to 'public'
as $function$
declare
  v jsonb;
begin
  if taken_rol() is null then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'code',  x.code,
           'naam',  x.naam,
           'klant', x.klant,
           'start', plan_taak_start(x.code, null),
           'fasen', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'naam', f.naam, 'van', f.van) order by f.volgnr)
                                from plan_fasen f where f.yoobi_code = x.code), '[]'::jsonb)
         ) order by x.naam), '[]'::jsonb)
    into v
    from (
      select p ->> 'code' as code, p ->> 'naam' as naam, p ->> 'klant' as klant
        from (select w.data from fin_werkvoorraad w order by w.peildatum desc limit 1) laatste,
             jsonb_array_elements(laatste.data -> 'projecten') p
       where coalesce(p ->> 'code', '') <> ''
    ) x
    left join plan_projecten pp on pp.yoobi_code = x.code
   where coalesce(pp.zichtbaar, true);
  return v;
end;
$function$;

create or replace function public.plan_taken_herreken(p_code text)
 returns integer
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_n integer;
begin
  with doel as (
    select t.crmtaskid,
           (plan_taak_start(t.plan_code, t.plan_fase_id) - t.plan_dagen_voor)
             + coalesce(t.gepland_op::time, time '17:00') as nieuw
      from taken t
     where t.plan_code is not null
       and t.plan_dagen_voor is not null
       and t.voltooid_op is null
       and t.status <> 'vervallen'
       and t.bron <> 'yoobi'
       and (p_code is null or t.plan_code = p_code)
  ), met_piep as (
    select d.crmtaskid, d.nieuw,
           (d.nieuw::date + case when d.nieuw::time = time '00:00' then time '09:00' else d.nieuw::time end)
             at time zone 'Europe/Amsterdam' as piep_nieuw
      from doel d
     where d.nieuw is not null
  )
  update taken t
     set gepland_op = m.nieuw,
         piep_op = case when t.piep then m.piep_nieuw else t.piep_op end,
         mail_op = case when t.piep and m.piep_nieuw > now() then null else t.mail_op end,
         push_op = case when t.piep and m.piep_nieuw > now() then null else t.push_op end
    from met_piep m
   where t.crmtaskid = m.crmtaskid
     and t.gepland_op is distinct from m.nieuw;
  get diagnostics v_n = row_count;
  return v_n;
end;
$function$;

create or replace function public.plan_taken_schuif_trg()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_code text;
begin
  begin
    if tg_table_name = 'fin_werkvoorraad' then
      v_code := null;
    elsif tg_op = 'DELETE' then
      v_code := old.yoobi_code;
    else
      v_code := new.yoobi_code;
    end if;
    perform plan_taken_herreken(v_code);
  exception when others then
    raise warning 'plan_taken_schuif_trg (%): %', tg_table_name, sqlerrm;
  end;
  return null;
end;
$function$;

create or replace function public.taken_plan_zet()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_start  date;
  v_naam   text;
  v_nieuw  timestamp;
  v_anders boolean;
begin
  if new.bron = 'yoobi' then return new; end if;

  if new.plan_code is null or new.plan_code = '' then
    if tg_op = 'UPDATE' and old.plan_code is not null then
      new.projectnaam := null;
    end if;
    new.plan_code := null; new.plan_fase_id := null; new.plan_dagen_voor := null;
    return new;
  end if;

  if new.plan_fase_id is not null and not exists (
       select 1 from plan_fasen f where f.id = new.plan_fase_id and f.yoobi_code = new.plan_code) then
    new.plan_fase_id := null;
  end if;

  v_anders := tg_op = 'INSERT'
           or new.plan_code       is distinct from old.plan_code
           or new.plan_fase_id    is distinct from old.plan_fase_id
           or new.plan_dagen_voor is distinct from old.plan_dagen_voor;
  if not v_anders then return new; end if;

  select p ->> 'naam' into v_naam
    from (select w.data from fin_werkvoorraad w order by w.peildatum desc limit 1) laatste,
         jsonb_array_elements(laatste.data -> 'projecten') p
   where p ->> 'code' = new.plan_code
   limit 1;
  if v_naam is not null and v_naam <> '' then new.projectnaam := v_naam; end if;

  if new.plan_dagen_voor is null then return new; end if;

  v_start := plan_taak_start(new.plan_code, new.plan_fase_id);
  if v_start is null then return new; end if;

  v_nieuw := (v_start - new.plan_dagen_voor) + coalesce(new.gepland_op::time, time '17:00');
  new.gepland_op := v_nieuw;
  if new.piep then
    new.piep_op := (v_nieuw::date + case when v_nieuw::time = time '00:00' then time '09:00' else v_nieuw::time end)
                   at time zone 'Europe/Amsterdam';
    if new.piep_op > now() then new.mail_op := null; new.push_op := null; end if;
  end if;
  return new;
end;
$function$;

-- Rechten zoals gemeten op 22-11-2026.
revoke all on function public.plan_taak_start(text, uuid) from public, anon;
revoke all on function public.plan_taak_projecten() from public, anon;
revoke all on function public.plan_taken_herreken(text) from public, anon, authenticated;
grant execute on function public.plan_taak_start(text, uuid) to authenticated, service_role;
grant execute on function public.plan_taak_projecten() to authenticated, service_role;
grant execute on function public.plan_taken_herreken(text) to service_role;

-- 4. Triggers ----------------------------------------------------------------

drop trigger if exists taken_plan_zet on public.taken;
create trigger taken_plan_zet
  before insert or update on public.taken
  for each row execute function taken_plan_zet();

drop trigger if exists trg_plan_fasen_taken_schuif on public.plan_fasen;
create trigger trg_plan_fasen_taken_schuif
  after insert or delete or update of van on public.plan_fasen
  for each row execute function plan_taken_schuif_trg();

drop trigger if exists trg_plan_projecten_taken_schuif on public.plan_projecten;
create trigger trg_plan_projecten_taken_schuif
  after insert or update of plan_start on public.plan_projecten
  for each row execute function plan_taken_schuif_trg();

drop trigger if exists trg_fin_werkvoorraad_taken_schuif on public.fin_werkvoorraad;
create trigger trg_fin_werkvoorraad_taken_schuif
  after insert or update on public.fin_werkvoorraad
  for each statement execute function plan_taken_schuif_trg();

notify pgrst, 'reload schema';
