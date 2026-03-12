import AdminBookingsPanel from "../../../components/admin-bookings-panel";

export const metadata = {
  title: "Admin de reservas",
  description: "Panel interno para revisar reservas guardadas en base de datos.",
  robots: {
    index: false,
    follow: false
  },
  alternates: {
    canonical: "/admin/reservas"
  }
};

export default function AdminReservasPage() {
  return (
    <main className="content-page">
      <section className="content-wrap">
        <p className="eyebrow">Interno</p>
        <h1>Panel de reservas</h1>
        <p className="content-lead">
          Esta vista es operativa para el equipo. No compartir el enlace ni la
          clave de administrador.
        </p>

        <AdminBookingsPanel />
      </section>
    </main>
  );
}
