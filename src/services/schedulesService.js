import { get, post, put, del } from './api'

/**
 * Servicio para gestión de horarios
 * Conecta con las APIs reales del backend
 */
export const schedulesService = {
  // ========== HORARIOS ==========

  /**
   * Obtener todos los horarios
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de horarios
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/schedules?${queryString}` : '/schedules'

      const response = await get(endpoint)
      return response.horarios || response.data || response
    } catch (error) {
      console.error('Error al obtener horarios:', error)
      throw error
    }
  },

  /**
   * Obtener horario por ID
   * @param {number} id - ID del horario
   * @returns {Promise<Object>} Horario
   */
  async getById(id) {
    try {
      const response = await get(`/schedules/${id}`)
      return response.horario || response.data || response
    } catch (error) {
      console.error(`Error al obtener horario ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear horario
   * @param {Object} scheduleData - Datos del horario
   * @returns {Promise<Object>} Horario creado
   */
  async create(scheduleData) {
    try {
      const response = await post('/schedules', scheduleData)
      return response.horario || response.data || response
    } catch (error) {
      console.error('Error al crear horario:', error)
      throw error
    }
  },

  /**
   * Actualizar horario
   * @param {number} id - ID del horario
   * @param {Object} scheduleData - Datos actualizados
   * @returns {Promise<Object>} Horario actualizado
   */
  async update(id, scheduleData) {
    try {
      const response = await put(`/schedules/${id}`, scheduleData)
      return response.horario || response.data || response
    } catch (error) {
      console.error(`Error al actualizar horario ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar horario
   * @param {number} id - ID del horario
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/schedules/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar horario ${id}:`, error)
      throw error
    }
  },

  // ========== IMÁGENES DE HORARIOS ==========

  /**
   * Obtener todas las imágenes de horarios
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de imágenes
   */
  async getAllImages(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/schedule-images?${queryString}` : '/schedule-images'

      const response = await get(endpoint)
      const images = response.imagenes || response.images || response.data || response

      // Transformar snake_case a camelCase y agregar URL de imagen
      return images.map(img => ({
        id: img.id,
        titulo: img.title,
        title: img.title,
        description: img.description,
        type: img.type,
        level_id: img.level_id,
        grade_id: img.grade_id,
        section_id: img.section_id,
        teacher_id: img.teacher_id,
        fileName: img.file_name,
        filePath: img.file_path,
        fileSize: img.file_size,
        fileType: img.file_type,
        // Usar image_url del backend (proxy) o image_data para compatibilidad
        imageData: img.image_url || img.image_data,
        imageUrl: img.image_url,
        uploadDate: img.upload_date || img.date_time_registration,
        uploadedBy: img.uploaded_by,
        status: img.status,
        // Datos relacionados
        gradeName: img.grade_name,
        sectionName: img.section_name,
        levelName: img.level_name,
        uploadedByName: img.uploaded_by_name
      }))
    } catch (error) {
      console.error('Error al obtener imágenes de horarios:', error)
      throw error
    }
  },

  /**
   * Subir imagen de horario
   * @param {FormData} formData - FormData con la imagen
   * @returns {Promise<Object>} Imagen subida
   */
  async uploadImage(formData) {
    try {
      const token = localStorage.getItem('authToken')
      const apiUrl = import.meta.env.VITE_API_URL
      const response = await fetch(`${apiUrl}/schedule-images`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        // Capturar el mensaje de error del servidor
        const errorMessage = data.error || data.message || data.mensaje || 'Error al subir imagen'
        console.error('Error del servidor:', data)
        throw new Error(errorMessage)
      }

      return data.imagen || data.image || data.data || data
    } catch (error) {
      console.error('Error al subir imagen de horario:', error)
      throw error
    }
  },

  /**
   * Eliminar imagen de horario
   * @param {number} id - ID de la imagen
   * @returns {Promise<Object>} Confirmación
   */
  async removeImage(id) {
    try {
      const response = await del(`/schedule-images/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar imagen ${id}:`, error)
      throw error
    }
  },

  /**
   * Descargar imagen de horario
   * @param {string} imageUrl - URL de la imagen (proxy URL o data URL)
   * @param {string} fileName - Nombre del archivo para la descarga
   */
  async downloadImage(imageUrl, fileName) {
    try {
      // Si es un data URL (base64), crear blob directamente
      if (imageUrl.startsWith('data:')) {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        this._triggerDownload(blob, fileName)
        return
      }

      // Si es una URL de proxy, hacer fetch con credenciales
      const token = localStorage.getItem('authToken')
      const response = await fetch(imageUrl, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (!response.ok) {
        throw new Error('Error al descargar la imagen')
      }

      const blob = await response.blob()
      this._triggerDownload(blob, fileName)
    } catch (error) {
      console.error('Error al descargar imagen:', error)
      throw error
    }
  },

  /**
   * Helper para triggear la descarga
   * @private
   */
  _triggerDownload(blob, fileName) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'horario.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

export default schedulesService
