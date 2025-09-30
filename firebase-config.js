// firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrXBSKR63mDmDIjA18LntVfvEQmZAdcsA",
  authDomain: "dwarcrafts-marketplace.firebaseapp.com",
  projectId: "dwarcrafts-marketplace",
  storageBucket: "dwarcrafts-marketplace.appspot.com",
  messagingSenderId: "251525912015",
  appId: "1:251525912015:web:5f19e3963c4254e48beeba",
  measurementId: "G-C3L7WQE92C"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
