import BookingForm from "../../components/booking-form";

export const metadata = {
  title: "Reservar turno online",
  description:
    "Confirma tu turno en Muga Barber en menos de un minuto. Elige servicio, barbero y horario.",
  alternates: {
    canonical: "/reservar"
  }
};

const WHATSAPP_NUMBER = "5491112345678";

export default function ReservarPage() {
  return (
    <main id="contenido-principal" className="content-page">
      <section className="content-wrap">
        <p className="eyebrow">Reserva online</p>
        <h1>Elige tu servicio y asegura tu horario</h1>
        <p className="content-lead">
          El proceso tarda menos de un minuto. Recibes confirmacion por WhatsApp
          con todos los detalles de tu turno.
        </p>

        <BookingForm whatsappNumber={WHATSAPP_NUMBER} />
      </section>
    </main>
  );
}
