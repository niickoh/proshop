import { Router } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { buildOpenApiDocument } from './openapi.js';

// Swagger UI usa scripts y estilos inline: la CSP se relaja solo en estas rutas
const swaggerCsp = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
    },
  },
});

export function docsRouter(port: number): Router {
  const document = buildOpenApiDocument(port);
  const router = Router();

  router.get('/api/docs.json', (_req, res) => {
    res.json(document);
  });

  router.use(
    '/api/docs',
    swaggerCsp,
    swaggerUi.serve,
    swaggerUi.setup(document, {
      customSiteTitle: 'Proshop API',
      swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true,
        validatorUrl: null,
      },
    }),
  );

  return router;
}
