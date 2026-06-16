import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { formatDateSafe } from '../../utils/dateUtils'

/**
 * Modal de justificación de asistencia.
 * Soporta dos modos:
 *   - 'tardanza': justifica una tardanza (late_justified / late_justification)
 *   - 'falta'   : justifica una inasistencia (absence_justified / absence_justification)
 * Permite registrar un comentario y, si ya estaba justificada, ver/editar
 * el comentario o quitar la justificación.
 */
const JustifyModal = ({
  showJustifyModal,
  selectedRecord,
  justifyMode = 'tardanza',
  justification,
  setJustification,
  setShowJustifyModal,
  handleJustify,
  handleRemoveJustification,
  saving
}) => {
  const isFalta = justifyMode === 'falta'
  const entidad = isFalta ? 'Falta' : 'Tardanza'
  const entidadLower = isFalta ? 'inasistencia' : 'tardanza'
  const yaJustificada = isFalta
    ? selectedRecord?.faltaJustificada
    : selectedRecord?.tardanzaJustificada
  const comentarioExistente = isFalta
    ? selectedRecord?.justificacionFalta
    : selectedRecord?.justificacionTardanza

  return (
    <AnimatePresence>
      {showJustifyModal && selectedRecord && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowJustifyModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {yaJustificada ? `Justificación de ${entidad}` : `Justificar ${entidad}`}
                </h3>
                <button
                  onClick={() => setShowJustifyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {yaJustificada ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-2">
                      Esta {entidadLower} ya ha sido justificada
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comentarioExistente || 'Sin comentario'}
                    </p>
                    {selectedRecord.fechaJustificacion && (
                      <p className="text-xs text-gray-500 mt-2">
                        Justificada el {formatDateSafe(selectedRecord.fechaJustificacion)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowJustifyModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={handleRemoveJustification}
                      disabled={saving}
                      className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Guardando...' : 'Quitar justificación'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo de la justificación
                    </label>
                    <textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Ingrese el motivo de la ${entidadLower}...`}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowJustifyModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleJustify}
                      disabled={saving || !justification.trim()}
                      className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Guardando...' : 'Guardar Justificación'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default JustifyModal
