import React from 'react'

/**
 * Campos de detalles del curso (objetivos, metodología, etc.)
 */
const CourseDetailsFields = ({ courseForm, setCourseForm }) => {
  return (
    <>
      {/* Objetivos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Objetivos
        </label>
        <textarea
          className="w-full px-3 py-2.5 border-2 border-blue-400 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
          rows="3"
          value={courseForm.objectives}
          onChange={(e) => setCourseForm(prev => ({ ...prev, objectives: e.target.value }))}
          placeholder="Objetivos de aprendizaje del curso..."
        />
      </div>

      {/* Metodología */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Metodología
        </label>
        <textarea
          className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
          rows="3"
          value={courseForm.methodology}
          onChange={(e) => setCourseForm(prev => ({ ...prev, methodology: e.target.value }))}
          placeholder="Metodología de enseñanza..."
        />
      </div>

      {/* Recursos y Sistema de Evaluación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Recursos
          </label>
          <textarea
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            rows="3"
            value={courseForm.resources}
            onChange={(e) => setCourseForm(prev => ({ ...prev, resources: e.target.value }))}
            placeholder="Recursos necesarios..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Sistema de Evaluación
          </label>
          <textarea
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            rows="3"
            value={courseForm.evaluation}
            onChange={(e) => setCourseForm(prev => ({ ...prev, evaluation: e.target.value }))}
            placeholder="Criterios de evaluación..."
          />
        </div>
      </div>
    </>
  )
}

export default CourseDetailsFields
