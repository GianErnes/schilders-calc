## v3.10.0 — Onderhoudsplan
- **Nieuwe tab "Onderhoudsplan"** tussen Ondergronden en Instellingen. Stel een meerjaren-onderhoudsplan op op basis van een opgeslagen calculatie, bedoeld als verkoopinstrument voor klanten die periodiek schilderwerk willen onderbrengen in een onderhoudscontract.
- **Datamodel**: twee nieuwe Supabase-tabellen: `onderhoudsplannen` (1-op-1 gekoppeld aan een calculatie, met prijspeil, looptijd, indexering, BTW-override, notities) en `onderhoudsplan_beurten` (n-op-1, met jaartal, naam, modus, scaling als jsonb, en `mee_in_gemiddelde`-vlag). RLS via `auth.uid()`.
- **Bron-picker**: zoekveld + statusfilter (concept/gereed/geaccepteerd default aan, verzonden/verloren default uit). Gesorteerd op meest recent gewijzigd. Hele Parameters-blok inklapbaar via een `<details>`-toggle die de bronnaam in de kop toont, default ingeklapt als er een werkend plan is.
- **Drie schaal-modi per beurt**:
  - *Algemeen*: één percentage op het hele project. Voor controlebeurten (15%) en eerste behandelingen (100%).
  - *Per regel*: per regel een eigen percentage, met snelinvuller per hoofdgroep ("zet alle Buitenwerk-regels op 25%"). Default per regel = 100%.
  - *Per stap*: per stap een eigen percentage, regels uitklapbaar om scherm leesbaar te houden, samenvattend label rechts (alles 100% / variabel / uit). Voor onderhoudsbeurten waarbij afbranden of machinaal schuren uit moet, maar eindlaag wel mee gaat.
- **Rekenkern** spiegelt letterlijk de structuur van de calculatie-tab: regels (arbeid + matVerkoop) + reiskosten + afrondingstoeslag bij volle dagen + kleinMat/afval/arbo + staart → directe kosten → × risico → excl. BTW. Voor de print: × BTW = incl. BTW. Geen winst-per-regel meer (dat gaf 0,5% afwijking ten opzichte van de offerte). Werkt op een snapshot van de calc-settings, zodat het plan niet meebeweegt als jij later uurloon aanpast.
- **BTW-veld** per plan, default = BTW van de bron-calculatie. Override mogelijk voor het nieuwbouw → onderhoud-scenario (nieuwbouw-calc 21%, daaropvolgende onderhoudsbeurten 9%). Hint achter het veld laat zien of je op de bron-waarde zit of afwijkt.
- **"Mee in gemiddelde"-vinkje per beurt**: zo niet, dan telt de beurt wel in de jaartabel maar niet in totaal/gemiddeld jaarbedrag. Voor de eerste behandeling die de klant separaat afrekent (Ernes is geen bank).
- **"Kopieer uit andere beurt"-knop** in de bewerk-modal: dropdown met alle andere beurten van dit plan (eerdere én latere), met modus en samenvatting per item. Klik = kopieer modus + scaling naar de huidige beurt. Beurt-typen volgen elkaar zelden direct op, dus directe-vorige-kopie was te beperkt.
- **Resultaatblok**: gemiddeld per jaar (incl. BTW), jaartabel met visueel onderscheid tussen meegerekende beurten (blauw accent) en eenmalige (grijs).
- **Print-functie** als verkoopdocument: header met logo, kerncijfers (gemiddeld per maand prominent, looptijd), jaartabel, project-specifieke notities. Geen handtekening-blok (Yoobi doet dat digitaal), geen generieke uitleg-tekst (zit in de Yoobi-offerte zelf), geen beurten-tabel met aanpak-info (dubbeling met jaartabel, te veel detail voor klant).
- **Notities-veld** op het plan voor klant-specifieke afspraken die op de print verschijnen.
- **Volgordefix tijdens ontwikkeling**: rekenkern eerst gebouwd (zodat bedragen testbaar waren in de lijst), modal pas daarna. Dat bleek essentieel voor het tijdig vinden van de 0,5% afwijking en de ontbrekende afrondingstoeslag/reiskosten in de eerste rekenkern.
- **Geen breaking changes** aan bestaande tabs of functionaliteit. Alle wijzigingen geïsoleerd in nieuwe DB-tabellen en eigen JS-module met `_ohp`-prefix.

## 2026-05-15 — GitHub-beveiliging op orde (geen code-wijziging)
- **Geen versie-bump** want er is geen functionaliteit aan de app toegevoegd of gewijzigd. Deze entry documenteert dat de **GitHub-repo en het account erachter zelf** vandaag in één sessie van drie beveiligingslagen zijn voorzien. Doel: voorkomen dat de live-app via een account-takeover beschadigd of vervangen kan worden.
- **Laag 1 — Authenticatie aangescherpt**: 2FA aangezet op het `GianErnes` GitHub-account met TOTP-codes via een wachtwoord-manager + een passkey als sterkere en phishing-bestendige tweede methode. Recovery codes zijn op papier opgeslagen op een fysiek veilige locatie buiten elk digitaal apparaat.
- **Laag 2 — Toegangshygiëne**: alle externe toegangsroutes geïnventariseerd en opgeruimd. Op de repo zelf staan geen collaborators. Op accountniveau zijn geen Personal Access Tokens (classic én fine-grained), geen SSH/GPG-keys, geen door mij gebouwde OAuth-apps, geen geïnstalleerde of geautoriseerde GitHub-Apps, en geen geautoriseerde OAuth-Apps actief. Eén niet-gebruikte third-party koppeling is ingetrokken.
- **Laag 3 — Branch protection**: ruleset *"Bescherm main branch"* aangemaakt en op `Active` gezet, gericht op de default branch (`main`). Twee regels actief: *Restrict deletions* (main kan niet worden verwijderd) en *Block force pushes* (commit-geschiedenis kan niet worden herschreven of vervalst). Een bypass voor de rol *Repository admin* zorgt dat de eigenaar van de repo onbelemmerd kan blijven werken zoals voorheen.
- **Wat dit oplost**: bij een eventueel toekomstig incident waarbij iemand alsnog toegang krijgt zonder admin-rechten — bijvoorbeeld via een gekaapt token of een gestolen sessie zonder volledige account-takeover — kan `main` niet worden gewist en de geschiedenis niet worden vervalst. Combinatie met 2FA + passkey op Laag 1 maakt account-overname zelf bovendien substantieel moeilijker.
- **Wat dit niet oplost**: een volledige takeover van het admin-account (wachtwoord + 2FA + passkey + bypass-rechten) blijft theoretisch destructief. De drie lagen zijn defense-in-depth, geen absolute garantie. De papieren back-up van de recovery codes en het feit dat de Supabase-data los van GitHub staat, vormen de laatste vangnetten.
- **Geen wijziging aan `index.html`, `APP_VERSION` of de live-app**. Volgende sessie: zelfde drie lagen toepassen op het `administratie@ernes.nl` GitHub-account (voorraad-app).

## v3.9.6.4 — Hotfix #4 (laatste): foutmeldingen weer in net Nederlands
- **Bug**: na v3.9.6.2/3 verschenen foutmeldingen bij wachtwoord wijzigen als generieke "Wijzigen mislukt: HTTP 400" in plaats van duidelijke Nederlandse meldingen als "Huidig wachtwoord klopt niet" of "Nieuw wachtwoord moet anders zijn dan het huidige".
- **Diagnose via DevTools** (Network tab → Response): de server-response bleek deze structuur te hebben:
  ```json
  { "code": 400, "error_code": "current_password_invalid", "msg": "Current password required when setting new password." }
  ```
  Maar mijn vertaal-code in v3.9.6.2 las `body.code` en `body.message`. Resultaat: `code` was de HTTP status (400) i.p.v. de error-string, en `message` bestond niet. Mijn `if`-takken matchten nooit, fallback gaf altijd "HTTP 400".
- **Fix**: drie veldnamen aangepast:
  - `body.code` → `body.error_code || body.code` (gotrue gebruikt snake_case)
  - `body.message` → `body.msg || body.message || ...` (idem)
  - Extra error-code `current_password_invalid` toegevoegd (verschillend van `current_password_required` — eerste = klopt niet, tweede = ontbreekt; beide vertalen we naar "Huidig wachtwoord klopt niet")
- **Lessen uit de saga (vier hotfixes voor één feature)**:
  - Library-docs zijn niet altijd accuraat over wire-format (camelCase in docs, snake_case in werkelijkheid)
  - Server-side response-velden zijn ook snake_case en wijken af van wat ik verwachtte
  - DevTools Network-tab is onmisbaar bij elke auth-debug, niet pas als laatste redmiddel
  - Toast-aanroepen direct na async calls kunnen door interne library-effects worden onderbroken; toast eerst, async daarna
- **Geen nieuwe functionaliteit, alleen betere foutafhandeling**. Wachtwoord wijzigen werkt sinds v3.9.6.2; v3.9.6.3 fixte de toast; v3.9.6.4 fixt nu de foutmelding-tekst.

## v3.9.6.3 — Hotfix #3: bevestigings-toast verscheen niet na wachtwoord wijzigen
- **Bug**: in v3.9.6.2 werkte het wachtwoord wijzigen functioneel correct (server-call slaagde, wachtwoord daadwerkelijk gewijzigd, nieuw wachtwoord bruikbaar bij login), maar de groene bevestigings-toast "Wachtwoord gewijzigd..." verscheen niet. De modal sloot gewoon zonder feedback, waardoor het voor de gebruiker leek alsof er niks gebeurde.
- **Theorie/diagnose**: in `submitChangePassword` stond de volgorde van calls in v3.9.6.2 als volgt:
  1. `await fetch(...)` (slaagt)
  2. `await _sb.auth.refreshSession()` (probeert nieuwe tokens te halen)
  3. `closeChangePasswordModal()`
  4. `_toast(...)`
  Vermoeden: stap 2 (refreshSession) gooit intern in supabase-js een fout omdat de oude refresh-token na de server-side wachtwoord-wijziging niet meer geldig is. Mijn `try/catch` ving zichtbare exceptions wel op, maar interne async errors of unhandled promise rejections konden de UI-render-thread alsnog kort onderbreken — net lang genoeg om de toast onzichtbaar of niet-rendered te laten.
- **Fix**: volgorde van calls omgedraaid:
  1. Modal sluiten
  2. Toast tonen
  3. `refreshSession()` op de achtergrond (zonder `await`, met `.catch()` voor losse error-logging)
  
  Toast verschijnt nu meteen, sessie-refresh gebeurt zonder de gebruiker te laten wachten.
- **Bonus diagnostiek**: `console.log('[v3.9.6.3] Wachtwoord gewijzigd, toast tonen')` toegevoegd vóór de toast-aanroep, plus `console.warn` als refreshSession alsnog ergens faalt. Niet zichtbaar voor de gebruiker, alleen voor toekomstige debug-sessies.
- **Geen bewijs van oorzaak** — alleen een waarschijnlijke theorie. Mocht de toast nog steeds niet verschijnen na deze fix, dan zit het probleem ergens anders en moeten we verder kijken (DOM-element-id-conflict, z-index-stacking, CSS-overwrite).

## v3.9.6.2 — Tweede hotfix: supabase-js camelCase/snake_case bug omzeild met directe fetch
- **Bug**: na v3.9.6.1 bleef de "Wachtwoord wijzigen"-modal de melding "Huidig wachtwoord klopt niet" geven, ook bij het correct ingetypte wachtwoord (zelfs het wachtwoord dat zojuist had gewerkt bij login).
- **Diagnose via DevTools**: in de Network-tab toonde de **Payload** van de PUT /auth/v1/user call deze JSON:
  ```json
  { "password": "...", "currentPassword": "..." }
  ```
  Maar de server-**Response** klaagde:
  ```json
  { "code": "current_password_required", "message": "Current password required when setting new password." }
  ```
  Conclusie: supabase-js v2 stuurt de parameter als `currentPassword` (camelCase) naar de server, terwijl gotrue/auth-server `current_password` (snake_case) verwacht. De camelCase-key wordt door de server genegeerd, alsof hij niet was meegestuurd. Bekend [supabase-discussie-item](https://github.com/supabase/gotrue/issues/608) — de library converteert tussen casing voor sommige endpoints inconsistent.
- **Fix**: voor deze ene call (PUT /auth/v1/user) wordt de library overgeslagen. Directe `fetch()` naar `${SUPABASE_URL}/auth/v1/user` met de juiste `current_password` snake_case sleutel in de body. Authorization-header met access_token uit de huidige sessie, en `apikey`-header met de anon key. De rest van de app blijft de library gebruiken zoals voorheen — alleen deze call is direct.
- **Verbeterde foutafhandeling**: error-detectie nu op `code`-veld van de server-response (`current_password_required`, `same_password`, `weak_password`, `invalid_credentials`) in plaats van tekst-matchen op de message. Codes zijn stabieler dan vertaalde tekst.
- **Na succes**: `_sb.auth.refreshSession()` zodat de lokale supabase-js-sessie nieuwe tokens krijgt en verder normaal blijft werken. Zonder deze stap zou er een mismatch ontstaan tussen wat de server weet en wat de lokale sessie denkt te weten.
- **Waarom geen library-upgrade?** De script-tag laadt `@supabase/supabase-js@2` (laatste 2.x). De bug zit in een actuele versie, dus upgraden lost niets op. Een specifieke versie pinnen zou alleen werken als ik kon garanderen dat de bug daar opgelost was — dat kon ik op basis van de changelog niet bevestigen. Directe fetch is robuuster en hangt niet af van library-quirks.

## v3.9.6.1 — Hotfix: wachtwoord wijzigen werkte niet met "Secure password change"
- **Bug**: in v3.9.6 verscheen bij elke poging om het wachtwoord te wijzigen via de nieuwe in-app modal de foutmelding `Current password required when setting new password`, ook al was het huidige wachtwoord correct ingevuld. De feature was effectief stuk.
- **Oorzaak**: `submitChangePassword()` gebruikte een aanpak met twee Supabase-calls — eerst opnieuw inloggen met het huidige wachtwoord (`signInWithPassword`) om dit te verifiëren, dan apart `updateUser({ password: nieuw })` aanroepen. Maar de Supabase-instelling "Require current password when updating" (server-side aangezet in v3.9.5) eist dat het huidige wachtwoord in **dezelfde call** wordt meegestuurd als parameter — niet via een aparte re-auth. Het twee-stappen-patroon dat ik koos was achterhaald (was de oude manier vóór supabase-js v2.102.0).
- **Fix**: één enkele call `_sb.auth.updateUser({ password: nieuw, currentPassword: huidig })`. Supabase valideert het huidige wachtwoord server-side. Schoner, sneller, en werkt mét de strikte instelling aan.
- **Bonus**: Supabase-foutmeldingen worden nu vertaald naar nette Nederlandse meldingen — "Huidig wachtwoord klopt niet" in plaats van Engelse technische tekst. Detectie via keyword-matching op de error message van Supabase (`current password`, `invalid login`, etc.).
- **Geen wijziging in flow B (vergeten-link)** — die had dit probleem niet omdat de recovery-sessie zelf al een verificatie is.
- **Geen DB-wijziging**, geen Supabase-config-wijziging — alleen JS in `submitChangePassword()`.

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
