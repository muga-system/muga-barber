import { BOOKING_STATUS_LABELS } from "./booking-status";

export function normalizeDateKey(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function getWeekStart(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  const weekday = date.getDay();
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
  date.setDate(date.getDate() + diffToMonday);
  return toDateKey(date);
}

function toTimestamp(booking) {
  const dateKey = normalizeDateKey(booking.appointment_date);
  const time = booking.appointment_time || "00:00";
  return new Date(`${dateKey}T${time}:00`).getTime();
}

function countBy(items, getKey) {
  const map = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    map.set(key, (map.get(key) || 0) + 1);
  });
  return map;
}

export function formatDateLabel(dateKey) {
  const parsed = new Date(`${dateKey}T12:00:00`);
  return parsed.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export function buildAdminStats(bookings, todayDateKey, rangeDays = 30) {
  const weekStart = getWeekStart(todayDateKey);
  const weekEnd = addDays(weekStart, 6);
  const monthKey = todayDateKey.slice(0, 7);
  const rangeStart = addDays(todayDateKey, -(rangeDays - 1));
  const rangeEnd = todayDateKey;
  const previousStart = addDays(rangeStart, -rangeDays);
  const previousEnd = addDays(rangeStart, -1);

  const totals = {
    total: bookings.length,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
    week: 0,
    month: 0
  };

  bookings.forEach((booking) => {
    const status = booking.status || "pending";
    if (status in totals) {
      totals[status] += 1;
    }

    const dateKey = normalizeDateKey(booking.appointment_date);
    if (!dateKey) return;
    if (dateKey === todayDateKey) totals.today += 1;
    if (dateKey >= weekStart && dateKey <= weekEnd) totals.week += 1;
    if (dateKey.startsWith(monthKey)) totals.month += 1;
  });

  const completionRate = totals.total ? totals.completed / totals.total : 0;
  const cancellationRate = totals.total ? totals.cancelled / totals.total : 0;

  const currentRangeBookings = bookings.filter((booking) => {
    const dateKey = normalizeDateKey(booking.appointment_date);
    return dateKey && dateKey >= rangeStart && dateKey <= rangeEnd;
  });

  const previousRangeBookings = bookings.filter((booking) => {
    const dateKey = normalizeDateKey(booking.appointment_date);
    return dateKey && dateKey >= previousStart && dateKey <= previousEnd;
  });

  const rangeTotals = {
    total: currentRangeBookings.length,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  };

  currentRangeBookings.forEach((booking) => {
    const status = booking.status || "pending";
    if (status in rangeTotals) {
      rangeTotals[status] += 1;
    }
  });

  const previousTotals = {
    total: previousRangeBookings.length,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  };

  previousRangeBookings.forEach((booking) => {
    const status = booking.status || "pending";
    if (status in previousTotals) {
      previousTotals[status] += 1;
    }
  });

  const rangeCompletionRate = rangeTotals.total ? rangeTotals.completed / rangeTotals.total : 0;
  const rangeCancellationRate = rangeTotals.total ? rangeTotals.cancelled / rangeTotals.total : 0;
  const previousCompletionRate = previousTotals.total ? previousTotals.completed / previousTotals.total : 0;
  const previousCancellationRate = previousTotals.total ? previousTotals.cancelled / previousTotals.total : 0;

  const statusSeries = Object.entries(BOOKING_STATUS_LABELS).map(([status, label]) => ({
    key: status,
    name: label,
    value: rangeTotals[status] || 0
  }));

  const byService = countBy(currentRangeBookings, (booking) => booking.service || "Sin servicio");
  const topServices = Array.from(byService.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, total]) => ({ name, total }));

  const byBarber = countBy(currentRangeBookings, (booking) => booking.barber || "Sin barbero");
  const topBarbers = Array.from(byBarber.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, total]) => ({ name, total }));

  const rangeDaysKeys = Array.from({ length: rangeDays }, (_, index) => addDays(rangeStart, index));
  const dailyMap = new Map(rangeDaysKeys.map((day) => [day, 0]));
  currentRangeBookings.forEach((booking) => {
    const dateKey = normalizeDateKey(booking.appointment_date);
    if (dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, dailyMap.get(dateKey) + 1);
    }
  });
  const dailySeries = rangeDaysKeys.map((dateKey) => ({
    dateKey,
    label: formatDateLabel(dateKey),
    total: dailyMap.get(dateKey) || 0
  }));

  const upcoming = bookings
    .filter((booking) => normalizeDateKey(booking.appointment_date) >= todayDateKey)
    .sort((a, b) => toTimestamp(a) - toTimestamp(b))
    .slice(0, 8);

  return {
    totals,
    completionRate,
    cancellationRate,
    rangeDays,
    rangeStart,
    rangeEnd,
    previousStart,
    previousEnd,
    rangeTotals,
    previousTotals,
    rangeCompletionRate,
    rangeCancellationRate,
    previousCompletionRate,
    previousCancellationRate,
    statusSeries,
    topServices,
    topBarbers,
    dailySeries,
    upcoming
  };
}
