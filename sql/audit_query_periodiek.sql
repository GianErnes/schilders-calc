-- ============================================================
-- AUDIT-QUERY — herhaalbaar
-- Draai eens per kwartaal in de Supabase SQL Editor om te checken
-- of er per ongeluk tabellen zonder RLS zijn ontstaan,
-- of dat anon ergens grants heeft gekregen.
-- ============================================================

-- A. Per tabel: RLS-status, aantal policies, samenvatting grants per rol
SELECT
  t.tablename AS tabel,
  CASE WHEN c.relrowsecurity THEN 'AAN' ELSE 'UIT  ⚠️' END AS rls,
  COALESCE(
    (SELECT count(*)
     FROM pg_policies
     WHERE schemaname = 'public' AND tablename = t.tablename), 0
  ) AS aantal_policies,
  COALESCE(
    (SELECT string_agg(grantee || ':' || privilege_type, ', '
            ORDER BY grantee, privilege_type)
     FROM information_schema.role_table_grants
     WHERE table_schema = 'public'
       AND table_name = t.tablename
       AND grantee = 'anon'),
    '(geen)'
  ) AS anon_rechten,
  COALESCE(
    (SELECT string_agg(DISTINCT privilege_type, ', '
            ORDER BY privilege_type)
     FROM information_schema.role_table_grants
     WHERE table_schema = 'public'
       AND table_name = t.tablename
       AND grantee = 'authenticated'),
    '(geen)'
  ) AS authenticated_rechten
FROM pg_tables t
JOIN pg_class c     ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE t.schemaname = 'public'
ORDER BY t.tablename;

-- B. Rode vlaggen — direct ingrijpen indien resultaten teruggeven worden
-- B1. Tabellen zonder RLS
SELECT 'RLS UIT' AS issue, t.tablename
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE t.schemaname = 'public' AND NOT c.relrowsecurity;

-- B2. Tabellen waar anon nog grants heeft
SELECT DISTINCT 'ANON HEEFT GRANT' AS issue, table_name AS tabel
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND grantee = 'anon';

-- B3. Tabellen met RLS aan, maar zonder policies (= onbereikbaar voor app)
SELECT 'RLS AAN ZONDER POLICY' AS issue, t.tablename
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE t.schemaname = 'public'
  AND c.relrowsecurity
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = t.tablename
  );
