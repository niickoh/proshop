import { z } from 'zod';
import { registry } from './registry.js';

export const ErrorResponse = registry.register(
  'ErrorResponse',
  z
    .object({
      error: z.object({
        code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
        message: z.string().openapi({ example: 'Los datos enviados no son válidos' }),
        fields: z
          .record(z.string(), z.string())
          .optional()
          .openapi({ example: { email: 'El correo no tiene un formato válido' } }),
      }),
    })
    .openapi({ description: 'Formato común de error de la API' }),
);

export const errorResponse = (description: string, example?: z.infer<typeof ErrorResponse>) => ({
  description,
  content: { 'application/json': { schema: ErrorResponse, ...(example && { example }) } },
});
