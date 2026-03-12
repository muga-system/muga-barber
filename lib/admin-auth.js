import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "muga_admin_session";

function safeCompare(valueA, valueB) {
  if (!valueA || !valueB) return false;

  const a = Buffer.from(valueA);
  const b = Buffer.from(valueB);

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}

function hashValue(value) {
  return createHash("sha256").update(value).digest("hex");
}

function getRawAdminKey() {
  return process.env.ADMIN_DASHBOARD_KEY;
}

export function isAdminConfigured() {
  return Boolean(getRawAdminKey());
}

export function getExpectedAdminHash() {
  const rawKey = getRawAdminKey();
  if (!rawKey) return null;
  return hashValue(rawKey);
}

export function isAdminKeyValid(rawKey) {
  const expectedHash = getExpectedAdminHash();
  if (!expectedHash || !rawKey) return false;

  const providedHash = hashValue(rawKey);
  return safeCompare(providedHash, expectedHash);
}

export function isAdminAuthorizedRequest(request) {
  const expectedHash = getExpectedAdminHash();
  if (!expectedHash) return false;

  const cookieHash = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (cookieHash && safeCompare(cookieHash, expectedHash)) {
    return true;
  }

  const headerKey = request.headers.get("x-admin-key");
  if (headerKey && isAdminKeyValid(headerKey)) {
    return true;
  }

  return false;
}

export function setAdminSessionCookie(response) {
  const expectedHash = getExpectedAdminHash();
  if (!expectedHash) return;

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: expectedHash,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export function clearAdminSessionCookie(response) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}
