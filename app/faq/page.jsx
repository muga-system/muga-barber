export const metadata = {
  title: "Preguntas frecuentes de reservas",
  description:
    "Resuelve dudas sobre reservas, tiempos, puntualidad y ajustes post-servicio en Muga Barber.",
  alternates: {
    canonical: "/faq"
  }
};

const FAQ_ITEMS = [
  {
    question: "Cuanto tarda el proceso de reserva?",
    answer:
      "Menos de un minuto. Seleccionas servicio, barbero y horario, y recibes confirmacion por WhatsApp."
  },
  {
    question: "Que pasa si llego tarde?",
    answer:
      "Recomendamos llegar 5 minutos antes. Si hay retraso, el equipo evalua disponibilidad para mantener calidad del servicio."
  },
  {
    question: "Puedo cambiar o cancelar mi turno?",
    answer:
      "Si, puedes reprogramar por WhatsApp con anticipacion para liberar el horario y tomar otro cupo disponible."
  },
  {
    question: "Incluyen ajuste si no me convence un detalle?",
    answer:
      "Si. Incluimos ajuste de detalle dentro de 72 horas para asegurar el resultado acordado."
  },
  {
    question: "Aceptan pago con tarjeta o transferencia?",
    answer:
      "Aceptamos efectivo, transferencia y medios digitales. Puedes confirmar tu metodo antes del turno."
  }
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer
    }
  }))
};

export default function FaqPage() {
  return (
    <main className="content-page">
      <section className="content-wrap">
        <p className="eyebrow">FAQ</p>
        <h1>Preguntas frecuentes antes de reservar</h1>
        <p className="content-lead">
          Respondemos las dudas clave para que tomes decision rapido y sin friccion.
        </p>

        <div className="faq-list">
          {FAQ_ITEMS.map((item) => (
            <article key={item.question} className="faq-item">
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>

        <a className="btn btn-primary" href="/reservar" data-track="click_reservar_faq_page">
          Reservar turno
        </a>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
    </main>
  );
}
