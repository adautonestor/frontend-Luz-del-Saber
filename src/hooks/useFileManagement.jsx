import { FileText, Image, File } from 'lucide-react'

/**
 * Hook para gestión de archivos adjuntos en comunicaciones
 * Maneja carga, validación, eliminación y helpers de archivos
 */
export const useFileManagement = (newCommunication, setNewCommunication) => {
  // Configuración de archivos permitidos
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  /**
   * Procesa archivos cargados - valida tipo y tamaño
   */
  const processFiles = (files) => {
    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`Tipo de archivo no permitido: ${file.name}`)
        return
      }

      if (file.size > maxSize) {
        alert(`El archivo ${file.name} excede el tamaño máximo de 5MB`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const attachmentData = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result,
          file: file // Guardar archivo original para subir a Wasabi
        }

        setNewCommunication(prev => ({
          ...prev,
          attachments: [...prev.attachments, attachmentData]
        }))
      }

      reader.readAsDataURL(file)
    })
  }

  /**
   * Handler para selección de archivos por input
   */
  const handleFilesSelect = (event) => {
    const files = Array.from(event.target.files)
    processFiles(files)
  }

  /**
   * Handler para drag and drop de archivos
   */
  const handleFilesDrop = (event) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    processFiles(files)
  }

  /**
   * Elimina un archivo adjunto por índice
   */
  const removeAttachment = (index) => {
    setNewCommunication(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  /**
   * Formatea el tamaño de archivo en bytes a formato legible
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Retorna el icono correspondiente al tipo de archivo
   */
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-600" />
    } else if (fileType.includes('image')) {
      return <Image className="w-8 h-8 text-green-600" />
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="w-8 h-8 text-blue-600" />
    } else {
      return <File className="w-8 h-8 text-gray-600" />
    }
  }

  /**
   * Verifica si un archivo es PDF
   */
  const isPDF = (file) => {
    return file && (file.type === 'application/pdf' || file.type === 'application/pdf')
  }

  /**
   * Descarga un archivo adjunto
   */
  const handleDownload = (file) => {
    const link = document.createElement('a')
    link.href = file.url || file.data
    link.download = file.name || file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    handleFilesSelect,
    handleFilesDrop,
    removeAttachment,
    formatFileSize,
    getFileIcon,
    isPDF,
    handleDownload,
    maxSize,
    allowedTypes
  }
}
