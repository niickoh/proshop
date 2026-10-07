import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('por defecto es primary md, type="button" y con foco visible de la marca', () => {
    render(<Button>Comprar</Button>)
    const button = screen.getByRole('button', { name: 'Comprar' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('bg-brand-600', 'text-white', 'rounded-xl', 'h-11')
    expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-brand-600')
    expect(button).toHaveClass('motion-reduce:transition-none')
  })

  it.each([
    ['primary', ['bg-brand-600', 'hover:bg-brand-700']],
    ['secondary', ['bg-white', 'ring-1', 'ring-slate-200', 'hover:bg-slate-50']],
    ['ghost', ['text-slate-600', 'hover:bg-slate-100']],
  ] as const)('variant %s aplica sus estilos', (variant, classes) => {
    render(<Button variant={variant}>Acción</Button>)
    expect(screen.getByRole('button', { name: 'Acción' })).toHaveClass(...classes)
  })

  it('size y fullWidth cambian el tamaño', () => {
    render(
      <Button size="lg" fullWidth>
        Grande
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Grande' })).toHaveClass('h-12', 'w-full')
  })

  it('loading deshabilita, marca aria-busy y muestra un spinner', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <Button loading onClick={onClick}>
        Enviando…
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Enviando…' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    const spinner = button.querySelector('svg')
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
    expect(spinner).toHaveClass('animate-spin', 'motion-reduce:animate-none')

    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('sin loading no muestra spinner y llama a onClick', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Ok</Button>)
    const button = screen.getByRole('button', { name: 'Ok' })
    expect(button.querySelector('svg')).toBeNull()
    expect(button).not.toHaveAttribute('aria-busy')
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('className extra se combina sin duplicar utilidades', () => {
    render(<Button className="px-8">Ancho</Button>)
    const button = screen.getByRole('button', { name: 'Ancho' })
    expect(button).toHaveClass('px-8')
    expect(button).not.toHaveClass('px-5')
  })
})
