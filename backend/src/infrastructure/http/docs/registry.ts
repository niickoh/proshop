import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

/** Registro compartido: cada módulo registra aquí sus rutas junto a su router de Express. */
export const registry = new OpenAPIRegistry();
