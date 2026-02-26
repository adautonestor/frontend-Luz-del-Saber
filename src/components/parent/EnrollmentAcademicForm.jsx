import React from 'react'
import { capitalizeFirst } from '../../utils/enrollmentHelpers.jsx'

/**
 * Formulario de selección académica (Paso 2)
 * Permite seleccionar nivel, grado y sección para la matrícula
 * @param {Object} formData - Datos del formulario
 * @param {Object} formErrors - Errores de validación
 * @param {Array} academicTree - Árbol de estructura académica (niveles, grados, secciones)
 * @param {Function} onInputChange - Handler para cambios en inputs
 * @param {Function} onLevelChange - Handler para cambio de nivel
 * @param {Function} onGradeChange - Handler para cambio de grado
 * @param {Function} onSectionChange - Handler para cambio de sección
 * @param {Function} getSelectedLevel - Función para obtener nivel seleccionado
 * @param {Function} getSelectedGrade - Función para obtener grado seleccionado
 */
const EnrollmentAcademicForm = ({
  formData,
  formErrors,
  academicTree,
  onInputChange,
  onLevelChange,
  onGradeChange,
  onSectionChange,
  getSelectedLevel,
  getSelectedGrade
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Selección Académica
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nivel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nivel *
          </label>
          <select
            value={academicTree.find(l => l.name === formData.nivel)?.id || ''}
            onChange={(e) => onLevelChange(e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500
              ${formErrors.nivel ? 'border-red-500' : 'border-gray-300'}
            `}
          >
            <option value="">Selecciona nivel</option>
            {academicTree.map((level) => (
              <option key={level.id} value={level.id}>
                {capitalizeFirst(level.name)}
              </option>
            ))}
          </select>
          {formErrors.nivel && (
            <p className="text-red-500 text-sm mt-1">{formErrors.nivel}</p>
          )}
        </div>

        {/* Grado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grado *
          </label>
          <select
            value={getSelectedGrade()?.id || ''}
            onChange={(e) => onGradeChange(e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500
              ${formErrors.grado ? 'border-red-500' : 'border-gray-300'}
            `}
            disabled={!formData.nivel}
          >
            <option value="">Selecciona grado</option>
            {getSelectedLevel()?.grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
          {formErrors.grado && (
            <p className="text-red-500 text-sm mt-1">{formErrors.grado}</p>
          )}
        </div>

        {/* Sección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sección *
          </label>
          <select
            value={getSelectedGrade()?.sections.find(s => s.name === formData.seccion)?.id || ''}
            onChange={(e) => onSectionChange(e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500
              ${formErrors.seccion ? 'border-red-500' : 'border-gray-300'}
            `}
            disabled={!formData.grado}
          >
            <option value="">Selecciona sección</option>
            {getSelectedGrade()?.sections.map((section) => (
              <option key={section.id} value={section.id}>
                Sección {section.name} (Capacidad: {section.capacidad || 30})
              </option>
            ))}
          </select>
          {formErrors.seccion && (
            <p className="text-red-500 text-sm mt-1">{formErrors.seccion}</p>
          )}
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones
        </label>
        <textarea
          value={formData.observations}
          onChange={(e) => onInputChange('observations', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Información adicional o comentarios especiales..."
        />
      </div>
    </div>
  )
}

export default EnrollmentAcademicForm
