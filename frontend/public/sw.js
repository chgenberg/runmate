// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle push events
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'RunMate', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'Du har en ny notifikation från RunMate',
    icon: '/logo.png',
    badge: '/logo.png',
    image: data.image,
    data: data.data,
    tag: data.tag || 'runmate-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: 'view',
        title: 'Visa',
        icon: '/logo.png'
      },
      {
        action: 'dismiss',
        title: 'Stäng'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'RunMate', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Handle notification click
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const data = event.notification.data;
      
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          // Focus existing window and navigate if needed
          client.focus();
          if (data && data.url) {
            client.postMessage({ type: 'NAVIGATE', url: data.url });
          }
          return;
        }
      }
      
      // Open new window
      const urlToOpen = data && data.url ? 
        `${self.location.origin}${data.url}` : 
        self.location.origin;
      
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Handle any pending actions when back online
  console.log('Background sync triggered');
} 