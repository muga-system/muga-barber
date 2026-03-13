export const metadata = {
  title: "Servicios de barberia premium",
  description:
    "Conoce los servicios de Muga Barber: corte signature, barba ritual y full grooming con estandar premium.",
  alternates: {
    canonical: "/servicios"
  }
};

const SERVICES = [
  {
    name: "Corte Signature",
    detail: "Diagnostico de estilo, lavado premium y acabado de precision.",
    meta: "$18.000 · 45 min"
  },
  {
    name: "Barba Ritual",
    detail: "Toalla caliente, perfilado fino y cierre con navaja clasica.",
    meta: "$14.000 · 35 min"
  },
  {
    name: "Full Grooming",
    detail: "Corte + barba + masaje capilar para resultado integral.",
    meta: "$28.000 · 75 min"
  }
];

export default function ServiciosPage() {
  return (
    <main id="contenido-principal" className="content-page">
      <section className="content-wrap">
        <p className="eyebrow">Servicios</p>
        <h1>Tratamientos disenados para una imagen impecable</h1>
        <p className="content-lead">
          Cada servicio incluye evaluacion inicial y recomendacion de mantenimiento
          para que el resultado se mantenga entre visitas.
        </p>

        <div className="content-grid">
          {SERVICES.map((service) => (
            <article key={service.name} className="card">
              <h2>{service.name}</h2>
              <p>{service.detail}</p>
              <p className="price">{service.meta}</p>
            </article>
          ))}
        </div>

        <a className="btn btn-primary" href="/reservar" data-track="click_reservar_servicios_page">
          Reservar turno
        </a>
      </section>
    </main>
  );
}
