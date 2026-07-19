/* ================================================================
   ARVEXA - Firebase Cloud Messaging Service Worker
   ================================================================
   Ce fichier DOIT être à la racine du dépôt GitHub ARVEXA
   (https://github.com/gagneavecia-ui/ARVEXA) pour être accessible à
   l'URL : https://gagneavecia-ui.github.io/ARVEXA/firebase-messaging-sw.js

   Il gère :
   - L'enregistrement du SW par Firebase Messaging
   - La réception des notifications en arrière-plan (quand l'onglet est fermé)
   - Les clics sur les notifications (ouverture de la page correspondante)
   ================================================================ */

// Importer les scripts Firebase nécessaires dans le Service Worker
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging.js');

// Configuration Firebase (identique à celle des pages HTML)
var firebaseConfig = {
  apiKey: "AIzaSyBEbYuuUlNCLMBUHClv4UnyownNHw2q3_g",
  authDomain: "nexgen-39043.firebaseapp.com",
  projectId: "nexgen-39043",
  storageBucket: "nexgen-39043.firebasestorage.app",
  messagingSenderId: "619390144325",
  appId: "1:619390144325:web:35d96b125501e4e8b1782c",
  measurementId: "G-HC2Q5DNKDR"
};

// Initialiser Firebase dans le Service Worker
firebase.initializeApp(firebaseConfig);

// Récupérer l'instance Messaging
var messaging = firebase.messaging();

// ================================================================
// Gestion des messages en arrière-plan
// (quand le navigateur/navigateur mobile est en arrière-plan ou fermé)
// ================================================================
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Message en arrière-plan reçu :', payload);

  var notification = payload.notification || {};
  var data = payload.data || {};

  var title = notification.title || data.title || 'ARVEXA';
  var body = notification.body || data.body || 'Nouvelle notification';
  var icon = notification.icon || data.icon || 'icon.png';
  var badge = notification.badge || data.badge || 'icon.png';
  var tag = data.tag || 'arvexa-' + (data.type || 'default');
  var clickAction = notification.click_action || data.click_action || data.url || '/';

  var options = {
    body: body,
    icon: icon,
    badge: badge,
    tag: tag,
    data: {
      click_action: clickAction,
      type: data.type || 'default',
      amount: data.amount || '',
      userName: data.userName || '',
      productId: data.productId || '',
      timestamp: Date.now()
    },
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  // Couleur selon le type de notification
  if (data.type === 'daily_gain') {
    options.tag = 'arvexa-gain';
  } else if (data.type === 'deposit_confirmed') {
    options.tag = 'arvexa-deposit';
  } else if (data.type === 'withdrawal_confirmed') {
    options.tag = 'arvexa-withdrawal';
  } else if (data.type === 'new_referral') {
    options.tag = 'arvexa-referral';
  }

  return self.registration.showNotification(title, options);
});

// ================================================================
// Gestion des clics sur les notifications
// ================================================================
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Clic sur notification :', event);

  event.notification.close();

  var clickAction = '/';
  if (event.notification.data && event.notification.data.click_action) {
    clickAction = event.notification.data.click_action;
  }

  // Déterminer l'URL de base du site (utile pour GitHub Pages sous /ARVEXA/)
  var baseUrl = self.registration ? self.registration.scope : '/';

  // Si clickAction est une URL relative, la préfixer avec baseUrl
  var targetUrl = clickAction;
  if (clickAction && clickAction.charAt(0) === '/' && clickAction.indexOf('//') !== 0) {
    // Remplacer le slash initial par le baseUrl (qui se termine par /)
    targetUrl = baseUrl.replace(/\/$/, '') + clickAction;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Chercher un onglet existant sur le site ARVEXA
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf('ARVEXA') !== -1 && 'focus' in client) {
          if (targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Sinon, ouvrir un nouvel onglet
      if (clients.openWindow) {
        return clients.openWindow(targetUrl || baseUrl);
      }
    })
  );
});

// ================================================================
// Activation du Service Worker
// ================================================================
self.addEventListener('activate', function(event) {
  console.log('[firebase-messaging-sw.js] Service Worker activé');
  event.waitUntil(self.clients.claim());
});

// ================================================================
// Installation du Service Worker
// ================================================================
self.addEventListener('install', function(event) {
  console.log('[firebase-messaging-sw.js] Service Worker installé');
  self.skipWaiting();
});

console.log('[firebase-messaging-sw.js] Service Worker chargé');
