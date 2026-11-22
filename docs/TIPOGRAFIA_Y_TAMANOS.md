# Estructura de tamaños de texto – Lado V

Documentación de la escala tipográfica usada en el proyecto (Tailwind + `globals.css`).

---

## 1. Base global (`app/globals.css`)

Definiciones en `@layer base` que aplican por defecto:

| Elemento | Tamaño (Tailwind) | Equivalente | Peso | Uso |
|----------|-------------------|-------------|------|-----|
| **h1** | `text-lg` (responsive igual) | 1.125rem / 18px | 600 | Títulos principales |
| **h2** | `text-lg` | 1.125rem / 18px | 600 | Subtítulos de sección |
| **h3** | `text-base md:text-lg lg:text-lg` | 1rem → 1.125rem | 500 | Títulos terciarios |
| **p** | `text-base md:text-lg` | 1rem → 1.125rem | 400 | Párrafos |
| **small, label** | `text-base` | 1rem / 16px | 400 | Texto secundario, etiquetas |
| **nav a** | `text-base` | 1rem | 500 + tracking-wide | Enlaces de navegación |

- Headings usan `font-heading` (TT Norms Pro Bold).
- Body y párrafos usan `font-body` (misma fuente).
- Color de títulos: `#19123C` (primary).

---

## 2. Escala Tailwind usada en el proyecto

Referencia rápida de clases `text-*` y uso habitual:

| Clase | Tamaño | Uso en el proyecto |
|-------|--------|---------------------|
| **text-[10px]** / **text-[11px]** | 10px / 11px | Badges pequeños, labels en modales (Club, formularios) |
| **text-xs** | 0.75rem (12px) | Pie de sección, labels, FAQ, pasos, filtros “Limpiar” |
| **text-sm** | 0.875rem (14px) | Filtros, descripciones cortas, cards, footer, botones secundarios |
| **text-base** | 1rem (16px) | Párrafos, CTAs, resultados de listados, contenido principal |
| **text-lg** | 1.125rem (18px) | Títulos de sección (Hero, Productos, Blog, etc.), subtítulos |
| **text-xl** | 1.25rem (20px) | Títulos destacados (Club Lado V), acordeón FAQ |
| **text-2xl** | 1.5rem (24px) | Título del post en blog (mobile) |
| **text-3xl** | 1.875rem (30px) | Título del post en blog (desktop) |
| **text-[40px]** | 40px | Título de página Paquetes (font-triester-vector) |

Responsive típico en secciones públicas:

- Título de sección: `text-lg md:text-lg lg:text-lg` (mantiene 18px).
- Subtítulo/descripción: `text-sm md:text-sm` o `text-base md:text-lg`.
- Hero: `text-lg md:text-lg lg:text-lg` (título), `text-base md:text-lg` (bajada).

---

## 3. Clases propias en `globals.css`

| Clase | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| **.badge-pluma** | 1.125rem (18px) | 600 | Badge de sección (F1, Viajes, Blog, Instagram, Hablemos, etc.) |

`badge-pluma` también define color `#19123C` y `letter-spacing: 0.02em`. Suele ir con `pluma-underline` para la línea verde.

---

## 4. Contenido editorial (prose) y Tiptap

### Prose (contenido renderizado en front)

| Elemento | Tamaño | Peso |
|----------|--------|------|
| `.prose h1` | 2.25rem (36px) | 700 |
| `.prose h2` | 1.875rem (30px) | 600 |
| `.prose h3` | 1.5rem (24px) | 600 |
| `.prose code` | 0.875em | normal |

### Editor Tiptap (admin)

| Elemento | Tamaño | Peso |
|----------|--------|------|
| `.ProseMirror h1` | 2rem (32px) | 700 |
| `.ProseMirror h2` | 1.5rem (24px) | 600 |
| `.ProseMirror h3` | 1.25rem (20px) | 600 |
| `.ProseMirror code` | 0.875em | normal |

---

## 5. Pesos de fuente (font-weight)

Uso habitual en componentes:

- **400** – Texto body por defecto.
- **500** – Labels, navegación, h3 base.
- **600** – Títulos (h1, h2), badge-pluma, semibold en cards.
- **700** – Títulos grandes en prose, botones primarios (font-semibold/bold).

Clases Tailwind: `font-normal`, `font-medium`, `font-semibold`, `font-bold`.

---

## 6. Resumen por contexto

| Contexto | Tamaño principal | Ejemplo |
|----------|------------------|---------|
| Título de página (Hero, sección) | 18px (text-lg) | “Últimas publicaciones”, “Experiencias F1” |
| Badge de sección | 18px (badge-pluma) | “Instagram”, “Viajes”, “Blog” |
| Bajada / descripción de sección | 14px (text-sm) o 16–18px (text-base/lg) | “Seguinos en Instagram…” |
| Filtros (sidebar) | 14px (text-sm) | Labels y opciones en Paquetes/F1 |
| Cards y listados | 14–16px (text-sm / text-base) | Título y precio en PaqueteCard |
| Footer y legal | 14px (text-sm) | Enlaces y copyright |
| Botones primarios | 16px (text-base) o 14px (text-sm) | CTA Hero, “Ver más en Instagram” |
| Blog – título del post | 24–30px (text-2xl / text-3xl) | Página de detalle del post |
| Admin / formularios | 11–12px (text-[11px] / text-xs) | Labels en ClubJoinModal, login |

---

## 7. Fuentes del proyecto

- **Títulos y body:** `--font-heading` / `--font-body` → TT Norms Pro Bold.
- **Acento / display:** `--font-accent` → Triester Vector (ej. título “Paquetes”).
- Definidas en `globals.css` (`@theme`) y en `app/layout.tsx` (localFont).

Para mantener coherencia, conviene usar esta escala en componentes nuevos y evitar tamaños arbitrarios (`text-[13px]`, etc.) salvo que se documente aquí.
