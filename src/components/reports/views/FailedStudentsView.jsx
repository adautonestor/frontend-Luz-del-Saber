import React from 'react'
import { TrendingUp, Users, Activity } from 'lucide-react'

/**
 * Vista de reporte de estudiantes desaprobados
 * Muestra estadísticas, análisis por materia, filtros y tabla detallada
 */
const FailedStudentsView = ({
  reportData,
  failedStudentsFilters,
  setFailedStudentsFilters,
  setSelectedStudentCourses,
  setShowCoursesModal
}) => {
  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Estudiantes Desaprobados</p>
              <p className="text-2xl font-semibold text-red-900">{reportData.stats.totalFailedStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-blue-900">{reportData.stats.totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800">Tasa de Desaprobación</p>
              <p className="text-2xl font-semibold text-orange-900">{reportData.stats.failureRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis por materia */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Materia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportData.stats.subjectStats.map((subject, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  {subject.failedCount} estudiantes
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">Área: {subject.area}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Promedio desaprobados:</span>
                  <span className="ml-1 font-semibold text-red-600">{subject.averageGrade}</span>
                </div>
                <div>
                  <span className="text-gray-500">% Desaprobación:</span>
                  <span className="ml-1 font-semibold text-red-600">{subject.failurePercentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro por Nivel */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nivel</label>
            <select
              value={failedStudentsFilters.nivel}
              onChange={(e) => setFailedStudentsFilters({...failedStudentsFilters, nivel: e.target.value, grado: 'todos', seccion: 'todos'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los niveles</option>
              <option value="Inicial">Inicial</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
            </select>
          </div>

          {/* Filtro por Grado */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Grado</label>
            <select
              value={failedStudentsFilters.grado}
              onChange={(e) => setFailedStudentsFilters({...failedStudentsFilters, grado: e.target.value, seccion: 'todos'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los grados</option>
              {Array.from(new Set(reportData.data.map(s => s.grade))).sort().map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Sección */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sección</label>
            <select
              value={failedStudentsFilters.seccion}
              onChange={(e) => setFailedStudentsFilters({...failedStudentsFilters, seccion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todas las secciones</option>
              {Array.from(new Set(reportData.data.map(s => s.section))).sort().map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Cursos Desaprobados */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mín. Cursos Desaprobados</label>
            <select
              value={failedStudentsFilters.minCursosDesaprobados}
              onChange={(e) => setFailedStudentsFilters({...failedStudentsFilters, minCursosDesaprobados: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Cualquier cantidad</option>
              <option value="1">1 o más</option>
              <option value="2">2 o más</option>
              <option value="3">3 o más</option>
              <option value="4">4 o más</option>
            </select>
          </div>
        </div>

        {/* Botón limpiar filtros */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => setFailedStudentsFilters({nivel: 'todos', grado: 'todos', seccion: 'todos', minCursosDesaprobados: 0})}
            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla detallada de estudiantes */}
      <div className="overflow-x-auto">
        <div className="mb-3 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">
              {reportData.data.filter(student => {
                if (failedStudentsFilters.nivel !== 'todos' && student.level !== failedStudentsFilters.nivel) return false
                if (failedStudentsFilters.grado !== 'todos' && student.grade !== failedStudentsFilters.grado) return false
                if (failedStudentsFilters.seccion !== 'todos' && student.section !== failedStudentsFilters.seccion) return false
                if (student.failedSubjectsCount < failedStudentsFilters.minCursosDesaprobados) return false
                return true
              }).length}
            </span> de <span className="font-semibold">{reportData.data.length}</span> estudiantes
          </p>
        </div>
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
            {reportData.data
              .filter(student => {
                // Filtrar por nivel
                if (failedStudentsFilters.nivel !== 'todos' && student.level !== failedStudentsFilters.nivel) {
                  return false
                }
                // Filtrar por grado
                if (failedStudentsFilters.grado !== 'todos' && student.grade !== failedStudentsFilters.grado) {
                  return false
                }
                // Filtrar por sección
                if (failedStudentsFilters.seccion !== 'todos' && student.section !== failedStudentsFilters.seccion) {
                  return false
                }
                // Filtrar por mínimo de cursos desaprobados
                if (student.failedSubjectsCount < failedStudentsFilters.minCursosDesaprobados) {
                  return false
                }
                return true
              })
              .map((student, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{student.studentName}</div>
                  <div className="text-sm text-gray-500">{student.studentEmail}</div>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {student.studentCode}
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.level?.toLowerCase() === 'inicial' ? 'bg-blue-100 text-blue-800' :
                    student.level?.toLowerCase() === 'primaria' ? 'bg-green-100 text-green-800' :
                    student.level?.toLowerCase() === 'secundaria' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {student.level}
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.grade}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {student.section}
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-center">
                  <button
                    onClick={() => {
                      setSelectedStudentCourses({
                        studentName: student.studentName,
                        subjects: student.subjects
                      })
                      setShowCoursesModal(true)
                    }}
                    className={`font-semibold px-3 py-1.5 rounded-full text-white hover:opacity-80 transition-opacity ${
                      student.failedSubjectsCount >= 3 ? 'bg-red-500' :
                      student.failedSubjectsCount >= 2 ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`}
                  >
                    Ver {student.failedSubjectsCount}
                  </button>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm">
                  {student.parentContact === 'Sin contacto' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-300">
                        ⚠️ SIN CONTACTO
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-900 font-medium">
                      {student.parentContact}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FailedStudentsView
