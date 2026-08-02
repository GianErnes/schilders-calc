-- =====================================================================
-- offerte_taken_sync_yoobi.sql
-- Opruimpunt 18: automatische taken rond offerte en akkoord.
--
-- Idempotent: `create or replace`. De trigger `trg_offerte_taken` op
-- `calculaties` blijft ongewijzigd en wijst er vanzelf naar.
--
-- Draaien in Supabase Studio, SQL Editor, project gjcjpigirqbpkjkymbio.
-- Opgesteld 2 augustus 2026.
--
-- ── WAT ERBIJ KOMT ───────────────────────────────────────────────────
--
-- Twee nieuwe taken, allebei voor Maud, allebei gepland op de
-- eerstvolgende maandag om 13:30, net als de bestaande nabeltaak. Maud
-- verwerkt op maandagmiddag, dus het moment van ontstaan doet er niet
-- toe.
--
--   bron_kenmerk = 'yoobi-verkoop'  bij status naar 'verzonden'
--                                   Stukken en calculatiegegevens in
--                                   Yoobi bij verkoop zetten.
--
--   bron_kenmerk = 'yoobi-akkoord'  bij status naar 'geaccepteerd'
--                                   De getekende offerte erbij zetten.
--
-- Doel is vindbaarheid en archief. Een PDF in een backupbak kun je
-- terughalen als je weet dat je hem kwijt bent; iets in Yoobi kun je
-- doorzoeken als een klant er over twee jaar over belt. Gian, 2 augustus
-- 2026: Yoobi is daarmee ook een tweede plek waar de gegevens staan.
--
-- ── DRIE ONTWERPBESLUITEN, EXPLICIET ─────────────────────────────────
--
-- 1. OPNIEUW VERSTUREN LEVERT GEEN NIEUW WERK OP.
--    Deze twee gebruiken `ON CONFLICT DO NOTHING`, niet `DO UPDATE`.
--    Bestaat de taak al, dan gebeurt er niets: niet heropenen, niet
--    verschuiven, niet opnieuw piepen. Dat is anders dan bij `nabellen`,
--    en met opzet: opnieuw versturen is een reden om opnieuw te bellen,
--    maar niet om dezelfde stukken nog een keer klaar te zetten.
--
-- 2. DEZE TAKEN VERVALLEN NOOIT BIJ EEN STATUSWISSELING.
--    Blok D laat `uitbrengen` en `nabellen` vervallen bij geaccepteerd of
--    verloren. De twee Yoobi-taken staan daar niet in en dat blijft zo.
--    Ook een verloren offerte hoort in het archief: je wilt over twee
--    jaar kunnen terugvinden wat je hebt aangeboden en waarom het niet
--    doorging. Hetzelfde geldt voor de terugweg naar concept.
--
-- 3. BIJ HET VERWIJDEREN VAN DE CALCULATIE VERVALLEN ZE WEL.
--    Het bovenste DELETE-blok laat álle open offerte-taken van die
--    calculatie vervallen, zonder te kijken naar het kenmerk. Dat is niet
--    gewijzigd: is de calculatie weg, dan zijn de stukken die in Yoobi
--    gezet moesten worden er ook niet meer. De taak zou dan naar niets
--    verwijzen.
--
-- ── WAT DIT NIET DOET ────────────────────────────────────────────────
--
-- Alleen nieuwe gevallen vanaf nu. Voor offertes die al verzonden of
-- geaccepteerd zijn ontstaat er niets met terugwerkende kracht. Wil je
-- dat wel, dan is dat een aparte eenmalige INSERT en die zou 31 taken
-- ineens opleveren.
-- =====================================================================

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
  --       taak 1 afvinken, taak 2 nabellen voor Maud,
  --       taak 3 stukken in Yoobi zetten voor Maud ──
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


-- ── CONTROLE 1: staat de nieuwe versie er echt ───────────────────────
-- Verwacht: security_definer = true, en beide nieuwe kenmerken komen voor.
-- Ga NIET af op "Success. No rows returned" hierboven.

select p.prosecdef                                    as security_definer,
       p.prosrc like '%yoobi-verkoop%'                as heeft_yoobi_verkoop,
       p.prosrc like '%yoobi-akkoord%'                as heeft_yoobi_akkoord,
       p.prosrc like '%DO NOTHING%'                   as heeft_do_nothing
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'offerte_taken_sync';


-- ── CONTROLE 2: wijst de trigger er nog naar ─────────────────────────
-- Verwacht: één rij, trg_offerte_taken op calculaties.

select c.relname as tabel, t.tgname, pg_get_triggerdef(t.oid) as definitie
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and not t.tgisinternal
  and c.relname = 'calculaties';
