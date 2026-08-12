// ================================================================
// CONFIGURATION CENTRALISÉE ARVEXA
// ================================================================

var APP_CONFIG = {

  // 🔗 Lien vers l'admin
  ADMIN_URL: 'https://nexgen-39043.web.app/admin',

  // 📱 Contact WhatsApp
  CONTACT_WHATSAPP: '22798064667',

  // 💰 Seuils financiers
  MIN_DEPOSIT: 3000,
  MAX_DEPOSIT: 1000000,
  MIN_WITHDRAWAL: 1000,
  MAX_WITHDRAWAL: 50000,
  MAX_DEPOSITS_PER_DAY: 2,

  // 🏷️ Informations générales
  APP_NAME: 'ARVEXA',
  APP_VERSION: '1.0.0',

  // ============================================================
  // 🔔 FCM - Firebase Cloud Messaging
  // ============================================================
  FCM: {
    VAPID_KEY: 'BA8jFHMi3fNPkB4iAqib8GJnrq1_8KR2u_PyQjI2q5rp6rzmaGAsZ_aHm7TP1FqvXg4ZhOUBQUrQ6jpEf9qmrlM',
    ENABLED: true
  },

  // ============================================================
  // 🎯 FORUM - Configuration
  // ============================================================
  FORUM: {
    COLLECTION: 'messages_groupe',
    MAX_MESSAGES: 100,
    CACHE_DURATION: 5
  },

  // ============================================================
  // 💬 MESSAGES PRIVÉS
  // ============================================================
  PRIVATE_CHAT: {
    COLLECTION: 'messages_prives'
  },

  // ============================================================
  // 💸 RETRAIT - Configuration
  // ============================================================
  RETRAIT: {
    MIN_AMOUNT: 1000,
    MAX_AMOUNT: 50000,
    FEES: {
      TIER_1: { max: 10000, rate: 0.05 },
      TIER_2: { max: 25000, rate: 0.04 },
      TIER_3: { max: Infinity, rate: 0.03 }
    }
  },

  // ============================================================
  // 🏆 DÉFIS - Configuration
  // ============================================================
  DEFIS: {
    TOTAL_REWARD: 300,
    DEFIS: [
      { id: 'lundi', reward: 40, scoreRequis: 7 },
      { id: 'mardi', reward: 50, scoreRequis: 7 },
      { id: 'mercredi', reward: 60, scoreRequis: 8 },
      { id: 'jeudi', reward: 70, scoreRequis: 7 },
      { id: 'vendredi', reward: 80, scoreRequis: 8 }
    ]
  },

  // ============================================================
  // 🛒 BOUTIQUE - Configuration
  // ============================================================
  BOUTIQUE: {
    COMMISSION: 0,
    MIN_PRICE: 100,
    MAX_PRICE: 1000000,
    CATEGORIES: ['formation', 'ebook', 'service', 'template', 'logiciel', 'autre']
  },

  // ============================================================
  // 🔔 NOTIFICATIONS
  // ============================================================
  NOTIFICATIONS: {
    TELEGRAM_ENABLED: false,
    WHATSAPP_ENABLED: true
  }
};

// ✅ Exporter pour utilisation (modules ES)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONFIG;
}

// ✅ Exporter pour utilisation dans le navigateur
if (typeof window !== 'undefined') {
  window.APP_CONFIG = APP_CONFIG;
}

console.log('📦 ARVEXA - Configuration chargée');
console.log('🔔 FCM VAPID Key:', APP_CONFIG.FCM.VAPID_KEY ? '✅ Configurée' : '❌ Manquante');