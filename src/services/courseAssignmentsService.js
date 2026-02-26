import { get, post, put, del } from './api'

/**
 * Servicio para gestión de asignaciones de cursos
 * Conecta con las APIs reales del backend
 */
export const courseAssignmentsService = {
  /**
   * Obtener todas las asignaciones de cursos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de asignaciones
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/course-assignments?${queryString}` : '/course-assignments'

      const response = await get(endpoint)
      return response.assignments || response.data || response
    } catch (error) {
      console.error('Error al obtener asignaciones de cursos:', error)
      throw error
    }
  },

  /**
   * Obtener asignación por ID
   * @param {number} id - ID de la asignación
   * @returns {Promise<Object>} Asignación
   */
  async getById(id) {
    try {
      const response = await get(`/course-assignments/${id}`)
      return response.assignment || response.data || response
    } catch (error) {
      console.error(`Error al obtener asignación ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener asignaciones por profesor
   * @param {number} teacherId - ID del profesor
   * @returns {Promise<Array>} Lista de asignaciones del profesor
   */
  async getByTeacher(teacherId) {
    try {
      const response = await get(`/course-assignments/teacher/${teacherId}`)
      return response.assignments || response.data || response
    } catch (error) {
      console.error(`Error al obtener asignaciones del profesor ${teacherId}:`, error)
      throw error
    }
  },

  /**
   * Obtener asignaciones por curso
   * @param {number} courseId - ID del curso
   * @returns {Promise<Array>} Lista de asignaciones del curso
   */
  async getByCourse(courseId) {
    try {
      const response = await get(`/course-assignments/course/${courseId}`)
      return response.assignments || response.data || response
    } catch (error) {
      console.error(`Error al obtener asignaciones del curso ${courseId}:`, error)
      throw error
    }
  },

  /**
   * Crear asignación
   * @param {Object} assignmentData - Datos de la asignación
   * @returns {Promise<Object>} Asignación creada
   */
  async create(assignmentData) {
    try {
      const response = await post('/course-assignments', assignmentData)
      return response.assignment || response.data || response
    } catch (error) {
      console.error('Error al crear asignación:', error)
      throw error
    }
  },

  /**
   * Actualizar asignación
   * @param {number} id - ID de la asignación
   * @param {Object} assignmentData - Datos actualizados
   * @returns {Promise<Object>} Asignación actualizada
   */
  async update(id, assignmentData) {
    try {
      const response = await put(`/course-assignments/${id}`, assignmentData)
      return response.assignment || response.data || response
    } catch (error) {
      console.error(`Error al actualizar asignación ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar asignación
   * @param {number} id - ID de la asignación
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/course-assignments/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar asignación ${id}:`, error)
      throw error
    }
  }
}

export default courseAssignmentsService
