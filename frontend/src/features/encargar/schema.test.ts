import { encargoSchema, type EncargoInput } from './schema'

const valid: EncargoInput = {
  nombre: 'Ana',
  apellido: 'Pérez',
  correo: 'ana@correo.cl',
  telefono: '+56 9 1234 5678',
  direccion: 'Av. Siempre Viva 742, Santiago',
  producto: 'Zapatillas Nike Air Max',
  talla: '',
  cantidad: 1,
}

const errorsOf = (patch: Partial<EncargoInput>) => {
  const result = encargoSchema.safeParse({ ...valid, ...patch })
  return result.success ? {} : result.error.flatten().fieldErrors
}

describe('encargoSchema', () => {
  it('acepta datos válidos, recorta espacios y envía talla vacía como null', () => {
    const result = encargoSchema.parse({ ...valid, nombre: '  Ana  ', producto: ' Polera ' })
    expect(result).toEqual({
      ...valid,
      nombre: 'Ana',
      producto: 'Polera',
      telefono: '+56912345678',
      talla: null,
    })
  })

  it.each([
    '+56 9 1234 5678',
    '+56912345678',
    '56912345678',
    '912345678',
    '9 1234 5678',
    '+56 9-1234-5678',
  ])('normaliza el teléfono %s a +569XXXXXXXX', (telefono) => {
    expect(encargoSchema.parse({ ...valid, telefono }).telefono).toBe('+56912345678')
  })

  it.each(['', '812345678', '+56 2 2123 4567', '91234567', '9123456789', '+54 9 1234 5678', 'abc'])(
    'rechaza el teléfono "%s"',
    (telefono) => {
      expect(errorsOf({ telefono }).telefono).toHaveLength(1)
    },
  )

  it('valida largos de nombre, apellido, dirección y producto', () => {
    expect(errorsOf({ nombre: '' }).nombre).toEqual(['Ingresa tu nombre'])
    expect(errorsOf({ nombre: 'A' }).nombre).toEqual(['Debe tener al menos 2 caracteres'])
    expect(errorsOf({ apellido: 'x'.repeat(51) }).apellido).toEqual([
      'Debe tener como máximo 50 caracteres',
    ])
    expect(errorsOf({ direccion: 'Av 1' }).direccion).toHaveLength(1)
    expect(errorsOf({ direccion: 'x'.repeat(121) }).direccion).toHaveLength(1)
    expect(errorsOf({ producto: 'ab' }).producto).toHaveLength(1)
    expect(errorsOf({ producto: '   ' }).producto).toEqual(['Ingresa el producto'])
  })

  it('valida el correo', () => {
    expect(errorsOf({ correo: '' }).correo).toEqual(['Ingresa tu correo'])
    expect(errorsOf({ correo: 'ana@' }).correo).toEqual([
      'Ingresa un correo válido, como nombre@correo.cl',
    ])
    expect(encargoSchema.parse({ ...valid, correo: ' ana@correo.cl ' }).correo).toBe(
      'ana@correo.cl',
    )
  })

  it('acepta solo tallas de la lista', () => {
    expect(encargoSchema.parse({ ...valid, talla: 'M' }).talla).toBe('M')
    expect(encargoSchema.parse({ ...valid, talla: '42' }).talla).toBe('42')
    expect(errorsOf({ talla: 'XXXL' as EncargoInput['talla'] }).talla).toHaveLength(1)
  })

  it.each([0, 21, 1.5, Number.NaN])('rechaza la cantidad %s', (cantidad) => {
    expect(errorsOf({ cantidad }).cantidad).toEqual(['Ingresa una cantidad entera entre 1 y 20'])
  })

  it('acepta cantidades de 1 a 20', () => {
    expect(errorsOf({ cantidad: 1 })).toEqual({})
    expect(errorsOf({ cantidad: 20 })).toEqual({})
  })
})
