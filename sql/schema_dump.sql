-- =====================================================================
--  public.schema_dump()   -- opruimlijst punt 15, brok 1 + brok 2
--
--  Leest de inrichting van de database en zet die om in SQL waarmee je
--  hem opnieuw aanlegt. Alleen lezen. Idempotent: opnieuw draaien mag.
--
--  Volgorde van de uitvoer is vast: leegtecontrole, extensies, reeksen,
--  tabellen, sleutels en beperkingen, indexen, functies, triggers,
--  rijbeveiliging, policies, rechten, opslagbakken, opslagpolicies,
--  cronjobs, en als allerlaatste de verwijssleutels.
--
--  Let op: de opslagpolicies staan op storage.objects en niet in public.
--  Ze tellen niet mee in een telling over schema public.
-- =====================================================================

create or replace function public.schema_dump()
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  uit  text := '';
  r    record;
  k    record;
  kol  text;
begin
  ----------------------------------------------------------------- kop
  uit := uit
    || '-- ==================================================================' || E'\n'
    || '-- HERBOUWBESTAND schilders-calc, gemaakt op '
       || to_char(now() at time zone 'UTC', 'YYYY-MM-DD HH24:MI') || ' UTC' || E'\n'
    || '-- ==================================================================' || E'\n'
    || '--' || E'\n'
    || '-- LEES DIT EERST. Dit bestand herbouwt de STRUCTUUR, niet de inhoud.' || E'\n'
    || '--' || E'\n'
    || '-- 1. DE KLUIS IS LEEG. De cronjobs hieronder halen hun sleutel uit' || E'\n'
    || '--    vault. Die sleutels staan hier NIET in en moeten met de hand' || E'\n'
    || '--    opnieuw aangemaakt worden, anders draait geen enkele cronjob.' || E'\n'
    || '-- 2. HET PROJECTADRES STAAT ER LETTERLIJK IN. Alle cronjobs wijzen' || E'\n'
    || '--    naar het oude project. Bij een herbouw moet elk adres worden' || E'\n'
    || '--    vervangen door dat van het nieuwe project.' || E'\n'
    || '-- 3. DE EDGE FUNCTIONS ZITTEN HIER NIET IN. Die staan in de repo' || E'\n'
    || '--    ernes-edge-functions en moeten EERST uitgerold zijn, anders' || E'\n'
    || '--    wijzen de cronjobs naar adressen die nog niet bestaan.' || E'\n'
    || '-- 4. DRIE TABELLEN HANGEN AAN auth.users. Na een herbouw zijn dat' || E'\n'
    || '--    nieuwe id''s. Maak eerst de inlogaccounts opnieuw aan, zet dan' || E'\n'
    || '--    pas de gegevens terug, en koppel taken_rollen met de hand.' || E'\n'
    || '-- 5. DE REEKSEN MOETEN EEN setval KRIJGEN na het terugzetten van de' || E'\n'
    || '--    gegevens. Onderaan dit bestand staan de regels daarvoor.' || E'\n'
    || '--' || E'\n\n';

  ------------------------------------------------------ leegtecontrole
  uit := uit
    || '-- ---------- CONTROLE VOORAF ----------' || E'\n'
    || '-- Breekt af als dit schema al gevuld is. Zo kan dit bestand nooit' || E'\n'
    || '-- per ongeluk over een werkende database heen lopen.' || E'\n'
    || 'do $controle$' || E'\n'
    || 'declare aantal int;' || E'\n'
    || 'begin' || E'\n'
    || '  select count(*) into aantal from pg_catalog.pg_tables where schemaname = ''public'';' || E'\n'
    || '  if aantal > 0 then' || E'\n'
    || '    raise exception ''AFGEBROKEN: schema public bevat al % tabellen. Dit bestand hoort alleen in een LEEG project te draaien.'', aantal;' || E'\n'
    || '  end if;' || E'\n'
    || 'end $controle$;' || E'\n';

  ----------------------------------------------------------- extensies
  uit := uit || E'\n-- ---------- EXTENSIES ----------\n';
  for r in
    select e.extname, ns.nspname
      from pg_catalog.pg_extension e
      join pg_catalog.pg_namespace ns on ns.oid = e.extnamespace
     where e.extname <> 'plpgsql'
     order by e.extname
  loop
    uit := uit || format('create extension if not exists %I with schema %I;', r.extname, r.nspname) || E'\n';
  end loop;

  ------------------------------------------------------------- reeksen
  -- Uit de standaardwaarden gehaald, niet uit de catalogus. Zo komt een
  -- reeks die wel gebruikt maar nooit netjes aangelegd is er ook in.
  uit := uit || E'\n-- ---------- REEKSEN ----------\n';
  for r in
    select distinct
           regexp_replace(
             substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) from $q$nextval\('([^']+)'$q$),
             '^.*\.', '') as reeks
      from pg_catalog.pg_attrdef d
      join pg_catalog.pg_class c on c.oid = d.adrelid
      join pg_catalog.pg_namespace ns on ns.oid = c.relnamespace
     where ns.nspname = 'public'
       and pg_catalog.pg_get_expr(d.adbin, d.adrelid) like 'nextval(%'
     order by 1
  loop
    uit := uit || format('create sequence if not exists public.%I;', trim(both '"' from r.reeks)) || E'\n';
  end loop;

  ------------------------------------------------------------ tabellen
  uit := uit || E'\n-- ---------- TABELLEN ----------\n';
  for r in
    select c.oid, c.relname
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace ns on ns.oid = c.relnamespace
     where ns.nspname = 'public' and c.relkind = 'r'
       and not exists (select 1 from pg_catalog.pg_depend dp
                        where dp.objid = c.oid and dp.deptype = 'e')
     order by c.relname
  loop
    kol := '';
    for k in
      select a.attname,
             pg_catalog.format_type(a.atttypid, a.atttypmod) as typ,
             a.attnotnull,
             pg_catalog.pg_get_expr(d.adbin, d.adrelid) as standaard
        from pg_catalog.pg_attribute a
        left join pg_catalog.pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
       where a.attrelid = r.oid and a.attnum > 0 and not a.attisdropped
       order by a.attnum
    loop
      kol := kol || case when kol = '' then '' else E',\n' end
          || '  ' || quote_ident(k.attname) || ' ' || k.typ
          || coalesce(' default ' || k.standaard, '')
          || case when k.attnotnull then ' not null' else '' end;
    end loop;
    uit := uit || format('create table if not exists public.%I (', r.relname) || E'\n'
               || kol || E'\n);\n';
  end loop;

  -------------------------------------------- sleutels en beperkingen
  -- Primaire sleutels, unieke sleutels en controleregels. Verwijssleutels
  -- NIET: die staan helemaal onderaan, zodat de tabelvolgorde niet uitmaakt.
  uit := uit || E'\n-- ---------- SLEUTELS EN BEPERKINGEN ----------\n';
  for r in
    select c.conrelid::regclass::text as tabel, c.conname,
           pg_catalog.pg_get_constraintdef(c.oid) as definitie
      from pg_catalog.pg_constraint c
      join pg_catalog.pg_namespace ns on ns.oid = c.connamespace
     where ns.nspname = 'public' and c.contype in ('p','u','c')
     order by 1, c.contype, c.conname
  loop
    uit := uit
      || 'do $b$ begin alter table public.' || quote_ident(r.tabel)
      || ' add constraint ' || quote_ident(r.conname) || ' ' || r.definitie || ';'
      || ' exception when duplicate_object then null;'
      || ' when duplicate_table then null; end $b$;' || E'\n';
  end loop;

  ------------------------------------------------------------ indexen
  uit := uit || E'\n-- ---------- INDEXEN ----------\n';
  for r in
    select i.indexdef
      from pg_catalog.pg_indexes i
      join pg_catalog.pg_class c on c.relname = i.indexname
      join pg_catalog.pg_namespace ns on ns.oid = c.relnamespace and ns.nspname = i.schemaname
     where i.schemaname = 'public'
       and not exists (select 1 from pg_catalog.pg_constraint kc where kc.conindid = c.oid)
     order by i.tablename, i.indexname
  loop
    uit := uit || replace(r.indexdef, 'CREATE INDEX', 'CREATE INDEX IF NOT EXISTS') || ';' || E'\n';
  end loop;

  ----------------------------------------------------------- functies
  uit := uit || E'\n-- ---------- DATABASEFUNCTIES ----------\n';
  for r in
    select pg_catalog.pg_get_functiondef(p.oid) as def
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace ns on ns.oid = p.pronamespace
     where ns.nspname = 'public' and p.prokind in ('f','p')
       and not exists (select 1 from pg_catalog.pg_depend dp
                        where dp.objid = p.oid and dp.deptype = 'e')
     order by p.proname, pg_catalog.pg_get_function_identity_arguments(p.oid)
  loop
    uit := uit || r.def || E';\n\n';
  end loop;

  ----------------------------------------------------------- triggers
  uit := uit || E'\n-- ---------- TRIGGERS ----------\n';
  for r in
    select c.relname as tabel, t.tgname, pg_catalog.pg_get_triggerdef(t.oid) as def
      from pg_catalog.pg_trigger t
      join pg_catalog.pg_class c on c.oid = t.tgrelid
      join pg_catalog.pg_namespace ns on ns.oid = c.relnamespace
     where ns.nspname = 'public' and not t.tgisinternal
     order by c.relname, t.tgname
  loop
    uit := uit || format('drop trigger if exists %I on public.%I;', r.tgname, r.tabel) || E'\n'
               || r.def || E';\n';
  end loop;

  ------------------------------------------------------ rijbeveiliging
  uit := uit || E'\n-- ---------- RIJBEVEILIGING ----------\n';
  for r in
    select c.relname from pg_catalog.pg_class c
      join pg_catalog.pg_namespace ns on ns.oid = c.relnamespace
     where ns.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
     order by c.relname
  loop
    uit := uit || format('alter table public.%I enable row level security;', r.relname) || E'\n';
  end loop;

  ----------------------------------------------------------- policies
  uit := uit || E'\n-- ---------- POLICIES ----------\n';
  for r in
    select tablename, policyname, permissive, roles, cmd, qual, with_check
      from pg_catalog.pg_policies where schemaname = 'public'
     order by tablename, policyname
  loop
    uit := uit
      || format('drop policy if exists %I on public.%I;', r.policyname, r.tablename) || E'\n'
      || format('create policy %I on public.%I as %s for %s to %s',
                r.policyname, r.tablename,
                case when r.permissive = 'PERMISSIVE' then 'permissive' else 'restrictive' end,
                lower(r.cmd), array_to_string(r.roles, ', '))
      || coalesce(E'\n  using (' || r.qual || ')', '')
      || coalesce(E'\n  with check (' || r.with_check || ')', '')
      || E';\n';
  end loop;

  ------------------------------------------------------------ rechten
  uit := uit || E'\n-- ---------- RECHTEN ----------\n';
  for r in
    select c.relname as tabel, pg_catalog.pg_get_userbyid(a.grantee) as ontvanger,
           a.privilege_type as recht
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace ns on ns.oid = c.relnamespace
      cross join lateral pg_catalog.aclexplode(c.relacl) a
     where ns.nspname = 'public' and c.relkind in ('r','v','m')
       and a.grantee <> c.relowner
     order by c.relname, 2, a.privilege_type
  loop
    uit := uit || format('grant %s on public.%I to %I;', lower(r.recht), r.tabel, r.ontvanger) || E'\n';
  end loop;

  ------------------------------------------------------- opslagbakken
  uit := uit || E'\n-- ---------- OPSLAGBAKKEN ----------\n';
  for r in
    select id, name, public, file_size_limit, allowed_mime_types
      from storage.buckets order by id
  loop
    uit := uit || format(
      'insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)'
      || E'\n  values (%L, %L, %L, %s, %s) on conflict (id) do nothing;' || E'\n',
      r.id, r.name, r.public,
      coalesce(r.file_size_limit::text, 'null'),
      coalesce(quote_literal(r.allowed_mime_types::text) || '::text[]', 'null'));
  end loop;

  ------------------------------------------------------ opslagpolicies
  -- De regels die bepalen wie bij de bestanden in de bakken mag. Deze
  -- staan op storage.objects en niet in public, en waren daardoor bijna
  -- vergeten. Zonder deze regels staan de bakken er wel maar komt de
  -- app er niet in.
  uit := uit || E'\n-- ---------- OPSLAGPOLICIES ----------\n';
  for r in
    select tablename, policyname, permissive, roles, cmd, qual, with_check
      from pg_catalog.pg_policies where schemaname = 'storage'
     order by tablename, policyname
  loop
    uit := uit
      || format('drop policy if exists %I on storage.%I;', r.policyname, r.tablename) || E'\n'
      || format('create policy %I on storage.%I as %s for %s to %s',
                r.policyname, r.tablename,
                case when r.permissive = 'PERMISSIVE' then 'permissive' else 'restrictive' end,
                lower(r.cmd), array_to_string(r.roles, ', '))
      || coalesce(E'\n  using (' || r.qual || ')', '')
      || coalesce(E'\n  with check (' || r.with_check || ')', '')
      || E';\n';
  end loop;

  ----------------------------------------------------------- cronjobs
  uit := uit || E'\n-- ---------- CRONJOBS ----------\n'
             || '-- Adressen wijzen naar het OUDE project. Zie waarschuwing 2 bovenaan.' || E'\n';
  for r in select jobname, schedule, command from cron.job order by jobname
  loop
    uit := uit || format('select cron.schedule(%L, %L, %L);', r.jobname, r.schedule, r.command) || E'\n';
  end loop;

  ------------------------------------------------------ verwijssleutels
  uit := uit || E'\n-- ---------- VERWIJSSLEUTELS ----------\n'
             || '-- Helemaal onderaan met opzet: nu maakt de tabelvolgorde niet uit.' || E'\n';
  for r in
    select c.conrelid::regclass::text as tabel, c.conname,
           pg_catalog.pg_get_constraintdef(c.oid) as definitie
      from pg_catalog.pg_constraint c
      join pg_catalog.pg_namespace ns on ns.oid = c.connamespace
     where ns.nspname = 'public' and c.contype = 'f'
     order by 1, c.conname
  loop
    uit := uit
      || 'do $b$ begin alter table public.' || quote_ident(r.tabel)
      || ' add constraint ' || quote_ident(r.conname) || ' ' || r.definitie || ';'
      || ' exception when duplicate_object then null; end $b$;' || E'\n';
  end loop;

  --------------------------------------------------- setval-herinnering
  uit := uit || E'\n-- ---------- NA HET TERUGZETTEN VAN DE GEGEVENS ----------\n'
             || '-- Draai deze regels PAS nadat de gegevens terug zijn gezet.' || E'\n'
             || '-- Doe je dit niet, dan botst de eerstvolgende invoer.' || E'\n';
  for r in
    select distinct c.relname as tabel, a.attname,
           regexp_replace(substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) from $q$nextval\('([^']+)'$q$), '^.*\.', '') as reeks
      from pg_catalog.pg_attrdef d
      join pg_catalog.pg_class c on c.oid = d.adrelid
      join pg_catalog.pg_attribute a on a.attrelid = d.adrelid and a.attnum = d.adnum
      join pg_catalog.pg_namespace ns on ns.oid = c.relnamespace
     where ns.nspname = 'public'
       and pg_catalog.pg_get_expr(d.adbin, d.adrelid) like 'nextval(%'
     order by 1
  loop
    uit := uit || format(
      '-- select setval(%L, coalesce((select max(%I) from public.%I), 1));',
      'public.' || trim(both '"' from r.reeks), r.attname, r.tabel) || E'\n';
  end loop;

  uit := uit || E'\n-- einde herbouwbestand\n';

  ------------------------------------------------------------- de poort
  if uit ~ 'eyJ[A-Za-z0-9_-]{20,}' or uit ~ '\m(sb[ps]|sbsecret)_[A-Za-z0-9_-]{20,}' then
    raise exception
      'schema_dump: uitvoer bevat iets dat op een sleutel lijkt. Niets teruggegeven.';
  end if;

  return uit;
end
$fn$;

revoke all on function public.schema_dump() from public;
grant execute on function public.schema_dump() to service_role;
