"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";

function toDayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function startOfWeekMonday(date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diffToMonday);
  return copy;
}

function formatWeekday(date) {
  const value = new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(date);
  return value.replace(".", "").slice(0, 2).toUpperCase();
}

function buildWeek(date) {
  const start = startOfWeekMonday(date);
  return Array.from({ length: 7 }, (_, index) => {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + index);
    return {
      date: dayDate,
      label: formatWeekday(dayDate),
      dayNumber: dayDate.getDate()
    };
  });
}

const FALLBACK_WEEK = [
  { label: "LU", dayNumber: 22, state: "muted" },
  { label: "MA", dayNumber: 23, state: "muted" },
  { label: "MI", dayNumber: 24, state: "available" },
  { label: "JU", dayNumber: 25, state: "available" },
  { label: "VI", dayNumber: 26, state: "available" },
  { label: "SA", dayNumber: 27, state: "today" },
  { label: "DO", dayNumber: 28, state: "available" }
];

export default function HeroAvailabilityCard({ slots }) {
  const [today, setToday] = useState(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const calendar = useMemo(() => {
    if (!today) {
      return {
        header: "Semana actual",
        summary: `${slots.length} cupos hoy`,
        days: FALLBACK_WEEK
      };
    }

    const week = buildWeek(today);
    const todayKey = toDayKey(today);
    const days = week.map((item) => {
      const itemKey = toDayKey(item.date);
      let state = "available";

      if (itemKey < todayKey) {
        state = "muted";
      }
      if (itemKey === todayKey) {
        state = "today";
      }

      return {
        ...item,
        state
      };
    });

    const monthLabel = new Intl.DateTimeFormat("es-AR", {
      month: "long",
      year: "numeric"
    }).format(today);

    return {
      header: monthLabel,
      summary: `${slots.length} cupos hoy`,
      days
    };
  }, [today, slots.length]);

  return (
    <aside className="hero-availability" aria-label="Disponibilidad de hoy">
      <p className="eyebrow">Disponibilidad de hoy</p>
      <h2>Ultimos cupos activos</h2>

      <div className="hero-calendar-widget" aria-hidden="true">
        <div className="hero-calendar-top">
          <p>{calendar.header}</p>
          <strong>{calendar.summary}</strong>
        </div>

        <div className="hero-calendar-weekdays">
          {calendar.days.map((item) => (
            <span key={`${item.label}-${item.dayNumber}`}>{item.label}</span>
          ))}
        </div>

        <div className="hero-calendar-days">
          {calendar.days.map((item) => (
            <span key={`day-${item.label}-${item.dayNumber}`} className={`hero-calendar-day is-${item.state}`}>
              <span className="hero-calendar-day-number">{item.dayNumber}</span>
              <span className="hero-calendar-day-slots">
                {item.state === "today"
                  ? slots.slice(0, 4).map((slot) => <i key={`dot-${slot}`} className="hero-calendar-dot" />)
                  : null}
              </span>
            </span>
          ))}
        </div>
      </div>

      <ul className="slot-list" aria-label="Horarios disponibles de hoy">
        {slots.map((slot) => (
          <li key={slot}>
            <a className="slot-chip" href={`/reservar/${slot.replace(":", "-")}`}>
              <Clock3 size={13} aria-hidden="true" />
              <span>{slot}</span>
            </a>
          </li>
        ))}
      </ul>

      <a className="btn btn-primary" href="/reservar" data-track="click_reservar_slots">
        Tomar horario
      </a>
    </aside>
  );
}
