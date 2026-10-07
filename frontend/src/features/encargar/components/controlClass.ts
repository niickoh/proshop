import { clsx } from 'clsx'

/** Clases base de los controles de FormField: alto 44px y text-base (evita el zoom de iOS). */
export const controlClass = (invalid: boolean, width = 'w-full') =>
  clsx(
    'min-h-11 rounded-md border bg-white px-3 py-2 text-base text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-100',
    width,
    invalid ? 'border-red-600' : 'border-gray-300',
  )
