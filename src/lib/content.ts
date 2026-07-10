// Firestore-backed site content.
//
// The CATALOG (categories, products, services) is fully admin-managed: these
// hooks render only what the dashboard has published — there is no built-in
// catalog fallback, so an empty Firestore yields an empty (not fabricated)
// catalog. Draft/archived records are hidden from the public site.
//
// Media (gallery), testimonials and site settings keep their built-in
// fallbacks (src/data/content.ts) so those surfaces never blank while the
// client fills them in.
import { useQuery } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { type Category, type Product, type ServiceCategory, type Service } from "@/data/products";
import {
  staticGallery,
  staticTestimonials,
  staticTeam,
  staticSettings,
  type GalleryItem,
  type Testimonial,
  type TeamMember,
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
    console.warn(`[content] falling back for ${name}:`, err);
    return fallback;
  }
}

/** Hide draft/archived records from the public site (missing status = live). */
const isLive = (r: { status?: string }) => r.status !== "draft" && r.status !== "archived";

const orderNum = (r: { order?: string; number?: string }) => Number(r.order ?? r.number ?? 0) || 0;

const common = {
  staleTime: 60_000,
  enabled: isBrowser,
  refetchOnWindowFocus: false,
  // Force an immediate background fetch even though initialData is present.
  initialDataUpdatedAt: 0,
} as const;

export function useCategories() {
  return useQuery({
    queryKey: ["content", "categories"],
    queryFn: async () => {
      const rows = await fetchCollection<Category>("categories", []);
      return rows
        .filter(isLive)
        .sort((a, b) => orderNum(a) - orderNum(b) || Number(a.number ?? 0) - Number(b.number ?? 0));
    },
    initialData: [] as Category[],
    ...common,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["content", "products"],
    queryFn: async () => {
      const rows = await fetchCollection<Product>("products", []);
      return rows
        .filter(isLive)
        .sort((a, b) => orderNum(a) - orderNum(b) || String(a.name).localeCompare(String(b.name)));
    },
    initialData: [] as Product[],
    ...common,
  });
}

export function useServiceCategories() {
  return useQuery({
    queryKey: ["content", "serviceCategories"],
    queryFn: async () => {
      const rows = await fetchCollection<ServiceCategory>("serviceCategories", []);
      return rows
        .filter(isLive)
        .sort((a, b) => orderNum(a) - orderNum(b) || Number(a.number ?? 0) - Number(b.number ?? 0));
    },
    initialData: [] as ServiceCategory[],
    ...common,
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["content", "services"],
    queryFn: async () => {
      const rows = await fetchCollection<Service>("services", []);
      return rows
        .filter(isLive)
        .sort((a, b) => orderNum(a) - orderNum(b) || String(a.name).localeCompare(String(b.name)));
    },
    initialData: [] as Service[],
    ...common,
  });
}

export type CareerOpening = {
  id?: string;
  slug?: string;
  title: string;
  department?: string;
  location?: string;
  type?: string;
  experience?: string;
  summary?: string;
  responsibilities?: string[];
  requirements?: string[];
  status?: string;
  order?: string;
};

export function useCareers() {
  return useQuery({
    queryKey: ["content", "careers"],
    queryFn: async () => {
      const rows = await fetchCollection<CareerOpening>("careers", []);
      return rows
        .filter(isLive)
        .sort(
          (a, b) => orderNum(a) - orderNum(b) || String(a.title).localeCompare(String(b.title)),
        );
    },
    initialData: [] as CareerOpening[],
    ...common,
  });
}

export function useTeam() {
  return useQuery({
    queryKey: ["content", "team"],
    queryFn: async () => {
      const rows = await fetchCollection<TeamMember>("team", staticTeam);
      return rows
        .filter(isLive)
        .sort((a, b) => orderNum(a) - orderNum(b) || String(a.name).localeCompare(String(b.name)));
    },
    initialData: staticTeam,
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
