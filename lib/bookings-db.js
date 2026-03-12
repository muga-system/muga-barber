import { BOOKING_STATUSES } from "./booking-status";

export async function ensureBookingsTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      barber TEXT NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time VARCHAR(5) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      source VARCHAR(20) NOT NULL DEFAULT 'web',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';
  `;

  await sql`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `;

  await sql`
    UPDATE bookings
    SET status = 'pending'
    WHERE status IS NULL OR status = '';
  `;

  await sql`
    UPDATE bookings
    SET updated_at = NOW()
    WHERE updated_at IS NULL;
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS bookings_appointment_date_idx
    ON bookings (appointment_date);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS bookings_status_idx
    ON bookings (status);
  `;
}

export function isValidBookingStatus(value) {
  return BOOKING_STATUSES.includes(value);
}

export function normalizeDateOnly(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}
