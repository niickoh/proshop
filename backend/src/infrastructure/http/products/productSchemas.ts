import { z } from 'zod';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  PRODUCT_SORTS,
} from '../../../application/product/dtos/ProductSearchCriteria.js';
import { AppError, type ErrorFields } from '../../../shared/errors/AppError.js';
import { errorResponse } from '../docs/commonSchemas.js';
import { registry } from '../docs/registry.js';

// --- Entradas ---

const csvList = (example: string) =>
  z
    .string()
    .optional()
    .transform((value) =>
      value
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .openapi({ description: 'Lista separada por comas', example });

const integer = (message: string) =>
  z
    .string()
    .regex(/^\d+$/, message)
    .transform(Number);

const booleanFlag = z
  .enum(['true', 'false'], { error: 'Debe ser true o false' })
  .transform((value) => value === 'true')
  .optional()
  .openapi({ example: 'true' });

export const ProductsQuery = z
  .object({
    category: csvList('poleras,chaquetas'),
    gender: csvList('mujer,unisex'),
    size: csvList('S,M'),
    color: csvList('negro,blanco'),
    brand: csvList('Andes Wear'),
    priceMin: integer('Debe ser un entero mayor o igual a 0')
      .optional()
      .openapi({ example: '10000' }),
    priceMax: integer('Debe ser un entero mayor o igual a 0')
      .optional()
      .openapi({ example: '50000' }),
    inStockOnly: booleanFlag,
    onSale: booleanFlag,
    sort: z
      .enum(PRODUCT_SORTS, { error: `Debe ser uno de: ${PRODUCT_SORTS.join(', ')}` })
      .default('relevancia')
      .openapi({ example: 'precio-asc' }),
    page: integer('Debe ser un entero mayor o igual a 1')
      .pipe(z.number().min(1, 'Debe ser un entero mayor o igual a 1'))
      .default(1)
      .openapi({ example: '1' }),
    limit: integer(`Debe ser un entero entre 0 y ${MAX_PAGE_LIMIT}`)
      .pipe(z.number().max(MAX_PAGE_LIMIT, `Debe ser un entero entre 0 y ${MAX_PAGE_LIMIT}`))
      .default(DEFAULT_PAGE_LIMIT)
      .openapi({
        description: `0 devuelve solo el total (items vacío). Máximo ${MAX_PAGE_LIMIT}.`,
        example: '24',
      }),
  })
  .refine(
    ({ priceMin, priceMax }) =>
      priceMin === undefined || priceMax === undefined || priceMin <= priceMax,
    { path: ['priceMax'], message: 'Debe ser mayor o igual que priceMin' },
  );

export const ProductIdParams = z.object({
  id: z.string().min(1).openapi({ example: 'p001' }),
});

/** Valida o lanza 400 con `fields` indicando qué parámetro falló. */
export function parseOrThrow<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  const fields: ErrorFields = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_';
    fields[key] ??= issue.message;
  }
  throw new AppError('VALIDATION_ERROR', 400, 'Los parámetros enviados no son válidos', fields);
}

// --- Respuestas ---

const productExample = {
  id: 'p002',
  name: 'Jeans recto azul',
  brand: 'Quillay',
  category: 'pantalones',
  gender: 'hombre',
  price: 26990,
  compareAtPrice: 37990,
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['azul', 'beige'],
  images: ['/products/pantalones-2.svg', '/products/pantalones-1.svg'],
  inStock: true,
  description: 'Pantalón de tela resistente con tiro medio y bolsillos funcionales.',
  createdAt: '2026-06-02T01:00:00.000Z',
};

export const ProductResponse = registry.register(
  'Product',
  z
    .object({
      id: z.string(),
      name: z.string(),
      brand: z.string(),
      category: z.string(),
      gender: z.string(),
      price: z.number().int().openapi({ description: 'CLP, entero' }),
      compareAtPrice: z
        .number()
        .int()
        .optional()
        .openapi({ description: 'Precio anterior si está en oferta' }),
      sizes: z.array(z.string()),
      colors: z.array(z.string()),
      images: z.array(z.string()).openapi({ description: 'Rutas relativas; la primera es la portada' }),
      inStock: z.boolean(),
      description: z.string(),
      createdAt: z.string().openapi({ description: 'ISO 8601' }),
    })
    .openapi({ example: productExample }),
);

export const ProductsPageResponse = registry.register(
  'ProductsPage',
  z
    .object({
      items: z.array(ProductResponse),
      total: z.number().int(),
      page: z.number().int(),
      hasMore: z.boolean(),
    })
    .openapi({ example: { items: [productExample], total: 60, page: 1, hasMore: true } }),
);

export const ProductFiltersResponse = registry.register(
  'ProductFilters',
  z
    .object({
      categories: z.array(z.string()),
      genders: z.array(z.string()),
      sizes: z.array(z.string()),
      colors: z.array(z.string()),
      brands: z.array(z.string()),
      priceRange: z.object({ min: z.number(), max: z.number() }),
    })
    .openapi({
      example: {
        categories: ['accesorios', 'calzado', 'chaquetas'],
        genders: ['hombre', 'mujer', 'unisex'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', '38', '39', 'U'],
        colors: ['azul', 'beige', 'negro'],
        brands: ['Andes Wear', 'Copihue'],
        priceRange: { min: 5990, max: 89990 },
      },
    }),
);

// --- Documentación ---

const TAG = 'Productos';
const json = <T extends z.ZodType>(schema: T) => ({ 'application/json': { schema } });

registry.registerPath({
  method: 'get',
  path: '/api/products',
  summary: 'Lista productos con filtros, orden y paginación',
  description:
    'Dentro de un mismo filtro las opciones se combinan con O; entre filtros distintos, con Y.',
  tags: [TAG],
  request: { query: ProductsQuery },
  responses: {
    200: { description: 'Página de productos', content: json(ProductsPageResponse) },
    400: errorResponse('Parámetros inválidos (ver `fields`)'),
    500: errorResponse('Error interno del servidor'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/products/filters',
  summary: 'Opciones de filtro calculadas desde los productos existentes',
  tags: [TAG],
  responses: {
    200: { description: 'Opciones de filtro', content: json(ProductFiltersResponse) },
    500: errorResponse('Error interno del servidor'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/products/{id}',
  summary: 'Detalle de un producto',
  tags: [TAG],
  request: { params: ProductIdParams },
  responses: {
    200: { description: 'Producto', content: json(ProductResponse) },
    404: errorResponse('Producto no encontrado (PRODUCT_NOT_FOUND)'),
    500: errorResponse('Error interno del servidor'),
  },
});
