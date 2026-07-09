// Module registry — one place that describes every content collection the
// admin manages: its Firestore shape, edit fields, seeds and public preview.
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FolderTree,
  Image as ImageIcon,
  LayoutGrid,
  Package,
  Quote,
  Wrench,
} from "lucide-react";
import { staticGallery, staticTestimonials } from "@/data/content";
import { ICON_NAMES } from "@/lib/icons";

export type Row = Record<string, unknown> & { __id: string };

export type FieldType =
  | "text"
  | "textarea"
  | "list"
  | "image"
  | "boolean"
  | "select"
  | "group" // repeatable rows of sub-fields (specs, etc.)
  | "gallery" // ordered list of image URLs
  | "documents" // labelled file uploads
  | "multiref"; // multi-select of other records

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  /** select / multiref options carrying a display label (injected at runtime) */
  optionItems?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  /** products/categories: auto-fill from this field via slugify while untouched */
  slugOf?: string;
  /** group: sub-fields rendered per row */
  itemFields?: FieldDef[];
  /** group: singular noun for the add button */
  itemNoun?: string;
  /** group: which sub-field to surface as a row title */
  itemTitleKey?: string;
  /** select / multiref: the collection whose records this field references.
   * Options are resolved live from that collection (value = slug, label = name).
   * When it equals the module's own id the field self-references (e.g. parent),
   * so the record being edited is excluded from the options. */
  refCollection?: string;
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
  /** enable drag-and-drop reordering; persists sequential values to `order`. */
  reorderable?: boolean;
  fields: FieldDef[];
  seed?: () => Record<string, unknown>[];
  publicPath?: (row: Row) => string | null;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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

// Reused across products, categories and services so every entity gets the
// same SEO surface. `status` gates public visibility (draft/archived are hidden).
const STATUS_FIELD: FieldDef = {
  key: "status",
  label: "Status",
  type: "select",
  options: ["published", "draft", "archived"],
  hint: "Draft & archived are hidden from the public site",
};

const SEO_FIELDS: FieldDef[] = [
  { key: "metaTitle", label: "SEO title", type: "text", hint: "Defaults to the name" },
  { key: "metaDescription", label: "SEO description", type: "textarea", hint: "~155 characters" },
  { key: "keywords", label: "Keywords", type: "text", hint: "Comma separated" },
  { key: "ogImage", label: "Social share image", type: "image", hint: "Open Graph / Twitter card" },
];

const SPEC_FIELD: FieldDef = {
  key: "specifications",
  label: "Specifications",
  type: "group",
  itemNoun: "spec",
  itemTitleKey: "name",
  itemFields: [
    { key: "name", label: "Name", type: "text" },
    { key: "value", label: "Value", type: "text" },
    { key: "unit", label: "Unit", type: "text" },
  ],
};

// Reused by services: an ordered set of process steps and a FAQ list.
const PROCESS_FIELD: FieldDef = {
  key: "process",
  label: "Process steps",
  type: "group",
  itemNoun: "step",
  itemTitleKey: "title",
  itemFields: [
    { key: "title", label: "Title", type: "text" },
    { key: "body", label: "Description", type: "textarea" },
  ],
};

const FAQ_FIELD: FieldDef = {
  key: "faqs",
  label: "FAQs",
  type: "group",
  itemNoun: "FAQ",
  itemTitleKey: "q",
  itemFields: [
    { key: "q", label: "Question", type: "text" },
    { key: "a", label: "Answer", type: "textarea" },
  ],
};

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
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
        placeholder: "e.g. High Silica RO Antiscalant",
      },
      {
        key: "slug",
        label: "Slug",
        type: "text",
        hint: "URL id — auto-generated from the name",
        slugOf: "name",
      },
      {
        key: "category",
        label: "Category",
        type: "select",
        refCollection: "categories",
        required: true,
      },
      {
        key: "subcategory",
        label: "Subcategory",
        type: "text",
        hint: "Optional grouping within the category",
      },
      { ...STATUS_FIELD },
      { key: "featured", label: "Featured", type: "boolean", hint: "Highlight on listings" },
      { key: "order", label: "Display order", type: "text", hint: "Lower shows first (e.g. 10)" },
      {
        key: "price",
        label: "Price",
        type: "text",
        hint: "Optional — shown on the product page, e.g. ₹2,400 / 25 L drum",
      },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "features", label: "Features", type: "list", hint: "One per line" },
      { key: "applications", label: "Applications", type: "list", hint: "One per line" },
      { key: "packing", label: "Packing options", type: "list", hint: "One per line" },
      { ...SPEC_FIELD },
      {
        key: "image",
        label: "Primary photo",
        type: "image",
        hint: "Optional — falls back to the category image",
      },
      {
        key: "gallery",
        label: "Gallery",
        type: "gallery",
        hint: "Additional images, drag-orderable",
      },
      {
        key: "documents",
        label: "Documents",
        type: "documents",
        hint: "TDS, SDS, certificates, brochures…",
      },
      {
        key: "related",
        label: "Related products",
        type: "multiref",
        refCollection: "products",
        hint: "Cross-sell on the product page",
      },
      ...SEO_FIELDS,
    ],
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
    reorderable: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      {
        key: "slug",
        label: "Slug",
        type: "text",
        hint: "URL id — auto-generated from the name",
        slugOf: "name",
      },
      {
        key: "parent",
        label: "Parent category",
        type: "select",
        refCollection: "categories",
        hint: "Optional — leave blank for a top-level category",
      },
      {
        key: "number",
        label: "Number",
        type: "text",
        required: true,
        hint: "01–99, controls display order",
      },
      { ...STATUS_FIELD },
      { key: "featured", label: "Featured", type: "boolean" },
      { key: "iconName", label: "Icon", type: "select", options: ICON_NAMES },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Cover image", type: "image" },
      {
        key: "banner",
        label: "Banner image",
        type: "image",
        hint: "Wide hero for the category page",
      },
      ...SEO_FIELDS,
    ],
    publicPath: (r) => (r.slug ? `/products?cat=${String(r.slug)}` : null),
  },
  {
    id: "serviceCategories",
    label: "Service categories",
    singular: "service category",
    icon: FolderTree,
    idField: "slug",
    titleField: "name",
    subtitleField: "tagline",
    imageKey: "image",
    order: "number",
    reorderable: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      {
        key: "slug",
        label: "Slug",
        type: "text",
        hint: "URL id — auto-generated from the name",
        slugOf: "name",
      },
      {
        key: "parent",
        label: "Parent category",
        type: "select",
        refCollection: "serviceCategories",
        hint: "Optional — leave blank for a top-level category",
      },
      {
        key: "number",
        label: "Number",
        type: "text",
        required: true,
        hint: "01–99, controls display order",
      },
      { ...STATUS_FIELD },
      { key: "featured", label: "Featured", type: "boolean" },
      { key: "iconName", label: "Icon", type: "select", options: ICON_NAMES },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Cover image", type: "image" },
      {
        key: "banner",
        label: "Banner image",
        type: "image",
        hint: "Wide hero for the category page",
      },
      ...SEO_FIELDS,
    ],
    publicPath: (r) => (r.slug ? `/services/${String(r.slug)}` : null),
  },
  {
    id: "services",
    label: "Services",
    singular: "service",
    icon: Wrench,
    idField: "slug",
    titleField: "name",
    subtitleField: "serviceCategory",
    imageKey: "image",
    order: "order",
    reorderable: true,
    fields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
        placeholder: "e.g. RO Plant Servicing & Repair",
      },
      {
        key: "slug",
        label: "Slug",
        type: "text",
        hint: "URL id — auto-generated from the name",
        slugOf: "name",
      },
      {
        key: "serviceCategory",
        label: "Service category",
        type: "select",
        refCollection: "serviceCategories",
        required: true,
      },
      { ...STATUS_FIELD },
      { key: "featured", label: "Featured", type: "boolean", hint: "Highlight on listings" },
      { key: "order", label: "Display order", type: "text", hint: "Lower shows first (e.g. 10)" },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "highlights", label: "What's included", type: "list", hint: "One per line" },
      {
        key: "image",
        label: "Cover image",
        type: "image",
        hint: "Optional — falls back to the category image",
      },
      {
        key: "gallery",
        label: "Gallery",
        type: "gallery",
        hint: "Additional images, drag-orderable",
      },
      {
        key: "documents",
        label: "Documents",
        type: "documents",
        hint: "Brochures, datasheets, certificates…",
      },
      { ...PROCESS_FIELD },
      { ...FAQ_FIELD },
      {
        key: "related",
        label: "Related services",
        type: "multiref",
        refCollection: "services",
        hint: "Cross-link on the service page",
      },
      ...SEO_FIELDS,
    ],
    publicPath: (r) =>
      r.slug && r.serviceCategory
        ? `/services/${String(r.serviceCategory)}/${String(r.slug)}`
        : null,
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
      {
        key: "cat",
        label: "Category",
        type: "select",
        options: ["Factory", "Laboratory", "Products", "Services", "Team"],
        required: true,
      },
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
    imageKey: "image",
    fields: [
      { key: "q", label: "Quote", type: "textarea", required: true },
      {
        key: "who",
        label: "Attribution",
        type: "text",
        required: true,
        placeholder: "Plant Head, API pharma manufacturer",
      },
      {
        key: "company",
        label: "Company / plant",
        type: "text",
        hint: "Optional — shown under the attribution",
      },
      {
        key: "rating",
        label: "Star rating",
        type: "select",
        options: ["5", "4", "3"],
        hint: "Optional — shows gold stars with the quote",
      },
      {
        key: "image",
        label: "Photo / logo",
        type: "image",
        hint: "Optional headshot or company logo",
      },
    ],
    seed: () => staticTestimonials.map((t) => ({ ...t })),
    publicPath: () => "/",
  },
  {
    id: "careers",
    label: "Careers",
    singular: "opening",
    icon: Briefcase,
    idField: "slug",
    titleField: "title",
    subtitleField: "location",
    order: "order",
    reorderable: true,
    fields: [
      {
        key: "title",
        label: "Job title",
        type: "text",
        required: true,
        placeholder: "e.g. Field Service Engineer",
      },
      {
        key: "slug",
        label: "Slug",
        type: "text",
        hint: "URL id — auto-generated from the title",
        slugOf: "title",
      },
      { key: "department", label: "Department", type: "text", placeholder: "Field Operations" },
      { key: "location", label: "Location", type: "text", placeholder: "Hyderabad · On-site" },
      {
        key: "type",
        label: "Employment type",
        type: "select",
        options: ["Full-time", "Part-time", "Contract", "Internship"],
      },
      { key: "experience", label: "Experience", type: "text", placeholder: "2–5 years" },
      { ...STATUS_FIELD },
      { key: "order", label: "Display order", type: "text", hint: "Lower shows first (e.g. 10)" },
      {
        key: "summary",
        label: "Summary",
        type: "textarea",
        required: true,
        hint: "Short pitch shown on the careers page",
      },
      { key: "responsibilities", label: "Responsibilities", type: "list", hint: "One per line" },
      { key: "requirements", label: "Requirements", type: "list", hint: "One per line" },
    ],
    publicPath: () => "/careers",
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
