import { create } from 'zustand'
import { academicYearService } from '../services/academic/academicYearService'
import { structureService } from '../services/academic/structureService'

/**
 * Academic Structure Store - Gestión de Estructura Académica
 * Integrado con APIs reales del backend
 */
export const useAcademicStore = create((set, get) => ({
  // State
  academicYears: [],
  selectedAcademicYear: null,
  levels: [],
  grades: [],
  sections: [],
  courses: [],
  isLoading: false,
  error: null,

  // Actions
  initialize: async () => {
    set({ isLoading: true, error: null })

    try {
      // Ejecutar getAll y getActive en paralelo
      const [years, activeYearResult] = await Promise.all([
        academicYearService.getAll(),
        academicYearService.getActive()
      ])

      let activeYear = activeYearResult

      // Si no hay año activo, seleccionar el más reciente planificado
      if (!activeYear && years && years.length > 0) {
        activeYear = years.find(y => y.state === 'planificado') || years[0]
      }

      set({
        academicYears: years || [],
        selectedAcademicYear: activeYear,
        isLoading: false
      })

      // Load structure for active year
      if (activeYear) {
        await get().loadAcademicStructure(activeYear)
      }
    } catch (error) {
      console.error('Error loading academic data:', error)
      set({
        error: error.message || 'Error al cargar estructura académica',
        isLoading: false
      })
    }
  },

  // Load academic structure
  loadAcademicStructure: async (academicYear) => {
    set({ isLoading: true, error: null })

    try {
      const structure = await structureService.loadAcademicStructure(academicYear)

      set({
        levels: structure.levels || [],
        grades: structure.grades || [],
        sections: structure.sections || [],
        courses: structure.courses || [],
        selectedAcademicYear: academicYear,
        isLoading: false
      })
    } catch (error) {
      console.error('Error loading academic structure:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== ACADEMIC YEARS ====================
  createAcademicYear: async (yearData) => {
    set({ isLoading: true, error: null })

    try {
      const newYear = await academicYearService.save(yearData)

      set(state => ({
        academicYears: [...state.academicYears, newYear],
        isLoading: false
      }))

      return newYear
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateAcademicYear: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const updated = await academicYearService.save(updates, id)

      set(state => ({
        academicYears: state.academicYears.map(y => y.id === id ? updated : y),
        isLoading: false
      }))

      return updated
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  activateAcademicYear: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const activated = await academicYearService.activate(id)

      set(state => ({
        academicYears: state.academicYears.map(y => ({
          ...y,
          state: y.id === id ? 'activo' : 'cerrado'
        })),
        selectedAcademicYear: activated,
        isLoading: false
      }))

      // Reload structure for activated year
      await get().loadAcademicStructure(activated)

      return activated
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  closeAcademicYear: async (id, closeData) => {
    set({ isLoading: true, error: null })

    try {
      const response = await academicYearService.close(id, closeData)

      // response.data contiene { closedYear, newYear }
      const closedYear = response.data?.closedYear || response
      const newYear = response.data?.newYear

      set(state => {
        // Actualizar el año cerrado en la lista
        let updatedYears = state.academicYears.map(y =>
          y.id === id ? closedYear : y
        )

        // Si se creó un nuevo año, agregarlo a la lista
        if (newYear) {
          updatedYears = [...updatedYears, newYear]
        }

        return {
          academicYears: updatedYears,
          isLoading: false
        }
      })

      return response
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== LEVELS ====================
  createLevel: async (levelData) => {
    set({ isLoading: true, error: null })

    try {
      const { selectedAcademicYear } = get()
      const newLevel = await structureService.saveLevel(levelData, selectedAcademicYear)

      set(state => ({
        levels: [...state.levels, newLevel],
        isLoading: false
      }))

      return newLevel
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateLevel: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const { selectedAcademicYear } = get()
      const updated = await structureService.saveLevel(updates, selectedAcademicYear, id)

      set(state => ({
        levels: state.levels.map(l => l.id === id ? updated : l),
        isLoading: false
      }))

      return updated
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteLevel: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await structureService.deleteLevel(id)

      set(state => ({
        levels: state.levels.filter(l => l.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== GRADES ====================
  createGrade: async (gradeData) => {
    set({ isLoading: true, error: null })

    try {
      const { selectedAcademicYear, levels } = get()
      const newGrade = await structureService.saveGrade(gradeData, levels, selectedAcademicYear)

      set(state => ({
        grades: [...state.grades, newGrade],
        isLoading: false
      }))

      return newGrade
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateGrade: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const { selectedAcademicYear, levels } = get()
      const updated = await structureService.saveGrade(updates, levels, selectedAcademicYear, id)

      set(state => ({
        grades: state.grades.map(g => g.id === id ? updated : g),
        isLoading: false
      }))

      return updated
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteGrade: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await structureService.deleteGrade(id)

      set(state => ({
        grades: state.grades.filter(g => g.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== SECTIONS ====================
  createSection: async (sectionData) => {
    set({ isLoading: true, error: null })

    try {
      const { selectedAcademicYear, grades } = get()
      const newSection = await structureService.saveSection(sectionData, grades, selectedAcademicYear)

      set(state => ({
        sections: [...state.sections, newSection],
        isLoading: false
      }))

      return newSection
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateSection: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const { selectedAcademicYear, grades } = get()
      const updated = await structureService.saveSection(updates, grades, selectedAcademicYear, id)

      set(state => ({
        sections: state.sections.map(s => s.id === id ? updated : s),
        isLoading: false
      }))

      return updated
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteSection: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await structureService.deleteSection(id)

      set(state => ({
        sections: state.sections.filter(s => s.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== COURSES ====================
  createCourse: async (courseData) => {
    set({ isLoading: true, error: null })

    try {
      const newCourse = await structureService.saveCourse(courseData)

      set(state => ({
        courses: [...state.courses, newCourse],
        isLoading: false
      }))

      return newCourse
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateCourse: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const updated = await structureService.saveCourse(updates, id)

      set(state => ({
        courses: state.courses.map(c => c.id === id ? updated : c),
        isLoading: false
      }))

      return updated
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteCourse: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await structureService.deleteCourse(id)

      set(state => ({
        courses: state.courses.filter(c => c.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== UTILITY FUNCTIONS ====================
  getLevelById: (id) => {
    const { levels } = get()
    return levels.find(l => l.id === id)
  },

  getGradeById: (id) => {
    const { grades } = get()
    return grades.find(g => g.id === id)
  },

  getSectionById: (id) => {
    const { sections } = get()
    return sections.find(s => s.id === id)
  },

  getCourseById: (id) => {
    const { courses } = get()
    return courses.find(c => c.id === id)
  },

  getGradesByLevel: (levelId) => {
    const { grades } = get()
    return grades.filter(g => g.level_id === levelId || g.level_id === levelId)
  },

  getSectionsByGrade: (gradeId) => {
    const { sections } = get()
    return sections.filter(s => s.grade_id === gradeId || s.grade_id === gradeId)
  },

  getCoursesByLevel: (levelId) => {
    const { courses } = get()
    return courses.filter(c => c.level_id === levelId)
  },

  getAcademicTree: () => {
    const { levels, grades, sections } = get()

    // Build hierarchical tree: levels -> grades -> sections
    return levels.map(level => {
      // Find grades for this level
      const levelGrades = grades.filter(g => g.nivel === level.id || g.level_id === level.id)

      // For each grade, find its sections
      const gradesWithSections = levelGrades.map(grade => {
        const gradeSections = sections.filter(s => s.grado === grade.id || s.grade_id === grade.id)

        return {
          ...grade,
          sections: gradeSections
        }
      })

      return {
        ...level,
        grades: gradesWithSections
      }
    })
  },

  clearError: () => {
    set({ error: null })
  }
}))
