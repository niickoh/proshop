import type { ComponentProps } from 'react'
import { cn } from './cn'

export type BadgeTone = 'neutral' | 'brand' | 'sale' | 'success'

type Props = ComponentProps<'span'> & { tone?: BadgeTone }

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-slate-900 text-white',
  brand: 'bg-brand-600 text-white',
  sale: 'bg-red-600 text-white',
  success: 'bg-emerald-50 text-emerald-700',
}

export default function Badge({ tone = 'neutral', className, ...props }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
