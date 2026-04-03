import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import studentsService from '../../services/studentsService'

const AttendanceMonthlyReport = ({
  selectedCourse,
  selectedSection,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  exportToExcel,
  getMonthlyStats
}) => {
  const [classStudents, setClassStudents] = useState([])
  const [loading, setLoading] = useState(true)

  // Cargar estudiantes cuando cambie el curso o sección
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedCourse || !selectedSection) {
        setClassStudents([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const students = await studentsService.getAll() || []
        const filtered = students.filter(
          s => s.grade_id === selectedCourse.grade_id && s.section_id === selectedSection.id
        )
        // Ordenar por apellidos
        filtered.sort((a, b) =>
          `${a.paternal_last_name || ''} ${a.maternal_last_name || ''} ${a.first_names || ''}`.localeCompare(`${b.paternal_last_name || ''} ${b.maternal_last_name || ''} ${b.first_names || ''}`)
        )
        setClassStudents(filtered)
      } catch (error) {
        console.error('Error loading students:', error)
        setClassStudents([])
      } finally {
        setLoading(false)
      }
    }

    loadStudents()
  }, [selectedCourse?.id, selectedSection?.id])

  return (
    <>
      {/* Month/Year Selector */}
      <div className="card p-4">
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Periodo:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleDateString('es-PE', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <button
            onClick={exportToExcel}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download size={18} />
            Exportar a Excel
          </button>
        </div>
      </div>

      {/* Monthly Report */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Reporte Mensual de Asistencia</h3>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando estudiantes...</p>
          </div>
        ) : classStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay estudiantes en esta sección
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Asistió</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tardanzas</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Faltas</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Blanco</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">% Asistencia</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classStudents.map((student, index) => {
                  const stats = getMonthlyStats(student.id, selectedYear, selectedMonth)

                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {`${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || '-'}, {student.first_names}{student.last_names ? ` ${student.last_names}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{stats?.total || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-green-600">{stats?.asistio || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-yellow-600">{stats?.tardanzas || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-red-600">{stats?.faltas || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-600">{stats?.blanco || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                            <div
                              className={`h-2 rounded-full ${
                                (stats?.porcentajeAsistencia || 0) >= 90
                                  ? 'bg-green-600'
                                  : (stats?.porcentajeAsistencia || 0) >= 75
                                  ? 'bg-yellow-600'
                                  : 'bg-red-600'
                              }`}
                              style={{ width: `${stats?.porcentajeAsistencia || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{stats?.porcentajeAsistencia || 0}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default AttendanceMonthlyReport
