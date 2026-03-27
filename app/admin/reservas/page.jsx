import AdminBookingsPanel from "../../../components/admin-bookings-panel";
import AdminAvatarMenu from "../../../components/admin-avatar-menu";
import AdminSidebar from "../../../components/admin-sidebar";

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
    <div className="admin-layout">
      <AdminSidebar />
      <main id="contenido-principal" className="admin-main">
        <AdminAvatarMenu />
        <div className="admin-content">
          <h1>Panel de reservas</h1>
          <p className="content-lead">
            Esta vista es operativa para el equipo. Requiere iniciar sesion con
            clave de administrador y permite filtrar y actualizar estados.
          </p>

          <AdminBookingsPanel />
        </div>
      </main>
    </div>
  );
}
