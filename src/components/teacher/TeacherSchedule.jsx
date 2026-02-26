import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Download, AlertCircle, Image as ImageIcon,
  ZoomIn, ZoomOut, RotateCw, X, RefreshCw, ChevronLeft, ChevronRight,
  GraduationCap, Layers
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { schedulesService } from '../../services/schedulesService'
import { courseAssignmentsService } from '../../services/courseAssignmentsService'
import { get } from '../../services/api'

const TeacherSchedule = () => {
  const { user } = useAuthStore()
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedHorario, setSelectedHorario] = useState(null)
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    loadHorarios()
  }, [user])

  const loadHorarios = async () => {
    setLoading(true)
    try {
      // 1. Obtener todas las imágenes de horarios
      const allImages = await schedulesService.getAllImages()

      // 2. Obtener asignaciones del docente para conocer sus niveles
      const teacherId = user?.id
      let teacherLevelIds = new Set()

      // Si el usuario tiene level_id directo, agregarlo
      if (user?.level_id) {
        teacherLevelIds.add(Number(user.level_id))
      }
      if (user?.nivel_id) {
        teacherLevelIds.add(Number(user.nivel_id))
      }

      // 3. Obtener asignaciones del profesor para determinar sus niveles
      try {
        const assignments = await courseAssignmentsService.getByTeacher(teacherId)

        if (assignments && assignments.length > 0) {
          // Obtener todos los grados para mapear grade_id -> level_id
          const gradesResponse = await get('/grades')
          const grades = gradesResponse.grades || gradesResponse.data || gradesResponse || []

          // Extraer level_ids de las asignaciones
          assignments.forEach(assignment => {
            const gradeId = assignment.grade_id
            const grade = grades.find(g => Number(g.id) === Number(gradeId))
            if (grade && grade.level_id) {
              teacherLevelIds.add(Number(grade.level_id))
            }
          })
        }
      } catch (error) {
        console.warn('No se pudieron cargar asignaciones del profesor:', error)
      }

      // 4. Filtrar horarios de tipo 'docentes' que correspondan a los niveles del profesor
      let teacherSchedules = []

      if (teacherLevelIds.size > 0) {
        // Filtrar todas las imágenes de los niveles del docente
        teacherSchedules = allImages.filter(img =>
          img.type === 'docentes' &&
          teacherLevelIds.has(Number(img.level_id))
        )
      }

      // Si no hay horarios por nivel específico, buscar horarios generales de docentes
      if (teacherSchedules.length === 0) {
        teacherSchedules = allImages.filter(img => img.type === 'docentes')
      }

      // Ordenar por nivel y fecha de subida
      teacherSchedules.sort((a, b) => {
        // Primero por nivel
        if (a.level_id !== b.level_id) {
          return (a.level_id || 0) - (b.level_id || 0)
        }
        // Luego por fecha de subida (más reciente primero)
        return new Date(b.upload_date || 0) - new Date(a.upload_date || 0)
      })

      setHorarios(teacherSchedules)

      // Seleccionar el primer horario por defecto
      if (teacherSchedules.length > 0 && !selectedHorario) {
        setSelectedHorario(teacherSchedules[0])
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error)
      setHorarios([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadHorarios()
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

  const handleDownload = async (horario) => {
    const imageUrl = horario?.image_data || horario?.imageData || horario?.imageUrl
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `horario_${horario?.title || horario?.levelName || 'docentes'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Error al descargar imagen:', error)
      window.open(imageUrl, '_blank')
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const selectHorario = (horario) => {
    setSelectedHorario(horario)
    setZoom(100)
  }

  const navigateHorario = (direction) => {
    const currentIndex = horarios.findIndex(h => h.id === selectedHorario?.id)
    let newIndex = currentIndex + direction

    if (newIndex < 0) newIndex = horarios.length - 1
    if (newIndex >= horarios.length) newIndex = 0

    setSelectedHorario(horarios[newIndex])
    setZoom(100)
  }

  // Agrupar horarios por nivel para la visualización
  const horariosByLevel = horarios.reduce((acc, horario) => {
    const levelName = horario.levelName || horario.level_name || 'General'
    if (!acc[levelName]) {
      acc[levelName] = []
    }
    acc[levelName].push(horario)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const selectedImageUrl = selectedHorario?.image_data || selectedHorario?.imageData || selectedHorario?.imageUrl

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              Mis Horarios
            </h1>
            <p className="text-gray-600 mt-1">
              {horarios.length > 0
                ? `${horarios.length} horario${horarios.length > 1 ? 's' : ''} disponible${horarios.length > 1 ? 's' : ''}`
                : 'Consulta tus horarios de clases'}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </motion.div>

      {horarios.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Lista de horarios */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gray-500" />
                  Horarios Disponibles
                </h2>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {Object.entries(horariosByLevel).map(([levelName, levelHorarios]) => (
                  <div key={levelName} className="border-b border-gray-100 last:border-b-0">
                    {/* Header del nivel */}
                    <div className="px-4 py-2 bg-gray-50/50 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {levelName}
                      </span>
                      <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {levelHorarios.length}
                      </span>
                    </div>

                    {/* Lista de horarios del nivel */}
                    <div className="divide-y divide-gray-50">
                      {levelHorarios.map((horario, index) => {
                        const isSelected = selectedHorario?.id === horario.id
                        return (
                          <button
                            key={horario.id}
                            onClick={() => selectHorario(horario)}
                            className={`w-full text-left p-3 transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-l-4 border-blue-500'
                                : 'hover:bg-gray-50 border-l-4 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                <ImageIcon className={`w-5 h-5 ${
                                  isSelected ? 'text-blue-600' : 'text-gray-400'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                  isSelected ? 'text-blue-900' : 'text-gray-800'
                                }`}>
                                  {horario.title || `Horario ${index + 1}`}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {horario.description || `Subido: ${new Date(horario.upload_date).toLocaleDateString('es-PE')}`}
                                </p>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main - Visor de horario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {selectedHorario && selectedImageUrl ? (
                <>
                  {/* Toolbar */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-1">
                      {/* Navegación */}
                      {horarios.length > 1 && (
                        <>
                          <button
                            onClick={() => navigateHorario(-1)}
                            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Horario anterior"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                          </button>
                          <span className="text-sm text-gray-500 px-2">
                            {horarios.findIndex(h => h.id === selectedHorario.id) + 1} / {horarios.length}
                          </span>
                          <button
                            onClick={() => navigateHorario(1)}
                            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Horario siguiente"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </button>
                          <div className="w-px h-6 bg-gray-300 mx-2" />
                        </>
                      )}

                      {/* Zoom controls */}
                      <button
                        onClick={handleZoomOut}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Alejar"
                        disabled={zoom <= 50}
                      >
                        <ZoomOut className={`w-5 h-5 ${zoom <= 50 ? 'text-gray-300' : 'text-gray-600'}`} />
                      </button>
                      <span className="text-sm font-medium text-gray-600 min-w-[50px] text-center">
                        {zoom}%
                      </span>
                      <button
                        onClick={handleZoomIn}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Acercar"
                        disabled={zoom >= 200}
                      >
                        <ZoomIn className={`w-5 h-5 ${zoom >= 200 ? 'text-gray-300' : 'text-gray-600'}`} />
                      </button>
                      <button
                        onClick={handleResetZoom}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Restablecer"
                      >
                        <RotateCw className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(selectedHorario)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Pantalla completa"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Info del horario seleccionado */}
                  <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          {selectedHorario.title || 'Horario de Docentes'}
                        </h3>
                        <p className="text-sm text-blue-700">
                          {selectedHorario.levelName || selectedHorario.level_name || 'General'}
                          {selectedHorario.description && ` • ${selectedHorario.description}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Image Display */}
                  <div className="overflow-auto max-h-[calc(100vh-400px)] bg-gray-100 p-4">
                    <div className="flex justify-center items-center min-h-[300px]">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={selectedHorario.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          src={selectedImageUrl}
                          alt={selectedHorario.title || 'Horario'}
                          style={{
                            width: `${zoom}%`,
                            maxWidth: 'none',
                            transition: 'width 0.2s ease-in-out'
                          }}
                          className="rounded-lg shadow-lg bg-white"
                        />
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">
                    Selecciona un horario de la lista para visualizarlo
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        // No hay horarios
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-12"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay horarios disponibles
            </h3>
            <p className="text-gray-600 max-w-md">
              La dirección del colegio aún no ha publicado horarios para tus niveles asignados.
              Por favor, vuelve a consultar más tarde o contacta con la administración.
            </p>
          </div>
        </motion.div>
      )}

      {/* Nota informativa */}
      {horarios.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Información:</p>
            <p className="mt-1">
              Estos son tus horarios oficiales de clases actualizados por la dirección.
              Para consultas o cambios, contacta con la coordinación académica.
            </p>
          </div>
        </motion.div>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && selectedImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            <div className="relative w-full h-full p-4">
              {/* Close button */}
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Navigation buttons */}
              {horarios.length > 1 && (
                <>
                  <button
                    onClick={() => navigateHorario(-1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8 text-white" />
                  </button>
                  <button
                    onClick={() => navigateHorario(1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-8 h-8 text-white" />
                  </button>
                </>
              )}

              {/* Image info */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white text-sm font-medium">
                  {selectedHorario?.title || 'Horario'} - {selectedHorario?.levelName || 'General'}
                </p>
              </div>

              {/* Fullscreen image */}
              <div className="flex items-center justify-center h-full">
                <img
                  src={selectedImageUrl}
                  alt="Horario - Pantalla Completa"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TeacherSchedule
