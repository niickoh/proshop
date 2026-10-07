// Contrato de `POST /api/encargos`. Sin dependencias del frontend: se puede copiar al backend.
import { z } from 'zod'

export const TALLAS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  ...Array.from({ length: 11 }, (_, i) => String(35 + i)),
] as const

export const CANTIDAD_MIN = 1
export const CANTIDAD_MAX = 20

/** Móvil chileno: 9 + 8 dígitos, con o sin +56 / 56 y con espacios o guiones. */
const TELEFONO_REGEX = /^(?:\+?56)?[\s-]*9(?:[\s-]*\d){8}$/

// `abort`: si está vacío solo se muestra "Ingresa…", no también el error de largo o formato.
const obligatorio = (mensaje: string) => z.string().trim().min(1, { error: mensaje, abort: true })

const texto = (campo: string, min: number, max: number) =>
  obligatorio(`Ingresa ${campo}`)
    .min(min, `Debe tener al menos ${min} caracteres`)
    .max(max, `Debe tener como máximo ${max} caracteres`)

const mensajeCantidad = `Ingresa una cantidad entera entre ${CANTIDAD_MIN} y ${CANTIDAD_MAX}`

export const encargoSchema = z.object({
  nombre: texto('tu nombre', 2, 50),
  apellido: texto('tu apellido', 2, 50),
  correo: obligatorio('Ingresa tu correo').pipe(
    z.email('Ingresa un correo válido, como nombre@correo.cl'),
  ),
  telefono: obligatorio('Ingresa tu teléfono')
    .regex(TELEFONO_REGEX, 'Ingresa un celular chileno válido, como +56 9 1234 5678')
    // Normaliza a +569XXXXXXXX.
    .transform((value) => `+569${value.replace(/\D/g, '').slice(-8)}`),
  direccion: texto('tu dirección', 5, 120),
  producto: texto('el producto', 3, 100),
  // '' = "No aplica"; se envía como null.
  talla: z
    .enum(['', ...TALLAS], 'Elige una talla de la lista')
    .transform((value) => (value === '' ? null : value)),
  cantidad: z
    .number(mensajeCantidad)
    .int(mensajeCantidad)
    .min(CANTIDAD_MIN, mensajeCantidad)
    .max(CANTIDAD_MAX, mensajeCantidad),
})

/** Lo que llena el formulario (antes de normalizar). */
export type EncargoInput = z.input<typeof encargoSchema>
/** Cuerpo de `POST /api/encargos`. */
export type EncargoRequest = z.output<typeof encargoSchema>

/** 201 Created */
export type EncargoResponse = { id: string; folio: string; createdAt: string }
