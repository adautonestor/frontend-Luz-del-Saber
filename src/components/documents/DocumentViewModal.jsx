import React from 'react'
import { motion } from 'framer-motion'
import { X, Download } from 'lucide-react'

/**
 * Modal para ver/previsualizar documentos
 * Muestra imagen o icono de archivo según tipo
 */
const DocumentViewModal = ({
  showViewModal,
  selectedDocument,
  closeViewModal,
  getFileIcon,
  formatFileSize
}) => {
  if (!showViewModal || !selectedDocument) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(selectedDocument.fileData)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = selectedDocument.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al descargar:', error)
      // Fallback: abrir en nueva pestaña
      window.open(selectedDocument.fileData, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedDocument.titulo}
            </h2>
            <button
              onClick={closeViewModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            {selectedDocument.fileType?.startsWith('image/') ? (
              <img
                src={selectedDocument.fileData}
                alt={selectedDocument.titulo}
                className="max-w-full max-h-[60vh] mx-auto rounded-lg shadow-lg"
              />
            ) : selectedDocument.fileType === 'application/pdf' ? (
              <div className="w-full">
                <iframe
                  src={selectedDocument.fileData}
                  className="w-full h-[70vh] border border-gray-300 rounded-lg"
                  title={selectedDocument.titulo}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center py-12">
                {getFileIcon(selectedDocument.fileType)}
                <p className="mt-4 text-lg font-medium text-gray-900">{selectedDocument.fileName}</p>
                <p className="mt-2 text-sm text-gray-600">Haz clic en descargar para ver el contenido completo</p>
              </div>
            )}
          </div>

          {selectedDocument.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600">{selectedDocument.description}</p>
            </div>
          )}

          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Tamaño:</span>
                <p className="text-gray-600">{formatFileSize(selectedDocument.fileSize)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Tipo:</span>
                <p className="text-gray-600">{selectedDocument.fileType}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <div className="text-sm text-gray-500">
              Subido el {new Date(selectedDocument.uploadDate).toLocaleDateString('es-PE')} por {selectedDocument.uploadedBy}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download size={16} />
                Descargar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DocumentViewModal
