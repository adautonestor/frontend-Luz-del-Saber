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

export { formatGradeForDisplay as formatGradeForDisplay2 }

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

export { isPassingGrade as isGradePassing }

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

export { isValidGrade as isValidGrade2 }

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

  // Buscar en el nivel específico
  if (levelId) {
    const levelConfig = store.getScaleForLevel(levelId)
    if (levelConfig?.type === 'letters' && levelConfig?.scale) {
      const gradeItem = levelConfig.scale.find(
        item => item.value.toUpperCase() === letterGrade.toUpperCase()
      )
      if (gradeItem?.label) return gradeItem.label
    }
  }

  // Buscar en todos los niveles configurados
  const config = store.config
  if (config?.levels) {
    for (const lvlConfig of Object.values(config.levels)) {
      if (lvlConfig?.type === 'letters' && lvlConfig?.scale) {
        const gradeItem = lvlConfig.scale.find(
          item => item.value.toUpperCase() === letterGrade.toUpperCase()
        )
        if (gradeItem?.label) return gradeItem.label
      }
    }
  }

  return 'Sin calificación'
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

  // Usar la escala por defecto del store (DEFAULT_LETTER_SCALE)
  const config = store.config
  if (config?.levels) {
    for (const lvlConfig of Object.values(config.levels)) {
      if (lvlConfig?.type === 'letters' && lvlConfig?.scale) {
        return lvlConfig.scale.map(item => ({
          letter: item.value,
          value: item.numericValue,
          description: item.label
        }))
      }
    }
  }

  // Último recurso: usar defaults del store
  return store.getDefaultScale().map(item => ({
    letter: item.value,
    value: item.numericValue,
    description: item.label
  }))
}
