import React from 'react'
import { Users, AlertCircle } from 'lucide-react'

/**
 * Sección de asignación de profesores por grado
 */
const TeacherAssignmentSection = ({
  courseForm,
  setCourseForm,
  levels,
  teachers,
  getGradesByLevel
}) => {
  if (!courseForm.nivel) {
    return (
      <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4">
        <p className="text-sm text-yellow-800 flex items-center gap-2">
          <AlertCircle size={16} />
          Selecciona primero un nivel para asignar profesores por grado
        </p>
      </div>
    )
  }

  // courseForm.nivel puede ser el ID (número) o el nombre (string)
  const selectedLevel = typeof courseForm.nivel === 'number'
    ? levels.find(l => l.id === courseForm.nivel)
    : levels.find(l => l.name.toLowerCase() === courseForm.nivel?.toLowerCase())

  const gradesForLevel = getGradesByLevel(selectedLevel?.id)
    .sort((a, b) => (a.order || a.orden || 0) - (b.order || b.orden || 0))

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <Users size={18} className="text-gray-600" />
        Asignación de Profesores por Grado
      </h3>
      <p className="text-xs text-gray-600 mb-4">
        Asigna un profesor diferente para cada grado del nivel seleccionado
      </p>

      <div className="space-y-3">
        {gradesForLevel.map(grado => (
          <div key={grado.id} className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 min-w-[100px]">
                <span className="text-sm font-medium text-gray-700">
                  {grado.name || `${grado.order || grado.orden}° Grado`}
                </span>
              </div>
              <div className="flex-1">
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={courseForm.profesoresPorGrado[grado.id] || ''}
                  onChange={(e) => {
                    setCourseForm(prev => ({
                      ...prev,
                      profesoresPorGrado: {
                        ...prev.profesoresPorGrado,
                        [grado.id]: e.target.value
                      }
                    }))
                  }}
                >
                  <option value="">Sin profesor asignado</option>
                  {teachers
                    .sort((a, b) => {
                      const nameA = `${a.apellidoPaterno || a.last_names || ''} ${a.name || a.first_name || ''}`.toLowerCase()
                      const nameB = `${b.apellidoPaterno || b.last_names || ''} ${b.name || b.first_name || ''}`.toLowerCase()
                      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' })
                    })
                    .map(teacher => {
                      // Construir el nombre completo correctamente
                      const apellidos = [
                        teacher.apellidoPaterno || teacher.last_names || '',
                        teacher.apellidoMaterno || ''
                      ].filter(Boolean).join(' ').trim()

                      const nombre = teacher.name || teacher.first_name || ''

                      return (
                        <option key={teacher.id} value={teacher.id}>
                          {apellidos}, {nombre}
                        </option>
                      )
                    })}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeacherAssignmentSection
