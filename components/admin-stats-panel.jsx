"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  BarChart3,
  Clock3,
  Download,
  RefreshCw,
  SlidersHorizontal,
  TrendingUp
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart
} from "recharts";
import { BOOKING_STATUS_LABELS } from "../lib/booking-status";
import { buildAdminStats, formatDateLabel, normalizeDateKey } from "../lib/admin-stats";

function asPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function getDeltaLabel(current, previous) {
  if (previous === 0 && current === 0) return "0%";
  if (previous === 0) return "+100%";
  const delta = ((current - previous) / previous) * 100;
  const rounded = Math.round(delta);
  if (rounded > 0) return `+${rounded}%`;
  return `${rounded}%`;
}

function getDeltaClass(current, previous) {
  if (current > previous) return "is-up";
  if (current < previous) return "is-down";
  return "is-neutral";
}

const RANGE_OPTIONS = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 }
];

const STATUS_COLORS = {
  pending: "#d9a441",
  confirmed: "#4da678",
  completed: "#4f8dc7",
  cancelled: "#c8655e"
};

const CHART_COLORS = ["#c7a26a", "#7ab89a", "#7eaed1", "#d77b73", "#9d88c7", "#7d97a5"];

const TOOLTIP_STYLE = {
  backgroundColor: "#1f1a15",
  border: "1px solid #3a3229",
  borderRadius: "10px",
  color: "#f1e9dd"
};

export default function AdminStatsPanel() {
  const todayDateKey = new Date().toISOString().slice(0, 10);
  const [authState, setAuthState] = useState("checking");
  const [authKey, setAuthKey] = useState("demo-admin-key-2026");
  const [statusText, setStatusText] = useState("Validando sesion…");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rangeDays, setRangeDays] = useState(30);

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

  async function loadBookings() {
    setLoading(true);
    try {
      const response = await fetch("/api/bookings", { method: "GET" });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setAuthState("unauthenticated");
        setStatusText("Sesion vencida. Vuelve a ingresar la clave.");
        setBookings([]);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "No se pudieron cargar las estadisticas.");
      }

      const nextBookings = payload.bookings || [];
      setBookings(nextBookings);
      setStatusText(`Reservas analizadas: ${nextBookings.length}`);
    } catch (error) {
      setBookings([]);
      setStatusText(error.message || "No se pudieron cargar las estadisticas.");
    } finally {
      setLoading(false);
    }
  }

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
          setStatusText("Sesion iniciada. Cargando estadisticas…");
          await loadBookings();
          return;
        }

        if (authKey) {
          try {
            await authenticateSession(authKey);
            setAuthState("authenticated");
            setAuthKey("");
            setStatusText("Sesion iniciada. Cargando estadisticas…");
            await loadBookings();
            return;
          } catch {
            // fallback to manual login
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
      setStatusText("Sesion iniciada. Cargando estadisticas…");
      await loadBookings();
    } catch (error) {
      setAuthState("unauthenticated");
      setStatusText(error.message || "No se pudo iniciar sesion.");
    }
  }

  const stats = useMemo(() => {
    return buildAdminStats(bookings, todayDateKey, rangeDays);
  }, [bookings, todayDateKey, rangeDays]);

  function handleExportStatsCsv() {
    const lines = [
      ["Metrica", "Valor", "Periodo"].join(","),
      ["Turnos rango", stats.rangeTotals.total, `${stats.rangeStart} a ${stats.rangeEnd}`].join(","),
      ["Turnos periodo previo", stats.previousTotals.total, `${stats.previousStart} a ${stats.previousEnd}`].join(","),
      ["Turnos hoy", stats.totals.today, todayDateKey].join(","),
      ["Completadas", asPercent(stats.rangeCompletionRate), "rango"].join(","),
      ["Canceladas", asPercent(stats.rangeCancellationRate), "rango"].join(","),
      ["Demanda diaria", "", ""].join(",")
    ];

    stats.dailySeries.forEach((item) => {
      lines.push([item.dateKey, item.total, "turnos"].join(","));
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `estadisticas-${stats.rangeDays}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (authState === "checking" || authState === "misconfigured") {
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
            <input
              name="adminKey"
              type="password"
              value={authKey}
              onChange={(event) => setAuthKey(event.target.value)}
              placeholder="Ingresa la clave…"
              autoComplete="current-password"
            />
          </label>
          <div className="admin-login-actions">
            <button className="btn btn-primary" type="submit">
              Iniciar sesion
            </button>
            <a className="btn btn-secondary" href="/admin/reservas">
              Ir a Reservas
            </a>
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
      <div className="admin-toolbar-actions">
        <div className="range-toggle" role="group" aria-label="Rango de estadisticas">
          <span className="range-toggle-label">
            <SlidersHorizontal size={14} aria-hidden="true" />
            Rango
          </span>
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`btn btn-secondary${rangeDays === option.value ? " is-active" : ""}`}
              onClick={() => setRangeDays(option.value)}
              aria-pressed={rangeDays === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button className="btn btn-secondary" type="button" onClick={loadBookings} disabled={loading}>
          <RefreshCw size={15} aria-hidden="true" className={loading ? "is-spinning" : ""} />
          {loading ? "Actualizando…" : "Actualizar métricas"}
        </button>

        <button className="btn btn-secondary" type="button" onClick={handleExportStatsCsv}>
          <Download size={15} aria-hidden="true" />
          Exportar CSV
        </button>

        <a className="btn btn-secondary" href="/admin/reservas">
          Ver Operación
        </a>
      </div>

      <p className="admin-status" role="status" aria-live="polite">
        {statusText}
      </p>

      <div className="admin-kpis">
        <article className="admin-kpi">
          <h2>Total {rangeDays}d</h2>
          <p>{stats.rangeTotals.total}</p>
          <small className={`kpi-delta ${getDeltaClass(stats.rangeTotals.total, stats.previousTotals.total)}`}>
            {getDeltaLabel(stats.rangeTotals.total, stats.previousTotals.total)} vs periodo previo
          </small>
        </article>
        <article className="admin-kpi">
          <h2>Turnos Hoy</h2>
          <p>{stats.totals.today}</p>
        </article>
        <article className="admin-kpi">
          <h2>Completadas</h2>
          <p>{asPercent(stats.rangeCompletionRate)}</p>
          <small className={`kpi-delta ${getDeltaClass(stats.rangeCompletionRate, stats.previousCompletionRate)}`}>
            {getDeltaLabel(stats.rangeCompletionRate, stats.previousCompletionRate)} vs periodo previo
          </small>
        </article>
        <article className="admin-kpi">
          <h2>Canceladas</h2>
          <p>{asPercent(stats.rangeCancellationRate)}</p>
          <small className={`kpi-delta ${getDeltaClass(stats.rangeCancellationRate, stats.previousCancellationRate)}`}>
            {getDeltaLabel(stats.rangeCancellationRate, stats.previousCancellationRate)} vs periodo previo
          </small>
        </article>
      </div>

      <div className="stats-dashboard-grid">
        <article className="stats-card stats-card-wide">
          <h2><TrendingUp size={16} /> Demanda Últimos {rangeDays} Días</h2>
          <div className="stats-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,140,130,0.25)" />
                <XAxis dataKey="label" tick={{ fill: "#8b847b", fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#8b847b", fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} turnos`, "Demanda"]} />
                <Area type="monotone" dataKey="total" stroke="#6f5b46" fill="rgba(111, 91, 70, 0.24)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="stats-card">
          <h2><BarChart3 size={16} /> Estado De Reservas</h2>
          <div className="stats-chart-wrap stats-chart-wrap-sm">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusSeries}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={74}
                  paddingAngle={2}
                >
                  {stats.statusSeries.map((item) => (
                    <Cell key={item.key} fill={STATUS_COLORS[item.key]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} reservas`, "Total"]} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#8b847b" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="stats-card">
          <h2><CalendarDays size={16} /> Servicios Más Pedidos</h2>
          <div className="stats-chart-wrap stats-chart-wrap-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topServices} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,140,130,0.25)" />
                <XAxis dataKey="name" tick={{ fill: "#8b847b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#8b847b", fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} reservas`, "Total"]} />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {stats.topServices.map((item, index) => (
                    <Cell key={`service-${item.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="stats-card">
          <h2><BarChart3 size={16} /> Turnos Por Barbero</h2>
          <ul className="stats-list">
            {stats.topBarbers.map((item) => (
              <li key={item.name}>
                <span>{item.name}</span>
                <strong>{item.total}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="stats-card">
        <h2><Clock3 size={16} /> Próximos Turnos</h2>
        {stats.upcoming.length === 0 ? (
          <p className="admin-status">No hay turnos próximos.</p>
        ) : (
          <ul className="stats-list">
            {stats.upcoming.map((booking) => (
              <li key={`next-${booking.id}`}>
                <span>
                  {formatDateLabel(normalizeDateKey(booking.appointment_date))} · {booking.appointment_time || "--:--"} · {booking.name}
                </span>
                <strong>{BOOKING_STATUS_LABELS[booking.status] || "Pendiente"}</strong>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
