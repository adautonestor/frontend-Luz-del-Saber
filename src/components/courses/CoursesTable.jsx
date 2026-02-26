import React, { useState, useEffect } from 'react'
import { BookOpen, Eye, Users, Edit, ChevronLeft, ChevronRight } from 'lucide-react'
import { courseAssignmentsService } from '../../services/courseAssignmentsService'
/**
 * Tabla de cursos con paginación
 */
const CoursesTable = ({
  paginatedCourses,
  filteredCourses,
  grades,
  levels,
  competencies,
  selectedAcademicYear,
  paginationInfo,
  onEditCourse,
  onViewCompetencies,
  onViewAssignments,
  onPageChange
}) => {
  const { currentPage, totalPages } = paginationInfo
  const [courseAssignments, setCourseAssignments] = useState([])

  // Load course assignments when academic year changes
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const assignments = await courseAssignmentsService.getAll() || []
        setCourseAssignments(assignments)
      } catch (error) {
        console.error('Error loading course assignments:', error)
        setCourseAssignments([])
      }
    }
    loadAssignments()
  }, [selectedAcademicYear])

  if (filteredCourses.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay cursos</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron cursos con los filtros aplicados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Curso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Área
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horas/Sem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profesores Asignados
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Competencias
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCourses.map((course, index) => {
              const grade = grades.find(g => g.id === course.grade_id)
              // Buscar nivel: primero por grade.level_id, luego por course.level_id o course.level_name
              const level = grade ? levels.find(l => l.id === grade.level_id) :
                            (course.level_id ? levels.find(l => Number(l.id) === Number(course.level_id)) :
                            (course.level_name ? levels.find(l => l.name === course.level_name) : null))

              // Mapeo de área del curso a academic_area_id para filtrar competencias
              const areaToIdMapping = {
                'comunicación': 1,
                'matemáticas': 2,
                'ciencias': 3,
                'sociales': 4,
                'educación física': 5,
                'arte': 6,
                'inglés': 7,
                'religión': 8
              }
              const courseAreaId = areaToIdMapping[(course.area || '').toLowerCase()]
              const courseLevelId = Number(course.level_id)

              // Filtrar competencias por área Y nivel del curso
              const competenciesCount = competencies.filter(c => {
                const matchesArea = c.academic_area_id === courseAreaId ||
                                   (c.area || '').toLowerCase() === (course.area || '').toLowerCase()
                const matchesLevel = Number(c.level_id) === courseLevelId
                return matchesArea && matchesLevel
              }).length

              // Obtener asignaciones - soportar múltiples nombres de campo
              const academicYearId = typeof selectedAcademicYear === 'object'
                ? selectedAcademicYear.id
                : selectedAcademicYear

              const assignmentsForCourse = courseAssignments.filter(a => {
                const assignmentYearId = Number(a.academic_year_id || a.añoLectivoId || a.año_lectivo_id)
                const courseIdMatch = Number(a.course_id) === Number(course.id)
                const yearMatch = assignmentYearId === Number(academicYearId)
                return courseIdMatch && yearMatch
              })

              const uniqueTeachers = [...new Set(assignmentsForCourse.map(a => a.teacher_id).filter(Boolean))]
              const assignedGradesCount = assignmentsForCourse.length

              return (
                <tr key={course.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        {course.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs" title={course.description}>
                            {course.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-900">{course.code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{course.area}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {level ? `${level.name.charAt(0).toUpperCase() + level.name.slice(1)}` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{course.weekly_hours || course.horasSemanales || 4}h</span>
                  </td>
                  <td className="px-6 py-4">
                    {assignedGradesCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {uniqueTeachers.length} profesor{uniqueTeachers.length > 1 ? 'es' : ''}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({assignedGradesCount} grado{assignedGradesCount > 1 ? 's' : ''})
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Sin asignar
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onViewCompetencies(course)}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <Eye size={14} />
                      Ver
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {assignedGradesCount > 0 && (
                        <button
                          onClick={() => onViewAssignments(course)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Ver asignaciones"
                        >
                          <Users size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onEditCourse(course)}
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Editar curso"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      page === currentPage
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoursesTable
