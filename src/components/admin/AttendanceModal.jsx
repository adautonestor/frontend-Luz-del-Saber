import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, CheckCircle } from 'lucide-react'
import { getParentStudents } from '../../utils/parentMeetingsHelpers'

/**
 * Modal para registrar asistencia a una reunión
 */
const AttendanceModal = ({
  isOpen,
  meeting,
  parents,
  students,
  attendanceData,
  setAttendanceData,
  onClose,
  onSave
}) => {
  if (!meeting) return null

  const attendedCount = Object.values(attendanceData).filter(Boolean).length

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Registrar Asistencia
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {meeting.titulo} - {meeting.fecha}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Parents List */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Marcar los padres que asistieron:
                </p>

                {parents.map((parent) => (
                  <div
                    key={parent.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={attendanceData[parent.id] || false}
                      onChange={(e) => setAttendanceData(prev => ({
                        ...prev,
                        [parent.id]: e.target.checked
                      }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {parent.first_name} {parent.last_names}
                      </div>
                      <div className="text-xs text-gray-500">
                        Hijos: {getParentStudents(parent.id, students) || 'Sin hijos registrados'}
                      </div>
                    </div>
                    {attendanceData[parent.id] && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))}

                {parents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay padres registrados
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Resumen:</strong> {attendedCount} de {parents.length} padres asistieron
                </p>
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
                  Guardar Asistencia
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AttendanceModal
