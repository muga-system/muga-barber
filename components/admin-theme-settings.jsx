"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { ADMIN_PROFILE_PHOTO_KEY, ADMIN_PROFILE_UPDATED_EVENT } from "../lib/admin-profile";

const THEME_KEY = "muga-theme-preference";

const OPTIONS = [
  { value: "system", label: "Auto", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon }
];

function resolveTheme(preference) {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function AdminThemeSettings() {
  const [preference, setPreference] = useState("system");
  const [photoData, setPhotoData] = useState("");
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) || "system";
    if (OPTIONS.some((item) => item.value === saved)) {
      setPreference(saved);
    }

    const savedPhoto = localStorage.getItem(ADMIN_PROFILE_PHOTO_KEY) || "";
    setPhotoData(savedPhoto);
  }, []);

  function handleChange(nextPreference) {
    setPreference(nextPreference);
    localStorage.setItem(THEME_KEY, nextPreference);

    const resolved = resolveTheme(nextPreference);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Selecciona una imagen valida.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("La imagen supera 2MB. Usa una mas liviana.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      setPhotoData(value);
      setPhotoError("");
      localStorage.setItem(ADMIN_PROFILE_PHOTO_KEY, value);
      window.dispatchEvent(new Event(ADMIN_PROFILE_UPDATED_EVENT));
    };
    reader.onerror = () => {
      setPhotoError("No se pudo leer la imagen. Intenta nuevamente.");
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setPhotoData("");
    setPhotoError("");
    localStorage.removeItem(ADMIN_PROFILE_PHOTO_KEY);
    window.dispatchEvent(new Event(ADMIN_PROFILE_UPDATED_EVENT));
  }

  return (
    <section className="admin-panel admin-settings" aria-label="Configuracion de tema">
      <div className="admin-settings-card">
        <h2>Tema del dashboard</h2>
        <p>Elegi entre claro, oscuro o seguir la configuracion del sistema.</p>
        <div className="admin-theme-toggle" role="group" aria-label="Modo de tema">
          {OPTIONS.map((option) => {
            const Icon = option.Icon;
            const isActive = preference === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`admin-theme-option${isActive ? " is-active" : ""}`}
                onClick={() => handleChange(option.value)}
                aria-pressed={isActive}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-settings-card">
        <h2>Perfil de administrador</h2>
        <p>Subi una foto para usar en el avatar del panel.</p>
        <div className="admin-profile-row">
          <span className="admin-profile-preview" aria-hidden="true">
            {photoData ? <img src={photoData} alt="" /> : <span>M</span>}
          </span>
          <label className="admin-profile-upload">
            <span>Foto de perfil</span>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>
          {photoData ? (
            <button type="button" className="btn btn-secondary" onClick={handleRemovePhoto}>
              Quitar foto
            </button>
          ) : null}
        </div>
        {photoError ? <p className="field-error">{photoError}</p> : null}
      </div>
    </section>
  );
}
