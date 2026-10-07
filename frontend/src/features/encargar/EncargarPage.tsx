import { useId } from 'react'
import Card from '../../shared/ui/Card'
import EncargoForm from './components/EncargoForm'
import EncargoSuccess from './components/EncargoSuccess'
import { useEncargoForm } from './hooks/useEncargoForm'

export default function EncargarPage() {
  const { result, submittedEmail, startOver, ...formState } = useEncargoForm()
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="mx-auto max-w-3xl space-y-6 py-8 md:py-12">
      <div className="space-y-2">
        <h1 id={titleId} className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Haz tu encargo
        </h1>
        <p className="text-sm text-slate-500 md:text-base">
          ¿No encuentras lo que buscas? Cuéntanos qué producto quieres y lo conseguimos por ti.
        </p>
      </div>

      <Card className="p-6 md:p-10">
        {result ? (
          <EncargoSuccess
            folio={result.folio}
            correo={submittedEmail ?? ''}
            onStartOver={startOver}
          />
        ) : (
          <EncargoForm {...formState} />
        )}
      </Card>
    </section>
  )
}
