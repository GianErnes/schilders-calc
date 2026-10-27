## planning-kennisgeving v3.2 — Tekst van het bevestigingsblok, 27-10-2026 (geen planning.html-wijziging)

**Aanleiding.** Gian 27-10-2026 (schermafbeelding weekmail Beekman): "er wordt weinig op deze knop geklikt". Eerst gemeten (query Gian op `plan_kennisgevingen`, verzonden sinds 09-10-2026): maand 9/12, dag 16/26, week 3/9 bevestigd; alles afgeleverd (47/47). Totaal 60%; alleen de weekmail scoort laag, op een kleine basis. Besluiten (ask_user_input): geen pijl, geen open-tracking; wel een tekst die zegt waarom de klik telt en wat er zonder klik gebeurt — en die waar is (de nabeltaak na 3 werkdagen bestaat echt; "zonder klik plannen wij niet verder" is bewust niet opgeschreven, want dat klopt niet). Variant C, voor alle drie de soorten.

**Wijziging (alleen Edge Function `planning-kennisgeving` v3.1 → v3.2, besloten repo).**
- Kop van het blok: "Bevestigt u deze planning?" (was "Heeft u dit bericht ontvangen?").
- Uitleg: "Met één klik weten wij dat [de maand / de week / de startdag] bij u bekend is en de toegang geregeld wordt. Horen wij niets, dan bellen wij u binnen enkele werkdagen na." Nieuw `periodeWoord(soort)` en `bevestigUitleg(soort)`; `bevestigBlokHtml`, `bevestigBlokTekst` en `tekstNaarHtml` krijgen `soort` mee (optioneel; terugval "de planning"). Tekstversie: zelfde uitleg, link op een eigen regel.
- Knoptekst "Ja, ik heb dit ontvangen", token, link naar bevestig.html, volgorde token → mail → rij, vastleggen: ongewijzigd. Deploy met Verify JWT AAN (zoals v3.1).

**Niet gewijzigd.** planning.html (noemt alleen de knoptekst, regels 482/635/3029 — klopt nog), bevestig.html, SQL, `planning-kennisgeving-taken`, `-bevestig`, `-status`. Al verstuurde mails houden de oude tekst.

**Getest.** Deno 2.9.6 lokaal, 6 tests groen (`planning-kennisgeving_v3.2_index_test.ts`): periodeWoord per soort + terugval + hoofdletters; html-blok kop/uitleg/knoptekst/link-escaping, oude kop weg; tekstversie; tekstNaarHtml geeft soort door en knipt de groet één keer; volledige `verwerk` met nep-fetch: soortwoord in html én text, token in mail = token in rij, 200; 401 zonder JWT en 400 bij foute soort. `deno check index.ts` schoon. Het oorspronkelijke testbestand van v3.1 is in deze sessie niet gezien; de tests hierboven zijn nieuw geschreven en dekken ook het v3-gedrag (token/volgorde/401/400).

**Niet getest.** In het echt. Controle na deploy (Gian): één kennisgeving (bij voorkeur week) aan een eigen adres; in de mail staat "Bevestigt u deze planning?" met "de week"; knop → bevestig.html → "Bedankt"; `bevestigd_op` gevuld. Meetmoment: over ±4 weken dezelfde query opnieuw draaien en vergelijken met 9/12 · 16/26 · 3/9.
