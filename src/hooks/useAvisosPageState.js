import { useState, useEffect } from 'react'
import { communicationsService } from '../services/communicationsService'

/**
 * Hook para gestión de avisos/notificaciones
 * Integrado con APIs reales del backend
 */
export const useAvisosPageState = (user) => {
  const [avisos, setAvisos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAviso, setSelectedAviso] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imageZoom, setImageZoom] = useState(1)
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
      const avisosData = await communicationsService.getAllAvisos()
      const apiUrl = import.meta.env.VITE_API_URL

      // Mapear avisos y construir URLs del proxy para archivos
      const mappedAvisos = (avisosData || []).map(aviso => {
        // Construir URL de imagen si existe
        let imageUrl = null
        if (aviso.image) {
          imageUrl = `${apiUrl}/avisos/file/${encodeURIComponent(aviso.image)}`
        }

        // Construir URL de archivo si existe
        let fileUrl = null
        if (aviso.file) {
          fileUrl = `${apiUrl}/avisos/file/${encodeURIComponent(aviso.file)}`
        }

        return {
          ...aviso,
          // Mapear campos del backend a formato esperado por el frontend
          titulo: aviso.title || aviso.titulo,
          contenido: aviso.content || aviso.contenido,
          enlace: aviso.link || aviso.enlace,
          activo: aviso.status === 'active',
          fechaCreacion: aviso.publication_date || aviso.date_time_registration || aviso.fecha_creacion,
          creadorNombre: aviso.publicado_por_nombre && aviso.publicado_por_apellidos
            ? `${aviso.publicado_por_nombre} ${aviso.publicado_por_apellidos}`
            : aviso.creador_nombre || 'Desconocido',
          // URLs de archivos para el proxy
          imagen: imageUrl ? { data: imageUrl, name: 'imagen', type: 'image/*' } : null,
          archivo: fileUrl ? {
            data: fileUrl,
            name: aviso.file_name || 'archivo',
            type: aviso.file_type || 'application/octet-stream',
            tamaño: aviso.file_size || 0
          } : null
        }
      })

      const sortedAvisos = mappedAvisos.sort((a, b) => {
        const dateA = new Date(a.fechaCreacion || 0)
        const dateB = new Date(b.fechaCreacion || 0)
        return dateB - dateA
      })
      setAvisos(sortedAvisos)
    } catch (error) {
      console.error('Error loading avisos:', error)
      setAvisos([])
    } finally {
      setLoading(false)
    }
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
        creador_nombre: user.name || user.name
      }

      await communicationsService.createAviso(avisoData)

      loadAvisos()
      handleCloseModal()
      alert('Aviso creado exitosamente')
    } catch (error) {
      console.error('Error creating aviso:', error)
      alert('Error al crear el aviso: ' + error.message)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAviso(null)
    setFormData({
      titulo: '',
      contenido: '',
      enlace: '',
      imagen: null,
      archivo: null,
      activo: true
    })
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

  const handleToggleActive = async (avisoId) => {
    try {
      const aviso = avisos.find(a => a.id === avisoId)
      if (!aviso) return

      await communicationsService.updateAviso(avisoId, {
        activo: !aviso.activo
      })
      loadAvisos()
    } catch (error) {
      console.error('Error toggling aviso status:', error)
      alert('Error al cambiar estado del aviso: ' + error.message)
    }
  }

  const handleZoomIn = () => setImageZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setImageZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleZoomReset = () => setImageZoom(1)

  const handleDownload = (archivo) => {
    const link = document.createElement('a')
    link.href = archivo.data
    link.download = archivo.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isPDF = (archivo) => archivo && archivo.type === 'application/pdf'

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const stats = {
    total: avisos.length,
    activos: avisos.filter(a => a.activo).length,
    inactivos: avisos.filter(a => !a.activo).length,
    thisMonth: avisos.filter(a => {
      if (!a.fechaCreacion) return false
      const date = new Date(a.fechaCreacion)
      if (isNaN(date.getTime())) return false
      const now = new Date()
      return date.getMonth() === now.getMonth() &&
             date.getFullYear() === now.getFullYear()
    }).length
  }

  return {
    avisos,
    loading,
    isModalOpen,
    setIsModalOpen,
    selectedAviso,
    setSelectedAviso,
    imageZoom,
    formData,
    setFormData,
    stats,
    handleSubmit,
    handleCloseModal,
    handleDelete,
    handleToggleActive,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleDownload,
    isPDF,
    formatFileSize
  }
}
