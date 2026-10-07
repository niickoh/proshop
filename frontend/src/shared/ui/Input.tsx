import type { ComponentProps } from 'react'
import { cn } from './cn'
import { fieldClass } from './styles'

type Props = ComponentProps<'input'> & {
  invalid?: boolean
}

export default function Input({ invalid, className, ...props }: Props) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(fieldClass(invalid), className)}
      {...props}
    />
  )
}
