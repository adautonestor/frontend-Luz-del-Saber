/**
 * Utilidades para sistema de calificaciones
 * Funciones para validación y procesamiento de notas
 *
 * ============================================================================
 * ⚠️  ARCHIVO DEPRECATED - NO USAR EN NUEVOS DESARROLLOS
 * ============================================================================
 *
 * Este archivo contiene valores HARDCODEADOS que han sido reemplazados por
 * el sistema centralizado de escalas de calificación configurables.
 *
 * ✅ USAR EN SU LUGAR:
 * - Backend: services/gradingScalesService.js
 * - Frontend: hooks/useGradingScales.js o hooks/useGradingConfig.js
 * - API: /api/system-settings/grading-scales
 *
 * 📁 ARCHIVOS QUE AÚN USAN ESTE CÓDIGO (pendientes de migración):
 * - stores/gradesStore.jsx (líneas 9, 448-449, 457, 481) - Riesgo alto, no migrar
 * - components/reportCards/BehaviorModal.jsx (usa LETTER_GRADES local - es intencional)
 *
 * Los valores aquí se mantienen SOLO por retrocompatibilidad.
 * La configuración real se carga desde la BD vía grading_scales_config.
 *
 * Valores numéricos estándar para sistema literal: A=4, B=3, C=2, D=1
 */

/**
 * @deprecated Usar useGradingScales() o useGradingConfig() en su lugar
 * Configuración del sistema de calificaciones - SOLO FALLBACK
 */
export const GradingSystemConfig = {
  // Sistema de calificación literal (A, B, C, D)
  // NOTA: Los rangos numéricos aquí son aproximaciones para conversión a vigesimal
  // Para valores de promedio usar: A=4, B=3, C=2, D=1
  LETTER_GRADES: {
    'AD': { min: 18, max: 20, description: 'Logro Destacado', color: 'text-green-600', bgColor: 'bg-green-50', numericValue: 4 },
    'A': { min: 14, max: 17, description: 'Logro Esperado', color: 'text-blue-600', bgColor: 'bg-blue-50', numericValue: 4 },
    'B': { min: 11, max: 13, description: 'En Proceso', color: 'text-yellow-600', bgColor: 'bg-yellow-50', numericValue: 3 },
    'C': { min: 0, max: 10, description: 'En Inicio', color: 'text-red-600', bgColor: 'bg-red-50', numericValue: 2 },
    'D': { min: 0, max: 10, description: 'En Inicio', color: 'text-red-600', bgColor: 'bg-red-50', numericValue: 1 }
  },

  // Sistema de calificación numérico (0-20)
  NUMERIC_RANGE: { min: 0, max: 20 },

  // Nota mínima aprobatoria
  PASSING_GRADE: 11,

  // Pesos por defecto para tipos de evaluación
  DEFAULT_WEIGHTS: {
    'practica': 0.3,
    'examen': 0.4,
    'participacion': 0.1,
    'tarea': 0.2
  },

  // Tipos de evaluación
  EVALUATION_TYPES: [
    { id: 'practica', label: 'Práctica', weight: 0.3 },
    { id: 'examen', label: 'Examen', weight: 0.4 },
    { id: 'participacion', label: 'Participación', weight: 0.1 },
    { id: 'tarea', label: 'Tarea', weight: 0.2 }
  ],

  // Niveles educativos y sus sistemas de calificación
  LEVEL_GRADING_SYSTEMS: {
    'inicial': 'LETTER', // Usa calificaciones literales (A, B, C, D)
    'primaria': 'LETTER', // Usa calificaciones literales (A, B, C, D)
    'secundaria': 'NUMERIC' // Usa calificaciones numéricas (0-20)
  }
}

/**
 * Validar estructura de evaluación
 * @param {Object} structure - Estructura de evaluación
 * @returns {Object} { valid: boolean, errors: Array }
 */
export const validateEvaluationStructure = (structure) => {
  const errors = []

  if (!structure) {
    errors.push('La estructura de evaluación es requerida')
    return { valid: false, errors }
  }

  if (!structure.nombre || structure.nombre.trim() === '') {
    errors.push('El nombre de la estructura es requerido')
  }

  if (!structure.academic_year_id && !structure.academicYearId) {
    errors.push('El año académico es requerido')
  }

  if (!structure.level_id && !structure.levelId && !structure.nivel_id) {
    errors.push('El nivel educativo es requerido')
  }

  // Validar competencias si existen
  if (structure.competencias && Array.isArray(structure.competencias)) {
    structure.competencias.forEach((comp, index) => {
      if (!comp.nombre || comp.nombre.trim() === '') {
        errors.push(`Competencia ${index + 1}: El nombre es requerido`)
      }
      if (comp.peso && (comp.peso < 0 || comp.peso > 100)) {
        errors.push(`Competencia ${index + 1}: El peso debe estar entre 0 y 100`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validar calificación
 * @param {number|string} grade - Calificación a validar
 * @param {string} gradingSystem - Sistema de calificación ('NUMERIC' o 'LETTER')
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateGrade = (grade, gradingSystem = 'NUMERIC') => {
  if (grade === null || grade === undefined || grade === '') {
    return { valid: false, error: 'La calificación es requerida' }
  }

  if (gradingSystem === 'NUMERIC') {
    const numericGrade = parseFloat(grade)
    if (isNaN(numericGrade)) {
      return { valid: false, error: 'La calificación debe ser un número' }
    }
    if (numericGrade < GradingSystemConfig.NUMERIC_RANGE.min || numericGrade > GradingSystemConfig.NUMERIC_RANGE.max) {
      return {
        valid: false,
        error: `La calificación debe estar entre ${GradingSystemConfig.NUMERIC_RANGE.min} y ${GradingSystemConfig.NUMERIC_RANGE.max}`
      }
    }
  } else if (gradingSystem === 'LETTER') {
    const validGrades = Object.keys(GradingSystemConfig.LETTER_GRADES)
    if (!validGrades.includes(grade.toString().toUpperCase())) {
      return {
        valid: false,
        error: `La calificación debe ser una de: ${validGrades.join(', ')}`
      }
    }
  }

  return { valid: true, error: null }
}

/**
 * Validar modificación de calificación
 * @param {Object} modification - Datos de la modificación
 * @returns {Object} { valid: boolean, errors: Array }
 */
export const validateGradeModification = (modification) => {
  const errors = []

  if (!modification) {
    errors.push('Los datos de modificación son requeridos')
    return { valid: false, errors }
  }

  if (!modification.grade_id && !modification.gradeId) {
    errors.push('El ID de la calificación es requerido')
  }

  if (!modification.newValue && modification.newValue !== 0) {
    errors.push('El nuevo valor es requerido')
  }

  if (!modification.reason || modification.reason.trim() === '') {
    errors.push('La razón de la modificación es requerida')
  }

  if (!modification.modified_by && !modification.modifiedBy) {
    errors.push('El usuario que modifica es requerido')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Calcular promedio ponderado
 * @param {Array} grades - Array de calificaciones con pesos
 * @returns {number} Promedio ponderado
 */
export const calculateWeightedAverage = (grades) => {
  if (!grades || !Array.isArray(grades) || grades.length === 0) {
    return 0
  }

  let totalWeight = 0
  let weightedSum = 0

  grades.forEach(grade => {
    const value = parseFloat(grade.valor || grade.value || 0)
    const weight = parseFloat(grade.peso || grade.weight || 1)

    if (!isNaN(value) && !isNaN(weight)) {
      weightedSum += value * weight
      totalWeight += weight
    }
  })

  if (totalWeight === 0) return 0

  return Math.round((weightedSum / totalWeight) * 100) / 100
}

/**
 * Verificar si una calificación es aprobatoria
 * @param {number} grade - Calificación numérica
 * @returns {boolean} True si está aprobado
 */
export const isGradeApproved = (grade) => {
  const numericGrade = parseFloat(grade)
  if (isNaN(numericGrade)) return false
  return numericGrade >= GradingSystemConfig.PASSING_GRADE
}

/**
 * Convertir calificación literal a numérica
 * @param {string} letterGrade - Calificación literal (AD, A, B, C)
 * @returns {number} Valor numérico promedio del rango
 */
export const convertGradeToNumeric = (letterGrade) => {
  const gradeConfig = GradingSystemConfig.LETTER_GRADES[letterGrade?.toUpperCase()]

  if (!gradeConfig) {
    return 0
  }

  // Retornar el punto medio del rango
  return (gradeConfig.min + gradeConfig.max) / 2
}

/**
 * Convertir calificación numérica a literal
 * @param {number} numericGrade - Calificación numérica
 * @returns {string} Calificación literal (AD, A, B, C)
 */
export const convertNumericToLetterGrade = (numericGrade) => {
  const grade = parseFloat(numericGrade)

  if (isNaN(grade)) {
    return 'C'
  }

  for (const [letter, config] of Object.entries(GradingSystemConfig.LETTER_GRADES)) {
    if (grade >= config.min && grade <= config.max) {
      return letter
    }
  }

  return 'C'
}

/**
 * Obtener descripción de una calificación literal
 * @param {string} letterGrade - Calificación literal
 * @returns {string} Descripción de la calificación
 */
export const getGradeDescription = (letterGrade) => {
  const gradeConfig = GradingSystemConfig.LETTER_GRADES[letterGrade?.toUpperCase()]
  return gradeConfig?.description || 'Sin calificación'
}

/**
 * Obtener color de una calificación literal
 * @param {string} letterGrade - Calificación literal
 * @returns {Object} { color, bgColor }
 */
export const getGradeColor = (letterGrade) => {
  const gradeConfig = GradingSystemConfig.LETTER_GRADES[letterGrade?.toUpperCase()]
  return {
    color: gradeConfig?.color || 'text-gray-600',
    bgColor: gradeConfig?.bgColor || 'bg-gray-50'
  }
}

/**
 * Obtener sistema de calificación según nivel educativo
 * @param {string} level - Nivel educativo (inicial, primaria, secundaria)
 * @returns {string} Sistema de calificación ('NUMERIC' o 'LETTER')
 */
export const getGradingSystemByLevel = (level) => {
  return GradingSystemConfig.LEVEL_GRADING_SYSTEMS[level?.toLowerCase()] || 'NUMERIC'
}

/**
 * Calcular promedio de competencias
 * @param {Array} competencyGrades - Calificaciones de competencias
 * @returns {number} Promedio de competencias
 */
export const calculateCompetencyAverage = (competencyGrades) => {
  if (!competencyGrades || !Array.isArray(competencyGrades) || competencyGrades.length === 0) {
    return 0
  }

  const validGrades = competencyGrades
    .map(g => parseFloat(g.valor || g.value || 0))
    .filter(v => !isNaN(v) && v > 0)

  if (validGrades.length === 0) return 0

  const sum = validGrades.reduce((acc, val) => acc + val, 0)
  return Math.round((sum / validGrades.length) * 100) / 100
}

/**
 * Formatear calificación para visualización
 * @param {number|string} grade - Calificación
 * @param {string} gradingSystem - Sistema de calificación
 * @returns {string} Calificación formateada
 */
export const formatGrade = (grade, gradingSystem = 'NUMERIC') => {
  if (grade === null || grade === undefined || grade === '') {
    return '-'
  }

  if (gradingSystem === 'NUMERIC') {
    const numericGrade = parseFloat(grade)
    return isNaN(numericGrade) ? '-' : numericGrade.toFixed(1)
  }

  return grade.toString().toUpperCase()
}
