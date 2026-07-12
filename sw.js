// ================================================================
// ARVEXA - Service Worker
// Version: 1.0.0
// ================================================================

const CACHE_NAME = 'arvexa-cache-v1';
const OFFLINE_URL = 'offline.html';

// ================================================================
// FICHIERS À METTRE EN CACHE
// ================================================================
const urlsToCache = [
  // Pages principales
  'index.html',
  'login.html',
  'register.html',
  'confiance.html',
  'investir.html',
  'recharger.html',
  'retrait.html',
  'activite.html',
  'profil.html',
  'avis.html',
  'vendre.html',
  'parrainage.html',
  'boutique.html',
  
  // Styles et polices
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
  
  // Firebase SDK
  'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js',
  
  // Images des opérateurs (si utilisées)
  'images.png',
  'images1.png',
  'images2.png',
  'images3.png',
  'images4.png',
  'images5.png',
  
  // Icône
  'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
];

// ================================================================
// INSTALLATION
// ================================================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des fichiers...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Installation terminée');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Erreur d\'installation:', error);
      })
  );
});

// ================================================================
// ACTIVATION
// ================================================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation terminée');
        return self.clients.claim();
      })
  );
});

// ================================================================
// INTERCEPTION DES REQUÊTES - STRATÉGIE : Cache First
// ================================================================
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorer les requêtes Firebase (Auth, Firestore)
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('googleapis') ||
      url.hostname.includes('gstatic')) {
    event.respondWith(fetch(request));
    return;
  }

  // Ignorer les requêtes POST
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // Ignorer les requêtes analytics
  if (url.pathname.includes('analytics')) {
    event.respondWith(fetch(request));
    return;
  }

  // Stratégie : Cache First avec fallback réseau
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Si la ressource est en cache, la retourner
          // et mettre à jour le cache en arrière-plan
          event.waitUntil(
            fetch(request)
              .then((networkResponse) => {
                return caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                  });
              })
              .catch(() => {
                // Ignorer les erreurs réseau en arrière-plan
              })
          );
          return cachedResponse;
        }

        // Si la ressource n'est pas en cache, la chercher sur le réseau
        return fetch(request)
          .then((networkResponse) => {
            // Mettre en cache la réponse pour la prochaine fois
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
            return networkResponse;
          })
          .catch(() => {
            // Si hors ligne et pas de cache, retourner la page hors ligne
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
            // Pour les autres ressources, retourner une erreur
            return new Response('Ressource non disponible hors ligne', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// ================================================================
// GESTION DES NOTIFICATIONS PUSH
// ================================================================
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notification push reçue');
  
  let data = {
    title: 'ARVEXA',
    body: 'Une nouvelle mise à jour est disponible',
    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    badge: data.badge || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/index.html'
    },
    actions: [
      {
        action: 'open',
        title: 'Voir',
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ================================================================
// CLIC SUR NOTIFICATION
// ================================================================
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clic sur notification');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focus
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ================================================================
// SYNC EN ARRIÈRE-PLAN
// ================================================================
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync en arrière-plan:', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  console.log('[Service Worker] Synchronisation des transactions...');
  // Ici vous pouvez ajouter la logique de synchronisation
  // avec IndexedDB et Firestore
  return Promise.resolve();
}

// ================================================================
// MESSAGES DU CLIENT
// ================================================================
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message reçu:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ================================================================
// LOGS
// ================================================================
console.log('[Service Worker] ARVEXA Service Worker chargé');
