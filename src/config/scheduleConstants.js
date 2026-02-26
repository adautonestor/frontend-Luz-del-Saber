import {
  BookOpen, Users, CheckCircle, User, Edit, Coffee, Clock
} from 'lucide-react'

/**
 * Constantes para el sistema de horarios
 */

// Días de la semana
export const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
export const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// Slots de tiempo por defecto
export const DEFAULT_TIME_SLOTS = [
  '7:30 AM', '8:00 AM', '8:45 AM', '9:30 AM', '10:15 AM',
  '11:00 AM', '11:45 AM', '12:30 PM', '1:15 PM', '2:00 PM',
  '2:45 PM', '3:30 PM', '4:15 PM', '5:00 PM'
]

// Tipos de eventos
export const EVENT_TYPES = {
  CLASS: 'class',
  MEETING: 'meeting',
  EVALUATION: 'evaluation',
  PARENT_MEETING: 'parent-meeting',
  PREPARATION: 'preparation',
  TUTORING: 'tutoring',
  BREAK: 'break'
}

// Mapeo de iconos por tipo de evento
export const EVENT_TYPE_ICONS = {
  [EVENT_TYPES.CLASS]: BookOpen,
  [EVENT_TYPES.MEETING]: Users,
  [EVENT_TYPES.EVALUATION]: CheckCircle,
  [EVENT_TYPES.PARENT_MEETING]: User,
  [EVENT_TYPES.PREPARATION]: Edit,
  [EVENT_TYPES.TUTORING]: User,
  [EVENT_TYPES.BREAK]: Coffee,
  default: Clock
}

// Mapeo de nombres de tipos de eventos
export const EVENT_TYPE_NAMES = {
  [EVENT_TYPES.CLASS]: 'Clase',
  [EVENT_TYPES.MEETING]: 'Reunión',
  [EVENT_TYPES.EVALUATION]: 'Evaluación',
  [EVENT_TYPES.PARENT_MEETING]: 'Reunión con Padres',
  [EVENT_TYPES.PREPARATION]: 'Preparación',
  [EVENT_TYPES.TUTORING]: 'Tutoría',
  [EVENT_TYPES.BREAK]: 'Recreo'
}

// Colores para eventos
export const EVENT_COLORS = {
  blue: 'bg-blue-500 border-blue-600 text-white',
  green: 'bg-green-500 border-green-600 text-white',
  purple: 'bg-purple-500 border-purple-600 text-white',
  yellow: 'bg-yellow-400 border-yellow-500 text-yellow-900',
  red: 'bg-red-500 border-red-600 text-white',
  orange: 'bg-orange-500 border-orange-600 text-white',
  pink: 'bg-pink-500 border-pink-600 text-white',
  indigo: 'bg-indigo-500 border-indigo-600 text-white',
  gray: 'bg-gray-300 border-gray-400 text-gray-700'
}

// Modos de vista
export const VIEW_MODES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month'
}

// Labels de modos de vista
export const VIEW_MODE_LABELS = {
  [VIEW_MODES.DAY]: 'Día',
  [VIEW_MODES.WEEK]: 'Semana',
  [VIEW_MODES.MONTH]: 'Mes'
}
