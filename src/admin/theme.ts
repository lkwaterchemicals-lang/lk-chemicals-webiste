// Admin theme — independent of the public site's theme. Persisted separately.
import { useCallback, useEffect, useState } from "react";

export type AdminTheme = "light" | "dark";
const KEY = "adm-theme";

function stored(): AdminTheme | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : null;
}

function system(): AdminTheme {
  if (typeof window === "undefined") return "light";
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useAdminTheme(): [AdminTheme, (t: AdminTheme) => void, () => void] {
  // Server renders light; the client corrects on mount (attribute is
  // suppressed for hydration, so there is no mismatch warning).
  const [theme, setThemeState] = useState<AdminTheme>("light");

  useEffect(() => {
    setThemeState(stored() ?? system());
  }, []);

  const setTheme = useCallback((t: AdminTheme) => {
    localStorage.setItem(KEY, t);
    setThemeState(t);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((cur) => {
      const next = cur === "dark" ? "light" : "dark";
      localStorage.setItem(KEY, next);
      return next;
    });
  }, []);

  return [theme, setTheme, toggle];
}
