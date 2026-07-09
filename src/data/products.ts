// Catalog data model.
//
// The catalog (categories + products) is created entirely from the admin
// dashboard and stored in Firestore. There is intentionally NO built-in or
// sample catalog here — the public hooks in src/lib/content.ts render whatever
// the admin has published. These types describe the full, scalable shape a
// record can take; every field beyond the core identity fields is optional and
// managed from the dashboard.

export type SpecRow = { name: string; value: string; unit?: string };
export type ProductDocument = { label: string; url: string; type?: string };

export type Status = "published" | "draft" | "archived";

export type Category = {
  slug: string;
  number: string; // controls display order (kept for backwards-compat)
  name: string;
  tagline: string;
  description: string;
  image: string;
  // Rich, admin-managed fields — all optional, created from the dashboard.
  parent?: string; // slug of the parent category (unlimited nesting)
  status?: Status;
  featured?: boolean;
  order?: string;
  banner?: string; // wide hero image for the category page
  iconName?: string; // Lucide icon name (see src/lib/icons.ts)
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string; // slug of the owning category
  description: string;
  features: string[];
  applications: string[];
  packing: string[];
  /** Optional product photo — falls back to the category image when absent. */
  image?: string;
  // Rich, admin-managed fields — all optional, created from the dashboard.
  price?: string; // display string, e.g. "₹2,400 / 25 L drum"
  subcategory?: string;
  status?: Status;
  featured?: boolean;
  order?: string;
  specifications?: SpecRow[];
  gallery?: string[];
  documents?: ProductDocument[];
  related?: string[]; // slugs of related products
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
};

/* --------------------------------------------------------------- services */
// Services mirror the catalog: top-level ServiceCategory records that each own
// unlimited Service records. Like the catalog, everything is admin-managed and
// stored in Firestore — there is no built-in seed here.

export type FaqItem = { q: string; a: string };
export type ProcessStep = { title: string; body: string };

export type ServiceCategory = {
  slug: string;
  number: string; // controls display order
  name: string;
  tagline: string;
  description: string;
  image: string; // cover image
  parent?: string; // slug of a parent service category (optional nesting)
  status?: Status;
  featured?: boolean;
  order?: string;
  banner?: string; // wide hero image for the category page
  iconName?: string; // Lucide icon name (see src/lib/icons.ts)
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
};

export type Service = {
  slug: string;
  name: string;
  serviceCategory: string; // slug of the owning service category
  description: string;
  /** Optional service photo — falls back to the category image when absent. */
  image?: string;
  status?: Status;
  featured?: boolean;
  order?: string;
  highlights?: string[]; // "what's included" bullet points
  gallery?: string[];
  documents?: ProductDocument[];
  faqs?: FaqItem[];
  process?: ProcessStep[];
  related?: string[]; // slugs of related services
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
};

// No built-in catalog. Everything is created in the admin dashboard.
export const categories: Category[] = [];
export const products: Product[] = [];

export const productsIn = (slug: string) => products.filter((p) => p.category === slug);
export const findProduct = (slug: string) => products.find((p) => p.slug === slug);
