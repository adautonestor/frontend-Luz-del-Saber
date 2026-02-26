import React from 'react'
import { Plus, Trash2, Lock, Loader2 } from 'lucide-react'

/**
 * Componente reutilizable para configurar sistemas de calificación
 * Soporta niveles dinámicos desde la base de datos
 * Incluye indicador de bloqueo cuando hay notas registradas
 */
const GradingSystemCard = ({
  levelId,        // ID numérico del nivel (ej: 1, 2, 3)
  levelCode,      // Código del nivel (ej: 'INI', 'PRI', 'SEC')
  title,          // Nombre del nivel para mostrar
  settings,
  setSettings,
  isLocked = false,       // Si el nivel está bloqueado (tiene notas)
  isCheckingLock = false  // Si está verificando el estado de bloqueo
}) => {
  // Mapeo de códigos legacy a claves antiguas para retrocompatibilidad
  const legacyCodeMap = {
    'INI': 'inicial',
    'PRI': 'primaria',
    'SEC': 'secundaria'
  }

  // Determinar la clave a usar: primero busca por ID, luego por código legacy, luego por código original
  const getGradingSystemKey = () => {
    const gradingSystems = settings.academic?.gradingSystems || {}

    // 1. Buscar por ID numérico (nuevo sistema)
    if (gradingSystems[levelId]) {
      return levelId
    }

    // 2. Buscar por código legacy (inicial, primaria, secundaria)
    const legacyKey = legacyCodeMap[levelCode]
    if (legacyKey && gradingSystems[legacyKey]) {
      return legacyKey
    }

    // 3. Buscar por código original en minúsculas
    const lowerCode = levelCode?.toLowerCase()
    if (lowerCode && gradingSystems[lowerCode]) {
      return lowerCode
    }

    // 4. Si no existe, usar el ID para crear uno nuevo
    return levelId
  }

  const gradingSystemKey = getGradingSystemKey()

  // Valores por defecto para un nuevo nivel
  const defaultGradingSystem = {
    type: 'letters',
    scale: ['A', 'B', 'C', 'D'],
    passingGrade: 'B',
    descriptions: {
      'A': 'Logro destacado',
      'B': 'Logro esperado',
      'C': 'En proceso',
      'D': 'En inicio'
    },
    numericValues: { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
  }

  // Obtener el gradingSystem actual o usar valores por defecto
  const gradingSystem = settings.academic?.gradingSystems?.[gradingSystemKey] || defaultGradingSystem

  const updateGradingSystem = (updates) => {
    setSettings({
      ...settings,
      academic: {
        ...settings.academic,
        gradingSystems: {
          ...settings.academic.gradingSystems,
          [gradingSystemKey]: {
            ...gradingSystem,
            ...updates
          }
        }
      }
    })
  }

  /**
   * Maneja el cambio de tipo de escala (numérico vs letras)
   * NOTA: Los valores por defecto aquí son fallbacks. La configuración principal
   * se sincroniza con /api/system-settings/grading-scales
   * Escala literal usa valores numéricos: A=4, B=3, C=2, D=1
   */
  const handleTypeChange = (newType) => {
    const defaultValues = newType === 'numeric' ? {
      type: newType,
      scale: { min: 0, max: 20 },
      passingGrade: 11,
      descriptions: {
        '18-20': 'Logro destacado',
        '14-17': 'Logro esperado',
        '11-13': 'En proceso',
        '0-10': 'En inicio'
      }
    } : {
      type: newType,
      scale: ['A', 'B', 'C', 'D'],
      passingGrade: 'B',
      descriptions: {
        'A': 'Logro destacado',
        'B': 'Logro esperado',
        'C': 'En proceso',
        'D': 'En inicio'
      },
      // Valores numéricos consistentes para cálculo de promedios
      numericValues: { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
    }

    updateGradingSystem(defaultValues)
  }

  const handleScaleChange = (index, value) => {
    const newScale = [...gradingSystem.scale]
    const oldGrade = newScale[index]
    newScale[index] = value

    const newDescriptions = {...gradingSystem.descriptions}
    if (oldGrade !== value && newDescriptions[oldGrade]) {
      newDescriptions[value] = newDescriptions[oldGrade]
      delete newDescriptions[oldGrade]
    }

    // También actualizar numericValues si existe
    const newNumericValues = {...(gradingSystem.numericValues || {})}
    if (oldGrade !== value && newNumericValues[oldGrade] !== undefined) {
      newNumericValues[value] = newNumericValues[oldGrade]
      delete newNumericValues[oldGrade]
    }

    updateGradingSystem({
      scale: newScale,
      descriptions: newDescriptions,
      numericValues: newNumericValues
    })
  }

  const handleDescriptionChange = (grade, description) => {
    updateGradingSystem({
      descriptions: {
        ...gradingSystem.descriptions,
        [grade]: description
      }
    })
  }

  // Manejar cambio del valor numérico equivalente (soporta decimales)
  const handleNumericValueChange = (grade, numericValue) => {
    const currentNumericValues = gradingSystem.numericValues || {}
    const parsedValue = parseFloat(numericValue)
    updateGradingSystem({
      numericValues: {
        ...currentNumericValues,
        [grade]: isNaN(parsedValue) ? 0 : parsedValue
      }
    })
  }

  // Obtener valor numérico de una letra (con fallback)
  const getNumericValue = (grade) => {
    if (gradingSystem.numericValues && gradingSystem.numericValues[grade] !== undefined) {
      return gradingSystem.numericValues[grade]
    }
    // Valores por defecto si no están configurados
    const defaults = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
    return defaults[grade] || ''
  }

  const addGradeToScale = () => {
    const newGrade = `NUEVA`
    const currentNumericValues = gradingSystem.numericValues || {}
    updateGradingSystem({
      scale: [...gradingSystem.scale, newGrade],
      descriptions: {
        ...gradingSystem.descriptions,
        [newGrade]: ''
      },
      numericValues: {
        ...currentNumericValues,
        [newGrade]: 0
      }
    })
  }

  const removeGradeFromScale = (index) => {
    const newScale = gradingSystem.scale.filter((_, i) => i !== index)
    const removedGrade = gradingSystem.scale[index]
    const newDescriptions = {...gradingSystem.descriptions}
    delete newDescriptions[removedGrade]

    const newNumericValues = {...(gradingSystem.numericValues || {})}
    delete newNumericValues[removedGrade]

    updateGradingSystem({
      scale: newScale,
      descriptions: newDescriptions,
      numericValues: newNumericValues
    })
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${isLocked ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-800">{title}</h4>
          {isCheckingLock ? (
            <Loader2 size={16} className="text-gray-400 animate-spin" />
          ) : isLocked ? (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
              <Lock size={12} />
              <span>Bloqueado</span>
            </div>
          ) : null}
        </div>
        <span className="text-xs text-gray-400">ID: {levelId} | Código: {levelCode}</span>
      </div>

      {/* Mensaje de bloqueo */}
      {isLocked && (
        <div className="mb-3 p-2 bg-amber-100 border border-amber-200 rounded text-amber-800 text-xs">
          <strong>Este nivel está bloqueado</strong> porque ya tiene calificaciones registradas.
          No se puede modificar el sistema de calificación para mantener la integridad de los datos.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600">Tipo de Escala</label>
          <select
            className={`input text-sm mt-1 ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={gradingSystem.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            disabled={isLocked}
          >
            <option value="letters">Por Letras</option>
            <option value="numeric">Numérico</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Calificación Aprobatoria</label>
          {gradingSystem.type === 'numeric' ? (
            <input
              type="number"
              className={`input text-sm mt-1 ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={gradingSystem.passingGrade}
              min={gradingSystem.scale?.min || 0}
              max={gradingSystem.scale?.max || 20}
              onChange={(e) => updateGradingSystem({ passingGrade: parseInt(e.target.value) })}
              disabled={isLocked}
            />
          ) : (
            <select
              className={`input text-sm mt-1 ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={gradingSystem.passingGrade}
              onChange={(e) => updateGradingSystem({ passingGrade: e.target.value })}
              disabled={isLocked}
            >
              {(Array.isArray(gradingSystem.scale) ? gradingSystem.scale : []).map((grade, index) => (
                <option key={`${grade}-${index}`} value={grade}>{grade}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-gray-600">
          {gradingSystem.type === 'numeric' ? 'Configuración Numérica' : 'Escala de Calificación'}
        </label>

        {gradingSystem.type === 'numeric' ? (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="text-xs text-gray-500">Valor Mínimo</label>
              <input
                type="number"
                className={`input text-sm mt-1 ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={gradingSystem.scale?.min ?? 0}
                onChange={(e) => updateGradingSystem({
                  scale: { ...gradingSystem.scale, min: parseInt(e.target.value) }
                })}
                disabled={isLocked}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Valor Máximo</label>
              <input
                type="number"
                className={`input text-sm mt-1 ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={gradingSystem.scale?.max ?? 20}
                onChange={(e) => updateGradingSystem({
                  scale: { ...gradingSystem.scale, max: parseInt(e.target.value) }
                })}
                disabled={isLocked}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {/* Encabezados de columnas */}
            <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 mb-1">
              <div className="w-16 text-center">Letra</div>
              <div className="w-20 text-center">Valor Num.</div>
              <div className="flex-1">Descripción</div>
              <div className="w-8"></div>
            </div>
            {(Array.isArray(gradingSystem.scale) ? gradingSystem.scale : []).map((grade, index) => (
              <div key={`${grade}-${index}`} className="flex items-center space-x-2">
                <input
                  type="text"
                  className={`w-16 px-2 py-1 border rounded text-xs text-center ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  value={grade}
                  onChange={(e) => handleScaleChange(index, e.target.value)}
                  title="Letra de calificación"
                  disabled={isLocked}
                />
                <input
                  type="number"
                  className={`w-20 px-2 py-1 border rounded text-xs text-center ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  value={getNumericValue(grade)}
                  onChange={(e) => handleNumericValueChange(grade, e.target.value)}
                  min="0"
                  max="20"
                  step="0.1"
                  title="Valor numérico equivalente para cálculo de promedios (ej: 3.5)"
                  placeholder="0-20"
                  disabled={isLocked}
                />
                <input
                  type="text"
                  className={`flex-1 px-2 py-1 border rounded text-xs ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Descripción"
                  value={gradingSystem.descriptions?.[grade] || ''}
                  onChange={(e) => handleDescriptionChange(grade, e.target.value)}
                  disabled={isLocked}
                />
                {Array.isArray(gradingSystem.scale) && gradingSystem.scale.length > 1 && !isLocked && (
                  <button
                    onClick={() => removeGradeFromScale(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Eliminar calificación"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            {Array.isArray(gradingSystem.scale) && !isLocked && (
              <button
                onClick={addGradeToScale}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
              >
                <Plus size={14} />
                <span>Agregar calificación</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GradingSystemCard
