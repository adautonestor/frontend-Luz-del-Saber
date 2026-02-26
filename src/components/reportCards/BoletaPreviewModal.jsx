import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen } from 'lucide-react'

/**
 * Modal de vista previa de boleta de calificaciones
 * Muestra calificaciones por competencias, conducta, participación de padres y asistencia
 */
const BoletaPreviewModal = ({
  isOpen,
  onClose,
  student,
  boletaData,
  year
}) => {
  if (!isOpen || !student || !boletaData) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Boleta de Calificaciones</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {student.first_names} {student.last_names} - {student.gradeName} - Año {year}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Mensaje cuando no hay calificaciones */}
            {(!boletaData || boletaData.length === 0) && (
              <div className="card p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay calificaciones registradas
                </h3>
                <p className="text-sm text-gray-500">
                  Este estudiante aún no tiene calificaciones registradas para el año {year}.
                </p>
              </div>
            )}

            {/* Courses and Competencies */}
            {boletaData && boletaData.map((curso, cursoIndex) => (
              <div key={cursoIndex} className="card">
                <div className="p-4 bg-green-50 border-b border-green-200">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">{curso.cursoNombre}</h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Competencia
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bim I
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bim II
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bim III
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bim IV
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                          Promedio Anual
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {curso.competencias.map((comp, compIndex) => (
                        <tr key={compIndex} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{comp.name}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {comp.bimestre1 !== null ? comp.bimestre1 : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {comp.bimestre2 !== null ? comp.bimestre2 : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {comp.bimestre3 !== null ? comp.bimestre3 : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {comp.bimestre4 !== null ? comp.bimestre4 : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center bg-blue-50">
                            <span className="text-sm font-bold text-blue-900">
                              {comp.promedio !== null ? comp.promedio : '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-green-100 font-bold">
                        <td className="px-6 py-4 text-sm text-gray-900">PROMEDIO FINAL DEL CURSO</td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg text-green-900">{curso.promedioFinal || '-'}</span>
                        </td>
                      </tr>
                      <tr className={`${curso.competenciasDesaprobadas > 0 ? 'bg-red-50' : 'bg-blue-50'} font-semibold`}>
                        <td className="px-6 py-4 text-sm text-gray-900">N° DE COMPETENCIAS DESAPROBADAS</td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4 text-center">
                          {curso.competenciasDesaprobadas > 0 ? (
                            <span className="text-lg font-bold text-red-600">{curso.competenciasDesaprobadas}</span>
                          ) : (
                            <span className="text-lg font-bold text-green-600">0</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Behavior and Parent Participation - Siempre mostrar */}
            <div className="card">
                <div className="p-4 bg-orange-50 border-b border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900">Conducta y Participación de Padres</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bimestre
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Disciplina
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Calificación Padres
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comentarios
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[1, 2, 3, 4].map(bim => {
                        const behavior = student.studentBehaviors?.find(b => b.quarter === bim)
                        return (
                          <tr key={bim} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              Bimestre {bim}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-semibold text-gray-900">
                                {behavior?.discipline || behavior?.disciplina || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-semibold text-gray-900">
                                {behavior?.parent_rating || behavior?.calificacionPadres || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-700">
                                {behavior?.comments || behavior?.comentarios || '-'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                      <tr className="bg-orange-50">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          ASISTENCIA A REUNIONES (Año Completo)
                        </td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-orange-900">
                            {student.meetingAttendance?.formato || '0/0'}
                          </span>
                        </td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            {/* Attendance Report - Usa datos reales de student.attendanceData */}
            {student.attendanceData && (
              <div className="card">
                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900">Reporte de Asistencias</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bimestre
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Inasist. Justificada
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Inasist. Injustificada
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tard. Justificada
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tard. Injustificada
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {['B1', 'B2', 'B3', 'B4'].map((bimKey, index) => {
                        const bimData = student.attendanceData[bimKey] || {}
                        return (
                          <tr key={bimKey} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              Bimestre {index + 1}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-semibold text-yellow-600">
                                {bimData.inasistenciaJustificada || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-semibold text-red-600">
                                {bimData.inasistenciaInjustificada || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-semibold text-orange-500">
                                {bimData.tardanzaJustificada || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-semibold text-red-700">
                                {bimData.tardanzaInjustificada || 0}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                      <tr className="bg-blue-100 font-bold">
                        <td className="px-6 py-4 text-sm text-gray-900">TOTAL ANUAL</td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-yellow-700">
                            {['B1', 'B2', 'B3', 'B4'].reduce((sum, key) => sum + (student.attendanceData[key]?.inasistenciaJustificada || 0), 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-red-700">
                            {['B1', 'B2', 'B3', 'B4'].reduce((sum, key) => sum + (student.attendanceData[key]?.inasistenciaInjustificada || 0), 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-orange-600">
                            {['B1', 'B2', 'B3', 'B4'].reduce((sum, key) => sum + (student.attendanceData[key]?.tardanzaJustificada || 0), 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-red-800">
                            {['B1', 'B2', 'B3', 'B4'].reduce((sum, key) => sum + (student.attendanceData[key]?.tardanzaInjustificada || 0), 0)}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer with actions */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="btn btn-outline px-4 py-2"
            >
              Cerrar
            </button>
            {/* Botón de exportar se puede habilitar después si es necesario */}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default BoletaPreviewModal
