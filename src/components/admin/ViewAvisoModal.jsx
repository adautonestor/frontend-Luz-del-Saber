import React from 'react'
import { motion } from 'framer-motion'
import { Link as LinkIcon, Download, ZoomIn, ZoomOut, File } from 'lucide-react'

const ViewAvisoModal = ({
  selectedAviso,
  setSelectedAviso,
  imageZoom,
  handleZoomIn,
  handleZoomOut,
  handleZoomReset,
  handleDownload,
  isPDF,
  formatFileSize
}) => {
  if (!selectedAviso) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={() => setSelectedAviso(null)}
        ></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedAviso.titulo}
            </h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              selectedAviso.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {selectedAviso.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-600 whitespace-pre-wrap">
              {selectedAviso.contenido}
            </p>
          </div>

          {selectedAviso.imagen && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-900">Imagen adjunta:</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Reducir zoom"
                  >
                    <ZoomOut size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={handleZoomReset}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    {Math.round(imageZoom * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Aumentar zoom"
                  >
                    <ZoomIn size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="overflow-auto max-h-[60vh] bg-gray-50 rounded-lg p-4">
                <img
                  src={selectedAviso.imagen.data}
                  alt={selectedAviso.imagen.name}
                  className="mx-auto rounded-lg shadow-lg transition-transform duration-200"
                  style={{
                    transform: `scale(${imageZoom})`,
                    transformOrigin: 'center center',
                    maxWidth: '100%'
                  }}
                />
              </div>
            </div>
          )}

          {selectedAviso.enlace && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Enlace:</h4>
              <a
                href={selectedAviso.enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <LinkIcon size={14} />
                {selectedAviso.enlace}
              </a>
            </div>
          )}

          {selectedAviso.archivo && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-900">Archivo adjunto:</h4>
                <button
                  onClick={() => handleDownload(selectedAviso.archivo)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download size={16} />
                  Descargar
                </button>
              </div>

              {isPDF(selectedAviso.archivo) ? (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={selectedAviso.archivo.data}
                    className="w-full h-[500px]"
                    title={selectedAviso.archivo.name}
                  />
                </div>
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-md border">
                  <File className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedAviso.archivo.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedAviso.archivo.tamaño)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Visible para:</span>
              <span className="font-medium">Padres y Docentes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Fecha de creación:</span>
              <span className="font-medium">
                {new Date(selectedAviso.fechaCreacion).toLocaleString('es-PE')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Creado por:</span>
              <span className="font-medium">{selectedAviso.creadorNombre || 'Sistema'}</span>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => {
                setSelectedAviso(null)
                handleZoomReset()
              }}
              className="btn btn-outline px-4 py-2"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ViewAvisoModal
