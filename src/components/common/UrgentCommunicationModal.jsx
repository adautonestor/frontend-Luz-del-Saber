import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, CheckCircle } from 'lucide-react'
import { useCommunicationsStore } from '../../stores/communicationsStore'
import { useAuthStore } from '../../stores/authStore'

const UrgentCommunicationModal = () => {
  const { user } = useAuthStore()
  const { getUrgentUnattendedCommunications, markAsRead } = useCommunicationsStore()
  const [urgentCommunications, setUrgentCommunications] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (user?.id && getUrgentUnattendedCommunications) {
      // Get urgent unattended communications
      const urgent = getUrgentUnattendedCommunications(user.id)
      setUrgentCommunications(urgent)

      if (urgent.length > 0) {
        setIsVisible(true)
        // Mark the first one as read
        if (!urgent[0].isRead) {
          markAsRead(urgent[0].id, user.id)
        }
      }
    }
  }, [user, getUrgentUnattendedCommunications, markAsRead])

  const handleClose = () => {
    setIsVisible(false)
    setCurrentIndex(0)
  }

  const handleNext = () => {
    if (currentIndex < urgentCommunications.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)

      // Mark next communication as read
      const nextComm = urgentCommunications[nextIndex]
      if (nextComm && !nextComm.isRead) {
        markAsRead(nextComm.id, user.id)
      }
    } else {
      handleClose()
    }
  }

  if (!isVisible || urgentCommunications.length === 0) {
    return null
  }

  const currentCommunication = urgentCommunications[currentIndex]

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="bg-red-600 text-white p-6 rounded-t-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Comunicado Urgente</h2>
                    {urgentCommunications.length > 1 && (
                      <p className="text-red-100 text-sm mt-1">
                        {currentIndex + 1} de {urgentCommunications.length} comunicados
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {currentCommunication.title}
              </h3>

              {/* Meta info */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <span>
                  Fecha: {new Date(currentCommunication.send_date).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                  URGENTE
                </span>
              </div>

              {/* Message content */}
              <div className="prose max-w-none mb-6">
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentCommunication.content }}
                />
              </div>

              {/* Attachments if any */}
              {currentCommunication.attachments && currentCommunication.attachments.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Archivos adjuntos:</h4>
                  <ul className="space-y-2">
                    {currentCommunication.attachments.map((attachment, index) => (
                      <li key={index}>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {attachment.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Important notice */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Importante</p>
                    <p>
                      Este mensaje es urgente y requiere su atención inmediata.
                      Continuará apareciendo hasta que sea marcado como atendido por {currentCommunication.remitente_nombre || 'el remitente'}.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
              >
                {currentIndex < urgentCommunications.length - 1 ? 'Siguiente' : 'Entendido'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default UrgentCommunicationModal
