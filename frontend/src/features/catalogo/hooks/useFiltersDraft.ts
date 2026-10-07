import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { filtersKey, isPriceRangeValid } from '../filtersParams'
import type { FiltersChange, ProductFilters } from '../types'

export const FILTERS_DEBOUNCE_MS = 400

type Options = {
  applied: ProductFilters
  apply: (filters: ProductFilters) => void
  /** Escritorio: el borrador se aplica solo tras el debounce. Móvil: solo con `commit`. */
  autoApply: boolean
}

/** Borrador de filtros que edita el panel; los aplicados viven en la URL. */
export function useFiltersDraft({ applied, apply, autoApply }: Options) {
  const [draft, setDraft] = useState<ProductFilters>(applied)
  const [syncedKey, setSyncedKey] = useState(filtersKey(applied))

  // Si los aplicados cambian desde fuera (chips, Atrás, orden), el borrador se reinicia.
  const appliedKey = filtersKey(applied)
  if (appliedKey !== syncedKey) {
    setSyncedKey(appliedKey)
    setDraft(applied)
  }

  const debouncedDraft = useDebouncedValue(draft, FILTERS_DEBOUNCE_MS)
  const isValid = isPriceRangeValid(draft)
  const draftKey = filtersKey(draft)
  const debouncedKey = filtersKey(debouncedDraft)

  useEffect(() => {
    if (!autoApply) return
    const settled = debouncedKey === draftKey
    if (settled && draftKey !== appliedKey && isPriceRangeValid(debouncedDraft)) {
      apply(debouncedDraft)
    }
  }, [autoApply, debouncedKey, draftKey, appliedKey, debouncedDraft, apply])

  const change: FiltersChange = useCallback(
    (patch) => setDraft((current) => ({ ...current, ...patch })),
    [],
  )
  const reset = useCallback(() => setDraft(applied), [applied])
  const clear = useCallback(() => setDraft({ sort: applied.sort }), [applied.sort])
  const commit = useCallback(() => {
    if (isPriceRangeValid(draft)) apply(draft)
  }, [apply, draft])

  return { draft, debouncedDraft, isValid, change, reset, clear, commit }
}
