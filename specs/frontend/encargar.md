# Spec: Encargar

## Objetivo
Formulario para que el cliente pida un producto por encargo, dejando sus datos de contacto y
entrega. El envío ya usa el contrato real de la API; mientras no exista backend, lo responde MSW.

## Alcance
Solo frontend. Ruta: `/encargar` (reemplaza el placeholder del header).
Ubicación: `src/features/encargar/`.

## Conexión con el backend
- El formulario hace un `POST` real a `${VITE_API_URL}/api/encargos` usando el cliente HTTP de
  `src/lib/` (reutilizar el del catálogo si ya existe; si no, crearlo ahí).
- Por ahora MSW intercepta esa petición. Cuando el backend exista, solo se desactiva MSW:
  el código del formulario no cambia.
- El esquema de validación (Zod) vive en un archivo propio para poder copiarlo al backend.

### Contrato
```ts
// Request: POST /api/encargos
type EncargoRequest = {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;      // normalizado a +569XXXXXXXX
  direccion: string;
  producto: string;
  talla: string | null;  // null si no aplica
  cantidad: number;      // 1 a 20
};

// 201 Created
type EncargoResponse = { id: string; folio: string; createdAt: string };

// 400 / 422 (formato de error del proyecto)
type ApiError = { error: { code: string; message: string; fields?: Record<string, string> } };
```
- Header `Idempotency-Key` (UUID generado al montar el formulario) para que un doble envío
  no cree dos encargos.
- MSW: responde `201` con un folio tipo `ENC-000123` tras 800 ms. Si el correo contiene
  `error@`, responde `422` con `fields.correo`; si contiene `falla@`, responde `500`
  (sirve para probar los estados de error).

## Componentes
```
features/encargar/
  EncargarPage.tsx         Título, texto breve y el formulario o la confirmación
  schema.ts                Esquema Zod + tipos (compartible con el backend)
  api/createEncargo.ts     POST con Idempotency-Key
  hooks/useCreateEncargo.ts useMutation de TanStack Query
  components/
    EncargoForm.tsx        React Hook Form + zodResolver
    FormField.tsx          Base: label + control + ayuda + error (reutilizable en Contacto)
    EncargoSuccess.tsx     Confirmación con el folio
  encargar.test.tsx
```
Cada campo usa `FormField`; no repetir el marcado de label y error en cada uno.

## Campos y validación
| Campo     | Control          | Reglas                                                        |
|-----------|------------------|---------------------------------------------------------------|
| Nombre    | text             | Obligatorio, 2 a 50 caracteres. `autocomplete="given-name"`   |
| Apellido  | text             | Obligatorio, 2 a 50 caracteres. `autocomplete="family-name"`  |
| Correo    | email            | Obligatorio, formato válido. `autocomplete="email"`           |
| Teléfono  | tel              | Obligatorio, móvil chileno (`+56 9 1234 5678`, acepta con o sin +56 y espacios). `autocomplete="tel"` |
| Dirección | text             | Obligatoria, 5 a 120 caracteres. `autocomplete="street-address"` |
| Producto  | text             | Obligatorio, 3 a 100 caracteres. Ayuda: "Nombre, marca o enlace del producto" |
| Talla     | select           | Opcional: No aplica, XS, S, M, L, XL, XXL, 35 a 45. Por defecto "No aplica" |
| Cantidad  | number + − / +   | Obligatoria, entero de 1 a 20. Por defecto 1                  |

- Todos los obligatorios marcados con `*` y una nota "* Campos obligatorios" arriba del formulario.
- Validar al salir del campo (`mode: 'onTouched'`); después de un error, revalidar mientras escribe.
- Mensajes en español, específicos y bajo el campo (ej. "Ingresa un correo válido, como nombre@correo.cl").
- Cada error enlazado con `aria-describedby` y el campo con `aria-invalid`.
- Al enviar con errores: el foco va al primer campo inválido.
- Campo oculto anti-spam (honeypot `website`); si viene lleno, no se envía.
- Recortar espacios antes de enviar.

## Layout mobile first
- Contenedor centrado: `mx-auto max-w-3xl`, tarjeta con padding y título "Haz tu encargo".
- Base (móvil): una columna.
- `md:` (≥ 768px): dos columnas (`grid md:grid-cols-2 gap-x-6 gap-y-5`):
  ```
  Nombre        | Apellido
  Correo        | Teléfono
  Dirección     (ancho completo)
  Producto      (ancho completo)
  Talla         | Cantidad
  [ Enviar encargo ]  (ancho completo)
  ```
- Inputs de alto mínimo 44px y `text-base` (evita el zoom automático en iOS).
- Teclados correctos en móvil: `type="email"`, `type="tel"`, `inputMode="numeric"` en cantidad.

## Envío y estados
- **Enviando:** el botón muestra un spinner y "Enviando…", queda deshabilitado y los campos
  también, para evitar doble envío.
- **Éxito:** se reemplaza el formulario por la confirmación: "¡Recibimos tu encargo!", el folio
  destacado, "Te contactaremos a <correo> en un plazo de 48 horas hábiles" y el botón
  "Hacer otro encargo" (limpia el formulario y genera una nueva Idempotency-Key). El foco va al título.
- **Error 422:** se muestran los errores del servidor en sus campos.
- **Error de red o 500:** aviso arriba del formulario ("No pudimos enviar tu encargo. Revisa tu
  conexión e inténtalo de nuevo") con `role="alert"`; los datos ingresados se conservan.

## Criterios de aceptación
- [ ] En `/encargar` veo el formulario centrado con todos los campos y el botón "Enviar encargo".
- [ ] En 360px los campos van en una columna; desde 768px en dos, con Dirección y Producto a ancho completo.
- [ ] Al enviar vacío se muestran los errores de los obligatorios y el foco va al primero.
- [ ] Un correo o teléfono inválido muestra su mensaje al salir del campo.
- [ ] La cantidad no permite valores fuera de 1 a 20 y los botones − / + respetan esos límites.
- [ ] Talla vacía se envía como `null`.
- [ ] Al enviar datos válidos se hace un `POST /api/encargos` con el cuerpo del contrato y el header `Idempotency-Key`.
- [ ] Mientras se envía, el botón muestra "Enviando…" y no se puede enviar dos veces.
- [ ] Con respuesta 201 veo la confirmación con el folio; "Hacer otro encargo" vuelve al formulario vacío.
- [ ] Con 422 el error aparece en el campo correspondiente.
- [ ] Con error de red o 500 aparece el aviso y los datos siguen en el formulario.
- [ ] Si el honeypot está lleno no se hace la petición.
- [ ] Todo el formulario se usa con teclado, cada campo tiene label visible y los errores se anuncian.
- [ ] Sin scroll horizontal en 360px, 768px, 1024px y 1440px.

## Tests
- `encargar.test.tsx` (Vitest + RTL + MSW con `userEvent`), un test por criterio. Verificar el cuerpo
  y los headers de la petición con un spy en el handler de MSW.
- Test unitario de `schema.ts` con casos válidos e inválidos (sobre todo teléfono).
- Sin E2E en este spec.

## Fuera de alcance
Backend real, envío de correos o notificaciones, adjuntar imágenes, elegir el producto desde el
catálogo, captcha, seguimiento del encargo y panel de administración.