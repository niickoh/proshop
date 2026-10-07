// Modelos del catálogo. Son el contrato con el futuro backend (`GET /api/products`).

export const CATEGORIES = [
  'poleras',
  'pantalones',
  'chaquetas',
  'vestidos',
  'calzado',
  'accesorios',
] as const
export type Category = (typeof CATEGORIES)[number]

export const GENDERS = ['mujer', 'hombre', 'unisex'] as const
export type Gender = (typeof GENDERS)[number]

export const SORT_OPTIONS = ['relevancia', 'precio-asc', 'precio-desc', 'nuevos'] as const
export type SortOption = (typeof SORT_OPTIONS)[number]

export type Product = {
  id: string
  name: string
  brand: string
  category: Category
  gender: Gender
  /** CLP, entero */
  price: number
  /** Precio anterior si está en oferta */
  compareAtPrice?: number
  /** 'XS' | 'S' | 'M' | 'L' | 'XL' | tallas de calzado ('38'...'44') */
  sizes: string[]
  colors: string[]
  /** La primera es la portada */
  images: string[]
  inStock: boolean
  /** Texto plano; puede tener saltos de línea. */
  description: string
  /** ISO 8601. El orden "nuevos" usa esta fecha descendente. */
  createdAt: string
}

export type ProductFilters = {
  category?: string[]
  gender?: string[]
  size?: string[]
  color?: string[]
  brand?: string[]
  priceMin?: number
  priceMax?: number
  inStockOnly?: boolean
  onSale?: boolean
  sort?: SortOption
}

/** Respuesta de `GET /api/products?<filtros>&page=1&limit=24` */
export type ProductsPage = {
  items: Product[]
  total: number
  page: number
  hasMore: boolean
}

export type ListFilterKey = 'category' | 'gender' | 'size' | 'color' | 'brand'

/** Cambio parcial que emite cada componente de filtro. */
export type FiltersChange = (patch: Partial<ProductFilters>) => void
