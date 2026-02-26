import { get } from './api'

/**
 * Servicio para gestión de dashboard y estadísticas
 * Conecta con las APIs reales del backend
 */
export const dashboardService = {
  /**
   * Obtener estadísticas generales del dashboard
   * @param {Object} filters - Filtros opcionales (academic_year)
   * @returns {Promise<Object>} Estadísticas del dashboard
   */
  async getStats(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (filters.academic_year) {
        queryParams.append('academic_year', filters.academic_year)
      }

      const queryString = queryParams.toString()
      const endpoint = queryString ? `/dashboard/stats?${queryString}` : '/dashboard/stats'

      const response = await get(endpoint)
      return response.data || response
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error)
      throw error
    }
  },

  /**
   * Obtener reporte de ingresos mensuales
   * @param {number} year - Año del reporte (opcional, por defecto año actual)
   * @returns {Promise<Array>} Reporte mensual de ingresos
   */
  async getMonthlyIncomeReport(year = null) {
    try {
      const queryParams = new URLSearchParams()
      if (year) {
        queryParams.append('year', year)
      }

      const queryString = queryParams.toString()
      const endpoint = queryString ? `/dashboard/monthly-income?${queryString}` : '/dashboard/monthly-income'

      const response = await get(endpoint)
      return response.data || response
    } catch (error) {
      console.error('Error al obtener reporte de ingresos mensuales:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas de matrícula por nivel
   * @param {number} academic_year - Año académico (opcional)
   * @returns {Promise<Array>} Estadísticas por nivel
   */
  async getEnrollmentStats(academic_year = null) {
    try {
      const queryParams = new URLSearchParams()
      if (academic_year) {
        queryParams.append('academic_year', academic_year)
      }

      const queryString = queryParams.toString()
      const endpoint = queryString ? `/dashboard/enrollment-stats?${queryString}` : '/dashboard/enrollment-stats'

      const response = await get(endpoint)
      return response.data || response
    } catch (error) {
      console.error('Error al obtener estadísticas de matrícula:', error)
      throw error
    }
  },

  /**
   * Obtener tasa de cobranza
   * @param {number} academic_year - Año académico (opcional)
   * @returns {Promise<Object>} Datos de cobranza
   */
  async getCollectionRate(academic_year = null) {
    try {
      const queryParams = new URLSearchParams()
      if (academic_year) {
        queryParams.append('academic_year', academic_year)
      }

      const queryString = queryParams.toString()
      const endpoint = queryString ? `/dashboard/collection-rate?${queryString}` : '/dashboard/collection-rate'

      const response = await get(endpoint)
      return response.data || response
    } catch (error) {
      console.error('Error al obtener tasa de cobranza:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas del profesor
   * @param {number} teacherId - ID del profesor
   * @returns {Promise<Object>} Estadísticas del profesor
   */
  async getTeacherStats(teacherId) {
    try {
      const response = await get(`/dashboard/teacher-stats/${teacherId}`)
      return response.data || response
    } catch (error) {
      console.error('Error al obtener estadísticas del profesor:', error)
      throw error
    }
  },

  /**
   * Obtener horario del día del profesor
   * @param {number} teacherId - ID del profesor
   * @returns {Promise<Array>} Horario del día
   */
  async getTeacherTodaySchedule(teacherId) {
    try {
      const response = await get(`/dashboard/teacher-schedule/${teacherId}`)
      return response.data || response
    } catch (error) {
      console.error('Error al obtener horario del día:', error)
      throw error
    }
  }
}

export default dashboardService
