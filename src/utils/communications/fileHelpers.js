import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/constants/communications'

/**
 * Formatea el tamaño del archivo en formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Maneja la subida de archivos
 * @param {Event} event - Evento de input file
 * @param {Function} setFormData - Función para actualizar el estado del formulario
 */
export const handleFileUpload = (event, setFormData) => {
  const files = Array.from(event.target.files)

  files.forEach(file => {
    // Validar tipo de archivo
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert(`Tipo de archivo no permitido: ${file.type}. Solo se permiten imágenes (JPG, PNG, GIF) y PDF.`)
      return
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > MAX_FILE_SIZE) {
      alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const adjunto = {
        id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        tamaño: file.size,
        data: e.target.result,
        file: file, // Guardar el archivo original para subir a Wasabi
        fechaSubida: new Date().toISOString()
      }

      setFormData(prev => ({
        ...prev,
        adjuntos: [...prev.adjuntos, adjunto]
      }))
    }
    reader.readAsDataURL(file)
  })

  // Limpiar el input
  event.target.value = ''
}

/**
 * Elimina un adjunto del formulario
 * @param {string} adjuntoId - ID del adjunto a eliminar
 * @param {Function} setFormData - Función para actualizar el estado del formulario
 */
export const removeAttachment = (adjuntoId, setFormData) => {
  setFormData(prev => ({
    ...prev,
    adjuntos: prev.adjuntos.filter(adj => adj.id !== adjuntoId)
  }))
}
