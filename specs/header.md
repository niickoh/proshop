# Spec: Header principal

## Objetivo
Navegación siempre visible hacia las tres secciones de la tienda: Comprar, Encargar y Contáctanos.

## Alcance
Solo frontend. Ubicación: `src/shared/components/Header/`.

## Componentes
```
Header/
  Header.tsx            Compone logo + opciones + botón de menú móvil. Define el orden.
  useMobileMenu.ts      Abrir/cerrar; cierra con Escape y clic fuera.
  NavItem.tsx           Base: NavLink con estilos, estado activo y aria-current.
  options/
    NavComprar.tsx      NavItem → /comprar  "Comprar"
    NavEncargar.tsx     NavItem → /encargar "Encargar"
    NavContacto.tsx     NavItem → /contacto "Contáctanos"
  Header.test.tsx
```
- Cada opción es su propio componente y reutiliza `NavItem`.
- Cada opción acepta `onNavigate` opcional (el Header lo usa para cerrar el menú móvil).
- Crear las rutas `/comprar`, `/encargar` y `/contacto` con una página placeholder que muestre el título.
- Usar `<header>`, `<nav aria-label="Principal">` y header sticky.
- Estilos solo con Tailwind, mobile first:
  - Base (móvil): logo + botón de menú `aria-label="Abrir menú"` con `aria-expanded`;
    las opciones se muestran en un panel desplegable, una por fila y de ancho completo.
  - `md:` (≥ 768px): se oculta el botón (`md:hidden`) y las opciones van en línea a la derecha.
  - Cada opción y el botón con área táctil mínima de 44×44px.

## Criterios de aceptación
- [ ] En cualquier página veo el logo y las opciones Comprar, Encargar y Contáctanos, en ese orden.
- [ ] Cada opción navega a su ruta sin recargar la página; el logo navega a `/`.
- [ ] La opción de la página actual se ve activa y tiene `aria-current="page"`.
- [ ] Cada opción renderizada sola muestra su texto y apunta a su ruta.
- [ ] En móvil las opciones están ocultas y aparece el botón de menú.
- [ ] Al tocar el botón se muestran las opciones y `aria-expanded` pasa a `true`.
- [ ] El menú móvil se cierra al elegir una opción, al presionar Escape o al hacer clic fuera.
- [ ] Logo y opciones se recorren con Tab y tienen foco visible.
- [ ] En 360px, 768px, 1024px y 1440px el header no genera scroll horizontal y ningún texto se corta.

## Tests
Un solo archivo `Header.test.tsx` (Vitest + RTL dentro de `MemoryRouter`), un test por criterio.
Sin E2E en este spec.

## Fuera de alcance
Carrito, login, búsqueda, footer y el contenido real de Comprar, Encargar y Contáctanos.