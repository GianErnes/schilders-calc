-- wagenpark_01_tabellen.sql — 21-11-2026
-- Wagenpark, stap 1: de tabellen, de opslagmap en de koppeling met de Takenapp.
--
-- Aanleiding (Gian, 21-11-2026): beheer van de vier eigen bussen als onderdeel
-- van de suite. Stap 1: voertuigkaart, logboek met onderhoudsfacturen, incident
-- melden door de mannen (wordt een taak voor Gian), aandachtspunten per bus en
-- termijnen als taak. Banden, vloeistoffen en documenten volgen in stap 2.
--
-- Wat dit bestand doet:
--   1. Vijf tabellen: wp_voertuigen, wp_logboek, wp_bijlagen,
--      wp_aandachtspunten, wp_termijnen.
--   2. Rijbeveiliging volgens het huismodel (besluit Gian 21-11-2026, keuze A):
--      wie is ingelogd mag alles, wie niet is ingelogd mag niets.
--   3. Een afgesloten opslagmap 'wagenpark' voor facturen en foto's.
--   4. Incident in het logboek -> taak op naam van Gian.
--   5. Termijn -> taak (eenmalig of herhalend) voor de gekozen persoon.
--   6. Open aandachtspunten -> onderaan de notitie van de open onderhoudstaak.
--   7. Functie wp_termijnen_stand() waarmee de pagina de stand van de
--      gekoppelde taken kan lezen, ook voor wie die taak zelf niet mag zien.
--   8. Een zelftest met een proefbus die volledig wordt teruggedraaid.
--   9. Een controletabel als uitkomst.
--
-- Wat het NIET doet:
--   - Aan de tabel taken verandert niets: geen kolom, geen regel, geen trigger,
--     geen policy. Wagenparktaken zijn gewone taken met bron 'eigen', net als
--     de projecttaken van 19-11-2026. Herkenbaar aan bron_kenmerk
--     'wagenpark-incident:<id>' of 'wagenpark-termijn:<id>'; bron_ref is de bus.
--   - Er komt geen pagina mee. wagenpark.html volgt pas na bevestiging.
--
-- Bekende grens: vinkt iemand een herhalende termijntaak af, dan schuift de
-- Takenapp die taak zelf door. wp_termijnen.vervaldatum schuift NIET mee; de
-- pagina leest de actuele taakdatum via wp_termijnen_stand().
--
-- Terugvalgedrag:
--   - Lukt de taak bij een incident niet, dan wordt het incident WEL opgeslagen
--     (taak_id blijft leeg) en staat er een WARNING in het Postgres-logboek.
--   - Lukt de taak bij een termijn niet, dan wordt de termijn NIET opgeslagen
--     en krijgt de gebruiker de fout te zien. Een termijn zonder herinnering
--     is erger dan een foutmelding.
--   - Mislukt de zelftest, dan breekt het hele bestand af en is er niets
--     gewijzigd.
--
-- Idempotent: mag vaker gedraaid worden.


-- ---------------------------------------------------------------------
-- 0. Projectwacht: stopt als dit niet schilders-calc is.
-- ---------------------------------------------------------------------
do $wacht$
begin
  if to_regclass('public.taken') is null
     or to_regclass('public.taken_rollen') is null
     or to_regclass('public.fin_werkvoorraad') is null
     or to_regprocedure('public.taken_persoon()') is null
     or to_regprocedure('public.taken_rol()') is null then
    raise exception 'AFGEBROKEN: dit is niet het project schilders-calc. Niets gewijzigd.';
  end if;
end $wacht$;


-- ---------------------------------------------------------------------
-- 1. De tabellen
-- ---------------------------------------------------------------------
create table if not exists public.wp_voertuigen (
  id             uuid primary key default gen_random_uuid(),
  kenteken       text not null,
  naam           text,                 -- roepnaam, bijvoorbeeld "Bus Max"
  merk           text,
  type           text,
  bouwjaar       integer,
  aanschafdatum  date,
  aanschafprijs  numeric(10,2),
  vaste_rijder   text,                 -- persoon uit taken_rollen
  km_stand       integer,
  km_stand_op    date,
  actief         boolean not null default true,
  notitie        text,
  created_at     timestamp with time zone default now(),
  updated_at     timestamp with time zone default now(),
  constraint wp_voertuigen_kenteken_gevuld check (btrim(kenteken) <> ''),
  constraint wp_voertuigen_bouwjaar_bereik check (bouwjaar is null or bouwjaar between 1950 and 2100),
  constraint wp_voertuigen_km_bereik check (km_stand is null or km_stand >= 0)
);

-- Een kenteken komt een keer voor, ongeacht streepjes, spaties en hoofdletters.
create unique index if not exists wp_voertuigen_kenteken_uidx
  on public.wp_voertuigen (upper(regexp_replace(kenteken, '[^A-Za-z0-9]', '', 'g')));

create table if not exists public.wp_logboek (
  id               uuid primary key default gen_random_uuid(),
  voertuig_id      uuid not null references public.wp_voertuigen(id) on delete restrict,
  soort            text not null,
  datum            date not null default current_date,
  omschrijving     text not null,
  garage           text,
  bedrag           numeric(10,2),
  km_stand         integer,
  incident_soort   text,
  status           text not null,       -- wordt bij het aanmaken gezet door de trigger
  gemeld_door      text,
  aangemaakt_door  uuid,
  taak_id          text,                -- crmtaskid van de taak voor Gian (alleen bij een incident)
  created_at       timestamp with time zone default now(),
  updated_at       timestamp with time zone default now(),
  constraint wp_logboek_soort_check check (soort in ('onderhoud', 'reparatie', 'incident', 'overig')),
  constraint wp_logboek_incident_soort_check check (
    incident_soort is null or incident_soort in ('schade', 'pech', 'inbraak', 'boete', 'overig')),
  constraint wp_logboek_status_check check (status in ('open', 'afgehandeld')),
  constraint wp_logboek_omschrijving_gevuld check (btrim(omschrijving) <> ''),
  constraint wp_logboek_km_bereik check (km_stand is null or km_stand >= 0)
);

create index if not exists wp_logboek_voertuig_idx on public.wp_logboek (voertuig_id, datum desc);

create table if not exists public.wp_bijlagen (
  id            uuid primary key default gen_random_uuid(),
  voertuig_id   uuid not null references public.wp_voertuigen(id) on delete restrict,
  logboek_id    uuid references public.wp_logboek(id) on delete cascade,
  soort         text not null default 'overig',
  storage_path  text not null,
  bestandsnaam  text default '',
  grootte       bigint,
  created_at    timestamp with time zone default now(),
  constraint wp_bijlagen_soort_check check (soort in ('factuur', 'foto', 'overig')),
  constraint wp_bijlagen_pad_uniek unique (storage_path)
);

create index if not exists wp_bijlagen_logboek_idx on public.wp_bijlagen (logboek_id);
create index if not exists wp_bijlagen_voertuig_idx on public.wp_bijlagen (voertuig_id);

create table if not exists public.wp_aandachtspunten (
  id               uuid primary key default gen_random_uuid(),
  voertuig_id      uuid not null references public.wp_voertuigen(id) on delete restrict,
  tekst            text not null,
  gemeld_door      text,
  aangemaakt_door  uuid,
  afgehandeld_op   timestamp with time zone,
  afgehandeld_in   uuid references public.wp_logboek(id) on delete set null,
  created_at       timestamp with time zone default now(),
  updated_at       timestamp with time zone default now(),
  constraint wp_aandachtspunten_tekst_gevuld check (btrim(tekst) <> '')
);

create index if not exists wp_aandachtspunten_voertuig_idx on public.wp_aandachtspunten (voertuig_id);

create table if not exists public.wp_termijnen (
  id                 uuid primary key default gen_random_uuid(),
  voertuig_id        uuid not null references public.wp_voertuigen(id) on delete restrict,
  soort              text not null,
  omschrijving       text,
  vervaldatum        date not null,
  dagen_vooraf       integer not null default 14,
  herhaling_n        integer,
  herhaling_eenheid  text,
  toegewezen_aan     text,
  actief             boolean not null default true,
  taak_id            text,              -- crmtaskid van de gekoppelde taak
  created_at         timestamp with time zone default now(),
  updated_at         timestamp with time zone default now(),
  constraint wp_termijnen_soort_check check (
    soort in ('apk', 'onderhoud', 'verzekering', 'belasting', 'banden', 'vloeistoffen', 'overig')),
  constraint wp_termijnen_vooraf_bereik check (dagen_vooraf between 0 and 365),
  -- Dezelfde eenheden als taken.herhaling_eenheid.
  constraint wp_termijnen_eenheid_check check (
    herhaling_eenheid is null or herhaling_eenheid in ('dag', 'werkdag', 'week', 'maand', 'jaar')),
  constraint wp_termijnen_herhaling_compleet check (
    (herhaling_n is null and herhaling_eenheid is null)
    or (herhaling_n is not null and herhaling_n > 0 and herhaling_eenheid is not null))
);

create index if not exists wp_termijnen_voertuig_idx on public.wp_termijnen (voertuig_id);


-- ---------------------------------------------------------------------
-- 2. Rijbeveiliging, policy en rechten (sql/template_nieuwe_tabel.sql)
-- ---------------------------------------------------------------------
alter table public.wp_voertuigen      enable row level security;
alter table public.wp_logboek         enable row level security;
alter table public.wp_bijlagen        enable row level security;
alter table public.wp_aandachtspunten enable row level security;
alter table public.wp_termijnen       enable row level security;

drop policy if exists wp_voertuigen_authenticated_alles on public.wp_voertuigen;
create policy wp_voertuigen_authenticated_alles on public.wp_voertuigen
  for all to authenticated using (true) with check (true);

drop policy if exists wp_logboek_authenticated_alles on public.wp_logboek;
create policy wp_logboek_authenticated_alles on public.wp_logboek
  for all to authenticated using (true) with check (true);

drop policy if exists wp_bijlagen_authenticated_alles on public.wp_bijlagen;
create policy wp_bijlagen_authenticated_alles on public.wp_bijlagen
  for all to authenticated using (true) with check (true);

drop policy if exists wp_aandachtspunten_authenticated_alles on public.wp_aandachtspunten;
create policy wp_aandachtspunten_authenticated_alles on public.wp_aandachtspunten
  for all to authenticated using (true) with check (true);

drop policy if exists wp_termijnen_authenticated_alles on public.wp_termijnen;
create policy wp_termijnen_authenticated_alles on public.wp_termijnen
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on public.wp_voertuigen      to authenticated;
grant select, insert, update, delete on public.wp_logboek         to authenticated;
grant select, insert, update, delete on public.wp_bijlagen        to authenticated;
grant select, insert, update, delete on public.wp_aandachtspunten to authenticated;
grant select, insert, update, delete on public.wp_termijnen       to authenticated;

grant all on public.wp_voertuigen      to service_role;
grant all on public.wp_logboek         to service_role;
grant all on public.wp_bijlagen        to service_role;
grant all on public.wp_aandachtspunten to service_role;
grant all on public.wp_termijnen       to service_role;

revoke all on public.wp_voertuigen      from anon;
revoke all on public.wp_logboek         from anon;
revoke all on public.wp_bijlagen        from anon;
revoke all on public.wp_aandachtspunten from anon;
revoke all on public.wp_termijnen       from anon;


-- ---------------------------------------------------------------------
-- 3. Bijwerkdatum (gedeelde functie public.set_updated_at bestaat al en
--    wordt hier bewust niet opnieuw aangemaakt)
-- ---------------------------------------------------------------------
drop trigger if exists wp_voertuigen_set_updated_at on public.wp_voertuigen;
create trigger wp_voertuigen_set_updated_at before update on public.wp_voertuigen
  for each row execute function public.set_updated_at();

drop trigger if exists wp_logboek_set_updated_at on public.wp_logboek;
create trigger wp_logboek_set_updated_at before update on public.wp_logboek
  for each row execute function public.set_updated_at();

drop trigger if exists wp_aandachtspunten_set_updated_at on public.wp_aandachtspunten;
create trigger wp_aandachtspunten_set_updated_at before update on public.wp_aandachtspunten
  for each row execute function public.set_updated_at();

drop trigger if exists wp_termijnen_set_updated_at on public.wp_termijnen;
create trigger wp_termijnen_set_updated_at before update on public.wp_termijnen
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 4. Opslagmap voor facturen en foto's (afgesloten, alleen ingelogd)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('wagenpark', 'wagenpark', false)
on conflict (id) do nothing;

drop policy if exists wagenpark_authenticated_alles on storage.objects;
create policy wagenpark_authenticated_alles on storage.objects
  for all to authenticated
  using (bucket_id = 'wagenpark')
  with check (bucket_id = 'wagenpark');


-- ---------------------------------------------------------------------
-- 5. Hulpfuncties
-- ---------------------------------------------------------------------

-- Hoe een bus in een taaktitel heet: de roepnaam, anders het kenteken.
create or replace function public.wp_voertuig_label(p_voertuig uuid)
returns text
language sql
stable
set search_path to 'public', 'pg_temp'
as $function$
  select coalesce(nullif(btrim(v.naam), ''), v.kenteken)
    from public.wp_voertuigen v
   where v.id = p_voertuig;
$function$;

-- De open aandachtspunten van een bus als lijstje; null als er geen zijn.
create or replace function public.wp_aandachtspunten_blok(p_voertuig uuid)
returns text
language sql
stable
set search_path to 'public', 'pg_temp'
as $function$
  select string_agg('• ' || btrim(a.tekst), E'\n' order by a.created_at, a.id)
    from public.wp_aandachtspunten a
   where a.voertuig_id = p_voertuig
     and a.afgehandeld_op is null;
$function$;

-- Zet het lijstje onderaan een notitie, onder een vaste kopregel. Wat er
-- boven die kopregel staat (eigen tekst van de gebruiker) blijft behouden.
-- Zonder lijstje verdwijnt het blok.
create or replace function public.wp_notitie_met_blok(p_notitie text, p_blok text)
returns text
language plpgsql
immutable
set search_path to 'public', 'pg_temp'
as $function$
declare
  c_kop   constant text := '— Aandachtspunten voor de garage —';
  v_pos   integer;
  v_kern  text;
begin
  v_pos := position(c_kop in coalesce(p_notitie, ''));
  if v_pos > 0 then
    v_kern := left(p_notitie, v_pos - 1);
  else
    v_kern := coalesce(p_notitie, '');
  end if;
  v_kern := rtrim(v_kern, E' \n\r\t');

  if p_blok is null or btrim(p_blok) = '' then
    return nullif(v_kern, '');
  end if;

  return case when v_kern = '' then '' else v_kern || E'\n\n' end
         || c_kop || E'\n' || p_blok;
end;
$function$;


-- ---------------------------------------------------------------------
-- 6. Logboek: melder invullen en bij een incident een taak voor Gian
-- ---------------------------------------------------------------------
create or replace function public.wp_logboek_voor_insert()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_label    text;
  v_kort     text;
  v_onderw   text;
  v_notitie  text;
  v_uid      uuid;
begin
  new.gemeld_door     := coalesce(nullif(btrim(new.gemeld_door), ''), public.taken_persoon());
  new.aangemaakt_door := coalesce(new.aangemaakt_door, auth.uid());
  new.status          := coalesce(new.status,
                                  case when new.soort = 'incident' then 'open' else 'afgehandeld' end);

  if new.soort <> 'incident' then
    return new;
  end if;

  -- Het incident zelf mag nooit stuklopen op de taak.
  begin
    v_label := coalesce(public.wp_voertuig_label(new.voertuig_id), 'onbekende bus');
    v_kort  := btrim(split_part(new.omschrijving, E'\n', 1));
    if length(v_kort) > 60 then
      v_kort := left(v_kort, 57) || '...';
    end if;
    v_onderw := 'Incident · ' || v_label || ' · ' || v_kort;

    v_notitie := btrim(new.omschrijving)
      || E'\n\n'
      || 'Soort: ' || coalesce(new.incident_soort, 'niet opgegeven')
      || E'\n'
      || 'Gemeld door ' || coalesce(new.gemeld_door, 'onbekend')
      || ' op ' || to_char(new.datum, 'DD-MM-YYYY')
      || case when new.km_stand is not null then E'\nKilometerstand: ' || new.km_stand::text else '' end;

    -- De Takenapp toont een taak alleen als aangemaakt_door gevuld is
    -- (vastgesteld 03-11-2026). Zonder inlog (SQL Editor) valt dit terug op Gian.
    v_uid := coalesce(auth.uid(),
                      (select r.user_id from public.taken_rollen r where r.persoon = 'gian' limit 1));

    insert into public.taken
      (bron, bron_kenmerk, bron_ref, soort, status, onderwerp, notitie,
       toegewezen_aan, gepland_op, aangemaakt_door, piep)
    values
      ('eigen', 'wagenpark-incident:' || new.id::text, new.voertuig_id, 'eenmalig', 'actueel',
       v_onderw, v_notitie, 'gian',
       (now() at time zone 'Europe/Amsterdam')::timestamp(0), v_uid, false)
    returning crmtaskid into new.taak_id;
  exception when others then
    new.taak_id := null;
    raise warning 'wp_logboek_voor_insert: geen taak gemaakt voor incident %: %', new.id, sqlerrm;
  end;

  return new;
end;
$function$;

drop trigger if exists wp_logboek_voor_insert on public.wp_logboek;
create trigger wp_logboek_voor_insert
  before insert on public.wp_logboek
  for each row execute function public.wp_logboek_voor_insert();


-- ---------------------------------------------------------------------
-- 7. Termijn -> taak
-- ---------------------------------------------------------------------
create or replace function public.wp_termijn_taak_zet()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_persoon     text;
  v_label       text;
  v_onderw      text;
  v_blok        text;
  v_gepland     timestamp;
  v_datum_zet   boolean;
  v_herhalend   boolean;
  v_taak        text;
  v_uid         uuid;
begin
  -- Uitgezet: de open taak verdwijnt, een afgevinkte blijft als logregel staan.
  if not new.actief then
    if new.taak_id is not null then
      delete from public.taken
       where crmtaskid = new.taak_id
         and voltooid_op is null
         and coalesce(bron_kenmerk, '') = 'wagenpark-termijn:' || new.id::text;
    end if;
    new.taak_id := null;
    return new;
  end if;

  -- Alleen iemand die in de Takenapp taken kan krijgen; anders Gian.
  select r.persoon into v_persoon
    from public.taken_rollen r
   where r.persoon = new.toegewezen_aan
     and r.persoon <> 'administratie'
   limit 1;
  v_persoon := coalesce(v_persoon, 'gian');
  new.toegewezen_aan := v_persoon;

  v_label := coalesce(public.wp_voertuig_label(new.voertuig_id), 'onbekende bus');
  v_onderw := case new.soort
                when 'apk'          then 'APK'
                when 'onderhoud'    then 'Onderhoudsbeurt'
                when 'verzekering'  then 'Verzekering'
                when 'belasting'    then 'Motorrijtuigenbelasting'
                when 'banden'       then 'Banden'
                when 'vloeistoffen' then 'Vloeistoffen controleren'
                else 'Termijn'
              end
              || ' · ' || v_label
              || coalesce(' · ' || nullif(btrim(new.omschrijving), ''), '');

  -- Aandachtspunten horen alleen bij de onderhoudsbeurt.
  if new.soort = 'onderhoud' then
    v_blok := public.wp_aandachtspunten_blok(new.voertuig_id);
  else
    v_blok := null;
  end if;

  v_gepland   := (new.vervaldatum - new.dagen_vooraf) + time '08:00';
  v_herhalend := new.herhaling_n is not null and new.herhaling_eenheid is not null;

  -- De datum van een bestaande taak alleen aanraken als de vervaldatum of het
  -- aantal dagen vooraf echt is gewijzigd. Anders zou een tekstwijziging een
  -- herhaler terugzetten die de Takenapp al had doorgeschoven.
  if tg_op = 'INSERT' then
    v_datum_zet := true;
  else
    v_datum_zet := new.vervaldatum  is distinct from old.vervaldatum
                or new.dagen_vooraf is distinct from old.dagen_vooraf;
  end if;

  v_taak := null;
  if new.taak_id is not null then
    select t.crmtaskid into v_taak
      from public.taken t
     where t.crmtaskid = new.taak_id
       and t.voltooid_op is null
       and t.status is distinct from 'vervallen';
  end if;

  if v_taak is not null then
    update public.taken t
       set onderwerp         = v_onderw,
           toegewezen_aan    = v_persoon,
           soort             = case when v_herhalend then 'herhalend' else 'eenmalig' end,
           herhaling_n       = case when v_herhalend then new.herhaling_n end,
           herhaling_eenheid = case when v_herhalend then new.herhaling_eenheid end,
           bron_ref          = new.voertuig_id,
           notitie           = public.wp_notitie_met_blok(t.notitie, v_blok),
           gepland_op        = case when v_datum_zet then v_gepland else t.gepland_op end
     where t.crmtaskid = v_taak;
  else
    v_uid := coalesce(auth.uid(),
                      (select r.user_id from public.taken_rollen r where r.persoon = 'gian' limit 1));

    insert into public.taken
      (bron, bron_kenmerk, bron_ref, soort, status, onderwerp, notitie,
       toegewezen_aan, gepland_op, herhaling_n, herhaling_eenheid, aangemaakt_door, piep)
    values
      ('eigen', 'wagenpark-termijn:' || new.id::text, new.voertuig_id,
       case when v_herhalend then 'herhalend' else 'eenmalig' end, 'actueel',
       v_onderw, public.wp_notitie_met_blok(null, v_blok),
       v_persoon, v_gepland,
       case when v_herhalend then new.herhaling_n end,
       case when v_herhalend then new.herhaling_eenheid end,
       v_uid, false)
    returning crmtaskid into new.taak_id;
  end if;

  return new;
end;
$function$;

drop trigger if exists wp_termijn_taak_zet on public.wp_termijnen;
create trigger wp_termijn_taak_zet
  before insert or update on public.wp_termijnen
  for each row execute function public.wp_termijn_taak_zet();

-- Termijn verwijderd: de open taak gaat mee weg.
create or replace function public.wp_termijn_taak_weg()
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
         and coalesce(bron_kenmerk, '') = 'wagenpark-termijn:' || old.id::text;
    end if;
  exception when others then
    raise warning 'wp_termijn_taak_weg: taak % niet verwijderd: %', old.taak_id, sqlerrm;
  end;
  return old;
end;
$function$;

drop trigger if exists wp_termijn_taak_weg on public.wp_termijnen;
create trigger wp_termijn_taak_weg
  after delete on public.wp_termijnen
  for each row execute function public.wp_termijn_taak_weg();


-- ---------------------------------------------------------------------
-- 8. Aandachtspunten: melder invullen en de onderhoudstaak bijwerken
-- ---------------------------------------------------------------------
create or replace function public.wp_aandachtspunt_voor_insert()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  new.gemeld_door     := coalesce(nullif(btrim(new.gemeld_door), ''), public.taken_persoon());
  new.aangemaakt_door := coalesce(new.aangemaakt_door, auth.uid());
  return new;
end;
$function$;

drop trigger if exists wp_aandachtspunt_voor_insert on public.wp_aandachtspunten;
create trigger wp_aandachtspunt_voor_insert
  before insert on public.wp_aandachtspunten
  for each row execute function public.wp_aandachtspunt_voor_insert();

create or replace function public.wp_aandachtspunten_naar_taak()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_een   uuid;
  v_twee  uuid;
begin
  if tg_op = 'DELETE' then
    v_een := old.voertuig_id;
  elsif tg_op = 'UPDATE' then
    v_een := new.voertuig_id;
    if old.voertuig_id is distinct from new.voertuig_id then
      v_twee := old.voertuig_id;
    end if;
  else
    v_een := new.voertuig_id;
  end if;

  -- Een aandachtspunt opslaan mag nooit stuklopen op de taak.
  begin
    update public.taken t
       set notitie = public.wp_notitie_met_blok(t.notitie, public.wp_aandachtspunten_blok(m.voertuig_id))
      from public.wp_termijnen m
     where m.voertuig_id in (v_een, v_twee)
       and m.soort = 'onderhoud'
       and m.actief
       and t.crmtaskid = m.taak_id
       and t.voltooid_op is null;
  exception when others then
    raise warning 'wp_aandachtspunten_naar_taak: onderhoudstaak niet bijgewerkt: %', sqlerrm;
  end;

  return null;
end;
$function$;

drop trigger if exists wp_aandachtspunten_naar_taak on public.wp_aandachtspunten;
create trigger wp_aandachtspunten_naar_taak
  after insert or update or delete on public.wp_aandachtspunten
  for each row execute function public.wp_aandachtspunten_naar_taak();


-- ---------------------------------------------------------------------
-- 9. De stand van de termijnen met hun taak, voor de pagina
--    Nodig omdat iemand met rol 'eigen' de taak van een ander niet mag
--    lezen, maar op de wagenparkpagina wel moet zien of een termijn loopt.
--    Geeft alleen datum en open/dicht terug, geen taakinhoud.
-- ---------------------------------------------------------------------
create or replace function public.wp_termijnen_stand()
returns table (
  id                 uuid,
  voertuig_id        uuid,
  soort              text,
  omschrijving       text,
  vervaldatum        date,
  dagen_vooraf       integer,
  herhaling_n        integer,
  herhaling_eenheid  text,
  toegewezen_aan     text,
  actief             boolean,
  taak_id            text,
  taak_bestaat       boolean,
  taak_open          boolean,
  taak_gepland_op    timestamp
)
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  select m.id, m.voertuig_id, m.soort, m.omschrijving, m.vervaldatum, m.dagen_vooraf,
         m.herhaling_n, m.herhaling_eenheid, m.toegewezen_aan, m.actief, m.taak_id,
         (t.crmtaskid is not null),
         (t.crmtaskid is not null and t.voltooid_op is null and t.status is distinct from 'vervallen'),
         t.gepland_op
    from public.wp_termijnen m
    left join public.taken t on t.crmtaskid = m.taak_id
   where public.taken_rol() is not null;
$function$;


-- ---------------------------------------------------------------------
-- 10. Rechten op de functies
--     Triggerfuncties en hulpfuncties zijn niet bedoeld om van buiten aan
--     te roepen. Alleen wp_termijnen_stand() is voor ingelogde gebruikers.
-- ---------------------------------------------------------------------
revoke all on function public.wp_voertuig_label(uuid)            from public, anon, authenticated;
revoke all on function public.wp_aandachtspunten_blok(uuid)      from public, anon, authenticated;
revoke all on function public.wp_notitie_met_blok(text, text)    from public, anon, authenticated;
revoke all on function public.wp_logboek_voor_insert()           from public, anon, authenticated;
revoke all on function public.wp_termijn_taak_zet()              from public, anon, authenticated;
revoke all on function public.wp_termijn_taak_weg()              from public, anon, authenticated;
revoke all on function public.wp_aandachtspunt_voor_insert()     from public, anon, authenticated;
revoke all on function public.wp_aandachtspunten_naar_taak()     from public, anon, authenticated;
revoke all on function public.wp_termijnen_stand()               from public, anon;
grant execute on function public.wp_termijnen_stand()            to authenticated;


-- ---------------------------------------------------------------------
-- 11. Zelftest met een proefbus. Alles hierbinnen wordt teruggedraaid.
--     Mislukt er iets, dan breekt het hele bestand af.
-- ---------------------------------------------------------------------
do $zelftest$
declare
  v_bus      uuid;
  v_termijn  uuid;
  v_inc      uuid;
  v_punt     uuid;
  v_taak     text;
  v_rij      public.taken%rowtype;
  v_tekst    text;
  v_moment   timestamp;
  v_n        integer;
  v_fout     text := null;
begin
  begin
    insert into public.wp_voertuigen (kenteken, naam)
    values ('ZZ-TEST-99', 'Proefbus zelftest') returning id into v_bus;

    -- a. Herhalende onderhoudstermijn -> herhalende taak op de goede datum.
    insert into public.wp_termijnen
      (voertuig_id, soort, vervaldatum, dagen_vooraf, herhaling_n, herhaling_eenheid, toegewezen_aan)
    values (v_bus, 'onderhoud', date '2030-06-15', 14, 1, 'jaar', 'gian')
    returning id, taak_id into v_termijn, v_taak;

    if v_taak is null then
      raise exception 'a1: termijn kreeg geen taak';
    end if;
    select * into v_rij from public.taken where crmtaskid = v_taak;
    if not found then raise exception 'a2: taak % niet gevonden', v_taak; end if;
    if v_rij.gepland_op <> timestamp '2030-06-01 08:00' then
      raise exception 'a3: taakdatum is % in plaats van 2030-06-01 08:00', v_rij.gepland_op;
    end if;
    if v_rij.soort <> 'herhalend' or v_rij.herhaling_n <> 1 or v_rij.herhaling_eenheid <> 'jaar' then
      raise exception 'a4: taak is niet herhalend per jaar';
    end if;
    if v_rij.bron <> 'eigen' or v_rij.toegewezen_aan <> 'gian' or v_rij.aangemaakt_door is null then
      raise exception 'a5: bron, persoon of aangemaakt_door klopt niet';
    end if;
    if v_rij.onderwerp <> 'Onderhoudsbeurt · Proefbus zelftest' then
      raise exception 'a6: onderwerp is "%"', v_rij.onderwerp;
    end if;

    -- b. Aandachtspunt -> onderaan de notitie van de onderhoudstaak.
    insert into public.wp_aandachtspunten (voertuig_id, tekst, gemeld_door)
    values (v_bus, 'Piepende rem linksachter', 'max') returning id into v_punt;
    select notitie into v_tekst from public.taken where crmtaskid = v_taak;
    if coalesce(v_tekst, '') not like '%Piepende rem linksachter%' then
      raise exception 'b1: aandachtspunt staat niet in de taak';
    end if;

    -- c. Tekst wijzigen laat de (doorgeschoven) taakdatum met rust.
    update public.taken set gepland_op = timestamp '2031-06-01 08:00' where crmtaskid = v_taak;
    update public.wp_termijnen set omschrijving = 'grote beurt' where id = v_termijn;
    select * into v_rij from public.taken where crmtaskid = v_taak;
    if v_rij.gepland_op <> timestamp '2031-06-01 08:00' then
      raise exception 'c1: tekstwijziging heeft de taakdatum teruggezet';
    end if;
    if v_rij.onderwerp <> 'Onderhoudsbeurt · Proefbus zelftest · grote beurt' then
      raise exception 'c2: onderwerp niet bijgewerkt: "%"', v_rij.onderwerp;
    end if;
    if coalesce(v_rij.notitie, '') not like '%Piepende rem linksachter%' then
      raise exception 'c3: aandachtspunt verdween bij tekstwijziging';
    end if;

    -- d. Nieuwe vervaldatum zet de taakdatum wel.
    update public.wp_termijnen set vervaldatum = date '2032-03-10' where id = v_termijn;
    select gepland_op into v_moment from public.taken where crmtaskid = v_taak;
    if v_moment is distinct from timestamp '2032-02-25 08:00' then
      raise exception 'd1: taakdatum is % in plaats van 2032-02-25 08:00', v_moment;
    end if;

    -- e. Aandachtspunt afgehandeld -> uit de taak.
    update public.wp_aandachtspunten set afgehandeld_op = now() where id = v_punt;
    select notitie into v_tekst from public.taken where crmtaskid = v_taak;
    if coalesce(v_tekst, '') like '%Piepende rem%' then
      raise exception 'e1: afgehandeld aandachtspunt staat nog in de taak';
    end if;

    -- f. Incident -> eenmalige taak voor Gian.
    insert into public.wp_logboek (voertuig_id, soort, omschrijving, incident_soort, gemeld_door)
    values (v_bus, 'incident', 'Spiegel rechts eraf gereden', 'schade', 'max')
    returning id, taak_id into v_inc, v_taak;
    if v_taak is null then raise exception 'f1: incident kreeg geen taak'; end if;
    select * into v_rij from public.taken where crmtaskid = v_taak;
    if v_rij.toegewezen_aan <> 'gian' or v_rij.soort <> 'eenmalig' or v_rij.gepland_op is null
       or v_rij.aangemaakt_door is null then
      raise exception 'f2: incidenttaak klopt niet';
    end if;
    select count(*) into v_n from public.wp_logboek where id = v_inc and status = 'open';
    if v_n <> 1 then raise exception 'f3: incident staat niet op open'; end if;

    -- g. Gewone logboekregel -> geen taak, status afgehandeld.
    insert into public.wp_logboek (voertuig_id, soort, omschrijving, bedrag)
    values (v_bus, 'onderhoud', 'Kleine beurt', 245.50) returning taak_id into v_taak;
    if v_taak is not null then raise exception 'g1: onderhoudsregel kreeg onterecht een taak'; end if;

    -- h. Termijn uitgezet -> open taak weg.
    select taak_id into v_taak from public.wp_termijnen where id = v_termijn;
    update public.wp_termijnen set actief = false where id = v_termijn;
    select count(*) into v_n from public.taken where crmtaskid = v_taak;
    if v_n <> 0 then raise exception 'h1: taak van uitgezette termijn staat er nog'; end if;

    -- i. Hetzelfde kenteken, anders geschreven, wordt geweigerd.
    begin
      insert into public.wp_voertuigen (kenteken) values ('zz test 99');
      raise exception 'i1: dubbel kenteken werd geaccepteerd';
    exception when unique_violation then
      null;
    end;

    raise exception 'WP_ZELFTEST_TERUGDRAAIEN';
  exception when others then
    if sqlerrm <> 'WP_ZELFTEST_TERUGDRAAIEN' then
      v_fout := sqlerrm;
    end if;
  end;

  if v_fout is not null then
    raise exception 'ZELFTEST MISLUKT, niets gewijzigd: %', v_fout;
  end if;

  if exists (select 1 from public.wp_voertuigen where kenteken = 'ZZ-TEST-99') then
    raise exception 'ZELFTEST: de proefbus is niet teruggedraaid, niets gewijzigd.';
  end if;
end $zelftest$;


-- ---------------------------------------------------------------------
-- 12. Controle. Alle regels horen op GOED te staan.
-- ---------------------------------------------------------------------
with t(naam) as (
  values ('wp_voertuigen'), ('wp_logboek'), ('wp_bijlagen'), ('wp_aandachtspunten'), ('wp_termijnen')
),
c as (
  select t.naam,
    (select relrowsecurity from pg_class
      where relname = t.naam and relnamespace = 'public'::regnamespace) as rls,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = t.naam) as policies,
    (select count(*) from information_schema.role_table_grants
      where table_schema = 'public' and table_name = t.naam and grantee = 'authenticated') as rechten_auth,
    (select count(*) from information_schema.role_table_grants
      where table_schema = 'public' and table_name = t.naam and grantee = 'anon') as rechten_anon
  from t
)
select naam || ': dicht voor niet-ingelogd, open voor ingelogd' as controle,
       case when rls and policies > 0 and rechten_auth > 0 and rechten_anon = 0
            then 'GOED' else 'FOUT' end as stand
  from c
union all
select 'opslagmap wagenpark bestaat en is afgesloten',
       case when exists (select 1 from storage.buckets where id = 'wagenpark' and public = false)
            then 'GOED' else 'FOUT' end
union all
select 'policy op de opslagmap',
       case when exists (select 1 from pg_policies
                          where schemaname = 'storage' and tablename = 'objects'
                            and policyname = 'wagenpark_authenticated_alles')
            then 'GOED' else 'FOUT' end
union all
select 'vier koppeltriggers aanwezig',
       case when (select count(*) from pg_trigger
                   where not tgisinternal
                     and tgname in ('wp_logboek_voor_insert', 'wp_termijn_taak_zet',
                                    'wp_termijn_taak_weg', 'wp_aandachtspunten_naar_taak')) = 4
            then 'GOED' else 'FOUT' end
union all
select 'tabel taken ongewijzigd: geen wagenpark-trigger op taken',
       case when not exists (select 1 from pg_trigger
                              where tgrelid = 'public.taken'::regclass
                                and not tgisinternal and tgname like 'wp\_%')
            then 'GOED' else 'FOUT' end
union all
select 'zelftest met proefbus geslaagd en teruggedraaid', 'GOED'
union all
select 'proefbus niet achtergebleven',
       case when not exists (select 1 from public.wp_voertuigen where kenteken = 'ZZ-TEST-99')
            then 'GOED' else 'FOUT' end;
