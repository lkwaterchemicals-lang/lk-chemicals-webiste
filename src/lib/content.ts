// Firestore-backed site content with built-in fallbacks.
//
// Every hook resolves instantly with the static content (so SSR and first
// paint never wait on Firestore), then swaps in Firestore data when the
// collection has documents. Empty or unreachable collections keep the
// built-in content — the public site can never go blank.
import { useQuery } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { categories as staticCategories, products as staticProducts, type Category, type Product } from "@/data/products";
import {
  staticServices,
  staticGallery,
  staticTestimonials,
  staticSettings,
  type Service,
  type GalleryItem,
  type Testimonial,
  type SiteSettings,
} from "@/data/content";

const isBrowser = typeof window !== "undefined";

async function fetchCollection<T>(name: string, fallback: T[], order?: string): Promise<T[]> {
  try {
    const ref = collection(db, name);
    const snap = await getDocs(order ? query(ref, orderBy(order)) : ref);
    if (snap.empty) return fallback;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
  } catch (err) {
    console.warn(`[content] falling back to built-in ${name}:`, err);
    return fallback;
  }
}

const common = {
  staleTime: 60_000,
  enabled: isBrowser,
  refetchOnWindowFocus: false,
  // Without this, React Query treats `initialData` (the built-in content) as
  // fresh for `staleTime` and never fetches Firestore on mount. Marking it as
  // updated at epoch 0 forces an immediate background fetch, so admin edits
  // show up while the built-ins still render instantly.
  initialDataUpdatedAt: 0,
} as const;

export function useCategories() {
  return useQuery({
    queryKey: ["content", "categories"],
    queryFn: () => fetchCollection<Category>("categories", staticCategories, "number"),
    initialData: staticCategories,
    ...common,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["content", "products"],
    queryFn: () => fetchCollection<Product>("products", staticProducts),
    initialData: staticProducts,
    ...common,
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["content", "services"],
    queryFn: () => fetchCollection<Service>("services", staticServices, "n"),
    initialData: staticServices,
    ...common,
  });
}

export function useGalleryItems() {
  return useQuery({
    queryKey: ["content", "gallery"],
    queryFn: () => fetchCollection<GalleryItem>("gallery", staticGallery),
    initialData: staticGallery,
    ...common,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["content", "testimonials"],
    queryFn: () => fetchCollection<Testimonial>("testimonials", staticTestimonials),
    initialData: staticTestimonials,
    ...common,
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["content", "settings"],
    queryFn: async (): Promise<SiteSettings> => {
      try {
        const snap = await getDoc(doc(db, "settings", "site"));
        if (!snap.exists()) return staticSettings;
        return { ...staticSettings, ...(snap.data() as Partial<SiteSettings>) };
      } catch (err) {
        console.warn("[content] falling back to built-in settings:", err);
        return staticSettings;
      }
    },
    initialData: staticSettings,
    ...common,
  });
}
