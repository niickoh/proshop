import type { Product } from '../../../domain/product/entities/Product.js';
import { ProductNotFoundError } from '../../../domain/product/errors/ProductNotFoundError.js';
import type { ProductRepository } from '../ports/ProductRepository.js';

/** Como GetProductById, pero incluye los productos archivados. */
export class GetAdminProduct {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) throw new ProductNotFoundError(id);
    return product;
  }
}
