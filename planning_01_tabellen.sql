-- ============================================================
-- PLANNING brok 1: vier tabellen voor planning.html
--
-- Opgebouwd volgens sql/template_nieuwe_tabel.sql (opgehaald uit de
-- openbare repo op 06-09-2026). Model: ingelogd mag alles, niet
-- ingelogd mag niets. Alles hieronder is idempotent.
--
-- Draaien in Supabase Studio > SQL Editor > New query > Run.
-- Onderaan staan controleregels: allemaal GOED, anders melden.
-- ============================================================


-- ------------------------------------------------------------
-- 0. Gedeelde triggerfunctie, letterlijk uit het sjabloon.
--    Bestaat al; staat hier alleen voor een herbouw vanaf nul.
--    De regel `set search_path` MOET erbij blijven (v3.9.5).
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ------------------------------------------------------------
-- 1. plan_medewerkers
--    Wie er te plannen is en wat zijn normale werkdag is.
-- ------------------------------------------------------------
create table if not exists public.plan_medewerkers (
  id            uuid primary key default gen_random_uuid(),
  naam          text not null unique,
  norm_uren     numeric(4,2) not null default 7.5,   -- uren per werkdag
  actief        boolean not null default true,
  volgorde      integer not null default 0,          -- weergavevolgorde op het bord
  created_at    timestamp with time zone default now(),
  updated_at    timestamp with time zone default now()
);

alter table public.plan_medewerkers enable row level security;

drop policy if exists plan_medewerkers_authenticated_alles on public.plan_medewerkers;
create policy plan_medewerkers_authenticated_alles
  on public.plan_medewerkers for all to authenticated
  using (true) with check (true);

grant select, insert, update, delete on public.plan_medewerkers to authenticated;
grant all                            on public.plan_medewerkers to service_role;
revoke all                           on public.plan_medewerkers from anon;

drop trigger if exists plan_medewerkers_set_updated_at on public.plan_medewerkers;
create trigger plan_medewerkers_set_updated_at
  before update on public.plan_medewerkers
  for each row execute function public.set_updated_at();

-- Startlijst (opgegeven door Gian op 06-09-2026). Bestaat de naam al,
-- dan gebeurt er niets.
insert into public.plan_medewerkers (naam, norm_uren, volgorde) values
  ('Gian',  7.5, 1),
  ('Max',   7.5, 2),
  ('Bjorn', 7.5, 3),
  ('Jens',  7.5, 4)
on conflict (naam) do nothing;


-- ------------------------------------------------------------
-- 2. plan_projecten
--    Onze planlaag over een Yoobi-project. Sleutel = Yoobi-code.
--    Yoobi blijft de bron voor naam, klant, budget en geboekt (die
--    lezen we live uit fin_werkvoorraad); hier staat alleen wat van
--    ons is: onze start/eind, de klantnotitie, zichtbaar ja/nee.
-- ------------------------------------------------------------
create table if not exists public.plan_projecten (
  yoobi_code    text primary key,
  plan_start    date,                 -- onze geplande start (kan afwijken van Yoobi)
  plan_eind     date,                 -- ons geplande einde
  klantnotitie  text,                 -- "vast doc week 37 sept 2026"
  zichtbaar     boolean not null default true,
  created_at    timestamp with time zone default now(),
  updated_at    timestamp with time zone default now()
);

alter table public.plan_projecten enable row level security;

drop policy if exists plan_projecten_authenticated_alles on public.plan_projecten;
create policy plan_projecten_authenticated_alles
  on public.plan_projecten for all to authenticated
  using (true) with check (true);

grant select, insert, update, delete on public.plan_projecten to authenticated;
grant all                            on public.plan_projecten to service_role;
revoke all                           on public.plan_projecten from anon;

drop trigger if exists plan_projecten_set_updated_at on public.plan_projecten;
create trigger plan_projecten_set_updated_at
  before update on public.plan_projecten
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- 3. plan_uren
--    Eén rij per cel: medewerker x project x dag. Uniek per drietal,
--    zodat een tweede invoer op dezelfde cel een update wordt en geen
--    dubbele rij.
-- ------------------------------------------------------------
create table if not exists public.plan_uren (
  id            uuid primary key default gen_random_uuid(),
  yoobi_code    text not null,
  medewerker_id uuid not null references public.plan_medewerkers(id) on delete cascade,
  datum         date not null,
  uren          numeric(4,2) not null check (uren >= 0 and uren <= 24),
  created_at    timestamp with time zone default now(),
  updated_at    timestamp with time zone default now(),
  unique (yoobi_code, medewerker_id, datum)
);

alter table public.plan_uren enable row level security;

drop policy if exists plan_uren_authenticated_alles on public.plan_uren;
create policy plan_uren_authenticated_alles
  on public.plan_uren for all to authenticated
  using (true) with check (true);

grant select, insert, update, delete on public.plan_uren to authenticated;
grant all                            on public.plan_uren to service_role;
revoke all                           on public.plan_uren from anon;

drop trigger if exists plan_uren_set_updated_at on public.plan_uren;
create trigger plan_uren_set_updated_at
  before update on public.plan_uren
  for each row execute function public.set_updated_at();

-- Het bord laadt altijd een periode (een jaar) en telt per medewerker
-- per dag op. Deze twee indexen dragen die twee vragen.
create index if not exists plan_uren_datum_idx
  on public.plan_uren (datum);
create index if not exists plan_uren_medewerker_datum_idx
  on public.plan_uren (medewerker_id, datum);


-- ------------------------------------------------------------
-- 4. plan_gesloten_dagen
--    Feestdagen en bedrijfsvakantie: niet boekbaar voor iedereen.
--    Verlof per medewerker komt later als eigen brok.
-- ------------------------------------------------------------
create table if not exists public.plan_gesloten_dagen (
  datum         date primary key,
  soort         text not null check (soort in ('feestdag', 'bedrijfsvakantie')),
  omschrijving  text,
  created_at    timestamp with time zone default now(),
  updated_at    timestamp with time zone default now()
);

alter table public.plan_gesloten_dagen enable row level security;

drop policy if exists plan_gesloten_dagen_authenticated_alles on public.plan_gesloten_dagen;
create policy plan_gesloten_dagen_authenticated_alles
  on public.plan_gesloten_dagen for all to authenticated
  using (true) with check (true);

grant select, insert, update, delete on public.plan_gesloten_dagen to authenticated;
grant all                            on public.plan_gesloten_dagen to service_role;
revoke all                           on public.plan_gesloten_dagen from anon;

drop trigger if exists plan_gesloten_dagen_set_updated_at on public.plan_gesloten_dagen;
create trigger plan_gesloten_dagen_set_updated_at
  before update on public.plan_gesloten_dagen
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- 5. Controle: twintig regels, allemaal GOED.
--    Vijf per tabel, zelfde controles als in het sjabloon.
-- ------------------------------------------------------------
with t(naam) as (
  values ('plan_medewerkers'), ('plan_projecten'), ('plan_uren'), ('plan_gesloten_dagen')
), c as (
  select
    t.naam,
    (select relrowsecurity from pg_class
      where relname = t.naam and relnamespace = 'public'::regnamespace) as rls,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = t.naam) as policies,
    (select count(*) from information_schema.role_table_grants
      where table_schema = 'public' and table_name = t.naam
        and grantee = 'authenticated') as rechten_auth,
    (select count(*) from information_schema.role_table_grants
      where table_schema = 'public' and table_name = t.naam
        and grantee = 'anon') as rechten_anon
  from t
)
select naam as tabel, 'rijbeveiliging aan' as controle,
       case when rls then 'GOED' else 'FOUT' end as stand from c
union all
select naam, 'minstens een policy',
       case when policies > 0 then 'GOED' else 'FOUT, app kan er niet bij' end from c
union all
select naam, 'rechten voor authenticated',
       case when rechten_auth > 0 then 'GOED' else 'FOUT, app kan er niet bij' end from c
union all
select naam, 'geen rechten voor anon',
       case when rechten_anon = 0 then 'GOED' else 'FOUT, tabel ligt open' end from c
union all
select naam, 'set_updated_at beveiligd',
       case when exists (
         select 1 from pg_proc p
         join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = 'set_updated_at'
           and p.proconfig::text like '%search_path%'
       ) then 'GOED' else 'FOUT, zie sql/02_fix_set_updated_at.sql' end from c
order by 1, 2;
