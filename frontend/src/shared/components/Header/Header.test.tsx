import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import Header from './Header'
import NavComprar from './options/NavComprar'
import NavEncargar from './options/NavEncargar'
import NavContacto from './options/NavContacto'
import NavAdministracion from './options/NavAdministracion'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderHeader(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Header />
      <Routes>
        <Route path="*" element={<LocationDisplay />} />
      </Routes>
      <p>Contenido de la página</p>
    </MemoryRouter>,
  )
}

const getNav = () => screen.getByRole('navigation', { name: 'Principal' })
const getMenuButton = () => screen.getByRole('button', { name: 'Abrir menú' })

describe('Header', () => {
  it('muestra el logo y las opciones Comprar, Encargar y Administración en ese orden, sin Contáctanos', () => {
    renderHeader()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ProShop' })).toBeInTheDocument()
    const links = within(getNav()).getAllByRole('link', { hidden: true })
    expect(links.map((l) => l.textContent)).toEqual(['Comprar', 'Encargar', 'Administración'])
    expect(
      screen.queryByRole('link', { name: 'Contáctanos', hidden: true }),
    ).not.toBeInTheDocument()
  })

  it('cada opción navega a su ruta sin recargar y el logo navega a /', async () => {
    const user = userEvent.setup()
    renderHeader('/encargar')

    for (const [name, path] of [
      ['Comprar', '/comprar'],
      ['Encargar', '/encargar'],
      ['Administración', '/admin'],
    ]) {
      await user.click(getMenuButton())
      await user.click(screen.getByRole('link', { name }))
      expect(screen.getByTestId('location')).toHaveTextContent(path)
    }

    await user.click(screen.getByRole('link', { name: 'ProShop' }))
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })

  it('la opción de la página actual está activa con aria-current="page"', () => {
    renderHeader('/encargar')
    const nav = getNav()
    expect(within(nav).getByRole('link', { name: 'Encargar', hidden: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(nav).getByRole('link', { name: 'Comprar', hidden: true })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('cada opción renderizada sola muestra su texto y apunta a su ruta', () => {
    const cases = [
      [NavComprar, 'Comprar', '/comprar'],
      [NavEncargar, 'Encargar', '/encargar'],
      [NavContacto, 'Contáctanos', '/contacto'],
      [NavAdministracion, 'Administración', '/admin'],
    ] as const
    for (const [Option, name, path] of cases) {
      const { unmount } = render(
        <MemoryRouter>
          <Option />
        </MemoryRouter>,
      )
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', path)
      unmount()
    }
  })

  // jsdom no evalúa media queries ni Tailwind: se verifica la clase que oculta el panel en móvil.
  it('en móvil las opciones están ocultas y aparece el botón de menú', () => {
    renderHeader()
    expect(getMenuButton()).toBeVisible()
    expect(getMenuButton()).toHaveAttribute('aria-expanded', 'false')
    expect(getNav()).toHaveClass('hidden', 'md:flex')
  })

  it('al tocar el botón se muestran las opciones y aria-expanded pasa a true', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(getMenuButton())
    expect(getMenuButton()).toHaveAttribute('aria-expanded', 'true')
    expect(getNav()).not.toHaveClass('hidden')
    for (const name of ['Comprar', 'Encargar', 'Administración']) {
      expect(within(getNav()).getByRole('link', { name })).toBeVisible()
    }
  })

  it('el menú móvil se cierra al elegir una opción, con Escape o con clic fuera', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(getMenuButton())
    await user.click(screen.getByRole('link', { name: 'Comprar' }))
    expect(getMenuButton()).toHaveAttribute('aria-expanded', 'false')

    await user.click(getMenuButton())
    await user.keyboard('{Escape}')
    expect(getMenuButton()).toHaveAttribute('aria-expanded', 'false')

    await user.click(getMenuButton())
    await user.click(screen.getByText('Contenido de la página'))
    expect(getMenuButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('logo y opciones se recorren con Tab y tienen foco visible', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(getMenuButton())
    ;(document.activeElement as HTMLElement | null)?.blur()

    const expected = ['ProShop', 'Abrir menú', 'Comprar', 'Encargar', 'Administración']
    for (const name of expected) {
      await user.tab()
      expect(document.activeElement).toHaveAccessibleName(name)
      expect(document.activeElement?.className).toMatch(/focus-visible:/)
    }
  })

  it('el header no genera scroll horizontal ni corta textos', () => {
    renderHeader()
    const header = screen.getByRole('banner')
    expect(header.className).toMatch(/\bsticky\b/)
    expect(header.className).not.toMatch(/\bw-screen\b/)
    expect(header.innerHTML).not.toMatch(/\btruncate\b|whitespace-nowrap|overflow-hidden/)
  })
})
