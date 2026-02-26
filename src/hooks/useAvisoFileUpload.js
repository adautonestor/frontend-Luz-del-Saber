import { useState } from 'react'

export const useAvisoFileUpload = (formData, setFormData) => {
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  const processImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, GIF)')
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB.')
      return false
    }
    return true
  }

  const processDocumentFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.')
      return false
    }
    return true
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file || !processImageFile(file)) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        imagen: { name: file.name, type: file.type, tamaño: file.size, data: e.target.result, file: file }
      }))
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file || !processDocumentFile(file)) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        archivo: { name: file.name, type: file.type, tamaño: file.size, data: e.target.result, file: file }
      }))
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleDragEnter = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      type === 'image' ? setIsDraggingImage(true) : setIsDraggingFile(true)
    }
  }

  const handleDragLeave = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    if (e.clientX <= rect.left || e.clientX >= rect.right || e.clientY <= rect.top || e.clientY >= rect.bottom) {
      type === 'image' ? setIsDraggingImage(false) : setIsDraggingFile(false)
    }
  }

  const handleDragOver = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    const isDragging = type === 'image' ? isDraggingImage : isDraggingFile
    if (!isDragging) {
      type === 'image' ? setIsDraggingImage(true) : setIsDraggingFile(true)
    }
  }

  const handleImageDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingImage(false)

    const file = e.dataTransfer.files[0]
    if (!file || !processImageFile(file)) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setFormData(prev => ({
        ...prev,
        imagen: { name: file.name, type: file.type, tamaño: file.size, data: ev.target.result, file: file }
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)

    const file = e.dataTransfer.files[0]
    if (!file || !processDocumentFile(file)) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setFormData(prev => ({
        ...prev,
        archivo: { name: file.name, type: file.type, tamaño: file.size, data: ev.target.result, file: file }
      }))
    }
    reader.readAsDataURL(file)
  }

  return {
    isDraggingImage,
    isDraggingFile,
    handleImageUpload,
    handleFileUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleImageDrop,
    handleFileDrop
  }
}
