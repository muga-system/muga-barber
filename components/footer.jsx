import { Scissors } from "lucide-react";
import ThemeToggle from "./theme-toggle";

const NAV_LINKS = [
  { href: "/servicios", label: "Servicios" },
  { href: "/precios", label: "Precios" },
  { href: "/barberos", label: "Barberos" },
  { href: "/reservar", label: "Reservar" },
  { href: "/ubicacion", label: "Ubicacion" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacidad-cookies", label: "Privacidad y cookies" }
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="footer-brand-icon" aria-hidden="true">
          <Scissors size={32} />
        </span>
        <span className="footer-brand-text">Barberos y Barbados</span>
      </div>
      <p className="footer-info">Muga Barber · Av. Central 123 · Lun a Sab 09:00 - 21:00</p>
      <nav className="footer-links" aria-label="Enlaces secundarios">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <p className="footer-meta">
        <a href="/admin/reservas" aria-label="Ir al dashboard de administración">
          v0.1.0
        </a>
        <span aria-hidden="true"> · </span>
        <a href="https://muga.dev/" target="_blank" rel="noopener noreferrer">
          muga.dev
        </a>
      </p>
      <ThemeToggle />
    </footer>
  );
}
