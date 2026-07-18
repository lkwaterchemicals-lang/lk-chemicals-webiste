// Firebase client — Firestore (site content and enquiries).
// The web config below is public by design; security comes from Firestore rules
// and Firebase Auth, not from hiding these identifiers.
//
// Auth deliberately lives in ./auth (admin-only): importing firebase/auth here
// shipped ~250 KB of login machinery to every public visitor.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { firebaseConfig } from "./config";

// Public site code must not import this module statically — go through
// ./lite (deferred) instead, or the SDK lands back in the first-load bundle.
export { firebaseConfig };

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export { app };
