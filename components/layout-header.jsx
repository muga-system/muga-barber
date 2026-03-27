"use client";

import { usePathname } from "next/navigation";
import Header from "./header";

export default function LayoutHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAdminPage = pathname.startsWith("/admin");

  if (isHomePage || isAdminPage) return null;

  return <Header currentPath={pathname} />;
}