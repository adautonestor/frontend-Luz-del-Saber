import { get, post, put, del } from '../api'

/**
 * Servicio para gestión de áreas académicas
 * Conecta con las APIs reales del backend
 */
export const academicAreasService = {
  /**
   * Obtener todas las áreas académicas activas
   * @returns {Promise<Array>} Lista de áreas académicas
   */
  async getAll() {
    try {
      const response = await get('/academic-areas')
      const areas = response.data || response.areas || response
      return Array.isArray(areas) ? areas : []
    } catch (error) {
      console.error('Error al obtener áreas académicas:', error)
      throw error
    }
  },

  /**
   * Obtener área académica por ID
   * @param {number} id - ID del área
   * @returns {Promise<Object>} Área académica
   */
  async getById(id) {
    try {
      const response = await get(`/academic-areas/${id}`)
      return response.data || response
    } catch (error) {
      console.error(`Error al obtener área ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear nueva área académica
   * @param {Object} areaData - Datos del área
   * @returns {Promise<Object>} Área creada
   */
  async create(areaData) {
    try {
      const response = await post('/academic-areas', areaData)
      return response.data || response
    } catch (error) {
      console.error('Error al crear área:', error)
      throw error
    }
  },

  /**
   * Actualizar área académica
   * @param {number} id - ID del área
   * @param {Object} areaData - Datos a actualizar
   * @returns {Promise<Object>} Área actualizada
   */
  async update(id, areaData) {
    try {
      const response = await put(`/academic-areas/${id}`, areaData)
      return response.data || response
    } catch (error) {
      console.error(`Error al actualizar área ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar área académica
   * @param {number} id - ID del área
   * @returns {Promise<Object>} Confirmación
   */
  async delete(id) {
    try {
      const response = await del(`/academic-areas/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar área ${id}:`, error)
      throw error
    }
  }
}

export default academicAreasService
