import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAdminAuthorizedRequest,
  isAdminConfigured
} from "../../../../lib/admin-auth";
import { ensureBookingsTable } from "../../../../lib/bookings-db";
import { BOOKING_STATUSES } from "../../../../lib/booking-status";
import { getDb } from "../../../../lib/db";

const updateSchema = z.object({
  status: z.enum(BOOKING_STATUSES)
});

function parseBookingId(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function PATCH(request, { params }) {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Falta ADMIN_DASHBOARD_KEY" }, { status: 503 });
  }

  if (!isAdminAuthorizedRequest(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const bookingId = parseBookingId(params.bookingId);
  if (!bookingId) {
    return NextResponse.json({ error: "ID de reserva invalido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Estado invalido" }, { status: 400 });
  }

  try {
    await ensureBookingsTable(sql);

    const rows = await sql`
      UPDATE bookings
      SET status = ${parsed.data.status},
          updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING id, status, updated_at;
    `;

    if (!rows[0]) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, booking: rows[0] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No pudimos actualizar la reserva" }, { status: 500 });
  }
}
