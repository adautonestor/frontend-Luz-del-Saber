import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Eye, Download, Image as ImageIcon, Upload, Loader2 } from 'lucide-react'
import { schedulesService } from '../../services/schedulesService'
import { formatDateSafe } from '../../utils/dateUtils'

const ScheduleImageGrid = ({
  filteredImages,
  activeTab,
  canManageSchedules,
  openViewModal,
  handleDelete,
  getItemName,
  formatFileSize,
  levels,
  grades,
  sections,
  selectedLevel,
  selectedGrade,
  selectedSection,
  openUploadModal
}) => {
  const [downloadingId, setDownloadingId] = useState(null)

  const handleDownload = async (image) => {
    try {
      setDownloadingId(image.id)
      await schedulesService.downloadImage(image.imageData, image.fileName || `horario_${image.id}.png`)
    } catch (error) {
      console.error('Error al descargar:', error)
      alert('Error al descargar la imagen')
    } finally {
      setDownloadingId(null)
    }
  }
  if (filteredImages.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {activeTab === 'alumnos' ? 'No hay horarios de alumnos' : 'No hay horarios de docentes'}
        </h3>
        <p className="text-gray-600 mb-6">
          {selectedLevel || selectedGrade || selectedSection
            ? 'No se encontraron horarios con los filtros aplicados.'
            : activeTab === 'alumnos'
            ? 'Sube el primer horario para alumnos organizados por grado y sección.'
            : 'Sube el primer horario para docentes organizado por nivel educativo.'}
        </p>
        {canManageSchedules() && (
          <button
            onClick={openUploadModal}
            className="btn btn-primary flex items-center gap-2 mx-auto"
          >
            <Upload size={20} />
            {activeTab === 'alumnos' ? 'Subir Horario de Alumnos' : 'Subir Horario de Docente'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Imagen */}
            <div className="relative">
              <img
                src={image.imageData}
                alt={image.titulo}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => openViewModal(image)}
              />
              {canManageSchedules() && (
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
                    title="Eliminar horario"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Información */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2 truncate">
                {image.titulo}
              </h4>

              {image.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {image.description}
                </p>
              )}

              {/* Detalles del archivo */}
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <span className="font-medium capitalize">
                    {image.type === 'alumnos' ? 'Para Alumnos' : 'Para Docentes'}
                  </span>
                </div>

                {image.type === 'alumnos' && (
                  <>
                    {image.level_id && (
                      <div className="flex justify-between">
                        <span>Nivel:</span>
                        <span className="font-medium">{getItemName(image.level_id, levels)}</span>
                      </div>
                    )}
                    {image.grade_id && (
                      <div className="flex justify-between">
                        <span>Grado:</span>
                        <span className="font-medium">{getItemName(image.grade_id, grades)}</span>
                      </div>
                    )}
                    {image.section_id && (
                      <div className="flex justify-between">
                        <span>Sección:</span>
                        <span className="font-medium">
                          {(() => {
                            const section = sections?.find(s => s.id === image.section_id)
                            if (!section) return getItemName(image.section_id, sections)
                            const turno = section.shift === 'morning' ? 'Mañana' : section.shift === 'afternoon' ? 'Tarde' : section.shift || ''
                            return `${section.name}${turno ? ` - ${turno}` : ''}`
                          })()}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {image.type === 'docentes' && image.level_id && (
                  <div className="flex justify-between">
                    <span>Nivel:</span>
                    <span className="font-medium">{getItemName(image.level_id, levels)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tamaño:</span>
                  <span className="font-medium">{formatFileSize(image.fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subido:</span>
                  <span className="font-medium">
                    {formatDateSafe(image.uploadDate)}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openViewModal(image)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Eye size={16} />
                  Ver
                </button>
                <button
                  onClick={() => handleDownload(image)}
                  disabled={downloadingId === image.id}
                  className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {downloadingId === image.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {downloadingId === image.id ? 'Descargando...' : 'Descargar'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ScheduleImageGrid
