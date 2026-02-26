import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, Loader2, AlertCircle, CheckCircle, User } from 'lucide-react'
import { gradesService } from '../../../services/gradesService'
import { downloadReportCardPDF } from '../TeacherReportCardPDF'

/**
 * Modal para descargar boletas de notas
 * Permite seleccionar un estudiante y descargar su boleta del bimestre seleccionado
 */
const ReportCardDownloadModal = ({
  isOpen,
  onClose,
  students = [],
  selectedBimester,
  courseName = ''
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleDownload = async () => {
    if (!selectedStudent) {
      setError('Selecciona un estudiante')
      return
    }

    if (!selectedBimester) {
      setError('No hay un bimestre seleccionado')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Obtener datos de la boleta
      console.log('[ReportCardDownload] Solicitando boleta para estudiante:', selectedStudent.id, 'bimestre:', selectedBimester)
      const reportData = await gradesService.getReportCardData(selectedStudent.id, selectedBimester)
      console.log('[ReportCardDownload] Datos recibidos:', reportData)

      if (!reportData || !reportData.student) {
        throw new Error('No se encontraron datos para este estudiante')
      }

      // Verificar si hay cursos con notas
      if (!reportData.courses || reportData.courses.length === 0) {
        throw new Error(`No hay notas registradas para el ${selectedBimester}° Bimestre`)
      }

      // Verificar si hay al menos una nota en algún curso
      const totalGrades = reportData.courses.reduce((acc, course) => acc + (course.grades?.length || 0), 0)
      if (totalGrades === 0) {
        throw new Error(`No hay calificaciones registradas en ningún curso para el ${selectedBimester}° Bimestre`)
      }

      console.log('[ReportCardDownload] Total de cursos:', reportData.courses.length, 'Total de notas:', totalGrades)

      // Descargar el PDF
      await downloadReportCardPDF(reportData)
      setSuccess(true)

      // Cerrar modal despues de 2 segundos
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Error al descargar boleta:', err)
      setError(err.message || 'Error al generar la boleta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedStudent(null)
    setError('')
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-gray-900 bg-opacity-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white rounded-lg shadow-xl"
          >
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Descargar Boleta de Notas
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedBimester}° Bimestre {courseName && `- ${courseName}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {/* Error Message */}
              {error && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">Boleta descargada exitosamente</span>
                </div>
              )}

              {/* Student Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Seleccionar Estudiante
                </label>

                {students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-sm">No hay estudiantes disponibles</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Selecciona un grado y seccion para ver los estudiantes
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => {
                          setSelectedStudent(student)
                          setError('')
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                          selectedStudent?.id === student.id
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : ''
                        }`}
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.last_names}, {student.first_names}
                          </p>
                          <p className="text-xs text-gray-500">
                            DNI: {student.dni}
                          </p>
                        </div>
                        {selectedStudent?.id === student.id && (
                          <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  La boleta incluira todas las notas registradas del estudiante
                  para el {selectedBimester}° Bimestre, junto con los comentarios
                  y observaciones del docente.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isLoading || !selectedStudent || students.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Descargar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

export default ReportCardDownloadModal
