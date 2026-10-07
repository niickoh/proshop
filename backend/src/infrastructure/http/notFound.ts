import type { RequestHandler } from 'express';
import { AppError } from '../../shared/errors/AppError.js';

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError('NOT_FOUND', 404, `Ruta no encontrada: ${req.method} ${req.path}`));
};
