import { get, post, put, del } from './api'

/**
 * Servicio para gestión de documentos
 * Conecta con las APIs reales del backend
 */
export const documentsService = {
  /**
   * Obtener todos los documentos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de documentos
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/documents?${queryString}` : '/documents'

      const response = await get(endpoint)
      return response.documents || response.data || response
    } catch (error) {
      console.error('Error al obtener documentos:', error)
      throw error
    }
  },

  /**
   * Obtener documento por ID
   * @param {number} id - ID del documento
   * @returns {Promise<Object>} Documento
   */
  async getById(id) {
    try {
      const response = await get(`/documents/${id}`)
      return response.document || response.data || response
    } catch (error) {
      console.error(`Error al obtener documento ${id}:`, error)
      throw error
    }
  },

  /**
   * Subir documento
   * @param {FormData} formData - Datos del documento con archivo
   * @returns {Promise<Object>} Documento creado
   */
  async upload(formData) {
    try {
      const token = localStorage.getItem('authToken')
      const config = {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
          // NO agregar Content-Type aquí, FormData lo maneja automáticamente
        },
        body: formData
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/documents`, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir documento')
      }

      return data.data || data.document || data
    } catch (error) {
      console.error('Error al subir documento:', error)
      throw error
    }
  },

  /**
   * Actualizar documento
   * @param {number} id - ID del documento
   * @param {Object} documentData - Datos actualizados
   * @returns {Promise<Object>} Documento actualizado
   */
  async update(id, documentData) {
    try {
      const response = await put(`/documents/${id}`, documentData)
      return response.document || response.data || response
    } catch (error) {
      console.error(`Error al actualizar documento ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar documento
   * @param {number} id - ID del documento
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/documents/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar documento ${id}:`, error)
      throw error
    }
  }
}

export default documentsService
