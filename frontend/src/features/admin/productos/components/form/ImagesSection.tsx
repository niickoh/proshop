import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { ArrowDown, ArrowUp, X } from 'lucide-react'
import Badge from '../../../../../shared/ui/Badge'
import IconButton from '../../../../../shared/ui/IconButton'
import { useListField } from '../../hooks/useListField'
import ProductThumb from '../ProductThumb'
import AddItemInput from './AddItemInput'
import FormSection from './FormSection'

const iconProps = { 'aria-hidden': true, size: 16, strokeWidth: 1.75 } as const

export default function ImagesSection() {
  const images = useListField('images')
  const listRef = useRef<HTMLOListElement>(null)
  const [announcement, setAnnouncement] = useState('')

  /** Reordena y deja el foco en la misma flecha de la imagen movida (o en la otra si llegó al borde). */
  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    flushSync(() => images.move(index, delta))
    const last = images.values.length - 1
    const direction =
      delta === -1 ? (target === 0 ? 'down' : 'up') : target === last ? 'up' : 'down'
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-index="${target}"][data-move="${direction}"]`)
      ?.focus()
    setAnnouncement(`Imagen movida a la posición ${target + 1}${target === 0 ? ' (portada)' : ''}`)
  }

  return (
    <FormSection
      title="Imágenes"
      description="La primera es la portada. Usa las flechas para cambiar el orden."
    >
      <AddItemInput
        label="URL de la imagen"
        required
        addLabel="Agregar imagen"
        help="Ruta /products/... o URL https://..."
        placeholder="https://..."
        value={images.draft}
        onChange={images.changeDraft}
        onAdd={images.addDraft}
        inputRef={images.ref}
        error={images.error}
      />

      {images.values.length > 0 && (
        <ol ref={listRef} aria-label="Imágenes" className="space-y-2">
          {images.values.map((url, index) => (
            <li key={url} className="flex items-center gap-3 rounded-xl p-2 ring-1 ring-slate-200">
              <ProductThumb src={url} />
              <div className="min-w-0 flex-1 space-y-1">
                {index === 0 && <Badge tone="brand">Portada</Badge>}
                <p className="text-xs break-all text-slate-600">{url}</p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end">
                <IconButton
                  aria-label={`Subir imagen ${index + 1}`}
                  data-index={index}
                  data-move="up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp {...iconProps} />
                </IconButton>
                <IconButton
                  aria-label={`Bajar imagen ${index + 1}`}
                  data-index={index}
                  data-move="down"
                  disabled={index === images.values.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown {...iconProps} />
                </IconButton>
                <IconButton
                  aria-label={`Quitar imagen ${index + 1}`}
                  onClick={() => images.remove(url)}
                >
                  <X {...iconProps} />
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      )}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </FormSection>
  )
}
