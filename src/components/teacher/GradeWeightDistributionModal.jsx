import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Save, Plus, Trash2, Percent, AlertCircle,
  Calculator, Info, CheckCircle, Edit2, Check, Shuffle
} from 'lucide-react'

/**
 * Modal para que el docente defina la distribución de porcentajes de las evaluaciones
 * dentro de cada competencia
 */
const GradeWeightDistributionModal = ({
  isOpen,
  onClose,
  course,
  category,
  bimestre,
  initialDistribution = null,
  onSave
}) => {
  const [distributions, setDistributions] = useState([])
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [sharePercentages, setSharePercentages] = useState(true) // Checkbox para compartir porcentajes

  // Obtener el porcentaje de la competencia asignado por el Director General
  const competencePercentage = category.weight * 100

  useEffect(() => {
    if (isOpen) {
      // Cargar distribución existente o crear una por defecto
      if (initialDistribution && initialDistribution.length > 0) {
        setDistributions(initialDistribution.map((d, index) => ({
          id: d.id || `dist-${Date.now()}-${index}`,
          name: d.name || `Evaluación ${index + 1}`,
          porcentaje: d.porcentaje || 0,
          description: d.description || ''
        })))
        // Si hay distribución personalizada, asumir que es manual
        setSharePercentages(false)
      } else {
        // Distribución por defecto equitativa
        const defaultDistributions = [
          {
            id: `dist-${Date.now()}-1`,
            name: 'Práctica Calificada',
            porcentaje: 0,
            description: 'Evaluaciones en clase'
          },
          {
            id: `dist-${Date.now()}-2`,
            name: 'Tarea',
            porcentaje: 0,
            description: 'Trabajos para casa'
          },
          {
            id: `dist-${Date.now()}-3`,
            name: 'Examen',
            porcentaje: 0,
            description: 'Evaluación bimestral'
          }
        ]
        setDistributions(defaultDistributions)
        setSharePercentages(true)
      }
      setError('')
    }
  }, [isOpen, initialDistribution])

  // Auto-recalcular cuando cambia el modo compartido o el número de distribuciones
  useEffect(() => {
    if (sharePercentages && distributions.length > 0) {
      distributeEqually()
    }
  }, [sharePercentages, distributions.length])

  const calculateTotalPercentage = () => {
    return distributions.reduce((sum, dist) => sum + (parseFloat(dist.porcentaje) || 0), 0)
  }

  const distributeEqually = () => {
    if (distributions.length === 0) return

    const equalPercentage = competencePercentage / distributions.length

    setDistributions(prevDists => prevDists.map((dist, index) => {
      // Para el último elemento, ajustar el porcentaje para que la suma sea exactamente el porcentaje de la competencia
      // (evitar problemas de redondeo)
      if (index === distributions.length - 1) {
        const sumOfOthers = equalPercentage * (distributions.length - 1)
        return { ...dist, porcentaje: parseFloat((competencePercentage - sumOfOthers).toFixed(2)) }
      }
      return { ...dist, porcentaje: parseFloat(equalPercentage.toFixed(2)) }
    }))

    setError('')
  }

  const handleAddDistribution = () => {
    const remainingPercentage = competencePercentage - calculateTotalPercentage()

    const newDist = {
      id: `dist-${Date.now()}`,
      name: `Evaluación ${distributions.length + 1}`,
      porcentaje: sharePercentages ? 0 : (remainingPercentage > 0 ? remainingPercentage : 0),
      description: ''
    }

    setDistributions([...distributions, newDist])
  }

  const handleUpdateDistribution = (id, field, value) => {
    setDistributions(distributions.map(dist =>
      dist.id === id
        ? { ...dist, [field]: value }
        : dist
    ))
    setError('')
  }

  const handleDeleteDistribution = (id) => {
    if (distributions.length <= 1) {
      setError('Debe existir al menos una evaluación')
      return
    }
    setDistributions(distributions.filter(dist => dist.id !== id))
  }

  const handleSave = () => {
    // Validar que todos los campos estén completos
    const invalidDists = distributions.filter(d => !d.name || d.porcentaje === null || d.porcentaje === undefined)
    if (invalidDists.length > 0) {
      setError('Todas las evaluaciones deben tener un nombre y porcentaje')
      return
    }

    // Validar que los porcentajes sean válidos
    const invalidPercentages = distributions.filter(d =>
      d.porcentaje < 0 || d.porcentaje > competencePercentage
    )
    if (invalidPercentages.length > 0) {
      setError(`Los porcentajes deben estar entre 0 y ${competencePercentage}%`)
      return
    }

    // Validar que la suma sea exactamente el porcentaje de la competencia
    const total = calculateTotalPercentage()
    if (Math.abs(total - competencePercentage) > 0.01) { // Tolerancia de 0.01% por redondeo
      setError(`La suma de porcentajes debe ser ${competencePercentage.toFixed(2)}% (actual: ${total.toFixed(2)}%)`)
      return
    }

    // Guardar
    onSave({
      course_id: course.id,
      categoriaId: category.id,
      quarter: bimestre,
      distribuciones: distributions
    })

    onClose()
  }

  const totalPercentage = calculateTotalPercentage()
  const isValidTotal = Math.abs(totalPercentage - competencePercentage) < 0.01

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900 bg-opacity-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl"
          >
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-blue-600" />
                    Distribución de Porcentajes de Evaluación
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {course.name} • {category.name} • Bimestre {quarter}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {/* Info Alert */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">¿Qué es la distribución de porcentajes?</p>
                    <p>Define cómo se calculará el promedio de esta competencia ({competencePercentage}%) basándose en las diferentes evaluaciones que ingreses (prácticas, tareas, exámenes, etc.).</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Checkbox: Compartir Porcentajes */}
              <div className="mb-4 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sharePercentages}
                    onChange={(e) => setSharePercentages(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      COMPARTIR PORCENTAJES
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {sharePercentages
                        ? `Los ${competencePercentage}% se dividen equitativamente entre todas las evaluaciones automáticamente`
                        : 'Modo manual: Puedes asignar los porcentajes individualmente'
                      }
                    </p>
                  </div>
                </label>
              </div>

              {/* Encabezado de la Tabla */}
              <div className="mb-4 border-2 border-gray-400 bg-white">
                <div className="grid grid-cols-2 border-b-2 border-gray-400">
                  <div className="px-4 py-3 font-bold text-sm uppercase border-r-2 border-gray-400">
                    COLUMNAS DE EVALUACIÓN
                  </div>
                  <div className="px-4 py-3 text-center font-bold text-lg">
                    {competencePercentage.toFixed(0)}%
                  </div>
                </div>

                {/* Total Percentage Display */}
                <div className={`px-4 py-3 border-b-2 border-gray-400 ${
                  isValidTotal
                    ? 'bg-green-50'
                    : totalPercentage > competencePercentage
                    ? 'bg-red-50'
                    : 'bg-yellow-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isValidTotal ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className="font-medium text-sm">Total Distribuido:</span>
                    </div>
                    <div className={`text-xl font-bold ${
                      isValidTotal
                        ? 'text-green-700'
                        : totalPercentage > competencePercentage
                        ? 'text-red-700'
                        : 'text-yellow-700'
                    }`}>
                      {totalPercentage.toFixed(2)}%
                    </div>
                  </div>
                  {!isValidTotal && (
                    <p className="text-xs text-gray-600 mt-1">
                      {totalPercentage < competencePercentage
                        ? `Faltan ${(competencePercentage - totalPercentage).toFixed(2)}% por distribuir`
                        : `Excede en ${(totalPercentage - competencePercentage).toFixed(2)}%`
                      }
                    </p>
                  )}
                </div>

                {/* Distributions List - Table Style */}
                <div className="divide-y divide-gray-300">
                  {distributions.map((dist, index) => (
                    <div
                      key={dist.id}
                      className="grid grid-cols-12 hover:bg-gray-50 transition-colors"
                    >
                      {/* Número de columna */}
                      <div className="col-span-2 px-4 py-3 border-r border-gray-300">
                        <span className="text-sm font-semibold text-gray-700">
                          COLUMNA {index + 1}
                        </span>
                      </div>

                      {/* Nombre */}
                      <div className="col-span-6 px-4 py-3 border-r border-gray-300">
                        {editingId === dist.id && !sharePercentages ? (
                          <input
                            type="text"
                            value={dist.name}
                            onChange={(e) => handleUpdateDistribution(dist.id, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre de la evaluación"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900 uppercase">
                            {dist.name}
                          </div>
                        )}
                      </div>

                      {/* Porcentaje */}
                      <div className="col-span-3 px-4 py-3 border-r border-gray-300">
                        {!sharePercentages && editingId === dist.id ? (
                          <div className="relative">
                            <input
                              type="number"
                              value={dist.porcentaje}
                              onChange={(e) => handleUpdateDistribution(dist.id, 'porcentaje', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                              min={0}
                              max={competencePercentage}
                              step={0.01}
                            />
                          </div>
                        ) : (
                          <div className="text-center font-bold text-gray-900">
                            {dist.porcentaje.toFixed(2)}%
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="col-span-1 px-2 py-3 flex items-center justify-center gap-1">
                        {!sharePercentages && (
                          <>
                            {editingId === dist.id ? (
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Confirmar"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setEditingId(dist.id)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => handleDeleteDistribution(dist.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Eliminar"
                          disabled={distributions.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Botón Agregar */}
                  <div className="grid grid-cols-12">
                    <div className="col-span-12 px-4 py-2 text-center">
                      <button
                        onClick={handleAddDistribution}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>+</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-600">
                    <p className="font-semibold mb-1">📖 Ejemplo de cálculo:</p>
                    <p>Si defines: Práctica (30%), Tarea (20%), Examen (50%), y un estudiante obtiene:</p>
                    <p className="mt-1">• Práctica: 15 → 15 × 0.30 = 4.5</p>
                    <p>• Tarea: 18 → 18 × 0.20 = 3.6</p>
                    <p>• Examen: 16 → 16 × 0.50 = 8.0</p>
                    <p className="mt-1 font-semibold text-blue-700">Promedio de competencia: 4.5 + 3.6 + 8.0 = 16.1</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isValidTotal}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2 ${
                    isValidTotal
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  💾 Guardar Distribución
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

export default GradeWeightDistributionModal
