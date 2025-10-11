// firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // <- tambahkan ini

const firebaseConfig = {
  apiKey: "AIzaSyBE1JbSuhhK11uI8mlvol-x3CkAU-ulgkQ",
  authDomain: "barterkita-30af9.firebaseapp.com",
  projectId: "barterkita-30af9",
  storageBucket: "barterkita-30af9.firebasestorage.app",
  messagingSenderId: "381152886945",
  appId: "1:381152886945:web:39cc3786d7fc51d16ef0e0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // <- ekspor auth juga
