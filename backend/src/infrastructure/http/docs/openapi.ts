import { readFileSync } from 'node:fs';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry.js';
// Módulos que registran rutas en el registry (agregar aquí cada módulo nuevo)
import './commonSchemas.js';
import '../healthRoute.js';
import '../products/productSchemas.js';
import '../admin/products/adminProductSchemas.js';

// package.json está a la misma profundidad desde src/ y desde dist/
const { version } = JSON.parse(
  readFileSync(new URL('../../../../package.json', import.meta.url), 'utf8'),
) as { version: string };

export function buildOpenApiDocument(port: number) {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Proshop API',
      version,
      description: 'API del backend de Proshop',
    },
    servers: [{ url: `http://localhost:${port}` }],
  });
}
