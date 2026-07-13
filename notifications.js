// notifications.js - Gestion des notifications FCM
// À placer dans le dossier racine

import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging.js";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// VAPID Key
const VAPID_KEY = "BJKkMr-LMevY9HePx3vzYqWMILwAV8mxwOdfkbR-PvEu_m7eu309ygioDNLLqW1wRc2b93Irb1svNnLQIpegquk";

// ================================================================
// DEMANDER LA PERMISSION ET ENREGISTRER LE TOKEN
// ================================================================
export async function setupNotifications(user, db, messaging) {
  if (!user) return null;
  
  try {
    // 1. Vérifier si c'est l'admin
    const isAdmin = user.email === 'gagneavecia@gmail.com';
    
    // 2. Demander la permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('⚠️ Permission notification refusée');
      return null;
    }
    
    console.log('✅ Permission notification accordée');
    
    // 3. Obtenir le token FCM
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('📱 Token FCM:', token);
    
    // 4. Sauvegarder dans Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      fcmToken: token,
      notificationsEnabled: true,
      isAdmin: isAdmin
    });
    
    console.log('✅ Token FCM sauvegardé');
    return token;
    
  } catch (error) {
    console.error('❌ Erreur setup notifications:', error);
    return null;
  }
}

// ================================================================
// ÉCOUTER LES MESSAGES EN PREMIER PLAN
// ================================================================
export function listenMessages(messaging, callback) {
  onMessage(messaging, (payload) => {
    console.log('📩 Message reçu en premier plan:', payload);
    
    if (callback) {
      callback(payload);
    }
    
    // Notification de nouveau dépôt
    if (payload.data?.type === 'new_deposit') {
      const userName = payload.data.userName || 'Utilisateur';
      const amount = payload.data.amount || '0';
      
      // Vibration
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      
      // Afficher une alerte
      if (payload.notification) {
        // La notification s'affiche déjà
      }
    }
  });
}

// ================================================================
// ENVOYER UNE NOTIFICATION À L'ADMIN (depuis la page utilisateur)
// ================================================================
export async function sendAdminNotification(db, depositData) {
  try {
    // Récupérer les tokens des admins
    const adminQuery = query(
      collection(db, 'users'),
      where('isAdmin', '==', true),
      where('notificationsEnabled', '==', true)
    );
    
    const adminSnapshot = await getDocs(adminQuery);
    
    if (adminSnapshot.empty) {
      console.log('⚠️ Aucun admin avec notifications activées');
      return;
    }
    
    // Enregistrer la notification dans Firestore
    await addDoc(collection(db, 'notifications'), {
      type: 'deposit_pending',
      title: `💰 Nouveau dépôt - ${depositData.montant.toLocaleString('fr-FR')} FCFA`,
      body: `${depositData.userName} - ID: ${depositData.displayId}`,
      userId: depositData.userId,
      userName: depositData.userName,
      amount: depositData.montant,
      depositId: depositData.id,
      read: false,
      createdAt: new Date().toISOString(),
      target: 'admin'
    });
    
    console.log('✅ Notification admin enregistrée dans Firestore');
    
    // Pour les tokens FCM, ils seront utilisés par les Cloud Functions
    // ou par le panel admin qui écoute les notifications
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur envoi notification admin:', error);
    return false;
  }
}

// ================================================================
// METTRE À JOUR LE STATUT DES NOTIFICATIONS
// ================================================================
export function updateNotificationStatus(enabled, notifBadge, notifStatusText) {
  if (!notifBadge || !notifStatusText) return;
  
  if (enabled) {
    notifBadge.className = 'notif-badge active';
    notifStatusText.textContent = '🔔 Notifications actives';
  } else {
    notifBadge.className = 'notif-badge inactive';
    notifStatusText.textContent = '🔕 Notifications désactivées';
  }
  }
