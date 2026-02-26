import { MessageSquare, FileText } from 'lucide-react'

/**
 * Tabs disponibles en la página de comunicaciones
 */
export const COMMUNICATIONS_TABS = [
  { id: 'messages', label: 'Historial', icon: MessageSquare },
  { id: 'templates', label: 'Plantillas', icon: FileText }
]

/**
 * Mapeo de tipos de comunicado del formulario al esquema de la BD
 */
export const TIPO_MAP = {
  'comunicado': 'general',
  'circular': 'informativo',
  'notificacion': 'urgente',
  'anuncio': 'informativo'
}

/**
 * Tipos de archivo permitidos para adjuntos
 */
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf'
]

/**
 * Tamaño máximo de archivo en bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * Días por defecto para fecha de vencimiento
 */
export const DEFAULT_EXPIRATION_DAYS = 7

/**
 * Calcular fecha de vencimiento por defecto (7 días desde hoy)
 */
export const getDefaultExpirationDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + DEFAULT_EXPIRATION_DAYS)
  return date.toISOString().split('T')[0]
}

/**
 * Estado inicial del formulario de comunicación
 */
export const getInitialFormData = () => ({
  type: 'comunicado',
  titulo: '',
  contenido: '',
  destinatarios: [],
  usuarioEspecifico: null,
  prioridad: 'normal',
  programado: false,
  fechaProgramada: '',
  due_date: getDefaultExpirationDate(),
  adjuntos: [],
  filtros: {
    padresMorosos: false,
    nivel: '',
    grado: '',
    seccion: '',
    area: '',
    bajoRendimiento: false,
    matriculaActiva: false
  }
})
