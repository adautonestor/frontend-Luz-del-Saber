import React from 'react'
import { Clock, Info, User, GraduationCap, Building2 } from 'lucide-react'

/**
 * Sección de información del estudiante en el dashboard
 * Nota: El sistema no gestiona horarios específicos de clases,
 * por lo que solo mostramos información básica del estudiante.
 */
const DashboardSchedule = ({
  myChildren,
  selectedChild,
  setSelectedChild,
  childInfo,
  weeklySchedule,
  loading,
  expandedDay,
  setExpandedDay,
  maxDays = 3
}) => {
  if (myChildren.length === 0) return null

  // Obtener nombre del estudiante
  const getStudentName = (child) => {
    if (child.name) return child.name
    const firstName = child.first_names || ''
    const lastName = child.last_names || ''
    return `${firstName} ${lastName}`.trim() || 'Sin nombre'
  }

  // Obtener grado y sección del estudiante directamente del hijo
  const getStudentGrade = () => {
    if (!selectedChild) return 'Sin asignar'
    return selectedChild.grade_name || selectedChild.gradoNombre ||
           childInfo?.gradoNombre || 'Sin asignar'
  }

  const getStudentSection = () => {
    if (!selectedChild) return ''
    return selectedChild.section_name || selectedChild.seccionNombre ||
           childInfo?.seccionNombre || ''
  }

  // Obtener nivel del estudiante directamente del hijo
  const getStudentLevel = () => {
    if (!selectedChild) return 'Sin asignar'
    // Intentar obtener de múltiples fuentes
    const nivel = selectedChild.level_name ||
                  selectedChild.nivelNombre ||
                  selectedChild.nivel ||
                  selectedChild.level ||
                  childInfo?.nivel ||
                  childInfo?.nivelNombre
    // Si viene 'N/A' o está vacío, mostrar alternativa
    if (!nivel || nivel === 'N/A') return 'Sin asignar'
    return nivel
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Información del Estudiante</h3>
      </div>

      {/* Child Selector - Solo si hay más de un hijo */}
      {myChildren.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Estudiante
          </label>
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = myChildren.find(c => c.id === e.target.value || c.id === parseInt(e.target.value))
              setSelectedChild(child)
            }}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {myChildren.map(child => (
              <option key={child.id} value={child.id}>
                {getStudentName(child)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Student Info */}
      {selectedChild && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600 mb-1">Estudiante</p>
              <p className="font-semibold text-gray-900">
                {getStudentName(selectedChild)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600 mb-1">Grado y Sección</p>
              <p className="font-semibold text-gray-900">
                {getStudentGrade()}{getStudentSection() ? ` - ${getStudentSection()}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600 mb-1">Nivel</p>
              <p className="font-semibold text-gray-900 capitalize">
                {getStudentLevel()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje informativo sobre horarios */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600">
              Los horarios de clases son proporcionados directamente por la institución educativa.
              Para consultar el horario específico de su hijo(a), comuníquese con la administración del colegio.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSchedule
