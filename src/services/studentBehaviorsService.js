import { get, post, put, del } from './api'

/**
 * Servicio para gestión de conductas de estudiantes
 * Conecta con las APIs reales del backend
 */
export const studentBehaviorsService = {
  /**
   * Obtener todas las conductas
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de conductas
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/student-behaviors?${queryString}` : '/student-behaviors'

      const response = await get(endpoint)
      return response.behaviors || response.data || response
    } catch (error) {
      console.error('Error al obtener conductas:', error)
      throw error
    }
  },

  /**
   * Obtener conducta por ID
   * @param {number} id - ID de la conducta
   * @returns {Promise<Object>} Conducta
   */
  async getById(id) {
    try {
      const response = await get(`/student-behaviors/${id}`)
      return response.behavior || response.data || response
    } catch (error) {
      console.error(`Error al obtener conducta ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener conductas por estudiante
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Array>} Lista de conductas del estudiante
   */
  async getByStudent(studentId) {
    try {
      const response = await get(`/student-behaviors/student/${studentId}`)
      return response.behaviors || response.data || response
    } catch (error) {
      console.error(`Error al obtener conductas del estudiante ${studentId}:`, error)
      throw error
    }
  },

  /**
   * Crear conducta
   * @param {Object} behaviorData - Datos de la conducta
   * @returns {Promise<Object>} Conducta creada
   */
  async create(behaviorData) {
    try {
      const response = await post('/student-behaviors', behaviorData)
      return response.behavior || response.data || response
    } catch (error) {
      console.error('Error al crear conducta:', error)
      throw error
    }
  },

  /**
   * Actualizar conducta
   * @param {number} id - ID de la conducta
   * @param {Object} behaviorData - Datos actualizados
   * @returns {Promise<Object>} Conducta actualizada
   */
  async update(id, behaviorData) {
    try {
      const response = await put(`/student-behaviors/${id}`, behaviorData)
      return response.behavior || response.data || response
    } catch (error) {
      console.error(`Error al actualizar conducta ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar conducta
   * @param {number} id - ID de la conducta
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/student-behaviors/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar conducta ${id}:`, error)
      throw error
    }
  }
}

export default studentBehaviorsService
