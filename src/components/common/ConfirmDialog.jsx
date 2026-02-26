import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'

/**
 * Componente reutilizable para diálogos de confirmación y alertas
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onConfirm - Función para confirmar la acción (solo para tipo 'confirm')
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje del modal
 * @param {string} type - Tipo de diálogo: 'success', 'error', 'warning', 'info', 'confirm'
 * @param {string} confirmText - Texto del botón de confirmar (default: 'Confirmar')
 * @param {string} cancelText - Texto del botón de cancelar (default: 'Cancelar')
 * @param {string} confirmButtonClass - Clase CSS adicional para el botón de confirmar
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonClass = ''
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />
      case 'confirm':
        return <AlertTriangle className="h-12 w-12 text-blue-500" />
      default:
        return <Info className="h-12 w-12 text-blue-500" />
    }
  }

  const getDefaultButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700'
      case 'error':
        return 'bg-red-600 hover:bg-red-700'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700'
      case 'confirm':
        return 'bg-blue-600 hover:bg-blue-700'
      default:
        return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={type === 'confirm' ? undefined : onClose}
            className="fixed inset-0 bg-gray-900 bg-opacity-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-lg shadow-xl"
          >
            {/* Close Button */}
            {type !== 'confirm' && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100 transition-colors z-10"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}

            {/* Content */}
            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                {getIcon()}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                {title}
              </h3>

              {/* Message */}
              <p className="text-gray-600 text-center mb-6 whitespace-pre-line">
                {message}
              </p>

              {/* Actions */}
              <div className="flex justify-center gap-3">
                {type === 'confirm' && (
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                    confirmButtonClass || getDefaultButtonClass()
                  }`}
                >
                  {type === 'confirm' ? confirmText : 'Aceptar'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

export default ConfirmDialog
