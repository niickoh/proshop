import type { KeyboardEvent, Ref } from 'react'
import { Plus } from 'lucide-react'
import FormField from '../../../../encargar/components/FormField'
import Button from '../../../../../shared/ui/Button'
import Input from '../../../../../shared/ui/Input'

type Props = {
  label: string
  /** Texto del botón (ej. "Agregar color"). */
  addLabel: string
  help?: string
  required?: boolean
  value: string
  error?: string
  onChange: (value: string) => void
  onAdd: () => void
  inputRef?: Ref<HTMLInputElement>
  placeholder?: string
}

/** Campo para agregar elementos a una lista con Enter o con el botón. */
export default function AddItemInput({
  label,
  addLabel,
  help,
  required,
  value,
  error,
  onChange,
  onAdd,
  inputRef,
  placeholder,
}: Props) {
  // Enter agrega el elemento en vez de enviar el formulario.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    onAdd()
  }

  return (
    <FormField label={label} required={required} help={help} error={error}>
      {(field) => (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            {...field}
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            invalid={!!error}
          />
          <Button variant="secondary" onClick={onAdd} className="shrink-0">
            <Plus aria-hidden="true" size={16} strokeWidth={1.75} />
            {addLabel}
          </Button>
        </div>
      )}
    </FormField>
  )
}
