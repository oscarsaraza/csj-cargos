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

export const profesiones = [
  'Derecho y Afines',
  'Administración',
  'Agronomía',
  'Antropología, Artes Liberales',
  'Arquitectura y Afines',
  'Artes Plásticas Visuales y afines',
  'Artes Representativas',
  'Bacteriología',
  'Bibliotecología, Otros de Ciencias Sociales y Humanas',
  'Biología, Microbiología y Afines',
  'Ciencia Política, Relaciones Internacionales',
  'Comunicación Social, Periodismo y Afines',
  'Contaduría Pública',
  'Deportes, Educación Física y Recreación',
  'Diseño',
  'Economía',
  'Educación',
  'Enfermería',
  'Filosofía, Teología y Afines',
  'Física',
  'Formación Relacionada con el Campo Militar o Policial',
  'Geografía, Historia',
  'Geología, Otros Programas de Ciencias Naturales',
  'Ingeniería Administrativa y Afines',
  'Ingeniería Agrícola, Forestal y Afines',
  'Ingeniería Agroindustrial, Alimentos y Afines',
  'Ingeniería Agronómica, Pecuaria y Afines',
  'Ingeniería Ambiental, Sanitaria y Afines',
  'Ingeniería Biomédica y Afines',
  'Ingeniería Civil y Afines',
  'Ingeniería de Minas, Metalurgia y Afines',
  'Ingeniería de Sistemas, Telemática y Afines',
  'Ingeniería Eléctrica y Afines',
  'Ingeniería Electrónica, Telecomunicaciones y Afines',
  'Ingeniería Industrial y Afines',
  'Ingeniería Mecánica y Afines',
  'Ingeniería Química y Afines',
  'Instrumentación Quirúrgica',
  'Lenguas Modernas, Literatura, Lingüística y Afines',
  'Matemáticas, Estadística y Afines',
  'Medicina',
  'Medicina Veterinaria',
  'Música',
  'Nutrición y Dietética',
  'Odontología',
  'Optometría, Otros Programas de Ciencias de la Salud',
  'Otras Ingenierías',
  'Otros Programas Asociados a Bellas Artes',
  'Psicología',
  'Publicidad y Afines',
  'Química y Afines',
  'Salud Pública',
  'Sociología, Trabajo Social y Afines',
  'Terapias',
  'Zootecnia',
  'Otra',
]
