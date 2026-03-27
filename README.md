# Muga Barber Atelier

Sitio web de barbería premium con sistema de reservas online.

## Descripción

Landing page de conversión directa para barbería premium. El sitio incluye:
- Página principal con secciones de servicios, testimonios y garantías
- Sistema de reservas con formulario y redirrección a WhatsApp
- Panel de administración para gestionar reservas
- Páginas informativas (servicios, precios, barberos, ubicación, FAQ)

## Tecnologías

- **Framework:** Next.js 15 (App Router)
- **Estilos:** CSS global con tokens de diseño
- **Base de datos:** PostgreSQL (Neon/Vercel)
- **Validación:** Zod

## Estructura del proyecto

```
muga-barber/
├── app/                    # Páginas y rutas de Next.js
│   ├── page.jsx           # Landing principal
│   ├── reservar/          # Página de reservas
│   ├── admin/reservas/    # Panel de administración
│   ├── api/               # Endpoints de API
│   └── [secciones]        # Páginas internas
├── components/             # Componentes React
├── lib/                   # Utilidades y configuración
└── public/                # Recursos estáticos
```

## Instalación local

1. Clonar el repositorio:
```bash
git clone https://github.com/muga-system/muga-barber.git
cd muga-barber
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
# Editar .env.local con tus valores
```

4. Iniciar servidor de desarrollo:
```bash
npm run dev
```

El sitio estará disponible en `http://localhost:3000`

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `POSTGRES_URL` | URL de conexión a PostgreSQL (Neon) |
| `ADMIN_DASHBOARD_KEY` | Clave de acceso al panel admin |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio (ej: https://muga.dev) |
| `NEXT_PUBLIC_DEMO_MODE` | `true` para modo demostración |
| `BOOKING_WEBHOOK_URL` | Webhook para notificaciones (opcional) |

## Modo demostración

Para activar el modo demo, configura:
```
NEXT_PUBLIC_DEMO_MODE=true
```

En modo demo:
- El banner de demostración aparece al entrar
- Los formularios muestran un modal al intentar enviar
- No se conecta con servicios externos (WhatsApp, base de datos)

## Panel de administración

Accede a `/admin/reservas` con la clave configurada en `ADMIN_DASHBOARD_KEY`.

Funciones:
- Ver listado de reservas
- Filtrar por estado, fecha o texto
- Actualizar estado de reservas
- Eliminar reservas
- Exportar a CSV

## Despliegue en Vercel

1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno en Settings → Environment Variables
3. Agregar dominio personalizado en Settings → Domains

## Documentación adicional

- [Sistema de estilos](./STYLE-SYSTEM-MUGA.md)
- [Configuración del backend](./BACKEND-SETUP.md)

## Licencia

Privado - Muga System