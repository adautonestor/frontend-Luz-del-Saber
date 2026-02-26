import { get, post, put, del } from './api'

/**
 * Servicio para gestión de roles
 * Conecta con las APIs reales del backend
 */
export const rolesService = {
  /**
   * Obtener todos los roles
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de roles
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/roles?${queryString}` : '/roles'

      const response = await get(endpoint)
      return response.data || response
    } catch (error) {
      console.error('Error al obtener roles:', error)
      throw error
    }
  },

  /**
   * Obtener rol por ID
   * @param {number} id - ID del rol
   * @returns {Promise<Object>} Rol
   */
  async getById(id) {
    try {
      const response = await get(`/roles/${id}`)
      return response.data || response
    } catch (error) {
      console.error(`Error al obtener rol ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear rol
   * @param {Object} roleData - Datos del rol
   * @returns {Promise<Object>} Rol creado
   */
  async create(roleData) {
    try {
      const response = await post('/roles', roleData)
      return response.data || response
    } catch (error) {
      console.error('Error al crear rol:', error)
      throw error
    }
  },

  /**
   * Actualizar rol
   * @param {number} id - ID del rol
   * @param {Object} roleData - Datos actualizados
   * @returns {Promise<Object>} Rol actualizado
   */
  async update(id, roleData) {
    try {
      const response = await put(`/roles/${id}`, roleData)
      return response.data || response
    } catch (error) {
      console.error(`Error al actualizar rol ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar rol
   * @param {number} id - ID del rol
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/roles/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar rol ${id}:`, error)
      throw error
    }
  }
}

export default rolesService
