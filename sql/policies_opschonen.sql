-- =====================================================================
-- policies_opschonen.sql
-- Opruimpunt 16 en 17 uit SYSTEEM.md.
--
-- Idempotent: mag zo vaak gedraaid worden als nodig. Draai je hem twee
-- keer, dan doet de tweede keer niets en meldt hij dat ook.
--
-- Verandert GEEN rechten. Alleen namen, plus het weghalen van een
-- policy die letterlijk identiek is aan een andere op dezelfde tabel.
-- Wie er nu bij mag, mag er daarna nog steeds bij.
--
-- Draaien in Supabase Studio, SQL Editor, project gjcjpigirqbpkjkymbio.
-- Opgesteld 2 augustus 2026.
-- =====================================================================


-- ── PUNT 16: de policies die nog naar `anon` vernoemd zijn ───────────
--
-- Vijftien policies heten `anon alles <tabel>` terwijl ze `TO
-- authenticated` staan. Overblijfsel van vóór 13 mei 2026, toen de app
-- nog met de anon-sleutel werkte. De naam liegt dus, en wie de audit
-- draait schrikt van een rij policies die naar anon vernoemd zijn.
--
-- SYSTEEM.md sprak van "een stuk of tien". Gemeten op 2 augustus 2026
-- zijn het er vijftien.
--
-- De nieuwe naam is niet verzonnen: `offerte_accorderingen` heeft al
-- `ingelogd alles offerte_accorderingen`. Dezelfde vorm, met het woord
-- dat wél klopt.
--
-- Alleen de naam verandert. Het commando (ALL), de rol (authenticated)
-- en de voorwaarden blijven ongemoeid.

do $$
declare
  r record;
  nieuw text;
  aantal int := 0;
begin
  for r in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and policyname like 'anon alles %'
    order by tablename
  loop
    nieuw := 'ingelogd alles ' || substring(r.policyname from 12);

    -- Bestaat de nieuwe naam op deze tabel al, dan is er eerder iets
    -- half gedaan. Dan overslaan en melden in plaats van omvallen.
    if exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = r.tablename
        and policyname = nieuw
    ) then
      raise notice 'Overgeslagen: % heeft al een policy %', r.tablename, nieuw;
      continue;
    end if;

    execute format(
      'alter policy %I on public.%I rename to %I',
      r.policyname, r.tablename, nieuw
    );
    aantal := aantal + 1;
    raise notice 'Hernoemd op %: % -> %', r.tablename, r.policyname, nieuw;
  end loop;

  raise notice 'Punt 16 klaar: % policy(s) hernoemd.', aantal;
end $$;


-- ── PUNT 17: de dubbele leesregel op offerte_controle_log ────────────
--
-- Er staan twee policies op die tabel die op elk meetbaar punt gelijk
-- zijn: allebei SELECT, allebei TO authenticated, allebei PERMISSIVE,
-- allebei met voorwaarde `true`. Gemeten uit pg_policies op 2 augustus
-- 2026. Alleen de naam verschilt.
--
-- Twee permissieve SELECT-policies naast elkaar betekent in Postgres:
-- toegang als er minstens één toelaat. Eén weghalen verandert dus
-- niets, zolang de andere blijft staan.
--
-- Welke blijft: `offerte_controle_log_select`. Die past bij de vorm die
-- app_settings ook gebruikt (`app_settings_select`). De andere is een
-- zin in gewone taal en staat verder nergens zo.
--
-- LET OP: op deze tabel staat GEEN insert-policy. Er schrijft dus alleen
-- iets met de servicesleutel in, en dat gaat langs de rijbeveiliging
-- heen. Dat blijft zo; deze wijziging raakt het schrijven niet.

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'offerte_controle_log'
      and policyname = 'offerte_controle_log_select'
  ) then
    -- Alleen weghalen als de blijver er echt staat. Anders zou deze
    -- query de laatste leesregel slopen en kan niemand er meer bij.
    if exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'offerte_controle_log'
        and policyname = 'Ingelogde gebruikers lezen controle-log'
    ) then
      drop policy "Ingelogde gebruikers lezen controle-log" on public.offerte_controle_log;
      raise notice 'Punt 17 klaar: dubbele leesregel verwijderd.';
    else
      raise notice 'Punt 17: de dubbele stond er al niet meer.';
    end if;
  else
    raise notice 'Punt 17 OVERGESLAGEN: offerte_controle_log_select ontbreekt. Niets verwijderd, anders bleef er geen leesregel over.';
  end if;
end $$;


-- ── CONTROLE ─────────────────────────────────────────────────────────
-- Draai dit blok apart en kijk naar de uitkomst.
-- Verwacht: nul rijen met `anon` in de naam, en offerte_controle_log
-- met precies één policy.

select 'nog met anon in de naam' as controle,
       count(*)                  as aantal
from pg_policies
where schemaname = 'public'
  and policyname like 'anon%'

union all

select 'policies op offerte_controle_log', count(*)
from pg_policies
where schemaname = 'public'
  and tablename = 'offerte_controle_log'

union all

select 'policies in public totaal', count(*)
from pg_policies
where schemaname = 'public';
