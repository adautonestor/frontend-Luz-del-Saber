import { get, post, put, del } from './api'

/**
 * Servicio para gestión de horarios de asistencia
 */
const attendanceSchedulesService = {
  /**
   * Obtiene todos los horarios de asistencia
   */
  getAll: async () => {
    try {
      const response = await get('/attendance-schedules')
      return response.data || []
    } catch (error) {
      console.error('Error fetching attendance schedules:', error)
      return []
    }
  },

  /**
   * Obtiene un horario por ID
   */
  getById: async (id) => {
    try {
      const response = await get(`/attendance-schedules/${id}`)
      return response.data || null
    } catch (error) {
      console.error('Error fetching attendance schedule:', error)
      return null
    }
  },

  /**
   * Obtiene horario por level_id
   */
  getByLevelId: async (levelId) => {
    try {
      const response = await get(`/attendance-schedules/level/${levelId}`)
      return response.data || null
    } catch (error) {
      // 404 es esperado si no hay horario para el nivel
      if (error.response?.status !== 404) {
        console.error('Error fetching attendance schedule by level:', error)
      }
      return null
    }
  },

  /**
   * Crea un nuevo horario
   */
  create: async (data) => {
    try {
      const response = await post('/attendance-schedules', data)
      return response
    } catch (error) {
      console.error('Error creating attendance schedule:', error)
      throw error
    }
  },

  /**
   * Actualiza un horario existente
   */
  update: async (id, data) => {
    try {
      const response = await put(`/attendance-schedules/${id}`, data)
      return response
    } catch (error) {
      console.error('Error updating attendance schedule:', error)
      throw error
    }
  },

  /**
   * Guarda múltiples horarios (upsert)
   */
  saveAll: async (schedules) => {
    try {
      const response = await post('/attendance-schedules/save-all', { schedules })
      return response
    } catch (error) {
      console.error('Error saving attendance schedules:', error)
      throw error
    }
  },

  /**
   * Elimina un horario
   */
  delete: async (id) => {
    try {
      const response = await del(`/attendance-schedules/${id}`)
      return response
    } catch (error) {
      console.error('Error deleting attendance schedule:', error)
      throw error
    }
  }
}

export default attendanceSchedulesService
