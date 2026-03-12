import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "../../../lib/db";
import {
  isAdminAuthorizedRequest,
  isAdminConfigured
} from "../../../lib/admin-auth";
import {
  ensureBookingsTable,
  isValidBookingStatus,
  normalizeDateOnly
} from "../../../lib/bookings-db";

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

  const { searchParams } = new URL(request.url);
  const statusFilter = (searchParams.get("status") || "all").toLowerCase();
  const fromFilter = normalizeDateOnly(searchParams.get("from"));
  const toFilter = normalizeDateOnly(searchParams.get("to"));
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  if (statusFilter !== "all" && !isValidBookingStatus(statusFilter)) {
    return NextResponse.json({ error: "Filtro de estado invalido" }, { status: 400 });
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

    const filtered = rows.filter((row) => {
      const appointmentDate = normalizeDateOnly(row.appointment_date);

      if (statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }

      if (fromFilter && appointmentDate < fromFilter) {
        return false;
      }

      if (toFilter && appointmentDate > toFilter) {
        return false;
      }

      if (query) {
        const haystack = `${row.name} ${row.phone} ${row.service} ${row.barber}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      return true;
    });

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
