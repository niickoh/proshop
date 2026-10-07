import { useEffect, useRef } from 'react'

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
    <div className="space-y-4 text-center">
      <h2
        ref={titleRef}
        tabIndex={-1}
        className="text-xl font-bold text-gray-900 focus-visible:outline-none"
      >
        ¡Recibimos tu encargo!
      </h2>
      <p className="text-sm text-gray-600">
        Tu folio es
        <span className="mt-1 block text-2xl font-bold tracking-wide break-words text-gray-900">
          {folio}
        </span>
      </p>
      <p className="break-words text-gray-700">
        Te contactaremos a {correo} en un plazo de 48 horas hábiles
      </p>
      <button
        type="button"
        onClick={onStartOver}
        className="min-h-11 rounded-md border border-gray-300 bg-white px-6 text-base font-semibold text-gray-900 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Hacer otro encargo
      </button>
    </div>
  )
}
