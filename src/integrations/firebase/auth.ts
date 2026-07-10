// Firebase Auth — imported ONLY from admin code. Keeping this out of
// client.ts keeps firebase/auth (~250 KB) off the public site's critical
// path; it loads with the lazy admin route chunks instead.
import { getAuth } from "firebase/auth";
import { app } from "./client";

export const auth = getAuth(app);
