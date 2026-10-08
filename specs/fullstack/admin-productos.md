# Spec: Panel de administración + CRUD de productos

## Objetivo
Un panel de administración tipo ecommerce, con menú lateral, desde el que el admin crea,
edita, archiva y reactiva productos con formularios validados. Los cambios se ven en el catálogo.

## Alcance
Frontend + backend. Requiere `specs/backend/productos.md` implementado.
Frontend: `features/admin/`. Backend: amplía el módulo `product`.
Modifica: Header (nueva opción) y los endpoints públicos de productos (ocultar archivados).

## Acceso (temporal)
Este spec **no incluye login**: el panel y los endpoints de admin quedan abiertos mientras tanto.
Para que el login se agregue después sin reescribir nada:
- Backend: todas las rutas `/api/admin/*` pasan por un middleware `adminGuard.ts` que por ahora
  solo llama a `next()`. El spec de login reemplazará su contenido.
- Frontend: todas las rutas `/admin/*` se envuelven en un componente `AdminGuard.tsx` que por ahora
  solo renderiza `children`.
- **No desplegar en un servidor público hasta tener el login.**

## Implementación por pasos
Commit y `/clear` entre cada paso. Indicar a Claude: `Implementa el paso N de @specs/fullstack/admin-productos.md`.
1. Backend: endpoints de admin, validaciones, Swagger y tests.
2. Frontend: Header, layout del panel y listado de productos.
3. Frontend: formulario de crear/editar, archivar/reactivar.

---

## Paso 1 · Backend

### Cambios en el modelo
Se agregan al producto (solo visibles en endpoints de admin):
- `active: boolean` (por defecto `true`). Los endpoints públicos (`/api/products`, `/filters`, `/:id`)
  solo devuelven productos activos; un producto archivado responde 404 en el detalle público.
- `createdAt`, `updatedAt` y `version` (número, para evitar que dos ediciones se pisen).
- `id`: string generado desde el nombre (`polera-basica-negra-4f2a`), nunca editable.

### Endpoints (todos bajo `adminGuard`)
| Método y ruta                          | Hace                                                        |
|----------------------------------------|-------------------------------------------------------------|
| `GET /api/admin/products`              | Lista con `q` (nombre o marca), `category`, `status` (`active`·`archived`·`all`), `sort` (`nuevos`·`nombre`·`precio-asc`·`precio-desc`), `page`, `limit` (1–50) |
| `GET /api/admin/products/:id`          | Detalle completo, incluidos los archivados                 |
| `POST /api/admin/products`             | Crea → `201 AdminProduct`                                   |
| `PUT /api/admin/products/:id`          | Reemplaza; el body incluye `version`. Si no coincide → `409 VERSION_CONFLICT` |
| `PATCH /api/admin/products/:id/status` | `{ active: boolean }` archiva o reactiva                    |

- No hay borrado físico: archivar conserva el historial para las futuras ventas.
- Errores con el formato del proyecto; `422 VALIDATION_ERROR` con `fields` por campo.

### Validación (`adminProductSchemas.ts`, compartida con el frontend)
| Campo          | Regla                                                               |
|----------------|---------------------------------------------------------------------|
| name           | 3 a 80 caracteres                                                   |
| brand          | 2 a 40 caracteres                                                   |
| category       | una de las categorías existentes                                    |
| gender         | `mujer` · `hombre` · `unisex`                                       |
| description    | 20 a 2000 caracteres                                                |
| price          | entero CLP, 1 a 10.000.000                                          |
| compareAtPrice | opcional; si existe, mayor que `price`                              |
| sizes          | 1 a 15 tallas, sin repetir                                          |
| colors         | 1 a 10 colores, sin repetir, 2 a 20 caracteres cada uno             |
| images         | 1 a 8 URLs o rutas (`/products/...` o `https://...`), sin repetir   |
| inStock        | booleano                                                            |
| active         | booleano                                                            |

- El esquema se copia a `frontend/src/features/admin/productos/schema.ts`, con un comentario
  en ambos indicando que deben mantenerse iguales.
- Las reglas de negocio (precio anterior mayor que precio, al menos una imagen) también viven en la entidad `Product`.

### Backend: archivos
```
application/product/use-cases/
  ListAdminProducts.ts · GetAdminProduct.ts · CreateProduct.ts
  UpdateProduct.ts · SetProductStatus.ts
application/product/ports/ProductRepository.ts   + searchAdmin, create, update(id, data, version), setActive
infrastructure/http/admin/
  adminGuard.ts                     Por ahora solo next()
  products/adminProductRoutes.ts · AdminProductController.ts · adminProductSchemas.ts
```
Swagger: tag "Admin · Productos", con ejemplos de request y de cada error.

---

## Paso 2 · Frontend: header, layout y listado

### Header
- Nuevo componente `options/NavAdministracion.tsx` ("Administración" → `/admin`), igual que las otras opciones.
- Por ahora visible para todos. Cuando exista el login se definirá quién la ve.

### Layout del panel (`AdminLayout.tsx`)
- Rutas: `/admin` redirige a `/admin/productos`; todas envueltas en `AdminGuard`.
- Menú lateral `AdminSidebar.tsx` con estas opciones (cada una es su componente `AdminNavItem`):
  | Opción        | Ruta                 | Estado en este spec |
  |---------------|----------------------|---------------------|
  | Resumen       | `/admin/resumen`     | Próximamente        |
  | Productos     | `/admin/productos`   | **Activo**          |
  | Ventas        | `/admin/ventas`      | Próximamente        |
  | Encargos      | `/admin/encargos`    | Próximamente        |
  | Clientes      | `/admin/clientes`    | Próximamente        |
  | Inventario    | `/admin/inventario`  | Próximamente        |
  | Configuración | `/admin/configuracion` | Próximamente      |
- Las opciones "Próximamente" se ven atenuadas con un badge, no son navegables (`aria-disabled`).
- Mobile first: en base el menú es un drawer que se abre con un botón "Menú de administración";
  desde `lg:` es una barra fija a la izquierda (`w-64`) y el contenido a la derecha.

### Listado (`/admin/productos`)
- Encabezado: título "Productos", total y botón principal "Nuevo producto".
- Barra: búsqueda con debounce de 300 ms, filtro de categoría, filtro de estado (Activos por defecto) y orden.
  Los filtros viven en la URL.
- Desde `md:`: tabla con miniatura, nombre + marca, categoría, precio (y precio anterior), stock,
  estado (badge Activo/Archivado) y acciones (Editar, Archivar/Reactivar).
- En base (móvil): la tabla pasa a tarjetas apiladas con la misma información.
- Paginación con números y anterior/siguiente.
- Estados: carga (skeleton de filas), error con "Reintentar", vacío ("Aún no hay productos" + "Crear el primero")
  y sin resultados de búsqueda.

---

## Paso 3 · Frontend: formulario y acciones

### Crear y editar
- Rutas `/admin/productos/nuevo` y `/admin/productos/:id/editar`, mismo componente `ProductForm.tsx`.
- React Hook Form + el esquema Zod compartido, validación al salir de cada campo.
- Secciones, cada una su componente:
  1. **Información**: nombre, marca, categoría, género, descripción (con contador de caracteres).
  2. **Precio**: precio y precio anterior, con prefijo `$` y vista previa del % de descuento.
  3. **Variantes**: tallas como chips seleccionables + campo para tallas personalizadas; colores como etiquetas que se agregan con Enter y se quitan con ×.
  4. **Imágenes**: lista de URLs con vista previa, agregar, quitar y reordenar con botones ↑ ↓ (accesible por teclado). La primera es la portada.
  5. **Disponibilidad**: interruptores "En stock" y "Visible en la tienda".
- Desde `lg:`, columna lateral con la vista previa de cómo se verá la tarjeta en el catálogo.
- Barra inferior fija con "Cancelar" y "Guardar producto" (principal).
- Al guardar: botón con "Guardando…", deshabilitado; al terminar, aviso "Producto guardado" y vuelta al listado.
- Si hay cambios sin guardar y el admin intenta salir, aviso propio en la página (no `confirm()`):
  "Tienes cambios sin guardar · Salir sin guardar / Seguir editando".
- `422`: errores en sus campos y foco en el primero. `409`: aviso "Otra persona modificó este producto.
  Recarga para ver la última versión" con botón "Recargar".

### Archivar y reactivar
- Desde el listado y desde la edición. Archivar abre un diálogo propio (no `confirm()`):
  "¿Archivar «Nombre»? Dejará de verse en la tienda, pero podrás reactivarlo." · "Archivar" / "Cancelar".
- Tras archivar o reactivar: aviso con "Deshacer" por 5 segundos.

### Frontend: archivos
```
features/admin/
  AdminLayout.tsx · AdminSidebar.tsx · AdminNavItem.tsx
  AdminGuard.tsx                    Por ahora solo renderiza children
  productos/
    schema.ts                       Copia del esquema del backend
    api/adminProductsApi.ts         Siempre fetch (no usa VITE_USE_MOCKS)
    hooks/useAdminProducts.ts · useAdminProduct.ts · useSaveProduct.ts · useSetProductStatus.ts
    pages/AdminProductsPage.tsx · ProductFormPage.tsx
    components/ProductsTable.tsx · ProductsCardList.tsx · ProductsToolbar.tsx
    components/form/ProductForm.tsx · InfoSection.tsx · PriceSection.tsx
    components/form/VariantsSection.tsx · ImagesSection.tsx · AvailabilitySection.tsx
    components/ArchiveDialog.tsx · ProductPreview.tsx
```
Reutilizar `shared/ui` (Button, Input, Select, Chip, Badge, Card) y el `FormField` de Encargar.
Al guardar o archivar, invalidar también las queries públicas del catálogo y el detalle.

---

## Criterios de aceptación
**Backend**
- [ ] Todas las rutas de `/api/admin/*` pasan por `adminGuard`.
- [ ] Crear un producto válido responde 201 y aparece en el catálogo público.
- [ ] Un producto con `compareAtPrice` menor o igual a `price`, sin imágenes o con tallas repetidas responde 422 con `fields`.
- [ ] Editar con una `version` desactualizada responde 409 y no modifica el producto.
- [ ] Un producto archivado no aparece en `/api/products` ni en `/filters`, y su detalle público responde 404.
- [ ] Reactivarlo lo vuelve a mostrar en la tienda.
- [ ] Los endpoints aparecen en Swagger bajo "Admin · Productos".

**Frontend**
- [ ] "Administración" aparece en el header y lleva a `/admin/productos`.
- [ ] El panel muestra el menú lateral con Productos activo y las demás opciones como "Próximamente".
- [ ] En móvil el menú es un drawer; desde 1024px es una barra fija a la izquierda.
- [ ] El listado busca con debounce, filtra por categoría y estado, ordena y pagina; los filtros quedan en la URL.
- [ ] En móvil el listado se ve como tarjetas y desde 768px como tabla.
- [ ] Crear un producto desde el formulario lo muestra en el listado y en `/comprar`.
- [ ] Editar precio o imágenes se refleja en el catálogo sin recargar la página.
- [ ] Los errores de validación aparecen bajo cada campo y el foco va al primero.
- [ ] Salir con cambios sin guardar muestra el aviso propio.
- [ ] Archivar pide confirmación en un diálogo propio y ofrece "Deshacer".
- [ ] Un 409 muestra el aviso de conflicto con "Recargar".
- [ ] Todo se usa con teclado; sin scroll horizontal de la página en 360, 768, 1024 y 1440px
      (la tabla puede tener su propio scroll horizontal).
- [ ] Lint, chequeo de tipos y tests pasan en frontend y backend.

## Tests
- Backend: unitarios de los casos de uso con repositorio en memoria; integración de cada endpoint
  con Supertest + `mongodb-memory-server`, incluido el conflicto de versión y el ocultamiento público.
- Frontend: un archivo por página (`AdminProductsPage.test.tsx`, `ProductFormPage.test.tsx`) con
  `fetch` simulado; un test por criterio de frontend.
- Sin E2E en este spec.

## Fuera de alcance
Login y permisos (spec aparte; reemplazará `adminGuard` y `AdminGuard`), subir imágenes (S3, spec aparte), ventas, encargos, clientes, inventario por talla, importación
masiva, resumen con métricas, historial de cambios y roles distintos de admin.