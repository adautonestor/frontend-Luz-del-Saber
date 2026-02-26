import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { motion } from 'framer-motion'
import { Users, X, Clock, Loader } from 'lucide-react'
import { courseAssignmentsService } from '../../../services/courseAssignmentsService'
/**
 * Modal de detalles de asignaciones de profesores
 */
const AssignmentDetailsModal = ({
  show,
  course,
  selectedAcademicYear,
  grades,
  teachers,
  onClose
}) => {
  const [assignmentsForCourse, setAssignmentsForCourse] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadAssignments = async () => {
      if (!show || !course) return

      setLoading(true)
      try {
        const courseAssignments = await courseAssignmentsService.getAll() || []
        const academicYearId = typeof selectedAcademicYear === 'object'
          ? selectedAcademicYear.id
          : selectedAcademicYear
        const filtered = courseAssignments.filter(a => {
          const assignmentYearId = Number(a.academic_year_id || a.añoLectivoId || a.año_lectivo_id)
          return Number(a.course_id) === Number(course.id) && assignmentYearId === Number(academicYearId)
        })
        setAssignmentsForCourse(filtered)
      } catch (error) {
        console.error('Error loading course assignments:', error)
        setAssignmentsForCourse([])
      } finally {
        setLoading(false)
      }
    }

    loadAssignments()
  }, [show, course, selectedAcademicYear])

  if (!show || !course) return null

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  Asignaciones de Profesores
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {course.name} ({course.code})
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loading ? (
                <div className="text-center py-8">
                  <Loader className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
                  <p className="mt-2 text-sm text-gray-500">Cargando asignaciones...</p>
                </div>
              ) : assignmentsForCourse.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sin asignaciones</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No hay profesores asignados a este curso todavía.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignmentsForCourse.map(assignment => {
                    const grade = grades.find(g => g.id === assignment.grade_id)
                    const teacher = teachers.find(t => t.id === assignment.teacher_id)

                    return (
                      <div
                        key={assignment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {grade?.name || 'Grado no encontrado'}
                              </span>
                              {assignment.section_id && (
                                <span className="text-sm text-gray-500">
                                  Sección: {assignment.section_id}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary-600">
                                  {(assignment.teacher_first_name || teacher?.first_name || teacher?.name || '?').charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {assignment.teacher_last_names || assignment.teacher_first_name
                                    ? `${assignment.teacher_last_names || ''}, ${assignment.teacher_first_name || ''}`
                                    : teacher
                                      ? `${teacher.last_names || teacher.apellidoPaterno || ''}, ${teacher.first_name || teacher.name || ''}`
                                      : 'Profesor no encontrado'}
                                </p>
                                {teacher?.especialidad && (
                                  <p className="text-xs text-gray-500">
                                    {teacher.especialidad}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {assignment.weekly_hours || assignment.horasSemanalesTotales || 0}h/semana
                              </span>
                              {assignment.aula && (
                                <span>Aula: {assignment.aula}</span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                (assignment.status || assignment.state) === 'active' || (assignment.status || assignment.state) === 'activo'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {(assignment.status || assignment.state) === 'active' ? 'Activo' : (assignment.status || assignment.state)}
                              </span>
                            </div>

                            {assignment.observations && (
                              <p className="mt-2 text-sm text-gray-600 italic">
                                {assignment.observations}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={onClose}
                className="btn btn-primary px-6 py-2"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default AssignmentDetailsModal
