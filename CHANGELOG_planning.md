# CHANGELOG planning.html

## v0.1.2 — Kolombreedtes afgedwongen, 06-09-2026

In de browser rekte de linkerkolom mee met de langste projectnaam, stond de scroll op maart en liepen de getallen onderaan in elkaar. Eén oorzaak: `table-layout: fixed` werkt alleen met een tabelbreedte, en die ontbrak. De tabel krijgt nu 300 + 365 × 34 px, de linkerkolom knipt lange namen af met "…" (volledige naam in de zweeftekst), en "Vandaag" scrolt op de echte kolompositie. Rijhoogte ongewijzigd. 23/23 controles in jsdom; het beeld zelf is niet in een echte browser getest.

## v0.1.1 — Projectnaam in de balk, 06-09-2026

Na eerste blik in de browser: als je naar de huidige week scrolt zegt een balk niets meer. De projectnaam staat nu vooraan in de balk, de klantnotitie erachter. De tekst heeft de balkkleur als achtergrond en loopt bij een korte balk leesbaar over het einde heen. Getest: 23/23 controles in jsdom.

## v0.1.0 — Het bord in zijn kern (brok 2), 06-09-2026

Eigen pagina naast financieel.html en taken.html, zelfde login en stijl.

### Wat er kan
- Jaarbord met dagkolommen, weeknummers, weekend grijs (niet invulbaar), gesloten dagen grijs gearceerd (niet invulbaar), vandaag gemarkeerd. Knop "Vandaag" en jaarkiezer.
- Projecten uit de laatste stand in `fin_werkvoorraad` (Yoobi) die in het gekozen jaar vallen, gesorteerd op startdatum. Blauwe balk; gearceerd zolang er geen uur op gepland is.
- Klik op een project: medewerkerrijen klappen uit, paneel rechts toont aanneemsom, budget, ingepland (dit jaar), geboekt en resterend (rood als negatief). Nog een klik klapt weer in.
- Uren per medewerker per dag invullen; opslaan bij verlaten van de cel (komma of punt). Leegmaken verwijdert de rij. Pijltjestoetsen bewegen door het rooster.
- Totaaltelling onderaan: restant per medewerker per dag (norm min gepland). Grijs = niets gepland, oranje = deels, groen = precies vol, rood = te veel.
- Rood hoekje op elke gevulde cel van een medewerker op een dag waarop zijn totaal boven de norm zit, met uitleg bij aanwijzen.
- Klantnotitie in de balk ("afspraak klant…"), klik om te bewerken, Enter of wegklikken slaat op, Escape breekt af.
- Lijst "Nog geen datum in Yoobi" voor projecten zonder startdatum.

### Nog niet (brok 3)
- Balk verschuiven, project verbergen, knop "Yoobi verversen" (vereist Edge Function v5), beheer van gesloten dagen en medewerkers, verlof per medewerker.

### Onder de kap
- Leest: `fin_werkvoorraad` (laatste peildatum), `plan_medewerkers` (actief, op volgorde), `plan_projecten`, `plan_uren` (alleen het gekozen jaar), `plan_gesloten_dagen` (gekozen jaar).
- Schrijft: `plan_uren` (upsert op yoobi_code+medewerker_id+datum, delete bij 0), `plan_projecten` (upsert klantnotitie).
- Mislukt opslaan: geheugen en cel worden teruggedraaid en de status meldt het.
- "Ingepland" en "gearceerd" kijken alleen naar uren in het geladen jaar.
- Projecten met lege Yoobi-code worden niet getoond (twee in de stand van 01-09-2026); Edge Function v5 geeft die een noodsleutel.
- Getest: JS parse (node), 23 functionele controles in jsdom met nagebootste Supabase. Niet getest: echte browser, echte Supabase, aanraakbediening.
