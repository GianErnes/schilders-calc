-- ============================================================
-- STAP 2 — FIX FUNCTIE set_updated_at
-- Wat: zet een vaste search_path op de functie.
-- Waarom: zonder vaste search_path kan een aanvaller theoretisch
--         een tabel met dezelfde naam in een ander schema injecteren
--         en zo de functie kapen. Met SET search_path = public, pg_temp
--         is dat onmogelijk.
-- Risico: nul. Alleen de functiedefinitie krijgt een extra setting,
--         de functielogica blijft identiek.
-- Effect op de app: geen.
-- ============================================================

ALTER FUNCTION public.set_updated_at()
  SET search_path = public, pg_temp;

-- Controle: search_path zou nu {search_path=public, pg_temp} moeten tonen
SELECT
  n.nspname  AS schema,
  p.proname  AS functie,
  p.proconfig AS nieuwe_config
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'set_updated_at';
