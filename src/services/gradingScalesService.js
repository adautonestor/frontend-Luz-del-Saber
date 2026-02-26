import api from './api'

/**
 * Servicio para gestionar escalas de calificación
 * Conecta con /api/system-settings/grading-scales
 */

/**
 * Obtener configuración completa de escalas para un año académico
 * @param {number} academicYearId - ID del año académico
 * @returns {Promise<Object>} Configuración de escalas
 */
export const getGradingScalesConfig = async (academicYearId) => {
  try {
    const response = await api.get(`/system-settings/grading-scales/${academicYearId}`)
    return response.data
  } catch (error) {
    console.error('Error getting grading scales config:', error)
    throw error
  }
}

/**
 * Actualizar configuración completa de escalas
 * @param {number} academicYearId - ID del año académico
 * @param {Object} config - Nueva configuración
 * @returns {Promise<Object>} Configuración actualizada
 */
export const updateGradingScalesConfig = async (academicYearId, config) => {
  try {
    const response = await api.put(`/system-settings/grading-scales/${academicYearId}`, config)
    return response.data
  } catch (error) {
    console.error('Error updating grading scales config:', error)
    throw error
  }
}

/**
 * Obtener escala de un nivel específico
 * @param {number} academicYearId - ID del año académico
 * @param {number} levelId - ID del nivel
 * @returns {Promise<Object>} Configuración del nivel
 */
export const getLevelScale = async (academicYearId, levelId) => {
  try {
    const response = await api.get(`/system-settings/grading-scales/${academicYearId}/level/${levelId}`)
    return response.data
  } catch (error) {
    console.error(`Error getting level ${levelId} scale:`, error)
    throw error
  }
}

/**
 * Actualizar escala de un nivel específico
 * @param {number} academicYearId - ID del año académico
 * @param {number} levelId - ID del nivel
 * @param {Object} levelConfig - Nueva configuración del nivel
 * @returns {Promise<Object>} Configuración actualizada
 */
export const updateLevelScale = async (academicYearId, levelId, levelConfig) => {
  try {
    const response = await api.put(`/system-settings/grading-scales/${academicYearId}/level/${levelId}`, levelConfig)
    return response.data
  } catch (error) {
    console.error(`Error updating level ${levelId} scale:`, error)
    throw error
  }
}

/**
 * Obtener tabla de conversión para un nivel
 * @param {number} academicYearId - ID del año académico
 * @param {number} levelId - ID del nivel
 * @returns {Promise<Object>} Tabla de conversión {letra: valorNumérico}
 */
export const getConversionTable = async (academicYearId, levelId) => {
  try {
    const response = await api.get(`/system-settings/grading-scales/${academicYearId}/conversion-table/${levelId}`)
    return response.data
  } catch (error) {
    console.error(`Error getting conversion table for level ${levelId}:`, error)
    throw error
  }
}

/**
 * Verificar si un nivel está bloqueado
 * @param {number} academicYearId - ID del año académico
 * @param {number} levelId - ID del nivel
 * @returns {Promise<boolean>} true si está bloqueado
 */
export const isLevelLocked = async (academicYearId, levelId) => {
  try {
    const response = await api.get(`/system-settings/grading-scales/${academicYearId}/is-locked/${levelId}`)
    return response.data?.isLocked || false
  } catch (error) {
    console.error(`Error checking lock status for level ${levelId}:`, error)
    return false
  }
}

/**
 * Bloquear un nivel manualmente
 * @param {number} academicYearId - ID del año académico
 * @param {number} levelId - ID del nivel
 * @returns {Promise<Object>} Resultado del bloqueo
 */
export const lockLevel = async (academicYearId, levelId) => {
  try {
    const response = await api.post(`/system-settings/grading-scales/${academicYearId}/lock/${levelId}`)
    return response.data
  } catch (error) {
    console.error(`Error locking level ${levelId}:`, error)
    throw error
  }
}

/**
 * Validar un valor de calificación
 * @param {string|number} value - Valor a validar
 * @param {number} levelId - ID del nivel
 * @returns {Promise<{isValid: boolean, message: string}>}
 */
export const validateGradeValue = async (value, levelId) => {
  try {
    const response = await api.post('/system-settings/grading-scales/validate', {
      value,
      levelId
    })
    return response.data
  } catch (error) {
    console.error('Error validating grade value:', error)
    return { isValid: false, message: error.message }
  }
}

/**
 * Convertir un valor de calificación
 * @param {string|number} value - Valor a convertir
 * @param {number} levelId - ID del nivel
 * @param {'toNumeric'|'toLetter'} direction - Dirección de conversión
 * @returns {Promise<{convertedValue: any}>}
 */
export const convertGradeValue = async (value, levelId, direction = 'toNumeric') => {
  try {
    const response = await api.post('/system-settings/grading-scales/convert', {
      value,
      levelId,
      direction
    })
    return response.data
  } catch (error) {
    console.error('Error converting grade value:', error)
    throw error
  }
}

// Constantes por defecto para fallback (se usan si la API no responde)
export const DEFAULT_LETTER_SCALE = [
  { value: 'A', label: 'Logro destacado', numericValue: 4, color: '#22c55e' },
  { value: 'B', label: 'Logro esperado', numericValue: 3, color: '#3b82f6' },
  { value: 'C', label: 'En proceso', numericValue: 2, color: '#eab308' },
  { value: 'D', label: 'En inicio', numericValue: 1, color: '#ef4444' }
]

export const DEFAULT_NUMERIC_CONFIG = {
  type: 'numeric',
  minValue: 0,
  maxValue: 20,
  passingGrade: 11,
  ranges: [
    { min: 18, max: 20, label: 'Logro destacado', color: '#22c55e' },
    { min: 14, max: 17, label: 'Logro esperado', color: '#3b82f6' },
    { min: 11, max: 13, label: 'En proceso', color: '#eab308' },
    { min: 0, max: 10, label: 'En inicio', color: '#ef4444' }
  ]
}

export default {
  getGradingScalesConfig,
  updateGradingScalesConfig,
  getLevelScale,
  updateLevelScale,
  getConversionTable,
  isLevelLocked,
  lockLevel,
  validateGradeValue,
  convertGradeValue,
  DEFAULT_LETTER_SCALE,
  DEFAULT_NUMERIC_CONFIG
}
