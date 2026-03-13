export const metadata = {
  title: "Barberos y especialidades",
  description:
    "Conoce al equipo de Muga Barber y elige el profesional segun el resultado que buscas.",
  alternates: {
    canonical: "/barberos"
  }
};

const BARBERS = [
  {
    name: "Franco",
    specialty: "Cortes clasicos y ejecutivos",
    detail:
      "Especialista en precision de contornos y mantenimiento de imagen profesional."
  },
  {
    name: "Nico",
    specialty: "Fade moderno y textura",
    detail:
      "Enfoque en estilos actuales con transiciones limpias y recomendacion de producto."
  },
  {
    name: "Santi",
    specialty: "Barba y grooming integral",
    detail:
      "Perfilado tecnico, simetria facial y protocolo completo de barba premium."
  }
];

export default function BarberosPage() {
  return (
    <main id="contenido-principal" className="content-page">
      <section className="content-wrap">
        <p className="eyebrow">Equipo</p>
        <h1>Profesionales para resultados consistentes en cada visita</h1>
        <p className="content-lead">
          Puedes elegir barbero al reservar segun especialidad y estilo deseado.
        </p>

        <div className="content-grid">
          {BARBERS.map((barber) => (
            <article key={barber.name} className="card">
              <h2>{barber.name}</h2>
              <p className="price">{barber.specialty}</p>
              <p>{barber.detail}</p>
            </article>
          ))}
        </div>

        <a className="btn btn-primary" href="/reservar" data-track="click_reservar_barberos_page">
          Elegir horario
        </a>
      </section>
    </main>
  );
}
