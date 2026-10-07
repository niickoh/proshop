# Spec: Carrito

## Objetivo
Un carrito compartido en toda la app: se agregan y quitan productos rápido, se ve siempre desde el
header y muestra el detalle de la compra con su total y un botón para comprar.

## Alcance
Solo frontend. Sin backend: el carrito vive en el navegador.
Ubicación: `src/features/carrito/`. Rutas nuevas: `/carrito` y `/checkout` (placeholder).
Modifica: `Header` (ícono del carrito) y `producto-detalle` (conectar los botones).

## Estado compartido
Zustand con `persist` (localStorage, clave `proshop-cart`, con `version` para migraciones),
así el carrito sobrevive a recargas y está disponible en cualquier componente.
```ts
type CartItem = {
  productId: string;
  size: string;
  name: string;
  brand: string;
  image: string;
  price: number;          // CLP al momento de agregar
  compareAtPrice?: number;
  quantity: number;       // 1 a 10
};

type CartStore = {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem(item: Omit<CartItem, 'quantity'>, quantity?: number): void;
  removeItem(productId: string, size: string): void;
  updateQuantity(productId: string, size: string, quantity: number): void;
  clear(): void;
  openDrawer(): void;
  closeDrawer(): void;
};
```
- Una línea se identifica por `productId + size`: mismo producto y talla suma cantidad;
  otra talla crea una línea nueva.
- Cantidad entre 1 y 10. Agregar más allá de 10 deja 10.
- Selectores derivados (no se guardan): `itemCount` (suma de cantidades), `subtotal`, `savings`.
- `isDrawerOpen` no se persiste.
- Los componentes usan selectores (`useCartStore(s => s.items)`), no el store completo.

## Componentes
```
features/carrito/
  store/cartStore.ts         Store de Zustand + persist
  store/selectors.ts         itemCount, subtotal, savings
  components/
    CartButton.tsx           Ícono del carrito con contador (se usa en el Header)
    CartDrawer.tsx           Panel lateral derecho (mini carrito)
    CartItemList.tsx         Lista de líneas
    CartItemRow.tsx          Foto, marca, nombre, talla, precio, cantidad, eliminar
    QuantityStepper.tsx      − cantidad +
    CartSummary.tsx          Subtotal, ahorro, envío, total y botón de compra
    EmptyCart.tsx
  CarritoPage.tsx            Vista completa en /carrito
  carrito.test.tsx
  cartStore.test.ts
```
`CartDrawer` y `CarritoPage` reutilizan `CartItemList` y `CartSummary`; no duplican lógica.

## Header
- `CartButton` va a la derecha del header y se ve en todas las pantallas (en móvil, junto al botón de menú).
- Ícono de bolsa/carrito con badge del total de unidades; sin badge si está vacío; "99+" si pasa de 99.
- `aria-label` dinámico: "Carrito, 3 productos" / "Carrito vacío".
- Al tocarlo abre el `CartDrawer`.
- El badge hace una animación corta al cambiar (respetando `prefers-reduced-motion`).

## Drawer (mini carrito)
- Panel desde la derecha: ancho completo en móvil, `sm:max-w-md` desde `sm:`.
- Título "Tu carrito (N)", botón cerrar, lista con scroll propio y resumen fijo abajo.
- Foco atrapado, cierre con Escape, clic en el fondo o botón cerrar; al cerrar el foco vuelve al ícono.
- Se abre automáticamente al agregar un producto desde el detalle.
- Abajo: "Comprar carrito" (principal) y el enlace "Ver carrito completo" → `/carrito`.

## Línea del carrito
- Foto miniatura (enlaza al detalle), marca, nombre, "Talla: M", precio unitario y subtotal de la línea.
- Si tiene `compareAtPrice`, muestra el precio anterior tachado.
- `QuantityStepper`: botones − y + de 44×44px; − deshabilitado en 1, + deshabilitado en 10.
  La cantidad se anuncia a lectores de pantalla (`aria-live="polite"`).
- Botón "Eliminar" (ícono con `aria-label="Eliminar <nombre>, talla M"`).
- Al eliminar aparece un aviso "Producto eliminado · Deshacer" por 5 segundos; "Deshacer" lo restaura
  en la misma posición.

## Resumen
- Subtotal, "Ahorras $X" si hay ofertas, "Envío: se calcula en el pago" y **Total** destacado.
- Precios en CLP con el formato compartido del catálogo.
- Botón principal **"Comprar carrito"** → navega a `/checkout`.
- Mensaje de confianza bajo el botón: "Pago seguro · Cambios y devoluciones en 30 días" (texto fijo).

## Página /carrito
- Mobile first: lista y resumen en una columna; en móvil el total y "Comprar carrito" en una barra fija abajo.
- `lg:`: lista a la izquierda (2/3) y resumen sticky a la derecha (1/3).
- Enlace "Seguir comprando" → `/comprar`.

## Carrito vacío
Ícono, "Tu carrito está vacío", texto breve y botón "Ir a comprar" → `/comprar`.
Se usa igual en el drawer y en la página.

## Conexión con el detalle del producto
- "Agregar al carrito": ahora la talla es obligatoria si el producto tiene más de una.
  Sin talla, el botón muestra "Selecciona una talla" junto al selector (con `aria-describedby`) y no agrega.
  Con talla: agrega 1 unidad y abre el drawer.
- "Comprar ahora": con la talla elegida, navega a `/checkout` pasando ese único producto en el
  estado de la ruta (`state: { buyNow: item }`). **No modifica el carrito.**
- `/checkout` es un placeholder que muestra "Checkout" y lista lo que recibió (carrito o compra directa).

## Criterios de aceptación
- [ ] El ícono del carrito se ve en el header en 360px y 1440px, sin badge cuando está vacío.
- [ ] Al agregar un producto desde el detalle, el badge suma 1 y se abre el drawer con ese producto.
- [ ] Agregar el mismo producto y talla aumenta la cantidad; otra talla crea una línea nueva.
- [ ] Sin talla elegida, "Agregar al carrito" muestra "Selecciona una talla" y no agrega nada.
- [ ] En el drawer y en `/carrito` veo cada línea con foto, nombre, talla, precio unitario, cantidad y subtotal.
- [ ] Con + y − cambia la cantidad, el subtotal y el total; − se deshabilita en 1 y + en 10.
- [ ] Al eliminar una línea desaparece y aparece "Deshacer"; al tocarlo vuelve en la misma posición.
- [ ] El total es la suma de precio × cantidad de todas las líneas; con ofertas se muestra el ahorro.
- [ ] Al recargar la página el carrito mantiene sus productos.
- [ ] "Comprar carrito" navega a `/checkout` con los productos del carrito.
- [ ] "Comprar ahora" navega a `/checkout` con solo ese producto y el carrito no cambia.
- [ ] Con el carrito vacío veo el mensaje y el botón "Ir a comprar".
- [ ] El drawer se cierra con Escape, con el fondo y con el botón cerrar, y el foco vuelve al ícono.
- [ ] En `/carrito`, en móvil el total y el botón quedan en una barra fija; desde `lg:` el resumen va a la derecha.
- [ ] Sin scroll horizontal en 360px, 768px, 1024px y 1440px; todo usable con teclado.

## Tests
- `cartStore.test.ts`: agregar, sumar cantidad, tallas distintas, límite de 10, eliminar, actualizar,
  selectores y persistencia.
- `carrito.test.tsx` (Vitest + RTL, datos de los arrays locales; para forzar errores, espiar las
  funciones de `api/` con `vi.mock`): un test por criterio de interfaz, incluido el flujo
  detalle → agregar → drawer. Limpiar `localStorage` y el store entre tests.
- Sin E2E en este spec (se agregará en `checkout.md`, que es flujo crítico).

## Fuera de alcance
Checkout real y pago, cálculo de envío, cupones de descuento, validar stock o precios contra el
backend, carrito sincronizado con una cuenta de usuario, productos guardados para después y backend real.