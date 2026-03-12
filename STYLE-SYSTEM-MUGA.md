# Style System MUGA

## Contexto

- Proyecto: Muga Barber Atelier
- Tipo de sitio: landing de reservas (conversion directa)
- Estilo elegido: minimalista-clasico
- Stack objetivo: Next.js (App Router) + CSS global + componentes reutilizables

---

## 1) Direccion visual

- Intencion de marca: premium sobrio, claridad comercial y confianza tecnica.
- Tono visual: editorial limpio, neutro y elegante.
- Sensacion objetivo: calma, precision y control.

---

## 2) Tokens base

```css
:root {
  --color-bg: #f3f1ec;
  --color-surface: #ffffff;
  --color-surface-strong: #ece8e1;
  --color-text: #1d1a17;
  --color-text-muted: #666058;
  --color-primary: #2a2520;
  --color-primary-strong: #14110e;
  --color-primary-contrast: #fbf8f3;
  --color-border: #d7d0c6;
  --color-border-soft: #e7e1d8;
  --color-success: #2f7a4a;
  --color-warning: #9b6b2a;
  --color-danger: #a43a2e;

  --font-display: "Cormorant Garamond", serif;
  --font-body: "Source Sans 3", sans-serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;

  --shadow-sm: 0 1px 2px rgba(13, 27, 30, 0.08);
  --shadow-md: 0 10px 30px rgba(13, 27, 30, 0.08);
}
```

---

## 3) Tipografia

- H1: 56/64, 700, Cormorant Garamond (responsive con clamp)
- H2: 42/50, 700, Cormorant Garamond
- H3: 28/36, 600, Cormorant Garamond
- Body: 16/26, 400-500, Source Sans 3
- Small text: 14/22, 500, Source Sans 3
- Regla de line-height: minimo 1.6 en body y 1.2 en headings

---

## 4) Componentes minimos

### Button

- Variante primaria: fondo `--color-primary`, texto `--color-primary-contrast`, radio 999px y alto contraste.
- Variante secundaria: transparente, borde `--color-border`, texto `--color-text`.
- Hover/focus: leve elevacion + focus ring visible de 2px con color primary.

### Card

- Estructura: tag opcional, titulo, descripcion y metrica/precio.
- Padding: `--space-5` mobile / `--space-6` desktop.
- Borde/sombra: 1px con `--color-border-soft` + `--shadow-md` moderado.

### Input/Form

- Altura: 48px minima en inputs/selects.
- Estados: default, focus, error, success.
- Mensajes de error: cortos y accionables, bajo campo o al pie del formulario.

### Hero

- Composicion: propuesta de valor clara + CTA principal + modulo sobrio de disponibilidad.
- Jerarquia: problema -> solucion -> accion en primer viewport.
- CTA principal: "Reservar turno".

---

## 5) Reglas especificas por estilo

### A) minimalista-clasico

- Paleta neutra y sobria.
- Contraste limpio y ritmo vertical estable.
- Ornamento minimo con foco en lectura.

### B) minimalista-moderno

- Base limpia con acento controlado.
- Layout modular y geometrico.
- Microinteracciones discretas y funcionales.

### C) brutalista-simple

- Subir grosor de bordes a 2px.
- Reducir radios a valores bajos.
- Priorizar bloques directos y tipografia mas agresiva.

---

## 6) Do / Dont

### Do

- Reusar tokens en todos los componentes.
- Mantener CTA principal consistente en hero, servicios y reserva.
- Priorizar espacios amplios para reforzar lectura.
- Priorizar legibilidad y contraste en mobile.

### Dont

- Mezclar estilos de tipografia sin sistema.
- Crear nuevos acentos de color fuera de tokens.
- Sobrecargar con efectos que no aporten conversion.

---

## 7) Checklist de calidad

- [x] Mobile-first validado
- [x] Contraste AA validado
- [x] CTA principal consistente
- [x] Components listos para reuso
- [x] Tokens suficientes para escalar
