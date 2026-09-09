# CHANGELOG taken.html

Aangemaakt op 09-09-2026 (v0.18.2). De regels tot en met v0.18.0 zijn
achteraf opgebouwd uit de versiecommentaren die in de code zelf staan;
wat daar niet in stond, staat hier ook niet. Datums zijn alleen genoemd
waar ze uit de code of uit de sessie bekend zijn. Geschiedenis vóór
v0.13.2 is niet vastgelegd.

## v0.18.2 — Op de rol standaard dicht, 09-09-2026

De rubriek Op de rol start dichtgeklapt; openklappen blijft met een tik.
Actueel start nog steeds open. Alleen `open:false` in `RUBRIEKEN`.
Getest: JS parse (node). Niet getest: browser.

## v0.18.1 — Op de rol omgekeerd, 09-09-2026

Op de rol sorteert nu op plandatum aflopend: de meest recente plandatum
bovenaan, de langste achterstand onderaan. Taken zonder datum blijven
onderaan. Alle andere rubrieken ongewijzigd (oplopend). Getest: JS parse
(node) en sorteertest met testdata; niet in een echte browser.

Dezelfde dag, zonder codewijziging: de melding "Geen rechten om op te
halen" bij Yoobi bijwerken bleek een verlopen sessie (voettekst toonde
"aangemeld als Overig"); afmelden en aanmelden loste het op. In de logs
van 6 en 9 september stond daarnaast een TLS-fout op de Yoobi-token-
endpoint (`peer closed connection without sending TLS close_notify`).
Ronde van 9 september 22:25 liep daarna schoon: 824 klanten, 0 fouten,
70 Yoobi-taken.

## v0.18.0 — Actueel in plaats van Vandaag, datum niet vastgelegd

De rubriek Vandaag heet Actueel. Het dagmodel is vervangen door een
blijvend model in `taak_dagkeuze`: één regel per persoon per taak (uniek
op persoon, taak_id). Stand `gehaald` = blijvend in Actueel, ongeacht de
dag. Stand `weggezet` = niet in Actueel. Staat de taak vandaag op jouw
naam gepland, dan geldt wegzetten alleen voor die dag (kolom `dag`);
morgen wint de planning weer en valt de taak anders door naar Op de rol.
De pijl staat ook bij een vaste taak, om hem voor vandaag weg te zetten.
Vervangt het dagmodel van v0.15.0-v0.17.0 waarin alleen regels met
dag = vandaag telden.

## v0.17.0 — Planning wint, datum niet vastgelegd

Wat op jouw naam staat en vandaag gepland is, landt vanzelf in Vandaag
(`_vandaagVast`) en is daar niet uit te tikken; wil je het niet vandaag,
dan verzet je de datum. De pijl en de dagkeuze-schakelaar verschijnen
daar niet, want ze zouden niets doen. Wat vóór vandaag gepland stond is
achterstand en blijft in Op de rol, ongeacht de bron. De pil "te laat"
zegt er meteen bij hoeveel dagen, berekend uit `gepland_op` zelf (als
kale dag, zomertijd telt niet mee). Vervangt de losse doorschuifpil die
alleen telde hoe vaak je zelf had aangetikt.

## v0.16.4 — Projectnaam uit Yoobi, datum niet vastgelegd

De projectnaam uit Yoobi als tweede regel bij een klanttaak, alleen als
de sync (`yoobi-taken-sync` 2026-08-13d) hem heeft kunnen vullen.

## v0.16.3 — Volgen tot de ronde rond is, ca. 13-08-2026

Een volle Yoobi-ronde duurt ruim zes minuten (gemeten 13-08-2026: 812
klanten, zes brokken, 11:09:30 tot 11:15:46). Het scherm gaf na drie
minuten op en meldde onterecht dat het nog doorliep. Nu volgt het tot
twintig minuten, maar haakt af zodra er vier minuten niets verandert;
dan is de keten weg zonder dat de stand op mislukt kwam en wordt de
lijst toch ververst.

## v0.16.2 — Weigeringen van de sync netjes tonen, ca. 13-08-2026

De Edge Function weigert sinds 13 augustus een tweede ronde met een 409
zolang er al een keten loopt: dat is uitleg, geen foutmelding. Zet de
function de stand op mislukt, dan stopt het scherm meteen met draaien in
plaats van drie minuten te wachten op een idle die nooit kwam.

## v0.16.1 — Kleine correcties Yoobi-rubriek, datum niet vastgelegd

De ondertitel van Klantopvolging zegt dat je de lijst zelf bijwerkt.
Stopt het ophalen zonder herbouw van het scherm, dan blijft "bezig met
ophalen" niet meer hangen maar valt terug op de vaste ondertitel.

## v0.16.0 — Melding bij afvinken, datum niet vastgelegd

Bij een open eigen taak een leeg vak om bij het afvinken iets kwijt te
kunnen. Bij een afgevinkte taak staat wat destijds gemeld is, alleen als
er iets staat. Bij Yoobi-taken niet; die worden hier niet afgevinkt.

## v0.15.0 — Vandaag als handkeuze, datum niet vastgelegd

Met één tik naar Vandaag en met één tik weer eruit, alleen zichtbaar in
Vandaag en Op de rol. Filter je op jezelf, dan blijft zichtbaar wat je
van een ander hebt overgenomen. Na een afgeronde ronde gaat de
doorschuifhistorie van een taak op nul. In v0.17.0 aangevuld met de
automatische plaatsing door de planning.

## v0.14.0 — Sjablonen, datum niet vastgelegd

Eén gedeelde lijst in `taak_sjablonen`: naam, titelvoorstel en
notitietekst. Iedereen met een rol leest mee, alleen rol `alles` maakt
aan of gooit weg; dat dwingt de RLS op de tabel af.

## v0.13.5 — Standaardtijd nieuwe taak, datum niet vastgelegd

Een nieuwe taak begint op vandaag 17:00. Is dat al voorbij, dan morgen
17:00, zodat de melding nooit in het verleden ligt en meteen zou mailen.

## v0.13.4 — Tijdzones, datum niet vastgelegd

Kale lokale tijdtekst wordt voor timestamptz-kolommen (`voltooid_op`,
`piep_op`) als lokale tijd gelezen en als UTC weggeschreven. `gepland_op`
is timestamp zonder tijdzone en gaat hier bewust niet doorheen.

## v0.13.3 — Onbekende persoon crasht niet meer, datum niet vastgelegd

Onbekende persoonswaarden worden "Overig" in plaats van een crash.

## v0.13.2 — ziet_klant uit taken_rollen, datum niet vastgelegd

De vlag `ziet_klant` komt uit `taken_rollen`; dezelfde vlag stuurt de
RLS-policy op de server, zodat client en server niet uiteen kunnen
lopen. Er wordt op bron gefilterd, zodat klanttaken in elke rubriek
zichtbaar blijven.
