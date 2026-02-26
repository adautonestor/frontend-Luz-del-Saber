import React from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AlertModal - Modal reutilizable para reemplazar alerts del navegador
 *
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Función a ejecutar al cerrar
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de alerta: 'success', 'error', 'warning', 'info' (default: 'info')
 * @param {string} confirmText - Texto del botón de confirmar (default: 'Aceptar')
 * @param {function} onConfirm - Función opcional al confirmar (si no se provee, solo cierra)
 * @param {string} cancelText - Texto del botón cancelar (opcional, si se provee muestra botón de cancelar)
 * @param {function} onCancel - Función al cancelar (opcional)
 */
const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Aceptar',
  onConfirm,
  cancelText,
  onCancel
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={48} />
      case 'error':
        return <AlertCircle className="text-red-600" size={48} />
      case 'warning':
        return <AlertTriangle className="text-yellow-600" size={48} />
      case 'info':
      default:
        return <Info className="text-blue-600" size={48} />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          button: 'bg-green-600 hover:bg-green-700'
        }
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          button: 'bg-red-600 hover:bg-red-700'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700'
        }
    }
  }

  const colors = getColors()

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-lg max-w-md w-full shadow-2xl"
        >
          {/* Header con icono */}
          <div className={`${colors.bg} ${colors.border} border-b px-6 py-4 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getIcon()}
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-6 py-6">
            <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Footer con botones */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
            {cancelText && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors font-medium"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-6 py-2 ${colors.button} text-white rounded-lg transition-colors font-medium`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AlertModal
