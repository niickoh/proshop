import { ChevronLeft } from 'lucide-react'
import Button from '../../../shared/ui/Button'
import { useBackToCatalog } from '../hooks/useBackToCatalog'

export default function BackToCatalog() {
  const goBack = useBackToCatalog()

  return (
    <Button variant="ghost" size="sm" onClick={goBack} className="-ml-3 gap-1 pl-2">
      <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.75} />
      Volver al catálogo
    </Button>
  )
}
