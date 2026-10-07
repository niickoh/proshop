import Skeleton from '../../../shared/ui/Skeleton'

export default function ProductCardSkeleton() {
  return (
    <li>
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <Skeleton className="mt-3 h-3 w-1/3 rounded-full" />
      <Skeleton className="mt-2 h-4 w-3/4 rounded-full" />
      <Skeleton className="mt-2 h-4 w-1/4 rounded-full" />
    </li>
  )
}
