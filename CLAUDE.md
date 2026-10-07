# Reglas generales del proyecto

## Fase actual
Solo frontend. No crear backend, base de datos ni servicios de API todavía.
Los datos que necesite el frontend se simulan con arrays locales (sin MSW): cada feature tiene
`data/` con los arrays y `api/` con funciones que devuelven la misma forma que la API real
(latencia simulada y `AbortSignal`). Los tipos de `types.ts` son la base del modelo del backend.
Para conectar el backend se reemplaza solo el cuerpo de las funciones de `api/` por `fetch`.

## Stack
- Frontend: React + TypeScript (ver @frontend/CLAUDE.md)
- Docker en local, AWS en producción
<!-- Al empezar el backend: agregar "Backend: Node.js + MongoDB, hexagonal (ver @backend/CLAUDE.md)" -->

## Estructura
```
/frontend          App React
/specs             Un spec .md por feature (plantilla: @specs/_plantilla.md)
docker-compose.yml Por ahora solo el servicio frontend
.env.example       Variables requeridas (nunca subir .env)
```

## Flujo spec-driven
1. Leer el spec indicado y solo los archivos que menciona. No explorar el proyecto completo.
2. Si el spec toca más de 5 archivos o algo es ambiguo, proponer un plan breve y esperar confirmación.
   Si no, implementar directo.
3. Escribir primero los tests de los criterios de aceptación; luego implementar hasta que pasen.
4. Correr lint, chequeo de tipos y solo los tests relacionados (ej. `npm test -- Header`).
5. Respetar "Fuera de alcance": no crear ni modificar nada fuera del spec.
6. Al terminar, responder en máximo 3 líneas: archivos creados/modificados y resultado de lint y tests.

## Docker
- `frontend/Dockerfile` multi-stage, base `node:<LTS>-alpine`, usuario no root.
- `docker-compose.yml` en la raíz, por ahora solo con el servicio `frontend`.
- Configuración solo por variables de entorno; mantener `.env.example` al día.
- `.dockerignore` con node_modules, .env, coverage, dist.
- Todo levanta con `docker compose up --build`.

## AWS y seguridad
- Nunca escribir credenciales ni secretos en el código.
- Producción: secretos en Secrets Manager o Parameter Store; imágenes en ECR.

## Git
- Commits pequeños con Conventional Commits (feat, fix, refactor, test, chore).