-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ondergronden (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  naam text NOT NULL,
  locatie text NOT NULL DEFAULT 'beide'::text CHECK (locatie = ANY (ARRAY['binnen'::text, 'buiten'::text, 'beide'::text])),
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ondergronden_pkey PRIMARY KEY (id)
);
CREATE TABLE public.materialen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  naam text NOT NULL,
  merk text DEFAULT ''::text,
  type text DEFAULT ''::text,
  groep text DEFAULT ''::text,
  eenheid text DEFAULT 'L'::text,
  prijs_per numeric DEFAULT 0,
  rendement numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT materialen_pkey PRIMARY KEY (id)
);
CREATE TABLE public.bewerkingen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ondergrond_id uuid,
  naam text NOT NULL,
  eenheid text DEFAULT 'm²'::text,
  minuten numeric DEFAULT 0,
  materiaal_id uuid,
  verbruik numeric DEFAULT 0,
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  bron text DEFAULT 'eigen'::text,
  CONSTRAINT bewerkingen_pkey PRIMARY KEY (id),
  CONSTRAINT bewerkingen_ondergrond_id_fkey FOREIGN KEY (ondergrond_id) REFERENCES public.ondergronden(id),
  CONSTRAINT bewerkingen_materiaal_id_fkey FOREIGN KEY (materiaal_id) REFERENCES public.materialen(id)
);
CREATE TABLE public.verfsystemen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ondergrond_id uuid,
  naam text NOT NULL,
  eenheid text DEFAULT 'm²'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  notities text DEFAULT ''::text,
  CONSTRAINT verfsystemen_pkey PRIMARY KEY (id),
  CONSTRAINT verfsystemen_ondergrond_id_fkey FOREIGN KEY (ondergrond_id) REFERENCES public.ondergronden(id)
);
CREATE TABLE public.verfsysteem_stappen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  verfsysteem_id uuid NOT NULL,
  bewerking_id uuid,
  percentage numeric DEFAULT 100,
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT verfsysteem_stappen_pkey PRIMARY KEY (id),
  CONSTRAINT verfsysteem_stappen_bewerking_id_fkey FOREIGN KEY (bewerking_id) REFERENCES public.bewerkingen(id),
  CONSTRAINT verfsysteem_stappen_verfsysteem_id_fkey FOREIGN KEY (verfsysteem_id) REFERENCES public.verfsystemen(id)
);
CREATE TABLE public.staart_lib (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  naam text NOT NULL,
  type text DEFAULT 'vast'::text CHECK (type = ANY (ARRAY['vast'::text, 'dag'::text, 'week'::text, 'eenheid'::text, 'percent'::text])),
  bedrag numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  eenheid text DEFAULT ''::text,
  grondslag text DEFAULT ''::text,
  hoeveelheid numeric DEFAULT 0,
  verstop_in_eenheidsprijs boolean NOT NULL DEFAULT false,
  telt_in_werkdagen boolean DEFAULT false,
  CONSTRAINT staart_lib_pkey PRIMARY KEY (id)
);
CREATE TABLE public.calculaties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  naam text DEFAULT ''::text,
  klant text DEFAULT ''::text,
  status text DEFAULT 'concept'::text CHECK (status = ANY (ARRAY['concept'::text, 'gereed'::text, 'verzonden'::text, 'geaccepteerd'::text, 'verloren'::text, 'afspraak'::text])),
  schilders integer DEFAULT 2,
  uur_dag numeric DEFAULT 8,
  reis numeric DEFAULT 0,
  volle_dagen_override boolean,
  notities text DEFAULT ''::text,
  aangemaakt timestamp with time zone DEFAULT now(),
  gewijzigd timestamp with time zone DEFAULT now(),
  settings_snapshot jsonb,
  totaal_incl_btw numeric,
  opname_datum date,
  deadline_datum date,
  totaal_offerte_origineel numeric,
  postcode text,
  huisnummer text,
  offerte_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  craft_geexporteerd_op timestamp with time zone,
  CONSTRAINT calculaties_pkey PRIMARY KEY (id)
);
CREATE TABLE public.hoofdgroepen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calculatie_id uuid NOT NULL,
  naam text NOT NULL,
  collapsed boolean DEFAULT false,
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  actief boolean NOT NULL DEFAULT true,
  CONSTRAINT hoofdgroepen_pkey PRIMARY KEY (id),
  CONSTRAINT hoofdgroepen_calculatie_id_fkey FOREIGN KEY (calculatie_id) REFERENCES public.calculaties(id)
);
CREATE TABLE public.onderdelen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hoofdgroep_id uuid NOT NULL,
  naam text NOT NULL,
  collapsed boolean DEFAULT false,
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  actief boolean NOT NULL DEFAULT true,
  CONSTRAINT onderdelen_pkey PRIMARY KEY (id),
  CONSTRAINT onderdelen_hoofdgroep_id_fkey FOREIGN KEY (hoofdgroep_id) REFERENCES public.hoofdgroepen(id)
);
CREATE TABLE public.calc_regels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  onderdeel_id uuid NOT NULL,
  naam text DEFAULT ''::text,
  hoeveelheid numeric DEFAULT 0,
  toeslag numeric DEFAULT 0,
  systeem_id uuid,
  systeem_naam text DEFAULT ''::text,
  systeem_eenheid text DEFAULT 'm²'::text,
  systeem_ondergrond text DEFAULT ''::text,
  systeem_ondergrond_id uuid,
  systeem_locatie text DEFAULT 'beide'::text,
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  actief boolean NOT NULL DEFAULT true,
  CONSTRAINT calc_regels_pkey PRIMARY KEY (id),
  CONSTRAINT calc_regels_onderdeel_id_fkey FOREIGN KEY (onderdeel_id) REFERENCES public.onderdelen(id)
);
CREATE TABLE public.calc_regel_stappen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calc_regel_id uuid NOT NULL,
  bewerking_id uuid,
  bewerking_naam text DEFAULT ''::text,
  bewerking_eenheid text DEFAULT ''::text,
  minuten numeric DEFAULT 0,
  percentage numeric DEFAULT 100,
  materiaal_id uuid,
  materiaal_naam text,
  materiaal_eenheid text,
  materiaal_prijs numeric DEFAULT 0,
  materiaal_groep text,
  verbruik numeric DEFAULT 0,
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT calc_regel_stappen_pkey PRIMARY KEY (id),
  CONSTRAINT calc_regel_stappen_calc_regel_id_fkey FOREIGN KEY (calc_regel_id) REFERENCES public.calc_regels(id)
);
CREATE TABLE public.meetstaat (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calculatie_id uuid NOT NULL,
  calc_regel_id uuid,
  omschrijving text DEFAULT ''::text,
  h_cm integer DEFAULT 0,
  b_cm integer DEFAULT 0,
  aantal integer DEFAULT 1,
  opmerking text DEFAULT ''::text,
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  factor numeric NOT NULL DEFAULT 1,
  tekening jsonb,
  bron text,
  bron_meetstaat_id uuid,
  CONSTRAINT meetstaat_pkey PRIMARY KEY (id),
  CONSTRAINT meetstaat_calculatie_id_fkey FOREIGN KEY (calculatie_id) REFERENCES public.calculaties(id),
  CONSTRAINT meetstaat_calc_regel_id_fkey FOREIGN KEY (calc_regel_id) REFERENCES public.calc_regels(id)
);
CREATE TABLE public.todos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calculatie_id uuid NOT NULL,
  tekst text DEFAULT ''::text,
  done boolean DEFAULT false,
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT todos_pkey PRIMARY KEY (id),
  CONSTRAINT todos_calculatie_id_fkey FOREIGN KEY (calculatie_id) REFERENCES public.calculaties(id)
);
CREATE TABLE public.staart (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calculatie_id uuid NOT NULL,
  naam text DEFAULT ''::text,
  type text DEFAULT 'vast'::text CHECK (type = ANY (ARRAY['vast'::text, 'dag'::text, 'week'::text, 'eenheid'::text, 'percent'::text])),
  bedrag numeric DEFAULT 0,
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  eenheid text DEFAULT ''::text,
  grondslag text DEFAULT ''::text,
  hoeveelheid numeric DEFAULT 0,
  verstop_in_eenheidsprijs boolean NOT NULL DEFAULT false,
  telt_in_werkdagen boolean DEFAULT false,
  gebrek_type text,
  CONSTRAINT staart_pkey PRIMARY KEY (id),
  CONSTRAINT staart_calculatie_id_fkey FOREIGN KEY (calculatie_id) REFERENCES public.calculaties(id)
);
CREATE TABLE public.settings (
  id integer NOT NULL DEFAULT 1 CHECK (id = 1),
  uurloon numeric DEFAULT 75,
  reistijd_tarief numeric DEFAULT 60,
  km_tarief numeric DEFAULT 0.45,
  snelheid numeric DEFAULT 50,
  klein_mat numeric DEFAULT 4,
  afval numeric DEFAULT 1.5,
  arbo numeric DEFAULT 2,
  winst numeric DEFAULT 10,
  btw numeric DEFAULT 21,
  volle_dagen boolean DEFAULT true,
  afrondings_drempel numeric DEFAULT 0.6,
  groep_opslagen jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT app_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.onderhoudsplannen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calculatie_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  prijspeil integer NOT NULL,
  looptijd_jaren integer NOT NULL,
  indexering_pct numeric NOT NULL DEFAULT 3.5,
  notities text DEFAULT ''::text,
  aangemaakt timestamp with time zone NOT NULL DEFAULT now(),
  gewijzigd timestamp with time zone NOT NULL DEFAULT now(),
  btw_pct_override numeric,
  ontvanger_type text NOT NULL DEFAULT 'particulier'::text,
  scope_omschrijving text,
  status text NOT NULL DEFAULT 'concept'::text CHECK (status = ANY (ARRAY['concept'::text, 'gereed'::text, 'verzonden'::text, 'geaccepteerd'::text, 'verloren'::text])),
  betaalmodel text NOT NULL DEFAULT 'abo'::text CHECK (betaalmodel = ANY (ARRAY['contant'::text, 'abo'::text])),
  aantal_appartementen integer,
  ligging jsonb,
  CONSTRAINT onderhoudsplannen_pkey PRIMARY KEY (id),
  CONSTRAINT onderhoudsplannen_calculatie_id_fkey FOREIGN KEY (calculatie_id) REFERENCES public.calculaties(id),
  CONSTRAINT onderhoudsplannen_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.onderhoudsplan_beurten (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  naam text NOT NULL DEFAULT ''::text,
  jaartal integer NOT NULL,
  volgorde integer NOT NULL DEFAULT 0,
  modus text NOT NULL DEFAULT 'algemeen'::text,
  scaling jsonb NOT NULL DEFAULT '{}'::jsonb,
  aangemaakt timestamp with time zone NOT NULL DEFAULT now(),
  gewijzigd timestamp with time zone NOT NULL DEFAULT now(),
  mee_in_gemiddelde boolean NOT NULL DEFAULT true,
  offerte_tekst text DEFAULT ''::text,
  reeds_uitgevoerd boolean DEFAULT false,
  planning_notitie text DEFAULT ''::text,
  ingepland boolean NOT NULL DEFAULT false,
  CONSTRAINT onderhoudsplan_beurten_pkey PRIMARY KEY (id),
  CONSTRAINT onderhoudsplan_beurten_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.onderhoudsplannen(id),
  CONSTRAINT onderhoudsplan_beurten_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.calculatie_fotos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calculatie_id uuid NOT NULL,
  storage_path text NOT NULL,
  opmerking text DEFAULT ''::text,
  volgorde integer DEFAULT 0,
  aangemaakt timestamp with time zone DEFAULT now(),
  markeringen jsonb NOT NULL DEFAULT '[]'::jsonb,
  gebreken_tellen boolean NOT NULL DEFAULT false,
  CONSTRAINT calculatie_fotos_pkey PRIMARY KEY (id),
  CONSTRAINT calculatie_fotos_calculatie_id_fkey FOREIGN KEY (calculatie_id) REFERENCES public.calculaties(id)
);
CREATE TABLE public.calculatie_documenten (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calculatie_id uuid NOT NULL,
  storage_path text NOT NULL,
  bestandsnaam text DEFAULT ''::text,
  grootte bigint,
  aangemaakt timestamp with time zone DEFAULT now(),
  CONSTRAINT calculatie_documenten_pkey PRIMARY KEY (id),
  CONSTRAINT calculatie_documenten_calculatie_id_fkey FOREIGN KEY (calculatie_id) REFERENCES public.calculaties(id)
);
CREATE TABLE public.planning_handmatig (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  klant text NOT NULL,
  betaalmodel text NOT NULL DEFAULT 'contant'::text CHECK (betaalmodel = ANY (ARRAY['contant'::text, 'abo'::text])),
  jaartal integer NOT NULL,
  bedrag numeric NOT NULL DEFAULT 0,
  omschrijving text DEFAULT ''::text,
  reeds_uitgevoerd boolean NOT NULL DEFAULT false,
  volgorde integer NOT NULL DEFAULT 0,
  aangemaakt timestamp with time zone NOT NULL DEFAULT now(),
  gewijzigd timestamp with time zone NOT NULL DEFAULT now(),
  ingepland boolean NOT NULL DEFAULT false,
  CONSTRAINT planning_handmatig_pkey PRIMARY KEY (id)
);
CREATE TABLE public.offerte_teksten (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sectie text NOT NULL,
  naam text NOT NULL,
  inhoud text NOT NULL DEFAULT ''::text,
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  std_consument boolean NOT NULL DEFAULT false,
  std_vve boolean NOT NULL DEFAULT false,
  std_zakelijk boolean NOT NULL DEFAULT false,
  CONSTRAINT offerte_teksten_pkey PRIMARY KEY (id)
);
CREATE TABLE public.offerte_accorderingen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calculatie_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'akkoord'::text, 'afgekeurd'::text])),
  klant_naam text,
  notitie text,
  vragen jsonb NOT NULL DEFAULT '[]'::jsonb,
  snapshot jsonb,
  bedrag numeric,
  aangemaakt_op timestamp with time zone NOT NULL DEFAULT now(),
  gereageerd_op timestamp with time zone,
  ip text,
  user_agent text,
  gezien_op timestamp with time zone,
  pdf_path text,
  eerste_geopend_op timestamp with time zone,
  laatst_geopend_op timestamp with time zone,
  geopend_aantal integer NOT NULL DEFAULT 0,
  gemaild_op timestamp with time zone,
  beltaak_op timestamp with time zone,
  herinnering_op timestamp with time zone,
  verlopen_mail_op timestamp with time zone,
  afsluittaak_op timestamp with time zone,
  automaat_uit boolean NOT NULL DEFAULT false,
  CONSTRAINT offerte_accorderingen_pkey PRIMARY KEY (id),
  CONSTRAINT offerte_accorderingen_calculatie_id_fkey FOREIGN KEY (calculatie_id) REFERENCES public.calculaties(id)
);
CREATE TABLE public.onderhoudsplan_externe_posten (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  omschrijving text NOT NULL DEFAULT ''::text,
  toelichting text NOT NULL DEFAULT ''::text,
  jaartal integer,
  richtbedrag numeric,
  raakt_garantie boolean NOT NULL DEFAULT false,
  volgorde integer NOT NULL DEFAULT 0,
  aangemaakt timestamp with time zone NOT NULL DEFAULT now(),
  gewijzigd timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT onderhoudsplan_externe_posten_pkey PRIMARY KEY (id),
  CONSTRAINT onderhoudsplan_externe_posten_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.onderhoudsplannen(id)
);
CREATE TABLE public.fin_dashboard (
  id text NOT NULL DEFAULT 'huidig'::text,
  data jsonb NOT NULL,
  bijgewerkt_op timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fin_dashboard_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fin_berichten (
  id text NOT NULL,
  maand text NOT NULL,
  bericht text NOT NULL,
  aangemaakt_op timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fin_berichten_pkey PRIMARY KEY (id)
);
CREATE TABLE public.app_help_kb (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titel text,
  inhoud text NOT NULL,
  volgorde integer NOT NULL DEFAULT 0,
  actief boolean NOT NULL DEFAULT true,
  bijgewerkt_op timestamp with time zone NOT NULL DEFAULT now(),
  aangemaakt_op timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT app_help_kb_pkey PRIMARY KEY (id)
);
CREATE TABLE public.app_help_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vraag text,
  antwoord text,
  model text,
  tokens_in integer,
  tokens_uit integer,
  kosten_eur numeric,
  gebruiker text,
  aangemaakt_op timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT app_help_log_pkey PRIMARY KEY (id)
);
CREATE TABLE public.offerte_controle_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  aangemaakt_op timestamp with time zone NOT NULL DEFAULT now(),
  gebruiker text,
  calc_id uuid,
  calc_naam text,
  model text,
  tokens_in integer,
  tokens_uit integer,
  kosten_eur numeric,
  meldingen jsonb NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT offerte_controle_log_pkey PRIMARY KEY (id),
  CONSTRAINT offerte_controle_log_calc_id_fkey FOREIGN KEY (calc_id) REFERENCES public.calculaties(id)
);
CREATE TABLE public.sync_state (
  id integer NOT NULL DEFAULT 1 CHECK (id = 1),
  fase text NOT NULL DEFAULT 'idle'::text,
  sweep_marker timestamp with time zone,
  resterende jsonb NOT NULL DEFAULT '[]'::jsonb,
  totaal integer NOT NULL DEFAULT 0,
  bijgewerkt timestamp with time zone NOT NULL DEFAULT now(),
  keten_actief_sinds timestamp with time zone,
  CONSTRAINT sync_state_pkey PRIMARY KEY (id)
);
CREATE TABLE public.taken (
  crmtaskid text NOT NULL DEFAULT ('app-'::text || (gen_random_uuid())::text),
  onderwerp text NOT NULL DEFAULT ''::text,
  username text NOT NULL DEFAULT ''::text,
  klantnaam text NOT NULL DEFAULT ''::text,
  klantcode text NOT NULL DEFAULT ''::text,
  crmtasktype text NOT NULL DEFAULT ''::text,
  gepland_op timestamp without time zone,
  status text NOT NULL DEFAULT 'actueel'::text,
  laatst_gezien timestamp with time zone NOT NULL DEFAULT now(),
  aangemaakt timestamp with time zone NOT NULL DEFAULT now(),
  bron text NOT NULL DEFAULT 'yoobi'::text CHECK (bron = ANY (ARRAY['offerte'::text, 'yoobi'::text, 'eigen'::text])),
  soort text CHECK (soort = ANY (ARRAY['los'::text, 'eenmalig'::text, 'herhalend'::text])),
  notitie text,
  tel text,
  klant_tel text,
  piep boolean NOT NULL DEFAULT false,
  piep_op timestamp with time zone,
  herhaling_n integer,
  herhaling_eenheid text CHECK (herhaling_eenheid = ANY (ARRAY['dag'::text, 'werkdag'::text, 'week'::text, 'maand'::text, 'jaar'::text])),
  toegewezen_aan text CHECK (toegewezen_aan = ANY (ARRAY['gian'::text, 'max'::text, 'maud'::text, 'jens'::text, 'bjorn'::text])),
  vandaag boolean NOT NULL DEFAULT false,
  vandaag_op date,
  voltooid_op timestamp with time zone,
  foto_pad text,
  aangemaakt_door uuid,
  bijgewerkt timestamp with time zone NOT NULL DEFAULT now(),
  melding_geleverd_op timestamp without time zone,
  mail_op timestamp with time zone,
  bron_ref uuid,
  bron_kenmerk text,
  voltooid_door text,
  CONSTRAINT taken_pkey PRIMARY KEY (crmtaskid)
);
CREATE TABLE public.taken_rollen (
  user_id uuid NOT NULL,
  persoon text NOT NULL UNIQUE CHECK (persoon = ANY (ARRAY['gian'::text, 'max'::text, 'maud'::text, 'jens'::text, 'bjorn'::text, 'administratie'::text])),
  rol text NOT NULL CHECK (rol = ANY (ARRAY['alles'::text, 'eigen'::text])),
  yoobi_naam text,
  aangemaakt timestamp with time zone NOT NULL DEFAULT now(),
  mail text,
  ziet_klant boolean NOT NULL DEFAULT false,
  CONSTRAINT taken_rollen_pkey PRIMARY KEY (user_id),
  CONSTRAINT taken_rollen_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.taken_melding_sleutels (
  persoon text NOT NULL CHECK (persoon = ANY (ARRAY['gian'::text, 'max'::text, 'maud'::text, 'jens'::text, 'bjorn'::text])),
  sleutel text NOT NULL DEFAULT replace(((gen_random_uuid())::text || (gen_random_uuid())::text), '-'::text, ''::text) UNIQUE,
  aangemaakt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT taken_melding_sleutels_pkey PRIMARY KEY (persoon)
);
CREATE TABLE public.fin_werkvoorraad (
  peildatum date NOT NULL DEFAULT CURRENT_DATE,
  data jsonb NOT NULL,
  bijgewerkt_op timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fin_werkvoorraad_pkey PRIMARY KEY (peildatum)
);
CREATE TABLE public.taak_documenten (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  taak_id text NOT NULL,
  storage_path text NOT NULL,
  bestandsnaam text DEFAULT ''::text,
  grootte bigint,
  aangemaakt timestamp with time zone DEFAULT now(),
  CONSTRAINT taak_documenten_pkey PRIMARY KEY (id),
  CONSTRAINT taak_documenten_taak_id_fkey FOREIGN KEY (taak_id) REFERENCES public.taken(crmtaskid)
);
CREATE TABLE public.taak_sjablonen (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  naam text NOT NULL,
  titel text,
  notitie text,
  volgorde integer NOT NULL DEFAULT 0,
  aangemaakt timestamp with time zone NOT NULL DEFAULT now(),
  aangemaakt_door text,
  CONSTRAINT taak_sjablonen_pkey PRIMARY KEY (id)
);
CREATE TABLE public.taak_dagkeuze (
  id bigint NOT NULL DEFAULT nextval('taak_dagkeuze_id_seq'::regclass),
  taak_id text NOT NULL,
  persoon text NOT NULL,
  dag date NOT NULL DEFAULT CURRENT_DATE,
  gezet_op timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT taak_dagkeuze_pkey PRIMARY KEY (id),
  CONSTRAINT taak_dagkeuze_taak_id_fkey FOREIGN KEY (taak_id) REFERENCES public.taken(crmtaskid)
);
