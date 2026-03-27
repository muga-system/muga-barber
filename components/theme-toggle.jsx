"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

const THEME_KEY = "muga-theme-preference";

const THEMES = [
  { id: "system", label: "Usar tema del sistema", Icon: Monitor },
  { id: "light", label: "Usar tema claro", Icon: Sun },
  { id: "dark", label: "Usar tema oscuro", Icon: Moon }
];

function resolveTheme(preference) {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [preference, setPreference] = useState("system");

  useEffect(() => {
    const savedPreference = localStorage.getItem(THEME_KEY) || "system";
    const allowed = THEMES.some((theme) => theme.id === savedPreference);
    const nextPreference = allowed ? savedPreference : "system";

    setPreference(nextPreference);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme() {
      const resolvedTheme = resolveTheme(preference);
      document.documentElement.setAttribute("data-theme", resolvedTheme);
      document.documentElement.style.colorScheme = resolvedTheme;
    }

    function handleSystemChange() {
      if (preference === "system") {
        applyTheme();
      }
    }

    applyTheme();
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [preference]);

  function handleThemeChange(nextPreference) {
    setPreference(nextPreference);
    localStorage.setItem(THEME_KEY, nextPreference);
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Seleccion de tema">
      {THEMES.map((theme) => {
        const Icon = theme.Icon;
        const isActive = preference === theme.id;

        return (
          <button
            key={theme.id}
            type="button"
            className={`theme-toggle-btn${isActive ? " is-active" : ""}`}
            onClick={() => handleThemeChange(theme.id)}
            aria-label={theme.label}
            aria-pressed={isActive}
          >
            <Icon size={15} />
          </button>
        );
      })}
    </div>
  );
}
