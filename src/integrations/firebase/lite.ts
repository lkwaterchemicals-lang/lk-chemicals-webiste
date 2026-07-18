// Deferred Firestore access for the public site.
//
// The Firestore Lite SDK (~140 KB min) used to sit in the home route's STATIC
// import graph, so the browser had to download and parse it before hydration
// could finish — a real slice of the first-load main-thread stall. Every
// public surface renders instantly from built-in fallbacks and only then
// tops itself up from Firestore, so nothing on screen ever needs the SDK
// synchronously. This loader turns it into an on-demand chunk fetched after
// hydration; the first caller triggers the import, everyone shares it.
//
// Usage: const { fs, db } = await firestoreLite();
//        await fs.getDocs(fs.collection(db, "products"));
import type { Firestore } from "firebase/firestore/lite";

export type FirestoreLite = typeof import("firebase/firestore/lite");

let loader: Promise<{ fs: FirestoreLite; db: Firestore }> | null = null;

export function firestoreLite() {
  loader ??= Promise.all([import("firebase/firestore/lite"), import("./client")]).then(
    ([fs, client]) => ({ fs, db: client.db }),
  );
  return loader;
}
