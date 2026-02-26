import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, CheckCircle } from 'lucide-react'
import { MEETING_SCOPE, MEETING_SCOPE_LABELS, EDUCATION_LEVELS } from '../../config/parentMeetingsConstants'

/**
 * Modal para convocar nueva reunión
 */
const CreateMeetingModal = ({
  isOpen,
  meetingData,
  setMeetingData,
  validationErrors,
  saveSuccess,
  grades,
  sections,
  onClose,
  onSave
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
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
                <h3 className="text-xl font-semibold text-gray-900">
                  Convocar Nueva Reunión
                </h3>
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
                  <span>Reunión convocada exitosamente</span>
                </div>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-800 mb-2">Errores:</p>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la Reunión *
                  </label>
                  <input
                    type="text"
                    value={meetingData.titulo}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, titulo: e.target.value }))}
                    className="input w-full"
                    placeholder="Ej: Reunión de Padres - Inicio de Año"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={meetingData.description}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, description: e.target.value }))}
                    className="input w-full"
                    rows={3}
                    placeholder="Descripción opcional de los temas a tratar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={meetingData.fecha}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, fecha: e.target.value }))}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora
                    </label>
                    <input
                      type="time"
                      value={meetingData.hora}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, hora: e.target.value }))}
                      className="input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lugar
                  </label>
                  <input
                    type="text"
                    value={meetingData.lugar}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, lugar: e.target.value }))}
                    className="input w-full"
                    placeholder="Ej: Auditorio principal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alcance de la Reunión *
                  </label>
                  <select
                    value={meetingData.alcance}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, alcance: e.target.value }))}
                    className="input w-full"
                  >
                    {Object.keys(MEETING_SCOPE).map(key => (
                      <option key={key} value={MEETING_SCOPE[key]}>
                        {MEETING_SCOPE_LABELS[MEETING_SCOPE[key]]}
                      </option>
                    ))}
                  </select>
                </div>

                {meetingData.alcance === MEETING_SCOPE.NIVEL && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Nivel
                    </label>
                    <select
                      value={meetingData.level_id}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, level_id: e.target.value }))}
                      className="input w-full"
                    >
                      <option value="">Seleccionar...</option>
                      {EDUCATION_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {meetingData.alcance === MEETING_SCOPE.GRADO && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar Grado *
                      </label>
                      <select
                        value={meetingData.grade_id}
                        onChange={(e) => setMeetingData(prev => ({ ...prev, grade_id: e.target.value, section_id: '' }))}
                        className="input w-full"
                      >
                        <option value="">Seleccionar...</option>
                        {grades.map(grade => (
                          <option key={grade.id} value={grade.id}>{grade.name}</option>
                        ))}
                      </select>
                    </div>

                    {meetingData.grade_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Seleccionar Sección (Opcional)
                        </label>
                        <select
                          value={meetingData.section_id}
                          onChange={(e) => setMeetingData(prev => ({ ...prev, section_id: e.target.value }))}
                          className="input w-full"
                        >
                          <option value="">Todas las secciones del grado</option>
                          {sections
                            .filter(section => section.grade_id === meetingData.grade_id)
                            .map(section => (
                              <option key={section.id} value={section.id}>Sección {section.name}</option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
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
                  Convocar Reunión
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CreateMeetingModal
