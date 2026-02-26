import { get, post, put, del } from './api'

/**
 * Servicio para gestión de relaciones padre-estudiante
 * Conecta con las APIs reales del backend
 */
export const parentStudentRelationsService = {
  /**
   * Obtener todas las relaciones
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de relaciones
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/parent-student-relations?${queryString}` : '/parent-student-relations'

      const response = await get(endpoint)
      return response.relations || response.data || response
    } catch (error) {
      console.error('Error al obtener relaciones:', error)
      throw error
    }
  },

  /**
   * Obtener relación por ID
   * @param {number} id - ID de la relación
   * @returns {Promise<Object>} Relación
   */
  async getById(id) {
    try {
      const response = await get(`/parent-student-relations/${id}`)
      return response.relation || response.data || response
    } catch (error) {
      console.error(`Error al obtener relación ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtener estudiantes de un padre
   * @param {number} parentId - ID del padre
   * @returns {Promise<Array>} Lista de estudiantes
   */
  async getStudentsByParent(parentId) {
    try {
      console.log('📡 [parentStudentRelationsService] getStudentsByParent llamado con parentId:', parentId)

      // Usar el endpoint correcto de students en lugar de parent-student-relations
      const endpoint = `/students/parent/${parentId}`
      console.log('📡 [parentStudentRelationsService] Llamando a endpoint:', endpoint)

      const response = await get(endpoint)
      console.log('📥 [parentStudentRelationsService] Respuesta recibida:', response)

      const students = response.students || response.data || response
      console.log('📦 [parentStudentRelationsService] Estudiantes extraídos:', students)

      // Transformar los datos al formato esperado por el componente
      if (Array.isArray(students)) {
        const transformed = students.map(student => ({
          id: student.id,
          name: `${student.first_names} ${student.last_names}`,
          grade: student.grade_name || 'Sin grado',
          dni: student.dni,
          code: student.code,
          level_name: student.level_name,
          section_name: student.section_name,
          // Incluir datos completos por si se necesitan
          ...student
        }))

        console.log('✅ [parentStudentRelationsService] Estudiantes transformados:', transformed)
        return transformed
      }

      console.log('⚠️ [parentStudentRelationsService] No se recibió un array, retornando []')
      return []
    } catch (error) {
      console.error(`❌ [parentStudentRelationsService] Error al obtener estudiantes del padre ${parentId}:`, error)
      console.error(`❌ [parentStudentRelationsService] Detalles del error:`, error.response || error.message)
      throw error
    }
  },

  /**
   * Obtener padres de un estudiante
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Array>} Lista de padres
   */
  async getParentsByStudent(studentId) {
    try {
      const response = await get(`/parent-student-relations/student/${studentId}`)
      return response.parents || response.data || response
    } catch (error) {
      console.error(`Error al obtener padres del estudiante ${studentId}:`, error)
      throw error
    }
  },

  /**
   * Crear relación padre-estudiante
   * @param {Object} relationData - Datos de la relación
   * @returns {Promise<Object>} Relación creada
   */
  async create(relationData) {
    try {
      const response = await post('/parent-student-relations', relationData)
      return response.relation || response.data || response
    } catch (error) {
      console.error('Error al crear relación:', error)
      throw error
    }
  },

  /**
   * Actualizar relación
   * @param {number} id - ID de la relación
   * @param {Object} relationData - Datos actualizados
   * @returns {Promise<Object>} Relación actualizada
   */
  async update(id, relationData) {
    try {
      const response = await put(`/parent-student-relations/${id}`, relationData)
      return response.relation || response.data || response
    } catch (error) {
      console.error(`Error al actualizar relación ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar relación
   * @param {number} id - ID de la relación
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/parent-student-relations/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar relación ${id}:`, error)
      throw error
    }
  }
}

export default parentStudentRelationsService
