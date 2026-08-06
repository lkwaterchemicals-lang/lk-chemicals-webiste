// The brand lock-up: logo plate + wordmark, always on one row.
//
// The supplied artwork is a full-colour lockup printed on a white field, and
// its "CHEMICALS Pvt. Ltd." line is black — bare on the dark navy nav it read
// as a grey smudge, which is exactly what the client saw. So the mark always
// sits on its own porcelain plate (see `.brand-plate` in styles.css): full
// contrast in both themes, plus a lit ring and a hover sheen so it reads as
// the most deliberate object on the page rather than a pasted-on sticker.
import logoUrl from "@/assets/lk-logo.png";

type Size = "sm" | "md" | "lg";

// Plate box, image inset and type scale per size. The plate is slightly wider
// than tall because the artwork is (1214×1057) — matching its ratio keeps the
// optical margin even on all four sides instead of pillar-boxing the mark.
const SIZES: Record<Size, { plate: string; radius: string; pad: string; name: string }> = {
  sm: { plate: "h-9 w-[2.55rem]", radius: "rounded-[0.6rem]", pad: "p-[3px]", name: "text-[13px]" },
  md: {
    plate: "h-11 w-[3.1rem]",
    radius: "rounded-[0.75rem]",
    pad: "p-[4px]",
    name: "text-[15px]",
  },
  lg: {
    plate: "h-14 w-[3.95rem]",
    radius: "rounded-[0.95rem]",
    pad: "p-[5px]",
    name: "text-lg",
  },
};

export function BrandMark({
  size = "md",
  /** Wordmark beside the plate. Hidden below `sm` when `responsiveText`. */
  showText = true,
  /** Small line under the wordmark (e.g. the tagline). */
  sub,
  /** Drop the wordmark on the narrowest phones so the row never wraps. */
  responsiveText = false,
  className = "",
}: {
  size?: Size;
  showText?: boolean;
  sub?: string;
  responsiveText?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={"flex min-w-0 items-center gap-2.5 " + className}>
      <span className={`brand-plate shrink-0 ${s.plate} ${s.radius} ${s.pad}`}>
        <img
          src={logoUrl}
          alt="LK Chemicals Pvt. Ltd."
          width={320}
          height={279}
          className="h-full w-full object-contain"
          draggable={false}
        />
      </span>
      {showText && (
        <span className={"min-w-0 leading-tight " + (responsiveText ? "hidden sm:block" : "block")}>
          <span className={`block truncate font-display font-bold tracking-tight ${s.name}`}>
            <span className="text-white">LK</span>
            <span className="text-white/60"> Chemicals</span>
          </span>
          {sub && (
            <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {sub}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
