export const ALLOWED_TIME_SLOTS = new Set([
  "09:00",
  "10:30",
  "12:00",
  "14:00",
  "16:30",
  "18:00",
  "19:30",
  "20:15"
]);

export function resolveBookingTimeParam(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  if (ALLOWED_TIME_SLOTS.has(value)) {
    return value;
  }

  if (/^\d{2}-\d{2}$/.test(value)) {
    const normalized = value.replace("-", ":");
    if (ALLOWED_TIME_SLOTS.has(normalized)) {
      return normalized;
    }
  }

  return "";
}
