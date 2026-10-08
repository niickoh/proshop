import Skeleton from '../../../../shared/ui/Skeleton'

const ROWS = 6

/** Filas de carga con la forma del listado. */
export default function ProductsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando productos"
      className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70"
    >
      {Array.from({ length: ROWS }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="aspect-[3/4] w-12 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="hidden h-4 w-20 md:block" />
          <Skeleton className="hidden h-6 w-16 rounded-full md:block" />
        </div>
      ))}
    </div>
  )
}
