import { Router } from 'express';
import type { ProductController } from './ProductController.js';

export function productRoutes(controller: ProductController): Router {
  const router = Router();
  router.get('/products', controller.list);
  // Antes de /:id para que "filters" no se tome como un id.
  router.get('/products/filters', controller.filters);
  router.get('/products/:id', controller.getById);
  return router;
}
