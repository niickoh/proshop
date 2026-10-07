// Opciones de filtro simuladas. En el futuro pueden venir del backend (facets).
import type { Category, Gender, SortOption } from '../types'

export const CATEGORY_LABELS: Record<Category, string> = {
  poleras: 'Poleras',
  pantalones: 'Pantalones',
  chaquetas: 'Chaquetas',
  vestidos: 'Vestidos',
  calzado: 'Calzado',
  accesorios: 'Accesorios',
}

export const GENDER_LABELS: Record<Gender, string> = {
  mujer: 'Mujer',
  hombre: 'Hombre',
  unisex: 'Unisex',
}

export const SORT_LABELS: Record<SortOption, string> = {
  relevancia: 'Relevancia',
  'precio-asc': 'Precio: menor a mayor',
  'precio-desc': 'Precio: mayor a menor',
  nuevos: 'Más nuevos',
}

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '38', '39', '40', '41', '42', '43', '44', 'U']

/** Nombre del color → clase de Tailwind para la muestra. */
export const COLORS: { name: string; swatch: string }[] = [
  { name: 'negro', swatch: 'bg-black' },
  { name: 'blanco', swatch: 'bg-white' },
  { name: 'gris', swatch: 'bg-gray-400' },
  { name: 'azul', swatch: 'bg-blue-600' },
  { name: 'rojo', swatch: 'bg-red-600' },
  { name: 'verde', swatch: 'bg-green-600' },
  { name: 'beige', swatch: 'bg-amber-100' },
  { name: 'rosa', swatch: 'bg-pink-300' },
]

export const BRANDS = [
  'Andes Wear',
  'Copihue',
  'Cordillera Co.',
  'Costa Azul',
  'Lana Sur',
  'Maule Studio',
  'Norte Basics',
  'Pudú',
  'Quillay',
  'Valpo Denim',
]
