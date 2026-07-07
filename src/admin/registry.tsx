// Module registry — one place that describes every content collection the
// admin manages: its Firestore shape, edit fields, seeds and public preview.
import type { LucideIcon } from "lucide-react";
import { Image as ImageIcon, LayoutGrid, Package, Quote, Wrench } from "lucide-react";
import { categories as staticCategories, products as staticProducts } from "@/data/products";
import { staticServices, staticGallery, staticTestimonials } from "@/data/content";

export type Row = Record<string, unknown> & { __id: string };

export type FieldType = "text" | "textarea" | "list" | "image" | "boolean" | "select";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  /** products/categories: auto-fill from this field via slugify while untouched */
  slugOf?: string;
};

export type ModuleDef = {
  id: string; // Firestore collection AND route segment
  label: string;
  singular: string;
  icon: LucideIcon;
  idField: string; // "" = random id
  titleField: string;
  subtitleField?: string;
  imageKey?: "image" | "img" | "src";
  order?: string;
  fields: FieldDef[];
  seed?: () => Record<string, unknown>[];
  publicPath?: (row: Row) => string | null;
};

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Seeded docs must not store Vite's hashed asset URLs (they change every
// build). The same images live at stable paths under /public/content, so
// remap bundle URLs to "/content/x.jpg" before writing to Firestore.
export function stableAssetUrl(url: unknown): unknown {
  if (typeof url !== "string" || url.startsWith("http") || url.startsWith("/content/")) return url;
  const base = url.split("?")[0].split("/").pop() ?? "";
  const m = base.match(/^(.+?)(?:-(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]{8})?\.(jpe?g|png|webp)$/i);
  return m ? `/content/${m[1]}.${m[2].toLowerCase() === "jpeg" ? "jpg" : m[2].toLowerCase()}` : url;
}

export function stabilizeAssets(item: Record<string, unknown>): Record<string, unknown> {
  const out = { ...item };
  for (const key of ["image", "img", "src"]) {
    if (key in out) out[key] = stableAssetUrl(out[key]);
  }
  return out;
}

export const MODULES: ModuleDef[] = [
  {
    id: "products",
    label: "Products",
    singular: "product",
    icon: Package,
    idField: "slug",
    titleField: "name",
    subtitleField: "category",
    imageKey: "image",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, placeholder: "LK 1001 High Silica RO Antiscalant" },
      { key: "slug", label: "Slug", type: "text", hint: "URL id — auto-generated from the name", slugOf: "name" },
      { key: "category", label: "Category", type: "select", options: [], required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "features", label: "Features", type: "list", hint: "One per line" },
      { key: "applications", label: "Applications", type: "list", hint: "One per line" },
      { key: "packing", label: "Packing options", type: "list", hint: "One per line" },
      { key: "image", label: "Product photo", type: "image", hint: "Optional — falls back to the category image" },
    ],
    seed: () => staticProducts.map((p) => ({ ...p })),
    publicPath: (r) => (r.slug ? `/products/${String(r.slug)}` : null),
  },
  {
    id: "categories",
    label: "Categories",
    singular: "category",
    icon: LayoutGrid,
    idField: "slug",
    titleField: "name",
    subtitleField: "tagline",
    imageKey: "image",
    order: "number",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", hint: "URL id — auto-generated from the name", slugOf: "name" },
      { key: "number", label: "Number", type: "text", required: true, hint: "01–99, controls display order" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Cover image", type: "image" },
    ],
    seed: () => staticCategories.map((c) => ({ ...c })),
    publicPath: (r) => (r.slug ? `/products?cat=${String(r.slug)}` : null),
  },
  {
    id: "services",
    label: "Services",
    singular: "service",
    icon: Wrench,
    idField: "n",
    titleField: "t",
    imageKey: "img",
    order: "n",
    fields: [
      { key: "n", label: "Number", type: "text", required: true, hint: "01–99, controls display order" },
      { key: "t", label: "Title", type: "text", required: true },
      { key: "body", label: "Description", type: "textarea" },
      { key: "img", label: "Image", type: "image" },
      { key: "inc", label: "What's included", type: "list", hint: "One per line" },
    ],
    seed: () => staticServices.map((s) => ({ ...s })),
    publicPath: () => "/services",
  },
  {
    id: "gallery",
    label: "Media",
    singular: "media item",
    icon: ImageIcon,
    idField: "",
    titleField: "alt",
    subtitleField: "cat",
    imageKey: "src",
    fields: [
      { key: "src", label: "Image", type: "image", required: true },
      { key: "alt", label: "Caption / alt text", type: "text", required: true },
      { key: "cat", label: "Category", type: "select", options: ["Factory", "Laboratory", "Products", "Services", "Team"], required: true },
      { key: "wide", label: "Wide tile (2 columns)", type: "boolean" },
      { key: "tall", label: "Tall tile (2 rows)", type: "boolean" },
    ],
    seed: () => staticGallery.map((g) => ({ ...g })),
    publicPath: () => "/gallery",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    singular: "testimonial",
    icon: Quote,
    idField: "",
    titleField: "who",
    fields: [
      { key: "q", label: "Quote", type: "textarea", required: true },
      { key: "who", label: "Attribution", type: "text", required: true, placeholder: "Plant Head, API pharma manufacturer" },
    ],
    seed: () => staticTestimonials.map((t) => ({ ...t })),
    publicPath: () => "/",
  },
];

export const moduleById = (id: string) => MODULES.find((m) => m.id === id)!;

/* ---------------------------------------------------------------- helpers */

export function rowTitle(def: ModuleDef, row: Row): string {
  return String(row[def.titleField] ?? row.__id);
}

export function rowImage(def: ModuleDef, row: Row): string | null {
  const v = def.imageKey ? row[def.imageKey] : null;
  return typeof v === "string" && v ? v : null;
}

export function timeAgo(d: Date | null): string {
  if (!d) return "";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "object" && "toDate" in (v as object)) {
    try {
      return (v as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

/** Client-side CSV download. */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
