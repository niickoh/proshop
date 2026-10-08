import type { Product } from '../../../domain/product/entities/Product.js';

export const ADMIN_PRODUCT_SORTS = ['nuevos', 'nombre', 'precio-asc', 'precio-desc'] as const;
export type AdminProductSort = (typeof ADMIN_PRODUCT_SORTS)[number];

export const ADMIN_PRODUCT_STATUSES = ['active', 'archived', 'all'] as const;
export type AdminProductStatus = (typeof ADMIN_PRODUCT_STATUSES)[number];

export const ADMIN_MAX_PAGE_LIMIT = 50;
export const ADMIN_DEFAULT_PAGE_LIMIT = 20;

export interface AdminProductSearchCriteria {
  /** Busca en nombre o marca, sin distinguir mayúsculas */
  q?: string;
  category?: string;
  status: AdminProductStatus;
  sort: AdminProductSort;
  page: number;
  limit: number;
}

export interface AdminProductsPage {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}
