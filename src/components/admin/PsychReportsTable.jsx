/**
 * Tabla de estudiantes con informes psicológicos
 */

import { motion } from 'framer-motion'
import { Upload, Eye, Download, Trash2, CheckCircle, XCircle } from 'lucide-react'

const PsychReportsTable = ({
  students,
  loading,
  hasReport,
  onViewReport,
  onDownloadReport,
  onDeleteReport,
  onUploadReport
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Estudiante</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">DNI</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Nivel</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Grado/Sección</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No se encontraron estudiantes
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const hasStudentReport = hasReport(student.id)

                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {hasStudentReport ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle size={20} className="mr-2" />
                          <span className="text-sm font-medium">Enviado</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <XCircle size={20} className="mr-2" />
                          <span className="text-sm font-medium">Sin informe</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {student.paternal_last_name || student.apellidoPaterno || ''} {student.maternal_last_name || student.apellidoMaterno || ''}, {student.first_names}{student.last_names ? ` ${student.last_names}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.dni}
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm text-gray-600">
                        {student.nivelNombre || student.level_name || student.nivel || `Nivel ${student.level_id}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.gradoNombre || student.grade_name || student.grado || student.grade_id} - {student.seccionNombre || student.section_name || student.seccion || student.section_id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {hasStudentReport ? (
                          <>
                            <button
                              onClick={() => onViewReport(student.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver informe"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => onDownloadReport(student.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Descargar informe"
                            >
                              <Download size={18} />
                            </button>
                            <button
                              onClick={() => onDeleteReport(student.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar informe"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onUploadReport(student)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                          >
                            <Upload size={16} />
                            Subir Informe
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PsychReportsTable
