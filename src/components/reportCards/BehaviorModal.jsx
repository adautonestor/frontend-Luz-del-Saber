import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, CheckCircle } from 'lucide-react'
import { getAverageGradingScale } from '@/utils/gradeConversion.jsx'

/**
 * Modal para registrar conducta y calificación de padres de un estudiante
 * Permite registrar disciplina, calificación de padres y comentarios por bimestre
 */
const BehaviorModal = ({
  isOpen,
  onClose,
  student,
  behaviorData,
  onBimesterChange,
  onDataChange,
  onSave,
  saveSuccess,
  validationErrors
}) => {
  if (!isOpen || !student) return null

  // Para conducta SIEMPRE usar sistema numérico (0-20)
  const usesLetterGrades = false

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Registrar Conducta
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {student.first_names} {student.last_names} - {student.gradeName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Success Message */}
            {saveSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                <CheckCircle size={20} />
                <span>Datos guardados correctamente</span>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-800 mb-2">Errores de validación:</p>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bimester Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bimestre
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(bim => (
                  <button
                    key={bim}
                    onClick={() => onBimesterChange(bim)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      behaviorData.quarter === bim
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Bim {bim}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Disciplina */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disciplina
                  <span className="text-gray-500 ml-2">
                    ({usesLetterGrades ? 'AD, A, B, C' : '0-20'})
                  </span>
                </label>
                {usesLetterGrades ? (
                  <select
                    value={behaviorData.disciplina || ''}
                    onChange={(e) => onDataChange({ ...behaviorData, disciplina: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">Seleccionar calificación (opcional)</option>
                    {getAverageGradingScale(student?.level_id).map(item => (
                      <option key={item.letter} value={item.letter}>
                        {item.letter} - {item.description}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={behaviorData.disciplina || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 20)) {
                        onDataChange({ ...behaviorData, disciplina: val })
                      }
                    }}
                    className="input w-full"
                    placeholder="Ingresar nota del 0 al 20 (opcional)"
                  />
                )}
              </div>

              {/* Calificación de Padres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación de Padres <span className="text-gray-400">(Opcional)</span>
                  <span className="text-gray-500 ml-2">
                    ({usesLetterGrades ? 'AD, A, B, C' : '0-20'})
                  </span>
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Califica la participación y compromiso de los padres en el proceso educativo del estudiante
                </p>
                {usesLetterGrades ? (
                  <select
                    value={behaviorData.calificacionPadres || ''}
                    onChange={(e) => onDataChange({ ...behaviorData, calificacionPadres: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">Seleccionar calificación</option>
                    {getAverageGradingScale(student?.level_id).map(item => (
                      <option key={item.letter} value={item.letter}>
                        {item.letter} - {item.description}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={behaviorData.calificacionPadres || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 20)) {
                        onDataChange({ ...behaviorData, calificacionPadres: val })
                      }
                    }}
                    className="input w-full"
                    placeholder="Ingresar nota del 0 al 20"
                  />
                )}
              </div>

              {/* Comentarios/Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios u Observaciones
                  <span className="text-gray-400 font-normal ml-1">(Opcional)</span>
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Describe el contexto o razón de las calificaciones de conducta asignadas
                </p>
                <textarea
                  value={behaviorData.comentarios || ''}
                  onChange={(e) => onDataChange({ ...behaviorData, comentarios: e.target.value })}
                  className="input w-full"
                  placeholder="Ej: El estudiante ha mejorado significativamente su comportamiento en clase..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {(behaviorData.comentarios || '').length}/500 caracteres
                </p>
              </div>

              {/* Note: Asistencia a Reuniones is now managed separately in Gestión de Reuniones */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> La asistencia a reuniones de padres se gestiona desde el módulo "Gestión de Reuniones".
                  El sistema calculará automáticamente la asistencia basándose en las reuniones convocadas.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="btn btn-outline px-4 py-2"
              >
                Cancelar
              </button>
              <button
                onClick={onSave}
                className="btn btn-primary px-4 py-2 flex items-center gap-2"
              >
                <Save size={16} />
                Guardar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default BehaviorModal
