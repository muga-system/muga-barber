"use client";

import { useEffect, useState } from "react";
import { CalendarCheck2, CircleHelp, House, MapPin, Menu, Scissors, UserRound } from "lucide-react";

const PAGE_LINKS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/servicios", label: "Servicios", Icon: Scissors },
  { href: "/precios", label: "Precios", Icon: CalendarCheck2 },
  { href: "/barberos", label: "Barberos", Icon: UserRound },
  { href: "/faq", label: "FAQ", Icon: CircleHelp },
  { href: "/ubicacion", label: "Ubicacion", Icon: MapPin }
];

export default function SectionMenuButton() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove("modal-locked");
      return;
    }

    document.body.classList.add("modal-locked");

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modal-locked");
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="section-menu-fab"
        aria-label="Abrir menu de paginas"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={15} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="home-nav-modal-overlay" role="dialog" aria-modal="true" onClick={() => setIsOpen(false)}>
          <div className="home-nav-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Navegacion</h3>
            <p className="home-nav-modal-copy">
              Atajos rapidos para moverte entre secciones del sitio sin volver al menu superior.
            </p>

            <p className="home-nav-modal-title">Paginas</p>
            <div className="home-nav-modal-grid">
              {PAGE_LINKS.map((page) => {
                const Icon = page.Icon;

                return (
                  <a key={page.href} href={page.href} className="home-nav-modal-link" onClick={() => setIsOpen(false)}>
                    <Icon size={14} aria-hidden="true" />
                    <span>{page.label}</span>
                  </a>
                );
              })}
            </div>

            <p className="home-nav-modal-title">Accion recomendada</p>
            <a className="home-nav-modal-link home-nav-modal-link-primary" href="/reservar" onClick={() => setIsOpen(false)}>
              <CalendarCheck2 size={14} aria-hidden="true" />
              <span>Reservar turno ahora</span>
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
