"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import SectionMenuButton from "./section-menu-button";

const MENU_ONLY_PATHS = new Set(["/servicios", "/precios", "/barberos", "/faq"]);

export default function LayoutHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAdminPage = pathname.startsWith("/admin");

  if (isHomePage || isAdminPage) return null;

  if (MENU_ONLY_PATHS.has(pathname)) {
    return <SectionMenuButton />;
  }

  return <Header currentPath={pathname} />;
}
