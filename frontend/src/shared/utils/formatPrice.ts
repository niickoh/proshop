const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

/** Precio en CLP: 12990 → "$12.990". */
export const formatPrice = (value: number) => formatter.format(value)

/** Descuento entero en %, o 0 si no hay oferta. */
export const getDiscountPercent = (price: number, compareAtPrice?: number) =>
  compareAtPrice !== undefined && compareAtPrice > price
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0
