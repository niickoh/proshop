import type { ComponentProps } from 'react'
import Input from '../../../../../shared/ui/Input'

/** Monto en CLP con prefijo `$`. Teclado numérico en móvil. */
export default function PriceInput(props: ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-500"
      >
        $
      </span>
      <Input type="text" inputMode="numeric" autoComplete="off" {...props} className="pl-8" />
    </div>
  )
}
