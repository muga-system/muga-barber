import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clearAdminSessionCookie,
  isAdminAuthorizedRequest,
  isAdminConfigured,
  isAdminKeyValid,
  setAdminSessionCookie
} from "../../../../lib/admin-auth";

const adminKeySchema = z.object({
  key: z.string().min(8)
});

export async function GET(request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ authenticated: false, configured: false }, { status: 200 });
  }

  const authenticated = isAdminAuthorizedRequest(request);
  return NextResponse.json({ authenticated, configured: true }, { status: 200 });
}

export async function POST(request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Falta ADMIN_DASHBOARD_KEY en el entorno." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = adminKeySchema.safeParse(body);

  if (!parsed.success || !isAdminKeyValid(parsed.data.key)) {
    return NextResponse.json({ error: "Clave de administrador invalida" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  setAdminSessionCookie(response);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  clearAdminSessionCookie(response);
  return response;
}
