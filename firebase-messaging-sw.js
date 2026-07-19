// ================================================================
// FIREBASE SERVICE WORKER - Notifications Push
// ================================================================

importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging-compat.js');

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

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'ARVEXA';
  const notificationBody = payload.notification?.body || 'Nouvelle notification';
  const notificationIcon = payload.notification?.icon || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: notificationIcon,
    badge: notificationIcon,
    vibrate: [200, 100, 200, 100, 200],
    data: payload.data || {},
    tag: payload.data?.tag || Date.now().toString(),
    requireInteraction: true,
    actions: [
      { action: 'open', title: '📱 Ouvrir' },
      { action: 'close', title: '❌ Fermer' }
    ]
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open') {
    event.waitUntil(clients.openWindow('/index.html'));
  }
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

console.log('📱 Service Worker ARVEXA prêt');
