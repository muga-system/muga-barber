import AdminSidebar from "../../../components/admin-sidebar";
import AdminAvatarMenu from "../../../components/admin-avatar-menu";
import AdminThemeSettings from "../../../components/admin-theme-settings";

export const metadata = {
  title: "Admin de configuracion",
  description: "Ajustes visuales del dashboard interno.",
  robots: {
    index: false,
    follow: false
  },
  alternates: {
    canonical: "/admin/configuracion"
  }
};

export default function AdminConfiguracionPage() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main id="contenido-principal" className="admin-main">
        <AdminAvatarMenu />
        <div className="admin-content">
          <h1>Configuración</h1>
          <p className="content-lead">Ajustes de tema y visualizacion del panel.</p>

          <AdminThemeSettings />
        </div>
      </main>
    </div>
  );
}
