/**
 * Hook para acceso a escalas de calificación
 *
 * SINGLE SOURCE OF TRUTH (SSOT):
 * Este hook es un wrapper del gradingScalesStore que provee acceso
 * a la configuración dinámica de escalas.
 *
 * @module hooks/useGradingScales
 */

import { useEffect, useCallback } from 'react'
import useGradingScalesStore from '../stores/gradingScalesStore'

/**
 * Hook centralizado para escalas de calificación
 * @param {number} academicYearId - ID del año académico (opcional, usa el activo por defecto)
 * @returns {Object} Funciones y estado para manejar escalas
 */
export const useGradingScales = (academicYearId = null) => {
  // Obtener estado y funciones del store
  const {
    config,
    isLoading: loading,
    isLoaded,
    error,
    loadConfig,
    reloadConfig,
    getScaleForLevel,
    convertNumericToLetter,
    convertLetterToNumeric,
    getGradeColor,
    getGradeColorClasses,
    isPassingGrade,
    formatGrade,
    getScaleType
  } = useGradingScalesStore()

  // Cargar configuración al montar
  useEffect(() => {
    if (!isLoaded) {
      loadConfig(academicYearId || 'active')
    }
  }, [academicYearId, isLoaded, loadConfig])

  /**
   * Obtiene la configuración de escala para un nivel por nombre
   */
  const getScaleByLevelName = useCallback((levelName) => {
    if (!config?.levels || !levelName) return null

    const normalizedName = levelName.toLowerCase().trim()

    for (const [levelId, levelConfig] of Object.entries(config.levels)) {
      const configName = (levelConfig.level_name || '').toLowerCase()
      const configCode = (levelConfig.level_code || '').toLowerCase()

      if (configName.includes(normalizedName) ||
          normalizedName.includes(configName) ||
          configCode === normalizedName.substring(0, 3)) {
        return levelConfig
      }
    }

    return null
  }, [config])

  /**
   * Valida si un valor es válido para el nivel
   */
  const validateGradeValue = useCallback((value, levelId) => {
    const levelConfig = getScaleForLevel(levelId)

    if (!levelConfig) {
      return { isValid: false, message: 'Nivel no configurado' }
    }

    if (levelConfig.type === 'letters') {
      const validLetters = (levelConfig.scale || []).map(item => item.value.toUpperCase())
      const upperValue = String(value).toUpperCase()

      if (validLetters.includes(upperValue)) {
        return { isValid: true, message: 'Valor válido' }
      }
      return {
        isValid: false,
        message: `Valor inválido. Valores permitidos: ${validLetters.join(', ')}`
      }
    }

    if (levelConfig.type === 'numeric') {
      const numValue = parseFloat(value)

      if (isNaN(numValue)) {
        return { isValid: false, message: 'El valor debe ser numérico' }
      }

      const min = levelConfig.minValue || 0
      const max = levelConfig.maxValue || 20

      if (numValue < min || numValue > max) {
        return {
          isValid: false,
          message: `El valor debe estar entre ${min} y ${max}`
        }
      }

      return { isValid: true, message: 'Valor válido' }
    }

    return { isValid: false, message: 'Tipo de escala no reconocido' }
  }, [getScaleForLevel])

  /**
   * Verifica si un nivel está bloqueado
   */
  const isLevelLocked = useCallback((levelId) => {
    const lockedLevels = config?.locked_levels || []
    return lockedLevels.includes(levelId) || lockedLevels.includes(String(levelId))
  }, [config])

  /**
   * Obtiene las opciones válidas de calificación para un nivel
   */
  const getGradeOptions = useCallback((levelId) => {
    const levelConfig = getScaleForLevel(levelId)

    if (!levelConfig) {
      return { type: 'letters', options: ['A', 'B', 'C', 'D'] }
    }

    if (levelConfig.type === 'letters') {
      return {
        type: 'letters',
        options: (levelConfig.scale || []).map(item => ({
          value: item.value,
          label: item.label,
          numericValue: item.numericValue,
          color: item.color
        }))
      }
    }

    if (levelConfig.type === 'numeric') {
      return {
        type: 'numeric',
        min: levelConfig.minValue || 0,
        max: levelConfig.maxValue || 20,
        passingGrade: levelConfig.passingGrade || 11,
        ranges: levelConfig.ranges || []
      }
    }

    return { type: 'letters', options: ['A', 'B', 'C', 'D'] }
  }, [getScaleForLevel])

  /**
   * Determina el modo de calificación para un nivel
   */
  const getGradingMode = useCallback((levelId) => {
    return getScaleType(levelId) === 'numeric' ? 'numeric' : 'literal'
  }, [getScaleType])

  // Lista de niveles disponibles
  const availableLevels = config?.levels
    ? Object.entries(config.levels).map(([id, levelConfig]) => ({
        id: parseInt(id),
        name: levelConfig.level_name,
        code: levelConfig.level_code,
        type: levelConfig.type,
        isLocked: isLevelLocked(id)
      }))
    : []

  return {
    // Estado
    config,
    loading,
    error,
    availableLevels,
    lockedLevels: config?.locked_levels || [],

    // Funciones de consulta
    getScaleForLevel,
    getScaleByLevelName,
    getGradeOptions,
    getGradingMode,

    // Funciones de conversión
    convertLetterToNumeric,
    convertNumericToLetter,

    // Funciones de validación
    validateGradeValue,
    isPassingGrade,
    isLevelLocked,

    // Funciones de UI
    getGradeColor,
    getGradeColorClasses,
    formatGrade,

    // Acciones
    reloadConfig: () => reloadConfig(academicYearId || 'active')
  }
}

export default useGradingScales
