import { get, post, put, del } from '../api'

/**
 * Servicio para gestión de cursos y asignaciones de profesores
 * Conecta con las APIs reales del backend
 */
export const courseService = {
  // ========== CURSOS ==========

  /**
   * Obtener todos los cursos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de cursos
   */
  async getAllCourses(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/courses?${queryString}` : '/courses'

      const response = await get(endpoint)
      return response.cursos || response.data || response
    } catch (error) {
      console.error('Error al obtener cursos:', error)
      throw error
    }
  },

  /**
   * Obtener cursos por año lectivo
   * @param {number} academicYearId - ID del año lectivo
   * @returns {Promise<Array>} Lista de cursos
   */
  async getCoursesByYear(academicYearId) {
    return this.getAllCourses({ año_lectivo_id: academicYearId })
  },

  /**
   * Obtener cursos por nivel
   * @param {number} levelId - ID del nivel
   * @returns {Promise<Array>} Lista de cursos
   */
  async getCoursesByLevel(levelId) {
    return this.getAllCourses({ level_id: levelId })
  },

  /**
   * Obtener curso por ID
   * @param {number} id - ID del curso
   * @returns {Promise<Object>} Curso
   */
  async getCourseById(id) {
    try {
      const response = await get(`/courses/${id}`)
      return response.curso || response.data || response
    } catch (error) {
      console.error(`Error al obtener curso ${id}:`, error)
      throw error
    }
  },

  /**
   * Guardar curso (crear o actualizar)
   * @param {Object} courseData - Datos del curso
   * @param {Array} levels - Lista de niveles (para validación)
   * @param {number|null} editingItemId - ID si es edición
   * @returns {Promise<Object>} Curso guardado
   */
  async saveCourse(courseData, levels, editingItemId = null, selectedAcademicYear = null) {
    try {
      // Validar campos requeridos
      const name = courseData.name?.trim()
      const level_id = courseData.level_id
      // area ahora puede ser un ID (número) o un string (legacy)
      const area = courseData.area

      if (!name || !level_id || !area) {
        console.error('❌ Validación fallida:', { name, level_id, area, courseData })
        throw new Error('El nombre, nivel y área son requeridos')
      }

      // Determinar academic_area_id
      let academic_area_id
      if (typeof area === 'number') {
        // Si area ya es un número (ID), usarlo directamente
        academic_area_id = area
      } else {
        // Legacy: Mapear área de texto a academic_area_id
        const areaMapping = {
          'comunicación': 1,
          'matemática': 2,
          'matemáticas': 2,
          'ciencia y tecnología': 3,
          'ciencias': 3,
          'personal social': 4,
          'ciencias sociales': 4,
          'educación física': 5,
          'arte y cultura': 6,
          'arte': 6,
          'inglés': 7,
          'ingles': 7,
          'educación religiosa': 8,
          'religión': 8
        }
        academic_area_id = areaMapping[area.toLowerCase()] || null
      }

      // Preparar teachers como array de IDs
      let teachers = null

      if (courseData.teacher_id) {
        teachers = [parseInt(courseData.teacher_id)]
      }

      // Mapear campos del frontend al backend
      // Obtener academic_year_id del courseData PRIMERO, luego del parámetro
      const academicYearId =
        courseData.academic_year_id ||
        courseData.año_lectivo_id ||
        selectedAcademicYear?.id ||
        selectedAcademicYear ||
        null

      // Validar que academic_year_id NO sea null
      if (!academicYearId) {
        throw new Error('Debe seleccionar un año lectivo para crear el curso')
      }

      const dataToSend = {
        name: name,
        level_id: parseInt(level_id) || null,
        academic_area_id: academic_area_id,
        area: area,
        weekly_hours: parseInt(courseData.horasSemanales || courseData.weekly_hours || 4),
        teachers: teachers,
        description: courseData.description || '',
        code: courseData.code || '',
        objectives: courseData.objectives || null,
        methodology: courseData.methodology || null,
        resources: courseData.resources || null,
        evaluation: courseData.evaluation || null,
        // Usar el academic_year_id obtenido
        academic_year_id: academicYearId,
        grade_id: null  // Los cursos se asocian a niveles, no a grados específicos
      }

      let response
      if (editingItemId) {
        response = await put(`/courses/${editingItemId}`, dataToSend)
      } else {
        response = await post('/courses', dataToSend)
      }

      return response.curso || response.data || response
    } catch (error) {
      console.error('Error al guardar curso:', error)
      throw error
    }
  },

  /**
   * Eliminar curso
   * @param {number} courseId - ID del curso
   * @returns {Promise<Object>} Confirmación
   */
  async deleteCourse(courseId) {
    try {
      const response = await del(`/courses/${courseId}`)
      return response
    } catch (error) {
      console.error('Error al eliminar curso:', error)
      throw error
    }
  },

  // ========== ASIGNACIONES DE PROFESORES ==========

  /**
   * Obtener todas las asignaciones de profesores
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de asignaciones
   */
  async getAllAssignments(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/course-assignments?${queryString}` : '/course-assignments'

      const response = await get(endpoint)
      return response.assignments || response.asignaciones || response.data || response
    } catch (error) {
      console.error('Error al obtener asignaciones:', error)
      throw error
    }
  },

  /**
   * Obtener asignaciones por curso
   * @param {number} courseId - ID del curso
   * @param {number|null} academicYearId - ID del año lectivo (opcional)
   * @returns {Promise<Array>} Lista de asignaciones
   */
  async getAssignmentsByCourse(courseId, academicYearId = null) {
    const filters = { course_id: courseId }
    if (academicYearId) {
      filters.año_lectivo_id = academicYearId
    }
    return this.getAllAssignments(filters)
  },

  /**
   * Obtener asignaciones por profesor
   * @param {number} teacherId - ID del profesor
   * @param {number|null} academicYearId - ID del año lectivo (opcional)
   * @returns {Promise<Array>} Lista de asignaciones
   */
  async getAssignmentsByTeacher(teacherId, academicYearId = null) {
    const filters = { teacher_id: teacherId }
    if (academicYearId) {
      filters.año_lectivo_id = academicYearId
    }
    return this.getAllAssignments(filters)
  },

  /**
   * Guardar asignaciones de profesores para un curso
   * @param {number} courseId - ID del curso
   * @param {Object} profesoresPorGrado - Map de grado_id -> profesor_id
   * @param {number} academicYearId - ID del año lectivo
   * @param {number} courseHours - Horas semanales del curso
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Array>} Asignaciones creadas
   */
  async saveAssignments(courseId, profesoresPorGrado, academicYearId, courseHours = 4, userId = 'admin') {
    try {
      const yearId = academicYearId?.id || academicYearId

      if (!courseId || !yearId) {
        throw new Error('Se requiere courseId y academicYearId')
      }

      // Crear asignaciones para cada grado (vincula automáticamente todas las secciones)
      const assignments = []
      for (const [gradoId, profesorId] of Object.entries(profesoresPorGrado)) {
        if (profesorId) {
          const assignmentData = {
            course_id: courseId,
            grade_id: parseInt(gradoId),
            teacher_id: parseInt(profesorId),
            academic_year_id: yearId,
            status: 'active',
            user_id_registration: userId
          }

          const response = await post('/course-assignments', assignmentData)
          const assignment = response.assignment || response.asignacion || response.data || response
          assignments.push(assignment)
        }
      }

      return assignments
    } catch (error) {
      console.error('Error al guardar asignaciones:', error)
      throw error
    }
  },

  /**
   * Eliminar asignación
   * @param {number} assignmentId - ID de la asignación
   * @returns {Promise<Object>} Confirmación
   */
  async deleteAssignment(assignmentId) {
    try {
      const response = await del(`/course-assignments/${assignmentId}`)
      return response
    } catch (error) {
      console.error('Error al eliminar asignación:', error)
      throw error
    }
  },

  // ========== PROFESORES ==========

  /**
   * Obtener todos los profesores (desde tabla users con rol Profesor)
   * @returns {Promise<Array>} Lista de profesores
   */
  async getAllTeachers() {
    try {
      const response = await get('/users/by-role/Profesor')
      return response.data || response || []
    } catch (error) {
      console.error('Error al obtener profesores:', error)
      throw error
    }
  },

  // ========== COMPETENCIAS Y CAPACIDADES ==========

  /**
   * Obtener todas las competencias
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de competencias
   */
  async getAllCompetencies(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/competencies?${queryString}` : '/competencies'

      const response = await get(endpoint)
      return response.competencias || response.data || response
    } catch (error) {
      console.error('Error al obtener competencias:', error)
      throw error
    }
  },

  /**
   * Obtener competencias por área
   * @param {string} area - Área académica
   * @returns {Promise<Array>} Lista de competencias
   */
  async getCompetenciesByArea(area) {
    return this.getAllCompetencies({ area })
  },

  /**
   * Obtener todas las capacidades
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de capacidades
   */
  async getAllCapacities(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/capacities?${queryString}` : '/capacities'

      const response = await get(endpoint)
      return response.capacidades || response.data || response
    } catch (error) {
      console.error('Error al obtener capacidades:', error)
      throw error
    }
  },

  /**
   * Obtener capacidades por competencia
   * @param {number} competencyId - ID de la competencia
   * @returns {Promise<Array>} Lista de capacidades
   */
  async getCapacitiesByCompetency(competencyId) {
    return this.getAllCapacities({ competencia_id: competencyId })
  },

  // ========== COURSE COMPETENCIES ==========

  /**
   * Obtener todas las relaciones curso-competencia (course_competencies)
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de course_competencies
   */
  async getAllCourseCompetencies(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/course-competencies?${queryString}` : '/course-competencies'

      const response = await get(endpoint)
      return response.course_competencies || response.data || response
    } catch (error) {
      console.error('Error al obtener course_competencies:', error)
      throw error
    }
  },

  /**
   * Obtener course_competencies por curso
   * @param {number} courseId - ID del curso
   * @returns {Promise<Array>} Lista de course_competencies del curso
   */
  async getCourseCompetenciesByCourse(courseId) {
    try {
      const response = await get(`/course-competencies/course/${courseId}`)
      return response.data || response
    } catch (error) {
      console.error(`Error al obtener competencias del curso ${courseId}:`, error)
      return []
    }
  }
}

export default courseService
