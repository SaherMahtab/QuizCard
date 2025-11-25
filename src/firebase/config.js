//import { initializeApp } from 'firebase/app';
//import { getAuth } from 'firebase/auth';
//import { getFirestore } from 'firebase/firestore';
//
//const firebaseConfig = {
//  apiKey: "AIzaSyDTw85qrwFPZbkJzte7DDa3xov7KOK1V20",
//  authDomain: "quizcard-38894.firebaseapp.com",
//  projectId: "quizcard-38894",
//  storageBucket: "quizcard-38894.firebasestorage.app",
//  messagingSenderId: "87413971882",
//  appId: "1:87413971882:web:024a747b663661b40de9d3",
//  measurementId: "G-QF8N9WL31S"
//};
//
//// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//
//// Initialize services
//export const auth = getAuth(app);
//export const db = getFirestore(app);
//
//export default app;


import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;