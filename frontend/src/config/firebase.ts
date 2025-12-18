import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBzGwtVuVAnfxzSjRiR8l3MfnJbWqEQwLo",
    authDomain: "hatchworks-ai-prod.firebaseapp.com",
    projectId: "hatchworks-ai-prod",
    storageBucket: "hatchworks-ai-prod.firebasestorage.app",
    messagingSenderId: "970945758078",
    appId: "1:970945758078:web:4c2eec0f3eccc416e0692f",
    measurementId: "G-5XPNZ0W9C3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;