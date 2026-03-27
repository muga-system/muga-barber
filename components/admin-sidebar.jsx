"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BarChart3, CalendarDays, Scissors } from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin/reservas", label: "Reservas", icon: CalendarDays },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3 }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="brand-icon" aria-hidden="true">
          <Scissors size={20} />
        </span>
        <span className="brand-text">Admin</span>
      </div>
      
      <nav className="admin-sidebar-nav">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;

          return (
          <Link 
            key={link.href} 
            href={link.href}
            className={`admin-sidebar-link ${pathname === link.href ? "active" : ""}`}
          >
            <span className="link-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <span className="link-label">{link.label}</span>
          </Link>
          );
        })}
      </nav>
      
    </aside>
  );
}
