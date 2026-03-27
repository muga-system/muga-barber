import { Scissors } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/precios", label: "Precios" },
  { href: "/barberos", label: "Barberos" },
  { href: "/faq", label: "FAQ" }
];

export default function Header({ currentPath, showNav = true }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Ir al inicio">
        <span className="brand-icon" aria-hidden="true">
          <Scissors size={20} />
        </span>
      </a>

      {showNav ? (
        <nav className="main-nav" aria-label="Navegacion principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={currentPath === link.href ? "active" : ""}
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}

      <a className="btn btn-primary desktop-cta" href="/reservar">
        Reservar turno
      </a>
    </header>
  );
}
