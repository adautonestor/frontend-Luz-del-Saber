import { useState } from 'react'
import { validateImageFile, validateDocumentFile, readFileAsDataURL } from '@/utils/teacherCommunications'

/**
 * Hook para manejar la carga de archivos (imágenes y documentos)
 */
export const useFileUpload = (messageForm, setMessageForm) => {
  const [imageZoom, setImageZoom] = useState(1)

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    try {
      const imageData = await readFileAsDataURL(file)
      setMessageForm(prev => ({
        ...prev,
        imagen: imageData
      }))
    } catch (error) {
      console.error('Error al cargar imagen:', error)
      alert('Error al cargar la imagen. Por favor intente nuevamente.')
    }

    event.target.value = ''
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validation = validateDocumentFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    try {
      const fileData = await readFileAsDataURL(file)
      setMessageForm(prev => ({
        ...prev,
        archivo: fileData
      }))
    } catch (error) {
      console.error('Error al cargar archivo:', error)
      alert('Error al cargar el archivo. Por favor intente nuevamente.')
    }

    event.target.value = ''
  }

  const removeImage = () => {
    setMessageForm(prev => ({
      ...prev,
      imagen: null
    }))
    setImageZoom(1)
  }

  const removeFile = () => {
    setMessageForm(prev => ({
      ...prev,
      archivo: null
    }))
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

  return {
    imageZoom,
    handleImageUpload,
    handleFileUpload,
    removeImage,
    removeFile,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset
  }
}
