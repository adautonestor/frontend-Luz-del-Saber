import { get, post, put, del } from './api'

/**
 * Servicio para gestión de secciones
 * Conecta con las APIs reales del backend
 */
export const sectionsService = {
  /**
   * Obtener todas las secciones
   * @param {Object} filters - Filtros opcionales (grade_id, academic_year, etc.)
   * @returns {Promise<Array>} Lista de secciones
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/sections?${queryString}` : '/sections'

      const response = await get(endpoint)
      return response.sections || response.data || response
    } catch (error) {
      console.error('Error al obtener secciones:', error)
      throw error
    }
  },

  /**
   * Obtener sección por ID
   * @param {number} id - ID de la sección
   * @returns {Promise<Object>} Sección
   */
  async getById(id) {
    try {
      const response = await get(`/sections/${id}`)
      return response.section || response.data || response
    } catch (error) {
      console.error(`Error al obtener sección ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear sección
   * @param {Object} sectionData - Datos de la sección
   * @returns {Promise<Object>} Sección creada
   */
  async create(sectionData) {
    try {
      const response = await post('/sections', sectionData)
      return response.section || response.data || response
    } catch (error) {
      console.error('Error al crear sección:', error)
      throw error
    }
  },

  /**
   * Actualizar sección
   * @param {number} id - ID de la sección
   * @param {Object} sectionData - Datos actualizados
   * @returns {Promise<Object>} Sección actualizada
   */
  async update(id, sectionData) {
    try {
      const response = await put(`/sections/${id}`, sectionData)
      return response.section || response.data || response
    } catch (error) {
      console.error(`Error al actualizar sección ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar sección
   * @param {number} id - ID de la sección
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/sections/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar sección ${id}:`, error)
      throw error
    }
  }
}

export default sectionsService
