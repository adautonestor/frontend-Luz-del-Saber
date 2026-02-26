import React, { useState, useEffect } from 'react'
import { BookOpen, AlertTriangle } from 'lucide-react'
import { useAcademicStore } from '../../stores/academicStore'
import { structureService } from '../../services/academic/structureService'
import { matriculationService } from '../../services/matriculationService'

/**
 * Componente de asignación académica
 * Flujo: Año Lectivo -> Nivel -> Grado -> Sección -> Fecha de Ingreso
 * Los datos se cargan dinámicamente según el año lectivo seleccionado
 */
const AcademicAssignment = ({
  formData,
  availableYears,
  handleChange,
  studentId,
  studentName
}) => {
  const { academicYears, initialize: initializeAcademic } = useAcademicStore()

  // Estados locales para datos dinámicos por año lectivo
  const [levels, setLevels] = useState([])
  const [grades, setGrades] = useState([])
  const [sections, setSections] = useState([])
  const [loadingStructure, setLoadingStructure] = useState(false)
  const [matriculaExistente, setMatriculaExistente] = useState(false)

  // Inicializar años lectivos
  useEffect(() => {
    if (!academicYears.length) {
      initializeAcademic()
    }
  }, [])

  // Verificar si el estudiante ya tiene matrícula en el año seleccionado
  useEffect(() => {
    const checkExistingMatriculation = async () => {
      if (!studentId || !formData.anoLectivo) {
        setMatriculaExistente(false)
        return
      }

      try {
        const matriculations = await matriculationService.getAll()
        const exists = matriculations.some(m =>
          m.student_id === studentId &&
          (m.academic_year_id === parseInt(formData.anoLectivo) ||
           parseInt(m.academic_year_id) === parseInt(formData.anoLectivo))
        )
        setMatriculaExistente(exists)
      } catch (error) {
        console.error('Error verificando matrícula:', error)
        setMatriculaExistente(false)
      }
    }

    checkExistingMatriculation()
  }, [studentId, formData.anoLectivo])

  // Cargar estructura académica cuando cambie el año lectivo
  useEffect(() => {
    const loadStructureForYear = async () => {
      if (!formData.anoLectivo) {
        setLevels([])
        setGrades([])
        setSections([])
        return
      }

      setLoadingStructure(true)
      try {
        const yearObj = academicYears.find(y => y.id === parseInt(formData.anoLectivo))
        if (yearObj) {
          const structure = await structureService.loadAcademicStructure(yearObj)
          setLevels(structure.levels || [])
          setGrades(structure.grades || [])
          setSections(structure.sections || [])
        }
      } catch (error) {
        console.error('Error cargando estructura para el año:', error)
        setLevels([])
        setGrades([])
        setSections([])
      } finally {
        setLoadingStructure(false)
      }
    }

    if (academicYears.length > 0) {
      loadStructureForYear()
    }
  }, [formData.anoLectivo, academicYears])

  // Limpiar nivel, grado y sección cuando cambie el año lectivo
  useEffect(() => {
    if (formData.anoLectivo) {
      // Limpiar selecciones dependientes
      handleChange({ target: { name: 'nivel', value: '' } })
      handleChange({ target: { name: 'grado', value: '' } })
      handleChange({ target: { name: 'seccion', value: '' } })
    }
  }, [formData.anoLectivo])

  // Funciones helper para filtrar datos dinámicamente
  const getGradesForLevel = (levelId) => {
    if (!levelId) return []
    return grades.filter(g => g.level_id === parseInt(levelId))
  }

  const getSectionsForGrade = (gradeId) => {
    if (!gradeId) return []
    return sections.filter(s => s.grade_id === parseInt(gradeId))
  }

  // Obtener el año lectivo seleccionado
  const selectedAcademicYear = academicYears.find(y => y.id === parseInt(formData.anoLectivo))

  // Formatear fecha para input date (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  // Obtener fecha mínima y máxima del año lectivo
  const getMinDate = () => {
    if (!selectedAcademicYear) return ''
    return formatDateForInput(selectedAcademicYear.start_date || selectedAcademicYear.fecha_inicio)
  }

  const getMaxDate = () => {
    if (!selectedAcademicYear) return ''
    return formatDateForInput(selectedAcademicYear.end_date || selectedAcademicYear.fecha_fin)
  }

  // Auto-completar fecha de ingreso cuando se selecciona año lectivo
  useEffect(() => {
    if (selectedAcademicYear) {
      const startDate = selectedAcademicYear.start_date || selectedAcademicYear.fecha_inicio
      if (startDate) {
        const syntheticEvent = {
          target: {
            name: 'fechaIngreso',
            value: formatDateForInput(startDate)
          }
        }
        handleChange(syntheticEvent)
      }
    }
  }, [formData.anoLectivo])

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <BookOpen className="mr-2" size={20} />
        Asignación Académica
      </h3>

      {/* Alerta si el estudiante ya tiene matrícula en el año seleccionado */}
      {matriculaExistente && (
        <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg flex items-start">
          <AlertTriangle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-red-800">
              El estudiante ya tiene matrícula en este año lectivo
            </p>
            <p className="text-sm text-red-700 mt-1">
              {studentName ? `"${studentName}"` : 'Este estudiante'} ya está matriculado en el año lectivo seleccionado.
              No es posible crear otra matrícula para el mismo año.
            </p>
          </div>
        </div>
      )}

      {/* 1. Año Lectivo, Nivel, Grado, Sección */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Año Lectivo *
          </label>
          <select
            name="anoLectivo"
            value={formData.anoLectivo}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">Seleccionar año</option>
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>
                {year.name} ({year.year || year.año})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel *
          </label>
          <select
            name="nivel"
            value={formData.nivel}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${!formData.anoLectivo || matriculaExistente ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
            disabled={!formData.anoLectivo || loadingStructure || matriculaExistente}
          >
            <option value="">{loadingStructure ? 'Cargando...' : 'Seleccionar nivel'}</option>
            {levels.map(level => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grado *
          </label>
          <select
            name="grado"
            value={formData.grado}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${!formData.nivel || matriculaExistente ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
            disabled={!formData.nivel || matriculaExistente}
          >
            <option value="">Seleccionar grado</option>
            {getGradesForLevel(formData.nivel).map(grade => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sección *
          </label>
          <select
            name="seccion"
            value={formData.seccion}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${!formData.grado || matriculaExistente ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
            disabled={!formData.grado || matriculaExistente}
          >
            <option value="">Seleccionar sección</option>
            {getSectionsForGrade(formData.grado).map(section => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fecha de Ingreso */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Ingreso *
        </label>
        <input
          type="date"
          name="fechaIngreso"
          value={formData.fechaIngreso}
          onChange={handleChange}
          min={getMinDate()}
          max={getMaxDate()}
          disabled={!formData.anoLectivo || matriculaExistente}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${!formData.anoLectivo || matriculaExistente ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Fecha de ingreso del estudiante. Las pensiones se generarán desde este mes.
        </p>
      </div>
    </div>
  )
}

export default AcademicAssignment
