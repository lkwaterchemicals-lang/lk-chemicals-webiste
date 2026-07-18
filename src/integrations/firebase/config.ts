// Firebase project identifiers — public by design; security comes from
// Firestore rules and Firebase Auth, not from hiding these values.
//
// Kept in a leaf module (no SDK imports) so REST-based consumers
// (lib/firestore-rest, the sitemap route) can read the project id without
// dragging the whole Firebase SDK into their bundle.
export const firebaseConfig = {
  apiKey: "AIzaSyC75KOofn4DBajf_zkESH7f8bft65EDsxs",
  authDomain: "lk-chemicals-webiste.firebaseapp.com",
  projectId: "lk-chemicals-webiste",
  storageBucket: "lk-chemicals-webiste.firebasestorage.app",
  messagingSenderId: "1005832126462",
  appId: "1:1005832126462:web:aa260afa3cabfcf1dccaaf",
  measurementId: "G-GF53GRYMW2",
};
