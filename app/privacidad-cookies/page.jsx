import Footer from "../../components/footer";
import Breadcrumb from "../../components/breadcrumb";

export const metadata = {
  title: "Privacidad y Cookies | Muga Barber",
  description:
    "Informacion sobre el uso de datos personales y cookies de analitica en Muga Barber."
};

export default function PrivacyCookiesPage() {
  return (
    <main id="contenido-principal" className="content-page">
      <div className="content-wrap">
        <Breadcrumb />
        <p className="eyebrow">Legal</p>
        <h1>Politica de privacidad y cookies</h1>
        <p>
          En Muga Barber usamos datos de contacto solo para gestionar reservas y
          atencion al cliente. La informacion no se vende ni se comparte para
          fines publicitarios externos.
        </p>

        <section>
          <h2>1. Datos que recopilamos</h2>
          <ul>
            <li>Nombre y telefono para confirmar turnos.</li>
            <li>Servicio, barbero y horario elegido para gestionar agenda.</li>
            <li>Eventos anonimos de uso cuando aceptas cookies de analitica.</li>
          </ul>
        </section>

        <section>
          <h2>2. Uso de cookies</h2>
          <p>
            Solo activamos cookies de analitica cuando das consentimiento.
            Estas cookies nos ayudan a medir rendimiento de la web y mejorar el
            proceso de reserva.
          </p>
        </section>

        <section>
          <h2>3. Tus derechos</h2>
          <p>
            Puedes solicitar acceso, rectificacion o eliminacion de tus datos en
            cualquier momento escribiendo por WhatsApp o en nuestro canal de
            contacto oficial.
          </p>
        </section>

        <section>
          <h2>4. Contacto</h2>
          <p>
            Para temas de privacidad, escribe a: <strong>privacidad@mugabarber.com</strong>
          </p>
        </section>
      </div>
      <Footer />
    </main>
  );
}
