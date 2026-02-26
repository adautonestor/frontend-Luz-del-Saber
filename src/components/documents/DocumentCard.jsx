import React from 'react'
import { motion } from 'framer-motion'
import { Eye, Download, Trash2 } from 'lucide-react'

/**
 * Tarjeta de documento individual
 * Muestra información del documento y acciones disponibles
 */
const DocumentCard = ({
  document: doc,
  openViewModal,
  handleDelete,
  getFileIcon,
  formatFileSize
}) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(doc.fileData)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = doc.fileName
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al descargar:', error)
      window.open(doc.fileData, '_blank')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Icon */}
      <div className="relative bg-gray-50 p-8 flex items-center justify-center">
        {getFileIcon(doc.fileType)}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => handleDelete(doc.id)}
            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
            title="Eliminar documento"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Information */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-2 truncate">
          {doc.titulo}
        </h4>

        {doc.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {doc.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Destinatario:</span>
            <span className={`font-medium capitalize px-2 py-0.5 rounded text-xs ${
              doc.destinatario === 'padres' ? 'bg-blue-100 text-blue-700' :
              doc.destinatario === 'docentes' ? 'bg-purple-100 text-purple-700' :
              'bg-green-100 text-green-700'
            }`}>
              {doc.destinatario === 'padres' ? 'Padres' :
               doc.destinatario === 'docentes' ? 'Docentes' :
               'Ambos'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tamaño:</span>
            <span className="font-medium">{formatFileSize(doc.fileSize)}</span>
          </div>
          <div className="flex justify-between">
            <span>Subido:</span>
            <span className="font-medium">
              {new Date(doc.uploadDate).toLocaleDateString('es-PE')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Por:</span>
            <span className="font-medium truncate ml-2">{doc.uploadedBy}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => openViewModal(doc)}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Eye size={16} />
            Ver
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Download size={16} />
            Descargar
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default DocumentCard
