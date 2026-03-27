"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import SectionMenuButton from "./section-menu-button";

const MENU_ONLY_PATHS = new Set([
  "/servicios",
  "/precios",
  "/barberos",
  "/faq",
  "/reservar",
  "/ubicacion",
  "/privacidad-cookies",
  "/politicas-cookies"
]);

export default function LayoutHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAdminPage = pathname.startsWith("/admin");
  const isBookingPath = pathname === "/reservar" || pathname.startsWith("/reservar/");

  if (isHomePage || isAdminPage) return null;

  if (isBookingPath || MENU_ONLY_PATHS.has(pathname)) {
    return <SectionMenuButton />;
  }

  return <Header currentPath={pathname} />;
}
