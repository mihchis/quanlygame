import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDefmu-wr7MRT8x6MRasDtWdkuawNXo38I",
  authDomain: "quanlygame-961f0.firebaseapp.com",
  projectId: "quanlygame-961f0",
  storageBucket: "quanlygame-961f0.firebasestorage.app",
  messagingSenderId: "15397604948",
  appId: "1:15397604948:web:7de466ffdf74a55fade7c1",
};

// Check if config is valid
const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "your_api_key";

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = isConfigValid ? getAuth(app) : null as any;
const db = isConfigValid ? getFirestore(app) : null as any;

if (!isConfigValid) {
  console.warn("Firebase configuration is missing or invalid. Please check your .env.local file.");
}

export { auth, db, isConfigValid };
