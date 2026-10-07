import type { ProductFilterOptions } from '../dtos/ProductSearchCriteria.js';
import type { ProductRepository } from '../ports/ProductRepository.js';

const LETTER_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

/** Letras (XS…XXL), luego números de calzado ascendentes y al final el resto (ej. talla única "U"). */
export function compareSizes(a: string, b: string): number {
  const rank = (size: string): [number, number, string] => {
    const letter = LETTER_SIZES.indexOf(size);
    if (letter !== -1) return [0, letter, size];
    const number = Number(size);
    if (size.trim() !== '' && Number.isFinite(number)) return [1, number, size];
    return [2, 0, size];
  };
  const [groupA, valueA, textA] = rank(a);
  const [groupB, valueB, textB] = rank(b);
  return groupA - groupB || valueA - valueB || textA.localeCompare(textB, 'es');
}

const sortText = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'es'));

export class GetProductFilters {
  constructor(private readonly products: ProductRepository) {}

  async execute(): Promise<ProductFilterOptions> {
    const options = await this.products.getFilterOptions();
    return {
      categories: sortText(options.categories),
      genders: sortText(options.genders),
      sizes: [...new Set(options.sizes)].sort(compareSizes),
      colors: sortText(options.colors),
      brands: sortText(options.brands),
      priceRange: options.priceRange,
    };
  }
}
