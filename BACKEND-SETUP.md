# Backend Setup (Reservas)

Este proyecto ya incluye un endpoint real para guardar reservas en base de datos:

- `POST /api/bookings`
- `GET /api/bookings` (solo admin autenticado)
- `PATCH /api/bookings/:id` (actualiza estado)
- `POST /api/admin/session` y `DELETE /api/admin/session` (login/logout admin)
- Archivo: `app/api/bookings/route.js`
- Valida datos con `zod` y guarda en Postgres (Neon/Vercel).

## 1) Configurar base de datos en Vercel

1. En Vercel, abre el proyecto `muga-barber`.
2. Ve a **Storage** y conecta una base Postgres/Neon.
3. Verifica que exista la variable de entorno `POSTGRES_URL`.

## 2) Variables de entorno

Configura en Vercel (Production):

- `POSTGRES_URL`
- `ADMIN_DASHBOARD_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (opcional, para analytics)

## 3) Comportamiento actual

- Si `POSTGRES_URL` no existe, el endpoint responde `503`.
- Si existe, la tabla `bookings` se crea automaticamente en el primer insert.
- La tabla incluye `status` (`pending`, `confirmed`, `completed`, `cancelled`).
- Al guardar, el formulario envia a WhatsApp con codigo de reserva.
- Panel interno de reservas disponible en `/admin/reservas`.

## 4) Prueba rapida

1. Abre `/reservar` en produccion.
2. Completa el formulario.
3. Revisa que abra WhatsApp con `Codigo de reserva: #<id>`.
4. Verifica en base que se haya creado el registro.

## 5) Panel interno de reservas

1. Abre `/admin/reservas`.
2. Ingresa `ADMIN_DASHBOARD_KEY` en el login.
3. Carga el listado de reservas recientes (max 100).
4. Filtra por estado, fecha o texto.
5. Actualiza estado de cada reserva desde el panel.

## 6) Estado actual en produccion

- URL: `https://muga-barber.vercel.app`
- Si ves mensaje de backend no configurado, falta cargar `POSTGRES_URL` en Vercel.
