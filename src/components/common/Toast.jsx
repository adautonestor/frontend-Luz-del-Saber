import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

/**
 * Componente Toast para notificaciones
 * @param {string} type - Tipo de notificación: 'success', 'error', 'warning', 'info'
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} isOpen - Estado de visibilidad
 * @param {function} onClose - Función para cerrar el toast
 * @param {number} duration - Duración en ms antes de auto-cerrar (default: 3000)
 * @param {string} position - Posición: 'top-right', 'top-center', 'bottom-right', 'bottom-center'
 */
const Toast = ({
  type = 'info',
  message,
  isOpen,
  onClose,
  duration = 3000,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  }

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  }

  const positions = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: position.includes('top') ? -50 : 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position.includes('top') ? -50 : 50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed ${positions[position]} z-[9999] pointer-events-auto`}
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${colors[type]} min-w-[320px] max-w-md`}>
            <div className="flex-shrink-0">
              {icons[type]}
            </div>
            <div className={`flex-1 text-sm font-medium ${textColors[type]}`}>
              {message}
            </div>
            <button
              onClick={onClose}
              className={`flex-shrink-0 ${textColors[type]} hover:opacity-70 transition-opacity`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
