import { NextResponse } from "next/server";
import {
  isAdminAuthorizedRequest,
  isAdminConfigured
} from "../../../../lib/admin-auth";
import { ensureBookingsTable } from "../../../../lib/bookings-db";
import { applyBookingsFilters, parseBookingsFilters } from "../../../../lib/bookings-filters";
import { getDb } from "../../../../lib/db";
import { getDemoBookings } from "../../../../lib/demo-bookings";

function escapeCsvValue(value) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (!/[",\n]/.test(stringValue)) return stringValue;
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function createCsv(bookings) {
  const headers = [
    "id",
    "name",
    "phone",
    "service",
    "barber",
    "appointment_date",
    "appointment_time",
    "status",
    "source",
    "created_at",
    "updated_at"
  ];

  const lines = [headers.join(",")];

  bookings.forEach((booking) => {
    const row = headers.map((header) => escapeCsvValue(booking[header]));
    lines.push(row.join(","));
  });

  return `${lines.join("\n")}\n`;
}

export async function GET(request) {
  const sql = getDb();
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (isDemo) {
    if (!isAdminConfigured()) {
      return NextResponse.json({ error: "Falta ADMIN_DASHBOARD_KEY" }, { status: 503 });
    }

    if (!isAdminAuthorizedRequest(request)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const parsedFilters = parseBookingsFilters(request.url);
    const filtered = applyBookingsFilters(getDemoBookings(), parsedFilters.filters || {});

    const csv = createCsv(filtered);
    const fileName = `bookings-demo-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  }

  if (!sql) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Falta ADMIN_DASHBOARD_KEY" }, { status: 503 });
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
        created_at,
        updated_at
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 2000;
    `;

    const filtered = applyBookingsFilters(rows, parsedFilters.filters);
    const csv = createCsv(filtered);
    const fileName = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return NextResponse.json({ error: "No pudimos exportar las reservas" }, { status: 500 });
  }
}