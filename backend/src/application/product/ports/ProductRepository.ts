import type { Product } from '../../../domain/product/entities/Product.js';
import type {
  ProductFilterOptions,
  ProductSearchCriteria,
  ProductSearchResult,
} from '../dtos/ProductSearchCriteria.js';

export interface ProductRepository {
  /** Filtra, ordena (desempatando por id) y pagina. */
  search(criteria: ProductSearchCriteria): Promise<ProductSearchResult>;
  findById(id: string): Promise<Product | null>;
  /** Valores distintos sin ordenar; el caso de uso decide el orden. */
  getFilterOptions(): Promise<ProductFilterOptions>;
}
