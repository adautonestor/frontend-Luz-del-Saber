import { get, post, put, del } from './api'

/**
 * Normalizar datos de estudiante del backend al formato esperado por el frontend
 * @param {Object} student - Estudiante del backend
 * @returns {Object} Estudiante normalizado
 */
const normalizeStudent = (student) => {
  if (!student) return null

  // Mapear campos del backend (snake_case con IDs) al formato esperado por el frontend
  return {
    ...student,
    // Mantener campos originales
    id: student.id,
    code: student.code,
    first_names: student.first_names,
    last_names: student.last_names,
    dni: student.dni,
    birth_date: student.birth_date,
    gender: student.gender,
    sexo: student.gender, // Alias para compatibilidad con componentes legacy
    fechaNacimiento: student.birth_date, // Alias para compatibilidad
    telefono: student.phone, // Alias para compatibilidad
    direccion: student.address, // Alias para compatibilidad
    address: student.address,
    phone: student.phone,
    enrollment_date: student.enrollment_date,
    status: student.status,

    // Mapear campos de relaciones al formato legacy esperado por el frontend
    nivel: student.level_name?.toLowerCase() || student.nivel,
    grado: student.grade_name || student.grado,
    seccion: student.section_name || student.seccion,
    academic_year: student.academic_year_name ? parseInt(student.academic_year_name.match(/\d{4}/)?.[0]) : student.academic_year,

    // Mantener IDs para operaciones
    level_id: student.level_id,
    grade_id: student.grade_id,
    section_id: student.section_id,
    academic_year_id: student.academic_year_id,

    // Mapear nombres para visualización
    nivelNombre: student.level_name,
    gradoNombre: student.grade_name,
    seccionNombre: student.section_name,

    // Mapear estado
    state: student.status === 'active' ? 'activo' :
           student.status === 'inactive' ? 'retirado' :
           student.state || student.status,

    // Mapear parents JSONB
    parents: student.parents || [],
    contratoAdjunto: student.attached_contract || student.contratoAdjunto,

    // Datos del apoderado/padre principal (vienen del backend con JOIN)
    nombrePadre: student.parent_name || null,
    telefonoPadre: student.parent_phone || null,
    emailPadre: student.parent_email || null,
    parentescoPadre: student.parent_relationship || null,
    parentId: student.parent_id || null,

    // Fecha de matrícula (desde la tabla matriculation)
    fechaMatricula: student.matriculation_date || student.enrollment_date || null
  }
}

/**
 * Servicio para la gestión de estudiantes
 * Conecta con las APIs reales del backend
 */
export const studentsService = {
  /**
   * Obtener todos los estudiantes con filtros opcionales
   * @param {Object} filters - Filtros opcionales (nivel, grado, seccion, etc.)
   * @returns {Promise<Array>} Lista de estudiantes
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()

      // Agregar filtros a la query string
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key])
        }
      })

      const queryString = queryParams.toString()
      const endpoint = queryString ? `/students?${queryString}` : '/students'

      const response = await get(endpoint)
      const students = response.estudiantes || response.data || response

      // Normalizar todos los estudiantes
      return Array.isArray(students) ? students.map(normalizeStudent) : []
    } catch (error) {
      console.error('Error al obtener estudiantes:', error)
      throw error
    }
  },

  /**
   * Obtener un estudiante por ID
   * @param {number} id - ID del estudiante
   * @returns {Promise<Object>} Datos del estudiante
   */
  async getById(id) {
    try {
      const response = await get(`/students/${id}`)
      const student = response.estudiante || response.data || response
      return normalizeStudent(student)
    } catch (error) {
      console.error(`Error al obtener estudiante ${id}:`, error)
      throw error
    }
  },

  /**
   * Buscar estudiante por DNI
   * @param {string} dni - DNI del estudiante
   * @returns {Promise<Object>} Datos del estudiante
   */
  async getByDni(dni) {
    try {
      const response = await get(`/students/dni/${dni}`)
      const student = response.estudiante || response.data || response
      return normalizeStudent(student)
    } catch (error) {
      console.error(`Error al buscar estudiante con DNI ${dni}:`, error)
      throw error
    }
  },

  /**
   * Buscar estudiante por código
   * @param {string} codigo - Código del estudiante
   * @returns {Promise<Object>} Datos del estudiante
   */
  async getByCodigo(codigo) {
    try {
      const response = await get(`/students/codigo/${codigo}`)
      const student = response.estudiante || response.data || response
      return normalizeStudent(student)
    } catch (error) {
      console.error(`Error al buscar estudiante con código ${codigo}:`, error)
      throw error
    }
  },

  /**
   * Obtener estudiantes de un padre específico con información enriquecida
   * Incluye: promedios, asistencia, pagos pendientes, tutor, comportamiento
   * @param {number} padreId - ID del padre
   * @param {Object} options - Opciones adicionales
   * @param {number} options.academicYear - Año académico (ej: 2024)
   * @param {boolean} options.enriched - Si incluir datos enriquecidos (default: true)
   * @returns {Promise<Array>} Lista de estudiantes del padre con datos enriquecidos
   */
  async getByParent(padreId, options = {}) {
    try {
      const { academicYear, enriched = true } = options

      // Construir query params
      const queryParams = new URLSearchParams()
      if (academicYear) {
        queryParams.append('academic_year', academicYear)
      }
      queryParams.append('enriched', enriched.toString())

      const queryString = queryParams.toString()
      const endpoint = `/students/parent/${padreId}${queryString ? `?${queryString}` : ''}`

      const response = await get(endpoint)
      const students = response.estudiantes || response.data || response
      return Array.isArray(students) ? students.map(normalizeStudent) : []
    } catch (error) {
      console.error(`Error al obtener estudiantes del padre ${padreId}:`, error)
      throw error
    }
  },

  /**
   * Crear un nuevo estudiante
   * @param {Object} studentData - Datos del estudiante
   * @returns {Promise<Object>} Estudiante creado
   */
  async create(studentData) {
    try {
      const response = await post('/students', studentData)
      const student = response.estudiante || response.data || response
      return normalizeStudent(student)
    } catch (error) {
      console.error('Error al crear estudiante:', error)
      throw error
    }
  },

  /**
   * Actualizar un estudiante existente
   * @param {number} id - ID del estudiante
   * @param {Object} studentData - Datos actualizados
   * @returns {Promise<Object>} Estudiante actualizado
   */
  async update(id, studentData) {
    try {
      const response = await put(`/students/${id}`, studentData)
      const student = response.estudiante || response.data || response
      return normalizeStudent(student)
    } catch (error) {
      console.error(`Error al actualizar estudiante ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar un estudiante (soft delete)
   * @param {number} id - ID del estudiante
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async remove(id) {
    try {
      const response = await del(`/students/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar estudiante ${id}:`, error)
      throw error
    }
  },

  /**
   * Importar estudiantes de forma masiva
   * @param {Array} studentsData - Array de estudiantes a importar
   * @returns {Promise<Object>} Resultado de la importación
   */
  async bulkImport(studentsData) {
    try {
      // Si existe un endpoint específico para importación masiva, usarlo
      // Sino, crear estudiantes uno por uno
      const response = await post('/students/bulk-import', { students: studentsData })
      return response
    } catch (error) {
      console.error('Error al importar estudiantes:', error)
      throw error
    }
  },

  /**
   * Exportar estudiantes a Excel
   * @param {Object} filters - Filtros para la exportación
   * @returns {Promise<Blob>} Archivo Excel
   */
  async exportToExcel(filters = {}) {
    try {
      // Este endpoint debería devolver un archivo Excel
      const queryParams = new URLSearchParams()

      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key])
        }
      })

      const queryString = queryParams.toString()
      const endpoint = queryString ? `/students/export/excel?${queryString}` : '/students/export/excel'

      const response = await get(endpoint)
      return response
    } catch (error) {
      console.error('Error al exportar estudiantes:', error)
      throw error
    }
  },

  /**
   * Cambiar el apoderado de un estudiante
   * @param {number} studentId - ID del estudiante
   * @param {number} newParentId - ID del nuevo padre/apoderado
   * @returns {Promise<Object>} Estudiante actualizado
   */
  async changeParent(studentId, newParentId) {
    try {
      const response = await put(`/students/${studentId}`, {
        parent_id: newParentId
      })
      return response.estudiante || response.data || response
    } catch (error) {
      console.error(`Error al cambiar apoderado del estudiante ${studentId}:`, error)
      throw error
    }
  },

  /**
   * Crear matrícula y estudiante (si es nuevo) en una sola transacción,
   * incluyendo la subida del contrato.
   * @param {FormData} formData - FormData con todos los datos y el archivo.
   * @returns {Promise<Object>} Resultado de la transacción.
   */
  async createMatriculationWithTransaction(formData) {
    try {
      const token = localStorage.getItem('authToken')
      const apiUrl = import.meta.env.VITE_API_URL
      const response = await fetch(`${apiUrl}/matriculation/with-transaction`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
          // NO establecer 'Content-Type', el navegador lo hace por nosotros para FormData
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la matrícula')
      }

      return data
    } catch (error) {
      console.error('Error en createMatriculationWithTransaction:', error)
      throw error
    }
  }
}

export default studentsService
