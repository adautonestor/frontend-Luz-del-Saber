import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X, User, Calendar, Download, ZoomIn, ZoomOut, File, AlertCircle
} from 'lucide-react'
import {
  getTypeColor, getTypeIcon, getTypeName,
  getPriorityColor, getPriorityIcon,
  formatDate, isPDF, handleDownload, formatFileSize
} from '../../utils/communicationsHelpers'
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from '../../config/communicationsConstants'

/**
 * Modal de detalle de comunicado
 */
const CommunicationDetailModal = ({ isOpen, communication, onClose }) => {
  const [imageZoom, setImageZoom] = useState(1)

  if (!isOpen || !communication) return null

  const TypeIcon = getTypeIcon(communication.type)
  const PriorityIcon = getPriorityIcon(communication.priority)

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + ZOOM_STEP, ZOOM_MAX))
  }

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - ZOOM_STEP, ZOOM_MIN))
  }

  const handleZoomReset = () => {
    setImageZoom(1)
  }

  const handleClose = () => {
    setImageZoom(1)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(communication.type)}`}>
                  <TypeIcon className="w-4 h-4 mr-1" />
                  <span>{getTypeName(communication.type)}</span>
                </div>

                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(communication.priority)}`}>
                  <PriorityIcon className="w-3 h-3 mr-1" />
                  <span className="capitalize">{communication.priority}</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {communication.title}
              </h2>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <div>
                    <span className="font-medium">{communication.sender}</span>
                    <span className="text-gray-400"> - {communication.senderRole}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(communication.sentDate)}</span>
                </div>
              </div>

              <div className="mt-2">
                <span className="text-sm text-gray-600">
                  Para: {communication.recipientChildName}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Content */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {communication.content}
            </div>
          </div>

          {/* Archivos adjuntos desde Wasabi */}
          {communication.adjuntos && communication.adjuntos.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">
                Archivos adjuntos ({communication.adjuntos.length})
              </h4>
              <div className="space-y-4">
                {communication.adjuntos.map((adjunto, index) => {
                  const isImage = adjunto.type && adjunto.type.startsWith('image/')
                  const isPdf = adjunto.type === 'application/pdf'
                  const fileUrl = adjunto.url || adjunto.data

                  return (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      {isImage ? (
                        /* Imagen */
                        <div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
                            <span className="text-sm font-medium text-gray-700">{adjunto.name}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleZoomOut}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Reducir zoom"
                              >
                                <ZoomOut size={16} className="text-gray-600" />
                              </button>
                              <span className="text-xs text-gray-500">{Math.round(imageZoom * 100)}%</span>
                              <button
                                onClick={handleZoomIn}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Aumentar zoom"
                              >
                                <ZoomIn size={16} className="text-gray-600" />
                              </button>
                              <a
                                href={fileUrl}
                                download={adjunto.name}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                              >
                                <Download size={14} />
                                Descargar
                              </a>
                            </div>
                          </div>
                          <div className="overflow-auto max-h-[50vh] bg-gray-100 p-4">
                            <img
                              src={fileUrl}
                              alt={adjunto.name}
                              className="mx-auto rounded shadow-lg transition-transform duration-200"
                              style={{
                                transform: `scale(${imageZoom})`,
                                transformOrigin: 'center center',
                                maxWidth: '100%'
                              }}
                            />
                          </div>
                        </div>
                      ) : isPdf ? (
                        /* PDF */
                        <div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
                            <span className="text-sm font-medium text-gray-700">{adjunto.name}</span>
                            <a
                              href={fileUrl}
                              download={adjunto.name}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                              <Download size={16} />
                              Descargar
                            </a>
                          </div>
                          <iframe
                            src={fileUrl}
                            className="w-full h-[500px]"
                            title={adjunto.name}
                          />
                        </div>
                      ) : (
                        /* Otros archivos */
                        <div className="flex items-center justify-between p-4 bg-gray-50">
                          <div className="flex items-center">
                            <File className="h-8 w-8 text-gray-500 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{adjunto.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(adjunto.size || adjunto.tamaño || 0)}</p>
                            </div>
                          </div>
                          <a
                            href={fileUrl}
                            download={adjunto.name}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                          >
                            <Download size={16} />
                            Descargar
                          </a>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Fecha de vencimiento */}
          {communication.due_date && (
            <div className={`mt-4 p-3 rounded-lg ${
              new Date(communication.due_date) < new Date()
                ? 'bg-red-50 border border-red-200'
                : 'bg-orange-50 border border-orange-200'
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-5 h-5 ${
                  new Date(communication.due_date) < new Date()
                    ? 'text-red-600'
                    : 'text-orange-600'
                }`} />
                <span className={`text-sm font-medium ${
                  new Date(communication.due_date) < new Date()
                    ? 'text-red-900'
                    : 'text-orange-900'
                }`}>
                  {new Date(communication.due_date) < new Date() ? 'Vencido:' : 'Vence:'} {' '}
                  {new Date(communication.due_date).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default CommunicationDetailModal
