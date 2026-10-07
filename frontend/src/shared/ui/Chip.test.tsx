import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chip from './Chip'

function ToggleChip() {
  const [selected, setSelected] = useState(false)
  return (
    <Chip selected={selected} onClick={() => setSelected((s) => !s)}>
      M
    </Chip>
  )
}

describe('Chip', () => {
  it('refleja la selección con aria-pressed y alterna al tocarlo', async () => {
    const user = userEvent.setup()
    render(<ToggleChip />)
    const chip = screen.getByRole('button', { name: 'M' })
    expect(chip).toHaveAttribute('type', 'button')
    expect(chip).toHaveAttribute('aria-pressed', 'false')

    await user.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard('{Enter}')
    expect(chip).toHaveAttribute('aria-pressed', 'false')
  })

  it('es una píldora con área táctil de 44px y estilo de seleccionado', () => {
    render(
      <>
        <Chip selected={false}>S</Chip>
        <Chip selected>L</Chip>
      </>,
    )
    const off = screen.getByRole('button', { name: 'S' })
    const on = screen.getByRole('button', { name: 'L' })
    expect(off).toHaveClass('rounded-full', 'ring-1', 'ring-slate-200', 'min-h-11')
    expect(off).not.toHaveClass('bg-brand-600')
    expect(on).toHaveClass('bg-brand-600', 'text-white', 'ring-brand-600')
    expect(on).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-offset-2')
  })
})
