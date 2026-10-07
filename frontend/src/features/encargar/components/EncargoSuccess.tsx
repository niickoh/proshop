import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import Button from '../../../shared/ui/Button'

type Props = {
  folio: string
  correo: string
  onStartOver: () => void
}

export default function EncargoSuccess({ folio, correo, onStartOver }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Al reemplazar el formulario, el foco va al título para anunciar la confirmación.
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Check aria-hidden="true" size={28} strokeWidth={1.75} />
      </span>
      <h2
        ref={titleRef}
        tabIndex={-1}
        className="text-lg font-semibold text-slate-900 focus-visible:outline-none md:text-xl"
      >
        ¡Recibimos tu encargo!
      </h2>
      <p className="text-sm text-slate-500">
        Tu folio es
        <span className="mt-1 block font-mono text-2xl font-semibold tracking-wide break-words text-slate-900">
          {folio}
        </span>
      </p>
      <p className="text-sm break-words text-slate-600 md:text-base">
        Te contactaremos a {correo} en un plazo de 48 horas hábiles
      </p>
      <Button variant="secondary" onClick={onStartOver} className="mt-2">
        Hacer otro encargo
      </Button>
    </div>
  )
}
