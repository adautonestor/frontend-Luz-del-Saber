import React, { useEffect } from 'react'
import { useAcademicStore } from '../../../stores/academicStore'

console.log('🔥 AcademicEnrollmentStep SE ESTÁ CARGANDO - VERSIÓN ACTUALIZADA')

/**
 * Paso 2: Matrícula Académica
 * Selección de nivel, grado, sección, año lectivo, fecha de ingreso y código de barras
 */
const AcademicEnrollmentStep = ({
  formData,
  handleChange,
  errors,
  academicTree,
  getGradesForLevel,
  getSectionsForGrade
}) => {
  console.log('🎯 AcademicEnrollmentStep RENDERIZADO')

  const {
    levels,
    grades,
    sections,
    academicYears,
    initialize: initializeAcademic
  } = useAcademicStore()

  console.log('📊 Datos del store:', { levels: levels.length, grades: grades.length, sections: sections.length, academicYears: academicYears.length })

  useEffect(() => {
    // Initialize academic data if not loaded
    if (!levels.length || !academicYears.length) {
      console.log('Inicializando datos académicos en AcademicEnrollmentStep...')
      initializeAcademic()
    }
  }, [])

  // Debug: Log cuando cambien los datos académicos
  useEffect(() => {
    console.log('Datos académicos en AcademicEnrollmentStep:', {
      levels: levels.length,
      grades: grades.length,
      sections: sections.length,
      academicYears: academicYears.length
    })
  }, [levels, grades, sections, academicYears])

  // Funciones helper que usan los datos del store
  const getGradesForLevelById = (levelId) => {
    if (!levelId) return []
    return grades.filter(g => g.level_id === parseInt(levelId) || g.nivel === parseInt(levelId))
  }

  const getSectionsForGradeById = (gradeId) => {
    if (!gradeId) return []
    return sections.filter(s => s.grade_id === parseInt(gradeId) || s.grado === parseInt(gradeId))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Matrícula Académica</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="label">Nivel Educativo *</label>
          <select
            name="nivel"
            value={formData.nivel}
            onChange={handleChange}
            className={`input ${errors.nivel ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccionar nivel</option>
            {levels.map(level => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
          {errors.nivel && <p className="text-red-500 text-sm mt-1">{errors.nivel}</p>}
        </div>

        <div>
          <label className="label">Grado *</label>
          <select
            name="grado"
            value={formData.grado}
            onChange={handleChange}
            className={`input ${errors.grado ? 'border-red-500' : ''}`}
            disabled={!formData.nivel}
          >
            <option value="">Seleccionar grado</option>
            {getGradesForLevelById(formData.nivel).map(grade => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
          {errors.grado && <p className="text-red-500 text-sm mt-1">{errors.grado}</p>}
        </div>

        <div>
          <label className="label">Sección *</label>
          <select
            name="seccion"
            value={formData.seccion}
            onChange={handleChange}
            className={`input ${errors.seccion ? 'border-red-500' : ''}`}
            disabled={!formData.grado}
          >
            <option value="">Seleccionar sección</option>
            {getSectionsForGradeById(formData.grado).map(section => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
          {errors.seccion && <p className="text-red-500 text-sm mt-1">{errors.seccion}</p>}
        </div>

        <div>
          <label className="label">Año Lectivo *</label>
          <select
            name="anoLectivo"
            value={formData.anoLectivo}
            onChange={handleChange}
            className={`input ${errors.anoLectivo ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccionar año</option>
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>
                {year.name} ({year.year || year.año})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Año lectivo peruano (Marzo - Diciembre)
          </p>
          {errors.anoLectivo && <p className="text-red-500 text-sm mt-1">{errors.anoLectivo}</p>}
        </div>
      </div>

      <div className="mt-4">
        <label className="label">Fecha de Ingreso *</label>
        <input
          type="date"
          name="fechaIngreso"
          value={formData.fechaIngreso}
          onChange={handleChange}
          className={`input ${errors.fechaIngreso ? 'border-red-500' : ''}`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Fecha en que el estudiante ingresa a la institución. Las pensiones se generarán desde este mes en adelante.
        </p>
        <p className="text-xs text-blue-600 mt-1">
          <strong>Ejemplo:</strong> Si ingresa el 15 de Mayo, solo se generarán pensiones de Mayo a Diciembre.
        </p>
        {errors.fechaIngreso && <p className="text-red-500 text-sm mt-1">{errors.fechaIngreso}</p>}
      </div>

      <div>
        <label className="label">Código de Barras *</label>
        <input
          type="text"
          name="codigoBarras"
          value={formData.codigoBarras}
          onChange={handleChange}
          className={`input font-mono ${errors.codigoBarras ? 'border-red-500' : ''}`}
          placeholder="Ingrese el código de barras del estudiante"
        />
        <p className="text-xs text-gray-500 mt-1">
          Ingrese el código de barras que el colegio ya tiene asignado para este estudiante
        </p>
        {errors.codigoBarras && <p className="text-red-500 text-sm mt-1">{errors.codigoBarras}</p>}
      </div>

      <div>
        <label className="label">Observaciones</label>
        <textarea
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          className="input"
          rows="3"
          placeholder="Observaciones adicionales sobre el estudiante..."
        />
      </div>
    </div>
  )
}

export default AcademicEnrollmentStep
