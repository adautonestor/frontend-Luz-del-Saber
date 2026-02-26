/**
 * Constantes para el módulo de Informes Psicológicos
 */

// Alcances de distribución de informes
export const REPORT_SCOPES = {
  ALL: 'todos',
  LEVEL: 'nivel',
  GRADE: 'grado',
  INDIVIDUAL: 'individual'
}

// Labels para alcances
export const REPORT_SCOPE_LABELS = {
  [REPORT_SCOPES.ALL]: 'Todos los estudiantes',
  [REPORT_SCOPES.LEVEL]: 'Por nivel educativo',
  [REPORT_SCOPES.GRADE]: 'Por grado',
  [REPORT_SCOPES.INDIVIDUAL]: 'Estudiante individual'
}

// Descripciones de alcances
export const REPORT_SCOPE_DESCRIPTIONS = {
  [REPORT_SCOPES.ALL]: 'Enviar el informe a todos los estudiantes del colegio',
  [REPORT_SCOPES.LEVEL]: 'Enviar a todos los estudiantes de un nivel (Inicial, Primaria o Secundaria)',
  [REPORT_SCOPES.GRADE]: 'Enviar a todos los estudiantes de un grado específico',
  [REPORT_SCOPES.INDIVIDUAL]: 'Enviar a un estudiante en particular'
}

// Niveles educativos
export const EDUCATION_LEVELS = [
  { value: 'inicial', label: 'Inicial' },
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' }
]

// Estados de carga
export const UPLOAD_STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
}

// Colores para estados
export const STATUS_COLORS = {
  HAS_REPORT: 'text-green-600',
  NO_REPORT: 'text-orange-500',
  UPLOADING: 'text-blue-600'
}

// Tamaño máximo de archivo (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024

// Tipos de archivo permitidos
export const ALLOWED_FILE_TYPES = ['application/pdf']

// Mensajes
export const MESSAGES = {
  SUCCESS_UPLOAD: 'Informe subido exitosamente',
  SUCCESS_MASSIVE: (count) => `Informe enviado exitosamente a ${count} estudiante${count !== 1 ? 's' : ''}`,
  ERROR_FILE_TYPE: 'Por favor seleccione un archivo PDF válido',
  ERROR_FILE_SIZE: `El archivo no debe superar ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
  ERROR_NO_FILE: 'Debe seleccionar un archivo PDF',
  ERROR_NO_STUDENTS: 'No hay estudiantes que cumplan con los criterios seleccionados',
  ERROR_DATE_OUT_OF_YEAR: (year) => `La fecha debe estar dentro del año lectivo ${year}`,
  CONFIRM_DELETE: '¿Está seguro de eliminar este informe psicológico?',
  CONFIRM_MASSIVE: (count) => `¿Confirma que desea enviar este informe a ${count} estudiante${count !== 1 ? 's' : ''}?`
}

// Configuración de tabla
export const TABLE_HEADERS = [
  { key: 'status', label: 'Estado', width: 'w-32' },
  { key: 'student', label: 'Estudiante', width: 'flex-1' },
  { key: 'dni', label: 'DNI', width: 'w-32' },
  { key: 'level', label: 'Nivel', width: 'w-32' },
  { key: 'grade', label: 'Grado/Sección', width: 'w-40' },
  { key: 'actions', label: 'Acciones', width: 'w-48' }
]

// Filtros por defecto
export const DEFAULT_FILTERS = {
  searchTerm: '',
  selectedLevel: 'todos',
  selectedGrade: 'todos',
  selectedSection: 'todos'
}
