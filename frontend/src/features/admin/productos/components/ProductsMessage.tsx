import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  /** Botón o enlace de acción. */
  children?: ReactNode
  role?: 'alert' | 'status'
}

/** Mensaje centrado para los estados vacío, sin resultados y error del listado. */
export default function ProductsMessage({ title, description, children, role }: Props) {
  return (
    <div
      role={role}
      className="flex flex-col items-center gap-3 rounded-2xl bg-white px-4 py-12 text-center shadow-sm ring-1 ring-slate-200/70"
    >
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description && <p className="max-w-md text-sm text-slate-600">{description}</p>}
      {children}
    </div>
  )
}
