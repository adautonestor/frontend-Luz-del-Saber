import { get, post, put, del } from './api'

/**
 * Servicio para gestión de matrícula
 * Conecta con las APIs reales del backend
 */
export const matriculationService = {
  /**
   * Obtener todas las matrículas
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de matrículas
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/matriculation?${queryString}` : '/matriculation'

      const response = await get(endpoint)
      return response.matriculas || response.data || response
    } catch (error) {
      console.error('Error al obtener matrículas:', error)
      throw error
    }
  },

  /**
   * Obtener matrícula por ID
   * @param {number} id - ID de la matrícula
   * @returns {Promise<Object>} Matrícula
   */
  async getById(id) {
    try {
      const response = await get(`/matriculation/${id}`)
      return response.matricula || response.data || response
    } catch (error) {
      console.error(`Error al obtener matrícula ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener matrículas por estudiante
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Array>} Lista de matrículas del estudiante
   */
  async getByStudent(studentId) {
    try {
      const response = await get(`/matriculation/student/${studentId}`)
      return response.matriculas || response.data || response
    } catch (error) {
      console.error(`Error al obtener matrículas del estudiante ${studentId}:`, error)
      throw error
    }
  },

  /**
   * Crear matrícula
   * @param {Object} enrollmentData - Datos de la matrícula
   * @returns {Promise<Object>} Matrícula creada
   */
  async create(enrollmentData) {
    try {
      const response = await post('/matriculation', enrollmentData)
      return response.matricula || response.data || response
    } catch (error) {
      console.error('Error al crear matrícula:', error)
      throw error
    }
  },

  /**
   * Crear matrícula con archivo de contrato
   * @param {FormData} formData - FormData con archivo y datos de matrícula
   * @returns {Promise<Object>} Matrícula creada
   */
  async createWithFile(formData) {
    try {
      // Usar la función post de api.js que ya maneja FormData y token correctamente
      const response = await post('/matriculation', formData)
      return response.matricula || response.data || response
    } catch (error) {
      console.error('Error al crear matrícula con archivo:', error)
      throw error
    }
  },

  /**
   * Actualizar matrícula
   * @param {number} id - ID de la matrícula
   * @param {Object} enrollmentData - Datos actualizados
   * @returns {Promise<Object>} Matrícula actualizada
   */
  async update(id, enrollmentData) {
    try {
      const response = await put(`/matriculation/${id}`, enrollmentData)
      return response.matricula || response.data || response
    } catch (error) {
      console.error(`Error al actualizar matrícula ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar matrícula
   * @param {number} id - ID de la matrícula
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/matriculation/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar matrícula ${id}:`, error)
      throw error
    }
  },

  /**
   * Aprobar solicitud de matrícula
   * @param {number} id - ID de la matrícula
   * @returns {Promise<Object>} Matrícula aprobada
   */
  async approve(id) {
    try {
      const response = await put(`/matriculation/${id}/approve`, {})
      return response.matricula || response.data || response
    } catch (error) {
      console.error(`Error al aprobar matrícula ${id}:`, error)
      throw error
    }
  },

  /**
   * Rechazar solicitud de matrícula
   * @param {number} id - ID de la matrícula
   * @param {string} reason - Motivo del rechazo
   * @returns {Promise<Object>} Matrícula rechazada
   */
  async reject(id, reason) {
    try {
      const response = await put(`/matriculation/${id}/reject`, { rejection_reason: reason })
      return response.matricula || response.data || response
    } catch (error) {
      console.error(`Error al rechazar matrícula ${id}:`, error)
      throw error
    }
  },

  /**
   * Actualizar contrato de matrícula por estudiante y año
   * @param {number} studentId - ID del estudiante
   * @param {number} year - Año académico
   * @param {File|null} contractFile - Archivo PDF del contrato (null para eliminar)
   * @returns {Promise<Object>} Matrícula actualizada
   */
  async updateContract(studentId, year, contractFile) {
    try {
      // Si contractFile es null, eliminar el contrato
      if (contractFile === null) {
        const response = await del(`/matriculation/student/${studentId}/year/${year}/contract`)
        return response.data || response
      }

      // Si hay archivo, subir el contrato
      const formData = new FormData()
      formData.append('contract', contractFile)

      const response = await put(`/matriculation/student/${studentId}/year/${year}/contract`, formData)
      return response.data || response
    } catch (error) {
      console.error(`Error al actualizar contrato del estudiante ${studentId}:`, error)
      throw error
    }
  }
}

export default matriculationService
