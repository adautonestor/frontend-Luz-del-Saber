import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Download, Loader2 } from 'lucide-react'
import { schedulesService } from '../../services/schedulesService'

const ViewScheduleModal = ({
  showViewModal,
  selectedImage,
  zoomLevel,
  closeViewModal,
  handleZoomIn,
  handleZoomOut,
  handleZoomReset,
  handleWheel,
  getItemName,
  formatFileSize,
  levels,
  grades,
  sections
}) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!selectedImage) return
    try {
      setIsDownloading(true)
      await schedulesService.downloadImage(
        selectedImage.imageData,
        selectedImage.fileName || `horario_${selectedImage.id}.png`
      )
    } catch (error) {
      console.error('Error al descargar:', error)
      alert('Error al descargar la imagen')
    } finally {
      setIsDownloading(false)
    }
  }

  if (!showViewModal || !selectedImage) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header - Fijo */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedImage.titulo}
            </h2>
            <button
              onClick={closeViewModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido - Con scroll */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Controles de zoom */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="Reducir zoom"
            >
              <span className="text-lg font-bold">−</span>
            </button>
            <button
              onClick={handleZoomReset}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="Aumentar zoom"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </div>

          {/* Imagen con zoom */}
          <div className="overflow-auto max-h-[60vh]" onWheel={handleWheel}>
            <div className="text-center">
              <img
                src={selectedImage.imageData}
                alt={selectedImage.titulo}
                className="max-w-full mx-auto rounded-lg shadow-lg transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              />
            </div>
          </div>

          {selectedImage.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600">{selectedImage.description}</p>
            </div>
          )}

          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Tipo:</span>
                <p className="text-gray-600">
                  {selectedImage.type === 'alumnos' ? 'Para Alumnos' : 'Para Docentes'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Tamaño:</span>
                <p className="text-gray-600">{formatFileSize(selectedImage.fileSize)}</p>
              </div>
            </div>

            {selectedImage.type === 'alumnos' && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Información de Alumnos</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Nivel:</span>
                    <p className="text-gray-600">{getItemName(selectedImage.level_id, levels)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Grado:</span>
                    <p className="text-gray-600">{getItemName(selectedImage.grade_id, grades)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sección:</span>
                    <p className="text-gray-600">
                      {(() => {
                        const section = sections?.find(s => s.id === selectedImage.section_id)
                        if (!section) return getItemName(selectedImage.section_id, sections)
                        const turno = section.shift === 'morning' ? 'Mañana' : section.shift === 'afternoon' ? 'Tarde' : section.shift || ''
                        return `${section.name}${turno ? ` - ${turno}` : ''}`
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedImage.type === 'docentes' && selectedImage.level_id && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Información de Docentes</h4>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Nivel:</span>
                  <p className="text-gray-600">{getItemName(selectedImage.level_id, levels)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fijo */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Subido el {new Date(selectedImage.uploadDate).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })} por {selectedImage.uploadedBy}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {isDownloading ? 'Descargando...' : 'Descargar'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ViewScheduleModal
