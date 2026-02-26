import { useState } from 'react'
import { schedulesService } from '../services/schedulesService'

/**
 * Hook para gestión de carga de imágenes de horarios
 * Integrado con APIs reales del backend
 */
export const useScheduleUpload = (activeTab, selectedLevel, selectedGrade, selectedSection, levels, grades, sections, setScheduleImages) => {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    titulo: '',
    description: '',
    type: '',
    level_id: '',
    grade_id: '',
    section_id: '',
    teacher_id: '',
    archivo: null,
    preview: null
  })
  const [isDragging, setIsDragging] = useState(false)

  const openUploadModal = () => {
    setUploadForm({
      titulo: '',
      description: '',
      type: activeTab,
      level_id: selectedLevel || '',
      grade_id: selectedGrade || '',
      section_id: selectedSection || '',
      teacher_id: '',
      archivo: null,
      preview: null
    })
    setShowUploadModal(true)
  }

  const closeUploadModal = () => {
    setShowUploadModal(false)
    setUploadForm({
      titulo: '',
      description: '',
      type: '',
      level_id: '',
      grade_id: '',
      section_id: '',
      teacher_id: '',
      archivo: null,
      preview: null
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file) => {
    // Verificar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen')
      return
    }

    // Verificar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadForm(prev => ({
        ...prev,
        archivo: file,
        preview: e.target.result
      }))
    }
    reader.readAsDataURL(file)
  }

  // Drag and Drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      processFile(file)
    }
  }

  const handleUpload = async () => {
    try {
      if (!uploadForm.archivo || !uploadForm.type) {
        alert('Por favor seleccione una imagen y el tipo de horario')
        return
      }

      // Validar según el tipo
      if (uploadForm.type === 'alumnos' && (!uploadForm.grade_id || !uploadForm.section_id)) {
        alert('Para horarios de alumnos debe seleccionar grado y sección')
        return
      }

      if (uploadForm.type === 'docentes' && !uploadForm.level_id) {
        alert('Para horarios de docentes debe seleccionar un nivel educativo')
        return
      }

      // Generar título automático si no se proporciona
      let generatedTitle = ''
      const levelIdNum = uploadForm.level_id ? parseInt(uploadForm.level_id, 10) : null
      const gradeIdNum = uploadForm.grade_id ? parseInt(uploadForm.grade_id, 10) : null
      const sectionIdNum = uploadForm.section_id ? parseInt(uploadForm.section_id, 10) : null

      if (uploadForm.type === 'alumnos') {
        const levelName = levels.find(l => l.id === levelIdNum)?.name || ''
        const gradeName = grades.find(g => g.id === gradeIdNum)?.name || ''
        const sectionName = sections.find(s => s.id === sectionIdNum)?.name || ''
        generatedTitle = `Horario ${levelName} - ${gradeName} - Sección ${sectionName}`
      } else {
        const levelName = levels.find(l => l.id === levelIdNum)?.name || ''
        generatedTitle = `Horario Docentes - ${levelName}`
      }

      // Preparar FormData para el backend
      const formData = new FormData()
      formData.append('imagen', uploadForm.archivo)
      formData.append('titulo', generatedTitle)
      formData.append('description', uploadForm.description || '')
      formData.append('type', uploadForm.type)
      if (uploadForm.level_id) formData.append('level_id', uploadForm.level_id)
      if (uploadForm.grade_id) formData.append('grade_id', uploadForm.grade_id)
      if (uploadForm.section_id) formData.append('section_id', uploadForm.section_id)

      // Subir al backend
      await schedulesService.uploadImage(formData)

      // Recargar TODAS las imágenes desde el backend (sin filtros)
      const updatedImages = await schedulesService.getAllImages()
      setScheduleImages(updatedImages)

      console.log('✅ Imagen de horario subida exitosamente')
      closeUploadModal()
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error al subir la imagen: ' + error.message)
    }
  }

  return {
    showUploadModal,
    uploadForm,
    setUploadForm,
    isDragging,
    openUploadModal,
    closeUploadModal,
    handleFileChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleUpload
  }
}
