import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, CircleDot, Users, Search } from 'lucide-react'
import { getTodayLima } from '../../utils/dateUtils'

const AttendanceRegistrationTable = ({
  selectedCourse,
  selectedSection,
  selectedDate,
  setSelectedDate,
  selectedQuarter,
  setSelectedQuarter,
  searchTerm,
  setSearchTerm,
  filteredStudents,
  getStudentRecord,
  getStatusColor,
  getStatusText,
  handleRegisterAttendance,
  toggleLateJustified,
  toggleAbsenceJustified,
  setSelectedRecord,
  setShowJustifyModal,
  saving
}) => {
  return (
    <>
      {/* Date Selector, Quarter Selector & Search */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Fecha:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={getTodayLima()}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Bimestre:</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Bimestre 1</option>
                <option value={2}>Bimestre 2</option>
                <option value={3}>Bimestre 3</option>
                <option value={4}>Bimestre 4</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 md:max-w-md">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Students Registration Table */}
      <div className="card">
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <h3 className="font-semibold text-blue-900">
            Registro de Asistencia - {selectedCourse.name} {selectedCourse.gradeName} Sección {selectedSection.name}
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            {new Date(selectedDate).toLocaleDateString('es-PE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Actual
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marcar como
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student, index) => {
                const record = getStudentRecord(student.id)
                const currentStatus = record?.estadoEntrada || null

                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {`${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || '-'}, {student.first_names}{student.last_names ? ` ${student.last_names}` : ''}
                      </div>
                      <div className="text-sm text-gray-500">DNI: {student.dni}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {currentStatus ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                          {getStatusText(currentStatus)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Sin registro</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleRegisterAttendance(student.id, 'asistio')}
                          disabled={saving}
                          className={`p-2 rounded transition-colors ${
                            currentStatus === 'asistio'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title="Asistió"
                        >
                          <CheckCircle size={16} />
                        </button>

                        <button
                          onClick={() => handleRegisterAttendance(student.id, 'tardanza')}
                          disabled={saving}
                          className={`p-2 rounded transition-colors ${
                            currentStatus === 'tardanza'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                          title="Tardanza"
                        >
                          <AlertTriangle size={16} />
                        </button>

                        <button
                          onClick={() => handleRegisterAttendance(student.id, 'falta')}
                          disabled={saving}
                          className={`p-2 rounded transition-colors ${
                            currentStatus === 'falta'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                          title="Falta"
                        >
                          <XCircle size={16} />
                        </button>

                        <button
                          onClick={() => handleRegisterAttendance(student.id, 'blanco')}
                          disabled={saving}
                          className={`p-2 rounded transition-colors ${
                            currentStatus === 'blanco'
                              ? 'bg-gray-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title="Blanco"
                        >
                          <CircleDot size={16} />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex gap-2 justify-center">
                        {/* Botón justificar tardanza */}
                        {record && record.estadoEntrada === 'tardanza' && (
                          <button
                            onClick={() => toggleLateJustified(record.id)}
                            disabled={saving}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              record.tardanzaJustificada
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title={record.tardanzaJustificada ? 'Tardanza justificada' : 'Justificar tardanza'}
                          >
                            {record.tardanzaJustificada ? '✓ T.Just.' : 'Just. Tard.'}
                          </button>
                        )}
                        {/* Botón justificar falta */}
                        {record && record.estadoEntrada === 'falta' && (
                          <button
                            onClick={() => toggleAbsenceJustified(record.id)}
                            disabled={saving}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              record.faltaJustificada
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title={record.faltaJustificada ? 'Falta justificada' : 'Justificar falta'}
                          >
                            {record.faltaJustificada ? '✓ F.Just.' : 'Just. Falta'}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="font-medium">No se encontraron estudiantes</p>
                      <p className="text-sm mt-1">
                        {searchTerm ? 'Intenta con otro término de búsqueda' : 'No hay estudiantes matriculados en esta sección'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default AttendanceRegistrationTable
