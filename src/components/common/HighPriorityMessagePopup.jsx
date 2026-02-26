import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Bell, Info, FileText } from 'lucide-react'

const HighPriorityMessagePopup = ({ communications, onMarkAsRead, onClose, userId }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClosing, setIsClosing] = useState(false)

  // Filter high priority unread messages
  const highPriorityMessages = communications.filter(comm =>
    comm.prioridad === 'alta' && !comm.isRead
  )

  useEffect(() => {
    // If no more messages to show, close the popup
    if (highPriorityMessages.length === 0 && !isClosing) {
      onClose()
    }
  }, [highPriorityMessages.length, isClosing, onClose])

  const currentMessage = highPriorityMessages[currentIndex]

  if (!currentMessage) {
    return null
  }

  const handleMarkAsRead = async () => {
    setIsClosing(true)

    try {
      await onMarkAsRead(currentMessage.id, userId)

      // If there are more messages, show the next one
      if (currentIndex < highPriorityMessages.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setIsClosing(false)
      } else {
        // No more messages, close the popup
        onClose()
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
      setIsClosing(false)
    }
  }

  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'urgente':
        return <AlertTriangle className="w-6 h-6 text-red-600" />
      case 'general':
        return <Bell className="w-6 h-6 text-blue-600" />
      case 'informativo':
        return <Info className="w-6 h-6 text-green-600" />
      default:
        return <Bell className="w-6 h-6 text-blue-600" />
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[9999]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header con prioridad alta */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2 animate-pulse">
                  {getTypeIcon(currentMessage.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      Prioridad Alta
                    </span>
                    <span className="text-xs opacity-90">
                      {highPriorityMessages.length > 1 &&
                        `${currentIndex + 1} de ${highPriorityMessages.length}`
                      }
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">
                    {currentMessage.titulo}
                  </h2>
                  <p className="text-sm opacity-90 mt-1">
                    {new Date(currentMessage.fechaEnvio).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del mensaje */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <div
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: currentMessage.contenido }}
            />

            {/* Adjuntos si existen */}
            {currentMessage.adjuntos && currentMessage.adjuntos.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FileText size={16} className="mr-2" />
                  Archivos Adjuntos ({currentMessage.adjuntos.length})
                </h3>
                <div className="space-y-2">
                  {currentMessage.adjuntos.map((adjunto) => (
                    <a
                      key={adjunto.id}
                      href={adjunto.url}
                      download={adjunto.name}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText size={20} className="text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{adjunto.name}</p>
                          <p className="text-xs text-gray-500">
                            {(adjunto.tamaño / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer con botón de acción */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {currentMessage.requiereConfirmacion ? (
                  <span className="flex items-center text-yellow-600">
                    <AlertTriangle size={16} className="mr-2" />
                    Este mensaje requiere confirmación de lectura
                  </span>
                ) : (
                  <span>Marca como leído para continuar</span>
                )}
              </div>
              <button
                onClick={handleMarkAsRead}
                disabled={isClosing}
                className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClosing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span>Entendido</span>
                    {highPriorityMessages.length > 1 && currentIndex < highPriorityMessages.length - 1 && (
                      <span className="text-xs opacity-75">(Siguiente mensaje)</span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default HighPriorityMessagePopup