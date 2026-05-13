-- ============================================================
-- STAP 1 — PRE-CHECK (read-only, geen wijzigingen)
-- Draai dit als eerste in de Supabase SQL Editor.
-- Bewaar de output (screenshot of kopieer) als "vóór-foto".
-- Na de wijzigingen draaien we dezelfde query opnieuw en vergelijken.
-- ============================================================

-- 1a. Grants per tabel + rol (samengevat)
SELECT
  table_name AS tabel,
  grantee    AS rol,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) AS rechten
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- 1b. Functie set_updated_at: huidige search_path
SELECT
  n.nspname  AS schema,
  p.proname  AS functie,
  p.proconfig AS huidige_config  -- toont {search_path=...} als gezet, anders NULL
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'set_updated_at';
