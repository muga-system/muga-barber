import { isValidBookingStatus, normalizeDateOnly } from "./bookings-db";

export function parseBookingsFilters(urlString) {
  const { searchParams } = new URL(urlString);

  const status = (searchParams.get("status") || "all").toLowerCase();
  const from = normalizeDateOnly(searchParams.get("from"));
  const to = normalizeDateOnly(searchParams.get("to"));
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  if (status !== "all" && !isValidBookingStatus(status)) {
    return {
      error: "Filtro de estado invalido"
    };
  }

  return {
    filters: {
      status,
      from,
      to,
      query
    }
  };
}

export function applyBookingsFilters(rows, filters) {
  const { status, from, to, query } = filters;

  return rows.filter((row) => {
    const appointmentDate = normalizeDateOnly(row.appointment_date);

    if (status !== "all" && row.status !== status) {
      return false;
    }

    if (from && appointmentDate < from) {
      return false;
    }

    if (to && appointmentDate > to) {
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
}
