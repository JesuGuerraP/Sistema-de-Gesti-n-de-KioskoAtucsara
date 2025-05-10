// src/firebaseConfig.js (modificado)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB8kT3Qn6LbI63ycsSa0xZUq9VUGujZSgg",
  authDomain: "ventasatucsara.firebaseapp.com",
  projectId: "ventasatucsara",
  storageBucket: "ventasatucsara.firebasestorage.app",
  messagingSenderId: "141811837605",
  appId: "1:141811837605:web:9a98cd859adcb78de5bb4c"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Referencias a colecciones
const getCollectionRef = (collectionName) => collection(db, collectionName);

export { db, auth, getCollectionRef };