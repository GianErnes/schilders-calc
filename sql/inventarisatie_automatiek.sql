-- ============================================================
-- INVENTARISATIE AUTOMATIEK - schilders-calc
-- ============================================================
-- Doel: uitdraai van alles wat automatisch draait, plus de
--       tabellen en buckets waar het op werkt.
--
-- Deze query LEEST alleen. Hij verandert niets en kan zo vaak
-- gedraaid worden als je wilt.
--
-- Alles komt terug in EEN resultaat, want Supabase Studio toont
-- bij meerdere SELECT-statements alleen de laatste.
--
-- Betekenis van de kolommen per blok:
--   1. CRONJOB      naam = job, d1 = schema, d2 = aan/uit, d3 = commando
--   2. LAATSTE RUN  naam = job, d1 = tijdstip, d2 = status, d3 = hoe lang geleden
--   3. TRIGGER      naam = trigger, d1 = op tabel, d2 = aan/uit, d3 = functie
--   4. BUCKET       naam = bucket, d1 = aantal bestanden, d2 = publiek/prive, d3 = nieuwste bestand
--   5. TABEL        naam = tabel, d1 = geschat aantal rijen, d2 = RLS, d3 = aantal policies
-- ============================================================

WITH b1_cron AS (
  SELECT
    '1. CRONJOB'::text                                              AS blok,
    COALESCE(j.jobname, 'jobid ' || j.jobid::text)::text            AS naam,
    j.schedule::text                                                AS d1,
    (CASE WHEN j.active THEN 'actief' ELSE 'UIT' END)::text         AS d2,
    left(regexp_replace(j.command, '\s+', ' ', 'g'), 140)::text     AS d3
  FROM cron.job j
),
b2_runs AS (
  SELECT DISTINCT ON (d.jobid)
    '2. LAATSTE RUN'::text                                          AS blok,
    COALESCE(j.jobname, 'jobid ' || d.jobid::text)::text            AS naam,
    to_char(d.start_time, 'DD-MM-YYYY HH24:MI')::text               AS d1,
    d.status::text                                                  AS d2,
    (round(extract(epoch FROM (now() - d.start_time)) / 3600)::int
      || ' uur geleden')::text                                      AS d3
  FROM cron.job_run_details d
  LEFT JOIN cron.job j ON j.jobid = d.jobid
  ORDER BY d.jobid, d.start_time DESC
),
b3_trig AS (
  SELECT
    '3. TRIGGER'::text                                              AS blok,
    t.tgname::text                                                  AS naam,
    c.relname::text                                                 AS d1,
    (CASE WHEN t.tgenabled = 'D' THEN 'UIT' ELSE 'actief' END)::text AS d2,
    p.proname::text                                                 AS d3
  FROM pg_trigger t
  JOIN pg_class     c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_proc      p ON p.oid = t.tgfoid
  WHERE NOT t.tgisinternal
    AND n.nspname = 'public'
),
b4_buckets AS (
  SELECT
    '4. BUCKET'::text                                               AS blok,
    b.name::text                                                    AS naam,
    (count(o.id)::text || ' bestanden')::text                       AS d1,
    (CASE WHEN b.public THEN 'PUBLIEK' ELSE 'prive' END)::text      AS d2,
    COALESCE(to_char(max(o.created_at), 'DD-MM-YYYY HH24:MI'),
             'leeg')::text                                          AS d3
  FROM storage.buckets b
  LEFT JOIN storage.objects o ON o.bucket_id = b.id
  GROUP BY b.name, b.public
),
b5_tabellen AS (
  SELECT
    '5. TABEL'::text                                                AS blok,
    c.relname::text                                                 AS naam,
    (GREATEST(c.reltuples, 0)::bigint::text || ' rijen (schatting)')::text AS d1,
    (CASE WHEN c.relrowsecurity THEN 'RLS aan' ELSE 'RLS UIT' END)::text  AS d2,
    (SELECT count(*)::text || ' policies'
       FROM pg_policies pol
      WHERE pol.schemaname = 'public'
        AND pol.tablename  = c.relname)::text                       AS d3
  FROM pg_class     c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
)
SELECT * FROM b1_cron
UNION ALL SELECT * FROM b2_runs
UNION ALL SELECT * FROM b3_trig
UNION ALL SELECT * FROM b4_buckets
UNION ALL SELECT * FROM b5_tabellen
ORDER BY 1, 2;
