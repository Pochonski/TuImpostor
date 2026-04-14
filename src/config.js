import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyDFtsBVQ2VN3jJZK_0Z5xAwg1gNQuvedH8",
  authDomain: "tuimpostor.firebaseapp.com",
  projectId: "tuimpostor",
  storageBucket: "tuimpostor.firebasestorage.app",
  messagingSenderId: "480796554047",
  appId: "1:480796554047:web:603650d2dd9bd08851d98a",
  measurementId: "G-ZH5DMSDYTD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs, doc, setDoc, deleteDoc, query, where };
