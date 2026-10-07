import type { ComponentProps } from 'react'
import { cn } from './cn'

/** Superficie blanca redondeada con sombra suave. El padding lo define quien la usa. */
export default function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-2xl bg-white shadow-sm', className)} {...props} />
}
