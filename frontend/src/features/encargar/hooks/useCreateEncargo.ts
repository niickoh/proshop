import { useMutation } from '@tanstack/react-query'
import { createEncargo } from '../api/createEncargo'
import type { EncargoRequest } from '../schema'

type Variables = { body: EncargoRequest; idempotencyKey: string }

export function useCreateEncargo() {
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: Variables) => createEncargo(body, { idempotencyKey }),
  })
}
