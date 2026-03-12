import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "../../../lib/db";
import {
  isAdminAuthorizedRequest,
  isAdminConfigured
} from "../../../lib/admin-auth";
import {
  ensureBookingsTable,
  normalizeDateOnly
} from "../../../lib/bookings-db";
import { applyBookingsFilters, parseBookingsFilters } from "../../../lib/bookings-filters";
import { notifyNewBooking } from "../../../lib/booking-notify";

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  service: z.string().trim().min(2).max(80),
  barber: z.string().trim().min(2).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/)
});

function cleanPhone(phone) {
  return phone.replace(/[^+\d\s()-]/g, "").slice(0, 40);
}

export async function GET(request) {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json(
      {
        error: "Base de datos no configurada"
      },
      { status: 503 }
    );
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error: "Falta ADMIN_DASHBOARD_KEY"
      },
      { status: 503 }
    );
  }

  if (!isAdminAuthorizedRequest(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsedFilters = parseBookingsFilters(request.url);
  if (parsedFilters.error) {
    return NextResponse.json({ error: parsedFilters.error }, { status: 400 });
  }

  try {
    await ensureBookingsTable(sql);

    const rows = await sql`
      SELECT
        id,
        name,
        phone,
        service,
        barber,
        appointment_date,
        appointment_time,
        status,
        source,
        updated_at,
        created_at
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 300;
    `;

    const filtered = applyBookingsFilters(rows, parsedFilters.filters);

    return NextResponse.json({ ok: true, bookings: filtered.slice(0, 100) }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        error: "No pudimos cargar las reservas"
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json(
      {
        error:
          "El sistema de reservas no esta configurado todavia. Activa la base de datos para guardar turnos."
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos de reserva invalidos",
        details: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const { name, phone, service, barber, date, time } = parsed.data;

  try {
    await ensureBookingsTable(sql);

    const rows = await sql`
      INSERT INTO bookings (
        name,
        phone,
        service,
        barber,
        appointment_date,
        appointment_time,
        status,
        source
      )
      VALUES (
        ${name},
        ${cleanPhone(phone)},
        ${service},
        ${barber},
        ${date},
        ${time},
        'pending',
        'web'
      )
      RETURNING id, status, created_at;
    `;

    const booking = rows[0];

    notifyNewBooking({
      id: booking.id,
      status: booking.status,
      name,
      phone: cleanPhone(phone),
      service,
      barber,
      date: normalizeDateOnly(date),
      time
    });

    return NextResponse.json(
      {
        ok: true,
        bookingId: booking.id,
        status: booking.status,
        createdAt: booking.created_at
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "No pudimos guardar la reserva en este momento. Intenta nuevamente en unos segundos."
      },
      { status: 500 }
    );
  }
}
