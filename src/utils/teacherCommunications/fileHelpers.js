/**
 * Helpers para manejo de archivos adjuntos
 */

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const isPDF = (archivo) => {
  return archivo && archivo.type === 'application/pdf'
}

export const handleDownload = (archivo) => {
  const link = document.createElement('a')
  link.href = archivo.data
  link.download = archivo.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const validateImageFile = (file) => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Por favor selecciona una imagen válida (JPG, PNG, GIF)' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'La imagen es demasiado grande. Máximo 5MB.' }
  }

  return { valid: true }
}

export const validateDocumentFile = (file) => {
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'El archivo es demasiado grande. Máximo 10MB.' }
  }

  return { valid: true }
}

export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve({
        name: file.name,
        type: file.type,
        tamaño: file.size,
        data: e.target.result
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
