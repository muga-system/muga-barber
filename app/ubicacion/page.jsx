export const metadata = {
  title: "Ubicacion y horarios",
  description:
    "Encuentra Muga Barber en Av. Central 123, Buenos Aires. Horarios de lunes a sabado de 09:00 a 21:00.",
  alternates: {
    canonical: "/ubicacion"
  }
};

export default function UbicacionPage() {
  return (
    <main className="content-page">
      <section className="content-wrap">
        <p className="eyebrow">Ubicacion</p>
        <h1>Estamos en el centro para que reserves y llegues sin rodeos</h1>

        <div className="content-grid">
          <article className="card">
            <h2>Direccion</h2>
            <p>Av. Central 123, Buenos Aires</p>
          </article>

          <article className="card">
            <h2>Horarios</h2>
            <p>Lunes a sabado de 09:00 a 21:00</p>
          </article>

          <article className="card">
            <h2>Contacto</h2>
            <p>WhatsApp: +54 11 1234 5678</p>
          </article>
        </div>

        <a className="btn btn-primary" href="/reservar" data-track="click_reservar_ubicacion_page">
          Reservar turno
        </a>
      </section>
    </main>
  );
}
