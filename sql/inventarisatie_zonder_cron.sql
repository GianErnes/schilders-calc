-- ============================================================
-- INVENTARISATIE ZONDER CRON - terugvaloptie
-- ============================================================
-- Gebruik dit bestand ALLEEN als inventarisatie_automatiek.sql
-- afbreekt met een melding als:
--     relation "cron.job" does not exist
--
-- Dat betekent dat pg_cron op dit project niet aanstaat, en dus
-- dat er geen enkele cronjob draait. Dat is op zichzelf ook een
-- antwoord, en het hoort in het document.
--
-- Read-only. Verandert niets.
--
-- Betekenis van de kolommen per blok:
--   3. TRIGGER  naam = trigger, d1 = op tabel, d2 = aan/uit, d3 = functie
--   4. BUCKET   naam = bucket, d1 = aantal bestanden, d2 = publiek/prive, d3 = nieuwste bestand
--   5. TABEL    naam = tabel, d1 = exact aantal rijen, d2 = RLS, d3 = aantal policies
-- ============================================================

WITH b3_trig AS (
  SELECT
    '3. TRIGGER'::text                                               AS blok,
    t.tgname::text                                                   AS naam,
    c.relname::text                                                  AS d1,
    (CASE WHEN t.tgenabled = 'D' THEN 'UIT' ELSE 'actief' END)::text AS d2,
    p.proname::text                                                  AS d3
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
    ((xpath(
       '/row/cnt/text()',
       query_to_xml(
         'SELECT count(*) AS cnt FROM public.' || quote_ident(c.relname),
         false, true, ''
       )
     ))[1]::text || ' rijen')::text                                 AS d1,
    (CASE WHEN c.relrowsecurity THEN 'RLS aan' ELSE 'RLS UIT' END)::text AS d2,
    (SELECT count(*)::text || ' policies'
       FROM pg_policies pol
      WHERE pol.schemaname = 'public'
        AND pol.tablename  = c.relname)::text                       AS d3
  FROM pg_class     c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
)
SELECT * FROM b3_trig
UNION ALL SELECT * FROM b4_buckets
UNION ALL SELECT * FROM b5_tabellen
ORDER BY 1, 2;
