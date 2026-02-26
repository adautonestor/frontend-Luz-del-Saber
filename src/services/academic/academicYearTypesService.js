import { get, post, put, del } from '../api'

/**
 * Servicio para gestión de tipos de año académico
 */
export const academicYearTypesService = {
  /**
   * Obtener todos los tipos de año
   * @param {string} status - Filtro por estado (opcional)
   * @returns {Promise<Array>} Lista de tipos
   */
  async getAll(status = null) {
    try {
      const endpoint = status
        ? `/academic-year-types?status=${status}`
        : '/academic-year-types'
      const response = await get(endpoint)
      return response.data || response || []
    } catch (error) {
      console.error('Error al obtener tipos de año:', error)
      throw error
    }
  },

  /**
   * Obtener tipo por ID
   * @param {number} id - ID del tipo
   * @returns {Promise<Object>} Tipo encontrado
   */
  async getById(id) {
    try {
      const response = await get(`/academic-year-types/${id}`)
      return response.data || response
    } catch (error) {
      console.error(`Error al obtener tipo ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear nuevo tipo
   * @param {Object} data - Datos del tipo
   * @returns {Promise<Object>} Tipo creado
   */
  async create(data) {
    try {
      const response = await post('/academic-year-types', data)
      return response.data || response
    } catch (error) {
      console.error('Error al crear tipo:', error)
      throw error
    }
  },

  /**
   * Actualizar tipo existente
   * @param {number} id - ID del tipo
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Tipo actualizado
   */
  async update(id, data) {
    try {
      const response = await put(`/academic-year-types/${id}`, data)
      return response.data || response
    } catch (error) {
      console.error(`Error al actualizar tipo ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar tipo (soft delete)
   * @param {number} id - ID del tipo
   * @returns {Promise<boolean>} true si se eliminó
   */
  async delete(id) {
    try {
      await del(`/academic-year-types/${id}`)
      return true
    } catch (error) {
      console.error(`Error al eliminar tipo ${id}:`, error)
      throw error
    }
  }
}

export default academicYearTypesService
