// firebase-messaging-sw.js - Service Worker pour les notifications push
// À placer à la racine du site (ex: https://arvexa.com/firebase-messaging-sw.js)

importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging-compat.js');

// ================================================================
// CONFIGURATION FIREBASE - ARVEXA
// ================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBEbYuuUlNCLMBUHClv4UnyownNHw2q3_g",
  authDomain: "nexgen-39043.firebaseapp.com",
  projectId: "nexgen-39043",
  storageBucket: "nexgen-39043.firebasestorage.app",
  messagingSenderId: "619390144325",
  appId: "1:619390144325:web:35d96b125501e4e8b1782c",
  measurementId: "G-HC2Q5DNKDR"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ================================================================
// NOTIFICATION EN ARRIÈRE-PLAN (site fermé ou en arrière-plan)
// ================================================================
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Notification en arrière-plan reçue:', payload);

  const notificationTitle = payload.notification?.title || '💰 ARVEXA';
  const notificationBody = payload.notification?.body || 'Nouvelle notification';

  const notificationOptions = {
    body: notificationBody,
    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    vibrate: [200, 100, 200, 100, 300],
    sound: 'default',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: '📂 Ouvrir',
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      },
      {
        action: 'dismiss',
        title: '✕ Ignorer',
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      }
    ],
    requireInteraction: true,
    silent: false,
    tag: 'arvexa-notification',
    renotify: true
  };

  // Afficher la notification comme WhatsApp
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ================================================================
// GESTION DU CLIC SUR LA NOTIFICATION
// ================================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Déterminer la page de destination
  let urlToOpen = '/index.html';
  
  if (event.notification.data) {
    const data = event.notification.data;
    if (data.type === 'new_deposit' && data.click_action) {
      urlToOpen = data.click_action;
    } else if (data.type === 'new_deposit') {
      urlToOpen = '/admin/index.html';
    } else if (data.click_action) {
      urlToOpen = data.click_action;
    }
  }

  const url = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
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
  console.log('✅ Service Worker FCM installé');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker FCM activé');
  event.waitUntil(self.clients.claim());
});

console.log('🚀 ARVEXA - Service Worker FCM chargé');
