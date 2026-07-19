// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyBEbYuuUlNCLMBUHClv4UnyownNHw2q3_g",
  authDomain: "nexgen-39043.firebaseapp.com",
  projectId: "nexgen-39043",
  storageBucket: "nexgen-39043.firebasestorage.app",
  messagingSenderId: "619390144325",
  appId: "1:619390144325:web:35d96b125501e4e8b1782c",
  measurementId: "G-HC2Q5DNKDR"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 🔑 VOTRE CLÉ VAPID
const VAPID_KEY = "BA8jFHMi3fNPkB4iAqib8GJnrq1_8KR2u_PyQjI2q5rp6rzmaGAsZ_aHm7TP1FqvXg4ZhOUBQUrQ6jpEf9qmrlM";

export { app, messaging, getToken, onMessage, VAPID_KEY };
