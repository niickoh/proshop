import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '../../../../shared/hooks/useDebouncedValue'

export const SEARCH_DEBOUNCE_MS = 300

/**
 * Texto del buscador con debounce. `value` es la búsqueda aplicada (en la URL);
 * `onCommit` se llama 300 ms después de dejar de escribir.
 */
export function useDebouncedSearch(value: string | undefined, onCommit: (q?: string) => void) {
  const [draft, setDraft] = useState(value ?? '')
  const [seenValue, setSeenValue] = useState(value)

  // Si la búsqueda cambia desde fuera (botón Atrás, "Limpiar"), el campo la refleja.
  if (value !== seenValue) {
    setSeenValue(value)
    if ((value ?? '') !== draft.trim()) setDraft(value ?? '')
  }

  const debounced = useDebouncedValue(draft, SEARCH_DEBOUNCE_MS)
  const latest = useRef({ value, onCommit })
  useEffect(() => {
    latest.current = { value, onCommit }
  })

  useEffect(() => {
    const next = debounced.trim() || undefined
    if (next !== latest.current.value) latest.current.onCommit(next)
  }, [debounced])

  return { draft, setDraft }
}
