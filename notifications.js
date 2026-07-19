// notifications.js
import { messaging, getToken, onMessage, VAPID_KEY } from './firebase-config.js';
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc,
  updateDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

// ================================================================
// SETUP - Initialisation des notifications pour l'admin
// ================================================================
export async function setupNotifications() {
  try {
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications non supportées');
      return null;
    }

    const user = auth.currentUser;
    if (!user) {
      console.warn('⚠️ Utilisateur non connecté');
      return null;
    }

    // Vérifier si c'est l'admin
    const isAdmin = user.email === 'gagneavecia@gmail.com';
    if (!isAdmin) {
      console.log('🔕 Notifications réservées à l\'admin');
      return null;
    }

    // Demander la permission
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      console.warn('⚠️ Permission refusée');
      return null;
    }

    // Obtenir le token FCM
    console.log('📱 Obtention du token FCM...');
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('✅ Token FCM:', token);

    // Sauvegarder dans Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      fcmToken: token,
      isAdmin: true,
      notificationsEnabled: true,
      lastNotifUpdate: serverTimestamp()
    }).catch(async () => {
      await setDoc(userRef, {
        fcmToken: token,
        isAdmin: true,
        notificationsEnabled: true,
        lastNotifUpdate: serverTimestamp()
      }, { merge: true });
    });

    return token;
  } catch (error) {
    console.error('❌ Erreur setupNotifications:', error);
    return null;
  }
}

// ================================================================
// ÉCOUTE - Messages en premier plan
// ================================================================
export function listenForMessages() {
  return onMessage(messaging, (payload) => {
    console.log('📩 Message reçu en premier plan:', payload);

    const title = payload.notification?.title || payload.data?.title || 'ARVEXA';
    const body = payload.notification?.body || payload.data?.body || '';
    const type = payload.data?.type || 'info';
    const url = payload.data?.url || '/index.html';

    // Notification système
    if (Notification.permission === 'granted') {
      const options = {
        body: body,
        icon: '/favicon.ico',
        data: { url: url },
        requireInteraction: true,
        vibrate: [200, 100, 200]
      };
      const notification = new Notification(title, options);
      notification.onclick = () => {
        notification.close();
        window.location.href = url;
      };
    }

    // Toast dans l'application
    showToastNotification(title, body, type);

    // Traitement des types spécifiques
    handleNotificationType(type, payload.data);
  });
}

// ================================================================
// TYPES DE NOTIFICATIONS
// ================================================================
function handleNotificationType(type, data) {
  switch (type) {
    case 'new_deposit':
      const amount = data?.amount || '0';
      const userName = data?.userName || 'Utilisateur';
      showToastNotification(
        '💰 Nouveau dépôt',
        `${userName} - ${parseInt(amount).toLocaleString('fr-FR')} FCFA`,
        'success'
      );
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      break;

    case 'investment_gain':
      showToastNotification(
        '📈 Gain reçu',
        `${data?.amount || 0} FCFA ajoutés à votre solde`,
        'success'
      );
      break;

    case 'new_referral':
      showToastNotification(
        '👥 Nouveau filleul',
        `${data?.userName || 'Quelqu\'un'} s'est inscrit avec votre code !`,
        'success'
      );
      break;

    default:
      break;
  }
}

// ================================================================
// TOAST DANS L'APPLICATION
// ================================================================
function showToastNotification(title, message, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message || title;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ================================================================
// ENVOI DE NOTIFICATIONS (Admin)
// ================================================================
export async function sendNotificationToUser(userId, title, body, data = {}) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.error('❌ Utilisateur introuvable');
      return false;
    }

    const notifRef = doc(db, 'notifications', `${userId}_${Date.now()}`);
    await setDoc(notifRef, {
      userId: userId,
      title: title,
      body: body,
      data: data,
      read: false,
      createdAt: serverTimestamp(),
      type: data.type || 'info',
      sent: true
    });

    return true;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
}

export async function sendNotificationToAll(title, body, data = {}) {
  try {
    const notifRef = doc(db, 'notifications', `global_${Date.now()}`);
    await setDoc(notifRef, {
      title: title,
      body: body,
      data: data,
      read: false,
      createdAt: serverTimestamp(),
      type: data.type || 'info',
      sent: true,
      target: 'all'
    });
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
}

// ================================================================
// LECTURE DES NOTIFICATIONS
// ================================================================
export async function getUnreadNotifications(userId) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    return notifications;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return [];
  }
}

export async function markNotificationRead(notificationId) {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
}
