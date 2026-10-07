import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** clsx + tailwind-merge: las clases que llegan después ganan sobre las base (ej. `px-8` sobre `px-5`). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
