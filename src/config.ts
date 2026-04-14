import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore, collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if credentials are available
const app: FirebaseApp | null = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const db: Firestore | null = app ? getFirestore(app) : null;

export { db, collection, getDocs, doc, setDoc, deleteDoc, query, where };
