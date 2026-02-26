import React from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Image as ImageIcon, File } from 'lucide-react'

const CreateAvisoModal = ({
  isModalOpen,
  formData,
  setFormData,
  handleSubmit,
  handleCloseModal,
  uploadHandlers,
  formatFileSize
}) => {
  if (!isModalOpen) return null

  const { isDraggingImage, isDraggingFile, handleImageUpload, handleFileUpload,
    handleDragEnter, handleDragLeave, handleDragOver, handleImageDrop, handleFileDrop } = uploadHandlers

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Nuevo Aviso</h3>
            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Título *</label>
              <input
                type="text"
                className="input"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                required
                placeholder="Ej: Inicio del año escolar 2025"
              />
            </div>

            <div>
              <label className="label">Contenido *</label>
              <textarea
                className="input min-h-[150px]"
                value={formData.contenido}
                onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                required
                placeholder="Escribe el contenido del aviso..."
              />
            </div>

            <div>
              <label className="label">Enlace (opcional)</label>
              <input
                type="url"
                className="input"
                value={formData.enlace}
                onChange={(e) => setFormData({...formData, enlace: e.target.value})}
                placeholder="https://ejemplo.com"
              />
            </div>

            {/* Imagen */}
            <div>
              <label className="label">Imagen (opcional)</label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                  isDraggingImage ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={(e) => handleDragEnter(e, 'image')}
                onDragOver={(e) => handleDragOver(e, 'image')}
                onDragLeave={(e) => handleDragLeave(e, 'image')}
                onDrop={handleImageDrop}
              >
                {!formData.imagen ? (
                  <div className="text-center">
                    <ImageIcon className={`mx-auto h-12 w-12 ${isDraggingImage ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">Subir imagen</span>
                        <span className="mt-1 block text-sm text-gray-500">Arrastra y suelta o haz clic</span>
                        <span className="mt-1 block text-xs text-gray-400">JPG, PNG, GIF hasta 5MB</span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('image-upload').click()}
                      className="mt-2 btn btn-outline btn-sm"
                    >
                      Seleccionar imagen
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <ImageIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formData.imagen.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(formData.imagen.tamaño)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, imagen: null})}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Archivo */}
            <div>
              <label className="label">Archivo adjunto (opcional)</label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                  isDraggingFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={(e) => handleDragEnter(e, 'file')}
                onDragOver={(e) => handleDragOver(e, 'file')}
                onDragLeave={(e) => handleDragLeave(e, 'file')}
                onDrop={handleFileDrop}
              >
                {!formData.archivo ? (
                  <div className="text-center">
                    <File className={`mx-auto h-12 w-12 ${isDraggingFile ? 'text-green-500' : 'text-gray-400'}`} />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">Subir archivo</span>
                        <span className="mt-1 block text-sm text-gray-500">Arrastra y suelta o haz clic</span>
                        <span className="mt-1 block text-xs text-gray-400">PDF, DOC, XLS, etc. hasta 10MB</span>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileUpload}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload').click()}
                      className="mt-2 btn btn-outline btn-sm"
                    >
                      Seleccionar archivo
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <File className="h-5 w-5 text-red-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formData.archivo.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(formData.archivo.tamaño)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, archivo: null})}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                className="mr-2"
                checked={formData.activo}
                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
              />
              <label htmlFor="activo" className="text-sm">
                Publicar inmediatamente (visible para todos)
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-outline px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 flex items-center gap-2"
              >
                <Plus size={18} />
                Crear Aviso
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default CreateAvisoModal
