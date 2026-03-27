import AdminStatsPanel from "../../../components/admin-stats-panel";
import AdminAvatarMenu from "../../../components/admin-avatar-menu";
import AdminSidebar from "../../../components/admin-sidebar";

export const metadata = {
  title: "Admin de estadisticas",
  description: "Panel interno para revisar metricas y estado de reservas.",
  robots: {
    index: false,
    follow: false
  },
  alternates: {
    canonical: "/admin/estadisticas"
  }
};

export default function AdminEstadisticasPage() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main id="contenido-principal" className="admin-main">
        <AdminAvatarMenu />
        <div className="admin-content">
          <h1>Estadisticas de reservas</h1>
          <p className="content-lead">
            Vista operativa para seguir volumen, estados y carga de agenda por periodo.
          </p>

          <AdminStatsPanel />
        </div>
      </main>
    </div>
  );
}
