import React, { useState, useEffect } from 'react'
import { academicAreasService } from '../../../../services/academic/academicAreasService'
import { generateCourseCode } from '../../../../utils/academic/codeGenerators'

/**
 * Campos básicos del formulario de curso
 */
// Áreas académicas por defecto (fallback si la API falla)
const DEFAULT_ACADEMIC_AREAS = [
  { id: 1, name: 'Comunicación' },
  { id: 2, name: 'Matemática' },
  { id: 3, name: 'Ciencia y Tecnología' },
  { id: 4, name: 'Personal Social' },
  { id: 5, name: 'Educación Física' },
  { id: 6, name: 'Arte y Cultura' },
  { id: 7, name: 'Inglés' },
  { id: 8, name: 'Educación Religiosa' }
]

const CourseBasicInfoFields = ({ courseForm, setCourseForm, selectedCourse, levels, courses = [], academicYears = [], selectedAcademicYear }) => {
  const [academicAreas, setAcademicAreas] = useState(DEFAULT_ACADEMIC_AREAS)
  const [areasLoading, setAreasLoading] = useState(true)

  // Obtener el año del año lectivo seleccionado
  const getSelectedAcademicYearNumber = () => {
    if (!selectedAcademicYear) return null
    const yearId = selectedAcademicYear?.id || selectedAcademicYear
    const yearObj = academicYears.find(y => y.id === Number(yearId))
    return yearObj?.year || yearObj?.año || null
  }

  // Cargar áreas académicas desde la base de datos
  useEffect(() => {
    const loadAreas = async () => {
      try {
        setAreasLoading(true)
        const areas = await academicAreasService.getAll()
        // Solo actualizar si se obtuvieron áreas válidas
        if (areas && areas.length > 0) {
          setAcademicAreas(areas)
        }
        // Si no hay áreas, mantener las por defecto
      } catch (error) {
        console.error('Error cargando áreas académicas:', error)
        // Mantener las áreas por defecto en caso de error
      } finally {
        setAreasLoading(false)
      }
    }
    loadAreas()
  }, [])
  const handleNombreChange = (newNombre) => {
    setCourseForm(prev => {
      let newCodigo = ''
      if (newNombre.trim() && prev.nivel) {
        // Buscar el nivel para obtener su nombre
        const level = levels?.find(l => l.id === prev.nivel)
        if (level) {
          // Pasar el año del año lectivo seleccionado
          const academicYear = getSelectedAcademicYearNumber()
          newCodigo = generateCourseCode(newNombre.trim(), level.name, courses, selectedCourse?.id, academicYear)
        }
      }
      return {
        ...prev,
        name: newNombre,
        code: newCodigo
      }
    })
  }

  const handleNivelChange = (newNivel) => {
    setCourseForm(prev => {
      let newCodigo = prev.code
      if (prev.name && newNivel) {
        try {
          // Buscar el nivel para obtener su nombre
          const level = levels?.find(l => l.id === newNivel)
          if (level) {
            // Pasar el año del año lectivo seleccionado
            const academicYear = getSelectedAcademicYearNumber()
            newCodigo = generateCourseCode(prev.name, level.name, courses, selectedCourse?.id, academicYear)
          }
        } catch (error) {
          console.error('Error generating code:', error)
        }
      }
      return {
        ...prev,
        nivel: newNivel,
        code: newCodigo
      }
    })
  }

  return (
    <>
      {/* Nombre del Curso y Código */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre del Curso *
          </label>
          <input
            type="text"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={courseForm.name}
            onChange={(e) => handleNombreChange(e.target.value)}
            placeholder="Ej: Álgebra, Geometría, etc."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Código (Automático)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
            value={courseForm.code}
            readOnly
            placeholder="Se genera automáticamente"
          />
        </div>
      </div>

      {/* Nivel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nivel *
        </label>
        <select
          className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          value={courseForm.nivel || ''}
          onChange={(e) => handleNivelChange(e.target.value ? parseInt(e.target.value) : '')}
          required
        >
          <option value="" disabled>Seleccionar nivel *</option>
          {levels && levels.map(level => (
            <option key={level.id} value={level.id}>
              {level.name.toUpperCase()}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-gray-500">
          El curso se aplicará a todos los grados de este nivel
        </p>
      </div>

      {/* Área Académica y Horas por Semana */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Área Académica *
          </label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            value={courseForm.area || ''}
            onChange={(e) => setCourseForm(prev => ({ ...prev, area: e.target.value ? parseInt(e.target.value) : '' }))}
            required
          >
            <option value="" disabled>Seleccionar área *</option>
            {academicAreas.map(area => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
          {!courseForm.area && (
            <p className="mt-1.5 text-xs text-yellow-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>Debes seleccionar un área académica</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Horas por Semana
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={courseForm.horasSemanales}
            onChange={(e) => setCourseForm(prev => ({ ...prev, horasSemanales: e.target.value }))}
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Descripción
        </label>
        <textarea
          className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
          rows="3"
          value={courseForm.description}
          onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder=""
        />
      </div>
    </>
  )
}

export default CourseBasicInfoFields
