import {
  generateProductId,
  Product,
  type ProductData,
} from '../../../domain/product/entities/Product.js';
import type { ProductRepository } from '../ports/ProductRepository.js';

const MAX_ID_ATTEMPTS = 5;

export class CreateProduct {
  constructor(
    private readonly products: ProductRepository,
    private readonly newId: (name: string) => string = generateProductId,
  ) {}

  async execute(data: ProductData): Promise<Product> {
    const now = new Date();
    const product = Product.create({
      ...data,
      id: await this.uniqueId(data.name),
      version: 0,
      createdAt: now,
      updatedAt: now,
    });
    return this.products.create(product);
  }

  /** El sufijo aleatorio casi nunca choca, pero si pasa se genera otro. */
  private async uniqueId(name: string): Promise<string> {
    for (let attempt = 1; ; attempt++) {
      const id = this.newId(name);
      if (attempt === MAX_ID_ATTEMPTS || !(await this.products.findById(id))) return id;
    }
  }
}
