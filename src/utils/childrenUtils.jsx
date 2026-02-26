import React from 'react'
import { Star, CheckCircle, AlertTriangle, User } from 'lucide-react'
import { getGradingScalesStore } from '../stores/gradingScalesStore'

/**
 * Obtiene las clases CSS para el color del badge de estado
 * @param {string} status - Estado del estudiante (excellent, good, attention, critical)
 * @returns {string} Clases de Tailwind CSS
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'excellent': return 'bg-green-100 text-green-800'
    case 'good': return 'bg-blue-100 text-blue-800'
    case 'attention': return 'bg-yellow-100 text-yellow-800'
    case 'critical': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Obtiene el icono correspondiente al estado del estudiante
 * @param {string} status - Estado del estudiante
 * @returns {JSX.Element} Componente de icono
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'excellent': return <Star className="w-4 h-4" />
    case 'good': return <CheckCircle className="w-4 h-4" />
    case 'attention': return <AlertTriangle className="w-4 h-4" />
    case 'critical': return <AlertTriangle className="w-4 h-4" />
    default: return <User className="w-4 h-4" />
  }
}

/**
 * Obtiene la clase de color para la nota según su valor
 * Usa la configuración dinámica del store SSOT basada en el nivel del estudiante
 * @param {number} grade - Nota del estudiante
 * @param {number} levelId - ID del nivel educativo (opcional, para config dinámica)
 * @returns {string} Clase de color de Tailwind
 */
export const getGradeColor = (grade, levelId = null) => {
  if (grade === null || grade === undefined) return 'text-gray-400'

  const store = getGradingScalesStore()
  const hexColor = store.getGradeColor(grade, levelId)

  // Mapear color hex a clase Tailwind
  const colorMap = {
    '#22c55e': 'text-green-600',
    '#3b82f6': 'text-blue-600',
    '#eab308': 'text-yellow-600',
    '#ef4444': 'text-red-600',
    '#9ca3af': 'text-gray-400'
  }

  return colorMap[hexColor] || 'text-gray-400'
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param {string} birthDate - Fecha de nacimiento en formato ISO
 * @returns {number} Edad en años
 */
export const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Obtiene el texto en español para el estado
 * @param {string} status - Estado del estudiante
 * @returns {string} Texto en español
 */
export const getStatusText = (status) => {
  switch (status) {
    case 'excellent': return 'Excelente'
    case 'good': return 'Bueno'
    case 'attention': return 'Atención'
    case 'critical': return 'Crítico'
    case 'active': return 'Activo'
    case 'inactive': return 'Inactivo'
    case 'pending': return 'Pendiente'
    default: return status || 'Sin estado'
  }
}
