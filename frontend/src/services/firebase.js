import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMu-03xGEeXRn_ErIAYVlo9jllKsSXAz4",
  authDomain: "doctors--call.firebaseapp.com",
  projectId: "doctors--call",
  storageBucket: "doctors--call.firebasestorage.app",
  messagingSenderId: "810346788752",
  appId: "1:810346788752:web:a21d27f5309c2666cfa515",
  measurementId: "G-HJ0FJB93YV",
  databaseURL: "https://doctors--call-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getDatabase(app);

export { app, analytics, db };
