/**
 * Helpers para colores y estados de calificaciones en reportes
 * Usa configuración dinámica del store SSOT
 */
import { getGradingScalesStore } from '../../stores/gradingScalesStore'

/**
 * Convierte color hex a clases CSS de Tailwind para reportes
 * @param {string} hexColor - Color en formato hexadecimal
 * @returns {string} Clases CSS de Tailwind
 */
const hexToReportClasses = (hexColor) => {
  const colorMap = {
    '#22c55e': 'text-green-600 bg-green-50',
    '#3b82f6': 'text-blue-600 bg-blue-50',
    '#eab308': 'text-yellow-600 bg-yellow-50',
    '#ef4444': 'text-red-600 bg-red-50',
    '#9ca3af': 'text-gray-600 bg-gray-50'
  }
  return colorMap[hexColor] || 'text-gray-600 bg-gray-50'
}

/**
 * Obtiene el color de una calificación usando configuración dinámica
 * @param {number|string} grade - Calificación
 * @param {number} levelId - ID del nivel educativo (opcional)
 * @returns {string} Clases CSS de Tailwind
 */
export const getGradeColor = (grade, levelId = null) => {
  if (grade === null || grade === undefined) return 'text-gray-600 bg-gray-50'

  const store = getGradingScalesStore()
  const hexColor = store.getGradeColor(grade, levelId)
  return hexToReportClasses(hexColor)
}

/**
 * Obtiene el color de una calificación de comportamiento
 * @param {string} grade - Calificación en letra
 * @param {number} levelId - ID del nivel educativo (opcional)
 * @returns {string} Clases CSS de Tailwind
 */
export const getBehaviorGradeColor = (grade, levelId = null) => {
  if (!grade) return 'text-gray-600 bg-gray-50'

  const store = getGradingScalesStore()
  // Para comportamiento, usar la primera letra para determinar color
  const firstLetter = grade.charAt(0).toUpperCase()
  const hexColor = store.getGradeColor(firstLetter, levelId)
  return hexToReportClasses(hexColor)
}

/**
 * Obtiene el color según el estado
 * @param {string} status - Estado (completed, current, upcoming)
 * @returns {string} Clases CSS de Tailwind
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800'
    case 'current': return 'bg-blue-100 text-blue-800'
    case 'upcoming': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Obtiene el color según aprobación/reprobación
 * @param {boolean} passed - Si aprobó o no
 * @returns {string} Clases CSS de Tailwind
 */
export const getPassFailColor = (passed) => {
  return passed ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
}

/**
 * Obtiene el color del estado de una materia
 * @param {string} status - Estado (aprobado, reprobado)
 * @returns {string} Clases CSS de Tailwind
 */
export const getSubjectStatusColor = (status) => {
  return status === 'aprobado' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
}

/**
 * Obtiene el color de una competencia usando configuración dinámica
 * @param {string} level - Nivel de la competencia (A, B, C, D)
 * @param {number} levelId - ID del nivel educativo (opcional)
 * @returns {string} Clases CSS de Tailwind
 */
export const getCompetenciaColor = (level, levelId = null) => {
  if (!level) return 'text-gray-700 bg-gray-100 border-gray-200'

  const store = getGradingScalesStore()
  const hexColor = store.getGradeColor(level, levelId)

  // Mapear a clases con borde
  const colorMap = {
    '#22c55e': 'text-green-700 bg-green-100 border-green-200',
    '#3b82f6': 'text-blue-700 bg-blue-100 border-blue-200',
    '#eab308': 'text-yellow-700 bg-yellow-100 border-yellow-200',
    '#ef4444': 'text-red-700 bg-red-100 border-red-200',
    '#9ca3af': 'text-gray-700 bg-gray-100 border-gray-200'
  }

  return colorMap[hexColor] || 'text-gray-700 bg-gray-100 border-gray-200'
}

/**
 * Obtiene la etiqueta de una competencia usando configuración dinámica
 * @param {string} level - Nivel de la competencia (A, B, C, D)
 * @param {number} levelId - ID del nivel educativo (opcional)
 * @returns {string} Etiqueta descriptiva
 */
export const getCompetenciaLabel = (level, levelId = null) => {
  if (!level) return 'No Evaluado'

  const store = getGradingScalesStore()
  const levelConfig = store.getScaleForLevel(levelId)

  // Si hay configuración personalizada, buscar la etiqueta
  if (levelConfig?.type === 'letters' && levelConfig?.scale) {
    const gradeItem = levelConfig.scale.find(
      item => item.value.toUpperCase() === level.toUpperCase()
    )
    if (gradeItem?.label) {
      return gradeItem.label
    }
  }

  // Fallback a etiquetas MINEDU por defecto
  const defaultLabels = {
    'A': 'Logro Destacado',
    'B': 'Logro Esperado',
    'C': 'En Proceso',
    'D': 'En Inicio'
  }
  return defaultLabels[level.toUpperCase()] || 'No Evaluado'
}
