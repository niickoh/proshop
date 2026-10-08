import type { ReactNode } from 'react'

/**
 * Protege todas las rutas `/admin/*`.
 * Temporal: sin login renderiza `children`. El spec de login reemplazará su contenido.
 */
export default function AdminGuard({ children }: { children: ReactNode }) {
  return children
}
