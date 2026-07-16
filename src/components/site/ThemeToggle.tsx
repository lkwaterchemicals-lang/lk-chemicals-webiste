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
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    let initial: Theme = "dark";
    try {
      const saved = localStorage.getItem("lk-theme") as Theme | null;
      if (saved === "light" || saved === "dark") initial = saved;
      else if (window.matchMedia("(prefers-color-scheme: light)").matches) initial = "light";
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
      className={
        "relative grid h-10 w-10 place-items-center rounded-full glass-dark text-white overflow-hidden transition-transform hover:scale-105 " +
        className
      }
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
