import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore/lite";
import fs from "fs";
import dotenv from "dotenv";

if (fs.existsSync(".env")) dotenv.config();
if (fs.existsSync(".env.local")) dotenv.config({ path: ".env.local" });

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  try {
    const d = await getDoc(doc(db, "pages", "home"));
    if (d.exists()) {
      console.log("DATA IN FIRESTORE:");
      console.log(JSON.stringify(d.data().stats, null, 2));
    } else {
      console.log("DOCUMENT DOES NOT EXIST");
    }
  } catch(e) {
    console.error("ERROR", e);
  }
}
run();
