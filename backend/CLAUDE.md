# Backend — Node.js + Express + MongoDB (arquitectura hexagonal)

## Stack
- Node.js LTS + TypeScript (strict)
- Express · Mongoose (solo en infraestructura) · Zod para validar entradas
- Pino para logs (JSON). No usar `console.log`.
- ESLint + Prettier

## Estructura
```
src/
  domain/<modulo>/
    entities/          Entidades y value objects con reglas de negocio
    errors/            Errores de dominio
  application/<modulo>/
    use-cases/         Un archivo por caso de uso (ej. CreateEncargo.ts)
    ports/             Interfaces (ej. EncargoRepository)
    dtos/
  infrastructure/
    http/              Rutas, controladores, middlewares de Express
    persistence/mongo/ Modelos Mongoose y repositorios que implementan los puertos
    services/          Adaptadores externos (S3, email…)
  config/env.ts        Variables de entorno validadas con Zod al arrancar
  app.ts               Crea la app de Express (sin escuchar puerto, para tests)
  main.ts              Composición: crea adaptadores, inyecta dependencias y levanta el servidor
```

## Reglas de dependencia (obligatorias)
- infrastructure → application → domain. Nunca al revés.
- `domain` y `application` no importan Express, Mongoose ni SDKs de AWS.
- Los casos de uso reciben sus puertos por constructor.
- Los controladores solo: validan con Zod, llaman al caso de uso y mapean la respuesta.
- Los repositorios convierten documentos de Mongo a entidades; nunca exponen documentos de Mongoose.
- La inyección de dependencias se arma solo en `main.ts`.

## Buenas prácticas
- Errores de dominio → código HTTP en un middleware central, con formato `{ error: { code, message, fields? } }`.
- helmet, CORS restringido a `FRONTEND_URL`, rate limiting y límite de tamaño del body.
- Índices de Mongo explícitos para las consultas frecuentes.
- `GET /health` para Docker y AWS. Apagado ordenado con SIGTERM.

## Documentación (Swagger)
- Todo endpoint nuevo se registra en `infrastructure/http/docs/registry.ts` en el mismo spec que lo crea,
  usando sus esquemas Zod con ejemplos. Un endpoint sin documentar no se da por terminado.
- Swagger UI en `/api/docs`, documento en `/api/docs.json`.

## Tests
- Vitest + Supertest.
- Unitarios de dominio y casos de uso con repositorios en memoria (sin Mongo). Son la mayoría.
- Integración de repositorios y API con `mongodb-memory-server`.
- Un test por criterio de aceptación.
- Comandos: `npm run lint`, `npm run typecheck`, `npm test -- <Nombre>`.

## Docker
- Multi-stage: `build` (npm ci + compilar TS) y `runtime` (solo dependencias de producción + dist), usuario no root.
- HEALTHCHECK a `/health`. La URI de Mongo llega por `MONGO_URI`.