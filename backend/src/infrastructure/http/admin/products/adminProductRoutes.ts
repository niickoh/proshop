import { Router, type RequestHandler } from 'express';
import { adminGuard } from '../adminGuard.js';
import type { AdminProductController } from './AdminProductController.js';

/** `guard` se puede reemplazar en tests; por defecto es `adminGuard`. */
export function adminProductRoutes(
  controller: AdminProductController,
  guard: RequestHandler = adminGuard,
): Router {
  const products = Router();
  products.get('/products', controller.list);
  products.post('/products', controller.create);
  products.get('/products/:id', controller.getById);
  products.put('/products/:id', controller.update);
  products.patch('/products/:id/status', controller.setStatus);

  return Router().use('/admin', guard, products);
}
