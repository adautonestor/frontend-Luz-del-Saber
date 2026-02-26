import { get, post, put, del } from './api'

/**
 * Servicio para gestión de pagos
 * Conecta con las APIs reales del backend
 */
export const paymentsService = {
  // ========== CONCEPTOS DE PAGO ==========

  /**
   * Obtener todos los conceptos de pago
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de conceptos
   */
  async getAllConcepts(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/payment-concepts?${queryString}` : '/payment-concepts'

      const response = await get(endpoint)
      return response.conceptos || response.data || response
    } catch (error) {
      console.error('Error al obtener conceptos de pago:', error)
      throw error
    }
  },

  /**
   * Obtener concepto de pago por ID
   * @param {number} id - ID del concepto
   * @returns {Promise<Object>} Concepto de pago
   */
  async getConceptById(id) {
    try {
      const response = await get(`/payment-concepts/${id}`)
      return response.concepto || response.data || response
    } catch (error) {
      console.error(`Error al obtener concepto ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear concepto de pago
   * @param {Object} conceptData - Datos del concepto
   * @returns {Promise<Object>} Concepto creado
   */
  async createConcept(conceptData) {
    try {
      const response = await post('/payment-concepts', conceptData)
      return response.concepto || response.data || response
    } catch (error) {
      console.error('Error al crear concepto:', error)
      throw error
    }
  },

  /**
   * Actualizar concepto de pago
   * @param {number} id - ID del concepto
   * @param {Object} conceptData - Datos actualizados
   * @returns {Promise<Object>} Concepto actualizado
   */
  async updateConcept(id, conceptData) {
    try {
      const response = await put(`/payment-concepts/${id}`, conceptData)
      return response.concepto || response.data || response
    } catch (error) {
      console.error(`Error al actualizar concepto ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar concepto de pago
   * @param {number} id - ID del concepto
   * @returns {Promise<Object>} Confirmación
   */
  async removeConcept(id) {
    try {
      const response = await del(`/payment-concepts/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar concepto ${id}:`, error)
      throw error
    }
  },

  /**
   * Regenerar obligaciones para un concepto
   * @param {number} id - ID del concepto
   * @returns {Promise<Object>} Resultado de la regeneración
   */
  async regenerateObligations(id) {
    try {
      const response = await post(`/payment-concepts/${id}/regenerate`, {})
      return response
    } catch (error) {
      console.error(`Error al regenerar obligaciones del concepto ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener obligaciones generadas para un concepto
   * @param {number} id - ID del concepto
   * @returns {Promise<Array>} Lista de obligaciones
   */
  async getConceptObligations(id) {
    try {
      const response = await get(`/payment-concepts/${id}/obligations`)
      return response.data || response
    } catch (error) {
      console.error(`Error al obtener obligaciones del concepto ${id}:`, error)
      throw error
    }
  },

  // ========== OBLIGACIONES DE PAGO ==========

  /**
   * Obtener todas las obligaciones de pago
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de obligaciones
   */
  async getAllObligations(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/payment-obligations?${queryString}` : '/payment-obligations'

      const response = await get(endpoint)
      return response.obligaciones || response.data || response
    } catch (error) {
      console.error('Error al obtener obligaciones de pago:', error)
      throw error
    }
  },

  /**
   * Obtener obligación de pago por ID
   * @param {number} id - ID de la obligación
   * @returns {Promise<Object>} Obligación de pago
   */
  async getObligationById(id) {
    try {
      const response = await get(`/payment-obligations/${id}`)
      return response.obligacion || response.data || response
    } catch (error) {
      console.error(`Error al obtener obligación ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener obligaciones de pago por estudiante
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Array>} Lista de obligaciones del estudiante
   */
  async getObligationsByStudent(studentId) {
    try {
      const response = await get(`/payment-obligations/student/${studentId}`)
      return response.obligaciones || response.data || response
    } catch (error) {
      console.error(`Error al obtener obligaciones del estudiante ${studentId}:`, error)
      throw error
    }
  },

  /**
   * Crear obligación de pago
   * @param {Object} obligationData - Datos de la obligación
   * @returns {Promise<Object>} Obligación creada
   */
  async createObligation(obligationData) {
    try {
      const response = await post('/payment-obligations', obligationData)
      return response.obligacion || response.data || response
    } catch (error) {
      console.error('Error al crear obligación:', error)
      throw error
    }
  },

  /**
   * Actualizar obligación de pago
   * @param {number} id - ID de la obligación
   * @param {Object} obligationData - Datos actualizados
   * @returns {Promise<Object>} Obligación actualizada
   */
  async updateObligation(id, obligationData) {
    try {
      const response = await put(`/payment-obligations/${id}`, obligationData)
      return response.obligacion || response.data || response
    } catch (error) {
      console.error(`Error al actualizar obligación ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar obligación de pago
   * @param {number} id - ID de la obligación
   * @returns {Promise<Object>} Confirmación
   */
  async removeObligation(id) {
    try {
      const response = await del(`/payment-obligations/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar obligación ${id}:`, error)
      throw error
    }
  },

  // ========== INTENCIONES DE PAGO ==========

  /**
   * Obtener todas las intenciones de pago
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de intenciones
   */
  async getAllIntentions(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/payment-intentions?${queryString}` : '/payment-intentions'

      const response = await get(endpoint)
      return response.intenciones || response.data || response
    } catch (error) {
      console.error('Error al obtener intenciones de pago:', error)
      throw error
    }
  },

  /**
   * Obtener intención de pago por ID
   * @param {number} id - ID de la intención
   * @returns {Promise<Object>} Intención de pago
   */
  async getIntentionById(id) {
    try {
      const response = await get(`/payment-intentions/${id}`)
      return response.intencion || response.data || response
    } catch (error) {
      console.error(`Error al obtener intención ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear intención de pago
   * @param {Object} intentionData - Datos de la intención
   * @returns {Promise<Object>} Intención creada
   */
  async createIntention(intentionData) {
    try {
      const response = await post('/payment-intentions', intentionData)
      return response.intencion || response.data || response
    } catch (error) {
      console.error('Error al crear intención:', error)
      throw error
    }
  },

  /**
   * Actualizar intención de pago
   * @param {number} id - ID de la intención
   * @param {Object} intentionData - Datos actualizados
   * @returns {Promise<Object>} Intención actualizada
   */
  async updateIntention(id, intentionData) {
    try {
      const response = await put(`/payment-intentions/${id}`, intentionData)
      return response.intencion || response.data || response
    } catch (error) {
      console.error(`Error al actualizar intención ${id}:`, error)
      throw error
    }
  },

  /**
   * Aprobar intención de pago
   * @param {number} id - ID de la intención
   * @returns {Promise<Object>} Intención aprobada
   */
  async approveIntention(id) {
    try {
      const response = await put(`/payment-intentions/${id}/approve`, {})
      return response.intencion || response.data || response
    } catch (error) {
      console.error(`Error al aprobar intención ${id}:`, error)
      throw error
    }
  },

  /**
   * Rechazar intención de pago
   * @param {number} id - ID de la intención
   * @param {string} reason - Motivo del rechazo
   * @returns {Promise<Object>} Intención rechazada
   */
  async rejectIntention(id, reason) {
    try {
      const response = await put(`/payment-intentions/${id}/reject`, { rejection_reason: reason })
      return response.intencion || response.data || response
    } catch (error) {
      console.error(`Error al rechazar intención ${id}:`, error)
      throw error
    }
  },

  // ========== MÉTODOS DE PAGO ==========

  /**
   * Obtener todos los métodos de pago
   * @returns {Promise<Array>} Lista de métodos
   */
  async getAllMethods() {
    try {
      const response = await get('/payment-methods')
      return response.metodos || response.data || response
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error)
      throw error
    }
  },

  /**
   * Obtener método de pago por ID
   * @param {number} id - ID del método
   * @returns {Promise<Object>} Método de pago
   */
  async getMethodById(id) {
    try {
      const response = await get(`/payment-methods/${id}`)
      return response.metodo || response.data || response
    } catch (error) {
      console.error(`Error al obtener método ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear método de pago
   * @param {Object} methodData - Datos del método
   * @returns {Promise<Object>} Método creado
   */
  async createMethod(methodData) {
    try {
      const response = await post('/payment-methods', methodData)
      return response.metodo || response.data || response
    } catch (error) {
      console.error('Error al crear método:', error)
      throw error
    }
  },

  /**
   * Actualizar método de pago
   * @param {number} id - ID del método
   * @param {Object} methodData - Datos actualizados
   * @returns {Promise<Object>} Método actualizado
   */
  async updateMethod(id, methodData) {
    try {
      const response = await put(`/payment-methods/${id}`, methodData)
      return response.metodo || response.data || response
    } catch (error) {
      console.error(`Error al actualizar método ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar método de pago
   * @param {number} id - ID del método
   * @returns {Promise<Object>} Confirmación
   */
  async removeMethod(id) {
    try {
      const response = await del(`/payment-methods/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar método ${id}:`, error)
      throw error
    }
  },

  // ========== REGISTROS DE PAGO ==========

  /**
   * Obtener todos los registros de pago
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de registros
   */
  async getAllRecords(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/payment-records?${queryString}` : '/payment-records'

      const response = await get(endpoint)
      return response.registros || response.pagos || response.data || response
    } catch (error) {
      console.error('Error al obtener registros de pago:', error)
      throw error
    }
  },

  /**
   * Obtener registro de pago por ID
   * @param {number} id - ID del registro
   * @returns {Promise<Object>} Registro de pago
   */
  async getRecordById(id) {
    try {
      const response = await get(`/payment-records/${id}`)
      return response.registro || response.pago || response.data || response
    } catch (error) {
      console.error(`Error al obtener registro ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear registro de pago
   * @param {Object|FormData} recordData - Datos del registro o FormData con archivo
   * @returns {Promise<Object>} Registro creado
   */
  async createRecord(recordData) {
    try {
      const response = await post('/payment-records', recordData)
      return response.registro || response.pago || response.data || response
    } catch (error) {
      console.error('Error al crear registro de pago:', error)
      throw error
    }
  },

  /**
   * Actualizar registro de pago
   * @param {number} id - ID del registro
   * @param {Object} recordData - Datos actualizados
   * @returns {Promise<Object>} Registro actualizado
   */
  async updateRecord(id, recordData) {
    try {
      const response = await put(`/payment-records/${id}`, recordData)
      return response.registro || response.pago || response.data || response
    } catch (error) {
      console.error(`Error al actualizar registro ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar registro de pago
   * @param {number} id - ID del registro
   * @returns {Promise<Object>} Confirmación
   */
  async removeRecord(id) {
    try {
      const response = await del(`/payment-records/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar registro ${id}:`, error)
      throw error
    }
  }
}

export default paymentsService
