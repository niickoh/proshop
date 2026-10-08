import type { RequestHandler } from 'express';
import type { z } from 'zod';
import type { CreateProduct } from '../../../../application/product/use-cases/CreateProduct.js';
import type { GetAdminProduct } from '../../../../application/product/use-cases/GetAdminProduct.js';
import type { ListAdminProducts } from '../../../../application/product/use-cases/ListAdminProducts.js';
import type { SetProductStatus } from '../../../../application/product/use-cases/SetProductStatus.js';
import type { UpdateProduct } from '../../../../application/product/use-cases/UpdateProduct.js';
import type { Product } from '../../../../domain/product/entities/Product.js';
import { parseOrThrow } from '../../products/productSchemas.js';
import {
  AdminProductIdParams,
  AdminProductsQuery,
  productInputSchema,
  ProductStatusBody,
  productUpdateSchema,
  type AdminProductResponse,
} from './adminProductSchemas.js';

export function toAdminProductResponse(product: Product): z.infer<typeof AdminProductResponse> {
  const { compareAtPrice, createdAt, updatedAt, ...rest } = product.props;
  return {
    ...rest,
    ...(compareAtPrice !== undefined && { compareAtPrice }),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export class AdminProductController {
  constructor(
    private readonly listAdminProducts: ListAdminProducts,
    private readonly getAdminProduct: GetAdminProduct,
    private readonly createProduct: CreateProduct,
    private readonly updateProduct: UpdateProduct,
    private readonly setProductStatus: SetProductStatus,
  ) {}

  list: RequestHandler = async (req, res) => {
    const criteria = parseOrThrow(AdminProductsQuery, req.query);
    const page = await this.listAdminProducts.execute(criteria);
    res.json({ ...page, items: page.items.map(toAdminProductResponse) });
  };

  getById: RequestHandler = async (req, res) => {
    const { id } = parseOrThrow(AdminProductIdParams, req.params);
    res.json(toAdminProductResponse(await this.getAdminProduct.execute(id)));
  };

  create: RequestHandler = async (req, res) => {
    const data = parseOrThrow(productInputSchema, req.body, 422);
    res.status(201).json(toAdminProductResponse(await this.createProduct.execute(data)));
  };

  update: RequestHandler = async (req, res) => {
    const { id } = parseOrThrow(AdminProductIdParams, req.params);
    const data = parseOrThrow(productUpdateSchema, req.body, 422);
    res.json(toAdminProductResponse(await this.updateProduct.execute(id, data)));
  };

  setStatus: RequestHandler = async (req, res) => {
    const { id } = parseOrThrow(AdminProductIdParams, req.params);
    const { active } = parseOrThrow(ProductStatusBody, req.body, 422);
    res.json(toAdminProductResponse(await this.setProductStatus.execute(id, active)));
  };
}
