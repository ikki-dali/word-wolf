import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA4jX9k7LE8eDO8oWZiZmz2v2D5kpHs5pM",
  authDomain: "wordwolf-game-cd6ef.firebaseapp.com",
  databaseURL: "https://wordwolf-game-cd6ef-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wordwolf-game-cd6ef",
  storageBucket: "wordwolf-game-cd6ef.firebasestorage.app",
  messagingSenderId: "531293219970",
  appId: "1:531293219970:web:615c6cd9784df52391d89b",
  measurementId: "G-4ZBQ434H0B"
};

// Initialize Firebase (avoid multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

export { app, database };
