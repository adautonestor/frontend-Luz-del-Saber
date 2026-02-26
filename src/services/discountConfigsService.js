import { get, post, put, del } from './api'

/**
 * Servicio para gestión de configuraciones de descuento
 * Conecta con las APIs reales del backend
 */
export const discountConfigsService = {
  /**
   * Obtener todas las configuraciones de descuento
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
      const endpoint = queryString ? `/discount-configs?${queryString}` : '/discount-configs'

      const response = await get(endpoint)
      return response.discountConfigs || response.data || response
    } catch (error) {
      console.error('Error al obtener configuraciones de descuento:', error)
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
      const response = await get(`/discount-configs/${id}`)
      return response.discountConfig || response.data || response
    } catch (error) {
      console.error(`Error al obtener configuración ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear configuración de descuento
   * @param {Object} configData - Datos de la configuración
   * @returns {Promise<Object>} Configuración creada
   */
  async create(configData) {
    try {
      const response = await post('/discount-configs', configData)
      return response.discountConfig || response.data || response
    } catch (error) {
      console.error('Error al crear configuración de descuento:', error)
      throw error
    }
  },

  /**
   * Actualizar configuración de descuento
   * @param {number} id - ID de la configuración
   * @param {Object} configData - Datos actualizados
   * @returns {Promise<Object>} Configuración actualizada
   */
  async update(id, configData) {
    try {
      const response = await put(`/discount-configs/${id}`, configData)
      return response.discountConfig || response.data || response
    } catch (error) {
      console.error(`Error al actualizar configuración ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar configuración de descuento
   * @param {number} id - ID de la configuración
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/discount-configs/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar configuración ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener configuración aplicable para un estudiante
   * @param {string} nivel - Nivel del estudiante
   * @param {number} numeroHermanos - Número de hermanos
   * @param {number} añoEscolar - Año escolar
   * @returns {Promise<Object>} Configuración aplicable
   */
  async getApplicableDiscount(nivel, numeroHermanos, añoEscolar) {
    try {
      const configs = await this.getAll({
        state: 'activo',
        academic_year: añoEscolar || new Date().getFullYear()
      })

      // Buscar configuración exacta
      let applicable = configs.find(d =>
        (d.cantidad_hijos === numeroHermanos || d.cantidadHijos === numeroHermanos) &&
        ((d.nivel === nivel) || d.nivel === 'todos')
      )

      // Si no hay exacta y tiene 4+ hermanos, usar la de 4
      if (!applicable && numeroHermanos >= 4) {
        applicable = configs.find(d =>
          (d.cantidad_hijos === 4 || d.cantidadHijos === 4) &&
          ((d.nivel === nivel) || d.nivel === 'todos')
        )
      }

      return applicable || null
    } catch (error) {
      console.error('Error al obtener descuento aplicable:', error)
      return null
    }
  }
}

export default discountConfigsService
