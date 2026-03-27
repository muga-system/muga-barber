"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { trackEvent } from "../lib/analytics";

const SERVICES = ["Corte Signature", "Barba Ritual", "Full Grooming"];
const BARBERS = ["Franco", "Nico", "Santi"];
const TIME_SLOTS = [
  "09:00",
  "10:30",
  "12:00",
  "14:00",
  "16:30",
  "18:00",
  "19:30",
  "20:15"
];

const INITIAL_FORM = {
  name: "",
  phone: "",
  service: "",
  barber: "",
  date: "",
  time: ""
};

const FIELD_LABELS = {
  name: "Nombre y apellido",
  phone: "WhatsApp",
  service: "Servicio",
  barber: "Barbero",
  date: "Fecha",
  time: "Hora"
};

function normalizePhoneDigits(phone) {
  return (phone || "").replace(/\D/g, "");
}

function validateBookingForm(formData) {
  const errors = {};

  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = "Ingresa un nombre valido (minimo 2 caracteres).";
  }

  const phoneDigits = normalizePhoneDigits(formData.phone);
  if (!phoneDigits) {
    errors.phone = "Ingresa un WhatsApp de contacto.";
  } else if (phoneDigits.length < 8) {
    errors.phone = "El WhatsApp debe tener al menos 8 digitos.";
  } else if (/^(\d)\1+$/.test(phoneDigits)) {
    errors.phone = "Ese WhatsApp no parece valido. Revisa el numero completo.";
  }

  if (!SERVICES.includes(formData.service)) {
    errors.service = "Selecciona un servicio de la lista.";
  }

  if (!BARBERS.includes(formData.barber)) {
    errors.barber = "Selecciona un barbero de la lista.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date || "")) {
    errors.date = "Selecciona una fecha valida.";
  }

  if (!TIME_SLOTS.includes(formData.time)) {
    errors.time = "Selecciona un horario disponible.";
  }

  return errors;
}

function normalizeServerFieldErrors(details) {
  if (!details || typeof details !== "object") {
    return {};
  }

  return Object.entries(details).reduce((accumulator, [field, messages]) => {
    if (!Array.isArray(messages) || messages.length === 0) {
      return accumulator;
    }

    accumulator[field] = messages[0];
    return accumulator;
  }, {});
}

function buildMessage(formData, bookingId) {
  const details = [
    "Hola, quiero reservar un turno en Muga Barber:",
    `Nombre: ${formData.name}`,
    `Telefono: ${formData.phone}`,
    `Servicio: ${formData.service}`,
    `Barbero: ${formData.barber}`,
    `Fecha: ${formData.date}`,
    `Hora: ${formData.time}`
  ];

  if (bookingId) {
    details.push(`Codigo de reserva: #${bookingId}`);
  }

  return details.join("\n");
}

function getTodayISODate() {
  return new Date().toISOString().split("T")[0];
}

function saveToLocalStorage(booking) {
  const existing = JSON.parse(localStorage.getItem("muga_bookings") || "[]");
  const normalized = {
    ...booking,
    appointment_date: booking.appointment_date || booking.date || "",
    appointment_time: booking.appointment_time || booking.time || "",
    created_at: booking.created_at || booking.createdAt || new Date().toISOString(),
    updated_at: booking.updated_at || booking.createdAt || new Date().toISOString()
  };

  existing.unshift(normalized);
  localStorage.setItem("muga_bookings", JSON.stringify(existing.slice(0, 100)));
}

function getLocalBookings() {
  return JSON.parse(localStorage.getItem("muga_bookings") || "[]");
}

export default function BookingForm({ whatsappNumber, preselectedTime = "" }) {
  const [formData, setFormData] = useState(() => {
    if (!preselectedTime || !TIME_SLOTS.includes(preselectedTime)) {
      return INITIAL_FORM;
    }

    return {
      ...INITIAL_FORM,
      date: getTodayISODate(),
      time: preselectedTime
    };
  });
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(null);
  const minDate = useMemo(() => getTodayISODate(), []);

  useEffect(() => {
    if (!preselectedTime || !TIME_SLOTS.includes(preselectedTime)) {
      return;
    }

    setFormData((current) => ({
      ...current,
      date: current.date || minDate,
      time: preselectedTime
    }));
  }, [preselectedTime, minDate]);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const localErrors = validateBookingForm(formData);
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setNotice("Revisa los campos marcados para enviar la reserva.");
      trackEvent("submit_reserva_incompleta");
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setNotice("Guardando tu reserva…");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (payload.details) {
          const serverErrors = normalizeServerFieldErrors(payload.details);
          if (Object.keys(serverErrors).length > 0) {
            setFieldErrors(serverErrors);
            setNotice("Corrige los campos marcados e intenta nuevamente.");
            return;
          }
        }

        throw new Error(payload.error || "No se pudo registrar la reserva.");
      }

      trackEvent("submit_reserva", {
        service: formData.service,
        barber: formData.barber,
        time: formData.time
      });

      const bookingData = {
        id: payload.bookingId || Date.now(),
        name: formData.name,
        phone: formData.phone,
        service: formData.service,
        barber: formData.barber,
        date: formData.date,
        time: formData.time,
        status: payload.status || "confirmed",
        isDemo: payload.isDemo || true,
        createdAt: new Date().toISOString()
      };

      saveToLocalStorage(bookingData);

      if (payload.isDemo) {
        setBookingComplete(bookingData);
        trackEvent("demo_booking_saved");
        return;
      }

      trackEvent("booking_api_saved", {
        bookingId: payload.bookingId,
        service: formData.service
      });

      const message = buildMessage(formData, payload.bookingId);
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      setNotice("Reserva guardada. Te redirigimos a WhatsApp para confirmar.");
      trackEvent("whatsapp_open", { source: "booking_form" });
      setFormData(INITIAL_FORM);
      window.location.assign(url);
    } catch (error) {
      setNotice(error.message || "No pudimos guardar tu reserva.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNewBooking() {
    setBookingComplete(null);
    setFormData(INITIAL_FORM);
    setNotice("");
    setFieldErrors({});
  }

  if (bookingComplete) {
    return (
      <div className="booking-success">
        <div className="success-icon" aria-hidden="true">
          <Check size={32} strokeWidth={3} />
        </div>
        <h2>Reserva confirmada</h2>
        <div className="success-details">
          <p><strong>Nombre:</strong> {bookingComplete.name}</p>
          <p><strong>Servicio:</strong> {bookingComplete.service}</p>
          <p><strong>Barbero:</strong> {bookingComplete.barber}</p>
          <p><strong>Fecha:</strong> {bookingComplete.date}</p>
          <p><strong>Hora:</strong> {bookingComplete.time}</p>
        </div>
        <p className="success-id">Código de reserva: #{bookingComplete.id}</p>
        <p className="success-note">
          Podés ver esta reserva en el panel de administración.
        </p>
        <button className="btn btn-primary" onClick={handleNewBooking}>
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      <label>
        Nombre y apellido
        <input
          name="name"
          type="text"
          autoComplete="name"
          value={formData.name}
          onChange={handleFieldChange}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "booking-error-name" : undefined}
          required
        />
        {fieldErrors.name ? <span id="booking-error-name" className="field-error">{fieldErrors.name}</span> : null}
      </label>

      <label>
        WhatsApp
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+54 9 11 1234 5678…"
          value={formData.phone}
          onChange={handleFieldChange}
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={fieldErrors.phone ? "booking-error-phone" : undefined}
          required
        />
        {fieldErrors.phone ? <span id="booking-error-phone" className="field-error">{fieldErrors.phone}</span> : null}
      </label>

      <label>
        Servicio
        <select
          name="service"
          value={formData.service}
          onChange={handleFieldChange}
          aria-invalid={Boolean(fieldErrors.service)}
          aria-describedby={fieldErrors.service ? "booking-error-service" : undefined}
          required
        >
          <option value="">Selecciona una opcion</option>
          {SERVICES.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
        {fieldErrors.service ? <span id="booking-error-service" className="field-error">{fieldErrors.service}</span> : null}
      </label>

      <label>
        Barbero
        <select
          name="barber"
          value={formData.barber}
          onChange={handleFieldChange}
          aria-invalid={Boolean(fieldErrors.barber)}
          aria-describedby={fieldErrors.barber ? "booking-error-barber" : undefined}
          required
        >
          <option value="">Selecciona una opcion</option>
          {BARBERS.map((barber) => (
            <option key={barber} value={barber}>
              {barber}
            </option>
          ))}
        </select>
        {fieldErrors.barber ? <span id="booking-error-barber" className="field-error">{fieldErrors.barber}</span> : null}
      </label>

      <div className="field-row">
        <label>
          Fecha
          <input
            name="date"
            type="date"
            min={minDate}
            value={formData.date}
            onChange={handleFieldChange}
            aria-invalid={Boolean(fieldErrors.date)}
            aria-describedby={fieldErrors.date ? "booking-error-date" : undefined}
            required
          />
          {fieldErrors.date ? <span id="booking-error-date" className="field-error">{fieldErrors.date}</span> : null}
        </label>

        <label>
          Hora
          <select
            name="time"
            value={formData.time}
            onChange={handleFieldChange}
            aria-invalid={Boolean(fieldErrors.time)}
            aria-describedby={fieldErrors.time ? "booking-error-time" : undefined}
            required
          >
            <option value="">Hora</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {fieldErrors.time ? <span id="booking-error-time" className="field-error">{fieldErrors.time}</span> : null}
        </label>
      </div>

      {Object.keys(fieldErrors).length > 0 ? (
        <div className="form-errors" role="alert" aria-live="assertive">
          <p>Necesitamos que corrijas esto antes de enviar:</p>
          <ul>
            {Object.entries(fieldErrors).map(([field, message]) => (
              <li key={field}>
                <strong>{FIELD_LABELS[field] || field}:</strong> {message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : "Reservar turno"}
      </button>
      <p className="form-privacy">Tus datos se usan solo para confirmar tu turno.</p>
      <p className={`form-note${Object.keys(fieldErrors).length > 0 ? " is-error" : ""}`} role="status" aria-live="polite">
        {notice}
      </p>
    </form>
  );
}
