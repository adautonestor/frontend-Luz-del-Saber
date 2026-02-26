import { get, post, put, del } from './api'

/**
 * Servicio para gestión de asistencia a reuniones de padres
 * Conecta con las APIs reales del backend
 */
export const meetingAttendancesService = {
  /**
   * Obtener todas las asistencias a reuniones
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de asistencias
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/meeting-attendances?${queryString}` : '/meeting-attendances'

      const response = await get(endpoint)
      return response.attendances || response.data || response
    } catch (error) {
      console.error('Error al obtener asistencias a reuniones:', error)
      throw error
    }
  },

  /**
   * Obtener asistencia por ID
   * @param {number} id - ID de la asistencia
   * @returns {Promise<Object>} Asistencia
   */
  async getById(id) {
    try {
      const response = await get(`/meeting-attendances/${id}`)
      return response.attendance || response.data || response
    } catch (error) {
      console.error(`Error al obtener asistencia ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener asistencias por reunión
   * @param {number} meetingId - ID de la reunión
   * @returns {Promise<Array>} Lista de asistencias
   */
  async getByMeeting(meetingId) {
    try {
      const response = await get(`/meeting-attendances/meeting/${meetingId}`)
      return response.attendances || response.data || response
    } catch (error) {
      console.error(`Error al obtener asistencias de reunión ${meetingId}:`, error)
      throw error
    }
  },

  /**
   * Registrar asistencia
   * @param {Object} attendanceData - Datos de la asistencia
   * @returns {Promise<Object>} Asistencia registrada
   */
  async create(attendanceData) {
    try {
      const response = await post('/meeting-attendances', attendanceData)
      return response.attendance || response.data || response
    } catch (error) {
      console.error('Error al registrar asistencia:', error)
      throw error
    }
  },

  /**
   * Actualizar asistencia
   * @param {number} id - ID de la asistencia
   * @param {Object} attendanceData - Datos actualizados
   * @returns {Promise<Object>} Asistencia actualizada
   */
  async update(id, attendanceData) {
    try {
      const response = await put(`/meeting-attendances/${id}`, attendanceData)
      return response.attendance || response.data || response
    } catch (error) {
      console.error(`Error al actualizar asistencia ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar asistencia
   * @param {number} id - ID de la asistencia
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/meeting-attendances/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar asistencia ${id}:`, error)
      throw error
    }
  }
}

export default meetingAttendancesService
