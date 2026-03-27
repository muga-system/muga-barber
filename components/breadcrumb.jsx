"use client";

import { usePathname } from "next/navigation";
import { BREADCRUMB_LABELS } from "./breadcrumb-data";

function getBreadcrumb(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Inicio", href: "/" }];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += "/" + segment;
    const label = BREADCRUMB_LABELS[currentPath] || segment;
    crumbs.push({ label, href: currentPath });
  }

  return crumbs;
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const crumbs = getBreadcrumb(pathname);

  return (
    <nav className="breadcrumb" aria-label="Navegacion">
      {crumbs.map((crumb, index) => (
        <span key={crumb.href}>
          {index > 0 && <span className="breadcrumb-sep">/</span>}
          {index === crumbs.length - 1 ? (
            <span className="breadcrumb-current">{crumb.label}</span>
          ) : (
            <a href={crumb.href}>{crumb.label}</a>
          )}
        </span>
      ))}
    </nav>
  );
}