import { useId } from 'react'
import { X } from 'lucide-react'
import Chip from '../../../../../shared/ui/Chip'
import IconButton from '../../../../../shared/ui/IconButton'
import { useListField } from '../../hooks/useListField'
import AddItemInput from './AddItemInput'
import FormSection from './FormSection'

/** Tallas de ropa y de calzado más usadas; el resto se agrega como talla personalizada. */
const SIZE_PRESETS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  'Única',
]

export default function VariantsSection() {
  const sizes = useListField('sizes')
  const colors = useListField('colors')
  const sizesLabelId = useId()
  const custom = sizes.values.filter((size) => !SIZE_PRESETS.includes(size))

  return (
    <FormSection title="Variantes">
      <div className="space-y-3">
        <p id={sizesLabelId} className="text-sm font-medium text-slate-700">
          Tallas
          <span aria-hidden="true" className="text-red-600">
            {' '}
            *
          </span>
        </p>
        <div role="group" aria-labelledby={sizesLabelId} className="flex flex-wrap gap-2">
          {[...SIZE_PRESETS, ...custom].map((size) => (
            <Chip
              key={size}
              selected={sizes.values.includes(size)}
              onClick={() => sizes.toggle(size)}
            >
              {size}
            </Chip>
          ))}
        </div>
        <AddItemInput
          label="Talla personalizada"
          addLabel="Agregar talla"
          placeholder="Ej: 46 o 2XL"
          value={sizes.draft}
          onChange={sizes.changeDraft}
          onAdd={sizes.addDraft}
          inputRef={sizes.ref}
          error={sizes.error}
        />
      </div>

      <div className="space-y-3">
        <AddItemInput
          label="Colores"
          required
          addLabel="Agregar color"
          help="Escribe un color y presiona Enter."
          placeholder="Ej: negro"
          value={colors.draft}
          onChange={colors.changeDraft}
          onAdd={colors.addDraft}
          inputRef={colors.ref}
          error={colors.error}
        />
        {colors.values.length > 0 && (
          <ul aria-label="Colores agregados" className="flex flex-wrap gap-2">
            {colors.values.map((color) => (
              <li
                key={color}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-0.5 pl-3 text-sm text-slate-800"
              >
                {color}
                <IconButton
                  aria-label={`Quitar color ${color}`}
                  size="sm"
                  onClick={() => colors.remove(color)}
                >
                  <X aria-hidden="true" size={16} strokeWidth={1.75} />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FormSection>
  )
}
