-- ============================================================
-- EXACTE RIJTELLING - schilders-calc
-- ============================================================
-- Vervangt de schatting uit de inventarisatiequery. Die gaf
-- nul terug bij tabellen die Postgres nog nooit geanalyseerd
-- had, ook als er data in zat.
--
-- Deze telt echt. Read-only, verandert niets.
-- ============================================================

SELECT
  c.relname::text AS tabel,
  (xpath(
     '/row/cnt/text()',
     query_to_xml(
       'SELECT count(*) AS cnt FROM public.' || quote_ident(c.relname),
       false, true, ''
     )
   ))[1]::text::bigint AS rijen
FROM pg_class     c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY 2 DESC, 1;
