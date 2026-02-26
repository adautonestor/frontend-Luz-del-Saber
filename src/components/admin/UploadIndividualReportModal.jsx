/**
 * Modal para subir informe individual a un estudiante
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, FileText, AlertCircle } from 'lucide-react'
import {
  MESSAGES,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  UPLOAD_STATUS
} from '@/config/psychologicalReportsConstants'
import { formatFileSize } from '@/utils/psychologicalReportsHelpers'
import { psychologicalReportsService } from '../../services/psychologicalReportsService'

const UploadIndividualReportModal = ({ student, year, yearStartDate, yearEndDate, onClose, onSuccess }) => {
  // Límites de fecha para el año lectivo (usar las fechas reales del año académico)
  const minDate = yearStartDate || `${year}-01-01`
  const maxDate = yearEndDate || `${year}-12-31`

  // Calcular fecha inicial dentro del año lectivo
  const getInitialDate = () => {
    const today = new Date().toISOString().split('T')[0]
    // Si hoy está dentro del rango del año lectivo, usar hoy
    // Si no, usar la fecha de inicio del año lectivo
    if (today >= minDate && today <= maxDate) {
      return today
    }
    return minDate
  }

  const [selectedFile, setSelectedFile] = useState(null)
  const [issueDate, setIssueDate] = useState(getInitialDate())
  const [observations, setObservations] = useState('')
  const [status, setStatus] = useState(UPLOAD_STATUS.IDLE)
  const [errorMessage, setErrorMessage] = useState('')

  // Validar que la fecha esté dentro del año lectivo
  const isDateValid = (date) => {
    return date >= minDate && date <= maxDate
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value
    setIssueDate(newDate)

    if (!isDateValid(newDate)) {
      setErrorMessage(MESSAGES.ERROR_DATE_OUT_OF_YEAR(year))
    } else {
      setErrorMessage('')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (!file) return

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrorMessage(MESSAGES.ERROR_FILE_TYPE)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(MESSAGES.ERROR_FILE_SIZE)
      return
    }

    setSelectedFile(file)
    setErrorMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedFile) {
      setErrorMessage(MESSAGES.ERROR_NO_FILE)
      return
    }

    // Validar que la fecha esté dentro del año lectivo
    if (!isDateValid(issueDate)) {
      setErrorMessage(MESSAGES.ERROR_DATE_OUT_OF_YEAR(year))
      return
    }

    setStatus(UPLOAD_STATUS.UPLOADING)
    setErrorMessage('')

    try {
      const reportData = {
        student_id: student.id,
        academic_year: year,
        issue_date: issueDate,
        observations: observations.trim() || null
      }

      await psychologicalReportsService.create(reportData, selectedFile)

      setStatus(UPLOAD_STATUS.SUCCESS)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error) {
      console.error('Error subiendo informe:', error)
      setErrorMessage(error.message || 'Error al subir el informe')
      setStatus(UPLOAD_STATUS.ERROR)
    }
  }

  if (!student) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Subir Informe Psicológico
          </h2>
          <button
            onClick={onClose}
            disabled={status === UPLOAD_STATUS.UPLOADING}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">
            {student.last_names || `${student.apellidoPaterno} ${student.apellidoMaterno}`}, {student.first_names}
          </p>
          <p className="text-sm text-gray-600">
            {student.level_name || student.level_id} - {student.grade_name || student.grade_id} {student.section_name || student.section_id} | DNI: {student.dni}
          </p>
          <p className="text-sm text-gray-600">
            Año Lectivo: {year}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {status === UPLOAD_STATUS.SUCCESS && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {MESSAGES.SUCCESS_UPLOAD}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Emisión del Informe
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={handleDateChange}
              min={minDate}
              max={maxDate}
              required
              disabled={status === UPLOAD_STATUS.UPLOADING}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              La fecha debe estar entre {minDate} y {maxDate} (año lectivo {year})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo PDF
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
              <Upload className="mx-auto text-gray-400 mb-2" size={28} />
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
                disabled={status === UPLOAD_STATUS.UPLOADING}
                className="hidden"
                id="individual-file-upload"
              />
              <label
                htmlFor="individual-file-upload"
                className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium"
              >
                Seleccionar archivo PDF
              </label>
              {selectedFile && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg inline-flex items-center gap-2">
                  <FileText className="text-purple-600" size={18} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
              disabled={status === UPLOAD_STATUS.UPLOADING}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={status === UPLOAD_STATUS.UPLOADING}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={status === UPLOAD_STATUS.UPLOADING}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === UPLOAD_STATUS.UPLOADING ? 'Subiendo...' : 'Subir Informe'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default UploadIndividualReportModal
