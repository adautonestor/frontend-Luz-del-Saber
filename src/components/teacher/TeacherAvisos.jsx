import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Megaphone, Calendar, Clock, Link as LinkIcon, Image as ImageIcon,
  File, Eye, X, Download, ZoomIn, ZoomOut, Plus, Edit, Trash2, Paperclip
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { avisosService } from '../../services/avisosService'
import { communicationsService } from '../../services/communicationsService'

const TeacherAvisos = () => {
  const { user } = useAuthStore()
  const [avisos, setAvisos] = useState([])
  const [selectedAviso, setSelectedAviso] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imageZoom, setImageZoom] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    enlace: '',
    imagen: null,
    archivo: null,
    activo: true
  })

  useEffect(() => {
    loadAvisos()
  }, [])

  const loadAvisos = async () => {
    setLoading(true)
    try {
      const avisosData = await avisosService.getAll() || []
      // Solo mostrar avisos activos
      const avisosActivos = avisosData
        .filter(aviso => aviso.activo)
        .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
      setAvisos(avisosActivos)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleZoomReset = () => {
    setImageZoom(1)
  }

  const handleCloseModal = () => {
    setSelectedAviso(null)
    setImageZoom(1)
  }

  const isPDF = (archivo) => {
    return archivo && archivo.type === 'application/pdf'
  }

  const handleDownload = (archivo) => {
    const link = document.createElement('a')
    link.href = archivo.data
    link.download = archivo.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, GIF)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        imagen: {
          name: file.name,
          type: file.type,
          tamaño: file.size,
          data: e.target.result,
          file: file // Guardar el archivo original para subir a Wasabi
        }
      }))
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        archivo: {
          name: file.name,
          type: file.type,
          tamaño: file.size,
          data: e.target.result,
          file: file // Guardar el archivo original para subir a Wasabi
        }
      }))
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const avisoData = {
        titulo: formData.titulo,
        contenido: formData.contenido,
        enlace: formData.enlace,
        imagen: formData.imagen,
        archivo: formData.archivo,
        activo: formData.activo,
        creado_por: user.id,
        creador_nombre: user.name
      }

      await communicationsService.createAviso(avisoData)

      loadAvisos()
      handleCloseModalForm()
      alert('Aviso creado exitosamente')
    } catch (error) {
      console.error('Error creating aviso:', error)
      alert('Error al crear el aviso: ' + error.message)
    }
  }

  const handleCloseModalForm = async () => {
    setIsModalOpen(false)
    setFormData({
      titulo: '',
      contenido: '',
      enlace: '',
      imagen: null,
      archivo: null,
      activo: true
    })
    setIsDraggingImage(false)
    setIsDraggingFile(false)
  }

  const handleDelete = async (avisoId) => {
    if (confirm('¿Estás seguro de eliminar este aviso?')) {
      try {
        await communicationsService.removeAviso(avisoId)
        loadAvisos()
      } catch (error) {
        console.error('Error deleting aviso:', error)
        alert('Error al eliminar el aviso: ' + error.message)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Avisos</h1>
          <p className="mt-2 text-gray-600">
            Avisos importantes del colegio
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Crear Aviso
        </button>
      </div>

      {/* Avisos Grid */}
      {avisos.length === 0 ? (
        <div className="card p-12 text-center">
          <Megaphone className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay avisos disponibles
          </h3>
          <p className="text-gray-600">
            Los avisos importantes aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avisos.map((aviso, index) => (
            <motion.div
              key={aviso.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedAviso(aviso)}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Megaphone className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {aviso.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {aviso.contenido}
                  </p>
                </div>
              </div>

              {/* Adjuntos indicators */}
              <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                {aviso.imagen && (
                  <span className="flex items-center gap-1">
                    <ImageIcon size={14} className="text-blue-500" />
                    Imagen
                  </span>
                )}
                {aviso.archivo && (
                  <span className="flex items-center gap-1">
                    <File size={14} className="text-red-500" />
                    Archivo
                  </span>
                )}
                {aviso.enlace && (
                  <span className="flex items-center gap-1">
                    <LinkIcon size={14} className="text-purple-500" />
                    Enlace
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(aviso.fechaCreacion).toLocaleDateString('es-PE')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedAviso(aviso)
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Eye size={14} />
                    Ver más
                  </button>
                  {aviso.creadoPor === user?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(aviso.id)
                      }}
                      className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      title="Eliminar aviso"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Ver Detalle */}
      {selectedAviso && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Megaphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedAviso.titulo}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar size={14} />
                      {new Date(selectedAviso.fechaCreacion).toLocaleDateString('es-PE')}
                      <Clock size={14} className="ml-2" />
                      {new Date(selectedAviso.fechaCreacion).toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
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
                  <span className="text-gray-500">Publicado por:</span>
                  <span className="font-medium">{selectedAviso.creadorNombre || 'Administración'}</span>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCloseModal}
                  className="btn btn-outline px-4 py-2"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Modal Crear Aviso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModalForm}></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Megaphone className="text-blue-600" />
                  Crear Nuevo Aviso
                </h2>
                <button
                  onClick={handleCloseModalForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Título del aviso"
                  />
                </div>

                {/* Contenido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido *
                  </label>
                  <textarea
                    required
                    value={formData.contenido}
                    onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contenido del aviso"
                  />
                </div>

                {/* Enlace */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enlace (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.enlace}
                    onChange={(e) => setFormData({ ...formData, enlace: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen (opcional)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="btn btn-outline flex items-center gap-2 cursor-pointer"
                    >
                      <ImageIcon size={18} />
                      Seleccionar Imagen
                    </label>
                    {formData.imagen && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ImageIcon size={16} className="text-blue-500" />
                        <span>{formData.imagen.name}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imagen: null })}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  {formData.imagen && (
                    <div className="mt-3">
                      <img
                        src={formData.imagen.data}
                        alt="Preview"
                        className="max-w-full h-auto rounded border border-gray-200 max-h-48"
                      />
                    </div>
                  )}
                </div>

                {/* Archivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo Adjunto (opcional)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="btn btn-outline flex items-center gap-2 cursor-pointer"
                    >
                      <Paperclip size={18} />
                      Seleccionar Archivo
                    </label>
                    {formData.archivo && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <File size={16} className="text-red-500" />
                        <span>{formData.archivo.name}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, archivo: null })}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModalForm}
                    className="flex-1 btn btn-outline"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    Crear Aviso
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherAvisos
