/**
 * Constantes para la gestión de reuniones de padres
 */

// Estados de reuniones
export const MEETING_STATUS = {
  PROGRAMADA: 'programada',
  REALIZADA: 'realizada',
  CANCELADA: 'cancelada'
}

// Labels de estados
export const MEETING_STATUS_LABELS = {
  [MEETING_STATUS.PROGRAMADA]: 'Programada',
  [MEETING_STATUS.REALIZADA]: 'Realizada',
  [MEETING_STATUS.CANCELADA]: 'Cancelada'
}

// Colores de estados
export const MEETING_STATUS_COLORS = {
  [MEETING_STATUS.PROGRAMADA]: 'bg-blue-100 text-blue-800',
  [MEETING_STATUS.REALIZADA]: 'bg-green-100 text-green-800',
  [MEETING_STATUS.CANCELADA]: 'bg-red-100 text-red-800'
}

// Alcances de reuniones
export const MEETING_SCOPE = {
  TODOS: 'todos',
  NIVEL: 'nivel',
  GRADO: 'grado'
}

// Labels de alcances
export const MEETING_SCOPE_LABELS = {
  [MEETING_SCOPE.TODOS]: 'Todos los padres',
  [MEETING_SCOPE.NIVEL]: 'Por nivel educativo',
  [MEETING_SCOPE.GRADO]: 'Por grado específico'
}

// Niveles educativos
export const EDUCATION_LEVELS = [
  { value: 'inicial', label: 'Inicial' },
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' }
]

// Años escolares disponibles
export const SCHOOL_YEARS = [
  { value: 2024, label: '2024' },
  { value: 2025, label: '2025' }
]

// Datos iniciales del formulario
export const INITIAL_MEETING_DATA = {
  titulo: '',
  description: '',
  fecha: '',
  hora: '',
  lugar: '',
  alcance: MEETING_SCOPE.TODOS,
  level_id: '',
  grade_id: '',
  section_id: ''
}
