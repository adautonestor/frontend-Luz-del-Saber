import { get, post, put, del } from './api'

/**
 * Servicio para gestión de reuniones de padres
 * Conecta con las APIs reales del backend
 */
export const parentMeetingsService = {
  /**
   * Obtener todas las reuniones
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de reuniones
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/parent-meetings?${queryString}` : '/parent-meetings'

      const response = await get(endpoint)
      return response.meetings || response.data || response
    } catch (error) {
      console.error('Error al obtener reuniones:', error)
      throw error
    }
  },

  /**
   * Obtener reunión por ID
   * @param {number} id - ID de la reunión
   * @returns {Promise<Object>} Reunión
   */
  async getById(id) {
    try {
      const response = await get(`/parent-meetings/${id}`)
      return response.meeting || response.data || response
    } catch (error) {
      console.error(`Error al obtener reunión ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear reunión
   * @param {Object} meetingData - Datos de la reunión
   * @returns {Promise<Object>} Reunión creada
   */
  async create(meetingData) {
    try {
      const response = await post('/parent-meetings', meetingData)
      return response.meeting || response.data || response
    } catch (error) {
      console.error('Error al crear reunión:', error)
      throw error
    }
  },

  /**
   * Actualizar reunión
   * @param {number} id - ID de la reunión
   * @param {Object} meetingData - Datos actualizados
   * @returns {Promise<Object>} Reunión actualizada
   */
  async update(id, meetingData) {
    try {
      const response = await put(`/parent-meetings/${id}`, meetingData)
      return response.meeting || response.data || response
    } catch (error) {
      console.error(`Error al actualizar reunión ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar reunión
   * @param {number} id - ID de la reunión
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/parent-meetings/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar reunión ${id}:`, error)
      throw error
    }
  }
}

export default parentMeetingsService
