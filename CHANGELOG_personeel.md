# CHANGELOG — personeel.html

Personeelsdossier van Ernes Schilders: gegevens, dossier, verzuim en certificaten
per medewerker, alleen zichtbaar voor de directie. Hoort bij `personeel_01_tabellen.sql`.

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
