export const metadata = {
  title: "Precios de servicios",
  description:
    "Consulta precios y duracion de servicios premium en Muga Barber antes de reservar tu turno.",
  alternates: {
    canonical: "/precios"
  }
};

const PRICE_TABLE = [
  {
    service: "Corte Signature",
    duration: "45 min",
    price: "$18.000",
    includes: "Diagnostico, lavado y acabado premium"
  },
  {
    service: "Barba Ritual",
    duration: "35 min",
    price: "$14.000",
    includes: "Toalla caliente, perfilado y navaja"
  },
  {
    service: "Full Grooming",
    duration: "75 min",
    price: "$28.000",
    includes: "Corte + barba + masaje capilar"
  }
];

export default function PreciosPage() {
  return (
    <main id="contenido-principal" className="content-page">
      <section className="content-wrap">
        <p className="eyebrow">Precios</p>
        <h1>Valores claros para decidir tu reserva sin dudas</h1>
        <p className="content-lead">
          Publicamos precio, duracion y alcance de cada servicio para evitar
          sorpresas y acelerar la decision.
        </p>

        <div className="pricing-table">
          {PRICE_TABLE.map((item) => (
            <article key={item.service} className="pricing-row">
              <div>
                <h2>{item.service}</h2>
                <p>{item.includes}</p>
              </div>
              <p className="pricing-meta">{item.duration}</p>
              <p className="price">{item.price}</p>
            </article>
          ))}
        </div>

        <a className="btn btn-primary" href="/reservar" data-track="click_reservar_precios_page">
          Reservar con este precio
        </a>
      </section>
    </main>
  );
}
