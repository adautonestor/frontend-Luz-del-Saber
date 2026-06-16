import { get, post, put, del } from './api'

/**
 * Servicio para gestión de asistencia
 * Conecta con las APIs reales del backend
 */
export const attendanceService = {
  // ========== ESCANEO DE DNI ==========

  /**
   * Escaneo de DNI (código de barras del DNI físico)
   * @param {string} dni - Número de DNI del estudiante
   * @param {string} mode - 'auto' (determina automáticamente), 'entrada' o 'salida'
   * @returns {Promise<Object>} Resultado del escaneo
   */
  async smartScan(dni, mode = 'auto') {
    try {
      // Limpiar el DNI: extraer 8 dígitos si vienen datos extra del código de barras
      const cleanedDni = String(dni).trim()
      const dniMatch = cleanedDni.match(/\d{8}/)
      const code = dniMatch ? dniMatch[0] : cleanedDni

      const response = await post('/attendance-records/smart-scan', { code, mode })
      return response.data || response
    } catch (error) {
      console.error('Error en escaneo de DNI:', error)
      throw error
    }
  },

  /**
   * Obtener próxima acción permitida para un estudiante
   * @param {string} dni - Número de DNI del estudiante
   * @returns {Promise<Object>} Información del próximo registro permitido
   */
  async getStudentNextAction(dni) {
    try {
      const response = await get(`/attendance-records/next-action/${encodeURIComponent(dni)}`)
      return response.data || response
    } catch (error) {
      console.error('Error al obtener próxima acción:', error)
      throw error
    }
  },

  /**
   * Obtener resumen de asistencia del día
   * @returns {Promise<Object>} Resumen del día
   */
  async getTodaySummary() {
    try {
      const response = await get('/attendance-records/today-summary')
      return response.data || response
    } catch (error) {
      console.error('Error al obtener resumen del día:', error)
      throw error
    }
  },

  // ========== REGISTROS DE ASISTENCIA ==========

  /**
   * Obtener todos los registros de asistencia
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
      const endpoint = queryString ? `/attendance-records?${queryString}` : '/attendance-records'

      const response = await get(endpoint)
      return response.registros || response.asistencias || response.data || response
    } catch (error) {
      console.error('Error al obtener registros de asistencia:', error)
      throw error
    }
  },

  /**
   * Obtener registro de asistencia por ID
   * @param {number} id - ID del registro
   * @returns {Promise<Object>} Registro de asistencia
   */
  async getRecordById(id) {
    try {
      const response = await get(`/attendance-records/${id}`)
      return response.registro || response.asistencia || response.data || response
    } catch (error) {
      console.error(`Error al obtener registro ${id}:`, error)
      throw error
    }
  },

  /**
   * Registro/edición MANUAL de asistencia del día (panel del docente).
   * @param {Object} data - { student_id, date, status, quarter }
   *        status: 'asistio' | 'tardanza' | 'falta' | 'blanco'
   * @returns {Promise<Object>} Registro creado o actualizado
   */
  async registerManual(data) {
    try {
      const response = await post('/attendance-records/manual', data)
      return response.data || response
    } catch (error) {
      console.error('Error al registrar asistencia manual:', error)
      throw error
    }
  },

  /**
   * Crear registro de asistencia
   * @param {Object} recordData - Datos del registro
   * @returns {Promise<Object>} Registro creado
   */
  async createRecord(recordData) {
    try {
      const response = await post('/attendance-records', recordData)
      return response.registro || response.asistencia || response.data || response
    } catch (error) {
      console.error('Error al crear registro de asistencia:', error)
      throw error
    }
  },

  /**
   * Actualizar registro de asistencia
   * @param {number} id - ID del registro
   * @param {Object} recordData - Datos actualizados
   * @returns {Promise<Object>} Registro actualizado
   */
  async updateRecord(id, recordData) {
    try {
      const response = await put(`/attendance-records/${id}`, recordData)
      return response.registro || response.asistencia || response.data || response
    } catch (error) {
      console.error(`Error al actualizar registro ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar registro de asistencia
   * @param {number} id - ID del registro
   * @returns {Promise<Object>} Confirmación
   */
  async removeRecord(id) {
    try {
      const response = await del(`/attendance-records/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar registro ${id}:`, error)
      throw error
    }
  },

  // ========== HORARIOS DE ASISTENCIA ==========

  /**
   * Obtener todos los horarios de asistencia
   * @returns {Promise<Array>} Lista de horarios
   */
  async getAllSchedules() {
    try {
      const response = await get('/attendance-schedules')
      return response.horarios || response.data || response
    } catch (error) {
      console.error('Error al obtener horarios de asistencia:', error)
      throw error
    }
  },

  /**
   * Obtener horario de asistencia por ID
   * @param {number} id - ID del horario
   * @returns {Promise<Object>} Horario de asistencia
   */
  async getScheduleById(id) {
    try {
      const response = await get(`/attendance-schedules/${id}`)
      return response.horario || response.data || response
    } catch (error) {
      console.error(`Error al obtener horario ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear horario de asistencia
   * @param {Object} scheduleData - Datos del horario
   * @returns {Promise<Object>} Horario creado
   */
  async createSchedule(scheduleData) {
    try {
      const response = await post('/attendance-schedules', scheduleData)
      return response.horario || response.data || response
    } catch (error) {
      console.error('Error al crear horario de asistencia:', error)
      throw error
    }
  },

  /**
   * Actualizar horario de asistencia
   * @param {number} id - ID del horario
   * @param {Object} scheduleData - Datos actualizados
   * @returns {Promise<Object>} Horario actualizado
   */
  async updateSchedule(id, scheduleData) {
    try {
      const response = await put(`/attendance-schedules/${id}`, scheduleData)
      return response.horario || response.data || response
    } catch (error) {
      console.error(`Error al actualizar horario ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar horario de asistencia
   * @param {number} id - ID del horario
   * @returns {Promise<Object>} Confirmación
   */
  async removeSchedule(id) {
    try {
      const response = await del(`/attendance-schedules/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar horario ${id}:`, error)
      throw error
    }
  },

  // ========== BÚSQUEDA DE ESTUDIANTE POR DNI ==========

  /**
   * Buscar estudiante por DNI
   * @param {string} dni - Número de DNI del estudiante
   * @returns {Promise<Object>} Estudiante encontrado
   */
  async findStudentByDni(dni) {
    try {
      const response = await get(`/student-qr-codes/find/${encodeURIComponent(dni)}`)
      return response.data || response
    } catch (error) {
      console.error('Error al buscar estudiante por DNI:', error)
      throw error
    }
  }
}

export default attendanceService
