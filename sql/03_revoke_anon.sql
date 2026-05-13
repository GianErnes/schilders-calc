-- ============================================================
-- STAP 3 — INTREKKEN VAN ANON-RECHTEN
-- Wat: haal alle rechten van de 'anon'-rol weg op alle huidige tabellen.
-- Waarom: jouw app vereist altijd login (e-mail/wachtwoord via Supabase
--         Auth). Na inloggen gebruikt supabase-js de rol 'authenticated'.
--         De rol 'anon' wordt nergens in de app gebruikt.
--         Op dit moment heeft 'anon' op elke tabel volledige rechten
--         (SELECT/INSERT/UPDATE/DELETE/TRUNCATE), wat wordt afgevangen
--         door RLS-policies die alleen voor 'authenticated' bestaan.
--         Maar dat is een fragiele verdediging: één foutieve nieuwe
--         policy of een per-ongeluk uitgeschakelde RLS opent de deur.
--         Door de grants van 'anon' helemaal weg te halen,
--         hebben we defense-in-depth: zelfs als RLS faalt, kan anon niets.
-- Risico: nul voor de bestaande app, die nooit zonder login werkt.
-- Effect op de app: geen.
-- ============================================================

BEGIN;

-- Trek alle privileges in voor anon op elke tabel afzonderlijk.
-- Lijst is exact de 16 tabellen uit de audit van vandaag.
REVOKE ALL ON public.app_settings         FROM anon;
REVOKE ALL ON public.bewerkingen          FROM anon;
REVOKE ALL ON public.calc_regel_stappen   FROM anon;
REVOKE ALL ON public.calc_regels          FROM anon;
REVOKE ALL ON public.calculaties          FROM anon;
REVOKE ALL ON public.hoofdgroepen         FROM anon;
REVOKE ALL ON public.materialen           FROM anon;
REVOKE ALL ON public.meetstaat            FROM anon;
REVOKE ALL ON public.onderdelen           FROM anon;
REVOKE ALL ON public.ondergronden         FROM anon;
REVOKE ALL ON public.settings             FROM anon;
REVOKE ALL ON public.staart               FROM anon;
REVOKE ALL ON public.staart_lib           FROM anon;
REVOKE ALL ON public.todos                FROM anon;
REVOKE ALL ON public.verfsysteem_stappen  FROM anon;
REVOKE ALL ON public.verfsystemen         FROM anon;

-- Verificatie binnen de transactie: hoeveel grants heeft anon nog?
-- Verwachte uitkomst: 0 regels voor public.<bovenstaande tabellen>.
DO $$
DECLARE
  resterend INT;
BEGIN
  SELECT count(*) INTO resterend
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public'
    AND grantee = 'anon'
    AND table_name IN (
      'app_settings','bewerkingen','calc_regel_stappen','calc_regels',
      'calculaties','hoofdgroepen','materialen','meetstaat','onderdelen',
      'ondergronden','settings','staart','staart_lib','todos',
      'verfsysteem_stappen','verfsystemen'
    );
  IF resterend > 0 THEN
    RAISE EXCEPTION 'Resterende anon-grants: % — ROLLBACK', resterend;
  ELSE
    RAISE NOTICE 'OK — alle anon-grants succesvol verwijderd op de 16 tabellen.';
  END IF;
END $$;

COMMIT;

-- Eind-controle (na commit): bekijk de resterende grants.
-- Authenticated en service_role moeten hun rechten nog hebben.
-- Anon mag op géén enkele tabel meer voorkomen.
SELECT
  table_name AS tabel,
  grantee    AS rol,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) AS rechten
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;
