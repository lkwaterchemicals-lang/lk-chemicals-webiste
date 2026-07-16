import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC75KOofn4DBajf_zkESH7f8bft65EDsxs",
  authDomain: "lk-chemicals-webiste.firebaseapp.com",
  projectId: "lk-chemicals-webiste",
  storageBucket: "lk-chemicals-webiste.firebasestorage.app",
  messagingSenderId: "1005832126462",
  appId: "1:1005832126462:web:aa260afa3cabfcf1dccaaf",
};

const db = getFirestore(initializeApp(firebaseConfig));
const snap = await getDocs(collection(db, "serviceCategories"));
console.log("count:", snap.size);
for (const d of snap.docs) {
  const x = d.data();
  console.log(
    JSON.stringify({
      __id: d.id,
      slug: x.slug,
      number: x.number,
      name: x.name,
      iconName: x.iconName,
      status: x.status,
      featured: x.featured,
      parent: x.parent ?? null,
    }),
  );
}
process.exit(0);
