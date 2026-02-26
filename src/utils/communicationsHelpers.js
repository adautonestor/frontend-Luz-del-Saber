import {
  TYPE_COLORS, TYPE_ICONS, TYPE_NAMES,
  PRIORITY_COLORS, PRIORITY_ICONS,
  MONTH_NAMES, FILE_SIZE_UNITS, FILE_SIZE_DIVISOR
} from '../config/communicationsConstants'

/**
 * Transforma comunicaciones del store al formato usado en el componente
 */
export const transformCommunications = (userCommunications) => {
  return userCommunications.map(comm => ({
    id: comm.id,
    title: comm.titulo || comm.title || comm.asunto || 'Sin título',
    content: comm.contenido || comm.content || '',
    sender: comm.remitente_nombre
      ? `${comm.remitente_nombre} ${comm.remitente_apellidos || ''}`.trim()
      : 'Sistema',
    senderRole: 'Administración',
    recipientChild: 'all',
    recipientChildName: 'Todos',
    type: mapCommunicationType(comm.type),
    priority: mapPriority(comm.prioridad || comm.priority),
    sentDate: comm.fechaEnvio || comm.send_date,
    readDate: comm.userConfirmation?.fechaLectura || null,
    status: comm.isRead ? 'read' : 'unread',
    hasAttachments: !!(comm.adjuntos && comm.adjuntos.length > 0),
    attachments: comm.adjuntos || [],
    adjuntos: comm.adjuntos,
    due_date: comm.due_date,
    requiresResponse: comm.requiereConfirmacion || comm.requires_confirmation || false,
    category: comm.type
  }))
}

/**
 * Mapea el tipo de comunicación del store al formato del componente
 */
const mapCommunicationType = (tipo) => {
  const typeMap = {
    comunicado: 'general',
    tarea: 'academic',
    felicitacion: 'recognition',
    citacion: 'discipline',
    evento: 'meeting',
    general: 'general'
  }
  return typeMap[tipo] || 'academic'
}

/**
 * Mapea la prioridad del store al formato del componente
 */
const mapPriority = (prioridad) => {
  if (prioridad === 'alta') return 'high'
  if (prioridad === 'media' || prioridad === 'medium') return 'medium'
  if (prioridad === 'normal') return 'medium'
  return 'low'
}

/**
 * Obtiene el color CSS para un tipo de comunicación
 */
export const getTypeColor = (type) => {
  return TYPE_COLORS[type] || TYPE_COLORS.default
}

/**
 * Obtiene el componente de icono para un tipo de comunicación
 */
export const getTypeIcon = (type) => {
  const IconComponent = TYPE_ICONS[type] || TYPE_ICONS.default
  return IconComponent
}

/**
 * Obtiene el nombre legible para un tipo de comunicación
 */
export const getTypeName = (type) => {
  return TYPE_NAMES[type] || TYPE_NAMES.default
}

/**
 * Obtiene el color CSS para una prioridad
 */
export const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.default
}

/**
 * Obtiene el componente de icono para una prioridad
 */
export const getPriorityIcon = (priority) => {
  const IconComponent = PRIORITY_ICONS[priority] || PRIORITY_ICONS.default
  return IconComponent
}

/**
 * Formatea una fecha a formato local español
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formatea una fecha de manera relativa (hace X horas/días)
 */
export const formatRelativeDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return `Hace ${Math.floor(diffInHours)} horas`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `Hace ${diffInDays} días`
  }

  return formatDate(dateString)
}

/**
 * Obtiene el nombre del mes
 */
export const getMonthName = (month) => {
  return MONTH_NAMES[month - 1] || ''
}

/**
 * Agrupa comunicaciones por mes
 */
export const groupCommunicationsByMonth = (communications) => {
  const grouped = {}

  communications.forEach(comm => {
    const date = new Date(comm.sentDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = `${getMonthName(date.getMonth() + 1)} ${date.getFullYear()}`

    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        monthName,
        monthKey,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        communications: []
      }
    }

    grouped[monthKey].communications.push(comm)
  })

  // Convertir a array y ordenar por fecha (más reciente primero)
  const sortedGroups = Object.values(grouped).sort((a, b) => {
    const dateA = new Date(a.year, a.month - 1)
    const dateB = new Date(b.year, b.month - 1)
    return dateB - dateA
  })

  // Ordenar comunicados dentro de cada grupo: no leídos primero, luego por fecha
  sortedGroups.forEach(group => {
    group.communications.sort((a, b) => {
      // Priorizar no leídos primero
      if (a.status !== b.status) {
        if (a.status === 'unread') return -1
        if (b.status === 'unread') return 1
      }

      // Luego ordenar por fecha (más reciente primero)
      return new Date(b.sentDate) - new Date(a.sentDate)
    })
  })

  return sortedGroups
}

/**
 * Filtra comunicaciones según criterios
 */
export const filterCommunications = (communications, filters) => {
  const { searchTerm, filterType, filterStatus } = filters

  return communications.filter(comm => {
    const matchesSearch = (comm.title && comm.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (comm.content && comm.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (comm.sender && comm.sender.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === 'all' || comm.type === filterType
    const matchesStatus = filterStatus === 'all' || comm.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })
}

/**
 * Calcula estadísticas de comunicaciones
 */
export const calculateCommunicationStats = (communications) => {
  const unreadCount = communications.filter(comm => comm.status === 'unread').length
  const importantCount = communications.filter(comm => comm.priority === 'high').length
  const responseRequiredCount = communications.filter(
    comm => comm.requiresResponse && comm.status === 'unread'
  ).length

  return {
    total: communications.length,
    unread: unreadCount,
    important: importantCount,
    responseRequired: responseRequiredCount
  }
}

/**
 * Verifica si un archivo es PDF
 */
export const isPDF = (file) => {
  return file && (file.type === 'application/pdf' || file.type === 'application/pdf')
}

/**
 * Descarga un archivo
 */
export const handleDownload = (file) => {
  const link = document.createElement('a')
  link.href = file.data
  link.download = file.name || file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Formatea el tamaño de un archivo
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const i = Math.floor(Math.log(bytes) / Math.log(FILE_SIZE_DIVISOR))
  return parseFloat((bytes / Math.pow(FILE_SIZE_DIVISOR, i)).toFixed(2)) + ' ' + FILE_SIZE_UNITS[i]
}
