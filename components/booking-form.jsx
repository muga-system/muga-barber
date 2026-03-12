"use client";

import { useMemo, useState } from "react";
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

function buildMessage(formData) {
  return [
    "Hola, quiero reservar un turno en Muga Barber:",
    `Nombre: ${formData.name}`,
    `Telefono: ${formData.phone}`,
    `Servicio: ${formData.service}`,
    `Barbero: ${formData.barber}`,
    `Fecha: ${formData.date}`,
    `Hora: ${formData.time}`
  ].join("\n");
}

function getTodayISODate() {
  return new Date().toISOString().split("T")[0];
}

export default function BookingForm({ whatsappNumber }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [notice, setNotice] = useState("");
  const minDate = useMemo(() => getTodayISODate(), []);

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

  function handleSubmit(event) {
    event.preventDefault();

    if (!isValid) {
      setNotice("Revisa los campos obligatorios para continuar.");
      trackEvent("submit_reserva_incompleta");
      return;
    }

    const message = buildMessage(formData);
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    trackEvent("submit_reserva", {
      service: formData.service,
      barber: formData.barber,
      time: formData.time
    });

    setNotice("Turno listo. Te redirigimos a WhatsApp para confirmar.");
    window.open(url, "_blank", "noopener,noreferrer");
    trackEvent("whatsapp_open", { source: "booking_form" });
    setFormData(INITIAL_FORM);
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
          placeholder="+54 9 ..."
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

      <button className="btn btn-primary" type="submit">
        Reservar turno
      </button>
      <p className="form-privacy">Tus datos se usan solo para confirmar tu turno.</p>
      <p className="form-note" role="status" aria-live="polite">
        {notice}
      </p>
    </form>
  );
}
