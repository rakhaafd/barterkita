// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBE1JbSuhhK11uI8mlvol-x3CkAU-ulgkQ",
  authDomain: "barterkita-30af9.firebaseapp.com",
  projectId: "barterkita-30af9",
  storageBucket: "barterkita-30af9.firebasestorage.app",
  messagingSenderId: "381152886945",
  appId: "1:381152886945:web:39cc3786d7fc51d16ef0e0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);