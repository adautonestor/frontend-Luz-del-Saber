import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, Download, AlertCircle, Image as ImageIcon,
  ZoomIn, ZoomOut, RotateCw, Maximize2, RefreshCw, Users
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { schedulesService } from '../../services/schedulesService'
import { parentStudentRelationsService } from '../../services/parentStudentRelationsService'

const ParentHorarios = () => {
  const { user } = useAuthStore()
  const [horarioImage, setHorarioImage] = useState(null)
  const [horarioInfo, setHorarioInfo] = useState(null)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    loadChildren()
  }, [user])

  useEffect(() => {
    if (selectedChild) {
      loadHorarioImage()
    }
  }, [selectedChild])

  const loadChildren = async () => {
    try {
      const parentId = user?.parentId || (user?.rol === 'Padre' ? user?.id : null)
      if (!parentId) return

      const studentsData = await parentStudentRelationsService.getStudentsByParent(parentId)
      setChildren(studentsData || [])

      if (studentsData && studentsData.length > 0) {
        setSelectedChild(studentsData[0])
      }
    } catch (error) {
      console.error('Error loading children:', error)
      setChildren([])
    }
  }

  const loadHorarioImage = async () => {
    if (!selectedChild) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Obtener todas las imágenes de horarios
      const allImages = await schedulesService.getAllImages()

      // Filtrar por el grado y sección del hijo seleccionado
      const childSchedule = allImages.find(img =>
        img.type === 'alumnos' &&
        img.grade_id === selectedChild.grade_id &&
        img.section_id === selectedChild.section_id
      )

      if (childSchedule) {
        setHorarioImage(childSchedule.imageData || childSchedule.imageUrl)
        setHorarioInfo(childSchedule)
      } else {
        setHorarioImage(null)
        setHorarioInfo(null)
      }
    } catch (error) {
      console.error('❌ Error al cargar imagen del horario:', error)
      setHorarioImage(null)
      setHorarioInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    console.log('🔄 Refrescando horario...')
    loadHorarioImage()
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  const handleDownload = async () => {
    if (!horarioImage) return

    try {
      // Fetch the image as blob
      const response = await fetch(horarioImage)
      const blob = await response.blob()

      // Create blob URL and download
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      const childName = selectedChild ? `${selectedChild.first_names}_${selectedChild.paternal_last_name || ''}` : 'escolar'
      link.download = `horario_${childName.replace(/\s+/g, '_')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up blob URL
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Error al descargar imagen:', error)
      // Fallback: open in new tab
      window.open(horarioImage, '_blank')
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-600" />
              Horario Escolar
            </h1>
            <p className="text-gray-600 mt-1">
              {selectedChild
                ? `Horario de ${selectedChild.first_names}${selectedChild.last_names ? ` ${selectedChild.last_names}` : ''} ${selectedChild.paternal_last_name || ''} ${selectedChild.maternal_last_name || ''}`.trim()
                : 'Consulta el horario de clases de tu hijo'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Selector de hijo */}
            {children.length > 1 && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedChild?.id || ''}
                  onChange={(e) => {
                    const child = children.find(c => c.id === parseInt(e.target.value))
                    setSelectedChild(child)
                  }}
                  className="input py-2"
                >
                  {children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.paternal_last_name || ''} {child.maternal_last_name || ''}, {child.first_names}{child.last_names ? ` ${child.last_names}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Actualizar horario"
              >
                <RefreshCw className="w-5 h-5" />
                Actualizar
              </button>
              {horarioImage && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Descargar
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Image Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        {horarioImage ? (
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Alejar"
                  disabled={zoom <= 50}
                >
                  <ZoomOut className={`w-5 h-5 ${zoom <= 50 ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>

                <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                  {zoom}%
                </span>

                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Acercar"
                  disabled={zoom >= 200}
                >
                  <ZoomIn className={`w-5 h-5 ${zoom >= 200 ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>

                <button
                  onClick={handleResetZoom}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Restablecer zoom"
                >
                  <RotateCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Maximize2 className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Pantalla completa</span>
              </button>
            </div>

            {/* Image Display */}
            <div className="overflow-auto max-h-[calc(100vh-350px)] bg-gray-50 rounded-lg p-4">
              <div className="flex justify-center items-center min-h-[400px]">
                <img
                  src={horarioImage}
                  alt="Horario Escolar"
                  style={{
                    width: `${zoom}%`,
                    maxWidth: 'none',
                    transition: 'width 0.2s ease-in-out'
                  }}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Información importante:</p>
                <p className="mt-1">
                  Este es el horario general actualizado por la dirección del colegio.
                  Para consultas específicas, contacte con la secretaría.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // No image available
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay horario disponible
            </h3>
            <p className="text-gray-600 max-w-md">
              La dirección del colegio aún no ha publicado el horario general.
              Por favor, vuelve a consultar más tarde.
            </p>
          </div>
        )}
      </motion.div>

      {/* Fullscreen Modal */}
      {isFullscreen && horarioImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          <div className="relative w-full h-full p-4">
            {/* Close button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Fullscreen image */}
            <div className="flex items-center justify-center h-full">
              <img
                src={horarioImage}
                alt="Horario Escolar - Pantalla Completa"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParentHorarios
