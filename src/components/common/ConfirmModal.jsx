import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

/**
 * Modal de Confirmación - Reemplazo para window.confirm()
 *
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Función a ejecutar al cerrar
 * @param {function} onConfirm - Función a ejecutar al confirmar
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje de confirmación
 * @param {string} confirmText - Texto del botón confirmar (default: 'Confirmar')
 * @param {string} cancelText - Texto del botón cancelar (default: 'Cancelar')
 * @param {string} variant - Variante del modal: 'danger', 'warning', 'primary' (default: 'danger')
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Acción',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}) => {
  if (!isOpen) return null

  const variantConfig = {
    danger: {
      headerBg: 'bg-red-500',
      buttonBg: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      headerBg: 'bg-yellow-500',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
    },
    primary: {
      headerBg: 'bg-primary-600',
      buttonBg: 'bg-primary-600 hover:bg-primary-700'
    }
  }

  const config = variantConfig[variant] || variantConfig.danger

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        >
          {/* Header */}
          <div className={`${config.headerBg} p-6 rounded-t-xl`}>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <AlertTriangle size={24} />
                </div>
                <h2 className="text-xl font-bold">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-6 whitespace-pre-line">{message}</p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 ${config.buttonBg} text-white rounded-lg transition-colors font-medium`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ConfirmModal
