import { useQuery } from '@tanstack/react-query'
import { NotFoundError } from '../../../lib/errors'
import { getProduct } from '../api/getProduct'

export function useProduct(id: string) {
  const query = useQuery({
    queryKey: ['product', id],
    queryFn: ({ signal }) => getProduct(id, signal),
  })
  return { ...query, isNotFound: query.error instanceof NotFoundError }
}
