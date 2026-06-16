import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, MessageCircle, FileText, AlertCircle } from 'lucide-react'
import { useGradesStore } from '../../stores/gradesStore.jsx'
import { getLetterGradeDescription } from '@/utils/gradeConversion.jsx'

const GradeEntryModal = ({ 
  student, 
  course, 
  category, 
  subcategory, 
  bimestre, 
  existingGrade = null,
  onClose, 
  onSuccess 
}) => {
  const { recordGrade, getGradingSystemForCourse, getAvailableGradeValues } = useGradesStore()
  
  const [formData, setFormData] = useState({
    valor: '',
    observacion: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get grading system for this course
  const gradingSystem = getGradingSystemForCourse(course.id)
  const availableGrades = getAvailableGradeValues(gradingSystem)
  const isNumericGrading = gradingSystem === 'secundaria'

  useEffect(() => {
    if (existingGrade) {
      setFormData({
        valor: existingGrade.valor || '',
        observacion: existingGrade.observacion || ''
      })
    }
  }, [existingGrade])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.valor && formData.valor !== 0) {
      newErrors.valor = 'La calificación es requerida'
    } else if (isNumericGrading) {
      const numValue = parseFloat(formData.valor)
      if (isNaN(numValue) || numValue < 0 || numValue > 20) {
        newErrors.valor = 'La calificación debe estar entre 0 y 20'
      }
    } else if (!availableGrades.find(g => g.value === formData.valor)) {
      newErrors.valor = 'Seleccione una calificación válida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const gradeData = {
        student_id: student.id,
        course_id: course.id,
        teacher_id: course.teacher_id || 'current-teacher-id', // Should come from auth
        quarter: bimestre,
        categoriaId: category.id,
        subcategoriaId: subcategory.id,
        valor: isNumericGrading ? parseFloat(formData.valor) : formData.valor,
        observacion: formData.observacion.trim() || null
      }

      await recordGrade(gradeData)
      onSuccess()
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getGradingDescription = (value) => {
    if (!value) return ''
    if (isNumericGrading) {
      const num = parseFloat(value)
      if (isNaN(num)) return ''
      // Usar getLetterGradeDescription del store dinámico
      return getLetterGradeDescription(value, student?.level_id)
    }
    return getLetterGradeDescription(value, student?.level_id)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {existingGrade ? 'Editar Calificación' : 'Registrar Calificación'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {student.first_names} {student.last_names}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Course and Assessment Info */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Curso:</span>
              <span className="font-medium">{course.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Bimestre:</span>
              <span className="font-medium">{quarter}°</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Categoría:</span>
              <span className="font-medium">{category.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Evaluación:</span>
              <span className="font-medium">{subcategory.name}</span>
            </div>
          </div>

          {/* Grade Input */}
          <div>
            <label className="label">
              Calificación *
              <span className="text-xs text-gray-500 ml-2">
                ({gradingSystem === 'secundaria' ? '0-20' : availableGrades.map(g => g.value).join(', ')})
              </span>
            </label>
            
            {isNumericGrading ? (
              <input
                type="number"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                className={`input ${errors.valor ? 'border-red-500' : ''}`}
                min="0"
                max="20"
                step="0.5"
                placeholder="0.0 - 20.0"
              />
            ) : (
              <select
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                className={`input ${errors.valor ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccionar calificación</option>
                {availableGrades.map(grade => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
            )}

            {errors.valor && (
              <p className="text-red-500 text-sm mt-1">{errors.valor}</p>
            )}

            {/* Grade description */}
            {formData.valor && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {getGradingDescription(formData.valor)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Observation/Comment */}
          <div>
            <label className="label flex items-center gap-2">
              <MessageCircle size={16} />
              Observación/Comentario
              <span className="text-xs text-gray-500">(Opcional)</span>
            </label>
            <textarea
              name="observacion"
              value={formData.observacion}
              onChange={handleChange}
              className="input"
              rows="3"
              placeholder="Agregar comentarios sobre el desempeño del estudiante..."
              maxLength="500"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {formData.observacion.length}/500
            </div>
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-red-700 text-sm">{errors.submit}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary px-6 py-2 flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              {existingGrade ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default GradeEntryModal