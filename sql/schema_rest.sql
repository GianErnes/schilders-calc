
-- ===== 1. EXTENSIES =====
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ===== 2. RIJBEVEILIGING =====
ALTER TABLE public.app_help_kb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_help_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bewerkingen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_regel_stappen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_regels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculatie_documenten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculatie_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculaties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_berichten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_dashboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_werkvoorraad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hoofdgroepen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materialen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetstaat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offerte_accorderingen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offerte_controle_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offerte_teksten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onderdelen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ondergronden ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onderhoudsplan_beurten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onderhoudsplan_externe_posten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onderhoudsplannen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_handmatig ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staart_lib ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taak_dagkeuze ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taak_documenten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taak_sjablonen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taken ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taken_melding_sleutels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taken_rollen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verfsysteem_stappen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verfsystemen ENABLE ROW LEVEL SECURITY;

-- ===== 3. RECHTEN =====
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.app_help_kb TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.app_help_kb TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.app_help_log TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.app_help_log TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.app_settings TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.app_settings TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.bewerkingen TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.bewerkingen TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.calc_regel_stappen TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.calc_regel_stappen TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.calc_regels TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.calc_regels TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.calculatie_documenten TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.calculatie_documenten TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.calculatie_fotos TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.calculatie_fotos TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.calculaties TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.calculaties TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.fin_berichten TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.fin_berichten TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.fin_dashboard TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.fin_dashboard TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.fin_werkvoorraad TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.fin_werkvoorraad TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.hoofdgroepen TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.hoofdgroepen TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.materialen TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.materialen TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.meetstaat TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.meetstaat TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.offerte_accorderingen TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.offerte_accorderingen TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.offerte_controle_log TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.offerte_controle_log TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.offerte_teksten TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.offerte_teksten TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.onderdelen TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.onderdelen TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.ondergronden TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.ondergronden TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.onderhoudsplan_beurten TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.onderhoudsplan_beurten TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.onderhoudsplan_externe_posten TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.onderhoudsplan_externe_posten TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.onderhoudsplannen TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.onderhoudsplannen TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.planning_handmatig TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.planning_handmatig TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.settings TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.settings TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.staart TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.staart TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.staart_lib TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.staart_lib TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.sync_state TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.sync_state TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taak_dagkeuze TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taak_dagkeuze TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taak_documenten TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taak_documenten TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taak_sjablonen TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taak_sjablonen TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taken TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taken TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taken_melding_sleutels TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taken_melding_sleutels TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taken_rollen TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.taken_rollen TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.todos TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.todos TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.verfsysteem_stappen TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.verfsysteem_stappen TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.verfsystemen TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.verfsystemen TO authenticated;

-- ===== 4. DATABASEFUNCTIES =====
CREATE OR REPLACE FUNCTION public.backup_dump_tabel(tabelnaam text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  uitkomst jsonb;
begin
  if not exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = tabelnaam
  ) then
    raise exception 'Onbekende tabel: %', tabelnaam;
  end if;

  execute format(
    'select coalesce(jsonb_agg(t), ''[]''::jsonb) from public.%I t',
    tabelnaam
  ) into uitkomst;

  return uitkomst;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.backup_tabellen()
 RETURNS text[]
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(array_agg(tablename order by tablename), '{}')
  from pg_tables
  where schemaname = 'public';
$function$
;
CREATE OR REPLACE FUNCTION public.offerte_taken_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  vandaag      date;
  plan_dag     date;
  plan_ts      timestamp;
  maandag      date;
  nu_lokaal    timestamp;
  projectnaam  text;
BEGIN
  vandaag   := (now() AT TIME ZONE 'Europe/Amsterdam')::date;
  nu_lokaal := (now() AT TIME ZONE 'Europe/Amsterdam');

  -- ── Calculatie verwijderd: open offerte-taken laten vervallen
  --    (de calc-taakspiegels volgen via de delete van hun todos) ──
  IF TG_OP = 'DELETE' THEN
    UPDATE taken
       SET status = 'vervallen', piep = false, mail_op = NULL
     WHERE bron = 'offerte'
       AND bron_ref = OLD.id
       AND voltooid_op IS NULL
       AND status IS DISTINCT FROM 'vervallen';
    RETURN OLD;
  END IF;

  -- ── Niets relevants gewijzigd: meteen klaar ──
  IF TG_OP = 'UPDATE'
     AND NEW.deadline_datum IS NOT DISTINCT FROM OLD.deadline_datum
     AND NEW.status         IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  projectnaam := COALESCE(NULLIF(NEW.naam, ''), 'zonder naam');

  -- ── Terugweg: van verzonden/geaccepteerd/verloren terug
  --    naar een open status ──
  IF TG_OP = 'UPDATE'
     AND OLD.status IN ('verzonden', 'geaccepteerd', 'verloren')
     AND NEW.status IN ('afspraak', 'concept', 'gereed') THEN

    -- uitbreng-taak heropenen; blok A hieronder zet direct
    -- de verse datum, piep en mail
    IF NEW.deadline_datum IS NOT NULL THEN
      UPDATE taken
         SET voltooid_op = NULL, status = 'actueel'
       WHERE bron = 'offerte'
         AND bron_ref = NEW.id
         AND bron_kenmerk = 'uitbrengen';
    END IF;

    -- nabel-taak vervalt zolang er niet opnieuw verzonden is
    UPDATE taken
       SET status = 'vervallen', piep = false, mail_op = NULL
     WHERE bron = 'offerte'
       AND bron_ref = NEW.id
       AND bron_kenmerk = 'nabellen'
       AND voltooid_op IS NULL
       AND status IS DISTINCT FROM 'vervallen';

    -- vervallen calc-taakspiegels herleven zolang de taak in
    -- Calc nog bestaat en open staat
    UPDATE taken t
       SET status = 'actueel'
      FROM todos td
     WHERE t.bron = 'offerte'
       AND t.bron_kenmerk = 'todo'
       AND t.bron_ref = td.id
       AND td.calculatie_id = NEW.id
       AND td.done = false
       AND t.voltooid_op IS NULL
       AND t.status = 'vervallen';
  END IF;

  -- ── A. Deadline aanwezig en offerte nog niet uitgebracht:
  --       taak 1 aanmaken of laten meeschuiven ──
  IF NEW.deadline_datum IS NOT NULL
     AND NEW.status IN ('afspraak', 'concept', 'gereed') THEN

    plan_dag := GREATEST(NEW.deadline_datum - 3, vandaag);
    plan_ts  := plan_dag + time '09:00';

    INSERT INTO taken
      (onderwerp, klantnaam, gepland_op, piep, piep_op,
       soort, toegewezen_aan, vandaag, bron, bron_ref, bron_kenmerk, status)
    VALUES
      ('Offerte uitbrengen · ' || projectnaam,
       NULLIF(NEW.klant, ''), plan_ts, true, plan_ts,
       'eenmalig', 'gian', false, 'offerte', NEW.id, 'uitbrengen', 'actueel')
    ON CONFLICT (bron_ref, bron_kenmerk) WHERE bron = 'offerte'
    DO UPDATE SET
       gepland_op = EXCLUDED.gepland_op,
       piep       = true,
       piep_op    = EXCLUDED.piep_op,
       mail_op    = NULL,
       status     = 'actueel',
       onderwerp  = EXCLUDED.onderwerp,
       klantnaam  = EXCLUDED.klantnaam
    WHERE taken.voltooid_op IS NULL;   -- afgevinkt blijft afgevinkt
  END IF;

  -- ── B. Deadline leeggehaald: open uitbreng-taak vervalt ──
  IF TG_OP = 'UPDATE'
     AND NEW.deadline_datum IS NULL
     AND OLD.deadline_datum IS NOT NULL THEN
    UPDATE taken
       SET status = 'vervallen', piep = false, mail_op = NULL
     WHERE bron = 'offerte'
       AND bron_ref = NEW.id
       AND bron_kenmerk = 'uitbrengen'
       AND voltooid_op IS NULL
       AND status IS DISTINCT FROM 'vervallen';
  END IF;

  -- ── C. Offerte uitgebracht (status naar verzonden):
  --       taak 1 afvinken, taak 2 nabellen voor Maud ──
  IF NEW.status = 'verzonden'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'verzonden') THEN

    UPDATE taken
       SET voltooid_op = nu_lokaal, piep = false, mail_op = NULL
     WHERE bron = 'offerte'
       AND bron_ref = NEW.id
       AND bron_kenmerk = 'uitbrengen'
       AND voltooid_op IS NULL
       AND status IS DISTINCT FROM 'vervallen';

    maandag := vandaag + (((7 - EXTRACT(isodow FROM vandaag)::int) % 7) + 1);
    plan_ts := maandag + time '13:30';

    INSERT INTO taken
      (onderwerp, klantnaam, gepland_op, piep, piep_op,
       soort, toegewezen_aan, vandaag, bron, bron_ref, bron_kenmerk, status)
    VALUES
      ('Nabellen offerte · ' || projectnaam,
       NULLIF(NEW.klant, ''), plan_ts, true, plan_ts,
       'eenmalig', 'maud', false, 'offerte', NEW.id, 'nabellen', 'actueel')
    ON CONFLICT (bron_ref, bron_kenmerk) WHERE bron = 'offerte'
    DO UPDATE SET                       -- vervallen nabel-taak herleeft
       gepland_op = EXCLUDED.gepland_op,
       piep       = true,
       piep_op    = EXCLUDED.piep_op,
       mail_op    = NULL,
       status     = 'actueel',
       onderwerp  = EXCLUDED.onderwerp,
       klantnaam  = EXCLUDED.klantnaam
    WHERE taken.voltooid_op IS NULL;   -- al nagebeld blijft nagebeld
  END IF;

  -- ── D. Geaccepteerd of verloren: open offerte-taken vervallen.
  --       Calc-taakspiegels alleen bij verloren; bij geaccepteerd
  --       loopt de klus en blijven ze open. ──
  IF NEW.status IN ('geaccepteerd', 'verloren')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN

    UPDATE taken
       SET status = 'vervallen', piep = false, mail_op = NULL
     WHERE bron = 'offerte'
       AND bron_ref = NEW.id
       AND bron_kenmerk IN ('uitbrengen', 'nabellen')
       AND voltooid_op IS NULL
       AND status IS DISTINCT FROM 'vervallen';

    IF NEW.status = 'verloren' THEN
      UPDATE taken t
         SET status = 'vervallen', piep = false, mail_op = NULL
        FROM todos td
       WHERE t.bron = 'offerte'
         AND t.bron_kenmerk = 'todo'
         AND t.bron_ref = td.id
         AND td.calculatie_id = NEW.id
         AND t.voltooid_op IS NULL
         AND t.status IS DISTINCT FROM 'vervallen';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.set_meld_mail(p_persoon text, p_mail text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  -- alleen kantoorrol 'alles' mag meldingsadressen beheren
  if not exists (
    select 1 from public.taken_rollen
    where user_id = auth.uid() and rol = 'alles'
  ) then
    raise exception 'Geen rechten om meldingsadressen te wijzigen';
  end if;

  -- leeg veld wordt netjes null
  update public.taken_rollen
     set mail = nullif(btrim(p_mail), '')
   where persoon = p_persoon;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.taken_bescherm_eigen()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if old.bron = 'eigen' and current_user = 'service_role' then
    return null;
  end if;
  return old;
end $function$
;
CREATE OR REPLACE FUNCTION public.taken_bevries_yoobi()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if old.bron = 'yoobi' and current_user = 'authenticated' then
    if new.crmtaskid    is distinct from old.crmtaskid
    or new.onderwerp    is distinct from old.onderwerp
    or new.username     is distinct from old.username
    or new.klantnaam    is distinct from old.klantnaam
    or new.klantcode    is distinct from old.klantcode
    or new.crmtasktype  is distinct from old.crmtasktype
    or new.gepland_op   is distinct from old.gepland_op
    or new.status       is distinct from old.status
    or new.laatst_gezien is distinct from old.laatst_gezien
    or new.aangemaakt   is distinct from old.aangemaakt
    or new.klant_tel    is distinct from old.klant_tel
    or new.bron         is distinct from old.bron then
      raise exception 'Yoobi-velden zijn alleen-lezen in de app';
    end if;
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.taken_dagkeuze_wis_taak(p_taak text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    declare
      aantal integer;
    begin
      if auth.uid() is null then
        raise exception 'Niet aangemeld';
      end if;
      if not exists (select 1 from public.taken_rollen r where r.user_id = auth.uid()) then
        raise exception 'Dit account is niet gekoppeld in taken_rollen';
      end if;

      delete from public.taak_dagkeuze where taak_id = p_taak;
      get diagnostics aantal = row_count;
      return aantal;
    end;
    $function$
;
CREATE OR REPLACE FUNCTION public.taken_mijn_persoon()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select r.persoon
    from public.taken_rollen r
   where r.user_id = auth.uid()
   limit 1
$function$
;
CREATE OR REPLACE FUNCTION public.taken_mijn_rol()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select r.rol
    from public.taken_rollen r
   where r.user_id = auth.uid()
   limit 1
$function$
;
CREATE OR REPLACE FUNCTION public.taken_persoon()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select persoon from taken_rollen where user_id = auth.uid() $function$
;
CREATE OR REPLACE FUNCTION public.taken_rol()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select rol from taken_rollen where user_id = auth.uid() $function$
;
CREATE OR REPLACE FUNCTION public.taken_sync_status()
 RETURNS TABLE(fase text, nog_te_gaan integer, bijgewerkt timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select fase,
         jsonb_array_length(coalesce(resterende, '[]'::jsonb)),
         bijgewerkt
  from sync_state
  where id = 1
$function$
;
CREATE OR REPLACE FUNCTION public.taken_todo_terug()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE todos
     SET done = (NEW.voltooid_op IS NOT NULL)
   WHERE id = NEW.bron_ref
     AND done IS DISTINCT FROM (NEW.voltooid_op IS NOT NULL);
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.taken_yoobi_naam()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select yoobi_naam from taken_rollen where user_id = auth.uid() $function$
;
CREATE OR REPLACE FUNCTION public.taken_zet_bijgewerkt()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.bijgewerkt = now();
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.todo_taken_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  nu_lokaal   timestamp;
  c_naam      text;
  c_klant     text;
  onderwerp_t text;
BEGIN
  nu_lokaal := (now() AT TIME ZONE 'Europe/Amsterdam');

  -- ── Taak in Calc verwijderd: spiegel naar Vervallen ──
  IF TG_OP = 'DELETE' THEN
    UPDATE taken
       SET status = 'vervallen', piep = false, mail_op = NULL
     WHERE bron = 'offerte'
       AND bron_kenmerk = 'todo'
       AND bron_ref = OLD.id
       AND voltooid_op IS NULL
       AND status IS DISTINCT FROM 'vervallen';
    RETURN OLD;
  END IF;

  -- Lege taakregels (net aangemaakt, nog geen tekst) niet spiegelen
  IF COALESCE(TRIM(NEW.tekst), '') = '' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(naam, ''), 'zonder naam'), NULLIF(klant, '')
    INTO c_naam, c_klant
    FROM calculaties WHERE id = NEW.calculatie_id;

  onderwerp_t := TRIM(NEW.tekst) || ' · ' || c_naam;

  -- ── Spiegel aanmaken of bijwerken ──
  INSERT INTO taken
    (onderwerp, klantnaam, gepland_op, piep, piep_op,
     soort, toegewezen_aan, vandaag, bron, bron_ref, bron_kenmerk,
     status, voltooid_op)
  VALUES
    (onderwerp_t, c_klant, NULL, false, NULL,
     'eenmalig', 'gian', false, 'offerte', NEW.id, 'todo',
     'actueel', CASE WHEN NEW.done THEN nu_lokaal ELSE NULL END)
  ON CONFLICT (bron_ref, bron_kenmerk) WHERE bron = 'offerte'
  DO UPDATE SET
     onderwerp = EXCLUDED.onderwerp,
     klantnaam = EXCLUDED.klantnaam,
     status    = 'actueel';

  -- ── Afvinkstand doorzetten, alleen als hij echt afwijkt ──
  IF TG_OP = 'INSERT' OR NEW.done IS DISTINCT FROM OLD.done THEN
    UPDATE taken
       SET voltooid_op = CASE WHEN NEW.done THEN nu_lokaal ELSE NULL END
     WHERE bron = 'offerte'
       AND bron_kenmerk = 'todo'
       AND bron_ref = NEW.id
       AND (voltooid_op IS NULL) = NEW.done;   -- alleen bij echt verschil
  END IF;

  RETURN NEW;
END;
$function$
;

-- ===== 5. TRIGGERS =====
CREATE TRIGGER bescherm_eigen BEFORE DELETE ON public.taken FOR EACH ROW EXECUTE FUNCTION taken_bescherm_eigen();
CREATE TRIGGER bevries_yoobi BEFORE UPDATE ON public.taken FOR EACH ROW EXECUTE FUNCTION taken_bevries_yoobi();
CREATE TRIGGER trg_bewerkingen_upd BEFORE UPDATE ON public.bewerkingen FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_materialen_upd BEFORE UPDATE ON public.materialen FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_offerte_taken AFTER INSERT OR DELETE OR UPDATE ON public.calculaties FOR EACH ROW EXECUTE FUNCTION offerte_taken_sync();
CREATE TRIGGER trg_ondergronden_upd BEFORE UPDATE ON public.ondergronden FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_settings_upd BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_taken_todo_terug AFTER UPDATE ON public.taken FOR EACH ROW WHEN (((new.bron = 'offerte'::text) AND (new.bron_kenmerk = 'todo'::text) AND (old.voltooid_op IS DISTINCT FROM new.voltooid_op))) EXECUTE FUNCTION taken_todo_terug();
CREATE TRIGGER trg_todo_taken AFTER INSERT OR DELETE OR UPDATE ON public.todos FOR EACH ROW EXECUTE FUNCTION todo_taken_sync();
CREATE TRIGGER trg_verfsystemen_upd BEFORE UPDATE ON public.verfsystemen FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER zet_bijgewerkt BEFORE UPDATE ON public.taken FOR EACH ROW EXECUTE FUNCTION taken_zet_bijgewerkt();

-- ===== 6. INDEXEN =====
CREATE INDEX app_help_kb_volgorde_idx ON public.app_help_kb USING btree (volgorde);
CREATE INDEX app_help_log_aangemaakt_idx ON public.app_help_log USING btree (aangemaakt_op DESC);
CREATE INDEX idx_bewerkingen_ondergrond ON public.bewerkingen USING btree (ondergrond_id);
CREATE INDEX idx_calc_regel_stappen_regel ON public.calc_regel_stappen USING btree (calc_regel_id);
CREATE INDEX idx_calc_regels_od ON public.calc_regels USING btree (onderdeel_id);
CREATE INDEX idx_externe_posten_plan_id ON public.onderhoudsplan_externe_posten USING btree (plan_id);
CREATE INDEX idx_hoofdgroepen_calc ON public.hoofdgroepen USING btree (calculatie_id);
CREATE INDEX idx_meetstaat_calc ON public.meetstaat USING btree (calculatie_id);
CREATE INDEX idx_meetstaat_regel ON public.meetstaat USING btree (calc_regel_id);
CREATE INDEX idx_offerte_accorderingen_calc ON public.offerte_accorderingen USING btree (calculatie_id);
CREATE INDEX idx_offerte_accorderingen_token ON public.offerte_accorderingen USING btree (token);
CREATE INDEX idx_onderdelen_hg ON public.onderdelen USING btree (hoofdgroep_id);
CREATE INDEX idx_onderhoudsplan_beurten_plan ON public.onderhoudsplan_beurten USING btree (plan_id, jaartal);
CREATE INDEX idx_staart_calc ON public.staart USING btree (calculatie_id);
CREATE INDEX idx_todos_calc ON public.todos USING btree (calculatie_id);
CREATE INDEX idx_verfsysteem_stappen_sys ON public.verfsysteem_stappen USING btree (verfsysteem_id);
CREATE INDEX idx_verfsystemen_ondergrond ON public.verfsystemen USING btree (ondergrond_id);
CREATE INDEX offerte_accorderingen_opvolging_idx ON public.offerte_accorderingen USING btree (status, gemaild_op) WHERE (automaat_uit = false);
CREATE INDEX offerte_controle_log_aangemaakt_op_idx ON public.offerte_controle_log USING btree (aangemaakt_op DESC);
CREATE INDEX planning_handmatig_klant_jaar_idx ON public.planning_handmatig USING btree (klant, jaartal);
CREATE INDEX taak_dagkeuze_persoon_dag ON public.taak_dagkeuze USING btree (persoon, dag);
CREATE INDEX taak_dagkeuze_taak ON public.taak_dagkeuze USING btree (taak_id);
CREATE UNIQUE INDEX taak_dagkeuze_uniek ON public.taak_dagkeuze USING btree (taak_id, persoon, dag);
CREATE INDEX taak_documenten_taak_idx ON public.taak_documenten USING btree (taak_id);
CREATE INDEX taken_mail_te_versturen ON public.taken USING btree (piep_op) WHERE ((piep = true) AND (mail_op IS NULL));
CREATE UNIQUE INDEX taken_offerte_uniek ON public.taken USING btree (bron_ref, bron_kenmerk) WHERE (bron = 'offerte'::text);
CREATE INDEX taken_status_idx ON public.taken USING btree (status);
CREATE INDEX taken_username_idx ON public.taken USING btree (username);
CREATE INDEX taken_voltooid_door_idx ON public.taken USING btree (voltooid_door, voltooid_op DESC) WHERE (voltooid_op IS NOT NULL);

-- ===== 7. POLICIES =====
CREATE POLICY "app_help_kb lezen (ingelogd)" ON public.app_help_kb AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "app_help_log aanvullen (ingelogd)" ON public.app_help_log AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "app_help_log lezen (ingelogd)" ON public.app_help_log AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY app_settings_insert ON public.app_settings AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY app_settings_select ON public.app_settings AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY app_settings_update ON public.app_settings AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles bewerkingen" ON public.bewerkingen AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles calc_regel_stappen" ON public.calc_regel_stappen AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles calc_regels" ON public.calc_regels AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY docs_authenticated_all ON public.calculatie_documenten AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY fotos_authenticated_all ON public.calculatie_fotos AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles calculaties" ON public.calculaties AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY fin_berichten_lezen_rol_alles ON public.fin_berichten AS PERMISSIVE FOR SELECT TO authenticated USING ((taken_rol() = 'alles'::text));
CREATE POLICY fin_dashboard_lezen_rol_alles ON public.fin_dashboard AS PERMISSIVE FOR SELECT TO authenticated USING ((taken_rol() = 'alles'::text));
CREATE POLICY fin_werkvoorraad_lezen_rol_alles ON public.fin_werkvoorraad AS PERMISSIVE FOR SELECT TO authenticated USING ((taken_rol() = 'alles'::text));
CREATE POLICY "anon alles hoofdgroepen" ON public.hoofdgroepen AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles materialen" ON public.materialen AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles meetstaat" ON public.meetstaat AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ingelogd alles offerte_accorderingen" ON public.offerte_accorderingen AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Ingelogde gebruikers lezen controle-log" ON public.offerte_controle_log AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY offerte_controle_log_select ON public.offerte_controle_log AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY offerte_teksten_authenticated_all ON public.offerte_teksten AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles onderdelen" ON public.onderdelen AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles ondergronden" ON public.ondergronden AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "eigen beurten alles" ON public.onderhoudsplan_beurten AS PERMISSIVE FOR ALL TO public USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY externe_posten_delete_own ON public.onderhoudsplan_externe_posten AS PERMISSIVE FOR DELETE TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY externe_posten_insert_own ON public.onderhoudsplan_externe_posten AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
CREATE POLICY externe_posten_select_own ON public.onderhoudsplan_externe_posten AS PERMISSIVE FOR SELECT TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY externe_posten_update_own ON public.onderhoudsplan_externe_posten AS PERMISSIVE FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "eigen plannen alles" ON public.onderhoudsplannen AS PERMISSIVE FOR ALL TO public USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY planning_handmatig_all ON public.planning_handmatig AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles settings" ON public.settings AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles staart" ON public.staart AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles staart_lib" ON public.staart_lib AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY taak_dagkeuze_lezen ON public.taak_dagkeuze AS PERMISSIVE FOR SELECT TO authenticated USING (((persoon = taken_mijn_persoon()) OR (taken_mijn_rol() = 'alles'::text)));
CREATE POLICY taak_dagkeuze_wissen ON public.taak_dagkeuze AS PERMISSIVE FOR DELETE TO authenticated USING ((persoon = taken_mijn_persoon()));
CREATE POLICY taak_dagkeuze_zetten ON public.taak_dagkeuze AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((persoon = taken_mijn_persoon()));
CREATE POLICY taak_doc_lezen ON public.taak_documenten AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM taken t
  WHERE (t.crmtaskid = taak_documenten.taak_id))));
CREATE POLICY taak_doc_toevoegen ON public.taak_documenten AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM taken t
  WHERE (t.crmtaskid = taak_documenten.taak_id))));
CREATE POLICY taak_doc_verwijderen ON public.taak_documenten AS PERMISSIVE FOR DELETE TO authenticated USING ((taken_persoon() = 'gian'::text));
CREATE POLICY sjablonen_aanmaken ON public.taak_sjablonen AS PERMISSIVE FOR INSERT TO public WITH CHECK ((taken_rol() = 'alles'::text));
CREATE POLICY sjablonen_bijwerken ON public.taak_sjablonen AS PERMISSIVE FOR UPDATE TO public USING ((taken_rol() = 'alles'::text)) WITH CHECK ((taken_rol() = 'alles'::text));
CREATE POLICY sjablonen_lezen ON public.taak_sjablonen AS PERMISSIVE FOR SELECT TO public USING ((taken_rol() IS NOT NULL));
CREATE POLICY sjablonen_verwijderen ON public.taak_sjablonen AS PERMISSIVE FOR DELETE TO public USING ((taken_rol() = 'alles'::text));
CREATE POLICY taken_aanmaken ON public.taken AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((bron = 'eigen'::text) AND ((taken_rol() = 'alles'::text) OR ((taken_rol() = 'eigen'::text) AND (toegewezen_aan = taken_persoon())))));
CREATE POLICY taken_bijwerken ON public.taken AS PERMISSIVE FOR UPDATE TO authenticated USING ((((bron = ANY (ARRAY['eigen'::text, 'offerte'::text])) AND ((taken_rol() = 'alles'::text) OR (toegewezen_aan = taken_persoon()))) OR ((bron = 'yoobi'::text) AND ((taken_rol() = 'alles'::text) OR (username = taken_yoobi_naam()))))) WITH CHECK ((((bron = ANY (ARRAY['eigen'::text, 'offerte'::text])) AND ((taken_rol() = 'alles'::text) OR (toegewezen_aan = taken_persoon()))) OR (bron = 'yoobi'::text)));
CREATE POLICY taken_klant_zicht ON public.taken AS PERMISSIVE FOR SELECT TO authenticated USING (((bron = 'yoobi'::text) AND (EXISTS ( SELECT 1
   FROM taken_rollen tr
  WHERE ((tr.user_id = auth.uid()) AND (tr.ziet_klant = true))))));
CREATE POLICY taken_lezen ON public.taken AS PERMISSIVE FOR SELECT TO authenticated USING (((taken_rol() = 'alles'::text) OR ((taken_rol() = 'eigen'::text) AND (((bron = ANY (ARRAY['eigen'::text, 'offerte'::text])) AND (toegewezen_aan = taken_persoon())) OR ((bron = 'yoobi'::text) AND (username = taken_yoobi_naam()))))));
CREATE POLICY taken_verwijderen ON public.taken AS PERMISSIVE FOR DELETE TO authenticated USING (((bron = ANY (ARRAY['eigen'::text, 'offerte'::text])) AND ((taken_rol() = 'alles'::text) OR (toegewezen_aan = taken_persoon()))));
CREATE POLICY rollen_lezen ON public.taken_rollen AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon alles todos" ON public.todos AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles verfsysteem_stappen" ON public.verfsysteem_stappen AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon alles verfsystemen" ON public.verfsystemen AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===== 8. OPSLAGBAKKEN =====
INSERT INTO storage.buckets (id, name, public) VALUES ('accord-pdf', 'accord-pdf', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('backups', 'backups', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('calculatie-documenten', 'calculatie-documenten', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('calculatie-fotos', 'calculatie-fotos', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('taken-documenten', 'taken-documenten', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('taken-fotos', 'taken-fotos', false) ON CONFLICT (id) DO NOTHING;

-- ===== 9. TOEGANGSREGELS OPSLAG =====
CREATE POLICY "accord-pdf authenticated insert" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'accord-pdf'::text));
CREATE POLICY "accord-pdf authenticated select" ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated USING ((bucket_id = 'accord-pdf'::text));
CREATE POLICY "accord-pdf authenticated update" ON storage.objects AS PERMISSIVE FOR UPDATE TO authenticated USING ((bucket_id = 'accord-pdf'::text)) WITH CHECK ((bucket_id = 'accord-pdf'::text));
CREATE POLICY "calculatie-fotos update voor ingelogde gebruikers" ON storage.objects AS PERMISSIVE FOR UPDATE TO authenticated USING ((bucket_id = 'calculatie-fotos'::text)) WITH CHECK ((bucket_id = 'calculatie-fotos'::text));
CREATE POLICY docs_obj_delete ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING ((bucket_id = 'calculatie-documenten'::text));
CREATE POLICY docs_obj_insert ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'calculatie-documenten'::text));
CREATE POLICY docs_obj_select ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated USING ((bucket_id = 'calculatie-documenten'::text));
CREATE POLICY fotos_obj_delete ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING ((bucket_id = 'calculatie-fotos'::text));
CREATE POLICY fotos_obj_insert ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'calculatie-fotos'::text));
CREATE POLICY fotos_obj_select ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated USING ((bucket_id = 'calculatie-fotos'::text));
CREATE POLICY taak_doc_storage_lezen ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated USING (((bucket_id = 'taken-documenten'::text) AND (taken_rol() IS NOT NULL)));
CREATE POLICY taak_doc_storage_upload ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'taken-documenten'::text) AND (taken_rol() IS NOT NULL)));
CREATE POLICY taak_doc_storage_verwijderen ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING (((bucket_id = 'taken-documenten'::text) AND (taken_persoon() = 'gian'::text)));
CREATE POLICY taken_fotos_lezen ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated USING ((bucket_id = 'taken-fotos'::text));
CREATE POLICY taken_fotos_schrijven ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'taken-fotos'::text));
CREATE POLICY taken_fotos_wissen ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING ((bucket_id = 'taken-fotos'::text));

-- ===== 10. CRONJOBS =====
SELECT cron.schedule('backup-nachtelijk', '0 2 * * *', 'select net.http_post(
     url := ''https://gjcjpigirqbpkjkymbio.supabase.co/functions/v1/backup-dump'',
     headers := jsonb_build_object(
       ''Content-Type'', ''application/json'',
       ''x-aftap-key'', ''4efb01682d2b092b8c30861662d9e15f22c81ac7976a5ca4''
     ),
     body := ''{}''::jsonb
   );');
SELECT cron.schedule('maandbericht-maandelijks', '0 7 7 * *', '
  select net.http_post(
    url := ''https://gjcjpigirqbpkjkymbio.supabase.co/functions/v1/maandbericht'',
    headers := jsonb_build_object(
      ''Content-Type'', ''application/json'',
      ''Authorization'', ''Bearer '' || (select decrypted_secret from vault.decrypted_secrets where name = ''maandbericht_key'')
    )
  );
  ');
SELECT cron.schedule('offerte-opvolging-werkdagen', '30 6 * * 1-5', '
  select net.http_post(
    url := ''https://gjcjpigirqbpkjkymbio.supabase.co/functions/v1/offerte-herinnering'',
    headers := jsonb_build_object(
      ''Content-Type'', ''application/json'',
      ''x-opvolg-key'', ''b2e66be7c28c8487c9826536ed99c362736f5b2bdbe1ffd4''
    ),
    body := ''{}''::jsonb
  );
  ');
SELECT cron.schedule('taken-mail-melding', '*/2 * * * *', '
    select net.http_post(
      url := ''https://gjcjpigirqbpkjkymbio.supabase.co/functions/v1/taken-mail-melding'',
      headers := jsonb_build_object(
        ''Content-Type'', ''application/json'',
        ''x-aftap-key'', ''4efb01682d2b092b8c30861662d9e15f22c81ac7976a5ca4''
      ),
      body := ''{}''::jsonb
    );
  ');
SELECT cron.schedule('werkvoorraad-sync-wekelijks', '0 6 * * 2', '
  select extensions.http((
    ''POST'',
    ''https://gjcjpigirqbpkjkymbio.supabase.co/functions/v1/fin-werkvoorraad-sync'',
    ARRAY[ extensions.http_header(''x-aftap-key'', ''4efb01682d2b092b8c30861662d9e15f22c81ac7976a5ca4'') ],
    ''application/json'',
    ''{}''
  )::extensions.http_request);
  ');
SELECT cron.schedule('yuki-vuller-dagelijks', '0 5 * * *', '
  select net.http_post(
    url := ''https://gjcjpigirqbpkjkymbio.supabase.co/functions/v1/smooth-function'',
    headers := jsonb_build_object(
      ''Content-Type'', ''application/json'',
      ''Authorization'', ''Bearer '' || (select decrypted_secret from vault.decrypted_secrets where name = ''maandbericht_key'')
    )
  );
  ');
SELECT cron.schedule('yuki-vuller-middag', '0 10 * * *', '
  select net.http_post(
    url := ''https://gjcjpigirqbpkjkymbio.supabase.co/functions/v1/smooth-function'',
    headers := jsonb_build_object(
      ''Content-Type'', ''application/json'',
      ''Authorization'', ''Bearer '' || (select decrypted_secret from vault.decrypted_secrets where name = ''maandbericht_key'')
    )
  );
  ');
