-- =====================================================================
-- taak_afvinkmelding_omzetten.sql
-- Opruimpunt 21: taak-melding-mail wordt taak-afvinkmelding.
--
-- Draaien in Supabase Studio, SQL Editor, project gjcjpigirqbpkjkymbio.
-- DRAAI DE BLOKKEN LOS EN OP VOLGORDE. Elk blok is idempotent, je kunt
-- het zo vaak draaien als je wilt.
--
-- VOLGORDE VAN DE HELE KLUS:
--   0. Edge Function taak-afvinkmelding aanmaken in Supabase Studio,
--      code plakken uit taak-afvinkmelding.ts, VERIFY JWT UIT, deployen
--   1. Blok A hier draaien: kijken welke taak er getest gaat worden
--   2. Blok B draaien: de nieuwe functie los aanroepen. Er komt een
--      echte mail bij je binnen over een taak die je eerder afvinkte
--   3. Blok B2 draaien: de uitkomst van die aanroep bekijken
--   4. Pas als B2 status 200 geeft: blok C draaien, de trigger omzetten
--   5. Blok D draaien: controleren dat de omzetting geslaagd is
--   6. Een echte taak afvinken MET tekst in de melding, mail afwachten
--   7. Pas dan de oude functie taak-melding-mail verwijderen in Studio
--
-- Gaat er iets mis tussen stap 4 en 7: blok E zet de trigger terug naar
-- de oude functie. Die staat er dan nog, dus dat werkt meteen.
--
-- Opgesteld 3 augustus 2026.
-- =====================================================================


-- ── BLOK A: welke taak wordt straks gebruikt voor de test ────────────
--
-- Blok B pakt automatisch de bovenste regel hieruit: de meest recent
-- afgevinkte taak met tekst in de melding. Kijk hem na. Krijg je straks
-- een mail met dit onderwerp, dan weet je zeker dat het de nieuwe
-- functie was en niet iets anders.
--
-- Geen enkele regel: dan is er geen afgevinkte taak met melding en kan
-- blok B niet draaien. Vink er eerst een af met tekst erbij.

select crmtaskid,
       onderwerp,
       voltooid_door,
       voltooid_op,
       left(btrim(afvink_melding), 60) as melding_begin
from public.taken
where voltooid_op is not null
  and afvink_melding is not null
  and btrim(afvink_melding) <> ''
order by voltooid_op desc
limit 5;


-- ── BLOK B: de nieuwe functie los aanroepen ──────────────────────────
--
-- Dit doet precies wat de trigger straks doet: sleutel uit de kluis,
-- zelfde kopregel, zelfde body. Alleen wijst het naar de nieuwe URL.
-- De trigger wordt hier nog niet aangeraakt.
--
-- LET OP: dit verstuurt een echte mail naar het adres dat in
-- taken_rollen bij persoon 'gian' staat.
--
-- Slaat de aanroep af, dan komt er een exception en is er niets stuk.

do $$
declare
  v_sleutel   text;
  v_taak      public.taken.crmtaskid%type;
  v_onderwerp text;
  v_req       bigint;
begin
  select decrypted_secret into v_sleutel
  from vault.decrypted_secrets
  where name = 'aftap_secret';

  if v_sleutel is null then
    raise exception 'aftap_secret niet gevonden in de kluis. Test afgebroken, er is niets verstuurd.';
  end if;

  select crmtaskid, onderwerp
    into v_taak, v_onderwerp
  from public.taken
  where voltooid_op is not null
    and afvink_melding is not null
    and btrim(afvink_melding) <> ''
  order by voltooid_op desc
  limit 1;

  if v_taak is null then
    raise exception 'Geen afgevinkte taak met melding gevonden. Vink er eerst een af met tekst erbij.';
  end if;

  select net.http_post(
    url     := 'https://gjcjpigirqbpkjkymbio.supabase.co/functions/v1/taak-afvinkmelding',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-aftap-key',  v_sleutel
               ),
    body    := jsonb_build_object('taak', v_taak)
  ) into v_req;

  raise notice 'Testaanroep verstuurd naar taak-afvinkmelding. Taak: % (%). Verzoeknummer: %',
    v_taak, coalesce(v_onderwerp, 'zonder onderwerp'), v_req;
end $$;


-- ── BLOK B2: de uitkomst van die aanroep ─────────────────────────────
--
-- Wacht een paar seconden na blok B en draai dit dan. De bovenste regel
-- is jouw testaanroep.
--
-- WAT JE WILT ZIEN:
--   status_code 200 en in content iets als {"verstuurd":1,...}
--
-- WAT HET BETEKENT ALS ER IETS ANDERS STAAT:
--   401  -> Verify JWT staat aan bij de nieuwe functie, of de sleutel
--           komt niet aan. Zet Verify JWT uit en draai blok B opnieuw
--   404  -> de functie bestaat nog niet of heet net anders. Controleer
--           de naam in Studio, hij moet exact taak-afvinkmelding zijn
--   500  -> de functie draait wel maar loopt vast. Kijk in de Logs van
--           taak-afvinkmelding wat er staat
--   leeg -> de aanroep loopt nog. Wacht en draai dit blok opnieuw
--
-- Deze tabel wordt door Supabase periodiek opgeschoond. Is hij leeg
-- terwijl blok B wel een verzoeknummer gaf, dan is dat de reden en kijk
-- je in plaats daarvan in de Logs van de functie zelf.

select id,
       status_code,
       content,
       error_msg,
       created
from net._http_response
order by id desc
limit 3;


-- ── BLOK C: de trigger omzetten naar de nieuwe functie ───────────────
--
-- PAS DRAAIEN ALS BLOK B2 STATUS 200 GAF.
--
-- Dit is de bestaande functie taak_melding_signaal, letterlijk zoals hij
-- er nu staat, met één wijziging: de URL onderin wijst naar
-- taak-afvinkmelding in plaats van taak-melding-mail. Verder is er niets
-- veranderd, ook de search_path en security definer blijven gelijk.

CREATE OR REPLACE FUNCTION public.taak_melding_signaal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'net', 'vault'
AS $function$
declare
  v_sleutel text;
begin
  -- Alleen bij een afgevinkte taak met tekst.
  if new.voltooid_op is null then
    return new;
  end if;
  if new.afvink_melding is null or btrim(new.afvink_melding) = '' then
    return new;
  end if;

  -- Bij een wijziging: alleen op de overgang naar afgevinkt, of als de
  -- tekst zelf verandert. Anders mailt elke latere bewerking opnieuw.
  if tg_op = 'UPDATE' then
    if old.voltooid_op is not null
       and old.afvink_melding is not distinct from new.afvink_melding then
      return new;
    end if;
  end if;

  select decrypted_secret into v_sleutel
  from vault.decrypted_secrets
  where name = 'aftap_secret';

  if v_sleutel is null then
    -- Geen sleutel betekent geen mail. De tekst staat wel bij de taak,
    -- dus er gaat niets verloren. Een fout gooien zou het afvinken zelf
    -- tegenhouden en dat is een zwaarder middel dan het geval verdient.
    raise warning 'taak_melding_signaal: aftap_secret niet gevonden, geen mail verstuurd voor taak %', new.crmtaskid;
    return new;
  end if;

  -- 3 augustus 2026: was taak-melding-mail, hernoemd naar
  -- taak-afvinkmelding (opruimpunt 21).
  perform net.http_post(
    url := 'https://gjcjpigirqbpkjkymbio.supabase.co/functions/v1/taak-afvinkmelding',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-aftap-key', v_sleutel
    ),
    body := jsonb_build_object('taak', new.crmtaskid)
  );

  return new;
end;
$function$;


-- ── BLOK D: controleren dat de omzetting geslaagd is ─────────────────
--
-- Verwacht: url_wijst_naar_nieuw = true, url_wijst_nog_naar_oud = false,
-- trigger_staat_aan = true.
--
-- Let op waarom er functions/v1/ voor staat. Op 3 augustus 2026 zocht
-- deze query eerst op de kale naam taak-melding-mail. Die kwam ook voor
-- in de commentaarregel die blok C zelf in de functie zet, en dus gaf
-- de controle tweemaal true terwijl de omzetting gewoon goed was. Een
-- controle die zijn eigen commentaar terugvindt meet niets.

select p.proname as functie,
       position('functions/v1/taak-afvinkmelding' in p.prosrc) > 0 as url_wijst_naar_nieuw,
       position('functions/v1/taak-melding-mail'  in p.prosrc) > 0 as url_wijst_nog_naar_oud
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'taak_melding_signaal';

select t.tgname                as trigger_naam,
       c.relname               as tabel,
       t.tgenabled = 'O'       as trigger_staat_aan
from pg_trigger t
join pg_class c     on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where not t.tgisinternal
  and n.nspname = 'public'
  and t.tgname = 'trg_taak_melding_signaal';


-- ── TERUGWEG ─────────────────────────────────────────────────────────
--
-- Gaat de afvinktest bij stap 6 mis, draai dan het losse bestand
-- taak_afvinkmelding_terugweg.sql. Dat zet de trigger terug naar de
-- oude functie taak-melding-mail. Werkt zolang die oude functie nog in
-- Supabase staat, dus zolang stap 7 nog niet gedaan is.
--
-- Het staat met opzet in een apart bestand, zodat het niet per ongeluk
-- meegedraaid kan worden.
