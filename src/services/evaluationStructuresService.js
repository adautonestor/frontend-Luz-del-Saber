import { get, post, put, del } from './api'

/**
 * Servicio para gestión de estructuras de evaluación
 * Conecta con las APIs reales del backend
 */
export const evaluationStructuresService = {
  /**
   * Obtener todas las estructuras de evaluación
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de estructuras
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/evaluation-structures?${queryString}` : '/evaluation-structures'

      const response = await get(endpoint)
      return response.structures || response.data || response
    } catch (error) {
      console.error('Error al obtener estructuras de evaluación:', error)
      throw error
    }
  },

  /**
   * Obtener estructura por ID
   * @param {number} id - ID de la estructura
   * @returns {Promise<Object>} Estructura de evaluación
   */
  async getById(id) {
    try {
      const response = await get(`/evaluation-structures/${id}`)
      return response.structure || response.data || response
    } catch (error) {
      console.error(`Error al obtener estructura ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener o crear estructura de evaluación automáticamente
   * Si no existe, se crea con la estructura por defecto
   * @param {number} courseId - ID del curso
   * @param {number} gradeId - ID del grado
   * @param {number} quarter - Número de bimestre (1-4)
   * @param {number} academicYearId - ID del año académico (opcional)
   * @returns {Promise<Object>} Estructura de evaluación (existente o creada)
   */
  async getOrCreate(courseId, gradeId, quarter, academicYearId = null) {
    try {
      const queryParams = new URLSearchParams({
        course_id: courseId,
        grade_id: gradeId,
        quarter: quarter
      })

      if (academicYearId) {
        queryParams.append('academic_year_id', academicYearId)
      }

      const response = await get(`/evaluation-structures/get-or-create?${queryParams.toString()}`)

      // Log si fue creada automáticamente
      if (response.created) {
        console.log('✨ Estructura de evaluación creada automáticamente:', response.message)
      }

      return response.data || response
    } catch (error) {
      console.error('Error al obtener/crear estructura de evaluación:', error)
      throw error
    }
  },

  /**
   * Crear estructura de evaluación
   * @param {Object} structureData - Datos de la estructura
   * @returns {Promise<Object>} Estructura creada
   */
  async create(structureData) {
    try {
      const response = await post('/evaluation-structures', structureData)
      return response.structure || response.data || response
    } catch (error) {
      console.error('Error al crear estructura de evaluación:', error)
      throw error
    }
  },

  /**
   * Actualizar estructura de evaluación
   * @param {number} id - ID de la estructura
   * @param {Object} structureData - Datos actualizados
   * @returns {Promise<Object>} Estructura actualizada
   */
  async update(id, structureData) {
    try {
      const response = await put(`/evaluation-structures/${id}`, structureData)
      return response.structure || response.data || response
    } catch (error) {
      console.error(`Error al actualizar estructura ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar estructura de evaluación
   * @param {number} id - ID de la estructura
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/evaluation-structures/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar estructura ${id}:`, error)
      throw error
    }
  },

  /**
   * Agregar columna personalizada a una estructura de evaluación
   * Crea la estructura automáticamente si no existe
   * @param {number} structureId - ID de la estructura (puede ser null si se usan los otros parámetros)
   * @param {string} parentId - ID de la competencia/categoría padre
   * @param {Object} columnData - Datos de la columna (id, name, weight)
   * @param {number} courseId - ID del curso (para auto-creación)
   * @param {number} gradeId - ID del grado (para auto-creación)
   * @param {number} quarter - Número de bimestre (para auto-creación)
   * @param {number} academicYearId - ID del año académico (opcional)
   * @returns {Promise<Object>} Estructura actualizada
   */
  async addCustomColumn(structureId, parentId, columnData, courseId = null, gradeId = null, quarter = null, academicYearId = null) {
    try {
      const payload = {
        parentId,
        columnData
      }

      // Agregar datos para auto-creación si están disponibles
      if (courseId) payload.courseId = courseId
      if (gradeId) payload.gradeId = gradeId
      if (quarter) payload.quarter = quarter
      if (academicYearId) payload.academicYearId = academicYearId

      const response = await post(`/evaluation-structures/${structureId || 0}/columns`, payload)
      return response.data || response
    } catch (error) {
      console.error('Error al agregar columna personalizada:', error)
      throw error
    }
  },

  /**
   * Eliminar columna personalizada de una estructura de evaluación
   * @param {number} structureId - ID de la estructura
   * @param {string} columnId - ID de la columna a eliminar
   * @returns {Promise<Object>} Estructura actualizada
   */
  async removeCustomColumn(structureId, columnId) {
    try {
      const response = await del(`/evaluation-structures/${structureId}/columns/${columnId}`)
      return response.data || response
    } catch (error) {
      console.error('Error al eliminar columna personalizada:', error)
      throw error
    }
  }
}

export default evaluationStructuresService
