import { useState } from 'react'
import { clsx } from 'clsx'

type Props = { name: string; images: string[]; dimmed?: boolean }

export default function ProductGallery({ name, images, dimmed = false }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex] ?? images[0]

  return (
    <div className="space-y-3">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-lg bg-gray-100">
        <img
          src={active}
          alt={name}
          loading="eager"
          className={clsx('aspect-[3/4] w-full object-cover', dimmed && 'opacity-60 grayscale')}
        />
      </div>

      {images.length > 1 && (
        <ul
          aria-label="Fotos del producto"
          className="mx-auto flex max-w-md snap-x [scrollbar-width:none] gap-2 overflow-x-auto p-1 [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, index) => {
            const isActive = index === activeIndex
            return (
              <li key={`${src}-${index}`} className="shrink-0 snap-start">
                <button
                  type="button"
                  aria-label={`Ver foto ${index + 1} de ${images.length}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => setActiveIndex(index)}
                  className={clsx(
                    'block w-16 overflow-hidden rounded-md border-2 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none',
                    isActive
                      ? 'border-gray-900'
                      : 'border-transparent opacity-70 hover:opacity-100',
                  )}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
