import React from 'react'
import { motion } from 'framer-motion'
import { X, XCircle, CheckCircle } from 'lucide-react'

/**
 * Modal de notificación de éxito o error
 * Muestra un mensaje al usuario después de una operación
 */
const SuccessModal = ({
  isOpen,
  message,
  onClose
}) => {
  if (!isOpen) return null

  const isError = message.includes('Error')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {isError ? (
                <XCircle className="text-red-600" size={24} />
              ) : (
                <CheckCircle className="text-green-600" size={24} />
              )}
              {isError ? 'Error' : 'Éxito'}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <p className={`text-sm ${isError ? 'text-red-600' : 'text-gray-700'}`}>
              {message}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isError
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SuccessModal
