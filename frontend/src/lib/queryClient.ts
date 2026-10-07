import { QueryClient } from '@tanstack/react-query'
import { NotFoundError } from './errors'

const MAX_RETRIES = 2

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        !(error instanceof NotFoundError) && failureCount < MAX_RETRIES,
    },
  },
})
