import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const JustifyModal = ({
  showJustifyModal,
  selectedRecord,
  justification,
  setJustification,
  setShowJustifyModal,
  handleJustifyTardanza,
  saving
}) => {
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
                  {selectedRecord.tardanzaJustificada ? 'Justificación de Tardanza' : 'Justificar Tardanza'}
                </h3>
                <button
                  onClick={() => setShowJustifyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {selectedRecord.tardanzaJustificada ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-2">
                      Esta tardanza ya ha sido justificada
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedRecord.justificacionTardanza}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Justificada el {new Date(selectedRecord.fechaJustificacion).toLocaleDateString('es-PE')}
                    </p>
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
                      placeholder="Ingrese el motivo de la tardanza..."
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
                      onClick={handleJustifyTardanza}
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
