import { useEffect } from 'react'

/** Cambia `document.title` mientras el componente está montado y restaura el anterior al salir. */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
