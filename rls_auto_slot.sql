-- ============================================================
-- AUTOMATISCH SLOT VOOR RIJBEVEILIGING  (15 november 2026)
--
-- Wat dit doet:
--   1. Zet een slot in de database: elke NIEUWE tabel in public krijgt
--      vanzelf rijbeveiliging aan, hoe hij ook gemaakt wordt.
--   2. Werkt schema_dump() bij naar v3, zodat het slot meekomt als de
--      database ooit herbouwd wordt.
--   3. Test het slot met een proeftabel die direct weer wordt
--      teruggedraaid, en toont de uitslag.
--
-- Bestaande tabellen blijven ongemoeid. Twee keer draaien kan geen kwaad.
-- Het slot zet alleen de rijbeveiliging AAN. Een nieuwe tabel is daarna
-- dicht voor iedereen tot er een policy op staat: het sjabloon
-- sql/template_nieuwe_tabel.sql blijft dus nodig.
--
-- Noodschakelaar:  alter event trigger ensure_rls disable;
-- Weer aan:        alter event trigger ensure_rls enable;
-- ============================================================

-- ---------- 0. Projectwacht ----------
do $wacht$
begin
  if to_regclass('public.calculaties') is null
     or to_regprocedure('public.schema_dump()') is null then
    raise exception 'AFGEBROKEN: dit is niet het project schilders-calc. Niets gewijzigd.';
  end if;
end $wacht$;

-- ---------- 1. Het slot ----------
create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
set search_path = pg_catalog
as $$
declare
  cmd record;
begin
  for cmd in
    select *
      from pg_event_trigger_ddl_commands()
     where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
       and object_type = 'table'
       and schema_name = 'public'
       and not in_extension
  loop
    execute format('alter table if exists %s enable row level security', cmd.object_identity);
  end loop;
end;
$$;

revoke all on function public.rls_auto_enable() from public;

drop event trigger if exists ensure_rls;
create event trigger ensure_rls
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.rls_auto_enable();

-- ---------- 2. schema_dump naar v3 ----------
do $patch$
declare
  def   text;
  anker text := '  ------------------------------------------------------- opslagbakken' || E'\n';
  nieuw text := $nieuw$  ------------------------------------------------------ event triggers
  -- v3: het automatische slot (ensure_rls, zie sql/rls_auto_slot.sql) en
  -- elke andere event trigger waarvan de functie in public staat. De
  -- functie zelf staat al bij DATABASEFUNCTIES; dit is het haakje dat hem
  -- laat afgaan. Zonder deze sectie komt de functie wel mee naar een
  -- herbouwd project maar doet hij daar niets.
  uit := uit || E'\n-- ---------- EVENT TRIGGERS ----------\n';
  for r in
    select e.evtname, e.evtevent, e.evtenabled, e.evttags, p.proname
      from pg_catalog.pg_event_trigger e
      join pg_catalog.pg_proc p on p.oid = e.evtfoid
      join pg_catalog.pg_namespace ns on ns.oid = p.pronamespace
     where ns.nspname = 'public'
     order by e.evtname
  loop
    uit := uit
      || format('drop event trigger if exists %I;', r.evtname) || E'\n'
      || format('create event trigger %I on %s', r.evtname, r.evtevent)
      || coalesce(' when tag in ('
                  || (select string_agg(quote_literal(t), ', ') from unnest(r.evttags) t)
                  || ')', '')
      || format(' execute function public.%I();', r.proname) || E'\n'
      || case when r.evtenabled = 'D'
              then format('alter event trigger %I disable;', r.evtname) || E'\n'
              else '' end;
  end loop;

$nieuw$;
begin
  if (select md5(prosrc) from pg_proc where oid = 'public.schema_dump()'::regprocedure)
     = '1a35c1bec97906e6d30373152c485287' then
    return;  -- is al v3, niets te doen
  end if;
  if (select md5(prosrc) from pg_proc where oid = 'public.schema_dump()'::regprocedure)
     <> '0ebe9f1a2f2650c2b77e29ed937ab74e' then
    raise exception 'schema_dump is niet de verwachte v2, niets gewijzigd';
  end if;
  def := pg_get_functiondef('public.schema_dump()'::regprocedure);
  if (length(def) - length(replace(def, anker, ''))) / length(anker) <> 1 then
    raise exception 'anker niet precies 1 keer gevonden, niets gewijzigd';
  end if;
  execute replace(def, anker, nieuw || anker);
end
$patch$;

-- ---------- 3. Proef: tabel maken, meten, terugdraaien ----------
do $proef$
declare
  uitslag text := 'niet gemeten';
begin
  begin
    create table public.slot_proef_tijdelijk as select 1 as x;
    select case when relrowsecurity then 'aan' else 'UIT' end into uitslag
      from pg_class where oid = 'public.slot_proef_tijdelijk'::regclass;
    raise exception 'terugdraaien';
  exception when others then
    if sqlerrm <> 'terugdraaien' then uitslag := 'fout: ' || sqlerrm; end if;
  end;
  perform set_config('slot.proef', uitslag, false);
end $proef$;

-- ---------- 4. Controle: alle regels horen op GOED te staan ----------
select 'slot aanwezig en ingeschakeld' as controle,
       case when exists (select 1 from pg_event_trigger
                          where evtname = 'ensure_rls' and evtenabled = 'O')
            then 'GOED' else 'FOUT' end as stand
union all
select 'proeftabel kreeg rijbeveiliging',
       case when current_setting('slot.proef', true) = 'aan'
            then 'GOED' else 'FOUT: ' || coalesce(current_setting('slot.proef', true), '?') end
union all
select 'proeftabel is weer weg',
       case when to_regclass('public.slot_proef_tijdelijk') is null
            then 'GOED' else 'FOUT' end
union all
select 'schema_dump is v3',
       case when (select md5(prosrc) from pg_proc
                   where oid = 'public.schema_dump()'::regprocedure)
                 = '1a35c1bec97906e6d30373152c485287'
            then 'GOED' else 'FOUT' end
union all
select 'geen tabel in public zonder rijbeveiliging',
       case when not exists (select 1 from pg_class
                              where relnamespace = 'public'::regnamespace
                                and relkind in ('r','p') and not relrowsecurity)
            then 'GOED' else 'FOUT' end;
