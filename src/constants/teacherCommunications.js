/**
 * Constantes para módulo de comunicaciones del profesor
 */

// Tipos de mensajes disponibles
export const MESSAGE_TYPES = [
  { id: 'comunicado', name: 'Comunicado General', icon: 'MessageSquare', color: 'blue' },
  { id: 'tarea', name: 'Recordatorio de Tarea', icon: 'FileText', color: 'green' },
  { id: 'felicitacion', name: 'Felicitación', icon: 'CheckCircle', color: 'yellow' },
  { id: 'citacion', name: 'Citación', icon: 'AlertCircle', color: 'red' },
  { id: 'evento', name: 'Evento/Actividad', icon: 'Calendar', color: 'purple' }
]

// Tabs disponibles
export const COMMUNICATION_TABS = [
  { id: 'sent', name: 'Enviados' },
  { id: 'scheduled', name: 'Programados' },
  { id: 'templates', name: 'Plantillas' }
]

/**
 * Grados escolares (FALLBACK)
 * Los datos dinámicos se cargan desde structureService.getAllGrades()
 * Esta constante se usa solo como respaldo si la API falla
 */
export const GRADOS = ['1°', '2°', '3°', '4°', '5°', '6°']

/**
 * Secciones (FALLBACK)
 * Los datos dinámicos se cargan desde structureService.getAllSections()
 * Esta constante se usa solo como respaldo si la API falla
 */
export const SECCIONES = ['A', 'B', 'C']

// Estado inicial del formulario de mensajes
export const getInitialMessageForm = (getDefaultExpirationDate) => ({
  type: 'comunicado',
  asunto: '',
  contenido: '',
  destinatarios: 'curso',
  cursoSeleccionado: 'math-5a',
  estudiantesSeleccionados: [],
  prioridad: 'normal',
  programado: false,
  fechaProgramada: '',
  due_date: getDefaultExpirationDate(),
  fechaEntrega: '',
  materia: '',
  tipoTarea: 'practica',
  imagen: null,
  archivo: null
})

// Límites de tamaño de archivo
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  FILE: 10 * 1024 * 1024  // 10MB
}
