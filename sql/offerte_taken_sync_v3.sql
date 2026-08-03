-- offerte_taken_sync_v3.sql
-- Ernes Schilders · 3 augustus 2026
--
-- WAAROM v3
-- Op 2 augustus is in v2 de kale nabeltaak uit blok C gehaald, omdat de
-- Edge Function offerte-herinnering diezelfde taak al maakt met
-- bron_kenmerk 'opvolg-bel', mét belscript en telefoonnummer.
--
-- Wat daarbij is blijven liggen: de plekken die een nabeltaak laten
-- VERVALLEN noemden alleen 'nabellen'. De nieuwe taak heet anders en bleef
-- dus staan. Gevolg: zet je een calculatie op geaccepteerd of verloren, dan
-- bleef de beltaak met belscript in de lijst van Maud staan en belde zij een
-- klant na over een offerte die al binnen was.
--
-- v3 voegt 'opvolg-bel' toe op de twee plekken waar dat hoort:
--   1. het terugweg-blok (van verzonden terug naar een open status)
--   2. blok D (geaccepteerd of verloren)
--
-- De DELETE-tak hoefde niet aangepast: die gaat op bron en bron_ref zonder
-- kenmerk, dus die pakte 'opvolg-bel' al mee.
--
-- Verder is er NIETS gewijzigd ten opzichte van de versie die op
-- 3 augustus 2026 in de database stond. Die is met pg_get_functiondef
-- teruggelezen en dit bestand is daarop gebouwd.
--
-- IDEMPOTENT: CREATE OR REPLACE, mag zo vaak gedraaid worden als nodig.
-- De trigger trg_offerte_taken op calculaties blijft ongewijzigd bestaan.


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
  --    Let op: dit raakt ook de Yoobi-taken, en dat is met opzet. Zie
  --    ontwerpbesluit 3 in de kop.
  --    Deze tak filtert niet op bron_kenmerk en pakt dus ook 'opvolg-bel'
  --    mee. Dat was al goed en blijft zo.
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
  --    De Yoobi-taken worden hier NIET aangeraakt. Het werk dat er lag
  --    blijft liggen, en werk dat gedaan is blijft gedaan.
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

    -- nabel-taken vervallen zolang er niet opnieuw verzonden is
    -- v3: 'opvolg-bel' toegevoegd. De offerte staat weer open, dus er valt
    -- niets na te bellen tot hij opnieuw de deur uit is. De Edge Function
    -- maakt dan zelf een verse beltaak met een nieuw belscript.
    UPDATE taken
       SET status = 'vervallen', piep = false, mail_op = NULL
     WHERE bron = 'offerte'
       AND bron_ref = NEW.id
       AND bron_kenmerk IN ('nabellen', 'opvolg-bel')
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
  --       taak 1 afvinken, taak 3 stukken in Yoobi zetten voor Maud ──
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

    -- VERVALLEN op 2 augustus 2026: hier stond een INSERT voor een taak met
    -- bron_kenmerk 'nabellen'. Die is weggehaald omdat de Edge Function
    -- offerte-herinnering diezelfde taak al maakt, met bron_kenmerk
    -- 'opvolg-bel', mét belscript en telefoonnummer in de notitie. Twee
    -- systemen die allebei aan nabellen dachten, dus stond er dubbel werk in
    -- de lijst van Maud.
    --
    -- Waarom dit kan zonder een gat te schieten: offerte-herinnering maakt
    -- die taak alleen als `gemaild_op` gevuld is, en dat gebeurt alleen bij
    -- mailen via de knop in de app. Gian bevestigde op 2 augustus 2026 dat
    -- offertes altijd zo de deur uit gaan; met de hand op verzonden zetten
    -- gebeurt niet. Verandert dat ooit, dan komt er bij zo'n offerte geen
    -- nabeltaak meer en moet dit terug.
    --
    -- De regels elders die een bestaande nabeltaak laten vervallen blijven
    -- staan, en noemen sinds v3 ook 'opvolg-bel'.

    -- NIEUW (opruimpunt 18): de stukken in Yoobi bij verkoop zetten.
    -- DO NOTHING en niet DO UPDATE: opnieuw versturen van dezelfde
    -- offerte levert geen nieuw werk op. Bestaat de taak al, in welke
    -- staat dan ook, dan blijft hij zoals hij is.
    INSERT INTO taken
      (onderwerp, klantnaam, gepland_op, piep, piep_op,
       soort, toegewezen_aan, vandaag, bron, bron_ref, bron_kenmerk, status)
    VALUES
      ('Stukken in Yoobi bij verkoop zetten · ' || projectnaam,
       NULLIF(NEW.klant, ''), plan_ts, true, plan_ts,
       'eenmalig', 'maud', false, 'offerte', NEW.id, 'yoobi-verkoop', 'actueel')
    ON CONFLICT (bron_ref, bron_kenmerk) WHERE bron = 'offerte'
    DO NOTHING;
  END IF;

  -- ── D. Geaccepteerd of verloren: open offerte-taken vervallen.
  --       Calc-taakspiegels alleen bij verloren; bij geaccepteerd
  --       loopt de klus en blijven ze open.
  --       De twee Yoobi-taken staan bewust NIET in de vervallijst:
  --       ook een verloren offerte hoort in het archief. ──
  IF NEW.status IN ('geaccepteerd', 'verloren')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN

    -- v3: 'opvolg-bel' toegevoegd. Dit is de reparatie waar het om begonnen
    -- was. De offerte is binnen of verloren, dus er valt niets meer na te
    -- bellen. Afgevinkte beltaken blijven staan (voltooid_op IS NULL).
    UPDATE taken
       SET status = 'vervallen', piep = false, mail_op = NULL
     WHERE bron = 'offerte'
       AND bron_ref = NEW.id
       AND bron_kenmerk IN ('uitbrengen', 'nabellen', 'opvolg-bel')
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

    -- NIEUW (opruimpunt 18): bij een akkoord de getekende offerte er in
    -- Yoobi bij zetten. Alleen bij geaccepteerd, want bij verloren is er
    -- niets getekend. Ook hier DO NOTHING.
    IF NEW.status = 'geaccepteerd' THEN
      maandag := vandaag + (((7 - EXTRACT(isodow FROM vandaag)::int) % 7) + 1);
      plan_ts := maandag + time '13:30';

      INSERT INTO taken
        (onderwerp, klantnaam, gepland_op, piep, piep_op,
         soort, toegewezen_aan, vandaag, bron, bron_ref, bron_kenmerk, status)
      VALUES
        ('Getekende offerte in Yoobi zetten · ' || projectnaam,
         NULLIF(NEW.klant, ''), plan_ts, true, plan_ts,
         'eenmalig', 'maud', false, 'offerte', NEW.id, 'yoobi-akkoord', 'actueel')
      ON CONFLICT (bron_ref, bron_kenmerk) WHERE bron = 'offerte'
      DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;


-- ============================================================
-- CONTROLE na het draaien
-- ============================================================
-- Hoort drie keer 'opvolg-bel' te tellen: één in het terugweg-blok, één in
-- blok D, en één in het commentaar van blok C.

select
  (length(pg_get_functiondef(p.oid))
   - length(replace(pg_get_functiondef(p.oid), 'opvolg-bel', ''))
  ) / length('opvolg-bel') as keer_opvolg_bel
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'offerte_taken_sync';
