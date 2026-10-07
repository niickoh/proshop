# Spec: Base del backend

## Objetivo
Crear el proyecto del backend con la arquitectura hexagonal lista, conectado a MongoDB y
levantando con Docker, para que los siguientes specs solo agreguen módulos.

## Alcance
Backend + `docker-compose.yml` + `.env.example`. Ubicación: `backend/`.
No crea ningún módulo de negocio (productos, encargos): eso va en sus propios specs.

## Componentes
```
backend/
  package.json             Scripts: dev, build, start, lint, typecheck, test
  tsconfig.json            strict
  Dockerfile               Multi-stage, usuario no root, HEALTHCHECK /health
  .dockerignore
  src/
    domain/                Vacío (con .gitkeep)
    application/           Vacío (con .gitkeep)
    infrastructure/
      http/
        errorMiddleware.ts Errores → { error: { code, message, fields? } }
        notFound.ts        404 con el mismo formato
        healthRoute.ts     GET /health
      persistence/mongo/
        connection.ts      Conectar y desconectar Mongo
    shared/errors/
      AppError.ts          Base: code + status + message + fields
    config/env.ts          Zod: PORT, MONGO_URI, FRONTEND_URL, NODE_ENV
    app.ts                 Express + helmet + cors + json(limit 100kb) + rate limit + rutas + errores
    main.ts                Carga env, conecta Mongo, levanta servidor, apagado con SIGTERM
  test/
    app.test.ts
```
- Rutas de la API bajo el prefijo `/api`.
- `GET /health` responde `200 { status: 'ok', db: 'up' }` o `503 { status: 'error', db: 'down' }`.
- Si falta una variable de entorno, el proceso termina al arrancar con un mensaje claro.

## Docker
- `docker-compose.yml`: agregar `backend` (puerto 4000) y `mongo` (imagen oficial, volumen
  `mongo_data`, healthcheck con `mongosh --eval "db.adminCommand('ping')"`).
- `backend` con `depends_on: mongo: condition: service_healthy`.
- `frontend` recibe `VITE_API_URL=http://localhost:4000` y `VITE_USE_MOCKS=true`
  (sigue usando `data/` hasta que cada módulo del backend se conecte en su propio spec).
- `.env.example`: agregar `PORT`, `MONGO_URI`, `FRONTEND_URL`, `VITE_API_URL`, `VITE_USE_MOCKS`.

## Criterios de aceptación
- [ ] `docker compose up --build` levanta frontend, backend y mongo sin errores.
- [ ] `GET /health` responde 200 con `db: 'up'` cuando Mongo está arriba.
- [ ] Una ruta inexistente responde 404 con el formato de error del proyecto.
- [ ] Un error no controlado responde 500 con el formato de error y no expone el stack.
- [ ] Peticiones desde un origen distinto a `FRONTEND_URL` son rechazadas por CORS.
- [ ] Un body mayor a 100 kb responde 413.
- [ ] Sin `MONGO_URI` el proceso no arranca y muestra qué variable falta.
- [ ] `domain/` y `application/` no importan Express ni Mongoose.

## Tests
`test/app.test.ts` con Vitest + Supertest sobre `app.ts` (sin levantar puerto), un test por
criterio que no dependa de Docker. Mongo con `mongodb-memory-server`.

## Fuera de alcance
Módulos de productos, encargos y carrito, autenticación, pagos, despliegue en AWS y CI.