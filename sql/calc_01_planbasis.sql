-- ============================================================
-- wagenpark_02_incident_taak_km.sql
-- Wagenpark stap 1, tweede SQL-bestand (22-11-2026).
-- Bouwt voort op wagenpark_01_tabellen.sql (21-11-2026).
--
-- Besluiten Gian 22-11-2026:
--   - De database houdt incident en taak gelijk, in beide richtingen
--     (niet de pagina).
--   - Een logboekregel met een hogere kilometerstand werkt de bus bij.
--
-- Wat dit bestand toevoegt:
--   1. Taak van een incident afgevinkt of teruggezet in de Takenapp
--      -> wp_logboek.status wordt afgehandeld of open.
--   2. Taak van een incident verwijderd in de Takenapp
--      -> wp_logboek.taak_id wordt leeg (de pagina toont dan
--         "incident zonder taak").
--   3. wp_logboek.status van een incident gewijzigd (pagina)
--      -> de taak wordt afgevinkt of teruggezet. Lukt dat niet, dan
--         mislukt het opslaan en ziet de gebruiker de fout.
--   4. Incident verwijderd uit het logboek
--      -> de open taak verdwijnt, een afgevinkte taak blijft staan
--         (zelfde regel als bij termijnen in bestand 01).
--   5. Logboekregel met kilometerstand
--      -> de bus krijgt die stand en de datum van de regel, alleen
--         als de stand hoger is dan wat de bus al heeft.
--
-- Wat dit bestand aan de tabel taken doet: twee triggers erbij,
--   wp_incident_taak_gewijzigd en wp_incident_taak_verwijderd.
--   Beide hebben een WHEN-voorwaarde op bron_kenmerk
--   'wagenpark-incident:...'; voor elke andere taak wordt de functie
--   niet eens aangeroepen. Beide vangen hun eigen fouten op: afvinken
--   of verwijderen van een taak kan hier nooit op stuklopen (er komt
--   dan een WARNING in het Postgres-logboek).
--   Geen kolom, geen policy en geen bestaande trigger is gewijzigd.
--
-- Idempotent: mag opnieuw gedraaid worden. In één keer draaien (één
-- transactie). De zelftest onderaan maakt een proefbus ZZ-TEST-98,
-- controleert het gedrag tegen de echte tabel taken en draait alles
-- terug. Mislukt een controle, dan mislukt het hele bestand en blijft
-- er niets achter.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Taak afgevinkt of teruggezet -> status van het incident
-- ------------------------------------------------------------
create or replace function public.wp_incident_taak_gewijzigd()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_id      uuid;
  v_status  text;
begin
  begin
    v_id     := nullif(split_part(new.bron_kenmerk, ':', 2), '')::uuid;
    v_status := case when new.voltooid_op is not null then 'afgehandeld' else 'open' end;

    update public.wp_logboek
       set status = v_status
     where id = v_id
       and soort = 'incident'
       and status is distinct from v_status;
  exception when others then
    -- Afvinken in de Takenapp mag nooit stuklopen op het wagenpark.
    raise warning 'wp_incident_taak_gewijzigd: status niet bijgewerkt voor taak %: %', new.crmtaskid, sqlerrm;
  end;
  return new;
end;
$function$;

drop trigger if exists wp_incident_taak_gewijzigd on public.taken;
create trigger wp_incident_taak_gewijzigd
  after update of voltooid_op on public.taken
  for each row
  when (new.bron_kenmerk like 'wagenpark-incident:%'
        and (old.voltooid_op is null) is distinct from (new.voltooid_op is null))
  execute function public.wp_incident_taak_gewijzigd();


-- ------------------------------------------------------------
-- 2. Taak verwijderd -> taak_id van het incident leeg
-- ------------------------------------------------------------
create or replace function public.wp_incident_taak_verwijderd()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_id  uuid;
begin
  begin
    v_id := nullif(split_part(old.bron_kenmerk, ':', 2), '')::uuid;

    update public.wp_logboek
       set taak_id = null
     where id = v_id
       and taak_id = old.crmtaskid;
  exception when others then
    -- Verwijderen in de Takenapp mag nooit stuklopen op het wagenpark.
    raise warning 'wp_incident_taak_verwijderd: taak_id niet leeggemaakt voor taak %: %', old.crmtaskid, sqlerrm;
  end;
  return old;
end;
$function$;

drop trigger if exists wp_incident_taak_verwijderd on public.taken;
create trigger wp_incident_taak_verwijderd
  after delete on public.taken
  for each row
  when (old.bron_kenmerk like 'wagenpark-incident:%')
  execute function public.wp_incident_taak_verwijderd();


-- ------------------------------------------------------------
-- 3. Status van het incident gewijzigd -> de taak
--    Bewust ZONDER foutopvang: lukt het bijwerken van de taak niet,
--    dan mislukt het opslaan van de status en ziet de gebruiker de
--    werkelijke fout. Anders zouden incident en taak stil uit elkaar
--    lopen.
-- ------------------------------------------------------------
create or replace function public.wp_logboek_status_naar_taak()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if new.status = 'afgehandeld' then
    update public.taken
       set voltooid_op   = now(),
           voltooid_door = public.taken_persoon()
     where crmtaskid = new.taak_id
       and voltooid_op is null
       and coalesce(bron_kenmerk, '') = 'wagenpark-incident:' || new.id::text;
  else
    update public.taken
       set voltooid_op   = null,
           voltooid_door = null
     where crmtaskid = new.taak_id
       and voltooid_op is not null
       and coalesce(bron_kenmerk, '') = 'wagenpark-incident:' || new.id::text;
  end if;
  return new;
end;
$function$;

drop trigger if exists wp_logboek_status_naar_taak on public.wp_logboek;
create trigger wp_logboek_status_naar_taak
  after update of status on public.wp_logboek
  for each row
  when (new.soort = 'incident'
        and new.taak_id is not null
        and old.status is distinct from new.status)
  execute function public.wp_logboek_status_naar_taak();


-- ------------------------------------------------------------
-- 4. Incident verwijderd -> de open taak verdwijnt
-- ------------------------------------------------------------
create or replace function public.wp_logboek_taak_weg()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  begin
    if old.taak_id is not null then
      delete from public.taken
       where crmtaskid = old.taak_id
         and voltooid_op is null
         and coalesce(bron_kenmerk, '') = 'wagenpark-incident:' || old.id::text;
    end if;
  exception when others then
    raise warning 'wp_logboek_taak_weg: taak % niet verwijderd: %', old.taak_id, sqlerrm;
  end;
  return old;
end;
$function$;

drop trigger if exists wp_logboek_taak_weg on public.wp_logboek;
create trigger wp_logboek_taak_weg
  after delete on public.wp_logboek
  for each row
  when (old.soort = 'incident')
  execute function public.wp_logboek_taak_weg();


-- ------------------------------------------------------------
-- 5. Kilometerstand van de logboekregel naar de bus
--    Alleen omhoog. Een lagere stand blijft op de regel staan en
--    laat de bus met rust. Een te hoog ingetikte stand herstel je
--    op de voertuigkaart zelf.
-- ------------------------------------------------------------
create or replace function public.wp_logboek_km_naar_voertuig()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  begin
    if new.km_stand is not null then
      update public.wp_voertuigen
         set km_stand    = new.km_stand,
             km_stand_op = new.datum
       where id = new.voertuig_id
         and (km_stand is null or new.km_stand > km_stand);
    end if;
  exception when others then
    -- Een logboekregel mag niet stuklopen op het bijwerken van de bus.
    raise warning 'wp_logboek_km_naar_voertuig: bus % niet bijgewerkt: %', new.voertuig_id, sqlerrm;
  end;
  return new;
end;
$function$;

drop trigger if exists wp_logboek_km_naar_voertuig on public.wp_logboek;
create trigger wp_logboek_km_naar_voertuig
  after insert or update of km_stand, datum, voertuig_id on public.wp_logboek
  for each row
  execute function public.wp_logboek_km_naar_voertuig();


-- ------------------------------------------------------------
-- 6. Zelftest. Alles binnen het binnenste blok wordt teruggedraaid.
-- ------------------------------------------------------------
do $zelftest$
declare
  v_bus     uuid;
  v_inc     uuid;
  v_inc2    uuid;
  v_inc3    uuid;
  v_taak    text;
  v_taak2   text;
  v_taak3   text;
  v_gewoon  text;
  v_km      integer;
  v_km_op   date;
  v_status  text;
  v_tekst   text;
  v_n       integer;
  v_uid     uuid;
  v_goed    integer := 0;
begin
  begin
    select r.user_id into v_uid from public.taken_rollen r where r.persoon = 'gian' limit 1;

    insert into public.wp_voertuigen (kenteken, naam)
    values ('ZZ-TEST-98', 'Zelftest wagenpark 02') returning id into v_bus;

    -- punt 1: kilometerstand bij een nieuwe regel
    insert into public.wp_logboek (voertuig_id, soort, omschrijving, km_stand, datum)
    values (v_bus, 'onderhoud', 'zelftest beurt', 1000, date '2026-01-10');
    select km_stand, km_stand_op into v_km, v_km_op from public.wp_voertuigen where id = v_bus;
    if v_km is distinct from 1000 or v_km_op is distinct from date '2026-01-10' then
      raise exception 'ZELFTEST 02 punt 1: bus heeft km % op %, verwacht 1000 op 2026-01-10', v_km, v_km_op;
    end if;
    v_goed := v_goed + 1;

    -- punt 2: een lagere stand laat de bus met rust
    insert into public.wp_logboek (voertuig_id, soort, omschrijving, km_stand, datum)
    values (v_bus, 'overig', 'zelftest lagere stand', 900, date '2026-02-01');
    select km_stand, km_stand_op into v_km, v_km_op from public.wp_voertuigen where id = v_bus;
    if v_km is distinct from 1000 or v_km_op is distinct from date '2026-01-10' then
      raise exception 'ZELFTEST 02 punt 2: bus heeft km % op %, verwacht ongewijzigd 1000', v_km, v_km_op;
    end if;
    v_goed := v_goed + 1;

    -- punt 3: incident krijgt een taak (bestand 01) en zet de km-stand
    insert into public.wp_logboek (voertuig_id, soort, omschrijving, incident_soort, km_stand, datum)
    values (v_bus, 'incident', 'zelftest incident', 'schade', 1200, date '2026-03-01')
    returning id, taak_id, status into v_inc, v_taak, v_status;
    select km_stand into v_km from public.wp_voertuigen where id = v_bus;
    if v_taak is null or v_status <> 'open' or v_km is distinct from 1200 then
      raise exception 'ZELFTEST 02 punt 3: taak %, status %, km %', v_taak, v_status, v_km;
    end if;
    v_goed := v_goed + 1;

    -- punt 4: taak afvinken zoals de Takenapp dat doet -> incident afgehandeld
    update public.taken set voltooid_op = now(), voltooid_door = 'gian' where crmtaskid = v_taak;
    select status into v_status from public.wp_logboek where id = v_inc;
    if v_status <> 'afgehandeld' then
      raise exception 'ZELFTEST 02 punt 4: status is % na afvinken van de taak', v_status;
    end if;
    v_goed := v_goed + 1;

    -- punt 5: taak terugzetten -> incident weer open
    update public.taken set voltooid_op = null, voltooid_door = null where crmtaskid = v_taak;
    select status into v_status from public.wp_logboek where id = v_inc;
    if v_status <> 'open' then
      raise exception 'ZELFTEST 02 punt 5: status is % na terugzetten van de taak', v_status;
    end if;
    v_goed := v_goed + 1;

    -- punt 6: status afgehandeld (pagina) -> taak afgevinkt
    update public.wp_logboek set status = 'afgehandeld' where id = v_inc;
    select count(*) into v_n from public.taken where crmtaskid = v_taak and voltooid_op is not null;
    if v_n <> 1 then
      raise exception 'ZELFTEST 02 punt 6: taak niet afgevinkt na status afgehandeld';
    end if;
    v_goed := v_goed + 1;

    -- punt 7: status open (pagina) -> taak teruggezet
    update public.wp_logboek set status = 'open' where id = v_inc;
    select count(*) into v_n from public.taken where crmtaskid = v_taak and voltooid_op is null and voltooid_door is null;
    if v_n <> 1 then
      raise exception 'ZELFTEST 02 punt 7: taak niet teruggezet na status open';
    end if;
    v_goed := v_goed + 1;

    -- punt 8: een andere wijziging aan de taak raakt het incident niet
    update public.taken set notitie = 'zelftest andere wijziging' where crmtaskid = v_taak;
    select status into v_status from public.wp_logboek where id = v_inc;
    if v_status <> 'open' then
      raise exception 'ZELFTEST 02 punt 8: status is % na een notitiewijziging', v_status;
    end if;
    v_goed := v_goed + 1;

    -- punt 9: taak verwijderd in de Takenapp -> taak_id leeg, incident blijft
    delete from public.taken where crmtaskid = v_taak;
    select taak_id, status into v_tekst, v_status from public.wp_logboek where id = v_inc;
    if v_tekst is not null or v_status <> 'open' then
      raise exception 'ZELFTEST 02 punt 9: taak_id %, status % na verwijderen van de taak', v_tekst, v_status;
    end if;
    v_goed := v_goed + 1;

    -- punt 10: status wijzigen zonder taak geeft geen fout
    update public.wp_logboek set status = 'afgehandeld' where id = v_inc;
    select status into v_status from public.wp_logboek where id = v_inc;
    if v_status <> 'afgehandeld' then
      raise exception 'ZELFTEST 02 punt 10: status is % bij een incident zonder taak', v_status;
    end if;
    v_goed := v_goed + 1;

    -- punt 11: open incident verwijderd -> de open taak verdwijnt
    insert into public.wp_logboek (voertuig_id, soort, omschrijving, incident_soort)
    values (v_bus, 'incident', 'zelftest incident twee', 'pech')
    returning id, taak_id into v_inc2, v_taak2;
    delete from public.wp_logboek where id = v_inc2;
    select count(*) into v_n from public.taken where crmtaskid = v_taak2;
    if v_taak2 is null or v_n <> 0 then
      raise exception 'ZELFTEST 02 punt 11: taak % bestaat nog % keer na verwijderen van het incident', v_taak2, v_n;
    end if;
    v_goed := v_goed + 1;

    -- punt 12: afgehandeld incident verwijderd -> de afgevinkte taak blijft als logregel
    insert into public.wp_logboek (voertuig_id, soort, omschrijving, incident_soort)
    values (v_bus, 'incident', 'zelftest incident drie', 'boete')
    returning id, taak_id into v_inc3, v_taak3;
    update public.wp_logboek set status = 'afgehandeld' where id = v_inc3;
    delete from public.wp_logboek where id = v_inc3;
    select count(*) into v_n from public.taken where crmtaskid = v_taak3 and voltooid_op is not null;
    if v_taak3 is null or v_n <> 1 then
      raise exception 'ZELFTEST 02 punt 12: afgevinkte taak % bestaat % keer na verwijderen van het incident', v_taak3, v_n;
    end if;
    v_goed := v_goed + 1;

    -- punt 13: een gewone eigen taak afvinken en verwijderen werkt en raakt het wagenpark niet
    insert into public.taken (bron, soort, status, onderwerp, toegewezen_aan, gepland_op, aangemaakt_door, piep)
    values ('eigen', 'eenmalig', 'actueel', 'zelftest gewone taak', 'gian',
            (now() at time zone 'Europe/Amsterdam')::timestamp(0), v_uid, false)
    returning crmtaskid into v_gewoon;
    update public.taken set voltooid_op = now(), voltooid_door = 'gian' where crmtaskid = v_gewoon;
    delete from public.taken where crmtaskid = v_gewoon;
    select count(*) into v_n from public.taken where crmtaskid = v_gewoon;
    if v_n <> 0 then
      raise exception 'ZELFTEST 02 punt 13: gewone taak niet te verwijderen';
    end if;
    v_goed := v_goed + 1;

    -- punt 14: kilometerstand bij het wijzigen van een bestaande regel
    update public.wp_logboek set km_stand = 1500 where voertuig_id = v_bus and omschrijving = 'zelftest lagere stand';
    select km_stand, km_stand_op into v_km, v_km_op from public.wp_voertuigen where id = v_bus;
    if v_km is distinct from 1500 or v_km_op is distinct from date '2026-02-01' then
      raise exception 'ZELFTEST 02 punt 14: bus heeft km % op %, verwacht 1500 op 2026-02-01', v_km, v_km_op;
    end if;
    v_goed := v_goed + 1;

    raise exception 'WP02_TERUGDRAAIEN';
  exception when others then
    -- Variabelen blijven staan, de gegevens niet. Elke andere fout gaat door
    -- naar buiten en laat het hele bestand mislukken.
    if sqlerrm <> 'WP02_TERUGDRAAIEN' then
      raise;
    end if;
  end;

  -- na het terugdraaien mag er niets achtergebleven zijn
  select count(*) into v_n from public.wp_voertuigen where kenteken = 'ZZ-TEST-98';
  if v_n <> 0 then
    raise exception 'ZELFTEST 02: proefbus ZZ-TEST-98 is achtergebleven';
  end if;
  select count(*) into v_n from public.taken
   where bron_ref = v_bus or crmtaskid in (v_taak, v_taak2, v_taak3, v_gewoon);
  if v_n <> 0 then
    raise exception 'ZELFTEST 02: % zelftesttaak/-taken achtergebleven', v_n;
  end if;

  if v_goed <> 14 then
    raise exception 'ZELFTEST 02: % van de 14 punten gehaald', v_goed;
  end if;
  raise notice 'wagenpark_02 zelftest: 14 punten GOED, alles teruggedraaid';
end;
$zelftest$;


-- ------------------------------------------------------------
-- 7. Controleregels (uitkomst: negen keer GOED)
-- ------------------------------------------------------------
select c.regel,
       case when c.goed then 'GOED' else 'FOUT' end as uitkomst
from (
  select 1 as nr, 'trigger wp_incident_taak_gewijzigd op taken, aan' as regel,
         exists (select 1 from pg_trigger t where t.tgrelid = 'public.taken'::regclass
                  and t.tgname = 'wp_incident_taak_gewijzigd' and t.tgenabled = 'O') as goed
  union all
  select 2, 'trigger wp_incident_taak_verwijderd op taken, aan',
         exists (select 1 from pg_trigger t where t.tgrelid = 'public.taken'::regclass
                  and t.tgname = 'wp_incident_taak_verwijderd' and t.tgenabled = 'O')
  union all
  select 3, 'beide triggers op taken hebben de WHEN-voorwaarde op wagenpark-incident',
         (select count(*) from pg_trigger t where t.tgrelid = 'public.taken'::regclass
           and t.tgname in ('wp_incident_taak_gewijzigd', 'wp_incident_taak_verwijderd')
           and pg_get_triggerdef(t.oid) like '%WHEN%wagenpark-incident:%') = 2
  union all
  select 4, 'trigger wp_logboek_status_naar_taak op wp_logboek, aan',
         exists (select 1 from pg_trigger t where t.tgrelid = 'public.wp_logboek'::regclass
                  and t.tgname = 'wp_logboek_status_naar_taak' and t.tgenabled = 'O')
  union all
  select 5, 'trigger wp_logboek_taak_weg op wp_logboek, aan',
         exists (select 1 from pg_trigger t where t.tgrelid = 'public.wp_logboek'::regclass
                  and t.tgname = 'wp_logboek_taak_weg' and t.tgenabled = 'O')
  union all
  select 6, 'trigger wp_logboek_km_naar_voertuig op wp_logboek, aan',
         exists (select 1 from pg_trigger t where t.tgrelid = 'public.wp_logboek'::regclass
                  and t.tgname = 'wp_logboek_km_naar_voertuig' and t.tgenabled = 'O')
  union all
  select 7, 'vijf nieuwe functies bestaan',
         (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public'
             and p.proname in ('wp_incident_taak_gewijzigd', 'wp_incident_taak_verwijderd',
                               'wp_logboek_status_naar_taak', 'wp_logboek_taak_weg',
                               'wp_logboek_km_naar_voertuig')) = 5
  union all
  select 8, 'geen proefbus ZZ-TEST-98 achtergebleven',
         not exists (select 1 from public.wp_voertuigen where kenteken = 'ZZ-TEST-98')
  union all
  select 9, 'de triggers uit bestand 01 staan er nog (wp_logboek_voor_insert, wp_termijn_taak_zet)',
         (select count(*) from pg_trigger t
           where t.tgname in ('wp_logboek_voor_insert', 'wp_termijn_taak_zet') and t.tgenabled = 'O') = 2
) c
order by c.nr;
