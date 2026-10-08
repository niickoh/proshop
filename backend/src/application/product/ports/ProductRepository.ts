import type { Product, ProductData } from '../../../domain/product/entities/Product.js';
import type { AdminProductSearchCriteria } from '../dtos/AdminProductSearchCriteria.js';
import type {
  ProductFilterOptions,
  ProductSearchCriteria,
  ProductSearchResult,
} from '../dtos/ProductSearchCriteria.js';

export interface ProductRepository {
  /** Solo productos activos. Filtra, ordena (desempatando por id) y pagina. */
  search(criteria: ProductSearchCriteria): Promise<ProductSearchResult>;
  /** Incluye archivados; el caso de uso decide si los muestra. */
  findById(id: string): Promise<Product | null>;
  /** Valores distintos de los productos activos, sin ordenar; el caso de uso decide el orden. */
  getFilterOptions(): Promise<ProductFilterOptions>;
  /** Activos, archivados o todos, según `criteria.status`. */
  searchAdmin(criteria: AdminProductSearchCriteria): Promise<ProductSearchResult>;
  create(product: Product): Promise<Product>;
  /** Reemplaza los datos solo si la versión guardada es `expectedVersion`; si no, devuelve null. */
  update(id: string, data: ProductData, expectedVersion: number): Promise<Product | null>;
  /** Archiva o reactiva; devuelve null si no existe. */
  setActive(id: string, active: boolean): Promise<Product | null>;
}
