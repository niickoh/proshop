import cors from 'cors';
import express, { Router, type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Logger } from 'pino';
import { docsRouter } from './infrastructure/http/docs/docsRouter.js';
import { errorMiddleware } from './infrastructure/http/errorMiddleware.js';
import { healthRoute } from './infrastructure/http/healthRoute.js';
import { notFound } from './infrastructure/http/notFound.js';
import { AppError } from './shared/errors/AppError.js';

export interface AppDeps {
  frontendUrl: string;
  isDbUp: () => boolean;
  logger: Logger;
  apiRouter?: Router;
  docs?: { enabled: boolean; port: number };
}

export function createApp({
  frontendUrl,
  isDbUp,
  logger,
  apiRouter = Router(),
  docs,
}: AppDeps): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || origin === frontendUrl) {
          callback(null, true);
        } else {
          callback(new AppError('CORS_NOT_ALLOWED', 403, `Origen no permitido: ${origin}`));
        }
      },
    }),
  );

  app.use(healthRoute(isDbUp));
  if (docs?.enabled) app.use(docsRouter(docs.port));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (_req, _res, next) => {
        next(new AppError('TOO_MANY_REQUESTS', 429, 'Demasiadas peticiones, intenta más tarde'));
      },
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', apiRouter);

  app.use(notFound);
  app.use(errorMiddleware(logger));

  return app;
}
