import { Router } from 'express';
import pino from 'pino';
import { createApp } from './app.js';
import { CreateProduct } from './application/product/use-cases/CreateProduct.js';
import { GetAdminProduct } from './application/product/use-cases/GetAdminProduct.js';
import { GetProductById } from './application/product/use-cases/GetProductById.js';
import { GetProductFilters } from './application/product/use-cases/GetProductFilters.js';
import { ListAdminProducts } from './application/product/use-cases/ListAdminProducts.js';
import { ListProducts } from './application/product/use-cases/ListProducts.js';
import { SetProductStatus } from './application/product/use-cases/SetProductStatus.js';
import { UpdateProduct } from './application/product/use-cases/UpdateProduct.js';
import { isDocsEnabled, loadEnv } from './config/env.js';
import { AdminProductController } from './infrastructure/http/admin/products/AdminProductController.js';
import { adminProductRoutes } from './infrastructure/http/admin/products/adminProductRoutes.js';
import { ProductController } from './infrastructure/http/products/ProductController.js';
import { productRoutes } from './infrastructure/http/products/productRoutes.js';
import {
  connectMongo,
  disconnectMongo,
  isMongoUp,
} from './infrastructure/persistence/mongo/connection.js';
import { MongoProductRepository } from './infrastructure/persistence/mongo/MongoProductRepository.js';

const env = loadEnv();
const logger = pino({ level: env.NODE_ENV === 'production' ? 'info' : 'debug' });

try {
  await connectMongo(env.MONGO_URI);
  logger.info('Conectado a MongoDB');
} catch (err) {
  logger.fatal({ err }, 'No se pudo conectar a MongoDB');
  process.exit(1);
}

const productRepository = new MongoProductRepository();
const productController = new ProductController(
  new ListProducts(productRepository),
  new GetProductById(productRepository),
  new GetProductFilters(productRepository),
);
const adminProductController = new AdminProductController(
  new ListAdminProducts(productRepository),
  new GetAdminProduct(productRepository),
  new CreateProduct(productRepository),
  new UpdateProduct(productRepository),
  new SetProductStatus(productRepository),
);

const apiRouter = Router();
apiRouter.use(productRoutes(productController));
// Todas las rutas /api/admin/* pasan por adminGuard
apiRouter.use(adminProductRoutes(adminProductController));

const app = createApp({
  frontendUrl: env.FRONTEND_URL,
  isDbUp: isMongoUp,
  logger,
  apiRouter,
  docs: { enabled: isDocsEnabled(env), port: env.PORT },
});

const server = app.listen(env.PORT, () => {
  logger.info(`API escuchando en el puerto ${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} recibido, cerrando servidor`);
  server.close(async () => {
    await disconnectMongo();
    logger.info('Servidor cerrado');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Cierre forzado tras 10s');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
