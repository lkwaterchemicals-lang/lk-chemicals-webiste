// Social channels — official brand marks, official brand colours.
//
// Recognition is the whole reason a visitor taps one of these, so the glyphs
// are the real Facebook / Instagram / YouTube marks (not generic line icons)
// and each button carries its own brand fill. At rest they are quiet glass
// discs with a coloured glyph; on hover the channel's real colour floods the
// disc from the centre, the glyph flips white and the button lifts — the
// invitation is unmistakable without shouting on first paint.
import { useSiteSettings } from "@/lib/content";

/* ------------------------------------------------------------- brand marks */

type GlyphProps = { className?: string };

export function FacebookIcon({ className = "h-5 w-5" }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 3.926 23.094 9.101 24v-8.437H6.627v-3.49h2.474V9.36c0-3.826 1.98-5.94 5.316-5.94 1.598 0 3.27.29 3.27.29v3.61h-1.843c-1.816 0-2.38 1.14-2.38 2.31v2.443h4.05l-.647 3.49h-3.403V24C20.074 23.094 24 18.1 24 12.073Z" />
    </svg>
  );
}

export function InstagramIcon({ className = "h-5 w-5" }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
    </svg>
  );
}

export function YouTubeIcon({ className = "h-5 w-5" }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ links */

export type SocialChannel = {
  key: "facebook" | "instagram" | "youtube";
  label: string;
  /** What the visitor gets by tapping — used as the caption in labelled rows. */
  blurb: string;
  href: string;
  Icon: (p: GlyphProps) => React.ReactElement;
  /** Brand fill revealed on hover. */
  fill: string;
  /** Glyph colour at rest. */
  ink: string;
  /** Hover shadow tint. */
  glow: string;
};

/** The channels the dashboard has filled in, in a fixed, deliberate order. */
export function useSocialChannels(): SocialChannel[] {
  const { data: s } = useSiteSettings();
  const all: SocialChannel[] = [
    {
      key: "facebook",
      label: "Facebook",
      blurb: "Plant updates & site work",
      href: (s.facebook ?? "").trim(),
      Icon: FacebookIcon,
      fill: "#1877F2",
      ink: "#1877F2",
      glow: "rgba(24,119,242,0.6)",
    },
    {
      key: "instagram",
      label: "Instagram",
      blurb: "Inside the Cherlapally works",
      href: (s.instagram ?? "").trim(),
      Icon: InstagramIcon,
      fill: "radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 62%, #285AEB 92%)",
      ink: "#E1306C",
      glow: "rgba(214,36,159,0.55)",
    },
    {
      key: "youtube",
      label: "YouTube",
      blurb: "Process & product walkthroughs",
      href: (s.youtube ?? "").trim(),
      Icon: YouTubeIcon,
      fill: "#FF0000",
      ink: "#FF0000",
      glow: "rgba(255,0,0,0.5)",
    },
  ];
  return all.filter((c) => c.href.length > 0);
}

type OrbStyle = React.CSSProperties &
  Record<"--social-fill" | "--social-ink" | "--social-glow", string>;

const orbStyle = (c: SocialChannel): OrbStyle => ({
  ["--social-fill"]: c.fill,
  ["--social-ink"]: c.ink,
  ["--social-glow"]: c.glow,
});

/** Compact row of circular brand buttons — nav takeover, contact card, docks. */
export function SocialRow({
  size = "md",
  className = "",
  onNavigate,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Lets a host close itself (e.g. the mobile nav takeover) on tap. */
  onNavigate?: () => void;
}) {
  const channels = useSocialChannels();
  if (channels.length === 0) return null;
  const box = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-11 w-11" : "h-12 w-12";
  const glyph = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-[1.15rem] w-[1.15rem]" : "h-5 w-5";
  return (
    <div className={"flex flex-wrap items-center gap-3 " + className}>
      {channels.map((c) => (
        <a
          key={c.key}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          aria-label={`LK Chemicals on ${c.label}`}
          title={c.label}
          className={`social-orb ${box}`}
          style={orbStyle(c)}
        >
          <c.Icon className={`social-glyph ${glyph}`} />
        </a>
      ))}
    </div>
  );
}

/** Full "follow us" panel — button, channel name and what's actually posted
 * there. The blurb is what turns a decorative icon strip into a reason to
 * tap, so it earns its place anywhere there is room for it. */
export function SocialPanel({ className = "" }: { className?: string }) {
  const channels = useSocialChannels();
  if (channels.length === 0) return null;
  return (
    <div className={"grid gap-2.5 sm:grid-cols-3 " + className}>
      {channels.map((c) => (
        <a
          key={c.key}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`LK Chemicals on ${c.label}`}
          className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-hi/40"
        >
          <span className="social-orb h-11 w-11 shrink-0" style={orbStyle(c)}>
            <c.Icon className="social-glyph h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">{c.label}</span>
            <span className="block truncate text-[11px] text-white/55">{c.blurb}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
