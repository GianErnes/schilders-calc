<!-- Controle calculatie en offerte — specificatie uit de filosofeerronde van 04-07-2026 -->

# Controle calculatie en offerte: specificatie

Bron: de controlelijst van Gian, letterlijk overgenomen. Doel: een knop **Controleer** in de calculatie die het werk naloopt voor de offerte de deur uit gaat. Uitkomst zijn aandachtspunten in drie zwaartes (blokkerend, controleer, ter overweging), nadrukkelijk geen goedkeuring.

## Laag 1: harde controles (in de app, geen AI, gratis)

1. Naam en adres goed ingevuld
2. Juiste klanttype gekozen
3. Voorletter en tussenvoegsel goed ingevuld
4. E-mailadres ingevuld
5. Offertenummer volgens Yoobi-verkoop
6. Geldigheid van de offerte passend bij het type (particulier 14 dagen)
7. Prijsweergave in de offerte op regels excl. hoeveelheid en eenheidsprijs
8. Verfsystemen benaamd
9. Percentages aangepast (niet alles 100%)
10. Toeslagen gekozen (klimtoeslag, kleinschaligheid enz.)
11. Houtrot aan of uit passend bij het werk (buitenwerk: aan)
12. Foto's hebben een beschrijving
13. Betalingstekst hoort bij het klanttype (de blokkeuze is hard te checken; of de inhoud past is leeswerk, zie laag 2)

## Laag 2: leescontroles (AI via Edge Function, vraagbaak-patroon)

14. Is de projectnaam wat er gecalculeerd wordt
15. Is goed omschreven wat de klant wenst
16. Passen de onderdelen die in de offertetekst benoemd worden bij de calculatie
17. Zijn de beschrijvingen passend op alle ondergrondsoorten
18. Kloppen de fotobeschrijvingen inhoudelijk bij wat er gecalculeerd is
19. Spelling en zinsopbouw van alle klantgerichte teksten (klantwens, fotobeschrijvingen, offerteteksten)

## Opvallende conclusie uit het filosoferen

Geen van de punten gaat over het bedrag. De eerste controle is volledigheid en consistentie van het document, niet de prijs. Het prijsgevoel (uren per m² binnen bandbreedte, vergelijk met eerdere klussen) is een eventuele laag 3 voor later, met een eigen gesprek over waar "normaal" vandaan komt.

## Uit te zoeken in de code (bouwchat)

- Geldigheid per klanttype: is particulier 14 dagen een vaste regel die de app kan bewaken en geldt voor zakelijk en VvE dan 30 dagen?
- Welke schakelaar is "houtrot" precies: offerteclausule, garantietekst of iets anders?
- Waar leven klimtoeslag en kleinschaligheidstoeslag: staart, instelling of systeemkeuze?
- Voorletter en tussenvoegsel: eigen velden of onderdeel van de Yoobi-klantdata?
- Wat is voor punt 8 de definitie van "benaamd": regelnaam wijkt af van de kale systeemnaam, of niet leeg?

## Vorm

Knop **Controleer** in de calculatie, bewust moment net als Naar Craft. Laag 1 draait lokaal en direct. Laag 2 stuurt een compacte samenvatting (kop, structuur, regels, staart, offerteteksten, fotobeschrijvingen) naar een Edge Function volgens het app-hulp-patroon, gelogd met tokens en kosten. Framing in de uitkomst: aandachtspunten, nooit "goedgekeurd", want vals vertrouwen is het enige echte risico van deze feature.

## Besluit (04-07-2026)

Bouwvolgorde: eerst laag 1 als eigen release (harde controles in de app, geen AI), daarna laag 2 apart via de Edge Function, inclusief de spelling- en zinsopbouwcontrole. Bouwen gebeurt in een verse chat op basis van deze specificatie.
