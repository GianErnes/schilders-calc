# Changelog — financieel.html

## v1.0.0 — 15-07-2026
- Eerste versienummer voor de financieel-app, zichtbaar in de kopregel.
- Nieuw blok Werkvoorraad: totalen (aanneemsom, nog te maken uren, aantal projecten) en de projectlijst uit Yoobi, gesorteerd op einddatum. Gevoed door de tabel `fin_werkvoorraad`, die elke maandagochtend automatisch wordt ververst door de Edge Function `fin-werkvoorraad-sync`.
- Voetnoot toont hoeveel interne of al lang verlopen Yoobi-projecten buiten de telling vallen.
