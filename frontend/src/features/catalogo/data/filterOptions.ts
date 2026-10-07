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

// Tallas, colores y marcas vienen de `getProductFilters`; aquí solo la presentación.

/** Nombre del color → clase de Tailwind para la muestra. */
const COLOR_SWATCHES: Record<string, string> = {
  negro: 'bg-black',
  blanco: 'bg-white',
  gris: 'bg-gray-400',
  azul: 'bg-blue-600',
  rojo: 'bg-red-600',
  verde: 'bg-green-600',
  beige: 'bg-amber-100',
  rosa: 'bg-pink-300',
}

/** Clase de la muestra; un color desconocido se ve neutro. */
export const colorSwatch = (name: string) => COLOR_SWATCHES[name] ?? 'bg-slate-200'
