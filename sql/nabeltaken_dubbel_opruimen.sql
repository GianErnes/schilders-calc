-- nabeltaken_dubbel_opruimen.sql
-- Ernes Schilders · 3 augustus 2026
--
-- Sinds v2 van offerte_taken_sync maakt de trigger geen kale nabeltaak meer.
-- De Edge Function offerte-herinnering maakt in plaats daarvan een taak met
-- bron_kenmerk 'opvolg-bel', mét belscript en telefoonnummer.
--
-- Uit de overgang is één dubbele blijven staan: de testofferte van
-- 2 augustus kreeg nog een kale 'nabellen' van de oude trigger, en op
-- 3 augustus 06:30 een 'opvolg-bel' van de Edge Function.
--
-- Dit bestand zet zo'n kale nabeltaak op VERVALLEN, en alleen als er voor
-- dezelfde calculatie een opvolg-bel-taak bestaat. Beter een taak zonder
-- belscript dan helemaal geen nabellen.
--
-- Vervallen en niet verwijderen: dat is hoe offerte_taken_sync het overal
-- doet, en de rij blijft terugvindbaar.
--
-- IDEMPOTENT: een tweede keer draaien raakt niets, want dan staat de rij al
-- op vervallen.


-- ============================================================
-- BLOK A  Droogloop: wat zou er geraakt worden
-- ============================================================
-- Draai dit EERST. Verwachting op 3 augustus 2026: precies één rij, de
-- kale nabeltaak bij "Testen taken als gevolg van uitbrengen offerte".
-- Staat er meer, stop dan en kijk eerst wat het is.

select
  t.onderwerp,
  t.toegewezen_aan,
  t.status,
  t.gepland_op,
  t.aangemaakt,
  c.naam   as calculatie,
  c.status as calc_status
from taken t
join calculaties c on c.id = t.bron_ref
where t.bron = 'offerte'
  and t.bron_kenmerk = 'nabellen'
  and t.voltooid_op is null
  and t.status is distinct from 'vervallen'
  and exists (
    select 1
    from taken o
    where o.bron = 'offerte'
      and o.bron_kenmerk = 'opvolg-bel'
      and o.bron_ref = t.bron_ref
  )
order by t.gepland_op;


-- ============================================================
-- BLOK B  De wijziging
-- ============================================================
-- Pas draaien als blok A laat zien wat je verwacht.

update taken t
   set status  = 'vervallen',
       piep    = false,
       mail_op = null
 where t.bron = 'offerte'
   and t.bron_kenmerk = 'nabellen'
   and t.voltooid_op is null
   and t.status is distinct from 'vervallen'
   and exists (
     select 1
     from taken o
     where o.bron = 'offerte'
       and o.bron_kenmerk = 'opvolg-bel'
       and o.bron_ref = t.bron_ref
   );


-- ============================================================
-- BLOK C  Controle achteraf
-- ============================================================
-- Blok A opnieuw, moet nu leeg zijn. En de stand van alle nabeltaken.

select
  bron_kenmerk,
  status,
  count(*) filter (where voltooid_op is null)     as open,
  count(*) filter (where voltooid_op is not null) as afgevinkt
from taken
where bron = 'offerte'
  and bron_kenmerk in ('nabellen', 'opvolg-bel')
group by bron_kenmerk, status
order by bron_kenmerk, status;
