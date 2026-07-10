// Firebase client — Firestore (site content and enquiries).
// The web config below is public by design; security comes from Firestore rules
// and Firebase Auth, not from hiding these identifiers.
//
// Auth deliberately lives in ./auth (admin-only): importing firebase/auth here
// shipped ~250 KB of login machinery to every public visitor.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyC75KOofn4DBajf_zkESH7f8bft65EDsxs",
  authDomain: "lk-chemicals-webiste.firebaseapp.com",
  projectId: "lk-chemicals-webiste",
  storageBucket: "lk-chemicals-webiste.firebasestorage.app",
  messagingSenderId: "1005832126462",
  appId: "1:1005832126462:web:aa260afa3cabfcf1dccaaf",
  measurementId: "G-GF53GRYMW2",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export { app };
