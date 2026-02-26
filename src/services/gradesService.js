import { get, post, put, del } from './api'

/**
 * Servicio para gestión de calificaciones
 * Conecta con las APIs reales del backend
 *
 * ⚠️ ACTUALIZADO: Ahora usa exclusivamente competency-grades (modelo MINEDU)
 * Se eliminó student-grades del backend
 */
export const gradesService = {
  // ========== CALIFICACIONES POR COMPETENCIAS (PRINCIPAL) ==========

  /**
   * ⚠️ DEPRECADO: Usar getAllCompetencyGrades en su lugar
   * Mantiene compatibilidad temporal redirigiendo a competency-grades
   */
  async getAllGrades(filters = {}) {
    console.warn('⚠️ getAllGrades está deprecado. Usar getAllCompetencyGrades')
    return this.getAllCompetencyGrades(filters)
  },

  /**
   * ⚠️ DEPRECADO: Usar getCompetencyGradeById en su lugar
   */
  async getGradeById(id) {
    console.warn('⚠️ getGradeById está deprecado. Usar getCompetencyGradeById')
    return this.getCompetencyGradeById(id)
  },

  /**
   * ⚠️ DEPRECADO: Usar createCompetencyGrade en su lugar
   */
  async createGrade(gradeData) {
    console.warn('⚠️ createGrade está deprecado. Usar createCompetencyGrade')
    return this.createCompetencyGrade(gradeData)
  },

  /**
   * ⚠️ DEPRECADO: Usar updateCompetencyGrade en su lugar
   */
  async updateGrade(id, gradeData) {
    console.warn('⚠️ updateGrade está deprecado. Usar updateCompetencyGrade')
    return this.updateCompetencyGrade(id, gradeData)
  },

  /**
   * ⚠️ DEPRECADO: Usar removeCompetencyGrade en su lugar
   */
  async removeGrade(id) {
    console.warn('⚠️ removeGrade está deprecado. Usar removeCompetencyGrade')
    return this.removeCompetencyGrade(id)
  },

  // ========== CALIFICACIONES POR COMPETENCIAS (Sistema Currículo Nacional) ==========

  /**
   * Obtener todas las calificaciones por competencias
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de calificaciones por competencias
   */
  async getAllCompetencyGrades(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/competency-grades?${queryString}` : '/competency-grades'

      const response = await get(endpoint)
      const result = response.calificaciones || response.notas || response.data || response
      return result
    } catch (error) {
      console.error('Error al obtener calificaciones por competencias:', error)
      throw error
    }
  },

  /**
   * Obtener calificación por competencia por ID
   * @param {number} id - ID de la calificación
   * @returns {Promise<Object>} Calificación por competencia
   */
  async getCompetencyGradeById(id) {
    try {
      const response = await get(`/competency-grades/${id}`)
      return response.calificacion || response.nota || response.data || response
    } catch (error) {
      console.error(`Error al obtener calificación por competencia ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear calificación por competencia
   * @param {Object} gradeData - Datos de la calificación
   * @returns {Promise<Object>} Calificación creada
   */
  async createCompetencyGrade(gradeData) {
    try {
      const response = await post('/competency-grades', gradeData)
      return response.calificacion || response.nota || response.data || response
    } catch (error) {
      console.error('❌ [gradesService] Error al crear calificación:', error)
      throw error
    }
  },

  /**
   * Actualizar calificación por competencia
   * @param {number} id - ID de la calificación
   * @param {Object} gradeData - Datos actualizados
   * @returns {Promise<Object>} Calificación actualizada
   */
  async updateCompetencyGrade(id, gradeData) {
    try {
      const response = await put(`/competency-grades/${id}`, gradeData)
      return response.calificacion || response.nota || response.data || response
    } catch (error) {
      console.error(`Error al actualizar calificación por competencia ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar calificación por competencia
   * @param {number} id - ID de la calificación
   * @returns {Promise<Object>} Confirmación
   */
  async removeCompetencyGrade(id) {
    try {
      const response = await del(`/competency-grades/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar calificación por competencia ${id}:`, error)
      throw error
    }
  },

  /**
   * 🆕 NUEVO: Obtener datos para el grid de registro de notas
   * @param {Object} params - course_id, grade_id, section_id, quarter
   * @returns {Promise<Object>} { students, competencies, structure }
   */
  async getGradesGrid(params) {
    try {
      const { course_id, grade_id, section_id, quarter } = params

      if (!course_id || !grade_id || !section_id || !quarter) {
        throw new Error('Faltan parámetros requeridos: course_id, grade_id, section_id, quarter')
      }

      const queryParams = new URLSearchParams({
        course_id,
        grade_id,
        section_id,
        quarter
      })

      const endpoint = `/competency-grades/grid?${queryParams.toString()}`
      const response = await get(endpoint)
      return response.data || response
    } catch (error) {
      console.error('Error al obtener grid de calificaciones:', error)
      throw error
    }
  },

  // ========== PROMEDIOS BIMESTRALES ==========

  /**
   * Obtener todos los promedios bimestrales
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de promedios
   */
  async getAllQuarterAverages(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/quarter-averages?${queryString}` : '/quarter-averages'

      const response = await get(endpoint)
      return response.promedios || response.data || response
    } catch (error) {
      console.error('Error al obtener promedios bimestrales:', error)
      throw error
    }
  },

  /**
   * Calcular promedios bimestrales para un estudiante
   * @param {number} studentId - ID del estudiante
   * @param {number} quarter - Número del bimestre
   * @returns {Promise<Array>} Promedios calculados
   */
  async calculateQuarterAverages(studentId, quarter) {
    try {
      const response = await post('/quarter-averages/calculate', {
        student_id: studentId,
        quarter: quarter
      })
      return response.promedios || response.data || response
    } catch (error) {
      console.error('Error al calcular promedios bimestrales:', error)
      throw error
    }
  },

  // ========== PROMEDIOS POR COMPETENCIAS ==========

  /**
   * Obtener promedios guardados por competencias desde competency_quarter_averages
   * @param {Object} filters - student_id, course_id (opcional), quarter, academic_year_id (opcional)
   * @returns {Promise<Array>} Lista de promedios guardados
   */
  async getCompetencyAverages(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/competency-grades/averages?${queryString}` : '/competency-grades/averages'

      const response = await get(endpoint)
      return response.data || response
    } catch (error) {
      console.error('❌ [gradesService] Error al obtener promedios por competencias:', error)
      throw error
    }
  },

  /**
   * Obtener todos los promedios por competencias
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de promedios
   */
  async getAllCompetencyAverages(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/competency-averages?${queryString}` : '/competency-averages'

      const response = await get(endpoint)
      return response.promedios || response.data || response
    } catch (error) {
      console.error('Error al obtener promedios por competencias:', error)
      throw error
    }
  },

  /**
   * Calcular promedios por competencias para un estudiante
   * @param {number} studentId - ID del estudiante
   * @param {number} quarter - Número del bimestre
   * @returns {Promise<Array>} Promedios calculados
   */
  async calculateCompetencyAverages(studentId, quarter) {
    try {
      const response = await post('/competency-averages/calculate', {
        student_id: studentId,
        quarter: quarter
      })
      return response.promedios || response.data || response
    } catch (error) {
      console.error('Error al calcular promedios por competencias:', error)
      throw error
    }
  },

  // ========== BOLETA DE NOTAS ==========

  /**
   * Obtener datos de boleta para un estudiante en un bimestre específico
   * Incluye todas las notas de cada curso con sus comentarios
   * @param {number} studentId - ID del estudiante
   * @param {number} quarter - Número del bimestre (1-4)
   * @returns {Promise<Object>} Datos de la boleta organizados por curso
   */
  async getReportCardData(studentId, quarter) {
    try {
      if (!studentId || !quarter) {
        throw new Error('Se requiere studentId y quarter')
      }

      const endpoint = `/competency-grades/report-card/${studentId}?quarter=${quarter}`
      const response = await get(endpoint)
      return response.data || response
    } catch (error) {
      console.error('❌ [gradesService] Error al obtener datos de boleta:', error)
      throw error
    }
  },

  // ========== HISTORIAL DE CALIFICACIONES ==========

  /**
   * ❌ ELIMINADO: El endpoint /grade-history fue removido del backend
   * @deprecated Esta funcionalidad ya no está disponible
   */
  async getGradeHistory(filters = {}) {
    console.error('❌ getGradeHistory ya no está disponible. El endpoint /grade-history fue eliminado del backend.')
    throw new Error('El historial de calificaciones ya no está disponible. Contacte al administrador.')
  },

  // ========== CONDUCTA DE ESTUDIANTES ==========

  /**
   * Obtener registros de conducta
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de registros de conducta
   */
  async getAllBehaviors(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/student-behaviors?${queryString}` : '/student-behaviors'

      const response = await get(endpoint)
      return response.conductas || response.comportamientos || response.data || response
    } catch (error) {
      console.error('Error al obtener conductas:', error)
      throw error
    }
  },

  /**
   * Crear registro de conducta
   * @param {Object} behaviorData - Datos del registro
   * @returns {Promise<Object>} Registro creado
   */
  async createBehavior(behaviorData) {
    try {
      const response = await post('/student-behaviors', behaviorData)
      return response.conducta || response.comportamiento || response.data || response
    } catch (error) {
      console.error('Error al crear conducta:', error)
      throw error
    }
  },

  /**
   * Actualizar registro de conducta
   * @param {number} id - ID del registro
   * @param {Object} behaviorData - Datos actualizados
   * @returns {Promise<Object>} Registro actualizado
   */
  async updateBehavior(id, behaviorData) {
    try {
      const response = await put(`/student-behaviors/${id}`, behaviorData)
      return response.conducta || response.comportamiento || response.data || response
    } catch (error) {
      console.error(`Error al actualizar conducta ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar registro de conducta
   * @param {number} id - ID del registro
   * @returns {Promise<Object>} Confirmación
   */
  async removeBehavior(id) {
    try {
      const response = await del(`/student-behaviors/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar conducta ${id}:`, error)
      throw error
    }
  }
}

export default gradesService
