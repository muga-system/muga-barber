"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Briefcase,
  CalendarCheck2,
  CircleHelp,
  House,
  MapPin,
  Menu,
  MessageSquareQuote,
  Scissors,
  ShieldCheck,
  UserRound
} from "lucide-react";

const SECTION_LINKS = [
  { id: "inicio", label: "Inicio", Icon: House },
  { id: "servicios", label: "Servicios", Icon: Scissors },
  { id: "experiencia", label: "Experiencia", Icon: Briefcase },
  { id: "testimonios", label: "Testimonios", Icon: MessageSquareQuote },
  { id: "garantias", label: "Garantias", Icon: ShieldCheck },
  { id: "reservar", label: "Reservar", Icon: CalendarCheck2 }
];

const PAGE_LINKS = [
  { href: "/precios", label: "Precios", Icon: BookOpen },
  { href: "/barberos", label: "Barberos", Icon: UserRound },
  { href: "/faq", label: "FAQ", Icon: CircleHelp },
  { href: "/ubicacion", label: "Ubicacion", Icon: MapPin }
];

export default function HomeSideNav() {
  const [activeSection, setActiveSection] = useState("inicio");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sectionIds = useMemo(() => SECTION_LINKS.map((section) => section.id), []);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    function updateActiveSection() {
      const viewportMarker = window.innerHeight * 0.34;
      let current = sections[0].id;

      sections.forEach((section) => {
        const top = section.getBoundingClientRect().top;
        if (top <= viewportMarker) {
          current = section.id;
        }
      });

      setActiveSection(current);
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [sectionIds]);

  useEffect(() => {
    if (!isModalOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      document.body.classList.remove("modal-locked");
      return;
    }

    document.body.classList.add("modal-locked");

    return () => {
      document.body.classList.remove("modal-locked");
    };
  }, [isModalOpen]);

  function handleSectionNavigation(event, sectionId, closeModal = false) {
    event.preventDefault();
    const target = document.getElementById(sectionId);
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    window.history.replaceState(null, "", `#${sectionId}`);
    setActiveSection(sectionId);
    if (closeModal) {
      setIsModalOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="home-side-nav-more home-side-nav-more-top"
        aria-label="Ver paginas y accesos"
        onClick={() => setIsModalOpen(true)}
      >
        <Menu size={14} aria-hidden="true" />
      </button>

      <aside className="home-side-nav" aria-label="Navegacion rapida de secciones">
        <nav className="home-side-nav-links">
          {SECTION_LINKS.map((section) => {
            const Icon = section.Icon;
            const isActive = activeSection === section.id;

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`home-side-nav-link${isActive ? " is-active" : ""}`}
                aria-label={section.label}
                title={section.label}
                onClick={(event) => handleSectionNavigation(event, section.id)}
              >
                <Icon size={14} aria-hidden="true" />
              </a>
            );
          })}
        </nav>
      </aside>

      {isModalOpen ? (
        <div className="home-nav-modal-overlay" role="dialog" aria-modal="true" onClick={() => setIsModalOpen(false)}>
          <div className="home-nav-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Navegacion</h3>
            <p className="home-nav-modal-copy">
              Atajos para explorar informacion clave del sitio y tomar una decision rapida.
            </p>

            <p className="home-nav-modal-title">Paginas</p>
            <div className="home-nav-modal-grid">
              {PAGE_LINKS.map((page) => {
                const Icon = page.Icon;

                return (
                  <a key={page.href} href={page.href} className="home-nav-modal-link" onClick={() => setIsModalOpen(false)}>
                    <Icon size={14} aria-hidden="true" />
                    <span>{page.label}</span>
                  </a>
                );
              })}
            </div>

            <p className="home-nav-modal-title">Accion recomendada</p>
            <a className="home-nav-modal-link home-nav-modal-link-primary" href="/reservar" onClick={() => setIsModalOpen(false)}>
              <CalendarCheck2 size={14} aria-hidden="true" />
              <span>Reservar turno ahora</span>
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
