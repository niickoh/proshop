import type { ReactNode } from 'react'
import Card from '../../../../../shared/ui/Card'

type Props = { title: string; description?: string; children: ReactNode }

/** Sección del formulario: fieldset con título y descripción. */
export default function FormSection({ title, description, children }: Props) {
  return (
    <Card className="p-4 ring-1 ring-slate-200/70 md:p-6">
      <fieldset className="min-w-0 space-y-5">
        <legend className="text-lg font-semibold text-slate-900">{title}</legend>
        {description && <p className="-mt-3 text-sm text-slate-500">{description}</p>}
        {children}
      </fieldset>
    </Card>
  )
}
