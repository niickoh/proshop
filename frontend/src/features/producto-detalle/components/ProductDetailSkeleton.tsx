import Skeleton from '../../../shared/ui/Skeleton'

export default function ProductDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando producto"
      aria-busy="true"
      className="mx-auto max-w-3xl space-y-8 pt-6 pb-28 md:pb-8"
    >
      <Skeleton className="h-11 w-40" />
      <div className="space-y-3">
        <Skeleton className="mx-auto aspect-[3/4] w-full max-w-md rounded-2xl" />
        <div className="mx-auto flex max-w-md gap-3 p-1">
          <Skeleton className="aspect-[3/4] w-16" />
          <Skeleton className="aspect-[3/4] w-16" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="size-11 rounded-full" />
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1 md:w-44 md:flex-none" />
        <Skeleton className="h-12 flex-1 md:w-44 md:flex-none" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-5/6 rounded-full" />
      </div>
    </div>
  )
}
