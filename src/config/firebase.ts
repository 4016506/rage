import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase configuration
// Get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyCF7b6Y_u-fj2VtoqsYOJV81mOW_loaP6Q",
    authDomain: "rage-e4ee5.firebaseapp.com",
    projectId: "rage-e4ee5",
    storageBucket: "rage-e4ee5.firebasestorage.app",
    messagingSenderId: "555126422930",
    appId: "1:555126422930:web:5e0f30d0a2f1a7d494554b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;

