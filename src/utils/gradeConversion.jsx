/**
 * Utilidades para conversión de notas
 *
 * SINGLE SOURCE OF TRUTH (SSOT):
 * Todas las funciones de este archivo usan gradingScalesStore como fuente única.
 * La configuración se carga dinámicamente desde la API basándose en lo que
 * el director configure en Configuración > Académico.
 *
 * @module utils/gradeConversion
 */

import { getGradingScalesStore } from '../stores/gradingScalesStore'

// ============================================
// FUNCIONES DE CONVERSIÓN PRINCIPALES
// ============================================

/**
 * Convierte un valor numérico a letra según la escala configurada
 * @param {number} value - Valor numérico (ej: 3.5)
 * @param {number} levelId - ID del nivel (opcional)
 * @returns {string} Letra (A, B, C, D) o '-' si no es válido
 */
export function convertAverageValueToLetter(value, levelId = null) {
  return getGradingScalesStore().convertNumericToLetter(value, levelId)
}

/**
 * Convierte una letra a su valor numérico según la escala configurada
 * @param {string} letter - Letra (A, B, C, D)
 * @param {number} levelId - ID del nivel (opcional)
 * @returns {number|null} Valor numérico
 */
export function convertLetterToAverageValue(letter, levelId = null) {
  return getGradingScalesStore().convertLetterToNumeric(letter, levelId)
}

/**
 * Formatea una calificación para mostrar en la interfaz
 * @param {string|number} grade - Calificación
 * @param {string} gradingSystem - 'literal' o 'vigesimal'
 * @param {number} levelId - ID del nivel (opcional)
 * @returns {string} Calificación formateada
 */
export function formatGradeForDisplay(grade, gradingSystem = 'literal', levelId = null) {
  return getGradingScalesStore().formatGrade(grade, gradingSystem, levelId)
}

/**
 * Alias de formatGradeForDisplay para compatibilidad
 */
export function formatGradeForDisplay2(grade, gradingSystem = 'literal', levelId = null) {
  return formatGradeForDisplay(grade, gradingSystem, levelId)
}

// ============================================
// FUNCIONES DE COLOR
// ============================================

/**
 * Obtiene el color hexadecimal para una calificación
 * @param {string|number} value - Valor de calificación
 * @param {number} levelId - ID del nivel (opcional)
 * @returns {string} Color hexadecimal
 */
export function getGradeColor(value, levelId = null) {
  return getGradingScalesStore().getGradeColor(value, levelId)
}

/**
 * Obtiene las clases CSS de Tailwind para una calificación
 * @param {string|number} value - Valor de calificación
 * @param {number} levelId - ID del nivel (opcional)
 * @returns {string} Clases CSS
 */
export function getGradeColorClasses(value, levelId = null) {
  return getGradingScalesStore().getGradeColorClasses(value, levelId)
}

/**
 * Obtiene el color de una nota letra para mostrar en UI
 * @param {string} letterGrade - Nota en formato letra (A, B, C, D)
 * @returns {string} Clase CSS de color
 */
export function getLetterGradeColor(letterGrade) {
  if (!letterGrade || letterGrade === '-') return 'text-gray-400'

  // Obtener color del store dinámicamente
  const hexColor = getGradingScalesStore().getGradeColor(letterGrade)
  const hexToTextClass = {
    '#22c55e': 'text-green-600',
    '#3b82f6': 'text-blue-600',
    '#eab308': 'text-yellow-600',
    '#ef4444': 'text-red-600',
    '#9ca3af': 'text-gray-400'
  }
  return hexToTextClass[hexColor] || 'text-gray-400'
}

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Verifica si una calificación es aprobatoria
 * @param {string|number} value - Valor de calificación
 * @param {number} levelId - ID del nivel (opcional)
 * @returns {boolean}
 */
export function isPassingGrade(value, levelId = null) {
  return getGradingScalesStore().isPassingGrade(value, levelId)
}

/**
 * Alias para compatibilidad
 */
export function isGradePassing(grade, gradingSystem = 'literal', levelId = null) {
  return isPassingGrade(grade, levelId)
}

/**
 * Valida si una calificación es válida para el sistema
 * @param {string|number} value - Valor a validar
 * @param {string} gradingSystem - 'literal' o 'vigesimal'
 * @returns {boolean}
 */
export function isValidGrade(value, gradingSystem = 'literal') {
  if (value === null || value === undefined || value === '' || value === '-') {
    return false
  }

  if (gradingSystem === 'literal') {
    if (typeof value === 'string') {
      // Verificar contra la escala configurada en el store
      const numericValue = getGradingScalesStore().convertLetterToNumeric(value)
      return numericValue !== null
    }
    return false
  }

  // Sistema vigesimal
  const numValue = parseFloat(value)
  return !isNaN(numValue) && numValue >= 0 && numValue <= 20
}

/**
 * Alias de isValidGrade
 */
export function isValidGrade2(value, gradingSystem = 'literal') {
  return isValidGrade(value, gradingSystem)
}

/**
 * Valida una calificación y retorna mensaje de error
 * @param {string|number} value - Valor a validar
 * @param {string} gradingSystem - 'literal' o 'vigesimal'
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateGrade(value, gradingSystem = 'literal') {
  if (value === null || value === undefined || value === '' || value === '-') {
    return { valid: false, error: 'La calificación no puede estar vacía' }
  }

  if (gradingSystem === 'literal') {
    if (typeof value === 'string') {
      const numericValue = getGradingScalesStore().convertLetterToNumeric(value)
      if (numericValue === null) {
        return { valid: false, error: 'Calificación no válida para la escala configurada' }
      }
      return { valid: true, error: null }
    }
    return { valid: false, error: 'La calificación debe ser una letra válida' }
  }

  // Sistema vigesimal
  const numValue = parseFloat(value)
  if (isNaN(numValue)) {
    return { valid: false, error: 'La calificación debe ser un número' }
  }
  if (numValue < 0 || numValue > 20) {
    return { valid: false, error: 'La calificación debe estar entre 0 y 20' }
  }
  return { valid: true, error: null }
}

// ============================================
// FUNCIONES DE CÁLCULO DE PROMEDIO
// ============================================

/**
 * Calcula el promedio final de un curso a partir de calificaciones letra
 * @param {Array<string>} letterGrades - Array de calificaciones letra
 * @param {number} levelId - ID del nivel (opcional)
 * @returns {{numeric: number|null, letter: string}}
 */
export function calculateFinalCourseAverage(letterGrades, levelId = null) {
  if (!Array.isArray(letterGrades) || letterGrades.length === 0) {
    return { numeric: null, letter: '-' }
  }

  const store = getGradingScalesStore()

  // Convertir letras a valores numéricos
  const numericValues = letterGrades
    .map(grade => store.convertLetterToNumeric(grade, levelId))
    .filter(value => value !== null)

  if (numericValues.length === 0) {
    return { numeric: null, letter: '-' }
  }

  // Calcular promedio
  const sum = numericValues.reduce((acc, value) => acc + value, 0)
  const average = sum / numericValues.length

  // Convertir de vuelta a letra
  const letterGrade = store.convertNumericToLetter(average, levelId)

  return {
    numeric: Math.round(average * 100) / 100,
    letter: letterGrade
  }
}

/**
 * Calcula el promedio de notas letra convirtiéndolas a numéricas
 * @param {Array<string>} letterGrades - Array de notas letra
 * @param {number} levelId - ID del nivel (opcional)
 * @returns {number|null} Promedio numérico
 */
export function calculateAverageFromLetterGrades(letterGrades, levelId = null) {
  const result = calculateFinalCourseAverage(letterGrades, levelId)
  return result.numeric
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Determina el sistema de calificación según el nivel educativo
 * @param {string} levelName - Nombre del nivel
 * @returns {'literal'|'vigesimal'}
 */
export function getGradingSystem(levelName) {
  if (!levelName) return 'literal'

  const normalizedName = levelName.toLowerCase()
  if (normalizedName.includes('secundaria') || normalizedName.includes('bachiller')) {
    return 'vigesimal'
  }
  return 'literal'
}

/**
 * Convierte una calificación a su valor numérico para cálculos
 * @param {string|number} grade - Calificación
 * @param {string} gradingSystem - 'literal' o 'vigesimal'
 * @param {number} levelId - ID del nivel (opcional)
 * @returns {number|null}
 */
export function convertGradeToNumeric(grade, gradingSystem = 'literal', levelId = null) {
  if (grade === null || grade === undefined || grade === '' || grade === '-') {
    return null
  }

  if (gradingSystem === 'literal') {
    // Intentar convertir cualquier letra configurada (A, B, C, D, AD, F, etc.)
    if (typeof grade === 'string') {
      const numericValue = getGradingScalesStore().convertLetterToNumeric(grade, levelId)
      if (numericValue !== null) return numericValue
    }
    // Fallback: intentar parsear como número
    const numValue = parseFloat(grade)
    return !isNaN(numValue) ? numValue : null
  }

  // Sistema vigesimal
  const numValue = parseFloat(grade)
  return !isNaN(numValue) ? numValue : null
}

/**
 * Obtiene la descripción textual de una nota letra
 * @param {string} letterGrade - Nota en formato letra
 * @param {number} levelId - ID del nivel (opcional)
 * @returns {string}
 */
export function getLetterGradeDescription(letterGrade, levelId = null) {
  if (!letterGrade || letterGrade === '-') return 'Sin calificación'

  const store = getGradingScalesStore()
  const levelConfig = levelId ? store.getScaleForLevel(levelId) : null

  if (levelConfig?.type === 'letters' && levelConfig?.scale) {
    const gradeItem = levelConfig.scale.find(
      item => item.value.toUpperCase() === letterGrade.toUpperCase()
    )
    if (gradeItem?.label) {
      return gradeItem.label
    }
  }

  // Fallback
  const descriptions = {
    'A': 'Logro Destacado',
    'B': 'Logro Esperado',
    'C': 'En Proceso',
    'D': 'En Inicio'
  }
  return descriptions[letterGrade?.toUpperCase()] || 'Sin calificación'
}

/**
 * Obtiene la escala de calificación configurada
 * @param {number} levelId - ID del nivel (opcional)
 * @returns {Array<Object>}
 */
export function getAverageGradingScale(levelId = null) {
  const store = getGradingScalesStore()
  const levelConfig = levelId ? store.getScaleForLevel(levelId) : null

  if (levelConfig?.type === 'letters' && levelConfig?.scale) {
    return levelConfig.scale.map(item => ({
      letter: item.value,
      value: item.numericValue,
      description: item.label
    }))
  }

  // Fallback
  return [
    { letter: 'A', value: 4, description: 'Logro Destacado' },
    { letter: 'B', value: 3, description: 'Logro Esperado' },
    { letter: 'C', value: 2, description: 'En Proceso' },
    { letter: 'D', value: 1, description: 'En Inicio' }
  ]
}

// ============================================
// FUNCIONES LEGACY (mantener para compatibilidad)
// ============================================

/**
 * Convierte una nota numérica (0-20) a letra (AD, A, B, C)
 * @deprecated Usar convertAverageValueToLetter con el sistema dinámico
 */
export function convertNumericGradeToLetter(numericGrade) {
  if (numericGrade === null || numericGrade === undefined || isNaN(numericGrade)) {
    return '-'
  }

  const grade = parseFloat(numericGrade)

  if (grade >= 18) return 'AD'
  if (grade >= 14) return 'A'
  if (grade >= 11) return 'B'
  return 'C'
}

/**
 * Convierte una nota letra (AD, A, B, C) a numérica (0-20)
 * @deprecated Usar convertLetterToAverageValue con el sistema dinámico
 */
export function convertLetterGradeToNumeric(letterGrade) {
  if (!letterGrade || letterGrade === '-') return null

  const gradeMap = {
    'AD': 19,
    'A': 15.5,
    'B': 12,
    'C': 5.5
  }

  return gradeMap[letterGrade.toUpperCase()] || null
}

/**
 * Convierte un array de notas numéricas a letras
 * @deprecated
 */
export function convertGradesArrayToLetters(grades) {
  if (!Array.isArray(grades)) return []
  return grades.map(grade => convertNumericGradeToLetter(grade))
}

/**
 * Obtiene el rango numérico de una nota letra
 * @deprecated
 */
export function getLetterGradeRange(letterGrade) {
  const ranges = {
    'AD': { min: 18, max: 20 },
    'A': { min: 14, max: 17 },
    'B': { min: 11, max: 13 },
    'C': { min: 0, max: 10 }
  }
  return ranges[letterGrade?.toUpperCase()] || { min: 0, max: 0 }
}

/**
 * Obtiene el icono apropiado para una nota
 * @deprecated
 */
export function getGradeIcon(grade, gradingSystem = 'literal') {
  let letterGrade = grade

  if (typeof grade === 'number') {
    letterGrade = convertNumericGradeToLetter(grade)
  }

  const iconMap = {
    'AD': 'CheckCircle',
    'A': 'CheckCircle',
    'B': 'AlertCircle',
    'C': 'XCircle'
  }

  return iconMap[letterGrade?.toUpperCase()] || 'Circle'
}
