import React from 'react'
import { AlertCircle, BarChart3, TrendingUp } from 'lucide-react'

/**
 * Vista de reporte de cursos sin notas registradas
 * Muestra estadísticas, análisis por docente y tabla detallada
 */
const CoursesWithoutGradesView = ({ reportData }) => {
  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800">Cursos sin Notas</p>
              <p className="text-2xl font-semibold text-orange-900">{reportData.stats.coursesWithoutGrades}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Total Cursos</p>
              <p className="text-2xl font-semibold text-blue-900">{reportData.stats.totalCourses}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Estado Crítico</p>
              <p className="text-2xl font-semibold text-red-900">{reportData.stats.criticalCourses}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-800">% Sin Notas</p>
              <p className="text-2xl font-semibold text-purple-900">{reportData.stats.percentageWithoutGrades}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis por docente */}
      {reportData.stats.teacherStats && reportData.stats.teacherStats.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-yellow-800 mb-3">Docentes con Cursos sin Notas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {reportData.stats.teacherStats.slice(0, 6).map((teacher, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="font-medium text-gray-900">{teacher.name}</div>
                <div className="text-sm text-gray-600">{teacher.contact}</div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">{teacher.coursesWithoutGrades} cursos</span>
                  <span className="text-blue-600">{teacher.totalHours}h/sem</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de cursos sin notas */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {reportData.headers.map((header, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.data.map((course, index) => (
              <tr key={index} className={`hover:bg-gray-50 ${
                course.status === 'Crítico' ? 'bg-red-25' :
                course.status === 'Atención' ? 'bg-orange-25' : ''
              }`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{course.courseName}</div>
                  <div className="text-sm text-gray-500">{course.courseCode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {course.courseArea}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{course.level}</div>
                  <div className="text-sm text-gray-500">{course.grade}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                    {course.sections}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{course.assignedTeacher}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div>{course.teacherContact}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                  {course.weeklyHours}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {course.lastRegistry}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    course.status === 'Crítico' ? 'bg-red-100 text-red-800' :
                    course.status === 'Atención' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {course.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reportData.data.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">¡Excelente! Todos los cursos tienen notas registradas.</p>
        </div>
      )}
    </div>
  )
}

export default CoursesWithoutGradesView
