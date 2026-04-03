/**
 * Modal para envío masivo de informes psicológicos
 */

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, Send, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import {
  REPORT_SCOPES,
  REPORT_SCOPE_LABELS,
  REPORT_SCOPE_DESCRIPTIONS,
  MESSAGES,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  UPLOAD_STATUS
} from '@/config/psychologicalReportsConstants'
import {
  getStudentsByScope,
  getDistributionPreview,
  formatFileSize,
  getFilterOptions
} from '@/utils/psychologicalReportsHelpers'
import { psychologicalReportsService } from '@/services/psychologicalReportsService'

const SendMassiveReportModal = ({
  isOpen,
  onClose,
  onSuccess,
  students,
  grades,
  selectedYear,
  yearStartDate,
  yearEndDate
}) => {
  const { user } = useAuthStore()

  // Límites de fecha para el año lectivo (usar las fechas reales del año académico)
  const minDate = yearStartDate || `${selectedYear}-01-01`
  const maxDate = yearEndDate || `${selectedYear}-12-31`

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

  // Validar que la fecha esté dentro del año lectivo
  const isDateValid = (date) => {
    return date >= minDate && date <= maxDate
  }

  // Estado del formulario
  const [selectedFile, setSelectedFile] = useState(null)
  const [issueDate, setIssueDate] = useState(getInitialDate())
  const [observations, setObservations] = useState('')
  const [scope, setScope] = useState(REPORT_SCOPES.ALL)
  const [scopeDetail, setScopeDetail] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Estado de carga
  const [status, setStatus] = useState(UPLOAD_STATUS.IDLE)
  const [errorMessage, setErrorMessage] = useState('')

  // Preview de distribución
  const [preview, setPreview] = useState({ count: 0, message: '' })

  // Obtener opciones de filtros dinámicamente de los estudiantes (memoizado para evitar bucles infinitos)
  const { levels, grades: availableGrades } = useMemo(
    () => getFilterOptions(students, selectedLevel),
    [students, selectedLevel]
  )

  // Actualizar preview cuando cambia el alcance
  useEffect(() => {
    if (students.length > 0) {
      const previewData = getDistributionPreview(students, scope, scopeDetail, levels)
      setPreview(previewData)
    }
  }, [scope, scopeDetail, students, levels])

  // Resetear al cambiar scope
  useEffect(() => {
    setScopeDetail('')
    setSelectedLevel('')
    setSearchTerm('')
  }, [scope])

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (!file) return

    // Validar tipo
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrorMessage(MESSAGES.ERROR_FILE_TYPE)
      return
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(MESSAGES.ERROR_FILE_SIZE)
      return
    }

    setSelectedFile(file)
    setErrorMessage('')
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value
    setIssueDate(newDate)

    if (!isDateValid(newDate)) {
      setErrorMessage(MESSAGES.ERROR_DATE_OUT_OF_YEAR(selectedYear))
    } else {
      setErrorMessage('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones
    if (!selectedFile) {
      setErrorMessage(MESSAGES.ERROR_NO_FILE)
      return
    }

    // Validar que la fecha esté dentro del año lectivo
    if (!isDateValid(issueDate)) {
      setErrorMessage(MESSAGES.ERROR_DATE_OUT_OF_YEAR(selectedYear))
      return
    }

    if (preview.count === 0) {
      setErrorMessage(MESSAGES.ERROR_NO_STUDENTS)
      return
    }

    // Confirmar envío masivo
    if (!window.confirm(MESSAGES.CONFIRM_MASSIVE(preview.count))) {
      return
    }

    setStatus(UPLOAD_STATUS.UPLOADING)
    setErrorMessage('')

    try {
      // Obtener estudiantes según alcance
      const targetStudents = getStudentsByScope(students, scope, scopeDetail)

      // Crear informes masivos usando FormData (uno por uno)
      const metadata = {
        selectedYear,
        issueDate,
        observations
      }

      const count = await psychologicalReportsService.createMassiveReports(
        targetStudents,
        metadata,
        selectedFile
      )

      setStatus(UPLOAD_STATUS.SUCCESS)

      setTimeout(() => {
        onSuccess(count)
        handleClose()
      }, 1500)
    } catch (error) {
      console.error('Error al enviar informes:', error)
      setErrorMessage('Error al enviar los informes: ' + error.message)
      setStatus(UPLOAD_STATUS.ERROR)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setIssueDate(getInitialDate())
    setObservations('')
    setScope(REPORT_SCOPES.ALL)
    setScopeDetail('')
    setSelectedLevel('')
    setSearchTerm('')
    setStatus(UPLOAD_STATUS.IDLE)
    setErrorMessage('')
    onClose()
  }

  if (!isOpen) return null

  // Filtrar estudiantes para búsqueda individual (solo con datos completos)
  const validStudents = students.filter(s => s.level_id && s.grade_id && s.section_id)

  const filteredStudents = scope === REPORT_SCOPES.INDIVIDUAL && searchTerm.length >= 2
    ? validStudents.filter(s => {
        const search = searchTerm.toLowerCase()
        const fullName = `${s.first_names || ''} ${s.last_names || ''} ${s.paternal_last_name || ''} ${s.maternal_last_name || ''}`.toLowerCase()
        return (
          fullName.includes(search) ||
          (s.dni || '').includes(searchTerm)
        )
      }).slice(0, 10)
    : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-t-xl">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Send size={28} />
              <div>
                <h2 className="text-2xl font-bold">Enviar Informe Psicológico</h2>
                <p className="text-purple-100 text-sm">Distribución masiva a estudiantes</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={status === UPLOAD_STATUS.UPLOADING}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Año lectivo */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-gray-700">
              Año Lectivo: <span className="text-purple-600 font-bold">{selectedYear}</span>
            </p>
          </div>

          {/* Mensajes de estado */}
          {status === UPLOAD_STATUS.SUCCESS && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
              <CheckCircle size={20} />
              <span className="font-medium">{MESSAGES.SUCCESS_MASSIVE(preview.count)}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
              <AlertCircle size={20} />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Fecha de emisión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Emisión del Informe *
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={handleDateChange}
              min={minDate}
              max={maxDate}
              required
              disabled={status === UPLOAD_STATUS.UPLOADING}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              La fecha debe estar entre {minDate} y {maxDate} (año lectivo {selectedYear})
            </p>
          </div>

          {/* Archivo PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo PDF *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
              <Upload className="mx-auto text-gray-400 mb-3" size={32} />
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
                disabled={status === UPLOAD_STATUS.UPLOADING}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium"
              >
                Seleccionar archivo PDF
              </label>
              {selectedFile && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg inline-flex items-center gap-2">
                  <FileText className="text-purple-600" size={20} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alcance de distribución */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enviar a: *
            </label>
            <div className="space-y-3">
              {Object.entries(REPORT_SCOPES).map(([key, value]) => (
                <label
                  key={value}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    scope === value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    value={value}
                    checked={scope === value}
                    onChange={(e) => setScope(e.target.value)}
                    disabled={status === UPLOAD_STATUS.UPLOADING}
                    className="mt-1 w-5 h-5 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{REPORT_SCOPE_LABELS[value]}</div>
                    <div className="text-sm text-gray-600">{REPORT_SCOPE_DESCRIPTIONS[value]}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Selector de nivel - usando datos dinámicos */}
          {scope === REPORT_SCOPES.LEVEL && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Nivel *
              </label>
              <select
                value={scopeDetail}
                onChange={(e) => setScopeDetail(e.target.value)}
                required
                disabled={status === UPLOAD_STATUS.UPLOADING}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Seleccionar nivel...</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selector de grado - primero nivel, luego grado */}
          {scope === REPORT_SCOPES.GRADE && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Nivel *
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => {
                    setSelectedLevel(e.target.value)
                    setScopeDetail('')
                  }}
                  required
                  disabled={status === UPLOAD_STATUS.UPLOADING}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Seleccionar nivel...</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedLevel && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Grado *
                  </label>
                  <select
                    value={scopeDetail}
                    onChange={(e) => setScopeDetail(e.target.value)}
                    required
                    disabled={status === UPLOAD_STATUS.UPLOADING}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar grado...</option>
                    {availableGrades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Buscador de estudiante individual */}
          {scope === REPORT_SCOPES.INDIVIDUAL && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Estudiante *
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Escribe al menos 2 caracteres para buscar..."
                disabled={status === UPLOAD_STATUS.UPLOADING}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />

              {/* Mensaje de ayuda */}
              {searchTerm.length > 0 && searchTerm.length < 2 && (
                <p className="mt-2 text-sm text-gray-500">
                  Escribe al menos 2 caracteres para buscar
                </p>
              )}

              {/* Lista de resultados */}
              {searchTerm.length >= 2 && filteredStudents.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {filteredStudents.map(student => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        setScopeDetail(student.id)
                        setSearchTerm(`${student.paternal_last_name || ''} ${student.maternal_last_name || ''}, ${student.first_names}${student.last_names ? ` ${student.last_names}` : ''}`)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors border-b last:border-b-0 ${
                        scopeDetail === student.id ? 'bg-purple-100' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {student.paternal_last_name || ''} {student.maternal_last_name || ''}, {student.first_names}{student.last_names ? ` ${student.last_names}` : ''}
                      </div>
                      <div className="text-sm text-gray-600">
                        {student.nivelNombre || student.level_name || `Nivel ${student.level_id}`} - {student.gradoNombre || student.grade_name || student.grade_id} {student.seccionNombre || student.section_name || student.section_id} | DNI: {student.dni}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No se encontraron resultados */}
              {searchTerm.length >= 2 && filteredStudents.length === 0 && (
                <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    No se encontraron estudiantes que coincidan con "{searchTerm}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Preview de distribución */}
          {preview.count > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-900">
                <Send size={20} />
                <div>
                  <p className="font-medium">
                    Se enviará a {preview.count} estudiante{preview.count !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-blue-700">{preview.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
              disabled={status === UPLOAD_STATUS.UPLOADING}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Observaciones adicionales sobre este informe..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={status === UPLOAD_STATUS.UPLOADING}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={status === UPLOAD_STATUS.UPLOADING || preview.count === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === UPLOAD_STATUS.UPLOADING ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar a {preview.count} estudiante{preview.count !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default SendMassiveReportModal
