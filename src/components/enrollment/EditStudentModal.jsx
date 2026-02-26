import React, { useState, useEffect } from 'react'
import { X, Lock, AlertTriangle } from 'lucide-react'
import { useStudentsStore } from '../../stores/studentsStore'
import { useAcademicStore } from '../../stores/academicStore'
import { matriculationService } from '../../services/matriculationService'

/**
 * Modal para editar un estudiante existente
 * Permite actualizar datos del estudiante y académicos
 * Los campos académicos están bloqueados si el estudiante ya está matriculado
 */
const EditStudentModal = ({ student, onClose, onSuccess }) => {
  const { updateStudent } = useStudentsStore()
  const {
    levels,
    grades,
    sections,
    academicYears,
    initialize: initializeAcademic
  } = useAcademicStore()

  // Detectar si el estudiante está matriculado (tiene asignación académica)
  const isEnrolled = !!(student.academic_year_id && student.level_id && student.grade_id && student.section_id)

  // Estado para almacenar la matrícula del estudiante
  const [matriculation, setMatriculation] = useState(null)

  const [formData, setFormData] = useState({
    first_names: student.first_names || '',
    last_names: student.last_names || '',
    dni: student.dni || '',
    birth_date: student.birth_date ? new Date(student.birth_date).toISOString().split('T')[0] : '',
    gender: student.gender || '',
    address: student.address || '',
    phone: student.phone || '',
    academic_year_id: student.academic_year_id || '',
    nivel: student.level_id || student.nivel || '',
    grado: student.grade_id || student.grado || '',
    seccion: student.section_id || student.seccion || '',
    observations: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      // Initialize academic data if not loaded
      if (!levels.length || !academicYears.length) {
        await initializeAcademic()
      }

      // Cargar la matrícula del estudiante para obtener las observaciones
      if (student.id && student.academic_year_id) {
        try {
          const matriculas = await matriculationService.getByStudent(student.id)
          // Buscar la matrícula del año académico actual
          const currentMatriculation = Array.isArray(matriculas)
            ? matriculas.find(m => m.academic_year_id === student.academic_year_id)
            : null

          if (currentMatriculation) {
            setMatriculation(currentMatriculation)
            setFormData(prev => ({
              ...prev,
              observations: currentMatriculation.observations || ''
            }))
          }
        } catch (error) {
          console.error('Error al cargar matrícula:', error)
        }
      }
    }

    loadData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.first_names.trim()) newErrors.first_names = 'Nombres son requeridos'
    if (!formData.last_names.trim()) newErrors.last_names = 'Apellidos son requeridos'
    if (!formData.dni.trim()) newErrors.dni = 'DNI es requerido'
    else if (!/^\d{8}$/.test(formData.dni)) newErrors.dni = 'DNI debe tener 8 dígitos'
    if (!formData.birth_date) newErrors.birth_date = 'Fecha de nacimiento es requerida'
    if (!formData.gender) newErrors.gender = 'Sexo es requerido'
    if (!formData.academic_year_id) newErrors.academic_year_id = 'Año lectivo es requerido'
    if (!formData.nivel) newErrors.nivel = 'Nivel es requerido'
    if (!formData.grado) newErrors.grado = 'Grado es requerido'
    if (!formData.seccion) newErrors.seccion = 'Sección es requerida'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Separar datos del estudiante de las observaciones
      const { observations, ...studentData } = formData

      // Actualizar datos del estudiante
      await updateStudent(student.id, studentData)

      // Si hay matrícula, actualizar las observaciones en la matrícula
      if (matriculation?.id) {
        await matriculationService.update(matriculation.id, {
          observations: observations || null
        })
      }

      onSuccess()
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getGradesForLevel = (levelId) => {
    if (!levelId) return []
    return grades.filter(g => g.level_id === parseInt(levelId) || g.nivel === parseInt(levelId))
  }

  const getSectionsForGrade = (gradeId) => {
    if (!gradeId) return []
    return sections.filter(s => s.grade_id === parseInt(gradeId) || s.grado === parseInt(gradeId))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Editar Estudiante: {student.first_names} {student.last_names}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres *
              </label>
              <input
                type="text"
                name="first_names"
                value={formData.first_names}
                onChange={handleChange}
                className={`input ${errors.first_names ? 'border-red-500' : ''}`}
                placeholder="Nombres del estudiante"
              />
              {errors.first_names && <p className="text-red-500 text-xs mt-1">{errors.first_names}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                name="last_names"
                value={formData.last_names}
                onChange={handleChange}
                className={`input ${errors.last_names ? 'border-red-500' : ''}`}
                placeholder="Apellidos del estudiante"
              />
              {errors.last_names && <p className="text-red-500 text-xs mt-1">{errors.last_names}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI *
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className={`input ${errors.dni ? 'border-red-500' : ''}`}
                placeholder="12345678"
                maxLength="8"
              />
              {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className={`input ${errors.birth_date ? 'border-red-500' : ''}`}
              />
              {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`input ${errors.gender ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="+51 987 654 321"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input"
              placeholder="Dirección de domicilio"
            />
          </div>

          {/* Academic Assignment */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              Asignación Académica
              {isEnrolled && <Lock className="ml-2 text-gray-400" size={16} />}
            </h4>

            {/* Mensaje de advertencia si está matriculado */}
            {isEnrolled && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
                <AlertTriangle className="text-amber-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Campos de asignación académica bloqueados
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Este estudiante ya está matriculado. Para cambiar su asignación académica,
                    debe anular la matrícula actual y crear una nueva.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año Lectivo *
                </label>
                <select
                  name="academic_year_id"
                  value={formData.academic_year_id}
                  onChange={handleChange}
                  className={`input ${errors.academic_year_id ? 'border-red-500' : ''} ${isEnrolled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isEnrolled}
                >
                  <option value="">Seleccionar año lectivo...</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.name} ({year.year})
                    </option>
                  ))}
                </select>
                {errors.academic_year_id && <p className="text-red-500 text-xs mt-1">{errors.academic_year_id}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel *
                </label>
                <select
                  name="nivel"
                  value={formData.nivel}
                  onChange={(e) => {
                    handleChange(e)
                    setFormData(prev => ({ ...prev, grado: '', seccion: '' }))
                  }}
                  className={`input ${errors.nivel ? 'border-red-500' : ''} ${isEnrolled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isEnrolled}
                >
                  <option value="">Seleccionar nivel...</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
                {errors.nivel && <p className="text-red-500 text-xs mt-1">{errors.nivel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grado *
                </label>
                <select
                  name="grado"
                  value={formData.grado}
                  onChange={(e) => {
                    handleChange(e)
                    setFormData(prev => ({ ...prev, seccion: '' }))
                  }}
                  className={`input ${errors.grado ? 'border-red-500' : ''} ${isEnrolled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!formData.nivel || isEnrolled}
                >
                  <option value="">Seleccionar grado...</option>
                  {getGradesForLevel(formData.nivel).map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
                {errors.grado && <p className="text-red-500 text-xs mt-1">{errors.grado}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sección *
                </label>
                <select
                  name="seccion"
                  value={formData.seccion}
                  onChange={handleChange}
                  className={`input ${errors.seccion ? 'border-red-500' : ''} ${isEnrolled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!formData.grado || isEnrolled}
                >
                  <option value="">Seleccionar sección...</option>
                  {getSectionsForGrade(formData.grado).map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
                {errors.seccion && <p className="text-red-500 text-xs mt-1">{errors.seccion}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              className="input h-20 resize-none"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Actualizando...' : 'Actualizar Estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditStudentModal
