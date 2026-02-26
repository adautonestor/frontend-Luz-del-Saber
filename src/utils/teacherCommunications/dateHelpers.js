/**
 * Helpers para manejo de fechas
 */

// Calcular fecha de vencimiento por defecto (7 días desde la fecha especificada o desde hoy)
export const getDefaultExpirationDate = (baseDate = null) => {
  const date = baseDate ? new Date(baseDate) : new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().split('T')[0]
}

export const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}
