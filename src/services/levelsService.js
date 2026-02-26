import { get } from './api'

/**
 * Servicio para gestión de niveles educativos
 */
const levelsService = {
  /**
   * Obtiene todos los niveles
   */
  getAll: async () => {
    try {
      const response = await get('/levels')
      // El backend devuelve { success: true, data: [...], total: n }
      return response.data || []
    } catch (error) {
      console.error('Error fetching levels:', error)
      return []
    }
  },

  /**
   * Obtiene un nivel por ID
   */
  getById: async (id) => {
    try {
      const response = await get(`/levels/${id}`)
      // El backend devuelve { success: true, data: {...} }
      return response.data || null
    } catch (error) {
      console.error('Error fetching level:', error)
      return null
    }
  }
}

export default levelsService
