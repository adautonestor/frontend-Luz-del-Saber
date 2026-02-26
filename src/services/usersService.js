import { get, post, put, del } from './api'

/**
 * Servicio para gestión de usuarios
 * Conecta con las APIs reales del backend
 */
export const usersService = {
  /**
   * Obtener todos los usuarios
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de usuarios
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/users?${queryString}` : '/users'

      const response = await get(endpoint)
      return response.users || response.data || response
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      throw error
    }
  },

  /**
   * Obtener usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Usuario
   */
  async getById(id) {
    try {
      const response = await get(`/users/${id}`)
      return response.user || response.data || response
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async create(userData) {
    try {
      const response = await post('/users', userData)
      return response.user || response.data || response
    } catch (error) {
      console.error('Error al crear usuario:', error)
      throw error
    }
  },

  /**
   * Actualizar usuario
   * @param {number} id - ID del usuario
   * @param {Object} userData - Datos actualizados
   * @returns {Promise<Object>} Usuario actualizado
   */
  async update(id, userData) {
    try {
      const response = await put(`/users/${id}`, userData)
      return response.user || response.data || response
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar usuario
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/users/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar usuario ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener usuarios por rol
   * @param {string} role - Rol del usuario (profesor, padre, admin, etc.)
   * @returns {Promise<Array>} Lista de usuarios con ese rol
   */
  async getByRole(role) {
    try {
      const response = await get(`/users/by-role/${role}`)
      return response.users || response.data || response
    } catch (error) {
      console.error(`Error al obtener usuarios con rol ${role}:`, error)
      throw error
    }
  }
}

export default usersService
