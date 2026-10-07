# Spec: Productos (API + conexión del catálogo y el detalle)

## Objetivo
Servir los productos desde MongoDB con los mismos filtros, orden y paginación que hoy usa el
frontend con datos locales, y conectar el catálogo y el detalle al backend sin cambiar su interfaz.

## Alcance
Backend (módulo `product`) + seed + funciones `api/` de `features/catalogo` y `features/producto-detalle`.
Requiere `base.md` y `swagger.md` implementados.

## Contrato
El tipo `Product` de `frontend/src/features/catalogo/types.ts` es la fuente de verdad
(incluye `description`). El backend responde exactamente esa forma; `id` es string.

### `GET /api/products`
Query params (todos opcionales):
| Param        | Formato                         | Ejemplo                      |
|--------------|---------------------------------|------------------------------|
| category     | lista separada por comas        | `poleras,chaquetas`          |
| gender       | lista separada por comas        | `mujer,unisex`               |
| size         | lista separada por comas        | `S,M`                        |
| color        | lista separada por comas        | `negro,blanco`               |
| brand        | lista separada por comas        | `marca-a`                    |
| priceMin     | entero ≥ 0                      | `10000`                      |
| priceMax     | entero ≥ priceMin               | `50000`                      |
| inStockOnly  | `true` / `false`                | `true`                       |
| onSale       | `true` / `false`                | `true`                       |
| sort         | `relevancia` · `precio-asc` · `precio-desc` · `nuevos` | `precio-asc` |
| page         | entero ≥ 1 (defecto 1)          | `2`                          |
| limit        | entero 0 a 48 (defecto 24); 0 devuelve solo `total` (contador del drawer) | `24` |

Respuesta `200`: `{ items: Product[], total: number, page: number, hasMore: boolean }`.
Parámetros inválidos → `400` con `fields` indicando cuál.

Reglas:
- Dentro de un mismo filtro las opciones se combinan con O; entre filtros distintos, con Y.
- `onSale` = tiene `compareAtPrice` mayor que `price`.
- `relevancia` (defecto): primero con stock, luego los más nuevos. `nuevos`: por fecha de creación.
- Orden estable: desempatar siempre por `id` para que la paginación no repita ni salte productos.

### `GET /api/products/filters`
Respuesta `200`:
```ts
{
  categories: string[]; genders: string[]; sizes: string[];
  colors: string[]; brands: string[];
  priceRange: { min: number; max: number };
}
```
Calculado desde los productos existentes (valores distintos, ordenados). Tallas en orden lógico
(XS, S, M, L, XL, XXL, luego números de calzado), no alfabético.

### `GET /api/products/:id`
`200` con `Product`, o `404` con `{ error: { code: 'PRODUCT_NOT_FOUND', message } }`.
Esta ruta se registra **después** de `/filters` para que `filters` no se tome como un id.

## Backend
```
src/
  domain/product/
    entities/Product.ts            Reglas: price > 0, compareAtPrice > price si existe, al menos 1 imagen
    errors/ProductNotFoundError.ts
  application/product/
    ports/ProductRepository.ts     search(criteria), findById(id), getFilterOptions()
    dtos/ProductSearchCriteria.ts
    use-cases/ListProducts.ts
    use-cases/GetProductById.ts
    use-cases/GetProductFilters.ts
  infrastructure/
    persistence/mongo/ProductModel.ts
    persistence/mongo/MongoProductRepository.ts
    http/products/productSchemas.ts   Zod de query, params y respuestas (+ registro en Swagger)
    http/products/productRoutes.ts
    http/products/ProductController.ts
seed/
  products.json                    Copia de los productos de frontend/.../data/
  seedProducts.ts                  npm run seed
test/
  products/                        Unitarios con repositorio en memoria + integración con Supertest
```
- Mongo: `_id` es el mismo `id` string del frontend (no ObjectId), para que los carritos
  guardados en el navegador sigan funcionando. Agregar `createdAt` interno (no se expone).
- Índices: `{ category: 1, gender: 1, price: 1 }`, `{ brand: 1 }`, `{ sizes: 1 }`, `{ colors: 1 }`,
  `{ inStock: -1, createdAt: -1 }`.
- `images` guarda rutas relativas (`/products/polera-1.jpg`); las imágenes siguen en `frontend/public/products/`.
- Los tres endpoints documentados en Swagger bajo el tag "Productos", con ejemplos.

## Seed
- `products.json` se genera una vez desde los arrays de `frontend/src/features/catalogo/data/`,
  conservando ids, imágenes y descripciones.
- `npm run seed` hace upsert por `_id` (se puede correr varias veces sin duplicar).
- Con Docker: `docker compose exec backend npm run seed`.
- El seed valida cada producto con el esquema Zod y se detiene si alguno es inválido.

## Conexión del frontend
- `getProducts`, `getProduct` y una nueva `getProductFilters` en `api/`:
  - `VITE_USE_MOCKS=true` → siguen usando `data/` (para `getProductFilters`, calcular las opciones desde `data/`).
  - `VITE_USE_MOCKS=false` → `fetch` a `VITE_API_URL`, pasando el `AbortSignal`.
- Serializar los filtros como en la tabla del contrato (listas separadas por comas, sin params vacíos).
- Respuestas no exitosas lanzan un `ApiError` con `status` y `code` (crear en `src/lib/` si no existe);
  un 404 en el detalle muestra el estado "producto no encontrado" que ya existe.
- El panel de filtros obtiene sus opciones desde `getProductFilters` (hook `useProductFilters`).
- Componentes y hooks existentes no cambian su interfaz.

## Criterios de aceptación
- [ ] Después de `npm run seed`, en Compass la colección `products` tiene los mismos productos e ids que `data/`.
- [ ] Correr el seed dos veces no duplica productos.
- [ ] `GET /api/products` sin params devuelve 24 productos, `total` correcto y `hasMore: true`.
- [ ] Filtrar por dos categorías devuelve productos de cualquiera de las dos; sumar un género restringe ambos.
- [ ] `priceMin`/`priceMax`, `inStockOnly` y `onSale` filtran correctamente.
- [ ] Los cuatro órdenes funcionan, y recorrer todas las páginas no repite ni omite productos.
- [ ] `priceMin` mayor que `priceMax` o `limit=100` responden 400 con el campo indicado.
- [ ] `GET /api/products/filters` devuelve las opciones y el rango de precios reales, con tallas en orden lógico.
- [ ] `GET /api/products/:id` devuelve el producto; un id inexistente responde 404 con `PRODUCT_NOT_FOUND`.
- [ ] Los tres endpoints aparecen en Swagger bajo "Productos" y se pueden probar con "Try it out".
- [ ] Con `VITE_USE_MOCKS=false`, el catálogo, los filtros y el detalle se ven y funcionan igual que con datos locales.
- [ ] Con `VITE_USE_MOCKS=true` el frontend sigue funcionando sin backend.
- [ ] Lint, chequeo de tipos y tests de frontend y backend pasan.

## Tests
- Backend: unitarios de los casos de uso con `InMemoryProductRepository`; integración de los
  endpoints con Supertest + `mongodb-memory-server`, un test por criterio de la API.
- Frontend: tests de las funciones de `api/` en ambos modos (mock y fetch, con `fetch` simulado).
  Los tests existentes del catálogo y el detalle deben seguir pasando sin cambios.

## Fuera de alcance
Crear, editar o borrar productos, búsqueda por texto, stock por talla, imágenes en S3,
caché HTTP y autenticación.