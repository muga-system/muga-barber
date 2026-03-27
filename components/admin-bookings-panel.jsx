"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS } from "../lib/booking-status";
import { CalendarMinus2, Check, Eye, EyeOff, RotateCcw, Search } from "lucide-react";

const AGENDA_TIME_SLOTS = ["09:00", "10:30", "12:00", "14:00", "16:30", "18:00", "19:30", "20:15"];

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

function parseMonthKey(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1, 12, 0, 0);
}

function toMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function addMonths(monthKey, amount) {
  const date = parseMonthKey(monthKey);
  date.setMonth(date.getMonth() + amount);
  return toMonthKey(date);
}

function getMonthRange(monthKey) {
  const monthStart = parseMonthKey(monthKey);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 12, 0, 0);

  return {
    from: toDateKey(monthStart),
    to: toDateKey(monthEnd)
  };
}

function getMonthCalendarStart(monthKey) {
  return getWeekStart(`${monthKey}-01`);
}

function getStatusLabel(status) {
  return BOOKING_STATUS_LABELS[status] || status;
}

function getShortName(name) {
  if (!name) return "Cliente";
  return String(name).trim().split(/\s+/)[0] || "Cliente";
}

function normalizeBookingRecord(record) {
  return {
    ...record,
    appointment_date: record.appointment_date || record.date || "",
    appointment_time: record.appointment_time || record.time || "",
    created_at: record.created_at || record.createdAt || new Date().toISOString(),
    updated_at: record.updated_at || record.updatedAt || record.created_at || record.createdAt || new Date().toISOString(),
    status: record.status || "pending"
  };
}

function getLocalBookingsSafe() {
  try {
    const stored = localStorage.getItem("muga_bookings");
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeBookingRecord);
  } catch {
    return [];
  }
}

function mergeBookings(primaryBookings, secondaryBookings) {
  const merged = [];
  const seen = new Set();

  [...primaryBookings, ...secondaryBookings].forEach((booking) => {
    const normalized = normalizeBookingRecord(booking);
    const signature = `${normalized.id}-${normalized.created_at}-${normalized.appointment_date}-${normalized.appointment_time}`;

    if (seen.has(signature)) {
      return;
    }

    seen.add(signature);
    merged.push(normalized);
  });

  return merged;
}

function getBookingRenderKey(booking, scope, suffix = "") {
  return [
    scope,
    booking.id,
    booking.created_at || "",
    booking.updated_at || "",
    booking.appointment_date || booking.dateKey || "",
    booking.appointment_time || "",
    suffix
  ].join("-");
}

function getBookingSignature(booking) {
  return `${booking.id}-${booking.created_at || ""}-${booking.appointment_date || ""}-${booking.appointment_time || ""}`;
}

function EmptyCalendarState() {
  return (
    <p className="admin-week-empty" aria-label="Sin reservas" title="Sin reservas">
      <CalendarMinus2 size={15} aria-hidden="true" />
    </p>
  );
}

export default function AdminBookingsPanel() {
  const todayDateKey = new Date().toISOString().slice(0, 10);

  const [authState, setAuthState] = useState("checking");
  const [authKey, setAuthKey] = useState("demo-admin-key-2026");
  const [showPassword, setShowPassword] = useState(false);
  const [statusText, setStatusText] = useState("Validando sesion…");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [updatingKey, setUpdatingKey] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);
  const [draggingBooking, setDraggingBooking] = useState(null);
  const [dragTargetStatus, setDragTargetStatus] = useState(null);
  const [undoState, setUndoState] = useState(null);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    const localBookings = getLocalBookingsSafe();
    if (localBookings.length > 0) {
      setBookings((prev) => mergeBookings(prev, localBookings));
    }
  }, []);

  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    from: "",
    to: ""
  });

  const [statusDrafts, setStatusDrafts] = useState({});
  const [calendarWeekStart, setCalendarWeekStart] = useState(getWeekStart(todayDateKey));
  const [calendarMonth, setCalendarMonth] = useState(todayDateKey.slice(0, 7));
  const [weeklyViewMode, setWeeklyViewMode] = useState("days");
  const [monthlyViewMode, setMonthlyViewMode] = useState("days");

  useEffect(
    () => () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
      document.body.classList.remove("is-dragging");
    },
    []
  );

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => toAppointmentTimestamp(a) - toAppointmentTimestamp(b)),
    [bookings]
  );

  const bookingsByDate = useMemo(() => {
    const map = new Map();

    sortedBookings.forEach((booking) => {
      const dateKey = normalizeDateKey(booking.appointment_date);
      if (!dateKey) return;

      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }

      map.get(dateKey).push(booking);
    });

    return map;
  }, [sortedBookings]);

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

  const agendaTodayByTime = useMemo(() => {
    const map = new Map();
    agendaToday.forEach((booking) => {
      const time = booking.appointment_time || "";
      if (!time || map.has(time)) return;
      map.set(time, booking);
    });
    return map;
  }, [agendaToday]);

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
    return weekDays.map((day) => ({
      ...day,
      bookings: bookingsByDate.get(day.dateKey) || []
    }));
  }, [bookingsByDate, weekDays]);

  const monthRange = useMemo(() => getMonthRange(calendarMonth), [calendarMonth]);

  const monthRangeLabel = useMemo(() => {
    const labelDate = parseMonthKey(calendarMonth);
    const label = labelDate.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric"
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [calendarMonth]);

  const monthlyCalendar = useMemo(() => {
    const startDateKey = getMonthCalendarStart(calendarMonth);

    return Array.from({ length: 42 }, (_, index) => {
      const dateKey = addDays(startDateKey, index);

      return {
        dateKey,
        inCurrentMonth: dateKey.slice(0, 7) === calendarMonth,
        isToday: dateKey === todayDateKey,
        shortLabel: formatDateKey(dateKey, { day: "2-digit" }),
        weekDayLabel: formatDateKey(dateKey, { weekday: "short" }),
        bookings: bookingsByDate.get(dateKey) || []
      };
    });
  }, [bookingsByDate, calendarMonth, todayDateKey]);

  const monthlyCurrentDays = useMemo(
    () => monthlyCalendar.filter((day) => day.inCurrentMonth),
    [monthlyCalendar]
  );

  const monthlyByBarber = useMemo(() => {
    const barberMap = new Map();

    monthlyCurrentDays.forEach((day) => {
      day.bookings.forEach((booking) => {
        const barberName = booking.barber || "Sin barbero";

        if (!barberMap.has(barberName)) {
          barberMap.set(barberName, []);
        }

        barberMap.get(barberName).push({
          ...booking,
          dateKey: day.dateKey,
          dateLabel: formatDateKey(day.dateKey, {
            day: "2-digit",
            month: "2-digit"
          })
        });
      });
    });

    return Array.from(barberMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([barber, barberBookings]) => ({
        barber,
        bookings: barberBookings.sort((a, b) => toAppointmentTimestamp(a) - toAppointmentTimestamp(b))
      }));
  }, [monthlyCurrentDays]);

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
          setStatusText("Sesion iniciada. Cargando reservas…");
          await loadBookings();
          return;
        }

        if (authKey) {
          try {
            const autoLoginSucceeded = await authenticateSession(authKey);
            if (autoLoginSucceeded) {
              setAuthState("authenticated");
              setAuthKey("");
              setStatusText("Sesion iniciada. Cargando reservas…");
              await loadBookings();
              return;
            }
          } catch {
            // If auto login fails, we keep the manual login form visible.
          }
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

  async function authenticateSession(key) {
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ key })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Clave invalida.");
    }

    return true;
  }

  async function handleLogin(event) {
    event.preventDefault();

    if (!authKey) {
      setStatusText("Debes ingresar una clave valida.");
      return;
    }

    setStatusText("Validando clave…");

    try {
      await authenticateSession(authKey);

      setAuthState("authenticated");
      setAuthKey("");
      setStatusText("Sesion iniciada. Cargando reservas…");
      await loadBookings();
    } catch (error) {
      setAuthState("unauthenticated");
      setStatusText(error.message || "No se pudo iniciar sesion.");
    }
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

      const nextBookings = (payload.bookings || []).map(normalizeBookingRecord);
      const localBookings = getLocalBookingsSafe();
      const mergedBookings = mergeBookings(nextBookings, localBookings);

      clearUndoState();
      setBookings(mergedBookings);
      setDraggingBooking(null);
      setDragTargetStatus(null);

      const draftMap = {};
      mergedBookings.forEach((booking) => {
        draftMap[getBookingSignature(booking)] = booking.status || "pending";
      });
      setStatusDrafts(draftMap);

      setStatusText(`Reservas cargadas: ${mergedBookings.length}`);
    } catch (error) {
      setBookings([]);
      setStatusDrafts({});
      setStatusText(error.message || "No se pudo cargar el listado.");
    } finally {
      setLoadingBookings(false);
    }
  }

  function clearUndoState() {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoState(null);
  }

  function openUndoState(nextUndoState) {
    clearUndoState();
    setUndoState(nextUndoState);

    undoTimerRef.current = setTimeout(() => {
      setUndoState(null);
      undoTimerRef.current = null;
    }, 5000);
  }

  async function updateBookingStatus(booking, nextStatus, source = "panel", options = {}) {
    const { fromStatus, allowUndo = true } = options;
    const bookingId = booking.id;
    const bookingKey = getBookingSignature(booking);
    if (!nextStatus) return;

    setUpdatingKey(bookingKey);

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
          getBookingSignature(booking) === bookingKey
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
        [bookingKey]: payload.booking.status
      }));

      if (allowUndo && fromStatus && fromStatus !== payload.booking.status) {
        openUndoState({
          bookingId,
          bookingKey,
          fromStatus,
          toStatus: payload.booking.status
        });
      }

      const statusLabel = getStatusLabel(payload.booking.status);
      setStatusText(
        source === "drag"
          ? `Turno #${bookingId} movido a ${statusLabel}.`
          : source === "undo"
            ? `Cambio revertido. Reserva #${bookingId} en ${statusLabel}.`
          : `Reserva #${bookingId} actualizada a ${statusLabel}.`
      );
    } catch (error) {
      setStatusText(error.message || "No se pudo actualizar el estado.");
    } finally {
      setUpdatingKey(null);
    }
  }

  async function handleStatusUpdate(booking) {
    const bookingKey = getBookingSignature(booking);
    const nextStatus = statusDrafts[bookingKey];
    await updateBookingStatus(booking, nextStatus, "panel", {
      fromStatus: booking?.status
    });
  }

  async function handleUndoStatusChange() {
    if (!undoState) return;

    const { bookingKey, fromStatus, toStatus } = undoState;
    clearUndoState();

    const current = bookings.find((item) => getBookingSignature(item) === bookingKey);
    if (!current) {
      return;
    }

    await updateBookingStatus(current, fromStatus, "undo", {
      fromStatus: toStatus,
      allowUndo: false
    });
  }

  async function handleDeleteBooking(booking) {
    const bookingId = booking.id;
    const bookingKey = getBookingSignature(booking);
    const confirmed = window.confirm(`Eliminar reserva #${bookingId}? Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    setDeletingKey(bookingKey);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE"
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo eliminar la reserva.");
      }

      setBookings((current) => current.filter((item) => getBookingSignature(item) !== bookingKey));
      setStatusDrafts((current) => {
        const next = { ...current };
        delete next[bookingKey];
        return next;
      });
      setStatusText(`Reserva #${bookingId} eliminada.`);
    } catch (error) {
      setStatusText(error.message || "No se pudo eliminar la reserva.");
    } finally {
      setDeletingKey(null);
    }
  }

  function shiftCalendarWeek(direction) {
    setCalendarWeekStart((current) => addDays(current, direction * 7));
  }

  function shiftCalendarMonth(direction) {
    setCalendarMonth((current) => addMonths(current, direction));
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

  async function handleApplyMonthFilters() {
    const nextFilters = {
      ...filters,
      from: monthRange.from,
      to: monthRange.to
    };

    setFilters(nextFilters);
    await loadBookings(nextFilters);
  }

  function handleDragStart(event, booking) {
    if (!booking?.id) return;

    document.body.classList.add("is-dragging");

    setDraggingBooking({
      id: booking.id,
      status: booking.status || "pending"
    });

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(booking.id));
      event.dataTransfer.setData("application/x-booking-id", String(booking.id));
      event.dataTransfer.setData("application/x-booking-status", booking.status || "pending");
    }
  }

  function handleDragEnd() {
    document.body.classList.remove("is-dragging");
    setDraggingBooking(null);
    setDragTargetStatus(null);
  }

  function handleStatusDragOver(event, targetStatus) {
    const bookingIdFromTransfer = event.dataTransfer?.getData("application/x-booking-id");
    const bookingStatusFromTransfer = event.dataTransfer?.getData("application/x-booking-status");
    const effectiveStatus = draggingBooking?.status || bookingStatusFromTransfer;

    if (!draggingBooking && !bookingIdFromTransfer) {
      return;
    }

    if (effectiveStatus && effectiveStatus === targetStatus) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    setDragTargetStatus(targetStatus);
  }

  function handleStatusDragLeave(targetStatus) {
    if (dragTargetStatus === targetStatus) {
      setDragTargetStatus(null);
    }
  }

  async function handleStatusDrop(event, targetStatus) {
    event.preventDefault();

    const bookingIdFromTransfer = event.dataTransfer?.getData("application/x-booking-id");
    const bookingId = draggingBooking?.id || bookingIdFromTransfer;

    if (!bookingId) {
      setDragTargetStatus(null);
      return;
    }

    const currentBooking = bookings.find((booking) => String(booking.id) === String(bookingId));
    if (!currentBooking) {
      setDragTargetStatus(null);
      setDraggingBooking(null);
      return;
    }

    if ((currentBooking.status || "pending") === targetStatus) {
      setStatusText("El turno ya tiene ese estado.");
      setDraggingBooking(null);
      setDragTargetStatus(null);
      return;
    }

    await updateBookingStatus(bookingId, targetStatus, "drag", {
      fromStatus: currentBooking.status || "pending"
    });
    document.body.classList.remove("is-dragging");
    setDraggingBooking(null);
    setDragTargetStatus(null);
  }

  if (authState === "checking") {
    return (
      <section className="admin-panel">
        <div className="admin-form">
          <p className="admin-status" role="status" aria-live="polite">
            Validando sesion…
          </p>
        </div>
      </section>
    );
  }

  if (authState === "misconfigured") {
    return (
      <section className="admin-panel">
        <div className="admin-form">
          <p className="admin-status" role="status" aria-live="polite">
            {statusText}
          </p>
        </div>
      </section>
    );
  }

  if (authState !== "authenticated") {
    return (
      <section className="admin-panel">
        <form className="admin-form" onSubmit={handleLogin}>
          <label>
            Clave de administrador
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={authKey}
                onChange={(event) => setAuthKey(event.target.value)}
                placeholder="Ingresa la clave"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <div className="admin-login-actions">
            <button className="btn btn-primary" type="submit">
              Iniciar sesion
            </button>
          </div>
        </form>

        <p className="admin-status" role="status" aria-live="polite">
          {statusText}
        </p>
      </section>
    );
  }

  return (
    <section className="admin-panel">
      <div className="admin-toolbar">
        <form
          className="admin-filters"
          onSubmit={(event) => {
            event.preventDefault();
            loadBookings();
          }}
        >
          <label className="admin-inline-field admin-search-field">
            <span className="sr-only">Buscar</span>
            <Search size={15} aria-hidden="true" />
            <input
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              placeholder="Buscar cliente, servicio o telefono"
            />
          </label>

          <label className="admin-inline-field">
            <span className="sr-only">Estado</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="all">Todos los estados</option>
              {BOOKING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {BOOKING_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-inline-field">
            <span className="sr-only">Desde</span>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
            />
          </label>

          <label className="admin-inline-field">
            <span className="sr-only">Hasta</span>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
            />
          </label>

          <button className="btn btn-primary" type="submit" disabled={loadingBookings}>
            {loadingBookings ? "Filtrando…" : "Aplicar"}
          </button>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              const nextFilters = {
                q: "",
                status: "all",
                from: "",
                to: ""
              };
              setFilters(nextFilters);
              loadBookings(nextFilters);
            }}
            aria-label="Limpiar filtros"
            title="Limpiar filtros"
          >
            <RotateCcw size={14} aria-hidden="true" />
          </button>
        </form>

        <div className="admin-filter-shortcuts" role="group" aria-label="Filtros rapidos">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const nextFilters = { ...filters, from: todayDateKey, to: todayDateKey };
              setFilters(nextFilters);
              loadBookings(nextFilters);
            }}
          >
            Hoy
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const nextFilters = { ...filters, from: calendarWeekStart, to: addDays(calendarWeekStart, 6) };
              setFilters(nextFilters);
              loadBookings(nextFilters);
            }}
          >
            Semana
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const month = getMonthRange(calendarMonth);
              const nextFilters = { ...filters, from: month.from, to: month.to };
              setFilters(nextFilters);
              loadBookings(nextFilters);
            }}
          >
            Mes
          </button>
        </div>
      </div>

      <p className="admin-status" role="status" aria-live="polite">
        {statusText}
      </p>

      {undoState ? (
        <aside className="admin-toast" role="status" aria-live="polite">
          <p>
            Estado actualizado a <strong>{getStatusLabel(undoState.toStatus)}</strong>.
          </p>
          <div className="admin-toast-actions">
            <button className="btn btn-secondary" type="button" onClick={handleUndoStatusChange}>
              Deshacer
            </button>
            <button className="btn btn-secondary" type="button" onClick={clearUndoState}>
              Cerrar
            </button>
          </div>
        </aside>
      ) : null}

      <div className="admin-kpis">
        <article className="admin-kpi kpi-total">
          <h2>Total</h2>
          <p>{stats.total}</p>
        </article>
        <article className="admin-kpi kpi-pending">
          <h2>Pendientes</h2>
          <p>{stats.pending}</p>
        </article>
        <article className="admin-kpi kpi-confirmed">
          <h2>Confirmadas</h2>
          <p>{stats.confirmed}</p>
        </article>
        <article className="admin-kpi kpi-completed">
          <h2>Completadas</h2>
          <p>{stats.completed}</p>
        </article>
        <article className="admin-kpi kpi-cancelled">
          <h2>Canceladas</h2>
          <p>{stats.cancelled}</p>
        </article>
      </div>

      <section className="admin-agenda" aria-label="Agenda del dia">
        <h2>Agenda de hoy</h2>

        <div className="admin-agenda-today-grid" aria-label="Horarios de hoy">
          {AGENDA_TIME_SLOTS.map((time) => {
            const booking = agendaTodayByTime.get(time);
            const status = booking?.status || "";

            return (
              <span
                key={`agenda-today-${time}`}
                className={`agenda-slot${booking ? " is-taken" : " is-free"}${status ? ` status-${status}` : ""}`}
                title={booking ? `${time} · ${booking.name} · ${booking.service}` : `${time} · Disponible`}
              />
            );
          })}
        </div>
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
                  onDragEnter={(event) => handleStatusDragOver(event, status)}
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
                  <EmptyCalendarState />
                ) : (
                  <>
                    <ul className="admin-week-chip-list" role="list" aria-label={`Turnos del ${day.dayLabel}`}>
                      {day.bookings.slice(0, 6).map((booking, index) => (
                        (() => {
                          const bookingKey = getBookingSignature(booking);
                          return (
                        <li
                          key={getBookingRenderKey(booking, `week-${day.dateKey}`, index)}
                          role="listitem"
                          className={`admin-week-chip status-${booking.status || "pending"}${draggingBooking?.id === booking.id ? " is-dragging" : ""}`}
                          draggable={updatingKey !== bookingKey && deletingKey !== bookingKey}
                          onDragStart={(event) => handleDragStart(event, booking)}
                          onDragEnd={handleDragEnd}
                          title={`${booking.appointment_time} · ${booking.name} · ${booking.service}`}
                        >
                          <span className="chip-time">{booking.appointment_time}</span>
                          <span className="chip-name">{getShortName(booking.name)}</span>
                        </li>
                          );
                        })()
                      ))}
                    </ul>
                    {day.bookings.length > 6 ? <p className="admin-week-more">+{day.bookings.length - 6} más</p> : null}
                  </>
                )}
              </article>
            ))}
          </div>
        ) : weeklyByBarber.length === 0 ? (
          <EmptyCalendarState />
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
                        <EmptyCalendarState />
                      ) : (
                        <>
                          <ul className="admin-week-chip-list" role="list" aria-label={`Turnos de ${barberGroup.barber} ${day.dayLabel}`}>
                            {day.bookings.slice(0, 6).map((booking, index) => (
                              (() => {
                                const bookingKey = getBookingSignature(booking);
                                return (
                              <li
                                key={getBookingRenderKey(booking, `barber-week-${day.dateKey}`, index)}
                                role="listitem"
                                className={`admin-week-chip status-${booking.status || "pending"}${draggingBooking?.id === booking.id ? " is-dragging" : ""}`}
                                draggable={updatingKey !== bookingKey && deletingKey !== bookingKey}
                                onDragStart={(event) => handleDragStart(event, booking)}
                                onDragEnd={handleDragEnd}
                                title={`${booking.appointment_time} · ${booking.name} · ${booking.service}`}
                              >
                                <span className="chip-time">{booking.appointment_time}</span>
                                <span className="chip-name">{getShortName(booking.name)}</span>
                              </li>
                                );
                              })()
                            ))}
                          </ul>
                          {day.bookings.length > 6 ? <p className="admin-week-more">+{day.bookings.length - 6} más</p> : null}
                        </>
                      )}
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-monthly" aria-label="Calendario mensual">
        <div className="admin-monthly-header">
          <h2>Calendario mensual</h2>
          <p className="admin-status">{monthRangeLabel}</p>

          <div className="admin-month-view-toggle">
            <button
              className={`btn ${monthlyViewMode === "days" ? "btn-primary" : "btn-secondary"}`}
              type="button"
              onClick={() => setMonthlyViewMode("days")}
            >
              Vista por dia
            </button>
            <button
              className={`btn ${monthlyViewMode === "barber" ? "btn-primary" : "btn-secondary"}`}
              type="button"
              onClick={() => setMonthlyViewMode("barber")}
            >
              Vista por barbero
            </button>
          </div>

          <div className="admin-monthly-actions">
            <button className="btn btn-secondary" type="button" onClick={() => shiftCalendarMonth(-1)}>
              Mes anterior
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setCalendarMonth(todayDateKey.slice(0, 7))}
            >
              Mes actual
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => shiftCalendarMonth(1)}>
              Mes siguiente
            </button>
            <button className="btn btn-primary" type="button" onClick={handleApplyMonthFilters}>
              Cargar este mes
            </button>
          </div>
        </div>

        {monthlyViewMode === "days" ? (
          <div className="admin-month-grid">
            {monthlyCalendar.map((day) => (
              <article
                key={`month-${day.dateKey}`}
                className={`admin-month-day${day.inCurrentMonth ? "" : " is-outside"}${day.isToday ? " is-today" : ""}`}
              >
                <header className="admin-month-day-head">
                  <p>{day.weekDayLabel}</p>
                  <strong>{day.shortLabel}</strong>
                </header>

                {day.bookings.length === 0 ? (
                  <EmptyCalendarState />
                ) : (
                  <>
                    <ul className="admin-week-chip-list" role="list" aria-label={`Turnos del ${day.dayLabel}`}>
                      {day.bookings.slice(0, 6).map((booking, index) => {
                        const bookingKey = getBookingSignature(booking);
                        return (
                          <li
                            key={getBookingRenderKey(booking, `month-booking-${day.dateKey}`, index)}
                            role="listitem"
                            className={`admin-week-chip status-${booking.status || "pending"}${draggingBooking?.id === booking.id ? " is-dragging" : ""}`}
                            draggable={updatingKey !== bookingKey && deletingKey !== bookingKey}
                            onDragStart={(event) => handleDragStart(event, booking)}
                            onDragEnd={handleDragEnd}
                            title={`${booking.appointment_time} · ${booking.name} · ${booking.service}`}
                          >
                            <span className="chip-time">{booking.appointment_time}</span>
                            <span className="chip-name">{getShortName(booking.name)}</span>
                          </li>
                        );
                      })}
                    </ul>
                    {day.bookings.length > 6 ? <p className="admin-week-more">+{day.bookings.length - 6} más</p> : null}
                  </>
                )}

              </article>
            ))}
          </div>
        ) : monthlyByBarber.length === 0 ? (
          <EmptyCalendarState />
        ) : (
          <div className="admin-month-barber-rows">
            {monthlyByBarber.map((group) => (
              <article key={`month-barber-${group.barber}`} className="admin-month-barber-row">
                <header className="admin-month-barber-head">
                  <h3>{group.barber}</h3>
                  <p>{group.bookings.length} turnos</p>
                </header>

                <ul className="admin-month-barber-list">
                  {group.bookings.map((booking, index) => {
                    const bookingKey = getBookingSignature(booking);
                    return (
                      <li
                        key={getBookingRenderKey(booking, `month-barber-booking-${booking.dateKey}`, index)}
                        className={`admin-week-chip status-${booking.status || "pending"}${draggingBooking?.id === booking.id ? " is-dragging" : ""}`}
                        draggable={updatingKey !== bookingKey && deletingKey !== bookingKey}
                        onDragStart={(event) => handleDragStart(event, booking)}
                        onDragEnd={handleDragEnd}
                        title={`${booking.dateLabel} ${booking.appointment_time} · ${booking.name} · ${booking.service}`}
                      >
                        <span className="chip-time">{booking.appointment_time}</span>
                        <span className="chip-name">{getShortName(booking.name)}</span>
                      </li>
                    );
                  })}
                </ul>
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
              sortedBookings.map((booking, index) => {
                const bookingKey = getBookingSignature(booking);
                const draftStatus = statusDrafts[bookingKey] || booking.status || "pending";

                return (
                  <tr key={getBookingRenderKey(booking, "table", index)}>
                    <td>#{booking.id}</td>
                    <td>{booking.name}</td>
                    <td>{booking.phone}</td>
                    <td>{booking.service}</td>
                    <td>{booking.barber}</td>
                    <td>{formatDate(booking.appointment_date, booking.appointment_time)}</td>
                    <td>
                      <span
                        className={`status-pill status-${booking.status || "pending"}${booking.status === "confirmed" ? " status-pill-icon" : ""}`}
                        aria-label={BOOKING_STATUS_LABELS[booking.status] || "Pendiente"}
                        title={BOOKING_STATUS_LABELS[booking.status] || "Pendiente"}
                      >
                        {booking.status === "confirmed" ? <Check size={13} aria-hidden="true" /> : BOOKING_STATUS_LABELS[booking.status] || "Pendiente"}
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
                              [bookingKey]: event.target.value
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
                            updatingKey === bookingKey ||
                            deletingKey === bookingKey ||
                            draftStatus === booking.status
                          }
                          onClick={() => handleStatusUpdate(booking)}
                        >
                          {updatingKey === bookingKey ? "Guardando…" : "Guardar"}
                        </button>
                        <button
                          className="btn btn-danger"
                          type="button"
                          disabled={deletingKey === bookingKey || updatingKey === bookingKey}
                          onClick={() => handleDeleteBooking(booking)}
                        >
                          {deletingKey === bookingKey ? "Eliminando…" : "Eliminar"}
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
