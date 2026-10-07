/** Estado de navegación que marca que se llegó al detalle desde el catálogo. */
export const FROM_CATALOG_STATE = { fromCatalog: true } as const

export const isFromCatalog = (state: unknown) =>
  typeof state === 'object' &&
  state !== null &&
  'fromCatalog' in state &&
  state.fromCatalog === true
