import { Router } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import pino from 'pino';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { seedProducts as runSeed } from '../../seed/seedProducts.js';
import { createApp } from '../../src/app.js';
import { GetProductById } from '../../src/application/product/use-cases/GetProductById.js';
import { GetProductFilters } from '../../src/application/product/use-cases/GetProductFilters.js';
import { ListProducts } from '../../src/application/product/use-cases/ListProducts.js';
import { buildOpenApiDocument } from '../../src/infrastructure/http/docs/openapi.js';
import { ProductController } from '../../src/infrastructure/http/products/ProductController.js';
import { productRoutes } from '../../src/infrastructure/http/products/productRoutes.js';
import {
  connectMongo,
  disconnectMongo,
} from '../../src/infrastructure/persistence/mongo/connection.js';
import { MongoProductRepository } from '../../src/infrastructure/persistence/mongo/MongoProductRepository.js';
import { ProductModel } from '../../src/infrastructure/persistence/mongo/ProductModel.js';
import { seedJson, seedProducts } from './fixtures.js';

const repo = new MongoProductRepository();
const apiRouter = Router().use(
  productRoutes(
    new ProductController(
      new ListProducts(repo),
      new GetProductById(repo),
      new GetProductFilters(repo),
    ),
  ),
);
const app = createApp({
  frontendUrl: 'http://localhost:8080',
  isDbUp: () => true,
  logger: pino({ level: 'silent' }),
  apiRouter,
});

const data = seedJson();
type Item = { id: string; price: number; inStock: boolean; createdAt: string; compareAtPrice?: number };
const get = (query = '') => request(app).get(`/api/products${query}`);
const ids = (items: { id: string }[]) => items.map((p) => p.id);

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectMongo(mongo.getUri());
  await runSeed(seedProducts());
});

afterAll(async () => {
  await disconnectMongo();
  await mongo.stop();
});

describe('seed', () => {
  it('la colección tiene los mismos productos e ids que products.json', async () => {
    const stored = await ProductModel.find().select('_id').lean();
    expect(stored.map((d) => d._id).sort()).toEqual(ids(data).sort());
  });

  it('correr el seed dos veces no duplica productos', async () => {
    await runSeed(seedProducts());
    expect(await ProductModel.countDocuments()).toBe(data.length);
  });
});

describe('GET /api/products', () => {
  it('sin params devuelve 24 productos, total correcto y hasMore', async () => {
    const res = await get();
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(24);
    expect(res.body).toMatchObject({ total: data.length, page: 1, hasMore: true });
    expect(res.body.items[0]).not.toHaveProperty('_id');
  });

  it('dos categorías se combinan con O; sumar un género restringe ambas (Y)', async () => {
    const both = await get('?category=poleras,chaquetas&limit=48');
    const expected = data.filter((p) => ['poleras', 'chaquetas'].includes(p.category));
    expect(both.body.total).toBe(expected.length);
    expect(new Set(both.body.items.map((p: { category: string }) => p.category))).toEqual(
      new Set(['poleras', 'chaquetas']),
    );

    const withGender = await get('?category=poleras,chaquetas&gender=mujer&limit=48');
    expect(withGender.body.total).toBe(expected.filter((p) => p.gender === 'mujer').length);
    expect(withGender.body.total).toBeLessThan(both.body.total);
  });

  it('priceMin/priceMax, inStockOnly y onSale filtran correctamente', async () => {
    const price = await get('?priceMin=10000&priceMax=30000&limit=48');
    expect(price.body.total).toBe(data.filter((p) => p.price >= 10000 && p.price <= 30000).length);
    expect(price.body.items.every((p: Item) => p.price >= 10000 && p.price <= 30000)).toBe(true);

    const stock = await get('?inStockOnly=true&limit=48');
    expect(stock.body.total).toBe(data.filter((p) => p.inStock).length);

    const sale = await get('?onSale=true&limit=48');
    const onSale = data.filter((p) => p.compareAtPrice !== undefined && p.compareAtPrice > p.price);
    expect(sale.body.total).toBe(onSale.length);
    expect(sale.body.total).toBeGreaterThan(0);
  });

  it('limit=0 devuelve solo el total', async () => {
    const res = await get('?category=poleras&limit=0');
    expect(res.body).toEqual({
      items: [],
      total: data.filter((p) => p.category === 'poleras').length,
      page: 1,
      hasMore: false,
    });
  });

  it.each([
    ['relevancia', (a: Item, b: Item) => Number(b.inStock) - Number(a.inStock) || Date.parse(b.createdAt) - Date.parse(a.createdAt)],
    ['precio-asc', (a: Item, b: Item) => a.price - b.price],
    ['precio-desc', (a: Item, b: Item) => b.price - a.price],
    ['nuevos', (a: Item, b: Item) => Date.parse(b.createdAt) - Date.parse(a.createdAt)],
  ] as const)('orden %s: recorrer todas las páginas no repite ni omite productos', async (sort, compare) => {
    const all: Item[] = [];
    for (let page = 1; ; page++) {
      const res = await get(`?sort=${sort}&page=${page}&limit=7`);
      expect(res.status).toBe(200);
      all.push(...res.body.items);
      if (!res.body.hasMore) break;
    }
    expect(all).toHaveLength(data.length);
    expect(new Set(ids(all)).size).toBe(data.length);
    for (let i = 1; i < all.length; i++) {
      expect(compare(all[i - 1]!, all[i]!)).toBeLessThanOrEqual(0);
    }
  });

  it('priceMin mayor que priceMax responde 400 indicando el campo', async () => {
    const res = await get('?priceMin=50000&priceMax=10000');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields).toHaveProperty('priceMax');
  });

  it('limit=100 responde 400 indicando el campo', async () => {
    const res = await get('?limit=100');
    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty('limit');
  });
});

describe('GET /api/products/filters', () => {
  it('devuelve las opciones y el rango de precios reales, con tallas en orden lógico', async () => {
    const res = await request(app).get('/api/products/filters');
    const prices = data.map((p) => p.price);

    expect(res.status).toBe(200);
    expect(res.body.categories).toEqual([...new Set(data.map((p) => p.category))].sort((a, b) => a.localeCompare(b, 'es')));
    expect(res.body.brands).toEqual([...new Set(data.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'es')));
    expect(new Set(res.body.colors)).toEqual(new Set(data.flatMap((p) => p.colors)));
    expect(new Set(res.body.sizes)).toEqual(new Set(data.flatMap((p) => p.sizes)));
    expect(res.body.sizes.indexOf('XS')).toBeLessThan(res.body.sizes.indexOf('S'));
    const isNumeric = (size: string) => /^\d+$/.test(size);
    const lastLetter = res.body.sizes.findLastIndex((s: string) => ['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(s));
    expect(lastLetter).toBeLessThan(res.body.sizes.findIndex(isNumeric));
    expect(res.body.priceRange).toEqual({ min: Math.min(...prices), max: Math.max(...prices) });
  });
});

describe('GET /api/products/:id', () => {
  it('devuelve el producto con la forma del contrato', async () => {
    const res = await request(app).get('/api/products/p001');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(data.find((p) => p.id === 'p001'));
  });

  it('un id inexistente responde 404 con PRODUCT_NOT_FOUND', async () => {
    const res = await request(app).get('/api/products/no-existe');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'PRODUCT_NOT_FOUND', message: expect.any(String) },
    });
  });
});

describe('Swagger', () => {
  it('los tres endpoints aparecen bajo el tag Productos', () => {
    const paths = buildOpenApiDocument(4000).paths ?? {};
    for (const path of ['/api/products', '/api/products/filters', '/api/products/{id}']) {
      expect(paths[path]?.get?.tags).toEqual(['Productos']);
    }
  });
});
