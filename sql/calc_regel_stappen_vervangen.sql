-- calc_regel_stappen_vervangen.sql — v4.114.0 (2026-11-08)
-- Controlerapport 2026-11-08, bevinding 3.
--
-- Aanleiding: wisselRegelSysteem (v4.65.0) en stappenToepassen (v4.108.0) in
-- index.html deden per regel drie losse netwerkcalls: nieuwe stappen invoegen,
-- oude stappen wissen, regel bijwerken. Tussen call 1 en 2 had de regel beide
-- sets bewerkingen. Viel de verbinding weg of liep de delete in de 30 s-timeout,
-- dan bleven beide staan en toonde de regel na herladen dubbele uren en dubbel
-- materiaal. Gemeten 08-11-2026: nog nooit gebeurd (0 regels met dubbele
-- volgorde); dit is een preventieve reparatie.
--
-- Deze functie wist en voegt in binnen één transactie. Mislukt er iets, dan
-- draait Postgres alles terug en blijft de oude toestand staan.
--
-- Rechten: security invoker; RLS op calc_regel_stappen is "authenticated alles"
-- (gecontroleerd 08-11-2026), dus de aanroeper mag dit al.
-- Prullenbak: de BEFORE DELETE-trigger calc_regel_stappen_prullenbak (v4.96.0)
-- vuurt gewoon binnen deze functie. Dat was bij de oude route ook zo; losse
-- stappen zijn in prullenbak_overzicht niet zichtbaar en worden na 90 dagen
-- opgeruimd.
--
-- Idempotent: create or replace.

create or replace function public.calc_regel_stappen_vervangen(
  p_regel_id uuid,
  p_stappen  jsonb
)
returns setof public.calc_regel_stappen
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_regel_id is null then
    raise exception 'calc_regel_stappen_vervangen: p_regel_id is leeg';
  end if;
  if p_stappen is null or jsonb_typeof(p_stappen) <> 'array' then
    raise exception 'calc_regel_stappen_vervangen: p_stappen moet een jsonb-array zijn';
  end if;
  if not exists (select 1 from public.calc_regels r where r.id = p_regel_id) then
    raise exception 'calc_regel_stappen_vervangen: regel % bestaat niet', p_regel_id;
  end if;

  delete from public.calc_regel_stappen s where s.calc_regel_id = p_regel_id;

  return query
  insert into public.calc_regel_stappen (
    calc_regel_id, bewerking_id, bewerking_naam, bewerking_eenheid, minuten,
    percentage, materiaal_id, materiaal_naam, materiaal_eenheid, materiaal_prijs,
    materiaal_groep, verbruik, volgorde
  )
  select
    p_regel_id,
    nullif(st->>'bewerking_id', '')::uuid,
    coalesce(st->>'bewerking_naam', ''),
    coalesce(st->>'bewerking_eenheid', ''),
    coalesce((st->>'minuten')::numeric, 0),
    coalesce((st->>'percentage')::numeric, 100),
    nullif(st->>'materiaal_id', '')::uuid,
    st->>'materiaal_naam',
    st->>'materiaal_eenheid',
    coalesce((st->>'materiaal_prijs')::numeric, 0),
    st->>'materiaal_groep',
    coalesce((st->>'verbruik')::numeric, 0),
    coalesce((st->>'volgorde')::int, (ord - 1)::int)
  from jsonb_array_elements(p_stappen) with ordinality as e(st, ord)
  order by ord
  returning *;
end;
$$;

comment on function public.calc_regel_stappen_vervangen(uuid, jsonb) is
  'v4.114.0 — vervangt alle bewerkingen van een calc_regel in één transactie (wissel verfsysteem, bewerkingen toepassen op andere regels). Geeft de nieuwe rijen terug.';

-- Postgres geeft execute standaard aan public; eerst intrekken, dan gericht geven.
revoke execute on function public.calc_regel_stappen_vervangen(uuid, jsonb) from public, anon;
grant execute on function public.calc_regel_stappen_vervangen(uuid, jsonb) to authenticated;

-- Controle na uitvoeren (verwacht: 1 rij)
-- select proname, prosecdef from pg_proc where proname = 'calc_regel_stappen_vervangen';
