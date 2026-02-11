// Spark Mastery Service Worker
// Handles push notifications and offline caching

const SW_VERSION = '1.0.0';

self.addEventListener('install', (event) => {
  console.log(`[SW] Installing v${SW_VERSION}`);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`[SW] Activated v${SW_VERSION}`);
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json?.() || {};
  const title = data.title || 'Spark Mastery';
  const options = {
    body: data.body || 'Time to level up your habits!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'spark-mastery',
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
