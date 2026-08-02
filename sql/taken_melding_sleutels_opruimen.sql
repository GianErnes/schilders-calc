-- =====================================================================
-- taken_melding_sleutels_opruimen.sql
-- Laatste stap van opruimpunt 3 uit SYSTEEM.md.
--
-- DRAAI DE BLOKKEN LOS EN OP VOLGORDE. Blok A leest alleen. Blok B
-- verwijdert onherroepelijk. Draai B pas als je blok A gezien hebt.
--
-- Waarom deze tabel weg kan. Hij werd door twee Edge Functions gebruikt:
--   - taken-meldingen, verwijderd op 27 juli 2026
--   - taken-agenda, verwijderd op 2 augustus 2026
-- Gemeten op 2 augustus 2026: nul treffers op `taken_melding_sleutels`
-- in index.html, taken.html, financieel.html en voorraad-app_2.html.
-- taken-mail-melding gebruikt hem niet; die leest taken_rollen.
-- Er is dus niets meer dat deze tabel aanroept.
--
-- Draaien in Supabase Studio, SQL Editor, project gjcjpigirqbpkjkymbio.
-- Opgesteld 2 augustus 2026.
-- =====================================================================


-- ── BLOK A: eerst kijken wat erin zit ────────────────────────────────
--
-- De inhoud is een sleutel per persoon. Wil je ooit terug naar
-- agenda-abonnementen, dan is dit het enige dat opnieuw aangemaakt moet
-- worden. Bewaar de uitkomst van deze query als je die deur open wilt
-- houden. Wil je dat niet, dan is dit alleen een laatste blik voordat
-- het weggaat.
--
-- LET OP: de kolom `sleutel` is een wachtwoord. Bewaar de uitkomst niet
-- op een plek waar anderen bij kunnen, en zet hem niet in een openbare
-- repo. Wil je alleen weten HOEVEEL het er zijn zonder de sleutels te
-- zien, gebruik dan alleen het tweede deel hieronder.

select persoon, sleutel
from taken_melding_sleutels
order by persoon;

-- Alleen tellen, zonder de sleutels zichtbaar te maken:
select count(*) as aantal_sleutels,
       string_agg(persoon, ', ' order by persoon) as personen
from taken_melding_sleutels;


-- ── BLOK B: weghalen ─────────────────────────────────────────────────
--
-- Pas draaien als blok A gezien is. Dit is onherroepelijk: de tabel en
-- alles erin verdwijnen. Er zit geen backup van de inhoud in dit
-- bestand.
--
-- `if exists` zodat een tweede keer draaien geen fout geeft.

drop table if exists public.taken_melding_sleutels;


-- ── BLOK C: controle ─────────────────────────────────────────────────
-- Verwacht: bestaat_nog = false.

select exists (
  select 1
  from information_schema.tables
  where table_schema = 'public'
    and table_name   = 'taken_melding_sleutels'
) as bestaat_nog;
