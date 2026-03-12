import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "../../../lib/db";

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  service: z.string().trim().min(2).max(80),
  barber: z.string().trim().min(2).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/)
});

async function ensureBookingsTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      barber TEXT NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time VARCHAR(5) NOT NULL,
      source VARCHAR(20) NOT NULL DEFAULT 'web',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

function cleanPhone(phone) {
  return phone.replace(/[^+\d\s()-]/g, "").slice(0, 40);
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
        source
      )
      VALUES (
        ${name},
        ${cleanPhone(phone)},
        ${service},
        ${barber},
        ${date},
        ${time},
        'web'
      )
      RETURNING id, created_at;
    `;

    const booking = rows[0];
    return NextResponse.json(
      {
        ok: true,
        bookingId: booking.id,
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
