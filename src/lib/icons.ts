// A curated set of Lucide icons that admin-managed content (e.g. the homepage
// "Where we work" industries) can reference by name. Storing an icon *name* in
// Firestore keeps content serialisable; this map turns the name back into a
// component at render time. Unknown names fall back to `Droplets`.
import {
  Building2,
  Droplets,
  Factory,
  FlaskConical,
  Hotel,
  Laptop,
  Layers,
  Scroll,
  Shirt,
  Stethoscope,
  Utensils,
  Wheat,
  Zap,
  Beaker,
  Truck,
  Wrench,
  Cog,
  Leaf,
  Recycle,
  Ship,
  Cpu,
  Landmark,
  Pill,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Zap,
  FlaskConical,
  Factory,
  Layers,
  Scroll,
  Wheat,
  Laptop,
  Hotel,
  Stethoscope,
  Utensils,
  Shirt,
  Building2,
  Droplets,
  Beaker,
  Truck,
  Wrench,
  Cog,
  Leaf,
  Recycle,
  Ship,
  Cpu,
  Landmark,
  Pill,
};

/** All selectable icon names, for the admin editor dropdown. */
export const ICON_NAMES = Object.keys(ICONS);

/** Resolve a stored icon name to a component, defaulting to Droplets. */
export const iconByName = (name: string | undefined): LucideIcon =>
  (name && ICONS[name]) || Droplets;
