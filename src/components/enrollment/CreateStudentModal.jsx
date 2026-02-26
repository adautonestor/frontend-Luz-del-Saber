import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useStudentsStore } from '../../stores/studentsStore'
import { useAcademicStore } from '../../stores/academicStore'
import { usersService } from '../../services/usersService'
/**
 * Modal para crear un nuevo estudiante
 * Incluye datos del estudiante, académicos y padres/tutores
 */
const CreateStudentModal = ({ onClose, onSuccess }) => {
  const { createStudent } = useStudentsStore()
  const {
    levels,
    grades,
    sections,
    academicYears,
    selectedAcademicYear,
    getAcademicTree,
    initialize: initializeAcademic
  } = useAcademicStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Datos del estudiante
    first_names: '',
    last_names: '',
    dni: '',
    fechaNacimiento: '',
    genero: '',
    direccion: '',
    telefono: '',
    email: '',
    // Datos académicos
    academic_year_id: '',
    nivel: '',
    grado: '',
    seccion: '',
    // Datos de padres/tutores
    padres: [],
    observations: ''
  })
  const [parentForm, setParentForm] = useState({
    name: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    dni: '',
    telefono: '',
    email: '',
    direccion: '',
    ocupacion: '',
    relacion: 'padre' // padre, madre, tutor, abuelo, etc.
  })
  const [availableParents, setAvailableParents] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load available parents
        const users = await usersService.getAll()
        const parents = users?.filter(u => u.rol === 'padre') || []
        setAvailableParents(parents)
      } catch (error) {
        console.error('Error loading parents:', error)
        setAvailableParents([])
      }

      // Initialize academic data if not loaded
      if (!levels.length || !academicYears.length) {
        console.log('Inicializando datos académicos...')
        await initializeAcademic()
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    // Set academic year to current if available
    if (selectedAcademicYear && !formData.academic_year_id) {
      console.log('Estableciendo año académico actual:', selectedAcademicYear)
      setFormData(prev => ({ ...prev, academic_year_id: selectedAcademicYear.id }))
    }
  }, [selectedAcademicYear])

  // Debug: Log cuando cambien los datos académicos
  useEffect(() => {
    console.log('Datos académicos actualizados:', {
      levels: levels.length,
      grades: grades.length,
      sections: sections.length,
      academicYears: academicYears.length
    })
  }, [levels, grades, sections, academicYears])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleParentFormChange = (e) => {
    const { name, value } = e.target
    setParentForm(prev => ({ ...prev, [name]: value }))
  }

  const addExistingParent = (parentId) => {
    const parent = availableParents.find(p => p.id === parentId)
    if (parent && !formData.padres.find(p => p.id === parentId)) {
      setFormData(prev => ({
        ...prev,
        padres: [...prev.padres, { 
          id: parent.id, 
          name: parent.name,
          apellidoPaterno: parent.apellidoPaterno,
          apellidoMaterno: parent.apellidoMaterno,
          telefono: parent.telefono,
          email: parent.email,
          relacion: 'padre',
          type: 'existing'
        }]
      }))
    }
  }

  const addNewParent = () => {
    if (parentForm.name && parentForm.apellidoPaterno && parentForm.dni) {
      const newParent = {
        ...parentForm,
        id: `temp-${Date.now()}`,
        type: 'new'
      }
      setFormData(prev => ({
        ...prev,
        padres: [...prev.padres, newParent]
      }))
      setParentForm({
        name: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        dni: '',
        telefono: '',
        email: '',
        direccion: '',
        ocupacion: '',
        relacion: 'padre'
      })
    }
  }

  const removeParent = (index) => {
    setFormData(prev => ({
      ...prev,
      padres: prev.padres.filter((_, i) => i !== index)
    }))
  }

  const validateForm = async () => {
    const newErrors = {}

    if (!formData.first_names.trim()) newErrors.first_names = 'Nombres son requeridos'
    if (!formData.last_names.trim()) newErrors.last_names = 'Apellidos son requeridos'
    if (!formData.dni.trim()) newErrors.dni = 'DNI es requerido'
    else if (!/^\d{8}$/.test(formData.dni)) newErrors.dni = 'DNI debe tener 8 dígitos'
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'Fecha de nacimiento es requerida'
    if (!formData.sexo) newErrors.sexo = 'Sexo es requerido'
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
      await createStudent(formData)
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
          <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Estudiante</h3>
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
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className={`input ${errors.fechaNacimiento ? 'border-red-500' : ''}`}
              />
              {errors.fechaNacimiento && <p className="text-red-500 text-xs mt-1">{errors.fechaNacimiento}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo *
              </label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                className={`input ${errors.sexo ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {errors.sexo && <p className="text-red-500 text-xs mt-1">{errors.sexo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
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
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="input"
              placeholder="Dirección de domicilio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Academic Assignment */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Asignación Académica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año Lectivo *
                </label>
                <select
                  name="academic_year_id"
                  value={formData.academic_year_id}
                  onChange={handleChange}
                  className={`input ${errors.academic_year_id ? 'border-red-500' : ''}`}
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
                  className={`input ${errors.nivel ? 'border-red-500' : ''}`}
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
                  className={`input ${errors.grado ? 'border-red-500' : ''}`}
                  disabled={!formData.nivel}
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
                  className={`input ${errors.seccion ? 'border-red-500' : ''}`}
                  disabled={!formData.grado}
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
              {isSubmitting ? 'Creando...' : 'Crear Estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateStudentModal
