# Reglas generales del proyecto

## Stack
- Frontend: React + TypeScript + Tailwind (ver @frontend/CLAUDE.md)
- Backend: Node.js + Express + MongoDB, arquitectura hexagonal (ver @backend/CLAUDE.md)
- Docker en local, AWS en producción

## Estructura
```
/frontend             App React
/backend              API Node (hexagonal)
/specs
  _plantilla.md       Plantilla para specs nuevos
  /frontend           Specs de vistas y componentes
  /backend            Specs de la API
  /fullstack          Specs que cambian frontend y backend a la vez
docker-compose.yml    frontend + backend + mongo
.env.example          Variables requeridas (nunca subir .env)
```

## Conexión frontend ↔ backend
- Cada feature del frontend tiene `data/` (arrays locales) y `api/` (funciones con la misma forma
  que la API real, con latencia simulada y `AbortSignal`).
- Los tipos de `types.ts` del frontend son el contrato: el backend responde exactamente esa forma.
  Si hace falta cambiar un contrato, se avisa y se actualizan ambos lados en el mismo spec.
- Al terminar un módulo del backend, su spec incluye conectar el frontend: el cuerpo de las
  funciones de `api/` pasa a usar `fetch` a `VITE_API_URL`. Los componentes y hooks no cambian.
- Mientras se migra, `api/` decide la fuente con `VITE_USE_MOCKS`: `true` usa `data/`,
  `false` llama al backend. Los arrays de `data/` se conservan para tests y desarrollo sin backend.
- Formato de error común: `{ error: { code, message, fields? } }`.

## Flujo spec-driven
1. Leer el spec indicado y solo los archivos que menciona. No explorar el proyecto completo.
2. Si el spec toca más de 5 archivos o algo es ambiguo, proponer un plan breve y esperar confirmación.
   Si no, implementar directo.
3. Escribir primero los tests de los criterios de aceptación; luego implementar hasta que pasen.
   Excepción: si la sección "Tests" del spec dice "Sin tests automatizados", no escribir ni correr tests.
4. Correr lint, chequeo de tipos y solo los tests relacionados (ej. `npm test -- Header`).
5. Respetar "Fuera de alcance": no crear ni modificar nada fuera del spec.
6. Al terminar, responder en máximo 3 líneas: archivos creados/modificados y resultado de lint y tests.

## Docker
- `frontend/Dockerfile` y `backend/Dockerfile` multi-stage, base `node:<LTS>-alpine`, usuario no root.
- `docker-compose.yml` en la raíz: `frontend`, `backend` y `mongo` (volumen nombrado + healthcheck).
- `backend` depende de `mongo` con `condition: service_healthy`.
- Configuración solo por variables de entorno; mantener `.env.example` al día.
- `.dockerignore` con node_modules, .env, coverage, dist.
- Todo levanta con `docker compose up --build`.

## AWS y seguridad
- Nunca escribir credenciales ni secretos en el código.
- Producción: secretos en Secrets Manager o Parameter Store; imágenes en ECR.
- Archivos de usuarios en S3, nunca en el disco del contenedor.

## Git
- Commits pequeños con Conventional Commits (feat, fix, refactor, test, chore).