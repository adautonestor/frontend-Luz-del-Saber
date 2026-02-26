import { get, del } from './api'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Servicio para gestión de informes psicológicos
 * Conecta con las APIs reales del backend usando FormData para archivos
 */
export const psychologicalReportsService = {
  /**
   * Obtener todos los informes psicológicos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de informes
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/psychological-reports?${queryString}` : '/psychological-reports'

      const response = await get(endpoint)
      return response.data || response
    } catch (error) {
      console.error('Error al obtener informes psicológicos:', error)
      throw error
    }
  },

  /**
   * Obtener informe por ID
   * @param {number} id - ID del informe
   * @returns {Promise<Object>} Informe
   */
  async getById(id) {
    try {
      const response = await get(`/psychological-reports/${id}`)
      return response.data || response
    } catch (error) {
      console.error(`Error al obtener informe ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener informes por estudiante
   * @param {string} studentId - ID del estudiante
   * @param {string} academicYear - Año escolar (opcional)
   * @returns {Promise<Array>} Lista de informes del estudiante
   */
  async getByStudent(studentId, academicYear = null) {
    try {
      const queryParams = new URLSearchParams()
      if (academicYear) queryParams.append('academic_year', academicYear)
      const queryString = queryParams.toString()

      const endpoint = queryString
        ? `/psychological-reports/student/${studentId}?${queryString}`
        : `/psychological-reports/student/${studentId}`

      const response = await get(endpoint)
      return response.data || response
    } catch (error) {
      console.error(`Error al obtener informes del estudiante ${studentId}:`, error)
      throw error
    }
  },

  /**
   * Crear un informe psicológico con archivo PDF
   * @param {Object} reportData - Datos del informe
   * @param {File} file - Archivo PDF
   * @returns {Promise<Object>} Informe creado
   */
  async create(reportData, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('student_id', reportData.student_id)
      formData.append('academic_year', reportData.academic_year)
      formData.append('issue_date', reportData.issue_date)
      if (reportData.observations) {
        formData.append('observations', reportData.observations)
      }

      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/psychological-reports`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear informe')
      }

      return data.data || data
    } catch (error) {
      console.error('Error al crear informe:', error)
      throw error
    }
  },

  /**
   * Crear informes masivos para múltiples estudiantes
   * @param {Array} students - Lista de estudiantes
   * @param {Object} metadata - Metadatos del informe (año, fecha, observaciones)
   * @param {File} file - Archivo PDF
   * @returns {Promise<number>} Cantidad de informes creados exitosamente
   */
  async createMassiveReports(students, metadata, file) {
    try {
      const { selectedYear, issueDate, observations } = metadata

      let successCount = 0
      const errors = []

      // Crear un informe por cada estudiante
      for (const student of students) {
        try {
          const reportData = {
            student_id: student.id,
            academic_year: selectedYear,
            issue_date: issueDate,
            observations: observations || `Informe psicológico del año ${selectedYear}`
          }

          await this.create(reportData, file)
          successCount++
        } catch (error) {
          console.error(`Error al crear informe para estudiante ${student.id}:`, error)
          errors.push({
            studentId: student.id,
            studentName: `${student.first_names} ${student.last_names}`,
            error: error.message
          })
        }
      }

      if (errors.length > 0) {
        console.warn('Algunos informes no pudieron ser creados:', errors)
      }

      return successCount
    } catch (error) {
      console.error('Error al crear informes masivos:', error)
      throw error
    }
  },

  /**
   * Actualizar informe
   * @param {number} id - ID del informe
   * @param {Object} reportData - Datos actualizados
   * @param {File} file - Archivo PDF (opcional)
   * @returns {Promise<Object>} Informe actualizado
   */
  async update(id, reportData, file = null) {
    try {
      const formData = new FormData()

      if (file) {
        formData.append('file', file)
      }
      if (reportData.issue_date) {
        formData.append('issue_date', reportData.issue_date)
      }
      if (reportData.observations !== undefined) {
        formData.append('observations', reportData.observations)
      }

      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/psychological-reports/${id}`, {
        method: 'PUT',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar informe')
      }

      return data.data || data
    } catch (error) {
      console.error(`Error al actualizar informe ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar informe (marca como inactivo)
   * @param {number} id - ID del informe
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/psychological-reports/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar informe ${id}:`, error)
      throw error
    }
  }
}

export default psychologicalReportsService
