import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { getGradingScalesStore } from '../../stores/gradingScalesStore'

/**
 * Convierte color hex a clase CSS de texto
 * @param {string} hexColor - Color en formato hexadecimal
 * @param {boolean} bold - Si agregar bold para notas destacadas
 * @returns {string} Clase CSS de Tailwind
 */
const hexToTextClass = (hexColor, bold = false) => {
  const colorMap = {
    '#22c55e': bold ? 'text-green-600 font-bold' : 'text-green-600',
    '#3b82f6': 'text-blue-600',
    '#eab308': 'text-yellow-600',
    '#ef4444': 'text-red-600',
    '#9ca3af': 'text-gray-400'
  }
  return colorMap[hexColor] || 'text-gray-400'
}

/**
 * Obtiene la clase CSS de color según la calificación y sistema de calificación
 * Usa configuración dinámica del store SSOT
 * @param {number|string} value - Calificación (número o letra)
 * @param {string} gradingSystem - Sistema de calificación ('secundaria', 'inicial', 'primaria')
 * @param {number} levelId - ID del nivel educativo (opcional)
 * @returns {string} Clase CSS para el color
 */
export const getGradeColor = (value, gradingSystem, levelId = null) => {
  if (value === null || value === undefined) return 'text-gray-400'

  const store = getGradingScalesStore()
  const hexColor = store.getGradeColor(value, levelId)

  // Determinar si es nota destacada para aplicar bold
  let isBold = false
  if (gradingSystem === 'secundaria') {
    isBold = typeof value === 'number' && value >= 18
  } else {
    isBold = value === 'AD' || value === 'A'
  }

  return hexToTextClass(hexColor, isBold)
}

/**
 * Obtiene el icono visual según la calificación
 * Usa configuración dinámica del store SSOT
 * @param {number|string} value - Calificación (número o letra)
 * @param {string} gradingSystem - Sistema de calificación ('secundaria', 'inicial', 'primaria')
 * @param {number} levelId - ID del nivel educativo (opcional)
 * @returns {JSX.Element} Componente de icono
 */
export const getGradeIcon = (value, gradingSystem, levelId = null) => {
  if (value === null || value === undefined) {
    return <AlertCircle className="w-4 h-4 inline text-gray-400" />
  }

  const store = getGradingScalesStore()

  // Determinar si la nota es aprobatoria usando el store
  const isPassing = store.isPassingGrade(value, levelId)

  if (isPassing) {
    // Verificar si es nota destacada
    let isExcellent = false
    if (gradingSystem === 'secundaria') {
      isExcellent = typeof value === 'number' && value >= 14
    } else {
      isExcellent = value === 'AD' || value === 'A'
    }

    if (isExcellent) {
      return <CheckCircle className="w-4 h-4 inline text-green-600" />
    }
    return <AlertCircle className="w-4 h-4 inline text-yellow-600" />
  }

  return <XCircle className="w-4 h-4 inline text-red-600" />
}
