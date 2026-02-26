import React from 'react'
import { motion } from 'framer-motion'
import { X, Upload, FileText } from 'lucide-react'

/**
 * Modal para subir documentos
 * Permite seleccionar archivo, título, descripción y destinatario
 */
const DocumentUploadModal = ({
  showUploadModal,
  uploadForm,
  setUploadForm,
  handleFileChange,
  handleUpload,
  closeUploadModal,
  getFileIcon
}) => {
  if (!showUploadModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Subir Documento
            </h2>
            <button
              onClick={closeUploadModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="label">Archivo *</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  {uploadForm.archivo ? (
                    <div className="space-y-3">
                      {getFileIcon(uploadForm.archivo.type)}
                      <p className="text-sm text-gray-700">{uploadForm.archivo.name}</p>
                      <button
                        type="button"
                        onClick={() => setUploadForm(prev => ({ ...prev, archivo: null, preview: null }))}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Quitar archivo
                      </button>
                    </div>
                  ) : (
                    <>
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Subir un archivo</span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">o arrastrar y soltar</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, XLS, XLSX, PNG, JPG hasta 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="label">Título del Documento *</label>
              <input
                type="text"
                className="input"
                value={uploadForm.titulo}
                onChange={(e) => setUploadForm(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ej: Reglamento Interno 2025"
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Descripción</label>
              <textarea
                className="input"
                rows="3"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción opcional del documento..."
              />
            </div>

            {/* Destinatario */}
            <div>
              <label className="label">Destinatario *</label>
              <select
                className="input"
                value={uploadForm.destinatario}
                onChange={(e) => setUploadForm(prev => ({ ...prev, destinatario: e.target.value }))}
                required
              >
                <option value="padres">Padres de Familia</option>
                <option value="docentes">Docentes</option>
                <option value="ambos">Ambos (Padres y Docentes)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selecciona quién puede ver este documento
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeUploadModal}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadForm.titulo || !uploadForm.archivo}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload size={16} />
              Subir Documento
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DocumentUploadModal
