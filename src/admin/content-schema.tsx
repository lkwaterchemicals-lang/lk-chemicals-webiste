// Schema for the "Website content" editor — describes every editable field on
// every public page, grouped into sections. The page-editor renders forms from
// this and saves each page as a `pages/<id>` Firestore document. Field keys map
// 1:1 to the shapes in src/data/site.ts (which provide the built-in defaults).
import type { LucideIcon } from "lucide-react";
import { Globe, Home, Info, Wrench, Package, Image as ImageIcon, Phone } from "lucide-react";
import { ICON_NAMES } from "@/lib/icons";
import {
  globalContent,
  homeContent,
  aboutContent,
  servicesContent,
  productsContent,
  galleryContent,
  contactContent,
} from "@/data/site";

export type ContentFieldType =
  "text" | "textarea" | "image" | "imagelist" | "list" | "group" | "select" | "boolean";

export type ContentField = {
  key: string;
  label: string;
  type: ContentFieldType;
  hint?: string;
  placeholder?: string;
  options?: string[]; // select
  /** group: sub-fields for each item */
  itemFields?: ContentField[];
  /** group: singular noun for the add button / item header */
  itemNoun?: string;
  /** group: which sub-field to show as an item's title */
  itemTitleKey?: string;
  /** span the field full width in the two-column grid */
  full?: boolean;
};

export type ContentSection = { title: string; fields: ContentField[] };

export type PageSchema = {
  id: string; // pages/<id> doc + route param
  label: string;
  description: string;
  icon: LucideIcon;
  /** built-in default document used as the editing baseline + fallback */
  fallback: Record<string, unknown>;
  sections: ContentSection[];
};

const iconField = (): ContentField => ({
  key: "icon",
  label: "Icon",
  type: "select",
  options: ICON_NAMES,
  hint: "Pick an icon",
});

export const PAGE_SCHEMAS: PageSchema[] = [
  {
    id: "global",
    label: "Brand & footer",
    description: "Company name, strapline and footer copy shown site-wide.",
    icon: Globe,
    fallback: globalContent as unknown as Record<string, unknown>,
    sections: [
      {
        title: "Brand",
        fields: [
          { key: "brandName", label: "Company name", type: "text" },
          {
            key: "brandLine",
            label: "Strapline",
            type: "text",
            hint: "Under the footer logo",
            full: true,
          },
          { key: "footerBlurb", label: "Footer blurb", type: "textarea", full: true },
          { key: "footerNote", label: "Footer note", type: "text", hint: "Bottom bar", full: true },
        ],
      },
    ],
  },
  {
    id: "home",
    label: "Home",
    description: "The homepage — hero, who we are, industries, process, why LK and more.",
    icon: Home,
    fallback: homeContent as unknown as Record<string, unknown>,
    sections: [
      {
        title: "Hero",
        fields: [
          { key: "heroLabel", label: "Eyebrow label", type: "text", full: true },
          { key: "heroTitleTop", label: "Headline — line 1", type: "text" },
          { key: "heroTitleBottom", label: "Headline — line 2", type: "text" },
          { key: "heroSubtitle", label: "Subtitle", type: "textarea", full: true },
          { key: "heroImage", label: "Background image", type: "image", full: true },
        ],
      },
      {
        title: "Who we are",
        fields: [
          { key: "whoLabel", label: "Eyebrow label", type: "text" },
          { key: "whoGhost", label: "Ghost word", type: "text", hint: "Large watermark text" },
          { key: "whoHeadingLead", label: "Heading — plain part", type: "text" },
          { key: "whoHeadingAccent", label: "Heading — accent part", type: "text" },
          { key: "whoBody", label: "Body", type: "textarea", full: true },
          {
            key: "whoImages",
            label: "Collage images",
            type: "imagelist",
            hint: "Shown as a 3-image collage",
            full: true,
          },
          {
            key: "stats",
            label: "Stats",
            type: "group",
            itemNoun: "stat",
            itemTitleKey: "label",
            full: true,
            itemFields: [
              { key: "value", label: "Number", type: "text", hint: "Counts up to this" },
              { key: "suffix", label: "Suffix", type: "text", placeholder: "+ yrs" },
              { key: "label", label: "Label", type: "text" },
            ],
          },
        ],
      },
      {
        title: "What we make",
        fields: [{ key: "makeHeading", label: "Heading", type: "text", full: true }],
      },
      {
        title: "What we service",
        fields: [
          { key: "serviceHeadingLead", label: "Heading (lead)", type: "text" },
          { key: "serviceHeadingAccent", label: "Heading (accent)", type: "text" },
          { key: "serviceSubtitle", label: "Subtitle", type: "textarea", full: true },
        ],
      },
      {
        title: "Where we work",
        fields: [
          { key: "whereHeading", label: "Heading", type: "text", full: true },
          { key: "whereSubtitle", label: "Subtitle", type: "textarea", full: true },
          {
            key: "industries",
            label: "Industries",
            type: "group",
            itemNoun: "industry",
            itemTitleKey: "name",
            full: true,
            itemFields: [{ key: "name", label: "Name", type: "text" }, iconField()],
          },
        ],
      },
      {
        title: "How water gets treated",
        fields: [
          { key: "journeyHeading", label: "Heading", type: "text" },
          { key: "journeySubtitle", label: "Subtitle", type: "textarea", full: true },
          {
            key: "journey",
            label: "Steps",
            type: "group",
            itemNoun: "step",
            itemTitleKey: "title",
            full: true,
            itemFields: [
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "textarea" },
              { key: "img", label: "Image", type: "image" },
            ],
          },
        ],
      },
      {
        title: "Why LK",
        fields: [
          { key: "whyHeadingLead", label: "Heading — plain part", type: "text" },
          { key: "whyHeadingAccent", label: "Heading — accent part", type: "text" },
          {
            key: "whyItems",
            label: "Reasons",
            type: "group",
            itemNoun: "reason",
            itemTitleKey: "title",
            full: true,
            itemFields: [
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "textarea" },
              { key: "img", label: "Image (optional)", type: "image" },
              { key: "highlight", label: "Highlight tile (dark, with image)", type: "boolean" },
            ],
          },
        ],
      },
      {
        title: "Proof",
        fields: [
          {
            key: "certs",
            label: "Certifications & badges",
            type: "list",
            hint: "One per line — scrolls as a marquee",
            full: true,
          },
        ],
      },
      {
        title: "See the plant",
        fields: [
          { key: "plantHeading", label: "Heading", type: "text" },
          {
            key: "plantImages",
            label: "Photos",
            type: "imagelist",
            hint: "Shown in a collage grid",
            full: true,
          },
          { key: "plantCapacity", label: "Capacity figure", type: "text", placeholder: "10 T" },
          { key: "plantCapacityLabel", label: "Capacity label", type: "text" },
          { key: "plantLocation", label: "Location caption", type: "text", full: true },
        ],
      },
      {
        title: "Talk to us",
        fields: [
          { key: "talkHeadingTop", label: "Heading — line 1", type: "text" },
          { key: "talkHeadingBottom", label: "Heading — line 2", type: "text" },
          { key: "talkBody", label: "Body", type: "textarea", full: true },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About",
    description: "Company story — hero, timeline, mission, vision, infrastructure and values.",
    icon: Info,
    fallback: aboutContent as unknown as Record<string, unknown>,
    sections: [
      {
        title: "Hero",
        fields: [
          { key: "heroLabel", label: "Eyebrow label", type: "text", full: true },
          { key: "heroHeading", label: "Heading", type: "text", full: true },
          { key: "heroBody", label: "Body", type: "textarea", full: true },
          { key: "heroImage", label: "Background image", type: "image", full: true },
        ],
      },
      {
        title: "Timeline",
        fields: [
          {
            key: "milestones",
            label: "Milestones",
            type: "group",
            itemNoun: "milestone",
            itemTitleKey: "title",
            full: true,
            itemFields: [
              { key: "year", label: "Year", type: "text" },
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "textarea" },
            ],
          },
        ],
      },
      {
        title: "Mission",
        fields: [
          { key: "missionLead", label: "Statement — plain part", type: "text", full: true },
          { key: "missionAccent", label: "Statement — accent part", type: "text", full: true },
          { key: "missionTail", label: "Statement — tail", type: "text", full: true },
        ],
      },
      {
        title: "Vision",
        fields: [{ key: "visionText", label: "Statement", type: "textarea", full: true }],
      },
      {
        title: "Infrastructure",
        fields: [
          {
            key: "facilities",
            label: "Facilities",
            type: "group",
            itemNoun: "facility",
            itemTitleKey: "title",
            full: true,
            itemFields: [
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "textarea" },
              { key: "img", label: "Image", type: "image" },
            ],
          },
        ],
      },
      {
        title: "Values",
        fields: [
          {
            key: "values",
            label: "Values",
            type: "group",
            itemNoun: "value",
            itemTitleKey: "title",
            full: true,
            itemFields: [
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "text" },
              { key: "img", label: "Image", type: "image" },
            ],
          },
        ],
      },
      {
        title: "Team",
        fields: [
          { key: "teamHeading", label: "Heading", type: "text", full: true },
          {
            key: "teamBody",
            label: "Intro",
            type: "textarea",
            hint: "Team members themselves are managed under Content → Team",
            full: true,
          },
        ],
      },
      {
        title: "Closing call-to-action",
        fields: [
          { key: "ctaHeading", label: "Heading", type: "text", full: true },
          { key: "ctaBody", label: "Body", type: "text", full: true },
        ],
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    description: "Services page hero and the service-process steps.",
    icon: Wrench,
    fallback: servicesContent as unknown as Record<string, unknown>,
    sections: [
      {
        title: "Hero",
        fields: [
          { key: "heroTitleTop", label: "Headline — line 1", type: "text" },
          { key: "heroTitleBottom", label: "Headline — line 2", type: "text" },
        ],
      },
      {
        title: "Service process",
        fields: [
          { key: "processHeading", label: "Heading", type: "text", full: true },
          {
            key: "processSteps",
            label: "Steps",
            type: "group",
            itemNoun: "step",
            itemTitleKey: "title",
            full: true,
            itemFields: [
              { key: "title", label: "Title", type: "text" },
              { key: "body", label: "Body", type: "text" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "products",
    label: "Products",
    description: "Products catalog hero (the products themselves live under Catalog).",
    icon: Package,
    fallback: productsContent as unknown as Record<string, unknown>,
    sections: [
      {
        title: "Hero",
        fields: [
          { key: "heroHeading", label: "Heading", type: "text", full: true },
          {
            key: "heroSubtitle",
            label: "Subtitle",
            type: "textarea",
            hint: "Prefixed with the live product count",
            full: true,
          },
          { key: "heroImage", label: "Background image", type: "image", full: true },
        ],
      },
    ],
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Gallery page hero (media items live under Content → Media).",
    icon: ImageIcon,
    fallback: galleryContent as unknown as Record<string, unknown>,
    sections: [
      {
        title: "Hero",
        fields: [{ key: "heroHeading", label: "Heading", type: "text", full: true }],
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    description: "Contact page hero and map caption (phone, email & address live under Settings).",
    icon: Phone,
    fallback: contactContent as unknown as Record<string, unknown>,
    sections: [
      {
        title: "Hero",
        fields: [
          { key: "heroHeading", label: "Heading", type: "text", full: true },
          { key: "heroBody", label: "Body", type: "textarea", full: true },
        ],
      },
      {
        title: "Map",
        fields: [{ key: "coordinates", label: "Coordinates heading", type: "text", full: true }],
      },
    ],
  },
];

export const schemaById = (id: string) => PAGE_SCHEMAS.find((p) => p.id === id);
