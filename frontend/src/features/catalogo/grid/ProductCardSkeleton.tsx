export default function ProductCardSkeleton() {
  return (
    <li className="animate-pulse">
      <div className="aspect-[3/4] w-full rounded-md bg-gray-200" />
      <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-1/4 rounded bg-gray-200" />
    </li>
  )
}
