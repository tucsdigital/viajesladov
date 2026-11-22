# Diseño de las cards de paquetes

Documentación del componente **PaqueteCard** (`components/PaqueteCard.tsx`): estructura visual, tipografía, colores, espaciado, variantes y animaciones.

---

## 1. Uso y contexto

- **Componente:** `PaqueteCard`
- **Dónde se usa:** listado de Paquetes (`/paquetes`), listado de F1 (`/f1`), categoría (`/categoria/[slug]`), sección Destacados (Home), sección Productos (Home).
- **Props:** `paquete`, `index?`, `basePath?` (`/paquete` | `/f1`), `badgeLabel?` (ej. `"F1"` en F1).

---

## 2. Estructura visual (de arriba a abajo)

```
┌─────────────────────────────────────┐
│  [Badge tipo]              [Share]  │  ← Zona superior (p-3)
├─────────────────────────────────────┤
│                                     │
│           IMAGEN DE FONDO           │
│         (cover, hover: scale 1.05)  │
│                                     │
│  Overlay: from-transparent          │
│  via-black/40 to-black/90           │
│  + barra inferior negra h-20        │
├─────────────────────────────────────┤
│  📍 Destino / eventoLugar           │  ← CardContent (p-4)
│  Título del paquete                 │
│  Descripción (line-clamp-3)         │
│  [icon] [icon] [icon]  (features)   │
│  🕐 Duración                        │
├─────────────────────────────────────┤
│  Próxima salida / Desde             │  ← CardFooter (p-4 pt-2)
│  MONEDA $ precio    [Ver más →]     │
└─────────────────────────────────────┘
```

- Contenedor: **Card** (ui/card) con clases propias que sobrescriben el estilo base.
- Contenido apoyado sobre **imagen de fondo a pantalla completa** con overlays para legibilidad.

---

## 3. Contenedor (Card)

| Propiedad | Valor | Notas |
|-----------|--------|--------|
| **Aspect ratio** | `aspect-4/5` | Proporción 4:5 (más alta que ancha). |
| **Altura mínima** | `min-h-[340px]` | Evita cards demasiado bajas en pantallas grandes. |
| **Bordes** | `rounded-2xl`, `border-0` | Esquinas redondeadas, sin borde. |
| **Sombra** | `shadow-lg` → `hover:shadow-2xl` | Más sombra en hover. |
| **Hover** | `hover:-translate-y-1` | Sube 4px al pasar el mouse. |
| **Ancho** | `w-full max-w-sm mx-auto` | Ancho completo del grid, máximo 24rem, centrada. |

---

## 4. Imagen de fondo

| Propiedad | Valor |
|-----------|--------|
| **Origen** | `imagenTarjeta` o `imagenPrincipal` o placeholder. |
| **Object** | `object-cover` |
| **Hover** | `group-hover:scale-105`, `transition-transform duration-500` |
| **Calidad** | `quality={85}` |
| **Loading** | `eager` si `index < 6`, `lazy` resto; `priority` si `index < 6`. |
| **Sizes** | `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw` |

**Overlays sobre la imagen:**

- Gradiente: `from-transparent via-black/40 to-black/90`.
- Barra inferior fija: `h-20 bg-black/90` para anclar texto y precio.

---

## 5. Zonas y espaciado

| Zona | Clase / padding | Contenido |
|------|-----------------|-----------|
| **Superior** | `p-3`, `z-2` | Badge (tipo) + botón Compartir. |
| **Contenido** | `CardContent` `p-4`, `mt-auto` | Destino, título, descripción, features, duración. |
| **Pie** | `CardFooter` `p-4 pt-2` | Precio / próxima salida + botón "Ver más". |

---

## 6. Tipografía por elemento

| Elemento | Clase | Tamaño (aprox.) | Peso | Color |
|----------|--------|------------------|------|--------|
| **Badge (tipo)** | `text-[10px] md:text-sm` | 10px → 14px | default | `bg-secondary text-primary` |
| **Destino / eventoLugar** | `text-[10px] md:text-sm` | 10px → 14px | medium | `text-white` (contenedor `text-gray-400`) |
| **Título** | `text-xs md:text-sm lg:text-sm` | 12px → 14px | bold, font-heading | `text-white`, hover `text-white/90` |
| **Descripción** | `text-[10px] md:text-sm` | 10px → 14px | body | `text-white/80`, `line-clamp-3` |
| **Features (tooltip)** | `text-xs` | 12px | semibold | `text-white` |
| **Duración** | `text-[10px] md:text-sm` | 10px → 14px | medium | `text-white` |
| **"Próxima salida" / "Desde"** | `text-[10px] md:text-xs` | 10px → 12px | body | `text-gray-400` |
| **Precio** | `text-xs md:text-sm` | 12px → 14px | bold, font-heading | `text-white` |
| **Botón "Ver más"** | (Button) | 14px en md | semibold | `bg-secondary text-primary` |

---

## 7. Colores

| Uso | Token / valor |
|-----|----------------|
| **Badge** | `bg-secondary` (#B2F432), `text-primary` (#19123C). |
| **Botón compartir** | `bg-secondary text-primary`, hover mismo + `scale-110`. |
| **Botón "Ver más"** | `bg-secondary text-primary`, hover mismo. |
| **Texto principal** | Blanco y `white/80`, `white/90`. |
| **Texto secundario** | `text-gray-400`. |
| **Overlays** | Negro con opacidad: `black/10`, `black/40`, `black/60`, `black/90`. |
| **Features (iconos)** | `bg-white/15`, `text-white`, backdrop-blur. |

---

## 8. Badge de tipo

- **Contenido:** `badgeLabel` (ej. "F1") o, si no se pasa, "Individual" | "Grupal" | "A Medida" según `paquete.tipo`.
- **Estilo:** `Badge` con `bg-secondary text-primary`, `text-[10px] md:text-sm`, `px-2 py-0.5`, `backdrop-blur-sm`.

---

## 9. Features (iconos de lo incluido)

- **Origen:** `getPackageFeatures(paquete.incluye, 3)` en `lib/utils/packageFeatures.tsx` (hasta 3 features por keywords: Aéreos, Alojamiento, Traslados, Desayuno, Comidas, Excursiones, Asistencia).
- **Layout:** `flex gap-1 flex-wrap`, cajas de **w-6 h-6** (md: w-7 h-7), `rounded-md`, `bg-white/15`, ícono dentro.
- **Tooltip:** al hover, texto del feature en `text-xs`, fondo `bg-black/90`, flecha hacia abajo.
- **Accesibilidad:** `aria-label` en el contenedor del ícono, `sr-only` con el label.

---

## 10. Precio y salida

- **Con salidas y sin tickets:** se muestra "Próxima salida: DD MMM" y precio de esa salida (moneda + valor).
- **Con tickets:** se usa el ticket más barato; si hay varios, se muestra "Desde" + moneda y valor.
- **Sin tickets ni salidas:** precio base del paquete; si `mostrarDesde` es true, se muestra "Desde".
- Formato de precio: `toLocaleString('es-AR')`.

---

## 11. Variante F1 vs Paquetes

| Aspecto | Paquetes (`basePath='/paquete'`) | F1 (`basePath='/f1'`) |
|---------|-----------------------------------|------------------------|
| **Destino** | `paquete.destino` (fallback "F1") | `paquete.eventoLugar` (solo si tiene valor). |
| **Badge** | Suele venir sin `badgeLabel` → Individual/Grupal/A Medida. | Se suele pasar `badgeLabel="F1"`. |
| **Link** | `/paquete/[slug]` | `/f1/[slug]` |

El resto del diseño (layout, tipografía, colores, animación) es el mismo.

---

## 12. Animación (Framer Motion)

- **Contenedor:** `motion.div` que envuelve el `Link` + `Card`.
- **Entrada:** `initial` con `opacity: 0`, desplazamiento en x/y según `index` (alternancia), `scale: 0.97`, `rotate` leve, `filter: blur(6px)`.
- **Visible:** `whileInView` → opacidad 1, x/y 0, scale 1, rotate 0, blur 0.
- **Salida:** `exit` con opacidad 0, desplazamiento y scale/rotate leves en sentido contrario.
- **Timing:** `duration` entre 0.6 y 0.7 s según índice, `delay: index * 0.08`, easing `[0.16, 1, 0.3, 1]`.
- **Viewport:** `once: true`, `margin: '-120px'`.

---

## 13. Botones e iconos

| Elemento | Tamaño ícono | Notas |
|----------|--------------|--------|
| **Compartir** | `h-4 w-4` (md: h-5 w-5) | Botón circular `p-2 md:p-3`, `rounded-full`. |
| **MapPin / Clock** | `h-3 w-3` (md: h-3.5 w-3.5) | Inline con texto destino/duración. |
| **ArrowRight ("Ver más")** | `h-3 w-3` (md: h-4 w-4) | En desktop texto "Ver más" + ícono; en móvil solo ícono. Hover: `translate-x-1`. |

---

## 14. Skeleton (`SkeletonPaqueteCard`)

- Misma proporción: `rounded-2xl`, `aspect-4/5`.
- Área de imagen: `flex-1 bg-gray-100`.
- Bloque inferior: `p-4 space-y-3` con barras `bg-gray-200` que simulan título, destino, líneas de texto, precio y botón.
- Animación: `animate-pulse`.

---

## 15. Grid donde se muestran las cards

En **PaquetesClient** y **ProductsSection**:

- **Paquetes:** `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`.
- **ProductsSection (Home):** `grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8`.

Cada card usa `max-w-sm mx-auto` para no estirarse en columnas anchas.

---

## 16. Resumen de decisiones de diseño

- **Aspecto 4:5** para dar protagonismo a la imagen y mantener altura uniforme en el grid.
- **Overlays en gradiente** para que blanco y gris sigan legibles sobre cualquier imagen.
- **Tipografía pequeña en móvil** (`text-[10px]`, `text-xs`) y un escalón en `md` para mejorar lectura en desktop.
- **Máximo 3 features** con iconos para no saturar la card.
- **Descripción limitada** a 120 caracteres (o `descripcionCorta`) y `line-clamp-3` en pantalla.
- **Un solo CTA** ("Ver más") con ícono que refuerza la acción.
- **Compartir** accesible desde la card sin ir al detalle.
- **Animación escalonada** por `index` para dar sensación de orden sin retrasos largos.

Si en el futuro se cambian tamaños, colores o estructura de la card, conviene actualizar este doc y revisar `PaqueteCard.tsx` y `SkeletonPaqueteCard.tsx` para mantener coherencia.
