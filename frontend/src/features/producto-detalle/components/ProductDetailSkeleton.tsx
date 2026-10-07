export default function ProductDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando producto"
      aria-busy="true"
      className="mx-auto max-w-3xl animate-pulse space-y-6 pt-4 pb-28 md:pb-8"
    >
      <div className="h-11 w-40 rounded-md bg-gray-200" />
      <div className="mx-auto aspect-[3/4] w-full max-w-md rounded-lg bg-gray-200" />
      <div className="mx-auto flex max-w-md gap-2">
        <div className="aspect-[3/4] w-16 rounded-md bg-gray-200" />
        <div className="aspect-[3/4] w-16 rounded-md bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-8 w-3/4 rounded bg-gray-200" />
        <div className="h-6 w-32 rounded bg-gray-200" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="size-11 rounded-md bg-gray-200" />
        ))}
      </div>
      <div className="flex gap-2">
        <div className="h-11 flex-1 rounded-md bg-gray-200 md:w-44 md:flex-none" />
        <div className="h-11 flex-1 rounded-md bg-gray-200 md:w-44 md:flex-none" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
      </div>
    </div>
  )
}
