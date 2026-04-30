import { useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "../utils/constants";
import { safeJsonParse, safeJsonStringify } from "../utils/storage";

type Theme = "dark" | "light";

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = safeJsonParse<{ theme: Theme }>(
      localStorage.getItem(STORAGE_KEYS.theme)
    );
    return saved?.theme ?? "dark";
  });

  const nextTheme = useMemo<Theme>(() => (theme === "dark" ? "light" : "dark"), [theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEYS.theme, safeJsonStringify({ theme }));
  }, [theme]);

  return {
    theme,
    nextTheme,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark"))
  };
}

