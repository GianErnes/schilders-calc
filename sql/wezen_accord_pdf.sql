-- =====================================================================
-- wezen_accord_pdf.sql
-- Brengt in beeld welke bestanden in de bak accord-pdf geen rij meer
-- hebben in offerte_accorderingen, en omgekeerd.
--
-- Leest alleen. Verandert niets. Mag zo vaak gedraaid worden als nodig.
-- Draaien in Supabase Studio, SQL Editor, project gjcjpigirqbpkjkymbio.
--
-- Blok A en B tonen eerst de VORM van beide kanten, zodat de vergelijking
-- in blok C op gemeten formaten rust en niet op een aanname over hoe
-- pdf_path is opgeslagen.
--
-- Opgesteld 2 augustus 2026, brok 1 van opruimpunt 19.
-- =====================================================================


-- ── A. Hoe ziet pdf_path eruit in de tabel ───────────────────────────
select 'A. vorm pdf_path' as blok,
       token,
       pdf_path,
       status,
       gereageerd_op
from offerte_accorderingen
where pdf_path is not null
order by gereageerd_op nulls last
limit 5;


-- ── B. Hoe ziet de bestandsnaam eruit in de opslag ───────────────────
select 'B. vorm opslag' as blok,
       name,
       (metadata->>'size')::bigint as bytes,
       created_at,
       updated_at
from storage.objects
where bucket_id = 'accord-pdf'
order by created_at
limit 5;


-- ── C. De telling ────────────────────────────────────────────────────
-- Beide kanten worden teruggebracht tot de kale bestandsnaam, zodat het
-- niet uitmaakt of pdf_path een map ervoor heeft staan of niet.
with opslag as (
  select name as pad,
         regexp_replace(name, '^.*/', '') as bestand,
         (metadata->>'size')::bigint      as bytes
  from storage.objects
  where bucket_id = 'accord-pdf'
),
rijen as (
  select token,
         pdf_path,
         regexp_replace(pdf_path, '^.*/', '') as bestand,
         status
  from offerte_accorderingen
  where pdf_path is not null
)
select 'C. telling' as blok,
       (select count(*) from opslag)                      as bestanden_in_bak,
       (select count(*) from rijen)                       as rijen_met_pdf_path,
       (select count(*) from offerte_accorderingen)       as rijen_totaal,
       (select count(*) from offerte_accorderingen
         where pdf_path is null)                          as rijen_zonder_pdf_path,
       (select count(*) from opslag o
         where not exists (select 1 from rijen r
                            where r.bestand = o.bestand)) as wezen_bestanden,
       (select count(*) from rijen r
         where not exists (select 1 from opslag o
                            where o.bestand = r.bestand)) as rijen_zonder_bestand,
       (select coalesce(sum(o.bytes), 0) from opslag o
         where not exists (select 1 from rijen r
                            where r.bestand = o.bestand)) as wezen_bytes;


-- ── D. De wezen zelf, met datum ──────────────────────────────────────
-- Om te kunnen beoordelen of het om oude of verse bestanden gaat.
with rijen as (
  select regexp_replace(pdf_path, '^.*/', '') as bestand
  from offerte_accorderingen
  where pdf_path is not null
)
select 'D. wezen' as blok,
       o.name,
       (o.metadata->>'size')::bigint as bytes,
       o.created_at,
       o.updated_at
from storage.objects o
where o.bucket_id = 'accord-pdf'
  and not exists (
        select 1 from rijen r
         where r.bestand = regexp_replace(o.name, '^.*/', '')
      )
order by o.created_at
limit 100;
