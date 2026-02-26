import React from 'react'
import { Clock, CheckCircle, X, AlertCircle } from 'lucide-react'

/**
 * Obtiene el color de fondo y texto según el estado de la solicitud
 * @param {string} status - Estado de la solicitud (pendiente, aprobada, rechazada)
 * @returns {string} Clases de Tailwind para el estado
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'pendiente':
      return 'text-yellow-600 bg-yellow-100'
    case 'aprobada':
      return 'text-green-600 bg-green-100'
    case 'rechazada':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

/**
 * Obtiene el ícono correspondiente al estado de la solicitud
 * @param {string} status - Estado de la solicitud
 * @returns {JSX.Element} Componente de ícono
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'pendiente':
      return <Clock className="w-4 h-4" />
    case 'aprobada':
      return <CheckCircle className="w-4 h-4" />
    case 'rechazada':
      return <X className="w-4 h-4" />
    default:
      return <AlertCircle className="w-4 h-4" />
  }
}

/**
 * Formatea el texto de género para mostrar
 * @param {string} genero - Código de género (M/F)
 * @returns {string} Texto formateado del género
 */
export const formatGender = (genero) => {
  return genero === 'M' ? 'Masculino' : 'Femenino'
}

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalizeFirst = (text) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}
