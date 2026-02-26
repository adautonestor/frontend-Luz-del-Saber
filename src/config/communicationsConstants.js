import {
  BookOpen, Users, Paperclip, Star, FileText,
  AlertCircle, MessageSquare, Clock, CheckCircle, Bell
} from 'lucide-react'

/**
 * Constantes para el módulo de comunicaciones de padres
 */

// Nombres de meses
export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Colores por tipo de comunicación
export const TYPE_COLORS = {
  academic: 'bg-blue-100 text-blue-800',
  meeting: 'bg-purple-100 text-purple-800',
  materials: 'bg-green-100 text-green-800',
  recognition: 'bg-yellow-100 text-yellow-800',
  administrative: 'bg-gray-100 text-gray-800',
  discipline: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-800'
}

// Iconos por tipo de comunicación
export const TYPE_ICONS = {
  academic: BookOpen,
  meeting: Users,
  materials: Paperclip,
  recognition: Star,
  administrative: FileText,
  discipline: AlertCircle,
  default: MessageSquare
}

// Nombres por tipo de comunicación
export const TYPE_NAMES = {
  academic: 'Académico',
  meeting: 'Reunión',
  materials: 'Materiales',
  recognition: 'Reconocimiento',
  administrative: 'Administrativo',
  discipline: 'Disciplina',
  default: 'General'
}

// Colores por prioridad
export const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
  default: 'bg-gray-100 text-gray-800'
}

// Iconos por prioridad
export const PRIORITY_ICONS = {
  high: AlertCircle,
  medium: Clock,
  low: CheckCircle,
  default: Bell
}

// Opciones de filtro por tipo
export const TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'academic', label: 'Académico' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'materials', label: 'Materiales' },
  { value: 'recognition', label: 'Reconocimiento' },
  { value: 'administrative', label: 'Administrativo' }
]

// Opciones de filtro por estado
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'unread', label: 'No leídos' },
  { value: 'read', label: 'Leídos' }
]

// Tamaños de archivo
export const FILE_SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB']
export const FILE_SIZE_DIVISOR = 1024

// Límites de zoom para imágenes
export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 3
export const ZOOM_STEP = 0.25
