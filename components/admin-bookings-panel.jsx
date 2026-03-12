"use client";

import { useEffect, useMemo, useState } from "react";
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS } from "../lib/booking-status";

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

function formatCreatedAt(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function normalizeDateKey(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function toAppointmentTimestamp(booking) {
  const dateKey = normalizeDateKey(booking.appointment_date);
  const time = booking.appointment_time || "00:00";
  const parsed = new Date(`${dateKey}T${time}:00`);

  if (Number.isNaN(parsed.getTime())) return 0;
  return parsed.getTime();
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateKey, days) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function getWeekStart(dateKey) {
  const date = parseDateKey(dateKey);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  return toDateKey(date);
}

function formatDateKey(dateKey, options) {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString("es-AR", options);
}

function createQueryString(filters) {
  const params = new URLSearchParams();

  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  return params.toString();
}

export default function AdminBookingsPanel() {
  const todayDateKey = new Date().toISOString().slice(0, 10);

  const [authState, setAuthState] = useState("checking");
  const [authKey, setAuthKey] = useState("");
  const [statusText, setStatusText] = useState("Validando sesion...");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [draggingBooking, setDraggingBooking] = useState(null);
  const [dragTargetStatus, setDragTargetStatus] = useState(null);

  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    from: "",
    to: ""
  });

  const [statusDrafts, setStatusDrafts] = useState({});
  const [calendarWeekStart, setCalendarWeekStart] = useState(getWeekStart(todayDateKey));
  const [weeklyViewMode, setWeeklyViewMode] = useState("days");

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => toAppointmentTimestamp(a) - toAppointmentTimestamp(b)),
    [bookings]
  );

  const hasBookings = sortedBookings.length > 0;

  const stats = useMemo(() => {
    const base = {
      total: bookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    bookings.forEach((booking) => {
      if (booking.status && booking.status in base) {
        base[booking.status] += 1;
      }
    });

    return base;
  }, [bookings]);

  const agendaToday = useMemo(
    () => sortedBookings.filter((booking) => normalizeDateKey(booking.appointment_date) === todayDateKey),
    [sortedBookings, todayDateKey]
  );

  const queryString = useMemo(() => createQueryString(filters), [filters]);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const dateKey = addDays(calendarWeekStart, index);
        return {
          dateKey,
          shortLabel: formatDateKey(dateKey, { weekday: "short" }),
          dayLabel: formatDateKey(dateKey, { day: "2-digit", month: "2-digit" })
        };
      }),
    [calendarWeekStart]
  );

  const weekRangeLabel = useMemo(() => {
    const weekEnd = addDays(calendarWeekStart, 6);
    const start = formatDateKey(calendarWeekStart, { day: "2-digit", month: "short" });
    const end = formatDateKey(weekEnd, { day: "2-digit", month: "short" });
    return `${start} - ${end}`;
  }, [calendarWeekStart]);

  const weeklyCalendar = useMemo(() => {
    const map = new Map(weekDays.map((day) => [day.dateKey, []]));

    sortedBookings.forEach((booking) => {
      const dateKey = normalizeDateKey(booking.appointment_date);
      if (!map.has(dateKey)) return;
      map.get(dateKey).push(booking);
    });

    return weekDays.map((day) => ({
      ...day,
      bookings: map.get(day.dateKey)
    }));
  }, [sortedBookings, weekDays]);

  const weeklyByBarber = useMemo(() => {
    const barberMap = new Map();

    weeklyCalendar.forEach((day) => {
      day.bookings.forEach((booking) => {
        const barberName = booking.barber || "Sin barbero";

        if (!barberMap.has(barberName)) {
          barberMap.set(
            barberName,
            new Map(weekDays.map((weekDay) => [weekDay.dateKey, []]))
          );
        }

        barberMap.get(barberName).get(day.dateKey).push(booking);
      });
    });

    return Array.from(barberMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([barber, daysMap]) => ({
        barber,
        days: weekDays.map((weekDay) => ({
          ...weekDay,
          bookings: daysMap.get(weekDay.dateKey) || []
        }))
      }));
  }, [weeklyCalendar, weekDays]);

  useEffect(() => {
    async function verifySession() {
      try {
        const response = await fetch("/api/admin/session", { method: "GET" });
        const payload = await response.json().catch(() => ({}));

        if (!payload.configured) {
          setAuthState("misconfigured");
          setStatusText("Falta configurar ADMIN_DASHBOARD_KEY en Vercel.");
          return;
        }

        if (payload.authenticated) {
          setAuthState("authenticated");
          setStatusText("Sesion iniciada. Cargando reservas...");
          await loadBookings();
          return;
        }

        setAuthState("unauthenticated");
        setStatusText("Ingresa la clave de administrador para continuar.");
      } catch {
        setAuthState("unauthenticated");
        setStatusText("No pudimos validar sesion. Intenta nuevamente.");
      }
    }

    verifySession();
  }, []);

  async function handleLogin(event) {
    event.preventDefault();

    if (!authKey) {
      setStatusText("Debes ingresar una clave valida.");
      return;
    }

    setStatusText("Validando clave...");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ key: authKey })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Clave invalida.");
      }

      setAuthState("authenticated");
      setAuthKey("");
      setStatusText("Sesion iniciada. Cargando reservas...");
      await loadBookings();
    } catch (error) {
      setAuthState("unauthenticated");
      setStatusText(error.message || "No se pudo iniciar sesion.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    setBookings([]);
    setStatusDrafts({});
    setAuthState("unauthenticated");
    setStatusText("Sesion cerrada.");
  }

  async function loadBookings(overrideFilters) {
    const effectiveFilters = overrideFilters || filters;
    const effectiveQuery = createQueryString(effectiveFilters);

    setLoadingBookings(true);

    try {
      const endpoint = effectiveQuery ? `/api/bookings?${effectiveQuery}` : "/api/bookings";
      const response = await fetch(endpoint, { method: "GET" });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setAuthState("unauthenticated");
        setStatusText("Sesion vencida. Vuelve a ingresar la clave.");
        setBookings([]);
        setStatusDrafts({});
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "No se pudieron cargar las reservas.");
      }

      const nextBookings = payload.bookings || [];
      setBookings(nextBookings);
      setDraggingBooking(null);
      setDragTargetStatus(null);

      const draftMap = {};
      nextBookings.forEach((booking) => {
        draftMap[booking.id] = booking.status || "pending";
      });
      setStatusDrafts(draftMap);

      setStatusText(`Reservas cargadas: ${nextBookings.length}`);
    } catch (error) {
      setBookings([]);
      setStatusDrafts({});
      setStatusText(error.message || "No se pudo cargar el listado.");
    } finally {
      setLoadingBookings(false);
    }
  }

  async function updateBookingStatus(bookingId, nextStatus, source = "panel") {
    if (!nextStatus) return;

    setUpdatingId(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo actualizar el estado.");
      }

      setBookings((current) =>
        current.map((booking) =>
          String(booking.id) === String(bookingId)
            ? {
                ...booking,
                status: payload.booking.status,
                updated_at: payload.booking.updated_at
              }
            : booking
        )
      );

      setStatusDrafts((current) => ({
        ...current,
        [bookingId]: payload.booking.status
      }));

      const statusLabel = BOOKING_STATUS_LABELS[payload.booking.status] || payload.booking.status;
      setStatusText(
        source === "drag"
          ? `Turno #${bookingId} movido a ${statusLabel}.`
          : `Reserva #${bookingId} actualizada a ${statusLabel}.`
      );
    } catch (error) {
      setStatusText(error.message || "No se pudo actualizar el estado.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleStatusUpdate(bookingId) {
    const nextStatus = statusDrafts[bookingId];
    await updateBookingStatus(bookingId, nextStatus, "panel");
  }

  async function handleDeleteBooking(bookingId) {
    const confirmed = window.confirm(`Eliminar reserva #${bookingId}? Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    setDeletingId(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE"
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo eliminar la reserva.");
      }

      setBookings((current) => current.filter((booking) => String(booking.id) !== String(bookingId)));
      setStatusDrafts((current) => {
        const next = { ...current };
        delete next[bookingId];
        return next;
      });
      setStatusText(`Reserva #${bookingId} eliminada.`);
    } catch (error) {
      setStatusText(error.message || "No se pudo eliminar la reserva.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleExportCsv() {
    setExporting(true);

    try {
      const endpoint = queryString ? `/api/bookings/export?${queryString}` : "/api/bookings/export";
      const response = await fetch(endpoint, { method: "GET" });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "No se pudo exportar el CSV.");
      }

      const csv = await response.text();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reservas-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatusText("CSV exportado correctamente.");
    } catch (error) {
      setStatusText(error.message || "No se pudo exportar el CSV.");
    } finally {
      setExporting(false);
    }
  }

  function shiftCalendarWeek(direction) {
    setCalendarWeekStart((current) => addDays(current, direction * 7));
  }

  async function handleApplyWeekFilters() {
    const nextFilters = {
      ...filters,
      from: calendarWeekStart,
      to: addDays(calendarWeekStart, 6)
    };

    setFilters(nextFilters);
    await loadBookings(nextFilters);
  }

  function handleDragStart(event, booking) {
    if (!booking?.id) return;

    setDraggingBooking({
      id: booking.id,
      status: booking.status || "pending"
    });

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(booking.id));
    }
  }

  function handleDragEnd() {
    setDraggingBooking(null);
    setDragTargetStatus(null);
  }

  function handleStatusDragOver(event, targetStatus) {
    if (!draggingBooking || draggingBooking.status === targetStatus) {
      return;
    }

    event.preventDefault();
    setDragTargetStatus(targetStatus);
  }

  function handleStatusDragLeave(targetStatus) {
    if (dragTargetStatus === targetStatus) {
      setDragTargetStatus(null);
    }
  }

  async function handleStatusDrop(event, targetStatus) {
    event.preventDefault();

    if (!draggingBooking) {
      setDragTargetStatus(null);
      return;
    }

    if (draggingBooking.status === targetStatus) {
      setStatusText("El turno ya tiene ese estado.");
      setDraggingBooking(null);
      setDragTargetStatus(null);
      return;
    }

    await updateBookingStatus(draggingBooking.id, targetStatus, "drag");
    setDraggingBooking(null);
    setDragTargetStatus(null);
  }

  if (authState === "checking") {
    return <p className="admin-status">Validando sesion...</p>;
  }

  if (authState === "misconfigured") {
    return <p className="admin-status">{statusText}</p>;
  }

  if (authState !== "authenticated") {
    return (
      <section className="admin-panel">
        <form className="admin-form" onSubmit={handleLogin}>
          <label>
            Clave de administrador
            <input
              type="password"
              value={authKey}
              onChange={(event) => setAuthKey(event.target.value)}
              placeholder="Ingresa la clave"
              autoComplete="current-password"
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Iniciar sesion
          </button>
        </form>

        <p className="admin-status">{statusText}</p>
      </section>
    );
  }

  return (
    <section className="admin-panel">
      <div className="admin-toolbar">
        <form className="admin-filters" onSubmit={(event) => {
          event.preventDefault();
          loadBookings();
        }}>
          <label className="admin-inline-field">
            Buscar
            <input
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              placeholder="Cliente, telefono, servicio..."
            />
          </label>

          <label className="admin-inline-field">
            Estado
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="all">Todos</option>
              {BOOKING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {BOOKING_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-inline-field">
            Desde
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
            />
          </label>

          <label className="admin-inline-field">
            Hasta
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
            />
          </label>

          <button className="btn btn-primary" type="submit" disabled={loadingBookings}>
            {loadingBookings ? "Filtrando..." : "Aplicar filtros"}
          </button>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                from: todayDateKey,
                to: todayDateKey
              }))
            }
          >
            Hoy
          </button>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() =>
              setFilters({
                q: "",
                status: "all",
                from: "",
                to: ""
              })
            }
          >
            Limpiar
          </button>
        </form>

        <div className="admin-toolbar-actions">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
          >
            {exporting ? "Exportando..." : "Exportar CSV"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </div>

      <p className="admin-status">{statusText}</p>

      <div className="admin-kpis">
        <article className="admin-kpi">
          <h2>Total</h2>
          <p>{stats.total}</p>
        </article>
        <article className="admin-kpi">
          <h2>Pendientes</h2>
          <p>{stats.pending}</p>
        </article>
        <article className="admin-kpi">
          <h2>Confirmadas</h2>
          <p>{stats.confirmed}</p>
        </article>
        <article className="admin-kpi">
          <h2>Completadas</h2>
          <p>{stats.completed}</p>
        </article>
        <article className="admin-kpi">
          <h2>Canceladas</h2>
          <p>{stats.cancelled}</p>
        </article>
      </div>

      <section className="admin-agenda" aria-label="Agenda del dia">
        <h2>Agenda de hoy</h2>
        {agendaToday.length === 0 ? (
          <p className="admin-status">No hay turnos cargados para hoy.</p>
        ) : (
          <ul className="admin-agenda-list">
            {agendaToday.map((booking) => (
              <li key={`agenda-${booking.id}`} className="admin-agenda-item">
                <p className="admin-agenda-time">{booking.appointment_time}</p>
                <div>
                  <strong>{booking.name}</strong>
                  <p>
                    {booking.service} · {booking.barber}
                  </p>
                </div>
                <span className={`status-pill status-${booking.status || "pending"}`}>
                  {BOOKING_STATUS_LABELS[booking.status] || "Pendiente"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-weekly" aria-label="Calendario semanal">
        <div className="admin-weekly-header">
          <h2>Calendario semanal</h2>
          <p className="admin-status">{weekRangeLabel}</p>
          <div className="admin-week-view-toggle">
            <button
              className={`btn ${weeklyViewMode === "days" ? "btn-primary" : "btn-secondary"}`}
              type="button"
              onClick={() => setWeeklyViewMode("days")}
            >
              Vista por dia
            </button>
            <button
              className={`btn ${weeklyViewMode === "barber" ? "btn-primary" : "btn-secondary"}`}
              type="button"
              onClick={() => setWeeklyViewMode("barber")}
            >
              Vista por barbero
            </button>
          </div>
          <div className="admin-weekly-actions">
            <button className="btn btn-secondary" type="button" onClick={() => shiftCalendarWeek(-1)}>
              Semana anterior
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setCalendarWeekStart(getWeekStart(todayDateKey))}
            >
              Semana actual
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => shiftCalendarWeek(1)}>
              Semana siguiente
            </button>
            <button className="btn btn-primary" type="button" onClick={handleApplyWeekFilters}>
              Cargar esta semana
            </button>
          </div>

          <div className="admin-drop-statuses" aria-label="Cambiar estado por arrastre">
            <p className="admin-status">Arrastra un turno para cambiar estado rapido:</p>
            <div className="admin-drop-grid">
              {BOOKING_STATUSES.map((status) => (
                <div
                  key={`drop-${status}`}
                  className={`admin-drop-zone status-${status}${dragTargetStatus === status ? " is-over" : ""}`}
                  onDragOver={(event) => handleStatusDragOver(event, status)}
                  onDragLeave={() => handleStatusDragLeave(status)}
                  onDrop={(event) => handleStatusDrop(event, status)}
                >
                  <strong>{BOOKING_STATUS_LABELS[status]}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {weeklyViewMode === "days" ? (
          <div className="admin-week-grid">
            {weeklyCalendar.map((day) => (
              <article key={day.dateKey} className="admin-week-day">
                <header className="admin-week-day-head">
                  <p>{day.shortLabel}</p>
                  <strong>{day.dayLabel}</strong>
                </header>

                {day.bookings.length === 0 ? (
                  <p className="admin-week-empty">Sin reservas</p>
                ) : (
                  <ul className="admin-week-list">
                    {day.bookings.map((booking) => (
                    <li
                      key={`week-${day.dateKey}-${booking.id}`}
                      className={`admin-week-item${draggingBooking?.id === booking.id ? " is-dragging" : ""}`}
                      draggable={updatingId !== booking.id && deletingId !== booking.id}
                      onDragStart={(event) => handleDragStart(event, booking)}
                      onDragEnd={handleDragEnd}
                    >
                      <p className="admin-week-time">{booking.appointment_time}</p>
                      <strong>{booking.name}</strong>
                      <p>
                          {booking.service} · {booking.barber}
                        </p>
                        <span className={`status-pill status-${booking.status || "pending"}`}>
                          {BOOKING_STATUS_LABELS[booking.status] || "Pendiente"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        ) : weeklyByBarber.length === 0 ? (
          <p className="admin-week-empty">No hay reservas en esta semana.</p>
        ) : (
          <div className="admin-week-barber-rows">
            {weeklyByBarber.map((barberGroup) => (
              <article key={barberGroup.barber} className="admin-week-barber-row">
                <header className="admin-week-barber-head">
                  <h3>{barberGroup.barber}</h3>
                </header>

                <div className="admin-week-barber-grid">
                  {barberGroup.days.map((day) => (
                    <section key={`${barberGroup.barber}-${day.dateKey}`} className="admin-week-barber-day">
                      <p className="admin-week-barber-day-label">
                        {day.shortLabel} {day.dayLabel}
                      </p>

                      {day.bookings.length === 0 ? (
                        <p className="admin-week-empty">Sin reservas</p>
                      ) : (
                        <ul className="admin-week-barber-list">
                          {day.bookings.map((booking) => (
                            <li
                              key={`barber-week-${booking.id}-${day.dateKey}`}
                              className={`admin-week-barber-item${draggingBooking?.id === booking.id ? " is-dragging" : ""}`}
                              draggable={updatingId !== booking.id && deletingId !== booking.id}
                              onDragStart={(event) => handleDragStart(event, booking)}
                              onDragEnd={handleDragEnd}
                            >
                              <p className="admin-week-time">{booking.appointment_time}</p>
                              <strong>{booking.name}</strong>
                              <p>{booking.service}</p>
                              <span className={`status-pill status-${booking.status || "pending"}`}>
                                {BOOKING_STATUS_LABELS[booking.status] || "Pendiente"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

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
              <th>Estado</th>
              <th>Creado</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {!hasBookings ? (
              <tr>
                <td colSpan={9}>Sin datos para mostrar.</td>
              </tr>
            ) : (
              sortedBookings.map((booking) => {
                const draftStatus = statusDrafts[booking.id] || booking.status || "pending";

                return (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.name}</td>
                    <td>{booking.phone}</td>
                    <td>{booking.service}</td>
                    <td>{booking.barber}</td>
                    <td>{formatDate(booking.appointment_date, booking.appointment_time)}</td>
                    <td>
                      <span className={`status-pill status-${booking.status || "pending"}`}>
                        {BOOKING_STATUS_LABELS[booking.status] || "Pendiente"}
                      </span>
                    </td>
                    <td>{formatCreatedAt(booking.created_at)}</td>
                    <td>
                      <div className="admin-action">
                        <select
                          value={draftStatus}
                          onChange={(event) =>
                            setStatusDrafts((current) => ({
                              ...current,
                              [booking.id]: event.target.value
                            }))
                          }
                        >
                          {BOOKING_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {BOOKING_STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-secondary"
                          type="button"
                          disabled={
                            updatingId === booking.id ||
                            deletingId === booking.id ||
                            draftStatus === booking.status
                          }
                          onClick={() => handleStatusUpdate(booking.id)}
                        >
                          {updatingId === booking.id ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          className="btn btn-danger"
                          type="button"
                          disabled={deletingId === booking.id || updatingId === booking.id}
                          onClick={() => handleDeleteBooking(booking.id)}
                        >
                          {deletingId === booking.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
