import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "color-mode";

export type ColorMode = "light" | "dark";

/**
 * Dark mode via the `dark` class on <html>. An inline script in _document
 * applies the persisted value before hydration to avoid flashing.
 *
 * State starts as "light" on both server and client so hydration matches;
 * the effect syncs it with the actual <html> class right after mount.
 */
export function useColorMode() {
  const [colorMode, setColorMode] = useState<ColorMode>("light");

  useEffect(() => {
    setColorMode(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore storage errors (e.g. private mode)
      }
      return next;
    });
  }, []);

  return { colorMode, toggleColorMode };
}

export const colorModeInitScript = `(function(){try{var m=localStorage.getItem("${STORAGE_KEY}");if(m==="dark"||(!m&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`;
