import type { ComponentProps } from 'react'
import { cn } from './cn'

/** Bloque de carga. El tamaño y la forma los define quien lo usa. */
export default function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-xl bg-slate-200 motion-reduce:animate-none', className)}
      {...props}
    />
  )
}
