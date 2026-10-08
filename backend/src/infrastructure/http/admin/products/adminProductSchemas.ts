import { z } from 'zod';
import {
  ADMIN_DEFAULT_PAGE_LIMIT,
  ADMIN_MAX_PAGE_LIMIT,
  ADMIN_PRODUCT_SORTS,
  ADMIN_PRODUCT_STATUSES,
} from '../../../../application/product/dtos/AdminProductSearchCriteria.js';
import { errorResponse } from '../../docs/commonSchemas.js';
import { registry } from '../../docs/registry.js';
import { ProductIdParams } from '../../products/productSchemas.js';

// =====================================================================================
// Esquema compartido con el frontend.
// ⚠️ Debe mantenerse igual a frontend/src/features/admin/productos/schema.ts:
//    si cambias una regla aquí, cámbiala también allá (y viceversa).
// =====================================================================================

export const PRODUCT_CATEGORIES = [
  'poleras',
  'pantalones',
  'chaquetas',
  'vestidos',
  'calzado',
  'accesorios',
] as const;

export const PRODUCT_GENDERS = ['mujer', 'hombre', 'unisex'] as const;

export const MAX_PRICE = 10_000_000;

/** Rutas `/products/...` o URLs `https://...` */
const IMAGE_PATTERN = /^(\/products\/|https:\/\/)\S+$/;

const hasNoDuplicates = (values: string[]) =>
  new Set(values.map((value) => value.toLowerCase())).size === values.length;

/** Entero CLP entre 1 y MAX_PRICE. `label` va con artículo: "El precio". */
const price = (label: string) =>
  z
    .number({ error: `${label} es obligatorio` })
    .int(`${label} debe ser un número entero`)
    .min(1, `${label} debe ser al menos $1`)
    .max(MAX_PRICE, `${label} no puede superar $10.000.000`);

export const productFields = z.object({
  name: z
    .string({ error: 'Ingresa el nombre' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(80, 'El nombre puede tener hasta 80 caracteres'),
  brand: z
    .string({ error: 'Ingresa la marca' })
    .trim()
    .min(2, 'La marca debe tener al menos 2 caracteres')
    .max(40, 'La marca puede tener hasta 40 caracteres'),
  category: z.enum(PRODUCT_CATEGORIES, { error: 'Elige una categoría' }),
  gender: z.enum(PRODUCT_GENDERS, { error: 'Elige mujer, hombre o unisex' }),
  description: z
    .string({ error: 'Ingresa la descripción' })
    .trim()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(2000, 'La descripción puede tener hasta 2000 caracteres'),
  price: price('El precio'),
  compareAtPrice: price('El precio anterior').optional(),
  sizes: z
    .array(
      z.string().trim().min(1, 'La talla no puede estar vacía').max(10, 'Talla demasiado larga'),
    )
    .min(1, 'Agrega al menos una talla')
    .max(15, 'Puede tener hasta 15 tallas')
    .refine(hasNoDuplicates, 'No repitas tallas'),
  colors: z
    .array(
      z
        .string()
        .trim()
        .min(2, 'Cada color debe tener al menos 2 caracteres')
        .max(20, 'Cada color puede tener hasta 20 caracteres'),
    )
    .min(1, 'Agrega al menos un color')
    .max(10, 'Puede tener hasta 10 colores')
    .refine(hasNoDuplicates, 'No repitas colores'),
  images: z
    .array(
      z.string().trim().regex(IMAGE_PATTERN, 'Usa una ruta /products/... o una URL https://...'),
    )
    .min(1, 'Agrega al menos una imagen')
    .max(8, 'Puede tener hasta 8 imágenes')
    .refine(hasNoDuplicates, 'No repitas imágenes'),
  inStock: z.boolean({ error: 'Indica si está en stock' }),
  active: z.boolean({ error: 'Indica si es visible en la tienda' }),
});

type ProductFields = z.infer<typeof productFields>;

const compareAtPriceAbovePrice = (value: Pick<ProductFields, 'price' | 'compareAtPrice'>) =>
  value.compareAtPrice === undefined || value.compareAtPrice > value.price;

const compareAtPriceRule = {
  path: ['compareAtPrice'],
  message: 'El precio anterior debe ser mayor que el precio',
};

/** Crear producto */
export const productInputSchema = productFields.refine(
  compareAtPriceAbovePrice,
  compareAtPriceRule,
);

/** Editar producto: incluye la versión que se editó */
export const productUpdateSchema = productFields
  .extend({ version: z.number({ error: 'Falta la versión' }).int().min(0) })
  .refine(compareAtPriceAbovePrice, compareAtPriceRule);

export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

// =====================================================================================
// Solo backend: parámetros, respuestas y documentación.
// =====================================================================================

const integer = (message: string) => z.string().regex(/^\d+$/, message).transform(Number);

export const AdminProductsQuery = z.object({
  q: z
    .string()
    .trim()
    .max(80, 'La búsqueda puede tener hasta 80 caracteres')
    .optional()
    .transform((value) => value || undefined)
    .openapi({ description: 'Busca en nombre o marca', example: 'polera' }),
  category: z
    .enum(PRODUCT_CATEGORIES, { error: `Debe ser una de: ${PRODUCT_CATEGORIES.join(', ')}` })
    .optional()
    .openapi({ example: 'poleras' }),
  status: z
    .enum(ADMIN_PRODUCT_STATUSES, {
      error: `Debe ser uno de: ${ADMIN_PRODUCT_STATUSES.join(', ')}`,
    })
    .default('active')
    .openapi({ example: 'active' }),
  sort: z
    .enum(ADMIN_PRODUCT_SORTS, { error: `Debe ser uno de: ${ADMIN_PRODUCT_SORTS.join(', ')}` })
    .default('nuevos')
    .openapi({ example: 'nuevos' }),
  page: integer('Debe ser un entero mayor o igual a 1')
    .pipe(z.number().min(1, 'Debe ser un entero mayor o igual a 1'))
    .default(1)
    .openapi({ example: '1' }),
  limit: integer(`Debe ser un entero entre 1 y ${ADMIN_MAX_PAGE_LIMIT}`)
    .pipe(
      z
        .number()
        .min(1, `Debe ser un entero entre 1 y ${ADMIN_MAX_PAGE_LIMIT}`)
        .max(ADMIN_MAX_PAGE_LIMIT, `Debe ser un entero entre 1 y ${ADMIN_MAX_PAGE_LIMIT}`),
    )
    .default(ADMIN_DEFAULT_PAGE_LIMIT)
    .openapi({ example: '20' }),
});

export const AdminProductIdParams = ProductIdParams;

export const ProductStatusBody = z.object({
  active: z.boolean({ error: 'Debe ser true o false' }),
});

const inputExample = {
  name: 'Polera básica negra',
  brand: 'Andes Wear',
  category: 'poleras',
  gender: 'unisex',
  description: 'Polera de algodón peinado, corte recto y costuras reforzadas.',
  price: 12990,
  compareAtPrice: 15990,
  sizes: ['S', 'M', 'L'],
  colors: ['negro', 'blanco'],
  images: ['/products/poleras-1.svg', 'https://cdn.example.com/polera-negra.jpg'],
  inStock: true,
  active: true,
} as const;

const adminProductExample = {
  id: 'polera-basica-negra-4f2a',
  ...inputExample,
  version: 3,
  createdAt: '2026-10-01T14:00:00.000Z',
  updatedAt: '2026-10-05T09:30:00.000Z',
};

export const AdminProductInput = registry.register(
  'AdminProductInput',
  productInputSchema.openapi({ example: inputExample }),
);

export const AdminProductUpdateInput = registry.register(
  'AdminProductUpdateInput',
  productUpdateSchema.openapi({ example: { ...inputExample, version: 3 } }),
);

export const AdminProductResponse = registry.register(
  'AdminProduct',
  z
    .object({
      id: z.string().openapi({ description: 'Generado desde el nombre; no editable' }),
      name: z.string(),
      brand: z.string(),
      category: z.string(),
      gender: z.string(),
      price: z.number().int().openapi({ description: 'CLP, entero' }),
      compareAtPrice: z.number().int().optional(),
      sizes: z.array(z.string()),
      colors: z.array(z.string()),
      images: z.array(z.string()).openapi({ description: 'La primera es la portada' }),
      inStock: z.boolean(),
      description: z.string(),
      active: z.boolean().openapi({ description: 'false = archivado (no se ve en la tienda)' }),
      version: z
        .number()
        .int()
        .openapi({ description: 'Enviar en PUT; si no coincide responde 409' }),
      createdAt: z.string().openapi({ description: 'ISO 8601' }),
      updatedAt: z.string().openapi({ description: 'ISO 8601' }),
    })
    .openapi({ example: adminProductExample }),
);

export const AdminProductsPageResponse = registry.register(
  'AdminProductsPage',
  z
    .object({
      items: z.array(AdminProductResponse),
      total: z.number().int(),
      page: z.number().int(),
      totalPages: z.number().int(),
    })
    .openapi({ example: { items: [adminProductExample], total: 61, page: 1, totalPages: 4 } }),
);

// --- Documentación ---

const TAG = 'Admin · Productos';
const json = <T extends z.ZodType>(schema: T) => ({ 'application/json': { schema } });

const errors = {
  queryInvalid: errorResponse('Parámetros inválidos (ver `fields`)', {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Los parámetros enviados no son válidos',
      fields: { limit: 'Debe ser un entero entre 1 y 50' },
    },
  }),
  notFound: errorResponse('Producto no encontrado', {
    error: { code: 'PRODUCT_NOT_FOUND', message: 'Producto no-existe no encontrado' },
  }),
  bodyInvalid: errorResponse('Datos inválidos (ver `fields`)', {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Los datos enviados no son válidos',
      fields: {
        compareAtPrice: 'El precio anterior debe ser mayor que el precio',
        images: 'Agrega al menos una imagen',
        sizes: 'No repitas tallas',
      },
    },
  }),
  conflict: errorResponse('Otra persona modificó el producto (la `version` no coincide)', {
    error: {
      code: 'VERSION_CONFLICT',
      message:
        'El producto polera-basica-negra-4f2a fue modificado por otra persona. Recarga para ver la última versión',
    },
  }),
  internal: errorResponse('Error interno del servidor', {
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  }),
};

const NO_AUTH_NOTE = 'Temporal: sin login; todas las rutas pasan por `adminGuard`.';

registry.registerPath({
  method: 'get',
  path: '/api/admin/products',
  summary: 'Lista productos (incluye archivados según `status`)',
  description: NO_AUTH_NOTE,
  tags: [TAG],
  request: { query: AdminProductsQuery },
  responses: {
    200: { description: 'Página de productos', content: json(AdminProductsPageResponse) },
    400: errors.queryInvalid,
    500: errors.internal,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/admin/products/{id}',
  summary: 'Detalle completo de un producto, incluidos los archivados',
  description: NO_AUTH_NOTE,
  tags: [TAG],
  request: { params: AdminProductIdParams },
  responses: {
    200: { description: 'Producto', content: json(AdminProductResponse) },
    404: errors.notFound,
    500: errors.internal,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/admin/products',
  summary: 'Crea un producto',
  description: `El id se genera desde el nombre (ej. \`polera-basica-negra-4f2a\`). ${NO_AUTH_NOTE}`,
  tags: [TAG],
  request: { body: { content: json(AdminProductInput) } },
  responses: {
    201: { description: 'Producto creado', content: json(AdminProductResponse) },
    422: errors.bodyInvalid,
    500: errors.internal,
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/admin/products/{id}',
  summary: 'Reemplaza un producto',
  description: `El body incluye la \`version\` que se editó; si no coincide con la guardada responde 409 y no modifica nada. Un \`compareAtPrice\` ausente se elimina. ${NO_AUTH_NOTE}`,
  tags: [TAG],
  request: { params: AdminProductIdParams, body: { content: json(AdminProductUpdateInput) } },
  responses: {
    200: { description: 'Producto actualizado', content: json(AdminProductResponse) },
    404: errors.notFound,
    409: errors.conflict,
    422: errors.bodyInvalid,
    500: errors.internal,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/admin/products/{id}/status',
  summary: 'Archiva o reactiva un producto',
  description: `No hay borrado físico: archivar conserva el historial. Un producto archivado no aparece en la tienda. ${NO_AUTH_NOTE}`,
  tags: [TAG],
  request: {
    params: AdminProductIdParams,
    body: { content: json(ProductStatusBody.openapi({ example: { active: false } })) },
  },
  responses: {
    200: { description: 'Producto con su nuevo estado', content: json(AdminProductResponse) },
    404: errors.notFound,
    422: errorResponse('Body inválido', {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Los datos enviados no son válidos',
        fields: { active: 'Debe ser true o false' },
      },
    }),
    500: errors.internal,
  },
});
