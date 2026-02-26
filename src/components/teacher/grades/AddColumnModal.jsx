import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * Modal para agregar columnas personalizadas de evaluación
 */
const AddColumnModal = ({
  showModal,
  setShowModal,
  columnForm,
  setColumnForm,
  handleAddColumn,
  evaluationTypes
}) => {
  if (!showModal) return null

  const handleClose = () => {
    setShowModal(false)
    setColumnForm({ name: '', weight: 10, parentId: null })
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg max-w-md w-full p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Nueva Columna de Evaluación</h3>
            {columnForm.parentId && (
              <p className="text-sm text-gray-600 mt-1">
                Agregando a: <span className="font-medium text-indigo-600">
                  {evaluationTypes.find(c => c.id === columnForm.parentId)?.name}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Columna <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={columnForm.name}
              onChange={(e) => setColumnForm({ ...columnForm, name: e.target.value })}
              className="input w-full"
              placeholder="Ej: Examen Final, Trabajo Grupal, Participación..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={columnForm.weight}
              onChange={(e) => setColumnForm({ ...columnForm, weight: parseInt(e.target.value) || 0 })}
              className="input w-full"
              min="1"
              max="100"
              placeholder="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              El peso indica qué porcentaje representa esta evaluación en la nota final
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddColumn}
            disabled={!columnForm.name.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar Columna
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default AddColumnModal
