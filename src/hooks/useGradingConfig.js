import { useState, useEffect, useCallback } from 'react'
import gradingScalesService from '../services/gradingScalesService'

/**
 * Hook para obtener la configuración de calificaciones desde system_settings
 * ACTUALIZADO: Ahora usa la nueva API /api/system-settings/grading-scales
 * Mantiene compatibilidad con la interfaz anterior (usando nombres de nivel)
 */
export const useGradingConfig = () => {
  const [gradingConfig, setGradingConfig] = useState(null)
  const [rawConfig, setRawConfig] = useState(null) // Config original de la API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar configuración al montar
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        // Usar la nueva API de escalas de calificación
        console.log('[useGradingConfig] Cargando configuración desde API...')
        const result = await gradingScalesService.getGradingScalesConfig('active')
        console.log('[useGradingConfig] Respuesta de API:', result)

        if (result && result.levels) {
          console.log('[useGradingConfig] ✅ Configuración cargada con niveles:', Object.keys(result.levels))
          setRawConfig(result)
          // Convertir el formato nuevo al formato antiguo para compatibilidad
          const convertedConfig = convertToLegacyFormat(result)
          console.log('[useGradingConfig] Configuración convertida a legacy:', convertedConfig)
          setGradingConfig(convertedConfig)
        } else {
          console.log('[useGradingConfig] ⚠️ No hay niveles en la respuesta, usando defaults')
          setGradingConfig(getDefaultConfig())
        }
      } catch (err) {
        console.error('[useGradingConfig] ❌ Error loading grading config:', err)
        setError(err)
        // Usar configuración por defecto si falla
        setGradingConfig(getDefaultConfig())
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  /**
   * Obtiene el sistema de calificación para un nivel específico
   * @param {string} levelName - Nombre del nivel ('Inicial', 'Primaria', 'Secundaria')
   * @returns {Object} Configuración del sistema de calificación
   */
  const getGradingSystemForLevel = useCallback((levelName) => {
    if (!levelName) return getDefaultConfig().inicial

    const levelKey = levelName.toLowerCase()

    if (gradingConfig && gradingConfig[levelKey]) {
      return gradingConfig[levelKey]
    }

    // Si no hay configuración, usar valores por defecto
    return getDefaultConfig()[levelKey] || getDefaultConfig().inicial
  }, [gradingConfig])

  /**
   * Determina si el nivel usa calificación numérica o por letras
   * @param {string} levelName - Nombre del nivel
   * @returns {string} 'numeric' o 'literal'
   */
  const getGradingMode = useCallback((levelName) => {
    const config = getGradingSystemForLevel(levelName)
    return config?.type === 'numeric' ? 'numeric' : 'literal'
  }, [getGradingSystemForLevel])

  /**
   * Obtiene la escala de calificación para un nivel
   * @param {string} levelName - Nombre del nivel
   * @returns {Array|Object} Escala (array para letras, objeto {min, max} para numérico)
   */
  const getScaleForLevel = useCallback((levelName) => {
    const config = getGradingSystemForLevel(levelName)
    return config?.scale || ['A', 'B', 'C', 'D']
  }, [getGradingSystemForLevel])

  /**
   * Obtiene la calificación aprobatoria para un nivel
   * @param {string} levelName - Nombre del nivel
   * @returns {string|number} Calificación mínima aprobatoria
   */
  const getPassingGradeForLevel = useCallback((levelName) => {
    const config = getGradingSystemForLevel(levelName)
    return config?.passingGrade || (config?.type === 'numeric' ? 11 : 'B')
  }, [getGradingSystemForLevel])

  /**
   * Obtiene las descripciones de cada calificación para un nivel
   * @param {string} levelName - Nombre del nivel
   * @returns {Object} Mapa de calificación -> descripción
   */
  const getDescriptionsForLevel = useCallback((levelName) => {
    const config = getGradingSystemForLevel(levelName)
    return config?.descriptions || {
      'A': 'Logro destacado',
      'B': 'Logro esperado',
      'C': 'En proceso',
      'D': 'En inicio'
    }
  }, [getGradingSystemForLevel])

  /**
   * Valida si una calificación está aprobada según la configuración del nivel
   * @param {string|number} grade - Calificación a validar
   * @param {string} levelName - Nombre del nivel
   * @returns {boolean} true si está aprobada
   */
  const isGradePassing = useCallback((grade, levelName) => {
    if (grade === null || grade === undefined || grade === '' || grade === '-') {
      return false
    }

    const config = getGradingSystemForLevel(levelName)
    const passingGrade = config?.passingGrade

    if (config?.type === 'numeric') {
      const numericGrade = parseFloat(grade)
      const numericPassing = parseFloat(passingGrade) || 11
      return !isNaN(numericGrade) && numericGrade >= numericPassing
    } else {
      // Para letras, comparar posición en la escala
      const scale = config?.scale || ['A', 'B', 'C', 'D']
      const gradeIndex = scale.indexOf(String(grade).toUpperCase())
      const passingIndex = scale.indexOf(String(passingGrade).toUpperCase())

      // Menor índice = mejor nota (A=0, B=1, etc.)
      return gradeIndex !== -1 && gradeIndex <= passingIndex
    }
  }, [getGradingSystemForLevel])

  /**
   * Obtiene las opciones de calificación válidas para un nivel
   * @param {string} levelName - Nombre del nivel
   * @returns {Array} Array de opciones válidas
   */
  const getValidGradeOptions = useCallback((levelName) => {
    const config = getGradingSystemForLevel(levelName)

    if (config?.type === 'numeric') {
      const min = config?.scale?.min || 0
      const max = config?.scale?.max || 20
      return { type: 'numeric', min, max }
    } else {
      return { type: 'letters', options: config?.scale || ['A', 'B', 'C', 'D'] }
    }
  }, [getGradingSystemForLevel])

  /**
   * Obtiene las opciones completas de escala literal para un nivel POR ID
   * Esta es la función PREFERIDA - usa el ID exacto del nivel para evitar ambigüedades
   * Formato para ExcelGradeCell: [{ value, label, numericValue, color }]
   * @param {number} levelId - ID del nivel (ej: 6 para Primaria del año actual)
   * @returns {Array} Array de opciones con formato completo
   */
  const getLiteralGradeOptionsByLevelId = useCallback((levelId) => {
    console.log('[useGradingConfig] getLiteralGradeOptionsByLevelId llamado con ID:', levelId)

    if (!levelId || !rawConfig?.levels) {
      console.log('[useGradingConfig] Retornando defaults porque no hay levelId o rawConfig.levels')
      return getDefaultLiteralOptions()
    }

    // Buscar directamente por ID (más preciso que por nombre)
    const levelConfig = rawConfig.levels[levelId] || rawConfig.levels[String(levelId)]

    if (levelConfig) {
      console.log(`[useGradingConfig] ✅ Encontrado nivel ID ${levelId}:`, levelConfig.level_name, 'tipo:', levelConfig.type)

      if (levelConfig.type === 'letters' && levelConfig.scale) {
        const result = levelConfig.scale.map(item => ({
          value: item.value,
          label: item.label || item.value,
          numericValue: item.numericValue,
          color: item.color || '#9ca3af'
        }))
        console.log('[useGradingConfig] Escala por ID:', result)
        return result
      }
    }

    console.log(`[useGradingConfig] ❌ No se encontró nivel con ID ${levelId}, retornando defaults`)
    return getDefaultLiteralOptions()
  }, [rawConfig])

  /**
   * Obtiene las opciones completas de escala literal para un nivel POR NOMBRE
   * DEPRECATED: Usar getLiteralGradeOptionsByLevelId cuando sea posible
   * @param {string} levelName - Nombre del nivel
   * @returns {Array} Array de opciones con formato completo
   */
  const getLiteralGradeOptionsForLevel = useCallback((levelName) => {
    console.log('[useGradingConfig] getLiteralGradeOptionsForLevel (por nombre) llamado con:', levelName)

    if (!levelName || !rawConfig?.levels) {
      console.log('[useGradingConfig] Retornando defaults porque no hay rawConfig.levels')
      return getDefaultLiteralOptions()
    }

    const levelKey = levelName.toLowerCase()

    // Buscar la configuración del nivel en rawConfig
    for (const [levelId, levelConfig] of Object.entries(rawConfig.levels)) {
      const configLevelName = (levelConfig.level_name || '').toLowerCase()
      const configLevelCode = (levelConfig.level_code || '').toLowerCase()

      // Verificar si coincide el nivel
      const isMatch =
        configLevelName.includes(levelKey) ||
        levelKey.includes(configLevelName) ||
        (levelKey === 'inicial' && (configLevelName.includes('inicial') || configLevelCode === 'ini')) ||
        (levelKey === 'primaria' && (configLevelName.includes('primaria') || configLevelCode === 'pri')) ||
        (levelKey === 'secundaria' && (configLevelName.includes('secundaria') || configLevelCode === 'sec'))

      if (isMatch && levelConfig.type === 'letters' && levelConfig.scale) {
        const result = levelConfig.scale.map(item => ({
          value: item.value,
          label: item.label || item.value,
          numericValue: item.numericValue,
          color: item.color || '#9ca3af'
        }))
        return result
      }
    }

    return getDefaultLiteralOptions()
  }, [rawConfig])

  return {
    gradingConfig,
    rawConfig,
    loading,
    error,
    getGradingSystemForLevel,
    getGradingMode,
    getScaleForLevel,
    getPassingGradeForLevel,
    getDescriptionsForLevel,
    isGradePassing,
    getValidGradeOptions,
    getLiteralGradeOptionsForLevel,
    getLiteralGradeOptionsByLevelId // Nueva función preferida (busca por ID)
  }
}

/**
 * Convierte la configuración del nuevo formato de API al formato legacy
 * para mantener compatibilidad con componentes existentes
 * @param {Object} newConfig - Configuración del nuevo API
 * @returns {Object} Configuración en formato legacy
 */
function convertToLegacyFormat(newConfig) {
  const legacy = {}

  if (!newConfig?.levels) return getDefaultConfig()

  for (const [levelId, levelConfig] of Object.entries(newConfig.levels)) {
    // Determinar la clave legacy basada en el nombre/código del nivel
    const levelName = (levelConfig.level_name || '').toLowerCase()
    const levelCode = (levelConfig.level_code || '').toLowerCase()

    let legacyKey = 'otros'
    if (levelName.includes('inicial') || levelCode === 'ini') {
      legacyKey = 'inicial'
    } else if (levelName.includes('primaria') || levelCode === 'pri') {
      legacyKey = 'primaria'
    } else if (levelName.includes('secundaria') || levelCode === 'sec') {
      legacyKey = 'secundaria'
    }

    // Convertir al formato legacy
    if (levelConfig.type === 'letters') {
      const scale = (levelConfig.scale || []).map(item => item.value)
      const descriptions = {}
      for (const item of (levelConfig.scale || [])) {
        descriptions[item.value] = item.label
      }

      legacy[legacyKey] = {
        type: 'letters',
        scale,
        passingGrade: levelConfig.passingGrade || 'B',
        descriptions,
        // Agregar datos adicionales para nuevas funcionalidades
        _levelId: parseInt(levelId),
        _numericValues: levelConfig.scale?.reduce((acc, item) => {
          acc[item.value] = item.numericValue
          return acc
        }, {}) || {}
      }
    } else if (levelConfig.type === 'numeric') {
      const descriptions = {}
      for (const range of (levelConfig.ranges || [])) {
        descriptions[`${range.min}-${range.max}`] = range.label
      }

      legacy[legacyKey] = {
        type: 'numeric',
        scale: {
          min: levelConfig.minValue || 0,
          max: levelConfig.maxValue || 20
        },
        passingGrade: levelConfig.passingGrade || 11,
        descriptions,
        _levelId: parseInt(levelId),
        _ranges: levelConfig.ranges || []
      }
    }
  }

  // Asegurar que existan las claves esperadas
  if (!legacy.inicial) legacy.inicial = getDefaultConfig().inicial
  if (!legacy.primaria) legacy.primaria = getDefaultConfig().primaria
  if (!legacy.secundaria) legacy.secundaria = getDefaultConfig().secundaria

  return legacy
}

/**
 * Configuración por defecto si no se puede cargar de system_settings
 * Usa los valores del servicio centralizado
 */
function getDefaultConfig() {
  return {
    inicial: {
      type: 'letters',
      scale: ['A', 'B', 'C', 'D'],
      passingGrade: 'B',
      descriptions: {
        'A': 'Logro destacado',
        'B': 'Logro esperado',
        'C': 'En proceso',
        'D': 'En inicio'
      },
      _numericValues: { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
    },
    primaria: {
      type: 'letters',
      scale: ['A', 'B', 'C', 'D'],
      passingGrade: 'B',
      descriptions: {
        'A': 'Logro destacado',
        'B': 'Logro esperado',
        'C': 'En proceso',
        'D': 'En inicio'
      },
      _numericValues: { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
    },
    secundaria: {
      type: 'numeric',
      scale: { min: 0, max: 20 },
      passingGrade: 11,
      descriptions: {
        '18-20': 'Logro destacado',
        '14-17': 'Logro esperado',
        '11-13': 'En proceso',
        '0-10': 'En inicio'
      },
      _ranges: [
        { min: 18, max: 20, label: 'Logro destacado', color: '#22c55e' },
        { min: 14, max: 17, label: 'Logro esperado', color: '#3b82f6' },
        { min: 11, max: 13, label: 'En proceso', color: '#eab308' },
        { min: 0, max: 10, label: 'En inicio', color: '#ef4444' }
      ]
    }
  }
}

/**
 * Opciones por defecto para escala literal (A, B, C, D)
 * Formato para ExcelGradeCell
 */
function getDefaultLiteralOptions() {
  return [
    { value: 'A', label: 'Logro destacado', numericValue: 4, color: '#22c55e' },
    { value: 'B', label: 'Logro esperado', numericValue: 3, color: '#3b82f6' },
    { value: 'C', label: 'En proceso', numericValue: 2, color: '#eab308' },
    { value: 'D', label: 'En inicio', numericValue: 1, color: '#ef4444' }
  ]
}

export default useGradingConfig
