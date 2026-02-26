import { get, post, put, del } from '../api'

/**
 * Servicio para gestión de estructura académica (niveles, grados, secciones)
 * Conecta con las APIs reales del backend
 */
export const structureService = {
  // ========== NIVELES ==========

  /**
   * Obtener todos los niveles
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de niveles
   */
  async getAllLevels(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/levels?${queryString}` : '/levels'

      const response = await get(endpoint)
      const levels = response.data || response.levels || response
      return Array.isArray(levels) ? levels : []
    } catch (error) {
      console.error('Error al obtener levels:', error)
      throw error
    }
  },

  /**
   * Obtener niveles por año lectivo
   * @param {number} academicYearId - ID del año lectivo
   * @returns {Promise<Array>} Lista de niveles
   */
  async getLevelsByYear(academicYearId) {
    return this.getAllLevels({ academic_year_id: academicYearId })
  },

  /**
   * Obtener nivel por ID
   * @param {number} id - ID del nivel
   * @returns {Promise<Object>} Nivel
   */
  async getLevelById(id) {
    try {
      const response = await get(`/levels/${id}`)
      return response.nivel || response.data || response
    } catch (error) {
      console.error(`Error al obtener nivel ${id}:`, error)
      throw error
    }
  },

  /**
   * Guardar nivel (crear o actualizar)
   * @param {Object} levelData - Datos del nivel
   * @param {Object} selectedAcademicYear - Año lectivo seleccionado
   * @param {number|null} editingItemId - ID si es edición
   * @returns {Promise<Object>} Nivel guardado
   */
  async saveLevel(levelData, selectedAcademicYear, editingItemId = null) {
    try {
      if (!levelData.name) {
        throw new Error('El nombre del nivel es requerido')
      }

      if (!selectedAcademicYear) {
        throw new Error('Debe seleccionar un año lectivo para crear la estructura')
      }

      const dataToSend = {
        ...levelData,
        academic_year_id: selectedAcademicYear.id
      }

      let response
      if (editingItemId) {
        response = await put(`/levels/${editingItemId}`, dataToSend)
      } else {
        response = await post('/levels', dataToSend)
      }

      return response.nivel || response.data || response
    } catch (error) {
      console.error('Error al guardar nivel:', error)
      throw error
    }
  },

  /**
   * Eliminar nivel
   * @param {number} levelId - ID del nivel
   * @returns {Promise<Object>} Confirmación
   */
  async deleteLevel(levelId) {
    try {
      const response = await del(`/levels/${levelId}`)
      return response
    } catch (error) {
      console.error('Error al eliminar nivel:', error)
      throw error
    }
  },

  // ========== GRADOS ==========

  /**
   * Obtener todos los grados
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de grados
   */
  async getAllGrades(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/grades?${queryString}` : '/grades'

      const response = await get(endpoint)
      const grades = response.data || response.grados || response
      return Array.isArray(grades) ? grades : []
    } catch (error) {
      console.error('Error al obtener grados:', error)
      throw error
    }
  },

  /**
   * Obtener grados por año lectivo
   * @param {number} academicYearId - ID del año lectivo
   * @returns {Promise<Array>} Lista de grados
   */
  async getGradesByYear(academicYearId) {
    return this.getAllGrades({ academic_year_id: academicYearId })
  },

  /**
   * Obtener grados por nivel
   * @param {number} levelId - ID del nivel
   * @returns {Promise<Array>} Lista de grados
   */
  async getGradesByLevel(levelId) {
    return this.getAllGrades({ level_id: levelId })
  },

  /**
   * Obtener grado por ID
   * @param {number} id - ID del grado
   * @returns {Promise<Object>} Grado
   */
  async getGradeById(id) {
    try {
      const response = await get(`/grades/${id}`)
      return response.grado || response.data || response
    } catch (error) {
      console.error(`Error al obtener grado ${id}:`, error)
      throw error
    }
  },

  /**
   * Guardar grado (crear o actualizar)
   * @param {Object} gradeData - Datos del grado
   * @param {Array} levels - Lista de niveles (para validación)
   * @param {Object} selectedAcademicYear - Año lectivo seleccionado
   * @param {number|null} editingItemId - ID si es edición
   * @returns {Promise<Object>} Grado guardado
   */
  async saveGrade(gradeData, levels, selectedAcademicYear, editingItemId = null) {
    try {
      if (!gradeData.name || !gradeData.level_id) {
        throw new Error('El nombre y nivel son requeridos')
      }

      if (!selectedAcademicYear) {
        throw new Error('Debe seleccionar un año lectivo para crear la estructura')
      }

      const dataToSend = {
        ...gradeData,
        level_id: gradeData.level_id,
        academic_year_id: selectedAcademicYear.id
      }

      let response
      if (editingItemId) {
        response = await put(`/grades/${editingItemId}`, dataToSend)
      } else {
        response = await post('/grades', dataToSend)
      }

      return response.grado || response.data || response
    } catch (error) {
      console.error('Error al guardar grado:', error)
      throw error
    }
  },

  /**
   * Eliminar grado
   * @param {number} gradeId - ID del grado
   * @returns {Promise<Object>} Confirmación
   */
  async deleteGrade(gradeId) {
    try {
      const response = await del(`/grades/${gradeId}`)
      return response
    } catch (error) {
      console.error('Error al eliminar grado:', error)
      throw error
    }
  },

  // ========== SECCIONES ==========

  /**
   * Obtener todas las secciones
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de secciones
   */
  async getAllSections(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/sections?${queryString}` : '/sections'

      const response = await get(endpoint)
      const sections = response.data || response.secciones || response
      return Array.isArray(sections) ? sections : []
    } catch (error) {
      console.error('Error al obtener secciones:', error)
      throw error
    }
  },

  /**
   * Obtener secciones por año lectivo
   * @param {number} academicYearId - ID del año lectivo
   * @returns {Promise<Array>} Lista de secciones
   */
  async getSectionsByYear(academicYearId) {
    return this.getAllSections({ academic_year_id: academicYearId })
  },

  /**
   * Obtener secciones por grado
   * @param {number} gradeId - ID del grado
   * @returns {Promise<Array>} Lista de secciones
   */
  async getSectionsByGrade(gradeId) {
    return this.getAllSections({ grade_id: gradeId })
  },

  /**
   * Obtener sección por ID
   * @param {number} id - ID de la sección
   * @returns {Promise<Object>} Sección
   */
  async getSectionById(id) {
    try {
      const response = await get(`/sections/${id}`)
      return response.seccion || response.data || response
    } catch (error) {
      console.error(`Error al obtener sección ${id}:`, error)
      throw error
    }
  },

  /**
   * Guardar sección (crear o actualizar)
   * @param {Object} sectionData - Datos de la sección
   * @param {Array} grades - Lista de grados (para validación)
   * @param {Object} selectedAcademicYear - Año lectivo seleccionado
   * @param {number|null} editingItemId - ID si es edición
   * @returns {Promise<Object>} Sección guardada
   */
  async saveSection(sectionData, grades, selectedAcademicYear, editingItemId = null) {
    try {
      console.log('=== FRONTEND: saveSection ===')
      console.log('sectionData recibido:', sectionData)
      console.log('selectedAcademicYear:', selectedAcademicYear)

      if (!sectionData.name || !sectionData.grade_id) {
        throw new Error('El nombre y grado son requeridos')
      }

      if (!selectedAcademicYear) {
        throw new Error('Debe seleccionar un año lectivo para crear la estructura')
      }

      // Mapear campos del frontend al backend
      // El objeto selectedAcademicYear puede tener 'year' o 'año' dependiendo del contexto
      const academicYearValue = selectedAcademicYear.year || selectedAcademicYear.año || new Date().getFullYear()

      const dataToSend = {
        name: sectionData.name,
        grade_id: sectionData.grade_id,
        capacity: sectionData.capacidadMaxima || sectionData.capacity || 30,
        tutor_id: sectionData.tutorId || sectionData.tutor_id || null,
        shift: sectionData.turno || sectionData.shift || 'mañana',
        academic_year: academicYearValue,
        academic_year_id: selectedAcademicYear.id
      }

      console.log('dataToSend al backend:', dataToSend)

      let response
      if (editingItemId) {
        console.log('Actualizando sección ID:', editingItemId)
        response = await put(`/sections/${editingItemId}`, dataToSend)
      } else {
        console.log('Creando nueva sección')
        response = await post('/sections', dataToSend)
      }

      console.log('Respuesta del backend:', response)
      return response.seccion || response.data || response
    } catch (error) {
      console.error('Error al guardar sección:', error)
      throw error
    }
  },

  /**
   * Eliminar sección
   * @param {number} sectionId - ID de la sección
   * @returns {Promise<Object>} Confirmación
   */
  async deleteSection(sectionId) {
    try {
      const response = await del(`/sections/${sectionId}`)
      return response
    } catch (error) {
      console.error('Error al eliminar sección:', error)
      throw error
    }
  },

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
    return this.getAllCourses({ academic_year_id: academicYearId })
  },

  /**
   * Obtener cursos por nivel
   * @param {string} levelId - ID del nivel
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
   * @param {number|null} editingItemId - ID si es edición
   * @returns {Promise<Object>} Curso guardado
   */
  async saveCourse(courseData, editingItemId = null) {
    try {
      if (!courseData.name || !courseData.level_id) {
        throw new Error('El nombre y nivel del curso son requeridos')
      }

      const dataToSend = {
        name: courseData.name,
        level_id: courseData.level_id,
        academic_area_id: courseData.academic_area_id || courseData.area_id,
        hours_per_week: courseData.hours_per_week || courseData.horasPorSemana || 2
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

  // ========== COMPETENCIAS ==========

  /**
   * Crear competencia
   * @param {Object} competencyData - Datos de la competencia
   * @returns {Promise<Object>} Competencia creada
   */
  async createCompetency(competencyData) {
    try {
      const response = await post('/competencies', competencyData)
      return response.competency || response.data || response
    } catch (error) {
      console.error('Error al crear competencia:', error)
      throw error
    }
  },

  /**
   * Actualizar competencia
   * @param {number} id - ID de la competencia
   * @param {Object} competencyData - Datos actualizados
   * @returns {Promise<Object>} Competencia actualizada
   */
  async updateCompetency(id, competencyData) {
    try {
      const response = await put(`/competencies/${id}`, competencyData)
      return response.competency || response.data || response
    } catch (error) {
      console.error('Error al actualizar competencia:', error)
      throw error
    }
  },

  /**
   * Eliminar competencia
   * @param {number} id - ID de la competencia
   * @returns {Promise<Object>} Confirmación
   */
  async deleteCompetency(id) {
    try {
      const response = await del(`/competencies/${id}`)
      return response
    } catch (error) {
      console.error('Error al eliminar competencia:', error)
      throw error
    }
  },

  // ========== UTILIDADES ==========

  /**
   * Cargar toda la estructura académica para un año
   * @param {Object} academicYear - Año lectivo
   * @returns {Promise<Object>} Estructura completa
   */
  async loadAcademicStructure(academicYear) {
    try {
      if (!academicYear) {
        return {
          levels: [],
          grades: [],
          sections: [],
          courses: []
        }
      }

      // Ejecutar las 4 llamadas en paralelo
      const [levels, grades, sections, courses] = await Promise.all([
        this.getLevelsByYear(academicYear.id),
        this.getGradesByYear(academicYear.id),
        this.getSectionsByYear(academicYear.id),
        this.getCoursesByYear(academicYear.id)
      ])

      return {
        levels,
        grades,
        sections,
        courses
      }
    } catch (error) {
      console.error('Error al cargar estructura académica:', error)
      throw error
    }
  }
}

export default structureService
