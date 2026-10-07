# Spec: Rediseño visual moderno y minimalista

## Objetivo
Pasar de una interfaz "cuadrada" a una moderna y minimalista: más aire, esquinas redondeadas,
sombras suaves, jerarquía tipográfica clara y una paleta azul basada en la marca.
**Solo cambia la apariencia.** No cambia lógica, rutas, textos ni comportamiento.

## Alcance
Solo frontend. Afecta a todo el sitio: Header, Catálogo, Detalle, Carrito y Encargar.
Todos los tests existentes deben seguir pasando sin modificar sus aserciones
(solo se ajustan si un test dependía de una clase CSS, lo que no debería pasar).

## Paleta (tokens de Tailwind)
Color principal de la marca: `#1976d2`. La escala se deriva de él.
Definir en `src/index.css` con `@theme` (Tailwind v4). Si el proyecto usa Tailwind v3,
definir lo mismo en `tailwind.config` bajo `theme.extend.colors`.
```css
@theme {
  --color-brand-50:  #e3f2fd;
  --color-brand-100: #bbdefb;
  --color-brand-200: #90caf9;
  --color-brand-300: #64b5f6;
  --color-brand-400: #42a5f5;
  --color-brand-500: #1e88e5;
  --color-brand-600: #1976d2;  /* color de marca: botones principales, links, activos */
  --color-brand-700: #1565c0;  /* hover / pressed */
  --color-brand-800: #0d47a1;
  --color-brand-900: #0a3a82;

  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
}
```
- Neutros: escala `slate` de Tailwind (gris con tinte azul, combina con la marca).
  - Fondo de página `bg-slate-50`, superficies `bg-white`, texto `text-slate-900`,
    texto secundario `text-slate-500`, bordes `border-slate-200`.
- Semánticos (no usar la marca para esto): oferta/descuento `red-600`, éxito `emerald-600`,
  advertencia `amber-500`, error de formulario `red-600`.
- Prohibido usar colores sueltos (`bg-[#...]`) en componentes; siempre tokens.
- Contraste mínimo AA (4.5:1 en texto normal). `brand-600` sobre blanco cumple; no usar
  `brand-400` o más claro para texto sobre blanco.

## Tipografía
- Fuente "Plus Jakarta Sans" desde Google Fonts (pesos 400, 500, 600, 700) con `display=swap`,
  cargada en `index.html` con `preconnect`.
- Escala: títulos de página `text-2xl md:text-3xl font-bold tracking-tight`, títulos de sección
  `text-lg font-semibold`, cuerpo `text-sm md:text-base`, etiquetas y metadatos `text-xs font-medium text-slate-500`.
- Precios con `tabular-nums font-semibold`.
- Etiquetas en mayúsculas solo para marcas/eyebrows: `text-xs uppercase tracking-wide`.

## Lenguaje visual
| Elemento      | Antes (cuadrado)        | Ahora                                                     |
|---------------|-------------------------|-----------------------------------------------------------|
| Esquinas      | rectas o `rounded`      | `rounded-xl` controles, `rounded-2xl` tarjetas e imágenes, `rounded-full` chips y badges |
| Bordes        | marcados                | `border-slate-200` sutiles, o sin borde + sombra          |
| Sombras       | ninguna o duras         | `shadow-sm` en reposo, `shadow-md` en hover de tarjetas   |
| Espaciado     | apretado                | múltiplos de 4; secciones `py-8 md:py-12`, gaps `gap-4 md:gap-6` |
| Fondos        | blanco plano            | página `slate-50`, superficies blancas                    |
| Movimiento    | sin transiciones        | `transition duration-200 ease-out`; respetar `motion-reduce:transition-none` |
| Foco          | por defecto             | `focus-visible:ring-2 ring-brand-600 ring-offset-2`       |

Minimalismo: una sola acción principal por vista, nada de bordes dobles, nada de sombras en
elementos que no se pueden tocar, máximo dos pesos de fuente por bloque.

## Componentes base (nuevos, en `src/shared/ui/`)
Crear primitivas y reemplazar los estilos repetidos en las features por ellas.
```
shared/ui/
  Button.tsx      variant: primary | secondary | ghost · size: sm | md | lg · loading · fullWidth
  IconButton.tsx  Botón cuadrado redondo para íconos, con aria-label obligatorio
  Input.tsx       Input con estados normal, foco, error y deshabilitado
  Select.tsx
  Badge.tsx       tone: neutral | brand | sale | success
  Chip.tsx        Seleccionable (filtros, tallas) con aria-pressed
  Card.tsx        Superficie blanca rounded-2xl con shadow-sm
  Skeleton.tsx    Bloque animate-pulse con rounded
  cn.ts           clsx + tailwind-merge
```
- `Button primary`: `bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98] rounded-xl h-11 px-5 font-semibold`.
- `Button secondary`: `bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50`.
- `Button ghost`: `text-slate-600 hover:bg-slate-100`.
- `Input`: `h-11 rounded-xl border-slate-200 bg-white px-4 text-base placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-100`; con error `border-red-500 focus:ring-red-100`.
- `Chip`: `rounded-full px-4 h-9 ring-1 ring-slate-200`; seleccionado `bg-brand-600 text-white ring-brand-600`.
- Íconos: `lucide-react`, tamaño 20px, `stroke-width` 1.75.

## Aplicación por vista
**Header**
- Fondo `bg-white/80 backdrop-blur-md` con `border-b border-slate-200/70`, alto `h-16`.
- Logo con `font-bold tracking-tight`. Opciones como texto `text-slate-600`; activa en `text-brand-600`
  con un punto o subrayado fino debajo, no un fondo en bloque.
- Ícono del carrito en `IconButton` con badge `rounded-full bg-brand-600` en la esquina.
- Menú móvil: panel con `rounded-b-2xl shadow-lg`, opciones con `py-3` y separación generosa.

**Catálogo**
- Tarjeta de producto sin borde: imagen `rounded-2xl bg-slate-100` con `aspect-[3/4]`, debajo marca
  (`text-xs uppercase text-slate-500`), nombre (`font-medium line-clamp-2`) y precio.
- Hover (solo desktop): la imagen hace `scale-105` dentro de un contenedor `overflow-hidden`.
- Badges de oferta y agotado flotando sobre la imagen (`absolute top-3 left-3`).
- Panel de filtros en `Card` sin bordes internos; grupos separados por espacio, no por líneas.
  Tallas y colores como `Chip`.
- Barra de resultados limpia: total a la izquierda, orden a la derecha con `Select`.

**Detalle del producto**
- Imagen principal `rounded-2xl bg-slate-100`; miniaturas `rounded-xl` con `ring-2 ring-brand-600` la activa.
- Nombre `text-2xl md:text-3xl font-bold tracking-tight`, precio `text-2xl font-semibold`.
- Tallas como `Chip`. "Comprar ahora" `Button primary lg`, "Agregar al carrito" `Button secondary lg`.
- Barra fija móvil con `bg-white/90 backdrop-blur border-t` y sombra hacia arriba suave.

**Carrito**
- Drawer `rounded-l-2xl` en `sm:`, fondo del overlay `bg-slate-900/40 backdrop-blur-sm`.
- Cada línea con miniatura `rounded-xl`, separadas por espacio (`divide-y divide-slate-100`).
- `QuantityStepper` como píldora: `rounded-full ring-1 ring-slate-200` con botones `IconButton` ghost.
- Total destacado `text-lg font-bold`; botón "Comprar carrito" `Button primary lg fullWidth`.

**Encargar**
- Formulario dentro de `Card` con `p-6 md:p-10`, título y subtítulo arriba.
- Todos los campos con `Input` / `Select`; labels `text-sm font-medium text-slate-700`.
- Errores `text-sm text-red-600` con ícono pequeño.
- Confirmación con ícono de check en círculo `bg-emerald-50 text-emerald-600` y folio en `font-mono`.

## Orden de implementación
Hacerlo en tres pasos, con commit y `/clear` entre cada uno:
1. Tokens, fuente, `shared/ui/` y Header.
2. Catálogo y Detalle.
3. Carrito y Encargar.
Al empezar cada paso, indicar a Claude: `Implementa el paso N de @specs/diseno.md`.

## Criterios de aceptación
- [ ] Los colores salen de los tokens `brand-*`, `slate-*` y semánticos; no hay `bg-[#...]` en componentes.
- [ ] Botones, inputs, chips, badges y tarjetas usan los componentes de `shared/ui/` en todas las vistas.
- [ ] Ningún botón, input, tarjeta o imagen de producto tiene esquinas rectas.
- [ ] El header se ve translúcido con desenfoque al hacer scroll sobre contenido.
- [ ] Todos los elementos interactivos tienen foco visible con el anillo de la marca.
- [ ] Hay una sola acción principal (`Button primary`) por vista.
- [ ] El texto cumple contraste AA en todas las vistas.
- [ ] Con `prefers-reduced-motion` no hay animaciones de escala ni transiciones.
- [ ] Sin scroll horizontal y sin textos cortados en 360px, 768px, 1024px y 1440px.
- [ ] Todos los tests existentes pasan; lint y chequeo de tipos sin errores.

## Tests
- Tests unitarios para `Button` (variantes, `loading` deshabilita y muestra spinner) y `Chip` (`aria-pressed`).
- No se agregan tests visuales; la revisión es manual en el navegador en los cuatro anchos.

## Fuera de alcance
Modo oscuro, logo o identidad de marca nueva, cambios de textos, nuevas funcionalidades,
animaciones complejas de página y librerías de componentes externas (shadcn, MUI, etc.).