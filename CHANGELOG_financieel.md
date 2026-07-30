# Changelog — financieel.html

## v1.1.1 — 30-07-2026
- Rekening 23000 Betalingen onderweg wordt voortaan uit een saldibalans per 31 december gelezen. Betaalbatches worden geboekt op hun uitvoerdatum, en die ligt in de toekomst; de balans per vandaag zag die boekingen niet en miste daardoor 11.613 aan geagendeerde batches. Het banksaldo stond met dat bedrag te hoog terwijl de formule zelf klopte.
- Alle andere cijfers blijven per vandaag opgevraagd, anders zou toekomstige omzet in het dashboard lekken. Het is één extra SOAP-aanroep.
- De lopende maand in de banksaldografiek krijgt hetzelfde gecorrigeerde cijfer als de tegel. Afgesloten maanden blijven per maandeinde, daar zijn de batches van toen allang afgeletterd.
- Alleen de Edge Function rekent anders; in financieel.html is enkel het versienummer opgehoogd.

## v1.1.0 — 28-07-2026
- Banksaldo klopt weer met Yuki. De vuller telt nu de bankrekeningen (11xxx en 12xxx), de creditcard (15000) en rekening 23000 Betalingen onderweg bij elkaar op. Dat is exact de formule achter het Huidig saldo in Yuki, nagerekend op twee verschillende momenten.
- De omweg uit v1.0.3 is vervallen. Die berekende het geagendeerde deel als saldo 16000 min de openstaande crediteuren, maar zodra een factuur in een betaalbatch gaat verlaat hij 16000 en komt hij op 23000 te staan. Die twee bleven dus altijd gelijk en het verschil was bijna nul. Daardoor stond het banksaldo een kleine twintigduizend te hoog.
- Rekening 23000 staat in de 2-reeks en viel om die reden buiten de oude optelling. Yuki toont dat saldo in het banksaldo-scherm onder de kop Interne overboekingen onderweg, terwijl het in het grootboek Betalingen onderweg heet.
- De noot onder de tegel Banksaldo vermeldt voortaan hoeveel er aan betalingen onderweg af is, in plaats van de vaste tekst na geplande betalingen.
- Nieuwe voetnoot onder Liquiditeit, met uitleg waarom je bankapp hoger staat dan dit cijfer en wat het betekent als dat verschil oploopt.
- Werkkapitaal en het banksaldoverloop in de grafiek volgen dezelfde formule, ook voor de historische maandeindes. De opbouwstrook toont nu een echt banksaldo, zonder verstopt stuk leveranciersschuld.
- De vuller haalde per maandeinde de openstaande crediteuren apart op. Dat is niet meer nodig en scheelt ruim twintig SOAP-aanroepen per run.
- Vereist het bijwerken van de Edge Function. Geen SQL.

## v1.0.3 — 21-07-2026
- Banksaldo toont voortaan het vrij besteedbare saldo. De Yuki-vuller trekt de creditcard (grootboek 15000) en het geagendeerde deel van de leveranciersschuld af (saldo 16000 min de openstaande crediteuren). De app volgt daarmee het Huidig saldo van Yuki. Geplande betalingen waarvan de inkoopfactuur nog niet is ingeboekt kan de Yuki-API niet zien; dat restverschil verdwijnt zodra die facturen zijn geboekt.
- Werkkapitaal en het banksaldo-verloop in de grafiek rekenen op dezelfde manier, ook voor historische maandeindes.
- Label bij de banksaldo-tegel gewijzigd van "stand vandaag" naar "na geplande betalingen".
- Tweede dagelijkse verversing om 12:00 naast de bestaande om 07:00. Voetnoot onder Omzet & resultaat hierop aangepast.

## v1.0.2 — 21-07-2026
- Werkvoorraad-sync verplaatst van maandagochtend naar dinsdagochtend. Maud werkt maandagmiddag op kantoor. Met de oude maandagochtend-sync belandde haar administratie pas een week later in de werkvoorraad. Nu staat haar maandagmiddag de volgende ochtend al in het dashboard.

## v1.0.1 — 17-07-2026
- Voetnoot onder het blok Omzet & resultaat: de cijfers zijn de stand van de ochtendverversing en Yuki Monitor telt de afschrijving van de lopende maand alvast mee, waardoor het resultaat hier tijdens de maand iets hoger ligt. Vergelijken met Yuki doe je het zuiverst in de ochtend.

## v1.0.0 — 15-07-2026
- Eerste versienummer voor de financieel-app, zichtbaar in de kopregel.
- Nieuw blok Werkvoorraad: totalen (aanneemsom, nog te maken uren, aantal projecten) en de projectlijst uit Yoobi, gesorteerd op einddatum. Gevoed door de tabel `fin_werkvoorraad`, die elke maandagochtend automatisch wordt ververst door de Edge Function `fin-werkvoorraad-sync`.
- Voetnoot toont hoeveel interne of al lang verlopen Yoobi-projecten buiten de telling vallen.
