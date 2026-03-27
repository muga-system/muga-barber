"use client";

import { useEffect } from "react";

const THEME_KEY = "muga-theme-preference";

function resolveTheme(preference) {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeInitializer() {
  useEffect(() => {
    const savedPreference = localStorage.getItem(THEME_KEY) || "system";
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme(preference) {
      const resolvedTheme = resolveTheme(preference);
      document.documentElement.setAttribute("data-theme", resolvedTheme);
      document.documentElement.style.colorScheme = resolvedTheme;
    }

    function handleSystemChange() {
      const currentPreference = localStorage.getItem(THEME_KEY) || "system";
      if (currentPreference === "system") {
        applyTheme("system");
      }
    }

    applyTheme(savedPreference);
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, []);

  return null;
}
