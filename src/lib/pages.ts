// Firestore-backed editable page content with built-in fallbacks.
//
// Each hook mirrors useSiteSettings in src/lib/content.ts: it resolves
// instantly with the built-in defaults from src/data/site.ts (so SSR and first
// paint never wait on Firestore), then shallow-merges the matching `pages/<id>`
// document over them when it exists. Missing fields keep their default, and an
// empty/unreachable Firestore keeps the built-ins entirely — the public site
// can never go blank.
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore/lite";
import { db } from "@/integrations/firebase/client";
import { stabilizeDeep } from "@/lib/assets";
import {
  globalContent,
  homeContent,
  aboutContent,
  servicesContent,
  productsContent,
  galleryContent,
  contactContent,
  type GlobalContent,
  type HomeContent,
  type AboutContent,
  type ServicesContent,
  type ProductsContent,
  type GalleryContent,
  type ContactContent,
} from "@/data/site";

const isBrowser = typeof window !== "undefined";

const common = {
  staleTime: 60_000,
  enabled: isBrowser,
  refetchOnWindowFocus: false,
  // Force an immediate background fetch even though initialData is present, so
  // admin edits show up while the built-ins still render instantly. See the
  // matching note in src/lib/content.ts.
  initialDataUpdatedAt: 0,
} as const;

function usePageDoc<T extends object>(id: string, fallback: T) {
  return useQuery({
    queryKey: ["content", "pages", id],
    queryFn: async (): Promise<T> => {
      try {
        const snap = await getDoc(doc(db, "pages", id));
        if (!snap.exists()) return fallback;
        // Shallow merge: a stored field (including arrays) replaces the default;
        // anything the admin hasn't touched stays on the built-in value.
        // stabilizeDeep heals docs saved with a since-rebuilt hashed asset URL
        // (e.g. /assets/plant-XXXX.jpg) by remapping them to /content/*.
        return stabilizeDeep({ ...fallback, ...(snap.data() as Partial<T>) });
      } catch (err) {
        console.warn(`[pages] falling back to built-in ${id}:`, err);
        return fallback;
      }
    },
    initialData: fallback,
    ...common,
  });
}

export const useGlobalContent = () => usePageDoc<GlobalContent>("global", globalContent);
export const useHomeContent = () => usePageDoc<HomeContent>("home", homeContent);
export const useAboutContent = () => usePageDoc<AboutContent>("about", aboutContent);
export const useServicesContent = () => usePageDoc<ServicesContent>("services", servicesContent);
export const useProductsContent = () => usePageDoc<ProductsContent>("products", productsContent);
export const useGalleryContent = () => usePageDoc<GalleryContent>("gallery", galleryContent);
export const useContactContent = () => usePageDoc<ContactContent>("contact", contactContent);
