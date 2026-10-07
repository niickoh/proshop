# Spec: Catálogo (página Comprar)

## Objetivo
Que el cliente explore los productos en una grilla de fotos y los acote con filtros típicos de una
tienda de ropa, sin que cada clic dispare una petición.

## Alcance
Solo frontend, datos simulados con arrays locales. Ruta: `/comprar` (reemplaza el placeholder del header).
Ubicación: `src/features/catalogo/`.

## Modelo de datos
```ts
type Product = {
  id: string;
  name: string;
  brand: string;
  category: 'poleras' | 'pantalones' | 'chaquetas' | 'vestidos' | 'calzado' | 'accesorios';
  gender: 'mujer' | 'hombre' | 'unisex';
  price: number;             // CLP, entero
  compareAtPrice?: number;   // precio anterior si está en oferta
  sizes: string[];           // 'XS' | 'S' | 'M' | 'L' | 'XL' | tallas de calzado
  colors: string[];
  images: string[];          // la primera es la portada
  inStock: boolean;
  createdAt: string;         // ISO 8601; "nuevos" ordena por esta fecha descendente
};

type ProductFilters = {
  category?: string[];
  gender?: string[];
  size?: string[];
  color?: string[];
  brand?: string[];
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  onSale?: boolean;
  sort?: 'relevancia' | 'precio-asc' | 'precio-desc' | 'nuevos';
};
```
`GET /api/products?<filtros>&page=1&limit=24` → `{ items: Product[], total: number, page: number, hasMore: boolean }`.
`api/getProducts.ts` simula la respuesta sobre ~60 productos de ejemplo (`data/products.ts`) aplicando
filtros, orden y paginación, con 300 ms de latencia. `limit=0` devuelve solo el total.
Imágenes de ejemplo locales en `public/products/` (o placeholders); nunca imágenes de marcas reales.

## Componentes
```
features/catalogo/
  CatalogoPage.tsx           Layout: panel de filtros + barra superior + grilla
  api/getProducts.ts         Llamada HTTP con AbortSignal
  hooks/useProducts.ts       useInfiniteQuery con los filtros aplicados como queryKey
  hooks/useFilters.ts        Lee/escribe los filtros en la URL (query params)
  filters/
    FiltersPanel.tsx         Contenedor: sidebar en escritorio, drawer en móvil
    FilterGroup.tsx          Base: grupo plegable con título y contador de seleccionados
    CategoryFilter.tsx
    GenderFilter.tsx
    SizeFilter.tsx           Botones de talla (chips seleccionables)
    ColorFilter.tsx          Muestras de color con nombre accesible
    BrandFilter.tsx          Checkboxes; con buscador si hay más de 8 marcas
    PriceFilter.tsx          Mínimo y máximo
    AvailabilityFilter.tsx   "Solo con stock" y "En oferta"
  toolbar/
    ResultsToolbar.tsx       Total de resultados + orden + botón "Filtros" (móvil)
    ActiveFilterChips.tsx    Filtros activos como chips removibles + "Limpiar todo"
  grid/
    ProductGrid.tsx          Grilla + scroll infinito
    ProductCard.tsx          Foto, marca, nombre, precio, oferta, agotado
    ProductCardSkeleton.tsx
  CatalogoPage.test.tsx
shared/hooks/useDebouncedValue.ts
```
Cada filtro es su propio componente y reutiliza `FilterGroup`.

## Comportamiento de los filtros (debounce)
- El panel trabaja con un **borrador** de filtros; los filtros **aplicados** viven en la URL.
- Escritorio (`lg:`): cada cambio actualiza el borrador y se aplica tras **400 ms sin cambios**
  (`useDebouncedValue`). Varios clics seguidos generan una sola petición.
- Precio: también con debounce; se valida que mínimo ≤ máximo antes de aplicar.
- Móvil (base): los filtros se abren en un drawer y **no se aplican hasta tocar "Ver N resultados"**.
  El botón muestra el conteo del borrador; "Limpiar" y cerrar sin aplicar descartan el borrador.
- Una petición en curso se cancela si los filtros cambian (AbortSignal de TanStack Query).
- Mientras carga un nuevo filtro se mantienen los resultados anteriores (`placeholderData`)
  con opacidad reducida, sin saltar a un esqueleto vacío.
- Los filtros en la URL permiten compartir el enlace, recargar y usar el botón Atrás.
- Al cambiar filtros la grilla vuelve arriba y la paginación se reinicia.

## Grilla y scroll
- Scroll **vertical** con scroll infinito: carga 24 productos y pide la siguiente página al acercarse
  al final (IntersectionObserver), con botón "Cargar más" como respaldo accesible.
- Scroll **horizontal** donde corresponde en UX: la fila de chips de filtros activos y, en móvil,
  la fila de chips de categorías sobre la grilla (`overflow-x-auto`, `snap-x`, sin barra visible).
  La grilla de productos en sí no se desplaza horizontalmente.
- Columnas mobile first: 2 en base · 3 en `md:` · 3 en `lg:` (junto al panel) · 4 en `xl:`.
- Tarjeta: foto `aspect-[3/4]` con `loading="lazy"`, `alt` con el nombre; en escritorio, al pasar
  el mouse muestra la segunda foto si existe. Precio en CLP con `Intl.NumberFormat('es-CL')`.
  Oferta: precio anterior tachado + badge "% OFF". Sin stock: badge "Agotado" y foto atenuada.
- La tarjeta enlaza a `/comprar/:id` (crear la ruta con un placeholder).

## Layout mobile first
- Base: barra superior (total + orden + botón "Filtros" con contador) y grilla a ancho completo.
  El panel es un drawer desde la izquierda con foco atrapado, cierre con Escape y fondo oscuro.
- `lg:` (≥ 1024px): panel fijo a la izquierda (`w-64`, sticky, con su propio scroll vertical)
  y la grilla a la derecha. Se oculta el botón "Filtros".

## Estados
- Carga inicial: 8 `ProductCardSkeleton`.
- Error: mensaje claro + botón "Reintentar".
- Sin resultados: "No encontramos productos con estos filtros" + botón "Limpiar filtros".
- Fin de la lista: "Viste los N productos".

## Criterios de aceptación
- [ ] En `/comprar` veo la grilla con los productos y el total de resultados.
- [ ] Al marcar 3 filtros seguidos en escritorio se hace una sola petición, 400 ms después del último.
- [ ] En móvil, cambiar filtros en el drawer no hace peticiones hasta tocar "Ver N resultados".
- [ ] Cerrar el drawer sin aplicar descarta los cambios.
- [ ] Los filtros aplicados quedan en la URL; al recargar o compartir el enlace se mantienen.
- [ ] Cada filtro activo aparece como chip; al quitarlo se actualizan los resultados. "Limpiar todo" los quita todos.
- [ ] Si el precio mínimo es mayor que el máximo se muestra un error y no se aplica.
- [ ] El orden por precio ascendente y descendente ordena los resultados correctamente.
- [ ] Al llegar al final de la grilla se cargan más productos; al terminar se muestra el mensaje de fin.
- [ ] Mientras cargan nuevos filtros los resultados anteriores siguen visibles.
- [ ] Se muestran correctamente los estados de carga, error con "Reintentar" y sin resultados.
- [ ] Una tarjeta en oferta muestra precio anterior tachado; una sin stock muestra "Agotado".
- [ ] Columnas: 2 en 360px, 3 en 768px y 1024px, 4 en 1440px; sin scroll horizontal de la página.
- [ ] El panel de filtros y el drawer se usan con teclado y cada control tiene nombre accesible.

## Tests
`CatalogoPage.test.tsx` con Vitest + RTL, un test por criterio.
Usar `vi.useFakeTimers()` para el debounce y contar peticiones con un spy sobre `getProducts` (`vi.mock`).
Test unitario aparte para `useDebouncedValue`. Sin E2E en este spec.

## Fuera de alcance
Página de detalle del producto, carrito y botón "Agregar", búsqueda por texto, favoritos,
reseñas y backend real.