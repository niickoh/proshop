import { useId, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import Badge from '../../../shared/ui/Badge'
import { cn } from '../../../shared/ui/cn'
import { focusRing, transition } from '../../../shared/ui/styles'

type Props = {
  title: string
  selectedCount?: number
  defaultOpen?: boolean
  children: ReactNode
}

export default function FilterGroup({
  title,
  selectedCount = 0,
  defaultOpen = true,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const contentId = useId()

  return (
    <section className="py-2">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            'flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-2 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50',
            transition,
            focusRing,
          )}
        >
          <span className="flex items-center gap-2">
            {title}
            {selectedCount > 0 && <Badge tone="brand">({selectedCount})</Badge>}
          </span>
          <ChevronDown
            aria-hidden="true"
            size={20}
            strokeWidth={1.75}
            className={cn('shrink-0 text-slate-500', transition, open && 'rotate-180')}
          />
        </button>
      </h3>
      <div id={contentId} role="group" aria-label={title} hidden={!open} className="px-2 pt-2 pb-2">
        {children}
      </div>
    </section>
  )
}
