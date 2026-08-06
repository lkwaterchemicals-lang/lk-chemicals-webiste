import { useEffect, useState, useCallback } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", t === "light");
  root.classList.toggle("dark", t === "dark");
  try {
    localStorage.setItem("lk-theme", t);
  } catch {
    // Ignore storage errors
  }
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  // Light is the default presentation of the site; only an explicit choice
  // the visitor made here moves them off it. Must match the inline script in
  // __root.tsx that sets the class before first paint.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    let initial: Theme = "light";
    try {
      const saved = localStorage.getItem("lk-theme") as Theme | null;
      if (saved === "light" || saved === "dark") initial = saved;
    } catch {
      // Ignore storage errors
    }
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      const next: Theme = theme === "dark" ? "light" : "dark";
      const x = e.clientX;
      const y = e.clientY;
      const root = document.documentElement;
      root.style.setProperty("--lk-x", `${x}px`);
      root.style.setProperty("--lk-y", `${y}px`);

      // View Transitions API (Chromium). Graceful fallback otherwise.
      const start = (
        document as Document & {
          startViewTransition?: (cb: () => void) => { finished: Promise<void> };
        }
      ).startViewTransition?.bind(document);
      if (start) {
        root.classList.add("lk-theme-anim");
        const t = start(() => {
          applyTheme(next);
          setTheme(next);
        });
        t.finished.finally(() => root.classList.remove("lk-theme-anim"));
      } else {
        applyTheme(next);
        setTheme(next);
      }
    },
    [theme],
  );

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={"icon-orb h-10 w-10 overflow-hidden " + className}
    >
      <Sun
        className={
          "h-4 w-4 absolute transition-all duration-500 " +
          (theme === "light" ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50")
        }
      />
      <Moon
        className={
          "h-4 w-4 absolute transition-all duration-500 " +
          (theme === "dark" ? "rotate-0 opacity-100 scale-100" : "rotate-90 opacity-0 scale-50")
        }
      />
    </button>
  );
}
