import BookingForm from "../components/booking-form";
import Footer from "../components/footer";
import HeroAvailabilityCard from "../components/hero-availability-card";
import HomeSideNav from "../components/home-side-nav";
import { ArrowRight, CalendarClock, MessageCircleMore, ShieldCheck, Sparkles } from "lucide-react";
import { getLocalBusinessSchema } from "../lib/seo";

export const metadata = {
  title: "Barberia premium en Buenos Aires",
  description:
    "Reserva tu turno online en Muga Barber. Corte, barba y grooming premium con confirmacion inmediata.",
  alternates: {
    canonical: "/"
  }
};

const TODAY_SLOTS = ["16:30", "18:00", "19:30", "20:15"];

const HERO_HIGHLIGHTS = [
  {
    text: "Confirmacion inmediata por WhatsApp",
    Icon: MessageCircleMore
  },
  {
    text: "Atencion de lunes a sabado, 09:00 a 21:00",
    Icon: CalendarClock
  },
  {
    text: "Puntualidad y estandar tecnico garantizado",
    Icon: ShieldCheck
  }
];

const SERVICES = [
  {
    title: "Corte Signature",
    description: "Diagnostico de estilo, lavado premium y acabado de precision.",
    meta: "$18.000 · 45 min"
  },
  {
    title: "Barba Ritual",
    description: "Toalla caliente, perfilado fino y cierre con navaja clasica.",
    meta: "$14.000 · 35 min"
  },
  {
    title: "Full Grooming",
    description: "Corte + barba + masaje capilar para un upgrade completo.",
    meta: "$28.000 · 75 min",
    featured: true,
    tag: "Mas reservado"
  }
];

const EXPERIENCE_STEPS = [
  {
    title: "1. Eliges tu resultado",
    description: "Cada servicio esta definido por resultado y tiempo real."
  },
  {
    title: "2. Tomas horario libre",
    description: "Sin llamadas. Ves disponibilidad y reservas en segundos."
  },
  {
    title: "3. Llegas y te atienden puntual",
    description: "Proceso claro, puntual y orientado a un resultado consistente."
  }
];

const TESTIMONIALS = [
  {
    quote:
      '"Reserve en menos de un minuto desde el celular y me atendieron exacto a la hora."',
    author: "Lucas M. · Google Reviews"
  },
  {
    quote:
      '"La combinacion corte + barba tiene un nivel tecnico que no encontre en otra barberia."',
    author: "Matias R. · Cliente frecuente"
  },
  {
    quote:
      '"Toda la web se entiende rapido: servicios, precios y reserva sin friccion."',
    author: "Enzo V. · Cliente nuevo"
  }
];

const OBJECTIONS = [
  {
    title: "No tengo tiempo para esperas",
    answer:
      "Trabajamos por horario bloqueado. Tu turno inicia puntual y se respeta la duracion informada."
  },
  {
    title: "No se si me va a quedar bien",
    answer:
      "Cada sesion comienza con diagnostico rapido de rostro, textura y objetivo para definir el resultado antes de empezar."
  },
  {
    title: "Si no me convence el resultado, que pasa",
    answer:
      "Incluye ajuste de detalle en 72 horas para asegurar que el acabado final quede exactamente como lo querias."
  }
];

const WHATSAPP_NUMBER = "5491112345678";
const HOME_SCHEMA = getLocalBusinessSchema("/");

export default function HomePage() {
  return (
    <>
      <HomeSideNav />

      <main id="contenido-principal">
        <section id="inicio" className="hero">
          <div className="hero-copy-wrap">
            <p className="eyebrow hero-eyebrow">
              <Sparkles size={14} aria-hidden="true" />
              Barberia premium urbana
            </p>
            <h1>Reserva tu turno online y llega con todo resuelto</h1>
            <p className="hero-copy">
              Servicios claros, precios visibles y disponibilidad real para tomar
              tu horario en segundos.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="/reservar" data-track="click_reservar_hero">
                Reservar turno
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a className="btn btn-secondary" href="/servicios" data-track="click_ver_servicios_hero">
                Ver servicios
              </a>
            </div>

            <ul className="hero-highlights" aria-label="Beneficios principales">
              {HERO_HIGHLIGHTS.map((item) => {
                const Icon = item.Icon;

                return (
                  <li key={item.text}>
                    <span className="hero-highlight-icon" aria-hidden="true">
                      <Icon size={14} />
                    </span>
                    {item.text}
                  </li>
                );
              })}
            </ul>
          </div>

          <HeroAvailabilityCard slots={TODAY_SLOTS} />
        </section>

        <section id="servicios" className="section">
          <div className="section-head">
            <p className="eyebrow">Servicios</p>
            <h2>Oferta corta para decidir rapido</h2>
          </div>

          <div className="services-grid">
            {SERVICES.map((service) => (
              <article key={service.title} className={service.featured ? "card featured" : "card"}>
                {service.tag ? <p className="tag">{service.tag}</p> : null}
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <p className="price">{service.meta}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="experiencia" className="section split">
          <div>
            <p className="eyebrow">Experiencia</p>
            <h2>Flujo de reserva en 3 pasos</h2>
            <ol className="steps">
              {EXPERIENCE_STEPS.map((step) => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="quality-note" aria-label="Estandar del servicio">
            <p className="eyebrow">Estandar Muga</p>
            <h3>Calidad tecnica y consistencia en cada turno</h3>
            <ul>
              <li>Herramientas esterilizadas</li>
              <li>Asesoria de mantenimiento</li>
              <li>Ajuste post-servicio en 72 horas</li>
            </ul>
          </aside>
        </section>

        <section id="testimonios" className="section">
          <div className="section-head">
            <p className="eyebrow">Prueba social</p>
            <h2>Clientes que reservan y vuelven</h2>
          </div>

          <div className="quotes">
            {TESTIMONIALS.map((testimonial) => (
              <blockquote key={testimonial.author}>
                {testimonial.quote}
                <cite>{testimonial.author}</cite>
              </blockquote>
            ))}
          </div>
        </section>

        <section id="garantias" className="section assurances">
          <div className="section-head">
            <p className="eyebrow">Objeciones frecuentes</p>
            <h2>Todo lo que un cliente premium necesita saber antes de reservar</h2>
            <p className="subcopy">
              Menos incertidumbre, mas confianza para confirmar tu horario hoy.
            </p>
          </div>

          <div className="assurances-grid">
            {OBJECTIONS.map((item) => (
              <article key={item.title} className="assurance-item">
                <h3>{item.title}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>

          <a className="btn btn-primary" href="/reservar" data-track="click_reservar_garantias">
            Reservar turno premium
          </a>
        </section>

        <section id="reservar" className="section booking">
          <div className="section-head">
            <p className="eyebrow">Reserva online</p>
            <h2>Confirma tu turno ahora</h2>
            <p className="subcopy">
              Completa 5 campos y te redirigimos a WhatsApp con el resumen listo.
            </p>
          </div>

          <div className="booking-layout">
            <BookingForm whatsappNumber={WHATSAPP_NUMBER} />

            <aside className="booking-note" aria-label="Recordatorio de conversion">
              <h3>Tu horario queda asegurado al instante</h3>
              <p>
                El equipo confirma por WhatsApp y te espera con servicio,
                profesional y precio ya definidos.
              </p>
              <a className="btn btn-secondary" href="/servicios" data-track="click_revisar_servicios_booking">
                Revisar servicios
              </a>
            </aside>
          </div>
        </section>
      </main>

      <Footer />

      <a
        className="floating-cta"
        href="/reservar"
        aria-label="Ir a reservar turno"
        data-track="click_reservar_floating"
      >
        Reservar
      </a>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_SCHEMA) }}
      />
    </>
  );
}
