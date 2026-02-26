import { get, post, put, del } from './api'

/**
 * Servicio para gestión de visibilidad de boletas de notas
 * Conecta con las APIs reales del backend
 */
export const reportCardVisibilityService = {
  /**
   * Obtener todas las configuraciones de visibilidad
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de configuraciones
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/report-card-visibility?${queryString}` : '/report-card-visibility'

      const response = await get(endpoint)
      return response.configs || response.data || response
    } catch (error) {
      console.error('Error al obtener configuraciones de visibilidad:', error)
      throw error
    }
  },

  /**
   * Obtener configuración por ID
   * @param {number} id - ID de la configuración
   * @returns {Promise<Object>} Configuración
   */
  async getById(id) {
    try {
      const response = await get(`/report-card-visibility/${id}`)
      return response.config || response.data || response
    } catch (error) {
      console.error(`Error al obtener configuración ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear configuración de visibilidad
   * @param {Object} configData - Datos de la configuración
   * @returns {Promise<Object>} Configuración creada
   */
  async create(configData) {
    try {
      const response = await post('/report-card-visibility', configData)
      return response.config || response.data || response
    } catch (error) {
      console.error('Error al crear configuración:', error)
      throw error
    }
  },

  /**
   * Actualizar configuración de visibilidad
   * @param {number} id - ID de la configuración
   * @param {Object} configData - Datos actualizados
   * @returns {Promise<Object>} Configuración actualizada
   */
  async update(id, configData) {
    try {
      const response = await put(`/report-card-visibility/${id}`, configData)
      return response.config || response.data || response
    } catch (error) {
      console.error(`Error al actualizar configuración ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar configuración
   * @param {number} id - ID de la configuración
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/report-card-visibility/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar configuración ${id}:`, error)
      throw error
    }
  },

  /**
   * Verificar visibilidad de boleta para un estudiante y período
   * @param {number} studentId - ID del estudiante
   * @param {number} year - Año académico
   * @param {number} bimester - Bimestre
   * @returns {Promise<boolean>} Visible o no
   */
  async isVisible(studentId, year, bimester) {
    try {
      const configs = await this.getAll({
        student_id: studentId,
        año: year,
        quarter: bimester
      })

      // Si no hay configuración específica, asumir visible
      if (!configs || configs.length === 0) {
        return true
      }

      // Buscar configuración activa
      const activeConfig = configs.find(c => {
        const visible = c.visible || c.is_visible
        return visible === true || visible === 1
      })

      return !!activeConfig
    } catch (error) {
      console.error('Error verificando visibilidad:', error)
      return false
    }
  }
}

export default reportCardVisibilityService
