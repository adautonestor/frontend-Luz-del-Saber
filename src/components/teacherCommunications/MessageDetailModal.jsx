import React from 'react'
import { motion } from 'framer-motion'
import { X, Download, File, Edit, Trash2, User } from 'lucide-react'
import { formatFileSize, handleDownload, formatDateTime } from '@/utils/teacherCommunications'

/**
 * Modal para ver detalles de un mensaje enviado/recibido
 * @param {Object} message - El mensaje a mostrar
 * @param {boolean} isOwn - Si el mensaje fue creado por el usuario actual
 * @param {Function} onClose - Callback al cerrar
 * @param {Function} onEdit - Callback al editar (solo si isOwn)
 * @param {Function} onDelete - Callback al eliminar (solo si isOwn)
 */
const MessageDetailModal = ({ message, isOwn = false, onClose, onEdit, onDelete }) => {
  if (!message) return null

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
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{message.asunto}</h2>
                {isOwn ? (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Mi comunicado
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                    <User size={12} />
                    Recibido
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatDateTime(message.fechaEnvio)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{message.contenido}</p>
          </div>

          {/* Imagen adjunta */}
          {message.imagen && (
            <div className="mt-6">
              <img
                src={message.imagen.data}
                alt="Adjunto"
                className="max-w-full rounded-lg"
              />
            </div>
          )}

          {/* Archivo adjunto */}
          {message.archivo && (
            <div className="mt-6 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File size={20} />
                  <div>
                    <p className="text-sm font-medium">{message.archivo.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(message.archivo.tamaño)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(message.archivo)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Download size={16} />
                  Descargar
                </button>
              </div>
            </div>
          )}

          {/* Estadísticas */}
          {message.estadisticas && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {message.estadisticas.enviados}
                </div>
                <div className="text-sm text-gray-600">Enviados</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {message.estadisticas.leidos}
                </div>
                <div className="text-sm text-gray-600">Leídos</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {message.estadisticas.confirmados}
                </div>
                <div className="text-sm text-gray-600">Confirmados</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {message.estadisticas.pendientes}
                </div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            {/* Botones de acción solo para comunicados propios */}
            <div className="flex gap-2">
              {isOwn && onEdit && (
                <button
                  onClick={() => onEdit(message)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                >
                  <Edit size={16} />
                  Editar
                </button>
              )}
              {isOwn && onDelete && (
                <button
                  onClick={() => onDelete(message)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MessageDetailModal
