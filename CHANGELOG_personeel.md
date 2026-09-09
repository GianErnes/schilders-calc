# CHANGELOG — personeel.html

Personeelsdossier van Ernes Schilders: gegevens, dossier, verzuim en certificaten
per medewerker, alleen zichtbaar voor de directie. Hoort bij `personeel_01_tabellen.sql`.

## v0.4.0 — Certificaten met herinneringstaak (brok E)

**Nieuw**
- Tab **Certificaten**: lijst met kleurstip (groen geldig, oranje binnen de
  herinneringstermijn, rood verlopen, grijs zonder vervaldatum). Knop
  *+ Certificaat*: soort (vrije tekst met suggesties), behaald op, verloopt op,
  herinnering … dagen vooraf (standaard 90, per certificaat instelbaar), notitie,
  scan als bijlage (verschijnt ook onder Documenten met "bij: <soort>").
- Eén taak per certificaat in `taken`: `bron='certificaat'`, `bron_ref`=id,
  gepland op vervaldatum min termijn (of vandaag als die al voorbij is).
  Datum of termijn wijzigen schuift de taak mee; vervaldatum wissen of
  certificaat verwijderen zet de open taak op vervallen.
- Signaal in de lijst links (oranje bolletje met tooltip) bij certificaten die
  binnen de termijn verlopen of al verlopen zijn.

**Database (`personeel_05_certificaten.sql`)**
- Kolom `pers_certificaten.herinner_dagen integer not null default 90`
  (0–730).

## v0.3.1 — Volgende mijlpaal uit de echte taak, plus twee database-fixes

**Gerepareerd**
- Het rode verzuimblok toonde de volgende mijlpaal uit de kalender, ook als die
  taak al was afgevinkt. Nu leest de app de open poortwachter-taak uit `taken`
  en toont die; de kalender is alleen nog terugval als er geen open taak is.

**Database — nodig gebleken tijdens de test van brok D**
- `personeel_03_taken_bron.sql`: check-constraint `taken_bron_check` kende alleen
  `offerte`, `yoobi`, `eigen`; uitgebreid met `dossier`, `verzuim`, `certificaat`.
- `personeel_04_taken_policies.sql`: de vier RLS-policies op `taken` kenden die
  bronnen ook niet, waardoor personeelstaken niet leesbaar, bij te werken of te
  verwijderen waren en de app ze niet mocht invoegen (afvinken gaf "Afgevinkt"
  maar raakte nul rijen). Policies opnieuw aangemaakt met identieke logica en
  de uitgebreide bronlijst.
- Les: de vervolgtaak uit v0.2.0 (`bron='dossier'`) heeft tot deze fix nooit
  kunnen bestaan. Mijn bewering daar dat taken.html "niets aan de database"
  nodig had, was een ongecontroleerde aanname.

**Getest in de echte omgeving (09-09-2026)**
- Ziekmelding → taak week 6 (trigger 1); afvinken in taken.html → taak week 8
  op de juiste datum (trigger 2).

## v0.3.0 — Verzuim met poortwachter-reeks (brok D)

**Nieuw in de app**
- Tab **Verzuim**: knop *Ziekmelding* (eerste ziektedag, percentage, afspraken;
  bewust geen klachtveld). Lopende melding bovenaan met dag- en weekteller,
  percentage, afspraken en de eerstvolgende mijlpaal. Knoppen *Hersteld*,
  *Contactmoment*, *Aanpassen*. Historie van afgesloten periodes met duur.
- *Contactmoment* maakt een dossierregel van soort `verzuimcontact` met
  `verzuim_id`; verschijnt onder de melding én in het dossier. Die soort is
  alleen kiesbaar vanuit een ziekmelding.
- Samenvatting per kalenderjaar: aantal meldingen en kalenderdagen (afgekapt
  op jaargrens). Echte statistiek volgt in brok G.
- Lijst links: rood bolletje bij lopend verzuim; kaartkop toont "ziek gemeld".
- Verwijderen van een melding alleen voor foutieve invoer; zet open taken op
  vervallen, laat contactmomenten staan.

**Nieuw in de database (`personeel_02_verzuim.sql`)**
- `pers_verzuim_mijlpalen` (week, titel, toelichting, actief) — startlijst
  weken 6, 8, 26, 42, 52, 87. Aanpasbaar zonder code. Controleren bij arbodienst.
- `pers_verzuim_plan_volgende(verzuim_id, na_week)` maakt de taak voor de
  eerstvolgende mijlpaal die nog niet voorbij is: `bron='verzuim'`,
  `bron_ref`=verzuim-id, `bron_kenmerk`=week, op naam van wie de melding invoerde.
- Trigger op `pers_verzuim`: bij insert eerste mijlpaal; bij herstel (tot gevuld)
  open verzuimtaken op `vervallen`; bij heropenen opnieuw eerste mijlpaal.
- Trigger op `taken`: verzuimtaak afgevinkt → volgende mijlpaal. Werkt ook
  vanuit taken.html.

**Aannames om te testen**
- Dat de trigger op `taken` afgaat bij het afvinken in taken.html (update van
  `voltooid_op`, taken.html regel 1707) en dat de `security definer`-functies
  door RLS heen mogen schrijven in `taken`.
- Dat de mijlpaaldatum (van + week×7) klopt met wat de arbodienst hanteert.

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
