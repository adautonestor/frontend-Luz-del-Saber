/**
 * Store Zustand para Escalas de Calificación
 *
 * SINGLE SOURCE OF TRUTH (SSOT) para todas las conversiones de notas.
 * La configuración se carga desde /api/system-settings/grading-scales
 * y se almacena en este store para acceso síncrono en toda la aplicación.
 *
 * USO:
 * - En componentes: usar el hook useGradingScalesStore()
 * - Fuera de componentes: usar getGradingScalesStore() para acceso directo
 */

import { create } from 'zustand'
import gradingScalesService from '../services/gradingScalesService'

/**
 * Configuración por defecto (fallback si la API no responde)
 * Escala MINEDU estándar: A=4, B=3, C=2, D=1
 */
const DEFAULT_LETTER_SCALE = [
  { value: 'A', label: 'Logro destacado', numericValue: 4, color: '#22c55e', order: 1 },
  { value: 'B', label: 'Logro esperado', numericValue: 3, color: '#3b82f6', order: 2 },
  { value: 'C', label: 'En proceso', numericValue: 2, color: '#eab308', order: 3 },
  { value: 'D', label: 'En inicio', numericValue: 1, color: '#ef4444', order: 4 }
]

const DEFAULT_NUMERIC_CONFIG = {
  type: 'numeric',
  minValue: 0,
  maxValue: 20,
  passingGrade: 11,
  ranges: [
    { min: 18, max: 20, label: 'Logro destacado', color: '#22c55e', order: 1 },
    { min: 14, max: 17, label: 'Logro esperado', color: '#3b82f6', order: 2 },
    { min: 11, max: 13, label: 'En proceso', color: '#eab308', order: 3 },
    { min: 0, max: 10, label: 'En inicio', color: '#ef4444', order: 4 }
  ]
}

const DEFAULT_CONFIG = {
  academic_year_id: null,
  locked_levels: [],
  levels: {}
}

/**
 * Store de escalas de calificación
 */
const useGradingScalesStore = create((set, get) => ({
  // Estado
  config: DEFAULT_CONFIG,
  isLoading: false,
  isLoaded: false,
  error: null,

  /**
   * Cargar configuración desde la API
   * @param {number|string} academicYearId - ID del año académico o 'active'
   */
  loadConfig: async (academicYearId = 'active') => {
    // Si ya está cargado y no hay error, no recargar
    if (get().isLoaded && !get().error) {
      return get().config
    }

    set({ isLoading: true, error: null })

    try {
      const result = await gradingScalesService.getGradingScalesConfig(academicYearId)

      if (result && result.levels) {
        set({
          config: result,
          isLoading: false,
          isLoaded: true,
          error: null
        })
        return result
      } else {
        // Si no hay configuración, construir una por defecto
        const defaultConfig = buildDefaultConfig()
        set({
          config: defaultConfig,
          isLoading: false,
          isLoaded: true,
          error: null
        })
        return defaultConfig
      }
    } catch (error) {
      console.error('[GradingScalesStore] Error loading config:', error)
      const defaultConfig = buildDefaultConfig()
      set({
        config: defaultConfig,
        isLoading: false,
        isLoaded: true,
        error: error.message
      })
      return defaultConfig
    }
  },

  /**
   * Forzar recarga de la configuración
   */
  reloadConfig: async (academicYearId = 'active') => {
    set({ isLoaded: false })
    return get().loadConfig(academicYearId)
  },

  /**
   * Obtener configuración de escala para un nivel
   * @param {number} levelId - ID del nivel
   * @returns {Object|null} Configuración del nivel
   */
  getScaleForLevel: (levelId) => {
    const { config } = get()
    if (!config?.levels) return null
    return config.levels[levelId] || config.levels[String(levelId)] || null
  },

  /**
   * Convertir valor numérico a letra
   * @param {number} value - Valor numérico (ej: 3.5)
   * @param {number} levelId - ID del nivel (opcional, usa fallback si no se proporciona)
   * @returns {string} Letra (A, B, C, D)
   */
  convertNumericToLetter: (value, levelId = null) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '-'
    }

    const numValue = parseFloat(value)
    const levelConfig = levelId ? get().getScaleForLevel(levelId) : null

    // Si hay configuración de nivel y es tipo letters
    if (levelConfig?.type === 'letters' && levelConfig?.scale) {
      // Ordenar por numericValue descendente
      const sortedScale = [...levelConfig.scale].sort((a, b) => b.numericValue - a.numericValue)

      for (const item of sortedScale) {
        if (numValue >= item.numericValue) {
          return item.value
        }
      }
      // Si es menor que todos, retornar el último
      return sortedScale[sortedScale.length - 1]?.value || 'D'
    }

    // Fallback: usar escala por defecto MINEDU
    // A >= 4, B >= 3, C >= 2, D < 2
    if (numValue >= 4.0) return 'A'
    if (numValue >= 3.0) return 'B'
    if (numValue >= 2.0) return 'C'
    return 'D'
  },

  /**
   * Convertir letra a valor numérico
   * @param {string} letter - Letra (A, B, C, D)
   * @param {number} levelId - ID del nivel (opcional)
   * @returns {number|null} Valor numérico
   */
  convertLetterToNumeric: (letter, levelId = null) => {
    if (!letter || letter === '-' || letter === '--') {
      return null
    }

    const upperLetter = String(letter).toUpperCase()
    const levelConfig = levelId ? get().getScaleForLevel(levelId) : null

    // Si hay configuración de nivel
    if (levelConfig?.type === 'letters' && levelConfig?.scale) {
      const gradeItem = levelConfig.scale.find(
        item => item.value.toUpperCase() === upperLetter
      )
      if (gradeItem) {
        return gradeItem.numericValue
      }
    }

    // Fallback: escala por defecto MINEDU
    const defaults = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
    return defaults[upperLetter] || null
  },

  /**
   * Obtener color para una calificación
   * @param {string|number} value - Valor de calificación
   * @param {number} levelId - ID del nivel (opcional)
   * @returns {string} Color hexadecimal
   */
  getGradeColor: (value, levelId = null) => {
    if (value === null || value === undefined || value === '-' || value === '--') {
      return '#9ca3af' // gray
    }

    const levelConfig = levelId ? get().getScaleForLevel(levelId) : null

    // Si es letra
    if (typeof value === 'string' && ['A', 'B', 'C', 'D'].includes(value.toUpperCase())) {
      if (levelConfig?.type === 'letters' && levelConfig?.scale) {
        const gradeItem = levelConfig.scale.find(
          item => item.value.toUpperCase() === value.toUpperCase()
        )
        if (gradeItem?.color) {
          return gradeItem.color
        }
      }
      // Fallback
      const colorMap = { 'A': '#22c55e', 'B': '#3b82f6', 'C': '#eab308', 'D': '#ef4444' }
      return colorMap[value.toUpperCase()] || '#9ca3af'
    }

    // Si es numérico
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      if (levelConfig?.type === 'numeric' && levelConfig?.ranges) {
        for (const range of levelConfig.ranges) {
          if (numValue >= range.min && numValue <= range.max) {
            return range.color
          }
        }
      }
      // Fallback para numérico
      if (numValue >= 17) return '#22c55e'
      if (numValue >= 14) return '#3b82f6'
      if (numValue >= 11) return '#eab308'
      return '#ef4444'
    }

    return '#9ca3af'
  },

  /**
   * Obtener clases CSS de color para una calificación
   * @param {string|number} value - Valor de calificación
   * @param {number} levelId - ID del nivel (opcional)
   * @returns {string} Clases CSS de Tailwind
   */
  getGradeColorClasses: (value, levelId = null) => {
    if (value === null || value === undefined || value === '-' || value === '--') {
      return 'bg-gray-100 text-gray-500'
    }

    // Si es letra
    if (typeof value === 'string') {
      const upper = value.toUpperCase()
      if (upper === 'A') return 'bg-green-100 text-green-800'
      if (upper === 'B') return 'bg-blue-100 text-blue-800'
      if (upper === 'C') return 'bg-yellow-100 text-yellow-800'
      if (upper === 'D') return 'bg-red-100 text-red-800'
    }

    // Si es numérico, primero convertir a letra
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      // Para escala literal (1-4)
      if (numValue <= 4) {
        const letter = get().convertNumericToLetter(numValue, levelId)
        return get().getGradeColorClasses(letter, levelId)
      }
      // Para escala vigesimal (0-20)
      if (numValue >= 17) return 'bg-green-100 text-green-800'
      if (numValue >= 14) return 'bg-blue-100 text-blue-800'
      if (numValue >= 11) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    }

    return 'bg-gray-100 text-gray-500'
  },

  /**
   * Verificar si una calificación es aprobatoria
   * @param {string|number} value - Valor de calificación
   * @param {number} levelId - ID del nivel (opcional)
   * @returns {boolean}
   */
  isPassingGrade: (value, levelId = null) => {
    if (value === null || value === undefined || value === '-' || value === '--') {
      return false
    }

    const levelConfig = levelId ? get().getScaleForLevel(levelId) : null

    // Si es letra
    if (typeof value === 'string' && ['A', 'B', 'C', 'D'].includes(value.toUpperCase())) {
      const numericValue = get().convertLetterToNumeric(value, levelId)
      const passingNumeric = levelConfig?.passingNumericValue || 3 // B por defecto
      return numericValue !== null && numericValue >= passingNumeric
    }

    // Si es numérico
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      if (levelConfig?.type === 'numeric') {
        return numValue >= (levelConfig.passingGrade || 11)
      }
      // Para escala literal (1-4)
      if (numValue <= 4) {
        return numValue >= (levelConfig?.passingNumericValue || 3)
      }
      // Para vigesimal
      return numValue >= 11
    }

    return false
  },

  /**
   * Formatear calificación para mostrar
   * @param {string|number} value - Valor de calificación
   * @param {string} gradingSystem - 'literal' o 'vigesimal'/'numeric'
   * @param {number} levelId - ID del nivel (opcional)
   * @returns {string} Valor formateado
   */
  formatGrade: (value, gradingSystem = 'literal', levelId = null) => {
    if (value === null || value === undefined || value === '' || value === '-') {
      return '--'
    }

    // Si es sistema literal
    if (gradingSystem === 'literal') {
      // Si ya es letra, retornarla
      if (typeof value === 'string' && ['A', 'B', 'C', 'D'].includes(value.toUpperCase())) {
        return value.toUpperCase()
      }
      // Si es número (valor de promedio 0-4), convertir a letra
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 4) {
        return get().convertNumericToLetter(numValue, levelId)
      }
      return '--'
    }

    // Si es sistema numérico/vigesimal
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      return numValue.toFixed(1)
    }

    return '--'
  },

  /**
   * Obtener tipo de escala para un nivel
   * @param {number} levelId - ID del nivel
   * @returns {'letters'|'numeric'}
   */
  getScaleType: (levelId) => {
    const levelConfig = get().getScaleForLevel(levelId)
    return levelConfig?.type || 'letters'
  }
}))

/**
 * Construir configuración por defecto
 */
function buildDefaultConfig() {
  // IDs de niveles según la BD: Inicial=5, Primaria=6, Secundaria=7
  return {
    academic_year_id: null,
    locked_levels: [],
    levels: {
      5: {
        level_id: 5,
        level_name: 'Inicial',
        level_code: 'INI',
        type: 'letters',
        scale: [...DEFAULT_LETTER_SCALE],
        passingGrade: 'B',
        passingNumericValue: 3
      },
      6: {
        level_id: 6,
        level_name: 'Primaria',
        level_code: 'PRI',
        type: 'letters',
        scale: [...DEFAULT_LETTER_SCALE],
        passingGrade: 'B',
        passingNumericValue: 3
      },
      7: {
        level_id: 7,
        level_name: 'Secundaria',
        level_code: 'SEC',
        ...DEFAULT_NUMERIC_CONFIG
      }
    }
  }
}

/**
 * Acceso directo al store (para uso fuera de componentes React)
 * @returns {Object} Estado y funciones del store
 */
export const getGradingScalesStore = () => useGradingScalesStore.getState()

export default useGradingScalesStore
