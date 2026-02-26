import { post, get } from './api'

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales del usuario
   * @param {string} credentials.email - Email del usuario
   * @param {string} credentials.password - Contraseña del usuario
   * @returns {Promise<Object>} Datos del usuario y token
   */
  async login(credentials) {
    try {
      const response = await post('/auth/login', credentials)

      // La respuesta del backend es:
      // {
      //   mensaje: "Login exitoso",
      //   token: "jwt-token",
      //   usuario: { ...userData }
      // }

      return {
        token: response.token,
        user: response.usuario
      }
    } catch (error) {
      // Mejorar mensajes de error para el usuario
      if (error.message.includes('Correo no registrado')) {
        throw new Error('Usuario no encontrado')
      } else if (error.message.includes('Contraseña incorrecta')) {
        throw new Error('Contraseña incorrecta')
      } else if (error.message.includes('inactivo')) {
        throw new Error('Usuario inactivo. Contacta al administrador.')
      }

      throw error
    }
  },

  /**
   * Verificar token y obtener información del usuario autenticado
   * @returns {Promise<Object>} Datos del usuario
   */
  async verifyToken() {
    try {
      const response = await get('/auth/me')

      // La respuesta del backend es:
      // {
      //   success: true,
      //   usuario: { ...userData }
      // }

      return response.usuario
    } catch (error) {
      // Si el token es inválido o expiró, limpiar el localStorage
      if (error.message.includes('Token') || error.message.includes('token')) {
        localStorage.removeItem('authToken')
      }

      throw error
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise<void>}
   */
  async logout() {
    // Por ahora solo limpiamos el localStorage
    // En el futuro podríamos llamar a un endpoint de logout en el backend
    localStorage.removeItem('authToken')
  }
}

export default authService
