# Spec: Detalle del producto

## Objetivo
Mostrar un producto con su foto como protagonista, su descripción y su precio, con acciones para
agregarlo al carrito, comprarlo de inmediato o volver al catálogo.
**Solo la vista:** los botones de compra todavía no tienen funcionalidad.

## Alcance
Solo frontend, datos simulados con arrays locales. Ruta: `/comprar/:id` (reemplaza el placeholder del catálogo).
Ubicación: `src/features/producto-detalle/`.

## Modelo de datos
Reutiliza `Product` de `features/catalogo` y le agrega un campo:
```ts
description: string;   // texto plano, puede tener saltos de línea
```
Actualizar el tipo y los datos de ejemplo (`features/catalogo/data/products.ts`) para que todos los
productos tengan descripción.
`GET /api/products/:id` → `Product`, o `404` si no existe. `api/getProduct.ts` lo simula sobre el array
local con 300 ms de latencia y lanza `NotFoundError` (`lib/errors.ts`) como equivalente al 404.

## Componentes
```
features/producto-detalle/
  ProductoDetallePage.tsx    Lee :id, obtiene el producto y compone la vista
  api/getProduct.ts
  hooks/useProduct.ts        useQuery con queryKey ['product', id]
  components/
    BackToCatalog.tsx        Botón "Volver al catálogo"
    ProductGallery.tsx       Foto principal centrada + miniaturas
    ProductInfo.tsx          Marca, nombre, precio, oferta, stock y descripción
    SizeSelector.tsx         Tallas como botones (solo estado local)
    PurchaseActions.tsx      "Agregar al carrito" y "Comprar ahora"
    ProductDetailSkeleton.tsx
  ProductoDetallePage.test.tsx
```
- Reutilizar el formato de precio y los badges de oferta/agotado del catálogo; no duplicarlos.
  Si hoy viven dentro de `ProductCard`, moverlos a `shared/`.
- `PurchaseActions` recibe `onAddToCart` y `onBuyNow` como props. Por ahora la página les pasa
  funciones vacías. No crear estado de carrito, contexto ni rutas de checkout.

## Layout mobile first
- Columna única centrada (`mx-auto max-w-3xl`), en este orden:
  1. "Volver al catálogo" arriba a la izquierda.
  2. Foto principal centrada, `aspect-[3/4]`, `object-cover`, con miniaturas debajo en una fila
     con scroll horizontal (`overflow-x-auto snap-x`). Al tocar una miniatura cambia la foto
     principal y la miniatura activa se marca.
  3. Marca, nombre (`h1`), precio y, si aplica, precio anterior tachado + badge "% OFF".
  4. Selector de talla.
  5. Botones de compra.
  6. Descripción.
- Base (móvil): los dos botones van en una barra fija abajo (`fixed bottom-0`, con
  `pb-[env(safe-area-inset-bottom)]`) para tenerlos siempre a mano; la página deja espacio
  inferior para que la barra no tape la descripción.
- `md:` en adelante: los botones vuelven al flujo normal, uno al lado del otro, bajo el selector de talla.
- Foto principal con `loading="eager"` (es lo primero que se ve); miniaturas con `loading="lazy"`.

## Botones
- **Agregar al carrito:** botón secundario (borde, fondo claro).
- **Comprar ahora:** botón principal (color de marca, fondo sólido). Es la acción destacada.
- Ambos con alto mínimo de 44px, ancho completo en móvil y texto que no se corta.
- Sin stock: ambos deshabilitados (`disabled` + `aria-disabled`) y el texto "Agotado" junto al precio.
- **Volver al catálogo:** si el usuario llegó desde `/comprar`, vuelve atrás en el historial
  para conservar filtros y posición de scroll; si entró directo por enlace, navega a `/comprar`.

## Selector de talla
- Muestra las tallas de `product.sizes` como botones con `aria-pressed`.
- Si el producto tiene una sola talla, viene seleccionada.
- Solo guarda la selección en estado local; no bloquea los botones todavía.

## Estados
- Carga: `ProductDetailSkeleton` con la misma forma de la vista.
- No encontrado (404): "Este producto no existe o ya no está disponible" + botón "Volver al catálogo".
- Error: mensaje claro + botón "Reintentar".
- El `document.title` pasa a ser el nombre del producto.

## Criterios de aceptación
- [ ] En `/comprar/:id` veo la foto principal centrada, la marca, el nombre, el precio y la descripción del producto.
- [ ] Al tocar una miniatura cambia la foto principal y esa miniatura queda marcada como activa.
- [ ] Un producto en oferta muestra el precio anterior tachado y el badge "% OFF".
- [ ] Un producto sin stock muestra "Agotado" y los dos botones de compra deshabilitados.
- [ ] Veo los botones "Agregar al carrito" y "Comprar ahora"; al tocarlos se llama a `onAddToCart` y `onBuyNow`.
- [ ] Puedo seleccionar una talla y queda marcada con `aria-pressed="true"`.
- [ ] Viniendo del catálogo con filtros, "Volver al catálogo" me devuelve con los mismos filtros.
- [ ] Entrando directo a la URL, "Volver al catálogo" me lleva a `/comprar`.
- [ ] Con un id inexistente veo el mensaje de producto no encontrado y el botón para volver.
- [ ] Se muestran correctamente los estados de carga y de error con "Reintentar".
- [ ] En móvil los botones están en una barra fija abajo y no tapan la descripción; desde `md:` están en el flujo normal.
- [ ] En 360px, 768px, 1024px y 1440px no hay scroll horizontal de la página y ningún texto se corta.
- [ ] Todo se puede usar con teclado, con foco visible, y la foto principal tiene un `alt` con el nombre del producto.

## Tests
`ProductoDetallePage.test.tsx` con Vitest + RTL, renderizando con `MemoryRouter` en `/comprar/:id`.
Para forzar errores, espiar `getProduct` con `vi.mock`. Un test por criterio. Sin E2E en este spec.

## Fuera de alcance
Carrito (estado, ícono en el header, contador), checkout, lógica real de "Agregar" y "Comprar ahora",
validar talla obligatoria, selector de color y de cantidad, zoom de imagen, productos relacionados,
reseñas y backend real.