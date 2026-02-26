import React from 'react'
import { motion } from 'framer-motion'
import {
  X, Calendar, AlertCircle, Users, Eye, MessageSquare, Clock,
  Download, ZoomIn, ZoomOut, File
} from 'lucide-react'

/**
 * Modal para ver detalles completos de un comunicado
 * Incluye attachments con zoom, estadísticas y metadata completa
 */
const ViewCommunicationModal = ({
  communication,
  onClose,
  imageZoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  getTypeIcon,
  getPriorityColor,
  getPriorityIcon,
  formatDate,
  formatFileSize,
  isPDF,
  handleDownload
}) => {
  if (!communication) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {communication.titulo}
            </h2>
            <button
              onClick={() => {
                onClose()
                onZoomReset()
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Metadata */}
            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                {getTypeIcon(communication.type)}
                <span className="capitalize">{communication.type}</span>
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(communication.prioridad)}`}>
                {getPriorityIcon(communication.prioridad)}
                <span className="ml-1 capitalize">{communication.prioridad}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(communication.fechaEnvio || communication.createdAt)}
              </div>
              {communication.due_date && (
                <div className={`flex items-center gap-1 ${
                  new Date(communication.due_date) < new Date()
                    ? 'text-red-600 font-semibold'
                    : 'text-orange-600 font-medium'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                  Vence: {new Date(communication.due_date).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">
                {communication.contenido}
              </p>
            </div>

            {/* Attachments */}
            {communication.adjuntos && communication.adjuntos.length > 0 && (
              <div className="mb-6">
                {/* Images */}
                {communication.adjuntos.filter(adj => adj.type.includes('image')).length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Imágenes adjuntas:</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={onZoomOut}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Reducir zoom"
                        >
                          <ZoomOut size={18} className="text-gray-600" />
                        </button>
                        <button
                          onClick={onZoomReset}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          {Math.round(imageZoom * 100)}%
                        </button>
                        <button
                          onClick={onZoomIn}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Aumentar zoom"
                        >
                          <ZoomIn size={18} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                    {communication.adjuntos.filter(adj => adj.type.includes('image')).map((image, index) => (
                      <div key={index} className="overflow-auto max-h-[60vh] bg-gray-50 rounded-lg p-4 mb-4">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="mx-auto rounded-lg shadow-lg transition-transform duration-200"
                          style={{
                            transform: `scale(${imageZoom})`,
                            transformOrigin: 'center center',
                            maxWidth: '100%'
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">{image.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* PDFs and other files */}
                {communication.adjuntos.filter(adj => !adj.type.includes('image')).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Archivos adjuntos:</h4>
                    {communication.adjuntos.filter(adj => !adj.type.includes('image')).map((file, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            onClick={() => handleDownload(file)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Download size={16} />
                            Descargar
                          </button>
                        </div>
                        {isPDF(file) ? (
                          <div className="border rounded-lg overflow-hidden">
                            <iframe
                              src={file.url}
                              className="w-full h-[500px]"
                              title={file.name}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center p-3 bg-gray-50 rounded-md border">
                            <File className="h-5 w-5 text-gray-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.tamaño)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recipients */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Destinatarios</h3>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>{communication.estadisticas?.totalDestinatarios || communication.recipientCount || 0} destinatarios</span>
              </div>
            </div>

            {/* Statistics */}
            {(communication.state === 'enviado' || communication.status === 'sent') && communication.estadisticas && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Estadísticas</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-semibold text-blue-600">
                      {communication.estadisticas.totalLeidos || 0}
                    </p>
                    <p className="text-xs text-gray-600">Leídos</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-semibold text-green-600">
                      {communication.estadisticas.totalConfirmados || 0}
                    </p>
                    <p className="text-xs text-gray-600">Confirmados</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-semibold text-yellow-600">
                      {(communication.estadisticas.totalDestinatarios || 0) - (communication.estadisticas.totalLeidos || 0)}
                    </p>
                    <p className="text-xs text-gray-600">Pendientes</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={() => {
                onClose()
                onZoomReset()
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ViewCommunicationModal
