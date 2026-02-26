import { create } from 'zustand'
import studentsService from '../services/studentsService'

export const useStudentsStore = create((set, get) => ({
  students: [],
  loading: false,
  error: null,

  /**
   * Cargar estudiantes desde la API real
   * @param {Object} filters - Filtros opcionales
   */
  loadStudents: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      const students = await studentsService.getAll(filters)
      set({ students, loading: false })
      return students
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Crear estudiante individual
   * @param {Object} studentData - Datos del estudiante
   */
  createStudent: async (studentData) => {
    set({ loading: true, error: null })
    try {
      const newStudent = await studentsService.create(studentData)

      // Actualizar lista local
      const currentStudents = get().students
      set({
        students: [...currentStudents, newStudent],
        loading: false
      })

      return newStudent
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Crear estudiantes en lote
   * @param {Array} studentsData - Array de datos de estudiantes
   */
  bulkCreateStudents: async (studentsData) => {
    set({ loading: true, error: null })
    try {
      const result = await studentsService.bulkImport(studentsData)

      // Recargar lista completa después de importación masiva
      await get().loadStudents()

      return result
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Actualizar estudiante
   * @param {number} studentId - ID del estudiante
   * @param {Object} updates - Datos a actualizar
   */
  updateStudent: async (studentId, updates) => {
    set({ loading: true, error: null })
    try {
      const updatedStudent = await studentsService.update(studentId, updates)

      // Actualizar lista local
      const currentStudents = get().students
      const updatedList = currentStudents.map(s =>
        s.id === studentId ? updatedStudent : s
      )

      set({ students: updatedList, loading: false })
      return updatedStudent
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Eliminar estudiante
   * @param {number} studentId - ID del estudiante
   */
  deleteStudent: async (studentId) => {
    set({ loading: true, error: null })
    try {
      await studentsService.remove(studentId)

      // Remover de lista local
      const currentStudents = get().students
      const filteredList = currentStudents.filter(s => s.id !== studentId)

      set({ students: filteredList, loading: false })
      return true
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Buscar estudiantes localmente
   * @param {string} query - Término de búsqueda
   */
  searchStudents: (query) => {
    const { students } = get()
    const lowerQuery = query.toLowerCase()

    return students.filter(student =>
      student.first_names?.toLowerCase().includes(lowerQuery) ||
      student.last_names?.toLowerCase().includes(lowerQuery) ||
      student.apellido_paterno?.toLowerCase().includes(lowerQuery) ||
      student.apellido_materno?.toLowerCase().includes(lowerQuery) ||
      student.dni?.includes(query) ||
      student.code?.toLowerCase().includes(lowerQuery)
    )
  },

  /**
   * Obtener estudiantes por grado y sección
   * @param {string} nivel - Nivel académico
   * @param {string} grado - Grado
   * @param {string} seccion - Sección
   */
  getStudentsByGradeSection: (nivel, grado, seccion) => {
    const { students } = get()
    return students.filter(s =>
      s.nivel === nivel &&
      s.grado === grado &&
      s.seccion === seccion &&
      s.state === 'activo'
    )
  },

  /**
   * Obtener estudiante por ID localmente
   * @param {number} studentId - ID del estudiante
   */
  getStudentById: (studentId) => {
    const { students } = get()
    return students.find(s => s.id === studentId)
  },

  /**
   * Obtener estudiante por ID desde la API
   * @param {number} studentId - ID del estudiante
   */
  fetchStudentById: async (studentId) => {
    set({ loading: true, error: null })
    try {
      const student = await studentsService.getById(studentId)
      set({ loading: false })
      return student
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Buscar estudiante por DNI
   * @param {string} dni - DNI del estudiante
   */
  fetchStudentByDni: async (dni) => {
    set({ loading: true, error: null })
    try {
      const student = await studentsService.getByDni(dni)
      set({ loading: false })
      return student
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Buscar estudiante por código
   * @param {string} codigo - Código del estudiante
   */
  fetchStudentByCodigo: async (codigo) => {
    set({ loading: true, error: null })
    try {
      const student = await studentsService.getByCodigo(codigo)
      set({ loading: false })
      return student
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Obtener estudiantes de un padre
   * @param {number} padreId - ID del padre
   */
  fetchStudentsByParent: async (padreId) => {
    set({ loading: true, error: null })
    try {
      const students = await studentsService.getByParent(padreId)
      set({ loading: false })
      return students
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Transferir estudiante entre secciones
   * @param {number} studentId - ID del estudiante
   * @param {string} newGrade - Nuevo grado
   * @param {string} newSection - Nueva sección
   */
  transferStudent: async (studentId, newGrade, newSection) => {
    set({ loading: true, error: null })
    try {
      const updatedStudent = await studentsService.update(studentId, {
        grado: newGrade,
        seccion: newSection
      })

      // Actualizar lista local
      const currentStudents = get().students
      const updatedList = currentStudents.map(s =>
        s.id === studentId ? updatedStudent : s
      )

      set({ students: updatedList, loading: false })
      return updatedStudent
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Vincular estudiante con padre
   * Nota: Esta función debería llamar a un endpoint específico si existe
   * Por ahora, se mantiene como actualización del estudiante
   * @param {number} studentId - ID del estudiante
   * @param {number} parentId - ID del padre
   * @param {string} relationship - Tipo de relación
   */
  linkStudentWithParent: async (studentId, parentId, relationship = 'padre') => {
    set({ loading: true, error: null })
    try {
      // Si existe un endpoint específico para relaciones padre-estudiante, usarlo
      // Sino, actualizar el campo parent_id del estudiante
      const updatedStudent = await studentsService.update(studentId, {
        parent_id: parentId,
        parentesco: relationship
      })

      // Actualizar lista local
      const currentStudents = get().students
      const updatedList = currentStudents.map(s =>
        s.id === studentId ? updatedStudent : s
      )

      set({ students: updatedList, loading: false })
      return updatedStudent
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Obtener estudiantes con filtros (función local)
   * @param {Object} filters - Filtros a aplicar
   */
  getFilteredStudents: (filters) => {
    const { students } = get()
    let filtered = [...students]

    // Aplicar filtros
    if (filters.academic_year || filters.ano_escolar) {
      const year = filters.academic_year || filters.ano_escolar
      filtered = filtered.filter(s => s.academic_year === year || s.ano_escolar === year)
    }
    if (filters.nivel || filters.level) {
      const nivel = filters.nivel || filters.level
      filtered = filtered.filter(s => s.nivel === nivel || s.level_name?.toLowerCase() === nivel)
    }
    if (filters.grado || filters.grade) {
      const grado = filters.grado || filters.grade
      filtered = filtered.filter(s => s.grado === grado || s.grade_name === grado)
    }
    if (filters.seccion || filters.section) {
      const seccion = filters.seccion || filters.section
      filtered = filtered.filter(s => s.seccion === seccion || s.section_name === seccion)
    }
    if (filters.state || filters.status) {
      const state = filters.state || filters.status
      filtered = filtered.filter(s =>
        s.state === state ||
        s.status === state ||
        (state === 'activo' && s.status === 'active') ||
        (state === 'retirado' && s.status === 'inactive')
      )
    }
    if (filters.search || filters.busqueda) {
      const searchTerm = filters.search || filters.busqueda
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.first_names?.toLowerCase().includes(searchLower) ||
        s.last_names?.toLowerCase().includes(searchLower) ||
        s.paternal_last_name?.toLowerCase().includes(searchLower) ||
        s.maternal_last_name?.toLowerCase().includes(searchLower) ||
        s.dni?.includes(searchTerm) ||
        s.code?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  },

  /**
   * Exportar estudiantes a Excel
   * @param {Object} filters - Filtros para la exportación
   */
  exportToExcel: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      const result = await studentsService.exportToExcel(filters)
      set({ loading: false })
      return result
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null })
  }
}))
