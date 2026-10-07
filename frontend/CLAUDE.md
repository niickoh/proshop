# Frontend — React

## Stack
- React + TypeScript (strict) con Vite
- React Router · TanStack Query (datos de la API) · Zustand solo si hace falta estado global
- React Hook Form + Zod para formularios
- Tailwind CSS (obligatorio)
- ESLint + Prettier (con `prettier-plugin-tailwindcss` para ordenar clases)

## Estilos: Tailwind + mobile first (obligatorio)
- Todo el estilo se hace con clases de Tailwind. No usar CSS propio, CSS modules,
  styled-components ni `style={{}}`. Única excepción: `index.css` con las directivas de Tailwind.
- Colores, fuentes y espaciados personalizados se definen en la config/tema de Tailwind,
  nunca como valores sueltos repetidos.
- Mobile first: las clases sin prefijo son para móvil; los prefijos agregan cambios
  para pantallas más grandes.
  - Bien: `flex-col md:flex-row`, `text-base lg:text-lg`
  - Mal: diseñar para escritorio y "arreglar" móvil con `max-md:`
- Breakpoints de Tailwind: base (< 640px) · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536.
- Todo componente debe verse bien en 360px, 768px, 1024px y 1440px:
  - sin scroll horizontal
  - textos que no se corten ni se superpongan
  - imágenes con `max-w-full` / `w-full` y proporción fija (`aspect-*`)
- Áreas táctiles de al menos 44×44px en móvil (`min-h-11 min-w-11`).
- Contenido centrado con un contenedor común (ej. `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`).
- Para clases condicionales usar `clsx` (o `cn`); no concatenar strings a mano.

## Estructura
```
src/
  app/                 Router, providers, layout
  features/<feature>/  components/ hooks/ api/ data/ types.ts __tests__/
  shared/components/   Componentes usados en todo el sitio (ej. Header)
  lib/                 Cliente HTTP, config
```

## Convenciones de componentes
- Un componente por archivo, en PascalCase.
- Si un componente tiene partes que evolucionan por separado, cada parte es su propio
  componente en una subcarpeta (ej. `Header/options/NavComprar.tsx`).
- Las variantes reutilizan un componente base; no duplicar estilos ni lógica.
- La lógica va en custom hooks (`useAlgo.ts`); los componentes solo renderizan.

## Buenas prácticas
- Solo componentes funcionales. Nada de `any`.
- URL de la API desde `import.meta.env.VITE_API_URL`. Sin secretos en el frontend.
- Manejar estados de carga, error y vacío cuando haya datos de la API.
- Accesibilidad: HTML semántico, `aria-*` donde corresponda, foco visible, navegable con teclado.
- Rutas con `React.lazy` + `Suspense`.
- No usar `useEffect` para derivar estado.

## Tests
- Vitest + React Testing Library. Sin MSW: para contar o forzar errores de peticiones,
  espiar la función de `api/` con `vi.mock` (ej. `vi.fn(actual.getProducts)`).
- Consultar por rol o texto (`getByRole`), no por clases.
- Un test por criterio de aceptación. Un archivo de test por feature salvo que crezca mucho.
- Playwright solo para flujos críticos (pago, encargos), no para componentes simples.
  Cuando se use, correr cada flujo en viewport móvil (390px) y escritorio (1280px).
- Comandos: `npm run lint`, `npm run typecheck`, `npm test -- <Nombre>`.

## Docker
- Multi-stage: `build` (npm ci + build) y Nginx sirviendo `/dist` con fallback a `index.html`.