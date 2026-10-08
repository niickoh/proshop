import type { Product } from '../../../domain/product/entities/Product.js';
import { ProductNotFoundError } from '../../../domain/product/errors/ProductNotFoundError.js';
import type { ProductRepository } from '../ports/ProductRepository.js';

/** Archiva o reactiva. No hay borrado físico: se conserva el historial para las ventas. */
export class SetProductStatus {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string, active: boolean): Promise<Product> {
    const product = await this.products.setActive(id, active);
    if (!product) throw new ProductNotFoundError(id);
    return product;
  }
}
