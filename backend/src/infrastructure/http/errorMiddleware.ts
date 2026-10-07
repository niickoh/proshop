import type { ErrorRequestHandler } from 'express';
import type { Logger } from 'pino';
import { AppError } from '../../shared/errors/AppError.js';

interface BodyParserError {
  type: string;
}

const bodyParserErrors: Record<string, AppError> = {
  'entity.too.large': new AppError('PAYLOAD_TOO_LARGE', 413, 'El cuerpo de la petición es demasiado grande'),
  'entity.parse.failed': new AppError('INVALID_JSON', 400, 'El cuerpo de la petición no es JSON válido'),
};

function toAppError(err: unknown): AppError | undefined {
  if (err instanceof AppError) return err;
  const type = (err as Partial<BodyParserError> | null)?.type;
  return type ? bodyParserErrors[type] : undefined;
}

export function errorMiddleware(logger: Logger): ErrorRequestHandler {
  return (err: unknown, _req, res, _next) => {
    const appError = toAppError(err);

    if (!appError) {
      logger.error({ err }, 'Error no controlado');
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
      });
      return;
    }

    res.status(appError.status).json({
      error: {
        code: appError.code,
        message: appError.message,
        ...(appError.fields && { fields: appError.fields }),
      },
    });
  };
}
