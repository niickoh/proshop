import type { RequestHandler } from 'express';

/**
 * Protege todas las rutas `/api/admin/*`.
 * Temporal: sin login deja pasar todo. El spec de login reemplazará su contenido.
 * No desplegar en un servidor público hasta entonces.
 */
export const adminGuard: RequestHandler = (_req, _res, next) => {
  next();
};
