import { Router, type RequestHandler } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import pino from 'pino';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { seedProducts as runSeed } from '../../seed/seedProducts.js';
import { createApp } from '../../src/app.js';
import { CreateProduct } from '../../src/application/product/use-cases/CreateProduct.js';
import { GetAdminProduct } from '../../src/application/product/use-cases/GetAdminProduct.js';
import { GetProductById } from '../../src/application/product/use-cases/GetProductById.js';
import { GetProductFilters } from '../../src/application/product/use-cases/GetProductFilters.js';
import { ListAdminProducts } from '../../src/application/product/use-cases/ListAdminProducts.js';
import { ListProducts } from '../../src/application/product/use-cases/ListProducts.js';
import { SetProductStatus } from '../../src/application/product/use-cases/SetProductStatus.js';
import { UpdateProduct } from '../../src/application/product/use-cases/UpdateProduct.js';
import { AppError } from '../../src/shared/errors/AppError.js';
import { AdminProductController } from '../../src/infrastructure/http/admin/products/AdminProductController.js';
import { adminProductRoutes } from '../../src/infrastructure/http/admin/products/adminProductRoutes.js';
import { buildOpenApiDocument } from '../../src/infrastructure/http/docs/openapi.js';
import { ProductController } from '../../src/infrastructure/http/products/ProductController.js';
import { productRoutes } from '../../src/infrastructure/http/products/productRoutes.js';
import {
  connectMongo,
  disconnectMongo,
} from '../../src/infrastructure/persistence/mongo/connection.js';
import { MongoProductRepository } from '../../src/infrastructure/persistence/mongo/MongoProductRepository.js';
import { ProductModel } from '../../src/infrastructure/persistence/mongo/ProductModel.js';
import { seedProducts } from './fixtures.js';

const repo = new MongoProductRepository();
const adminController = new AdminProductController(
  new ListAdminProducts(repo),
  new GetAdminProduct(repo),
  new CreateProduct(repo),
  new UpdateProduct(repo),
  new SetProductStatus(repo),
);

const buildApp = (guard?: RequestHandler) =>
  createApp({
    frontendUrl: 'http://localhost:8080',
    isDbUp: () => true,
    logger: pino({ level: 'silent' }),
    apiRouter: Router()
      .use(
        productRoutes(
          new ProductController(
            new ListProducts(repo),
            new GetProductById(repo),
            new GetProductFilters(repo),
          ),
        ),
      )
      .use(adminProductRoutes(adminController, guard)),
  });

const body = {
  name: 'Polera básica negra',
  brand: 'Andes Wear',
  category: 'poleras',
  gender: 'unisex',
  description: 'Polera de algodón peinado, corte recto y costuras reforzadas.',
  price: 12990,
  compareAtPrice: 15990,
  sizes: ['S', 'M'],
  colors: ['negro', 'blanco'],
  images: ['/products/poleras-1.svg', 'https://cdn.example.com/polera.jpg'],
  inStock: true,
  active: true,
};

let app: ReturnType<typeof buildApp>;
let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectMongo(mongo.getUri());
});

beforeEach(async () => {
  app = buildApp();
  await ProductModel.deleteMany({});
  await runSeed(seedProducts());
});

afterAll(async () => {
  await disconnectMongo();
  await mongo.stop();
});

describe('adminGuard', () => {
  it('todas las rutas de /api/admin/* pasan por el guard', async () => {
    const deny: RequestHandler = (_req, _res, next) =>
      next(new AppError('FORBIDDEN', 403, 'Sin acceso'));
    const guarded = request(buildApp(deny));
    const responses = await Promise.all([
      guarded.get('/api/admin/products'),
      guarded.get('/api/admin/products/p001'),
      guarded.post('/api/admin/products').send(body),
      guarded.put('/api/admin/products/p001').send({ ...body, version: 0 }),
      guarded.patch('/api/admin/products/p001/status').send({ active: false }),
    ]);
    expect(responses.map((r) => r.status)).toEqual([403, 403, 403, 403, 403]);
  });
});

describe('POST /api/admin/products', () => {
  it('un producto válido responde 201 y aparece en el catálogo público', async () => {
    const res = await request(app).post('/api/admin/products').send(body);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...body, version: 0 });
    expect(res.body.id).toMatch(/^polera-basica-negra-[0-9a-f]{4}$/);
    expect(res.body.createdAt).toBe(res.body.updatedAt);

    const detail = await request(app).get(`/api/products/${res.body.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body).not.toHaveProperty('active');
    expect(detail.body).not.toHaveProperty('version');
    const list = await request(app).get('/api/products?sort=nuevos&limit=1');
    expect(list.body.items[0].id).toBe(res.body.id);
  });

  it.each([
    ['compareAtPrice igual a price', { compareAtPrice: body.price }, 'compareAtPrice'],
    ['compareAtPrice menor que price', { compareAtPrice: body.price - 1 }, 'compareAtPrice'],
    ['sin imágenes', { images: [] }, 'images'],
    ['tallas repetidas', { sizes: ['M', 'M'] }, 'sizes'],
  ])('%s responde 422 con fields', async (_case, patch, field) => {
    const res = await request(app)
      .post('/api/admin/products')
      .send({ ...body, ...patch });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields).toHaveProperty(field);
  });
});

describe('GET /api/admin/products', () => {
  it('lista con búsqueda, estado, orden y paginación', async () => {
    await request(app).patch('/api/admin/products/p001/status').send({ active: false });

    const archived = await request(app).get('/api/admin/products?status=archived');
    expect(archived.status).toBe(200);
    expect(archived.body.items.map((p: { id: string }) => p.id)).toEqual(['p001']);
    expect(archived.body.items[0]).toMatchObject({ active: false, version: 1 });

    const all = await request(app).get(
      '/api/admin/products?status=all&sort=precio-asc&limit=5&page=2',
    );
    expect(all.body).toMatchObject({ total: seedProducts().length, page: 2 });
    expect(all.body.totalPages).toBe(Math.ceil(seedProducts().length / 5));
    const prices = all.body.items.map((p: { price: number }) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('limit fuera de 1–50 responde 400 indicando el campo', async () => {
    const res = await request(app).get('/api/admin/products?limit=51');
    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty('limit');
  });
});

describe('PUT /api/admin/products/:id', () => {
  it('reemplaza el producto e incrementa la versión', async () => {
    const res = await request(app)
      .put('/api/admin/products/p001')
      .send({ ...body, compareAtPrice: undefined, version: 0 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 'p001', name: body.name, version: 1 });
    expect(res.body).not.toHaveProperty('compareAtPrice');
  });

  it('con una version desactualizada responde 409 y no modifica el producto', async () => {
    await request(app)
      .put('/api/admin/products/p001')
      .send({ ...body, version: 0 });
    const res = await request(app)
      .put('/api/admin/products/p001')
      .send({ ...body, name: 'Nombre pisado', version: 0 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('VERSION_CONFLICT');

    const current = await request(app).get('/api/admin/products/p001');
    expect(current.body).toMatchObject({ name: body.name, version: 1 });
  });

  it('un id inexistente responde 404', async () => {
    const res = await request(app)
      .put('/api/admin/products/no-existe')
      .send({ ...body, version: 0 });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/admin/products/:id/status', () => {
  it('archivado: no aparece en /api/products ni en /filters y su detalle público responde 404', async () => {
    // Único producto de su marca para comprobar que desaparece de /filters
    const created = await request(app)
      .post('/api/admin/products')
      .send({ ...body, brand: 'Marca Única' });
    const id = created.body.id as string;

    const res = await request(app)
      .patch(`/api/admin/products/${id}/status`)
      .send({ active: false });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ active: false, version: 1 });

    const list = await request(app).get('/api/products?limit=48&brand=Marca%20%C3%9Anica');
    expect(list.body.total).toBe(0);
    const filters = await request(app).get('/api/products/filters');
    expect(filters.body.brands).not.toContain('Marca Única');
    expect((await request(app).get(`/api/products/${id}`)).status).toBe(404);
    expect((await request(app).get(`/api/admin/products/${id}`)).status).toBe(200);
  });

  it('reactivarlo lo vuelve a mostrar en la tienda', async () => {
    await request(app).patch('/api/admin/products/p001/status').send({ active: false });
    await request(app).patch('/api/admin/products/p001/status').send({ active: true });

    expect((await request(app).get('/api/products/p001')).status).toBe(200);
    const list = await request(app).get('/api/products?limit=0');
    expect(list.body.total).toBe(seedProducts().length);
  });

  it('un body inválido responde 422', async () => {
    const res = await request(app).patch('/api/admin/products/p001/status').send({ active: 'si' });
    expect(res.status).toBe(422);
    expect(res.body.error.fields).toHaveProperty('active');
  });
});

describe('Swagger', () => {
  it('los endpoints aparecen bajo el tag "Admin · Productos"', () => {
    const paths = buildOpenApiDocument(4000).paths ?? {};
    const ops = [
      paths['/api/admin/products']?.get,
      paths['/api/admin/products']?.post,
      paths['/api/admin/products/{id}']?.get,
      paths['/api/admin/products/{id}']?.put,
      paths['/api/admin/products/{id}/status']?.patch,
    ];
    for (const op of ops) expect(op?.tags).toEqual(['Admin · Productos']);
    expect(Object.keys(paths['/api/admin/products/{id}']?.put?.responses ?? {})).toEqual(
      expect.arrayContaining(['200', '404', '409', '422']),
    );
  });
});
