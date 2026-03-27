"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Download, Globe, LogOut, Settings2 } from "lucide-react";
import { ADMIN_PROFILE_PHOTO_KEY, ADMIN_PROFILE_UPDATED_EVENT } from "../lib/admin-profile";

const MENU_ITEMS = [
  { href: "/admin/configuracion", label: "Configuración", Icon: Settings2 },
  { href: "/", label: "Ver sitio", Icon: Globe }
];

export default function AdminAvatarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [photoData, setPhotoData] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const pathname = usePathname();
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    function syncPhoto() {
      const value = localStorage.getItem(ADMIN_PROFILE_PHOTO_KEY) || "";
      setPhotoData(value);
    }

    function handleStorage(event) {
      if (event.key === ADMIN_PROFILE_PHOTO_KEY) {
        syncPhoto();
      }
    }

    syncPhoto();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(ADMIN_PROFILE_UPDATED_EVENT, syncPhoto);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(ADMIN_PROFILE_UPDATED_EVENT, syncPhoto);
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    window.location.assign("/admin/reservas");
  }

  async function handleExportCsv() {
    setIsExporting(true);

    try {
      const response = await fetch("/api/bookings/export", { method: "GET" });
      if (!response.ok) {
        throw new Error("No se pudo exportar el CSV.");
      }

      const csv = await response.text();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reservas-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setIsOpen(false);
    } catch {
      // noop
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="admin-avatar-menu" ref={wrapperRef}>
      <button
        type="button"
        className="admin-avatar-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Abrir opciones del dashboard"
      >
        <span className="admin-avatar-dot">
          {photoData ? <img src={photoData} alt="Perfil administrador" className="admin-avatar-photo" /> : "M"}
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="admin-avatar-dropdown" role="menu" aria-label="Opciones del dashboard">
          {MENU_ITEMS.map((item) => {
            const Icon = item.Icon;
            return (
              <Link key={item.href} href={item.href} className="admin-avatar-item" role="menuitem" onClick={() => setIsOpen(false)}>
                <Icon size={15} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {pathname.startsWith("/admin/") ? (
            <button type="button" className="admin-avatar-item" role="menuitem" onClick={handleExportCsv} disabled={isExporting}>
              <Download size={15} aria-hidden="true" />
              <span>{isExporting ? "Exportando CSV…" : "Exportar CSV"}</span>
            </button>
          ) : null}

          <button type="button" className="admin-avatar-item is-danger" role="menuitem" onClick={handleLogout}>
            <LogOut size={15} aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
