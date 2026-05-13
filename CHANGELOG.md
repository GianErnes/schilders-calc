## v3.9.6 — Wachtwoord beheren in de app (wijzigen + vergeten-flow)
- **Aanleiding**: bij het reset-wachtwoord-experiment in v3.9.5 bleek dat de Supabase-resetlink in de mail de gebruiker direct ingelogd doorstuurt naar de app, zonder de kans een nieuw wachtwoord in te stellen. De recovery-flow was effectief stuk omdat de app geen UI had voor "stel nieuw wachtwoord in". Tegelijk was er sowieso geen in-app manier om een wachtwoord te wijzigen — moest via Supabase dashboard, wat omslachtig is en niet werkt voor medewerkers zonder dashboard-toegang.
- **Flow A — Wachtwoord wijzigen (ingelogd)**: nieuwe knop **🔑 Wachtwoord** rechtsboven naast Uitloggen. Opent modal met huidig + nieuw + bevestiging. Re-authenticeert met het huidige wachtwoord vóór `updateUser` wordt aangeroepen (voorkomt dat iemand bij een open laptop snel een ander wachtwoord instelt). Na succes: gebruiker blijft ingelogd, toast bevestigt de wijziging.
- **Flow B — Wachtwoord vergeten (uitgelogd)**: nieuwe link **Wachtwoord vergeten?** onder het inlog-formulier. Klap open → e-mail invullen → `resetPasswordForEmail`. Bewust generieke succes-melding ("Als dit e-mailadres bekend is...") om niet te lekken of een account bestaat.
- **Flow B — Recovery-landing**: bij klik op resetlink uit de mail detecteert de app het `PASSWORD_RECOVERY`-event van Supabase via `onAuthStateChange` en opent automatisch een aparte modal om een nieuw wachtwoord in te stellen (niet sluitbaar via X — wel via Annuleren, die uitlogt en terug naar login brengt). De URL-hash met access_token wordt na succes opgeschoond zodat een refresh niet opnieuw recovery triggert. `detectSessionInUrl` op de Supabase-client staat nu aan (was uit).
- **Wachtwoordregels (zelfde overal)**: minimaal 10 tekens, minstens 1 letter, minstens 1 cijfer. Identiek aan wat Supabase server-side afdwingt sinds v3.9.5. Centrale validatie via `_validatePasswordRule()` zodat regels op één plek wijzigen als ze later strenger of milder worden.
- **Tip in de UI**: hint-tekst onder het nieuw-wachtwoord-veld wijst op zinnetjes (`kwast-en-roller-99`) als sterker alternatief dan korte complexe wachtwoorden. Lengte > complexiteit, conform [NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html).
- **Bug-fix meegepakt**: de `auth-card` CSS styleerde alleen `input[type="email"]`, niet `[type="password"]`. Daardoor zag het wachtwoord-veld op het inlog-scherm er anders uit dan het e-mailveld. Nu beide types (+ `[type="text"]`) consistent gestyled.
- **Supabase dashboard-actie (door eigenaar)**: Site URL en Redirect URLs in `Authentication → URL Configuration` moeten op `https://gianernes.github.io/schilders-calc/` staan, anders verwijst de resetmail naar het verkeerde domein. Verifiëren bij eerste reset-test.
- **Bewust niet toegevoegd (mogelijk later)**: toon-wachtwoord-oogje, sterkte-meter, e-mailadres wijzigen, rate-limiting in UI (Supabase heeft eigen rate limits server-side).
- **Nieuwe functies**: `_validatePasswordRule`, `_showMsg`, `openChangePasswordModal`, `closeChangePasswordModal`, `submitChangePassword`, `toggleForgotPanel`, `submitForgotPassword`, `openRecoveryModal`, `cancelRecovery`, `submitRecoveryPassword`. Init-blok aangepast met `onAuthStateChange`-listener.

## v3.9.5 — Database-hardening (security-audit Supabase mei 2026)
- **Aanleiding**: Supabase-aankondiging dat vanaf 30 oktober 2026 nieuwe tabellen in `public` niet meer automatisch toegankelijk zijn via de Data API. Audit gedaan in het hele schema; meerdere kleine security-issues meteen meegepakt.
- **Geen JS- of UI-wijzigingen** (behalve `APP_VERSION` bump + welkomsttekst). Alle wijzigingen zitten in de Supabase-database, niet in de app-code. App-gedrag is identiek aan v3.9.4.
- **DB-wijziging 1 — `set_updated_at` veilig gezet**: de trigger-functie had geen vaste `search_path`, wat theoretisch schema-injectie mogelijk maakte. Nu vastgezet op `public, pg_temp` via `ALTER FUNCTION`.
- **DB-wijziging 2 — `anon`-rechten ingetrokken**: de rol `anon` had op alle 16 tabellen volledige rechten (SELECT/INSERT/UPDATE/DELETE/TRUNCATE). Dat werd al afgevangen door RLS (geen anon-policies), maar dat was een fragiele single-layer-verdediging. Nu defense-in-depth: `REVOKE ALL FROM anon` op alle bestaande tabellen. De app vereist altijd login (rol `authenticated`), dus geen impact op functionaliteit.
- **Niet uitgevoerd (bewust)**: hernoemen van de "anon alles xxx"-policies naar consistente namen. Werkt correct, alleen verwarrend genoemd vanuit een eerdere migratie. Cosmetische actie met klein risico, geen meerwaarde.
- **`app_settings` ongewijzigd**: single-row tabel met bedrijfsinstellingen, geen DELETE-policy is bewust ontwerp (rij mag niet weg).
- **Nieuwe map `/sql/`**: alle migratiescripts bewaard voor traceerbaarheid. Twee herbruikbare bestanden voor de toekomst: `template_nieuwe_tabel.sql` (correct grants + RLS + policy bij elke nieuwe tabel — vereist vanaf 30 okt 2026) en `audit_query_periodiek.sql` (kwartaal-check voor regressie).
- **Auth-instellingen aangescherpt** (Supabase dashboard, Email-provider): minimum wachtwoordlengte van 6 naar 10 karakters · password requirements op "Letters and digits" (afgewogen tegenover de zwaardere optie met symbolen — wachtwoord-zinnen zijn beter te onthouden en evengoed veilig) · "Require current password when updating" aan (voorkomt snel wijzigen op een open laptop). Bestaande wachtwoorden blijven werken; nieuwe regels gelden bij wijziging of nieuwe account.
- **Niet uitgevoerd — Pro plan vereist**: leaked password protection via HaveIBeenPwned.org is alleen beschikbaar op Pro plan en hoger ($25/mnd). Risico-afweging: signups staan uit, accounts worden handmatig aangemaakt, en de gestrengde wachtwoordregels dekken het meest waarschijnlijke aanvalsoppervlak (zwakke wachtwoorden zoals `welkom123` zijn nu sowieso geblokkeerd). Bij eventuele upgrade naar Pro plan voor andere redenen (backups, hogere limieten) alsnog aanzetten.

## v3.9.4 — Referentie-blokken normenboek bij staartkosten (kleine objecten + klimtijd)
- **Doel**: rekenhulp voor twee veelgebruikte toeslagen uit het normenboek, zonder automatische toepassing. Pure transparantie: jij ziet de richtwaarde, jij beslist welk percentage je in de toeslag-post invult.
- **Blok 1 — Toeslag kleine objecten**:
  - Berekent op basis van het totaal arbeidsuren van de calculatie de richtwaarde uit het normenboek
  - Tabel: ≤ 10 uur = 30% · ≤ 25 uur = 25% · ≤ 50 uur = 20% · ≤ 100 uur = 15% · ≤ 150 uur = 10% · > 150 uur = 0%
  - De huidige geldige rij wordt visueel benadrukt
- **Blok 2 — Toeslag klimtijd**:
  - Kies hoogste woonlaag (1 t/m 5) via knoppen, optioneel +6% voor doorlopende balkons/galerij
  - Tabel: 1 laag = 6% · 2 lagen = 13% · 3 lagen = 17,5% · 4 lagen = 20% · 5 lagen = 24%
  - Toont samengestelde richtwaarde (basis + galerij-opslag indien aangevinkt)
  - Woonlaag-keuze en galerij-vinkje worden lokaal in localStorage bewaard tussen sessies (geen DB-veld)
- **Bewuste afbakening**: géén automatische invulling van de toeslag-post. Dat zou suggereren dat de norm wet is — terwijl het een vuistregel is die jij interpreteert. Bij gemengde projecten (mix van hoogtes, mix van klein/groot werk) past de gebruiker zelf het juiste percentage toe.
- **Plaatsing**: tussen het "Staartkosten"-kopje en de staartkosten-lijst, in het calculatie-paneel.
- **Geen DB-wijziging** — pure UI met afgeleide berekeningen uit bestaande data.
- **Nieuwe functies**: `_normPctKleineObj`, `_setNormKlimLaag`, `_setNormKlimGalerij`, `renderNormRefs`. Nieuwe constanten `NORM_KLEIN_OBJ`, `NORM_KLIMTIJD`.

## v3.9.3 — Nieuwe bewerking ter plekke aanmaken in verfsysteem-formulier
- **Doel**: vlot bewerkingen toevoegen tijdens het opbouwen van een verfsysteem, zonder tab-switch naar het bewerkingen-tabblad. Cruciaal voor het on-the-job vullen van de bibliotheek waarbij tientallen bewerkingen uit het normenboek moeten worden ingevoerd.
- **Knop "+ Nieuw"** naast de bewerking-dropdown in het verfsysteem-formulier. Klik opent een mini-modal met velden: naam, eenheid, minuten/eenheid, ondergrond, materiaal, verbruik.
- **Slimme defaults**: eenheid en ondergrond worden voorgevuld op basis van het verfsysteem waar je in werkt — spaart typewerk.
- **Materiaal-veld**: dropdown met bestaande materialen + "geen". Verbruik-veld is alleen actief als een materiaal is gekozen. Bij geen of weinig materialen verschijnt een hint dat de materialen-bibliotheek apart bijgewerkt kan worden via het Materialen-tabblad.
- **Na opslaan**: nieuwe bewerking wordt aangemaakt in `data.bewerkingen` (DB-insert), automatisch toegevoegd als stap (`modalSteps`) aan het verfsysteem-in-wording, dropdown wordt ververst, mini-modal sluit. De gebruiker werkt direct verder met de stap-percentage instellen.
- **Z-index 200** op de mini-modal zodat hij netjes bovenop het verfsysteem-formulier staat (modal-in-modal-stapeling).
- **Bewuste afbakening (geen nested materiaal-aanmaak)**: binnen de bewerking-mini-modal is géén "+ Nieuw materiaal"-knop. Drie modals diep wordt te veel cognitieve belasting voor gebruikers, en materialen-bibliotheken zijn doorgaans kleiner/stabieler dan bewerkingen-bibliotheken. Indien deze beperking knelt in de praktijk, kan dit alsnog worden toegevoegd.
- **Nieuwe functies**: `openNewBewModal()`, `closeNewBewModal()`, `_toggleNewBewVerbruik()`, `saveNewBewFromSystem()`.

## v3.9.2 — Bugfix: nieuw verfsysteem vanuit calc-regel wordt nu auto-ingevoegd
- **Bug**: bij het aanmaken van een nieuw verfsysteem vanuit de "Verfsysteem toevoegen"-modal (knop "+ Nieuw systeem aanmaken") verscheen het zojuist opgeslagen systeem niet automatisch in de calc-regel. De gebruiker moest het systeem nogmaals handmatig kiezen via de keuzemodal.
- **Oorzaak**: in `openSystemFromAdd()` werd `modalSysContext` éérst gezet (met de calc-context: hoofdgroep + onderdeel), en daarna pas `openSystemModal()` aangeroepen. Maar `openSystemModal()` reset `modalSysContext = null` als allereerste regel. Daardoor was de context verloren tegen de tijd dat `saveSystem()` controleerde of er een auto-invoeg moest gebeuren. De volledige auto-invoeg-logica bestond al — werd alleen nooit getriggerd.
- **Fix**: volgorde omgedraaid — eerst `openSystemModal()`, daarna pas `modalSysContext` zetten. Daarmee werkt de bestaande auto-invoeg-flow zoals oorspronkelijk bedoeld: na opslaan wordt automatisch een nieuwe regel met snapshot van het verse systeem aangemaakt in het juiste onderdeel, calculatie wordt bijgewerkt, modal sluit.
- **Effect op werkflow**: maakt het on-the-job vullen van de bibliotheek wezenlijk soepeler. Geen "klik systeem opnieuw aan"-stap meer. Cruciaal voor de fase waarin de verfsystemen tijdens echte calculaties worden opgebouwd.

## v3.9.1 — Materiaalverbruik per regel (kleurzone-niveau)
- **Per regel een materiaalblokje** direct na de stappentabel — dit is het kleurzone-niveau. Voor projecten met verschillende kleuren binnen één onderdeel (bv. witte deuren + zwarte kozijnen in dezelfde "Hal BG") zie je nu per regel exact hoeveel materiaal nodig is.
- **Visuele hiërarchie** op de Werkbon:
  - **Regel-blokje** (nieuw): klein, grijs lettertype, dunne linker-rand — zit visueel "binnen" de regel
  - **Onderdeel-blokje**: prominenter, lichte achtergrond, dikkere linker-rand — som van alle regels binnen het onderdeel
  - **Projecttotaal**: onveranderd, gegroepeerd per materiaalgroep, onderaan de werkbon
- **Altijd alle niveaus tonen**, ook bij onderdelen met maar één regel. Voor consistente layout — je weet altijd waar je moet kijken.
- **Begripsverheldering**: in v3.9.0 stond per ongeluk de aggregatie alleen op onderdeel-niveau, omdat de term "onderdeel" voor verschillende structuren wordt gebruikt. In jouw werkwijze geldt: hoofdgroep = ruimte (bv. "Binnen"), onderdeel = element-type (bv. "Hal BG"), regel = uitvoering met eigen verfsysteem + kleur. Het kleurzone-niveau is dus de regel — daar zit de uitsplitsing nu.

## v3.9.0 — Materiaalverbruik op Werkbon (boodschappenlijst voor bestellen)
- **Werkbon toont nu materiaalverbruik op twee niveaus**:
  1. **Per onderdeel** — onder elk onderdeel een compacte tabel met materiaal, totaal verbruik en eenheid. Geaggregeerd over alle regels van dat onderdeel (dus aflak die zowel in tussen- als eindlaag zit, telt op).
  2. **Projecttotaal onderaan** — een aparte sectie "Materiaal totaal voor project", gegroepeerd per materiaalgroep (Verven, Hulpmiddelen, Kit, etc.) volgens de volgorde uit `groepOpslagen`. Dit is de boodschappenlijst voor het bestellen.
- **Rekenregel**: `regel.hoeveelheid × stap.verbruik × (stap.percentage / 100)`. **Staat-toeslag wordt NIET meegerekend** — alleen basisverbruik (theoretisch minimum), zodat de gebruiker zelf bepaalt hoe royaal hij bestelt.
- **Aggregatie-sleutel**: `materiaalId` uit de stap-snapshot. Vergrendelde calcs blijven dus correct ook als een materiaal later hernoemd of verwijderd wordt in de bibliotheek.
- **Stappen zonder materiaal** (`materiaalId = null`, bv. "Ontvetten" of "Afplakken") worden overgeslagen in de aggregatie.
- **Sortering binnen het projecttotaal**: groepen in volgorde van `groepOpslagen`-keys, dan alfabetisch op materiaalnaam.
- **Knop hernoemd**: "📋 Werkbon printen" → "📋 Werkbon" (printen is een vanzelfsprekendheid).
- **Geen DB-wijziging nodig** — alle benodigde data zat al in de stap-snapshots (`materiaalNaam`, `materiaalEenheid`, `materiaalGroep`, `verbruik`).
- **Nieuwe functies**: `_aggregeerMateriaalVerbruik(regels)` en `_renderMateriaalTabel(rows, opts)`.

## v3.8.2 — Dashboard-totalen gecached + vergrendeling-fix
- **Dashboard toont nu het totaal voor alle calculaties**, niet alleen de actieve.
  Het bedrag wordt gecached in nieuwe DB-kolom `calculaties.totaal_incl_btw`
  (NUMERIC(12,2), nullable).
- **Concept-calcs**: bij elke wijziging wordt het totaal opnieuw berekend en
  gesaved via `_touchCalc()`. Live waarde altijd up-to-date.
- **Vergrendelde calcs (gereed/verzonden/geaccepteerd/verloren)**: het totaal wordt
  éénmalig berekend op het moment van vergrendelen (in `setCalcStatus()`) en daarna
  bevroren. Het bedrag verandert NIET als uurloon, BTW of opslagen later wijzigen.
- **Bug-fix in `_calcTotalForArchive()`**: dashboard-archief gebruikte voor álle
  calcs de live `data.settings`, ook voor vergrendelde calcs. Nu pakt het de
  `settingsSnapshot` indien vergrendeld — consistent met `_S()` in het rekenmodel.
- **Render-strategie in `renderCalculatiesArchief()`**:
  1. Geladen calc → live berekenen (meest actuele waarde)
  2. Niet-geladen calc met cache → cached bedrag uit DB
  3. Geen cache (NULL) → gedachtestreepje (—) met tooltip "Open en sla op om te berekenen"
- **Backfill**: bestaande calcs vullen zichzelf bij eerstvolgende save (concept) of
  vergrendel-wijziging (anders). Geen migratie-script nodig.
- **DB-migratie** (al uitgevoerd): `ALTER TABLE calculaties ADD COLUMN totaal_incl_btw NUMERIC(12,2)`.
