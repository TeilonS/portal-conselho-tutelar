import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "API_KEY_REMOVED",
  authDomain: "conselho-tutelar-2f88e.firebaseapp.com",
  projectId: "conselho-tutelar-2f88e",
  storageBucket: "conselho-tutelar-2f88e.firebasestorage.app",
  messagingSenderId: "1063421591986",
  appId: "1:1063421591986:web:ce74854f2a5219a3d9e4ab",
  measurementId: "G-RWYYYNT8MS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
