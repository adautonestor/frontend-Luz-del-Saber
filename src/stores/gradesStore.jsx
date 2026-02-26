import { create } from 'zustand'
import gradesService from '../services/gradesService'
import evaluationStructuresService from '../services/evaluationStructuresService'
import {
  validateEvaluationStructure,
  validateGrade,
  validateGradeModification,
  calculateWeightedAverage,
  GradingSystemConfig,
  isGradeApproved,
  convertGradeToNumeric,
  getGradeDescription
} from '../services/mock/schemas/grades.js'

/**
 * Grades Store - Sistema de Notas Flexible
 * Integrado con APIs reales del backend
 */
export const useGradesStore = create((set, get) => ({
  // State
  evaluationStructures: [],
  grades: [],
  competencyGrades: [],
  gradeHistory: [],
  studentAverages: [],
  competencyAverages: [],
  behaviorGrades: [],
  categories: [],
  subcategories: [],
  isLoading: false,
  error: null,
  currentBimester: 1,

  // Filters
  filters: {
    course: '',
    section: '',
    bimester: '',
    student: ''
  },

  // ==================== INITIALIZE ====================
  initialize: async () => {
    set({ isLoading: true, error: null })

    try {
      // Cargar datos desde APIs reales
      // ✅ ACTUALIZADO: Ahora usamos competency-grades exclusivamente (modelo MINEDU)
      const [grades, quarterAverages, competencyAverages, behaviors, structures] = await Promise.all([
        gradesService.getAllCompetencyGrades(), // ✅ competency-grades (única fuente de verdad)
        gradesService.getAllQuarterAverages(),
        gradesService.getAllCompetencyAverages(),
        gradesService.getAllBehaviors(),
        evaluationStructuresService.getAll()
      ])

      // Las calificaciones por competencias son la única fuente
      const competencyGrades = grades || []

      // Formatear estructuras de evaluación desde el backend
      const formattedStructures = (structures || []).map(structure => ({
        ...structure,
        competencias: typeof structure.competencies === 'string'
          ? JSON.parse(structure.competencies).competencias
          : structure.competencies?.competencias || structure.competencies || [],
        quarter: structure.quarter,
        añoLectivoId: structure.academic_year_id
      }))

      // Determine current bimester based on date
      const currentMonth = new Date().getMonth() + 1
      let currentBimester = 1
      if (currentMonth >= 5 && currentMonth <= 6) currentBimester = 2
      else if (currentMonth >= 8 && currentMonth <= 9) currentBimester = 3
      else if (currentMonth >= 10 && currentMonth <= 11) currentBimester = 4

      set({
        grades: grades || [],
        competencyGrades: competencyGrades || [],
        gradeHistory: [],
        studentAverages: quarterAverages || [],
        competencyAverages: competencyAverages || [],
        behaviorGrades: behaviors || [],
        evaluationStructures: formattedStructures || [],
        currentBimester,
        isLoading: false
      })

      return {
        grades,
        competencyGrades,
        quarterAverages,
        competencyAverages,
        behaviors,
        evaluationStructures: formattedStructures
      }
    } catch (error) {
      console.error('Error loading grades data:', error)
      set({
        error: error.message || 'Error al cargar sistema de notas',
        isLoading: false
      })
      throw error
    }
  },

  // ==================== GRADES RECORDING ====================
  recordGrade: async (gradeData) => {
    set({ isLoading: true, error: null })

    try {
      // ✅ TRANSFORMAR datos al formato de competency-grades
      const transformedData = {
        student_id: gradeData.student_id,
        course_id: gradeData.course_id,
        // Mapear categoriaId → course_competency_id
        course_competency_id: gradeData.categoriaId || gradeData.course_competency_id,
        quarter: gradeData.quarter,
        // Obtener el valor de la calificación (soporta múltiples formatos)
        value: gradeData.promedio || gradeData.value || (gradeData.notas && gradeData.notas[0]?.valor) || '',
        grading_system: gradeData.gradingSystem || gradeData.grading_system || 'literal',
        // Obtener observación/comentario
        observation: gradeData.comentario || gradeData.observation || (gradeData.notas && gradeData.notas[0]?.comentario) || '',
        teacher_id: gradeData.teacher_id
      }

      console.log('📤 Datos originales:', gradeData)
      console.log('📤 Datos transformados para API:', transformedData)

      // ✅ Usar directamente createCompetencyGrade (API única)
      const newGrade = await gradesService.createCompetencyGrade(transformedData)

      set(state => ({
        grades: [...state.grades, newGrade],
        competencyGrades: [...state.competencyGrades, newGrade],
        isLoading: false
      }))

      console.log('✅ Grade recorded:', newGrade.id)

      return newGrade
    } catch (error) {
      console.error('❌ Error recording grade:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateGrade: async (gradeId, updates) => {
    set({ isLoading: true, error: null })

    try {
      const updatedGrade = await gradesService.updateGrade(gradeId, updates)

      set(state => ({
        grades: state.grades.map(g => g.id === gradeId ? updatedGrade : g),
        isLoading: false
      }))

      console.log('✅ Grade updated:', gradeId)
      return updatedGrade
    } catch (error) {
      console.error('❌ Error updating grade:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteGrade: async (gradeId) => {
    set({ isLoading: true, error: null })

    try {
      await gradesService.removeGrade(gradeId)

      set(state => ({
        grades: state.grades.filter(g => g.id !== gradeId),
        isLoading: false
      }))

      console.log('✅ Grade deleted:', gradeId)
    } catch (error) {
      console.error('❌ Error deleting grade:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== COMPETENCY GRADES ====================
  // ✅ ACTUALIZADO: Usa competency-grades exclusivamente (modelo MINEDU)
  recordCompetencyGrade: async (gradeData) => {
    set({ isLoading: true, error: null })

    try {
      // ✅ Usar createCompetencyGrade que apunta a /competency-grades
      const newGrade = await gradesService.createCompetencyGrade(gradeData)

      set(state => ({
        grades: [...state.grades, newGrade],
        competencyGrades: [...state.competencyGrades, newGrade],
        isLoading: false
      }))

      console.log('✅ Competency grade recorded:', newGrade.id)
      return newGrade
    } catch (error) {
      console.error('❌ Error recording competency grade:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateCompetencyGrade: async (gradeId, updates) => {
    set({ isLoading: true, error: null })

    try {
      // ✅ Usar updateCompetencyGrade que apunta a /competency-grades
      const updatedGrade = await gradesService.updateCompetencyGrade(gradeId, updates)

      set(state => ({
        grades: state.grades.map(g => g.id === gradeId ? updatedGrade : g),
        competencyGrades: state.competencyGrades.map(g => g.id === gradeId ? updatedGrade : g),
        isLoading: false
      }))

      console.log('✅ Competency grade updated:', gradeId)
      return updatedGrade
    } catch (error) {
      console.error('❌ Error updating competency grade:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteCompetencyGrade: async (gradeId) => {
    set({ isLoading: true, error: null })

    try {
      // ✅ Usar removeCompetencyGrade que apunta a /competency-grades
      await gradesService.removeCompetencyGrade(gradeId)

      set(state => ({
        grades: state.grades.filter(g => g.id !== gradeId),
        competencyGrades: state.competencyGrades.filter(g => g.id !== gradeId),
        isLoading: false
      }))

      console.log('✅ Competency grade deleted from student_grades:', gradeId)
    } catch (error) {
      console.error('❌ Error deleting competency grade:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== AVERAGES ====================
  calculateStudentAverage: async (studentId, courseId, bimester) => {
    set({ isLoading: true, error: null })

    try {
      const average = await gradesService.calculateQuarterAverages(studentId, courseId, bimester)

      set(state => ({
        studentAverages: [...state.studentAverages.filter(a =>
          !(a.student_id === studentId && a.course_id === courseId && a.quarter === bimester)
        ), average],
        isLoading: false
      }))

      console.log('✅ Student average calculated:', average.promedio_parcial || average.promedioParcial)
      return average
    } catch (error) {
      console.error('Error calculating student average:', error)
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  calculateCompetencyAverage: async (studentId, competencyId, quarter) => {
    set({ isLoading: true, error: null })

    try {
      const average = await gradesService.calculateCompetencyAverages(studentId, competencyId, quarter)

      set(state => ({
        competencyAverages: [...state.competencyAverages.filter(a =>
          !(a.student_id === studentId && a.competencia_id === competencyId && a.trimestre === quarter)
        ), average],
        isLoading: false
      }))

      console.log('✅ Competency average calculated')
      return average
    } catch (error) {
      console.error('Error calculating competency average:', error)
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  // ==================== BEHAVIOR ====================
  recordBehavior: async (behaviorData) => {
    set({ isLoading: true, error: null })

    try {
      const newBehavior = await gradesService.createBehavior(behaviorData)

      set(state => ({
        behaviorGrades: [...state.behaviorGrades, newBehavior],
        isLoading: false
      }))

      console.log('✅ Behavior recorded:', newBehavior.id)
      return newBehavior
    } catch (error) {
      console.error('❌ Error recording behavior:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateBehavior: async (behaviorId, updates) => {
    set({ isLoading: true, error: null })

    try {
      const updatedBehavior = await gradesService.updateBehavior(behaviorId, updates)

      set(state => ({
        behaviorGrades: state.behaviorGrades.map(b => b.id === behaviorId ? updatedBehavior : b),
        isLoading: false
      }))

      console.log('✅ Behavior updated:', behaviorId)
      return updatedBehavior
    } catch (error) {
      console.error('❌ Error updating behavior:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteBehavior: async (behaviorId) => {
    set({ isLoading: true, error: null })

    try {
      await gradesService.removeBehavior(behaviorId)

      set(state => ({
        behaviorGrades: state.behaviorGrades.filter(b => b.id !== behaviorId),
        isLoading: false
      }))

      console.log('✅ Behavior deleted:', behaviorId)
    } catch (error) {
      console.error('❌ Error deleting behavior:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  // Get grades by student and course
  getGradesByStudentAndCourse: (studentId, courseId) => {
    const { grades } = get()
    return grades?.filter(grade =>
      (grade.student_id === studentId || grade.student_id === studentId) &&
      (grade.course_id === courseId || grade.course_id === courseId)
    ) || []
  },

  // Get competency grades
  getCompetencyGrades: (studentId, courseId, competencyId, bimester) => {
    const { competencyGrades } = get()
    return competencyGrades?.filter(grade =>
      (grade.student_id === studentId || grade.student_id === studentId) &&
      (grade.course_id === courseId || grade.course_id === courseId) &&
      (grade.competencia_id === competencyId || grade.competenciaId === competencyId) &&
      (grade.trimestre === bimester || grade.quarter === bimester)
    ) || []
  },

  // Get student averages
  getStudentAverages: (studentId) => {
    const { studentAverages } = get()
    return studentAverages?.filter(avg =>
      (avg.student_id === studentId || avg.student_id === studentId)
    ) || []
  },

  // Get course stats
  getCourseStats: (courseId, bimester) => {
    const { studentAverages } = get()

    const courseAverages = studentAverages.filter(a =>
      (a.course_id === courseId || a.course_id === courseId) &&
      (a.quarter === bimester || a.trimestre === bimester)
    )

    if (courseAverages.length === 0) {
      return {
        totalStudents: 0,
        averageGrade: 0,
        passRate: 0,
        gradeDistribution: {}
      }
    }

    const totalStudents = courseAverages.length
    const grades = courseAverages.map(a => a.promedio_parcial || a.promedioParcial || 0)
    const averageGrade = grades.reduce((sum, g) => sum + g, 0) / totalStudents
    const passedStudents = grades.filter(g => g >= 11).length
    const passRate = (passedStudents / totalStudents) * 100

    // Grade distribution
    const distribution = {
      '18-20': grades.filter(g => g >= 18).length,
      '14-17': grades.filter(g => g >= 14 && g < 18).length,
      '11-13': grades.filter(g => g >= 11 && g < 14).length,
      '0-10': grades.filter(g => g < 11).length
    }

    return {
      totalStudents,
      averageGrade: Math.round(averageGrade * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      passedStudents,
      failedStudents: totalStudents - passedStudents,
      gradeDistribution: distribution
    }
  },

  // Get grading system configuration
  getGradingSystemConfig: (gradingSystem) => {
    // Try to get from localStorage first, then fallback to defaults
    const storedConfig = localStorage.getItem('gradingSystemsConfig')
    let config = null

    if (storedConfig) {
      try {
        const parsedConfig = JSON.parse(storedConfig)
        config = parsedConfig[gradingSystem]
      } catch (e) {
        console.error('Error parsing grading systems config:', e)
      }
    }

    // If no stored config, use defaults from GradingSystemConfig
    if (!config) {
      config = GradingSystemConfig[gradingSystem]
    }

    return config
  },

  // Get available grade values for a grading system
  getAvailableGradeValues: (gradingSystem) => {
    const config = get().getGradingSystemConfig(gradingSystem)
    if (!config) return []

    if (config.type === 'letters') {
      return config.scale.map(value => ({
        value,
        label: `${value} - ${config.descriptions[value] || ''}`
      }))
    } else if (config.type === 'numeric') {
      const values = []
      for (let i = config.scale.max; i >= config.scale.min; i--) {
        values.push({
          value: i,
          label: `${i} - ${getGradeDescription(i, gradingSystem)}`
        })
      }
      return values
    }

    return []
  },

  // Validate grade value for specific grading system
  validateGradeValue: (value, gradingSystem) => {
    const config = get().getGradingSystemConfig(gradingSystem)
    if (!config) return false

    if (config.type === 'numeric') {
      return typeof value === 'number' && value >= config.scale.min && value <= config.scale.max
    } else if (config.type === 'letters') {
      return typeof value === 'string' && config.scale.includes(value)
    }

    return false
  },

  // Update filters
  updateFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } })
  },

  // Set current bimester
  setCurrentBimester: (bimester) => {
    set({ currentBimester: bimester })
  },

  // Clear error
  clearError: () => set({ error: null }),

  // ==================== EVALUATION STRUCTURES ====================
  /**
   * Crear nueva estructura de evaluación
   * @param {Object} structureData - Datos de la estructura
   * @returns {Promise<Object>} Estructura creada
   */
  createEvaluationStructure: async (structureData) => {
    set({ isLoading: true, error: null })

    try {
      // Mapear datos del frontend al formato del backend
      const payload = {
        course_id: structureData.course_id,
        grade_id: structureData.grade_id,
        academic_year_id: structureData.añoLectivoId || structureData.academic_year_id,
        quarter: structureData.quarter,
        academic_year: new Date().getFullYear(),
        grading_system: structureData.gradingSystem || 'literal',
        teacher_id: structureData.teacher_id || null,
        structure_json: JSON.stringify({
          competencias: structureData.competencias || [],
          gradingSystem: structureData.gradingSystem || 'literal'
        })
      }

      const newStructure = await evaluationStructuresService.create(payload)

      // Convertir respuesta del backend al formato del frontend
      const formattedStructure = {
        ...newStructure,
        competencias: typeof newStructure.competencies === 'string'
          ? JSON.parse(newStructure.competencies).competencias
          : newStructure.competencies?.competencias || newStructure.competencies || [],
        quarter: newStructure.quarter,
        añoLectivoId: newStructure.academic_year_id
      }

      set(state => ({
        evaluationStructures: [...state.evaluationStructures, formattedStructure],
        isLoading: false
      }))

      console.log('✅ Evaluation structure created:', formattedStructure.id)
      return formattedStructure
    } catch (error) {
      console.error('❌ Error creating evaluation structure:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Actualizar estructura de evaluación existente
   * @param {number} id - ID de la estructura
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<Object>} Estructura actualizada
   */
  updateEvaluationStructure: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      // Mapear datos del frontend al formato del backend
      const payload = {
        grading_system: updates.gradingSystem || 'literal',
        structure_json: JSON.stringify({
          competencias: updates.competencias || [],
          gradingSystem: updates.gradingSystem || 'literal'
        })
      }

      const updatedStructure = await evaluationStructuresService.update(id, payload)

      // Convertir respuesta del backend al formato del frontend
      const formattedStructure = {
        ...updatedStructure,
        competencias: typeof updatedStructure.competencies === 'string'
          ? JSON.parse(updatedStructure.competencies).competencias
          : updatedStructure.competencies?.competencias || updatedStructure.competencies || [],
        quarter: updatedStructure.quarter,
        añoLectivoId: updatedStructure.academic_year_id
      }

      set(state => ({
        evaluationStructures: state.evaluationStructures.map(s =>
          s.id === id ? formattedStructure : s
        ),
        isLoading: false
      }))

      console.log('✅ Evaluation structure updated:', id)
      return formattedStructure
    } catch (error) {
      console.error('❌ Error updating evaluation structure:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Eliminar estructura de evaluación (soft delete)
   * @param {number} id - ID de la estructura
   * @returns {Promise<void>}
   */
  deleteEvaluationStructure: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await evaluationStructuresService.remove(id)

      set(state => ({
        evaluationStructures: state.evaluationStructures.filter(s => s.id !== id),
        isLoading: false
      }))

      console.log('✅ Evaluation structure deleted:', id)
    } catch (error) {
      console.error('❌ Error deleting evaluation structure:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  }
}))
