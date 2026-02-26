import { get, post, put, del } from './api'

/**
 * Servicio para gestión de avisos
 * Conecta con las APIs reales del backend
 */
export const avisosService = {
  /**
   * Obtener todos los avisos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de avisos mapeados
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/avisos?${queryString}` : '/avisos'

      const response = await get(endpoint)
      const avisos = response.avisos || response.data || response

      const apiUrl = import.meta.env.VITE_API_URL

      // Mapear avisos y construir URLs del proxy para archivos
      return avisos.map(aviso => {
        // Construir URL de imagen si existe
        let imageUrl = null
        if (aviso.image) {
          imageUrl = `${apiUrl}/avisos/file/${encodeURIComponent(aviso.image)}`
        }

        // Construir URL de archivo si existe
        let fileUrl = null
        if (aviso.file) {
          fileUrl = `${apiUrl}/avisos/file/${encodeURIComponent(aviso.file)}`
        }

        return {
          ...aviso,
          // Mapear campos del backend a formato esperado por el frontend
          titulo: aviso.title || aviso.titulo,
          contenido: aviso.content || aviso.contenido,
          enlace: aviso.link || aviso.enlace,
          activo: aviso.status === 'active',
          fechaCreacion: aviso.publication_date || aviso.date_time_registration || aviso.fecha_creacion,
          creadorNombre: aviso.publicado_por_nombre && aviso.publicado_por_apellidos
            ? `${aviso.publicado_por_nombre} ${aviso.publicado_por_apellidos}`
            : aviso.creador_nombre || 'Desconocido',
          // URLs de archivos para el proxy
          imagen: imageUrl ? { data: imageUrl, name: 'imagen', type: 'image/*' } : null,
          archivo: fileUrl ? {
            data: fileUrl,
            name: aviso.file_name || 'archivo',
            type: aviso.file_type || 'application/octet-stream',
            tamaño: aviso.file_size || 0
          } : null
        }
      })
    } catch (error) {
      console.error('Error al obtener avisos:', error)
      throw error
    }
  },

  /**
   * Obtener aviso por ID
   * @param {number} id - ID del aviso
   * @returns {Promise<Object>} Aviso
   */
  async getById(id) {
    try {
      const response = await get(`/avisos/${id}`)
      return response.aviso || response.data || response
    } catch (error) {
      console.error(`Error al obtener aviso ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear aviso
   * @param {Object} avisoData - Datos del aviso
   * @returns {Promise<Object>} Aviso creado
   */
  async create(avisoData) {
    try {
      const response = await post('/avisos', avisoData)
      return response.aviso || response.data || response
    } catch (error) {
      console.error('Error al crear aviso:', error)
      throw error
    }
  },

  /**
   * Actualizar aviso
   * @param {number} id - ID del aviso
   * @param {Object} avisoData - Datos actualizados
   * @returns {Promise<Object>} Aviso actualizado
   */
  async update(id, avisoData) {
    try {
      const response = await put(`/avisos/${id}`, avisoData)
      return response.aviso || response.data || response
    } catch (error) {
      console.error(`Error al actualizar aviso ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar aviso
   * @param {number} id - ID del aviso
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/avisos/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar aviso ${id}:`, error)
      throw error
    }
  }
}

export default avisosService
