import { cn } from '../../../../shared/ui/cn'

export default function ProductStock({ inStock }: { inStock: boolean }) {
  return (
    <span className={cn('text-sm', inStock ? 'text-slate-700' : 'font-medium text-red-600')}>
      {inStock ? 'En stock' : 'Agotado'}
    </span>
  )
}
