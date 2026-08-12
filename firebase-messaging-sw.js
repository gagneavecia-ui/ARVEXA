// ================================================================
// FIREBASE SERVICE WORKER - Notifications Push ARVEXA
// ================================================================

importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging-compat.js');

// ✅ Configuration Firebase (identique à l'application)
const firebaseConfig = {
  apiKey: "AIzaSyBEbYuuUlNCLMBUHClv4UnyownNHw2q3_g",
  authDomain: "nexgen-39043.firebaseapp.com",
  projectId: "nexgen-39043",
  storageBucket: "nexgen-39043.firebasestorage.app",
  messagingSenderId: "619390144325",
  appId: "1:619390144325:web:35d96b125501e4e8b1782c",
  measurementId: "G-HC2Q5DNKDR"
};

// ✅ Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ================================================================
// RÉCEPTION DES NOTIFICATIONS EN ARRIÈRE-PLAN
// ================================================================
messaging.onBackgroundMessage((payload) => {
  console.log('📩 [Service Worker] Notification reçue en arrière-plan:', payload);

  const notificationTitle = payload.notification?.title || 'ARVEXA';
  const notificationBody = payload.notification?.body || 'Nouvelle notification';
  const notificationIcon = payload.notification?.icon || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
  const notificationImage = payload.notification?.image || '';
  const clickUrl = payload.data?.url || '/index.html';

  const options = {
    body: notificationBody,
    icon: notificationIcon,
    badge: notificationIcon,
    image: notificationImage || undefined,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: clickUrl,
      ...payload.data
    },
    tag: payload.data?.tag || Date.now().toString(),
    requireInteraction: true,
    actions: [
      { action: 'open', title: '📱 Ouvrir', icon: notificationIcon },
      { action: 'close', title: '❌ Fermer' }
    ]
  };

  // ✅ Afficher la notification
  self.registration.showNotification(notificationTitle, options);
});

// ================================================================
// GESTION DU CLIC SUR LA NOTIFICATION
// ================================================================
self.addEventListener('notificationclick', (event) => {
  console.log('📱 [Service Worker] Clic sur notification:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // ✅ Ouvrir l'URL ou la page par défaut
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
// INSTALLATION ET ACTIVATION
// ================================================================
self.addEventListener('install', (event) => {
  console.log('📦 [Service Worker] Installation...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ [Service Worker] Activation...');
  event.waitUntil(clients.claim());
});

console.log('🔔 [Service Worker] ARVEXA Service Worker prêt');