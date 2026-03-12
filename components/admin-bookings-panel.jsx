"use client";

import { useEffect, useState } from "react";

const KEY_STORAGE = "muga_admin_key";

function formatDate(date, time) {
  if (!date) return "-";
  const safeTime = time || "00:00";
  const parsed = new Date(`${date}T${safeTime}:00`);

  if (Number.isNaN(parsed.getTime())) {
    return `${date} ${safeTime}`;
  }

  return parsed.toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default function AdminBookingsPanel() {
  const [adminKey, setAdminKey] = useState("");
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("Ingresa la clave de admin para cargar reservas.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY_STORAGE);
    if (stored) {
      setAdminKey(stored);
    }
  }, []);

  async function loadBookings(event) {
    event?.preventDefault();

    if (!adminKey) {
      setStatus("Necesitas ingresar ADMIN_DASHBOARD_KEY.");
      return;
    }

    setLoading(true);
    setStatus("Cargando reservas...");

    try {
      const response = await fetch("/api/bookings", {
        method: "GET",
        headers: {
          "x-admin-key": adminKey
        }
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "No se pudieron cargar las reservas.");
      }

      window.localStorage.setItem(KEY_STORAGE, adminKey);
      setBookings(payload.bookings || []);
      setStatus(`Reservas cargadas: ${payload.bookings?.length || 0}`);
    } catch (error) {
      setStatus(error.message || "Error de carga");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-panel">
      <form className="admin-form" onSubmit={loadBookings}>
        <label>
          Clave de administrador
          <input
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="ADMIN_DASHBOARD_KEY"
          />
        </label>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Cargar reservas"}
        </button>
      </form>

      <p className="admin-status">{status}</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Telefono</th>
              <th>Servicio</th>
              <th>Barbero</th>
              <th>Turno</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7}>Sin datos para mostrar.</td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.name}</td>
                  <td>{booking.phone}</td>
                  <td>{booking.service}</td>
                  <td>{booking.barber}</td>
                  <td>{formatDate(booking.appointment_date, booking.appointment_time)}</td>
                  <td>
                    {new Date(booking.created_at).toLocaleString("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short"
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
