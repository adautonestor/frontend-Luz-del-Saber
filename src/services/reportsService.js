import { get } from './api'

/**
 * Servicio para gestión de reportes
 */
export const reportsService = {
  /**
   * Obtener estadísticas generales
   */
  async getGeneralStats(academicYear = null) {
    try {
      const params = academicYear ? `?academic_year=${academicYear}` : ''
      const response = await get(`/reports/general-stats${params}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting general stats:', error)
      throw error
    }
  },

  /**
   * Obtener resumen de notas
   */
  async getGradesSummary(academicYear = null) {
    try {
      const params = academicYear ? `?academic_year=${academicYear}` : ''
      const response = await get(`/reports/grades-summary${params}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting grades summary:', error)
      throw error
    }
  },

  /**
   * Obtener cuadro de honor
   */
  async getHonorRoll(academicYear = null, limit = 20) {
    try {
      const params = new URLSearchParams()
      if (academicYear) params.append('academic_year', academicYear)
      if (limit) params.append('limit', limit)
      const queryString = params.toString()
      const response = await get(`/reports/honor-roll${queryString ? '?' + queryString : ''}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting honor roll:', error)
      throw error
    }
  },

  /**
   * Obtener estudiantes desaprobados
   */
  async getFailedStudents(academicYear = null) {
    try {
      const params = academicYear ? `?academic_year=${academicYear}` : ''
      const response = await get(`/reports/failed-students${params}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting failed students:', error)
      throw error
    }
  },

  /**
   * Obtener cursos sin notas
   */
  async getCoursesWithoutGrades(academicYear = null) {
    try {
      const params = academicYear ? `?academic_year=${academicYear}` : ''
      const response = await get(`/reports/courses-without-grades${params}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting courses without grades:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas financieras
   */
  async getFinancialStats(academicYear = null) {
    try {
      const params = academicYear ? `?academic_year=${academicYear}` : ''
      const response = await get(`/reports/financial-stats${params}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting financial stats:', error)
      throw error
    }
  },

  /**
   * Obtener padres morosos
   */
  async getDelinquentParents(academicYear = null) {
    try {
      const params = academicYear ? `?academic_year=${academicYear}` : ''
      const response = await get(`/reports/delinquent-parents${params}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting delinquent parents:', error)
      throw error
    }
  },

  /**
   * Obtener cuentas por cobrar
   */
  async getAccountsReceivable(academicYear = null) {
    try {
      const params = academicYear ? `?academic_year=${academicYear}` : ''
      const response = await get(`/reports/accounts-receivable${params}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting accounts receivable:', error)
      throw error
    }
  },

  /**
   * Obtener métodos de pago
   */
  async getPaymentMethods(academicYear = null) {
    try {
      const params = academicYear ? `?academic_year=${academicYear}` : ''
      const response = await get(`/reports/payment-methods${params}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting payment methods:', error)
      throw error
    }
  },

  /**
   * Obtener tasa de cobranza
   */
  async getCollectionRate(academicYear = null) {
    try {
      const params = academicYear ? `?academic_year=${academicYear}` : ''
      const response = await get(`/reports/collection-rate${params}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting collection rate:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas de matrícula
   */
  async getEnrollmentStats(academicYear = null) {
    try {
      const params = academicYear ? `?academic_year=${academicYear}` : ''
      const response = await get(`/reports/enrollment-stats${params}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting enrollment stats:', error)
      throw error
    }
  },

  /**
   * Obtener personal docente
   */
  async getTeachingStaff(academicYear = null) {
    try {
      const params = academicYear ? `?academic_year=${academicYear}` : ''
      const response = await get(`/reports/teaching-staff${params}`)
      return response.data || response
    } catch (error) {
      console.error('Error getting teaching staff:', error)
      throw error
    }
  }
}

export default reportsService
