# Changelog — financieel.html

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
