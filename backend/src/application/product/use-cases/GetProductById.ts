import type { Product } from '../../../domain/product/entities/Product.js';
import { ProductNotFoundError } from '../../../domain/product/errors/ProductNotFoundError.js';
import type { ProductRepository } from '../ports/ProductRepository.js';

export class GetProductById {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.products.findById(id);
    // Un producto archivado no existe para la tienda
    if (!product?.isActive) throw new ProductNotFoundError(id);
    return product;
  }
}
