/* sw.js — service worker van de Schilders Calc-suite
   v0.1.0, 16-09-2026. Doet één ding: pushberichten ontvangen en als melding
   tonen, en bij een tik op de melding de juiste pagina openen.
   Geen caching: de pagina's komen altijd live van GitHub Pages. */

const SW_VERSION = 'v0.1.0';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/* Elke push MOET een zichtbare melding opleveren. iOS trekt het abonnement
   in als er pushes binnenkomen zonder melding. Daarom altijd een terugval-
   tekst als de inhoud ontbreekt of niet leesbaar is. */
self.addEventListener('push', (event) => {
  let inhoud = {};
  try {
    inhoud = event.data ? event.data.json() : {};
  } catch (e) {
    inhoud = { tekst: event.data ? event.data.text() : '' };
  }
  const titel = inhoud.titel || 'Schilders Calc';
  const opties = {
    body: inhoud.tekst || 'Er is een nieuwe melding.',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: inhoud.tag || undefined,
    data: { url: inhoud.url || './taken.html' }
  };
  event.waitUntil(self.registration.showNotification(titel, opties));
});

/* Tik op de melding: bestaand venster van de app naar voren halen,
   anders de pagina openen. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const doel = new URL((event.notification.data && event.notification.data.url) || './taken.html', self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((vensters) => {
      for (const v of vensters) {
        if (v.url.indexOf(self.registration.scope) === 0 && 'focus' in v) {
          if (v.url !== doel && 'navigate' in v) v.navigate(doel);
          return v.focus();
        }
      }
      return self.clients.openWindow(doel);
    })
  );
});
