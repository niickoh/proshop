# Spec: Documentación de la API con Swagger

## Objetivo
Tener una página Swagger UI para ver y probar todos los endpoints del backend desde el navegador,
generada desde los mismos esquemas Zod que validan las peticiones, para que la documentación
nunca quede desactualizada.

## Alcance
Solo backend. Requiere `base.md` implementado.
Ubicación: `backend/src/infrastructure/http/docs/`.

## Librerías
- `@asteasolutions/zod-to-openapi`: genera el documento OpenAPI 3 desde los esquemas Zod.
- `swagger-ui-express`: sirve la interfaz de Swagger.
No escribir el YAML/JSON de OpenAPI a mano.

## Componentes
```
infrastructure/http/docs/
  registry.ts        OpenAPIRegistry compartido; cada módulo registra ahí sus rutas
  openapi.ts         Genera el documento: título "Proshop API", versión desde package.json,
                     servidor `http://localhost:${PORT}`, esquema común de error
  docsRouter.ts      GET /api/docs (Swagger UI) y GET /api/docs.json (documento)
  commonSchemas.ts   ErrorResponse { error: { code, message, fields? } } reutilizable
```
- Cada módulo registra sus rutas en el mismo archivo donde define sus rutas de Express
  (ej. `infrastructure/http/health/healthRoute.ts` registra `GET /health`).
- Los esquemas Zod de request/response viven donde ya se definen (DTOs); se les agrega
  `.openapi({ example })` con ejemplos realistas en español.
- Cada ruta documenta: resumen, tag (Productos, Encargos, Sistema), parámetros, body,
  respuestas exitosas y las de error (400, 404, 422, 500 según aplique) con `ErrorResponse`.

## Configuración
- Solo disponible cuando `NODE_ENV !== 'production'` o `ENABLE_DOCS=true`.
  En producción, por defecto, `/api/docs` responde 404.
- `helmet` bloquea los scripts de Swagger UI: relajar la Content-Security-Policy solo en
  la ruta `/api/docs`, no en toda la app.
- Agregar `ENABLE_DOCS` a `config/env.ts` (opcional, booleano) y a `.env.example`.
- Swagger UI con `persistAuthorization: true` y `tryItOutEnabled: true`.

## Criterios de aceptación
- [ ] Con el backend levantado, `http://localhost:4000/api/docs` muestra Swagger UI con el título "Proshop API".
- [ ] `GET /health` aparece documentado bajo el tag "Sistema" y se puede ejecutar con "Try it out".
- [ ] `GET /api/docs.json` devuelve un documento OpenAPI 3 válido.
- [ ] El esquema `ErrorResponse` aparece una sola vez en `components.schemas` y las rutas lo referencian.
- [ ] Con `NODE_ENV=production` y sin `ENABLE_DOCS`, `/api/docs` responde 404.
- [ ] El resto de la API mantiene la Content-Security-Policy estricta de helmet.
- [ ] Lint, chequeo de tipos y tests existentes pasan.

## Tests
`test/docs.test.ts` con Supertest: el documento se genera sin errores, contiene `/health`,
contiene `ErrorResponse`, y `/api/docs` responde 404 en producción.
Validar el documento con `@apidevtools/swagger-parser` (solo devDependency).

## Fuera de alcance
Documentar endpoints que aún no existen, autenticación en Swagger, generar un cliente
TypeScript para el frontend y publicar la documentación fuera del backend.