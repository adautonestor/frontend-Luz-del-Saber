import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Plus, Trash2, Save, Calculator,
  Edit2, Check, AlertCircle, BookOpen
} from 'lucide-react'

const CompetenceGradesModal = ({
  isOpen,
  onClose,
  student,
  course,
  category,
  bimestre,
  initialGrades = [],
  onSave,
  gradingSystem = 'vigesimal'
}) => {
  const [grades, setGrades] = useState([])
  const [isAddingGrade, setIsAddingGrade] = useState(false)
  const [editingGradeId, setEditingGradeId] = useState(null)
  const [newGrade, setNewGrade] = useState({ valor: '', description: '', comentario: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Inicializar con las notas existentes o crear una vacía
      if (initialGrades && initialGrades.length > 0) {
        setGrades(initialGrades.map((g, index) => ({
          id: g.id || `grade-${Date.now()}-${index}`,
          valor: g.valor || '',
          description: g.description || `Nota ${index + 1}`,
          comentario: g.comentario || ''
        })))
      } else {
        // Iniciar con una nota vacía por defecto
        setGrades([{
          id: `grade-${Date.now()}`,
          valor: '',
          description: 'Nota 1',
          comentario: ''
        }])
      }
      setError('')
    }
  }, [isOpen, initialGrades])

  // Validación de calificación según el sistema
  // NOTA: Los valores válidos se configuran desde /api/system-settings/grading-scales
  // Esta validación es un fallback con valores por defecto
  const validateGrade = (value) => {
    if (gradingSystem === 'vigesimal' || gradingSystem === 'secundaria') {
      const numValue = parseFloat(value)
      return !isNaN(numValue) && numValue >= 0 && numValue <= 20
    } else {
      // Sistema literal: A, B, C, D (valores numéricos: A=4, B=3, C=2, D=1)
      return ['A', 'B', 'C', 'D'].includes(value.toUpperCase())
    }
  }

  const calculateAverage = () => {
    if (grades.length === 0) return 0

    if (gradingSystem === 'vigesimal' || gradingSystem === 'secundaria') {
      const validGrades = grades.filter(g => g.valor && !isNaN(parseFloat(g.valor)))
      if (validGrades.length === 0) return 0

      const sum = validGrades.reduce((acc, g) => acc + parseFloat(g.valor), 0)
      return (sum / validGrades.length).toFixed(2)
    } else {
      // Para sistema de letras, mostrar la moda o el más frecuente
      const letterCounts = grades.reduce((acc, g) => {
        if (g.valor) {
          acc[g.valor] = (acc[g.valor] || 0) + 1
        }
        return acc
      }, {})

      const mostFrequent = Object.keys(letterCounts).reduce((a, b) =>
        letterCounts[a] > letterCounts[b] ? a : b, ''
      )

      return mostFrequent || '-'
    }
  }

  const isGradeFailure = (valor) => {
    if (!valor) return false

    if (gradingSystem === 'vigesimal' || gradingSystem === 'secundaria') {
      const numValue = parseFloat(valor)
      return !isNaN(numValue) && numValue < 11
    } else {
      // En sistema literal, C y D son desaprobatorias
      return valor.toUpperCase() === 'C' || valor.toUpperCase() === 'D'
    }
  }

  const handleAddGrade = () => {
    if (!newGrade.valor) {
      setError('Debes ingresar un valor para la nota')
      return
    }

    if (!validateGrade(newGrade.valor)) {
      setError(gradingSystem === 'vigesimal' || gradingSystem === 'secundaria'
        ? 'La nota debe estar entre 0 y 20'
        : 'La nota debe ser A, B, C o D'
      )
      return
    }

    // Validar comentario obligatorio para notas desaprobatorias
    if (isGradeFailure(newGrade.valor)) {
      const commentText = newGrade.comentario?.trim() || ''

      if (commentText.length === 0) {
        setError('El comentario es obligatorio para notas desaprobatorias (menores a 11 o C)')
        return
      }

      if (commentText.length < 20) {
        setError('El comentario debe tener al menos 20 caracteres para explicar la nota desaprobatoria')
        return
      }

      if (newGrade.comentario.length > 250) {
        setError('El comentario no puede exceder los 250 caracteres')
        return
      }
    }

    // Validar límite de caracteres para cualquier comentario
    if (newGrade.comentario && newGrade.comentario.length > 250) {
      setError('El comentario no puede exceder los 250 caracteres')
      return
    }

    const gradeToAdd = {
      id: `grade-${Date.now()}`,
      valor: gradingSystem === 'vigesimal' || gradingSystem === 'secundaria'
        ? parseFloat(newGrade.valor)
        : newGrade.valor.toUpperCase(),
      description: newGrade.description || `Nota ${grades.length + 1}`,
      comentario: newGrade.comentario || ''
    }

    setGrades([...grades, gradeToAdd])
    setNewGrade({ valor: '', description: '', comentario: '' })
    setIsAddingGrade(false)
    setError('')
  }

  const handleUpdateGrade = (gradeId, field, value) => {
    if (field === 'valor' && value && !validateGrade(value)) {
      setError(gradingSystem === 'vigesimal' || gradingSystem === 'secundaria'
        ? 'La nota debe estar entre 0 y 20'
        : 'La nota debe ser A, B, C o D'
      )
      return
    }

    setGrades(grades.map(g =>
      g.id === gradeId
        ? { ...g, [field]: field === 'valor' && gradingSystem === 'vigesimal' || gradingSystem === 'secundaria'
            ? parseFloat(value) || value
            : value }
        : g
    ))
    setError('')
  }

  const handleDeleteGrade = (gradeId) => {
    // No permitir eliminar si solo queda una nota
    if (grades.length <= 1) {
      setError('Debe existir al menos una nota')
      return
    }
    setGrades(grades.filter(g => g.id !== gradeId))
  }

  const handleSave = () => {
    // Validar que todas las notas tengan valor
    const invalidGrades = grades.filter(g => !g.valor)
    if (invalidGrades.length > 0) {
      setError('Todas las notas deben tener un valor asignado')
      return
    }

    // Validar comentarios obligatorios para notas desaprobatorias
    const failingGradesWithoutComment = grades.filter(g =>
      isGradeFailure(g.valor) && (!g.comentario || g.comentario.trim().length === 0)
    )
    if (failingGradesWithoutComment.length > 0) {
      setError('Las notas desaprobatorias (menores a 11 o C) requieren un comentario obligatorio')
      return
    }

    // Validar longitud mínima de comentarios para notas desaprobatorias
    const failingGradesWithShortComment = grades.filter(g =>
      isGradeFailure(g.valor) && g.comentario && g.comentario.trim().length > 0 && g.comentario.trim().length < 20
    )
    if (failingGradesWithShortComment.length > 0) {
      setError('Los comentarios de notas desaprobatorias deben tener al menos 20 caracteres')
      return
    }

    // Validar límite de caracteres en comentarios
    const commentsExceedingLimit = grades.filter(g =>
      g.comentario && g.comentario.length > 250
    )
    if (commentsExceedingLimit.length > 0) {
      setError('Los comentarios no pueden exceder los 250 caracteres')
      return
    }

    // Calcular el promedio antes de guardar
    const average = calculateAverage()

    onSave({
      categoriaId: category.id,
      notas: grades,
      promedio: average,
      bimestre
    })

    onClose()
  }

  const getGradeColor = (valor) => {
    if (!valor) return 'bg-gray-100 text-gray-600'

    if (gradingSystem === 'vigesimal' || gradingSystem === 'secundaria') {
      const numValue = parseFloat(valor)
      if (numValue >= 18) return 'bg-green-100 text-green-700'
      if (numValue >= 14) return 'bg-blue-100 text-blue-700'
      if (numValue >= 11) return 'bg-yellow-100 text-yellow-700'
      return 'bg-red-100 text-red-700'
    } else {
      // Sistema literal: A, B, C, D
      if (valor === 'A') return 'bg-green-100 text-green-700'
      if (valor === 'B') return 'bg-blue-100 text-blue-700'
      if (valor === 'C') return 'bg-yellow-100 text-yellow-700'
      if (valor === 'D') return 'bg-red-100 text-red-700'
      return 'bg-gray-100 text-gray-700'
    }
  }

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
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl"
          >
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Gestión de Notas - {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {student.first_names} {student.last_names} • {course.name} • {quarter}° Bimestre
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
            <div className="px-6 py-4">
              {/* Error Message */}
              {error && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Average Display */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Promedio Calculado:</span>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-bold text-lg ${getGradeColor(calculateAverage())}`}>
                    {calculateAverage() || '-'}
                  </div>
                </div>
              </div>

              {/* Grades List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {grades.map((grade, index) => (
                  <motion.div
                    key={grade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Descripción
                          </label>
                          {editingGradeId === grade.id ? (
                            <input
                              type="text"
                              value={grade.description}
                              onChange={(e) => handleUpdateGrade(grade.id, 'description', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: Examen parcial"
                            />
                          ) : (
                            <div className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md">
                              {grade.description || `Nota ${index + 1}`}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Calificación
                          </label>
                          {editingGradeId === grade.id ? (
                            <input
                              type={gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' ? 'number' : 'text'}
                              value={grade.valor}
                              onChange={(e) => handleUpdateGrade(grade.id, 'valor', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                              placeholder={gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' ? '0-20' : 'A/B/C/D'}
                              min={gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' ? 0 : undefined}
                              max={gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' ? 20 : undefined}
                              step={gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' ? 0.1 : undefined}
                            />
                          ) : (
                            <div className={`px-3 py-1.5 text-sm font-medium rounded-md text-center ${getGradeColor(grade.valor)}`}>
                              {grade.valor || '-'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-medium text-gray-700">
                            Comentario {isGradeFailure(grade.valor) ? (
                              <span className="text-red-600 font-semibold">(Obligatorio para nota desaprobatoria)</span>
                            ) : (
                              <span className="text-gray-400">(Opcional)</span>
                            )}
                          </label>
                          {editingGradeId === grade.id && (
                            <span className={`text-xs ${
                              (grade.comentario?.length || 0) > 250
                                ? 'text-red-600 font-semibold'
                                : isGradeFailure(grade.valor) && (grade.comentario?.trim().length || 0) < 20
                                ? 'text-orange-600 font-semibold'
                                : 'text-gray-500'
                            }`}>
                              {grade.comentario?.length || 0}/250
                              {isGradeFailure(grade.valor) && (grade.comentario?.trim().length || 0) < 20 && (
                                <span className="ml-1">(mín. 20)</span>
                              )}
                            </span>
                          )}
                        </div>
                        {editingGradeId === grade.id ? (
                          <textarea
                            value={grade.comentario || ''}
                            onChange={(e) => handleUpdateGrade(grade.id, 'comentario', e.target.value)}
                            className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 ${
                              isGradeFailure(grade.valor) && (!grade.comentario || grade.comentario.trim().length === 0)
                                ? 'border-red-300 bg-red-50'
                                : isGradeFailure(grade.valor) && grade.comentario.trim().length < 20
                                ? 'border-orange-300 bg-orange-50'
                                : (grade.comentario?.length || 0) > 250
                                ? 'border-red-300'
                                : 'border-gray-300'
                            }`}
                            placeholder={
                              isGradeFailure(grade.valor)
                                ? 'Debes explicar por qué el estudiante obtuvo esta nota desaprobatoria'
                                : 'Ej: Excelente trabajo, demostró dominio del tema'
                            }
                            rows={2}
                            maxLength={250}
                          />
                        ) : (
                          <div className={`px-3 py-1.5 text-sm bg-white border rounded-md min-h-[2.5rem] ${
                            isGradeFailure(grade.valor) && (!grade.comentario || grade.comentario.trim().length === 0)
                              ? 'border-red-300 bg-red-50 text-red-700 font-medium'
                              : 'border-gray-200 text-gray-600 italic'
                          }`}>
                            {grade.comentario || (isGradeFailure(grade.valor) ? '⚠️ Comentario obligatorio faltante' : 'Sin comentario')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {editingGradeId === grade.id ? (
                        <button
                          onClick={() => setEditingGradeId(null)}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                          title="Confirmar"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingGradeId(grade.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteGrade(grade.id)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                        title="Eliminar"
                        disabled={grades.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Add New Grade Form */}
                {isAddingGrade ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Descripción
                          </label>
                          <input
                            type="text"
                            value={newGrade.description}
                            onChange={(e) => setNewGrade({ ...newGrade, description: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Tarea 1"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Calificación
                          </label>
                          <input
                            type={gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' ? 'number' : 'text'}
                            value={newGrade.valor}
                            onChange={(e) => setNewGrade({ ...newGrade, valor: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder={gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' ? '0-20' : 'A/B/C/D'}
                            min={gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' ? 0 : undefined}
                            max={gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' ? 20 : undefined}
                            step={gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' ? 0.1 : undefined}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-medium text-gray-700">
                            Comentario {isGradeFailure(newGrade.valor) ? (
                              <span className="text-red-600 font-semibold">(Obligatorio para nota desaprobatoria)</span>
                            ) : (
                              <span className="text-gray-400">(Opcional)</span>
                            )}
                          </label>
                          <span className={`text-xs ${
                            (newGrade.comentario?.length || 0) > 250
                              ? 'text-red-600 font-semibold'
                              : isGradeFailure(newGrade.valor) && (newGrade.comentario?.trim().length || 0) < 20
                              ? 'text-orange-600 font-semibold'
                              : 'text-gray-500'
                          }`}>
                            {newGrade.comentario?.length || 0}/250
                            {isGradeFailure(newGrade.valor) && (newGrade.comentario?.trim().length || 0) < 20 && (
                              <span className="ml-1">(mín. 20)</span>
                            )}
                          </span>
                        </div>
                        <textarea
                          value={newGrade.comentario || ''}
                          onChange={(e) => setNewGrade({ ...newGrade, comentario: e.target.value })}
                          className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 ${
                            isGradeFailure(newGrade.valor) && (!newGrade.comentario || newGrade.comentario.trim().length === 0)
                              ? 'border-red-300 bg-red-50'
                              : isGradeFailure(newGrade.valor) && (newGrade.comentario?.trim().length || 0) < 20
                              ? 'border-orange-300 bg-orange-50'
                              : (newGrade.comentario?.length || 0) > 250
                              ? 'border-red-300'
                              : 'border-gray-300'
                          }`}
                          placeholder={
                            isGradeFailure(newGrade.valor)
                              ? 'Debes explicar por qué el estudiante obtuvo esta nota desaprobatoria'
                              : 'Ej: Excelente trabajo, demostró dominio del tema'
                          }
                          rows={2}
                          maxLength={250}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleAddGrade}
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                        title="Agregar"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingGrade(false)
                          setNewGrade({ valor: '', description: '', comentario: '' })
                          setError('')
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setIsAddingGrade(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Agregar Nueva Nota</span>
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="text-xs text-gray-600">
                    <p>• Puedes agregar múltiples notas para esta competencia</p>
                    <p>• El promedio se calcula automáticamente con todas las notas ingresadas</p>
                    <p>• Cada nota debe tener un valor válido para poder guardar</p>
                    {gradingSystem === 'vigesimal' || gradingSystem === 'secundaria'
                      ? <p>• Las notas deben estar en el rango de 0 a 20</p>
                      : <p>• Las notas deben ser: A (4 puntos), B (3 puntos), C (2 puntos), D (1 punto)</p>
                    }
                    <p className="font-semibold text-red-600 mt-1">
                      • <strong>IMPORTANTE:</strong> Los comentarios son OBLIGATORIOS para notas desaprobatorias {gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' ? '(menores a 11)' : '(notas C o D)'}
                    </p>
                    <p>• Los comentarios tienen un límite de 250 caracteres</p>
                    <p>• Los comentarios aparecerán en la boleta de notas del estudiante</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

export default CompetenceGradesModal