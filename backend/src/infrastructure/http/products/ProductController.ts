import type { RequestHandler } from 'express';
import type { z } from 'zod';
import type { GetProductById } from '../../../application/product/use-cases/GetProductById.js';
import type { GetProductFilters } from '../../../application/product/use-cases/GetProductFilters.js';
import type { ListProducts } from '../../../application/product/use-cases/ListProducts.js';
import type { Product } from '../../../domain/product/entities/Product.js';
import {
  parseOrThrow,
  ProductIdParams,
  ProductsQuery,
  type ProductResponse,
} from './productSchemas.js';

/** Forma pública: sin `active`, `version` ni `updatedAt` (solo para admin). */
export function toProductResponse(product: Product): z.infer<typeof ProductResponse> {
  const p = product.props;
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    gender: p.gender,
    price: p.price,
    ...(p.compareAtPrice !== undefined && { compareAtPrice: p.compareAtPrice }),
    sizes: p.sizes,
    colors: p.colors,
    images: p.images,
    inStock: p.inStock,
    description: p.description,
    createdAt: p.createdAt.toISOString(),
  };
}

export class ProductController {
  constructor(
    private readonly listProducts: ListProducts,
    private readonly getProductById: GetProductById,
    private readonly getProductFilters: GetProductFilters,
  ) {}

  list: RequestHandler = async (req, res) => {
    const criteria = parseOrThrow(ProductsQuery, req.query);
    const page = await this.listProducts.execute(criteria);
    res.json({ ...page, items: page.items.map(toProductResponse) });
  };

  filters: RequestHandler = async (_req, res) => {
    res.json(await this.getProductFilters.execute());
  };

  getById: RequestHandler = async (req, res) => {
    const { id } = parseOrThrow(ProductIdParams, req.params);
    res.json(toProductResponse(await this.getProductById.execute(id)));
  };
}
