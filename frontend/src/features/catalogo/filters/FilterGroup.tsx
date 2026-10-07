import { useId, useState, type ReactNode } from 'react'
import { clsx } from 'clsx'

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
    <section className="border-b border-gray-200 py-2">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-1 text-left text-sm font-semibold text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
        >
          <span>
            {title}
            {selectedCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                ({selectedCount})
              </span>
            )}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className={clsx('size-4 shrink-0 transition-transform', open && 'rotate-180')}
            fill="currentColor"
          >
            <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>
      </h3>
      <div id={contentId} role="group" aria-label={title} hidden={!open} className="pt-1 pb-2">
        {children}
      </div>
    </section>
  )
}
