import { Router } from 'express';
import { z } from 'zod';
import { errorResponse } from './docs/commonSchemas.js';
import { registry } from './docs/registry.js';

const HealthUp = z
  .object({ status: z.literal('ok'), db: z.literal('up') })
  .openapi({ example: { status: 'ok', db: 'up' } });

const HealthDown = z
  .object({ status: z.literal('error'), db: z.literal('down') })
  .openapi({ example: { status: 'error', db: 'down' } });

registry.registerPath({
  method: 'get',
  path: '/health',
  summary: 'Estado del servicio y de la conexión a MongoDB',
  tags: ['Sistema'],
  responses: {
    200: {
      description: 'El servicio y la base de datos están disponibles',
      content: { 'application/json': { schema: HealthUp } },
    },
    503: {
      description: 'La base de datos no está disponible',
      content: { 'application/json': { schema: HealthDown } },
    },
    500: errorResponse('Error interno del servidor'),
  },
});

export function healthRoute(isDbUp: () => boolean): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    if (isDbUp()) {
      res.status(200).json({ status: 'ok', db: 'up' });
    } else {
      res.status(503).json({ status: 'error', db: 'down' });
    }
  });

  return router;
}
