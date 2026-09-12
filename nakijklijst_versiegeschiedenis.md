# Nakijklijst v4.65.2 — versie-geschiedenis oud → nieuw

Per versie: de nieuwe zin, daaronder de eerste 250 tekens van de oude tekst. De volledige oude tekst staat in CHANGELOG.md.

## v4.65.0 (2026-09-12)
**Nieuw:** Knop 🔄 op een calc-regel wisselt het verfsysteem; naam, hoeveelheid, toeslag, aan/uit en meetstaat blijven staan. Geweigerd bij meetstaat met andere eenheid.

<sub>Oud: Verfsysteem wisselen op een calc-regel. Knop 🔄 in de regelkop (class systeem-naam, bewust zonder lock-allowed zodat het calc-slot hem uitschakelt, plus JS-borg met _isCalcLocked) opent de bestaande addSysModal; addSysCtx draagt een optioneel regelId …</sub>

## v4.64.0 (2026-09-10)
**Nieuw:** De Calculatie-app laat alleen nog het administratie-account binnen, zodat plannen nooit meer onvindbaar zijn door een verkeerde login.

<sub>Oud: Calculatie-app alleen nog met het administratie-account. Aanleiding 10-09-2026: een verzonden onderhoudsplan (VvE Chateau Geerlingshof) was onvindbaar omdat de tabel onderhoudsplannen een persoonlijke policy heeft (user_id = auth.uid()), alle plannen…</sub>

## v4.63.0 (2026-09-03)
**Nieuw:** Na akkoord op een onderhoudsplan krijgt de klant een getekend exemplaar met GEACCORDEERD-stempel en betaalwijze; ook downloadbaar via linkbeheer en Archiveren.

<sub>Oud: Getekend exemplaar voor planakkoorden (route 2, brok B). _bouwGetekendePdfBytes kent nu info.isPlan en info.betaalkeuze: titel Akkoordbevestiging onderhoudsplan, de zin Dit onderhoudsplan is digitaal geaccordeerd, en een regel Betaling met de nieuwe …</sub>

## v4.62.0 (2026-09-03)
**Nieuw:** Knop om alsnog een PDF te maken van een al verzonden planlink, uit de bevroren momentopname, zonder dat de link verandert.

<sub>Oud: PDF alsnog maken uit de momentopname van een bestaande planlink. Aanleiding: het Trilsbeek-Gid-plan was verzonden onder v4.51.0 (pdf_path null) en daarna per ongeluk gewijzigd; een nieuwe link zou de gewijzigde versie bevriezen, terwijl de schone ver…</sub>

## v4.61.1 (2026-09-03)
**Nieuw:** Reparatie: bij een vergrendeld plan kon je geen ander plan meer kiezen in de bronkiezer.

<sub>Oud: Reparatie op v4.60.0: het planslot zette ook de bronkiezer vast. De CSS op #onderhoud.is-locked raakte het zoekveld ohpBronZoek en de statusvinkjes in #ohpBronWrap, en de knop Wijzig in #ohpBronCompact had bovendien een JS-borg in _ohpWijzigBron; met…</sub>

## v4.61.0 (2026-09-03)
**Nieuw:** De accordeerlink van een onderhoudsplan krijgt nu een echte PDF-bijlage die de klant kan downloaden.

<sub>Oud: PDF bij de plan-accordeerlink (route 2, brok A van de plan-PDF-keten). Aanleiding: planlinks hadden pdf_path null (besluit v4.51.0), waardoor de klant niets kon downloaden, er geen getekend exemplaar was en Gian het verzonden document niet voor Yoobi…</sub>

## v4.60.0 (2026-09-03)
**Nieuw:** Onderhoudsplannen worden vergrendeld zodra de status niet meer Concept is, net als een verzonden offerte; instellingen worden bevroren.

<sub>Oud: Vergrendeling van onderhoudsplannen (brok planslot), spiegel van het calc-slot uit v3.7.0. Aanleiding: na het mailen van een plan sprong de status wel naar Verzonden (v4.51.0) maar dat was een kaal label; alle velden bleven bewerkbaar en een plan wer…</sub>

## v4.59.1 (2026-08-31)
**Nieuw:** Reparatie: achter elk voorwaardenvel van het plandocument kwam een lege pagina mee.

<sub>Oud: Reparatie op v4.59.0: achter elk voorwaardenvel van het plandocument schoof een leeg vel door, een plan van acht pagina\u0027s werd twaalf in plaats van tien (GEMETEN in een echte print: pagina 9 en 11 dragen het beeld, 10 en 12 zijn leeg, paginaform…</sub>

## v4.59.0 (2026-08-31)
**Nieuw:** Algemene voorwaarden staan nu achterin het plandocument, met de variant die bij het klanttype past.

<sub>Oud: Algemene voorwaarden achterin het plandocument (brok planvoorwaarden). Aanleiding: de planbrief belooft bijgevoegde voorwaarden en de akkoordvink op de klantpagina zegt bij een plan al inclusief de algemene voorwaarden, maar het plandocument sloot ni…</sub>

## v4.58.0 (2026-08-31)
**Nieuw:** Het per-stap-label in de beurt-modal toont nu het percentage of de spreiding (bv. 50-100%), zodat je ziet wat er is ingevuld.

<sub>Oud: Per-stap-label zegt hoeveel (brok staplabel). Puur weergave in de per-stap-modus van de beurt-bewerkmodal; aanleiding was een melding dat het snelveld het percentage leek te vergeten terwijl de waarden aantoonbaar goed stonden. _ohpMbStapSamenvatting…</sub>

## v4.57.0 (2026-08-31)
**Nieuw:** Per beurt kun je de staartposten (steiger, voorrij enz.) apart instellen: automatisch, eigen bedrag of uit.

<sub>Oud: Staartingreep per beurt (brok staartingreep). Nieuw blok in de beurt-bewerkmodal met alle staartposten van de bron-calculatie, per post de keuze automatisch, eigen of uit. Eigen betekent bij dag/week/eenheid een eigen aantal keer het brontarief (een …</sub>

## v4.56.0 (2026-08-30)
**Nieuw:** Een onderhoudsplan kan een eigen naam krijgen; leeg valt terug op de naam van de calculatie.

<sub>Oud: Eigen plannaam (brok plannaam). Kolom naam (text null) op onderhoudsplannen via een los idempotent SQL-bestand, gemapt in _mapOhpFromDB en _mapOhpToDB en de hele parameterketen (_ohpSaveParams, _ohpReadParamsFromUI, _ohpRenderParams, eventbinding). N…</sub>

## v4.55.0 (2026-08-30)
**Nieuw:** De mail bij een verlengingsplan krijgt automatisch een passende inleiding.

<sub>Oud: Mail-inleiding voor verlengingsplannen (brok 5c, het slot van de planbriefroadmap). Nieuwe helper _ohpPlanIsVerlenging(plan): leest de briefconfiguratie via _ohpBriefCfg en geeft true wanneer een gekozen inleiding-variant het woord verlenging in de n…</sub>

## v4.54.0 (2026-08-30)
**Nieuw:** Voorbeeldknop in het planbriefvenster toont de brief zoals hij wordt met de huidige keuzes.

<sub>Oud: Voorbeeldknop voor de planbrief (brok 5b van de planbriefroadmap). _ohpBriefBlokken kreeg een optionele derde parameter cfgArg; zonder argument valt hij op _ohpBriefCfg(plan) terug en gedraagt hij zich byte voor byte als voorheen, dus de printroute e…</sub>

## v4.53.1 (2026-08-30)
**Nieuw:** Twee opmaakcorrecties op de particuliere planbijlage: kleinere aanhef en strakkere uitlijning.

<sub>Oud: Twee beeldcorrecties op de particuliere bijlage. (1) .ob .aanhef p van 13pt naar 10,5pt met regelafstand 1,55, gelijk aan de basisletter van .ob; gewicht 500 en het scheidingslijntje blijven staan. Het blok was ooit een welkomstzin en een maat groter…</sub>

## v4.53.0 (2026-08-30)
**Nieuw:** Per plan kun je eigen tekst in de planbrief zetten, naast de bibliotheekvarianten.

<sub>Oud: Eigen tekst per plan in de planbrief (brok 5a van de planbriefroadmap). De twee plekken die blok.tekst wegstripten doen dat niet meer: _ohpBriefCfg en _ohpBriefOpslaan filteren voortaan op variantId of niet-lege tekst en nemen tekst mee wanneer die b…</sub>

## v4.52.1 (2026-08-30)
**Nieuw:** Reparatie: de planbrief bleef sinds v4.52.0 leeg door een programmeerfout.

<sub>Oud: Reparatie planbrief: _ohpBriefBlokken verwees naar BEDRIJF.naam, maar BEDRIJF is een constante lokaal aan _bouwOfferteDocHtml (v3.73.0) en bestaat op paginaniveau niet. De ReferenceError werd door de vangnet-try ingeslikt waardoor elke planbrief sind…</sub>

## v4.52.0 (2026-08-29)
**Nieuw:** Nieuwe planbrief met vier eigen secties (duurzaamheid, veiligheid, planresultaten, klantquotes) die alleen bij plannen verschijnen.

<sub>Oud: De planbrief (brok 4 van de planbriefroadmap). Vier nieuwe secties in OFFERTE_SECTIES direct na inleiding (duurzaamheid, veiligheid, planresultaten, klantquotes) met de nieuwe vlag alleenPlan: true; _offCfg zet zulke secties op een gewone offerte sta…</sub>

## v4.51.0 (2026-08-29)
**Nieuw:** Accordeerlink voor onderhoudsplannen: de klant kiest per beurt of per maand betalen en geeft akkoord; de app mailt de link.

<sub>Oud: Accordeerlink voor onderhoudsplannen, stap 3: de app-kant. Nieuwe knop Accordeerlink in het Beurten-blok van de Onderhoudsplan-tab opent ohpAccordLinkBeheer, een eigen venster op dezelfde overlay-id accordBeheerOverlay omdat de hele acb-opmaak in _AC…</sub>

## v4.50.0 (2026-08-29)
**Nieuw:** De planbijlage voor particulieren toont drie documentvarianten (contant, abonnement, beide) met een keuzeblok voor de klant.

<sub>Oud: Drie klantdocumenten op de OHP-bijlage plus een keuzeblok. Nieuwe helper _ohpDocModel(plan) geeft contant, abo of beide en valt bij een onbekende waarde terug op abo, gelijk aan _ohpIsAbo; _docModel wordt eenmaal boven in _ohpBuildOfferteHTML gezet, …</sub>

## v4.49.0 (2026-08-29)
**Nieuw:** De particuliere planbijlage toont beide betaalwegen in plaats van vooraf te kiezen; het totaalbedrag staat alleen nog in de planningstabel.

<sub>Oud: Particuliere hero van _ohpBuildOfferteHTML toont beide betaalwegen; VvE byte voor byte ongemoeid. Aanleiding: de hero splitste op _ohpIsAbo, dus het veld betaalmodel koos voor de klant. Bij contant was het grote getal de totale investering, en dat is…</sub>

## v4.48.0 (2026-08-29)
**Nieuw:** Bij het dupliceren van een calculatie gaan de offerte-instellingen mee, met een keuzevenster voor de klantgegevens.

<sub>Oud: dupCalc neemt offerte_config mee via een witte lijst, met een keuzevenster voor de klantgegevens. Aanleiding: offerte_config stond niet in dupCalc, dus na elke duplicatie moesten adres, contactpersoon, e-mail, telefoon, klanttype, garantiejaren, prij…</sub>

## v4.47.0 (2026-08-28)
**Nieuw:** Planbijlage: tijdlijn-steel hersteld, tabel volgt de beurten en klusjes zijn uit de klanttekst gehaald.

<sub>Oud: Tijdlijn-steel hersteld, tabel volgt de beurten, klusjes uit de klanttekst. (1) CSS-naamconflict: .ob .stem (stemmingsblok VvE-besluitpagina, v4.7.7) en .ob .tl-card .stem (tijdlijn-steel) heetten allebei .stem. Specificiteit beslist per eigenschap, …</sub>

## v4.46.0 (2026-08-28)
**Nieuw:** Bij particuliere abonnementsplannen laat de bijlage zien wie voorfinanciert en wat er bij opzegging wordt verrekend.

<sub>Oud: Voorfinancieringsbeeld bij particuliere abonnementsplannen plus verrekening bij opzegging. Nieuwe functie _ohpVoorfinanciering(plan) zet cumulatief betaald door de klant tegenover cumulatief geleverd door Ernes; negatief saldo is voorfinanciering doo…</sub>

## v4.45.1 (2026-08-28)
**Nieuw:** Reparatie van de reserveringslijn in het liquiditeitsblok van de VvE-bijlage (rekende een jaar te veel).

<sub>Oud: Reparatie van de reserveringslijn in het VvE-liquiditeitsblok van _ohpBuildOfferteHTML. De lus liep over jaren, dat is prijspeil tot en met eindJaar en dus looptijdJaren plus een elementen, terwijl R gelijk is aan gemPerJaar en dat is totaalGemiddeld…</sub>

## v4.45.0 (2026-08-28)
**Nieuw:** Looptijd en startdatum van het maandbedrag zijn per plan instelbaar; de bijlage toont ook de contante variant.

<sub>Oud: Instelbare looptijd van het maandbedrag plus de contante afvang op de bijlage. Twee kolommen abo_startdatum (date null) en abo_aantal_maanden (integer null, check groter dan nul) op onderhoudsplannen, meegenomen in _mapOhpFromDB, _mapOhpToDB, _ohpSav…</sub>

## v4.44.0 (2026-08-28)
**Nieuw:** Eenmalige beurten staan nu ook op de particuliere planbijlage.

<sub>Oud: Eenmalige beurten zichtbaar op de particulier-bijlage. _ohpBuildOfferteHTML rekende totaalEenmalig al uit sinds v3.23.2 maar zette het nergens in de HTML; van de drie weergaven was uitgerekend het klantdocument de enige die zweeg, terwijl _ohpRenderR…</sub>

## v4.43.0 (2026-08-25)
**Nieuw:** Per calculatie wordt vastgelegd wanneer de documenten en het getekende exemplaar zijn gearchiveerd.

<sub>Oud: Archiveer-markeringen per calculatie. Twee nieuwe kolommen op public.calculaties, arch_documenten_op en arch_getekend_op, beide timestamptz null, gezet via een gerichte update van alleen dat ene veld en bewust NIET opgenomen in _mapCalcHeaderToDB, om…</sub>

## v4.42.0 (2026-08-24)
**Nieuw:** In het calculatie-archief zijn Geaccepteerd en Verloren per jaar in- en uit te klappen.

<sub>Oud: Jaarlaag binnen de statusgroepen Geaccepteerd en Verloren van het calculatie-archief. Twee nieuwe Sets naast het bestaande _dashCollapsed-patroon: _jaarCollapsed houdt de ingeklapte jaarkoppen bij met sleutel status:jaar (afwezigheid is open) en _jaa…</sub>

## v4.41.0 (2026-08-24)
**Nieuw:** Bewerkingen onder een calc-regel zijn in- en uit te klappen en staan standaard dicht voor overzicht.

<sub>Oud: Bewerkingsregels per calc-regel in- en uitklappen, standaard dicht. Nieuwe Set _regelOpen naast het bestaande _matFilterOffRegelStap-patroon houdt bij welke regel-IDs open staan; leeg betekent alles dicht, dus zowel een verse calculatie als een herla…</sub>

## v4.40.2 (2026-08-09)
**Nieuw:** Boekingsknop volgt de naamconventie: achternaam als klant en Achternaam | werksoort als projectnaam.

<sub>Oud: Boekingsknop volgt de naamconventie: alleen de achternaam in klant en Achternaam | werksoort als projectnaam. Nieuwe helper _opnameAchternaam laat het eerste woord van de boekingsnaam vallen (Silka Duvekot wordt Duvekot, J.C. Toebermann wordt Toeberm…</sub>

## v4.40.1 (2026-08-09)
**Nieuw:** De offertedeadline wordt gevuld (opname + 14 dagen) bij Calculatie aanmaken vanuit een boeking.

<sub>Oud: Deadline offerte gevuld bij Calculatie aanmaken vanuit het boekingenblok. De veldentabel van de overdracht kende deadline_datum niet, dus _opnameMaakCalc liet hem leeg terwijl de change-handler op calcOpname hem bij handmatige invoer wel afleidt (opn…</sub>

## v4.40.0 (2026-08-09)
**Nieuw:** Opnameboekingen uit het webformulier staan op het dashboard; vanuit een boeking maak je met een klik een calculatie.

<sub>Oud: Opnameboekingen op het dashboard. Nieuw blok opnameBoekingenBlok tussen de tegels en Calculaties, getekend door _opnameTeken en gevuld door _opnameVerversen vanuit renderDashboard: een select op opname_boekingen via _sbQuery (throttle 15 s, geforceer…</sub>

## v4.39.0 (2026-07-26)
**Nieuw:** Per onderhoudsbeurt een vinkje Ingepland in de Planning-matrix, als afvinklijst voor de jaarlijkse ronde langs Yoobi.

<sub>Oud: Ingepland-stand per onderhoudsbeurt in de Planning-matrix, als afvinklijst voor de jaarlijkse ronde langs de Yoobi-planning. Gemodelleerd op het bestaande patroon van reeds_uitgevoerd (v3.24.5): SQL zet een boolean ingepland met default false op zowe…</sub>

## v4.38.0 (2026-07-25)
**Nieuw:** Het telefoonnummer uit Yoobi wordt opgeslagen en komt mee in de nabeltaak.

<sub>Oud: Telefoonnummer uit Yoobi wordt opgeslagen en reist mee naar de nabeltaak. Tot nu toe toonde _yoobiRenderDetail het nummer alleen onder de kop "wordt niet opgeslagen", terwijl de Edge Function yoobi-klant sinds v3.99.0 per contactpersoon al een telefo…</sub>

## v4.37.0 (2026-07-25)
**Nieuw:** De rijafstand wordt via een eigen serverfunctie opgehaald, zodat hij niet meer vastloopt in de browser.

<sub>Oud: Rijafstand via een eigen Edge Function in plaats van rechtstreeks uit de browser. Aanleiding: na de omzetting naar api.heigit.org in v4.36.1 bleef Afstand ophalen falen met AbortError na 8 s, ook bij herhaald drukken. Op het forum van openrouteservic…</sub>

## v4.36.1 (2026-07-25)
**Nieuw:** Rijafstand omgezet naar het nieuwe adres van OpenRouteService.

<sub>Oud: Rijafstand omgezet naar het nieuwe HeiGIT-adres. _orsAfstandMeters roept voortaan api.heigit.org/openrouteservice/v2/directions/driving-car aan in plaats van api.openrouteservice.org/v2/directions/driving-car. Aanleiding: na het uitrollen van v4.36.0…</sub>

## v4.36.0 (2026-07-25)
**Nieuw:** Alle externe diensten (PDOK, OpenRouteService enz.) proberen het opnieuw bij een storing en melden bij naam wat er faalt.

<sub>Oud: Herkansing en tijdslimiet op alle externe aanroepen, plus meldingen die de dienst bij naam noemen. Aanleiding: PDOK viel op 25-07 een middag weg met Failed to fetch in de app, terwijl vijftien pogingen vanuit een testpagina op dezelfde GitHub Pages-h…</sub>

## v4.35.1 (2026-07-25)
**Nieuw:** De opvolgautomaat belt op de eerstvolgende maandag na het mailen, niet dezelfde dag.

<sub>Oud: Ritme van de opvolgautomaat bijgesteld. Edge Function offerte-herinnering: constante BEL_MIN_DAGEN (3) verwijderd, nieuwe helper eersteMaandagNa (ymdPlus +1 en dan eersteMaandagVanaf) bepaalt de beldatum, zodat het nabellen op de eerstvolgende maanda…</sub>

## v4.35.0 (2026-07-25)
**Nieuw:** Automatische opvolging van verstuurde offertes: beltaak, herinneringsmail, verloopmail en afsluittaak, per offerte uit te zetten.

<sub>Oud: Automatische opvolging van verstuurde offertes. SQL: zes kolommen op offerte_accorderingen (gemaild_op, beltaak_op, herinnering_op, verlopen_mail_op, afsluittaak_op, automaat_uit) plus een partiele index. Edge Function offerte-verzenden zet na een ge…</sub>

## v4.34.0 (2026-07-25)
**Nieuw:** Overlappende datumvelden in de calc-kop verholpen.

<sub>Oud: Overlappende datumvelden in de calc-kop verholpen. In Project en planning (opname-datum naast deadline) en in Offerte-instellingen (offertedatum naast geldig tot) sloten twee vakjes naadloos op elkaar aan. Oorzaak: input[type=date] heeft in WebKit ee…</sub>

## v4.33.0 (2026-07-24)
**Nieuw:** Hoger tekstcontrast op de iPad voor buitenopnames in zonlicht.

<sub>Oud: Hoger tekstcontrast op de iPad voor buitenopnames in zonlicht. Binnen het bestaande aanraakscherm-blok van v4.30.0 wordt :root opnieuw gedeclareerd met --ink #000000 (contrast op wit 16,9 naar 21,0), --ink-soft #1f2937 (7,6 naar 14,7) en --muted #374…</sub>

## v4.32.0 (2026-07-24)
**Nieuw:** Alle drie de blokken in de calc-kop hebben nu veldbreedtes die bij de inhoud passen.

<sub>Oud: De flex-aanpak van v4.31.0 uitgerold over alle drie de blokken in de calc-kop. .kgrid-kort is hernoemd naar .kgrid-vrij en toegepast op Project en planning (statische markup), Klant en adres plus beide briefhoofd-varianten (renderOfferteBlok) en Offe…</sub>

## v4.31.0 (2026-07-24)
**Nieuw:** Offerte-instellingen krijgt eigen veldbreedtes, zodat korte velden niet meer over de hele breedte uitrekken.

<sub>Oud: Offerte-instellingen krijgt eigen veldbreedtes. Het blok gebruikte het gedeelde .kgrid met grid-template-columns repeat(auto-fit, minmax(135px, 1fr)); door de 1fr rekte elke kolom over de volle blokbreedte uit, wat bij zes korte velden (twee datums, …</sub>

## v4.30.0 (2026-07-24)
**Nieuw:** Calculatie- en Meetstaat-tab worden op de iPad 30% groter weergegeven.

<sub>Oud: Grotere weergave van de Calculatie- en Meetstaat-tab op aanraakschermen. Nieuwe media query @media (hover: none) and (pointer: coarse) and (min-width: 700px) and (min-height: 700px) die zoom: 1.3 zet op #calculatie en #meetstaat. De combinatie hover:…</sub>

## v4.29.0 (2026-07-23)
**Nieuw:** Een leeg percentageveld in een bewerkingsregel wordt rood gemarkeerd, omdat het stil als 0% rekent.

<sub>Oud: Visuele signalering van een leeg percentage in een calc-regel-stap. Nieuwe helper _pctIsLeeg(v) geeft false bij null/undefined (die vallen in calcSnapshotStep via ?? terug op 100 en het veld toont 100), true bij lege of witruimte-tekst (rekent stil a…</sub>

## v4.28.0 (2026-07-22)
**Nieuw:** Bij het mailen van een offerte kun je de begeleidende tekst vooraf aanpassen.

<sub>Oud: Begeleidende tekst bij het mailen van een offerte. De knop acbMail opent nu niet meer een kale confirm maar rendert via _offerteMailen een compose-venster in de acb-body: een "Naar {email}"-regel, een textarea voorgevuld met _offerteMailStandaardteks…</sub>

## v4.27.0 (2026-07-21)
**Nieuw:** De Yoobi-import vult bij particulieren ook het briefadres.

<sub>Oud: Yoobi-import uitgebreid voor het briefadres uit v4.26.0. _yoobiVulIn vult bij een particulier het klantadres uit Yoobi nu ook in cfg.briefadres (straat/huisnummer/postcode/woonplaats), zodat het briefhoofd bovenaan de offerte staat zonder overtypen; …</sub>

## v4.26.1 (2026-07-21)
**Nieuw:** Opmaakfix: het Offertenummer-veld stond lager dan de andere velden.

<sub>Oud: Opmaakfix: het Offertenummer-veld in offerteInstellingenBlok stond lager doordat de lange sub-muted hint in het label over drie regels brak. De hint (Yoobi-verkoopnummer, verplicht voor de accordeerlink) is uit het label gehaald en als kleine notitie…</sub>

## v4.26.0 (2026-07-21)
**Nieuw:** Afwijkend briefadres bij particulieren, plus nieuwe invulvelden {adres} en {werkadres}.

<sub>Oud: Twee dingen. (1) Afwijkend briefadres bij particulier: nieuw veld cfg.briefadres (JSON, geen migratie) met setter _offCfgBriefadres en PDOK-zoek _offBriefadresZoek. _offAdresEffectief pakt in de particulier-tak het briefadres als dat gevuld is, ander…</sub>

## v4.25.0 (2026-07-13)
**Nieuw:** De aanspreekvorm stuurt de adresseringsnaam op de offerte (De heer, Mevrouw, Familie enz.).

<sub>Oud: Aanspreekvorm stuurt de adresseringsnaam. Nieuwe helpers _offNaamKaal (stript voorvoegsels De heer en mevrouw/De heer/Dhr./Mevrouw/Mevr./Mw./Familie/Fam. case-insensitive van de klantnaam) en _offAdresNaam (zet per aanspreekvorm De heer/Mevrouw/De he…</sub>

## v4.24.1 (2026-07-12)
**Nieuw:** Witte rand om de windroosletters op de liggingsfoto, leesbaar op donkere daken.

<sub>Oud: Witte halo om de windroosletters op de liggingsfoto. In _ohpLiggingTeken werden N/Z/O/W buiten de schijf direct op de luchtfoto gezet met fillText in #1f2430, onleesbaar op donkere daken en schaduw. Nieuw: per letter eerst strokeText met rgba(255,255…</sub>

## v4.24.0 (2026-07-12)
**Nieuw:** De liggingsfoto staat als magazine-rij naast de tekst op pagina 1 van de planbrochure.

<sub>Oud: Liggingsfoto als magazine-rij in de onderhoudsplan-brochure. Het liggingblok (v4.22.0) stond als eerste ob-block op volle breedte (16:9, ~10 cm hoog); de greedy paginator van _ohpPaginate kreeg het forse vervolgblok (VvE: Wat het plan inhoudt met her…</sub>

## v4.23.0 (2026-07-12)
**Nieuw:** Σ-knop per beurt opent een zijpaneel met de volledige rekenverantwoording.

<sub>Oud: Rekenverantwoording per onderhoudsbeurt als zijpaneel. Σ-knop per rij in _ohpRenderBeurtenLijst (knoppenkolom 110 naar 150px) opent aside #ohpVerPaneel (patroon controlePaneel: fixed rechts 460px, body.ohpver-open duwt content en #vraagbaakTab, max-w…</sub>

## v4.22.0 (2026-07-12)
**Nieuw:** Liggingsfoto met windroos, schaalbalk en weerzijde op het onderhoudsplan, uit de PDOK-luchtfoto.

<sub>Oud: Liggingsfoto met windroos op het onderhoudsplan. Nieuwe sectie Ligging (ohpLiggingSectie, een details boven de Beurten in ohpPlanBlok) haalt via de PDOK Luchtfoto RGB WMS een luchtfoto van boven op en tekent er op canvas een windroos, een schaalbalk …</sub>

## v4.21.1 (2026-07-11)
**Nieuw:** Opmaakfix in de beurt-modal: regels op 0% vielen uit de kolommen.

<sub>Oud: Dubbel style-attribuut in de beurt-modal gerepareerd. In _ohpMbRenderPerRegel en _ohpMbRenderPerStap kreeg een regel of stap op 0% een dim-variabele als losse style="opacity: 0.5;" naast het bestaande style-attribuut met de grid-indeling; de browser …</sub>

## v4.21.0 (2026-07-07)
**Nieuw:** De documentdatum staat in de kop van de planbijlage.

<sub>Oud: Documentdatum in de kop van de onderhoudsplan-bijlage (_ohpBuildOfferteHTML). De offertedatum werd via _offDatum al berekend maar stond alleen in de besluit-kenmerkzin (blok D, alleen VvE) en nergens op het document zelf; een VvE-beheerder merkte de …</sub>

## v4.20.1 (2026-07-06)
**Nieuw:** Naar Craft kijkt alleen nog naar sjabloonkopieën van vandaag.

<sub>Oud: Naar Craft filtert de "🏠Projectnaam"-treffers nu eerst op aanmaakdatum vandaag voordat er geteld wordt. craftNaarCraft: alleTreffers = alle documents.laatste_25 met titel exact "🏠Projectnaam" (aflopend op createdAt), daarna verseVandaag = alleTreffer…</sub>

## v4.20.0 (2026-07-05)
**Nieuw:** Instellingen toont het gebruik en de kosten van de leescontrole.

<sub>Oud: Controle-gebruik zichtbaar in Instellingen, gespiegeld op het Vraagbaak-blok van v4.15.0. Nieuw settings-blok Controle onderaan de Instellingen-tab met tellers voor deze maand en totaal (aantal leescontrole-beurten en kosten) plus de laatste twintig …</sub>

## v4.19.1 (2026-07-05)
**Nieuw:** De leescontrole gebruikt een sterker taalmodel voor een scherper oordeel.

<sub>Oud: Leescontrole (laag 2) naar Claude Opus 4.8. Alleen de Edge Function offerte-leescontrole wijzigt: MODEL van claude-sonnet-4-6 naar claude-opus-4-8 en de tariefconstanten PRIJS_IN_USD_MTOK/PRIJS_UIT_USD_MTOK van 3/15 naar 5/25 zodat de kostenberekenin…</sub>

## v4.19.0 (2026-07-05)
**Nieuw:** De geaccordeerde offerte gaat mee in de archiveer-reeks.

<sub>Oud: Geaccordeerde offerte in de archiveer-reeks. openArchiveerModal zoekt bij openen het nieuwste akkoord met bevroren PDF: select pdf_path, snapshot->>pdf, klant_naam, gereageerd_op, bedrag, notitie uit offerte_accorderingen op calculatie_id en status a…</sub>

## v4.18.0 (2026-07-04)
**Nieuw:** Controle opent in een zijpaneel in plaats van een venster; dubbele meldingen worden gebundeld.

<sub>Oud: Controlepaneel in plaats van modal plus bundelregel tegen dubbelingen. controleModal vervangen door aside #controlePaneel (position fixed rechts, 420px, z-index 90, paneel-head met de calcnaam in #ctlPaneelSub en paneel-body als #controleBody); body.…</sub>

## v4.17.0 (2026-07-04)
**Nieuw:** Leescontrole: een taalmodel leest de offerte na op fouten en meldt wat het vindt.

<sub>Oud: Leescontrole (laag 2) via de nieuwe Edge Function offerte-leescontrole. In controleerCalc staat onder de laag 1-uitkomst een blok Leescontrole met startknop en resultaatcontainer; _leescontroleVerzamel bouwt de compacte samenvatting: projectnaam, kla…</sub>

## v4.16.0 (2026-07-04)
**Nieuw:** Knop Controleer loopt dertien controles na op de offerte; geldigheidsnorm per klanttype (14/30/180 dagen).

<sub>Oud: Knop Controleer (laag 1) plus geldig-tot-norm per klanttype. Nieuwe knop in de panel-actions van de Calculatie-tab (lock-allowed) opent controleModal; _controleerVerzamel loopt dertien harde controles na en levert meldingen in drie zwaartes (blokkere…</sub>

## v4.15.0 (2026-07-04)
**Nieuw:** Instellingen toont het gebruik en de kosten van de Vraagbaak.

<sub>Oud: Vraagbaak-gebruik in Instellingen. Nieuw settings-blok Vraagbaak onderaan de Instellingen-tab: tellers voor deze maand en totaal (aantal vragen en kosten) plus de laatste twintig vragen met uitklapbaar antwoord (volledige vraag, gebruiker en antwoord…</sub>

## v4.14.4 (2026-07-04)
**Nieuw:** Fix: foto-onderschriften in de PDF-fotobijlage raakten los van hun foto.

<sub>Oud: Fix: losraken van het foto-onderschrift in de pdfmake-fotobijlage. Elke fotorij in _bouwOfferteCompleetDocDef is een columns-node met per cel een stack (image, status, opmerking, gebrekenlijst); pdfmake mocht binnen die node afbreken, waardoor bij ee…</sub>

## v4.14.3 (2026-07-04)
**Nieuw:** Versie-ophoging bij een nieuwe accordeerlink is een vraag geworden in plaats van automatisch.

<sub>Oud: Versie-ophoging bij nieuwe accordeerlink is een bevestigingsvraag geworden. _accordNieuweLink hoogde offerteVersie onvoorwaardelijk op zodra een eerdere accordering gereageerd_op, status akkoord/afgekeurd of vragen had (v3.91.0); eigen testreacties t…</sub>

## v4.14.2 (2026-07-04)
**Nieuw:** Fix: het dashboardblok Reacties op offertes verscheen soms dubbel.

<sub>Oud: Fix: dubbel dashboardblok Reacties op offertes. _accordMeldingenRender zocht het blok op vóór de await naar offerte_accorderingen en besliste daarna op die verouderde check; vuurden focus, visibilitychange en de 60s-poll (v4.11.0) tegelijk, dan zag e…</sub>

## v4.14.1 (2026-07-04)
**Nieuw:** Fix: de V-aanduiding van een herziene offerte stond niet op het document zelf.

<sub>Oud: Fix: V-aanduiding op het offertedocument zelf. Beide documentbouwers haalden het toonnummer op via _kenOfferteNummerToe, de kale toekenningsfunctie die geen versies kent; de V-suffix uit v3.91.0 zat alleen in _offerteNummer en bereikte daardoor wel d…</sub>

## v4.14.0 (2026-07-03)
**Nieuw:** Je krijgt een mail als de klant de accordeerlink voor het eerst opent; het versienummer is zichtbaar en aanpasbaar.

<sub>Oud: Openings-signaal op de accordeerlink plus zichtbaar versieveld. (1) Edge Function offerte-accord (apart gedeployed): de GET selecteert eerste_geopend_op en geopend_aantal erbij en registreert per opening laatst_geopend_op, geopend_aantal +1 en eenmal…</sub>

## v4.13.0 (2026-07-03)
**Nieuw:** Vraagbaak: stel rechts in de app een vraag over de bediening en krijg antwoord.

<sub>Oud: Vraagbaak voor de app-bediening. Verticaal label #vraagbaakTab rechts (writing-mode vertical-rl, var(--blue), display geregeld in _showApp en bij uitloggen net als userBadge, verborgen op print), modal vraagbaakModal met chatweergave (vb-vraag/vb-ant…</sub>

## v4.12.0 (2026-07-03)
**Nieuw:** De accordeerlink verloopt op de geldig-tot-datum; de klant ziet dan een nette melding.

<sub>Oud: Accordeerlink verloopt op de geldig-tot-datum. Edge Function offerte-accord (apart gedeployed): GET joint calculaties(naam, klant, offerte_config), leest geldigTot (yyyy-mm-dd) via leesGeldigTot met formaatcheck, geeft geldig_tot en verlopen terug en…</sub>

## v4.11.1 (2026-07-01)
**Nieuw:** Volledige code-doorlichting gedraaid; drie kleine gebreken opgeruimd.

<sub>Oud: Doorlichting-opvolging. Volledige code-audit gedraaid (ESLint met 11 foutregels over alle inline JS, plus eigen checks op dubbele functies/ids, stille catches, XSS bij klantinvoer, geheimen, listener-stapeling, tagbalans en dode code): uitslag schoon…</sub>

## v4.11.0 (2026-07-01)
**Nieuw:** Getekend exemplaar direct in de viewer, downloadknop in de bevestigingsmail en zelfverversende reactie-meldingen.

<sub>Oud: Getekend exemplaar in de viewer, downloadknop in mail B en zelfverversende reactie-meldingen. (1) Edge Function offerte-accord (apart gedeployed): mailBevestiging krijgt de token als vierde parameter en mail B bevat een groene knop "Uw getekende offe…</sub>

## v4.10.6 (2026-06-29)
**Nieuw:** Melding Kopie gemaakt na het dupliceren van een calculatie.

<sub>Oud: Bevestigingsmelding na dupliceren van een calculatie. dupCalc toont na data.calculaties.unshift(fresh) en renderDashboard() een _toast("Kopie gemaakt, staat nu bij Concept.", "ok"). Reden: het kopieer-knopje ⎘ staat op elke rij ongeacht status, maar …</sub>

## v4.10.5 (2026-06-29)
**Nieuw:** Naar Craft stopt met een melding als er meerdere sjabloonkopieën staan.

<sub>Oud: Vangnet in craftNaarCraft tegen meerdere "🏠Projectnaam"-duplicaten. Na het filteren en sorteren wordt aantalTreffers = treffers.length bewaard; is dat groter dan 1, dan volgt een alert met het aantal en de instructie op te ruimen tot precies één, en …</sub>

## v4.10.4 (2026-06-29)
**Nieuw:** Naar Craft kiest bij meerdere sjabloonkopieën de nieuwste.

<sub>Oud: Naar Craft kiest bij meerdere "🏠Projectnaam"-treffers nu het nieuwste duplicaat in plaats van de eerste uit de lijst. craftNaarCraft filtert alle documenten in documents.laatste_25 met titel exact "🏠Projectnaam", sorteert ze aflopend op createdAt en …</sub>

## v4.10.3 (2026-06-29)
**Nieuw:** Geen leeg keuzerondje meer in de Yoobi-import bij één contactpersoon.

<sub>Oud: Geen leeg keuzerondje meer in de Yoobi-import. _yoobiRenderDetail toont de contactpersoon en de e-mailbron alleen als keuzerondje wanneer er echt iets te kiezen valt. Bij precies één contactpersoon komt die als platte tekst (naam, e-mail) met een ver…</sub>

## v4.10.2 (2026-06-28)
**Nieuw:** Schonere documenttitel in Craft: alleen de projectnaam.

<sub>Oud: Schonere titel in Craft. De documenttitel is nu alleen de projectnaam: titel = "🏠" + (c.naam || c.klant || "Project"), in plaats van klant en projectnaam met een pipe ertussen. De klantnaam zit meestal al in c.naam, dus dat stond dubbelop in de kop. …</sub>

## v4.10.1 (2026-06-28)
**Nieuw:** De locatie staat in het onderschrift van de kozijntekeningen in Craft.

<sub>Oud: Locatie in het onderschrift van de kozijntekeningen in Craft. _craftBouwKozijnen bouwt nu, net als de offerte-bijlage, een regelLocatie-map op (per r.id de hoofdgroep.naam · onderdeel.naam uit c.hoofdgroepen) en geeft regelLocatie[ms.calcRegelId] mee…</sub>

## v4.10.0 (2026-06-28)
**Nieuw:** Kozijntekeningen gaan mee naar Craft.

<sub>Oud: Craft-koppeling brok 4c: kozijntekeningen mee naar Craft. Nieuwe helper _craftBouwKozijnen(c) loopt door c.meetstaat gefilterd op ms.tekening.vorm, bouwt per kozijn de SVG via _kozijnThumbSvg(ms.tekening, 0, {genummerd:true, fill:true}) (met de genum…</sub>

## v4.9.0 (2026-06-28)
**Nieuw:** Foto's gaan mee naar Craft; dubbel verzenden voorkomen.

<sub>Oud: Craft-koppeling brok 4b plus dubbeldruk-fix. (1) Foto\\u0027s mee naar Craft: _craftBouwFotos(c) signt de URL\\u0027s (_signFotoUrls op de fotos zonder signedUrl), bakt per foto de genummerde gebrekstippen via _craftFotoDataUrl(f, 1600) (eigen verkle…</sub>

## v4.8.0 (2026-06-28)
**Nieuw:** Knop Naar Craft stuurt de werkvoorbereiding naar het projectsjabloon in Craft.

<sub>Oud: Craft-koppeling brok 4a: knop "Naar Craft" in de calculatie-kop (panel-actions, naast Klant uit Yoobi, id craftKnop). Stuurt de werkvoorbereiding naar het verse "🏠Projectnaam"-duplicaat in Craft via de Edge Function craft-werkvoorbereiding. Nieuwe co…</sub>

## v4.7.14 (2026-06-27)
**Nieuw:** Juridisch correcte bedenktermijn op de ALV-besluitpagina na check van de adviseur.

<sub>Oud: Juridisch correcte bedenktermijn op de ALV-besluitpagina, na een scherpe juridische check van de adviseur. De disclaimer verwees voor de termijn van één maand alleen naar artikel 2:15 BW; dat artikel regelt de vernietigbaarheid van besluiten maar ken…</sub>

## v4.7.13 (2026-06-27)
**Nieuw:** Conclusiezin van het liquiditeitsblok aangescherpt na opmerking van de adviseur.

<sub>Oud: Conclusiezin van het liquiditeitsblok aangescherpt na opmerking van de adviseur. De zin zei "Op dat punt moet uw reserve minstens € X bedragen om de uitgaven te dekken", wat kon lezen alsof € X de totale benodigde reserve was, terwijl de VvE op dat m…</sub>

## v4.7.12 (2026-06-27)
**Nieuw:** Bewaren als PDF stelt nu de plannaam voor als bestandsnaam.

<sub>Oud: Logische bestandsnaam bij het opslaan van de onderhoudsplan-bijlage. De print-dialoog ("Bewaar als PDF") stelde standaard "Schilders Calculatie" voor, omdat _ohpPrintOfferte de document.title niet aanpaste. _setPrintTitle heeft nu een optionele tweed…</sub>

## v4.7.11 (2026-06-27)
**Nieuw:** De planbijlage benoemt de resultaatverplichting expliciet: het pand de hele looptijd in goede staat.

<sub>Oud: Resultaatverplichting expliciet gemaakt in de bijlage. (1) Sectie 01 opent nu met een blok dat de kern van het aanbod neerzet: geen lijst met losse klusjes maar een resultaat, het pand de hele looptijd in goede staat met 100% garantie, waarbij Ernes …</sub>

## v4.7.10 (2026-06-27)
**Nieuw:** Administratie-zin in de VvE-bijlage aangescherpt.

<sub>Oud: Administratie-zin in de VvE-bijlage aangescherpt. De callout "Voor uw administratie" beloofde de cijfers "ook als overzicht per onderdeel" zonder niveau te noemen, wat schuurde met de bewuste keuze om geen eenheidsprijzen en hoeveelheden te tonen. De…</sub>

## v4.7.9 (2026-06-27)
**Nieuw:** Logo-fix: logo's in de planbijlage bleven bij printen soms leeg.

<sub>Oud: Logo-fix in de onderhoudsplan-bijlage. Het Ernes-logo in de kop en de voet en het Onderhoudsgarantie+ plan-logo in de kop bleven bij het printen soms leeg, terwijl de tekst wel verscheen, vooral in Safari. Oorzaak: de data-URI-afbeeldingen waren nog …</sub>

## v4.7.8 (2026-06-27)
**Nieuw:** Rustiger hero-blok in de planbijlage: licht met dunne omlijning in plaats van zwart.

<sub>Oud: Rustiger hero-blok in de onderhoudsplan-bijlage. Het kader met de jaarreservering (VvE) of de maandprijs (particulier) was een koud, bijna zwart vlak (background var(--ink), witte tekst) dat op de verder warme pagina te zwaar uitsprong. Het is nu var…</sub>

## v4.7.7 (2026-06-27)
**Nieuw:** ALV-besluitpagina, kenmerk in de kop en Vakwerk-embleem op de zekerheidspagina van de VvE-bijlage.

<sub>Oud: Blok D (ALV-besluitpagina), kenmerk in de kop en het Vakwerk-embleem op de zekerheidspagina. (1) De VvE-bijlage krijgt als laatste sectie "Besluit van de vergadering van eigenaren" (auto-genummerd via nextSec, alleen voor isVve): lead, drie besluitpu…</sub>

## v4.7.6 (2026-06-27)
**Nieuw:** Titel met plantype, complexnaam en scope in de kop van de planbijlage.

<sub>Oud: Titel in de masthead van de onderhoudsplan-bijlage. Boven de scheidingslijn, in het midden tussen het Ernes-logo en het garantie-logo, staat nu een titelblok (variant B): klein "Onderhoudsgarantie+ plan" als plantype, daaronder de complexnaam dik met…</sub>

## v4.7.5 (2026-06-27)
**Nieuw:** Afwerking van de liquiditeitsgrafiek in de VvE-bijlage.

<sub>Oud: Finesse-afwerking van de liquiditeitsgrafiek in blok B van de VvE-bijlage. (1) Het bedrag dat op een dieptepunt uit de reserve gaat staat nu gecentreerd onder het bijbehorende jaar, onder de nullijn, los van de polylijnen; het label "diepst" is uit h…</sub>

## v4.7.4 (2026-06-27)
**Nieuw:** Liquiditeitsblok breekt netjes over pagina's; stippellijn hersteld.

<sub>Oud: Twee fixes in blok B van de VvE-bijlage. (1) Paginering: het liquiditeitsblok was \u00e9\u00e9n onsplitsbaar blok dat bij een lange looptijd over de paginarand liep en de conclusiezin tegen de voettekst duwde. Het is nu opgesplitst in drie blokken: e…</sub>

## v4.7.3 (2026-06-27)
**Nieuw:** Dataverlies-fix: op de iPad ging een getal verloren als je direct naar een ander veld tikte.

<sub>Oud: Dataverlies-fix in de meetstaat op aanraakschermen. De np-velden slaan op via een change-event, dat het cijferblok alleen afvuurde in next() (Volgende) en close() (buiten tikken); rechtstreeks van het ene getalveld naar het andere tikken committe het…</sub>

## v4.7.2 (2026-06-27)
**Nieuw:** VvE-bijlage toont de maandbijdrage per appartement (nieuw veld aantal appartementen).

<sub>Oud: VvE-bijlage: maandbijdrage per appartement plus scherpere onder-water-periode in blok B. Nieuw veld aantal appartementen op het plan (kolom aantal_appartementen, mapping aantalAppartementen, invoer ohpAantalApp in de VvE-sectie ohpScopeWrap, gelezen/…</sub>

## v4.7.1 (2026-06-27)
**Nieuw:** Kolommen in de liquiditeitstabel dragen nu (incl. btw).

<sub>Oud: Duidelijkheidsfix in blok B: onder elke bedragkolom van de .liq-table (Uitgave, Reservering, Cum. gereserveerd, Cum. uitgegeven, Saldo-opbouw) staat nu een klein "(incl. btw)" via een span.ex, naast de bestaande zin bovenaan. Nieuwe scoped CSS .ob ta…</sub>

## v4.7.0 (2026-06-27)
**Nieuw:** Sectie Reservering en liquiditeit met grafiek op de VvE-bijlage.

<sub>Oud: Blok B: sectie "Reservering en liquiditeit" op de VvE-offerte-bijlage. In _ohpBuildOfferteHTML, alleen isVve, wordt uit perJaar (incl btw) en gemPerJaar een liquiditeitsoverzicht gebouwd: per jaar uitgave, reservering, cumulatief gereserveerd (R maal…</sub>

## v4.6.2 (2026-06-27)
**Nieuw:** Opmaakfix: 100% past weer in het garantiezegel.

<sub>Oud: Opmaakfix: de "100%"-tekst in het zegel van de garantieregel-voorin liep over de rand van de cirkel. .ob .garblok .seal van 40px naar 44px, font-size van 12.5pt naar 9.5pt, font-weight 900 naar 800, letter-spacing -0.3px en white-space:nowrap toegevo…</sub>

## v4.6.1 (2026-06-27)
**Nieuw:** Externe posten staan op de VvE-bijlage, plus de garantieregel voorin.

<sub>Oud: Externe posten op de VvE-offerte-bijlage (brok 2) plus de garantieregel voorin. In _ohpBuildOfferteHTML, alleen bij isVve: een nieuwe sectie "Wat u zelf regelt en wanneer" gevoed door plan.externPosten, geplaatst na "Wat valt onder dit plan" met een …</sub>

## v4.6.0 (2026-06-26)
**Nieuw:** Externe posten per onderhoudsplan: wat de klant zelf regelt, met jaar, richtbedrag en garantievoorwaarde.

<sub>Oud: Externe posten per onderhoudsplan (brok 1: datalaag en invoer). Nieuwe tabel onderhoudsplan_externe_posten (plan_id naar onderhoudsplannen met cascade, user_id default auth.uid(), omschrijving, toelichting, jaartal nullable, richtbedrag nullable zoda…</sub>

## v4.5.0 (2026-06-24)
**Nieuw:** Kozijntekening-print toont het aantal per kozijn en telt de kop kloppend.

<sub>Oud: Aantal per kozijn op de kozijntekening-print. Elke kozijnkaart toont nu "Aantal: N stuks" uit ms.aantal (het aantal-veld van de meetstaat-regel), met bij meer dan één stuk de notitie dat de afmetingen en hoeveelheden per stuk zijn (m¹/m² blijven per …</sub>

## v4.4.0 (2026-06-24)
**Nieuw:** De meetstaat-bijlage begint met alle posten met hoeveelheid, ook zonder meetregels.

<sub>Oud: Meetstaat-bijlage (printMeetstaat) toont nu de volledige scope. Voorheen liep de bijlage alleen door c.meetstaat, waardoor calc-regels waarvan de hoeveelheid rechtstreeks in de verfsysteem-post is ingevuld (zonder meetregels) volledig uit de bijlage …</sub>

## v4.3.0 (2026-06-24)
**Nieuw:** De planbrochure verdeelt zichzelf automatisch over pagina's.

<sub>Oud: Onderhoudsplan-brochure paginieert nu automatisch. _ohpBuildOfferteHTML levert de inhoud niet meer als drie vaste A4-pagina met overflow:hidden, maar als een platte reeks .ob-block elementen (sectie 02 als label plus losse jaarblokken, de planningsta…</sub>

## v4.2.2 (2026-06-24)
**Nieuw:** Hoeveelheden in de beurt-modal afgerond op twee decimalen.

<sub>Oud: Hoeveelheden in de beurt-modal (onderhoudsplan) afgerond op maximaal twee decimalen. De twee regel-weergaves in _ohpOpenBeurtModal toonden r.hoeveelheid rauw, waardoor floating-point-restjes zoals 3.3135000000000003 en 13.100000000000001 zichtbaar we…</sub>

## v4.2.1 (2026-06-24)
**Nieuw:** Materiaalkosten per eenheid zichtbaar op de bewerkingsregel.

<sub>Oud: Materiaalkosten per eenheid op de bewerkingsregel in de calc-structuur. De regel toonde minuten en arbeidskosten per eenheid maar materiaal alleen als totaal (matTotaalStap), wat verwarrend was omdat het verkoopbedrag rechts per eenheid is. Achter de…</sub>

## v4.2.0 (2026-06-24)
**Nieuw:** GEACCORDEERD-stempel op elke pagina van het getekend exemplaar.

<sub>Oud: GEACCORDEERD-stempel op elke pagina van het getekend exemplaar. In _bouwGetekendePdfBytes (de gedeelde pdf-lib-opbouw voor jouw archiefkopie én de klant-download na akkoord) wordt vlak voor doc.save() over alle paginas behalve de laatste (de zojuist …</sub>

## v4.1.1 (2026-06-24)
**Nieuw:** Vetgedrukte regel Totaal materiaal incl. toeslagen in de totalen, voor overname in Yoobi.

<sub>Oud: Vetgedrukte regel "Totaal materiaal incl. toeslagen" in renderTotals, onder de plus-regels klein materiaal, afval en ARBO. Toont matVerkoop plus kleinMat plus afval plus arbo, zodat het materiaalbedrag inclusief de toeslagen in één keer over te nemen…</sub>

## v4.1.0 (2026-06-24)
**Nieuw:** Reiskosten buiten rayon rekenen altijd minstens één rit.

<sub>Oud: Reiskosten buiten rayon rekenen altijd minstens 1 rit. De reiskosten (zowel reisuren-arbeid als km-vergoeding) schaalden met de factureerbare dagen; bij een mini-klus die onder de afrond-drempel naar 0 factureerbare dagen viel, kwam de rit daardoor o…</sub>

## v4.0.1 (2026-06-24)
**Nieuw:** Compactere calc-kop: drie kaarten met doorlopend raster.

<sub>Oud: Compacte calc-kop. De drie blokken Project en planning, Klant en adres en Offerte-instellingen zijn elk teruggebracht tot één kaart met een doorlopend raster (kgrid) en dunne tussenkopjes (Contactpersoon, Werkadres, Briefhoofd) als scheidingsregels, …</sub>

## v4.0.0 (2026-06-24)
**Nieuw:** Klant- en adresgegevens gebundeld; calc-kop herverdeeld in Project, Klant en adres, Offerte-instellingen.

<sub>Oud: Klant- en adresgegevens gebundeld; calc-kop herverdeeld. De Calculatie-tab heeft bovenaan nu drie blokken: een statisch "Project en planning" (projectnaam, schilders, uren/werkdag, opname, deadline), en twee door renderOfferteBlok gevulde containers …</sub>

## v3.99.0 (2026-06-24)
**Nieuw:** Meerdere contactpersonen kiesbaar bij de Yoobi-import.

<sub>Oud: Meerdere contactpersonen kiesbaar bij de Yoobi-import. App-kant: _yoobiRenderDetail bouwt nu een contacten-lijst uit r.contacten (array van {naam, email}), met terugval op de oude enkele r.contactpersoon/r.emailContactpersoon zodat niks breekt als de…</sub>

## v3.98.0 (2026-06-24)
**Nieuw:** Werkadres los van het briefhoofd bij zakelijke klanten.

<sub>Oud: Werkadres losgetrokken van het briefhoofd voor zakelijke klanten. _offAdresEffectief is klanttype-bewust: bij cfg.klanttype zakelijk valt het briefhoofd-adres niet meer terug op het werkadres uit de calc-kop (c.postcode/c.huisnummer), alleen de naam …</sub>

## v3.97.0 (2026-06-24)
**Nieuw:** Urenblok verhelderd: Uren schilderwerk plus Totaal uren incl. toeslagen.

<sub>Oud: Urenblok in renderTotals verhelderd. De bovenste regel "Totaal uren" toonde alleen t.uren (schilderwerk) terwijl de toeslag-uren als losse + regels eronder stonden zonder optelsom. De bovenste regel heet nu "Uren schilderwerk"; na de toeslag-regels s…</sub>

## v3.96.0 (2026-06-23)
**Nieuw:** Offerte mailen naar de klant vanuit de app.

<sub>Oud: Resend-mails deel 2: offerte mailen vanuit de app. In _accordBeheerRender staat bij een open link onder de linkrij de knop acbMail "Offerte mailen naar klant" met daaronder het ontvangeradres uit rij.snapshot.klantEmail (of een rode hint als de link …</sub>

## v3.95.0 (2026-06-23)
**Nieuw:** Automatische mails: bevestiging aan de klant bij akkoord en intern seintje bij elke reactie.

<sub>Oud: Resend-mails deel 1: bevestiging aan de klant bij akkoord (mail B) en intern seintje bij elke reactie (mail C), afgevuurd vanuit de Edge Function offerte-accord na het wegschrijven van de reactie. Resend-aanroep via https://api.resend.com/emails met …</sub>

## v3.94.0 (2026-06-22)
**Nieuw:** Verfsysteem-overzichten op calculatie en werkbon gededupliceerd en compacter.

<sub>Oud: Verfsysteem-overzichten gededupliceerd en compacter op calculatie en werkbon. Nieuwe helper _groepeerUniekeVerfsystemen(regelCtxs) groepeert regels-met-stappen op een recept-handtekening (systeemNaam/eenheid/ondergrond/locatie plus per stap bewerking…</sub>

## v3.93.0 (2026-06-22)
**Nieuw:** Knop Klant uit Yoobi zoekt een klant en vult de gegevens in.

<sub>Oud: Yoobi-klantkoppeling brok 3: knop "Klant uit Yoobi" in de calculatie-kop opent een zoekvenster (modal id yoobiModal). _yoobiCall doet een ingelogde fetch naar de Edge Function yoobi-klant met de Supabase-sessie als Bearer-token plus apikey-header, zo…</sub>

## v3.92.0 (2026-06-21)
**Nieuw:** Productieve uren op de werkbon (met instelbare aftrek indirecte uren) en compactere PDF.

<sub>Oud: Uren op de werkbon plus compactere PDF-uitvoer. Nieuwe instelling indirecteUrenAftrek (default 10, in app_settings, geen migratie) met veld setIndirecteUrenAftrek onder Instellingen via de generieke updSetting. In printWerkbon wordt een reductiefacto…</sub>

## v3.91.0 (2026-06-21)
**Nieuw:** Herziene offerte krijgt een V-aanduiding achter het nummer.

<sub>Oud: Versie-aanduiding bij een herziene offerte. _offerteNummer plakt een suffix V{n} achter het nummer (vrij of automatisch) zodra offerte_config.offerteVersie groter is dan 1; V1 blijft verborgen zodat een eerste offerte ongewijzigd oogt. In _accordNieu…</sub>

## v3.90.0 (2026-06-21)
**Nieuw:** Eigen offertenummer per offerte (bijvoorbeeld het Yoobi-nummer).

<sub>Oud: Eigen offertenummer per offerte. Nieuw veld Offertenummer in het offerte-blok (onder Geldig tot) dat offerte_config.offerteNummerVrij vult via _offCfgVeld; geen migratie. Is het veld gevuld, dan heeft het voorrang: _offerteNummer geeft de getrimde vr…</sub>

## v3.89.6 (2026-06-20)
**Nieuw:** Fix: de downloadknop op de ondertekenpagina werd half afgedekt.

<sub>Oud: Vervolg op v3.89.4: de sticky knoppenbalk #acActies dekte de groene knop #acPdfDl ("Offerte openen of downloaden (PDF)") half af, want die stond in de stroom net boven de balk. In _accordRender is het acPdfDl-blok verplaatst van ná het PDF-object naa…</sub>

## v3.89.5 (2026-06-20)
**Nieuw:** Fix: de archiveer-reeks stokte op de offerte.

<sub>Oud: Archiveer-reeks stokte op de offerte. De reeks in _archiveerVolgende wacht per document op het afterprint-event van window.print(), maar printOfferteDocument is sinds v3.77.0 een pdfmake-PDF die via .open() in een tabblad komt en nooit afterprint afv…</sub>

## v3.89.4 (2026-06-20)
**Nieuw:** Akkoord-knoppen op de ondertekenpagina blijven altijd in beeld op de iPad.

<sub>Oud: Akkoord-knoppen op de publieke ondertekenpagina nu altijd in beeld. De knoppenkaart #acActies stond in de normale stroom na een PDF-object van 80vh dat op iOS de veegbeweging opving, waardoor klanten de knoppen Akkoord/Afwijzen/Vraag niet zagen of be…</sub>

## v3.89.3 (2026-06-20)
**Nieuw:** Meetstaat beter leesbaar op de iPad; duidelijker teken-knop.

<sub>Oud: Vervolg op de iPad-leesbaarheid. De meetstaat-kaartlabels (td[data-label]::before) gingen van 0,6rem naar 0,72rem met font-weight 600, en de invoer/select-tekst in de meetstaat van 0,95rem naar 1,02rem met expliciete ink-kleur. De teken-knop bij een …</sub>

## v3.89.2 (2026-06-20)
**Nieuw:** Invoervelden en knoppen steken beter af in zonlicht op de iPad.

<sub>Oud: iPad-leesbaarheid en cijferblok. Nieuwe variabele --field-border (#9ca3af) vervangt het bijna-witte --paper-deep op de rand van input/select/textarea en op .btn-secondary en .btn-icon, zodat invoervelden en knoppen in zonlicht zichtbaar afsteken; de …</sub>

## v3.89.1 (2026-06-20)
**Nieuw:** Compactere meetstaat-PDF.

<sub>Oud: Compactere meetstaat-PDF. printMeetstaat is strakker gezet: celpadding van 0,35rem terug naar 0,12rem 0,3rem, line-height 1,2 op beide tabellen en een vaste kolomindeling (table-layout:fixed met colgroup in procenten) zodat de lange calc-regelnaam bi…</sub>

## v3.89.0 (2026-06-19)
**Nieuw:** De Standaard-vinkjes per offertetekst bepalen nu de voorkeuze per klanttype.

<sub>Oud: De vinkjes per offertetekst sturen nu de standaardkeuze. _offStandaardVariantId is herschreven van naam-matching naar de vlaggen: het kiest per klanttype het veld std_consument, std_vve of std_zakelijk en pakt de bovenste aangevinkte variant op volgo…</sub>

## v3.88.0 (2026-06-19)
**Nieuw:** Derde klanttype VvE in het offerte-blok.

<sub>Oud: Derde klanttype VVE in het offerte-blok. De keuzelijst klanttype heeft nu drie opties: Particulier (waarde consument, label hernoemd), VVE (nieuwe waarde vve) en Zakelijk. De normalisatie in _offCfg laat vve toe als geldige waarde. Alle algemene-voor…</sub>

## v3.87.0 (2026-06-19)
**Nieuw:** Per offertetekst vinkjes Standaard voor particulier, VvE en zakelijk.

<sub>Oud: Eerste stap voor standaardteksten per offertetype. Op offerte_teksten zijn drie booleans toegevoegd (std_consument, std_vve, std_zakelijk) via losse SQL met slimme voorvulling op de bestaande naam-logica. In _mapOffTekstFromDB en _mapOffTekstToDB wor…</sub>

## v3.86.0 (2026-06-17)
**Nieuw:** Meerdere tekstblokken mogelijk onder Opmerkingen onder de prijs.

<sub>Oud: De sectie Opmerkingen onder de prijs (prijsopmerkingen) is nu stapelbaar gezet in OFFERTE_SECTIES, net als Werkzaamheden. Daardoor verschijnt in het offerte-blok de knop + Blok (gated op sec.stapelbaar) en kun je via _offCfgBlokAdd meerdere tekstblok…</sub>

## v3.85.0 (2026-06-17)
**Nieuw:** Nieuw invulveld {adres} voor de offerteteksten.

<sub>Oud: Nieuw invulveld {adres} voor de offerteteksten: het adres zonder postcode, in de vorm straat huisnummer, woonplaats (bijvoorbeeld Oude Baan 43A, Wittem). Toegevoegd aan de OFFERTE_VELDEN-hulplijst op de Offerteteksten-tab en aan de map in _offVulVeld…</sub>

## v3.84.2 (2026-06-17)
**Nieuw:** Fix: een uitgezette regel verscheen toch in de offerte.

<sub>Oud: Fix: een met de actief-schakelaar uitgezette regel, onderdeel of hoofdgroep verscheen toch in de offerte. Het projecttotaal (via calcProjectTotalen) filterde inactieve items al wel, maar de regel-voor-regel opbouw in _berekenOfferteCijfers en printOf…</sub>

## v3.84.1 (2026-06-17)
**Nieuw:** Fix: richtwaarden toonden bij een lege calculatie nog cijfers van de vorige.

<sub>Oud: Fix: bij een lege calculatie (nul arbeidsuren en geen staartposten) toonden de richtwaarde-blokken kleine objecten en klimtijd nog het arbeidstotaal van de daarvoor geopende calculatie. Oorzaak: renderTotals neemt bij een lege calc een vroege return …</sub>

## v3.84.0 (2026-06-17)
**Nieuw:** Getalvelden selecteren hun hele waarde bij aanklikken, zoals in een spreadsheet.

<sub>Oud: Getalvelden selecteren hun hele waarde zodra je ze aanklikt of aantikt, zodat een nieuw getal de oude waarde meteen overschrijft (spreadsheet-gevoel). Eén gedelegeerde focusin-luisteraar op document pakt alle huidige en later gerenderde input[type="n…</sub>

## v3.83.0 (2026-06-14)
**Nieuw:** De offertesectie Bevindingen volgt standaard de notitie bovenin de calculatie.

<sub>Oud: De offertesectie Bevindingen volgt standaard de notitie boven in de calculatie (c.notities). Nieuw invulveld {bevindingen} in _offVulVelden dat (c.notities||"").trim() ophaalt, ook opgenomen in de OFFERTE_VELDEN-hulplijst op de Offerteteksten-tab. In…</sub>

## v3.82.0 (2026-06-14)
**Nieuw:** De klant kan na akkoord zelf de getekende offerte downloaden.

<sub>Oud: De klant kan na akkoord zelf de getekende offerte downloaden, met dezelfde bevestigingspagina als het archiefexemplaar van v3.81.0. De pagina-opbouw is uit _accordDownloadGetekend gehaald naar een herbruikbare kern _bouwGetekendePdfBytes(frozenBytes,…</sub>

## v3.81.0 (2026-06-14)
**Nieuw:** Getekend archiefexemplaar van een geaccordeerde offerte, met bevestigingspagina.

<sub>Oud: Getekend archiefexemplaar van een geaccordeerde offerte. In het linkbeheer (_accordBeheerRender) verschijnt bij status akkoord en een aanwezige bevroren PDF (pdf_path of snapshot.pdf) de knop "Getekend exemplaar (PDF)". Nieuwe functie _accordDownload…</sub>

## v3.80.0 (2026-06-14)
**Nieuw:** Zwaardere, beter leesbare handtekening op de offerte.

<sub>Oud: De ingebakken handtekening (constante HANDTEKENING_ERNES, gebruikt in het HTML-offertedocument en in de pdfmake-PDF via _bouwOfferteDocDef) was te dun en lichtblauw, waardoor hij op papier wegviel. Vervangen door een zwaardere, iets donkerblauwere ve…</sub>

## v3.79.0 (2026-06-14)
**Nieuw:** De accordeerlink toont de echte offerte-PDF in plaats van een nagebouwde pagina.

<sub>Oud: De accordeerlink (ondertekenpagina) toont voortaan de echte offerte-PDF in plaats van een nagebootst HTML-document. Bij het aanmaken van een link bouwt _accordNieuweLink met _bouwOfferteCompleetDocDef dezelfde PDF als de knop "Offerte + bijlagen", ha…</sub>

## v3.78.0 (2026-06-14)
**Nieuw:** Offerte + bijlagen wordt één doorlopende PDF: offerte, kozijnen, foto's en voorwaarden.

<sub>Oud: Fase 2 van de overstap naar pdfmake: de knop "Offerte + bijlagen" maakt nu één doorlopende PDF in plaats van een browser-print. Nieuwe async builder _bouwOfferteCompleetDocDef neemt de content van _bouwOfferteDocDef (de offerte) en voegt achtereenvol…</sub>

## v3.77.2 (2026-06-14)
**Nieuw:** Prijsopgave in de PDF-offerte opgeruimd en rechts uitgelijnd.

<sub>Oud: Prijsopgave in het pdfmake-offertedocument opgeruimd. (1) In de regel-weergave zónder hoeveelheden vervalt de herhaalde kop "Omschrijving | Totaal" per gevel; de bovenste regel "Naam | Totaal excl. BTW" labelt de kolommen al, wat ruimte spaart. (2) B…</sub>

## v3.77.1 (2026-06-14)
**Nieuw:** Geen losse kop meer onderaan een pagina in de PDF-offerte.

<sub>Oud: Wezen-koppen in het pdfmake-offertedocument voorkomen. De kostenkop ("Wat zijn de kosten?") schuift mee naar de volgende pagina als hij in de onderste 38% van de pagina zou beginnen, zodat de kop, de kolomregel en de eerste prijsrijen samen blijven (…</sub>

## v3.77.0 (2026-06-14)
**Nieuw:** Het offertedocument wordt een echte PDF (pdfmake) in plaats van een browser-print.

<sub>Oud: Fase 1 van de overstap naar pdfmake: het losse offertedocument (knop "Offerte document") wordt nu als echte PDF gegenereerd via pdfmake (geladen van de jsdelivr-CDN, versie 0.2.20). Nieuwe builder _bouwOfferteDocDef spiegelt de inhoud en logica van _…</sub>

## v3.76.0 (2026-06-14)
**Nieuw:** Ernes-logo boven en garantie-logo onder lopen mee op elke offertepagina.

<sub>Oud: Lopende kop- en voetregel via een thead/tfoot-tabel rond de offerte-inhoud in _bouwOfferteDocHtml (table.off-running: thead = Ernes-logo 18pt, tfoot = garantie-logo 28pt, tbody = inhoud). Vervangt de position:fixed-aanpak van v3.74.0/v3.75.0. De logo…</sub>

## v3.75.0 (2026-06-14)
**Nieuw:** Klein Ernes-logo als kopregel op elke pagina; compactere prijstabel.

<sub>Oud: Klein Ernes-logo als vaste kopregel op de losse offerte-print (LOGO_ERNES, .off-header-vast position:fixed, links boven op 8mm, 18pt hoog), naast het garantie-logo onderaan. @page-bovenmarge naar 20mm voor de kopregel. Compactere prijstabel: .off-doc…</sub>

## v3.74.0 (2026-06-14)
**Nieuw:** Vakwerk Plusgarantie-logo als vaste voet op elke offertepagina.

<sub>Oud: Vaste voettekst met Vakwerk Plusgarantie-logo op de losse offerte-print, links onderaan op elke pagina (position:fixed), uitgelijnd op de contentrand (15mm, gelijk aan het Ernes-logo bovenaan). Logo OHNL_VakwerkPLUS ingebed als LOGO_VAKWERK (zwarte a…</sub>

## v3.73.1 (2026-06-14)
**Nieuw:** Prijstabel-groottes gelijkgetrokken naar 10pt.

<sub>Oud: Offertedocument: prijstabel-groottes gelijkgetrokken naar 10pt (regelkop .off-doc .hg-row td 10.5pt naar 10pt; eindtotaal .grand-row en .kosten-eind .te-incl td 11pt naar 10pt). Lettertype was al gelijk (alleen tabular-nums op cijfers). Vet op koppen…</sub>

## v3.73.0 (2026-06-14)
**Nieuw:** Bedrijfsgegevens en logo-grootte instelbaar onder Instellingen.

<sub>Oud: Bedrijfsgegevens en logo-grootte instelbaar onder Instellingen, opgeslagen in app_settings (geen SQL). Nieuw blok met naam, adres, postcode/plaats, telefoon, e-mail, internet, IBAN, BIC, KvK en BTW (data.settings.bedrijf, setter updBedrijf) plus logo…</sub>

## v3.72.2 (2026-06-14)
**Nieuw:** Offertedocument rustiger: koppen vet maar niet groter, tekst links uitgelijnd.

<sub>Oud: Offertedocument rustiger. Koppen (.off-doc h2/h3/h4) nu op 10pt (gelijk aan de lopende tekst) en font-weight 700, dus vet maar niet groter dan de tekst. Lopende tekst (.off-tekst) van text-align justify naar left, zodat woorden niet meer worden uitge…</sub>

## v3.72.0 (2026-06-14)
**Nieuw:** Prijsweergave Regels met schakelaar om hoeveelheden en eenheidsprijzen te tonen of te verbergen.

<sub>Oud: Prijsweergave Regels met schakelaar voor hoeveelheden. Nieuw veld offerte_config.prijsRegelsHoeveelheden (standaard aan, geen SQL) plus checkbox "Hoeveelheden en eenheidsprijzen tonen" die alleen verschijnt bij prijsWeergave=regels (prijsweergave-sel…</sub>

## v3.71.0 (2026-06-14)
**Nieuw:** Contactpersoon op de offerte (t.a.v.-regel en aanhef).

<sub>Oud: Contactpersoon op de offerte. Nieuw blok Contactpersoon in het Offerte-blok met voorletters, tussenvoegsel en achternaam (opslag in offerte_config.contactpersoon, geen SQL). Is de achternaam gevuld, dan toont de kop van het offertedocument onder de n…</sub>

## v3.70.0 (2026-06-14)
**Nieuw:** Nieuwe offerte kiest automatisch de tekstvariant bij het klanttype; opsommingstekens in de teksten.

<sub>Oud: Offerteteksten en opsommingstekens. (1) Nieuwe offerte kiest per sectie automatisch de variant die bij het klanttype past: _offStandaardVariantId matcht de naam op consument/zakelijk, anders een neutrale, anders de bovenste. Toegepast bij het aanmake…</sub>

## v3.69.1 (2026-06-14)
**Nieuw:** Archiveren start zonder voorselectie.

<sub>Oud: Archiveren start zonder voorselectie: de checkboxes in het Archiveren-venster staan standaard uit (openArchiveerModal zette beschikbare opties op checked, nu op leeg), zodat je zelf de 1 of 2 PDFs kiest die je nodig hebt. Niet-beschikbare opties blij…</sub>

## v3.69.0 (2026-06-14)
**Nieuw:** Cijferblok selecteert de hele waarde op de iPad; kozijnnaam vult de omschrijving.

<sub>Oud: Twee verbeteringen voor het meten. (1) Cijferblok op aanraakschermen (iPad): bij het aantikken van een np-field wordt de hele waarde geselecteerd (setSelectionRange in NumPad.open, met korte timeout voor iOS), zodat zichtbaar is dat de eerste cijfer …</sub>

## v3.68.1 (2026-06-14)
**Nieuw:** Fix: vulling-regels per kozijn werden niet ververst bij het openen van de Meetstaat-tab.

<sub>Oud: Fix: de vulling-regels per kozijntekening (v3.67.0) werden alleen door _syncVullingMeetstaat opnieuw opgebouwd bij een meetstaat-bewerking, een Klaar in de tekenaar of een kopie, niet bij het openen van de Meetstaat-tab of bij het laden. Een bestaand…</sub>

## v3.68.0 (2026-06-14)
**Nieuw:** Kozijnen-PDF toont de locatie (gevel) per kozijn.

<sub>Oud: Kozijnen-PDF toont de locatie per kozijn: onder de naam staat Hoofdgroep · Onderdeel (bv. "Buiten houtwerk · Voorgevel"), opgehaald uit de calc-regel waaraan de tekening-regel gekoppeld is. Zo is na de opname herkenbaar welk kozijn welke gevel is, oo…</sub>

## v3.67.0 (2026-06-13)
**Nieuw:** Vulling-m² per kozijntekening als eigen regel in de meetstaat, direct onder de brontekening.

<sub>Oud: Vulling-m² niet meer samengerold: per kozijntekening per calc-regel één auto-regel in de meetstaat, direct onder zijn brontekening (net als de m¹ die al per tekening op de regel staat). Naam naar de bron, bv. "Voorgevel · Geveldeur (auto)". Calc-tota…</sub>

## v3.66.0 (2026-06-13)
**Nieuw:** Adresblok op de offerte met straat en woonplaats, met PDOK-zoekknop.

<sub>Oud: Adresblok op de offerte: off-klant toont naam + straat/huisnummer + postcode/woonplaats i.p.v. klant + projectnaam. Sectie Adres op de offerte in het Offerte-blok met knop Zoek straat en woonplaats (PDOK via _pdokAdres). Opslag in offerte_config.adre…</sub>

## v3.65.0 (2026-06-13)
**Nieuw:** Akkoord-stempel op de offerte na digitale accordering.

<sub>Oud: Akkoord-stempel op de offerte: _accordStempel zet na akkoord “Digitaal geaccordeerd door [naam] op [datum]” in het laatste .off-sign-table td.sign-box (klant-ondertekenvak) binnen het iframe. Wordt gezet direct na een akkoord en ook bij het heropenen…</sub>

## v3.64.0 (2026-06-13)
**Nieuw:** De accordeerpagina toont het volledige document: offerte, kozijnen, foto's en voorwaarden.

<sub>Oud: Accord-pagina toont nu het volledige document (offerte + getekende kozijnen + foto-bijlage + AV), net als printOfferteCompleet en met dezelfde offerte_config-schakelaars. _accordNieuweLink bouwt het complete HTML als snapshot; de iframe wrapt het in …</sub>

## v3.63.1 (2026-06-13)
**Nieuw:** Accordeerpagina: voorwaarden meegenomen en akkoord-vinkje hersteld.

<sub>Oud: Accord-pagina: algemene voorwaarden meegenomen in het snapshot (paginabeelden, variant op klanttype, absolute URLs zodat ze in het iframe laden) en het iframe herberekent zijn hoogte na het laden van die beelden. Akkoord-vinkje-fix: de globale input-…</sub>

## v3.63.0 (2026-06-13)
**Nieuw:** Aanspreekvorm per offerte ({aanhef}) en melding op het dashboard bij een klantreactie.

<sub>Oud: Aanspreekvorm + reactie-melding. (1) Nieuw keuzeveld Aanspreekvorm per offerte in het Offerte-blok (heer/mevrouw/echtpaar/familie/zakelijk), opgeslagen in offerte_config (geen SQL). Nieuw invulveld {aanhef} via _offAanhef(c,cfg) in _offVulVelden, wer…</sub>

## v3.62.0 (2026-06-13)
**Nieuw:** Accorderen via een unieke link per offerte: de klant geeft akkoord, wijst af of stelt een vraag.

<sub>Oud: Accorderen via unieke link per offerte (vervangt Yoobi-ondertekenen). Knop Accordeerlink in het Offerte-blok legt een snapshot van de offerte vast en geeft een publieke link (?accord=TOKEN). De klant opent die zonder login, ziet de bevroren offerte r…</sub>

## v3.61.1 (2026-06-13)
**Nieuw:** Voorwaarden in de doorlopende PDF vullen de volle breedte.

<sub>Oud: Voorwaarden in de doorlopende PDF vullen nu de volle breedte. De print-marge (1.5cm) kwam boven op de eigen marge van het AV-document (dubbele marge, daardoor klein); voor de dpv-vw-pagina wordt die print-marge nu opgeheven met negatieve marges en is…</sub>

## v3.61.0 (2026-06-13)
**Nieuw:** Knop Offerte + bijlagen: offerte, kozijnen, foto's en voorwaarden in één print.

<sub>Oud: Doorlopende offerte-PDF (brok A4b): nieuwe knop Offerte + bijlagen in het Offerte-blok maakt in één print het offertedocument, de getekende kozijnen, de foto-bijlage en als laatste de algemene voorwaarden. Twee schakelaars per offerte (kozijnen, foto…</sub>

## v3.60.3 (2026-06-13)
**Nieuw:** Kostenoverzicht op de offerte in Yoobi-stijl per gevel.

<sub>Oud: Kostenoverzicht offertedocument nagebouwd naar Yoobi-stijl: per gevel elke onderdeel-regel als \'Gevel | Onderdeel\' met bedrag, daaronder vetgedrukt gevel-subtotaal met volledige gevelnaam (incl. straatzijde/voordeurzijde) en lijn erboven; projectna…</sub>

## v3.60.2 (2026-06-13)
**Nieuw:** Offertedocument lijnloos en betere pagina-doorloop.

<sub>Oud: Offertedocument verder afgewerkt: alle strepen onder de koppen (h2/h3/h4) verwijderd binnen .off-doc, document nu lijnloos op de subtiele lijn boven het eindtotaal na. Pagina-doorloop verbeterd: secties mogen over paginagrenzen breken (page-break-ins…</sub>

## v3.60.1 (2026-06-13)
**Nieuw:** Fix: logo en handtekening ingebakken zodat ze altijd verschijnen.

<sub>Oud: Fix en opmaak voor het offertedocument: logo verscheen niet omdat erneslogo.png niet in de repo stond. Logo en handtekening zijn nu ingebakken als centrale globale constanten (LOGO_ERNES, HANDTEKENING_ERNES), bereikbaar voor alle print-functies; de l…</sub>

## v3.60.0 (2026-06-13)
**Nieuw:** Eigen offertenummering JJ-NNN met jaarlijkse teller onder Instellingen.

<sub>Oud: Eigen offertenummering in de vorm JJ-NNN (bv. 26-009). Per jaar oplopende teller met jaarlijkse reset, opgeslagen in app_settings (geen migratie). Nieuwe sectie Offertenummering onder Instellingen met instelbaar startnummer (ondergrens voor het jaar,…</sub>

## v3.59.2 (2026-06-13)
**Nieuw:** Fix: het offertedocument deed niets door een ontbrekend logo.

<sub>Oud: Fix: het offertedocument deed niets (knop en Archiveren) door een ReferenceError: LOGO_ERNES is not defined. Die constante is lokaal aan _ohpBuildOfferteHTML en niet bereikbaar vanuit printOfferteDocument. Het briefhoofd laadt het logo nu via src=ern…</sub>

## v3.59.1 (2026-06-12)
**Nieuw:** Fix: het offertedocument bleef hangen in het Archiveren-venster.

<sub>Oud: Fix: het offertedocument bleef hangen in het Archiveren-venster (document aangekondigd, daarna niets). De extra wachtstap op het laden van logo en handtekening botste met de afterprint-afhandeling van Archiveren en is verwijderd; printOfferteDocument…</sub>

## v3.59.0 (2026-06-12)
**Nieuw:** Het offertedocument: compleet vormgegeven offerte met briefhoofd, teksten, prijs en handtekening.

<sub>Oud: Het offertedocument (brok A4a): nieuwe functie printOfferteDocument maakt een compleet vormgegeven Ernes-offertedocument met briefhoofd (logo + bedrijfsgegevens), klant, automatisch offertenummer (JJ-NNNN-V), alle gekozen teksten uit het offerte-blok…</sub>

## v3.58.0 (2026-06-12)
**Nieuw:** Offerte-blok in de calculatie: klanttype, datums, garantie en per sectie de tekstkeuze.

<sub>Oud: Offerte-blok in de calculatie (brok A3): uitklapbaar blok onderaan de Calculatie-tab met klanttype, offertedatum, geldig-tot (auto +30 dagen, aanpasbaar) en garantiejaren, plus per tekstsectie aan/uit, variantkeuze uit de bibliotheek en per-offerte a…</sub>

## v3.57.0 (2026-06-12)
**Nieuw:** Nieuwe tab Offerteteksten: bibliotheek met varianten per sectie en invulvelden.

<sub>Oud: Nieuwe tab Offerteteksten: de tekstenbibliotheek van de offertemodule (brok A2). Alle vaste offerteteksten per sectie bij elkaar in documentvolgorde, met meerdere varianten per sectie (bv. garantie consument/zakelijk), pijltjes voor de volgorde, dire…</sub>

## v3.56.2 (2026-06-12)
**Nieuw:** Fix: dashboardbedrag rekent eerst de meetstaat per regel, net als de calculatie.

<sub>Oud: Fix: de archief-berekening (dashboard, cache, bevriezen bij gereedmelden) doet nu eerst zelf de meetstaat-som per regel, net als de calculatie-kaart. Voorheen rekende die route met verouderde regel-hoeveelheden uit de database, waardoor een net via k…</sub>

## v3.56.1 (2026-06-12)
**Nieuw:** Fix: het dashboardbedrag per calculatie is gelijk aan de calculatie zelf.

<sub>Oud: Fix: het dashboard-bedrag per calculatie wijkt niet meer af van de calculatie zelf. De archief-rekenroute is regel voor regel gelijkgetrokken met de kaart: toeslag-uren met telt-in-werkdagen tellen mee in de werkdagen (geen onterechte afrondingstoesl…</sub>

## v3.56.0 (2026-06-10)
**Nieuw:** Navigatiebalk blijft bovenin staan bij het scrollen.

<sub>Oud: Navigatiebalk blijft bovenin staan bij het scrollen (position: sticky, z-index 50, onder vensters/numpad/meldingen). De koptekst met het logo scrolt gewoon weg; alleen de tabbalk plakt. Scroll-padding zorgt dat scrolldoelen niet onder de balk verdwij…</sub>

## v3.55.0 (2026-06-10)
**Nieuw:** Kozijnen-PDF met volledige onderbouwing van de m¹ en m² per kozijn.

<sub>Oud: Kozijnen-PDF met volledige onderbouwing: onder elk kozijn de uitsplitsing van de m¹ (frame + tussenwerk + ramen + roeden), per deur of paneel een eigen regel met naam en m², en de vermelding "loze onderdorpel" waar die aan staat. De uitsplitsing word…</sub>

## v3.54.0 (2026-06-10)
**Nieuw:** Kozijn-tekenaar: roeden per vak, tellen mee in de m¹.

<sub>Oud: Kozijn-tekenaar: roeden per vak. Tik een vak aan en stel in hoeveel ruitjes het raam breed en hoog is (max 8×8); de roeden komen als dunne lijntjes in de tekening en hun m¹ telt mee in het totaal, met "roeden" als aparte post in de voet. Lengtes klop…</sub>

## v3.53.0 (2026-06-10)
**Nieuw:** Loze onderdorpel in de kozijn-tekenaar voor deurkozijnen.

<sub>Oud: Loze onderdorpel in de kozijn-tekenaar. Een deurkozijn heeft vaak geen houten onderdorpel, de deur staat op de vloer. Tik in de tekenaar op de onderrand van het frame en hij wisselt tussen kozijnhout en loos, net als de loze stijl bij een verticale d…</sub>

## v3.52.0 (2026-06-10)
**Nieuw:** Getekend kozijn kopiëren naar de gevel waar je mee bezig bent.

<sub>Oud: Getekend kozijn kopiëren naar de gevel waar je mee bezig bent. Op elke tegel in "Getekende kozijnen" staat rechtsboven een blauw ⧉-knopje. Ben je gegevens van een nieuwe gevel aan het invoeren, tik dan dat knopje op het kozijnmodel dat je daar ook he…</sub>

## v3.51.1 (2026-06-10)
**Nieuw:** Project-totaal per regel-type toont nu alle types, ook die maar één keer voorkomen.

<sub>Oud: Project-totaal per regel-type toont nu alle regel-types. Onderaan de meetstaat, bij het project-totaal voor materiaal-bestelling en voortgang, vielen regel-types weg die maar in één gevel of kamer voorkwamen (een hekje, een losse deur). Die staan er …</sub>

## v3.51.0 (2026-06-10)
**Nieuw:** Aantal in de kozijn-tekenaar; vulling-m² schaalt mee met het aantal.

<sub>Oud: Aantal in de kozijn-tekenaar plus een fix op de vulling. Onderaan in de tekenaar, bij de totalen, staat nu een veld Aantal: geef je daar bijvoorbeeld 5 op, dan telt dit kozijn vijf keer mee. De totalen onder de tekening tonen direct het per-stuk-bedr…</sub>

## v3.50.2 (2026-06-09)
**Nieuw:** Materiaalbedrag per bewerkingsregel zichtbaar.

<sub>Oud: Materiaal-bedrag per bewerkingsregel zichtbaar: in het grijze regeltje onder elke bewerking in een calc-regel staat nu naast de totale uren ook het totale materiaal-bedrag voor die stap (in blauw). Beide zijn met het percentage en de hoeveelheid verr…</sub>

## v3.50.1 (2026-06-08)
**Nieuw:** Meetstaat-tabel smaller op een breed scherm.

<sub>Oud: Meetstaat-tabel smaller op een breed scherm: de kolommen b, h, aantal en factor rekten onnodig uit. De tabel heeft nu een vaste kolom-layout met krappe getalkolommen, waarbij de calc-regel, omschrijving en opmerking de ruimte opvangen. De kaartweerga…</sub>

## v3.50.0 (2026-06-08)
**Nieuw:** Calc-regel dupliceren met knop ⎘, inclusief het hele verfsysteem (zonder meetstaat).

<sub>Oud: Calc-regel dupliceren: op elke regel in de calculatie staat nu naast het verwijderkruisje een knop ⎘. Die maakt een volledige kopie van de regel met het hele verfsysteem eronder (alle bewerkingen met hun percentages, dezelfde ondergrond, eenheid, toe…</sub>

## v3.49.1 (2026-06-08)
**Nieuw:** Verwijderknop bij brede kozijnen weer in beeld.

<sub>Oud: Verwijderknop bij kozijnen weer in beeld: het rode kruisje om een meetregel te verwijderen verdween bij een breed kozijn uit beeld omdat de miniatuur het wegduwde. Het kruisje staat nu links op een vaste plek, vóór het potlood of de miniatuur, zodat …</sub>

## v3.49.0 (2026-06-08)
**Nieuw:** ±-knop op het cijferblok om een kozijn af te trekken van een gevel.

<sub>Oud: Min-knop op het cijferblok: bij aantal en factor in de meetstaat staat nu een ±-knop. Tik na het getal om de waarde negatief te maken (nog een tik maakt hem weer positief). Zo trek je een kozijn af van een gevel of wand: aparte regel voor het kozijn,…</sub>

## v3.48.0 (2026-06-08)
**Nieuw:** Verfsystemen dupliceren met één knop.

<sub>Oud: Verfsystemen dupliceren: op elke verfsysteem-kaart staat nu naast Bewerken en Verwijderen een knop Dupliceren. Die maakt een volledige kopie (alle stappen en percentages, dezelfde ondergrond, eenheid en notities, naam met (kopie) erachter) en opent d…</sub>

## v3.47.1 (2026-06-08)
**Nieuw:** Cijferblok loopt door naar een nieuwe meetregel.

<sub>Oud: Cijferblok loopt nu door naar een nieuwe meetregel: Volgende op de factor van de laatste regel maakt automatisch een nieuwe regel aan en springt erin (in de breedte), zodat je regel na regel kunt wegtikken zonder op "+ Regel". Gebeurt alleen als de l…</sub>

## v3.47.0 (2026-06-07)
**Nieuw:** Eigen cijferblok voor de meetstaat op de iPad, met Volgende-toets.

<sub>Oud: Eigen cijferblok voor de meetstaat- en kozijn-maatvelden. Het iPad-toetsenbord blijft uit; een vaste balk onderaan toont grote knoppen 0 tot 9 met een wis-toets. De Volgende-toets (enter) staat rechtsonder en springt naar het volgende veld; de wis-to…</sub>

## v3.46.3 (2026-06-07)
**Nieuw:** Foto-bijlage: lege beginpagina nu echt opgelost.

<sub>Oud: Foto-bijlage: lege beginpagina nu echt opgelost. De fix van v3.46.1 hield niet; het fotoblok had nog een opmaak met een harde "niet breken" die het hele blok naast de kop naar pagina twee duwde. Het fotoblok gebruikt nu dezelfde tabel-opmaak als de m…</sub>

## v3.46.2 (2026-06-07)
**Nieuw:** Genummerde gebrek-stippen op de foto's met bijbehorende lijst.

<sub>Oud: Foto-bijlage: de gebrek-stippen op de foto\'s zijn nu genummerd, met onder elke foto een genummerde lijst (gebrek + notitie) waarvan de nummers overeenkomen met de stippen. De algemene foto-opmerking staat apart, los van de gebreken, zodat geen tekst…</sub>

## v3.46.1 (2026-06-07)
**Nieuw:** Fix foto-bijlage: geen lege eerste pagina meer.

<sub>Oud: Fix foto-bijlage: geen lege eerste pagina meer. Het fotoblok had een harde "niet breken" waardoor het in z\'n geheel naast de kop niet paste en naar pagina twee sprong. De foto\'s lopen nu door onder de kop en vullen de pagina netjes (twee naast elka…</sub>

## v3.46.0 (2026-06-07)
**Nieuw:** Loze stijl bij een verticale deellijn (dubbele deuren en ramen).

<sub>Oud: Kozijn-tekenaar: een verticale deellijn kan nu een loze stijl zijn in plaats van een tussenstijl, voor twee vleugels die zonder middenstijl op elkaar aansluiten (dubbele deuren/ramen). Een loze stijl telt niet mee in het tussenwerk; beide ramen houde…</sub>

## v3.45.1 (2026-06-06)
**Nieuw:** Fix: elke gebrek-stip op een foto is weer te selecteren en verwijderen.

<sub>Oud: Foutje hersteld: op een foto kon je alleen de laatst geplaatste gebrek-stip verwijderen. Door het vasthouden van de aanraking (voor zoomen/slepen) wees een tik naar het tekenvlak in plaats van naar de stip. De app bepaalt nu op positie welke stip je …</sub>

## v3.45.0 (2026-06-06)
**Nieuw:** Gebrek-stippen ook op foto's, met knijp-zoom en notitie per stip.

<sub>Oud: Foto-gebreken Brok 7c: de gekleurde gebrek-stippen (zelfde legenda als de kozijn-tekenaar) kun je nu ook op foto\u2019s plaatsen, met knijp-zoom en pan voor nauwkeurig aanwijzen. Posities als fractie van de foto, dus correct op elk scherm en op de pr…</sub>

## v3.44.0 (2026-06-06)
**Nieuw:** Rond raam als nieuwe vorm in de kozijn-tekenaar.

<sub>Oud: Kozijn-tekenaar Brok 7b: rond raam (rondvenster) als nieuwe vorm. Eén maat (diameter), frame is een echte cirkel met omtrek π × diameter. Drie indelingen: heel, kruis (twee roeden door het midden) en spaken (instelbaar aantal radiale roeden). Roeden …</sub>

## v3.43.0 (2026-06-06)
**Nieuw:** Verdelen in ramen en panelen werkt bij alle kozijnvormen, ook schuin en boog.

<sub>Oud: Kozijn-tekenaar Brok 7: verdelen in ramen, panelen en vulling werkt nu bij alle vormen — schuin enkel, schuin punt en boog, niet meer alleen rechthoek. Elke vorm wordt als convexe veelhoek behandeld; een v/h-deellijn knipt de werkelijke vorm via half…</sub>

## v3.42.0 (2026-06-06)
**Nieuw:** De vulling-m² uit de tekenaar loopt automatisch mee in de calculatie.

<sub>Oud: Kozijn-tekenaar Brok 6B: de vulling-m² loopt automatisch in de calculatie. Per gekoppelde m²-regel houdt de app één meetstaat-regel bij die alle vulling-vakken van die soort over alle kozijnen optelt. Automatische regels staan op slot en gemarkeerd; …</sub>

## v3.41.0 (2026-06-06)
**Nieuw:** Een vulling-vak koppel je per stuk aan een m²-regel uit de calculatie.

<sub>Oud: Kozijn-tekenaar 6a (vervolg): een vulling-vak koppel je per stuk aan een m²-regel uit de calculatie (deur, paneel, luik — zoveel soorten als je regels hebt). De regelnaam staat als label in het vak, voor leesbaarheid bij uitvoering en voor de klant. …</sub>

## v3.40.0 (2026-06-06)
**Nieuw:** Deuren en puivulling in de kozijn-tekenaar tellen in m².

<sub>Oud: Kozijn-tekenaar Brok 6a: deuren en puivulling. Nieuw vak-type "vulling" — een dicht vlak (deur of paneel) dat in m² telt (één kant, buitenwerk) i.p.v. in m¹. De tekenaar toont nu twee totalen: m¹ voor kozijn + ramen, m² voor deuren + panelen. Koppeli…</sub>

## v3.38.0 (2026-06-06)
**Nieuw:** Gebreken markeren in de kozijn-tekenaar met gekleurde stippen en notitie.

<sub>Oud: Kozijn-tekenaar Brok 4: gebreken markeren. Balk met houtrot, scheur/naad, kit vervangen en loszittende verf — kies er een en tik het als gekleurde stip op de tekening, met optioneel een korte notitie. Verandert de m¹ niet (documentatie); werkt bij el…</sub>

## v3.35.0 (2026-06-06)
**Nieuw:** Per vak een type in de kozijn-tekenaar: vast glas, vast raam, draai binnen of buiten.

<sub>Oud: Kozijn-tekenaar Brok 2c: per vak een type — vast glas, vast raam, draairaam naar binnen of naar buiten. Vast raam en draai-binnen tellen het raamhout 1× (omtrek), draai-buiten 2× (raamhout + sponningkanten). Open-symbool in stippellijn (binnen) of do…</sub>

## v3.34.0 (2026-06-06)
**Nieuw:** Rechthoekige kozijnen verdelen in ramen en panelen; tussenstijlen tellen mee in de m¹.

<sub>Oud: Kozijn-tekenaar Brok 2b: rechthoekige kozijnen verdelen in ramen/panelen door op een vak te tikken en verticaal of horizontaal te delen. Deellijnen krijg je op exacte positie door de maat in cm te typen; de lengte van elke tussenstijl en -dorpel telt…</sub>

## v3.33.0 (2026-06-06)
**Nieuw:** Kozijn-tekenaar: kies een vorm, vul de maten in en de omtrek loopt live mee als m¹.

<sub>Oud: Kozijn-tekenaar Brok 2a: kies een vorm (rechthoek, schuin enkel, schuin punt, boog), vul de lasermaten in, het kozijn wordt op schaal getekend en de exacte omtrek loopt live mee als m¹ — schuine randen en bogen worden op hun werkelijke lengte gereken…</sub>

