import { useId } from 'react'
import EncargoForm from './components/EncargoForm'
import EncargoSuccess from './components/EncargoSuccess'
import { useEncargoForm } from './hooks/useEncargoForm'

export default function EncargarPage() {
  const { result, submittedEmail, startOver, ...formState } = useEncargoForm()
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="mx-auto max-w-3xl space-y-4 py-8">
      <div className="space-y-2">
        <h1 id={titleId} className="text-2xl font-bold text-gray-900 lg:text-3xl">
          Haz tu encargo
        </h1>
        <p className="text-gray-700">
          ¿No encuentras lo que buscas? Cuéntanos qué producto quieres y lo conseguimos por ti.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        {result ? (
          <EncargoSuccess
            folio={result.folio}
            correo={submittedEmail ?? ''}
            onStartOver={startOver}
          />
        ) : (
          <EncargoForm {...formState} />
        )}
      </div>
    </section>
  )
}
