# CHANGELOG — personeel.html

Personeelsdossier van Ernes Schilders: gegevens, dossier, verzuim en certificaten
per medewerker, alleen zichtbaar voor de directie. Hoort bij `personeel_01_tabellen.sql`.

## v0.2.0 — Dossier, documenten en de eerste taakkoppeling (brok C)

**Nieuw**
- Tab **Dossier**: tijdlijn (nieuwste boven) met datum, soortlabel, titel, verslag,
  vervolgdatum en aantal bijlagen. Filter op soort. Klik = bewerken; verwijderen
  met bevestiging (bijlagen blijven onder Documenten staan).
- Vervolgdatum → één taak in `taken` op naam van de ingelogde directielid:
  `bron='dossier'`, `bron_ref`=dossier-id, `bron_kenmerk`=soort, `gepland_op`
  om 09:00, `soort='eenmalig'`, `status='actueel'`. Datum wijzigen werkt de
  taak bij; datum wissen of regel verwijderen ruimt de nog open taak op.
  Afgevinkte taken blijven altijd staan als historie.
- Tab **Documenten**: slepen of kiezen, meerdere tegelijk, tot 25 MB per bestand,
  pad `<medewerker_id>/<tijdstempel>_<naam>` in bucket `personeel`. Openen via
  signed URL (1 uur). Verwijderen haalt bestand én registratie weg.
- Bijlagen bij een dossierregel (in het bewerkvenster); ze verschijnen ook onder
  Documenten met "bij: <titel>".
- Signaal in de lijst en op de Dossier-tab: oranje als er in 12 maanden geen
  functionerings- of beoordelingsgesprek is vastgelegd. Alleen voor wie in dienst
  is en langer dan een jaar werkt.
- Tellers op de tabs Dossier en Documenten.

**Bewust niet**
- `verzuimcontact` zit wel in het filter maar niet in het keuzemenu voor nieuwe
  gebeurtenissen: die soort hangt aan een ziekmelding en komt in brok D.

**Aanname om te testen**
- Dat het directie-account in `taken` mag *verwijderen* (RLS). Invoegen en
  bijwerken doet taken.html al met hetzelfde account; verwijderen is niet
  nagekeken. Faalt het, dan meldt de app het als toast en blijft de taak staan.

## v0.1.0 — Skelet met werkende Gegevens-tab (brok B)

**Nieuw**
- Login met het Schilders Calc account (eigen `storageKey: sb-personeel-auth`).
- Toegangscheck op `taken_rollen.ziet_personeel`; zonder vlag een nette melding
  "Alleen voor de directie". De database blokkeert zelf ook via RLS.
- Overzicht links: alle medewerkers uit `pers_medewerkers`, in planbordvolgorde,
  met persoonskleur. Schakelaar "Ook uit dienst".
- Medewerkerkaart rechts met vijf tabs. Alleen **Gegevens** werkt in deze versie:
  kernvelden (functie, in dienst sinds, contract, telefoon, noodcontact) direct
  zichtbaar; geboortedatum, adres, privé-e-mail, uit dienst, status en notitie
  onder "Meer gegevens". Elk veld wordt bewaard bij het verlaten van het veld;
  groen kort oplichten = opgeslagen, rode toast = mislukt en teruggezet.
- "+ Medewerker": naam, functie en optionele koppeling aan een nog vrij
  planbord-id uit `plan_medewerkers`.

**Nog niet**
- Dossier, verzuim, certificaten, documenten (brok C–E), signaalbolletjes in de
  lijst, statistiek, koppeling met taken.html, planning die verzuim meeleest.

**Database (brok A, `personeel_01_tabellen.sql`, gedraaid 09-09-2026)**
- Tabellen `pers_medewerkers`, `pers_dossier`, `pers_verzuim`,
  `pers_certificaten`, `pers_documenten`; view `pers_verzuim_dagen`;
  functie `pers_mag_zien()`; kolom `taken_rollen.ziet_personeel`;
  bucket `personeel` (privé). Vijf startrijen: Gian, Max, Bjorn, Jens, Maud.
