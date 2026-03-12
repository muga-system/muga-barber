# Backend Setup (Reservas)

Este proyecto ya incluye un endpoint real para guardar reservas en base de datos:

- `POST /api/bookings`
- Archivo: `app/api/bookings/route.js`
- Valida datos con `zod` y guarda en Postgres (Neon/Vercel).

## 1) Configurar base de datos en Vercel

1. En Vercel, abre el proyecto `muga-barber`.
2. Ve a **Storage** y conecta una base Postgres/Neon.
3. Verifica que exista la variable de entorno `POSTGRES_URL`.

## 2) Variables de entorno

Configura en Vercel (Production):

- `POSTGRES_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (opcional, para analytics)

## 3) Comportamiento actual

- Si `POSTGRES_URL` no existe, el endpoint responde `503`.
- Si existe, la tabla `bookings` se crea automaticamente en el primer insert.
- Al guardar, el formulario envia a WhatsApp con codigo de reserva.

## 4) Prueba rapida

1. Abre `/reservar` en produccion.
2. Completa el formulario.
3. Revisa que abra WhatsApp con `Codigo de reserva: #<id>`.
4. Verifica en base que se haya creado el registro.
