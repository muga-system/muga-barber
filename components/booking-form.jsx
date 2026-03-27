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
  existing.unshift(booking);
  localStorage.setItem("muga_bookings", JSON.stringify(existing.slice(0, 100)));
}

function getLocalBookings() {
  return JSON.parse(localStorage.getItem("muga_bookings") || "[]");
}

export default function BookingForm({ whatsappNumber, preselectedTime = "" }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [notice, setNotice] = useState("");
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

  const isValid =
    formData.name &&
    formData.phone &&
    formData.service &&
    formData.barber &&
    formData.date &&
    formData.time;

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!isValid) {
      setNotice("Revisa los campos obligatorios para continuar.");
      trackEvent("submit_reserva_incompleta");
      return;
    }

    setIsSubmitting(true);
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
          required
        />
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
          required
        />
      </label>

      <label>
        Servicio
        <select name="service" value={formData.service} onChange={handleFieldChange} required>
          <option value="">Selecciona una opcion</option>
          {SERVICES.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </label>

      <label>
        Barbero
        <select name="barber" value={formData.barber} onChange={handleFieldChange} required>
          <option value="">Selecciona una opcion</option>
          {BARBERS.map((barber) => (
            <option key={barber} value={barber}>
              {barber}
            </option>
          ))}
        </select>
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
            required
          />
        </label>

        <label>
          Hora
          <select name="time" value={formData.time} onChange={handleFieldChange} required>
            <option value="">Hora</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : "Reservar turno"}
      </button>
      <p className="form-privacy">Tus datos se usan solo para confirmar tu turno.</p>
      <p className="form-note" role="status" aria-live="polite">
        {notice}
      </p>
    </form>
  );
}
