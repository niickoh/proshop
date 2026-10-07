import type { Product } from '../../../domain/product/entities/Product.js';

export const PRODUCT_SORTS = ['relevancia', 'precio-asc', 'precio-desc', 'nuevos'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const MAX_PAGE_LIMIT = 48;
export const DEFAULT_PAGE_LIMIT = 24;

/** Dentro de cada lista: O. Entre filtros distintos: Y. */
export interface ProductSearchCriteria {
  category?: string[];
  gender?: string[];
  size?: string[];
  color?: string[];
  brand?: string[];
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  onSale?: boolean;
  sort: ProductSort;
  page: number;
  /** 0 devuelve solo el total. */
  limit: number;
}

export interface ProductSearchResult {
  items: Product[];
  total: number;
}

export interface ProductsPage {
  items: Product[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface ProductFilterOptions {
  categories: string[];
  genders: string[];
  sizes: string[];
  colors: string[];
  brands: string[];
  priceRange: { min: number; max: number };
}
