import { UserPlus, History } from 'lucide-react'

/**
 * Configuración y constantes para el módulo de solicitudes de matrícula
 */

// Tabs de navegación
export const ENROLLMENT_TABS = [
  { id: 'new', name: 'Nueva Solicitud', icon: UserPlus },
  { id: 'history', name: 'Mis Solicitudes', icon: History }
]

// Estado inicial del formulario
export const INITIAL_FORM_DATA = {
  first_names: '',
  last_names: '',
  dni: '',
  fechaNacimiento: '',
  genero: '',
  direccion: '',
  telefono: '',
  email: '',
  nivel: '',
  grado: '',
  seccion: '',
  observations: ''
}

// Opciones de género
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' }
]

// Límites de edad para validación
export const AGE_LIMITS = {
  MIN: 3,
  MAX: 18
}

// Número total de pasos del formulario
export const TOTAL_STEPS = 3
