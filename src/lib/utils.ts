import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const separarNombre = (nombreCompleto: string = '') => {
  // Eliminar espacios en blanco
  nombreCompleto = nombreCompleto.split(' ').filter(Boolean).join(' ')
  const apellidos = nombreCompleto.split(' ').slice(-2).join(' ')
  const nombres = nombreCompleto.replace(apellidos, '').trim()
  return { nombres, apellidos }
}
